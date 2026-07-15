export function MarkdownBody({ body }: { body: string | null }) {
  if (!body) {
    return null
  }

  return (
    <div className="space-y-4 text-sm leading-7 text-ink-muted">
      {body
        .trim()
        .split(/\n{2,}/)
        .map((block) => {
          const trimmed = block.trim()

          if (!trimmed) {
            return null
          }

          if (trimmed.startsWith('# ')) {
            return (
              <h4 className="font-display text-base font-bold text-ink" key={trimmed}>
                {trimmed.slice(2)}
              </h4>
            )
          }

          if (trimmed.startsWith('## ')) {
            return (
              <h5 className="text-sm font-semibold text-ink" key={trimmed}>
                {trimmed.slice(3)}
              </h5>
            )
          }

          if (trimmed.split('\n').every((line) => line.startsWith('- '))) {
            return (
              <ul className="list-disc space-y-1 pl-5" key={trimmed}>
                {trimmed.split('\n').map((line) => (
                  <li key={line}>{line.slice(2)}</li>
                ))}
              </ul>
            )
          }

          return (
            <p className="whitespace-pre-wrap" key={trimmed}>
              {renderInlineMarkdown(trimmed)}
            </p>
          )
        })}
    </div>
  )
}

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong className="font-semibold text-ink" key={part}>
          {part.slice(2, -2)}
        </strong>
      )
    }

    return <span key={part}>{part}</span>
  })
}
