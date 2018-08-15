const { version } = require('../package.json');
const { Prometheus, defaultRegister } = require('./client');
const { createMetricTypes } = require('./types');
const { getSummary, getContentType } = require('./summary');
const { createRequestObserver } = require('./create-request-observer');
const { createGcObserver } = require('./create-gc-observer');
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
exports.createRequestObserver = createRequestObserver;
exports.createGcObserver = createGcObserver;
exports.normalizeStatusCode = normalizeStatusCode;
exports.normalizePath = normalizePath;
exports.normalizeMethod = normalizeMethod;
