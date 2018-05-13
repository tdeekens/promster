const {
  Prometheus,
  createObserver,
  normalizePath,
  normalizeStatusCode,
  normalizeMethod,
} = require('@promster/metrics');

const exposePrometheusOnLocals = app =>
  app ? (app.locals.Prometheus = Prometheus) : null;
const extractPath = req =>
  (req.route ? req.route.path : req.path).replace(/\?/g, '');

const createMiddleware = (
  app,
  options = {
    labels: [],
    getLabelValues: () => ({}),
    normalizePath,
    normalizeStatusCode,
    normalizeMethod,
  }
) => {
  const observe = createObserver(options);

  exposePrometheusOnLocals(app);

  function middleware(req, res, next) {
    const start = process.hrtime();
    res.on('finish', () => {
      observe(start, {
        labels: Object.assign(
          {},
          {
            method: options.normalizeMethod(req.method),
            status_code: options.normalizeStatusCode(res.statusCode),
            path: options.normalizePath(extractPath(req)),
          },
          getLabelValues(req, res)
        ),
      });
    });

    return next();
  }

  return middleware;
};

exports.default = createMiddleware;
