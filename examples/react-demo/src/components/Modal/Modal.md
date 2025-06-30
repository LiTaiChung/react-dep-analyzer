# Modal

> File Path: `src/components/Modal/index.tsx`

## Dependency Tree

```mermaid
graph TD
    page_home[Page_home]
    Button[Button]
    Modal[Modal]
    Icon[Icon]
    Modal-->Button
    Modal-->Icon
    page_home-->Modal

    %% 樣式定義
    classDef component fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef element fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef page fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef other fill:#fff3e0,stroke:#e65100,stroke-width:1px

    %% 樣式應用
    class Button component
    class Icon element
    class Modal component
    class page_home page
```

## 簡化版本 (如果上面的圖表無法顯示)

```mermaid
graph LR
    Modal[Modal]
    Button[Button]
    Icon[Icon]
    Modal-->Button
    Modal-->Icon
```

## Components Dependencies
> - **@/components/Button**
>   - File: `src/components/Button.tsx`
>   - Imports: `Button`

## Elements Dependencies
> - **@/elements/Icon**
>   - File: `src/elements/Icon.tsx`
>   - Imports: `Icon`

## Used in Pages
> - `src/pages/home.tsx`

