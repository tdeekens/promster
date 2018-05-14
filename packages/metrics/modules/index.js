const { version } = require('../package.json');
const { Prometheus, defaultRegister } = require('./client');
const { createMetricTypes } = require('./types');
const { getSummary, getContentType } = require('./summary');
const { createObserver } = require('./observe');
const {
  normalizeStatusCode,
  normalizePath,
  normalizeMethod,
} = require('./normalizers');

exports.version = version;
exports.Prometheus = Prometheus;
exports.defaultRegister = defaultRegister;
exports.createMetricTypes = createMetricTypes;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
exports.createObserver = createObserver;
exports.normalizeStatusCode = normalizeStatusCode;
exports.normalizePath = normalizePath;
exports.normalizeMethod = normalizeMethod;
