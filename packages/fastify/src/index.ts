import {
  type TPromsterOptions,
  plugin,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
} from './plugin';
import {
  getSummary,
  getContentType,
  Prometheus,
  defaultRegister,
  defaultNormalizers,
  timing,
} from '@promster/metrics';

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

export * from '@promster/types';
