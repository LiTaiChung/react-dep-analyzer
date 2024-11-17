# React Dependency Analyzer

[![npm version](https://badge.fury.io/js/react-dep-analyzer.svg)](https://badge.fury.io/js/react-dep-analyzer)
[![GitHub license](https://img.shields.io/github/license/LiTaiChung/react-dep-analyzer.svg)](https://github.com/LiTaiChung/react-dep-analyzer/blob/main/LICENSE)

## 安裝

使用 npm：
```bash
npm install -D react-dep-analyzer
```

使用 yarn：
```bash
yarn add -D react-dep-analyzer
```

## 使用方式

### 1. 新增腳本指令

在你的 `package.json` 中加入以下腳本：

```json
{
  "scripts": {
    "analyze": "node scripts/analyze.mjs"
  }
}
```

### 2. 建立分析腳本

建立檔案 `scripts/analyze.mjs`：

```javascript
import { createAnalyzer } from 'react-dep-analyzer';

// 建立分析器實例
const analyzer = createAnalyzer({
  // 自定義配置（可選）
  name: 'Component',
  targetPath: 'src/components',
  pagesPath: 'src/pages',
});

// 執行分析
analyzer.run();

// 生成所有格式的報告
analyzer.generateMarkDown();
analyzer.generateDependencyTree();
analyzer.generateJson();
```

### 3. 執行分析

使用 npm：
```bash
npm run analyze
```

使用 yarn：
```bash
yarn analyze
```

### 4. 配置 package.json

如果你的專案使用了 `"type": "module"`，可以直接執行上述指令。如果沒有，需要在 `package.json` 中加入：

```json
{
  "type": "module"
}
```

或者在執行指令時加入 `--experimental-modules` 標記：

```json
{
  "scripts": {
    "analyze": "node --experimental-modules scripts/analyze.mjs"
  }
}
```

## 基本使用

```typescript
import { createAnalyzer } from 'react-dep-analyzer';

// 使用預設配置建立分析器
const analyzer = createAnalyzer();

// 執行分析
analyzer.run();

// 生成 Markdown 文檔（包含索引和個別元件文檔）
analyzer.generateMarkDown();

// 生成完整依賴樹圖
analyzer.generateDependencyTree();

// 生成 JSON 格式報告
analyzer.generateJson();
```

## 配置選項

你可以透過傳入配置物件來自定義分析器的行為：

```typescript
interface ComponentPathConfig {
  path: string;          // 元件目錄路徑
  importPrefix: string;  // import 語句的前綴
}

const analyzer = createAnalyzer({
  name: 'Component',              // 分析報告的標題名稱
  targetPath: 'src/components',   // 要分析的元件目錄
  pagesPath: 'src/pages',        // 頁面檔案目錄
  fileExtensions: ['.tsx'],      // 要分析的檔案副檔名
  componentPaths: [              // 元件搜尋路徑配置
    { 
      path: 'src/components',    
      importPrefix: '@/components'
    },
    { 
      path: 'src/elements',
      importPrefix: '@/elements'
    }
  ],
  outputDir: 'tools/componentUsageAnalyzer', // 輸出目錄
});
```

### 預設配置

工具內建以下預設配置：

```typescript
const defaultConfig = {
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
  outputDir: 'tools/componentUsageAnalyzer',
};
```

## 輸出範例

### Markdown 文檔

工具會在專案目錄中生成以下檔案結構：

```
專案根目錄/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── index.tsx          # 原始元件
│   │   │   └── Button.md         # 元件文檔
│   │   └── Card/
│   │       ├── index.tsx
│   │       └── Card.md
│   └── elements/
│       └── Icon/
│           ├── index.tsx
│           └── Icon.md
└── tools/
    └── componentUsageAnalyzer/    # 其他報告輸出目錄
        ├── index.md               # 元件索引
        ├── component-tree.md      # 依賴樹圖
        └── component-dependencies.json  # JSON 格式報告
```

#### 索引文件 (tools/componentUsageAnalyzer/index.md)
```markdown
# Component Dependencies and Usage

## Components

- [Button](./src/components/Button/Button.md)
  - Dependencies: 1
  - Used in Pages: 2
- [Card](./src/components/Card/Card.md)
  - Dependencies: 1
  - Used in Pages: 1
```

#### 元件文檔 (例如：src/components/Button/Button.md)
```markdown
# Button
> File Path: `components/Button/index.tsx`

## Dependency Tree

\```mermaid
flowchart TD
    Button["Button"]
    Icon["Icon"]
    page_home["home"]
    page_about["about"]
    Button --> Icon
    Button --> page_home
    Button --> page_about
\```

## Elements Dependencies
> - **@/elements/Icon**
>   - File: `elements/Icon/index.tsx`
>   - Imports: `Icon`

## Used in Pages
> - `pages/home.tsx`
> - `pages/about.tsx`
```

### 依賴樹圖 (tools/componentUsageAnalyzer/component-tree.md)

```markdown
# Component Dependency Tree

\```mermaid
flowchart TD
    Button["Button"]
    Card["Card"]
    Icon["Icon"]
    Button --> Icon
    Card --> Button
    Button --> page_home["home"]
    Button --> page_about["about"]
    Card --> page_products["products"]
\```
```

### JSON 報告 (tools/componentUsageAnalyzer/component-dependencies.json)

```json
{
  "name": "Component",
  "analyzedAt": "2024-01-01T00:00:00.000Z",
  "components": [
    {
      "name": "Button",
      "file": "components/Button.tsx",
      "dependencies": {
        "elements": [
          {
            "path": "@/elements/Icon",
            "file": "elements/Icon.tsx",
            "imports": ["Icon"]
          }
        ]
      },
      "usedInPages": [
        "pages/home.tsx",
        "pages/about.tsx"
      ]
    }
  ]
}
```

## 注意事項

1. 工具預設只分析以大寫字母開頭的匯出（符合 React 元件命名規範）
2. 支援分析命名匯出、預設匯出和批量匯出
3. 目前支援 `.tsx` 檔案的分析，可透過配置擴展支援其他檔案類型
4. 工具會自動尋找專案根目錄（包含 package.json 的目錄）
5. 所有路徑都相對於專案根目錄進行解析
6. 確保專案目錄結構符合配置中指定的路徑
7. Markdown 文檔中的依賴樹圖使用 Mermaid 語法，需要在支援 Mermaid 的環境中檢視（如 GitHub）

## 授權條款

MIT

## 範例專案

這是一個使用 Vite + TypeScript + React 的示例專案，展示如何使用此工具：

### 專案結構
```
react-demo/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   └── index.tsx
│   │   └── Card/
│   │       └── index.tsx
│   ├── elements/
│   │   └── Icon/
│   │       └── index.tsx
│   ├── pages/
│   │   ├── home.tsx
│   │   └── about.tsx
│   ├── styles/
│   │   └── index.css
│   └── main.tsx
├── scripts/
│   └── analyze.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 元件範例

#### Button 元件 (src/components/Button/index.tsx)
```tsx
import React from 'react';
import { Icon } from '@/elements/Icon';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick,
  icon 
}) => {
  return (
    <button 
      className="button" 
      onClick={onClick}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
};
```

#### Card 元件 (src/components/Card/index.tsx)
```tsx
import React from 'react';
import { Button } from '@/components/Button';

interface CardProps {
  title: string;
  content: string;
  onAction?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  content,
  onAction 
}) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{content}</p>
      <Button onClick={onAction} icon="arrow-right">
        了解更多
      </Button>
    </div>
  );
};
```

### 分析腳本設定

#### 1. 安裝依賴
```bash
npm install -D react-dep-analyzer
# 或
yarn add -D react-dep-analyzer
```

#### 2. 添加分析腳本 (scripts/analyze.mjs)
```javascript
import { createAnalyzer } from 'react-dep-analyzer';

