const { Prometheus } = require('../client');

const defaultLabels = ['path', 'status_code', 'method'];

const createMetricTypes = (options = { labels: [] }) => {
  console.log(options);
  const metrics = {
    up: new Prometheus.Gauge({
      name: 'up',
      help: '1 = up, 0 = not up',
    }),
    percentiles: new Prometheus.Summary({
      name: 'http_request_duration_percentiles_milliseconds',
      help: 'The HTTP request latencies in milliseconds.',
      labelNames: defaultLabels.concat(options.labels).sort(),
      percentiles: options.percentiles || [0.5, 0.9, 0.99],
    }),
    buckets: new Prometheus.Histogram({
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
        3000,
        5000,
        10000,
      ],
    }),
  };

  return metrics;
};

exports.default = createMetricTypes;
