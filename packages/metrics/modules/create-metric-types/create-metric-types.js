const { Prometheus } = require('../client');

const defaultHttpRequestDurationPercentilesInMillieconds = [
  0.5,
  0.9,
  0.95,
  0.98,
  0.99,
];
const defaultHttpRequestDurationInMilliseconds = [
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
];

const defaultHttpRequestDurationPercentileInSeconds = [
  0.5,
  0.9,
  0.95,
  0.98,
  0.99,
];
const defaultHttpRequestDurationInSeconds = [
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
];

const defaultRequestLabels = ['path', 'status_code', 'method'];
const defaultGcLabels = ['gc_type'];

const shouldObserveMetricsInSeconds = options =>
  options.accuracies.includes('s');
const shouldObserveMetricsInMilliseconds = options =>
  options.accuracies.includes('ms');
const shouldObserveHttpRequestsAsSummary = options =>
  options.metricTypes.includes('httpRequestsSummary');
const shouldObserveHttpRequestsAsHistogram = options =>
  options.metricTypes.includes('httpRequestsHistogram');
const shouldObserveHttpRequestsAsCounter = options =>
  options.metricTypes.includes('httpRequestsTotal');

const defaultOptions = {
  getLabelValues: () => ({}),
  labels: [],
  accuracies: ['s'],
  metricTypes: ['httpRequestsHistogram', 'httpRequestsTotal'],
  metricNames: {
    up: 'up',
    countOfGcs: 'nodejs_gc_runs_total',
    durationOfGc: 'nodejs_gc_pause_seconds_total',
    reclaimedInGc: 'nodejs_gc_reclaimed_bytes_total',
    httpRequestsTotal: 'http_requests_total',
    httpRequestDurationPerPercentileInMilliseconds:
      'http_request_duration_per_percentile_milliseconds',
    httpRequestDurationPerPercentileInSeconds:
      'http_request_duration_per_percentile_seconds',
    httpRequestDurationInSeconds: 'http_request_duration_seconds',
    httpRequestDurationInMilliseconds: 'http_request_duration_milliseconds',
  },
};

const getDefaultMetrics = options => ({
  up: new Prometheus.Gauge({
    name: options.metricNames.up,
    help: '1 = up, 0 = not up',
  }),
  countOfGcs: new Prometheus.Counter({
    name: options.metricNames.countOfGcs,
    help: 'Count of total garbage collections.',
    labelNames: defaultGcLabels,
  }),
  durationOfGc: new Prometheus.Counter({
    name: options.metricNames.durationOfGc,
    help: 'Time spent in GC Pause in seconds.',
    labelNames: defaultGcLabels,
  }),
  reclaimedInGc: new Prometheus.Counter({
    name: options.metricNames.reclaimedInGc,
    help: 'Total number of bytes reclaimed by GC.',
    labelNames: defaultGcLabels,
  }),
});

const getHttpRequestLatencyMetricsInMilliseconds = options => ({
  httpRequestDurationPerPercentileInMilliseconds:
    shouldObserveHttpRequestsAsSummary(options) &&
    new Prometheus.Summary({
      name: options.metricNames.httpRequestDurationPerPercentileInMilliseconds,
      help: 'The HTTP request latencies in milliseconds.',
      labelNames: defaultRequestLabels.concat(options.labels).sort(),
      percentiles:
        options.percentiles ||
        defaultHttpRequestDurationPercentilesInMillieconds,
    }),

  httpRequestDurationInMilliseconds:
    shouldObserveHttpRequestsAsHistogram(options) &&
    new Prometheus.Histogram({
      name: options.metricNames.httpRequestDurationInMilliseconds,
      help: 'The HTTP request latencies in milliseconds.',
      labelNames: defaultRequestLabels.concat(options.labels).sort(),
      buckets: options.buckets || defaultHttpRequestDurationInMilliseconds,
    }),
});

const getHttpRequestLatencyMetricsInSeconds = options => ({
  httpRequestDurationPerPercentileInSeconds:
    shouldObserveHttpRequestsAsSummary(options) &&
    new Prometheus.Summary({
      name: options.metricNames.httpRequestDurationPerPercentileInSeconds,
      help: 'The HTTP request latencies in seconds.',
      labelNames: defaultRequestLabels.concat(options.labels).sort(),
      percentiles:
        options.percentiles || defaultHttpRequestDurationPercentileInSeconds,
    }),

  httpRequestDurationInSeconds:
    shouldObserveHttpRequestsAsHistogram(options) &&
    new Prometheus.Histogram({
      name: options.metricNames.httpRequestDurationInSeconds,
      help: 'The HTTP request latencies in seconds.',
      labelNames: defaultRequestLabels.concat(options.labels).sort(),
      buckets: options.buckets || defaultHttpRequestDurationInSeconds,
    }),
});

const getHttpRequestCounterMetric = options => ({
  httpRequestsTotal:
    shouldObserveHttpRequestsAsCounter(options) &&
    new Prometheus.Counter({
      name: options.metricNames.httpRequestsTotal,
      help: 'The total HTTP requests.',
      labelNames: defaultRequestLabels.concat(options.labels).sort(),
    }),
});

const createMetricTypes = options => {
  const defaultedOptions = { ...defaultOptions, ...options };
  const defaultMetrics = getDefaultMetrics(defaultedOptions);

  const httpRequestLatencyMetricsInMilliseconds =
    shouldObserveMetricsInMilliseconds(defaultedOptions) &&
    getHttpRequestLatencyMetricsInMilliseconds(defaultedOptions);
  const httpRequestLatencyMetricsInSeconds =
    shouldObserveMetricsInSeconds(defaultedOptions) &&
    getHttpRequestLatencyMetricsInSeconds(defaultedOptions);
  const httpRequestCounterMetric = getHttpRequestCounterMetric(
    defaultedOptions
  );

  return {
    ...defaultMetrics,
    ...httpRequestLatencyMetricsInMilliseconds,
    ...httpRequestLatencyMetricsInSeconds,
    ...httpRequestCounterMetric,
  };
};

createMetricTypes.defaultOptions = defaultOptions;

exports.default = createMetricTypes;
