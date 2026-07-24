import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'
import oniguruma from 'vscode-oniguruma'
import vsctm from 'vscode-textmate'

/**
 * Minimal stub of text.html.markdown that keeps the paragraph `while` rule
 * which continues across setext underlines (`---`). That rule is what made
 * Navor body closers get swallowed when the full Markdown grammar was included
 * directly under the body begin/end.
 */
const stubMarkdownGrammar = {
  scopeName: 'text.html.markdown',
  patterns: [{ include: '#paragraph' }],
  repository: {
    paragraph: {
      begin: '(^|\\G)[ ]{0,3}(?=[^ \\t\\n])',
      name: 'meta.paragraph.markdown',
      while: '(^|\\G)((?=\\s*[-=]{3,}\\s*$)|[ ]{4,}(?=[^ \\t\\n]))',
      patterns: [],
    },
  },
}

const require = createRequire(import.meta.url)

async function loadNavorGrammar(): Promise<vsctm.IGrammar> {
  const wasmPath = require.resolve('vscode-oniguruma/release/onig.wasm')
  const wasmBin = await readFile(wasmPath)
  await oniguruma.loadWASM(wasmBin.buffer.slice(wasmBin.byteOffset, wasmBin.byteOffset + wasmBin.byteLength))

  const grammarPath = join(process.cwd(), 'extensions/vscode/syntaxes/navor.tmLanguage.json')
  const navorRaw = await readFile(grammarPath, 'utf8')

  const registry = new vsctm.Registry({
    onigLib: Promise.resolve({
      createOnigScanner: (patterns) => new oniguruma.OnigScanner(patterns),
      createOnigString: (s) => new oniguruma.OnigString(s),
    }),
    loadGrammar: async (scopeName) => {
      if (scopeName === 'source.navor') {
        return vsctm.parseRawGrammar(navorRaw, 'navor.tmLanguage.json')
      }
      if (scopeName === 'text.html.markdown') {
        return vsctm.parseRawGrammar(JSON.stringify(stubMarkdownGrammar), 'markdown.stub.json')
      }
      return null
    },
  })

  const grammar = await registry.loadGrammar('source.navor')
  if (!grammar) {
    throw new Error('failed to load source.navor')
  }
  return grammar
}

function directiveKeywordHits(grammar: vsctm.IGrammar, source: string): { ok: number; total: number } {
  const lines = source.split(/\n/)
  let ruleStack = vsctm.INITIAL
  let ok = 0
  let total = 0

  for (const line of lines) {
    const result = grammar.tokenizeLine(line, ruleStack)
    ruleStack = result.ruleStack
    if (!/^\d{4}-\d{2}-\d{2}\s+\S+/.test(line)) continue
    total += 1
    const scopes = result.tokens.flatMap((token) => token.scopes)
    if (scopes.some((scope) => scope.includes('keyword.control.directive'))) {
      ok += 1
    }
  }

  return { ok, total }
}

describe('Navor TextMate tokenization', () => {
  it('keeps highlighting after a Markdown body closed by ---', async () => {
    const grammar = await loadNavorGrammar()
    const source = `2026-01-18 research Asset:A "T1"
  source: X
  ---
  hello world
  ---

2026-02-05 research Asset:B "T2"
  source: Y
`

    const { ok, total } = directiveKeywordHits(grammar, source)
    expect(total).toBe(2)
    expect(ok).toBe(2)
  })

  it('highlights every directive in knowledge.nav and process.nav', async () => {
    const grammar = await loadNavorGrammar()

    for (const relative of ['example/activity/knowledge.nav', 'example/activity/process.nav']) {
      const source = await readFile(join(process.cwd(), relative), 'utf8')
      const { ok, total } = directiveKeywordHits(grammar, source)
      expect(total).toBeGreaterThan(1)
      expect(ok).toBe(total)
    }
  })
})
