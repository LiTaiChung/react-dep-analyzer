import { AnalyzerOptions } from './types';

export const DEFAULT_CONFIG: Required<AnalyzerOptions> = {
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
  outputDir: 'tools/usageAnalyzer',
  exportNamePattern: /^[A-Z]/,
};

export const FILE_EXTENSIONS = {
  TYPESCRIPT: '.ts',
  TSX: '.tsx',
  JAVASCRIPT: '.js',
  JSX: '.jsx'
} as const;

export const OUTPUT_FILES = {
  INDEX: 'index.md',
  FULL_DOCUMENTATION: 'full-documentation.md',
  DEPENDENCY_TREE: 'component-tree.md',
  JSON_REPORT: 'component-dependencies.json'
} as const;