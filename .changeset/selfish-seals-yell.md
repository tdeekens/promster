---
"@promster/metrics": patch
---

Replace the previous GC metrics library with chainsafe/prometheus-gc-stats to address security vulnerability CVE-XXXX-YYYY, while preserving the same GC metrics (nodejs_gc_runs_total, nodejs_gc_pause_seconds_total, nodejs_gc_reclaimed_bytes_total) and removing 70 transitive dependencies from the dependency tree.
