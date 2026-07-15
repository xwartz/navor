import type { NavorAst, ProcessViews } from '../types'

export function generateProcessViews(ast: NavorAst): ProcessViews {
  const watchlist = ast.directives
    .filter(
      (directive) =>
        directive.directive === 'open' &&
        directive.subject.startsWith('Asset:') &&
        directive.metadata.status === 'Watch',
    )
    .map((directive) => ({
      subject: directive.subject,
      title: directive.title,
      account: directive.metadata.account ?? null,
      watchReason: directive.metadata.watch_reason ?? null,
    }))
  const reviews = ast.directives
    .filter((directive) => directive.directive === 'review')
    .map((directive) => ({
      date: directive.date,
      subject: directive.subject,
      title: directive.title,
      status: directive.metadata.status ?? null,
      action: directive.metadata.action ?? null,
      drift: directive.metadata.drift ?? null,
      body: directive.body,
    }))
  const journal = ast.directives
    .filter((directive) => directive.directive === 'journal' || directive.directive === 'note')
    .map((directive) => ({
      date: directive.date,
      directive: directive.directive as 'journal' | 'note',
      subject: directive.subject,
      title: directive.title,
      mood: directive.metadata.mood ?? null,
      related: directive.metadata.related ?? null,
      body: directive.body,
    }))

  return {
    watchlist,
    reviews,
    journal,
  }
}
