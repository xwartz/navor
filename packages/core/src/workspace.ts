import { access, readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

import { parseNavor } from './parser'
import { validateNavorSemantics } from './semantic'
import type { NavorAst, NavorDiagnostic, NavorWorkspace, NavorWorkspaceConfig } from './types'

export async function loadNavorWorkspace(root: string): Promise<NavorWorkspace> {
  const files = await findNavorFiles(root)
  return loadNavorWorkspaceFromFiles(root, files)
}

export interface NavorRepositorySnapshot {
  workspace: NavorWorkspace
  fingerprint: string
}

export async function loadNavorRepositorySnapshot(root: string): Promise<NavorRepositorySnapshot> {
  const files = await listWorkspaceSourceFiles(root)
  const [workspace, fingerprint] = await Promise.all([
    loadNavorWorkspaceFromFiles(
      root,
      files.filter((file) => file.endsWith('.nav')),
    ),
    fingerprintWorkspaceFiles(files),
  ])

  return { workspace, fingerprint }
}

async function loadNavorWorkspaceFromFiles(root: string, files: string[]): Promise<NavorWorkspace> {
  const { config, diagnostics: configDiagnostics } = await loadWorkspaceConfig(root)
  const parsedFiles = await Promise.all(
    files.map(async (file) => {
      const source = await readFile(file, 'utf8')
      const parsed = parseNavor(source, file)

      return {
        file,
        source,
        ...parsed,
      }
    }),
  )

  const ast: NavorAst = {
    directives: parsedFiles.flatMap((parsed) => parsed.ast.directives),
  }
  const diagnostics: NavorDiagnostic[] = [
    ...parsedFiles.flatMap((parsed) => parsed.diagnostics),
    ...configDiagnostics,
    ...validateNavorSemantics(ast),
  ]
  const source = parsedFiles.map((parsed) => parsed.source).join('\n')

  return {
    source,
    ast,
    diagnostics,
    files,
    config,
  }
}

async function loadWorkspaceConfig(root: string): Promise<{
  config: NavorWorkspaceConfig
  diagnostics: NavorDiagnostic[]
}> {
  const jsonPath = join(root, 'navor.config.json')

  try {
    await access(jsonPath)
    const raw = await readFile(jsonPath, 'utf8')
    const parsed = JSON.parse(raw) as NavorWorkspaceConfig

    return {
      config: {
        stalePriceAfterDays: parsed.stalePriceAfterDays,
        baseCurrency: parsed.baseCurrency,
        symbolMap: parsed.symbolMap,
        staticPrices: parsed.staticPrices,
        fxRates: parsed.fxRates,
      },
      diagnostics: [],
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { config: {}, diagnostics: [] }
    }

    return {
      config: {},
      diagnostics: [
        {
          file: jsonPath,
          line: 1,
          message: `Could not read navor.config.json: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    }
  }
}

async function findNavorFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(root, entry.name)

      if (entry.isDirectory()) {
        return findNavorFiles(path)
      }

      return entry.isFile() && entry.name.endsWith('.nav') ? [path] : []
    }),
  )

  return files.flat().sort()
}

export async function getNavorWorkspaceFingerprint(root: string): Promise<string> {
  const files = await listWorkspaceSourceFiles(root)
  return fingerprintWorkspaceFiles(files)
}

async function fingerprintWorkspaceFiles(files: string[]): Promise<string> {
  const parts = await Promise.all(
    files.map(async (file) => {
      const fileStat = await stat(file)
      return `${file}:${fileStat.mtimeMs}`
    }),
  )

  return parts.join('|')
}

export async function listWorkspaceSourceFiles(root: string): Promise<string[]> {
  const files = await findNavorFiles(root)
  const configPath = join(root, 'navor.config.json')

  try {
    await access(configPath)
    return [...files, configPath].sort()
  } catch {
    return files
  }
}
