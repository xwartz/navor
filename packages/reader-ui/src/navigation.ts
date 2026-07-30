import { type ReaderLocale, translateText } from './i18n'
import { getReaderView, READER_VIEW_CATALOG, type ReaderView } from './view-catalog'

export type { ReaderView } from './view-catalog'

export interface NavGroup {
  label: string
  items: Array<{ id: ReaderView; label: string }>
}

export const NAV_GROUPS: NavGroup[] = [
  'Monitor',
  'Portfolio',
  'Investment process',
  'Operations',
].map((label) => ({
  label,
  items: READER_VIEW_CATALOG.filter(
    (view) => view.group === label && view.navigation !== 'hidden',
  ).map(({ id, label }) => ({
    id,
    label,
  })),
}))

export { VIEW_LABELS } from './view-catalog'

export function resolveReaderView(hash: string, fallback: ReaderView): ReaderView {
  const candidate = hash.replace(/^#/, '')
  return READER_VIEW_CATALOG.find((view) => view.route === candidate)?.id ?? fallback
}

export function getReaderRoute(view: ReaderView): string {
  return getReaderView(view).route
}

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
    READER_VIEW_CATALOG.map((view) => [view.id, translateText(view.label, locale)]),
  ) as Record<ReaderView, string>
}
