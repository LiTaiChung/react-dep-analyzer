# React Demo - 元件依賴分析範例

這是一個使用 `react-dep-analyzer` 的完整範例專案，展示如何分析 React 元件的依賴關係和使用情況。

## 專案結構

```
src/
├── components/          # React 元件
│   ├── Button/         # 按鈕元件
│   ├── Card/           # 卡片元件
│   ├── Form/           # 表單元件
│   └── Modal/          # 模態框元件
├── elements/           # 基礎 UI 元素
│   ├── Badge/          # 徽章元素
│   └── Icon/           # 圖示元素
└── pages/              # 頁面元件
    ├── home.tsx        # 首頁
    └── about.tsx       # 關於頁面
```

## 元件特色

### 🔘 Button 元件
- 支援圖示顯示
- 可點擊事件處理
- 依賴 Icon 元素

### 🃏 Card 元件
- 標題和內容顯示
- 行動按鈕整合
- 依賴 Button 元件

### 📝 Form 元件
- 完整表單驗證
- 模態框確認機制
- 依賴 Button 和 Modal 元件

### 🖼️ Modal 元件
- 覆蓋層顯示
- 可關閉和確認操作
- 依賴 Button 和 Icon 元素

### 🏷️ Badge 元素
- 多種樣式變體
- 不同尺寸選項
- 獨立基礎元素

### 🎯 Icon 元素
- 圖示名稱支援
- 基礎 UI 元素
- 被多個元件引用

## 執行分析

### 1. 安裝依賴

```bash
cd examples/react-demo
yarn install
```

### 2. 執行分析腳本

```bash
yarn analyze
```

或直接運行腳本：

```bash
node scripts/analyze.mjs
```

### 3. 查看分析結果

分析完成後，將在 `tools/usageAnalyzer` 目錄下生成：

- 📋 **index.md** - 元件索引和概覽
- 📖 **full-documentation.md** - 完整元件文檔
- 🌲 **component-tree.md** - 依賴關係樹圖
- 📊 **component-dependencies.json** - JSON 格式詳細數據

## 依賴關係亮點

這個範例展示了複雜的元件依賴關係：

```
HomePage → Form → Modal → Button → Icon
       → Card → Button → Icon
       → Badge
       → Modal

AboutPage → Card → Button → Icon
         → Badge
         → Button → Icon
         → Icon
```

## 分析配置

```javascript
{
  name: 'ReactDemo',
  targetPath: 'src/components',
  pagesPath: 'src/pages', 
  fileExtensions: ['.tsx', '.jsx', '.js'],
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
  outputDir: 'tools/usageAnalyzer'
}
```

## 功能展示

- ✅ **多層級依賴分析** - 元件→元素的依賴鏈
- ✅ **頁面使用追蹤** - 元件在哪些頁面被使用
- ✅ **Mermaid 流程圖** - 視覺化依賴關係
- ✅ **完整文檔生成** - 自動生成元件文檔
- ✅ **JSON 數據導出** - 結構化數據分析

## 最佳實踐

1. **清晰的檔案結構** - 分離 components 和 elements
2. **一致的匯入路徑** - 使用 `@/` 別名
3. **適當的元件粒度** - 基礎元素 vs 複合元件
4. **TypeScript 支援** - 完整的型別定義
5. **文檔化元件** - 自動生成的 Markdown 文檔

## Yarn 腳本命令

```bash
# 安裝依賴
yarn install

# 執行元件分析
yarn analyze

# 開發模式
yarn dev

# 建置專案
yarn build

# 程式碼檢查
yarn lint

# 重新安裝本地包（開發時使用）
yarn install:local

# 清理所有檔案
yarn clean

# 重置並重新安裝
yarn reset
```

## 開發提示

如果您正在開發 `react-dep-analyzer` 包本身：

1. **更新本地包**: `yarn install:local`
2. **重新分析**: `yarn clean && yarn analyze`
3. **完全重置**: `yarn reset && yarn analyze`

透過這個範例，您可以看到 `react-dep-analyzer` 如何幫助理解和管理 React 專案的元件架構！