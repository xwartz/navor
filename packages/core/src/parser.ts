import { NAVOR_DIRECTIVE_SET } from './directives'
import { parsePosting } from './postings'
import type { NavorAst, NavorDiagnostic, NavorDirective, ParseNavorResult } from './types'

export function parseNavor(source: string, file?: string): ParseNavorResult {
  const ast: NavorAst = { directives: [] }
  const diagnostics: NavorDiagnostic[] = []
  const lines = source.replace(/\r\n/g, '\n').split('\n')

  let current: NavorDirective | null = null
  let bodyBlock: { lines: string[] } | null = null

  const finishBody = () => {
    if (current && bodyBlock) {
      current.body = bodyBlock.lines.join('\n')
      bodyBlock = null
    }
  }

  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1

    if (bodyBlock) {
      if (line === '  ---') {
        finishBody()
        continue
      }

      if (line.startsWith('  ')) {
        bodyBlock.lines.push(line.slice(2))
        continue
      }

      diagnostics.push({
        line: lineNumber,
        file,
        message: 'Body lines must be indented by two spaces.',
      })
      continue
    }

    if (line.trim() === '' || line.startsWith(';')) {
      continue
    }

    if (line.startsWith('  ')) {
      const action = parseIndentedLine(line, lineNumber, current, diagnostics, file)

      if (action === 'start-body') {
        bodyBlock = { lines: [] }
      }

      continue
    }

    const directive = parseDirectiveLine(line, lineNumber, diagnostics, file)

    if (directive) {
      current = directive
      ast.directives.push(current)
    }
  }

  if (bodyBlock) {
    diagnostics.push({
      line: lines.length,
      file,
      message: 'Body block is missing a closing delimiter.',
    })
  }

  return { ast, diagnostics }
}

function parseIndentedLine(
  line: string,
  lineNumber: number,
  current: NavorDirective | null,
  diagnostics: NavorDiagnostic[],
  file?: string,
): 'start-body' | null {
  if (!current) {
    diagnostics.push({
      line: lineNumber,
      file,
      message: 'Indented line must belong to a directive.',
    })
    return null
  }

  const content = line.slice(2)

  if (content === '---') {
    return 'start-body'
  }

  const metadataMatch = content.match(/^([A-Za-z_][A-Za-z0-9_]*):\s+(.+)$/)

  if (metadataMatch) {
    const [, key, value] = metadataMatch

    if (key === undefined || value === undefined) {
      diagnostics.push({
        line: lineNumber,
        file,
        message: 'Line is not valid metadata.',
      })
      return null
    }

    current.metadata[key] = value
    return null
  }

  const posting = parsePosting(content)

  if (!posting) {
    diagnostics.push({
      line: lineNumber,
      file,
      message: 'Line is not a valid posting.',
    })
    return null
  }

  current.postings.push(posting)
  return null
}

function parseDirectiveLine(
  line: string,
  lineNumber: number,
  diagnostics: NavorDiagnostic[],
  file?: string,
): NavorDirective | null {
  const directiveMatch = line.match(
    /^(\d{4}-\d{2}-\d{2})\s+([A-Za-z]+)\s+([^\s"]+)(?:\s+"([^"]*)")?\s*$/,
  )

  if (!directiveMatch) {
    diagnostics.push({
      line: lineNumber,
      file,
      message: 'Line is not a valid directive.',
    })
    return null
  }

  const [, date, directive, subject, title = null] = directiveMatch

  if (date === undefined || directive === undefined || subject === undefined) {
    diagnostics.push({
      line: lineNumber,
      file,
      message: 'Line is not a valid directive.',
    })
    return null
  }

  if (!NAVOR_DIRECTIVE_SET.has(directive)) {
    diagnostics.push({
      line: lineNumber,
      file,
      message: `Unknown directive "${directive}".`,
    })
    return null
  }

  return {
    line: lineNumber,
    file,
    date,
    directive,
    subject,
    title,
    metadata: {},
    postings: [],
    body: null,
  }
}
