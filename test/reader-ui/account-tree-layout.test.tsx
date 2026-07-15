import type { DashboardAccountExecution } from '@navor/contract'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AccountTree } from '../../packages/reader-ui/src/components/AccountTree'

function account(partial: Partial<DashboardAccountExecution> = {}): DashboardAccountExecution {
  return {
    subject: 'Account:US',
    title: '美股账户',
    target: 25,
    targetAmount: { amount: 250_000, currency: 'USD' },
    investedCost: [{ amount: 76_383.057, currency: 'USD' }],
    investedPercent: 30.6,
    remainingBudget: { amount: 173_616.943, currency: 'USD' },
    marketValue: [],
    drift: null,
    ...partial,
  }
}

describe('AccountTree funding meter label', () => {
  it('keeps target percent and remaining budget from colliding in a narrow column', () => {
    const markup = renderToStaticMarkup(
      <AccountTree
        accounts={[account()]}
        actions={[]}
        assets={[]}
        onSelectAsset={() => undefined}
      />,
    )

    expect(markup).toContain('gap-x-2')
    expect(markup).toContain('Target 25.0%')
    expect(markup).toContain('173,616.943 USD left')
    expect(markup).not.toContain('25.0%173')
  })
})
