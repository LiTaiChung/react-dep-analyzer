import { ComponentPathConfig, DependencyInfo } from '../types';

export function findDependencies(
  content: string, 
  componentPaths: ComponentPathConfig[], 
  fileExtensions: string[]
): DependencyInfo[] {
  const processImports = (regex: RegExp, pathConfig: ComponentPathConfig) => {
    const matches = Array.from(content.matchAll(regex));
    return matches.map((match) => {
      const [, namedImports, defaultImport, importPath] = match;
      let imports: string[] = [];
      
      if (namedImports) {
        imports = namedImports
          .split(',')
          .map(n => {
            const parts = n.trim().split(' as ');
            return parts[0].trim();
          })
          .filter(n => !n.startsWith('type '));
      }
      
      if (defaultImport) {
        imports.push(defaultImport);
      }

      const fileExt = fileExtensions[0];
      
      return {
        imports: imports.filter(Boolean),
        path: `${pathConfig.importPrefix}/${importPath}`,
        file: `${pathConfig.path}/${importPath}${fileExt}`,
      };
    });
  };

  const createImportRegex = (pathConfig: ComponentPathConfig) => {
    const basePath = pathConfig.path.split('/').pop() || '';
    return new RegExp(
      `import\\s+(?:{([^}]+)}|(\\w+))\\s+from\\s+['"](?:@?\\/)?(?:${basePath}|\\.\\.?\\/[^'"]*)?\\/([^'"]+)['"]`,
      'g'
    );
  };

  return componentPaths.flatMap(pathConfig => {
    const regex = createImportRegex(pathConfig);
    return processImports(regex, pathConfig);
  });
}