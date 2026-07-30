import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const DYNAMIC_MESSAGE_KEYS = new Set(['Active', 'stale', 'failed'])

describe('Reader message catalog', () => {
  it('does not retain product copy left behind by removed views', () => {
    const catalog = readFileSync('packages/reader-ui/src/i18n.ts', 'utf8')
    const sourceFiles = readerUiSourceFiles('packages/reader-ui/src').filter(
      (file) => !file.endsWith('/i18n.ts'),
    )
    const source = sourceFiles.map((file) => readFileSync(file, 'utf8')).join('\n')
    const messages = catalog
      .slice(catalog.indexOf('const chinese = {'), catalog.indexOf('} as const'))
      .matchAll(/^ {2}(?:(['"])(.*?)\1|([A-Za-z][A-Za-z ]*)):/gm)

    const unused = [...messages]
      .map((match) => match[2] ?? match[3])
      .filter((key): key is string => Boolean(key))
      .filter(
        (key) =>
          !DYNAMIC_MESSAGE_KEYS.has(key) &&
          !source.includes(`'${key}'`) &&
          !source.includes(`"${key}"`),
      )

    expect(unused).toEqual([])
  })
})

function readerUiSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return readerUiSourceFiles(path)
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : []
  })
}
