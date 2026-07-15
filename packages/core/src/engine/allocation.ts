import { convertToBaseCurrency } from '../core/fx'
import { parseMoney, parsePercent } from '../core/values'
import type {
  AllocationAccount,
  AllocationResult,
  MoneyAmount,
  NavorAst,
  NavorDiagnostic,
} from '../types'

export interface GenerateAllocationOptions {
  baseCurrency?: string | null
  fxRates?: Record<string, number>
}

type AccountWithMarket = AllocationAccount & { market: string | null }

export function generateAllocation(
  ast: NavorAst,
  options: GenerateAllocationOptions = {},
): AllocationResult {
  const diagnostics: NavorDiagnostic[] = []
  const capitalDirective = ast.directives.find((directive) => directive.directive === 'capital')
  const accountDirectives = ast.directives.filter(
    (directive) => directive.directive === 'open' && directive.subject.startsWith('Account:'),
  )
  const assetDirectives = ast.directives.filter(
    (directive) => directive.directive === 'open' && directive.subject.startsWith('Asset:'),
  )
  const fxRates = options.fxRates ?? {}
  const capitalAmount = capitalDirective
    ? parseMoney(capitalDirective.metadata.amount ?? null)
    : null
  const capital =
    capitalDirective && capitalAmount
      ? {
          subject: capitalDirective.subject,
          ...capitalAmount,
        }
      : null
  const baseCurrency = options.baseCurrency ?? capital?.currency ?? null

  const accounts: AccountWithMarket[] = accountDirectives.map((directive) => {
    const account = {
      subject: directive.subject,
      title: directive.title,
      target: parsePercent(directive.metadata.target ?? null),
      total: parseMoney(directive.metadata.total ?? null),
      budget: parseMoney(directive.metadata.budget ?? null),
      allocatedPercent: parsePercent(directive.metadata.allocated_percent ?? null),
      market: directive.metadata.market ?? null,
      baseAmount: null as MoneyAmount | null,
    }
    account.baseAmount = resolveAccountBase(account, capital, { baseCurrency, fxRates })
    return account
  })
  const accountBySubject = new Map(accounts.map((account) => [account.subject, account]))

  const assets = assetDirectives.map((directive) => {
    const accountSubject = directive.metadata.account ?? null
    const account = accountSubject ? accountBySubject.get(accountSubject) : undefined
    const target = parsePercent(directive.metadata.target ?? null)

    if (accountSubject && !account) {
      diagnostics.push({
        line: directive.line,
        file: directive.file,
        message: `Asset "${directive.subject}" references missing Account "${accountSubject}".`,
      })
    }

    if (directive.metadata.allocation_value) {
      diagnostics.push({
        line: directive.line,
        file: directive.file,
        message:
          'allocation_value is deprecated and ignored; target amount is derived from Account budget or total and Asset target.',
      })
    }

    return {
      subject: directive.subject,
      title: directive.title,
      account: accountSubject,
      target,
      targetAmount: deriveAssetTargetAmount(account, target, capital, {
        baseCurrency,
        fxRates,
      }),
      derivedPortfolioWeight:
        account?.target !== null && account?.target !== undefined && target !== null
          ? (account.target * target) / 100
          : null,
    }
  })

  const accountTargetTotal = sumTargets(accounts)

  if (accountTargetTotal > 100 && accounts[0]) {
    diagnostics.push({
      line: accountDirectives[0]?.line ?? 1,
      file: accountDirectives[0]?.file,
      message: `Account targets total ${formatPercent(accountTargetTotal)}%, which exceeds 100%.`,
    })
  }

  for (const account of accounts) {
    const accountAssets = assets.filter((asset) => asset.account === account.subject)
    const accountAssetDirectives = assetDirectives.filter(
      (directive) => directive.metadata.account === account.subject,
    )
    const assetTargetTotal = sumTargets(accountAssets)

    if (assetTargetTotal > 100 && accountAssets[0]) {
      diagnostics.push({
        line: accountAssetDirectives[0]?.line ?? 1,
        file: accountAssetDirectives[0]?.file,
        message: `Asset targets for Account "${account.subject}" total ${formatPercent(
          assetTargetTotal,
        )}%, which exceeds 100%.`,
      })
    }
  }

  return {
    capital,
    accounts: accounts.map(({ market: _market, ...account }) => account),
    assets,
    diagnostics,
  }
}

function deriveAssetTargetAmount(
  account: AccountWithMarket | undefined,
  target: number | null,
  capital: (MoneyAmount & { subject: string }) | null,
  options: { baseCurrency: string | null; fxRates: Record<string, number> },
): MoneyAmount | null {
  if (!account || target === null || target === undefined) {
    return null
  }

  const accountBase = resolveAccountBase(account, capital, options)

  if (!accountBase) {
    return null
  }

  return {
    amount: (accountBase.amount * target) / 100,
    currency: accountBase.currency,
  }
}

function resolveAccountBase(
  account: AccountWithMarket,
  capital: MoneyAmount | null,
  options: { baseCurrency: string | null; fxRates: Record<string, number> },
): MoneyAmount | null {
  if (account.budget) {
    return account.budget
  }

  if (account.total) {
    return account.total
  }

  if (capital && account.target !== null && account.target !== undefined) {
    const capitalShare = {
      amount: (capital.amount * account.target) / 100,
      currency: capital.currency,
    }
    const marketCurrency = currencyForMarket(account.market)

    if (!marketCurrency || marketCurrency === capitalShare.currency) {
      return capitalShare
    }

    if (!options.baseCurrency) {
      return capitalShare
    }

    return (
      convertMoney(capitalShare, marketCurrency, options.baseCurrency, options.fxRates) ??
      capitalShare
    )
  }

  return null
}

function convertMoney(
  value: MoneyAmount,
  targetCurrency: string,
  baseCurrency: string,
  fxRates: Record<string, number>,
): MoneyAmount | null {
  if (value.currency === targetCurrency) {
    return value
  }

  const inBase = convertToBaseCurrency(value, baseCurrency, fxRates)

  if (!inBase) {
    return null
  }

  if (inBase.currency === targetCurrency) {
    return inBase
  }

  const rate = fxRates[targetCurrency]

  if (!rate) {
    return null
  }

  return {
    amount: inBase.amount * rate,
    currency: targetCurrency,
  }
}

function currencyForMarket(market: string | null): string | null {
  if (!market) {
    return null
  }

  const primary = market.split(',')[0]?.trim().toUpperCase()

  switch (primary) {
    case 'CN':
      return 'CNY'
    case 'HK':
      return 'HKD'
    case 'US':
      return 'USD'
    default:
      return null
  }
}

function sumTargets(items: Array<{ target: number | null }>): number {
  return items.reduce((total, item) => total + (item.target ?? 0), 0)
}

function formatPercent(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value)
}
