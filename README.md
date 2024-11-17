# Usage Analyzer

一個用於分析 React 專案中元件使用情況的工具。

## 安裝

```bash
npm install usage-analyzer
# 或
yarn add usage-analyzer
```

## 使用方式

```typescript
import { createAnalyzer } from 'usage-analyzer';

const analyzer = createAnalyzer({
  name: 'Component',
  targetPath: 'src/components',
  pagesPath: 'src/pages',
});

analyzer.run();
analyzer.generateMarkDown();
analyzer.generateDependencyTree();
```

## 配置選項

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| name | string | 'Component' | 報告標題名稱 |
| targetPath | string | 'src/components' | 目標元件的路徑 |
| pagesPath | string | 'src/pages' | 頁面檔案的路徑 |
| fileExtensions | string[] | ['.tsx'] | 要掃描的檔案副檔名 |
| componentPaths | string[] | ['src/components', 'src/elements'] | 額外的元件路徑 |
| outputDir | string | 'tools/usageAnalyzer' | 報告輸出目錄 |
| exportNamePattern | RegExp | /^[A-Z]/ | 有效匯出名稱的正規表達式 |

## License

MIT
