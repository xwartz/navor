import type { ReactNode } from 'react'

import { useAssetWorkspace } from '../asset-workspace-context'
import { useEntityLabel, useEntityMeta } from '../EntityLabelContext'
import { readableEntityTitle } from '../entity-labels'
import { type MessageKey, t, translateText } from '../i18n'
import { getDestinationTabs, type ReaderView } from '../view-catalog'

export interface SummaryItem {
  label: string
  value: string
  /** Unabridged value, surfaced as a tooltip when `value` is compacted. */
  exactValue?: string
  detail?: string
  tone?: 'neutral' | 'accent' | 'positive' | 'warning' | 'danger'
}

const TONE_CLASSES: Record<NonNullable<SummaryItem['tone']>, string> = {
  neutral: 'bg-paper-elevated text-ink',
  accent: 'bg-accent-soft text-accent-ink',
  positive: 'bg-positive-soft text-positive',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

const SUMMARY_VALUE_CLASSES: Record<NonNullable<SummaryItem['tone']>, string> = {
  neutral: 'text-ink',
  accent: 'text-ink',
  positive: 'text-ink',
  warning: 'text-warning',
  danger: 'text-danger',
}

export function ViewHeader({
  title,
  description,
  meta,
}: {
  title: MessageKey
  description: MessageKey
  meta?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-3xl">
        <h1
          className="font-display text-[1.75rem] leading-[1.1] font-bold tracking-[-0.022em] text-ink outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-accent/35"
          tabIndex={-1}
        >
          {t(title)}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-muted">{t(description)}</p>
      </div>
      {meta ? <div className="shrink-0 text-sm text-ink-muted">{meta}</div> : null}
    </header>
  )
}

export function SummaryStrip({ items }: { items: SummaryItem[] }) {
  return (
    <section className="summary-strip surface-card">
      {items.map((item) => (
        <div
          className="summary-item min-h-[6rem] px-4 py-4 sm:min-h-[6.75rem] sm:px-5"
          key={item.label}
        >
          <p className="label-caps">{translateText(item.label)}</p>
          <p
            className={`mt-2 font-display text-[1.125rem] leading-7 font-semibold tracking-[-0.018em] tabular-nums sm:text-[1.5rem] sm:leading-8 ${
              SUMMARY_VALUE_CLASSES[item.tone ?? 'neutral']
            }`}
            title={item.exactValue && item.exactValue !== item.value ? item.exactValue : undefined}
          >
            {item.value}
          </p>
          {item.detail ? (
            <p className="mt-1 text-xs leading-5 text-ink-muted">{translateText(item.detail)}</p>
          ) : null}
        </div>
      ))}
    </section>
  )
}

/** Section tabs for a sidebar destination that hosts several routed views. */
export function DestinationTabs({
  active,
  counts,
}: {
  active: ReaderView
  counts?: Partial<Record<ReaderView, number>>
}) {
  const tabs = getDestinationTabs(active)

  if (tabs.length === 0) {
    return null
  }

  return (
    <SectionTabs
      active={active}
      ariaLabel="Section views"
      tabs={tabs.map((tab) => ({
        id: tab.id,
        href: `#${tab.route}`,
        label: tab.label,
        count: counts?.[tab.id],
      }))}
    />
  )
}

export type SectionTabItem<T extends string> = {
  id: T
  label: MessageKey
  href?: string
  count?: number
}

const SECTION_TAB_CLASS =
  'press-scale inline-flex min-h-10 shrink-0 items-center rounded-t-md px-3.5 pb-2.5 pt-2 text-xs font-semibold transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35'
const SECTION_TAB_ACTIVE = 'border-b-2 border-accent text-ink'
const SECTION_TAB_IDLE =
  'border-b-2 border-transparent text-ink-muted [@media(hover:hover)]:hover:text-ink'

export function SectionTabs<T extends string>({
  active,
  ariaLabel,
  onSelect,
  tabs,
}: {
  active: T
  ariaLabel: MessageKey
  onSelect?: (tab: T) => void
  tabs: SectionTabItem<T>[]
}) {
  const isTablist = Boolean(onSelect) && tabs.every((tab) => !tab.href)

  return (
    <nav
      aria-label={t(ariaLabel)}
      className="section-tabs meta-scroll -mx-1 flex gap-1 overflow-x-auto border-b border-border/60 px-1 pb-0"
      role={isTablist ? 'tablist' : undefined}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active
        const className = `${SECTION_TAB_CLASS} ${isActive ? SECTION_TAB_ACTIVE : SECTION_TAB_IDLE}`
        const content = (
          <>
            {t(tab.label)}
            {tab.count ? (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums ${
                  isActive ? 'bg-warning-soft text-warning' : 'bg-paper-subtle text-ink-muted'
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </>
        )

        if (tab.href) {
          return (
            <a
              aria-current={isActive ? 'page' : undefined}
              className={className}
              href={tab.href}
              key={tab.id}
            >
              {content}
            </a>
          )
        }

        if (isTablist) {
          return (
            <button
              aria-selected={isActive}
              className={className}
              key={tab.id}
              onClick={() => onSelect?.(tab.id)}
              role="tab"
              type="button"
            >
              {content}
            </button>
          )
        }

        return (
          <button
            aria-current={isActive ? 'page' : undefined}
            className={className}
            key={tab.id}
            onClick={() => onSelect?.(tab.id)}
            type="button"
          >
            {content}
          </button>
        )
      })}
    </nav>
  )
}

export function LabelCaps({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p className={`label-caps ${className}`}>
      {typeof children === 'string' ? translateText(children) : children}
    </p>
  )
}

export function GroupedSection({
  children,
  className = '',
  header,
}: {
  children: ReactNode
  className?: string
  header: ReactNode
}) {
  return (
    <section className={`surface-card ${className}`}>
      <div className="border-b border-border/60 bg-paper-subtle/40 px-5 py-3.5">{header}</div>
      <div className="grouped-body divide-y divide-border/50">{children}</div>
    </section>
  )
}

/** Divided list; bleeds to the panel edges when it is a panel's only content. */
export function InsetList({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`surface-inset panel-bleed divide-y divide-border/50 ${className}`}>
      {children}
    </div>
  )
}

