---
"@promster/hapi": patch
---

@promster/hapi decorator fix

We had a breaking change sneak in. The decorator of promster of exposing the Prometheus instance was changed from a property to a function returning the property. This reverts that change.
