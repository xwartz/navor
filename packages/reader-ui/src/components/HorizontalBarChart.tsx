import { t } from '../i18n'
import { formatPercent } from './format'
import { BulletChart } from './PortfolioVisuals'

export interface BarChartItem {
  id: string
  label: string
  sublabel?: string
  value: number
  secondaryValue?: number
  tone?: 'accent' | 'positive' | 'warning' | 'danger' | 'muted'
}

interface HorizontalBarChartProps {
  items: BarChartItem[]
  maxValue?: number
  showValues?: boolean
  secondaryLabel?: string
}

export function HorizontalBarChart({
  items,
  maxValue = 100,
  showValues = true,
  secondaryLabel,
}: HorizontalBarChartProps) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">{t('No chart data.')}</p>
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id}>
          <div className="mb-2 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{item.label}</p>
              {item.sublabel ? (
                <p className="truncate text-xs text-ink-faint">{item.sublabel}</p>
              ) : null}
            </div>
            {showValues ? (
              <div className="shrink-0 text-right text-sm tabular-nums text-ink-muted">
                <p>{formatPercent(item.value)}</p>
                {item.secondaryValue !== undefined && secondaryLabel ? (
                  <p className="text-xs text-ink-faint">
                    {secondaryLabel} {formatPercent(item.secondaryValue)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <BulletChart
            marker={item.secondaryValue}
            max={maxValue}
            tone={item.tone ?? 'accent'}
            value={item.value}
          />
        </div>
      ))}
    </div>
  )
}
