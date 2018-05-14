const { defaultRegister } = require('../client');

const getSummary = () => defaultRegister.metrics();
const getContentType = () => defaultRegister.contentType;

exports.default = getSummary;
exports.getContentType = getContentType;
