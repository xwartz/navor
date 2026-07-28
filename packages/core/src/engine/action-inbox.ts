import type {
  DashboardActionItem,
  DashboardActionReason,
  DashboardAssetExecution,
  DashboardPriceState,
  DashboardView,
  DriftResult,
} from '../types'

export interface InvestmentActionInboxSignals {
  today?: string
  pendingReviews: DashboardView['pendingReviews']
  assetExecutions: DashboardAssetExecution[]
  drift: DriftResult
  priceStates: DashboardPriceState[]
}

/** Derives the Reader's ordered investment-process actions from Engine signals. */
export function buildInvestmentActionInbox({
  today,
  pendingReviews,
  assetExecutions,
  drift,
  priceStates,
}: InvestmentActionInboxSignals): DashboardActionItem[] {
  const assetBySubject = new Map(assetExecutions.map((asset) => [asset.subject, asset]))
  const heldSubjects = new Set(
    assetExecutions.filter((asset) => asset.holding).map((asset) => asset.subject),
  )
  const driftBySubject = new Map(drift.entries.map((entry) => [entry.subject, entry]))
  const actions: DashboardActionItem[] = []

  for (const review of pendingReviews) {
    actions.push({
      id: `review_due:${review.subject}:${review.reviewBy}`,
      type: 'review_due',
      severity: 'high',
      category: 'process_due',
      ...priorityDetails({
        type: 'review_due',
        today,
        drift: driftBySubject.get(review.subject),
        reviewBy: review.reviewBy,
      }),
      subject: review.subject,
      title: review.title,
      message: `Review due ${review.reviewBy}.`,
      action: 'Review thesis',
      date: review.reviewBy,
    })
  }

  for (const entry of drift.entries) {
    if (entry.status !== 'above_max' && entry.status !== 'below_min') continue
    actions.push({
      id: `${entry.status}:${entry.subject}`,
      type: entry.status,
      severity: entry.status === 'above_max' ? 'high' : 'medium',
      category: 'investment_risk',
      ...priorityDetails({ type: entry.status, drift: entry }),
      subject: entry.subject,
      title: entry.title,
      message: `${entry.title ?? entry.subject} is ${entry.status === 'above_max' ? 'above max' : 'below min'}.`,
      action: entry.status === 'above_max' ? 'Consider trim' : 'Consider accumulate',
      date: null,
    })
  }

  for (const asset of assetExecutions) {
    if (asset.status === 'currency_mismatch') {
      actions.push({
        id: `currency_mismatch:${asset.subject}`,
        type: 'currency_mismatch',
        severity: 'medium',
        category: 'data_integrity',
        ...priorityDetails({ type: 'currency_mismatch', drift: driftBySubject.get(asset.subject) }),
        subject: asset.subject,
        title: asset.title,
        message: `${asset.title ?? asset.subject} target is in ${asset.targetAmount?.currency} but invested cost is in ${asset.investedCost?.currency}.`,
        action: 'Check currency conversion',
        date: null,
      })
    } else if ((asset.investedPercent ?? 0) > 100) {
      actions.push({
        id: `over_invested:${asset.subject}`,
        type: 'over_invested',
        severity: 'high',
        category: 'investment_risk',
        ...priorityDetails({
          type: 'over_invested',
          drift: driftBySubject.get(asset.subject),
          investedPercent: asset.investedPercent,
        }),
        subject: asset.subject,
        title: asset.title,
        message: `${asset.title ?? asset.subject} is ${(asset.investedPercent ?? 0).toFixed(1)}% invested.`,
        action: 'Review target amount',
        date: null,
      })
    }
  }

  for (const priceState of priceStates) {
    if (!heldSubjects.has(priceState.subject) || priceState.status === 'fresh') continue
    const asset = assetBySubject.get(priceState.subject)
    const type =
      priceState.status === 'failed'
        ? 'failed_price'
        : priceState.status === 'stale'
          ? 'stale_price'
          : 'missing_price'
    actions.push({
      id: `${type}:${priceState.subject}`,
      type,
      severity: priceState.status === 'failed' ? 'high' : 'medium',
      category: 'data_integrity',
      ...priorityDetails({ type, drift: driftBySubject.get(priceState.subject) }),
      subject: priceState.subject,
      title: asset?.title ?? priceState.subject,
      message:
        priceState.status === 'failed'
          ? (priceState.message ?? 'Price refresh failed.')
          : priceState.status === 'stale'
            ? 'Price is stale.'
            : 'Held asset has no market price.',
      action: 'Check price source',
      date: priceState.asOf,
    })
  }

  return actions.sort(compareDashboardActions)
}

function priorityDetails({
  type,
  today,
  drift,
  reviewBy,
  investedPercent,
}: {
  type: DashboardActionItem['type']
  today?: string
  drift?: DriftResult['entries'][number]
  reviewBy?: string
  investedPercent?: number | null
}) {
  const impactAmount = drift?.marketValueInBase ?? null
  const impactPercent = drift?.actualWeight ?? null
  const exposureScore = impactPercent === null ? 0 : Math.min(Math.round(impactPercent), 99)
  const driftScore =
    type === 'above_max' || type === 'below_min'
      ? Math.min(Math.round(Math.abs(drift?.drift ?? 0) * 2), 99)
      : 0
  const overdueDays = reviewBy && today ? daysBetween(reviewBy, today) : 0
  const investedExcess =
    type !== 'over_invested' || investedPercent == null ? 0 : Math.max(investedPercent - 100, 0)
  return {
    priorityScore: Math.round(
      priorityBaseScore(type) +
        exposureScore +
        driftScore +
        (type === 'review_due' ? Math.min(overdueDays, 99) : 0) +
        Math.min(investedExcess, 99),
    ),
    reason: priorityReason({
      type,
      impactPercent,
      drift: drift?.drift ?? null,
      overdueDays,
      investedExcess,
    }),
    impactAmount,
    impactPercent,
  }
}

function priorityBaseScore(type: DashboardActionItem['type']) {
  return {
    failed_price: 900,
    above_max: 760,
    over_invested: 730,
    review_due: 680,
    currency_mismatch: 620,
    missing_price: 580,
    stale_price: 540,
    below_min: 500,
  }[type]
}
function priorityReason({
  type,
  impactPercent,
  drift,
  overdueDays,
  investedExcess,
}: {
  type: DashboardActionItem['type']
  impactPercent: number | null
  drift: number | null
  overdueDays: number
  investedExcess: number
}): DashboardActionReason {
  if (type === 'review_due') return { kind: 'review_due', overdueDays, impactPercent }
  if (type === 'above_max' || type === 'below_min') return { kind: type, drift, impactPercent }
  if (type === 'over_invested') return { kind: 'over_invested', investedExcess, impactPercent }
  if (type === 'currency_mismatch') return { kind: 'currency_mismatch', impactPercent }
  return { kind: type, impactPercent }
}
function daysBetween(start: string, end: string) {
  const a = Date.parse(`${start}T00:00:00Z`)
  const b = Date.parse(`${end}T00:00:00Z`)
  return Number.isNaN(a) || Number.isNaN(b) ? 0 : Math.max(Math.floor((b - a) / 86_400_000), 0)
}
function compareDashboardActions(left: DashboardActionItem, right: DashboardActionItem) {
  return left.priorityScore !== right.priorityScore
    ? right.priorityScore - left.priorityScore
    : left.severity !== right.severity
      ? severityRank(right.severity) - severityRank(left.severity)
      : left.id.localeCompare(right.id)
}
function severityRank(severity: DashboardActionItem['severity']) {
  return severity === 'high' ? 3 : severity === 'medium' ? 2 : 1
}
