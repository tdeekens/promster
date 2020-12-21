---
"@promster/metrics": patch
"@promster/server": patch
"@promster/types": patch
---

# Breaking Changes

This requires your to update your peer dependency of `prom-client` to v13. 

The new version of `prom-client` has additional small breaking changes `promster` has to incorporate which can leak into your application.

If you do not use our `@promster/server` package and have a `res.send(register.metrics())` you have to change it to `res.send(await register.metrics())`.

You can find more on the `prom-client` changes [here](https://github.com/siimon/prom-client/blob/master/CHANGELOG.md).
