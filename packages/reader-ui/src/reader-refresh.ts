import type { PriceProxyResponseBody } from '@navor/adapters'
import type { NavorRendererAppState } from '@navor/contract'
import { applyLivePrices } from '@navor/renderer/apply-live-prices'
import { fetchReaderState } from './state-delivery'

export interface ReaderRefreshResult {
  state: NavorRendererAppState | null
  loading: boolean
  error: string | null
  liveEnabled: boolean
}

export function createReaderRefresh(options: {
  initialState: NavorRendererAppState | null
  source: string | null
  onChange: (result: ReaderRefreshResult) => void
  fetcher?: typeof fetch
}) {
  const fetcher = options.fetcher ?? fetch
  const abort = new AbortController()
  let baseState = options.initialState
  let fingerprint = JSON.stringify(baseState)
  let result: ReaderRefreshResult = {
    state: baseState,
    loading: false,
    error: null,
    liveEnabled: false,
  }
  let pending: Promise<void> | null = null

  function publish(next: Partial<ReaderRefreshResult>) {
    if (abort.signal.aborted) return
    result = { ...result, ...next }
    options.onChange(result)
  }

  async function update() {
    publish({ loading: true, error: null })
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(10000)])
    let workspaceError: string | null = null
    if (options.source) {
      try {
        const next = await fetchReaderState(options.source, { fetcher, signal })
        if (abort.signal.aborted) return
        const nextFingerprint = JSON.stringify(next)
        if (nextFingerprint !== fingerprint) {
          baseState = next
          fingerprint = nextFingerprint
          publish({ state: next, liveEnabled: false })
        }
      } catch (error) {
        workspaceError = error instanceof Error ? error.message : String(error)
      }
    }
    if (abort.signal.aborted) return
    if (!baseState) {
      publish({ loading: false, error: workspaceError })
      return
    }

    const entries = baseState.priceManifest.entries.filter((entry) => entry.yahooSymbol)
    if (entries.length === 0) {
      publish({ loading: false, error: workspaceError })
      return
    }

    try {
      const response = await fetcher(baseState.priceManifest.livePricesPath ?? '/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: entries.map((entry) => ({
            subject: entry.subject,
            yahooSymbol: entry.yahooSymbol,
          })),
        }),
        signal,
      })
      if (!response.ok) throw new Error(`Price proxy returned ${response.status}.`)
      const payload = (await response.json()) as PriceProxyResponseBody
      publish({
        state: applyLivePrices(baseState, payload, {
          stalePriceAfterDays: baseState.priceManifest.stalePriceAfterDays,
        }),
        liveEnabled: true,
        error: workspaceError,
      })
    } catch (error) {
      publish({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      publish({ loading: false })
    }
  }

  return {
    refresh(): Promise<void> {
      if (abort.signal.aborted) return Promise.resolve()
      if (!pending) {
        pending = update().finally(() => {
          pending = null
        })
      }
      return pending
    },
    dispose() {
      abort.abort()
    },
  }
}

export function watchReaderRefresh(
  refresh: () => Promise<void>,
  target: Pick<
    Window,
    'addEventListener' | 'removeEventListener' | 'setInterval' | 'clearInterval'
  >,
  document: Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>,
) {
  let lastCheck = -Infinity
  const check = () => {
    if (document.visibilityState !== 'visible' || Date.now() - lastCheck < 5000) return
    lastCheck = Date.now()
    void refresh()
  }
  const online = () => {
    lastCheck = -Infinity
    check()
  }
  target.addEventListener('focus', check)
  target.addEventListener('online', online)
  document.addEventListener('visibilitychange', check)
  const timer = target.setInterval(check, 60000)
  return () => {
    target.removeEventListener('focus', check)
    target.removeEventListener('online', online)
    document.removeEventListener('visibilitychange', check)
    target.clearInterval(timer)
  }
}
