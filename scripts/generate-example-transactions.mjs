#!/usr/bin/env node
/**
 * Generate example/activity/transactions.nav from weekly RSI/KD signals
 * using real market prices through today (no date shifting).
 */

const CAPITAL = 1_000_000
const FX = { CNY: 7, HKD: 7.84 }
const ACCOUNT_TARGET = { Crypto: 0.5, US: 0.25, CN: 0.15, HK: 0.1 }
const TRANCHES = { Crypto: 16, US: 4, CN: 8, HK: 8 }
const SELL_PCT = { Crypto: 0.02, US: 0.01, CN: 0.02, HK: 0.02 }
const FEE = { USD: 1, CNY: 5, HKD: 10 }
/** Weekly bars required before a week can emit RSI/KD signals. */
const INDICATOR_LOOKBACK_BARS = 100
/** Signal window: recent half-year on the example timeline. */
const SIGNAL_START = '2026-01-06'
const SIGNAL_END = '2026-07-04'
/**
 * Daily history must cover ≥100 weekly bars before SIGNAL_START,
 * through today (2026-07-10).
 */
const HISTORY_START = '2024-01-01T00:00:00Z'
const HISTORY_END = '2026-07-10T00:00:00Z'

const ASSETS = [
  {
    subject: 'Asset:Crypto:BTC',
    yahoo: 'BTC-USD',
    account: 'Crypto',
    target: 46,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Crypto:BTC',
    commodity: 'BTC',
    decimals: 8,
  },
  {
    subject: 'Asset:Crypto:ETH',
    yahoo: 'ETH-USD',
    account: 'Crypto',
    target: 20,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Crypto:ETH',
    commodity: 'ETH',
    decimals: 8,
  },
  {
    subject: 'Asset:Crypto:SOL',
    yahoo: 'SOL-USD',
    account: 'Crypto',
    target: 10,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Crypto:SOL',
    commodity: 'SOL',
    decimals: 8,
  },
  {
    subject: 'Asset:Crypto:LINK',
    yahoo: 'LINK-USD',
    account: 'Crypto',
    target: 6,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Crypto:LINK',
    commodity: 'LINK',
    decimals: 8,
  },
  {
    subject: 'Asset:Crypto:BNB',
    yahoo: 'BNB-USD',
    account: 'Crypto',
    target: 6,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Crypto:BNB',
    commodity: 'BNB',
    decimals: 8,
  },
  {
    subject: 'Asset:Crypto:HYPE',
    yahoo: null,
    fallback: 'HYPE',
    account: 'Crypto',
    target: 6,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Crypto:HYPE',
    commodity: 'HYPE',
    decimals: 8,
  },
  {
    subject: 'Asset:Crypto:VIRTUAL',
    yahoo: 'VIRTUAL-USD',
    account: 'Crypto',
    target: 3,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Crypto:VIRTUAL',
    commodity: 'VIRTUAL',
    decimals: 4,
  },
  {
    subject: 'Asset:Crypto:PEPE',
    yahoo: 'PEPE24478-USD',
    account: 'Crypto',
    target: 3,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Crypto:PEPE',
    commodity: 'PEPE',
    decimals: 0,
  },
  {
    subject: 'Asset:Equity:US:NVDA',
    yahoo: 'NVDA',
    account: 'US',
    target: 10,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:NVDA',
    commodity: 'NVDA',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:US:AAPL',
    yahoo: 'AAPL',
    account: 'US',
    target: 10,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:AAPL',
    commodity: 'AAPL',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:US:MSFT',
    yahoo: 'MSFT',
    account: 'US',
    target: 10,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:MSFT',
    commodity: 'MSFT',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:US:GOOGL',
    yahoo: 'GOOGL',
    account: 'US',
    target: 10,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:GOOGL',
    commodity: 'GOOGL',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:US:TSLA',
    yahoo: 'TSLA',
    account: 'US',
    target: 10,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:TSLA',
    commodity: 'TSLA',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:US:AMZN',
    yahoo: 'AMZN',
    account: 'US',
    target: 5,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:AMZN',
    commodity: 'AMZN',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:US:QQQ',
    yahoo: 'QQQ',
    account: 'US',
    target: 10,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:QQQ',
    commodity: 'QQQ',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:US:SPY',
    yahoo: 'SPY',
    account: 'US',
    target: 10,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:SPY',
    commodity: 'SPY',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:US:PLTR',
    yahoo: 'PLTR',
    account: 'US',
    target: 2,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:PLTR',
    commodity: 'PLTR',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:US:NFLX',
    yahoo: 'NFLX',
    account: 'US',
    target: 1,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:NFLX',
    commodity: 'NFLX',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:US:MSTR',
    yahoo: 'MSTR',
    account: 'US',
    target: 1,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:MSTR',
    commodity: 'MSTR',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:US:HOOD',
    yahoo: 'HOOD',
    account: 'US',
    target: 1,
    currency: 'USD',
    cash: 'USD',
    posting: 'Assets:Equity:US:HOOD',
    commodity: 'HOOD',
    decimals: 8,
  },
  {
    subject: 'Asset:Equity:CN:159915',
    yahoo: '159915.SZ',
    account: 'CN',
    target: 15,
    currency: 'CNY',
    cash: 'CNY',
    posting: 'Assets:Equity:CN:159915',
    commodity: '159915.SZ',
    decimals: 0,
  },
  {
    subject: 'Asset:Equity:CN:588000',
    yahoo: '588000.SS',
    account: 'CN',
    target: 15,
    currency: 'CNY',
    cash: 'CNY',
    posting: 'Assets:Equity:CN:588000',
    commodity: '588000.SS',
    decimals: 0,
  },
  {
    subject: 'Asset:Equity:CN:510500',
    yahoo: '510500.SS',
    account: 'CN',
    target: 30,
    currency: 'CNY',
    cash: 'CNY',
    posting: 'Assets:Equity:CN:510500',
    commodity: '510500.SS',
    decimals: 0,
  },
  {
    subject: 'Asset:Equity:CN:159819',
    yahoo: '159819.SZ',
    account: 'CN',
    target: 10,
    currency: 'CNY',
    cash: 'CNY',
    posting: 'Assets:Equity:CN:159819',
    commodity: '159819.SZ',
    decimals: 0,
  },
  {
    subject: 'Asset:Equity:CN:588200',
    yahoo: '588200.SS',
    account: 'CN',
    target: 10,
    currency: 'CNY',
    cash: 'CNY',
    posting: 'Assets:Equity:CN:588200',
    commodity: '588200.SS',
    decimals: 0,
  },
  {
    subject: 'Asset:Equity:CN:513130',
    yahoo: '513130.SS',
    account: 'CN',
    target: 5,
    currency: 'CNY',
    cash: 'CNY',
    posting: 'Assets:Equity:CN:513130',
    commodity: '513130.SS',
    decimals: 0,
  },
  {
    subject: 'Asset:Equity:CN:600036',
    yahoo: '600036.SS',
    account: 'CN',
    target: 5,
    currency: 'CNY',
    cash: 'CNY',
    posting: 'Assets:Equity:CN:600036',
    commodity: '600036.SS',
    decimals: 0,
  },
  {
    subject: 'Asset:Equity:CN:600900',
    yahoo: '600900.SS',
    account: 'CN',
    target: 5,
    currency: 'CNY',
    cash: 'CNY',
    posting: 'Assets:Equity:CN:600900',
    commodity: '600900.SS',
    decimals: 0,
  },
  {
    subject: 'Asset:Equity:HK:1810',
    yahoo: '1810.HK',
    account: 'HK',
    target: 30,
    currency: 'HKD',
    cash: 'HKD',
    posting: 'Assets:Equity:HK:1810',
    commodity: '1810.HK',
    decimals: 0,
  },
  {
    subject: 'Asset:Equity:HK:0700',
    yahoo: '0700.HK',
    account: 'HK',
    target: 50,
    currency: 'HKD',
    cash: 'HKD',
    posting: 'Assets:Equity:HK:0700',
    commodity: '0700.HK',
    decimals: 0,
  },
  {
    subject: 'Asset:Equity:HK:2097',
    yahoo: '2097.HK',
    account: 'HK',
    target: 20,
    currency: 'HKD',
    cash: 'HKD',
    posting: 'Assets:Equity:HK:2097',
    commodity: '2097.HK',
    decimals: 0,
  },
]

