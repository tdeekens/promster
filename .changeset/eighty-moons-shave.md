---
"@promster/metrics": minor
---

Collect garbage collection metrics without `@chainsafe/prometheus-gc-stats`

The collector is now carried in the package itself, which removes a runtime
dependency and the `prom-client` peer range it imposed. Metric names, help
texts and the `gctype` label are unchanged, so dashboards and alerts keep
working.

Three fixes come with it:

- `observeGc()` returns a teardown that stops collection. The underlying
  teardown existed but was discarded, so collection could never be stopped.
  Existing call sites that ignore the return value are unaffected.
- Calling `observeGc()` twice no longer throws on duplicate metric
  registration, and no longer starts a second profiler.
- The collection interval no longer holds the event loop open, so it cannot
  keep an otherwise finished process alive.
