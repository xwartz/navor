import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateDashboard, loadNavorWorkspace, parseNavor } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('loadNavorWorkspace', () => {
  it('aggregates a directory tree of .nav files like an equivalent single file', async () => {
    const root = await mkdtemp(join(tmpdir(), 'navor-workspace-'))
    await writeFile(
      join(root, 'portfolio.nav'),
      `2026-01-01 capital Portfolio:Core "Initial investable capital"
  amount: 100,000 USD
`,
    )
    await writeFile(
      join(root, 'crypto.nav'),
      `2026-01-01 open Account:Crypto "Digital assets"
  target: 30%

2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Crypto
  target: 70%
`,
    )
    await writeFile(
      join(root, 'transactions.nav'),
      `2026-03-02 txn Asset:Crypto:BTC "First BTC tranche"
  Assets:Crypto:BTC       0.10 BTC @ 90,000 USD
  Assets:Cash:USD        -9,000 USD
`,
    )

    const workspace = await loadNavorWorkspace(root)
    const single = parseNavor(`${await workspace.source}`)

    expect(workspace.diagnostics).toEqual([])
    expect(generateDashboard(workspace.ast)).toEqual(generateDashboard(single.ast))
  })
})
