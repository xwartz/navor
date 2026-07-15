import {
  generateAllocation,
  generateDashboard,
  generateDrift,
  generateKnowledgeViews,
  generateMarketView,
  generatePlanViews,
  generateProcessViews,
  getPortfolioOptions,
  loadNavorWorkspace,
} from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('core Navor fixture', () => {
  it('proves the language, Engine, views, workspace loader, and market enrichment work together', async () => {
    const workspace = await loadNavorWorkspace('fixtures/core')
    const dashboard = generateDashboard(workspace.ast, { today: '2026-07-08' })
    const knowledge = generateKnowledgeViews(workspace.ast, { today: '2026-07-08' })
    const process = generateProcessViews(workspace.ast)
    const market = generateMarketView(workspace.ast, {
      prices: [
        {
          subject: 'Asset:Crypto:BTC',
          price: { amount: 100000, currency: 'USD' },
          provider: 'Fixture',
          asOf: '2026-07-08T00:00:00Z',
        },
      ],
    })

    expect(workspace.diagnostics).toEqual([])
    expect(workspace.files).toHaveLength(7)
    expect(dashboard.accounts.map((account) => account.subject)).toEqual([
      'Account:US',
      'Account:Crypto',
      'Account:HKA',
    ])
    expect(dashboard.assets).toHaveLength(34)
    expect(dashboard.assets.find((asset) => asset.subject === 'Asset:Crypto:BTC')).toMatchObject({
      target: 46,
      derivedPortfolioWeight: 13.8,
    })
    expect(
      dashboard.assets.find((asset) => asset.subject === 'Asset:Equity:HK:1810'),
    ).toMatchObject({
      target: 10,
      derivedPortfolioWeight: 4,
    })
    expect(dashboard.holdings).toHaveLength(13)
    const btcHolding = dashboard.holdings.find((holding) => holding.asset === 'Asset:Crypto:BTC')
    expect(btcHolding).toMatchObject({
      asset: 'Asset:Crypto:BTC',
      commodity: 'BTC',
      quantity: 0.45114488,
      cost: { currency: 'USD' },
    })
    expect(btcHolding?.cost?.amount).toBeCloseTo(7000, 4)
    expect(knowledge.research).toHaveLength(2)
    expect(knowledge.theses).toHaveLength(1)
    expect(knowledge.decisions).toHaveLength(1)
    expect(process.watchlist).toEqual([])
    expect(process.reviews).toHaveLength(1)
    expect(process.journal).toHaveLength(1)
    expect(market.research).toEqual([
      {
        date: '2026-07-08',
        subject: 'Market:Crypto',
        title: 'ETF flow remains positive',
        source: 'Market data',
        tags: ['ETF', 'Flow'],
      },
    ])
    expect(market.portfolioValues).toHaveLength(1)
    expect(market.portfolioValues[0]).toMatchObject({
      subject: 'Asset:Crypto:BTC',
      marketValue: { currency: 'USD' },
      cost: { currency: 'USD' },
      pnl: { currency: 'USD' },
    })
    expect(market.portfolioValues[0]?.marketValue.amount).toBeCloseTo(45114.488, 3)
    expect(market.portfolioValues[0]?.cost?.amount).toBeCloseTo(7000, 4)
    expect(market.portfolioValues[0]?.pnl?.amount).toBeCloseTo(38114.488, 3)

    const allocation = generateAllocation(workspace.ast)
    const plan = generatePlanViews(workspace.ast)
    const options = getPortfolioOptions(workspace.ast)
    const drift = generateDrift({
      allocation,
      market,
      plan,
      baseCurrency: options.baseCurrency,
    })

    expect(options.baseCurrency).toBe('USD')
    expect(plan.entries.map((entry) => entry.subject)).toEqual([
      'Account:US',
      'Account:Crypto',
      'Asset:Crypto:BTC',
    ])
    expect(drift.entries.find((entry) => entry.subject === 'Asset:Crypto:BTC')).toMatchObject({
      targetWeight: 25,
      actualWeight: 100,
      status: 'above_max',
    })
  })
})
