import type {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequest,
  GraphQLRequestContext,
} from '@apollo/server';
import type { TRequestRecorder } from '@promster/metrics';
import type {
  TDefaultedPromsterOptions,
  TGcMetrics,
  TGraphQlMetrics,
  TLabelValues,
  TOptionalPromsterOptions,
} from '@promster/types';

import {
  createGcMetrics,
  createGcObserver,
  createGraphQlMetrics,
  defaultNormalizers,
  isRunningInKubernetes,
  timing,
} from '@promster/metrics';
import merge from 'merge-options';

let recordRequest: TRequestRecorder;
let upMetric: TGcMetrics['up'];

// @ts-expect-error
const getRequestRecorder = () => recordRequest;
const signalIsUp = () => {
  if (!upMetric) {
    return;
  }

  for (const upMetricType of upMetric) {
    upMetricType.set(1);
  }
};

const signalIsNotUp = () => {
  if (!upMetric) {
    return;
  }

  for (const upMetricType of upMetric) {
    upMetricType.set(0);
  }
};

type TSkipFunction = <
  TRequest = GraphQLRequest,
  TResponse = GraphQLRequestContext<BaseContext>['response'],
>(
  _req: TRequest,
  _res: TResponse,
  _labels: TLabelValues
) => boolean;
export type TPromsterOptions = {
  options?: TOptionalPromsterOptions & { skip?: TSkipFunction };
};

const createPlugin = (
  { options }: TPromsterOptions = { options: undefined }
) => {
  const allDefaultedOptions: TDefaultedPromsterOptions & {
    skip?: TSkipFunction;
  } = merge(
    createGcMetrics.defaultOptions,
    createGraphQlMetrics.defaultOptions,
    defaultNormalizers,
    {
      labels: ['operation_name', 'field_name'],
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
    requestContext: GraphQLRequestContext<BaseContext>
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

    if (shouldSkipByRequest ?? shouldSkipMetricsByEnvironment) {
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
              if (graphQlMetrics.graphQlParseDuration) {
                for (const metric of graphQlMetrics.graphQlParseDuration) {
                  metric.observe(labels, parseDurationSeconds);
                }
              }
            }

            if (error) {
              if (graphQlMetrics.graphQlErrorsTotal) {
                for (const metric of graphQlMetrics.graphQlErrorsTotal) {
                  metric.inc(Object.assign({}, labels, { phase: 'parsing' }));
                }
              }
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
              if (graphQlMetrics.graphQlValidationDuration) {
                for (const metric of graphQlMetrics.graphQlValidationDuration) {
                  metric.observe(labels, validationDurationSeconds);
                }
              }
            }

            if (error) {
              if (graphQlMetrics.graphQlErrorsTotal) {
                for (const metric of graphQlMetrics.graphQlErrorsTotal) {
                  metric.inc(
                    Object.assign({}, labels, { phase: 'validation' })
                  );
                }
              }
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
                  if (graphQlMetrics.graphQlResolveFieldDuration) {
                    for (const metric of graphQlMetrics.graphQlResolveFieldDuration) {
                      metric.observe(labels, fieldResolveDurationSeconds);
                    }
                  }
                }

                if (error) {
                  if (graphQlMetrics.graphQlErrorsTotal) {
                    for (const metric of graphQlMetrics.graphQlErrorsTotal) {
                      metric.inc(
                        Object.assign({}, labels, { phase: 'execution' })
                      );
                    }
                  }
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
            if (graphQlMetrics.graphQlRequestDuration) {
              for (const metric of graphQlMetrics.graphQlRequestDuration) {
                metric.observe(labels, requestDurationSeconds);
              }
            }
          }
        },
      };
    },
  };

  return plugin;
};

export { createPlugin, getRequestRecorder, signalIsUp, signalIsNotUp };
