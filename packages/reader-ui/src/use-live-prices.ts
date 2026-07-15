import type { PriceProxyResponseBody } from '@navor/adapters'
import type { NavorRendererAppState } from '@navor/contract'
import { applyLivePrices } from '@navor/renderer/apply-live-prices'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface UseLivePricesResult {
  state: NavorRendererAppState | null
  loading: boolean
  error: string | null
  liveEnabled: boolean
  refresh: () => Promise<void>
}

export function useLivePrices(baseState: NavorRendererAppState | null): UseLivePricesResult {
  const [state, setState] = useState(baseState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [liveEnabled, setLiveEnabled] = useState(false)

  useEffect(() => {
    setState(baseState)
    setLiveEnabled(false)
    setError(null)
  }, [baseState])

  const quoteEntries = useMemo(
    () =>
      baseState?.priceManifest.entries.filter(
        (entry): entry is { subject: string; symbol: string; yahooSymbol: string } =>
          Boolean(entry.yahooSymbol),
      ) ?? [],
    [baseState],
  )

  const refresh = useCallback(async () => {
    if (!baseState || quoteEntries.length === 0) {
      return
    }

    const endpoint = baseState.priceManifest.livePricesPath ?? '/api/prices'
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: quoteEntries.map((entry) => ({
            subject: entry.subject,
            yahooSymbol: entry.yahooSymbol,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Price proxy returned ${response.status}.`)
      }

      const payload = (await response.json()) as PriceProxyResponseBody
      const staticPrices = baseState.market.prices.filter(
        (price) => price.provider === 'WorkspaceStaticPrices',
      )
      const mergedPrices = mergeLivePrices(staticPrices, payload.prices)

      setState(
        applyLivePrices(
          baseState,
          {
            prices: mergedPrices,
            failures: payload.failures,
          },
          {
            stalePriceAfterDays: baseState.priceManifest.stalePriceAfterDays,
          },
        ),
      )
      setLiveEnabled(true)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : String(refreshError))
      setLiveEnabled(false)
    } finally {
      setLoading(false)
    }
  }, [baseState, quoteEntries])

  useEffect(() => {
    if (!baseState || quoteEntries.length === 0) {
      return
    }

    void refresh()
  }, [baseState, quoteEntries, refresh])

  return {
    state,
    loading,
    error,
    liveEnabled,
    refresh,
  }
}

function mergeLivePrices(
  staticPrices: NavorRendererAppState['market']['prices'],
  livePrices: PriceProxyResponseBody['prices'],
) {
  const merged = new Map(livePrices.map((price) => [price.subject, price]))

  for (const price of staticPrices) {
    if (!merged.has(price.subject)) {
      merged.set(price.subject, price)
    }
  }

  return [...merged.values()]
}
