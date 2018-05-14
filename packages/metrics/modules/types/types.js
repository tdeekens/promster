const { Prometheus } = require('../client');

const defaultLabels = ['path', 'status_code', 'method'];

const createMetricTypes = (options = { labels: [] }) => {
  const metrics = {
    up: new Prometheus.Gauge({
      name: 'up',
      help: '1 = up, 0 = not up',
    }),
    percentiles: new Prometheus.Summary({
      name: 'http_request_duration_percentiles_microseconds',
      help: 'The HTTP request latencies in microseconds.',
      labelNames: defaultLabels.concat(options.labels).sort(),
      percentiles: options.percentiles || [0.5, 0.9, 0.99],
    }),
    buckets: new Prometheus.Histogram({
      name: 'http_request_duration_buckets_microseconds',
      help: 'The HTTP request latencies in microseconds.',
      labelNames: defaultLabels.concat(options.labels).sort(),
      percentiles: options.buckets || [0.003, 0.03, 0.1, 0.3, 1.5, 10],
    }),
  };

  return metrics;
};

exports.default = createMetricTypes;
