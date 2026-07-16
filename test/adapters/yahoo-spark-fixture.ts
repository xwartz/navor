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

    if (!url.includes('/v7/finance/spark')) {
      return new Response('Not Found', { status: 404 })
    }

    const symbols = new URL(url).searchParams.get('symbols')?.split(',') ?? []
    return new Response(JSON.stringify(createYahooSparkResponse(symbols, price)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export function createYahooSpark429Fetch(failuresBeforeSuccess: number, price = 100): typeof fetch {
  let attempts = 0

  return async (input) => {
    const url = String(input)

    if (!url.includes('/v7/finance/spark')) {
      return new Response('Not Found', { status: 404 })
    }

    attempts += 1

    if (attempts <= failuresBeforeSuccess) {
      return new Response('Too Many Requests', { status: 429 })
    }

    const symbols = new URL(url).searchParams.get('symbols')?.split(',') ?? []
    return new Response(JSON.stringify(createYahooSparkResponse(symbols, price)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export function createYahooSpark429UntilSizeFetch(maxBatchSize: number, price = 100): typeof fetch {
  return async (input) => {
    const url = String(input)

    if (!url.includes('/v7/finance/spark')) {
      return new Response('Not Found', { status: 404 })
    }

    const symbols = new URL(url).searchParams.get('symbols')?.split(',') ?? []

    if (symbols.length > maxBatchSize) {
      return new Response('Too Many Requests', { status: 429 })
    }

    return new Response(JSON.stringify(createYahooSparkResponse(symbols, price)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
