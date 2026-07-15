import type { NavorRendererAppState } from '@navor/contract'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReaderApp } from './ReaderApp'
import './styles.css'

declare global {
  interface Window {
    __NAVOR_STATIC_STATE__?: NavorRendererAppState
  }
}

async function loadReaderState(): Promise<NavorRendererAppState | null> {
  if (window.__NAVOR_STATIC_STATE__) {
    return window.__NAVOR_STATIC_STATE__
  }

  const source = document.querySelector('[data-navor-source]')?.getAttribute('data-navor-source')

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

const state = await loadReaderState()

createRoot(root).render(
  <StrictMode>
    <ReaderApp initialState={state} />
  </StrictMode>,
)
