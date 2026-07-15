import { describe, expect, it } from 'vitest'
import { resolveReaderView } from '../../packages/reader-ui/src/App'

describe('reader navigation state', () => {
  it('resolves a view from the URL hash', () => {
    expect(resolveReaderView('#drift', 'overview')).toBe('drift')
  })

  it('returns to the initial view when browser history removes the hash', () => {
    expect(resolveReaderView('', 'overview')).toBe('overview')
  })

  it('ignores unknown view hashes', () => {
    expect(resolveReaderView('#unknown', 'holdings')).toBe('holdings')
  })

  it('does not keep legacy hash aliases', () => {
    expect(resolveReaderView('#dashboard', 'overview')).toBe('overview')
    expect(resolveReaderView('#portfolio', 'overview')).toBe('overview')
    expect(resolveReaderView('#transactions', 'overview')).toBe('overview')
    expect(resolveReaderView('#plan', 'overview')).toBe('overview')
    expect(resolveReaderView('#market', 'overview')).toBe('overview')
  })
})
