import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['packages/core/src/index.ts', 'packages/core/src/browser.ts'],
    outDir: 'packages/core/dist',
    dts: true,
    format: ['esm'],
    sourcemap: true,
  },
  {
    entry: ['packages/contract/src/index.ts'],
    outDir: 'packages/contract/dist',
    dts: true,
    format: ['esm'],
    sourcemap: true,
  },
  {
    entry: ['packages/adapters/src/index.ts', 'packages/adapters/src/browser.ts'],
    outDir: 'packages/adapters/dist',
    dts: true,
    format: ['esm'],
    sourcemap: true,
  },
  {
    entry: ['packages/renderer/src/index.ts', 'packages/renderer/src/apply-live-prices.ts'],
    outDir: 'packages/renderer/dist',
    dts: true,
    format: ['esm'],
    sourcemap: true,
    external: ['@navor/adapters', '@navor/contract', '@navor/core'],
  },
  {
    entry: ['packages/reader-ui/src/index.ts'],
    outDir: 'packages/reader-ui/dist',
    dts: true,
    format: ['esm'],
    sourcemap: true,
    external: [
      'vite',
      'react',
      'react-dom',
      '@navor/adapters',
      '@navor/renderer',
      '@navor/renderer/apply-live-prices',
      '@navor/contract',
      '@tailwindcss/vite',
      '@vitejs/plugin-react',
      'tailwindcss',
    ],
  },
  {
    entry: [
      'packages/cli/src/index.ts',
      'packages/cli/src/serve.ts',
      'packages/cli/src/static-site.ts',
    ],
    outDir: 'packages/cli/dist',
    dts: true,
    format: ['esm'],
    sourcemap: true,
    external: ['@navor/reader-ui', '@navor/renderer', 'vite'],
  },
])
