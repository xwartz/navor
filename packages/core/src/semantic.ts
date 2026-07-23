import { resolveDateScopedReference } from './relationships'
import type { NavorAst, NavorDiagnostic, NavorDirective, NavorPosting } from './types'

export function validateNavorSemantics(ast: NavorAst): NavorDiagnostic[] {
  const diagnostics: NavorDiagnostic[] = []
  const accounts = new Set(
    ast.directives
      .filter(
        (directive) => directive.directive === 'open' && directive.subject.startsWith('Account:'),
      )
      .map((directive) => directive.subject),
  )
  const assets = new Set(
    ast.directives
      .filter(
        (directive) => directive.directive === 'open' && directive.subject.startsWith('Asset:'),
      )
      .map((directive) => directive.subject),
  )
  for (const directive of ast.directives) {
    if (directive.directive === 'open' && directive.subject.startsWith('Asset:')) {
      const account = directive.metadata.account

      if (account && !accounts.has(account)) {
        diagnostics.push({
          line: directive.line,
          file: directive.file,
          message: `Asset "${directive.subject}" references unknown Account "${account}".`,
        })
      }
    }

    if (directive.directive === 'plan') {
      const account = directive.metadata.account

      if (account && !accounts.has(account)) {
        diagnostics.push({
          line: directive.line,
          file: directive.file,
          message: `Plan "${directive.subject}" references unknown Account "${account}".`,
        })
      }

      if (directive.subject.startsWith('Asset:') && !assets.has(directive.subject)) {
        diagnostics.push({
          line: directive.line,
          file: directive.file,
          message: `Plan references unknown Asset "${directive.subject}".`,
        })
      }
    }

    if (directive.directive === 'txn') {
      validateTransactionSubject(directive, assets, accounts, diagnostics)
      validateReference({
        ast,
        directive,
        raw: directive.metadata.decision,
        expected: ['decision'],
        label: 'Transaction decision',
        diagnostics,
      })
    }

    if (directive.directive === 'thesis') {
      validateReference({
        ast,
        directive,
        raw: directive.metadata.based_on,
        expected: ['research'],
        label: 'Thesis basis',
        allowLegacySubject: true,
        diagnostics,
      })
    }

    if (directive.directive === 'decision') {
      validateReference({
        ast,
        directive,
        raw: directive.metadata.based_on,
        expected: ['thesis'],
        label: 'Decision basis',
        allowLegacySubject: true,
        diagnostics,
      })
    }
  }

  return diagnostics
}

function validateReference({
  ast,
  directive,
  raw,
  expected,
  label,
  allowLegacySubject = false,
  diagnostics,
}: {
  ast: NavorAst
  directive: NavorDirective
  raw: string | undefined
  expected: ('research' | 'thesis' | 'decision')[]
  label: string
  allowLegacySubject?: boolean
  diagnostics: NavorDiagnostic[]
}) {
  const reference = resolveDateScopedReference({
    ast,
    owner: directive,
    raw,
    expected,
    allowLegacySubject,
  })
  if (!reference || reference.status === 'resolved' || reference.status === 'legacy') return

  const detail =
    reference.status === 'future'
      ? 'references a later record'
      : reference.status === 'ambiguous'
        ? 'is ambiguous; add the referenced title'
        : 'does not resolve to a record of the expected type'
  diagnostics.push({
    line: directive.line,
    file: directive.file,
    message: `${label} "${reference.raw}" ${detail}.`,
  })
}

function validateTransactionSubject(
  directive: NavorDirective,
  assets: Set<string>,
  accounts: Set<string>,
  diagnostics: NavorDiagnostic[],
) {
  if (directive.subject.startsWith('Asset:')) {
    if (!assets.has(directive.subject)) {
      diagnostics.push({
        line: directive.line,
        file: directive.file,
        message: `Transaction references unknown Asset "${directive.subject}".`,
      })
      return
    }

    validateAssetTransactionPostings(directive, diagnostics)
    return
  }

  if (directive.subject.startsWith('Account:')) {
    if (!accounts.has(directive.subject)) {
      diagnostics.push({
        line: directive.line,
        file: directive.file,
        message: `Transaction references unknown Account "${directive.subject}".`,
      })
      return
    }

    validateAccountTransactionPostings(directive, diagnostics)
    return
  }

  diagnostics.push({
    line: directive.line,
    file: directive.file,
    message: `Transaction subject "${directive.subject}" must be an open Asset or Account.`,
  })
}

function validateAccountTransactionPostings(
  directive: NavorDirective,
  diagnostics: NavorDiagnostic[],
) {
  if (directive.postings.some(isAssetHoldingPosting)) {
    diagnostics.push({
      line: directive.line,
      file: directive.file,
      message: `Account transaction "${directive.subject}" must not include asset holdings.`,
    })
  }
}

function validateAssetTransactionPostings(
  directive: NavorDirective,
  diagnostics: NavorDiagnostic[],
) {
  const holdingPostings = directive.postings.filter(isAssetHoldingPosting)

  if (holdingPostings.length === 0) {
    if (!isCashIncomeExpenseOnly(directive.postings)) {
      diagnostics.push({
        line: directive.line,
        file: directive.file,
        message: `Asset transaction "${directive.subject}" must include a holding posting, or only Cash/Income/Expenses postings.`,
      })
    }
    return
  }

  const hasSubjectHolding = holdingPostings.some(
    (posting) => postingAccountToAssetSubject(posting.account) === directive.subject,
  )

  if (!hasSubjectHolding) {
    diagnostics.push({
      line: directive.line,
      file: directive.file,
      message: `Asset transaction "${directive.subject}" must include a holding posting for that Asset.`,
    })
  }
}

function isAssetHoldingPosting(posting: NavorPosting): boolean {
  return posting.account.startsWith('Assets:') && !posting.account.startsWith('Assets:Cash:')
}

function isCashIncomeExpenseOnly(postings: NavorPosting[]): boolean {
  return (
    postings.length > 0 &&
    postings.every(
      (posting) =>
        posting.account.startsWith('Assets:Cash:') ||
        posting.account.startsWith('Income:') ||
        posting.account.startsWith('Expenses:'),
    )
  )
}

function postingAccountToAssetSubject(account: string): string {
  return `Asset:${account.replace(/^Assets:/, '')}`
}
