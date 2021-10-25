---
"@promster/express": major
"@promster/fastify": major
"@promster/hapi": major
"@promster/marblejs": major
"@promster/metrics": major
"@promster/server": major
"@promster/types": patch
---

We droped support for Node.js `< 14` via the `engines` field of the respective `package.json` files.

We didn't make any changes to our code to prevent e.g. Node.js v9 to work but will not claim to officially support it any longer.
