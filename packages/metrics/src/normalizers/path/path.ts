import url from 'node:url';

import UrlValueParser from 'url-value-parser';

const urlValueParser = new UrlValueParser();

const normalizePath = (path: string): string => {
  const parsedPathname = url.parse(path).pathname;

  if (!parsedPathname) {
    return '';
  }

  return urlValueParser.replacePathValues(parsedPathname, '#val');
};

export { normalizePath };
