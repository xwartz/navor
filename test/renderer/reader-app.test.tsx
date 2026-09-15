import { App } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AccountTree } from '../../packages/reader-ui/src/components/AccountTree'

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
    const driftHtml = renderToStaticMarkup(<App initialView="drift" state={state} />)
    const allocationHtml = renderToStaticMarkup(<App initialView="allocation" state={state} />)

    expect(html).toContain('Navor Reader')
    expect(html).toContain('Briefing')
    expect(html).toContain('Portfolio')
    expect(html).toContain('Execution plans')
    expect(html).toContain('Actions')
    expect(html).toContain('Data health')
    expect(html).toContain('Portfolio value')
    expect(html).toContain('Holdings + cash')
    expect(html).toContain('Unrealized PnL')
    expect(html).toContain('Realized PnL')
    expect(html).toContain('Open positions')
    expect(html).toContain('Closed positions')
    expect(html).not.toContain('Total PnL')
    expect(html).toContain('Decision queue')
    expect(html).not.toContain('Recent activity')
    expect(html).toContain('Ledger')
    expect(html).not.toContain('>Filters<')
    expect(portfolioHtml).toContain('Search this view')
    expect(portfolioHtml).toContain('Columns')
    expect(portfolioHtml).toContain('Unrealized PnL')
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
    expect(researchHtml).toContain('Market evidence')
    expect(researchHtml).not.toContain('ETF flow remains positive')
    expect(researchHtml).toContain('Case index')
    expect(driftHtml).toContain('Action center')
    expect(driftHtml).not.toContain('>All actions<')
    expect(driftHtml).not.toContain('role="tab"')
  })

  it('renders ledger when legacy app state omits realizedPnl', async () => {
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

    const ledgerHtml = renderToStaticMarkup(
      <App initialView="ledger" state={legacyState as typeof state} />,
    )

    expect(ledgerHtml).toContain('Ledger')
    expect(ledgerHtml).toContain('Transaction history')
  })

  it('keeps account assets as workspace entry points without mounting inline detail', async () => {
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
      />,
    )

    expect(html).toContain(asset?.title ?? asset?.subject ?? '')
    expect(html).not.toContain('aria-expanded')
    expect(html).not.toContain('shadow-[inset_3px_0_0_0_var(--color-accent)]')
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('fixed inset-0')
  })
})
