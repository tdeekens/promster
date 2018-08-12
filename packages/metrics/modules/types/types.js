const { Prometheus } = require('../client');

const defaultLabels = ['path', 'status_code', 'method'];

/**
 * NOTE:
 *    Prometheus has settled on second accuracy. Promster
 *    started out with milliseconds. To not create a breaking
 *    change now both types are recorded.
 */
const createMetricTypes = (options = { labels: [] }) => {
  const metrics = {
    up: new Prometheus.Gauge({
      name: 'up',
      help: '1 = up, 0 = not up',
    }),
    percentilesInMilliseconds: new Prometheus.Summary({
      name: 'http_request_duration_percentiles_milliseconds',
      help: 'The HTTP request latencies in milliseconds.',
      labelNames: defaultLabels.concat(options.labels).sort(),
      percentiles: options.percentiles || [0.5, 0.9, 0.95, 0.98, 0.99],
    }),
    percentilesInSeconds: new Prometheus.Summary({
      name: 'http_request_duration_percentiles_seconds',
      help: 'The HTTP request latencies in seconds.',
      labelNames: defaultLabels.concat(options.labels).sort(),
      percentiles: options.percentiles || [0.5, 0.9, 0.95, 0.98, 0.99],
    }),
    bucketsInMilliseconds: new Prometheus.Histogram({
      name: 'http_request_duration_buckets_milliseconds',
      help: 'The HTTP request latencies in milliseconds.',
      labelNames: defaultLabels.concat(options.labels).sort(),
      buckets: options.buckets || [
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
    bucketsInSeconds: new Prometheus.Histogram({
      name: 'http_request_duration_buckets_seconds',
      help: 'The HTTP request latencies in seconds.',
      labelNames: defaultLabels.concat(options.labels).sort(),
      buckets: options.buckets || [0.05, 0.1, 0.3, 0.5, 0.8, 1, 1.5, 2, 3, 10],
    }),
  };

  return metrics;
};

exports.default = createMetricTypes;
