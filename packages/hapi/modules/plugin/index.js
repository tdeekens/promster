const {
  default: createPlugin,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
} = require('./plugin');

exports.createPlugin = createPlugin;
exports.getRequestRecorder = getRequestRecorder;
exports.signalIsUp = signalIsUp;
exports.signalIsNotUp = signalIsNotUp;
