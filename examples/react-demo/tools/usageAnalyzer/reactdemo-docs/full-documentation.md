# ReactDemo 完整元件文檔

## 目錄

- [Button](#button)
- [Card](#card)
- [Form](#form)
- [Modal](#modal)

---

# Button

> File Path: `src/components/Button/index.tsx`

## Dependency Tree

```mermaid
graph TD
    page_about[Page_about]
    page_home[Page_home]
    Button[Button]
    Icon[Icon]
    Button-->Icon
    page_about-->Button
    page_home-->Button

    %% 樣式定義
    classDef component fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef element fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef page fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef other fill:#fff3e0,stroke:#e65100,stroke-width:1px

    %% 樣式應用
    class Button component
    class Icon element
    class page_about page
    class page_home page
```

## 簡化版本 (如果上面的圖表無法顯示)

```mermaid
graph LR
    Button[Button]
    Icon[Icon]
    Button-->Icon
```

## Elements Dependencies
> - **@/elements/Icon**
>   - File: `src/elements/Icon.tsx`
>   - Imports: `Icon`

## Used in Pages
> - `src/pages/home.tsx`
> - `src/pages/about.tsx`

---

# Card

> File Path: `src/components/Card/index.tsx`

## Dependency Tree

```mermaid
graph TD
    page_about[Page_about]
    page_home[Page_home]
    Button[Button]
    Card[Card]
    Card-->Button
    page_about-->Card
    page_home-->Card

    %% 樣式定義
    classDef component fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef element fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef page fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef other fill:#fff3e0,stroke:#e65100,stroke-width:1px

    %% 樣式應用
    class Button component
    class Card component
    class page_about page
    class page_home page
```

## 簡化版本 (如果上面的圖表無法顯示)

```mermaid
graph LR
    Card[Card]
    Button[Button]
    Card-->Button
```

## Components Dependencies
> - **@/components/Button**
>   - File: `src/components/Button.tsx`
>   - Imports: `Button`

## Used in Pages
> - `src/pages/home.tsx`
> - `src/pages/about.tsx`

---

# Form

> File Path: `src/components/Form/index.tsx`

## Dependency Tree

```mermaid
graph TD
    page_home[Page_home]
    Button[Button]
    Form[Form]
    Modal[Modal]
    Form-->Button
    Form-->Modal
    page_home-->Form

    %% 樣式定義
    classDef component fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef element fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef page fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef other fill:#fff3e0,stroke:#e65100,stroke-width:1px

    %% 樣式應用
    class Button component
    class Form component
    class Modal component
    class page_home page
```

## 簡化版本 (如果上面的圖表無法顯示)

```mermaid
graph LR
    Form[Form]
    Button[Button]
    Modal[Modal]
    Form-->Button
    Form-->Modal
```

## Components Dependencies
> - **@/components/Button**
>   - File: `src/components/Button.tsx`
>   - Imports: `Button`
> - **@/components/Modal**
>   - File: `src/components/Modal.tsx`
>   - Imports: `Modal`

## Used in Pages
> - `src/pages/home.tsx`

---

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

---

