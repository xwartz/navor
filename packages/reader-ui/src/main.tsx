import type { NavorRendererAppState } from '@navor/contract'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReaderApp } from './ReaderApp'
import { readerStateSourceFromDocument } from './state-delivery'
import './styles.css'

const SERVICE_WORKER_UPDATE_INTERVAL_MS = 60 * 60 * 1000

function registerServiceWorkerUpdates() {
  if (!('serviceWorker' in navigator)) return

  const hadController = Boolean(navigator.serviceWorker.controller)
  let reloading = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !reloading) {
      reloading = true
      window.location.reload()
    }
  })

  void navigator.serviceWorker.register('/sw.js').then((registration) => {
    const checkForUpdate = () => {
      void registration.update()
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

  const response = await fetch(source)

  if (!response.ok) {
    return null
  }

  return (await response.json()) as NavorRendererAppState
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
