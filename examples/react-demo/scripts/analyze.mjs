import { createAnalyzer } from 'react-dep-analyzer';

async function main() {
  try {
    console.log('🚀 開始分析 React 元件依賴關係...');
    
    const analyzer = createAnalyzer({
      name: 'ReactDemo',
      targetPath: 'src/components',
      pagesPath: 'src/pages',
      fileExtensions: ['.tsx', '.jsx', '.js'],
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
      outputDir: 'tools/usageAnalyzer',
    });

    // 執行分析
    analyzer.run();
    
    // 生成報告
    console.log('📝 生成文檔報告...');
    analyzer.generateMarkDown();
    
    console.log('🌲 生成依賴關係樹...');
    analyzer.generateDependencyTree();
    
    console.log('📊 生成 JSON 報告...');
    analyzer.generateJson();
    
    console.log('✅ 分析完成！請查看 tools/usageAnalyzer 目錄');
    
  } catch (error) {
    console.error('❌ 分析過程中發生錯誤:', error.message);
    process.exit(1);
  }
}

main();
