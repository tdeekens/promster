const { version } = require('../package.json');
const { createServer } = require('./server');

exports.version = version;
exports.createServer = createServer;
