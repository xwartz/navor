import { NAVOR_DIAGNOSTIC_CODES } from './diagnostics'
import { NAVOR_DIRECTIVE_SET } from './directives'
import { parsePosting } from './postings'
import {
  classifyNavorSourceLine,
  NAVOR_DIRECTIVE_PATTERN,
  parseNavorMetadata,
  splitNavorSource,
} from './source-text'
import type { NavorAst, NavorDiagnostic, NavorDirective, ParseNavorResult } from './types'

export function parseNavor(source: string, file?: string): ParseNavorResult {
  const ast: NavorAst = { directives: [] }
  const diagnostics: NavorDiagnostic[] = []
  const lines = splitNavorSource(source)

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
        code: NAVOR_DIAGNOSTIC_CODES.bodyIndentation,
        message: 'Body lines must be indented by two spaces.',
      })
      continue
    }

    const kind = classifyNavorSourceLine(line)

    if (kind === 'blank' || kind === 'comment') {
      continue
    }

    if (kind === 'indented') {
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
      code: NAVOR_DIAGNOSTIC_CODES.unclosedBody,
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
      code: NAVOR_DIAGNOSTIC_CODES.orphanIndentedLine,
      message: 'Indented line must belong to a directive.',
    })
    return null
  }

  const content = line.slice(2)

  if (content === '---') {
    return 'start-body'
  }

  const metadata = parseNavorMetadata(content)

  if (metadata) {
    current.metadata[metadata.key] = metadata.value
    return null
  }

  const posting = parsePosting(content)

  if (!posting) {
    diagnostics.push({
      line: lineNumber,
      file,
      code: NAVOR_DIAGNOSTIC_CODES.invalidPosting,
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
  const directiveMatch = line.match(NAVOR_DIRECTIVE_PATTERN)

  if (!directiveMatch) {
    diagnostics.push({
      line: lineNumber,
      file,
      code: NAVOR_DIAGNOSTIC_CODES.invalidDirective,
      message: 'Line is not a valid directive.',
    })
    return null
  }

  const [, date, directive, subject, title = null] = directiveMatch

  if (date === undefined || directive === undefined || subject === undefined) {
    diagnostics.push({
      line: lineNumber,
      file,
      code: NAVOR_DIAGNOSTIC_CODES.invalidDirective,
      message: 'Line is not a valid directive.',
    })
    return null
  }

  if (!NAVOR_DIRECTIVE_SET.has(directive)) {
    diagnostics.push({
      line: lineNumber,
      file,
      code: NAVOR_DIAGNOSTIC_CODES.unknownDirective,
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
