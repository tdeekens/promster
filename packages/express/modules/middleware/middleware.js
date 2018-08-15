const {
  Prometheus,
  createMetricTypes,
  createRequestObserver,
  createGcObserver,
  normalizePath: defaultNormalizePath,
  normalizeStatusCode: defaultNormalizeStatusCode,
  normalizeMethod: defaultNormalizeMethod,
} = require('@promster/metrics');

const exposePrometheusOnLocals = app => {
  if (app && app.locals) app.locals.Prometheus = Prometheus;
};
const extractPath = req => req.originalUrl || req.url;

const createMiddleware = ({ app, options } = {}) => {
  // NOTE: we need to "spread-default" options as
  // defaulting in argument position will not shallowly merge.
  let defaultedOptions = {
    labels: [],
    accuracies: ['s'],
    getLabelValues: () => ({}),
    normalizePath: defaultNormalizePath,
    normalizeStatusCode: defaultNormalizeStatusCode,
    normalizeMethod: defaultNormalizeMethod,
    ...options,
  };
  const metricTypes = createMetricTypes(defaultedOptions);
  const observeRequest = createRequestObserver(metricTypes, defaultedOptions);
  const observeGc = createGcObserver(metricTypes);

  exposePrometheusOnLocals(app);
  observeGc();

  function middleware(req, res, next) {
    const start = process.hrtime();
    res.on('finish', () => {
      observeRequest(start, {
        labels: Object.assign(
          {},
          {
            method: defaultedOptions.normalizeMethod(req.method),
            // eslint-disable-next-line camelcase
            status_code: defaultedOptions.normalizeStatusCode(res.statusCode),
            path: defaultedOptions.normalizePath(extractPath(req)),
          },
          defaultedOptions.getLabelValues(req, res)
        ),
      });
    });

    return next();
  }

  return middleware;
};

exports.default = createMiddleware;
