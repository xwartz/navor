import { describe, expect, it } from 'vitest'
import {
  readReaderLocation,
  updateReaderLocation,
} from '../../packages/reader-ui/src/reader-location'

describe('Reader location behavior', () => {
  it('preserves Asset selection when changing views and preserves the view when closing an Asset', () => {
    const selected = updateReaderLocation(
      'https://navor.test/?asset=Asset%3ACrypto%3ABTC#briefing',
      {
        view: 'holdings',
      },
    )
    const closed = updateReaderLocation(`https://navor.test${selected}`, { asset: null })

    expect(selected).toBe('/?asset=Asset%3ACrypto%3ABTC#portfolio')
    expect(closed).toBe('/#portfolio')
  })

  it('restores only known Asset deep links', () => {
    expect(
      readReaderLocation(
        'https://navor.test/?asset=Asset%3ACrypto%3ABTC#portfolio',
        'overview',
        (subject) => subject === 'Asset:Crypto:BTC',
      ),
    ).toMatchObject({ asset: 'Asset:Crypto:BTC', view: 'holdings' })
  })
})
