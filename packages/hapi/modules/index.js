const { version } = require('../package.json');
const {
  createPlugin,
  getRequestRecorder,
  setIsUp,
  setIsNotUp,
} = require('./plugin');
const {
  getSummary,
  getContentType,
  Prometheus,
  defaultRegister,
  defaultNormalizers,
} = require('@promster/metrics');

exports.version = version;
exports.createPlugin = createPlugin;
exports.getRequestRecorder = getRequestRecorder;
exports.setIsUp = setIsUp;
exports.setIsNotUp = setIsNotUp;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
exports.Prometheus = Prometheus;
exports.defaultRegister = defaultRegister;
exports.defaultNormalizers = defaultNormalizers;
