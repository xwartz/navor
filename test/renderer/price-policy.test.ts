import { resolvePriceSources } from '@navor/adapters/browser'
import { describe, expect, it } from 'vitest'

describe('price policy', () => {
  it('prefers live prices, then explicit prices, then static prices by subject', () => {
    expect(
      resolvePriceSources({
        staticPrices: [
          {
            subject: 'Asset:Crypto:BTC',
            price: { amount: 1, currency: 'USD' },
            provider: 'Static',
            asOf: '2026-01-01',
          },
        ],
        explicitPrices: [
          {
            subject: 'Asset:Crypto:BTC',
            price: { amount: 2, currency: 'USD' },
            provider: 'Explicit',
            asOf: '2026-01-02',
          },
        ],
        livePrices: [
          {
            subject: 'Asset:Crypto:BTC',
            price: { amount: 3, currency: 'USD' },
            provider: 'Live',
            asOf: '2026-01-03',
          },
        ],
      }),
    ).toEqual([
      {
        subject: 'Asset:Crypto:BTC',
        price: { amount: 3, currency: 'USD' },
        provider: 'Live',
        asOf: '2026-01-03',
      },
    ])
  })
})
