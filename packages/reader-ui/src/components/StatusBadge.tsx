import type { DriftEntry } from '@navor/contract'
import { t } from '../i18n'
import { driftStatusLabel, formatPercent } from './format'

const STATUS_STYLES: Record<DriftEntry['status'], string> = {
  on_track: 'bg-accent-soft text-accent-ink',
  below_min: 'bg-warning-soft text-warning',
  above_max: 'bg-danger-soft text-danger',
  unknown: 'bg-paper text-ink-muted',
}

export function StatusBadge({ status }: { status: DriftEntry['status'] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${STATUS_STYLES[status]}`}
    >
      {driftStatusLabel(status)}
    </span>
  )
}

export function DriftBar({
  target,
  actual,
  min,
  max,
}: {
  target: number | null
  actual: number | null
  min: number | null
  max: number | null
}) {
  const scaleMax = Math.max(target ?? 0, actual ?? 0, max ?? 0, 100)
  const targetPosition = target === null ? null : (target / scaleMax) * 100
  const actualPosition = actual === null ? null : (actual / scaleMax) * 100
  const connectorStart =
    targetPosition === null || actualPosition === null
      ? null
      : Math.min(targetPosition, actualPosition)
  const connectorEnd =
    targetPosition === null || actualPosition === null
      ? null
      : Math.max(targetPosition, actualPosition)

  return (
    <div className="space-y-2">
      <div className="relative h-4">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        {min !== null && max !== null ? (
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent-soft"
            style={{
              left: `${(min / scaleMax) * 100}%`,
              width: `${((max - min) / scaleMax) * 100}%`,
            }}
          />
        ) : null}
        {target !== null ? (
          <div
            className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-ink"
            style={{ left: `${targetPosition}%` }}
          />
        ) : null}
        {connectorStart !== null && connectorEnd !== null ? (
          <div
            className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-accent/45"
            style={{ left: `${connectorStart}%`, width: `${connectorEnd - connectorStart}%` }}
          />
        ) : null}
        {actualPosition !== null ? (
          <div
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-paper-elevated"
            style={{ left: `${actualPosition}%` }}
          />
        ) : null}
      </div>
      <div className="flex justify-between text-[11px] tabular-nums text-ink-faint">
        <span>
          {t('Target')} {formatPercent(target)}
        </span>
        <span>
          {t('Actual')} {formatPercent(actual)}
        </span>
      </div>
    </div>
  )
}
