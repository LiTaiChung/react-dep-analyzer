import path from "path";
import { glob } from "glob";

import {
  AnalyzerOptions,
  ComponentUsage,
  ComponentPathConfig,
  DependencyGroups,
  AnalysisOutput,
} from "./types";
import {
  findProjectRoot,
  resolveRelativePath,
  getRelativePath,
} from "./utils/path-utils";
import { getExports } from "./utils/export-parser";
import { findDependencies } from "./utils/dependency-parser";
import { writeFileSync, readFileSync } from "./file-operations/file-writer";
import { generateMermaidFlowchart } from "./generators/mermaid-generator";
import {
  generateComponentMarkdown,
  generateFullMarkdown,
} from "./generators/markdown-generator";
import { DEFAULT_CONFIG, OUTPUT_FILES } from "./constants";
import { logger } from "./utils/logger";
import { validateAnalyzerOptions, ValidationError } from "./utils/validation";

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

  constructor(options: AnalyzerOptions = {}) {
    try {
      validateAnalyzerOptions(options);
      const config = { ...DEFAULT_CONFIG, ...options };

      this.projectRoot = findProjectRoot(process.cwd());
      logger.info("專案根目錄:", this.projectRoot);

      this.name = config.name;
      this.pagesDir = resolveRelativePath(this.projectRoot, config.pagesPath);
      this.targetsDir = resolveRelativePath(
        this.projectRoot,
        config.targetPath
      );
      this.fileExtensions = config.fileExtensions;
      this.componentPaths = config.componentPaths.map((pathConfig) => ({
        ...pathConfig,
        path: resolveRelativePath(this.projectRoot, pathConfig.path),
      }));
      this.outputDir = resolveRelativePath(this.projectRoot, config.outputDir);
      this.exportNamePattern = config.exportNamePattern;
      this.targetUsage = {};
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.error("配置驗證失敗:", error.message);
        throw error;
      }
      logger.error("初始化失敗:", error);
      throw error;
    }
  }

  private analyzeComponentFile(file: string): void {
    try {
      logger.debug(`分析元件檔案: ${file}`);
      const content = readFileSync(file);
      const componentPath = getRelativePath(this.projectRoot, file);
      const exports = getExports(content);
      logger.debug(`找到的匯出項目: ${exports.join(", ")}`);

      exports
        .filter((exportName) => this.exportNamePattern.test(exportName))
        .forEach((exportName) => {
          logger.debug(`處理元件: ${exportName}`);
          this.targetUsage[exportName] = {
            file: componentPath,
            dependencies: findDependencies(
              content,
              this.componentPaths,
              this.fileExtensions
            ),
            usedInPages: [],
          };
        });
    } catch (error) {
      logger.error(`分析元件檔案失敗: ${file}`, error);
      throw error;
    }
  }

  private analyzePageFile(pageFile: string): void {
    try {
      logger.debug(`分析頁面檔案: ${pageFile}`);
      const content = readFileSync(pageFile);
      const relativePath = getRelativePath(this.projectRoot, pageFile);

      Object.keys(this.targetUsage).forEach((componentName) => {
        const importRegex = new RegExp(
          `import\\s*{[^}]*${componentName}[^}]*}\\s*from|<${componentName}[^>]*>|<${componentName}\\s*\\/>`
        );
        if (importRegex.test(content)) {
          if (
            !this.targetUsage[componentName].usedInPages.includes(relativePath)
          ) {
            this.targetUsage[componentName].usedInPages.push(relativePath);
          }
        }
      });
    } catch (error) {
      logger.error(`分析頁面檔案失敗: ${pageFile}`, error);
      throw error;
    }
  }

  run(): void {
    try {
      logger.info("開始分析元件使用情況...");
      logger.info("分析目錄:", this.targetsDir);

      const componentFiles = glob.sync(
        `${this.targetsDir}/**/*{${this.fileExtensions.join(",")}}`
      );
      logger.info(`找到 ${componentFiles.length} 個元件檔案`);

      componentFiles.forEach((file) => this.analyzeComponentFile(file));

      const pageFiles = glob.sync(
        `${this.pagesDir}/**/*{${this.fileExtensions.join(",")}}`
      );
      logger.info(`找到 ${pageFiles.length} 個頁面檔案`);

      pageFiles.forEach((pageFile) => this.analyzePageFile(pageFile));

      logger.info("元件使用情況分析完成");
    } catch (error) {
      logger.error("分析過程失敗:", error);
      throw error;
    }
  }

  generateMarkDown(outputPath?: string): void {
    try {
      logger.info("開始生成 Markdown 報告...");

      const defaultDir = path.join(
        this.outputDir,
        `${this.name.toLowerCase()}-docs`
      );
      const outputDir = outputPath || defaultDir;

      let indexContent = `# ${this.name} Dependencies and Usage\n\n`;
      indexContent += "## Components\n\n";

      const componentFiles = Object.entries(this.targetUsage).map(
        ([componentName, data]) => {
          const componentFilePath = generateComponentMarkdown(
            componentName,
            data,
            this.projectRoot,
            this.componentPaths,
            this.targetUsage
          );

          const relativePath = getRelativePath(
            this.projectRoot,
            componentFilePath
          );
          const absolutePath = `/${relativePath}`;

          return {
            name: componentName,
            path: absolutePath,
            dependencies: data.dependencies.length,
            usedInPages: data.usedInPages.length,
          };
        }
      );

      componentFiles
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(({ name, path, dependencies, usedInPages }) => {
          indexContent += `- [${name}](${path})\n`;
          indexContent += `  - Dependencies: ${dependencies}\n`;
          indexContent += `  - Used in Pages: ${usedInPages}\n`;
        });

      const indexPath = path.join(outputDir, OUTPUT_FILES.INDEX);
      writeFileSync(indexPath, indexContent);

      const fullDocPath = path.join(outputDir, OUTPUT_FILES.FULL_DOCUMENTATION);
      const fullDocContent = generateFullMarkdown(
        this.name,
        this.targetUsage,
        this.projectRoot,
        this.componentPaths
      );
      writeFileSync(fullDocPath, fullDocContent);

      logger.info(`Markdown 文檔已生成於: ${outputDir}`);
      logger.info(`分析了 ${componentFiles.length} 個元件`);
      logger.info(`索引文件: ${indexPath}`);
      logger.info(`完整文檔: ${fullDocPath}`);
    } catch (error) {
      logger.error("Markdown 報告生成失敗:", error);
      throw error;
    }
  }

  generateDependencyTree(outputPath?: string): void {
    try {
      logger.info("開始生成依賴關係樹...");
      const defaultPath = path.join(
        this.outputDir,
        OUTPUT_FILES.DEPENDENCY_TREE
      );
      const finalPath = outputPath || defaultPath;

      let output = `# ${this.name} Dependency Tree\n\n`;
      output += generateMermaidFlowchart(this.targetUsage);

      writeFileSync(finalPath, output);
      logger.info(`依賴關係樹已生成: ${finalPath}`);
      logger.info(`包含 ${Object.keys(this.targetUsage).length} 個元件節點`);
    } catch (error) {
      logger.error("依賴關係樹生成失敗:", error);
      throw error;
    }
  }

  generateJson(outputPath?: string): void {
    try {
      logger.info("開始生成 JSON 報告...");
      const defaultPath = path.join(this.outputDir, OUTPUT_FILES.JSON_REPORT);
      const finalPath = outputPath || defaultPath;

      const output: AnalysisOutput = {
        name: this.name,
        analyzedAt: new Date().toISOString(),
        components: Object.entries(this.targetUsage).map(
          ([componentName, data]) => {
            const dependencyGroups = this.componentPaths.reduce(
              (groups, pathConfig) => {
                const groupName = pathConfig.path.split("/").pop() || "other";
                groups[groupName] = data.dependencies
                  .filter((d) => d.path.startsWith(pathConfig.importPrefix))
                  .map((d) => ({
                    path: d.path,
                    file: getRelativePath(this.projectRoot, d.file),
                    imports: d.imports,
                  }));
                return groups;
              },
              {} as DependencyGroups
            );

            const otherDeps = data.dependencies
              .filter(
                (d) =>
                  !this.componentPaths.some((config) =>
                    d.path.startsWith(config.importPrefix)
                  )
              )
              .map((d) => ({
                path: d.path,
                file: getRelativePath(this.projectRoot, d.file),
                imports: d.imports,
              }));

            if (otherDeps.length > 0) {
              dependencyGroups.other = otherDeps;
            }

            return {
              name: componentName,
              file: data.file,
              dependencies: dependencyGroups,
              usedInPages: data.usedInPages,
            };
          }
        ),
      };

      writeFileSync(finalPath, JSON.stringify(output, null, 2));
      logger.info(`JSON 報告已生成: ${finalPath}`);
      logger.info(`分析了 ${Object.keys(this.targetUsage).length} 個元件`);
    } catch (error) {
      logger.error("JSON 報告生成失敗:", error);
      throw error;
    }
  }
}

export function createAnalyzer(
  options?: AnalyzerOptions
): ComponentUsageAnalyzer {
  return new ComponentUsageAnalyzer(options);
}

export { DEFAULT_CONFIG as defaultConfig } from "./constants";
