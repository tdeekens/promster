const once = require('lodash.once');
const Prometheus = require('prom-client');
const { isRunningInKubernetes } = require('../kubernetes');

// NOTE:
//   This is the `globalRegistry` provided by the `prom-client`
//   We could create multiple registries with `new Prometheus.registry()`.
const defaultRegister = Prometheus.register;

const configure = once(options => {
  const shouldSkipMetricsByEnvironment =
    options.detectKubernetes === true && isRunningInKubernetes() === false;

  if (!shouldSkipMetricsByEnvironment) {
    Prometheus.collectDefaultMetrics(options);
  }
});

exports.default = Prometheus;
exports.defaultRegister = defaultRegister;
exports.configure = configure;
