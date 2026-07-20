import { describe, expect, it } from 'vitest'
import {
  formatFxCoverage,
  formatMoney,
  formatPnlCoverageDetail,
  formatQuantityCommodity,
  formatSignedPercent,
  formatTimestamp,
  formatWorkspacePath,
} from '../../packages/reader-ui/src/components/format'

describe('reader formatting', () => {
  it('shows configured FX values instead of a generic coverage label', () => {
    expect(formatFxCoverage({ CNY: 6.8, HKD: 7.84 }, [])).toBe('FX: CNY 6.80 · HKD 7.84')
  })

  it('keeps missing currency coverage visible', () => {
    expect(formatFxCoverage({ CNY: 6.8 }, ['HKD'])).toBe('FX: CNY 6.80 · missing HKD')
  })

  it('does not call converted source currencies unconverted', () => {
    expect(
      formatPnlCoverageDetail({
        hasBaseTotal: true,
        unconvertedCurrencies: [],
        otherCurrencyCount: 2,
      }),
    ).toBe('Realized + unrealized, base converted')
  })

  it('reports only currencies that actually failed conversion', () => {
    expect(
      formatPnlCoverageDetail({
        hasBaseTotal: true,
        unconvertedCurrencies: ['JPY'],
        otherCurrencyCount: 3,
      }),
    ).toBe('1 unconverted currency')
  })

  it('shows workspace source files relative to the workspace root', () => {
    expect(
      formatWorkspacePath(
        '/Users/investor/portfolio',
        '/Users/investor/portfolio/activity/transactions.nav',
      ),
    ).toBe('activity/transactions.nav')
  })

  it('preserves source files that are already relative', () => {
    expect(formatWorkspacePath('/Users/investor/portfolio', 'accounts/main.nav')).toBe(
      'accounts/main.nav',
    )
  })

  it('does not round tiny market prices down to zero', () => {
    expect(formatMoney({ amount: 0.000002375, currency: 'USD' })).toBe('0.000002375 USD')
  })

  it('uses a compact readable timestamp for market tables', () => {
    expect(formatTimestamp('not-a-date')).toBe('not-a-date')
    expect(formatTimestamp(null)).toBe('No timestamp')
  })

  it('keeps digit-leading commodities from blending into quantity', () => {
    const text = formatQuantityCommodity(14431, '1810.HK')

    expect(text.endsWith(' · 1810.HK')).toBe(true)
    // Regression for Portfolio Quantity cells like "14431 1810.HK"
    expect(/\d\s+\d/.test(text)).toBe(false)
    expect(formatQuantityCommodity(635, '0700.HK').endsWith(' · 0700.HK')).toBe(true)
    expect(formatQuantityCommodity(-100, 'AAPL')).toMatch(/^-[\d,]+\s·\sAAPL$/)
  })

  it('formats signed percent drift with an explicit plus for overweight', () => {
    expect(formatSignedPercent(3.2)).toBe('+3.2%')
    expect(formatSignedPercent(-1.5)).toBe('-1.5%')
    expect(formatSignedPercent(0)).toBe('0.0%')
    expect(formatSignedPercent(null)).toBe('Not available')
  })
})
