import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const publishedPackages = [
  '@navor/contract',
  '@navor/core',
  '@navor/adapters',
  '@navor/renderer',
  '@navor/reader-ui',
  '@navor/cli',
]

export function packageDirectory(packageName) {
  return packageName.slice('@navor/'.length)
}

export function validateReleasePlan(root = process.cwd()) {
  const changesetConfig = JSON.parse(readFileSync(resolve(root, '.changeset/config.json'), 'utf8'))
  const fixedGroups = changesetConfig.fixed

  if (
    !Array.isArray(fixedGroups) ||
    fixedGroups.length !== 1 ||
    !Array.isArray(fixedGroups[0]) ||
    fixedGroups.flat().toSorted().join('\0') !== publishedPackages.toSorted().join('\0')
  ) {
    throw new Error('Release plan must match the Changesets fixed package group.')
  }

  const positions = new Map(publishedPackages.map((packageName, index) => [packageName, index]))

  for (const [index, packageName] of publishedPackages.entries()) {
    const packageJson = JSON.parse(
      readFileSync(
        resolve(root, 'packages', packageDirectory(packageName), 'package.json'),
        'utf8',
      ),
    )

    if (packageJson.private) {
      throw new Error(`Release plan includes private package "${packageName}".`)
    }

    for (const dependency of Object.keys(packageJson.dependencies ?? {})) {
      const dependencyIndex = positions.get(dependency)

      if (dependencyIndex !== undefined && dependencyIndex >= index) {
        throw new Error(
          `Release plan publishes "${packageName}" before dependency "${dependency}".`,
        )
      }
    }
  }
}

export function publishReleasePlan() {
  for (const packageName of publishedPackages) {
    execFileSync(
      'pnpm',
      ['--filter', packageName, 'publish', '--access', 'public', '--no-git-checks'],
      { stdio: 'inherit' },
    )
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const command = process.argv[2] ?? '--check'

  if (command === '--check') {
    validateReleasePlan()
  } else if (command === 'publish') {
    validateReleasePlan()
    publishReleasePlan()
  } else if (command === '--json') {
    validateReleasePlan()
    process.stdout.write(`${JSON.stringify(publishedPackages)}\n`)
  } else {
    throw new Error(`Unknown release-plan command "${command}".`)
  }
}
