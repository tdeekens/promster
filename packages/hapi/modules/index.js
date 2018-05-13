const { version } = require('../package.json');
const { createPlugin } = require('./plugin');

exports.version = version;
exports.createPlugin = createPlugin;
