import type {
  TPromsterOptions,
  TDefaultedPromsterOptions,
  TMetricTypes,
} from '@promster/types';
import type { TRequestRecorder } from '@promster/metrics';
import type {
  Plugin,
  Request,
  ResponseObject,
  ResponseToolkit,
} from '@hapi/hapi';
import type { Boom } from '@hapi/boom';

import semver from 'semver';
import merge from 'merge-options';
import pkg from '../../package.json';
import {
  Prometheus,
  createMetricTypes,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  skipMetricsInEnvironment,
} from '@promster/metrics';

interface TPromsterRequest extends Request {
  plugins: {
    promster: {
      start: [number, number];
    };
  };
}

const extractPath = (request: Request) => request.route.path.replace(/\?/g, '');

type TResponse = ResponseObject | Boom;
const isBoomResponse = (response: TResponse): response is Boom =>
  (response as Boom).isBoom;

const extractStatusCode = (request: Request) => {
  const { response } = request;

  if (!response) {
    return 0;
  }

  if (isBoomResponse(response)) {
    return response.output.statusCode;
  }

  return response.statusCode;
};

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

const getAreServerEventsSupported = (actualVersion: string) =>
  Boolean(actualVersion && semver.satisfies(actualVersion, '>= 17.0.0'));
const getDoesResponseNeedInvocation = (actualVersion: string) =>
  Boolean(actualVersion && semver.satisfies(actualVersion, '< 17.0.0'));

const createPlugin = (
  {
    options: pluginOptions,
  }: {
    options?: TPromsterOptions;
  } = { options: undefined }
) => {
  const defaultedOptions: TDefaultedPromsterOptions = merge(
    createMetricTypes.defaultOptions,
    createRequestRecorder.defaultOptions,
    defaultNormalizers,
    pluginOptions
  );

  const shouldSkipMetricsByEnvironment =
    skipMetricsInEnvironment(defaultedOptions);

  const metricTypes: TMetricTypes = createMetricTypes(defaultedOptions);
  const observeGc = createGcObserver(metricTypes);

  recordRequest = createRequestRecorder(metricTypes, defaultedOptions);
  upMetric = metricTypes?.up;

  if (!shouldSkipMetricsByEnvironment) {
    observeGc();
  }

  const plugin: Plugin<unknown> = {
    name: pkg.name,
    version: pkg.version,
    // @ts-expect-error
    register(
      server,
      _registrationOptions,
      onRegistrationFinished = () => null
    ) {
      const areServerEventsSupported = getAreServerEventsSupported(
        server.version
      );
      const doesResponseNeedInvocation = getDoesResponseNeedInvocation(
        server.version
      );
      const onRequestHandler = (
        request: TPromsterRequest,
        h: ResponseToolkit
      ) => {
        request.plugins.promster = { start: process.hrtime() };
        // @ts-expect-error
        return doesResponseNeedInvocation ? h.continue() : h.continue;
      };

      const onResponseHandler = (request: TPromsterRequest, response: any) => {
        const labels = Object.assign(
          {},
          {
            path: defaultedOptions.normalizePath(extractPath(request)),
            method: defaultedOptions.normalizeMethod(request.method),
            status_code: defaultedOptions.normalizeStatusCode(
              extractStatusCode(request)
            ),
          },
          defaultedOptions.getLabelValues?.(request, {})
        );

        const requestContentLength = Number(
          request?.headers?.['content-length'] ?? 0
        );
        const responseContentLength = Number(
          // @ts-expect-error
          request?.response?.headers?.['content-length'] ?? 0
        );

        const shouldSkipByRequest = defaultedOptions.skip?.(
          request,
          response,
          labels
        );

        if (!shouldSkipByRequest && !shouldSkipMetricsByEnvironment) {
          recordRequest(request.plugins.promster.start, {
            labels,
            requestContentLength,
            responseContentLength,
          });
        }

        if (doesResponseNeedInvocation) response.continue();
      };

      // NOTE: This version detection allows us to gracefully support both new and old Hapi APIs.
      // This is very hard to type as we would have to import two aliased versions of types.
      if (areServerEventsSupported) {
        // @ts-expect-error
        server.ext('onRequest', onRequestHandler);
        // @ts-expect-error
        server.events.on('response', onResponseHandler);
      } else {
        // @ts-expect-error
        server.ext('onRequest', onRequestHandler);
        // @ts-expect-error
        server.ext('onPreResponse', onResponseHandler);
      }

      // NOTE: The type of the server.decorate only supports a function signature,
      // even when the docs state that it can also be "other value" in the case of `server`.
      // @ts-expect-error
      server.decorate('server', 'Prometheus', Prometheus);
      server.decorate('server', 'recordRequest', recordRequest);

      return onRegistrationFinished?.();
    },
  };
  // @ts-expect-error
  plugin.register.attributes = {
    pkg,
  };

  return plugin;
};

export {
  createPlugin,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
  getAreServerEventsSupported,
  getDoesResponseNeedInvocation,
};
