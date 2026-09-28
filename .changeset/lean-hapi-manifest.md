---
'@promster/hapi': patch
---

Only bundle `name` and `version` from the package manifest

The plugin read its name and version from `package.json`, but the whole
manifest was bundled into the published output. Named imports let the
bundler keep just those two fields.
