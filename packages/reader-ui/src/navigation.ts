import { type ReaderLocale, translateText } from './i18n'
import { READER_VIEW_CATALOG, type ReaderView } from './view-catalog'

export type { ReaderView } from './view-catalog'

export interface NavGroup {
  label: string
  items: Array<{ id: ReaderView; label: string }>
}

export const NAV_GROUPS: NavGroup[] = ['Monitor', 'Capital', 'Research', 'System'].map((label) => ({
  label,
  items: READER_VIEW_CATALOG.filter((view) => view.group === label).map(({ id, label }) => ({
    id,
    label,
  })),
}))

export { VIEW_LABELS } from './view-catalog'

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
