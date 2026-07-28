import { createRequire } from 'node:module'

import { classifyNavorSourceLine, formatNavor, parseNavor, splitNavorSource } from '@navor/core'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { formatNavor: formatInEditor } = require('../extensions/vscode/format.cjs') as {
  formatNavor(source: string): string
}

const corpus = [
  {
    name: 'valid directive with metadata, postings, and a body',
    source: `2026-01-01 txn Account:US "Cash"
  Assets:Cash:USD 10 USD
  Equity:Capital -10 USD

2026-01-02 thesis Asset:Equity:US:NVDA "View"
  confidence: High
  ---
  Check the evidence.
  ---
`,
    codes: [],
  },
  {
    name: 'misindented body delimiter',
    source: `2026-01-01 research Asset:Equity:US:TEST "Test"
  source: Test
 ---
`,
    codes: ['NAV001'],
  },
  {
    name: 'unknown directive',
    source: '2026-01-01 forecast Asset:Equity:US:TEST "Test"\n',
    codes: ['NAV006'],
  },
] as const

describe('Navor language corpus', () => {
  it.each(corpus)('$name has stable parser diagnostics and one formatter result', ({
    source,
    codes,
  }) => {
    expect(parseNavor(source).diagnostics.map((diagnostic) => diagnostic.code)).toEqual(codes)
    expect(formatNavor(source)).toBe(formatInEditor(source))
  })

  it('uses one source-text classification rule across parser and formatter inputs', () => {
    expect(splitNavorSource('one\r\ntwo\n')).toEqual(['one', 'two', ''])
    expect(classifyNavorSourceLine('')).toBe('blank')
    expect(classifyNavorSourceLine('; source')).toBe('comment')
    expect(classifyNavorSourceLine('  target: 100%')).toBe('indented')
    expect(classifyNavorSourceLine('2026-01-01 open Account:US')).toBe('directive')
  })
})
