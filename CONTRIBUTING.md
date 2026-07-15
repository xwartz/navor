# Contributing

Use Node.js 22.14+ and pnpm 11.7.0.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

Language changes must update both language references, add or update a parser or semantic fixture, and preserve the boundary between source facts and derived enrichment. Prefer metadata on an existing directive over a new directive when it expresses the same fact.
