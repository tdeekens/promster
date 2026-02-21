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

export type * from '@promster/types';
export type { TPromsterOptions };

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
