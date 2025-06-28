import {
  defaultNormalizers,
  defaultRegister,
  getContentType,
  getSummary,
  Prometheus,
  timing,
} from '@promster/metrics';
import {
  createPlugin,
  signalIsNotUp,
  signalIsUp,
  type TPromsterOptions,
} from './plugin';

export {
  type TPromsterOptions,
  createPlugin,
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
