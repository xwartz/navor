import type { NavorRendererAppState } from '@navor/contract'

import { shortSubjectLabel } from './entity-labels'

export function documentTitleFromState(state: NavorRendererAppState | null | undefined): string {
  const subject = state?.allocation.capital?.subject ?? state?.dashboard.capital?.subject

  if (!subject) {
    return 'Navor'
  }

  return `${shortSubjectLabel(subject)} - Navor`
}
