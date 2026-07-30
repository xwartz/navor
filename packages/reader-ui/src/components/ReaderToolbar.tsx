import { type ReactNode, useEffect, useRef, useState } from 'react'

import { useEntityLabel } from '../EntityLabelContext'
import type { ReaderFilters } from '../filters'
import { hasActiveFilters } from '../filters'
import { t } from '../i18n'
import type { ToolbarContext, ToolbarFacet } from '../toolbar-context'

interface ReaderToolbarProps {
  filters: ReaderFilters
  context: ToolbarContext
  leading?: ReactNode
  resultCount: number | null
  searchScope: 'view' | 'workspace'
  onChange: (filters: ReaderFilters) => void
  onSearchScopeChange: (scope: 'view' | 'workspace') => void
}

export function ReaderToolbar({
  filters,
  context,
  leading,
  resultCount,
  searchScope,
  onChange,
  onSearchScopeChange,
}: ReaderToolbarProps) {
  const active = hasActiveFilters(filters)
  const searchRef = useRef<HTMLInputElement>(null)
  const toolbarRef = useRef<HTMLElement>(null)
  const [openFacet, setOpenFacet] = useState<keyof ReaderFilters | null>(null)

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.key !== '/' || target?.matches('input, textarea, select, [contenteditable]')) return
      event.preventDefault()
      searchRef.current?.focus()
    }

    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  useEffect(() => {
    const closeFacetOnOutsidePointerDown = (event: PointerEvent) => {
      if (toolbarRef.current?.contains(event.target as Node)) return
      setOpenFacet(null)
    }
    const closeFacetOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenFacet(null)
    }

    document.addEventListener('pointerdown', closeFacetOnOutsidePointerDown, true)
    window.addEventListener('keydown', closeFacetOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeFacetOnOutsidePointerDown, true)
      window.removeEventListener('keydown', closeFacetOnEscape)
    }
  }, [])

  return (
    <section
      className="sticky top-0 z-30 border-b border-border bg-paper/95 px-4 py-3 lg:px-7"
      ref={toolbarRef}
    >
      <div className="mx-auto flex w-full max-w-[96rem] min-w-0 flex-wrap items-center gap-2">
        {leading}
        <label className="relative min-w-[11rem] flex-1 lg:max-w-[19rem]">
          <span className="sr-only">
            {t(searchScope === 'workspace' ? 'Search workspace' : 'Search this view')}
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-faint"
          >
            ⌕
          </span>
          <input
            className="h-10 w-full rounded-md border border-border bg-paper-elevated/80 pl-8 pr-10 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] placeholder:text-ink-faint focus:border-accent/70 focus:bg-paper-elevated focus-visible:ring-2 focus-visible:ring-accent/20"
            onChange={(event) => onChange({ ...filters, query: event.target.value || undefined })}
            placeholder={t(searchScope === 'workspace' ? 'Search workspace' : 'Search this view')}
            ref={searchRef}
            type="search"
            value={filters.query ?? ''}
          />
          <kbd className="pointer-events-none absolute inset-y-0 right-3 hidden items-center font-ui text-[11px] text-ink-faint sm:flex">
            /
          </kbd>
        </label>

        {context.mode !== 'brief' ? (
          <button
            aria-label={t(searchScope === 'workspace' ? 'Entire workspace' : 'This view')}
            className="press-scale h-10 shrink-0 rounded-md border border-border bg-paper-elevated px-2.5 text-xs font-semibold text-ink-muted transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-paper [@media(hover:hover)]:hover:text-ink"
            onClick={() => onSearchScopeChange(searchScope === 'workspace' ? 'view' : 'workspace')}
            type="button"
          >
            {t(searchScope === 'workspace' ? 'Entire workspace' : 'This view')}
          </button>
        ) : null}

        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
          {context.facets.map((facet) => (
            <FacetControl
              facet={facet}
              isOpen={openFacet === facet.key}
              key={facet.key}
              onChange={(value) => onChange({ ...filters, [facet.key]: value || undefined })}
              onOpenChange={(open) => setOpenFacet(open ? facet.key : null)}
              value={filters[facet.key] ?? ''}
            />
          ))}
        </div>

        {active ? (
          <button
            className="press-scale h-10 shrink-0 rounded-md px-2.5 text-xs font-semibold text-accent transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-accent-soft"
            onClick={() => onChange({})}
            type="button"
          >
            {t('Clear filters')}
          </button>
        ) : null}

        {resultCount !== null ? (
          <p className="ml-auto shrink-0 text-xs tabular-nums text-ink-faint">
            {resultCount} {t('matching')}
          </p>
        ) : null}
      </div>
    </section>
  )
}

function FacetControl({
  facet,
  isOpen,
  value,
  onChange,
  onOpenChange,
}: {
  facet: ToolbarFacet
  isOpen: boolean
  value: string
  onChange: (value: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const selectedEntity = useEntityLabel(facet.key === 'subject' ? value : null)
  const selectedValue = selectedEntity?.title ?? compactValue(value)
  const selected = value ? `${t(facet.label)} · ${selectedValue}` : t(facet.label)
  const choose = (nextValue: string) => {
    onChange(nextValue)
    onOpenChange(false)
  }

  return (
    <div className="relative shrink-0">
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`press-scale flex h-10 cursor-pointer list-none items-center justify-center rounded-md border px-2.5 text-xs font-semibold leading-none transition-[background-color,color,border-color,transform] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:text-ink [&::-webkit-details-marker]:hidden ${value ? 'border-accent/45 bg-accent-soft text-accent-ink' : 'border-border bg-paper-elevated text-ink-muted [@media(hover:hover)]:hover:bg-paper'}`}
        onClick={() => onOpenChange(!isOpen)}
        type="button"
      >
        <span className="max-w-[10rem] leading-none truncate">{selected}</span>
      </button>
      {isOpen ? (
        <div
          className="absolute left-0 z-40 mt-2 max-h-72 w-56 overflow-y-auto rounded-md border border-border-strong bg-paper-elevated p-1.5 shadow-[0_18px_48px_rgba(17,19,24,0.16)]"
          role="listbox"
        >
          <button
            className="w-full rounded px-2.5 py-2 text-left text-xs text-ink-muted transition-colors [@media(hover:hover)]:hover:bg-paper [@media(hover:hover)]:hover:text-ink"
            onClick={() => choose('')}
            type="button"
          >
            {t('Clear filters')}
          </button>
          {facet.options.map((option) => (
            <FacetOption
              facet={facet}
              key={option}
              onChoose={() => choose(value === option ? '' : option)}
              option={option}
              selected={value === option}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function FacetOption({
  facet,
  option,
  selected,
  onChoose,
}: {
  facet: ToolbarFacet
  option: string
  selected: boolean
  onChoose: () => void
}) {
  const entity = useEntityLabel(facet.key === 'subject' ? option : null)
  const label = entity?.title ?? compactValue(option)

  return (
    <button
      aria-selected={selected}
      className={`mt-0.5 w-full rounded px-2.5 py-2 text-left text-xs transition-colors ${selected ? 'bg-accent-soft font-semibold text-accent-ink' : 'text-ink-muted [@media(hover:hover)]:hover:bg-paper [@media(hover:hover)]:hover:text-ink'}`}
      onClick={onChoose}
      role="option"
      type="button"
    >
      {label}
    </button>
  )
}

function compactValue(value: string) {
  const parts = value.split(':')
  return parts[parts.length - 1] || value
}
