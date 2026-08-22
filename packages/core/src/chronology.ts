/** Orders Directive-derived facts by date, Repository file, then source line. */
export interface ChronologicalEntry {
  date: string
  file?: string
  line?: number
}

export function compareChronology(left: ChronologicalEntry, right: ChronologicalEntry) {
  return (
    left.date.localeCompare(right.date) ||
    (left.file ?? '').localeCompare(right.file ?? '') ||
    (left.line ?? 0) - (right.line ?? 0)
  )
}

export function orderChronologically<T extends ChronologicalEntry>(entries: T[]) {
  return entries.toSorted(compareChronology)
}

export function compareChronologyDesc(left: ChronologicalEntry, right: ChronologicalEntry) {
  return compareChronology(right, left)
}

export function orderReverseChronologically<T extends ChronologicalEntry>(entries: T[]) {
  return entries.toSorted(compareChronologyDesc)
}
