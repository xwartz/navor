import type { NavorRendererAppState } from '@navor/contract'
import { describe, expect, it } from 'vitest'
import { documentTitleFromState } from '../../packages/reader-ui/src/document-title'

describe('documentTitleFromState', () => {
  it('uses the portfolio subject short name', () => {
    const state = {
      allocation: { capital: { subject: 'Portfolio:Example', amount: 1, currency: 'USD' } },
      dashboard: { capital: null },
    } as NavorRendererAppState

    expect(documentTitleFromState(state)).toBe('Example - Navor')
  })

  it('falls back to Navor when capital is missing', () => {
    expect(documentTitleFromState(null)).toBe('Navor')
    expect(
      documentTitleFromState({
        allocation: { capital: null },
        dashboard: { capital: null },
      } as NavorRendererAppState),
    ).toBe('Navor')
  })
})
