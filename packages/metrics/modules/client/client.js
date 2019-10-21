const Prometheus = require('prom-client');

// NOTE:
//   This is the `globalRegistry` provided by the `prom-client`
//   We could create multiple registries with `new Prometheus.registry()`.
const defaultRegister = Prometheus.register;

const configure = options => {
  Prometheus.collectDefaultMetrics(options);
};

exports.default = Prometheus;
exports.defaultRegister = defaultRegister;
exports.configure = configure;
