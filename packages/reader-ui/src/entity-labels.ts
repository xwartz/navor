import type { NavorRendererAppState } from '@navor/contract'

export interface EntityLabel {
  subject: string
  title: string
  symbol: string | null
}

export function buildEntityLabelIndex(state: NavorRendererAppState) {
  const index = new Map<string, EntityLabel>()

  const add = (subject: string, title: string | null, symbol: string | null = null) => {
    const existing = index.get(subject)

    index.set(subject, {
      subject,
      title: title ?? existing?.title ?? shortSubjectLabel(subject),
      symbol: symbol ?? existing?.symbol ?? null,
    })
  }

  for (const asset of state.allocation.assets) {
    add(asset.subject, asset.title)
  }

  for (const account of state.allocation.accounts) {
    add(account.subject, account.title)
  }

  for (const asset of state.dashboard.assetExecutions) {
    add(asset.subject, asset.title)
  }

  for (const account of state.dashboard.accountExecutions) {
    add(account.subject, account.title)
  }

  for (const entry of state.drift.entries) {
    add(entry.subject, entry.title)
  }

  for (const entry of state.priceManifest.entries) {
    add(entry.subject, null, entry.symbol)
  }

  for (const item of state.process.watchlist) {
    add(item.subject, item.title)
  }

  return index
}

export function resolveEntityLabel(index: Map<string, EntityLabel>, subject: string): EntityLabel {
  return (
    index.get(subject) ?? {
      subject,
      title: shortSubjectLabel(subject),
      symbol: null,
    }
  )
}

export function shortSubjectLabel(subject: string) {
  if (subject.startsWith('Account:')) {
    return subject.slice('Account:'.length)
  }

  if (subject.startsWith('Asset:')) {
    const parts = subject.split(':')
    return parts[parts.length - 1] ?? subject
  }

  if (subject.startsWith('Market:')) {
    return subject.slice('Market:'.length)
  }

  const parts = subject.split(':')
  return parts[parts.length - 1] ?? subject
}

export function formatSubjectSublabel(index: Map<string, EntityLabel>, subject: string) {
  const line = entityMetaLine(resolveEntityLabel(index, subject))

  return line ?? undefined
}

export function entityMetaLine(label: EntityLabel, explicitMeta?: string | null) {
  if (explicitMeta) {
    return explicitMeta
  }

  if (label.symbol && label.symbol !== label.title) {
    return label.symbol
  }

  if (label.subject !== label.title) {
    return shortSubjectLabel(label.subject)
  }

  return null
}
