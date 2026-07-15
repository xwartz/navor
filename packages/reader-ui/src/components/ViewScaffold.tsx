import type { ReactNode } from 'react'

import { useAssetWorkspace } from '../asset-workspace-context'
import { useEntityLabel, useEntityMeta } from '../EntityLabelContext'
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
    <header className="flex flex-col gap-3 border-b border-border-strong/65 pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
          {t(eyebrow)}
        </p>
        <h1
          className="mt-1 text-[1.875rem] leading-[1.08] font-bold tracking-[-0.022em] text-ink"
          tabIndex={-1}
        >
          {t(title)}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{t(description)}</p>
      </div>
      {meta ? <div className="shrink-0 text-sm text-ink-muted">{meta}</div> : null}
    </header>
  )
}

export function SummaryStrip({ items }: { items: SummaryItem[] }) {
  return (
    <section className="summary-strip overflow-hidden rounded-lg bg-paper-elevated shadow-[0_1px_0_rgba(47,43,36,0.05),0_3px_12px_rgba(47,43,36,0.055)] ring-1 ring-border/85">
      {items.map((item) => (
        <div
          className="summary-item min-h-[6.5rem] px-3.5 py-3.5 sm:min-h-[7.25rem] sm:px-4"
          key={item.label}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
            {translateText(item.label)}
          </p>
          <p
            className={`mt-2 text-xl font-semibold tracking-[-0.012em] tabular-nums ${
              SUMMARY_VALUE_CLASSES[item.tone ?? 'neutral']
            }`}
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
  const displayTitle = title ?? label?.title ?? subject ?? 'n/a'
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
    <div className="min-w-0" title={subject ?? undefined}>
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
      className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${TONE_CLASSES[tone]}`}
    >
      {typeof children === 'string' ? translateText(children) : children}
    </span>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-dashed border-border-strong/75 bg-paper/60 px-4 py-5 text-left text-sm text-ink-muted">
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong" />
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
        <article className="border-l border-border px-4 pb-4 last:pb-0" key={item.id}>
          <div className="-ml-[1.35rem] flex gap-3">
            <span
              aria-hidden
              className="mt-1 h-2.5 w-2.5 rounded-full border-2 border-paper-elevated bg-accent"
            />
            <div className="min-w-0">
              <p className="text-xs tabular-nums text-ink-faint">
                {item.date} · {translateText(item.label)}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-ink">{item.title}</h3>
              {item.subjectDisplay ? (
                <div className="mt-1">{item.subjectDisplay}</div>
              ) : item.subject ? (
                <p className="mt-1 truncate text-xs text-ink-muted">{item.subject}</p>
              ) : null}
              {item.body ? <div className="mt-3">{item.body}</div> : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
