export type WorkspaceFileTreeNode =
  | { type: 'directory'; name: string; children: WorkspaceFileTreeNode[] }
  | { type: 'file'; name: string; path: string }

export function buildWorkspaceFileTree(relativePaths: string[]): WorkspaceFileTreeNode[] {
  const root: Extract<WorkspaceFileTreeNode, { type: 'directory' }> = {
    type: 'directory',
    name: '',
    children: [],
  }

  for (const relativePath of [...relativePaths].sort((left, right) => left.localeCompare(right))) {
    const parts = relativePath.split('/').filter(Boolean)
    if (parts.length === 0) {
      continue
    }

    let current = root

    for (const [index, part] of parts.entries()) {
      const isFile = index === parts.length - 1

      if (isFile) {
        if (
          !current.children.some((child) => child.type === 'file' && child.path === relativePath)
        ) {
          current.children.push({ type: 'file', name: part, path: relativePath })
        }
        continue
      }

      let directory = current.children.find(
        (child): child is Extract<WorkspaceFileTreeNode, { type: 'directory' }> =>
          child.type === 'directory' && child.name === part,
      )

      if (!directory) {
        directory = { type: 'directory', name: part, children: [] }
        current.children.push(directory)
      }

      current = directory
    }
  }

  sortTree(root.children)
  return root.children
}

function sortTree(nodes: WorkspaceFileTreeNode[]) {
  nodes.sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === 'directory' ? -1 : 1
    }

    return left.name.localeCompare(right.name)
  })

  for (const node of nodes) {
    if (node.type === 'directory') {
      sortTree(node.children)
    }
  }
}

/** Classic `tree` output lines with ├── / └── connectors. Names keep original casing. */
export function formatWorkspaceFileTree(nodes: WorkspaceFileTreeNode[], prefix = ''): string[] {
  const lines: string[] = []

  for (const [index, node] of nodes.entries()) {
    const isLast = index === nodes.length - 1
    const branch = isLast ? '└── ' : '├── '
    const childPrefix = `${prefix}${isLast ? '    ' : '│   '}`

    if (node.type === 'directory') {
      lines.push(`${prefix}${branch}${node.name}/`)
      lines.push(...formatWorkspaceFileTree(node.children, childPrefix))
      continue
    }

    lines.push(`${prefix}${branch}${node.name}`)
  }

  return lines
}
