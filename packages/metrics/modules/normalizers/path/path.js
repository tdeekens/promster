const url = require('url');
const UrlValueParser = require('url-value-parser');

const urlValueParser = new UrlValueParser();

const normalizePath = (path) =>
  urlValueParser.replacePathValues(url.parse(path).pathname);

exports.default = normalizePath;
