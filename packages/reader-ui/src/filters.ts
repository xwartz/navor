export interface ReaderFilters {
  query?: string
  subject?: string
  tag?: string
  date?: string
}

export function hasActiveFilters(filters: ReaderFilters) {
  return Boolean(filters.query || filters.subject || filters.tag || filters.date)
}

export function matchesFilters(item: unknown, filters: ReaderFilters) {
  if (!hasActiveFilters(filters)) {
    return true
  }

  const text = JSON.stringify(item).toLowerCase()

  if (filters.query && !text.includes(filters.query.trim().toLowerCase())) {
    return false
  }

  const subjectTokens = filters.subject?.split(':').filter((part) => part.length > 2) ?? []

  if (
    filters.subject &&
    !text.includes(filters.subject.toLowerCase()) &&
    !subjectTokens.some((token) => text.includes(token.toLowerCase()))
  ) {
    return false
  }

  if (filters.tag && hasTagField(item)) {
    const tagText = item.tags.join(' ').toLowerCase()
    if (!tagText.includes(filters.tag.toLowerCase()) && !text.includes(filters.tag.toLowerCase())) {
      return false
    }
  }

  if (filters.date) {
    const subject = getSubject(item)
    const datedKnowledge =
      hasTagField(item) && hasDateField(item) && !subject?.startsWith('Market:')

    if (datedKnowledge && !item.date.includes(filters.date)) {
      return false
    }

    if (!datedKnowledge && !hasDateField(item) && !text.includes(filters.date)) {
      return false
    }
  }

  return true
}

function hasTagField(item: unknown): item is { tags: string[] } {
  return (
    typeof item === 'object' &&
    item !== null &&
    'tags' in item &&
    Array.isArray((item as { tags: unknown }).tags)
  )
}

function hasDateField(item: unknown): item is { date: string } {
  return (
    typeof item === 'object' &&
    item !== null &&
    'date' in item &&
    typeof (item as { date: unknown }).date === 'string'
  )
}

function getSubject(item: unknown) {
  if (typeof item === 'object' && item !== null && 'subject' in item) {
    const subject = (item as { subject: unknown }).subject
    return typeof subject === 'string' ? subject : null
  }

  return null
}
