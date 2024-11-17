import { createAnalyzer, type AnalyzerOptions } from '../src';

// 使用 TypeScript 的型別定義
const options: AnalyzerOptions = {
  name: 'TypeScriptComponents',
  targetPath: 'src/components',
  fileExtensions: ['.tsx', '.ts'],
};

const analyzer = createAnalyzer(options);

// TypeScript 會提供完整的型別提示
analyzer.run();
analyzer.generateMarkDown();
analyzer.generateDependencyTree(); 