export function createYahooSparkResponse(symbols: string[], price = 100) {
  return {
    spark: {
      result: symbols.map((symbol) => ({
        symbol,
        response: [
          {
            meta: {
              regularMarketPrice: price,
              currency: 'USD',
              regularMarketTime: 1_752_000_000,
            },
          },
        ],
      })),
    },
  }
}

export function createYahooSparkFetch(price = 100): typeof fetch {
  return async (input) => {
    const url = String(input)
    const symbols = new URL(url).searchParams.get('symbols')?.split(',') ?? []

    return new Response(JSON.stringify(createYahooSparkResponse(symbols, price)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
