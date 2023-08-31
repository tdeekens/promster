import {
  type TDefaultedPromsterOptions,
  type TGraphQlMetrics,
} from '@promster/types';

import merge from 'merge-options';
import { configure, Prometheus } from '../client';

const defaultGraphQlPercentiles = [0.5, 0.9, 0.95, 0.98, 0.99];

const defaultLabels = ['operation_name'];
const asArray = (maybeArray: Readonly<string[] | string>) =>
  Array.isArray(maybeArray) ? maybeArray : [maybeArray];

const shouldObserveGraphQlParseDurationAsHistogram = (
  options: TDefaultedPromsterOptions
) => options.metricTypes.includes('graphQlParseDurationHistogram');
const shouldObserveGraphQlValidationDurationAsHistogram = (
  options: TDefaultedPromsterOptions
) => options.metricTypes.includes('graphQlValidationDurationHistogram');
const shouldObserveGraphQlResolveFieldDurationAsHistogram = (
  options: TDefaultedPromsterOptions
) => options.metricTypes.includes('graphQlResolveFieldDurationHistogram');
const shouldObserveGraphQlRequestDurationAsHistogram = (
  options: TDefaultedPromsterOptions
) => options.metricTypes.includes('graphQlRequestDurationHistogram');
const shouldObserveGraphQlErrorsTotalAsCounter = (
  options: TDefaultedPromsterOptions
) => options.metricTypes.includes('graphQlErrorsTotal');

const defaultOptions = {
  getLabelValues: () => ({}),
  labels: [],
  metricPrefix: '',
  metricTypes: [
    'graphQlParseDurationHistogram',
    'graphQlValidationDurationHistogram',
    'graphQlResolveFieldDurationHistogram',
    'graphQlRequestDurationHistogram',
    'graphQlErrorsTotal',
  ],
  metricNames: {
    graphQlParseDuration: ['graphql_parse_duration_seconds'],
    graphQlValidationDuration: ['graphql_validation_duration_seconds'],
    graphQlResolveFieldDuration: ['graphql_resolve_field_duration_seconds'],
    graphQlRequestDuration: ['graphql_request_duration_seconds'],
    graphQlErrorsTotal: ['graphql_errors_total'],
  },
  metricPercentiles: {
    graphQlParseDuration: defaultGraphQlPercentiles,
    graphQlValidationDuration: defaultGraphQlPercentiles,
    graphQlResolveFieldDuration: defaultGraphQlPercentiles,
    graphQlRequestDuration: defaultGraphQlPercentiles,
    graphQlErrorsTotal: defaultGraphQlPercentiles,
  },
};

const getMetrics = (options: TDefaultedPromsterOptions) => ({
  graphQlParseDuration: shouldObserveGraphQlParseDurationAsHistogram(options)
    ? asArray(options.metricNames.graphQlParseDuration).map(
        (nameOfGraphQlParseDuration: string) =>
          new Prometheus.Histogram({
            name: `${options.metricPrefix}${nameOfGraphQlParseDuration}`,
            help: 'The GraphQL request parse time in seconds.',
            labelNames: defaultLabels.concat(options.labels).sort(),
            buckets:
              options.metricPercentiles?.graphQlParseDuration ||
              defaultGraphQlPercentiles,
          })
      )
    : undefined,

  graphQlValidationDuration: shouldObserveGraphQlValidationDurationAsHistogram(
    options
  )
    ? asArray(options.metricNames.graphQlValidationDuration).map(
        (nameOfGraphQlValidationDuration: string) =>
          new Prometheus.Histogram({
            name: `${options.metricPrefix}${nameOfGraphQlValidationDuration}`,
            help: 'The GraphQL request validation time in seconds.',
            labelNames: defaultLabels.concat(options.labels).sort(),
            buckets:
              options.metricPercentiles?.graphQlValidationDuration ||
              defaultGraphQlPercentiles,
          })
      )
    : undefined,

  graphQlResolveFieldDuration:
    shouldObserveGraphQlResolveFieldDurationAsHistogram(options)
      ? asArray(options.metricNames.graphQlResolveFieldDuration).map(
          (nameOfGraphQlResolveFieldDuration: string) =>
            new Prometheus.Histogram({
              name: `${options.metricPrefix}${nameOfGraphQlResolveFieldDuration}`,
              help: 'The GraphQL field resolving time in seconds.',
              labelNames: defaultLabels
                .concat(['field_name'])
                .concat(options.labels)
                .sort(),
              buckets:
                options.metricPercentiles?.graphQlResolveFieldDuration ||
                defaultGraphQlPercentiles,
            })
        )
      : undefined,

  graphQlRequestDuration: shouldObserveGraphQlRequestDurationAsHistogram(
    options
  )
    ? asArray(options.metricNames.graphQlRequestDuration).map(
        (nameOfGraphQlRequestDuration: string) =>
          new Prometheus.Histogram({
            name: `${options.metricPrefix}${nameOfGraphQlRequestDuration}`,
            help: 'The GraphQL request duration time in seconds.',
            labelNames: defaultLabels.concat(options.labels).sort(),
            buckets:
              options.metricPercentiles?.graphQlRequestDuration ||
              defaultGraphQlPercentiles,
          })
      )
    : undefined,

  graphQlErrorsTotal: shouldObserveGraphQlErrorsTotalAsCounter(options)
    ? asArray(options.metricNames.graphQlErrorsTotal).map(
        (nameOfGraphQlErrorsCount: string) =>
          new Prometheus.Counter({
            name: `${options.metricPrefix}${nameOfGraphQlErrorsCount}`,
            help: 'Count of errors while parsing, validating, or executing a GraphQL operation.',
            labelNames: defaultLabels
              .concat(['phase'])
              .concat(options.labels)
              .sort(),
          })
      )
    : undefined,
});

const createGraphQlMetrics = (
  options: TDefaultedPromsterOptions
): TGraphQlMetrics => {
  const defaultedOptions: TDefaultedPromsterOptions = merge(
    defaultOptions,
    options
  );

  configure({
    prefix: defaultedOptions.metricPrefix,
  });

  const metrics = getMetrics(defaultedOptions);

  return metrics;
};

createGraphQlMetrics.defaultOptions = defaultOptions;

export { createGraphQlMetrics };
