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
const signalIsUp = () =>
  upMetric && upMetric.forEach(upMetricType => upMetricType.set(1));
const signalIsNotUp = () =>
  upMetric && upMetric.forEach(upMetricType => upMetricType.set(0));

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

  return (request, response, next) => {
    const start = process.hrtime();
    response.on('finish', () => {
      const labels = Object.assign(
        {},
        {
          method: defaultedOptions.normalizeMethod(request.method, {
            req: request,
            res: response,
          }),
          // eslint-disable-next-line camelcase
          status_code: defaultedOptions.normalizeStatusCode(
            response.statusCode,
            { req: request, res: response }
          ),
          path: defaultedOptions.normalizePath(extractPath(request), {
            req: request,
            res: response,
          }),
        },
        defaultedOptions.getLabelValues &&
          defaultedOptions.getLabelValues(request, response)
      );

      if (
        defaultedOptions.skip &&
        defaultedOptions.skip(request, response, labels)
      )
        return;

      recordRequest(start, {
        labels,
      });
    });

    return next();
  };
};

exports.default = createMiddleware;
exports.exposeOnLocals = exposeOnLocals;
exports.extractPath = extractPath;
exports.getRequestRecorder = getRequestRecorder;
exports.signalIsUp = signalIsUp;
exports.signalIsNotUp = signalIsNotUp;
