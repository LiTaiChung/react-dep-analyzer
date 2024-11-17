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

  generateMarkDown(outputPath?: string): void {
    console.log('開始生成 Markdown 報告...');
    const defaultPath = path.join(
      this.outputDir,
      `${this.name.toLowerCase()}-dependencies.md`
    );
    const finalPath = outputPath || defaultPath;
    
    const header = `# ${this.name} Dependencies and Usage\n\n`;
    let output = header;

    Object.entries(this.targetUsage).forEach(([componentName, data]) => {
      output += `## ${componentName} (${data.file})\n\n`;

      if (data.dependencies.length > 0) {
        // 根據路徑模式分組依賴
        const componentDeps = data.dependencies.filter(d => d.path.includes('/components/'));
        const elementDeps = data.dependencies.filter(d => d.path.includes('/elements/'));
        const otherDeps = data.dependencies.filter(d => 
          !d.path.includes('/components/') && !d.path.includes('/elements/')
        );

        if (componentDeps.length > 0) {
          output += '### Component Dependencies:\n';
          componentDeps.forEach((dep) => {
            const importsList = dep.imports.join(', ');
            output += `- ${dep.path} (${dep.file})\n`;
            output += `  Imports: ${importsList}\n`;
          });
          output += '\n';
        }

        if (elementDeps.length > 0) {
          output += '### Element Dependencies:\n';
          elementDeps.forEach((dep) => {
            const importsList = dep.imports.join(', ');
            output += `- ${dep.path} (${dep.file})\n`;
            output += `  Imports: ${importsList}\n`;
          });
          output += '\n';
        }

        if (otherDeps.length > 0) {
          output += '### Other Dependencies:\n';
          otherDeps.forEach((dep) => {
            const importsList = dep.imports.join(', ');
            output += `- ${dep.path} (${dep.file})\n`;
            output += `  Imports: ${importsList}\n`;
          });
          output += '\n';
        }
      }

      if (data.usedInPages.length > 0) {
        output += '  Used in pages:\n';
        data.usedInPages.forEach((page: string) => {
          output += `    - ${page}\n`;
        });
      }
      output += '\n';
    });

    fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    fs.writeFileSync(finalPath, output, 'utf8');
    console.log(`Markdown 報告已生成: ${finalPath}`);
    console.log(`分析了 ${Object.keys(this.targetUsage).length} 個元件`);
  }

  generateDependencyTree(outputPath?: string): void {
    console.log('開始生成依賴關係樹...');
    const defaultPath = path.join(
      this.outputDir,
      `${this.name.toLowerCase()}-tree.md`
    );
    const finalPath = outputPath || defaultPath;
    
    let output = `# ${this.name} Dependency Tree\n\n`;
    output += '```mermaid\nflowchart TD\n';
    output += '    %% 樣式定義\n';
    output += '    classDef component fill:#f9f,stroke:#333,stroke-width:2px,color:#000,font-weight:bold\n';
    output += '    classDef element fill:#bbf,stroke:#333,stroke-width:2px,color:#000,font-weight:bold\n';
    output += '    classDef page fill:#bfb,stroke:#333,stroke-width:2px,color:#000,font-weight:bold\n';
    output += '    classDef other fill:#fff,stroke:#333,stroke-width:1px,color:#000\n\n';

    const processedNodes = new Set<string>();
    const edges = new Set<string>();

    Object.entries(this.targetUsage).forEach(([componentName, data]) => {
      const sourceId = componentName.replace(/[^a-zA-Z0-9]/g, '_');
      
      if (!processedNodes.has(sourceId)) {
        processedNodes.add(sourceId);
        output += `    ${sourceId}["${componentName}"]\n`;
        output += `    class ${sourceId} component\n`;
      }

      data.dependencies.forEach((dep) => {
        dep.imports.forEach((importName) => {
          const cleanImportName = importName.split(' as ')[0].trim();
          // 避免自我引用
          if (cleanImportName !== 'type' && cleanImportName !== componentName) {
            const targetId = cleanImportName.replace(/[^a-zA-Z0-9]/g, '_');
            const edgeKey = `${sourceId}-${targetId}`;

            if (!edges.has(edgeKey)) {
              edges.add(edgeKey);
              
              if (!processedNodes.has(targetId)) {
                processedNodes.add(targetId);
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

      // 頁面節點處理
      data.usedInPages.forEach((page: string) => {
        const pageName = page.replace(/^src\/pages\//, '').replace(/\.tsx$/, '');
        const pageNodeId = `page_${pageName.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        const edgeKey = `${sourceId}-${pageNodeId}`;
        if (!edges.has(edgeKey)) {
          edges.add(edgeKey);
          
          if (!processedNodes.has(pageNodeId)) {
            processedNodes.add(pageNodeId);
            output += `    ${pageNodeId}["${pageName}"]\n`;
          }
          
          output += `    ${sourceId} --> ${pageNodeId}\n`;
          output += `    class ${pageNodeId} page\n`;
        }
      });
    });

    output += '```\n';
    
    fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    fs.writeFileSync(finalPath, output, 'utf8');
    console.log(`依賴關係樹已生成: ${finalPath}`);
    console.log(`包含 ${Object.keys(this.targetUsage).length} 個元件節點`);
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
