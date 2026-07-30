import type { NavorRendererAppState } from '@navor/contract'

import { formatQuantityCommodity } from './components/format'
import { buildEntityLabelIndex, readableEntityTitle, resolveEntityLabel } from './entity-labels'
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
  const labels = buildEntityLabelIndex(state)
  const entityTitle = (subject: string, title?: string | null) =>
    readableEntityTitle(resolveEntityLabel(labels, subject), subject, title)

  for (const item of state.knowledge.research) {
    hits.push({
      id: `research:${item.date}:${item.subject}`,
      view: 'research',
      subject: item.subject,
      title: entityTitle(item.subject, item.title),
      meta: `${item.date} · ${entityTitle(item.subject)}`,
      excerpt: item.body ?? item.tags.join(', '),
    })
  }

  for (const item of state.knowledge.theses) {
    hits.push({
      id: `thesis:${item.date}:${item.subject}`,
      view: 'research',
      subject: item.subject,
      title: entityTitle(item.subject, item.title),
      meta: `${item.date} · ${item.status ?? t('Thesis')}`,
      excerpt: item.body ?? item.reviewBy ?? '',
    })
  }

  for (const item of state.knowledge.decisions) {
    hits.push({
      id: `decision:${item.date}:${item.subject}`,
      view: 'research',
      subject: item.subject,
      title: entityTitle(item.subject, item.title),
      meta: `${item.date} · ${item.action ?? t('Decision')}`,
      excerpt: item.basedOn ?? item.targetWeight ?? '',
    })
  }

  for (const item of state.process.reviews) {
    hits.push({
      id: `review:${item.date}:${item.subject}`,
      view: 'reviews',
      subject: item.subject,
      title: entityTitle(item.subject, item.title),
      meta: `${item.date} · ${item.status ?? t('Review')}`,
      excerpt: item.body ?? item.action ?? '',
    })
  }

  for (const item of state.process.journal) {
    hits.push({
      id: `journal:${item.date}:${item.subject}`,
      view: 'journal',
      subject: item.subject,
      title: entityTitle(item.subject, item.title),
      meta: `${item.date} · ${item.mood ?? t('Journal')}`,
      excerpt: item.body ?? item.related ?? '',
    })
  }

  for (const item of state.process.watchlist) {
    hits.push({
      id: `watchlist:${item.subject}`,
      view: 'watchlist',
      subject: item.subject,
      title: entityTitle(item.subject, item.title),
      meta: entityTitle(item.subject),
      excerpt: item.watchReason ?? '',
    })
  }

  for (const holding of state.portfolio.holdings) {
    const asset = state.allocation.assets.find((entry) => entry.subject === holding.asset)

    hits.push({
      id: `holding:${holding.asset}`,
      view: 'holdings',
      subject: holding.asset,
      title: entityTitle(holding.asset, asset?.title),
      meta: formatQuantityCommodity(holding.quantity, holding.commodity),
      excerpt: holding.cost ? `${holding.cost.amount} ${holding.cost.currency}` : '',
    })
  }

  for (const asset of state.allocation.assets) {
    hits.push({
      id: `asset:${asset.subject}`,
      view: 'allocation',
      subject: asset.subject,
      title: entityTitle(asset.subject, asset.title),
      meta: entityTitle(asset.subject),
      excerpt: `${t('Target')} ${asset.target ?? 'n/a'}%`,
    })
  }

  return hits
}
