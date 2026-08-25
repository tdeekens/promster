---
'@promster/metrics': patch
'@promster/apollo': patch
'@promster/express': patch
'@promster/fastify': patch
'@promster/hapi': patch
'@promster/marblejs': patch
'@promster/server': patch
---

refactor: remove barrel files that only re-exported a single module

Internal restructuring only. The bundled output of every package is
unchanged, so there is nothing to adopt for consumers.
