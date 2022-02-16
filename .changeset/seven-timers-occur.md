---
'@promster/apollo': patch
---

## Fix GraphQL execution error counting

This fixes a bug which caused GraphQL errors thrown were not counted when
encountered in GraphQL execution phase.

During the execution phase GraphQL request are fulfilled and can result in data or an error.

Additionally, the any error not handled would threw a plugin error due to a missing label `field_name` in the intial label set.
