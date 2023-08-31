import {
  type TDefaultedPromsterOptions,
  type TOptionalPromsterOptions,
  type THttpMetrics,
  type TGcMetrics,
  type TLabelValues,
} from '@promster/types';
import { type TRequestRecorder, type TPromsterTiming } from '@promster/metrics';
import merge from 'merge-options';
import { type HttpRequest, type HttpResponse } from '@marblejs/http';
import { fromEvent, type Observable } from 'rxjs';
import { tap, map, take, mapTo } from 'rxjs/operators';
import {
  createHttpMetrics,
  createGcMetrics,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  skipMetricsInEnvironment,
  timing,
} from '@promster/metrics';

const extractPath = (req: HttpRequest): string => req.originalUrl || req.url;

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

type TSkipFunction = (
  _req: HttpRequest,
  _res: HttpResponse,
  _labels: TLabelValues
) => boolean;
type THandlerOptions = TDefaultedPromsterOptions & {
  skip?: TSkipFunction;
};
type TStamp = {
  req: HttpRequest;
  timing: TPromsterTiming;
};

const recordHandler =
  (
    res: HttpResponse,
    shouldSkipMetricsByEnvironment: boolean,
    opts: THandlerOptions
  ) =>
  (stamp: TStamp) =>
    fromEvent(res, 'finish')
      .pipe(
        take(1),
        mapTo(stamp.req),
        map((req) => ({ req, res }))
      )
      .subscribe(() => {
        const { req, timing } = stamp;
        const labels = Object.assign(
          {},
          {
            method: opts.normalizeMethod(req.method, { res, req }),
            // eslint-disable-next-line camelcase
            status_code: opts.normalizeStatusCode(res.statusCode, { res, req }),
            path: opts.normalizePath(extractPath(req), { res, req }),
          },
          opts.getLabelValues?.(req, res)
        );

        const shouldSkipByRequest = opts.skip?.(req, res, labels);

        const responseContentLength = Number(
          res.getHeader('content-length') ?? 0
        );
        const requestContentLength = Number(req.headers['content-length'] ?? 0);

        if (!shouldSkipByRequest && !shouldSkipMetricsByEnvironment) {
          recordRequest(timing, {
            labels,
            requestContentLength,
            responseContentLength,
          });
        }
      });

export type TPromsterOptions = {
  options?: TOptionalPromsterOptions & { skip?: TSkipFunction };
};
const createMiddleware = ({ options }: TPromsterOptions = {}) => {
  const allDefaultedOptions: TDefaultedPromsterOptions = merge(
    createHttpMetrics.defaultOptions,
    createGcMetrics.defaultOptions,
    createRequestRecorder.defaultOptions,
    // @ts-expect-error
    createGcObserver.defaultOptions,
    defaultNormalizers,
    options
  );

  const httpMetrics: THttpMetrics = createHttpMetrics(allDefaultedOptions);
  const gcMetrics: TGcMetrics = createGcMetrics(allDefaultedOptions);

  const observeGc = createGcObserver(gcMetrics, allDefaultedOptions);
  const shouldSkipMetricsByEnvironment =
    skipMetricsInEnvironment(allDefaultedOptions);

  recordRequest = createRequestRecorder(httpMetrics, allDefaultedOptions);
  upMetric = gcMetrics?.up;

  if (!shouldSkipMetricsByEnvironment) {
    observeGc();
  }

  function middleware(req$: Observable<HttpRequest>, res: HttpResponse) {
    return req$.pipe(
      map((req) => ({ req, timing: timing.start() })),
      tap(
        recordHandler(res, shouldSkipMetricsByEnvironment, allDefaultedOptions)
      ),
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
