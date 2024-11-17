import { createAnalyzer } from '../src';

// Basic usage
const analyzer = createAnalyzer({
  name: 'MyComponents',
  targetPath: 'src/components',
});

analyzer.run();
analyzer.generateMarkDown();

// Advanced configuration
const advancedAnalyzer = createAnalyzer({
  name: 'AdvancedAnalysis',
  targetPath: 'src/components',
  fileExtensions: ['.tsx', '.jsx'],
  outputDir: 'reports/component-usage',
});

advancedAnalyzer.run();
advancedAnalyzer.generateDependencyTree();
