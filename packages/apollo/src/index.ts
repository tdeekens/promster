import {
  type TPromsterOptions,
  createPlugin,
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
