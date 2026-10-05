import type { NavorRendererAppState } from '@navor/contract'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReaderApp } from './ReaderApp'
import {
  fetchReaderState,
  readerAssetSources,
  readerStateSourceFromDocument,
} from './state-delivery'
import './styles.css'

const SERVICE_WORKER_UPDATE_INTERVAL_MS = 60 * 60 * 1000

function registerServiceWorkerUpdates() {
  if (!('serviceWorker' in navigator)) return

  const hadController = Boolean(navigator.serviceWorker.controller)
  const loadedAssets = JSON.stringify(readerAssetSources(document))
  let reloading = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return
    void (async () => {
      try {
        const url = new URL(window.location.href)
        url.hash = ''
        url.searchParams.set('navor_refresh', String(Date.now()))
        const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
        if (!response.ok) return
        const nextDocument = new DOMParser().parseFromString(await response.text(), 'text/html')
        const nextAssets = readerAssetSources(nextDocument)
        if (nextAssets.length > 0 && JSON.stringify(nextAssets) !== loadedAssets && !reloading) {
          reloading = true
          window.location.reload()
        }
      } catch {
        // Offline checks retain the running app. Ledger refresh has its own retry lifecycle.
      }
    })()
  })

  void navigator.serviceWorker.register('/sw.js').then((registration) => {
    const checkForUpdate = () => {
      void registration.update().catch(() => {})
    }

    checkForUpdate()
    window.setInterval(checkForUpdate, SERVICE_WORKER_UPDATE_INTERVAL_MS)
    window.addEventListener('focus', checkForUpdate)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    })
  })
}

declare global {
  interface Window {
    __NAVOR_STATIC_STATE__?: NavorRendererAppState
  }
}

async function loadReaderState(): Promise<NavorRendererAppState | null> {
  if (window.__NAVOR_STATIC_STATE__) {
    return window.__NAVOR_STATIC_STATE__
  }

  const source = readerStateSourceFromDocument(document)

  if (!source) {
    return null
  }

  try {
    return await fetchReaderState(source)
  } catch {
    return fetchReaderState(source, { fresh: false }).catch(() => null)
  }
}

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found.')
}

registerServiceWorkerUpdates()

const state = await loadReaderState()

createRoot(root).render(
  <StrictMode>
    <ReaderApp initialState={state} />
  </StrictMode>,
)
