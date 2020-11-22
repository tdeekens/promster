import url from 'url';
import UrlValueParser from 'url-value-parser';

const urlValueParser = new UrlValueParser();

const normalizePath = (path: string): string =>
  urlValueParser.replacePathValues(url.parse(path).pathname);

export { normalizePath };
