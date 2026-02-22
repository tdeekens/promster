---
"@promster/express": patch
"@promster/fastify": patch
"@promster/hapi": patch
"@promster/marblejs": patch
---

Automatically call `signalIsUp()` on middleware/plugin creation so that the `nodejs_up` gauge is set to `1` without requiring manual invocation.
