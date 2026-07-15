import { serveNavorWorkspace } from '@navor/cli'
import { describe, expect, it } from 'vitest'

describe('serveNavorWorkspace', () => {
  it('starts a local Reader App over HTTP from a Workspace path', async () => {
    const served = await serveNavorWorkspace('fixtures/core', {
      today: '2026-07-08',
      port: 0,
    })

    try {
      const dataResponse = await fetch(new URL('/navor-data.json', served.url))
      const data = (await dataResponse.json()) as {
        workspace: { files: string[] }
        dashboard: { pendingReviews: Array<{ reviewBy: string }> }
      }

      expect(served.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/?$/)
      expect(data.workspace.files).toHaveLength(7)
      expect(served.state.workspace.files).toHaveLength(7)
      expect(data.dashboard.pendingReviews).toEqual(served.state.dashboard.pendingReviews)
      expect(data.dashboard.pendingReviews).toEqual([
        {
          subject: 'Asset:Crypto:BTC',
          title: 'Digital reserve asset',
          reviewBy: '2026-05-11',
        },
      ])

      const pageResponse = await fetch(served.url)
      const html = await pageResponse.text()

      expect(html).toContain('<title>Navor</title>')
      expect(html).toContain('navor-data.json')
    } finally {
      await served.close()
    }
  })
})
