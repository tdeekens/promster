import type {
  ApolloServerPlugin,
  GraphQLRequestContext,
} from 'apollo-server-plugin-base';
import type { TPromsterOptions, TGcMetrics } from '@promster/types';
import type { TRequestRecorder } from '@promster/metrics';

import merge from 'merge-options';
import {
  Prometheus,
  createGcMetrics,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  isRunningInKubernetes,
} from '@promster/metrics';

let recordRequest: TRequestRecorder;
let upMetric: TGcMetrics['up'];

const getRequestRecorder = () => recordRequest;
const signalIsUp = () => {
  if (!upMetric) {
    return;
  }

  upMetric.forEach((upMetricType) => {
    upMetricType.set(1);
  });
};

const signalIsNotUp = () => {
  if (!upMetric) {
    return;
  }

  upMetric.forEach((upMetricType) => {
    upMetricType.set(0);
  });
};

type TPluginOptions = {
  options?: TPromsterOptions;
};

const NS_PER_SEC = 1e9;
const endMeasurementFrom = (start: TRequestTiming) => {
  const [seconds, nanoseconds] = process.hrtime(start);

  return {
    durationS: (seconds * NS_PER_SEC + nanoseconds) / NS_PER_SEC,
  };
};

const createPlugin = ({ options }: TPluginOptions = { options: undefined }) => {
  const allDefaultedOptions = merge(
    createGcMetrics.defaultOptions,
    createRequestRecorder.defaultOptions,
    defaultNormalizers,
    {
      labels: ['operation_name'],
    },
    options
  );

  const graphQlParseTimeHistogram = new Prometheus.Histogram({
    name: `${allDefaultedOptions.metricPrefix}graphql_parse_duration_seconds`,
    help: 'The GraphQL request parse time in seconds.',
    buckets: [0.5, 0.9, 0.95, 0.98, 0.99],
    labelNames: ['operation_name'],
  });
  const graphQlValidationTimeHistogram = new Prometheus.Histogram({
    name: `${allDefaultedOptions.metricPrefix}graphql_validation_duration_seconds`,
    help: 'The GraphQL request validation time in seconds.',
    buckets: [0.5, 0.9, 0.95, 0.98, 0.99],
    labelNames: ['operation_name'],
  });
  const graphQlResolveFieldTimeHistogram = new Prometheus.Histogram({
    name: `${allDefaultedOptions.metricPrefix}graphql_resolve_field_duration_seconds`,
    help: 'The GraphQL field resolving time in seconds.',
    buckets: [0.5, 0.9, 0.95, 0.98, 0.99],
    labelNames: ['operation_name', 'field_name'],
  });
  const graphQlRequestDurationHistogram = new Prometheus.Histogram({
    name: `${allDefaultedOptions.metricPrefix}graphql_request_duration_seconds`,
    help: 'The GraphQL request duration time in seconds.',
    buckets: [0.5, 0.9, 0.95, 0.98, 0.99],
    labelNames: ['operation_name'],
  });
  const graphQlErrorsCounter = new Prometheus.Counter({
    name: `${allDefaultedOptions.metricPrefix}graphql_errors_total`,
    help: 'Count of errors while parsing, validating, or executing a GraphQL operation.',
    labelNames: ['operation_name'],
  });

  const shouldSkipMetricsByEnvironment =
    allDefaultedOptions.detectKubernetes && !isRunningInKubernetes();

  const gcMetrics: TGcMetrics = createGcMetrics(allDefaultedOptions);

  const observeGc = createGcObserver(gcMetrics, allDefaultedOptions);

  upMetric = gcMetrics?.up;

  if (!shouldSkipMetricsByEnvironment && !options?.disableGcMetrics) {
    observeGc();
  }

  function getDefaultLabelsOrSkipMeasurement(
    requestContext: GraphQLRequestContext
  ): Record<string, string> {
    const labels = Object.assign(
      {},
      {
        operation_name: requestContext.request.operationName,
      },
      allDefaultedOptions.getLabelValues?.(
        requestContext.request,
        requestContext.response
      )
    );

    const shouldSkipByRequest = allDefaultedOptions.skip?.(
      requestContext.request,
      requestContext.response,
      labels
    );

    if (shouldSkipByRequest || shouldSkipMetricsByEnvironment) {
      return {};
    }

    return labels;
  }

  const plugin: ApolloServerPlugin = {
    async serverWillStart() {
      signalIsUp();

      return {
        async serverWillStop() {
          signalIsNotUp();
        },
      };
    },

    async requestDidStart() {
      const requestStart = process.hrtime();

      return {
        async parsingDidStart(parsingRequestContext) {
          const parseStart = process.hrtime();

          return async () => {
            const { durationS } = endMeasurementFrom(parseStart);
            const labels = getDefaultLabelsOrSkipMeasurement(
              parsingRequestContext
            );

            graphQlParseTimeHistogram.observe(labels, durationS);
          };
        },

        async validationDidStart(validationRequestContext) {
          const validationStart = process.hrtime();

          return async () => {
            const { durationS } = endMeasurementFrom(validationStart);
            const labels = getDefaultLabelsOrSkipMeasurement(
              validationRequestContext
            );

            graphQlValidationTimeHistogram.observe(labels, durationS);
          };
        },

        async executionDidStart(executionRequestContext) {
          return {
            willResolveField({ info }) {
              const fieldResolveStart = process.hrtime();

              return () => {
                const { durationS } = endMeasurementFrom(fieldResolveStart);

                const defaultLabels = getDefaultLabelsOrSkipMeasurement(
                  executionRequestContext
                );
                const labels = Object.assign({}, defaultLabels, {
                  field_name: info.fieldName,
                });

                graphQlResolveFieldTimeHistogram.observe(labels, durationS);
              };
            },
          };
        },

        async willSendResponse(responseRequestContext) {
          const { durationS } = endMeasurementFrom(requestStart);

          const labels = getDefaultLabelsOrSkipMeasurement(
            responseRequestContext
          );

          graphQlRequestDurationHistogram.observe(labels, durationS);
        },

        async didEncounterErrors(errorsContext) {
          const labels = getDefaultLabelsOrSkipMeasurement(errorsContext);

          graphQlErrorsCounter.inc(labels);
        },
      };
    },
  };

  return plugin;
};

export { createPlugin, getRequestRecorder, signalIsUp, signalIsNotUp };
