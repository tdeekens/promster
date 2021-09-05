import type {
  TDefaultedPromsterOptions,
  TPromsterOptions,
  TMetricTypes,
  TLabelValues,
} from '@promster/types';
import type { TRequestRecorder } from '@promster/metrics';

import merge from 'merge-options';
import { HttpRequest, HttpResponse } from '@marblejs/core';
import { fromEvent, Observable } from 'rxjs';
import { tap, map, take, mapTo } from 'rxjs/operators';
import {
  createMetricTypes,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  isRunningInKubernetes,
} from '@promster/metrics';

const extractPath = (req: HttpRequest): string => req.originalUrl || req.url;

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

type TRecordHandlerOps = TDefaultedPromsterOptions & {
  skip: (req: HttpRequest, res: HttpResponse, labels: TLabelValues) => boolean;
};
type TStamp = {
  req: HttpRequest;
  start: [number, number];
};

const recordHandler =
  (
    res: HttpResponse,
    shouldSkipMetricsByEnvironment: boolean,
    opts: TRecordHandlerOps
  ) =>
  (stamp: TStamp) =>
    fromEvent(res, 'finish')
      .pipe(
        take(1),
        mapTo(stamp.req),
        map((req) => ({ req, res }))
      )
      .subscribe(() => {
        const { req, start } = stamp;
        const labels = Object.assign(
          {},
          {
            method: opts.normalizeMethod(req.method),
            status_code: opts.normalizeStatusCode(res.statusCode),
            path: opts.normalizePath(extractPath(req)),
          },
          opts.getLabelValues?.(req, res)
        );

        const shouldSkipByRequest = opts.skip?.(req, res, labels);

        const responseContentLength = Number(res.getHeader('content-length'));
        const requestContentLength = Number(req.headers['content-length']);

        if (!shouldSkipByRequest && !shouldSkipMetricsByEnvironment) {
          recordRequest(start, {
            labels,
            requestContentLength,
            responseContentLength,
          });
        }
      });

type TMiddlewareOptions = {
  options?: TPromsterOptions;
};
const createMiddleware = ({ options }: TMiddlewareOptions = {}) => {
  const defaultedOptions: TDefaultedPromsterOptions = merge(
    createMetricTypes.defaultOptions,
    createRequestRecorder.defaultOptions,
    defaultNormalizers,
    options
  );

  const metricTypes: TMetricTypes = createMetricTypes(defaultedOptions);
  const observeGc = createGcObserver(metricTypes);
  const shouldSkipMetricsByEnvironment =
    defaultedOptions.detectKubernetes && !isRunningInKubernetes();

  recordRequest = createRequestRecorder(metricTypes, defaultedOptions);
  upMetric = metricTypes?.up;

  if (!shouldSkipMetricsByEnvironment) {
    observeGc();
  }

  function middleware(req$: Observable<HttpRequest>, res: HttpResponse) {
    return req$.pipe(
      map((req) => ({ req, start: process.hrtime() })),
      tap(recordHandler(res, shouldSkipMetricsByEnvironment, defaultedOptions)),
      map(({ req }) => req)
    );
  }

  return middleware;
};

export {
  createMiddleware,
  extractPath,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
};
