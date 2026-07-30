export interface ReaderFilters {
  query?: string
  subject?: string
  tag?: string
  date?: string
  account?: string
  type?: string
  status?: string
}

export function hasActiveFilters(filters: ReaderFilters) {
  return Boolean(
    filters.query ||
      filters.subject ||
      filters.tag ||
      filters.date ||
      filters.account ||
      filters.type ||
      filters.status,
  )
}

export function matchesFilters(item: unknown, filters: ReaderFilters) {
  if (!hasActiveFilters(filters)) {
    return true
  }

  const text = JSON.stringify(item).toLowerCase()
  const record = asRecord(item)

  if (filters.query && !text.includes(filters.query.trim().toLowerCase())) {
    return false
  }

  if (filters.subject && !matchesAny(subjectValues(record), filters.subject)) {
    return false
  }

  if (filters.tag && !matchesAny(stringValues(record.tags), filters.tag)) {
    return false
  }

  if (filters.date && !matchesAny(stringValues(record.date), filters.date, 'prefix')) {
    return false
  }

  if (filters.account && !matchesAny(accountValues(record), filters.account)) {
    return false
  }

  if (filters.type && !matchesAny(stringValues(record.type), filters.type)) {
    return false
  }

  if (filters.status && !matchesAny(statusValues(record), filters.status)) {
    return false
  }

  return true
}

function asRecord(item: unknown): Record<string, unknown> {
  return typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}
}

function matchesAny(values: string[], filter: string, mode: 'exact' | 'prefix' = 'exact') {
  const normalized = filter.toLowerCase()
  return values.some((value) =>
    mode === 'prefix'
      ? value.toLowerCase().startsWith(normalized)
      : value.toLowerCase() === normalized,
  )
}

function stringValues(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(stringValues)
  return []
}

function subjectValues(record: Record<string, unknown>) {
  return stringValues(record.subject).concat(stringValues(record.asset))
}

function accountValues(record: Record<string, unknown>) {
  const postingAccounts = Array.isArray(record.postings)
    ? record.postings.flatMap((posting) =>
        posting && typeof posting === 'object'
          ? stringValues((posting as Record<string, unknown>).account)
          : [],
      )
    : []
  return stringValues(record.account).concat(postingAccounts)
}

function statusValues(record: Record<string, unknown>) {
  return stringValues(record.status).concat(
    stringValues(record.category),
    stringValues(record.severity),
  )
}
