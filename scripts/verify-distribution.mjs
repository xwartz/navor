import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { packageDirectory, publishedPackages } from './release-plan.mjs'

const requiredPackageFiles = [
  'package/LICENSE',
  'package/README.md',
  'package/dist/index.mjs',
  'package/package.json',
]

function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: 'utf8', ...options })
}

function assertFile(path) {
  if (!existsSync(path)) throw new Error(`Expected distribution artifact "${path}".`)
}

function assertMissingFile(path) {
  if (existsSync(path)) throw new Error(`Unexpected distribution artifact "${path}".`)
}

function verifyWorkspaceDistribution() {
  const root = mkdtempSync(join(tmpdir(), 'navor-distribution-'))

  try {
    const packDirectory = join(root, 'pack')
    const installDirectory = join(root, 'install')
    const siteDirectory = join(root, 'site')
    mkdirSync(packDirectory)

    for (const packageName of publishedPackages) {
      run(
        'pnpm',
        [
          '--dir',
          resolve('packages', packageDirectory(packageName)),
          'pack',
          '--pack-destination',
          packDirectory,
        ],
        { stdio: 'inherit' },
      )
    }

    const packageFile = readdirSync(packDirectory).find((file) => /^navor-cli-\d/.test(file))

    if (!packageFile) throw new Error('Expected @navor/cli package artifact.')

    const contents = run('tar', ['-tf', join(packDirectory, packageFile)])
      .trim()
      .split('\n')
      .sort()

    for (const file of requiredPackageFiles) {
      if (!contents.includes(file)) {
        throw new Error(`Expected @navor/cli package file "${file}".`)
      }
    }

    if (contents.some((file) => file.startsWith('package/src/'))) {
      throw new Error(`Unexpected @navor/cli source files:\n${contents.join('\n')}`)
    }

    mkdirSync(installDirectory)
    run('npm', ['init', '--yes'], { cwd: installDirectory })
    run(
      'npm',
      [
        'install',
        '--ignore-scripts',
        ...readdirSync(packDirectory).map((file) => join(packDirectory, file)),
      ],
      { cwd: installDirectory, stdio: 'inherit' },
    )
    assertMissingFile(join(installDirectory, 'node_modules/.bin/navor'))
    run(join(installDirectory, 'node_modules/.bin/nav'), [
      'build',
      'fixtures/core',
      '--out',
      siteDirectory,
    ])
    assertFile(join(siteDirectory, 'index.html'))
    assertFile(join(siteDirectory, 'navor-data.json'))
  } finally {
    rmSync(root, { force: true, recursive: true })
  }
}

function verifyRegistryDistribution(version) {
  const root = mkdtempSync(join(tmpdir(), 'navor-registry-'))

  try {
    const siteDirectory = join(root, 'site')
    run(
      'npm',
      [
        'exec',
        '--yes',
        `@navor/cli@${version}`,
        '--',
        'build',
        'fixtures/core',
        '--out',
        siteDirectory,
      ],
      {
        stdio: 'inherit',
      },
    )
    assertFile(join(siteDirectory, 'index.html'))
    assertFile(join(siteDirectory, 'navor-data.json'))
  } finally {
    rmSync(root, { force: true, recursive: true })
  }
}

const source = process.argv[2]

if (source === '--source=workspace') {
  verifyWorkspaceDistribution()
} else if (source === '--source=registry') {
  const version = process.argv[3]?.replace('--version=', '')
  if (!version) throw new Error('Registry distribution verification requires --version=<version>.')
  verifyRegistryDistribution(version)
} else {
  throw new Error('Use --source=workspace or --source=registry --version=<version>.')
}
