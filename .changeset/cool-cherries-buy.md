---
"@promster/metrics": major
---

Refactor to use fork of `gc-stats` due to `npm audit`.

The `gc-stats` project seems unmaintained and causes audit warnings as discussed [here](https://github.com/tdeekens/promster/issues/579). 

This is a breaking change is any project having `gc-stats` installed needs to move to `@sematext/gc-stats`. As such the please make the following change in your `package.json`:

```diff
-"gc-stats": "1.4.0"
+"@sematext/gc-stats": "1.5.3"
```

Any other change is encapsulated in `promster` itself.
