---
"@promster/express": major
"@promster/fastify": major
"@promster/hapi": major
"@promster/marblejs": major
"@promster/metrics": major
"@promster/server": major
"@promster/types": major
---

# Introduction

refactor: to use preconstruct for building

Prior TypeScript was used to build bundles. In all this should not affect consumers of this library. Under the hood preconstruct uses rollup and babel which is now instructed to build for Node.js v12 using the preset-env preset.

# Breaking Change

This release can _potentially_ be breaking for you. We want to respect semantic versioning and follow it strictly.

While migrating to preconstruct the `version` exports had to be removed as preconstruct's rollup will not resolve them. If you relied on this value you should either load the `package.json` of each module yourself or drop the usage.

```diff
- const { version } = require('@promster/server');
+ const { version } = require('@promster/server/package.json');
```
