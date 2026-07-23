import type { NavorRendererAppState } from '@navor/contract'

import { useAssetWorkspace } from '../asset-workspace-context'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { formatSearchResultCount, readerLocale, t } from '../i18n'
import type { ReaderView } from '../navigation'
import { getViewLabels } from '../navigation'
import { buildSearchHits } from '../search'

interface SearchOverviewProps {
  state: NavorRendererAppState
  filters: ReaderFilters
  onSelectView: (view: ReaderView) => void
}

export function SearchOverview({ state, filters, onSelectView }: SearchOverviewProps) {
  const { canOpenAsset, openAsset } = useAssetWorkspace()
  const hits = buildSearchHits(state).filter((hit) =>
    matchesFilters(
      {
        title: hit.title,
        meta: hit.meta,
        excerpt: hit.excerpt,
        view: hit.view,
      },
      filters,
    ),
  )

  if (hits.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-paper-elevated p-5">
        <h1
          className="text-lg font-bold text-ink outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-accent/35"
          tabIndex={-1}
        >
          {t('No matches')}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {t('Try a broader query or remove one of the subject, tag, or date filters.')}
        </p>
      </section>
    )
  }

  const grouped = groupHits(hits)

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-border bg-paper-elevated p-5">
        <h1
          className="text-lg font-bold text-ink outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-accent/35"
          tabIndex={-1}
        >
          {t('Search results')}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">{formatSearchResultCount(hits.length)}</p>
      </div>

      {grouped.map(([view, viewHits]) => (
        <section className="rounded-lg border border-border bg-paper-elevated" key={view}>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h4 className="font-semibold text-ink">{getViewLabels(readerLocale)[view]}</h4>
            <button
              className="text-sm font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:underline"
              onClick={() => onSelectView(view)}
              type="button"
            >
              {t('Open view')}
            </button>
          </div>
          <ul className="divide-y divide-border">
            {viewHits.map((hit) => (
              <li key={hit.id}>
                <button
                  aria-haspopup={canOpenAsset(hit.subject) ? 'dialog' : undefined}
                  className="flex w-full flex-col gap-1 px-5 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-paper"
                  onClick={() => {
                    onSelectView(hit.view)
                    if (canOpenAsset(hit.subject)) {
                      openAsset(hit.subject)
                    }
                  }}
                  type="button"
                >
                  <span className="font-medium text-ink">{hit.title}</span>
                  <span className="text-xs text-ink-faint">{hit.meta}</span>
                  {hit.excerpt ? (
                    <span className="line-clamp-2 text-sm text-ink-muted">{hit.excerpt}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  )
}

function groupHits(hits: ReturnType<typeof buildSearchHits>) {
  const groups = new Map<ReaderView, ReturnType<typeof buildSearchHits>>()

  for (const hit of hits) {
    const existing = groups.get(hit.view) ?? []
    existing.push(hit)
    groups.set(hit.view, existing)
  }

  return [...groups.entries()]
}
