import { App } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AccountTree } from '../../packages/reader-ui/src/components/AccountTree'
import { AssetDetailPanel } from '../../packages/reader-ui/src/components/AssetDetailPanel'

describe('Reader App', () => {
  it('renders routed Fava-like views from compiled app state', async () => {
    const state = await compileNavorWorkspace('fixtures/core', {
      today: '2026-07-08',
      prices: [
        {
          subject: 'Asset:Crypto:BTC',
          price: { amount: 100000, currency: 'USD' },
          provider: 'Fixture',
          asOf: '2026-07-08T00:00:00Z',
        },
      ],
    })

    const html = renderToStaticMarkup(<App state={state} />)
    const researchHtml = renderToStaticMarkup(<App initialView="research" state={state} />)
    const portfolioHtml = renderToStaticMarkup(<App initialView="holdings" state={state} />)
    const allocationHtml = renderToStaticMarkup(<App initialView="allocation" state={state} />)
    const marketHtml = renderToStaticMarkup(<App initialView="market-data" state={state} />)

    expect(html).toContain('Navor Reader')
    expect(html).toContain('Overview')
    expect(html).toContain('Holdings')
    expect(html).toContain('Allocation')
    expect(html).toContain('Plan')
    expect(html).toContain('Drift')
    expect(html).toContain('Market data')
    expect(html).toContain('Diagnostics')
    expect(html).toContain('Portfolio value')
    expect(html).toContain('Holdings + cash')
    expect(html).toContain('Total PnL')
    expect(html).toContain('Recent activity')
    expect(html).toContain('Ledger')
    expect(html).not.toContain('>Filters<')
    expect(portfolioHtml).toContain('Filters')
    expect(portfolioHtml).toContain('Positions')
    expect(portfolioHtml).toContain('By account')
    expect(portfolioHtml).toContain('aria-haspopup="dialog"')
    expect(portfolioHtml).not.toContain('PnL snapshot')
    expect(portfolioHtml).not.toContain('Holdings by account')
    expect(portfolioHtml).toContain('Asset:Crypto:BTC')
    expect(portfolioHtml).toContain('0.451 · BTC')
    expect(portfolioHtml).toContain('Asset:Equity:HK:0700')
    expect(allocationHtml).toContain('Portfolio weight')
    expect(allocationHtml).toContain('13.8%')
    expect(allocationHtml).toContain('Xiaomi')
    expect(researchHtml).toContain('ETF inflow remains strong')
    expect(researchHtml).toContain('aria-label="Open workspace for')
    expect(marketHtml).toContain('Fixture')
  })

  it('renders portfolio view when legacy app state omits realizedPnl', async () => {
    const state = await compileNavorWorkspace('fixtures/core', {
      today: '2026-07-08',
      useDefaultPriceAdapter: false,
    })
    const legacyState = {
      ...state,
      portfolio: {
        cash: state.portfolio.cash,
        diagnostics: state.portfolio.diagnostics,
        expenses: state.portfolio.expenses,
        holdings: state.portfolio.holdings,
        income: state.portfolio.income,
      },
    }

    const portfolioHtml = renderToStaticMarkup(
      <App initialView="holdings" state={legacyState as typeof state} />,
    )

    expect(portfolioHtml).toContain('Realized PnL')
    expect(portfolioHtml).toContain('No realized gains or losses recorded yet.')
  })

  it('presents an asset detail as a decision brief instead of empty metric cards', async () => {
    const state = await compileNavorWorkspace('fixtures/core', {
      today: '2026-07-08',
      useDefaultPriceAdapter: false,
    })
    const asset = state.dashboard.assetExecutions.find((item) => item.status === 'not_started')

    expect(asset).toBeDefined()

    const html = renderToStaticMarkup(
      <AssetDetailPanel onClose={() => undefined} state={state} subject={asset?.subject ?? ''} />,
    )

    expect(html).toContain('Decision brief')
    expect(html).toContain('Not funded')
    expect(html).toContain('No position exists yet')
    expect(html).toContain('Investment context')
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('fixed inset-0')
  })

  it('expands an account asset inline without mounting a modal', async () => {
    const state = await compileNavorWorkspace('fixtures/core', {
      today: '2026-07-08',
      useDefaultPriceAdapter: false,
    })
    const asset = state.dashboard.assetExecutions.find((item) => item.status === 'not_started')

    expect(asset).toBeDefined()

    const html = renderToStaticMarkup(
      <AccountTree
        accounts={state.dashboard.accountExecutions}
        actions={state.dashboard.actionInbox}
        assets={state.dashboard.assetExecutions}
        onSelectAsset={() => undefined}
        renderAssetDetail={(subject) => (
          <AssetDetailPanel
            onClose={() => undefined}
            state={state}
            subject={subject}
            variant="compact"
          />
        )}
        selectedAssetSubject={asset?.subject}
      />,
    )

    expect(html).toContain('aria-expanded="true"')
    expect(html).toMatch(/aria-label="Collapse /)
    expect(html).not.toMatch(/>Collapse</)
    expect(html).toContain('shadow-[inset_3px_0_0_0_var(--color-accent)]')
    expect(html).not.toContain('bg-accent-soft/60')
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('fixed inset-0')
  })
})
