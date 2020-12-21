import type { DeepRequired } from 'ts-essentials';
import type { TPromsterOptions } from '@promster/types';

import merge from 'merge-options';
import { configure, Prometheus } from '../client';

type TOptions = DeepRequired<TPromsterOptions>;

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
const asArray = (maybeArray: Readonly<string[] | string>) =>
  Array.isArray(maybeArray) ? maybeArray : [maybeArray];

const shouldObserveMetricsInSeconds = (options: TOptions) =>
  options.accuracies.includes('s');
const shouldObserveMetricsInMilliseconds = (options: TOptions) =>
  options.accuracies.includes('ms');
const shouldObserveHttpRequestsAsSummary = (options: TOptions) =>
  options.metricTypes.includes('httpRequestsSummary');
const shouldObserveHttpRequestsAsHistogram = (options: TOptions) =>
  options.metricTypes.includes('httpRequestsHistogram');
const shouldObserveHttpRequestsAsCounter = (options: TOptions) =>
  options.metricTypes.includes('httpRequestsTotal');

const defaultOptions = {
  getLabelValues: () => ({}),
  labels: [],
  accuracies: ['s'],
  metricPrefix: '',
  metricTypes: ['httpRequestsTotal', 'httpRequestsHistogram'],
  metricNames: {
    up: ['up'],
    countOfGcs: ['nodejs_gc_runs_total'],
    durationOfGc: ['nodejs_gc_pause_seconds_total'],
    reclaimedInGc: ['nodejs_gc_reclaimed_bytes_total'],
    httpRequestsTotal: ['http_requests_total'],
    httpRequestDurationPerPercentileInMilliseconds: [
      'http_request_duration_per_percentile_milliseconds',
    ],
    httpRequestDurationPerPercentileInSeconds: [
      'http_request_duration_per_percentile_seconds',
    ],
    httpRequestDurationInSeconds: ['http_request_duration_seconds'],
    httpRequestDurationInMilliseconds: ['http_request_duration_milliseconds'],
  },
};

const getDefaultMetrics = (options: TOptions) => ({
  up: asArray(options.metricNames.up).map(
    (nameOfUpMetric: string) =>
      new Prometheus.Gauge({
        name: `${options.metricPrefix}${nameOfUpMetric}`,
        help: '1 = up, 0 = not up',
      })
  ),
  countOfGcs: asArray(options.metricNames.countOfGcs).map(
    (nameOfCounfOfGcsMetric: string) =>
      new Prometheus.Counter({
        name: `${options.metricPrefix}${nameOfCounfOfGcsMetric}`,
        help: 'Count of total garbage collections.',
        labelNames: defaultGcLabels,
      })
  ),
  durationOfGc: asArray(options.metricNames.durationOfGc).map(
    (nameOfDurationOfGcMetric: string) =>
      new Prometheus.Counter({
        name: `${options.metricPrefix}${nameOfDurationOfGcMetric}`,
        help: 'Time spent in GC Pause in seconds.',
        labelNames: defaultGcLabels,
      })
  ),
  reclaimedInGc: asArray(options.metricNames.reclaimedInGc).map(
    (nameOfReclaimedInGcMetric: string) =>
      new Prometheus.Counter({
        name: `${options.metricPrefix}${nameOfReclaimedInGcMetric}`,
        help: 'Total number of bytes reclaimed by GC.',
        labelNames: defaultGcLabels,
      })
  ),
});

const getHttpRequestLatencyMetricsInMilliseconds = (options: TOptions) => ({
  httpRequestDurationPerPercentileInMilliseconds:
    shouldObserveHttpRequestsAsSummary(options) &&
    asArray(
      options.metricNames.httpRequestDurationPerPercentileInMilliseconds
    ).map(
      (nameOfHttpRequestDurationPerPercentileInMillisecondsMetric: string) =>
        new Prometheus.Summary({
          name: `${options.metricPrefix}${nameOfHttpRequestDurationPerPercentileInMillisecondsMetric}`,
          help: 'The HTTP request latencies in milliseconds.',
          labelNames: defaultRequestLabels.concat(options.labels).sort(),
          percentiles:
            options.percentiles ||
            defaultHttpRequestDurationPercentilesInMillieconds,
        })
    ),

  httpRequestDurationInMilliseconds:
    shouldObserveHttpRequestsAsHistogram(options) &&
    asArray(options.metricNames.httpRequestDurationInMilliseconds).map(
      (nameOfHttpRequestDurationInMillisecondsMetric: string) =>
        new Prometheus.Histogram({
          name: `${options.metricPrefix}${nameOfHttpRequestDurationInMillisecondsMetric}`,
          help: 'The HTTP request latencies in milliseconds.',
          labelNames: defaultRequestLabels.concat(options.labels).sort(),
          buckets: options.buckets || defaultHttpRequestDurationInMilliseconds,
        })
    ),
});

const getHttpRequestLatencyMetricsInSeconds = (options: TOptions) => ({
  httpRequestDurationPerPercentileInSeconds:
    shouldObserveHttpRequestsAsSummary(options) &&
    asArray(options.metricNames.httpRequestDurationPerPercentileInSeconds).map(
      (nameOfHttpRequestDurationPerPercentileInSeconds: string) =>
        new Prometheus.Summary({
          name: `${options.metricPrefix}${nameOfHttpRequestDurationPerPercentileInSeconds}`,
          help: 'The HTTP request latencies in seconds.',
          labelNames: defaultRequestLabels.concat(options.labels).sort(),
          percentiles:
            options.percentiles ||
            defaultHttpRequestDurationPercentileInSeconds,
        })
    ),

  httpRequestDurationInSeconds:
    shouldObserveHttpRequestsAsHistogram(options) &&
    asArray(options.metricNames.httpRequestDurationInSeconds).map(
      (nameOfHttpRequestDurationInSecondsMetric: string) =>
        new Prometheus.Histogram({
          name: `${options.metricPrefix}${nameOfHttpRequestDurationInSecondsMetric}`,
          help: 'The HTTP request latencies in seconds.',
          labelNames: defaultRequestLabels.concat(options.labels).sort(),
          buckets: options.buckets || defaultHttpRequestDurationInSeconds,
        })
    ),
});

const getHttpRequestCounterMetric = (options: TOptions) => ({
  httpRequestsTotal:
    shouldObserveHttpRequestsAsCounter(options) &&
    asArray(options.metricNames.httpRequestsTotal).map(
      (nameOfHttpRequestsTotalMetric: string) =>
        new Prometheus.Counter({
          name: `${options.metricPrefix}${nameOfHttpRequestsTotalMetric}`,
          help: 'The total HTTP requests.',
          labelNames: defaultRequestLabels.concat(options.labels).sort(),
        })
    ),
});

const createMetricTypes = (options: TOptions) => {
  const defaultedOptions = merge(defaultOptions, options);

  configure({
    prefix: defaultedOptions.metricPrefix,
  });

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

  return Object.assign(
    {},
    defaultMetrics,
    httpRequestLatencyMetricsInMilliseconds,
    httpRequestLatencyMetricsInSeconds,
    httpRequestCounterMetric
  );
};

createMetricTypes.defaultOptions = defaultOptions;

export { createMetricTypes };
