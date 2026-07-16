import type { NavorPosting } from './types'

export type { NavorPosting }

const POSTING_PATTERN =
  /^(\S+)\s+(-?[\d,]+(?:\.\d+)?)\s+(\S+)(?:\s+@\s+([\d,]+(?:\.\d+)?)\s+(\S+))?$/

export interface ParsedPostingLine {
  account: string
  quantity: string
  commodity: string
  priceAmount: string | null
  priceCurrency: string | null
}

export function parsePostingLine(line: string): ParsedPostingLine | null {
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
    quantity,
    commodity,
    priceAmount: priceAmount ?? null,
    priceCurrency: priceCurrency ?? null,
  }
}

export function parsePosting(line: string): NavorPosting | null {
  const parsed = parsePostingLine(line)

  if (!parsed) {
    return null
  }

  return {
    account: parsed.account,
    quantity: Number(parsed.quantity.replaceAll(',', '')),
    commodity: parsed.commodity,
    price:
      parsed.priceAmount && parsed.priceCurrency
        ? {
            amount: Number(parsed.priceAmount.replaceAll(',', '')),
            currency: parsed.priceCurrency,
          }
        : null,
  }
}
