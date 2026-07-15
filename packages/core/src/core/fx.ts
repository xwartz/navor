import type { MoneyAmount } from '../types'

export function parseFxRates(value: string | null | undefined) {
  if (!value?.trim()) {
    return {}
  }

  const rates: Record<string, number> = {}

  for (const segment of value.split(',')) {
    const trimmed = segment.trim()

    if (!trimmed) {
      continue
    }

    const [currency, rawRate] = trimmed.split('=').map((part) => part.trim())

    if (!currency || !rawRate) {
      continue
    }

    const rate = Number(rawRate.replaceAll(',', ''))

    if (!Number.isFinite(rate) || rate <= 0) {
      continue
    }

    rates[currency.toUpperCase()] = rate
  }

  return rates
}

export function convertToBaseCurrency(
  value: MoneyAmount,
  baseCurrency: string,
  fxRates: Record<string, number>,
) {
  if (value.currency === baseCurrency) {
    return value
  }

  const rate = fxRates[value.currency]

  if (!rate) {
    return null
  }

  return {
    amount: value.amount / rate,
    currency: baseCurrency,
  }
}

export function sumInBaseCurrency(
  values: Array<MoneyAmount | null | undefined>,
  baseCurrency: string,
  fxRates: Record<string, number>,
) {
  const unconverted = new Set<string>()
  let total = 0
  let convertedCount = 0

  for (const value of values) {
    if (!value) {
      continue
    }

    const converted = convertToBaseCurrency(value, baseCurrency, fxRates)

    if (!converted) {
      unconverted.add(value.currency)
      continue
    }

    total += converted.amount
    convertedCount += 1
  }

  return {
    total:
      convertedCount > 0 ? ({ amount: total, currency: baseCurrency } satisfies MoneyAmount) : null,
    unconvertedCurrencies: [...unconverted],
  }
}

export function mergeFxRates(...sources: Array<Record<string, number> | null | undefined>) {
  return Object.assign({}, ...sources.filter(Boolean))
}
