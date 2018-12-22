const merge = require('merge-options');
const pkg = require('../../package.json');
const {
  Prometheus,
  createMetricTypes,
  createRequestObserver,
  createGcObserver,
  defaultNormalizers,
} = require('@promster/metrics');

const extractPath = request => request.route.path.replace(/\?/g, '');
const extractStatusCode = request =>
  request.response ? request.response.statusCode : '';

const createPlugin = ({ options } = {}) => {
  let defaultedOptions = merge(
    createMetricTypes.defaultedOptions,
    createRequestObserver.defaultedOptions,
    defaultNormalizers,
    options
  );

  const metricTypes = createMetricTypes(defaultedOptions);
  const observeRequest = createRequestObserver(metricTypes, defaultedOptions);
  const observeGc = createGcObserver(metricTypes);
  observeGc();

  const plugin = {
    name: pkg.name,
    version: pkg.version,
    register(server) {
      server.ext('onRequest', (request, h) => {
        request.promster = { start: process.hrtime() };
        return h.continue;
      });

      server.events.on('response', request => {
        observeRequest(request.promster.start, {
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
      });

      server.decorate('server', 'Prometheus', Prometheus);
      server.decorate('server', 'observeRequest', observeRequest);
    },
  };

  return plugin;
};

exports.default = createPlugin;
