# ReactDemo Dependency Tree

```mermaid
graph TD
    page_about[Page_about]
    page_home[Page_home]
    Button[Button]
    Card[Card]
    Form[Form]
    Modal[Modal]
    Icon[Icon]
    Button-->Icon
    Card-->Button
    Form-->Button
    Form-->Modal
    Modal-->Button
    Modal-->Icon
    page_about-->Button
    page_about-->Card
    page_home-->Button
    page_home-->Card
    page_home-->Form
    page_home-->Modal

    %% 樣式定義
    classDef component fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef element fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef page fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef other fill:#fff3e0,stroke:#e65100,stroke-width:1px

    %% 樣式應用
    class Button component
    class Card component
    class Form component
    class Icon element
    class Modal component
    class page_about page
    class page_home page
```

## 簡化版本 (如果上面的圖表無法顯示)

```mermaid
graph LR
    Modal[Modal]
    Button[Button]
    Icon[Icon]
    Form[Form]
    Card[Card]
    Modal-->Button
    Modal-->Icon
    Form-->Button
    Form-->Modal
    Card-->Button
    Button-->Icon
```

```mermaid
graph TD
    A[Enter Chart Definition] --> B(Preview)
    B --> C{decide}
    C --> D[Keep]
    C --> E[Edit Definition]
    E --> B
    D --> F[Save Image and Code]
    F --> B
```