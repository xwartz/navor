import {
  type Dispatch,
  type KeyboardEvent,
  type MouseEvent,
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
}

export interface DataTableColumn {
  key: string
  label: MessageKey
  align?: 'left' | 'right'
  sortable?: boolean
  mobileHidden?: boolean
  sticky?: boolean
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
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection)
  const [isMobile, setIsMobile] = useState(false)
  const [canScroll, setCanScroll] = useState(false)
  const [atScrollEnd, setAtScrollEnd] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

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
    () => columns.filter((column) => !isMobile || !column.mobileHidden),
    [columns, isMobile],
  )

  if (rows.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyMessage ? t(emptyMessage) : null}</p>
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-paper-elevated">
      <div className="overflow-x-auto" ref={scrollRef}>
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="bg-paper">
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
                  className={`border-b border-border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint ${
                    column.sticky
                      ? 'sticky left-0 z-10 bg-paper shadow-[4px_0_8px_rgba(47,43,36,0.06)]'
                      : ''
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
            {sortedRows.map((row) => (
              <tr
                className={`group border-b border-border transition-colors last:border-b-0 [@media(hover:hover)]:hover:bg-paper ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                key={row.id}
                onClick={onRowClick ? (event) => activateRow(event, row, onRowClick) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => activateRowWithKeyboard(event, row, onRowClick)
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
              >
                {visibleColumns.map((column) => (
                  <td
                    className={`px-3 py-2.5 align-middle ${
                      column.sticky
                        ? 'sticky left-0 z-10 bg-paper-elevated shadow-[4px_0_8px_rgba(47,43,36,0.06)] [@media(hover:hover)]:group-hover:bg-paper'
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
            ))}
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

function activateRow(
  event: MouseEvent<HTMLTableRowElement>,
  row: DataTableRow,
  onRowClick: (row: DataTableRow) => void,
) {
  if ((event.target as HTMLElement).closest('button, a, input, label, summary')) return
  onRowClick(row)
}

function activateRowWithKeyboard(
  event: KeyboardEvent<HTMLTableRowElement>,
  row: DataTableRow,
  onRowClick: (row: DataTableRow) => void,
) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  onRowClick(row)
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
