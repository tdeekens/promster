const {
  default: createPlugin,
  getRequestRecorder,
  setIsUp,
  setIsNotUp,
} = require('./plugin');

exports.createPlugin = createPlugin;
exports.getRequestRecorder = getRequestRecorder;
exports.setIsUp = setIsUp;
exports.setIsNotUp = setIsNotUp;
