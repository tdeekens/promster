const { Prometheus } = require('../client');

const defaultRequestLabels = ['path', 'status_code', 'method'];
const defaultGcLabels = ['gc_type'];

/**
 * NOTE:
 *    Prometheus has settled on second accuracy. Promster
 *    started out with milliseconds. To not create a breaking
 *    change now both types are configurable.
 */
const createMetricTypes = options => {
  let defaultedOptions = {
    labels: [],
    accuracies: ['s'],
    metricTypes: ['summary', 'histogram'],
    ...options,
  };
  let metrics = {
    up: new Prometheus.Gauge({
      name: 'up',
      help: '1 = up, 0 = not up',
    }),
    countOfGcs: new Prometheus.Counter({
      name: 'nodejs_gc_runs_total',
      help: 'Count of total garbage collections.',
      labelNames: defaultGcLabels,
    }),
    durationOfGc: new Prometheus.Counter({
      name: 'nodejs_gc_pause_seconds_total',
      help: 'Time spent in GC Pause in seconds.',
      labelNames: defaultGcLabels,
    }),
    reclaimedInGc: new Prometheus.Counter({
      name: 'nodejs_gc_reclaimed_bytes_total',
      help: 'Total number of bytes reclaimed by GC.',
      labelNames: defaultGcLabels,
    }),
  };

  /**
   * NOTE:
   *    Both metric types should be possible to allow consumers
   *    to migrate to either or without a metric gap.
   */
  if (defaultedOptions.accuracies.includes('ms')) {
    metrics = {
      ...metrics,
      percentilesInMilliseconds:
        defaultedOptions.metricTypes.includes('summary') &&
        new Prometheus.Summary({
          name: 'http_request_duration_percentiles_milliseconds',
          help: 'The HTTP request latencies in milliseconds.',
          labelNames: defaultRequestLabels
            .concat(defaultedOptions.labels)
            .sort(),
          percentiles: defaultedOptions.percentiles || [
            0.5,
            0.9,
            0.95,
            0.98,
            0.99,
          ],
        }),
      bucketsInMilliseconds:
        defaultedOptions.metricTypes.includes('histogram') &&
        new Prometheus.Histogram({
          name: 'http_request_duration_buckets_milliseconds',
          help: 'The HTTP request latencies in milliseconds.',
          labelNames: defaultRequestLabels
            .concat(defaultedOptions.labels)
            .sort(),
          buckets: defaultedOptions.buckets || [
            50,
            100,
            300,
            500,
            800,
            1000,
            1500,
            2000,
            3000,
            5000,
            10000,
          ],
        }),
    };
  }
  if (defaultedOptions.accuracies.includes('s')) {
    metrics = {
      ...metrics,
      percentilesInSeconds:
        defaultedOptions.metricTypes.includes('summary') &&
        new Prometheus.Summary({
          name: 'http_request_duration_percentiles_seconds',
          help: 'The HTTP request latencies in seconds.',
          labelNames: defaultRequestLabels
            .concat(defaultedOptions.labels)
            .sort(),
          percentiles: defaultedOptions.percentiles || [
            0.5,
            0.9,
            0.95,
            0.98,
            0.99,
          ],
        }),
      bucketsInSeconds:
        defaultedOptions.metricTypes.includes('histogram') &&
        new Prometheus.Histogram({
          name: 'http_request_duration_buckets_seconds',
          help: 'The HTTP request latencies in seconds.',
          labelNames: defaultRequestLabels
            .concat(defaultedOptions.labels)
            .sort(),
          buckets: defaultedOptions.buckets || [
            0.05,
            0.1,
            0.3,
            0.5,
            0.8,
            1,
            1.5,
            2,
            3,
            10,
          ],
        }),
    };
  }

  return metrics;
};

exports.default = createMetricTypes;
