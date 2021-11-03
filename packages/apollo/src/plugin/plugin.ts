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
  createGraphQlMetrics,
  createGcObserver,
  defaultNormalizers,
  isRunningInKubernetes,
  endMeasurementFrom,
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

const createPlugin = ({ options }: TPluginOptions = { options: undefined }) => {
  const allDefaultedOptions = merge(
    createGcMetrics.defaultOptions,
    createGraphQlMetrics.defaultOptions,
    defaultNormalizers,
    {
      labels: ['operation_name'],
    },
    options
  );

  const shouldSkipMetricsByEnvironment =
    allDefaultedOptions.detectKubernetes && !isRunningInKubernetes();

  const gcMetrics: TGcMetrics = createGcMetrics(allDefaultedOptions);
  const graphQlMetrics: TGraphQlMetrics =
    createGraphQlMetrics(allDefaultedOptions);

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

            graphQlMetrics.graphQlParseDuration.forEach((metric) =>
              metric.observe(labels, durationS)
            );
          };
        },

        async validationDidStart(validationRequestContext) {
          const validationStart = process.hrtime();

          return async () => {
            const { durationS } = endMeasurementFrom(validationStart);
            const labels = getDefaultLabelsOrSkipMeasurement(
              validationRequestContext
            );

            graphQlMetrics.graphQlValidationDuration.forEach((metric) =>
              metric.observe(labels, durationS)
            );
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

                graphQlMetrics.graphQlResolveFieldDuration.forEach((metric) =>
                  metric.observe(labels, durationS)
                );
              };
            },
          };
        },

        async willSendResponse(responseRequestContext) {
          const { durationS } = endMeasurementFrom(requestStart);

          const labels = getDefaultLabelsOrSkipMeasurement(
            responseRequestContext
          );

          graphQlMetrics.graphQlRequestDuration.forEach((metric) =>
            metric.observe(labels, durationS)
          );
        },

        async didEncounterErrors(errorsContext) {
          const labels = getDefaultLabelsOrSkipMeasurement(errorsContext);

          graphQlMetrics.graphQlErrorsTotal.forEach((metric) =>
            metric.inc(labels)
          );
        },
      };
    },
  };

  return plugin;
};

export { createPlugin, getRequestRecorder, signalIsUp, signalIsNotUp };