const analyzer = createAnalyzer({
  name: 'React Demo',
  componentPaths: [
    { 
      path: 'src/components',
      importPrefix: '@/components'
    },
    { 
      path: 'src/elements',
      importPrefix: '@/elements'
    }
  ]
});

analyzer.analyze();
analyzer.generateMarkDown();
analyzer.generateJson();
```

#### 3. 配置 package.json 腳本
```json
{
  "type": "module",
  "scripts": {
    "analyze": "node scripts/analyze.mjs"
  }
}
```

### 分析結果

執行 `npm run analyze` 後，會生成以下文檔：

#### 元件索引 (tools/componentUsageAnalyzer/index.md)
```markdown
# React Demo Dependencies and Usage

## Components

- [Button](/src/components/Button/Button.md)
  - Dependencies: 1
  - Used in Pages: 2
- [Card](/src/components/Card/Card.md)
  - Dependencies: 1
  - Used in Pages: 1
```

#### Button 元件文檔 (src/components/Button/Button.md)
```markdown
# Button
> File Path: `components/Button/index.tsx`

## Dependency Tree

\```mermaid
flowchart TD
    Button["Button"]
    Icon["Icon"]
    page_home["home"]
    page_about["about"]
    Button --> Icon
    Button --> page_home
    Button --> page_about
\```

## Elements Dependencies
> - **@/elements/Icon**
>   - File: `elements/Icon/index.tsx`
>   - Imports: `Icon`

## Used in Pages
> - `pages/home.tsx`
> - `pages/about.tsx`
```

完整範例程式碼可以在 [examples/react-demo](examples/react-demo) 目錄中找到。

