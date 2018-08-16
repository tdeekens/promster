const requireOptional = require('optional');
const gc = requireOptional('gc-stats');
const once = require('lodash.once');

const gcTypes = {
  0: 'unknown',
  1: 'scavenge',
  2: 'mark_sweep_compact',
  3: 'scavenge_and_mark_sweep_compact',
  4: 'incremental_marking',
  8: 'weak_phantom',
  15: 'all',
};

const createGcObserver = once(metricTypes => () => {
  if (typeof gc !== 'function') {
    return;
  }

  gc().on('stats', stats => {
    const gcType = gcTypes[stats.gctype];

    metricTypes.countOfGcs.labels(gcType).inc();
    metricTypes.durationOfGc.labels(gcType).inc(stats.pause / 1e9);

    if (stats.diff.usedHeapSize < 0) {
      metricTypes.reclaimedInGc
        .labels(gcType)
        .inc(stats.diff.usedHeapSize * -1);
    }
  });
});

exports.default = createGcObserver;
