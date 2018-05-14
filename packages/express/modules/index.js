const { version } = require('../package.json');
const { createMiddleware } = require('./middleware');
const {
  getSummary,
  getContentType,
  Prometheus,
  defaultRegister,
} = require('@promster/metrics');

exports.version = version;
exports.createMiddleware = createMiddleware;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
exports.Prometheus = Prometheus;
exports.defaultRegister = defaultRegister;
