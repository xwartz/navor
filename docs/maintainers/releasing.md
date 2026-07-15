# Releasing Navor

`@navor/cli` is the user-facing npm package and provides the `nav` command. The other five `@navor/*` packages are published in dependency order to support it; their import APIs are not public contracts.

## One-time setup

1. Create `xwartz/navor` and enable private vulnerability reporting.
2. Reserve the `@navor` npm scope.
3. Configure GitHub Actions trusted publishing for each published package, repository `xwartz/navor`, workflow `.github/workflows/release.yml`, and environment `release`.
4. Require maintainer approval for the `release` environment.
5. The release plan (`scripts/release-plan.mjs`) is the source of truth for the published package set and dependency order.

## Release flow

1. Add a Changeset for every user-facing package change.
2. The `Version packages` workflow opens a version PR on `main`.
3. Merge the version PR, then create and push a signed tag matching `packages/cli/package.json`, for example `v0.1.1`.
4. The Release workflow verifies the tagged commit is on `main`, checks the release plan, runs shared release verification, then publishes through the release plan.
5. The workflow runs distribution acceptance against the published `@navor/cli` package, then creates the GitHub Release.

The workflow requires Node.js 22.14+ and npm 11.5.1+. Before the first stable release, run `nav build` against a real, non-sensitive workspace from a clean installation.
