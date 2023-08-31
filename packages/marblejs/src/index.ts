import {
  type TPromsterOptions,
  createMiddleware,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
} from './middleware';
import {
  getSummary,
  getContentType,
  Prometheus,
  defaultRegister,
  defaultNormalizers,
  timing,
} from '@promster/metrics';

export * from '@promster/types';
export { type TPromsterOptions };

export {
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
