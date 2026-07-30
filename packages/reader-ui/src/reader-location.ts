import type { ReaderView } from './navigation'
import { getReaderRoute, resolveReaderView } from './navigation'
import type { HealthTab } from './views/DiagnosticsView'
import type { CaseTab } from './views/ResearchView'

export interface ReaderLocation {
  view: ReaderView
  asset: string | null
  caseTab: CaseTab
  healthTab: HealthTab
}

export function readReaderLocation(
  href: string,
  initialView: ReaderView,
  canOpenAsset: (subject: string | null) => boolean,
): ReaderLocation {
  const url = new URL(href)
  const asset = url.searchParams.get('asset')
  const route = url.hash.replace(/^#/, '')
  const [root, section] = route.split('/')
  const view =
    root === 'cases'
      ? 'research'
      : root === 'health'
        ? 'diagnostics'
        : resolveReaderView(url.hash, initialView)

  return {
    view,
    asset: canOpenAsset(asset) ? asset : null,
    caseTab: isCaseTab(section) ? section : 'cases',
    healthTab: isHealthTab(section) ? section : 'issues',
  }
}

export function updateReaderLocation(href: string, change: Partial<ReaderLocation>): string {
  const url = new URL(href)

  const view = change.view ?? readReaderLocation(href, 'overview', () => false).view
  const caseTab = change.caseTab ?? 'cases'
  const healthTab = change.healthTab ?? 'issues'

  if (change.view || 'caseTab' in change || 'healthTab' in change) {
    const route = getReaderRoute(view)
    url.hash =
      view === 'research' && caseTab !== 'cases'
        ? `${route}/${caseTab}`
        : view === 'diagnostics' && healthTab !== 'issues'
          ? `${route}/${healthTab}`
          : route
  }
  if ('asset' in change) {
    if (change.asset) url.searchParams.set('asset', change.asset)
    else url.searchParams.delete('asset')
  }

  return `${url.pathname}${url.search}${url.hash}`
}

function isCaseTab(value: string | undefined): value is CaseTab {
  return value === 'market' || value === 'evidence' || value === 'theses' || value === 'decisions'
}

function isHealthTab(value: string | undefined): value is HealthTab {
  return value === 'market' || value === 'sources'
}

export function subscribeReaderLocation(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener('hashchange', onChange)

  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener('hashchange', onChange)
  }
}
