import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface ComponentPathConfig {
  path: string;
  importPrefix: string;
}

export interface AnalyzerOptions {
  name?: string;
  targetPath?: string;
  pagesPath?: string;
  fileExtensions?: string[];
  componentPaths?: ComponentPathConfig[];  // 改用配置物件陣列
  outputDir?: string;
  exportNamePattern?: RegExp;
}

interface DependencyInfo {
  path: string;
  imports: string[];
  file: string;
}

interface ComponentUsage {
  file: string;
  dependencies: DependencyInfo[];
  usedInPages: string[];
}

// 新增介面定義
interface GroupedDependency {
  path: string;
  file: string;
  imports: string[];
}

interface DependencyGroups {
  [key: string]: GroupedDependency[];
}

export class ComponentUsageAnalyzer {
  private name: string;
  private pagesDir: string;
  private targetsDir: string;
  private fileExtensions: string[];
  private componentPaths: ComponentPathConfig[];
  private outputDir: string;
  private exportNamePattern: RegExp;
  private targetUsage: Record<string, ComponentUsage>;
  private projectRoot: string;

  constructor({
    name = 'Component',
    targetPath = 'src/components',
    pagesPath = 'src/pages',
    fileExtensions = ['.tsx'],
    componentPaths = [
      { 
        path: 'src/components',
        importPrefix: '@/components'
      },
      { 
        path: 'src/elements',
        importPrefix: '@/elements'
      }
    ],
    outputDir = 'tools/usageAnalyzer',
    exportNamePattern = /^[A-Z]/,
  }: AnalyzerOptions = {}) {
    this.projectRoot = this.findProjectRoot(process.cwd());
    console.log('專案根目錄:', this.projectRoot);

    this.name = name;
    this.pagesDir = path.resolve(this.projectRoot, pagesPath);
    this.targetsDir = path.resolve(this.projectRoot, targetPath);
    this.fileExtensions = fileExtensions;
    this.componentPaths = componentPaths.map(config => ({
      ...config,
      path: path.resolve(this.projectRoot, config.path)
    }));
    this.outputDir = path.resolve(this.projectRoot, outputDir);
    this.exportNamePattern = exportNamePattern;
    this.targetUsage = {};
  }

  private findProjectRoot(startPath: string): string {
    let currentPath = startPath;
    
    while (currentPath !== path.parse(currentPath).root) {
      console.log('搜尋 package.json 的目錄:', currentPath);
      
      const packageJsonPath = path.join(currentPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        console.log('找到 package.json:', packageJsonPath);
        return currentPath;
      }
      
      currentPath = path.dirname(currentPath);
    }
    
    console.warn('警告: 未找到 package.json，使用當前目錄作為專案根目錄');
    return startPath;
  }

