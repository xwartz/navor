import { formatQuantityCommodity } from './format'

export function QuantityCommodity({
  quantity,
  commodity,
  showCommodity = true,
}: {
  quantity: number
  commodity: string
  /** Turn off when the same row already names the commodity, such as an asset ticker. */
  showCommodity?: boolean
}) {
  const sign = quantity < 0 ? '-' : ''
  const amount = Math.abs(quantity).toLocaleString()

  return (
    <span className="tabular-nums" title={formatQuantityCommodity(quantity, commodity)}>
      <span>
        {sign}
        {amount}
      </span>
      {showCommodity ? (
        <>
          <span className="text-ink-faint"> · </span>
          <span className="font-normal text-ink-muted">{commodity}</span>
        </>
      ) : null}
    </span>
  )
}
