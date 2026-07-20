import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  createReaderLocalization,
  formatDashboardActionLabel,
  formatDashboardActionReason,
  formatSearchResultCount,
  resolveReaderLocale,
  t,
  translateText,
} from '../../packages/reader-ui/src/i18n'
import { getNavGroups } from '../../packages/reader-ui/src/navigation'

describe('reader localization', () => {
  it('uses the first supported browser-preferred language', () => {
    expect(resolveReaderLocale(['en-US', 'zh-CN'])).toBe('en')
    expect(resolveReaderLocale(['zh-CN', 'en-US'])).toBe('zh-CN')
    expect(resolveReaderLocale(['zh-TW'])).toBe('zh-CN')
  })

  it('falls back to English for non-Chinese browser languages', () => {
    expect(resolveReaderLocale(['ja-JP', 'en-US'])).toBe('en')
    expect(resolveReaderLocale()).toBe('en')
  })

  it('localizes navigation labels without changing hash routes', () => {
    const command = getNavGroups('zh-CN')[0]

    expect(command?.label).toBe('指挥台')
    expect(command?.items[0]).toEqual({ id: 'overview', label: '总览' })
  })

  it('requires product copy to be registered before it can use the typed translator', () => {
    expect(t('Decision', 'zh-CN')).toBe('决策')
    expect(t('Decision', 'en')).toBe('Decision')
    expect(t('Market snapshot', 'zh-CN')).toBe('市场快照')
    expect(t('Action below band', 'zh-CN')).toBe('低于区间时操作')
    expect(t('stale', 'zh-CN')).toBe('陈旧')
    expect(t('Not available', 'zh-CN')).toBe('暂无')
  })

  it('keeps locale, messages, and number formatting behind one Reader localization entry', () => {
    const localization = createReaderLocalization('zh-CN')

    expect(localization.locale).toBe('zh-CN')
    expect(localization.t('Decision')).toBe('决策')
    expect(localization.formatNumber(12_345.6, { maximumFractionDigits: 1 })).toBe('12,345.6')
    expect(formatSearchResultCount(3, 'zh-CN')).toBe('工作区内共 3 条记录')
    expect(formatSearchResultCount(1, 'en')).toBe('1 record across the workspace')
  })

  it('keeps dynamic workspace data intact during the migration', () => {
    expect(translateText('Asset:Crypto:BTC', 'zh-CN')).toBe('Asset:Crypto:BTC')
  })

  it('formats dashboard action facts with Chinese variable order', () => {
    expect(formatDashboardActionLabel('over_invested', 'zh-CN')).toBe('复核')
    expect(formatDashboardActionLabel('stale_price', 'zh-CN')).toBe('价格')

    expect(
      formatDashboardActionReason(
        {
          kind: 'above_max',
          drift: 3.2,
          impactPercent: 40,
        },
        'zh-CN',
      ),
    ).toBe('持仓高于策略区间 3.2 个百分点，占已估值投资组合的 40.0%。')

    expect(
      formatDashboardActionReason(
        { kind: 'over_invested', investedExcess: 3.2, impactPercent: null },
        'en',
      ),
    ).toBe('Position is 3.2% above its target amount.')
  })

  it('does not use document mutation to localize Reader product copy', () => {
    const readerApp = readFileSync('packages/reader-ui/src/ReaderApp.tsx', 'utf8')
    const sourceFiles = readerUiSourceFiles('packages/reader-ui/src')
    const rawTextNodes = sourceFiles.flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/>[ \t]*[A-Za-z][^<{\n]*</g)]
        .map((match) => ({ file, text: match[0].trim() }))
        .filter((match) => match.text !== '> Promise<'),
    )

    expect(readerApp).not.toContain('MutationObserver')
    expect(readerApp).not.toContain('localizeReaderDocument')
    expect(rawTextNodes).toEqual([
      { file: 'packages/reader-ui/src/App.tsx', text: '>Navor<' },
      { file: 'packages/reader-ui/src/components/BrandMark.tsx', text: '>Navor<' },
    ])
  })
})

function readerUiSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return readerUiSourceFiles(path)
    return /\.tsx$/.test(entry.name) ? [path] : []
  })
}
