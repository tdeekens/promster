const Prometheus = require('prom-client');

const collectDefaultMetrics = Prometheus.collectDefaultMetrics;
// NOTE: This is the `globalRegistry` provided by the `prom-client`
//       We could create multiple registries with `new Prometheus.registry()`.
const defaultRegister = Prometheus.register;

collectDefaultMetrics();

exports.default = Prometheus;
exports.defaultRegister = defaultRegister;
