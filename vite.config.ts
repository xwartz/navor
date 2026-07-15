import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@navor/adapters/browser': fileURLToPath(
        new URL('./packages/adapters/src/browser.ts', import.meta.url),
      ),
      '@navor/adapters': fileURLToPath(
        new URL('./packages/adapters/src/index.ts', import.meta.url),
      ),
      '@navor/core/browser': fileURLToPath(
        new URL('./packages/core/src/browser.ts', import.meta.url),
      ),
      '@navor/cli': fileURLToPath(new URL('./packages/cli/src/index.ts', import.meta.url)),
      '@navor/cli/serve': fileURLToPath(new URL('./packages/cli/src/serve.ts', import.meta.url)),
      '@navor/cli/static-site': fileURLToPath(
        new URL('./packages/cli/src/static-site.ts', import.meta.url),
      ),
      '@navor/contract': fileURLToPath(
        new URL('./packages/contract/src/index.ts', import.meta.url),
      ),
      '@navor/core': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url)),
      '@navor/reader-ui': fileURLToPath(
        new URL('./packages/reader-ui/src/index.ts', import.meta.url),
      ),
      '@navor/reader-ui/styles.css': fileURLToPath(
        new URL('./packages/reader-ui/src/styles.css', import.meta.url),
      ),
      '@navor/renderer/apply-live-prices': fileURLToPath(
        new URL('./packages/renderer/src/apply-live-prices.ts', import.meta.url),
      ),
      '@navor/renderer': fileURLToPath(
        new URL('./packages/renderer/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.{ts,tsx}'],
    testTimeout: 30_000,
  },
})
