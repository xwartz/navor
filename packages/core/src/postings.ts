import type { NavorPosting } from './types'

export type { NavorPosting }

const POSTING_PATTERN =
  /^(\S+)\s+(-?[\d,]+(?:\.\d+)?)\s+(\S+)(?:\s+@\s+([\d,]+(?:\.\d+)?)\s+(\S+))?$/

export function parsePosting(line: string): NavorPosting | null {
  const match = line.trim().match(POSTING_PATTERN)

  if (!match) {
    return null
  }

  const [, account, quantity, commodity, priceAmount, priceCurrency] = match

  if (account === undefined || quantity === undefined || commodity === undefined) {
    return null
  }

  return {
    account,
    quantity: Number(quantity.replaceAll(',', '')),
    commodity,
    price:
      priceAmount && priceCurrency
        ? {
            amount: Number(priceAmount.replaceAll(',', '')),
            currency: priceCurrency,
          }
        : null,
  }
}
