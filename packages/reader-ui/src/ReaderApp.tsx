import type { NavorRendererAppState } from '@navor/contract'
import { useEffect } from 'react'
import { App } from './App'
import { PriceStatusBar } from './components/PriceStatusBar'
import { WorkspaceStatus } from './components/WorkspaceStatus'
import { documentTitleFromState } from './document-title'
import { readerLocale } from './i18n'
import { useLivePrices } from './use-live-prices'

interface ReaderAppProps {
  initialState: NavorRendererAppState | null
}

export function ReaderApp({ initialState }: ReaderAppProps) {
  useEffect(() => {
    document.documentElement.lang = readerLocale
  }, [])

  const { state, loading, error, liveEnabled, refresh } = useLivePrices(initialState)

  useEffect(() => {
    document.title = documentTitleFromState(state)
  }, [state])

  if (!state) {
    return <App state={null} />
  }

  return (
    <>
      <PriceStatusBar
        error={error}
        liveEnabled={liveEnabled}
        loading={loading}
        onRefresh={refresh}
        state={state}
      />
      <App
        liveEnabled={liveEnabled}
        renderSidebarStatus={(isRail) => (
          <WorkspaceStatus
            isRail={isRail}
            liveEnabled={liveEnabled}
            loading={loading}
            state={state}
          />
        )}
        state={state}
      />
    </>
  )
}
