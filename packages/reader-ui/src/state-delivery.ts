import type { NavorRendererAppState } from '@navor/contract'

export const READER_STATE_SOURCE_ATTRIBUTE = 'data-navor-source'
export const READER_STATE_PATH = './navor-data.json'

export function readerStateSourceFromDocument(document: Document) {
  return document
    .querySelector(`[${READER_STATE_SOURCE_ATTRIBUTE}]`)
    ?.getAttribute(READER_STATE_SOURCE_ATTRIBUTE)
}

export function readerStateDeliveryTag(source = READER_STATE_PATH) {
  return `<script type="application/json" ${READER_STATE_SOURCE_ATTRIBUTE}="${source}"></script>`
}

export function isReaderStateRequest(url: string | undefined) {
  return Boolean(url && new URL(url, 'http://navor.local').pathname === '/navor-data.json')
}

let requestSequence = 0

export async function fetchReaderState(
  source: string,
  options: { fetcher?: typeof fetch; signal?: AbortSignal; fresh?: boolean } = {},
): Promise<NavorRendererAppState> {
  const fresh = options.fresh ?? true
  const separator = source.includes('?') ? '&' : '?'
  const url = fresh
    ? `${source}${separator}navor_refresh=${Date.now()}-${requestSequence++}`
    : source
  const response = await (options.fetcher ?? fetch)(url, {
    cache: fresh ? 'no-store' : 'default',
    signal: options.signal ?? AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(`Workspace refresh returned ${response.status}.`)
  const state = (await response.json()) as NavorRendererAppState
  if (!state?.workspace || !state.portfolio || !Array.isArray(state.priceManifest?.entries)) {
    throw new Error('Workspace refresh returned invalid Reader data.')
  }
  return state
}

export function readerAssetSources(document: Document): string[] {
  return Array.from(
    document.querySelectorAll('script[type="module"][src], link[rel="stylesheet"][href]'),
    (asset) => asset.getAttribute('src') ?? asset.getAttribute('href') ?? '',
  ).sort()
}
