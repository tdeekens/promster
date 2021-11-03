import type { TDefaultedPromsterOptions, THttpMetrics } from '@promster/types';

import merge from 'merge-options';
import { configure, Prometheus } from '../client';

const defaultHttpRequestDurationPercentilesInMillieconds = [
  0.5, 0.9, 0.95, 0.98, 0.99,
];
const defaultHttpRequestDurationInMilliseconds = [
  50, 100, 300, 500, 800, 1000, 1500, 2000, 3000, 5000, 10000,
];

const defaultHttpRequestDurationPercentileInSeconds = [
  0.5, 0.9, 0.95, 0.98, 0.99,
];
const defaultHttpRequestDurationInSeconds = [
  0.05, 0.1, 0.3, 0.5, 0.8, 1, 1.5, 2, 3, 10,
];
const defaultHttpContentLengthInBytes = [
  100000, 200000, 500000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000,
];

const defaultLabels = ['path', 'status_code', 'method'];
const asArray = (maybeArray: Readonly<string[] | string>) =>
  Array.isArray(maybeArray) ? maybeArray : [maybeArray];

const shouldObserveMetricsInSeconds = (options: TDefaultedPromsterOptions) =>
  options.accuracies.includes('s');
const shouldObserveMetricsInMilliseconds = (
  options: TDefaultedPromsterOptions
) => options.accuracies.includes('ms');
const shouldObserveHttpRequestsAsSummary = (
  options: TDefaultedPromsterOptions
) => options.metricTypes.includes('httpRequestsSummary');
const shouldObserveHttpRequestsAsHistogram = (
  options: TDefaultedPromsterOptions
) => options.metricTypes.includes('httpRequestsHistogram');
const shouldObserveHttpRequestsAsCounter = (
  options: TDefaultedPromsterOptions
) => options.metricTypes.includes('httpRequestsTotal');
const shouldObserveHttpContentLengthAsHistogram = (
  options: TDefaultedPromsterOptions
) => options.metricTypes.includes('httpContentLengthHistogram');

const defaultOptions = {
  getLabelValues: () => ({}),
  labels: [],
  accuracies: ['s'],
  metricPrefix: '',
  metricTypes: ['httpRequestsTotal', 'httpRequestsHistogram'],
  metricNames: {
    httpRequestsTotal: ['http_requests_total'],
    httpRequestDurationPerPercentileInMilliseconds: [
      'http_request_duration_per_percentile_milliseconds',
    ],
    httpRequestDurationPerPercentileInSeconds: [
      'http_request_duration_per_percentile_seconds',
    ],
    httpRequestDurationInSeconds: ['http_request_duration_seconds'],
    httpRequestDurationInMilliseconds: ['http_request_duration_milliseconds'],
    httpRequestContentLengthInBytes: ['http_request_content_length_bytes'],
    httpResponseContentLengthInBytes: ['http_response_content_length_bytes'],
  },
};

const getMetrics = (options: TDefaultedPromsterOptions) => ({
  httpRequestContentLengthInBytes:
    shouldObserveHttpContentLengthAsHistogram(options) &&
    asArray(options.metricNames.httpRequestContentLengthInBytes).map(
      (nameOfHttpContentLengthMetric: string) =>
        new Prometheus.Histogram({
          name: `${options.metricPrefix}${nameOfHttpContentLengthMetric}`,
          help: 'The HTTP request content length in bytes.',
          labelNames: defaultLabels.concat(options.labels).sort(),
          buckets: options.buckets || defaultHttpContentLengthInBytes,
        })
    ),
  httpResponseContentLengthInBytes:
    shouldObserveHttpContentLengthAsHistogram(options) &&
    asArray(options.metricNames.httpResponseContentLengthInBytes).map(
      (nameOfHttpContentLengthMetric: string) =>
        new Prometheus.Histogram({
          name: `${options.metricPrefix}${nameOfHttpContentLengthMetric}`,
          help: 'The HTTP response content length in bytes.',
          labelNames: defaultLabels.concat(options.labels).sort(),
          buckets: options.buckets || defaultHttpContentLengthInBytes,
        })
    ),
});

const getHttpRequestLatencyMetricsInMilliseconds = (
  options: TDefaultedPromsterOptions
) => ({
  httpRequestDurationPerPercentileInMilliseconds:
    shouldObserveHttpRequestsAsSummary(options) &&
    asArray(
      options.metricNames.httpRequestDurationPerPercentileInMilliseconds
    ).map(
      (nameOfHttpRequestDurationPerPercentileInMillisecondsMetric: string) =>
        new Prometheus.Summary({
          name: `${options.metricPrefix}${nameOfHttpRequestDurationPerPercentileInMillisecondsMetric}`,
          help: 'The HTTP request latencies in milliseconds.',
          labelNames: defaultLabels.concat(options.labels).sort(),
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
          labelNames: defaultLabels.concat(options.labels).sort(),
          buckets: options.buckets || defaultHttpRequestDurationInMilliseconds,
        })
    ),
});

const getHttpRequestLatencyMetricsInSeconds = (
  options: TDefaultedPromsterOptions
) => ({
  httpRequestDurationPerPercentileInSeconds:
    shouldObserveHttpRequestsAsSummary(options) &&
    asArray(options.metricNames.httpRequestDurationPerPercentileInSeconds).map(
      (nameOfHttpRequestDurationPerPercentileInSeconds: string) =>
        new Prometheus.Summary({
          name: `${options.metricPrefix}${nameOfHttpRequestDurationPerPercentileInSeconds}`,
          help: 'The HTTP request latencies in seconds.',
          labelNames: defaultLabels.concat(options.labels).sort(),
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
          labelNames: defaultLabels.concat(options.labels).sort(),
          buckets: options.buckets || defaultHttpRequestDurationInSeconds,
        })
    ),
});

const getHttpRequestCounterMetric = (options: TDefaultedPromsterOptions) => ({
  httpRequestsTotal:
    shouldObserveHttpRequestsAsCounter(options) &&
    asArray(options.metricNames.httpRequestsTotal).map(
      (nameOfHttpRequestsTotalMetric: string) =>
        new Prometheus.Counter({
          name: `${options.metricPrefix}${nameOfHttpRequestsTotalMetric}`,
          help: 'The total HTTP requests.',
          labelNames: defaultLabels.concat(options.labels).sort(),
        })
    ),
});

const createHttpMetrics = (
  options: TDefaultedPromsterOptions
): THttpMetrics => {
  const defaultedOptions: TDefaultedPromsterOptions = merge(
    defaultOptions,
    options
  );

  configure({
    prefix: defaultedOptions.metricPrefix,
  });

  const metrics = getMetrics(defaultedOptions);

  const httpRequestLatencyMetricsInMilliseconds =
    shouldObserveMetricsInMilliseconds(defaultedOptions) &&
    getHttpRequestLatencyMetricsInMilliseconds(defaultedOptions);
  const httpRequestLatencyMetricsInSeconds =
    shouldObserveMetricsInSeconds(defaultedOptions) &&
    getHttpRequestLatencyMetricsInSeconds(defaultedOptions);
  const httpRequestCounterMetric =
    getHttpRequestCounterMetric(defaultedOptions);

  return Object.assign(
    {},
    metrics,
    httpRequestLatencyMetricsInMilliseconds,
    httpRequestLatencyMetricsInSeconds,
    httpRequestCounterMetric
  );
};

createHttpMetrics.defaultOptions = defaultOptions;

export { createHttpMetrics };
