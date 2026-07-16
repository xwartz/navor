#!/usr/bin/env node
/**
 * Install the local Navor VS Code/Cursor extension as a real extension folder
 * (symlink under ~/.cursor/extensions), then print reload instructions.
 */
import { access, lstat, mkdir, rm, symlink } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const extensionSource = join(root, 'extensions/vscode')
const extensionId = 'navor.navor-0.1.1'
const cursorExtDir = join(homedir(), '.cursor', 'extensions')
const target = join(cursorExtDir, extensionId)

await access(join(extensionSource, 'package.json'))
await access(join(extensionSource, 'format.cjs')).catch(() => {
  throw new Error('Missing extensions/vscode/format.cjs. Run: pnpm bundle:vscode')
})

await mkdir(cursorExtDir, { recursive: true })

try {
  const existing = await lstat(target)
  if (existing.isSymbolicLink() || existing.isDirectory() || existing.isFile()) {
    await rm(target, { recursive: true, force: true })
  }
} catch {
  // nothing to remove
}

await symlink(extensionSource, target, 'dir')
console.log(`Linked ${target} -> ${extensionSource}`)
console.log('Reload Cursor window: Developer: Reload Window')
