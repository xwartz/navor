# Market data and privacy

Navor does not upload a workspace, collect telemetry, or require an account. `nav serve` reads the workspace on your machine.

Prices and FX rates are optional enrichment, not source facts. Reader marks missing, stale, and failed enrichment instead of treating it as authoritative.

On a hosted site, the browser requests prices from `POST /api/prices` on the same origin. That proxy forwards requested symbols to its configured provider. Symbols can reveal holdings or interests. Deploy a proxy only when the provider terms, cache policy, and your privacy notice fit the audience.

Navor organizes investment information. It does not provide financial, legal, tax, or investment advice.
