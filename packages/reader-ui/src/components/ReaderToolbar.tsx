import { type ReactNode, useEffect, useRef } from 'react'

import type { ReaderFilters } from '../filters'
import { hasActiveFilters } from '../filters'
import { t } from '../i18n'

interface ReaderToolbarProps {
  filters: ReaderFilters
  filtersEnabled: boolean
  leading?: ReactNode
  resultCount: number | null
  onChange: (filters: ReaderFilters) => void
}

export function ReaderToolbar({
  filters,
  filtersEnabled,
  leading,
  resultCount,
  onChange,
}: ReaderToolbarProps) {
  const active = hasActiveFilters(filters)
  const activeCount = Object.values(filters).filter(Boolean).length
  const searchRef = useRef<HTMLInputElement>(null)
  const filtersRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null

      if (event.key !== '/' || target?.matches('input, textarea, select, [contenteditable]')) {
        return
      }

      event.preventDefault()
      searchRef.current?.focus()
    }

    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  useEffect(() => {
    const closeFilters = (event: PointerEvent | KeyboardEvent) => {
      const details = filtersRef.current

      if (!details?.open) {
        return
      }

      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        details.removeAttribute('open')
        details.querySelector('summary')?.focus()
        return
      }

      if (event instanceof PointerEvent && !details.contains(event.target as Node)) {
        details.removeAttribute('open')
      }
    }

    document.addEventListener('pointerdown', closeFilters)
    document.addEventListener('keydown', closeFilters)
    return () => {
      document.removeEventListener('pointerdown', closeFilters)
      document.removeEventListener('keydown', closeFilters)
    }
  }, [])

  return (
    <section className="sticky top-0 z-30 border-b border-border bg-paper-elevated px-4 py-2.5 lg:px-6">
      <div className="flex items-center gap-2.5">
        {leading}
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t('Search workspace')}</span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-faint"
          >
            ⌕
          </span>
          <input
            className="h-10 w-full rounded-md border border-border bg-paper pl-8 pr-14 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] focus:border-accent/60 focus:bg-paper-elevated focus-visible:ring-2 focus-visible:ring-accent/20"
            onChange={(event) => onChange({ ...filters, query: event.target.value || undefined })}
            placeholder={t('Search workspace')}
            ref={searchRef}
            type="search"
            value={filters.query ?? ''}
          />
          <kbd className="pointer-events-none absolute inset-y-0 right-3 hidden items-center font-ui text-[11px] text-ink-faint sm:flex">
            /
          </kbd>
        </label>

        {filtersEnabled ? (
          <details className="group relative shrink-0" ref={filtersRef}>
            <summary className="press-scale flex h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-border bg-paper px-3 text-xs font-semibold text-ink-muted transition-[background-color,color,border-color,transform] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 [@media(hover:hover)]:hover:border-border-strong [@media(hover:hover)]:hover:text-ink [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                {t('Filters')}
                {activeCount > 0 ? (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] tabular-nums text-paper-elevated">
                    {activeCount}
                  </span>
                ) : null}
                <span
                  aria-hidden
                  className="text-ink-faint transition-transform duration-150 group-open:rotate-180"
                >
                  ▾
                </span>
              </span>
            </summary>
            <div className="absolute right-0 z-40 mt-2 w-[min(25rem,calc(100vw-2rem))] rounded-lg bg-paper-elevated p-4 shadow-[0_18px_48px_rgba(34,31,26,0.18)] ring-1 ring-border-strong/70">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{t('Refine workspace')}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {t('Filters apply to the current view.')}
                  </p>
                </div>
                {active ? (
                  <button
                    className="h-10 rounded-md px-3 text-xs font-semibold text-accent transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 [@media(hover:hover)]:hover:bg-accent-soft"
                    onClick={() => onChange({})}
                    type="button"
                  >
                    {t('Clear all')}
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3">
                <FilterField
                  label={t('Subject')}
                  onChange={(value) => onChange({ ...filters, subject: value || undefined })}
                  placeholder="Asset:Crypto:BTC"
                  value={filters.subject ?? ''}
                />
                <FilterField
                  label={t('Tag')}
                  onChange={(value) => onChange({ ...filters, tag: value || undefined })}
                  placeholder="ETF"
                  value={filters.tag ?? ''}
                />
                <FilterField
                  label={t('Date')}
                  onChange={(value) => onChange({ ...filters, date: value || undefined })}
                  placeholder="2026-02"
                  value={filters.date ?? ''}
                />
              </div>
              {active && resultCount !== null ? (
                <p className="mt-3 text-xs text-ink-muted">
                  {resultCount} {t('matching')} {resultCount === 1 ? t('record') : t('records')}{' '}
                  {t('in this view')}
                </p>
              ) : null}
            </div>
          </details>
        ) : null}
      </div>
    </section>
  )
}

function FilterField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </span>
      <input
        className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] focus:border-accent/60 focus:bg-paper-elevated focus-visible:ring-2 focus-visible:ring-accent/20"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </label>
  )
}
