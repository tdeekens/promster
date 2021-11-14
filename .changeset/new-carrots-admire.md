---
'@promster/apollo': patch
'@promster/express': patch
'@promster/fastify': patch
'@promster/hapi': patch
'@promster/marblejs': patch
'@promster/metrics': minor
'@promster/types': patch
---

Refactor to use `process.hrtime.bigint()` over `process.hrtime()`.

The [Node.js documentation](https://nodejs.org/api/process.html#processhrtimetime) lists `process.hrtime([time])` as a [legacy feature](https://nodejs.org/api/documentation.html#stability-index). It is no longer recommended for use, and should be avoided. As such it is recommended to use `process.hrtime.bigint()` which works slightly different.

This change is backwards compatible. A new `timing` module was added to `@promster/metrics` which encapsulates timings so you never have to worry about the details.

```diff
import { getRequestRecorder } = require('@promster/express');
+import { timing } = require('@promster/express');

+const requestTiming = timing.start();
-const requestTiming = process.hrtime();

recordRequest(requestTiming);
```

We recommend to change all explicit calls to `process.hrtime()` with calls to `timing.start()` over time. The `recordRequest` function will continue to accept a `[number, number]` as the return of `process.hrtime()` so you can change code as you work with it.
