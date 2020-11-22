import { normalizeStatusCode } from './status-code';
import { normalizePath } from './path';
import { normalizeMethod } from './method';

const defaultNormalizers = {
  normalizeStatusCode,
  normalizePath,
  normalizeMethod,
};

export {
  normalizeStatusCode,
  normalizePath,
  normalizeMethod,
  defaultNormalizers,
};
