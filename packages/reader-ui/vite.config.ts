import { createNavorReaderViteConfig } from './src/vite-config'

const workspaceRoot = process.env.NAVOR_WORKSPACE

export default createNavorReaderViteConfig({
  workspaceRoot,
})
