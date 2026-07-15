import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CompileNavorWorkspaceOptions } from '@navor/renderer'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type UserConfig } from 'vite'

import { navorWorkspacePlugin } from './vite-plugin'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const monorepoRoot = join(packageRoot, '../..')

function workspacePackageAlias(packageName: string, entry: string) {
  return {
    find: packageName,
    replacement: join(monorepoRoot, entry),
  }
}

const workspaceAliases = [
  workspacePackageAlias('@navor/adapters/browser', 'packages/adapters/src/browser.ts'),
  workspacePackageAlias('@navor/adapters', 'packages/adapters/src/index.ts'),
  workspacePackageAlias('@navor/contract', 'packages/contract/src/index.ts'),
  workspacePackageAlias('@navor/core/browser', 'packages/core/src/browser.ts'),
  workspacePackageAlias('@navor/core', 'packages/core/src/index.ts'),
  workspacePackageAlias(
    '@navor/renderer/apply-live-prices',
    'packages/renderer/src/apply-live-prices.ts',
  ),
  workspacePackageAlias('@navor/renderer', 'packages/renderer/src/index.ts'),
]

const hasWorkspaceSources = existsSync(join(monorepoRoot, 'packages/core/src/index.ts'))

export interface CreateNavorReaderViteConfigOptions {
  workspaceRoot?: string
  compileOptions?: CompileNavorWorkspaceOptions
  host?: string
  port?: number
}

export function createNavorReaderViteConfig(
  options: CreateNavorReaderViteConfigOptions = {},
): UserConfig {
  const workspaceRoot = options.workspaceRoot
  const allowedPaths = workspaceRoot ? [packageRoot, resolve(workspaceRoot)] : [packageRoot]

  return defineConfig({
    root: packageRoot,
    resolve: {
      alias: hasWorkspaceSources ? workspaceAliases : [],
    },
    build: {
      outDir: 'dist-app',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/app.[ext]',
        },
      },
    },
    server: {
      host: options.host ?? '127.0.0.1',
      port: options.port ?? 5173,
      fs: {
        allow: allowedPaths,
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      ...(workspaceRoot
        ? [
            navorWorkspacePlugin({
              workspaceRoot,
              compileOptions: options.compileOptions,
            }),
          ]
        : []),
    ],
  })
}

export function workspaceWatchGlobs(workspaceRoot: string) {
  return [
    join(resolve(workspaceRoot), '**/*.nav'),
    join(resolve(workspaceRoot), 'navor.config.json'),
  ]
}
