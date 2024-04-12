---
"@promster/metrics": major
"@promster/types": patch
---

Replace `@sematext/gc-stats` with `prometheus-gc-stats`.

The latter is better supported and doesn't require any userland install. The module however does not allow to full configuration of metric names. Hence the metric names have changed:

We now expose:

1. nodejs_gc_runs_total: Counts the number of time GC is invoked
2. nodejs_gc_pause_seconds_total: Time spent in GC in seconds
3. nodejs_gc_reclaimed_bytes_total: The number of bytes GC has freed
