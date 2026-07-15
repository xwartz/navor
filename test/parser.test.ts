import { parseNavor } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('parseNavor', () => {
  it('parses a minimal Navor file with directives, metadata, comments, and Markdown body', () => {
    const source = `; portfolio setup

2026-01-01 option Portfolio:Core "Base settings"
  base_currency: USD

2026-01-02 thesis Asset:Crypto:BTC "Digital reserve asset"
  confidence: High
  ---
  BTC is treated as the core reserve asset.
  Review the thesis quarterly.
  ---
`

    const result = parseNavor(source)

    expect(result.diagnostics).toEqual([])
    expect(result.ast.directives).toEqual([
      {
        line: 3,
        date: '2026-01-01',
        directive: 'option',
        subject: 'Portfolio:Core',
        title: 'Base settings',
        metadata: {
          base_currency: 'USD',
        },
        postings: [],
        body: null,
      },
      {
        line: 6,
        date: '2026-01-02',
        directive: 'thesis',
        subject: 'Asset:Crypto:BTC',
        title: 'Digital reserve asset',
        metadata: {
          confidence: 'High',
        },
        postings: [],
        body: 'BTC is treated as the core reserve asset.\nReview the thesis quarterly.',
      },
    ])
  })
})
