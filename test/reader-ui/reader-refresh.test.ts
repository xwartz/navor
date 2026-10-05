import type { NavorRendererAppState } from '@navor/contract'
import { compileNavorWorkspace } from '@navor/renderer'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  createReaderRefresh,
  type ReaderRefreshResult,
  watchReaderRefresh,
} from '../../packages/reader-ui/src/reader-refresh'
import {
  fetchReaderState,
  isReaderStateRequest,
  readerAssetSources,
} from '../../packages/reader-ui/src/state-delivery'

let baseline: NavorRendererAppState

beforeAll(async () => {
  baseline = await compileNavorWorkspace('fixtures/core', { fetchLivePrices: false })
  baseline.priceManifest.entries = []
})

afterEach(() => vi.useRealTimers())

function newerLedger() {
  const next = structuredClone(baseline)
  const transaction = next.portfolio.transactions[0]
  if (!transaction) throw new Error('Fixture needs a transaction')
  next.portfolio.transactions.unshift({ ...transaction, title: 'New automated fill' })
  return next
}

describe('Reader workspace refresh', () => {
  it('updates the ledger in place, including workspaces without market symbols', async () => {
    const latest = newerLedger()
    const updates: ReaderRefreshResult[] = []
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(latest))
    const controller = createReaderRefresh({
      initialState: baseline,
      source: './navor-data.json',
      fetcher,
      onChange: (result) => updates.push(result),
    })
    await controller.refresh()
    expect(updates.at(-1)?.state?.portfolio.transactions[0]?.title).toBe('New automated fill')
    expect(updates.at(-1)?.loading).toBe(false)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0]?.[0]).toMatch(/navor-data.json\?navor_refresh=/)
    expect(fetcher.mock.calls[0]?.[1]?.cache).toBe('no-store')
    controller.dispose()
  })

  it('uses the new ledger and symbol manifest for the subsequent price request', async () => {
    const latest = newerLedger()
    const subject = baseline.priceManifest.entries[0]?.subject ?? 'Asset:Crypto:BTC'
    latest.priceManifest.entries = [{ subject, symbol: 'BTC', yahooSymbol: 'BTC-USD' }]
    const updates: ReaderRefreshResult[] = []
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(latest))
      .mockResolvedValueOnce(Response.json({ prices: [], failures: [] }))
    const controller = createReaderRefresh({
      initialState: baseline,
      source: './navor-data.json',
      fetcher,
      onChange: (result) => updates.push(result),
    })
    await controller.refresh()
    expect(fetcher.mock.calls[1]?.[0]).toBe('/api/prices')
    expect(JSON.parse(String(fetcher.mock.calls[1]?.[1]?.body))).toEqual({
      entries: [{ subject, yahooSymbol: 'BTC-USD' }],
    })
    expect(updates.at(-1)?.state?.portfolio.transactions[0]?.title).toBe('New automated fill')
    expect(updates.at(-1)?.liveEnabled).toBe(true)
    controller.dispose()
  })

  it('preserves the current ledger on failure and recovers on the next refresh', async () => {
    const updates: ReaderRefreshResult[] = []
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(Response.json(newerLedger()))
    const controller = createReaderRefresh({
      initialState: baseline,
      source: './navor-data.json',
      fetcher,
      onChange: (result) => updates.push(result),
    })
    await controller.refresh()
    expect(updates.at(-1)?.state).toBe(baseline)
    expect(updates.at(-1)?.error).toBe('offline')
    await controller.refresh()
    expect(updates.at(-1)?.state?.portfolio.transactions[0]?.title).toBe('New automated fill')
    expect(updates.at(-1)?.error).toBeNull()
    controller.dispose()
  })

  it('deduplicates overlapping requests and prevents disposed requests from updating React', async () => {
    let resolve!: (response: Response) => void
    const fetcher = vi.fn<typeof fetch>().mockImplementation(
      () =>
        new Promise<Response>((done) => {
          resolve = done
        }),
    )
    const onChange = vi.fn()
    const controller = createReaderRefresh({
      initialState: baseline,
      source: './navor-data.json',
      fetcher,
      onChange,
    })
    const first = controller.refresh()
    expect(controller.refresh()).toBe(first)
    expect(fetcher).toHaveBeenCalledTimes(1)
    controller.dispose()
    const publishedBeforeDispose = onChange.mock.calls.length
    resolve(Response.json(newerLedger()))
    await first
    expect(onChange).toHaveBeenCalledTimes(publishedBeforeDispose)
    expect(fetcher.mock.calls[0]?.[1]?.signal?.aborted).toBe(true)
  })

  it('retains a newly loaded ledger even if its prices fail', async () => {
    const latest = newerLedger()
    latest.priceManifest.entries = [
      { subject: 'Asset:Crypto:BTC', symbol: 'BTC', yahooSymbol: 'BTC-USD' },
    ]
    const updates: ReaderRefreshResult[] = []
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(latest))
      .mockRejectedValueOnce(new Error('quotes unavailable'))
    const controller = createReaderRefresh({
      initialState: baseline,
      source: './navor-data.json',
      fetcher,
      onChange: (result) => updates.push(result),
    })
    await controller.refresh()
    expect(updates.at(-1)?.state?.portfolio.transactions[0]?.title).toBe('New automated fill')
    expect(updates.at(-1)?.error).toBe('quotes unavailable')
    expect(updates.at(-1)?.loading).toBe(false)
    controller.dispose()
  })

  it('does not reset React state for an unchanged ledger', async () => {
    const updates: ReaderRefreshResult[] = []
    const controller = createReaderRefresh({
      initialState: baseline,
      source: './navor-data.json',
      fetcher: vi.fn<typeof fetch>().mockResolvedValue(Response.json(baseline)),
      onChange: (result) => updates.push(result),
    })
    await controller.refresh()
    expect(updates.every((result) => result.state === baseline)).toBe(true)
    controller.dispose()
  })

  it('rejects invalid responses and supports cache-bypassed development requests', async () => {
    await expect(
      fetchReaderState('./navor-data.json', {
        fetcher: vi.fn<typeof fetch>().mockResolvedValue(Response.json({ error: 'bad response' })),
      }),
    ).rejects.toThrow('invalid Reader data')
    expect(isReaderStateRequest('/navor-data.json?navor_refresh=1')).toBe(true)
    expect(isReaderStateRequest('/api/prices?navor_refresh=1')).toBe(false)
  })

  it('checks visible pages on focus, reconnect and timers, and cleans up on unmount', () => {
    vi.useFakeTimers()
    const windowEvents = new EventTarget()
    const documentEvents = Object.assign(new EventTarget(), { visibilityState: 'visible' })
    const target = Object.assign(windowEvents, { setInterval, clearInterval })
    const refresh = vi.fn().mockResolvedValue(undefined)
    const stop = watchReaderRefresh(
      refresh,
      target as unknown as Window,
      documentEvents as unknown as Document,
    )
    windowEvents.dispatchEvent(new Event('focus'))
    documentEvents.dispatchEvent(new Event('visibilitychange'))
    expect(refresh).toHaveBeenCalledTimes(1)
    documentEvents.visibilityState = 'hidden'
    vi.advanceTimersByTime(60000)
    expect(refresh).toHaveBeenCalledTimes(1)
    documentEvents.visibilityState = 'visible'
    documentEvents.dispatchEvent(new Event('visibilitychange'))
    expect(refresh).toHaveBeenCalledTimes(2)
    windowEvents.dispatchEvent(new Event('online'))
    expect(refresh).toHaveBeenCalledTimes(3)
    vi.advanceTimersByTime(60000)
    expect(refresh).toHaveBeenCalledTimes(4)
    stop()
    windowEvents.dispatchEvent(new Event('focus'))
    windowEvents.dispatchEvent(new Event('online'))
    vi.advanceTimersByTime(60000)
    expect(refresh).toHaveBeenCalledTimes(4)
  })
})

it('includes stylesheet versions when deciding whether a Service Worker update needs a reload', () => {
  const documentWithAssets = (script: string, stylesheet: string) =>
    ({
      querySelectorAll: () => [
        { getAttribute: (name: string) => (name === 'src' ? script : null) },
        { getAttribute: (name: string) => (name === 'href' ? stylesheet : null) },
      ],
    }) as unknown as Document
  const current = readerAssetSources(documentWithAssets('/assets/app-a.js', '/assets/style-a.css'))
  expect(readerAssetSources(documentWithAssets('/assets/app-a.js', '/assets/style-a.css'))).toEqual(
    current,
  )
  expect(
    readerAssetSources(documentWithAssets('/assets/app-a.js', '/assets/style-b.css')),
  ).not.toEqual(current)
})
