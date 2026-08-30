---
"@promster/apollo": major
"@promster/express": major
"@promster/fastify": major
"@promster/hapi": major
"@promster/marblejs": major
"@promster/metrics": major
"@promster/server": major
"@promster/types": major
"@promster/undici": major
---

Replace the deprecated `prom-client` peer dependency with `@prometheus-io/client`

**Requires Node.js 22 or newer, and replacing `prom-client` with
`@prometheus-io/client` in your own dependencies.** Both are breaking, and both
are unavoidable on this release. Details below.

`prom-client` is deprecated in favour of `@prometheus-io/client`. They are the
same project: `siimon/prom-client` moved to the Prometheus organization and
continues there as `prometheus/client_js`.

## ⚠️ Remove `prom-client` when you upgrade

**Do not leave both packages installed.** Nothing errors if you do, which is
what makes it dangerous: the two have **separate global registries**, so any
metric you register against `prom-client` silently disappears from what
`@promster` exposes.

```js
// with both installed
const counter = new promClient.Counter({ name: 'my_app_total', help: '...' });
counter.inc();

await promClient.register.metrics(); // contains my_app_total
await promsterRegister.metrics(); // does NOT contain my_app_total
```

There is no warning and no error. Your custom metrics just stop being scraped.

## Upgrading

```sh
npm rm prom-client && npm i @prometheus-io/client
```

Then point your own imports at the new package:

```diff
-import { Counter } from 'prom-client';
+import { Counter } from '@prometheus-io/client';
```

If you reach the client through promster instead of importing it directly, for
example via `app.locals.Prometheus` on Express or the Hapi and Fastify
equivalents, nothing changes.

## Node.js 22 is now the minimum

`@prometheus-io/client` supports `^22 || ^24 || >=26`, so the `engines` field
of every package moves from `>=20` to `>=22` rather than promising a runtime
its own peer refuses. Node 20 reached end of life in April 2026.

The peer range for the client itself is `^0.16.1`, which resolves to
`>=0.16.1 <0.17.0`. The client is still pre-1.0, where minor releases are
allowed to break, so the range is deliberately narrow. Expect it to be widened
by a promster release each time a new minor lands rather than in advance.

## What does not change

Metric names are unaffected, so dashboards and alerts keep working. The
default metric set gains `nodejs_eventloop_utilization_histogram` and
`nodejs_eventloop_utilization_summary` and loses nothing. A new test pins the
expected set so a future client upgrade cannot drop one unnoticed.
