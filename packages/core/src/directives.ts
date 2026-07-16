export const NAVOR_DIRECTIVES = [
  'option',
  'capital',
  'open',
  'close',
  'plan',
  'research',
  'thesis',
  'decision',
  'txn',
  'review',
  'journal',
  'note',
] as const

export type NavorDirectiveName = (typeof NAVOR_DIRECTIVES)[number]

export const NAVOR_DIRECTIVE_SET = new Set<string>(NAVOR_DIRECTIVES)
