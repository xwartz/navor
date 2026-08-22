import type { ReactNode } from 'react'

import { useAssetWorkspace } from '../asset-workspace-context'
import { useEntityLabel, useEntityMeta } from '../EntityLabelContext'
import { readableEntityTitle } from '../entity-labels'
import { type MessageKey, t, translateText } from '../i18n'

export interface SummaryItem {
  label: string
  value: string
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
  eyebrow,
  title,
  description,
  meta,
}: {
  eyebrow: MessageKey
  title: MessageKey
  description: MessageKey
  meta?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border/60 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
          {t(eyebrow)}
        </p>
        <h1
          className="mt-1.5 font-display text-[1.875rem] leading-[1.06] font-bold tracking-[-0.024em] text-ink outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-accent/35"
          tabIndex={-1}
        >
          {t(title)}
        </h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-[1.65] text-ink-muted">{t(description)}</p>
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
          className="summary-item min-h-[6.5rem] px-4 py-4 sm:min-h-[7.25rem] sm:px-5"
          key={item.label}
        >
          <p className="label-caps">{translateText(item.label)}</p>
          <p
            className={`mt-2 font-display text-[1.375rem] font-semibold tracking-[-0.016em] tabular-nums ${
              SUMMARY_VALUE_CLASSES[item.tone ?? 'neutral']
            }`}
          >
            {item.value}
          </p>
          {item.detail ? (
            <p className="mt-1.5 text-xs leading-5 text-ink-muted">{translateText(item.detail)}</p>
          ) : null}
        </div>
      ))}
    </section>
  )
}

const PORTFOLIO_TABS = [
  { id: 'holdings', label: 'Positions', route: 'portfolio' },
  { id: 'allocation', label: 'Allocation', route: 'portfolio/allocation' },
  { id: 'accounts', label: 'Accounts', route: 'portfolio/accounts' },
] as const

export function PortfolioSectionNav({ active }: { active: (typeof PORTFOLIO_TABS)[number]['id'] }) {
  return (
    <SectionTabs
      active={active}
      ariaLabel="Portfolio workspace"
      tabs={PORTFOLIO_TABS.map((item) => ({
        id: item.id,
        href: `#${item.route}`,
        label: item.label,
      }))}
    />
  )
}

type SectionTabItem<T extends string> = {
  id: T
  label: MessageKey
  href?: string
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
  return (
    <nav
      aria-label={t(ariaLabel)}
      className="section-tabs meta-scroll -mx-1 flex gap-0.5 overflow-x-auto border-b border-border/60 px-1 pb-0"
      role={onSelect ? 'tablist' : undefined}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active
        const className = `${SECTION_TAB_CLASS} ${isActive ? SECTION_TAB_ACTIVE : SECTION_TAB_IDLE}`

        if (tab.href) {
          return (
            <a
              aria-current={isActive ? 'page' : undefined}
              className={className}
              href={tab.href}
              key={tab.id}
            >
              {t(tab.label)}
            </a>
          )
        }

        return (
          <button
            aria-selected={isActive}
            className={className}
            key={tab.id}
            onClick={() => onSelect?.(tab.id)}
            role="tab"
            type="button"
          >
            {t(tab.label)}
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
      <div className="divide-y divide-border/50">{children}</div>
    </section>
  )
}

export function InsetList({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`surface-inset divide-y divide-border/50 ${className}`}>{children}</div>
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
