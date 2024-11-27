import { normalizeMethod } from './method';
import { normalizePath } from './path';
import { normalizeStatusCode } from './status-code';

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
