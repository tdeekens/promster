import { GCProfiler } from 'node:v8';
import type { GCProfilerResult } from 'node:v8';

import { createCounter } from '../create-metric';

// NOTE:
//   Vendored from `@chainsafe/prometheus-gc-stats@1.0.2`, MIT licensed,
//   Copyright (c) 2016 Simen Bekkhus. See the license notice in
//   `./gc-stats.LICENSE`.
//
//   The upstream package declares its own `prom-client` peer dependency,
//   which pins promster's peer range to whatever it accepts, and it is a
//   68 line wrapper over `node:v8` that has seen two releases. Carrying it
//   here drops a runtime dependency and hands promster back control over the
//   `prom-client` peer.
//
//   Two deliberate changes against the original:
//     - Counters are registered through `createCounter` rather than
//       `new Counter(...)`, so a duplicate physical copy of this package
//       reuses the already registered metric instead of throwing. This is the
//       same reasoning as the rest of `../create-metric`.
//     - The registry argument is gone. Every caller passed the default
//       register, which is what `createCounter` writes to anyway.
//
//   The metric names, help texts and `gctype` label are kept exactly as
//   upstream emitted them, so existing dashboards and alerts keep working.

type TGcStatsOptions = {
  collectionInterval: number;
  prefix?: string;
};

type TStopGcStats = () => void;

const startGcStats = ({
  collectionInterval,
  prefix = '',
}: TGcStatsOptions): TStopGcStats => {
  const labelNames = ['gctype'];

  const gcCount = createCounter({
    name: `${prefix}nodejs_gc_runs_total`,
    help: 'Count of total garbage collections.',
    labelNames,
  });
  const gcTimeCount = createCounter({
    name: `${prefix}nodejs_gc_pause_seconds_total`,
    help: 'Time spent in GC Pause in seconds.',
    labelNames,
  });
  const gcReclaimedCount = createCounter({
    name: `${prefix}nodejs_gc_reclaimed_bytes_total`,
    help: 'Total number of bytes reclaimed by GC.',
    labelNames,
  });

  const profiler = new GCProfiler();

  const processGcStats = (
    statistics: GCProfilerResult['statistics'][0],
  ): void => {
    const { gcType, cost, beforeGC, afterGC } = statistics;

    gcCount.labels(gcType).inc();
    // NOTE:
    //   `cost` is reported in microseconds, the metric is in seconds.
    gcTimeCount.labels(gcType).inc(cost / 1e6);

    const diffUsedHeapSize =
      afterGC.heapStatistics.usedHeapSize -
      beforeGC.heapStatistics.usedHeapSize;

    // NOTE:
    //   A garbage collection can leave the heap larger than it found it, in
    //   which case nothing was reclaimed and the counter must not move.
    if (diffUsedHeapSize < 0) {
      gcReclaimedCount.labels(gcType).inc(diffUsedHeapSize * -1);
    }
  };

  profiler.start();

  const interval = setInterval(() => {
    // NOTE:
    //   The profiler only reports statistics when stopped, so it is restarted
    //   immediately to keep collecting across the next interval.
    const result = profiler.stop();
    profiler.start();

    for (const statistics of result.statistics) {
      processGcStats(statistics);
    }
  }, collectionInterval);

  // NOTE:
  //   Without this the interval keeps the event loop alive, which stops a
  //   process that is otherwise done from exiting.
  interval.unref();

  return () => {
    clearInterval(interval);
    profiler.stop();
  };
};

export type { TGcStatsOptions, TStopGcStats };
export { startGcStats };
