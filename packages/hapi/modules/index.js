const { version } = require('../package.json');
const {
  createPlugin,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
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
exports.signalIsUp = signalIsUp;
exports.signalIsNotUp = signalIsNotUp;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
exports.Prometheus = Prometheus;
exports.defaultRegister = defaultRegister;
exports.defaultNormalizers = defaultNormalizers;
