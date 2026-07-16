import { access, readFile, stat, writeFile } from 'node:fs/promises'

import { checkNavorFormat, formatNavor, listWorkspaceSourceFiles } from '@navor/core'

export type FormatNavorPathResult = {
  command: 'format'
  path: string
  check: boolean
  files: string[]
  changed: string[]
  unchanged: string[]
}

export async function formatNavorPath(
  targetPath: string,
  options: { check?: boolean } = {},
): Promise<FormatNavorPathResult> {
  const check = options.check === true
  const files = await resolveNavFiles(targetPath)
  const changed: string[] = []
  const unchanged: string[] = []

  for (const file of files) {
    const source = await readFile(file, 'utf8')
    const result = checkNavorFormat(source)

    if (result.ok) {
      unchanged.push(file)
      continue
    }

    changed.push(file)

    if (!check) {
      await writeFile(file, formatNavor(source), 'utf8')
    }
  }

  return {
    command: 'format',
    path: targetPath,
    check,
    files,
    changed,
    unchanged,
  }
}

async function resolveNavFiles(targetPath: string): Promise<string[]> {
  await access(targetPath)
  const info = await stat(targetPath)

  if (info.isFile()) {
    if (!targetPath.endsWith('.nav')) {
      throw new Error(`Not a .nav file: ${targetPath}`)
    }

    return [targetPath]
  }

  if (!info.isDirectory()) {
    throw new Error(`Path is not a file or directory: ${targetPath}`)
  }

  const files = await listWorkspaceSourceFiles(targetPath)
  const navFiles = files.filter((file) => file.endsWith('.nav'))

  if (navFiles.length === 0) {
    throw new Error(`No .nav files found under ${targetPath}`)
  }

  return navFiles
}

export function formatNavorPathSummary(result: FormatNavorPathResult): string {
  if (result.check) {
    if (result.changed.length === 0) {
      return `Checked ${result.files.length} file(s); all formatted.`
    }

    return [
      `Checked ${result.files.length} file(s); ${result.changed.length} need formatting:`,
      ...result.changed.map((file) => `  ${file}`),
    ].join('\n')
  }

  if (result.changed.length === 0) {
    return `Formatted ${result.files.length} file(s); already clean.`
  }

  return `Formatted ${result.changed.length} of ${result.files.length} file(s).`
}
