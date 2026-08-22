import { type MessageKey, t } from '../i18n'

interface PanelProps {
  title: MessageKey
  description?: MessageKey
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export function Panel({ title, description, children, className = '', actions }: PanelProps) {
  return (
    <section className={`surface-card ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-3.5">
        <div className="min-w-0">
          <h2 className="font-display text-[13px] font-semibold tracking-[-0.008em] text-ink">
            {t(title)}
          </h2>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-ink-muted">{t(description)}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="space-y-3 p-5 text-sm leading-[1.65] text-ink-muted">{children}</div>
    </section>
  )
}