export function SuccessCallout({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-positive-soft px-4 py-3 text-sm text-accent-ink">
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-positive" />
      <span>{typeof children === 'string' ? translateText(children) : children}</span>
    </div>
  )
}

export function SubjectTicker({ subject }: { subject: string }) {
  const meta = useEntityMeta(subject)

  if (!meta) {
    return null
  }

  return <p className="font-mono text-[11px] text-ink-faint">{meta}</p>
}
export function EntityCell({
  title,
  subject,
  meta,
  symbol,
  interactive = false,
}: {
  title?: string | null
  subject?: string | null
  meta?: string | null
  symbol?: string | null
  interactive?: boolean
}) {
  const { canOpenAsset, openAsset } = useAssetWorkspace()
  const label = useEntityLabel(subject)
  const displayTitle = readableEntityTitle(label, subject, title) || 'n/a'
  const displayMeta = useEntityMeta(subject, meta ?? symbol)
  const content = (
    <>
      <p className="font-medium text-ink">{displayTitle}</p>
      {displayMeta ? (
        <p className="mt-0.5 truncate font-mono text-[11px] text-ink-faint">{displayMeta}</p>
      ) : null}
    </>
  )

  return (
    <div className="min-w-0" title={displayTitle}>
      {interactive && subject && canOpenAsset(subject) ? (
        <button
          aria-haspopup="dialog"
          className="min-h-10 w-full rounded-md text-left transition-[color,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:text-accent-ink"
          data-asset-subject={subject}
          onClick={() => openAsset(subject)}
          type="button"
        >
          {content}
        </button>
      ) : (
        content
      )}
    </div>
  )
}

export function Chip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: NonNullable<SummaryItem['tone']>
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${TONE_CLASSES[tone]}`}
    >
      {typeof children === 'string' ? translateText(children) : children}
    </span>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border-strong/60 bg-paper-subtle/50 px-5 py-6 text-left text-sm text-ink-muted">
      <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
      <span>{typeof children === 'string' ? translateText(children) : children}</span>
    </div>
  )
}

export interface TimelineItem {
  id: string
  date: string
  label: string
  title: string
  subject?: string | null
  subjectDisplay?: ReactNode
  body?: ReactNode
}

export function TimelineFeed({
  items,
  emptyMessage = 'No timeline items.',
}: {
  items: TimelineItem[]
  emptyMessage?: MessageKey
}) {
  if (items.length === 0) {
    return <EmptyState>{emptyMessage ? t(emptyMessage) : null}</EmptyState>
  }

  return (
    <div className="space-y-0">
      {items.map((item) => (
        <article className="relative border-l border-border/70 px-5 pb-5 last:pb-0" key={item.id}>
          <div className="-ml-[0.3125rem] flex gap-3.5">
            <span
              aria-hidden
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full border-2 border-paper bg-accent shadow-[0_0_0_2px_var(--color-paper-elevated)]"
            />
            <div className="min-w-0">
              <p className="text-[11px] tabular-nums tracking-[0.01em] text-ink-faint">
                {item.date} · {translateText(item.label)}
              </p>
              <h3 className="mt-1 text-sm font-semibold tracking-[-0.006em] text-ink">
                {item.title}
              </h3>
              {item.subjectDisplay ? (
                <div className="mt-1">{item.subjectDisplay}</div>
              ) : item.subject ? (
                <TimelineSubject subject={item.subject} />
              ) : null}
              {item.body ? <div className="mt-3">{item.body}</div> : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function TimelineSubject({ subject }: { subject: string }) {
  const label = useEntityLabel(subject)

  return (
    <p className="mt-1 truncate text-xs text-ink-muted">{readableEntityTitle(label, subject)}</p>
  )
}
