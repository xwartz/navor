import { parsePercent } from '../core/values'
import type { NavorAst, NavorDiagnostic, PlanEntry, PlanResult } from '../types'

export function generatePlanViews(ast: NavorAst): PlanResult {
  const diagnostics: NavorDiagnostic[] = []
  const entries = ast.directives
    .filter((directive) => directive.directive === 'plan')
    .map((directive) => {
      const target = parsePercent(directive.metadata.target ?? null)
      const min = parsePercent(directive.metadata.min ?? null)
      const max = parsePercent(directive.metadata.max ?? null)

      if (min !== null && max !== null && min > max) {
        diagnostics.push({
          line: directive.line,
          file: directive.file,
          message: `Plan "${directive.subject}" has min ${min}% above max ${max}%.`,
        })
      }

      return {
        date: directive.date,
        subject: directive.subject,
        title: directive.title,
        target,
        min,
        max,
        rebalance: directive.metadata.rebalance ?? null,
        actionWhenBelow: directive.metadata.action_when_below ?? null,
        actionWhenAbove: directive.metadata.action_when_above ?? null,
      } satisfies PlanEntry
    })
  const currentBySubject = new Map<string, PlanEntry>()
  for (const entry of entries) {
    const existing = currentBySubject.get(entry.subject)
    if (!existing || entry.date >= existing.date) {
      currentBySubject.set(entry.subject, entry)
    }
  }

  return {
    entries,
    current: [...currentBySubject.values()],
    diagnostics,
  }
}
