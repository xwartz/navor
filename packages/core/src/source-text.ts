export const NAVOR_DIRECTIVE_PATTERN =
  /^(\d{4}-\d{2}-\d{2})\s+([A-Za-z]+)\s+([^\s"]+)(?:\s+"([^"]*)")?\s*$/

export const NAVOR_METADATA_PATTERN = /^([A-Za-z_][A-Za-z0-9_]*):\s+(.+)$/

export type NavorSourceLineKind = 'blank' | 'comment' | 'indented' | 'directive'

export function splitNavorSource(source: string, normalizeTabs = false): string[] {
  const normalized = source.replace(/\r\n/g, '\n')
  return (normalizeTabs ? normalized.replace(/\t/g, '  ') : normalized).split('\n')
}

export function classifyNavorSourceLine(line: string): NavorSourceLineKind {
  if (line.trim() === '') {
    return 'blank'
  }

  if (line.startsWith(';')) {
    return 'comment'
  }

  return line.startsWith('  ') ? 'indented' : 'directive'
}

export function parseNavorMetadata(line: string): { key: string; value: string } | null {
  const match = line.match(NAVOR_METADATA_PATTERN)

  if (match?.[1] === undefined || match[2] === undefined) {
    return null
  }

  return { key: match[1], value: match[2] }
}
