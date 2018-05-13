const url = require('url');
const UrlValueParser = require('url-value-parser');

const urlValueParser = new UrlValueParser();

const normalizePath = req =>
  urlValueParser.replacePathValues(
    url.parse(req.originalUrl || req.url).pathname
  );

exports.default = normalizePath;
