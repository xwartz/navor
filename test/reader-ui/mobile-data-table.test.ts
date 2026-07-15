import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'

const dataTablePath = new URL(
  '../../packages/reader-ui/src/components/DataTable.tsx',
  import.meta.url,
)
const portfolioViewPath = new URL(
  '../../packages/reader-ui/src/views/PortfolioView.tsx',
  import.meta.url,
)
const primaryColumnViews = [
  'AllocationView.tsx',
  'DecisionsView.tsx',
  'MarketView.tsx',
  'PlanView.tsx',
  'ResearchView.tsx',
  'WatchlistView.tsx',
]

test('DataTable supports a focused mobile scrolling and row-action experience', async () => {
  const source = await readFile(dataTablePath, 'utf8')

  expect(source).toContain('mobileHidden?: boolean')
  expect(source).toContain('sticky?: boolean')
  expect(source).toContain('onRowClick?: (row: DataTableRow) => void')
  expect(source).toContain('bg-gradient-to-l')
  expect(source).toContain('activateRowWithKeyboard')
  expect(source).not.toContain('columnSelector')
  expect(source).not.toContain('toggleMobileColumn')
})

test('holdings retain asset, market, and PnL while opening the asset workspace from a row', async () => {
  const source = await readFile(portfolioViewPath, 'utf8')

  expect(source).toContain("{ key: 'asset', label: 'Asset', sortable: true, sticky: true }")
  expect(source).toContain("key: 'quantity', label: 'Quantity', align: 'right', mobileHidden: true")
  expect(source).toContain("{ key: 'market', label: 'Market', align: 'right', sortable: true }")
  expect(source).toContain("{ key: 'pnl', label: 'PnL', align: 'right', sortable: true }")
  expect(source).not.toContain('columnSelector')
  expect(source).toContain('onRowClick={(row) => onOpenAsset(row.id)}')
})

test('every cross-scroll table declares its primary identity column as sticky', async () => {
  const sources = await Promise.all(
    primaryColumnViews.map((view) =>
      readFile(new URL(`../../packages/reader-ui/src/views/${view}`, import.meta.url), 'utf8'),
    ),
  )
  const portfolio = await readFile(portfolioViewPath, 'utf8')

  for (const source of sources) {
    expect(source).toContain('sticky: true')
  }
  expect(portfolio.match(/sticky: true/g)).toHaveLength(4)
})
