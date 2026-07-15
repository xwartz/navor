import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const WORKSPACE = 'packages/reader-ui/src/AssetWorkspaceProvider.tsx'
const PANEL = 'packages/reader-ui/src/components/AssetWorkspacePanel.tsx'
const SCAFFOLD = 'packages/reader-ui/src/components/ViewScaffold.tsx'

describe('shared asset workspace', () => {
  it('persists the selected asset in the URL and restores focus on close', () => {
    const source = readFileSync(WORKSPACE, 'utf8')

    expect(source).toMatch(/searchParams\.get\('asset'\)/)
    expect(source).toMatch(/searchParams\.set\('asset', subject\)/)
    expect(source).toMatch(/searchParams\.delete\('asset'\)/)
    expect(source).toMatch(/returnFocusRef\.current\.focus\(\{ preventScroll: true \}\)/)
    expect(source).toMatch(/data-asset-subject/)
  })

  it('supports Escape, focus trapping, and view-preserving asset links', () => {
    const source = readFileSync(PANEL, 'utf8')

    expect(source).toMatch(/event\.key === 'Escape'/)
    expect(source).not.toMatch(/Escape' && isModal/)
    expect(source).toMatch(/document\.addEventListener\('keydown', handleKeyDown\)/)
    expect(source).toMatch(/event\.key !== 'Tab'/)
    expect(source).toMatch(/href="#holdings"/)
    expect(source).toMatch(/href="#research"/)
    expect(source).toMatch(/role=\{isModal \? 'dialog' : 'complementary'\}/)
    expect(source).toMatch(/isModal \? \(/)
    expect(source).toMatch(/xl:w-\[22rem\] 2xl:w-\[30rem\]/)
  })

  it('keeps asset cells opt-in so nested interactive rows remain valid', () => {
    const source = readFileSync(SCAFFOLD, 'utf8')

    expect(source).toMatch(/interactive\?: boolean/)
    expect(source).toMatch(/interactive && subject && canOpenAsset\(subject\)/)
    expect(source).toMatch(/aria-haspopup="dialog"/)
  })
})
