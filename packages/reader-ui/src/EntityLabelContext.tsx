import type { NavorRendererAppState } from '@navor/contract'
import { createContext, type ReactNode, useContext, useMemo } from 'react'

import {
  buildEntityLabelIndex,
  type EntityLabel,
  entityMetaLine,
  resolveEntityLabel,
} from './entity-labels'

const EntityLabelContext = createContext<Map<string, EntityLabel>>(new Map())

export function EntityLabelProvider({
  state,
  children,
}: {
  state: NavorRendererAppState
  children: ReactNode
}) {
  const index = useMemo(() => buildEntityLabelIndex(state), [state])

  return <EntityLabelContext.Provider value={index}>{children}</EntityLabelContext.Provider>
}

export function useEntityLabelIndex() {
  return useContext(EntityLabelContext)
}

export function useEntityLabel(subject: string | null | undefined) {
  const index = useEntityLabelIndex()

  if (!subject) {
    return null
  }

  return resolveEntityLabel(index, subject)
}

export function useEntityMeta(subject: string | null | undefined, explicitMeta?: string | null) {
  const label = useEntityLabel(subject)

  if (!label) {
    return explicitMeta ?? null
  }

  return entityMetaLine(label, explicitMeta)
}
