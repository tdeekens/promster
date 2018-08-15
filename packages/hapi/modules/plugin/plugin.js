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
    register(server, options, next) {
      server.ext('onRequest', (request, reply) => {
        request.promster = { start: process.hrtime() };
        return reply.continue();
      });

      server.on('response', req => {
        observeRequest(req.promster.start, {
          labels: Object.assign(
            {},
            {
              path: defaultedOptions.normalizePath(extractPath(req)),
              method: defaultedOptions.normalizeMethod(req.method),
              // eslint-disable-next-line camelcase
              status_code: defaultedOptions.normalizeStatusCode(
                extractStatusCode(req)
              ),
            },
            options.getLabelValues(req, {})
          ),
        });
      });

      server.decorate('server', 'Prometheus', Prometheus);

      return next();
    },
  };

  plugin.register.attributes = {
    name: pkg.name,
    version: pkg.version,
  };

  return plugin;
};

exports.default = createPlugin;
