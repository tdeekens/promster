---
'@promster/apollo': patch
---

Fix a bug where some GraphQL errors thrown were not counted when
encountered in GraphQL execution phase.

GraphQL execution phase is where a GraphQL request is fulfilled, and
can result in data or an error.

Error state could not be handled, and threw a plugin error, due to a
missing label `field_name` in the intial labelset.
