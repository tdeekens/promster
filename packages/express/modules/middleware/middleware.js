const { Prometheus, observe } = require('@promster/metrics');

const attachToAppLocals = app =>
  app ? (app.locals.Prometheus = Prometheus) : null;

const createMiddleware = (app, options) => {
  attachToAppLocals(app);

  function middleware(req, res, next) {
    const start = process.hrtime();
    res.on('finish', () => {
      observe(start, {
        labels: {
          route: (req.route ? req.route.path : req.path).replace(/\?/g, ''),
          code: res.statusCode,
          method: req.method.toLowerCase(),
        },
      });
    });

    return next();
  }

  return middleware;
};

exports.default = createMiddleware;
