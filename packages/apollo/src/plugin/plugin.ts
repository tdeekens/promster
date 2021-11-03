import type { ApolloServerPlugin } from 'apollo-server-plugin-base';
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
const NS_PER_MS = 1e6;
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
  const graphQlFieldResolveTimeHistogram = new Prometheus.Histogram({
    name: `${allDefaultedOptions.metricPrefix}graphql_field_resolve_duration_seconds`,
    help: 'The GraphQL request parse time in seconds.',
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

  const plugin: ApolloServerPlugin = {
    serverWillStart() {
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
            const labels = Object.assign(
              {},
              {
                operation_name: parsingRequestContext.request.operationName,
              },
              allDefaultedOptions.getLabelValues?.(
                parsingRequestContext.request,
                parsingRequestContext.response
              )
            );

            const shouldSkipByRequest = allDefaultedOptions.skip?.(
              parsingRequestContext.request,
              parsingRequestContext.response,
              labels
            );

            if (shouldSkipByRequest || shouldSkipMetricsByEnvironment) {
              return;
            }

            graphQlParseTimeHistogram.observe(labels, durationS);
          };
        },

        async executionDidStart(executionRequestContext) {
          return {
            willResolveField({ source, args, context, info }) {
              const fieldResolveStart = process.hrtime();

              return (error, result) => {
                const { durationS } = endMeasurementFrom(fieldResolveStart);

                const labels = Object.assign(
                  {},
                  {
                    operation_name:
                      executionRequestContext.request.operationName,
                    field_name: info.fieldName,
                  },
                  allDefaultedOptions.getLabelValues?.(
                    executionRequestContext.request,
                    executionRequestContext.response
                  )
                );

                const shouldSkipByRequest = allDefaultedOptions.skip?.(
                  executionRequestContext.request,
                  executionRequestContext.response,
                  labels
                );

                if (shouldSkipByRequest || shouldSkipMetricsByEnvironment) {
                  return;
                }

                graphQlFieldResolveTimeHistogram.observe(labels, durationS);
              };
            },
          };
        },

        async willSendResponse(responseRequestContext) {
          const { durationS } = endMeasurementFrom(requestStart);

          const requestContentLength =
            responseRequestContext.request.http?.headers.get(
              'content-length'
            ) ?? 0;
          const responseContentLength =
            responseRequestContext.response.http?.headers.get(
              'content-length'
            ) ?? 0;

          const labels = Object.assign(
            {},
            {
              operation_name: responseRequestContext.request.operationName,
            },
            allDefaultedOptions.getLabelValues?.(
              responseRequestContext.request,
              responseRequestContext.response
            )
          );

          const shouldSkipByRequest = allDefaultedOptions.skip?.(
            responseRequestContext.request,
            responseRequestContext.response,
            labels
          );

          if (shouldSkipByRequest || shouldSkipMetricsByEnvironment) {
            return;
          }

          graphQlRequestDurationHistogram.observe(labels, durationS);
        },

        async didEncounterErrors(errorsContext) {
          const labels = Object.assign(
            {},
            {
              operation_name: errorsContext.request.operationName,
            },
            allDefaultedOptions.getLabelValues?.(
              errorsContext.request,
              errorsContext.response
            )
          );

          // TODO: add phase?
          graphQlErrorsCounter.inc(labels);
        },
      };
    },
  };

  return plugin;
};

export { createPlugin, getRequestRecorder, signalIsUp, signalIsNotUp };
