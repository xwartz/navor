import { type ReactNode, type RefObject, useCallback, useEffect, useRef, useState } from 'react'

import { t } from '../i18n'
import type { NavGroup, ReaderView } from '../navigation'
import { BrandMark } from './BrandMark'

interface SidebarProps {
  activeView: ReaderView
  onSelect: (view: ReaderView) => void
  diagnosticCount: number
  isCollapsed: boolean
  isOpen: boolean
  navGroups: NavGroup[]
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
  onToggleCollapse: () => void
}

export function Sidebar({
  activeView,
  onSelect,
  diagnosticCount,
  isCollapsed,
  isOpen,
  navGroups,
  onClose,
  triggerRef,
  onToggleCollapse,
}: SidebarProps) {
  const asideRef = useRef<HTMLElement>(null)
  const [isDesktop, setIsDesktop] = useState(true)
  const drawerHidden = !isDesktop && !isOpen
  const isRail = isCollapsed

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const sync = () => setIsDesktop(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const closeDrawer = useCallback(() => {
    onClose()
    triggerRef.current?.focus()
  }, [onClose, triggerRef])

  useEffect(() => {
    if (isDesktop || !isOpen) {
      return
    }

    const aside = asideRef.current
    const focusable = aside?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable?.item(0)
    const last = focusable?.item((focusable?.length ?? 1) - 1)

    aside?.querySelector<HTMLElement>('[aria-current="page"]')?.focus()

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDrawer()
        return
      }

      if (event.key !== 'Tab' || !first || !last) {
        return
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    aside?.addEventListener('keydown', trapFocus)
    return () => aside?.removeEventListener('keydown', trapFocus)
  }, [closeDrawer, isDesktop, isOpen])

  return (
    <>
      <button
        aria-label={t('Close navigation')}
        className={`fixed inset-0 z-40 bg-ink/20 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={closeDrawer}
        tabIndex={-1}
        type="button"
      />
      <aside
        aria-hidden={drawerHidden}
        className={`fixed inset-y-0 left-0 z-50 flex w-[15.5rem] shrink-0 flex-col bg-sidebar text-sidebar-ink shadow-[8px_0_32px_rgba(0,0,0,0.32)] transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:bottom-auto lg:h-screen lg:self-start lg:translate-x-0 lg:shadow-none ${
          isRail ? 'lg:w-[4.5rem]' : 'lg:w-[15.5rem]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        inert={drawerHidden}
        ref={asideRef}
      >
        <div className={`border-b border-white/8 px-4 py-5 ${isRail ? 'lg:px-2 lg:py-2.5' : ''}`}>
          <div className={`flex items-center gap-3 ${isRail ? 'lg:flex-col lg:gap-1.5' : ''}`}>
            <BrandMark
              className={`h-8 w-8 shrink-0 rounded-md text-sidebar ${isRail ? 'lg:mx-auto' : ''}`}
              size={32}
            />
            <div className={`min-w-0 ${isRail ? 'lg:hidden' : ''}`}>
              <h1 className="truncate font-ui text-sm font-semibold tracking-[-0.012em] text-sidebar-ink">
                Navor
              </h1>
              <span className="sr-only">{t('Navor Reader')}</span>
              <p className="mt-0.5 truncate text-[11px] tracking-[0.02em] text-sidebar-muted">
                {t('Investment ledger')}
              </p>
            </div>
            <button
              aria-label={t(isCollapsed ? 'Expand navigation' : 'Collapse navigation')}
              aria-pressed={isCollapsed}
              className={`press-scale ml-auto hidden h-8 w-8 place-items-center rounded-md border border-white/8 text-sm text-sidebar-muted transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 [@media(hover:hover)]:hover:bg-white/8 [@media(hover:hover)]:hover:text-sidebar-ink lg:grid ${
                isRail ? 'lg:ml-0' : ''
              }`}
              onClick={onToggleCollapse}
              type="button"
            >
              <span aria-hidden>{isCollapsed ? '›' : '‹'}</span>
            </button>
          </div>
        </div>

        <nav
          aria-label={t('Reader views')}
          className={`flex-1 overflow-y-auto px-2.5 py-4 ${isRail ? 'lg:px-2' : ''}`}
        >
          {navGroups.map((group) => (
            <div
              className={`mb-5 ${
                isRail
                  ? 'lg:mb-2 lg:border-t lg:border-white/8 lg:pt-2 first:lg:border-t-0 first:lg:pt-0'
                  : ''
              }`}
              key={group.label}
            >
              <p
                className={`mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted/75 ${
                  isRail ? 'lg:sr-only' : ''
                }`}
              >
                {group.label}
              </p>
              <ul className={isRail ? 'space-y-1' : 'space-y-0.5'}>
                {group.items.map((item) => {
                  const isActive = isNavItemActive(activeView, item.id)

                  return (
                    <li key={item.id}>
                      <button
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={isRail ? item.label : undefined}
                        className={`group relative flex min-h-10 w-full items-center rounded-md px-2.5 py-2 text-left text-[13px] transition-[background-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${
                          isRail ? 'lg:justify-center lg:px-1.5' : ''
                        } ${
                          isActive
                            ? 'bg-sidebar-strong font-semibold text-sidebar-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                            : 'font-medium text-sidebar-muted [@media(hover:hover)]:hover:bg-white/5 [@media(hover:hover)]:hover:text-sidebar-ink'
                        }`}
                        onClick={() => {
                          onSelect(item.id)
                          closeDrawer()
                        }}
                        type="button"
                      >
                        <span
                          aria-hidden
                          className={`mr-2 h-1.5 w-1.5 rounded-full transition-[background-color,box-shadow] ${
                            isRail ? 'lg:hidden' : ''
                          } ${isActive ? 'bg-accent shadow-[0_0_0_3px_rgba(67,145,103,0.15)]' : 'bg-white/15'}`}
                        />
                        <span className={isRail ? 'inline lg:hidden' : 'inline'}>{item.label}</span>
                        <span
                          aria-hidden
                          className={`hidden h-10 w-10 place-items-center rounded-md font-ui text-[15px] font-semibold transition-[background-color,color,box-shadow] ${
                            isRail ? 'lg:grid' : ''
                          } ${
                            isActive
                              ? 'bg-accent/25 text-sidebar-ink shadow-[inset_0_0_0_1px_rgba(136,210,162,0.46)]'
                              : 'bg-transparent text-sidebar-muted [@media(hover:hover)]:group-hover:bg-white/8 [@media(hover:hover)]:group-hover:text-sidebar-ink'
                          }`}
                        >
                          <CompactNavIcon view={item.id} />
                        </span>
                        {isRail ? (
                          <span className="pointer-events-none absolute left-[calc(100%+0.65rem)] z-50 hidden whitespace-nowrap rounded-md bg-sidebar-strong px-2.5 py-1.5 text-xs font-semibold text-sidebar-ink shadow-[0_8px_20px_rgba(0,0,0,0.28)] group-hover:lg:block group-focus-visible:lg:block">
                            {item.label}
                          </span>
                        ) : null}
                        {item.id === 'diagnostics' && diagnosticCount > 0 ? (
                          <span
                            className={`ml-auto rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold tabular-nums text-warning ${
                              isRail ? 'lg:hidden' : ''
                            }`}
                          >
                            {diagnosticCount}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div
          className={`border-t border-white/8 px-4 py-3 text-[11px] leading-5 text-sidebar-muted ${
            isRail ? 'lg:hidden' : ''
          }`}
        >
          <span className="block text-[10px] font-semibold uppercase tracking-[0.13em] text-sidebar-muted/65">
            {t('Facts first. Plans explicit.')}
          </span>
        </div>
      </aside>
    </>
  )
}

function isNavItemActive(activeView: ReaderView, itemView: ReaderView) {
  if (activeView === itemView) return true
  return itemView === 'holdings' && (activeView === 'allocation' || activeView === 'accounts')
}

function CompactNavIcon({ view }: { view: ReaderView }) {
  let paths: ReactNode

  switch (view) {
    case 'overview':
      paths = <path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z" />
      break
    case 'accounts':
      paths = (
        <>
          <path d="M5 4h14v16H5z" />
          <path d="M5 10h14M9 4v16" />
        </>
      )
      break
    case 'holdings':
      paths = (
        <>
          <path d="M4 5h16v14H4z" />
          <path d="M8 9h8M8 13h5" />
        </>
      )
      break
    case 'ledger':
      paths = (
        <>
          <path d="M7 6h11M7 12h11M7 18h11" />
          <path d="M4 6h.01M4 12h.01M4 18h.01" />
        </>
      )
      break
    case 'allocation':
      paths = (
        <>
          <path d="M12 3a9 9 0 1 0 9 9h-9Z" />
          <path d="M12 3v9h9" />
        </>
      )
      break
    case 'plan':
      paths = (
        <>
          <path d="M4 17 10 11l4 4 6-8" />
          <path d="M15 7h5v5" />
        </>
      )
      break
    case 'drift':
      paths = (
        <>
          <path d="M12 4v9" />
          <path d="M12 18h.01" />
          <path d="M10.4 4.9 3.8 17a2 2 0 0 0 1.8 3h12.8a2 2 0 0 0 1.8-3L13.6 4.9a1.8 1.8 0 0 0-3.2 0Z" />
        </>
      )
      break
    case 'watchlist':
      paths = (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="m12 8 1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4Z" />
        </>
      )
      break
    case 'research':
      paths = (
        <>
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M14 4v4h5M8 12h8M8 16h5" />
        </>
      )
      break
    case 'reviews':
      paths = (
        <>
          <path d="M5 6h14v13H5z" />
          <path d="M8 3v5M16 3v5M5 10h14M9 15l2 2 4-4" />
        </>
      )
      break
    case 'journal':
      paths = (
        <>
          <path d="M6 4h12v16H6z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </>
      )
      break
    case 'diagnostics':
      paths = (
        <>
          <path d="M12 3 19 6v5c0 4.4-2.8 7.4-7 10-4.2-2.6-7-5.6-7-10V6Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      )
      break
  }

  return (
    <svg
      aria-hidden
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <title>{view}</title>
      {paths}
    </svg>
  )
}
