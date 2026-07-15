import { createContext, useContext } from 'react'
import type { AssetWorkspaceIndex } from './asset-workspace'

export interface AssetWorkspaceContextValue {
  canOpenAsset: (subject: string | null | undefined) => boolean
  closeAsset: () => void
  openAsset: (subject: string) => void
  assetWorkspace: AssetWorkspaceIndex
  selectedAssetSubject: string | null
}

export const AssetWorkspaceContext = createContext<AssetWorkspaceContextValue | null>(null)

const EMPTY_WORKSPACE: AssetWorkspaceContextValue = {
  canOpenAsset: () => false,
  closeAsset: () => undefined,
  openAsset: () => undefined,
  assetWorkspace: { get: () => null, has: () => false },
  selectedAssetSubject: null,
}

export function useAssetWorkspace() {
  return useContext(AssetWorkspaceContext) ?? EMPTY_WORKSPACE
}
