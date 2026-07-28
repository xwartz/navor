import type { NavorDiagnostic } from './types'

export const NAVOR_DIAGNOSTIC_CODES = {
  invalidDirective: 'NAV001',
  invalidPosting: 'NAV002',
  orphanIndentedLine: 'NAV003',
  bodyIndentation: 'NAV004',
  unclosedBody: 'NAV005',
  unknownDirective: 'NAV006',
  invalidConfig: 'NAV010',
  semantic: 'NAV100',
  allocation: 'NAV200',
  portfolio: 'NAV300',
  plan: 'NAV400',
  knowledge: 'NAV500',
  internal: 'NAV900',
} as const

export type NavorDiagnosticCode =
  (typeof NAVOR_DIAGNOSTIC_CODES)[keyof typeof NAVOR_DIAGNOSTIC_CODES]

export function withDiagnosticCode(
  diagnostics: NavorDiagnostic[],
  code: NavorDiagnosticCode,
): NavorDiagnostic[] {
  return diagnostics.map((diagnostic) => ({ ...diagnostic, code: diagnostic.code ?? code }))
}

export function formatNavorDiagnosticCode(diagnostic: NavorDiagnostic): string {
  return diagnostic.code ?? NAVOR_DIAGNOSTIC_CODES.internal
}
