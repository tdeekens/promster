import type {
  ApolloServerPlugin,
  GraphQLRequestContext,
} from 'apollo-server-plugin-base';
import type {
  TPromsterOptions,
  TDefaultedPromsterOptions,
  TGcMetrics,
  TGraphQlMetrics,
  TLabelValues,
} from '@promster/types';
import type { TRequestRecorder } from '@promster/metrics';

import merge from 'merge-options';
import {
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
  const allDefaultedOptions: TDefaultedPromsterOptions = merge(
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
  ): TLabelValues {
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

          return async (error) => {
            const { durationS } = endMeasurementFrom(parseStart);
            const labels = getDefaultLabelsOrSkipMeasurement(
              parsingRequestContext
            );

            graphQlMetrics.graphQlParseDuration?.forEach((metric) => {
              metric.observe(labels, durationS);
            });

            if (error) {
              graphQlMetrics.graphQlErrorsTotal?.forEach((metric) => {
                metric.inc(Object.assign({}, labels, { phase: 'parsing' }));
              });
            }
          };
        },

        async validationDidStart(validationRequestContext) {
          const validationStart = process.hrtime();

          return async (error) => {
            const { durationS } = endMeasurementFrom(validationStart);
            const labels = getDefaultLabelsOrSkipMeasurement(
              validationRequestContext
            );

            graphQlMetrics.graphQlValidationDuration?.forEach((metric) => {
              metric.observe(labels, durationS);
            });

            if (error) {
              graphQlMetrics.graphQlErrorsTotal?.forEach((metric) => {
                metric.inc(Object.assign({}, labels, { phase: 'validation' }));
              });
            }
          };
        },

        async executionDidStart(executionRequestContext) {
          return {
            willResolveField({ info }) {
              const fieldResolveStart = process.hrtime();

              return (error) => {
                const { durationS } = endMeasurementFrom(fieldResolveStart);

                const defaultLabels = getDefaultLabelsOrSkipMeasurement(
                  executionRequestContext
                );
                const labels = Object.assign({}, defaultLabels, {
                  field_name: info.fieldName,
                });

                graphQlMetrics.graphQlResolveFieldDuration?.forEach(
                  (metric) => {
                    metric.observe(labels, durationS);
                  }
                );

                if (error) {
                  graphQlMetrics.graphQlErrorsTotal?.forEach((metric) => {
                    metric.inc(
                      Object.assign({}, labels, { phase: 'execution' })
                    );
                  });
                }
              };
            },
          };
        },

        async willSendResponse(responseRequestContext) {
          const { durationS } = endMeasurementFrom(requestStart);

          const labels = getDefaultLabelsOrSkipMeasurement(
            responseRequestContext
          );

          graphQlMetrics.graphQlRequestDuration?.forEach((metric) => {
            metric.observe(labels, durationS);
          });
        },
      };
    },
  };

  return plugin;
};

export { createPlugin, getRequestRecorder, signalIsUp, signalIsNotUp };
