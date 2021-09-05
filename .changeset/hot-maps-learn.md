---
"@promster/fastify": patch
"@promster/marblejs": patch
"@promster/metrics": patch
"@promster/server": patch
"@promster/types": patch
---

Refactor to require Node.js v14 and drop official support for anything below

The `engines` field of the `package.json` now requires Node.js v14 and not v9 as prior. There are no actual changes in the library however anything smaler v14 will not be officially supported.
