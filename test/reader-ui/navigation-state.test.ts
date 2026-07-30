import { describe, expect, it } from 'vitest'
import { resolveReaderView } from '../../packages/reader-ui/src/App'
import {
  readReaderLocation,
  updateReaderLocation,
} from '../../packages/reader-ui/src/reader-location'

describe('reader navigation state', () => {
  it('resolves a view from the URL hash', () => {
    expect(resolveReaderView('#actions', 'overview')).toBe('drift')
    expect(resolveReaderView('#plans', 'overview')).toBe('plan')
    expect(resolveReaderView('#portfolio/accounts', 'overview')).toBe('accounts')
  })

  it('returns to the initial view when browser history removes the hash', () => {
    expect(resolveReaderView('', 'overview')).toBe('overview')
  })

  it('ignores unknown view hashes', () => {
    expect(resolveReaderView('#unknown', 'holdings')).toBe('holdings')
  })

  it('does not keep implementation-name hash aliases', () => {
    expect(resolveReaderView('#dashboard', 'overview')).toBe('overview')
    expect(resolveReaderView('#overview', 'overview')).toBe('overview')
    expect(resolveReaderView('#drift', 'overview')).toBe('overview')
    expect(resolveReaderView('#holdings', 'overview')).toBe('overview')
    expect(resolveReaderView('#transactions', 'overview')).toBe('overview')
    expect(resolveReaderView('#policy', 'overview')).toBe('overview')
    expect(resolveReaderView('#market', 'overview')).toBe('overview')
  })

  it('keeps research and health sections in canonical deep links', () => {
    expect(
      readReaderLocation('https://reader.test/#cases/theses', 'overview', () => false),
    ).toMatchObject({
      view: 'research',
      caseTab: 'theses',
    })
    expect(
      readReaderLocation('https://reader.test/#health/sources', 'overview', () => false),
    ).toMatchObject({
      view: 'diagnostics',
      healthTab: 'sources',
    })
    expect(
      updateReaderLocation('https://reader.test/?asset=Asset%3ACrypto%3ABTC#briefing', {
        view: 'research',
        caseTab: 'decisions',
      }),
    ).toBe('/?asset=Asset%3ACrypto%3ABTC#cases/decisions')
  })
})
