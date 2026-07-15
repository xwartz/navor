# Navor terminology

Shared vocabulary for documentation, implementation, and interface copy. [中文](CONTEXT.zh.md)

| Term | Meaning |
| --- | --- |
| Navor file | A plain-text `.nav` file containing dated investment facts. |
| Directive | One dated record. Navor 0.1 supports `option`, `capital`, `open`, `close`, `plan`, `research`, `thesis`, `decision`, `txn`, `review`, `journal`, and `note`. |
| Subject | A stable identifier such as `Portfolio:Core`, `Account:US`, or `Asset:Equity:US:NVDA`. |
| Metadata | Indented `key: value` attached to one directive. Metadata carries extensible semantics. |
| Body | Indented Markdown enclosed by `---` delimiters. |
| Portfolio | Derived holdings, cash, values, allocation, drift, and PnL. It is output, not primary source. |
| Capital | Investable planning budget. It need not equal live brokerage cash. |
| Account | A top-level allocation sleeve, market boundary, strategy boundary, or cash boundary. |
| Asset | An investable object that can be researched, planned, and transacted. Its `target` is relative to its parent Account. |
| Derived portfolio weight | Whole-portfolio Asset weight derived from Account and Asset targets. Do not store it as a second source fact. |
| Research | Recorded observation, source note, or data summary. |
| Thesis | A falsifiable investment view. |
| Decision | Intended action. It is not executed until a `txn` is recorded. |
| Transaction | Executed financial fact written as `txn` with postings. Asset transactions cover holdings and asset-linked cash flows. Account transactions cover cash events. |
| Review | Periodic or event-driven assessment of an Asset, Account, Thesis, Decision, or Portfolio. |
| Journal | Subjective process record of emotion, discipline, mistakes, or reflection. |
| Engine | The layer that validates facts, derives portfolio state, applies enrichment, and generates views. |
| Workspace | A directory tree of `.nav` files and optional renderer configuration. |
| Reader | The local application that renders a workspace. |
| Static-site compiler | The build path that writes static HTML, assets, and serialized view data. |
| Price adapter | A provider integration for optional prices, FX rates, and market metadata. Its output is not source truth. |

## Usage rules

- Use `Account`, not bucket or category, for a top-level allocation container.
- Use `Asset`, not ticker, for an investable object managed by Navor.
- Use `derived portfolio weight` only for the calculated whole-portfolio value.
- Use `decision` for intent and `txn` only for an executed fact.
- Use `Engine` for semantic computation and `parser` only for text-to-AST work.
- Use `Reader` for the local application and `static-site compiler` for export.
