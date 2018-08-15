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

const createGcObserver = once(() => {
  const metrics = createMetricTypes(options);

  gc().on('stats', stats => {
    const gcType = gcTypes[stats.gctype];

    countOfGcs.labels(gcType).inc();
    durationOfGcs.labels(gcType).inc(stats.pause / 1e9);

    if (stats.diff.usedHeapSize < 0) {
      reclaimedInGc.labels(gcType).inc(stats.diff.usedHeapSize * -1);
    }
  });
});

exports.default = createObserver;
