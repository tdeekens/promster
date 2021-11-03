import { Prometheus, defaultRegister } from './client';
import { createHttpMetrics } from './create-http-metrics';
import { createGcMetrics } from './create-gc-metrics';
import { getSummary, getContentType } from './summary';
import { createRequestRecorder } from './create-request-recorder';
import { createGcObserver } from './create-gc-observer';
import {
  defaultNormalizers,
  normalizeStatusCode,
  normalizePath,
  normalizeMethod,
} from './normalizers';
import { isRunningInKubernetes, skipMetricsInEnvironment } from './environment';

export type { TRequestRecorder } from './create-request-recorder';

export {
  Prometheus,
  defaultRegister,
  createHttpMetrics,
  createGcMetrics,
  getSummary,
  getContentType,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  normalizeStatusCode,
  normalizePath,
  normalizeMethod,
  isRunningInKubernetes,
  skipMetricsInEnvironment,
};
