---
"@promster/metrics": major
---

Fixes CVE caused by tar library. Pulled in via prometheus-gc-stats -> @sematext/gc-stats -> @mapbox/node-pre-gyp@<^2.0.0. 

Removed reclaimef bytes metric from GC runs as it's not exposed by gc-stats library. 

