const { version } = require('../package.json');
const { Prometheus, defaultRegister } = require('./client');
const { createMetricTypes } = require('./types');
const { getSummary } = require('./summary');

exports.version = version;
exports.Prometheus = Prometheus;
exports.createMetricTypes = createMetricTypes;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
exports.defaultRegister = defaultRegister;
exports.observe = observe;
