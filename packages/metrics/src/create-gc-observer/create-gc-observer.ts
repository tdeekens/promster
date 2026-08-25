import type { TDefaultedPromsterOptions, TGcMetrics } from '@promster/types';
import { once } from 'es-toolkit/function';

import { startGcStats } from './gc-stats';
import type { TStopGcStats } from './gc-stats';

const defaultOptions = {
  disableGcMetrics: false,
};

// NOTE:
//   The observer is started at most once. Collection is driven by a single
//   interval over a single `GCProfiler`, and starting a second one would
//   double count every garbage collection into the same counters. The inner
//   `once` returns the same teardown to every caller rather than starting
//   another profiler.
//
//   Both layers of `once` mean the options of the first call win, `signal`
//   included. Registering promster twice in a process with different signals
//   leaves the second one inert, the same way a second `metricPrefix` or
//   `gcCollectionInterval` is already ignored today.
const createGcObserver = once(
  (_metrics: TGcMetrics, options: TDefaultedPromsterOptions) =>
    once((): TStopGcStats =>
      startGcStats({
        collectionInterval: options.gcCollectionInterval,
        prefix: options.metricPrefix,
        signal: options.signal,
      }),
    ),
);

// @ts-expect-error
createGcObserver.defaultOptions = defaultOptions;

export { createGcObserver };
