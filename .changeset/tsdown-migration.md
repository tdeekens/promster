---
"@promster/apollo": patch
"@promster/express": patch
"@promster/fastify": patch
"@promster/hapi": patch
"@promster/marblejs": patch
"@promster/metrics": patch
"@promster/server": patch
"@promster/types": patch
"@promster/undici": patch
---

Migrate the bundler from tsup to tsdown

Each package now builds with tsdown via a shared `@promster/tsdown-config`
preset. Output is unchanged: dual ESM (`dist/index.js`) and CJS
(`dist/index.cjs`) with matching declaration files, so consumers are
unaffected.
