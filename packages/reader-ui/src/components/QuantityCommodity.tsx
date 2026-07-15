import { formatQuantityCommodity } from './format'

export function QuantityCommodity({
  quantity,
  commodity,
}: {
  quantity: number
  commodity: string
}) {
  const sign = quantity < 0 ? '-' : ''
  const amount = Math.abs(quantity).toLocaleString()

  return (
    <span className="tabular-nums" title={formatQuantityCommodity(quantity, commodity)}>
      <span>
        {sign}
        {amount}
      </span>
      <span className="text-ink-faint"> · </span>
      <span className="font-normal text-ink-muted">{commodity}</span>
    </span>
  )
}
