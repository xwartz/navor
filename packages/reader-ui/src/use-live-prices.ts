import type { NavorRendererAppState } from '@navor/contract'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createReaderRefresh, type ReaderRefreshResult, watchReaderRefresh } from './reader-refresh'
import { readerStateSourceFromDocument } from './state-delivery'

export interface UseLivePricesResult extends ReaderRefreshResult {
  refresh: () => Promise<void>
}

export function useLivePrices(baseState: NavorRendererAppState | null): UseLivePricesResult {
  const controller = useRef<ReturnType<typeof createReaderRefresh> | null>(null)
  const [result, setResult] = useState<ReaderRefreshResult>({
    state: baseState,
    loading: false,
    error: null,
    liveEnabled: false,
  })

  useEffect(() => {
    const active = createReaderRefresh({
      initialState: baseState,
      source: readerStateSourceFromDocument(document) ?? null,
      onChange: setResult,
    })
    controller.current = active
    setResult({ state: baseState, loading: false, error: null, liveEnabled: false })
    const stopWatching = watchReaderRefresh(() => active.refresh(), window, document)
    void active.refresh()
    return () => {
      stopWatching()
      active.dispose()
      controller.current = null
    }
  }, [baseState])

  const refresh = useCallback(() => controller.current?.refresh() ?? Promise.resolve(), [])
  return { ...result, refresh }
}
