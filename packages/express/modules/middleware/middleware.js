const merge = require('merge-options');
const {
  Prometheus,
  createMetricTypes,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
} = require('@promster/metrics');

const exposeOnLocals = (app, { key, value }) => {
  if (app && app.locals) app.locals[key] = value;
};

const extractPath = req => req.originalUrl || req.url;

let recordRequest;
let upMetric;
const getRequestRecorder = () => recordRequest;
const signalIsUp = () => upMetric && upMetric.set(1);
const signalIsNotUp = () => upMetric && upMetric.set(0);

const createMiddleware = ({ app, options } = {}) => {
  let defaultedOptions = merge(
    createMetricTypes.defaultedOptions,
    createRequestRecorder.defaultedOptions,
    defaultNormalizers,
    options
  );

  const metricTypes = createMetricTypes(defaultedOptions);
  const observeGc = createGcObserver(metricTypes);

  recordRequest = createRequestRecorder(metricTypes, defaultedOptions);
  upMetric = metricTypes && metricTypes.up;

  exposeOnLocals(app, { key: 'Prometheus', value: Prometheus });
  exposeOnLocals(app, { key: 'recordRequest', value: recordRequest });

  observeGc();

  function middleware(req, res, next) {
    const start = process.hrtime();
    res.on('finish', () => {
      recordRequest(start, {
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
exports.getRequestRecorder = getRequestRecorder;
exports.signalIsUp = signalIsUp;
exports.signalIsNotUp = signalIsNotUp;
