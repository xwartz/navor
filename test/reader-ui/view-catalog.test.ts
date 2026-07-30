import { describe, expect, it } from 'vitest'

import { getReaderView, READER_VIEW_CATALOG } from '../../packages/reader-ui/src/view-catalog'

describe('Reader view catalog', () => {
  it('owns every route and its Reader behavior', () => {
    expect(READER_VIEW_CATALOG).toHaveLength(12)
    for (const view of READER_VIEW_CATALOG) {
      expect(getReaderView(view.id)).toBe(view)
      expect(view.render).toEqual(expect.any(Function))
    }
  })
})