// Hyperliquid (HYPE) weekly OHLC — real 2025–2026 dates (listing is recent; may lack 100-bar lookback)
const FALLBACK_WEEKLY = {
  HYPE: [
    { date: '2025-11-28', close: 4.2, high: 4.5, low: 3.8 },
    { date: '2025-12-05', close: 5.1, high: 5.4, low: 4.0 },
    { date: '2025-12-12', close: 6.8, high: 7.2, low: 5.0 },
    { date: '2025-12-19', close: 5.5, high: 7.0, low: 5.2 },
    { date: '2025-12-26', close: 4.9, high: 5.8, low: 4.6 },
    { date: '2026-01-02', close: 5.6, high: 6.1, low: 4.8 },
    { date: '2026-01-09', close: 4.3, high: 5.7, low: 4.1 },
    { date: '2026-01-16', close: 3.9, high: 4.5, low: 3.5 },
    { date: '2026-01-23', close: 4.8, high: 5.0, low: 3.8 },
    { date: '2026-01-30', close: 5.2, high: 5.5, low: 4.6 },
    { date: '2026-02-06', close: 4.1, high: 5.3, low: 3.9 },
    { date: '2026-02-13', close: 3.6, high: 4.2, low: 3.2 },
    { date: '2026-02-20', close: 3.2, high: 3.8, low: 2.9 },
    { date: '2026-02-27', close: 3.8, high: 4.0, low: 3.1 },
    { date: '2026-03-06', close: 4.5, high: 4.8, low: 3.7 },
    { date: '2026-03-13', close: 5.8, high: 6.2, low: 4.4 },
    { date: '2026-03-20', close: 6.5, high: 7.0, low: 5.6 },
    { date: '2026-03-27', close: 7.2, high: 7.8, low: 6.4 },
    { date: '2026-04-03', close: 6.1, high: 7.5, low: 5.8 },
    { date: '2026-04-10', close: 5.4, high: 6.3, low: 5.0 },
    { date: '2026-04-17', close: 6.8, high: 7.1, low: 5.3 },
    { date: '2026-04-24', close: 8.5, high: 9.0, low: 6.7 },
    { date: '2026-05-01', close: 10.2, high: 11.0, low: 8.4 },
    { date: '2026-05-08', close: 12.5, high: 13.5, low: 10.0 },
    { date: '2026-05-15', close: 14.8, high: 16.0, low: 12.2 },
    { date: '2026-05-22', close: 13.2, high: 15.5, low: 12.8 },
    { date: '2026-05-29', close: 15.6, high: 16.8, low: 13.0 },
    { date: '2026-06-05', close: 18.4, high: 20.0, low: 15.5 },
    { date: '2026-06-12', close: 22.1, high: 24.0, low: 18.0 },
    { date: '2026-06-19', close: 25.5, high: 28.0, low: 21.5 },
    { date: '2026-06-26', close: 28.8, high: 32.0, low: 25.0 },
    { date: '2026-07-03', close: 31.2, high: 34.0, low: 28.5 },
  ],
}

