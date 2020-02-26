const { version } = require('../package.json');
const { Prometheus, defaultRegister } = require('./client');
const { createMetricTypes } = require('./create-metric-types');
const { getSummary, getContentType } = require('./summary');
const { createRequestRecorder } = require('./create-request-recorder');
const { createGcObserver } = require('./create-gc-observer');
const {
  defaultNormalizers,
  normalizeStatusCode,
  normalizePath,
  normalizeMethod,
} = require('./normalizers');
const { isRunningInKubernetes } = require('./kubernetes');

exports.version = version;
exports.Prometheus = Prometheus;
exports.defaultRegister = defaultRegister;
exports.createMetricTypes = createMetricTypes;
exports.getSummary = getSummary;
exports.getContentType = getContentType;
exports.createRequestRecorder = createRequestRecorder;
exports.createGcObserver = createGcObserver;
exports.defaultNormalizers = defaultNormalizers;
exports.normalizeStatusCode = normalizeStatusCode;
exports.normalizePath = normalizePath;
exports.normalizeMethod = normalizeMethod;
exports.isRunningInKubernetes = isRunningInKubernetes;
