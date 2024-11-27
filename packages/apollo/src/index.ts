import {
  Prometheus,
  defaultNormalizers,
  defaultRegister,
  getContentType,
  getSummary,
  timing,
} from '@promster/metrics';
import {
  type TPromsterOptions,
  createPlugin,
  signalIsNotUp,
  signalIsUp,
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
