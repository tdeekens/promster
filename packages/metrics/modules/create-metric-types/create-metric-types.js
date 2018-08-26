const { Prometheus } = require('../client');

const defaultPercentilesInMillieconds = [0.5, 0.9, 0.95, 0.98, 0.99];
const defaultBucketsInMilliseconds = [
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

const defaultPercentilesInSeconds = [0.5, 0.9, 0.95, 0.98, 0.99];
const defaultBucketsInSeconds = [0.05, 0.1, 0.3, 0.5, 0.8, 1, 1.5, 2, 3, 10];

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
  metricTypes: [
    'httpRequestsSummary',
    'httpRequestsHistogram',
    'httpRequestsTotal',
  ],
  metricNames: {
    up: 'up',
    countOfGcs: 'nodejs_gc_runs_total',
    durationOfGc: 'nodejs_gc_pause_seconds_total',
    reclaimedInGc: 'nodejs_gc_reclaimed_bytes_total',
    percentilesInMilliseconds: 'http_request_duration_percentiles_milliseconds',
    bucketsInMilliseconds: 'http_request_duration_buckets_milliseconds',
    percentilesInSeconds: 'http_request_duration_percentiles_seconds',
    bucketsInSeconds: 'http_request_duration_buckets_seconds',
    requestsTotal: 'http_requests_total',
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
  percentilesInMilliseconds:
    shouldObserveHttpRequestsAsSummary(options) &&
    new Prometheus.Summary({
      name: options.metricNames.percentilesInMilliseconds,
      help: 'The HTTP request latencies in milliseconds.',
      labelNames: defaultRequestLabels.concat(options.labels).sort(),
      percentiles: options.percentiles || defaultPercentilesInMillieconds,
    }),

  bucketsInMilliseconds:
    shouldObserveHttpRequestsAsHistogram(options) &&
    new Prometheus.Histogram({
      name: options.metricNames.bucketsInMilliseconds,
      help: 'The HTTP request latencies in milliseconds.',
      labelNames: defaultRequestLabels.concat(options.labels).sort(),
      buckets: options.buckets || defaultBucketsInMilliseconds,
    }),
});

const getHttpRequestLatencyMetricsInSeconds = options => ({
  percentilesInSeconds:
    shouldObserveHttpRequestsAsSummary(options) &&
    new Prometheus.Summary({
      name: options.metricNames.percentilesInSeconds,
      help: 'The HTTP request latencies in seconds.',
      labelNames: defaultRequestLabels.concat(options.labels).sort(),
      percentiles: options.percentiles || defaultPercentilesInSeconds,
    }),

  bucketsInSeconds:
    shouldObserveHttpRequestsAsHistogram(options) &&
    new Prometheus.Histogram({
      name: options.metricNames.bucketsInSeconds,
      help: 'The HTTP request latencies in seconds.',
      labelNames: defaultRequestLabels.concat(options.labels).sort(),
      buckets: options.buckets || defaultBucketsInSeconds,
    }),
});

const getHttpRequestCounterMetric = options => ({
  requestsTotal:
    shouldObserveHttpRequestsAsCounter(options) &&
    new Prometheus.Counter({
      name: options.metricNames.requestsTotal,
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
