import type { NavorRendererAppState } from '@navor/contract'

import { formatQuantityCommodity } from './components/format'
import { t } from './i18n'
import type { ReaderView } from './navigation'

export interface SearchHit {
  id: string
  view: ReaderView
  subject: string
  title: string
  meta: string
  excerpt: string
}

export function buildSearchHits(state: NavorRendererAppState): SearchHit[] {
  const hits: SearchHit[] = []

  for (const item of state.knowledge.research) {
    hits.push({
      id: `research:${item.date}:${item.subject}`,
      view: 'research',
      subject: item.subject,
      title: item.title ?? item.subject,
      meta: `${item.date} · ${item.subject}`,
      excerpt: item.body ?? item.tags.join(', '),
    })
  }

  for (const item of state.knowledge.theses) {
    hits.push({
      id: `thesis:${item.date}:${item.subject}`,
      view: 'thesis',
      subject: item.subject,
      title: item.title ?? item.subject,
      meta: `${item.date} · ${item.status ?? t('Thesis')}`,
      excerpt: item.body ?? item.reviewBy ?? '',
    })
  }

  for (const item of state.knowledge.decisions) {
    hits.push({
      id: `decision:${item.date}:${item.subject}`,
      view: 'decisions',
      subject: item.subject,
      title: item.title ?? item.subject,
      meta: `${item.date} · ${item.action ?? t('Decision')}`,
      excerpt: item.basedOn ?? item.targetWeight ?? '',
    })
  }

  for (const item of state.process.reviews) {
    hits.push({
      id: `review:${item.date}:${item.subject}`,
      view: 'reviews',
      subject: item.subject,
      title: item.title ?? item.subject,
      meta: `${item.date} · ${item.status ?? t('Review')}`,
      excerpt: item.body ?? item.action ?? '',
    })
  }

  for (const item of state.process.journal) {
    hits.push({
      id: `journal:${item.date}:${item.subject}`,
      view: 'journal',
      subject: item.subject,
      title: item.title ?? item.subject,
      meta: `${item.date} · ${item.mood ?? t('Journal')}`,
      excerpt: item.body ?? item.related ?? '',
    })
  }

  for (const item of state.process.watchlist) {
    hits.push({
      id: `watchlist:${item.subject}`,
      view: 'watchlist',
      subject: item.subject,
      title: item.title ?? item.subject,
      meta: item.subject,
      excerpt: item.watchReason ?? '',
    })
  }

  for (const holding of state.portfolio.holdings) {
    const asset = state.allocation.assets.find((entry) => entry.subject === holding.asset)

    hits.push({
      id: `holding:${holding.asset}`,
      view: 'holdings',
      subject: holding.asset,
      title: asset?.title ?? holding.asset,
      meta: formatQuantityCommodity(holding.quantity, holding.commodity),
      excerpt: holding.cost ? `${holding.cost.amount} ${holding.cost.currency}` : '',
    })
  }

  for (const asset of state.allocation.assets) {
    hits.push({
      id: `asset:${asset.subject}`,
      view: 'allocation',
      subject: asset.subject,
      title: asset.title ?? asset.subject,
      meta: asset.subject,
      excerpt: `${t('Target')} ${asset.target ?? 'n/a'}%`,
    })
  }

  return hits
}
