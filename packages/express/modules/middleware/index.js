const {
  default: createMiddleware,
  getRequestObserver,
} = require('./middleware');

exports.createMiddleware = createMiddleware;
exports.getRequestObserver = getRequestObserver;
