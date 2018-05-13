const { register } = require('../client');

const getSummary = () => register.metrics();
const getContentType = () => register.contentType;

exports.default = getSummary;
exports.getContentType = getContentType;
