import { GCProfiler } from 'node:v8';
import type { GCProfilerResult } from 'node:v8';

import { createCounter } from './create-metric';

// NOTE:
//   Vendored from `@chainsafe/prometheus-gc-stats@1.0.2`, MIT licensed,
//   Copyright (c) 2016 Simen Bekkhus. See the license notice in
//   `./gc-stats.LICENSE`.
//
//   The upstream package declares its own `prom-client` peer dependency,
//   which pinned promster's peer range to whatever it accepts, and it is a
//   68 line wrapper over `node:v8` that has seen two releases. Carrying it
//   here dropped a runtime dependency and handed promster back control over
//   its client peer, which is what later allowed the move to
//   `@prometheus-io/client`.
//
//   Two deliberate changes against the original:
//     - Counters are registered through `createCounter` rather than
//       `new Counter(...)`, so a duplicate physical copy of this package
//       reuses the already registered metric instead of throwing. This is the
//       same reasoning as the rest of `./create-metric`.
//     - The registry argument is gone. Every caller passed the default
//       register, which is what `createCounter` writes to anyway.
//
//   The metric names, help texts and `gctype` label are kept exactly as
//   upstream emitted them, so existing dashboards and alerts keep working.

type TGcStatsOptions = {
  collectionInterval: number;
  prefix?: string;
  signal?: AbortSignal;
};

type TStopGcStats = () => void;

const noop: TStopGcStats = () => {
  // NOTE:
  //   Nothing was ever started, so there is nothing to tear down.
};

const startGcStats = ({
  collectionInterval,
  prefix = '',
  signal,
}: TGcStatsOptions): TStopGcStats => {
  // NOTE:
  //   An already aborted signal means collection is over before it began.
  //   Returning early avoids registering metrics that would never be filled
  //   and avoids leaving a profiler running with nothing to stop it.
  if (signal?.aborted) {
    return noop;
  }

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

  // NOTE:
  //   Safe to call more than once, which matters because the caller may stop
  //   collection directly while an abort is also wired up. `clearInterval`
  //   and `GCProfiler#stop` both tolerate repeat calls, and dropping the
  //   listener keeps a long lived signal from retaining this closure.
  const stop: TStopGcStats = () => {
    signal?.removeEventListener('abort', stop);

    clearInterval(interval);
    profiler.stop();
  };

  signal?.addEventListener('abort', stop, { once: true });

  return stop;
};

export type { TGcStatsOptions, TStopGcStats };
export { startGcStats };
