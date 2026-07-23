import { type ReaderLocale, translateText } from './i18n'

export type ReaderView =
  | 'workspace'
  | 'overview'
  | 'accounts'
  | 'holdings'
  | 'ledger'
  | 'allocation'
  | 'plan'
  | 'drift'
  | 'watchlist'
  | 'research'
  | 'thesis'
  | 'decisions'
  | 'reviews'
  | 'journal'
  | 'market-data'
  | 'diagnostics'

export interface NavGroup {
  label: string
  items: Array<{ id: ReaderView; label: string }>
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Monitor',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'drift', label: 'Drift' },
      { id: 'watchlist', label: 'Watchlist' },
    ],
  },
  {
    label: 'Capital',
    items: [
      { id: 'holdings', label: 'Holdings' },
      { id: 'allocation', label: 'Allocation' },
      { id: 'accounts', label: 'Accounts' },
      { id: 'ledger', label: 'Ledger' },
    ],
  },
  {
    label: 'Research',
    items: [
      { id: 'research', label: 'Research' },
      { id: 'thesis', label: 'Thesis' },
      { id: 'decisions', label: 'Decisions' },
      { id: 'reviews', label: 'Reviews' },
      { id: 'journal', label: 'Journal' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'plan', label: 'Plan' },
      { id: 'market-data', label: 'Market data' },
      { id: 'workspace', label: 'Workspace' },
      { id: 'diagnostics', label: 'Diagnostics' },
    ],
  },
]

export const VIEW_LABELS = Object.fromEntries(
  NAV_GROUPS.flatMap((group) => group.items.map((item) => [item.id, item.label])),
) as Record<ReaderView, string>

export function getNavGroups(locale: ReaderLocale): NavGroup[] {
  if (locale === 'en') {
    return NAV_GROUPS
  }

  return NAV_GROUPS.map((group) => ({
    ...group,
    label: translateText(group.label, locale),
    items: group.items.map((item) => ({ ...item, label: translateText(item.label, locale) })),
  }))
}

export function getViewLabels(locale: ReaderLocale): Record<ReaderView, string> {
  return Object.fromEntries(
    getNavGroups(locale).flatMap((group) => group.items.map((item) => [item.id, item.label])),
  ) as Record<ReaderView, string>
}
