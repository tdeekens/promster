---
"@promster/metrics": minor
"@promster/express": minor
"@promster/fastify": minor
"@promster/hapi": minor
"@promster/apollo": minor
"@promster/marblejs": minor
---

Add `createHistogram`, `createCounter`, `createGauge` and `createSummary` helpers for registering custom metrics idempotently.

All metrics share `prom-client`'s global registry, so registering a metric whose name already exists throws (`A metric with the name <name> has already been registered.`). This happens when a metric-defining module is evaluated more than once, for example when a bundler or package manager ships duplicate physical copies of a package. The new helpers return the already registered metric instead of re-creating it. promster's own built-in HTTP, GraphQL and GC metrics now use these helpers too, so they no longer crash under the same conditions.
