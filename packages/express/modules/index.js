const { version } = require('../package.json');
const { createMiddleware } = require('./middleware');

exports.version = version;
exports.createMiddleware = createMiddleware;
