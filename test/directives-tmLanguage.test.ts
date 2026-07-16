import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { NAVOR_DIRECTIVES } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('NAVOR_DIRECTIVES TextMate sync', () => {
  it('lists the same twelve directive keywords as the TextMate grammar', async () => {
    const grammarPath = join(process.cwd(), 'extensions/vscode/syntaxes/navor.tmLanguage.json')
    const grammar = JSON.parse(await readFile(grammarPath, 'utf8')) as {
      repository: {
        directive: {
          begin: string
        }
      }
    }

    const match = grammar.repository.directive.begin.match(
      /\((option\|capital\|open\|close\|plan\|research\|thesis\|decision\|txn\|review\|journal\|note)\)/,
    )

    expect(match?.[1]).toBeDefined()
    const fromGrammar = match?.[1]?.split('|') ?? []

    expect(fromGrammar).toEqual([...NAVOR_DIRECTIVES])
  })
})
