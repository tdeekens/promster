const { version } = require('../package.json');
const {
  createMiddleware,
  getRequestRecorder,
  setIsUp,
  setIsNotUp,
} = require('./middleware');
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
exports.setIsUp = setIsUp;
exports.setIsNotUp = setIsNotUp;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
exports.Prometheus = Prometheus;
exports.defaultRegister = defaultRegister;
exports.defaultNormalizers = defaultNormalizers;
