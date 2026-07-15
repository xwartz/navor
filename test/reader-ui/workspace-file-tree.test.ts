import { describe, expect, it } from 'vitest'

import {
  buildWorkspaceFileTree,
  formatWorkspaceFileTree,
} from '../../packages/reader-ui/src/workspace-file-tree'

describe('buildWorkspaceFileTree', () => {
  it('groups relative paths into nested directories with files sorted under each folder', () => {
    expect(
      buildWorkspaceFileTree([
        'plan.nav',
        'activity/transactions.nav',
        'accounts/accounts.nav',
        'activity/knowledge.nav',
        'assets/assets.nav',
        'portfolio.nav',
      ]),
    ).toEqual([
      {
        type: 'directory',
        name: 'accounts',
        children: [{ type: 'file', name: 'accounts.nav', path: 'accounts/accounts.nav' }],
      },
      {
        type: 'directory',
        name: 'activity',
        children: [
          { type: 'file', name: 'knowledge.nav', path: 'activity/knowledge.nav' },
          { type: 'file', name: 'transactions.nav', path: 'activity/transactions.nav' },
        ],
      },
      {
        type: 'directory',
        name: 'assets',
        children: [{ type: 'file', name: 'assets.nav', path: 'assets/assets.nav' }],
      },
      { type: 'file', name: 'plan.nav', path: 'plan.nav' },
      { type: 'file', name: 'portfolio.nav', path: 'portfolio.nav' },
    ])
  })
})

describe('formatWorkspaceFileTree', () => {
  it('renders classic tree connectors and keeps original casing', () => {
    const tree = buildWorkspaceFileTree([
      'activity/knowledge.nav',
      'activity/transactions.nav',
      'plan.nav',
    ])

    expect(formatWorkspaceFileTree(tree)).toEqual([
      '├── activity/',
      '│   ├── knowledge.nav',
      '│   └── transactions.nav',
      '└── plan.nav',
    ])
  })
})
