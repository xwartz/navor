import type { ReaderView } from './navigation'
import { resolveReaderView } from './navigation'

export interface ReaderLocation {
  view: ReaderView
  asset: string | null
}

export function readReaderLocation(
  href: string,
  initialView: ReaderView,
  canOpenAsset: (subject: string | null) => boolean,
): ReaderLocation {
  const url = new URL(href)
  const asset = url.searchParams.get('asset')

  return {
    view: resolveReaderView(url.hash, initialView),
    asset: canOpenAsset(asset) ? asset : null,
  }
}

export function updateReaderLocation(href: string, change: Partial<ReaderLocation>): string {
  const url = new URL(href)

  if (change.view) url.hash = change.view
  if ('asset' in change) {
    if (change.asset) url.searchParams.set('asset', change.asset)
    else url.searchParams.delete('asset')
  }

  return `${url.pathname}${url.search}${url.hash}`
}

export function subscribeReaderLocation(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener('hashchange', onChange)

  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener('hashchange', onChange)
  }
}
