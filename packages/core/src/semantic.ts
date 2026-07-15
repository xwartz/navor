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
  const txnSubjects = new Set(
    ast.directives.filter((directive) => directive.directive === 'txn').map((d) => d.subject),
  )
  const decisionSubjects = new Map(
    ast.directives
      .filter((directive) => directive.directive === 'decision')
      .map((directive) => [directive.subject, directive]),
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
    }

    if (directive.directive === 'decision') {
      const basedOn = directive.metadata.based_on

      if (basedOn?.includes(':') && !assets.has(basedOn) && !accounts.has(basedOn)) {
        diagnostics.push({
          line: directive.line,
          file: directive.file,
          message: `Decision "${directive.subject}" references unknown subject "${basedOn}".`,
        })
      }
    }
  }

  for (const [subject, decision] of decisionSubjects) {
    if (!subject.startsWith('Asset:')) {
      continue
    }

    if (!txnSubjects.has(subject)) {
      diagnostics.push({
        line: decision.line,
        file: decision.file,
        message: `Decision "${decision.title ?? subject}" has no matching Transaction yet.`,
      })
    }
  }

  return diagnostics
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
