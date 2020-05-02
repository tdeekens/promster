const merge = require('merge-options');
const {
  Prometheus,
  createMetricTypes,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  isRunningInKubernetes,
} = require('@promster/metrics');

const exposeOnLocals = (app, { key, value }) => {
  if (app && app.locals) app.locals[key] = value;
};

const extractPath = (req) => req.originalUrl || req.url;

let recordRequest;
let upMetric;
const getRequestRecorder = () => recordRequest;
const signalIsUp = () =>
  upMetric && upMetric.forEach((upMetricType) => upMetricType.set(1));
const signalIsNotUp = () =>
  upMetric && upMetric.forEach((upMetricType) => upMetricType.set(0));

const createMiddleware = ({ app, options } = {}) => {
  const allDefaultedOptions = merge(
    createMetricTypes.defaultOptions,
    createRequestRecorder.defaultOptions,
    defaultNormalizers,
    options
  );

  const shouldSkipMetricsByEnvironment =
    allDefaultedOptions.detectKubernetes === true &&
    isRunningInKubernetes() === false;

  const metricTypes = createMetricTypes(allDefaultedOptions);
  const observeGc = createGcObserver(metricTypes);

  recordRequest = createRequestRecorder(metricTypes, allDefaultedOptions);
  upMetric = metricTypes && metricTypes.up;

  exposeOnLocals(app, { key: 'Prometheus', value: Prometheus });
  exposeOnLocals(app, { key: 'recordRequest', value: recordRequest });

  if (!shouldSkipMetricsByEnvironment) {
    observeGc();
  }

  return (request, response, next) => {
    const start = process.hrtime();
    response.on('finish', () => {
      const labels = Object.assign(
        {},
        {
          method: allDefaultedOptions.normalizeMethod(request.method, {
            req: request,
            res: response,
          }),
          // eslint-disable-next-line camelcase
          status_code: allDefaultedOptions.normalizeStatusCode(
            response.statusCode,
            { req: request, res: response }
          ),
          path: allDefaultedOptions.normalizePath(extractPath(request), {
            req: request,
            res: response,
          }),
        },
        allDefaultedOptions.getLabelValues &&
          allDefaultedOptions.getLabelValues(request, response)
      );

      const shouldSkipByRequest =
        allDefaultedOptions.skip &&
        allDefaultedOptions.skip(request, response, labels);

      if (!shouldSkipByRequest && !shouldSkipMetricsByEnvironment) {
        recordRequest(start, {
          labels,
        });
      }
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
