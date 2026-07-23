import { parseList } from '../core/values'
import { resolveDateScopedReference } from '../relationships'
import type { KnowledgeViews, NavorAst, NavorDiagnostic } from '../types'

export function generateKnowledgeViews(
  ast: NavorAst,
  options: { today?: string } = {},
): KnowledgeViews {
  const diagnostics: NavorDiagnostic[] = []
  const research = ast.directives
    .filter((directive) => directive.directive === 'research')
    .map((directive) => ({
      date: directive.date,
      subject: directive.subject,
      title: directive.title,
      source: directive.metadata.source ?? null,
      reliability: directive.metadata.reliability ?? null,
      tags: parseList(directive.metadata.tags ?? null),
      body: directive.body,
    }))
  const theses = ast.directives
    .filter((directive) => directive.directive === 'thesis')
    .map((directive) => {
      const view = {
        date: directive.date,
        subject: directive.subject,
        title: directive.title,
        horizon: directive.metadata.horizon ?? null,
        sentiment: directive.metadata.sentiment ?? null,
        confidence: directive.metadata.confidence ?? null,
        status: directive.metadata.status ?? null,
        invalidIf: directive.metadata.invalid_if ?? null,
        reviewBy: directive.metadata.review_by ?? null,
        body: directive.body,
        ...(directive.metadata.based_on
          ? {
              basedOn: directive.metadata.based_on,
              basedOnReference: resolveDateScopedReference({
                ast,
                owner: directive,
                raw: directive.metadata.based_on,
                expected: ['research'],
                allowLegacySubject: true,
              }),
            }
          : {}),
      }

      if (
        options.today &&
        view.reviewBy &&
        view.status !== 'Invalidated' &&
        view.status !== 'Closed' &&
        view.reviewBy < options.today
      ) {
        diagnostics.push({
          line: directive.line,
          message: `Thesis "${view.title ?? view.subject}" is past review_by ${view.reviewBy}.`,
        })
      }

      return view
    })
  const decisions = ast.directives
    .filter((directive) => directive.directive === 'decision')
    .map((directive) => ({
      date: directive.date,
      subject: directive.subject,
      title: directive.title,
      action: directive.metadata.action ?? null,
      targetWeight: directive.metadata.target_weight ?? null,
      basedOn: directive.metadata.based_on ?? null,
      ...(directive.metadata.based_on
        ? {
            basedOnReference: resolveDateScopedReference({
              ast,
              owner: directive,
              raw: directive.metadata.based_on,
              expected: ['thesis'],
              allowLegacySubject: true,
            }),
          }
        : {}),
      confidence: directive.metadata.confidence ?? null,
    }))

  return {
    research,
    theses,
    decisions,
    diagnostics,
  }
}
