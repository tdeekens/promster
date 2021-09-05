import type { TPromsterOptions, TMetricTypes } from '@promster/types';
import type { TRequestRecorder } from '@promster/metrics';
import { Application, Request, Response, NextFunction } from 'express';

import merge from 'merge-options';
import {
  Prometheus,
  createMetricTypes,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  isRunningInKubernetes,
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

const extractPath = (req: Request) => req.originalUrl || req.url;

let recordRequest: TRequestRecorder;
let upMetric: TMetricTypes['up'];

const getRequestRecorder = () => recordRequest;
const signalIsUp = () => {
  if (!upMetric) {
    return;
  }

  upMetric.forEach(upMetricType => {
    upMetricType.set(1);
  });
};

const signalIsNotUp = () => {
  if (!upMetric) {
    return;
  }

  upMetric.forEach(upMetricType => {
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
  const allDefaultedOptions = merge(
    createMetricTypes.defaultOptions,
    createRequestRecorder.defaultOptions,
    defaultNormalizers,
    options
  );

  const shouldSkipMetricsByEnvironment =
    allDefaultedOptions.detectKubernetes === true && !isRunningInKubernetes();

  const metricTypes: TMetricTypes = createMetricTypes(allDefaultedOptions);
  const observeGc = createGcObserver(metricTypes);

  recordRequest = createRequestRecorder(metricTypes, allDefaultedOptions);
  upMetric = metricTypes?.up;

  exposeOnLocals({ app, key: 'Prometheus', value: Prometheus });
  exposeOnLocals({ app, key: 'recordRequest', value: recordRequest });

  if (!shouldSkipMetricsByEnvironment) {
    observeGc();
  }

  return (request: Request, response: Response, next: NextFunction) => {
    const start = process.hrtime();
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

      const requestContentLength = Number(request.headers['content-length']);
      const responseContentLength = Number(
        response.getHeader('content-length')
      );

      if (!shouldSkipByRequest && !shouldSkipMetricsByEnvironment) {
        recordRequest(start, {
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
