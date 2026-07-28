import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { NavorRendererAppState } from '@navor/contract'

import { documentTitleFromState } from './document-title'
import { readerStateDeliveryTag } from './state-delivery'

export const READER_ARTIFACT_FILES = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'favicon.svg',
  'pwa-192.png',
  'pwa-512.png',
  'assets/app.js',
  'assets/app.css',
  'navor-data.json',
]

export async function writeReaderState(outDir: string, state: NavorRendererAppState) {
  await writeFile(join(outDir, 'navor-data.json'), `${JSON.stringify(state, null, 2)}\n`)
}

export async function finalizeReaderArtifacts(outDir: string, state: NavorRendererAppState) {
  const indexPath = join(outDir, 'index.html')
  const html = await readFile(indexPath, 'utf8')
  const withDataSource = html.includes('data-navor-source')
    ? html
    : html.replace('</head>', `    ${readerStateDeliveryTag()}\n  </head>`)
  const patched = withDataSource.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(documentTitleFromState(state))}</title>`,
  )
  if (patched !== html) await writeFile(indexPath, patched)
  return [...READER_ARTIFACT_FILES]
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
