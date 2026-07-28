import { describe, expect, it } from 'vitest'
import {
  isReaderStateRequest,
  READER_STATE_SOURCE_ATTRIBUTE,
  readerStateDeliveryTag,
} from '../../packages/reader-ui/src/state-delivery'

describe('Reader state delivery', () => {
  it('shares the static marker and development request contract', () => {
    expect(readerStateDeliveryTag()).toContain(READER_STATE_SOURCE_ATTRIBUTE)
    expect(readerStateDeliveryTag()).toContain('./navor-data.json')
    expect(isReaderStateRequest('/navor-data.json')).toBe(true)
    expect(isReaderStateRequest('/assets/app.js')).toBe(false)
  })
})
