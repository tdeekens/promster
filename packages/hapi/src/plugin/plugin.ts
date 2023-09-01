import {
  type TOptionalPromsterOptions,
  type TDefaultedPromsterOptions,
  type THttpMetrics,
  type TGcMetrics,
  type TLabelValues,
} from '@promster/types';
import { type TRequestRecorder, type TPromsterTiming } from '@promster/metrics';
import {
  type Plugin,
  type Request,
  type ResponseObject,
  type ResponseToolkit,
} from '@hapi/hapi';
import { type Boom } from '@hapi/boom';

import semver from 'semver';
import merge from 'merge-options';
// @ts-expect-error
import pkg from '../../package.json';
import {
  Prometheus,
  createHttpMetrics,
  createGcMetrics,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  skipMetricsInEnvironment,
  timing,
} from '@promster/metrics';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface TPromsterRequest extends Request {
  plugins: {
    promster: {
      timing: TPromsterTiming;
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

const getAreServerEventsSupported = (actualVersion: string) =>
  Boolean(actualVersion && semver.satisfies(actualVersion, '>= 17.0.0'));
const getDoesResponseNeedInvocation = (actualVersion: string) =>
  Boolean(actualVersion && semver.satisfies(actualVersion, '< 17.0.0'));

type TSkipFunction = <
  TRequest extends Request,
  TResponse extends ResponseObject,
>(
  _req: TRequest,
  _res: TResponse,
  _labels: TLabelValues
) => boolean;
export type TPromsterOptions = TOptionalPromsterOptions & {
  skip?: TSkipFunction;
};
const createPlugin = (
  {
    options: pluginOptions,
  }: {
    options?: TPromsterOptions;
  } = { options: undefined }
) => {
  const allDefaultedOptions: TDefaultedPromsterOptions & {
    skip?: TSkipFunction;
  } = merge(
    createHttpMetrics.defaultOptions,
    createGcMetrics.defaultOptions,
    createRequestRecorder.defaultOptions,
    // @ts-expect-error
    createGcObserver.defaultOptions,
    defaultNormalizers,
    pluginOptions
  );

  const shouldSkipMetricsByEnvironment =
    skipMetricsInEnvironment(allDefaultedOptions);

  const httpMetrics: THttpMetrics = createHttpMetrics(allDefaultedOptions);
  const gcMetrics: TGcMetrics = createGcMetrics(allDefaultedOptions);

  const observeGc = createGcObserver(gcMetrics, allDefaultedOptions);

  recordRequest = createRequestRecorder(httpMetrics, allDefaultedOptions);
  upMetric = gcMetrics?.up;

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
        request.plugins.promster = { timing: timing.start() };
        // @ts-expect-error
        return doesResponseNeedInvocation ? h.continue() : h.continue;
      };

      const onResponseHandler = (
        request: TPromsterRequest,
        response: ResponseObject
      ) => {
        const labels = Object.assign(
          {},
          {
            path: allDefaultedOptions.normalizePath(extractPath(request), {
              req: request,
              res: response,
            }),
            method: allDefaultedOptions.normalizeMethod(request.method, {
              req: request,
              res: response,
            }),
            // eslint-disable-next-line camelcase
            status_code: allDefaultedOptions.normalizeStatusCode(
              extractStatusCode(request),
              {
                req: request,
                res: response,
              }
            ),
          },
          allDefaultedOptions.getLabelValues?.(request, {})
        );

        const requestContentLength = Number(
          request?.headers?.['content-length'] ?? 0
        );
        const responseContentLength = Number(
          // @ts-expect-error
          request?.response?.headers?.['content-length'] ?? 0
        );

        const shouldSkipByRequest = allDefaultedOptions.skip?.(
          request,
          response,
          labels
        );

        if (!shouldSkipByRequest && !shouldSkipMetricsByEnvironment) {
          recordRequest(request.plugins.promster.timing, {
            labels,
            requestContentLength,
            responseContentLength,
          });
        }

        // @ts-expect-error - this is the older Hapi version
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
