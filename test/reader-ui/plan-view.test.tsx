import { App } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PlanView } from '../../packages/reader-ui/src/views/PlanView'

describe('Plan view', () => {
  it('shows only the current plan version in its active groups and exposes its revision count', async () => {
    const state = await compileNavorWorkspace('example', {
      fetchLivePrices: false,
      today: '2026-07-10',
    })

    const html = renderToStaticMarkup(<App initialView="plan" state={state} />)

    expect(html).toContain('Plan')
    expect(html).toContain('Plans in use')
    expect(html).toContain('Plans with actions')
    expect(html).toContain('Account allocation boundaries')
    expect(html).toContain('Asset plans')
    expect(html).toContain('ETH 回撤后计划')
    expect(html).toContain('Show history')
    expect(html.match(/1 revision/g)).toHaveLength(1)
    expect(html).toContain('Target allocation')
    expect(html).toContain('Allowed range')
    expect(html).toContain('Below 12.0%')
    expect(html).toContain('Above 23.0%')
    expect(html).toContain('Accumulate')
    expect(html).not.toContain('role="img"')
  })

  it('hides history after a JSON roundtrip when a plan has only one version', async () => {
    const compiled = await compileNavorWorkspace('example', {
      fetchLivePrices: false,
      today: '2026-07-10',
    })
    const currentEth = compiled.plan.current.find((entry) => entry.subject === 'Asset:Crypto:ETH')
    expect(currentEth).toBeTruthy()

    const state = JSON.parse(
      JSON.stringify({
        ...compiled,
        plan: {
          ...compiled.plan,
          entries: [currentEth],
          current: [currentEth],
        },
      }),
    ) as typeof compiled

    const html = renderToStaticMarkup(<App initialView="plan" state={state} />)

    expect(html).toContain('ETH 回撤后计划')
    expect(html).not.toContain('Show history')
  })

  it('still counts only prior revisions after a JSON roundtrip', async () => {
    const compiled = await compileNavorWorkspace('example', {
      fetchLivePrices: false,
      today: '2026-07-10',
    })
    const state = JSON.parse(JSON.stringify(compiled)) as typeof compiled

    const html = renderToStaticMarkup(<App initialView="plan" state={state} />)

    expect(html.match(/1 revision/g)).toHaveLength(1)
    expect(html).not.toContain('2 revision')
  })

  it('keeps the current plan visible when a filter matches one of its revisions', async () => {
    const state = await compileNavorWorkspace('example', {
      fetchLivePrices: false,
      today: '2026-07-10',
    })

    const html = renderToStaticMarkup(<PlanView filters={{ date: '2026-02-01' }} state={state} />)

    expect(html).toContain('ETH 回撤后计划')
    expect(html).toContain('ETH 分批计划')
    expect(html).toContain('2026-03-01')
  })
})
