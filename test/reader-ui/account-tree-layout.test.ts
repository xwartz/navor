import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const TREE = 'packages/reader-ui/src/components/AccountTree.tsx'

describe('AccountTree asset row layout', () => {
  it('keeps next-step actions in a shrink-wrapped flex slot so they cannot cover To deploy', () => {
    const source = readFileSync(TREE, 'utf8')

    // Regression: nested lg:col-span-4 button overflowed into the action column.
    expect(source).not.toMatch(/lg:col-span-4/)
    expect(source).toMatch(/flex flex-col gap-3[\s\S]*lg:flex-row/)
    expect(source).toMatch(/min-w-0[^\n]*flex-1/)
    expect(source).toMatch(/shrink-0[\s\S]*lg:min-w-\[9\.5rem\]/)
  })
})
