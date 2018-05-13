const { version } = require('../package.json');
const { Prometheus, register } = require('./client');
const { createMetricTypes } = require('./types');
const { getSummary } = require('./summary');

exports.version = version;
exports.Prometheus = Prometheus;
exports.createMetricTypes = createMetricTypes;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
exports.register = register;
exports.observe = observe;
