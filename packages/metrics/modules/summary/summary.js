const { register } = require('../client');

const getSummary = () => register.metrics();

exports.default = getSummary;
