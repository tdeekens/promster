import {
  type TOptionalPromsterOptions,
  type TGcMetrics,
  type TValueOf,
} from '@promster/types';

import once from 'lodash.once';
//@ts-ignore not typed
import requireOptional from 'optional';

const gc = requireOptional('@sematext/gc-stats');

const gcTypes = {
  0: 'unknown',
  1: 'scavenge',
  2: 'mark_sweep_compact',
  3: 'scavenge_and_mark_sweep_compact',
  4: 'incremental_marking',
  8: 'weak_phantom',
  15: 'all',
} as const;

type TGcTypes = TValueOf<typeof gcTypes>;
type TStats = {
  gctype: TGcTypes;
  pause: number;
  diff: {
    usedHeapSize: number;
  };
};

const defaultOptions = {
  disableGcMetrics: false,
};

const createGcObserver = once(
  (metrics: TGcMetrics, options: TOptionalPromsterOptions) => () => {
    if (typeof gc !== 'function') {
      return;
    }

    if (options.disableGcMetrics) return;

    gc().on('stats', (stats: TStats) => {
      // @ts-expect-error
      const gcType: TGcTypes = gcTypes[stats.gctype];

      metrics.countOfGcs.forEach((countOfGcMetricType) => {
        countOfGcMetricType.labels(gcType).inc();
      });
      metrics.durationOfGc.forEach((durationOfGcMetricType) => {
        durationOfGcMetricType.labels(gcType).inc(stats.pause / 1e9);
      });

      if (stats.diff.usedHeapSize < 0) {
        metrics.reclaimedInGc.forEach((reclaimedInGcMetricType) => {
          reclaimedInGcMetricType
            .labels(gcType)
            .inc(stats.diff.usedHeapSize * -1);
        });
      }
    });
  }
);

// @ts-ignore
createGcObserver.defaultOptions = defaultOptions;

export { createGcObserver };
