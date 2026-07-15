import { describe, expect, it } from 'vitest'
import {
  convertToBaseCurrency,
  parseFxRates,
  sumInBaseCurrency,
} from '../packages/core/src/core/fx'

describe('fx', () => {
  it('parses fx rate pairs from option metadata', () => {
    expect(parseFxRates('CNY=7.25, HKD=7.80')).toEqual({
      CNY: 7.25,
      HKD: 7.8,
    })
  })

  it('converts foreign currency amounts into base using units-per-base rates', () => {
    expect(convertToBaseCurrency({ amount: 725, currency: 'CNY' }, 'USD', { CNY: 7.25 })).toEqual({
      amount: 100,
      currency: 'USD',
    })
  })

  it('sums mixed currency amounts into one base total', () => {
    expect(
      sumInBaseCurrency(
        [
          { amount: 100, currency: 'USD' },
          { amount: 725, currency: 'CNY' },
        ],
        'USD',
        { CNY: 7.25 },
      ),
    ).toEqual({
      total: { amount: 200, currency: 'USD' },
      unconvertedCurrencies: [],
    })
  })
})
