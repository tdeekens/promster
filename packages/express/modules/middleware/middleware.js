const {
  Prometheus,
  createObserver,
  normalizePath,
  normalizeStatusCode,
  normalizeMethod,
} = require('@promster/metrics');

const exposePrometheusOnLocals = app => {
  if (app && app.locals) app.locals.Prometheus = Prometheus;
};
const extractPath = req => req.originalUrl || req.url;

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
          options.getLabelValues(req, res)
        ),
      });
    });

    return next();
  }

  return middleware;
};

exports.default = createMiddleware;
