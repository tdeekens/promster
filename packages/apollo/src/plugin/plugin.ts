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
  timing,
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
      const requestTiming = timing.start();

      return {
        async parsingDidStart(parsingRequestContext) {
          const parseTiming = timing.start();

          return async (error) => {
            const { seconds: parseDurationSeconds } = parseTiming.end().value();

            const labels = getDefaultLabelsOrSkipMeasurement(
              parsingRequestContext
            );

            if (parseDurationSeconds !== undefined) {
              graphQlMetrics.graphQlParseDuration?.forEach((metric) => {
                metric.observe(labels, parseDurationSeconds);
              });
            }

            if (error) {
              graphQlMetrics.graphQlErrorsTotal?.forEach((metric) => {
                metric.inc(Object.assign({}, labels, { phase: 'parsing' }));
              });
            }
          };
        },

        async validationDidStart(validationRequestContext) {
          const validationTiming = timing.start();

          return async (error) => {
            const { seconds: validationDurationSeconds } = validationTiming
              .end()
              .value();
            const labels = getDefaultLabelsOrSkipMeasurement(
              validationRequestContext
            );

            if (validationDurationSeconds !== undefined) {
              graphQlMetrics.graphQlValidationDuration?.forEach((metric) => {
                metric.observe(labels, validationDurationSeconds);
              });
            }

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
              const fieldResolveTiming = timing.start();

              return (error) => {
                const { seconds: fieldResolveDurationSeconds } =
                  fieldResolveTiming.end().value();

                const defaultLabels = getDefaultLabelsOrSkipMeasurement(
                  executionRequestContext
                );
                const labels = Object.assign({}, defaultLabels, {
                  field_name: info.fieldName,
                });

                if (fieldResolveDurationSeconds !== undefined) {
                  graphQlMetrics.graphQlResolveFieldDuration?.forEach(
                    (metric) => {
                      metric.observe(labels, fieldResolveDurationSeconds);
                    }
                  );
                }

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
          const { seconds: requestDurationSeconds } = requestTiming
            .end()
            .value();

          const labels = getDefaultLabelsOrSkipMeasurement(
            responseRequestContext
          );

          if (requestDurationSeconds !== undefined) {
            graphQlMetrics.graphQlRequestDuration?.forEach((metric) => {
              metric.observe(labels, requestDurationSeconds);
            });
          }
        },
      };
    },
  };

  return plugin;
};

export { createPlugin, getRequestRecorder, signalIsUp, signalIsNotUp };
