import path from 'path';
import { ComponentUsage, ComponentContentOptions, ComponentPathConfig, DependencyInfo } from '../types';
import { generateMermaidFlowchart } from './mermaid-generator';
import { writeFileSync } from '../file-operations/file-writer';

export function generateComponentContent(
  componentName: string, 
  data: ComponentUsage,
  projectRoot: string,
  componentPaths: ComponentPathConfig[],
  targetUsage: Record<string, ComponentUsage>,
  options: ComponentContentOptions = {}
): string {
  const {
    includeHeader = true,
    includeSeparator = false
  } = options;

  let output = '';
  
  if (includeHeader) {
    output += `# ${componentName}\n\n`;
  }

  const filePath = path.relative(projectRoot, data.file);
  output += `> File Path: \`${filePath}\`\n\n`;

  output += '## Dependency Tree\n\n';
  output += generateMermaidFlowchart(targetUsage, new Set(), new Set(), { name: componentName, data });
  output += '\n';

  const dependencyGroups = componentPaths.reduce((groups, pathConfig) => {
    const groupName = pathConfig.path.split('/').pop() || 'other';
    groups[groupName] = data.dependencies.filter(d => 
      d.path.startsWith(pathConfig.importPrefix)
    );
    return groups;
  }, {} as Record<string, DependencyInfo[]>);

  Object.entries(dependencyGroups).forEach(([groupName, deps]) => {
    if (deps.length > 0) {
      output += `## ${groupName.charAt(0).toUpperCase() + groupName.slice(1)} Dependencies\n`;
      deps.forEach((dep) => {
        const depPath = path.relative(projectRoot, dep.file);
        output += `> - **${dep.path}**\n`;
        output += `>   - File: \`${depPath}\`\n`;
        output += `>   - Imports: \`${dep.imports.join(', ')}\`\n`;
      });
      output += '\n';
    }
  });

  if (data.usedInPages.length > 0) {
    output += '## Used in Pages\n';
    data.usedInPages.forEach((page: string) => {
      output += `> - \`${page}\`\n`;
    });
    output += '\n';
  }

  if (includeSeparator) {
    output += '---\n\n';
  }

  return output;
}

export function generateComponentMarkdown(
  componentName: string, 
  data: ComponentUsage,
  projectRoot: string,
  componentPaths: ComponentPathConfig[],
  targetUsage: Record<string, ComponentUsage>
): string {
  const componentPathConfig = componentPaths.find(config => 
    data.file.includes(path.relative(projectRoot, config.path))
  );

  if (!componentPathConfig) {
    console.warn(`警告: 找不到元件 ${componentName} 的路徑配置`);
    return '';
  }

  const relativeFilePath = path.relative(projectRoot, data.file);
  const targetDir = path.join(projectRoot, path.dirname(relativeFilePath));

  const componentFileName = `${componentName}.md`;
  const componentFilePath = path.join(targetDir, componentFileName);

  const content = generateComponentContent(
    componentName, 
    data, 
    projectRoot, 
    componentPaths, 
    targetUsage,
    {
      includeHeader: true,
      includeSeparator: false
    }
  );

  writeFileSync(componentFilePath, content);
  return componentFilePath;
}

export function generateFullMarkdown(
  name: string,
  targetUsage: Record<string, ComponentUsage>,
  projectRoot: string,
  componentPaths: ComponentPathConfig[]
): string {
  let output = `# ${name} 完整元件文檔\n\n`;
  output += '## 目錄\n\n';

  Object.entries(targetUsage)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .forEach(([componentName]) => {
      output += `- [${componentName}](#${componentName.toLowerCase()})\n`;
    });

  output += '\n---\n\n';

  Object.entries(targetUsage)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .forEach(([componentName, data]) => {
      output += generateComponentContent(
        componentName, 
        data, 
        projectRoot, 
        componentPaths, 
        targetUsage,
        {
          includeHeader: true,
          includeSeparator: true
        }
      );
    });

  return output;
}