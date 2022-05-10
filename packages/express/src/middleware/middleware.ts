import type {
  TPromsterOptions,
  THttpMetrics,
  TGcMetrics,
  TDefaultedPromsterOptions,
} from '@promster/types';
import type { TRequestRecorder } from '@promster/metrics';
import { Application, Request, Response, NextFunction } from 'express';

import merge from 'merge-options';
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

interface TApp extends Application {
  locals: Record<string, unknown>;
}

type TLocaleTarget = {
  app?: TApp;
  key: string;
  value: typeof Prometheus | TRequestRecorder;
};
const exposeOnLocals = ({ app, key, value }: TLocaleTarget) => {
  if (app?.locals) app.locals[key] = value;
};

const extractPath = (req: Request) => req.route.path;

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

type TMiddlewareOptions = {
  app?: TApp;
  options?: TPromsterOptions;
};
const createMiddleware = (
  { app, options }: TMiddlewareOptions = { app: undefined, options: undefined }
) => {
  const allDefaultedOptions: TDefaultedPromsterOptions = merge(
    createHttpMetrics.defaultOptions,
    createGcMetrics.defaultOptions,
    createRequestRecorder.defaultOptions,
    createGcObserver.defaultOptions,
    defaultNormalizers,
    options
  );

  const shouldSkipMetricsByEnvironment =
    skipMetricsInEnvironment(allDefaultedOptions);

  const httpMetrics: THttpMetrics = createHttpMetrics(allDefaultedOptions);
  const gcMetrics: TGcMetrics = createGcMetrics(allDefaultedOptions);
  const observeGc = createGcObserver(gcMetrics, allDefaultedOptions);

  recordRequest = createRequestRecorder(httpMetrics, allDefaultedOptions);
  upMetric = gcMetrics?.up;

  exposeOnLocals({ app, key: 'Prometheus', value: Prometheus });
  exposeOnLocals({ app, key: 'recordRequest', value: recordRequest });

  if (!shouldSkipMetricsByEnvironment) {
    observeGc();
  }

  return (request: Request, response: Response, next: NextFunction) => {
    const requestTiming = timing.start();

    response.on('finish', () => {
      const labels = Object.assign(
        {},
        {
          method: allDefaultedOptions.normalizeMethod(request.method, {
            req: request,
            res: response,
          }),
          status_code: allDefaultedOptions.normalizeStatusCode(
            response.statusCode,
            { req: request, res: response }
          ),
          path: allDefaultedOptions.normalizePath(extractPath(request), {
            req: request,
            res: response,
          }),
        },
        allDefaultedOptions.getLabelValues?.(request, response)
      );

      const shouldSkipByRequest = allDefaultedOptions.skip?.(
        request,
        response,
        labels
      );

      const requestContentLength = Number(
        request.headers['content-length'] ?? 0
      );
      const responseContentLength = Number(
        response.getHeader('content-length') ?? 0
      );

      if (!shouldSkipByRequest && !shouldSkipMetricsByEnvironment) {
        recordRequest(requestTiming, {
          labels,
          requestContentLength,
          responseContentLength,
        });
      }
    });

    next();
  };
};

export {
  createMiddleware,
  exposeOnLocals,
  extractPath,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
};
