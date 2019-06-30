const {
  default: plugin,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
} = require('./plugin');

exports.plugin = plugin;
exports.signalIsUp = signalIsUp;
exports.signalIsNotUp = signalIsNotUp;
exports.getRequestRecorder = getRequestRecorder;
