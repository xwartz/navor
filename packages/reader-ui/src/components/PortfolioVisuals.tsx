import { type ReactNode, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatAllocationChartLabel, t, translateText } from '../i18n'

import { formatMoney, formatPercent } from './format'

export interface ChartItem {
  id: string
  label: string
  value: number
  sublabel?: string
  tone?: ChartTone
  color?: string
}

export interface TargetActualItem {
  id: string
  label: string
  sublabel?: string
  target: number | null | undefined
  actual: number | null | undefined
  drift?: number | null | undefined
  tone?: ChartTone
}

export type ChartTone = 'accent' | 'positive' | 'warning' | 'danger' | 'muted'

const TONE_COLORS: Record<ChartTone, string> = {
  accent: '#367455',
  positive: '#367455',
  warning: '#956812',
  danger: '#b54c47',
  muted: '#beb9ae',
}

const CATEGORY_COLORS = ['#367455', '#526f7a', '#a77816', '#9a5844', '#71637f', '#737b49']

export function DonutChart({
  items,
  centerLabel,
  centerValue,
  compact = false,
}: {
  items: ChartItem[]
  centerLabel: string
  centerValue: string
  compact?: boolean
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const visibleItems = items
    .filter((item) => item.value > 0)
    .map((item, index) => ({
      ...item,
      color: item.color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
  const total = visibleItems.reduce((sum, item) => sum + item.value, 0)
  const activeId = hoveredId ?? selectedId
  const activeItem = visibleItems.find((item) => item.id === activeId) ?? null

  if (total <= 0) {
    return <p className="text-sm text-ink-muted">{t('No chart data.')}</p>
  }

  return (
    <div
      className={`grid gap-4 ${
        compact ? '' : 'sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center'
      }`}
    >
      <div
        className={`relative mx-auto ${compact ? 'h-32 w-32' : 'h-40 w-40'}`}
        role="img"
        aria-label={formatAllocationChartLabel(centerLabel)}
      >
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              data={visibleItems}
              dataKey="value"
              innerRadius={compact ? 38 : 50}
              isAnimationActive={false}
              onClick={(_, index) => {
                const item = visibleItems[index]
                if (item) {
                  setSelectedId((current) => (current === item.id ? null : item.id))
                }
              }}
              onMouseEnter={(_, index) => setHoveredId(visibleItems[index]?.id ?? null)}
              onMouseLeave={() => setHoveredId(null)}
              outerRadius={compact ? 62 : 78}
              paddingAngle={1}
              stroke="none"
            >
              {visibleItems.map((item) => (
                <Cell
                  className="cursor-pointer transition-[opacity] duration-150"
                  fill={item.color}
                  fillOpacity={!activeId || activeId === item.id ? 1 : 0.28}
                  key={item.id}
                  stroke={activeId === item.id ? '#fcfbf7' : 'transparent'}
                  strokeWidth={activeId === item.id ? 3 : 0}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div
          className={`pointer-events-none absolute grid place-items-center rounded-full bg-paper-elevated text-center ${
            compact ? 'inset-8' : 'inset-10'
          }`}
        >
          <div>
            <p
              className="mx-auto max-w-[4.5rem] truncate text-[10px] font-semibold uppercase tracking-[0.07em] text-ink-faint"
              title={activeItem?.label}
            >
              {activeItem?.label ?? centerLabel}
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-ink">
              {activeItem ? formatPercent((activeItem.value / total) * 100) : centerValue}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {[...visibleItems]
          .sort((left, right) => right.value - left.value)
          .map((item) => (
            <button
              aria-pressed={selectedId === item.id}
              className={`grid w-full rounded-md px-1.5 py-1 text-left text-sm transition-[background-color,opacity,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 ${
                compact
                  ? 'grid-cols-[minmax(0,1fr)_3rem] gap-2'
                  : 'grid-cols-[minmax(0,1fr)_3.75rem] gap-3'
              } ${activeId && activeId !== item.id ? 'opacity-45' : ''} ${
                activeId === item.id ? 'bg-paper' : '[@media(hover:hover)]:hover:bg-paper'
              }`}
              key={item.id}
              onClick={() => setSelectedId((current) => (current === item.id ? null : item.id))}
              onFocus={() => setHoveredId(item.id)}
              onBlur={() => setHoveredId(null)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              type="button"
            >
              <div className="flex min-w-0 items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <p className="truncate leading-5 font-medium text-ink">{item.label}</p>
                  {item.sublabel ? (
                    <p className="truncate text-xs text-ink-faint">{item.sublabel}</p>
                  ) : null}
                </div>
              </div>
              <span className="text-right tabular-nums text-ink-muted">
                {formatPercent((item.value / total) * 100)}
              </span>
            </button>
          ))}
      </div>
    </div>
  )
}

export function AllocationBarChart({ items }: { items: ChartItem[] }) {
  const data = items
    .filter((item) => item.value > 0)
    .map((item) => ({ ...item, fill: TONE_COLORS[item.tone ?? 'accent'] }))

  if (data.length === 0) {
    return <p className="text-sm text-ink-muted">{t('No chart data.')}</p>
  }

  return (
    <div className="h-72">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid horizontal={false} stroke="#ddd9d0" />
          <XAxis tickFormatter={(value) => `${value}%`} type="number" />
          <YAxis
            dataKey="label"
            tick={{ fill: '#69645c', fontSize: 12 }}
            tickLine={false}
            type="category"
            width={96}
          />
          <Tooltip formatter={(value) => formatPercent(Number(value ?? 0))} />
          <Bar dataKey="value" isAnimationActive={false} radius={[0, 4, 4, 0]}>
            {data.map((item) => (
              <Cell fill={item.fill} key={item.id} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BulletChart({
  value,
  marker,
  tone = 'accent',
  max = 100,
}: {
  value: number
  marker?: number | null
  tone?: ChartTone
  max?: number
}) {
  const clampedValue = clamp(value, 0, max)
  const clampedMarker = marker === null || marker === undefined ? null : clamp(marker, 0, max)
  const valuePosition = (clampedValue / max) * 100
  const markerPosition = clampedMarker === null ? null : (clampedMarker / max) * 100
  const connectorStart =
    markerPosition === null ? valuePosition : Math.min(valuePosition, markerPosition)
  const connectorEnd =
    markerPosition === null ? valuePosition : Math.max(valuePosition, markerPosition)

  return (
    <div aria-hidden className="relative h-4" role="presentation">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      {[25, 50, 75].map((tick) => (
        <div
          className="absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-border-strong/55"
          key={tick}
          style={{ left: `${(tick / max) * 100}%` }}
        />
      ))}
      <div
        className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full opacity-45"
        style={{
          left: `${connectorStart}%`,
          width: `${Math.max(connectorEnd - connectorStart, 0.35)}%`,
          backgroundColor: TONE_COLORS[tone],
        }}
      />
      {clampedMarker !== null ? (
        <div
          className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-ink"
          style={{ left: `${markerPosition}%` }}
        />
      ) : null}
      <div
        className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper-elevated"
        style={{ left: `${valuePosition}%`, backgroundColor: TONE_COLORS[tone] }}
      />
    </div>
  )
}

export function RankedExposureList({
  items,
  valueLabel = 'Weight',
  limit = 8,
}: {
  items: ChartItem[]
  valueLabel?: string
  limit?: number
}) {
  const data = items
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, limit)
  const max = Math.max(...data.map((item) => item.value), 0)

  if (data.length === 0 || max <= 0) {
    return <p className="text-sm text-ink-muted">{t('No exposure data.')}</p>
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_4.5rem] gap-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
        <span>{t('Exposure')}</span>
        <span className="text-right">{translateText(valueLabel)}</span>
      </div>
      {data.map((item) => (
        <div className="space-y-1.5" key={item.id}>
          <div className="grid grid-cols-[minmax(0,1fr)_4.5rem] gap-4 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{item.label}</p>
              {item.sublabel ? (
                <p className="truncate text-xs text-ink-faint">{item.sublabel}</p>
              ) : null}
            </div>
            <span className="text-right tabular-nums text-ink-muted">
              {formatPercent(item.value)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: TONE_COLORS[item.tone ?? 'accent'],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TargetActualList({ items }: { items: TargetActualItem[] }) {
  const data = items
    .filter((item) => item.target !== null || item.actual !== null)
    .sort((left, right) => Math.abs(right.drift ?? 0) - Math.abs(left.drift ?? 0))

  if (data.length === 0) {
    return <p className="text-sm text-ink-muted">{t('No allocation data.')}</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_4rem_4rem_4rem] gap-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
        <span>{t('Asset')}</span>
        <span className="text-right">{t('Target')}</span>
        <span className="text-right">{t('Actual')}</span>
        <span className="text-right">{t('Drift')}</span>
      </div>
      {data.map((item) => {
        const target = item.target ?? 0
        const actual = item.actual ?? 0
        const drift = item.drift ?? actual - target
        const tone =
          Math.abs(drift) <= 1 ? 'positive' : drift > 0 ? 'danger' : (item.tone ?? 'warning')

        return (
          <div className="space-y-2" key={item.id}>
            <div className="grid grid-cols-[minmax(0,1fr)_4rem_4rem_4rem] gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{item.label}</p>
                {item.sublabel ? (
                  <p className="truncate text-xs text-ink-faint">{item.sublabel}</p>
                ) : null}
              </div>
              <span className="text-right tabular-nums text-ink-muted">
                {formatPercent(item.target)}
              </span>
              <span className="text-right tabular-nums text-ink">{formatPercent(item.actual)}</span>
              <span
                className={`text-right tabular-nums ${
                  drift > 0 ? 'text-danger' : drift < 0 ? 'text-warning' : 'text-positive'
                }`}
              >
                {formatPercent(drift)}
              </span>
            </div>
            <BulletChart marker={target} tone={tone} value={actual} />
          </div>
        )
      })}
    </div>
  )
}

export function ProgressMeter({
  value,
  marker,
  label,
  tone = 'accent',
}: {
  value: number | null | undefined
  marker?: number | null
  label?: ReactNode
  tone?: ChartTone
}) {
  const normalized = clamp(value ?? 0, 0, 140)
  const markerValue = marker === null || marker === undefined ? null : clamp(marker, 0, 140)

  return (
    <div className="space-y-1.5">
      {label ? <div className="text-xs text-ink-muted">{label}</div> : null}
      <div className="relative h-2.5 overflow-hidden rounded-full bg-paper">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${Math.min(normalized, 100)}%`,
            backgroundColor: TONE_COLORS[tone],
          }}
        />
        {normalized > 100 ? (
          <div
            className="absolute inset-y-0 right-0 rounded-r-full bg-danger"
            style={{ width: `${Math.min(normalized - 100, 40)}%` }}
          />
        ) : null}
        {markerValue !== null ? (
          <div
            className="absolute inset-y-0 w-0.5 bg-ink/70"
            style={{ left: `${Math.min(markerValue, 100)}%` }}
          />
        ) : null}
      </div>
    </div>
  )
}

export function MoneyDelta({
  value,
}: {
  value: { amount: number; currency: string } | null | undefined
}) {
  const tone =
    !value || value.amount === 0
      ? 'text-ink-muted'
      : value.amount > 0
        ? 'text-positive'
        : 'text-danger'

  return <span className={`tabular-nums ${tone}`}>{formatMoney(value)}</span>
}

export function toneFromStatus(status: string): ChartTone {
  if (status === 'above_max' || status === 'over_invested') {
    return 'danger'
  }

  if (status === 'below_min' || status === 'not_started' || status === 'currency_mismatch') {
    return 'warning'
  }

  if (status === 'complete' || status === 'on_track') {
    return 'positive'
  }

  return 'accent'
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
