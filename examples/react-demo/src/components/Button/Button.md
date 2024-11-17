# Button

> File Path: `src/components/Button/index.tsx`

## Dependency Tree

```mermaid
flowchart TD
    %% 樣式定義
    classDef component fill:#f9f,stroke:#333,stroke-width:2px,color:#000,font-weight:bold
    classDef element fill:#bbf,stroke:#333,stroke-width:2px,color:#000,font-weight:bold
    classDef page fill:#bfb,stroke:#333,stroke-width:2px,color:#000,font-weight:bold
    classDef other fill:#fff,stroke:#333,stroke-width:1px,color:#000

    Button["Button"]
    class Button component
    Icon["Icon"]
    class Icon element
    Button --> Icon
    page_home["home"]
    Button --> page_home
    class page_home page
    page_about["about"]
    Button --> page_about
    class page_about page
```

## Elements Dependencies
> - **@/elements/Icon**
>   - File: `src/elements/Icon.tsx`
>   - Imports: `Icon`

## Used in Pages
> - `src/pages/home.tsx`
> - `src/pages/about.tsx`

