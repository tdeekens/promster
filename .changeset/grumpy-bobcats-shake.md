---
"@promster/express": patch
"@promster/fastify": patch
"@promster/hapi": patch
"@promster/marblejs": patch
"@promster/metrics": patch
"@promster/types": patch
---

Fixes that not always a `{ req, res }` object was passed to all normalizers in all plugins by making the typing more explicit.
