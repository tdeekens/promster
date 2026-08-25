---
"@promster/metrics": minor
"@promster/types": minor
---

Accept an `AbortSignal` to stop garbage collection metrics

Every package that takes promster options now accepts a `signal`, so collection
can be tied to a server's shutdown rather than running for the lifetime of the
process:

```js
const controller = new AbortController();

promsterMiddleware({ options: { signal: controller.signal } });

process.once('SIGTERM', () => controller.abort());
```

The option is unset by default and the behavior without it is unchanged. A
signal that is already aborted keeps collection from starting at all. Metrics
already collected stay in the registry; only further collection stops.