function inSignalWindow(date) {
  return date >= SIGNAL_START && date <= SIGNAL_END
}

function buyAmountUsd(asset) {
  const accountTarget = ACCOUNT_TARGET[asset.account]
  const n = TRANCHES[asset.account]
  return (CAPITAL * accountTarget * (asset.target / 100)) / n
}

function buyAmountNative(asset) {
  const usd = buyAmountUsd(asset)
  if (asset.currency === 'CNY') return usd * FX.CNY
  if (asset.currency === 'HKD') return usd * FX.HKD
  return usd
}

function computeRsi(closes, period = 14) {
  const rsi = Array(closes.length).fill(null)
  if (closes.length <= period) return rsi

  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1]
    if (change >= 0) avgGain += change
    else avgLoss -= change
  }
  avgGain /= period
  avgLoss /= period
  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? -change : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  }
  return rsi
}

function computeStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
  const k = Array(closes.length).fill(null)
  const d = Array(closes.length).fill(null)

  for (let i = kPeriod - 1; i < closes.length; i++) {
    const sliceHigh = highs.slice(i - kPeriod + 1, i + 1)
    const sliceLow = lows.slice(i - kPeriod + 1, i + 1)
    const highest = Math.max(...sliceHigh)
    const lowest = Math.min(...sliceLow)
    k[i] = highest === lowest ? 50 : ((closes[i] - lowest) / (highest - lowest)) * 100
  }

  for (let i = kPeriod - 1 + dPeriod - 1; i < closes.length; i++) {
    const slice = k.slice(i - dPeriod + 1, i + 1)
    if (slice.some((v) => v === null)) continue
    d[i] = slice.reduce((sum, v) => sum + v, 0) / dPeriod
  }

  return { k, d }
}

function weekKey(epochSeconds) {
  const date = new Date(epochSeconds * 1000)
  const day = date.getUTCDay()
  const friday = new Date(date)
  friday.setUTCDate(date.getUTCDate() + ((5 - day + 7) % 7))
  return friday.toISOString().slice(0, 10)
}

