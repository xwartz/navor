import { useAssetWorkspace } from '../asset-workspace-context'
import { useEntityLabel } from '../EntityLabelContext'
import { formatOpenWorkspaceLabel } from '../i18n'
import { MarkdownBody } from './MarkdownBody'
import { Chip, EmptyState } from './ViewScaffold'

export interface KnowledgeTableRow {
  id: string
  title: string
  /** Date and contextual bits only. Subject is rendered via entity label. */
  meta: string
  subject?: string | null
  tags?: string[]
  body: string | null
}

interface KnowledgeTableProps {
  rows: KnowledgeTableRow[]
  emptyMessage?: string
}

export function KnowledgeTable({
  rows,
  emptyMessage = 'No records match the current filters.',
}: KnowledgeTableProps) {
  if (rows.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <KnowledgeRow key={row.id} row={row} />
      ))}
    </div>
  )
}

function KnowledgeRow({ row }: { row: KnowledgeTableRow }) {
  const { canOpenAsset, openAsset } = useAssetWorkspace()
  const label = useEntityLabel(row.subject)
  const canOpen = canOpenAsset(row.subject)
  const entityName = label?.title ?? label?.symbol ?? null
  const metaLine = [row.meta, entityName].filter(Boolean).join(' · ')
  const tags = row.tags?.filter(Boolean) ?? []

  return (
    <article className="rounded-md bg-paper px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-ink">{row.title}</h3>
          {metaLine ? <p className="mt-1 text-xs leading-5 text-ink-muted">{metaLine}</p> : null}
          {tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </div>
          ) : null}
        </div>
        {canOpen && row.subject ? (
          <button
            aria-label={formatOpenWorkspaceLabel(entityName ?? row.subject)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm text-accent transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-accent-soft [@media(hover:hover)]:hover:text-accent-ink"
            onClick={() => openAsset(row.subject as string)}
            type="button"
          >
            <span aria-hidden>↗</span>
          </button>
        ) : null}
      </div>
      {row.body ? (
        <div className="mt-3 border-t border-border pt-3">
          <MarkdownBody body={row.body} />
        </div>
      ) : null}
    </article>
  )
}

export function joinKnowledgeMeta(...parts: Array<string | null | undefined>) {
  return parts.filter((part): part is string => Boolean(part?.trim())).join(' · ')
}
