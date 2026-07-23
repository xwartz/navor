import type { NavorAst, NavorDirective, ReferenceView } from './types'

type ReferenceDirective = 'research' | 'thesis' | 'decision'

export function resolveDateScopedReference({
  ast,
  owner,
  raw,
  expected,
  allowLegacySubject = false,
}: {
  ast: NavorAst
  owner: NavorDirective
  raw: string | null | undefined
  expected: ReferenceDirective[]
  allowLegacySubject?: boolean
}): ReferenceView | null {
  if (!raw) return null

  const parsed = parseDateReference(raw)
  if (!parsed) {
    return isLegacySubjectReference(ast, raw, allowLegacySubject)
      ? { raw, status: 'legacy', target: null }
      : { raw, status: 'unresolved', target: null }
  }

  const candidates = ast.directives.filter(
    (directive) =>
      directive.subject === owner.subject &&
      directive.date === parsed.date &&
      expected.includes(directive.directive as ReferenceDirective) &&
      (!parsed.title || directive.title === parsed.title),
  )

  if (candidates.length === 0) return { raw, status: 'unresolved', target: null }
  if (candidates.length > 1) return { raw, status: 'ambiguous', target: null }

  const [target] = candidates
  if (!target) return { raw, status: 'unresolved', target: null }

  const ownerIndex = ast.directives.indexOf(owner)
  const targetIndex = ast.directives.indexOf(target)
  const targetIsLater =
    target.date > owner.date || (target.date === owner.date && targetIndex > ownerIndex)

  return {
    raw,
    status: targetIsLater ? 'future' : 'resolved',
    target: {
      directive: target.directive,
      date: target.date,
      subject: target.subject,
      title: target.title,
    },
  }
}

function isLegacySubjectReference(ast: NavorAst, raw: string, allowLegacySubject: boolean) {
  return (
    allowLegacySubject &&
    ast.directives.some(
      (directive) =>
        directive.directive === 'open' &&
        (directive.subject.startsWith('Asset:') || directive.subject.startsWith('Account:')) &&
        directive.subject === raw,
    )
  )
}

function parseDateReference(raw: string): { date: string; title: string | null } | null {
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})(?:\s+"([^"]+)")?$/)
  if (!match) return null

  return { date: match[1] ?? '', title: match[2] ?? null }
}
