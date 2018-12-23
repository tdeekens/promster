const { version } = require('../package.json');
const { createMiddleware, getRequestRecorder } = require('./middleware');
const {
  getSummary,
  getContentType,
  Prometheus,
  defaultRegister,
  defaultNormalizers,
} = require('@promster/metrics');

exports.version = version;
exports.createMiddleware = createMiddleware;
exports.getRequestRecorder = getRequestRecorder;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
exports.Prometheus = Prometheus;
exports.defaultRegister = defaultRegister;
exports.defaultNormalizers = defaultNormalizers;
