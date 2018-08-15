const gc = require('gc-stats');
const once = require('lodash.once');

const gcTypes = {
  0: 'Unknown',
  1: 'Scavenge',
  2: 'MarkSweepCompact',
  3: 'ScavengeAndMarkSweepCompact',
  4: 'IncrementalMarking',
  8: 'WeakPhantom',
  15: 'All',
};

const createGcObserver = once(metricTypes => () => {
  gc().on('stats', stats => {
    const gcType = gcTypes[stats.gctype];

    metricTypes.countOfGcs.labels(gcType).inc();
    metricTypes.durationOfGcs.labels(gcType).inc(stats.pause / 1e9);

    if (stats.diff.usedHeapSize < 0) {
      metricTypes.reclaimedInGc
        .labels(gcType)
        .inc(stats.diff.usedHeapSize * -1);
    }
  });
});

exports.default = createGcObserver;
