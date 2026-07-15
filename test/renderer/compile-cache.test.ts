import * as core from '@navor/core'
import { compileNavorWorkspace, invalidateNavorCompileCache } from '@navor/renderer'
import { describe, expect, it, vi } from 'vitest'

describe('compileNavorWorkspace cache', () => {
  it('reuses compiled state for repeated requests with the same workspace and options', async () => {
    invalidateNavorCompileCache()
    const loadSpy = vi.spyOn(core, 'loadNavorWorkspace')

    const options = {
      today: '2026-07-08',
      prices: [
        {
          subject: 'Asset:Crypto:BTC',
          price: { amount: 100000, currency: 'USD' },
          provider: 'Fixture',
          asOf: '2026-07-08T00:00:00Z',
        },
      ],
      useDefaultPriceAdapter: false as const,
    }

    const first = await compileNavorWorkspace('fixtures/core', options)
    const second = await compileNavorWorkspace('fixtures/core', options)

    expect(second).toBe(first)
    expect(loadSpy).toHaveBeenCalledTimes(1)

    loadSpy.mockRestore()
    invalidateNavorCompileCache()
  })

  it('recompiles after the workspace compile cache is invalidated', async () => {
    invalidateNavorCompileCache()
    const loadSpy = vi.spyOn(core, 'loadNavorWorkspace')

    const options = {
      today: '2026-07-08',
      useDefaultPriceAdapter: false as const,
    }

    await compileNavorWorkspace('fixtures/core', options)
    invalidateNavorCompileCache('fixtures/core')
    await compileNavorWorkspace('fixtures/core', options)

    expect(loadSpy).toHaveBeenCalledTimes(2)

    loadSpy.mockRestore()
    invalidateNavorCompileCache()
  })
})
