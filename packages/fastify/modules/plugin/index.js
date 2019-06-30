const {
  default: promsterPlugin,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
} = require('./plugin');

exports.promsterPlugin = promsterPlugin;
exports.signalIsUp = signalIsUp;
exports.signalIsNotUp = signalIsNotUp;
exports.getRequestRecorder = getRequestRecorder;
