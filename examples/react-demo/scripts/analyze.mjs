import { createAnalyzer } from 'react-dep-analyzer';

const analyzer = createAnalyzer({
  name: 'Component',
  targetPath: 'src/components',
  pagesPath: 'src/pages',
  fileExtensions: ['.tsx', '.jsx', '.js'], // 增加支援的檔案類型
  componentPaths: [
    {
      path: 'src/components',
      importPrefix: '@/components',
    },
    {
      path: 'src/elements',
      importPrefix: '@/elements',
    },
  ],
});

analyzer.run();
analyzer.generateMarkDown();
analyzer.generateDependencyTree();
analyzer.generateJson();
