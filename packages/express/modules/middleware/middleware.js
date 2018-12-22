const merge = require('merge-options');
const {
  Prometheus,
  createMetricTypes,
  createRequestObserver,
  createGcObserver,
  defaultNormalizers,
} = require('@promster/metrics');

const exposeOnLocals = (app, { key, value }) => {
  if (app && app.locals) app.locals[key] = value;
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

  exposeOnLocals(app, { key: 'Prometheus', value: Prometheus });
  exposeOnLocals(app, { key: 'observeRequest', value: observeRequest });

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
exports.exposeOnLocals = exposeOnLocals;
exports.extractPath = extractPath;
