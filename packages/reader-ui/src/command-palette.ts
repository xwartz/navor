import type { NavorRendererAppState } from '@navor/contract'

import { buildEntityLabelIndex, readableEntityTitle, resolveEntityLabel } from './entity-labels'
import { type MessageKey, t } from './i18n'
import { buildSearchHits, type SearchHit } from './search'
import { getReaderView, READER_VIEW_CATALOG, type ReaderView } from './view-catalog'

export type CommandGroup = 'Go to' | 'Assets' | 'Records'

export type CommandTarget = { kind: 'route'; route: string } | { kind: 'asset'; subject: string }

export interface CommandItem {
  id: string
  group: CommandGroup
  title: string
  meta: string
  /** Destination whose icon represents the item; assets and records render their own glyph. */
  icon: ReaderView | null
  keywords: string
  target: CommandTarget
}

export const COMMAND_GROUP_ORDER: CommandGroup[] = ['Go to', 'Assets', 'Records']

const IN_VIEW_SECTIONS: Array<{ parent: ReaderView; route: string; label: MessageKey }> = [
  { parent: 'research', route: 'cases/theses', label: 'Theses' },
  { parent: 'research', route: 'cases/decisions', label: 'Decisions' },
  { parent: 'research', route: 'cases/evidence', label: 'Asset evidence' },
  { parent: 'research', route: 'cases/market', label: 'Market evidence' },
  { parent: 'diagnostics', route: 'health/market', label: 'Market coverage' },
  { parent: 'diagnostics', route: 'health/sources', label: 'Source files' },
]

const IDLE_ASSET_LIMIT = 5
const QUERY_ASSET_LIMIT = 8
const QUERY_RECORD_LIMIT = 6

export function buildCommandItems(
  state: NavorRendererAppState,
  canOpenAsset: (subject: string) => boolean,
): CommandItem[] {
  return [
    ...buildDestinationCommands(),
    ...buildAssetCommands(state, canOpenAsset),
    ...buildRecordCommands(state),
  ]
}

function buildDestinationCommands(): CommandItem[] {
  const views = READER_VIEW_CATALOG.map((view): CommandItem => {
    const parent = view.parent ? getReaderView(view.parent) : null
    const title = parent ? t(view.tabLabel ?? view.label) : t(view.label)

    return {
      id: `view:${view.id}`,
      group: 'Go to',
      title,
      meta: parent ? t(parent.label) : view.tabLabel ? t(view.tabLabel) : '',
      icon: view.parent ?? view.id,
      keywords: [view.route, view.label, view.tabLabel ?? '', ...(view.aliases ?? [])].join(' '),
      target: { kind: 'route', route: view.route },
    }
  })
  const sections = IN_VIEW_SECTIONS.map(
    (section): CommandItem => ({
      id: `section:${section.route}`,
      group: 'Go to',
      title: t(section.label),
      meta: t(getReaderView(section.parent).label),
      icon: section.parent,
      keywords: `${section.route} ${section.label}`,
      target: { kind: 'route', route: section.route },
    }),
  )

  return [...views, ...sections]
}

function buildAssetCommands(
  state: NavorRendererAppState,
  canOpenAsset: (subject: string) => boolean,
): CommandItem[] {
  const labels = buildEntityLabelIndex(state)
  const accountBySubject = new Map(
    state.dashboard.assetExecutions.map((asset) => [asset.subject, asset.account]),
  )
  const valueBySubject = new Map(
    state.drift.entries.map((entry) => [entry.subject, entry.marketValueInBase?.amount ?? 0]),
  )

  return [...labels.values()]
    .filter((label) => label.subject.startsWith('Asset:') && canOpenAsset(label.subject))
    .sort(
      (left, right) =>
        (valueBySubject.get(right.subject) ?? 0) - (valueBySubject.get(left.subject) ?? 0) ||
        left.title.localeCompare(right.title),
    )
    .map((label) => {
      const account = accountBySubject.get(label.subject)
      const accountTitle = account ? resolveEntityLabel(labels, account).title : null

      return {
        id: `asset:${label.subject}`,
        group: 'Assets',
        title: readableEntityTitle(label, label.subject),
        meta: [label.symbol, accountTitle].filter(Boolean).join(' · '),
        icon: null,
        keywords: label.subject,
        target: { kind: 'asset', subject: label.subject },
      }
    })
}

function buildRecordCommands(state: NavorRendererAppState): CommandItem[] {
  return buildSearchHits(state).flatMap((hit): CommandItem[] => {
    const route = recordRoute(hit)
    if (!route) return []

    return [
      {
        id: `record:${hit.id}`,
        group: 'Records',
        title: hit.title,
        meta: hit.meta,
        icon: hit.view,
        keywords: `${hit.subject} ${hit.excerpt}`,
        target: { kind: 'route', route },
      },
    ]
  })
}

function recordRoute(hit: SearchHit) {
  const kind = hit.id.slice(0, hit.id.indexOf(':'))

  switch (kind) {
    case 'thesis':
      return 'cases/theses'
    case 'decision':
      return 'cases/decisions'
    case 'research':
      return hit.subject.startsWith('Market:') ? 'cases/market' : 'cases/evidence'
    case 'review':
      return 'reviews'
    case 'journal':
      return 'reviews/journal'
    case 'watchlist':
      return 'cases/watchlist'
    default:
      return null
  }
}

/**
 * Filters and ranks palette items. An empty query shows sidebar destinations and the
 * largest assets; typing searches every destination, tab, asset, and record.
 */
export function filterCommandItems(items: CommandItem[], query: string): CommandItem[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)

  if (tokens.length === 0) {
    const destinations = items.filter(
      (item) => item.id.startsWith('view:') && !getReaderView(viewIdOf(item)).parent,
    )
    const assets = items.filter((item) => item.group === 'Assets').slice(0, IDLE_ASSET_LIMIT)
    return [...destinations, ...assets]
  }

  const ranked = items
    .map((item) => ({ item, score: scoreCommand(item, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.item)
  const limits: Record<CommandGroup, number> = {
    'Go to': Number.POSITIVE_INFINITY,
    Assets: QUERY_ASSET_LIMIT,
    Records: QUERY_RECORD_LIMIT,
  }
  const counts: Record<CommandGroup, number> = { 'Go to': 0, Assets: 0, Records: 0 }

  return COMMAND_GROUP_ORDER.flatMap((group) =>
    ranked.filter((item) => {
      if (item.group !== group || counts[group] >= limits[group]) return false
      counts[group] += 1
      return true
    }),
  )
}

function viewIdOf(item: CommandItem) {
  return item.id.slice('view:'.length) as ReaderView
}

function scoreCommand(item: CommandItem, tokens: string[]) {
  const title = item.title.toLowerCase()
  const haystack = `${title} ${item.meta} ${item.keywords}`.toLowerCase()
  let score = 0

  for (const token of tokens) {
    if (!haystack.includes(token)) return 0
    score += title.startsWith(token)
      ? 4
      : title.split(/\s+/).some((word) => word.startsWith(token))
        ? 3
        : title.includes(token)
          ? 2
          : 1
  }

  return score
}
