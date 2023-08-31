---
"@promster/apollo": minor
"@promster/express": minor
"@promster/fastify": minor
"@promster/hapi": minor
"@promster/marblejs": minor
"@promster/metrics": minor
---

Restructure TypeScript and improve types of `skip`-fn

Previously the `skip` function received generics to pass the `request` and `response` type. These are not needed any more. The function exported from the respective package is now typed to it.
