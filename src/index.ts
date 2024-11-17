import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

export interface AnalyzerOptions {
  name?: string;
  targetPath?: string;
  pagesPath?: string;
  fileExtensions?: string[];
  componentPaths?: string[];
  outputDir?: string;
  exportNamePattern?: RegExp;
}

export class UsageAnalyzer {
  private name: string;
  private pagesDir: string;
  private targetsDir: string;
  private fileExtensions: string[];
  private componentPaths: string[];
  private outputDir: string;
  private exportNamePattern: RegExp;
  private targetUsage: Record<string, any>;

  constructor({
    name = 'Component',
    targetPath = 'src/components',
    pagesPath = 'src/pages',
    fileExtensions = ['.tsx'],
    componentPaths = ['src/components', 'src/elements'],
    outputDir = 'tools/usageAnalyzer',
    exportNamePattern = /^[A-Z]/,
  }: AnalyzerOptions = {}) {
    this.name = name;
    this.pagesDir = path.join(process.cwd(), pagesPath);
    this.targetsDir = path.join(process.cwd(), targetPath);
    this.fileExtensions = fileExtensions;
    this.componentPaths = componentPaths;
    this.outputDir = path.join(process.cwd(), outputDir);
    this.exportNamePattern = exportNamePattern;
    this.targetUsage = {};
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

  findDependencies(content: string) {
    const processImports = (regex: RegExp, type: string) => {
      const matches = Array.from(content.matchAll(regex));
      return matches.map((match) => {
        const [_, namedImports, defaultImport, importPath] = match;
        const imports = namedImports 
          ? namedImports.split(',').map(n => n.trim())
          : [defaultImport];

        const fileExt = this.fileExtensions[0];
        return {
          type,
          imports,
          path: type === 'element' 
            ? `@/elements/${importPath}` 
            : `../${importPath}`,
          file: type === 'element'
            ? `src/elements/${importPath}${fileExt}`
            : `src/components/${importPath}${fileExt}`
        };
      });
    };

    const elementImportsRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]@\/elements\/([^'"]+)['"]/g;
    const componentImportsRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]\.\.\/([\w\/]+)['"]/g;

    return [
      ...processImports(elementImportsRegex, 'element'),
      ...processImports(componentImportsRegex, 'component')
    ];
  }

  run(): void {
    const componentFiles = glob.sync(`${this.targetsDir}/**/*{${this.fileExtensions.join(',')}}`);
    
    componentFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      const componentPath = path.relative(process.cwd(), file);
      const exports = this.getExports(content);

      exports
        .filter(exportName => this.exportNamePattern.test(exportName))
        .forEach(exportName => {
          this.targetUsage[exportName] = {
            file: componentPath,
            dependencies: this.findDependencies(content),
            usedInPages: []
          };
        });
    });

    const pageFiles = glob.sync(`${this.pagesDir}/**/*{${this.fileExtensions.join(',')}}`);
    pageFiles.forEach((pageFile) => {
      const content = fs.readFileSync(pageFile, 'utf8');
      const relativePath = path.relative(process.cwd(), pageFile);

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
  }

  generateMarkDown(outputPath?: string): void {
    const defaultPath = path.join(
      this.outputDir,
      `${this.name.toLowerCase()}-dependencies.md`
    );
    const finalPath = outputPath || defaultPath;
    
    const header = `# ${this.name} Dependencies and Usage\n\n`;
    let output = header;

    Object.entries(this.targetUsage).forEach(([componentName, data]) => {
      output += `- ${componentName} (${data.file})\n`;

      if (data.dependencies.length > 0) {
        output += '  Dependencies:\n';
        data.dependencies.forEach((dep: any) => {
          const importsList = dep.imports.join(', ');
          output += `    - [${dep.type === 'element' ? 'Element' : 'Component'}] ${dep.path} (${dep.file})\n`;
          output += `      Imports: ${importsList}\n`;
        });
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
    console.log('Dependencies report created:', finalPath);
  }

  generateDependencyTree(outputPath?: string): void {
    const defaultPath = path.join(
      this.outputDir,
      `${this.name.toLowerCase()}-tree.md`
    );
    const finalPath = outputPath || defaultPath;
    
    let output = `# ${this.name} Dependency Tree\n\n\`\`\`mermaid\nflowchart TD\n`;
    const edges = new Set<string>();

    Object.entries(this.targetUsage).forEach(([componentName, data]) => {
      const nodeId = componentName.replace(/[^a-zA-Z0-9]/g, '_');
      output += `    ${nodeId}["${componentName}"]\n`;
    });

    Object.entries(this.targetUsage).forEach(([componentName, data]) => {
      const sourceId = componentName.replace(/[^a-zA-Z0-9]/g, '_');
      (data.dependencies as any[]).forEach((dep: any) => {
        dep.imports.forEach((importName: string) => {
          const cleanImportName = importName.split(' as ')[0].trim();
          if (cleanImportName !== 'type') {
            const targetId = dep.type === 'element'
              ? `Element_${cleanImportName}`.replace(/[^a-zA-Z0-9]/g, '_')
              : cleanImportName.replace(/[^a-zA-Z0-9]/g, '_');

            const edgeKey = `${sourceId}-${targetId}`;
            if (!edges.has(edgeKey)) {
              edges.add(edgeKey);
              const arrow = dep.type === 'element' ? '-.->' : '-->';

              if (dep.type === 'element') {
                output += `    ${targetId}["${cleanImportName} (Element)"]\n`;
              }

              output += `    ${sourceId} ${arrow} ${targetId}\n`;
            }
          }
        });
      });

      data.usedInPages.forEach((page: string) => {
        const pageName = page.replace(/^src\/pages\//, '').replace(/\.tsx$/, '');
        const pageNodeId = `page_${pageName.replace(/[^a-zA-Z0-9]/g, '_')}`;
        output += `    ${pageNodeId}["${pageName}"]\n`;
        output += `    ${sourceId} --> ${pageNodeId}\n`;
      });
    });

    output += '```\n';
    
    fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    fs.writeFileSync(finalPath, output, 'utf8');
    console.log('Dependency tree created:', finalPath);
  }
}

export function createAnalyzer(options?: AnalyzerOptions): UsageAnalyzer {
  return new UsageAnalyzer(options);
}

export const defaultConfig = {
  name: 'Component',
  targetPath: 'src/components',
  pagesPath: 'src/pages',
  fileExtensions: ['.tsx'],
  componentPaths: ['src/components', 'src/elements'],
  outputDir: 'tools/usageAnalyzer',
  exportNamePattern: /^[A-Z]/,
};
