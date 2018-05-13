const { version } = require('../package.json');
const { createPlugin } = require('./plugin');
const { getSummary, getContentType } = require('@promster/metrics');

exports.version = version;
exports.createPlugin = createPlugin;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
