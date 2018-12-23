const { version } = require('../package.json');
const { createMiddleware, getRequestObserver } = require('./middleware');
const {
  getSummary,
  getContentType,
  Prometheus,
  defaultRegister,
  defaultNormalizers,
} = require('@promster/metrics');

exports.version = version;
exports.createMiddleware = createMiddleware;
exports.getRequestObserver = getRequestObserver;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
exports.Prometheus = Prometheus;
exports.defaultRegister = defaultRegister;
exports.defaultNormalizers = defaultNormalizers;
