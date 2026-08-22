import {
  type Dispatch,
  Fragment,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { type MessageKey, t } from '../i18n'

interface DataTableProps {
  columns: DataTableColumn[]
  rows: DataTableRow[]
  emptyMessage?: MessageKey
  defaultSortKey?: string | null
  defaultSortDirection?: 'asc' | 'desc'
  onRowClick?: (row: DataTableRow) => void
  renderExpandedRow?: (row: DataTableRow) => ReactNode
  storageKey?: string
  showTableOptions?: boolean
}

export interface DataTableColumn {
  key: string
  label: MessageKey
  align?: 'left' | 'right'
  sortable?: boolean
  mobileHidden?: boolean
  sticky?: boolean
  hideable?: boolean
  sortValue?: (row: DataTableRow) => string | number
}

export interface DataTableRow {
  id: string
  cells: Record<string, ReactNode>
  sortValues?: Record<string, string | number>
}

export function DataTable({
  columns,
  rows,
  emptyMessage = 'No rows to display.',
  defaultSortKey = null,
  defaultSortDirection = 'asc',
  onRowClick,
  renderExpandedRow,
  storageKey,
  showTableOptions = columns.length > 3,
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection)
  const [isMobile, setIsMobile] = useState(false)
  const [canScroll, setCanScroll] = useState(false)
  const [atScrollEnd, setAtScrollEnd] = useState(false)
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable')
  const [visibleKeys, setVisibleKeys] = useState(() => new Set(columns.map((column) => column.key)))
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(() => new Set())
  const [hasRestoredOptions, setHasRestoredOptions] = useState(!storageKey)
  const scrollRef = useRef<HTMLDivElement>(null)
  const restoredStorageKeyRef = useRef<string | null>(null)

  const sortedRows = useMemo(() => {
    if (!sortKey) {
      return rows
    }

    const column = columns.find((entry) => entry.key === sortKey)

    return [...rows].sort((left, right) => {
      const leftValue = column?.sortValue?.(left) ?? left.sortValues?.[sortKey] ?? ''
      const rightValue = column?.sortValue?.(right) ?? right.sortValues?.[sortKey] ?? ''

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return sortDirection === 'asc' ? leftValue - rightValue : rightValue - leftValue
      }

      return sortDirection === 'asc'
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue))
    })
  }, [columns, rows, sortDirection, sortKey])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)')
    const sync = () => setIsMobile(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const sync = () => {
      setCanScroll(scrollContainer.scrollWidth > scrollContainer.clientWidth + 1)
      setAtScrollEnd(
        scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 1,
      )
    }

    sync()
    scrollContainer.addEventListener('scroll', sync, { passive: true })
    const observer = 'ResizeObserver' in window ? new ResizeObserver(sync) : null
    observer?.observe(scrollContainer)
    if (scrollContainer.firstElementChild) observer?.observe(scrollContainer.firstElementChild)

    return () => {
      scrollContainer.removeEventListener('scroll', sync)
      observer?.disconnect()
    }
  }, [])

  const visibleColumns = useMemo(
    () =>
      columns.filter(
        (column) => visibleKeys.has(column.key) && (!isMobile || !column.mobileHidden),
      ),
    [columns, isMobile, visibleKeys],
  )

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return
    if (restoredStorageKeyRef.current === storageKey) return
    restoredStorageKeyRef.current = storageKey
    const saved = window.localStorage.getItem(`navor:table:${storageKey}`)
    if (!saved) {
      setHasRestoredOptions(true)
      return
    }
    try {
      const parsed = JSON.parse(saved) as {
        density?: 'compact' | 'comfortable'
        visibleKeys?: string[]
      }
      if (parsed.density === 'compact' || parsed.density === 'comfortable')
        setDensity(parsed.density)
      if (Array.isArray(parsed.visibleKeys)) {
        const available = new Set(columns.map((column) => column.key))
        const next = parsed.visibleKeys.filter((key) => available.has(key))
        if (next.length > 0) setVisibleKeys(new Set(next))
      }
    } catch {
      window.localStorage.removeItem(`navor:table:${storageKey}`)
    }
    setHasRestoredOptions(true)
  }, [columns, storageKey])

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined' || !hasRestoredOptions) return
    window.localStorage.setItem(
      `navor:table:${storageKey}`,
      JSON.stringify({ density, visibleKeys: [...visibleKeys] }),
    )
  }, [density, hasRestoredOptions, storageKey, visibleKeys])

  if (rows.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyMessage ? t(emptyMessage) : null}</p>
  }

  return (
    <div className="surface-card relative">
      {showTableOptions ? (
        <div className="flex items-center justify-between border-b border-border/60 bg-paper-subtle/40 px-4 py-2.5">
          <span className="label-caps">
            {rows.length} {t('records')}
          </span>
          <details className="group relative">
            <summary className="control-btn press-scale flex h-8 cursor-pointer list-none items-center gap-1.5 px-2 text-[11px] font-semibold text-ink-muted marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [&::-webkit-details-marker]:hidden">
              <span>{t('Columns')}</span>
              <span
                aria-hidden
                className="text-ink-faint transition-transform duration-150 group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <div className="dropdown-panel absolute right-0 z-20 mt-2 w-52 p-2">
              <p className="label-caps px-2 py-1">{t('Table options')}</p>
              <button
                aria-pressed={density === 'compact'}
                className={`mt-1 w-full rounded px-2 py-2 text-left text-xs transition-colors ${density === 'compact' ? 'bg-accent-soft font-semibold text-accent-ink' : 'text-ink-muted [@media(hover:hover)]:hover:bg-paper [@media(hover:hover)]:hover:text-ink'}`}
                onClick={() => setDensity('compact')}
                type="button"
              >
                {t('Compact rows')}
              </button>
              <button
                aria-pressed={density === 'comfortable'}
                className={`w-full rounded px-2 py-2 text-left text-xs transition-colors ${density === 'comfortable' ? 'bg-accent-soft font-semibold text-accent-ink' : 'text-ink-muted [@media(hover:hover)]:hover:bg-paper [@media(hover:hover)]:hover:text-ink'}`}
                onClick={() => setDensity('comfortable')}
                type="button"
              >
                {t('Comfortable rows')}
              </button>
              <div className="my-2 border-t border-border" />
              {columns.map((column) => (
                <label
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-ink-muted [@media(hover:hover)]:hover:bg-paper"
                  key={column.key}
                >
                  <input
                    checked={visibleKeys.has(column.key)}
                    disabled={column.hideable === false}
                    onChange={() =>
                      setVisibleKeys((current) => {
                        if (column.hideable === false) return current
                        const next = new Set(current)
                        if (next.has(column.key) && next.size > 1) next.delete(column.key)
                        else next.add(column.key)
                        return next
                      })
                    }
                    type="checkbox"
                  />
                  <span>{t(column.label)}</span>
                </label>
              ))}
            </div>
          </details>
        </div>
      ) : null}
      <div className="overflow-x-auto" ref={scrollRef}>
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th
                  aria-sort={
                    column.sortable
                      ? sortKey === column.key
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                      : undefined
                  }
                  className={`border-b border-border/60 bg-paper-subtle/50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint ${
                    column.sticky ? 'sticky left-0 z-10 shadow-[4px_0_8px_oklch(0_0_0/0.06)]' : ''
                  } ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                  key={column.key}
                >
                  {column.sortable ? (
                    <button
                      className={`inline-flex min-h-8 w-full items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:text-ink ${
                        column.align === 'right'
                          ? 'justify-end text-right'
                          : 'justify-start text-left'
                      }`}
                      onClick={() => toggleSort(column.key, setSortKey, setSortDirection, sortKey)}
                      type="button"
                    >
                      <span>{t(column.label)}</span>
                      <span
                        aria-hidden
                        className="text-[10px] normal-case tracking-normal text-ink-faint"
                      >
                        {sortKey === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  ) : (
                    t(column.label)
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const expanded = expandedRowIds.has(row.id)
              const interactive = Boolean(onRowClick || renderExpandedRow)
              return (
                <Fragment key={row.id}>
                  <tr
                    aria-expanded={renderExpandedRow ? expanded : undefined}
                    className={`group border-b border-border/50 transition-colors ${interactive ? 'cursor-pointer' : ''}`}
                    onClick={
                      interactive
                        ? (event) => {
                            if (
                              (event.target as HTMLElement).closest(
                                'button, a, input, label, summary',
                              )
                            )
                              return
                            if (renderExpandedRow) {
                              setExpandedRowIds((current) => {
                                const next = new Set(current)
                                if (next.has(row.id)) next.delete(row.id)
                                else next.add(row.id)
                                return next
                              })
                              return
                            }
                            onRowClick?.(row)
                          }
                        : undefined
                    }
                    onKeyDown={
                      interactive
                        ? (event) => {
                            if (event.key !== 'Enter' && event.key !== ' ') return
                            event.preventDefault()
                            if (renderExpandedRow) {
                              setExpandedRowIds((current) => {
                                const next = new Set(current)
                                if (next.has(row.id)) next.delete(row.id)
                                else next.add(row.id)
                                return next
                              })
                              return
                            }
                            onRowClick?.(row)
                          }
                        : undefined
                    }
                    tabIndex={interactive ? 0 : undefined}
                  >
                    {visibleColumns.map((column) => (
                      <td
                        className={`px-4 ${density === 'compact' ? 'py-2' : 'py-3.5'} align-middle transition-[background-color] [@media(hover:hover)]:group-hover:bg-paper-subtle/60 ${
                          column.sticky
                            ? 'sticky left-0 z-10 bg-paper-elevated shadow-[4px_0_8px_oklch(0_0_0/0.06)]'
                            : ''
                        } ${
                          column.align === 'right'
                            ? 'whitespace-nowrap text-right font-medium tabular-nums text-ink'
                            : 'text-left text-ink-muted'
                        }`}
                        key={column.key}
                      >
                        {row.cells[column.key]}
                      </td>
                    ))}
                  </tr>
                  {renderExpandedRow && expanded ? (
                    <tr className="border-b border-border bg-paper">
                      <td className="px-3 py-3" colSpan={visibleColumns.length}>
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      {canScroll && !atScrollEnd ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-12 items-center justify-end bg-gradient-to-l from-paper-elevated via-paper-elevated/85 to-transparent pr-1 text-sm text-ink-faint sm:hidden"
        >
          →
        </div>
      ) : null}
    </div>
  )
}

function toggleSort(
  key: string,
  setSortKey: (value: string | null) => void,
  setSortDirection: Dispatch<SetStateAction<'asc' | 'desc'>>,
  currentKey: string | null,
) {
  if (currentKey === key) {
    setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    return
  }

  setSortKey(key)
  setSortDirection('asc')
}