  getExports(content: string): string[] {
    const exports: string[] = [];

    const namedExports = content.match(/export\s+{([^}]+)}/g);
    if (namedExports) {
      namedExports.forEach((exp) => {
        const names = exp.match(/export\s+{([^}]+)}/)?.[1] ?? '';
        exports.push(...names.split(',').map((n) => n.trim()));
      });
    }

    const directExports = content.match(/export\s+(const|function|class)\s+(\w+)/g);
    if (directExports) {
      directExports.forEach((exp) => {
        const match = exp.match(/export\s+(const|function|class)\s+(\w+)/);
        if (match) exports.push(match[2]);
      });
    }

    const defaultExport = content.match(/export\s+default\s+(\w+)/);
    if (defaultExport) {
      exports.push(defaultExport[1]);
    }

    return [...new Set(exports)].filter(Boolean);
  }

  findDependencies(content: string): DependencyInfo[] {
    const processImports = (regex: RegExp, pathConfig: ComponentPathConfig) => {
      const matches = Array.from(content.matchAll(regex));
      return matches.map((match) => {
        const [, namedImports, defaultImport, importPath] = match;
        let imports: string[] = [];
        
        // 處理命名導入，包含 as 語法
        if (namedImports) {
          imports = namedImports
            .split(',')
            .map(n => {
              const parts = n.trim().split(' as ');
              // 只取 as 前面的原始名稱
              return parts[0].trim();
            })
            .filter(n => !n.startsWith('type '));
        }
        
        // 處理默認導入
        if (defaultImport) {
          imports.push(defaultImport);
        }

        const fileExt = this.fileExtensions[0];
        
        return {
          imports: imports.filter(Boolean),
          path: `${pathConfig.importPrefix}/${importPath}`,
          file: `${pathConfig.path}/${importPath}${fileExt}`,
        };
      });
    };

    const createImportRegex = (pathConfig: ComponentPathConfig) => {
      const basePath = pathConfig.path.split('/').pop() || '';
      // 修改正則表達式以更準確地匹配相對路徑和絕對路徑
      return new RegExp(
        `import\\s+(?:{([^}]+)}|(\\w+))\\s+from\\s+['"](?:@?\\/)?(?:${basePath}|\\.\\.?\\/[^'"]*)?\\/([^'"]+)['"]`,
        'g'
      );
    };

    return this.componentPaths.flatMap(pathConfig => {
      const regex = createImportRegex(pathConfig);
      return processImports(regex, pathConfig);
    });
  }

  run(): void {
    console.log('開始分析元件使用情況...');
    console.log('分析目錄:', this.targetsDir);
    
    const componentFiles = glob.sync(`${this.targetsDir}/**/*{${this.fileExtensions.join(',')}}`);
    console.log(`找到 ${componentFiles.length} 個元件檔案`);
    
    componentFiles.forEach((file) => {
      console.log(`分析元件檔案: ${file}`);
      const content = fs.readFileSync(file, 'utf8');
      const componentPath = path.relative(this.projectRoot, file);
      const exports = this.getExports(content);
      console.log(`找到的匯出項目: ${exports.join(', ')}`);

      exports
        .filter(exportName => this.exportNamePattern.test(exportName))
        .forEach(exportName => {
          console.log(`處理元件: ${exportName}`);
          this.targetUsage[exportName] = {
            file: componentPath,
            dependencies: this.findDependencies(content),
            usedInPages: []
          };
        });
    });

    const pageFiles = glob.sync(`${this.pagesDir}/**/*{${this.fileExtensions.join(',')}}`);
    console.log(`找到 ${pageFiles.length} 個頁面檔案`);
    
    pageFiles.forEach((pageFile) => {
      console.log(`分析頁面檔案: ${pageFile}`);
      const content = fs.readFileSync(pageFile, 'utf8');
      const relativePath = path.relative(this.projectRoot, pageFile);

      Object.keys(this.targetUsage).forEach((componentName) => {
        const importRegex = new RegExp(
          `import\\s*{[^}]*${componentName}[^}]*}\\s*from|<${componentName}[^>]*>|<${componentName}\\s*\\/>`,
        );
        if (importRegex.test(content)) {
          if (!this.targetUsage[componentName].usedInPages.includes(relativePath)) {
            this.targetUsage[componentName].usedInPages.push(relativePath);
          }
        }
      });
    });
    
    console.log('元件使用情況分析完成');
  }

  private generateMermaidFlowchart(
    nodes: Set<string> = new Set<string>(),
    edges: Set<string> = new Set<string>(),
    initialComponent?: { name: string; data: ComponentUsage }
  ): string {
    let output = '```mermaid\nflowchart TD\n';
    output += '    %% 樣式定義\n';
    output += '    classDef component fill:#f9f,stroke:#333,stroke-width:2px,color:#000,font-weight:bold\n';
    output += '    classDef element fill:#bbf,stroke:#333,stroke-width:2px,color:#000,font-weight:bold\n';
    output += '    classDef page fill:#bfb,stroke:#333,stroke-width:2px,color:#000,font-weight:bold\n';
    output += '    classDef other fill:#fff,stroke:#333,stroke-width:1px,color:#000\n\n';

    const processComponent = (componentName: string, data: ComponentUsage) => {
      const sourceId = componentName.replace(/[^a-zA-Z0-9]/g, '_');
      
      if (!nodes.has(sourceId)) {
        nodes.add(sourceId);
        output += `    ${sourceId}["${componentName}"]\n`;
        output += `    class ${sourceId} component\n`;
      }

      // 處理依賴
      data.dependencies.forEach((dep) => {
        dep.imports.forEach((importName) => {
          const cleanImportName = importName.split(' as ')[0].trim();
          // 避免自我引用
          if (cleanImportName !== 'type' && cleanImportName !== componentName) {
            const targetId = cleanImportName.replace(/[^a-zA-Z0-9]/g, '_');
            const edgeKey = `${sourceId}-${targetId}`;

            if (!edges.has(edgeKey)) {
              edges.add(edgeKey);
              
              if (!nodes.has(targetId)) {
                nodes.add(targetId);
                output += `    ${targetId}["${cleanImportName}"]\n`;
                
                if (dep.path.includes('/components/')) {
                  output += `    class ${targetId} component\n`;
                } else if (dep.path.includes('/elements/')) {
                  output += `    class ${targetId} element\n`;
                } else {
                  output += `    class ${targetId} other\n`;
                }
              }
              
              output += `    ${sourceId} --> ${targetId}\n`;
            }
          }
        });
      });

      // 處理頁面節點
      data.usedInPages.forEach((page: string) => {
        const pageName = page.replace(/^src\/pages\//, '').replace(/\.tsx$/, '');
        const pageNodeId = `page_${pageName.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        const edgeKey = `${sourceId}-${pageNodeId}`;
        if (!edges.has(edgeKey)) {
          edges.add(edgeKey);
          
          if (!nodes.has(pageNodeId)) {
            nodes.add(pageNodeId);
            output += `    ${pageNodeId}["${pageName}"]\n`;
          }
          
          output += `    ${sourceId} --> ${pageNodeId}\n`;
          output += `    class ${pageNodeId} page\n`;
        }
      });
    };

    // 如果提供了初始元件，只處理該元件
    if (initialComponent) {
      processComponent(initialComponent.name, initialComponent.data);
    } else {
      // 否則處理所有元件
      Object.entries(this.targetUsage).forEach(([componentName, data]) => {
        processComponent(componentName, data);
      });
    }

    output += '```\n';
    return output;
  }

  private generateComponentMarkdown(
    componentName: string, 
    data: ComponentUsage
  ): string {
    // 找到對應的 componentPath 配置
    const componentPathConfig = this.componentPaths.find(config => 
      data.file.includes(path.relative(this.projectRoot, config.path))
    );

    if (!componentPathConfig) {
      console.warn(`警告: 找不到元件 ${componentName} 的路徑配置`);
      return '';
    }

    // 從完整檔案路徑中取得相對路徑部分
    const relativeFilePath = path.relative(this.projectRoot, data.file);
    const targetDir = path.join(this.projectRoot, path.dirname(relativeFilePath));
    
    // 使用原始元件名稱（保持大小寫）作為檔案名
    const componentFileName = `${componentName}.md`;
    const componentFilePath = path.join(targetDir, componentFileName);
    
    // 生成元件文檔內容
    let output = `# ${componentName}\n`;
    output += `> File Path: \`${data.file}\`\n\n`;

    // 添加元件依賴關係圖
    output += '## Dependency Tree\n\n';
    output += this.generateMermaidFlowchart(new Set(), new Set(), { name: componentName, data });

    if (data.dependencies.length > 0) {
      // 根據 componentPaths 配置來分組依賴
      const dependencyGroups = this.componentPaths.reduce((groups, pathConfig) => {
        // 使用路徑最後一段作為分組名稱（例如：components, elements）
        const groupName = pathConfig.path.split('/').pop() || 'other';
        // 過濾出屬於該分組的依賴
        groups[groupName] = data.dependencies.filter(d => 
          d.path.startsWith(pathConfig.importPrefix)
        );
        return groups;
      }, {} as Record<string, DependencyInfo[]>);

      // 找出未匹配任何已配置路徑的其他依賴
      const otherDeps = data.dependencies.filter(d => 
        !this.componentPaths.some(config => 
          d.path.startsWith(config.importPrefix)
        )
      );

      // 輸出每個分組的依賴
      Object.entries(dependencyGroups).forEach(([groupName, deps]) => {
        if (deps.length > 0) {
          // 將分組名稱首字母大寫
          output += `## ${groupName.charAt(0).toUpperCase() + groupName.slice(1)} Dependencies\n`;
          deps.forEach((dep) => {
            // 合併所有引用的名稱
            const importsList = dep.imports.join(', ');
            // 轉換為相對於專案根目錄的路徑
            const relativePath = path.relative(this.projectRoot, dep.file);
            // 使用引用格式輸出依賴資訊
            output += `> - **${dep.path}**\n`;
            output += `>   - File: \`${relativePath}\`\n`;
            output += `>   - Imports: \`${importsList}\`\n`;
          });
          output += '\n';
        }
      });

      // 輸出其他未分組的依賴
      if (otherDeps.length > 0) {
        output += '## Other Dependencies\n';
        otherDeps.forEach((dep) => {
          const importsList = dep.imports.join(', ');
          const relativePath = path.relative(this.projectRoot, dep.file);
          output += `> - **${dep.path}**\n`;
          output += `>   - File: \`${relativePath}\`\n`;
          output += `>   - Imports: \`${importsList}\`\n`;
        });
        output += '\n';
      }
    }

    // 輸出使用此元件的頁面列表
    if (data.usedInPages.length > 0) {
      output += '## Used in Pages\n';
      data.usedInPages.forEach((page: string) => {
        output += `> - \`${page}\`\n`;
      });
      output += '\n';
    }

    // 確保目標目錄存在
    fs.mkdirSync(targetDir, { recursive: true });
    
    // 寫入元件文檔檔案
    fs.writeFileSync(componentFilePath, output, 'utf8');
    return componentFilePath;
  }

  generateMarkDown(outputPath?: string): void {
    console.log('開始生成 Markdown 報告...');
    
    // 設定預設輸出目錄
    const defaultDir = path.join(
      this.outputDir,
      `${this.name.toLowerCase()}-docs`
    );
    const outputDir = outputPath || defaultDir;
    
    // 確保輸出目錄存在
    fs.mkdirSync(outputDir, { recursive: true });

    // 生成索引文件內容
    let indexContent = `# ${this.name} Dependencies and Usage\n\n`;
    indexContent += '## Components\n\n';

    // 遍歷所有元件並生成獨立文檔
    const componentFiles = Object.entries(this.targetUsage).map(([componentName, data]) => {
      // 生成元件文檔並獲取相對路徑
      const componentFilePath = this.generateComponentMarkdown(componentName, data);
      const relativeFilePath = path.relative(outputDir, componentFilePath);
      
      // 返回元件名稱和檔案路徑，用於生成索引
      return {
        name: componentName,
        path: relativeFilePath,
        dependencies: data.dependencies.length,
        usedInPages: data.usedInPages.length
      };
    });

    // 在索引文件中添加元件列表
    componentFiles
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(({ name, path, dependencies, usedInPages }) => {
        indexContent += `- [${name}](./${path})\n`;
        indexContent += `  - Dependencies: ${dependencies}\n`;
        indexContent += `  - Used in Pages: ${usedInPages}\n`;
      });

    // 寫入索引文件
    const indexPath = path.join(outputDir, 'index.md');
    fs.writeFileSync(indexPath, indexContent, 'utf8');

    console.log(`Markdown 文檔已生成於: ${outputDir}`);
    console.log(`分析了 ${componentFiles.length} 個元件`);
    console.log(`索引文件: ${indexPath}`);
  }

  generateDependencyTree(outputPath?: string): void {
    console.log('開始生成依賴關係樹...');
    const defaultPath = path.join(
      this.outputDir,
      `${this.name.toLowerCase()}-tree.md`
    );
    const finalPath = outputPath || defaultPath;
    
    let output = `# ${this.name} Dependency Tree\n\n`;
    output += this.generateMermaidFlowchart();
    
    fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    fs.writeFileSync(finalPath, output, 'utf8');
    console.log(`依賴關係樹已生成: ${finalPath}`);
    console.log(`包含 ${Object.keys(this.targetUsage).length} 個元件節點`);
  }

  generateJson(outputPath?: string): void {
    console.log('開始生成 JSON 報告...');
    const defaultPath = path.join(
      this.outputDir,
      `${this.name.toLowerCase()}-dependencies.json`
    );
    const finalPath = outputPath || defaultPath;

    // 建立輸出物件
    const output = {
      name: this.name,
      analyzedAt: new Date().toISOString(),
      components: Object.entries(this.targetUsage).map(([componentName, data]) => {
        // 根據 componentPaths 配置來分組依賴
        const dependencyGroups = this.componentPaths.reduce((groups, pathConfig) => {
          const groupName = pathConfig.path.split('/').pop() || 'other';
          groups[groupName] = data.dependencies
            .filter(d => d.path.startsWith(pathConfig.importPrefix))
            .map(d => ({
              path: d.path,
              file: path.relative(this.projectRoot, d.file),
              imports: d.imports
            }));
          return groups;
        }, {} as DependencyGroups);  // 使用新定義的介面

        // 找出其他未分組的依賴
        const otherDeps = data.dependencies
          .filter(d => !this.componentPaths.some(config => 
            d.path.startsWith(config.importPrefix)
          ))
          .map(d => ({
            path: d.path,
            file: path.relative(this.projectRoot, d.file),
            imports: d.imports
          }));

        if (otherDeps.length > 0) {
          dependencyGroups.other = otherDeps;
        }

        return {
          name: componentName,
          file: data.file,
          dependencies: dependencyGroups,
          usedInPages: data.usedInPages
        };
      })
    };

    // 確保輸出目錄存在
    fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    // 寫入 JSON 檔案
    fs.writeFileSync(finalPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`JSON 報告已生成: ${finalPath}`);
    console.log(`分析了 ${Object.keys(this.targetUsage).length} 個元件`);
  }
}

export function createAnalyzer(options?: AnalyzerOptions): ComponentUsageAnalyzer {
  return new ComponentUsageAnalyzer(options);
}

export const defaultConfig = {
  name: 'Component',
  targetPath: 'src/components',
  pagesPath: 'src/pages',
  fileExtensions: ['.tsx'],
  componentPaths: [
    { 
      path: 'src/components',
      importPrefix: '@/components'
    },
    { 
      path: 'src/elements',
      importPrefix: '@/elements'
    }
  ],
  outputDir: 'tools/componentUsageAnalyzer',
  exportNamePattern: /^[A-Z]/,
};
