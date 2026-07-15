import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const TABLE = 'packages/reader-ui/src/components/KnowledgeTable.tsx'
const RESEARCH = 'packages/reader-ui/src/views/ResearchView.tsx'
const THESIS = 'packages/reader-ui/src/views/ThesisView.tsx'
const REVIEWS = 'packages/reader-ui/src/views/ReviewsView.tsx'
const JOURNAL = 'packages/reader-ui/src/views/JournalView.tsx'

describe('KnowledgeTable quiet row layout', () => {
  it('uses icon-only asset open, always-visible body, and split tag chips', () => {
    const source = readFileSync(TABLE, 'utf8')

    expect(source).toMatch(/tags\?: string\[\]/)
    expect(source).toMatch(/aria-label=\{formatOpenWorkspaceLabel\(/)
    expect(source).toMatch(/<span aria-hidden>↗<\/span>/)
    expect(source).toMatch(/tags\.map\(\(tag\) =>/)
    expect(source).toMatch(/useEntityLabel\(row\.subject\)/)
    expect(source).toMatch(/\{row\.body \? \(/)
    expect(source).not.toMatch(/>Open asset</)
    expect(source).not.toMatch(/useState/)
    expect(source).not.toMatch(/Read note/)
    expect(source).not.toMatch(/expanded/)
  })

  it('keeps research and sibling views free of raw subject paths in meta', () => {
    for (const file of [RESEARCH, THESIS, REVIEWS, JOURNAL]) {
      const source = readFileSync(file, 'utf8')
      expect(source, file).toMatch(/joinKnowledgeMeta/)
      expect(source, file).not.toMatch(/meta: `\$\{item\.date\} · \$\{item\.subject\}/)
      expect(source, file).not.toMatch(/tags: item\.tags\.join/)
      expect(source, file).not.toMatch(/tags: .*item\.subject/)
    }
  })
})
