import type { MoneyAmount } from '../types'

export function parseList(value: string | null): string[] {
  return value ? value.split(',').map((item) => item.trim()) : []
}

export function parsePercent(value: string | null): number | null {
  if (!value?.endsWith('%')) {
    return null
  }

  const parsed = Number(value.slice(0, -1).replaceAll(',', ''))
  return Number.isFinite(parsed) ? parsed : null
}

export function parseMoney(value: string | null): MoneyAmount | null {
  const match = value?.match(/^([0-9][0-9,]*(?:\.[0-9]+)?)\s+([A-Z]{3})$/)

  if (!match) {
    return null
  }

  const [, amount, currency] = match

  if (amount === undefined || currency === undefined) {
    return null
  }

  const parsedAmount = Number(amount.replaceAll(',', ''))

  if (!Number.isFinite(parsedAmount)) {
    return null
  }

  return {
    amount: parsedAmount,
    currency,
  }
}
