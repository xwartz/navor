import type { NavorRendererAppState } from '@navor/contract'
import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react'

import { useAssetWorkspace } from '../asset-workspace-context'
import {
  buildCommandItems,
  COMMAND_GROUP_ORDER,
  type CommandItem,
  filterCommandItems,
} from '../command-palette'
import { t } from '../i18n'
import { CompactNavIcon } from './Sidebar'

const ESCAPE_KEY_LABEL = 'Esc'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  state: NavorRendererAppState
}

export function CommandPalette({ isOpen, onClose, state }: CommandPaletteProps) {
  if (!isOpen) {
    return null
  }

  return <CommandPaletteDialog onClose={onClose} state={state} />
}

function CommandPaletteDialog({ onClose, state }: Omit<CommandPaletteProps, 'isOpen'>) {
  const { canOpenAsset, openAsset } = useAssetWorkspace()
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const items = useMemo(() => buildCommandItems(state, canOpenAsset), [state, canOpenAsset])
  const results = useMemo(() => filterCommandItems(items, query), [items, query])
  const activeItem = results[activeIndex] ?? null
  const optionId = (item: CommandItem) => `${listboxId}-${item.id.replace(/[^\w-]/g, '_')}`

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onCloseRef.current()
    }
    window.addEventListener('keydown', closeOnEscape, true)

    return () => {
      window.removeEventListener('keydown', closeOnEscape, true)
      document.body.style.overflow = overflow
      returnFocusRef.current?.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    if (!activeItem) return
    document.getElementById(optionId(activeItem))?.scrollIntoView({ block: 'nearest' })
  })

  const run = (item: CommandItem) => {
    returnFocusRef.current = null
    onClose()

    if (item.target.kind === 'asset') {
      openAsset(item.target.subject)
      return
    }

    window.location.hash = item.target.route
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      return
    }

    if (results.length === 0) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) => (current + step + results.length) % results.length)
      return
    }

    if (event.key === 'Enter' && activeItem) {
      event.preventDefault()
      run(activeItem)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-3 pt-[min(14vh,7rem)] sm:px-6">
      <button
        aria-label={t('Close command palette')}
        className="palette-backdrop absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-label={t('Command palette')}
        aria-modal="true"
        className="palette-enter relative flex max-h-[min(34rem,calc(100dvh-8rem))] w-full max-w-[38rem] flex-col overflow-hidden rounded-xl bg-paper-elevated shadow-[var(--shadow-lg)] outline outline-1 outline-border/80"
        role="dialog"
      >
        <div className="flex items-center gap-3 border-b border-border/70 px-4">
          <span aria-hidden className="text-base text-ink-faint">
            ⌕
          </span>
          <input
            aria-activedescendant={activeItem ? optionId(activeItem) : undefined}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('Jump to a view, asset, or record')}
            ref={inputRef}
            role="combobox"
            spellCheck={false}
            type="text"
            value={query}
          />
          <kbd className="hidden h-6 items-center rounded border border-border px-1.5 font-ui text-[11px] text-ink-faint sm:inline-flex">
            {ESCAPE_KEY_LABEL}
          </kbd>
        </div>

        <div
          aria-label={t('Command palette')}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
          id={listboxId}
          role="listbox"
        >
          {results.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-ink-muted">
              {t('No matches. Try an asset name, ticker, or view.')}
            </p>
          ) : (
            COMMAND_GROUP_ORDER.map((group) => {
              const groupItems = results.filter((item) => item.group === group)
              if (groupItems.length === 0) return null

              return (
                <div className="pb-1 last:pb-0" key={group} role="presentation">
                  <p aria-hidden className="label-caps px-3 pt-2.5 pb-1.5">
                    {t(group)}
                  </p>
                  {groupItems.map((item) => {
                    const index = results.indexOf(item)
                    const isActive = index === activeIndex

                    return (
                      // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection runs through the combobox input via aria-activedescendant.
                      <div
                        aria-selected={isActive}
                        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-[background-color] duration-100 ${
                          isActive ? 'bg-accent-soft' : ''
                        }`}
                        id={optionId(item)}
                        key={item.id}
                        onClick={() => run(item)}
                        onPointerMove={() => {
                          if (!isActive) setActiveIndex(index)
                        }}
                        role="option"
                        tabIndex={-1}
                      >
                        <CommandGlyph isActive={isActive} item={item} />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                          {item.title}
                        </span>
                        {item.meta ? (
                          <span className="max-w-[45%] shrink-0 truncate text-xs text-ink-faint">
                            {item.meta}
                          </span>
                        ) : null}
                        <span
                          aria-hidden
                          className={`shrink-0 text-xs text-accent-ink ${isActive ? 'opacity-100' : 'opacity-0'}`}
                        >
                          ↵
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        <div className="hidden items-center gap-4 border-t border-border/70 px-4 py-2.5 text-[11px] text-ink-faint sm:flex">
          <span>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> {t('Navigate')}
          </span>
          <span>
            <Kbd>↵</Kbd> {t('Open')}
          </span>
          <span>
            <Kbd>{ESCAPE_KEY_LABEL}</Kbd> {t('Close')}
          </span>
        </div>
      </div>
    </div>
  )
}

function CommandGlyph({ item, isActive }: { item: CommandItem; isActive: boolean }) {
  const tone = isActive ? 'bg-paper-elevated text-accent-ink' : 'bg-paper-subtle text-ink-muted'

  if (item.icon) {
    return (
      <span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${tone}`}>
        <span className="scale-[0.85]">
          <CompactNavIcon view={item.icon} />
        </span>
      </span>
    )
  }

  return (
    <span
      aria-hidden
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-md font-ui text-[11px] font-semibold ${tone}`}
    >
      {item.title.slice(0, 1).toUpperCase()}
    </span>
  )
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="mr-1 inline-flex h-5 min-w-5 items-center justify-center rounded border border-border px-1 font-ui text-[10px] text-ink-muted">
      {children}
    </kbd>
  )
}
