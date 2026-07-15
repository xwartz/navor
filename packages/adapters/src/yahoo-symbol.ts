export function resolveYahooSymbol({
  subject,
  symbol,
  symbolMap = {},
  market,
  type,
  currency,
}: {
  subject: string
  symbol: string
  symbolMap?: Record<string, string>
  market: string | null
  type: string | null
  currency: string | null
}) {
  return (
    symbolMap[subject] ??
    symbolMap[symbol] ??
    defaultYahooSymbol({ symbol, market, type, currency })
  )
}

function defaultYahooSymbol({
  symbol,
  market,
  type,
  currency,
}: {
  symbol: string
  market: string | null
  type: string | null
  currency: string | null
}) {
  if (symbol.includes('.')) return symbol
  if (market === 'Crypto' || type === 'Crypto') return `${symbol}-${currency ?? 'USD'}`
  return symbol
}
