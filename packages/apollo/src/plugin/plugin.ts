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
const createPlugin = ({ options }: TPluginOptions = { options: undefined }) => {
  const allDefaultedOptions = merge(
    createMetricTypes.defaultOptions,
    createRequestRecorder.defaultOptions,
    defaultNormalizers,
    options
  );

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
      const start = process.hrtime();

      return {
        async willSendResponse(requestContext) {
          const requestContentLength =
            requestContext.request.http?.headers.get('content-length') ?? 0;
          const responseContentLength =
            requestContext.response.http?.headers.get('content-length') ?? 0;

          const labels = Object.assign(
            {},
            {},
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

          recordRequest(start, {
            labels,
            requestContentLength,
            responseContentLength,
          });
        },
      };
    },
  };

  return;
};

export { createPlugin, getRequestRecorder, signalIsUp, signalIsNotUp };
