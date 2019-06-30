const fastifyPlugin = require('fastify-plugin');
const merge = require('merge-options');
const {
  Prometheus,
  createMetricTypes,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
} = require('@promster/metrics');
const pkg = require('../../package.json');

let recordRequest;
let upMetric;

const extractPath = req => req.raw.originalUrl || req.raw.url;
const getRequestRecorder = () => recordRequest;
const signalIsUp = () => upMetric && upMetric.set(1);
const signalIsNotUp = () => upMetric && upMetric.set(0);

const createPlugin = async (fastify, options) => {
  const defaultedOptions = merge(
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

  fastify.decorate('Prometheus', Prometheus);
  fastify.decorate('recordRequest', recordRequest);
  fastify.decorateRequest('__promsterStartTime__', null);

  fastify.addHook('onRequest', async (req, _) => {
    req.__promsterStartTime__ = process.hrtime();
  });

  fastify.addHook('onResponse', async (req, reply) => {
    recordRequest(req.__promsterStartTime__, {
      labels: {
        method: defaultedOptions.normalizeMethod(req.raw.method),
        // eslint-disable-next-line camelcase
        status_code: defaultedOptions.normalizeStatusCode(reply.res.statusCode),
        path: defaultedOptions.normalizePath(extractPath(req)),
        ...(defaultedOptions.getLabelValues &&
          defaultedOptions.getLabelValues(req, reply)),
      },
    });
  });
};

module.exports.default = fastifyPlugin(createPlugin, {
  fastify: '>= 1.6.0',
  name: pkg.name,
});
module.exports.getRequestRecorder = getRequestRecorder;
module.exports.signalIsUp = signalIsUp;
module.exports.signalIsNotUp = signalIsNotUp;
module.exports.extractPath = extractPath;
