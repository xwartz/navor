import type { NavorRendererAppState } from '@navor/contract'
import { compileNavorWorkspace, invalidateNavorCompileCache } from '@navor/renderer'
import { describe, expect, it } from 'vitest'

function normalizeAppState(state: NavorRendererAppState) {
  return {
    ...state,
    workspace: {
      ...state.workspace,
      root: '<workspace-root>',
      files: state.workspace.files.map((file) =>
        file.replace(/^.*fixtures\/core/, 'fixtures/core'),
      ),
    },
  }
}

describe('NavorRendererAppState snapshot', () => {
  it('matches the contract DTO shape for the core fixture workspace', async () => {
    invalidateNavorCompileCache()

    const state = normalizeAppState(
      await compileNavorWorkspace('fixtures/core', {
        today: '2026-07-08',
        prices: [
          {
            subject: 'Asset:Crypto:BTC',
            price: { amount: 100000, currency: 'USD' },
            provider: 'Fixture',
            asOf: '2026-07-08T00:00:00Z',
          },
        ],
        useDefaultPriceAdapter: false,
      }),
    )

    expect(state).toMatchSnapshot()
  })
})
