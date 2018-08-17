const pkg = require('../../package.json');
const {
  Prometheus,
  createMetricTypes,
  createRequestObserver,
  createGcObserver,
  normalizePath: defaultNormalizePath,
  normalizeStatusCode: defaultNormalizeStatusCode,
  normalizeMethod: defaultNormalizeMethod,
} = require('@promster/metrics');

const extractPath = req => req.route.path.replace(/\?/g, '');
const extractStatusCode = req => (req.response ? req.response.statusCode : '');

const createPlugin = ({ options } = {}) => {
  let defaultedOptions = {
    labels: [],
    accuracies: ['s'],
    getLabelValues: () => ({}),
    normalizePath: defaultNormalizePath,
    normalizeStatusCode: defaultNormalizeStatusCode,
    normalizeMethod: defaultNormalizeMethod,
    ...options,
  };

  const metricTypes = createMetricTypes(defaultedOptions);
  const observeRequest = createRequestObserver(metricTypes, defaultedOptions);
  const observeGc = createGcObserver(metricTypes);

  observeGc();

  const plugin = {
    name: pkg.name,
    version: pkg.version,
    register(server) {
      server.events.on('request', (request, h) => {
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
            defaultedOptions.getLabelValues(request, {})
          ),
        });
      });

      server.decorate('server', 'Prometheus', Prometheus);
    },
  };

  return plugin;
};

exports.default = createPlugin;
