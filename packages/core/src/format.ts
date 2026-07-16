import { type ParsedPostingLine, parsePostingLine } from './postings'

const METADATA_PATTERN = /^([A-Za-z_][A-Za-z0-9_]*):\s+(.+)$/
const DIRECTIVE_PATTERN = /^(\d{4}-\d{2}-\d{2})\s+([A-Za-z]+)\s+([^\s"]+)(?:\s+"([^"]*)")?\s*$/

type TopLevelItem =
  | { kind: 'comment'; text: string }
  | { kind: 'directive'; header: string; children: ChildLine[] }

type ChildLine =
  | { kind: 'metadata'; key: string; value: string }
  | { kind: 'posting'; posting: ParsedPostingLine }
  | { kind: 'body-open' }
  | { kind: 'body-close' }
  | { kind: 'body'; text: string }
  | { kind: 'raw'; text: string }

export function formatNavor(source: string): string {
  const lines = source.replace(/\r\n/g, '\n').replace(/\t/g, '  ').split('\n')
  const items = collectTopLevelItems(lines)
  const output: string[] = []

  for (const [index, item] of items.entries()) {
    if (item.kind === 'comment') {
      output.push(item.text.startsWith(';') ? item.text : `;${item.text}`)
      continue
    }

    if (index > 0 && items[index - 1]?.kind === 'directive') {
      output.push('')
    }

    output.push(...formatDirectiveBlock(item))
  }

  return `${output.join('\n')}\n`
}

export function checkNavorFormat(source: string): {
  ok: boolean
  formatted: string
} {
  const formatted = formatNavor(source)
  const normalized = source.replace(/\r\n/g, '\n')
  const current = normalized.endsWith('\n') ? normalized : `${normalized}\n`

  return {
    ok: formatted === current,
    formatted,
  }
}

function collectTopLevelItems(lines: string[]): TopLevelItem[] {
  const items: TopLevelItem[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''

    if (line.trim() === '') {
      index += 1
      continue
    }

    if (line.startsWith(';')) {
      items.push({ kind: 'comment', text: line.trimEnd() })
      index += 1
      continue
    }

    if (line.startsWith('  ')) {
      items.push({
        kind: 'directive',
        header: line.trimEnd(),
        children: [],
      })
      index += 1
      continue
    }

    const children: ChildLine[] = []
    index += 1
    let inBody = false

    while (index < lines.length) {
      const child = (lines[index] ?? '').replace(/\t/g, '  ')

      if (child.trim() === '' || !child.startsWith('  ')) {
        break
      }

      const content = child.slice(2)

      if (inBody) {
        if (content === '---') {
          children.push({ kind: 'body-close' })
          inBody = false
        } else {
          children.push({ kind: 'body', text: content })
        }
        index += 1
        continue
      }

      if (content === '---') {
        children.push({ kind: 'body-open' })
        inBody = true
        index += 1
        continue
      }

      const metadataMatch = content.match(METADATA_PATTERN)

      if (metadataMatch?.[1] !== undefined && metadataMatch[2] !== undefined) {
        children.push({
          kind: 'metadata',
          key: metadataMatch[1],
          value: metadataMatch[2],
        })
        index += 1
        continue
      }

      const posting = parsePostingLine(content)

      if (posting) {
        children.push({ kind: 'posting', posting })
        index += 1
        continue
      }

      children.push({ kind: 'raw', text: content })
      index += 1
    }

    items.push({
      kind: 'directive',
      header: formatDirectiveHeader(line.trimEnd()),
      children,
    })
  }

  return items
}

function formatDirectiveHeader(line: string): string {
  const match = line.match(DIRECTIVE_PATTERN)

  if (!match) {
    return line
  }

  const [, date, directive, subject, title] = match

  if (date === undefined || directive === undefined || subject === undefined) {
    return line
  }

  if (title === undefined) {
    return `${date} ${directive} ${subject}`
  }

  return `${date} ${directive} ${subject} "${title}"`
}

function formatDirectiveBlock(item: Extract<TopLevelItem, { kind: 'directive' }>): string[] {
  const lines = [item.header]
  const postings = item.children.filter(
    (child): child is Extract<ChildLine, { kind: 'posting' }> => child.kind === 'posting',
  )
  const postingLines = formatPostingLines(postings.map((child) => child.posting))
  let postingIndex = 0

  for (const child of item.children) {
    if (child.kind === 'metadata') {
      lines.push(`  ${child.key}: ${child.value}`)
      continue
    }

    if (child.kind === 'posting') {
      lines.push(postingLines[postingIndex] ?? `  ${formatSinglePosting(child.posting)}`)
      postingIndex += 1
      continue
    }

    if (child.kind === 'body-open' || child.kind === 'body-close') {
      lines.push('  ---')
      continue
    }

    if (child.kind === 'body') {
      lines.push(`  ${child.text}`)
      continue
    }

    lines.push(`  ${child.text}`)
  }

  return lines
}

function formatPostingLines(postings: ParsedPostingLine[]): string[] {
  if (postings.length === 0) {
    return []
  }

  const accountWidth = Math.max(...postings.map((posting) => posting.account.length))
  const quantityWidth = Math.max(...postings.map((posting) => posting.quantity.length))

  return postings.map((posting) => {
    const account = posting.account.padEnd(accountWidth)
    const quantity = posting.quantity.padStart(quantityWidth)
    const price =
      posting.priceAmount && posting.priceCurrency
        ? ` @ ${posting.priceAmount} ${posting.priceCurrency}`
        : ''

    return `  ${account}  ${quantity} ${posting.commodity}${price}`
  })
}

function formatSinglePosting(posting: ParsedPostingLine): string {
  const price =
    posting.priceAmount && posting.priceCurrency
      ? ` @ ${posting.priceAmount} ${posting.priceCurrency}`
      : ''

  return `${posting.account}  ${posting.quantity} ${posting.commodity}${price}`
}
