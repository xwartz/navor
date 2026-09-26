import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  createReaderLocalization,
  formatAssetCount,
  formatBaseCurrency,
  formatDashboardActionInstruction,
  formatDashboardActionLabel,
  formatDashboardActionReason,
  formatDriftTag,
  formatFacetOption,
  formatFilterMatchCount,
  formatInvalidIf,
  formatMarketAmount,
  formatOpenActionDetail,
  formatPortfolioPositionCount,
  formatRelatedEntity,
  formatSearchResultCount,
  formatTargetAmount,
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

  it('localizes the decision-desk navigation labels', () => {
    const command = getNavGroups('zh-CN')[0]

    expect(command?.label).toBe('投资总览')
    expect(command?.items[0]).toEqual({ id: 'overview', label: '投资简报' })
    expect(command?.items[1]).toEqual({ id: 'holdings', label: '投资组合' })
    expect(getNavGroups('en')[0]?.label).toBe('Investment overview')
    expect(getNavGroups('zh-CN')[1]?.items[1]).toEqual({ id: 'reviews', label: '复盘与日志' })
  })

  it('requires product copy to be registered before it can use the typed translator', () => {
    expect(t('Decision', 'zh-CN')).toBe('决策')
    expect(t('Decision', 'en')).toBe('Decision')
    expect(t('Cases', 'zh-CN')).toBe('案例总览')
    expect(t('Case index', 'zh-CN')).toBe('案例清单')
    expect(t('Market coverage', 'zh-CN')).toBe('行情覆盖')
    expect(t('stale', 'zh-CN')).toBe('已过期')
    expect(t('sleeves', 'zh-CN')).toBe('个资金分组')
    expect(t('Not available', 'zh-CN')).toBe('暂无')
    expect(t('No health issues need attention.', 'zh-CN')).toBe('暂无需要处理的数据健康问题。')
    expect(t('Buy', 'zh-CN')).toBe('买入')
    expect(t('Sell', 'zh-CN')).toBe('卖出')
    expect(t('Fee', 'zh-CN')).toBe('费用')
    expect(t('Digital assets', 'zh-CN')).toBe('数字资产')
    expect(t('Capture evidence', 'zh-CN')).toBe('记录证据')
    expect(t('No reason recorded', 'zh-CN')).toBe('未记录原因')
    expect(t('No provider', 'zh-CN')).toBe('无数据源')
    expect(t('No sleeve target', 'zh-CN')).toBe('无资金分组目标')
    expect(t('Average price', 'zh-CN')).toBe('均价')
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
    ).toBe('持仓高于目标区间 3.2 个百分点，占已估值投资组合的 40.0%。')

    expect(
      formatDashboardActionReason(
        { kind: 'over_invested', investedExcess: 3.2, impactPercent: null },
        'en',
      ),
    ).toBe('Position is 3.2% above its target amount.')
  })

  it('localizes every dashboard action instruction', () => {
    expect(
      (
        [
          'review_due',
          'above_max',
          'below_min',
          'currency_mismatch',
          'over_invested',
          'missing_price',
          'stale_price',
          'failed_price',
        ] as const
      ).map((type) => formatDashboardActionInstruction(type, 'zh-CN')),
    ).toEqual([
      '复核投资论点',
      '考虑减仓',
      '考虑加仓',
      '检查货币换算',
      '复核目标金额',
      '检查价格来源',
      '检查价格来源',
      '检查价格来源',
    ])
    expect(formatDashboardActionInstruction('over_invested', 'en')).toBe('Review target amount')
  })

  it('uses complete count and amount labels in both locales', () => {
    expect(formatOpenActionDetail(9, 5, 'en')).toBe('9 high-priority · 5 data issues')
    expect(formatPortfolioPositionCount(4, 'en')).toBe('4 positions')
    expect(formatTargetAmount('USD 25,000', 'en')).toBe('Target USD 25,000')
    expect(formatMarketAmount('USD 25,000', 'en')).toBe('Market value USD 25,000')
    expect(formatAssetCount(1, 'en')).toBe('1 asset')
    expect(formatAssetCount(3, 'zh-CN')).toBe('3 项资产')
    expect(formatFilterMatchCount(4, 'zh-CN')).toBe('4 条符合当前筛选')
    expect(formatInvalidIf('guidance changes', 'zh-CN')).toBe('失效条件 guidance changes')
    expect(formatDriftTag('+2.1%', 'zh-CN')).toBe('偏离 +2.1%')
    expect(formatRelatedEntity('Bitcoin', 'zh-CN')).toBe('关联 Bitcoin')
    expect(formatBaseCurrency('USD', 'zh-CN')).toBe('本位币 USD')
    expect(formatFacetOption('investment_risk', 'zh-CN')).toBe('配置风险')
    expect(formatFacetOption('high', 'zh-CN')).toBe('高')
    expect(formatFacetOption('Buy', 'zh-CN')).toBe('买入')
    expect(formatFacetOption('Capture evidence', 'zh-CN')).toBe('记录证据')
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
