# @navor/reader-ui

## 0.6.5

### Patch Changes

- Show realized and unrealized PnL as separate Reader summary metrics.
  - @navor/adapters@0.6.5
  - @navor/contract@0.6.5
  - @navor/core@0.6.5
  - @navor/renderer@0.6.5

## 0.6.4

### Patch Changes

- Refine Reader UI with shared surfaces, section tabs, and typography for consistency across views, and fix sticky table header background mismatch.
  - @navor/contract@0.6.4
  - @navor/core@0.6.4
  - @navor/adapters@0.6.4
  - @navor/renderer@0.6.4

## 0.6.3

### Patch Changes

- @navor/contract@0.6.3
- @navor/core@0.6.3
- @navor/adapters@0.6.3
- @navor/renderer@0.6.3

## 0.6.2

### Patch Changes

- Automatically refresh the Reader when a new PWA version becomes available.
- Updated dependencies
  - @navor/contract@0.6.2
  - @navor/core@0.6.2
  - @navor/adapters@0.6.2
  - @navor/renderer@0.6.2

## 0.6.1

### Patch Changes

- Show human-readable entity titles in filters and tables, and rename Research market evidence labels.
  - @navor/contract@0.6.1
  - @navor/core@0.6.1
  - @navor/adapters@0.6.1
  - @navor/renderer@0.6.1

## 0.6.0

### Minor Changes

- Redesign the Reader around a unified investor workspace, with clearer navigation, actionable filters, asset context, and bilingual investment terminology.

### Patch Changes

- @navor/contract@0.6.0
- @navor/core@0.6.0
- @navor/adapters@0.6.0
- @navor/renderer@0.6.0

## 0.5.5

### Patch Changes

- Add the `nav check` command to validate a workspace and report parser and semantic diagnostics with a non-zero exit code, and fix Reader plan version comparison.
  - @navor/contract@0.5.5
  - @navor/adapters@0.5.5
  - @navor/renderer@0.5.5

## 0.5.4

### Patch Changes

- Refresh the Reader experience with updated terminology, focus handling, and scrolling behavior.
- Updated dependencies
  - @navor/contract@0.5.4
  - @navor/adapters@0.5.4
  - @navor/renderer@0.5.4

## 0.5.3

### Patch Changes

- 722becc: Clarify asset workspace positioning by separating account allocation progress from portfolio drift.
  - @navor/contract@0.5.3
  - @navor/adapters@0.5.3
  - @navor/renderer@0.5.3

## 0.5.2

### Patch Changes

- 7636c92: Improve the asset workspace with localized action guidance, market-status context, and richer position details.
  - @navor/contract@0.5.2
  - @navor/adapters@0.5.2
  - @navor/renderer@0.5.2

## 0.5.1

### Patch Changes

- Keep static-site build dependencies compatible with Cloudflare's frozen pnpm installation.
  - @navor/contract@0.5.1
  - @navor/adapters@0.5.1
  - @navor/renderer@0.5.1

## 0.5.0

### Minor Changes

- Build installable offline Reader sites with a web app manifest, icons, and a Service Worker that precaches the static workspace snapshot without caching live-price requests.

### Patch Changes

- @navor/contract@0.5.0
- @navor/adapters@0.5.0
- @navor/renderer@0.5.0

## 0.4.4

### Patch Changes

- 1a1cbc0: Calculate Portfolio Market mix weights from market values converted to the configured base currency, and exclude values that cannot be converted.
  - @navor/contract@0.4.4
  - @navor/adapters@0.4.4
  - @navor/renderer@0.4.4

## 0.4.3

### Patch Changes

- Use the workspace `option Portfolio:*` subject as the Reader and static-site document title, with a legacy capital fallback.
- Updated dependencies
  - @navor/contract@0.4.3
  - @navor/renderer@0.4.3
  - @navor/adapters@0.4.3

## 0.4.2

### Patch Changes

- Show position PnL in each market price's quote currency while retaining base-currency PnL for portfolio totals and sorting.
- Updated dependencies
  - @navor/contract@0.4.2
  - @navor/adapters@0.4.2
  - @navor/renderer@0.4.2

## 0.4.1

### Patch Changes

- Updated dependencies
  - @navor/renderer@0.4.1
  - @navor/adapters@0.4.1
  - @navor/contract@0.4.1

## 0.4.0

### Minor Changes

- Keep sticky asset cells and the rest of a table row on the same hover background transition.

### Patch Changes

- @navor/adapters@0.4.0
- @navor/renderer@0.4.0
- @navor/contract@0.4.0

## 0.3.2

### Patch Changes

- @navor/contract@0.3.2
- @navor/adapters@0.3.2
- @navor/renderer@0.3.2

## 0.3.1

### Patch Changes

- @navor/contract@0.3.1
- @navor/adapters@0.3.1
- @navor/renderer@0.3.1

## 0.3.0

### Patch Changes

- @navor/contract@0.3.0
- @navor/adapters@0.3.0
- @navor/renderer@0.3.0

## 0.2.0

### Patch Changes

- @navor/contract@0.2.0
- @navor/adapters@0.2.0
- @navor/renderer@0.2.0
