import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const LIGHT_SURFACE_BUTTON_FILES = [
  'packages/reader-ui/src/components/KnowledgeTable.tsx',
  'packages/reader-ui/src/components/AssetDetailPanel.tsx',
  'packages/reader-ui/src/App.tsx',
  'packages/reader-ui/src/components/PriceStatusBar.tsx',
]

describe('light-surface button hover contrast', () => {
  it('does not pair muted/ink text with dark sidebar hover', () => {
    for (const file of LIGHT_SURFACE_BUTTON_FILES) {
      const source = readFileSync(file, 'utf8')
      expect(source, file).not.toMatch(/hover:bg-sidebar/)
    }

    const openAssetButton = readFileSync(
      'packages/reader-ui/src/components/KnowledgeTable.tsx',
      'utf8',
    )
    expect(openAssetButton).toContain('hover:bg-accent-soft')
    expect(openAssetButton).toContain('hover:text-accent-ink')
  })
})
