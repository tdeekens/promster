import { version } from '../package.json';
import {
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
} from '@promster/metrics';

export {
  version,
  createMiddleware,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
  getSummary,
  getContentType,
  Prometheus,
  defaultRegister,
  defaultNormalizers,
};
