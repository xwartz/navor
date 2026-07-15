import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const PANEL = 'packages/reader-ui/src/components/AssetDetailPanel.tsx'

describe('AssetDetailPanel expanded layout', () => {
  it('sizes columns from the panel container, not the viewport (Decision queue is a narrow column)', () => {
    const source = readFileSync(PANEL, 'utf8')

    expect(source).not.toMatch(/lg:grid-cols-\[minmax/)
    expect(source).toMatch(/@container/)
    expect(source).toMatch(/@min-\[/)
  })

  it('keeps compact briefs free of nested card chrome', () => {
    const source = readFileSync(PANEL, 'utf8')

    expect(source).toMatch(/variant\?: 'full' \| 'compact'/)
    expect(source).not.toMatch(/rounded-md border border-border bg-paper-elevated/)
    expect(source).not.toMatch(/sm:grid-cols-4/)
  })
})
