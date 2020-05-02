import { version } from '../package.json';
import {
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
} from '@promster/metrics';

export {
  version,
  plugin,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
  getSummary,
  getContentType,
  Prometheus,
  defaultRegister,
  defaultNormalizers,
};
