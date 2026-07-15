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
    <section
      className={`overflow-hidden rounded-lg bg-paper-elevated shadow-[0_1px_0_rgba(47,43,36,0.05),0_3px_12px_rgba(47,43,36,0.055)] ring-1 ring-border/85 ${className}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border/80 px-4 py-3">
        <div className="min-w-0">
          <h2 className="font-ui text-[13px] font-semibold tracking-[-0.006em] text-ink">
            {t(title)}
          </h2>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-ink-muted">{t(description)}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="space-y-3 p-4 text-sm leading-6 text-ink-muted">{children}</div>
    </section>
  )
}
