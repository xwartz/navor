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
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-4 py-3.5 sm:flex-nowrap sm:gap-4 sm:px-5">
        <div className="min-w-0 flex-1 basis-40">
          <h2 className="font-display text-[13px] font-semibold tracking-[-0.008em] text-ink">
            {t(title)}
          </h2>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-ink-muted">{t(description)}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="panel-body space-y-3 p-4 sm:p-5 text-sm leading-[1.65] text-ink-muted">
        {children}
      </div>
    </section>
  )
}
