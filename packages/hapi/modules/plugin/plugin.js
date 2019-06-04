const semiver = require('semiver');
const merge = require('merge-options');
const pkg = require('../../package.json');
const {
  Prometheus,
  createMetricTypes,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
} = require('@promster/metrics');

const extractPath = request => request.route.path.replace(/\?/g, '');
const extractStatusCode = request =>
  request.response ? request.response.statusCode : '';

let recordRequest;
let upMetric;
const getRequestRecorder = () => recordRequest;
const signalIsUp = () => upMetric && upMetric.set(1);
const signalIsNotUp = () => upMetric && upMetric.set(0);

const createPlugin = ({ options } = {}) => {
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

  observeGc();

  const plugin = {
    name: pkg.name,
    version: pkg.version,
    register(server, options, done) {
      const areServerEventsSupported = Boolean(
        server.version && semiver(server.version, '17.0.x')
      );
      const onRequestHandler = (request, h) => {
        request.promster = { start: process.hrtime() };
        return h.continue;
      };

      const onResponseHandler = request => {
        recordRequest(request.promster.start, {
          labels: Object.assign(
            {},
            {
              path: defaultedOptions.normalizePath(extractPath(request)),
              method: defaultedOptions.normalizeMethod(request.method),
              // eslint-disable-next-line camelcase
              status_code: defaultedOptions.normalizeStatusCode(
                extractStatusCode(request)
              ),
            },
            defaultedOptions.getLabelValues &&
              defaultedOptions.getLabelValues(request, {})
          ),
        });
      };

      // NOTE: This version detection allows us to graceully support
      // both new and old Hapi APIs.
      if (areServerEventsSupported) {
        server.events.on('request', onRequestHandler);
        server.events.on('response', onResponseHandler);
      } else {
        server.ext('onRequest', onRequestHandler);
        server.ext('onPreResponse', onResponseHandler);
      }

      server.decorate('server', 'Prometheus', Prometheus);
      server.decorate('server', 'recordRequest', recordRequest);

      return done();
    },
  };

  plugin.register.attributes = {
    pkg: pkg,
  };

  return plugin;
};

exports.default = createPlugin;
exports.getRequestRecorder = getRequestRecorder;
exports.signalIsUp = signalIsUp;
exports.signalIsNotUp = signalIsNotUp;
