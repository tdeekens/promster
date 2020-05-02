import { version } from '../package.json';
import { Prometheus, defaultRegister } from './client';
import { createMetricTypes } from './create-metric-types';
import { getSummary, getContentType } from './summary';
import { createRequestRecorder } from './create-request-recorder';
import { createGcObserver } from './create-gc-observer';
import {
  defaultNormalizers,
  normalizeStatusCode,
  normalizePath,
  normalizeMethod,
} from './normalizers';
import { isRunningInKubernetes } from './kubernetes';

export {
  version,
  Prometheus,
  defaultRegister,
  createMetricTypes,
  getSummary,
  getContentType,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  normalizeStatusCode,
  normalizePath,
  normalizeMethod,
  isRunningInKubernetes,
};
