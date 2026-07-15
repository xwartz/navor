import type { NavorRendererAppState } from '@navor/contract'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildAssetWorkspaceIndex } from './asset-workspace'
import { AssetWorkspaceContext } from './asset-workspace-context'

export function AssetWorkspaceProvider({
  children,
  state,
}: {
  children: ReactNode
  state: NavorRendererAppState
}) {
  const assetWorkspace = useMemo(() => buildAssetWorkspaceIndex(state), [state])
  const canOpenAsset = useCallback(
    (subject: string | null | undefined) => assetWorkspace.has(subject),
    [assetWorkspace],
  )
  const [selectedAssetSubject, setSelectedAssetSubject] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }

    const subject = new URL(window.location.href).searchParams.get('asset')
    return assetWorkspace.has(subject) ? subject : null
  })
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const openAsset = useCallback(
    (subject: string) => {
      if (!canOpenAsset(subject)) {
        return
      }

      if (document.activeElement instanceof HTMLElement) {
        returnFocusRef.current = document.activeElement
      }

      setSelectedAssetSubject(subject)
      syncAssetParam(subject)
    },
    [canOpenAsset],
  )

  const closeAsset = useCallback(() => {
    const subject = selectedAssetSubject
    setSelectedAssetSubject(null)
    syncAssetParam(null)
    window.setTimeout(() => {
      if (returnFocusRef.current?.isConnected) {
        returnFocusRef.current.focus({ preventScroll: true })
        return
      }

      const fallback = Array.from(
        document.querySelectorAll<HTMLElement>('[data-asset-subject]'),
      ).find((element) => element.dataset.assetSubject === subject)
      const focusTarget = fallback ?? document.querySelector<HTMLElement>('main h1')
      focusTarget?.focus({ preventScroll: true })
    }, 0)
  }, [selectedAssetSubject])

  useEffect(() => {
    const syncFromHistory = () => {
      const subject = new URL(window.location.href).searchParams.get('asset')
      setSelectedAssetSubject(subject && canOpenAsset(subject) ? subject : null)
    }

    window.addEventListener('popstate', syncFromHistory)
    return () => window.removeEventListener('popstate', syncFromHistory)
  }, [canOpenAsset])

  useEffect(() => {
    if (selectedAssetSubject && !canOpenAsset(selectedAssetSubject)) {
      setSelectedAssetSubject(null)
      syncAssetParam(null)
    }
  }, [canOpenAsset, selectedAssetSubject])

  const value = useMemo(
    () => ({ assetWorkspace, canOpenAsset, closeAsset, openAsset, selectedAssetSubject }),
    [assetWorkspace, canOpenAsset, closeAsset, openAsset, selectedAssetSubject],
  )

  return <AssetWorkspaceContext.Provider value={value}>{children}</AssetWorkspaceContext.Provider>
}

function syncAssetParam(subject: string | null) {
  const url = new URL(window.location.href)

  if (subject) {
    url.searchParams.set('asset', subject)
  } else {
    url.searchParams.delete('asset')
  }

  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}
