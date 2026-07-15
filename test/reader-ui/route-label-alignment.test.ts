import { describe, expect, it } from 'vitest'

import { NAV_GROUPS } from '../../packages/reader-ui/src/navigation'

function labelSlug(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

describe('Reader route ids vs nav labels', () => {
  it('keeps every nav label aligned with its hash route', () => {
    const mismatches = NAV_GROUPS.flatMap((group) => group.items)
      .filter(({ id, label }) => id !== labelSlug(label) && id !== label.toLowerCase())
      .map(({ id, label }) => `#${id} → "${label}"`)

    expect(mismatches).toEqual([])
  })
})
