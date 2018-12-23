const {
  default: createMiddleware,
  getRequestRecorder,
} = require('./middleware');

exports.createMiddleware = createMiddleware;
exports.getRequestRecorder = getRequestRecorder;
