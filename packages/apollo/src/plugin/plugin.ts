import type { ApolloServerPlugin } from 'apollo-server-plugin-base';
import type { TPromsterOptions, TMetricTypes } from '@promster/types';
import type { TRequestRecorder } from '@promster/metrics';

import merge from 'merge-options';
import {
  Prometheus,
  createMetricTypes,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  isRunningInKubernetes,
} from '@promster/metrics';

let recordRequest: TRequestRecorder;
let upMetric: TMetricTypes['up'];

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
    durationMs: Math.round((seconds * NS_PER_SEC + nanoseconds) / NS_PER_MS),
  };
};

const createPlugin = ({ options }: TPluginOptions = { options: undefined }) => {
  const allDefaultedOptions = merge(
    createMetricTypes.defaultOptions,
    createRequestRecorder.defaultOptions,
    defaultNormalizers,
    {
      labels: ['operation_name'],
    },
    options
  );

  const graphQlParsingTimeHistogram = new Prometheus.Histogram({
    name: `${allDefaultedOptions.metricPrefix}graphql_parsing_duration_milliseconds`,
    help: 'The GraphQL request parsing time in milliseconds.',
    buckets: [0.5, 0.9, 0.95, 0.98, 0.99],
    labelNames: ['operation_name'],
  });

  const shouldSkipMetricsByEnvironment =
    allDefaultedOptions.detectKubernetes && !isRunningInKubernetes();

  const metricTypes: TMetricTypes = createMetricTypes(allDefaultedOptions);
  const observeGc = createGcObserver(metricTypes);

  recordRequest = createRequestRecorder(metricTypes, allDefaultedOptions);
  upMetric = metricTypes?.up;

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
        async parsingDidStart(requestContext) {
          const parsingStart = process.hrtime();

          return async () => {
            const { durationMs } = endMeasurementFrom(parsingStart);
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

            graphQlParsingTimeHistogram.observe(labels, durationMs);
          };
        },

        async willSendResponse(requestContext) {
          const requestContentLength =
            requestContext.request.http?.headers.get('content-length') ?? 0;
          const responseContentLength =
            requestContext.response.http?.headers.get('content-length') ?? 0;

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

          if (!shouldSkipByRequest && !shouldSkipMetricsByEnvironment) {
            recordRequest(requestStart, {
              labels,
              requestContentLength,
              responseContentLength,
            });
          }
        },
      };
    },
  };

  return plugin;
};

export { createPlugin, getRequestRecorder, signalIsUp, signalIsNotUp };
