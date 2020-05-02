import merge from 'merge-options';
import { fromEvent } from 'rxjs';
import { tap, map, take, mapTo } from 'rxjs/operators';
import {
  createMetricTypes,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  isRunningInKubernetes,
} from '@promster/metrics';

const extractPath = (req) => req.originalUrl || req.url;

let recordRequest;
let upMetric;
const getRequestRecorder = () => recordRequest;
const signalIsUp = () =>
  upMetric && upMetric.forEach((upMetricType) => upMetricType.set(1));
const signalIsNotUp = () =>
  upMetric && upMetric.forEach((upMetricType) => upMetricType.set(0));

const recordHandler = (res, opts) => (stamp) =>
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
          // eslint-disable-next-line camelcase
          status_code: opts.normalizeStatusCode(res.statusCode),
          path: opts.normalizePath(extractPath(req)),
        },
        opts.getLabelValues && opts.getLabelValues(req, res)
      );

      const shouldSkipByRequest = opts.skip && opts.skip(req, res, labels);

      if (!shouldSkipByRequest && !opts.shouldSkipMetricsByEnvironment) {
        recordRequest(start, {
          labels,
        });
      }
    });

const createMiddleware = ({ options } = {}) => {
  const defaultedOptions = merge(
    createMetricTypes.defaultOptions,
    createRequestRecorder.defaultOptions,
    defaultNormalizers,
    options,
    {
      shouldSkipMetricsByEnvironment:
        options &&
        options.detectKubernetes === true &&
        isRunningInKubernetes() === false,
    }
  );

  const metricTypes = createMetricTypes(defaultedOptions);
  const observeGc = createGcObserver(metricTypes);

  recordRequest = createRequestRecorder(metricTypes, defaultedOptions);
  upMetric = metricTypes && metricTypes.up;

  if (!defaultedOptions.shouldSkipMetricsByEnvironment) {
    observeGc();
  }

  function middleware(req$, res) {
    return req$.pipe(
      map((req) => ({ req, start: process.hrtime() })),
      tap(recordHandler(res, defaultedOptions)),
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
