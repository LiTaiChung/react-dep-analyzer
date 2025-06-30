export interface ComponentPathConfig {
  path: string;
  importPrefix: string;
}

export interface AnalyzerOptions {
  name?: string;
  targetPath?: string;
  pagesPath?: string;
  fileExtensions?: string[];
  componentPaths?: ComponentPathConfig[];
  outputDir?: string;
  exportNamePattern?: RegExp;
}

export interface DependencyInfo {
  path: string;
  imports: string[];
  file: string;
}

export interface ComponentUsage {
  file: string;
  dependencies: DependencyInfo[];
  usedInPages: string[];
}

export interface GroupedDependency {
  path: string;
  file: string;
  imports: string[];
}

export interface DependencyGroups {
  [key: string]: GroupedDependency[];
}

export interface ComponentContentOptions {
  includeHeader?: boolean;
  includeSeparator?: boolean;
}

export interface ComponentFileInfo {
  name: string;
  path: string;
  dependencies: number;
  usedInPages: number;
}

export interface AnalysisOutput {
  name: string;
  analyzedAt: string;
  components: ComponentAnalysisResult[];
}

export interface ComponentAnalysisResult {
  name: string;
  file: string;
  dependencies: DependencyGroups;
  usedInPages: string[];
}