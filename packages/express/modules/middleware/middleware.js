const merge = require('merge-options');
const {
  Prometheus,
  createMetricTypes,
  createRequestObserver,
  createGcObserver,
  defaultNormalizers,
} = require('@promster/metrics');

const exposePrometheusOnLocals = app => {
  if (app && app.locals) app.locals.Prometheus = Prometheus;
};
const extractPath = req => req.originalUrl || req.url;

const createMiddleware = ({ app, options } = {}) => {
  let defaultedOptions = merge(
    createMetricTypes.defaultedOptions,
    createRequestObserver.defaultedOptions,
    defaultNormalizers,
    options
  );

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
          defaultedOptions.getLabelValues &&
            defaultedOptions.getLabelValues(req, res)
        ),
      });
    });

    return next();
  }

  return middleware;
};

exports.default = createMiddleware;
exports.exposePrometheusOnLocals = exposePrometheusOnLocals;
exports.extractPath = extractPath;
