const { default: normalizeStatusCode } = require('./status-code');
const { default: normalizePath } = require('./path');
const { default: normalizeMethod } = require('./method');

exports.normalizeStatusCode = normalizeStatusCode;
exports.normalizePath = normalizePath;
exports.normalizeMethod = normalizeMethod;
exports.defaultNormalizers = {
  normalizeStatusCode,
  normalizePath,
  normalizeMethod,
};
