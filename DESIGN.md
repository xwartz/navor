# Navor Reader UI

Navor is an open specification for investment state as human-readable documents. The Reader is one implementation: a local and static-site view over your `.nav` repository.

## 1. Visual theme and atmosphere

Navor is an institutional editorial terminal for long-horizon investors. The interface pairs a graphite navigation rail with a warm ledger canvas, restrained pine and amber semantics, and compact information rhythm. It should feel closer to a carefully marked investment memorandum than a generic SaaS dashboard.

## 2. Color palette and roles

- `canvas`: `oklch(0.965 0.006 88)`, warm working surface.
- `surface`: `oklch(0.992 0.003 88)`, primary panels and controls.
- `sidebar`: `oklch(0.205 0.012 165)`, the permanent graphite anchor.
- `ink`: `oklch(0.205 0.012 75)`, primary text and numeric values.
- `muted`: `oklch(0.47 0.012 75)`, secondary explanations.
- `pine`: `oklch(0.48 0.085 158)`, active navigation and constructive financial state.
- `amber`: `oklch(0.62 0.12 72)`, review and target-range attention.
- `red`: `oklch(0.56 0.16 27)`, loss, error, and destructive state only.
- `categorical`: pine, slate, amber, terracotta, plum, and olive, used only to distinguish stable portfolio categories in charts.

## 3. Typography rules

Body and controls use Public Sans with system CJK fallbacks. View titles use the loaded Libre Baskerville face, with Charter, Sitka Text, and Songti SC fallbacks, to give the workspace an editorial voice without reducing data density. Numeric values use the UI face with tabular figures, while identifiers use SF Mono or JetBrains Mono. Display tracking is `-0.022em`, section title tracking is `-0.012em`, and body copy stays at natural tracking.

## 4. Component styling

Buttons use a fixed 4px radius, 40px minimum hit area, a visible pine focus ring, and `scale(0.97)` on press. Panels use a 6px radius, a warm white surface, a quiet one-pixel keyline, and no decorative gradient. Active navigation is indicated by brighter type, a pine status lozenge, and a subtle graphite surface step. Inputs are inset into the toolbar with a warm background and a strong focus keyline.

The Navor mark is a pine field with a white ledger-built `N` and a small amber north marker. The same geometry and colors must be used in the app shell, favicon, and future application icons. Donut charts use stable categorical colors, while semantic pine, amber, and red remain reserved for status. Hover, focus, or selection on either a donut segment or its legend must highlight the same category and update the center label.

## 5. Layout principles

The shell uses a 248px desktop rail and a fluid workspace. Spacing follows a 4, 8, 12, 16, 20, 28, 36 scale. Summary metrics form one continuous decision band with internal rules, while detail panels use a dense 20px grid. Labels align left, numbers align right, and numeric columns always use tabular figures.

Navigation follows four investor tasks rather than source-file taxonomy:

1. Command: current posture, exceptions, and watch items.
2. Portfolio: holdings, allocation, accounts, and ledger activity.
3. Investment process: research, thesis, decisions, reviews, and behavioral journal.
4. Controls: plans, market data, workspace sources, and diagnostics.

The Overview page orders information by decision urgency: portfolio state, open actions, allocation posture, liquidity, recent activity, then contextual evidence. Healthy empty states collapse into a quiet confirmation instead of occupying a full diagnostic panel.

Allocation follows a plan-to-execution hierarchy: account sleeves and capital first, funded-position deviations second, and the complete asset target ledger last. Transaction history shows economic events as compact rows and reveals double-entry postings on demand. Market data combines price, source, freshness, and timestamp in one coverage table before showing downstream valuation and research.

Accounts uses an inline master-detail pattern. Selecting an asset expands its decision brief directly below the row, preserves document scroll and neighboring asset context, and never opens a modal or locks the page. Asset rows use the same elevated surface as other data tables, with a quiet pine selection tint only for the active row.

## 6. Depth and elevation

Depth is created primarily through background steps. The sidebar is the darkest level, canvas is the base level, panels are one lightness step above it, and drawers or menus receive the only elevated shadow. Borders are reserved for tables, divisions, and structural keylines.

## 7. Do and do not

- Do reserve pine, amber, and red for financial meaning.
- Do keep the location of recurring metrics stable between states.
- Do use editorial typography for orientation and sans-serif typography for operation.
- Do prefer ranked bars or bullet charts when comparisons matter.
- Do encode target-versus-actual as two markers joined by a gap, never as progress from zero.
- Do keep the desktop rail pinned to the viewport while the working document scrolls.
- Do use status dots only when they form a legend, timeline, or navigation-state system.
- Do make chart legends keyboard-focusable and keep their active state synchronized with chart geometry.
- Do not introduce purple, cyan, gradients, glass effects, or ornamental shadows.
- Do not turn every data group into an independent floating card.
- Do not hide source identifiers or plan context in safety-sensitive views.
- Do not animate layout, width, height, or numeric position.
- Do not animate analytical charts on initial render. Stable geometry is more valuable than decorative motion.
- Do not repeat the same market input across separate status and value tables.
- Do not reuse semantic status colors as a categorical palette.

## 8. Responsive behavior

At widths below 1024px the rail becomes an off-canvas drawer and the current view button stays in the workspace. At 375px summary metrics form a compact two-by-two decision band, panels lose nonessential outer padding, metadata scrolls horizontally, and tables retain horizontal overflow instead of truncating financial values. Every action remains at least 40px high.

## 9. Agent prompt guide

- Colors: canvas `oklch(0.965 0.006 88)`, surface `oklch(0.992 0.003 88)`, sidebar `oklch(0.205 0.012 165)`, ink `oklch(0.205 0.012 75)`, pine `oklch(0.48 0.085 158)`, amber `oklch(0.62 0.12 72)`, red `oklch(0.56 0.16 27)`.
- Create a portfolio metric band on the canvas, with 12px uppercase labels, 24px weight 650 tabular values, internal one-pixel dividers, 6px outer radius, and no individual card shadows.
- Create a detail panel with a 13px weight 650 heading, 16px horizontal header padding, 12px vertical header padding, a warm white surface, 6px radius, and a one-pixel structural keyline.
- Create a sidebar item on graphite with a 40px minimum height, 4px radius, 13px weight 560 type, pine lozenge active indicator, and a 150ms background and color transition.
- Create a view title in Libre Baskerville at 30px weight 700, line-height 1.08, letter-spacing `-0.022em`, with an 11px uppercase sans-serif eyebrow and a 14px muted description.
