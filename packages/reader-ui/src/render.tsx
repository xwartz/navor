import type { NavorRendererAppState } from '@navor/contract'
import { renderToStaticMarkup } from 'react-dom/server'
import { App } from './App'

export function renderNavorReaderHtml(state: NavorRendererAppState): string {
  return renderToStaticMarkup(<App state={state} />)
}
