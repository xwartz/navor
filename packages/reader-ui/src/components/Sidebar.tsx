import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[15.5rem] shrink-0 flex-col bg-sidebar text-sidebar-ink shadow-[8px_0_24px_rgba(18,25,22,0.12)] transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:bottom-auto lg:h-screen lg:self-start lg:translate-x-0 lg:shadow-none ${
          isRail ? 'lg:w-20' : 'lg:w-[15.5rem]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        inert={drawerHidden}
        ref={asideRef}
      >
        <div className={`border-b border-white/8 px-4 py-4 ${isRail ? 'lg:px-2' : ''}`}>
          <div className="flex items-center gap-3">
            <BrandMark className="h-8 w-8 shrink-0 rounded-md text-sidebar" size={32} />
            <div className={`min-w-0 ${isRail ? 'lg:hidden' : ''}`}>
              <h1 className="truncate font-ui text-sm font-semibold tracking-[-0.012em] text-sidebar-ink">
                Navor
              </h1>
              <span className="sr-only">{t('Navor Reader')}</span>
              <p className="truncate text-xs text-sidebar-muted">{t('Investment ledger')}</p>
            </div>
            <button
              aria-label={t(isCollapsed ? 'Expand navigation' : 'Collapse navigation')}
              aria-pressed={isCollapsed}
              className="press-scale ml-auto hidden h-8 w-8 place-items-center rounded-md text-sm text-sidebar-muted transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 [@media(hover:hover)]:hover:bg-white/8 [@media(hover:hover)]:hover:text-sidebar-ink lg:grid"
              onClick={onToggleCollapse}
              type="button"
            >
              <span aria-hidden>{isCollapsed ? '›' : '‹'}</span>
            </button>
          </div>
        </div>

        <nav
          aria-label={t('Reader views')}
          className={`flex-1 overflow-y-auto px-2.5 py-3 ${isRail ? 'lg:px-2' : ''}`}
        >
          {navGroups.map((group) => (
            <div className={`mb-5 ${isRail ? 'lg:mb-2' : ''}`} key={group.label}>
              <p
                className={`mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-muted/75 ${
                  isRail ? 'lg:sr-only' : ''
                }`}
              >
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeView === item.id

                  return (
                    <li key={item.id}>
                      <button
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={isRail ? item.label : undefined}
                        className={`relative flex min-h-10 w-full items-center rounded-md px-2.5 py-2 text-left text-[13px] transition-[background-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${
                          isRail ? 'lg:justify-center lg:px-1.5' : ''
                        } ${
                          isActive
                            ? 'bg-white/8 font-semibold text-sidebar-ink'
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
                          } ${
                            isActive
                              ? 'bg-accent shadow-[0_0_0_3px_rgba(67,145,103,0.15)]'
                              : 'bg-white/15'
                          }`}
                        />
                        <span className={isRail ? 'inline lg:hidden' : 'inline'}>{item.label}</span>
                        <span
                          aria-hidden
                          className={`hidden font-mono text-[10px] font-semibold tracking-[0.08em] ${
                            isRail ? 'lg:inline' : ''
                          }`}
                        >
                          {compactNavLabel(item.id)}
                        </span>
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
          {t('Facts first. Plans explicit.')}
        </div>
      </aside>
    </>
  )
}

function compactNavLabel(view: ReaderView) {
  const labels: Record<ReaderView, string> = {
    workspace: 'WS',
    overview: 'OV',
    accounts: 'AC',
    holdings: 'HD',
    ledger: 'LD',
    allocation: 'AL',
    plan: 'PL',
    drift: 'DR',
    watchlist: 'WL',
    research: 'RS',
    thesis: 'TH',
    decisions: 'DC',
    reviews: 'RV',
    journal: 'JR',
    'market-data': 'MD',
    diagnostics: 'DG',
  }

  return labels[view]
}
