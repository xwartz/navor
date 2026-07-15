import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { BrandMark } from '../../packages/reader-ui/src/components/BrandMark'

const BRAND_GLYPH = 'M7.5 23.5v-15h4l9 9.4V8.5h4v15h-4l-9-9.4v9.4h-4Z'

describe('reader brand assets', () => {
  it('keeps the application mark and favicon on the same geometry', () => {
    const appMark = renderToStaticMarkup(<BrandMark />)
    const favicon = readFileSync('packages/reader-ui/public/favicon.svg', 'utf8')

    expect(appMark).toContain(BRAND_GLYPH)
    expect(favicon).toContain(BRAND_GLYPH)
    expect(favicon).toContain('#367455')
  })
})
