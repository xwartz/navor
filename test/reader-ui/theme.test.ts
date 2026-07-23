import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const STYLES = 'packages/reader-ui/src/styles.css'

describe('Reader color scheme', () => {
  it('follows the system preference with complete dark and light semantic tokens', () => {
    const source = readFileSync(STYLES, 'utf8')

    expect(source).toMatch(/:root \{\n {2}color-scheme: dark;/)
    expect(source).toContain('@media (prefers-color-scheme: light)')
    expect(source).toContain('color-scheme: light;')

    for (const token of [
      '--color-paper:',
      '--color-paper-elevated:',
      '--color-ink:',
      '--color-border:',
      '--color-accent:',
      '--color-warning:',
      '--color-danger:',
    ]) {
      expect(source.match(new RegExp(token, 'g'))?.length).toBeGreaterThanOrEqual(2)
    }
  })
})
