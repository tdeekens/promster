import {
  defaultNormalizers,
  defaultRegister,
  getContentType,
  getSummary,
  Prometheus,
  timing,
} from '@promster/metrics';

import {
  getRequestRecorder,
  plugin,
  signalIsNotUp,
  signalIsUp,
  type TPromsterOptions,
} from './plugin';

export {
  type TPromsterOptions,
  plugin,
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

export type * from '@promster/types';
