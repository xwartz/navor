import type { NavorDiagnostic } from '@navor/contract'

import { t } from '../i18n'

export function DiagnosticList({ diagnostics }: { diagnostics: NavorDiagnostic[] }) {
  if (diagnostics.length === 0) {
    return <p className="text-ink-muted">{t('No diagnostics.')}</p>
  }

  return (
    <ul className="space-y-2">
      {diagnostics.map((diagnostic) => (
        <li
          className="rounded-md border border-warning/20 bg-warning-soft px-4 py-3"
          key={`${diagnostic.file ?? 'file'}:${diagnostic.line}:${diagnostic.message}`}
        >
          <p className="font-medium text-warning">{diagnostic.message}</p>
          <p className="mt-1 text-xs text-ink-faint">
            {diagnostic.file ? `${diagnostic.file}:` : ''}
            {t('line')} {diagnostic.line}
          </p>
        </li>
      ))}
    </ul>
  )
}