function aggregateDailyToWeekly(dailyBars) {
  const weeks = new Map()
  for (const bar of dailyBars) {
    const key = weekKey(bar.epoch)
    const existing = weeks.get(key)
    if (!existing) {
      weeks.set(key, { date: key, high: bar.high, low: bar.low, close: bar.close })
      continue
    }
    existing.high = Math.max(existing.high, bar.high)
    existing.low = Math.min(existing.low, bar.low)
    existing.close = bar.close
  }
  return Array.from(weeks.values()).sort((a, b) => a.date.localeCompare(b.date))
}

async function fetchDailyBars(yahooSymbol) {
  const period1 = Math.floor(new Date(HISTORY_START).getTime() / 1000)
  const period2 = Math.floor(new Date(HISTORY_END).getTime() / 1000)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&period1=${period1}&period2=${period2}`
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!response.ok) throw new Error(`Yahoo ${yahooSymbol}: HTTP ${response.status}`)
  const payload = await response.json()
  const result = payload.chart?.result?.[0]
  if (!result) throw new Error(`Yahoo ${yahooSymbol}: no data`)

  const timestamps = result.timestamp ?? []
  const quote = result.indicators.quote[0]
  const closes = quote.close
  const highs = quote.high
  const lows = quote.low

  const bars = []
  for (let i = 0; i < timestamps.length; i++) {
    if (closes[i] == null || highs[i] == null || lows[i] == null) continue
    bars.push({
      epoch: timestamps[i],
      close: closes[i],
      high: highs[i],
      low: lows[i],
    })
  }
  return bars
}

async function fetchWeeklyBars(asset) {
  if (asset.fallback && FALLBACK_WEEKLY[asset.fallback]) {
    return FALLBACK_WEEKLY[asset.fallback]
  }
  const daily = await fetchDailyBars(asset.yahoo)
  const weekly = aggregateDailyToWeekly(daily)
  if (weekly.length < INDICATOR_LOOKBACK_BARS + 1) {
    throw new Error(
      `Yahoo ${asset.yahoo}: insufficient weekly bars (${weekly.length}); need ≥${INDICATOR_LOOKBACK_BARS + 1} for RSI/KD lookback`,
    )
  }
  return weekly
}

function formatNumber(value, decimals) {
  if (decimals === 0) return Math.round(value).toLocaleString('en-US')
  return value.toLocaleString('en-US', {
    minimumFractionDigits: Math.min(decimals, 2),
    maximumFractionDigits: decimals,
  })
}

function formatPrice(value, currency) {
  if (currency === 'USD' && value < 0.01) {
    return value.toLocaleString('en-US', { maximumSignificantDigits: 10 })
  }
  if (value >= 1000) return formatNumber(value, 2)
  if (value >= 1) return formatNumber(value, 2)
  return value.toLocaleString('en-US', { maximumSignificantDigits: 8 })
}

function padPosting(account, qtyPart, pricePart = '') {
  const left = `  ${account}`
  const right = pricePart ? `${qtyPart} ${pricePart}` : qtyPart
  const spaces = Math.max(1, 28 - left.length)
  return `${left}${' '.repeat(spaces)}${right}`
}

function buildSignals(bars) {
  const closes = bars.map((b) => b.close)
  const highs = bars.map((b) => b.high)
  const lows = bars.map((b) => b.low)
  const rsi = computeRsi(closes)
  const { k, d } = computeStochastic(highs, lows, closes)

  const signals = []
  for (let i = 1; i < bars.length; i++) {
    // Require ≥100 prior weekly bars so Wilder RSI has fully warmed up.
    if (i < INDICATOR_LOOKBACK_BARS) continue

    const date = bars[i].date
    if (!inSignalWindow(date)) continue

    const rsiVal = rsi[i]
    const kVal = k[i]
    const dVal = d[i]
    const prevK = k[i - 1]
    const prevD = d[i - 1]
    const price = bars[i].close

    const rsiOversold = rsiVal != null && rsiVal < 30
    const kdOversold =
      kVal != null &&
      dVal != null &&
      prevK != null &&
      prevD != null &&
      kVal < 20 &&
      prevK <= prevD &&
      kVal > dVal
    const rsiOverbought = rsiVal != null && rsiVal > 70
    const kdOverbought =
      kVal != null &&
      dVal != null &&
      prevK != null &&
      prevD != null &&
      kVal > 80 &&
      prevK >= prevD &&
      kVal < dVal

    let type = null
    let reason = null
    if (rsiOverbought || kdOverbought) {
      type = 'sell'
      if (rsiOverbought && kdOverbought) reason = '周线 RSI/KD 超买'
      else if (rsiOverbought) reason = '周线 RSI 超买'
      else reason = '周线 KD 超买'
    } else if (rsiOversold || kdOversold) {
      type = 'buy'
      if (rsiOversold && kdOversold) reason = '周线 RSI/KD 超卖'
      else if (rsiOversold) reason = '周线 RSI 超卖'
      else reason = '周线 KD 超卖'
    }

    if (type) {
      signals.push({ date, type, reason, price })
    }
  }
  return signals
}

async function main() {
  const allTxns = []
  const failures = []

  for (const asset of ASSETS) {
    try {
      const bars = await fetchWeeklyBars(asset)
      const signals = buildSignals(bars)
      for (const signal of signals) {
        allTxns.push({ asset, ...signal })
      }
      await new Promise((r) => setTimeout(r, 120))
    } catch (error) {
      failures.push({ asset: asset.subject, error: String(error) })
    }
  }

  if (failures.length) {
    console.error('Fetch failures:', failures)
  }

  allTxns.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date)
    if (dateCmp !== 0) return dateCmp
    return a.asset.subject.localeCompare(b.asset.subject)
  })

  const holdings = new Map()
  const lines = []

  lines.push('2026-01-01 txn Account:Crypto "Deploy Crypto cash"')
  lines.push('  Assets:Cash:USD        500,000 USD')
  lines.push('  Equity:Capital        -500,000 USD')
  lines.push('')
  lines.push('2026-01-01 txn Account:US "Deploy US cash"')
  lines.push('  Assets:Cash:USD        250,000 USD')
  lines.push('  Equity:Capital        -250,000 USD')
  lines.push('')
  lines.push('2026-01-01 txn Account:CN "Deploy CN cash"')
  lines.push('  Assets:Cash:CNY      1,050,000 CNY')
  lines.push('  Equity:Capital      -1,050,000 CNY')
  lines.push('')
  lines.push('2026-01-01 txn Account:HK "Deploy HK cash"')
  lines.push('  Assets:Cash:HKD        784,000 HKD')
  lines.push('  Equity:Capital        -784,000 HKD')
  lines.push('')

  for (const txn of allTxns) {
    const { asset, date, type, reason, price } = txn
    const fee = FEE[asset.cash]
    const cashAccount = `Assets:Cash:${asset.cash}`

    if (type === 'buy') {
      const budget = buyAmountNative(asset)
      const netBudget = budget
      let quantity = netBudget / price
      if (asset.decimals === 0) quantity = Math.floor(quantity)
      if (quantity <= 0) continue

      const gross = quantity * price
      holdings.set(asset.subject, (holdings.get(asset.subject) ?? 0) + quantity)

      lines.push(`${date} txn ${asset.subject} "${reason}，买入 ${asset.commodity.split('.')[0]}"`)

      const qtyStr = formatNumber(quantity, asset.decimals)
      const priceStr = formatPrice(price, asset.currency)
      lines.push(
        padPosting(
          asset.posting,
          `${qtyStr} ${asset.commodity}`,
          `@ ${priceStr} ${asset.currency}`,
        ),
      )
      lines.push(
        padPosting(
          cashAccount,
          `-${formatNumber(gross + fee, asset.currency === 'USD' ? 2 : 0)} ${asset.cash}`,
          '',
        ),
      )
      lines.push(`  Expenses:Fee${' '.repeat(17)}${fee} ${asset.cash}`)
      lines.push('')
      continue
    }

    const held = holdings.get(asset.subject) ?? 0
    if (held <= 0) continue

    const sellPct = SELL_PCT[asset.account]
    let quantity = held * sellPct
    if (asset.decimals === 0) quantity = Math.max(1, Math.floor(quantity))
    if (quantity > held) quantity = held
    if (quantity <= 0) continue

    const proceeds = quantity * price
    holdings.set(asset.subject, held - quantity)

    lines.push(`${date} txn ${asset.subject} "${reason}，减仓 ${asset.commodity.split('.')[0]}"`)
    const qtyStr = formatNumber(quantity, asset.decimals)
    const priceStr = formatPrice(price, asset.currency)
    lines.push(
      padPosting(asset.posting, `-${qtyStr} ${asset.commodity}`, `@ ${priceStr} ${asset.currency}`),
    )
    lines.push(
      padPosting(
        cashAccount,
        `${formatNumber(proceeds - fee, asset.currency === 'USD' ? 2 : 0)} ${asset.cash}`,
        '',
      ),
    )
    lines.push(`  Expenses:Fee${' '.repeat(17)}${fee} ${asset.cash}`)
    lines.push('')
  }

  process.stdout.write(lines.join('\n'))
  console.error(
    `\nGenerated ${allTxns.length} raw signals, ${lines.filter((l) => l.includes(' txn ')).length} transactions`,
    { stderr: true },
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
