const { version } = require('../package.json');
const {
  promsterPlugin,
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
exports.promsterPlugin = promsterPlugin;
exports.getRequestRecorder = getRequestRecorder;
exports.signalIsUp = signalIsUp;
exports.signalIsNotUp = signalIsNotUp;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
exports.Prometheus = Prometheus;
exports.defaultRegister = defaultRegister;
exports.defaultNormalizers = defaultNormalizers;
