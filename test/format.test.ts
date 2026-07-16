import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { checkNavorFormat, formatNavor } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('formatNavor', () => {
  it('is idempotent and aligns postings without rewriting number literals', () => {
    const source = `2026-02-01 txn Asset:Equity:US:NVDA "First purchase"
  Assets:Equity:US:NVDA 10 NVDA @ 900 USD
  Assets:Cash:USD -9,000 USD
  Expenses:Fee 1 USD


2026-02-02 thesis Asset:Equity:US:NVDA "View"
  confidence:  Medium
  ---
  Keep the fractional quantity 3.97254174 untouched.
  ---
`

    const formatted = formatNavor(source)

    expect(formatted).toBe(formatNavor(formatted))
    expect(formatted).toContain('3.97254174')
    expect(formatted).toContain('-9,000')
    expect(formatted).toMatch(/Assets:Equity:US:NVDA\s+10 NVDA @ 900 USD/)
    expect(checkNavorFormat(formatted).ok).toBe(true)
  })

  it('normalizes tabs, metadata spacing, CRLF, and trailing newline', () => {
    const source = '2026-01-01 open Account:US "US"\r\n\taccount:  Account:US\r\n'

    const formatted = formatNavor(source)

    expect(formatted).toBe(`2026-01-01 open Account:US "US"
  account: Account:US
`)
    expect(checkNavorFormat(source).ok).toBe(false)
  })

  it('preserves directive order and does not insert blanks after comments', () => {
    const source = `; keep me
2026-01-01 open Account:US "US"
  target: 100%
2026-01-02 open Account:HK "HK"
  target: 100%
`

    const formatted = formatNavor(source)

    expect(formatted).toBe(`; keep me
2026-01-01 open Account:US "US"
  target: 100%

2026-01-02 open Account:HK "HK"
  target: 100%
`)
  })

  it('formats the example workspace files into a stable shape', async () => {
    const root = join(process.cwd(), 'example')
    const files = [
      'portfolio.nav',
      'plan.nav',
      'accounts/accounts.nav',
      'assets/assets.nav',
      'activity/transactions.nav',
      'activity/knowledge.nav',
      'activity/process.nav',
    ]

    for (const relative of files) {
      const source = await readFile(join(root, relative), 'utf8')
      const formatted = formatNavor(source)
      expect(formatted).toBe(formatNavor(formatted))
    }
  })

  it('round-trips a temp file through format then check', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'navor-format-'))
    const file = join(dir, 'messy.nav')
    await writeFile(
      file,
      `2026-01-01 txn Account:US "Cash"
  Assets:Cash:USD 100 USD
  Equity:Capital -100 USD
`,
      'utf8',
    )

    const before = await readFile(file, 'utf8')
    const formatted = formatNavor(before)
    await writeFile(file, formatted, 'utf8')
    expect(checkNavorFormat(await readFile(file, 'utf8')).ok).toBe(true)
  })
})
