import { describe, expect, it } from 'vitest'

import {
  isPaletteShortcut,
  isSearchShortcut,
} from '../../packages/reader-ui/src/keyboard-shortcuts'

describe('palette shortcuts', () => {
  it.each([
    ['k', true, false],
    ['K', true, false],
    ['k', false, true],
  ])('recognizes %s with the platform modifier', (key, metaKey, ctrlKey) => {
    expect(isPaletteShortcut({ key, metaKey, ctrlKey, altKey: false, shiftKey: false })).toBe(true)
  })

  it.each([
    ['/', false, false, false, false],
    ['k', false, false, false, false],
    ['/', true, false, true, false],
    ['k', true, false, false, true],
  ])('ignores other key combinations', (key, metaKey, ctrlKey, altKey, shiftKey) => {
    expect(isPaletteShortcut({ key, metaKey, ctrlKey, altKey, shiftKey })).toBe(false)
  })

  it.each([
    ['/', true, false, true, true],
    ['/', false, true, true, true],
    ['/', false, false, false, true],
    ['/', false, false, true, false],
    ['k', true, false, false, false],
  ])('routes slash to search without disrupting normal editing', (key, metaKey, ctrlKey, isEditing, expected) => {
    expect(
      isSearchShortcut({ key, metaKey, ctrlKey, altKey: false, shiftKey: false }, isEditing),
    ).toBe(expected)
  })
})
