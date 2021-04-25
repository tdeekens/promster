import type { TMetricTypes, TValueOf } from '@promster/types';

import once from 'lodash.once';
import requireOptional from 'optional';

const gc = requireOptional('gc-stats');

const gcTypes = {
  0: 'unknown',
  1: 'scavenge',
  2: 'mark_sweep_compact',
  3: 'scavenge_and_mark_sweep_compact',
  4: 'incremental_marking',
  8: 'weak_phantom',
  15: 'all',
};

type TGcTypes = TValueOf<typeof gcTypes>;
type TStats = {
  gctype: TGcTypes;
  pause: number;
  diff: {
    usedHeapSize: number;
  };
};

const createGcObserver = once((metricTypes: TMetricTypes) => () => {
  if (typeof gc !== 'function') {
    return;
  }

  gc().on('stats', (stats: TStats) => {
    const gcType: TGcTypes = gcTypes[stats.gctype];

    metricTypes.countOfGcs.forEach(countOfGcMetricType => {
      countOfGcMetricType.labels(gcType).inc();
    });
    metricTypes.durationOfGc.forEach(durationOfGcMetricType => {
      durationOfGcMetricType.labels(gcType).inc(stats.pause / 1e9);
    });

    if (stats.diff.usedHeapSize < 0) {
      metricTypes.reclaimedInGc.forEach(reclaimedInGcMetricType => {
        reclaimedInGcMetricType
          .labels(gcType)
          .inc(stats.diff.usedHeapSize * -1);
      });
    }
  });
});

export { createGcObserver };
