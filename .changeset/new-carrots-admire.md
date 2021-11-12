---
"@promster/apollo": patch
"@promster/express": patch
"@promster/fastify": patch
"@promster/hapi": patch
"@promster/marblejs": patch
"@promster/metrics": major
"@promster/types": patch
---

Refactor to use `process.hrtime.bigint()` over `process.hrtime()`.

The [Node.js documentation](https://nodejs.org/api/process.html#processhrtimetime) lists `process.hrtime([time])` as a [legacy feature](https://nodejs.org/api/documentation.html#stability-index). It is no longer recommended for use, and should be avoided. As such it is recommended to use  `process.hrtime.bigint()` which works slightly different. 

The breaking change in API is towards `recordRequest` which as a `start` paramater does not accept a `[number, number]` anymore but a `bigint`. Essentially the return of calling `process.hrtime.bigint()` over `process.hrtime()`.
