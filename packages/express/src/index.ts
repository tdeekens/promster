import {
  defaultNormalizers,
  defaultRegister,
  getContentType,
  getSummary,
  Prometheus,
  timing,
} from '@promster/metrics';
import {
  createMiddleware,
  getRequestRecorder,
  signalIsNotUp,
  signalIsUp,
  type TPromsterOptions,
} from './middleware';

export {
  type TPromsterOptions,
  createMiddleware,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
  getSummary,
  getContentType,
  Prometheus,
  defaultRegister,
  defaultNormalizers,
  timing,
};

export * from '@promster/types';
