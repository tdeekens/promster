const client = require('prom-client');

const defaultLabels = ['route'];

const createMetricTypes = options => {
  const metrics = {
    up: new promClient.Gauge({
      name: 'up',
      help: '1 = up, 0 = not up',
    }),
    duration: new client.Summary({
      name: 'http_request_duration_microseconds',
      help: 'The HTTP request latencies in microseconds.',
      labelNames: defaultLabels.concat(options.labels),
      percentiles: options.percentiles || [0.5, 0.9, 0.99],
    }),
    buckets: new client.Summary({
      name: 'http_request_buckets_microseconds',
      help: 'The HTTP request latencies in microseconds.',
      labelNames: defaultLabels.concat(options.labels),
      percentiles: options.buckets || [0.003, 0.03, 0.1, 0.3, 1.5, 10],
    }),
  };

  return metrics;
};

exports.default = createMetricTypes;
