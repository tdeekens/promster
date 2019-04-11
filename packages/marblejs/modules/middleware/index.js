const {
  default: createMiddleware,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
} = require('./middleware');

exports.createMiddleware = createMiddleware;
exports.signalIsUp = signalIsUp;
exports.signalIsNotUp = signalIsNotUp;
exports.getRequestRecorder = getRequestRecorder;
