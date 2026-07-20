import { formatNumber, readerLocale, t } from '../i18n'

export function formatMoney(value: { amount: number; currency: string } | null | undefined) {
  if (!value) {
    return t('Not available')
  }

  const magnitude = Math.abs(value.amount)
  const amount =
    magnitude > 0 && magnitude < 0.01
      ? formatNumber(value.amount, { maximumSignificantDigits: 6 })
      : formatNumber(value.amount)

  return `${amount} ${value.currency}`
}

/** Quantity + commodity with a middle-dot so digit-leading symbols (e.g. 1810.HK) do not blend into the count. */
export function formatQuantityCommodity(quantity: number, commodity: string) {
  const sign = quantity < 0 ? '-' : ''
  const amount = formatNumber(Math.abs(quantity))

  return `${sign}${amount} · ${commodity}`
}

export function formatSignedMoney(value: { amount: number; currency: string } | null | undefined) {
  if (!value) {
    return t('Not available')
  }

  const sign = value.amount > 0 ? '+' : value.amount < 0 ? '-' : ''

  return `${sign}${formatNumber(Math.abs(value.amount))} ${value.currency}`
}

export function formatMoneyList(values: Array<{ amount: number; currency: string } | null>) {
  const totals = groupMoneyValues(values)

  if (totals.length === 0) {
    return t('Not available')
  }

  return formatMoneyParts(totals)
}

export function groupMoneyValues(
  values: Array<{ amount: number; currency: string } | null | undefined>,
) {
  const totals = new Map<string, number>()

  for (const value of values) {
    if (!value) {
      continue
    }

    totals.set(value.currency, (totals.get(value.currency) ?? 0) + value.amount)
  }

  return Array.from(totals.entries()).map(([currency, amount]) => ({ amount, currency }))
}

export function pickMoneyCurrency(
  values: Array<{ amount: number; currency: string }>,
  currency: string | null | undefined,
) {
  if (values.length === 0) {
    return null
  }

  return values.find((value) => value.currency === currency) ?? values[0] ?? null
}

export function countOtherCurrencies(
  values: Array<{ amount: number; currency: string }>,
  primary: { amount: number; currency: string } | null,
) {
  return primary ? values.filter((value) => value.currency !== primary.currency).length : 0
}

export function formatPnlCoverageDetail({
  hasBaseTotal,
  unconvertedCurrencies,
  otherCurrencyCount,
}: {
  hasBaseTotal: boolean
  unconvertedCurrencies: string[]
  otherCurrencyCount: number
}) {
  if (hasBaseTotal) {
    if (unconvertedCurrencies.length > 0) {
      return `${unconvertedCurrencies.length} ${t(
        unconvertedCurrencies.length === 1 ? 'unconverted currency' : 'unconverted currencies',
      )}`
    }

    return t('Realized + unrealized, base converted')
  }

  if (otherCurrencyCount > 0) {
    return `${otherCurrencyCount} ${t(
      otherCurrencyCount === 1 ? 'unconverted currency' : 'unconverted currencies',
    )}`
  }

  return t('Realized + unrealized')
}

export function formatWorkspacePath(root: string, file: string) {
  const normalizedRoot = root.replaceAll('\\', '/').replace(/\/+$/, '')
  const normalizedFile = file.replaceAll('\\', '/')

  if (normalizedFile.startsWith(`${normalizedRoot}/`)) {
    return normalizedFile.slice(normalizedRoot.length + 1)
  }

  return normalizedFile.replace(/^\.\//, '')
}

export function formatTimestamp(value: string | null | undefined) {
  if (!value) {
    return t('No timestamp')
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(readerLocale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatCashList(values: Array<{ amount: number; currency: string }>) {
  if (values.length === 0) {
    return t('Not available')
  }

  return formatMoneyParts(values)
}

export function formatBaseMoney(
  primary: { amount: number; currency: string } | null | undefined,
  detail?: string | null,
) {
  return {
    value: formatMoney(primary),
    detail: detail ?? (primary?.currency ? `Base ${primary.currency}` : undefined),
  }
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return t('Not available')
  }

  return `${value.toFixed(1)}%`
}

export function formatSignedPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return t('Not available')
  }

  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function driftStatusLabel(status: string) {
  switch (status) {
    case 'on_track':
      return t('On track')
    case 'below_min':
      return t('Below min')
    case 'above_max':
      return t('Above max')
    default:
      return t('Unknown')
  }
}

export function convertToBaseCurrency(
  value: { amount: number; currency: string },
  baseCurrency: string,
  fxRates: Record<string, number> | null | undefined,
) {
  const rates = fxRates ?? {}

  if (value.currency === baseCurrency) {
    return value
  }

  const rate = rates[value.currency]

  if (!rate) {
    return null
  }

  return {
    amount: value.amount / rate,
    currency: baseCurrency,
  }
}

export function sumMoneyInBase(
  values: Array<{ amount: number; currency: string } | null | undefined>,
  baseCurrency: string | null | undefined,
  fxRates: Record<string, number> | null | undefined,
) {
  if (!baseCurrency) {
    return {
      total: null,
      unconvertedCurrencies: [] as string[],
    }
  }

  const rates = fxRates ?? {}

  const unconverted = new Set<string>()
  let total = 0
  let convertedCount = 0

  for (const value of values) {
    if (!value) {
      continue
    }

    const converted = convertToBaseCurrency(value, baseCurrency, rates)

    if (!converted) {
      unconverted.add(value.currency)
      continue
    }

    total += converted.amount
    convertedCount += 1
  }

  return {
    total: convertedCount > 0 ? { amount: total, currency: baseCurrency } : null,
    unconvertedCurrencies: [...unconverted],
  }
}

export function formatFxCoverage(
  fxRates: Record<string, number> | null | undefined,
  unconvertedCurrencies: string[] | null | undefined,
) {
  const rates = fxRates ?? {}
  const unconverted = unconvertedCurrencies ?? []
  const configured = Object.keys(rates)

  if (configured.length === 0) {
    return unconverted.length > 0 ? 'No FX rates configured' : null
  }

  const configuredRates = configured
    .sort()
    .map((currency) => `${currency} ${formatFxRate(rates[currency] ?? 0)}`)
    .join(' · ')

  if (unconverted.length === 0) {
    return `FX: ${configuredRates}`
  }

  return `FX: ${configuredRates} · missing ${unconverted.join(', ')}`
}

function formatFxRate(rate: number) {
  return rate.toFixed(4).replace(/0{1,2}$/, '')
}

function formatMoneyParts(values: Array<{ amount: number; currency: string }>) {
  return values
    .map((value, index) => {
      const sign = value.amount < 0 ? '-' : index === 0 ? '' : '+ '
      const gap = sign && !sign.endsWith(' ') ? '' : ''

      return `${sign}${gap}${Math.abs(value.amount).toLocaleString()} ${value.currency}`
    })
    .join(' ')
}
