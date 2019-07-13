const semver = require('semver');
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

const getAreServerEventsSupported = actualVersion =>
  Boolean(actualVersion && semver.satisfies(actualVersion, '>= 17.0.0'));
const getDoesResponseNeedInvocation = actualVersion =>
  Boolean(actualVersion && semver.satisfies(actualVersion, '< 17.0.0'));

const createPlugin = ({ options: pluginOptions } = {}) => {
  const defaultedOptions = merge(
    createMetricTypes.defaultedOptions,
    createRequestRecorder.defaultedOptions,
    defaultNormalizers,
    pluginOptions
  );

  const metricTypes = createMetricTypes(defaultedOptions);
  const observeGc = createGcObserver(metricTypes);

  recordRequest = createRequestRecorder(metricTypes, defaultedOptions);
  upMetric = metricTypes && metricTypes.up;

  observeGc();

  const plugin = {
    name: pkg.name,
    version: pkg.version,
    register(server, registrationOptions, onRegistrationFinished = () => null) {
      const areServerEventsSupported = getAreServerEventsSupported(
        server.version
      );
      const doesResponseNeedInvocation = getDoesResponseNeedInvocation(
        server.version
      );
      const onRequestHandler = (request, reply) => {
        request.plugins.promster = { start: process.hrtime() };
        return doesResponseNeedInvocation ? reply.continue() : reply.continue;
      };

      const onResponseHandler = (request, response) => {
        const labels = Object.assign(
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
        );

        if (
          defaultedOptions.skip &&
          defaultedOptions.skip(request, response, labels)
        )
          return;

        recordRequest(request.plugins.promster.start, {
          labels,
        });

        if (doesResponseNeedInvocation) response.continue();
      };

      // NOTE: This version detection allows us to graceully support
      // both new and old Hapi APIs.
      if (areServerEventsSupported) {
        server.ext('onRequest', onRequestHandler);
        server.events.on('response', onResponseHandler);
      } else {
        server.ext('onRequest', onRequestHandler);
        server.ext('onPreResponse', onResponseHandler);
      }

      server.decorate('server', 'Prometheus', Prometheus);
      server.decorate('server', 'recordRequest', recordRequest);

      return onRegistrationFinished && onRegistrationFinished();
    },
  };

  plugin.register.attributes = {
    pkg,
  };

  return plugin;
};

exports.default = createPlugin;
exports.getRequestRecorder = getRequestRecorder;
exports.signalIsUp = signalIsUp;
exports.signalIsNotUp = signalIsNotUp;
exports.getAreServerEventsSupported = getAreServerEventsSupported;
exports.getDoesResponseNeedInvocation = getDoesResponseNeedInvocation;
