import type { MarketPrice } from '@navor/core'

export interface PriceAdapter {
  name: string
  fetchPrices(subjects: string[]): Promise<PriceAdapterResult>
}

export interface PriceAdapterResult {
  prices: MarketPrice[]
  failures?: PriceAdapterFailure[]
}

export interface PriceAdapterFailure {
  subject: string
  provider: string
  message: string
}
