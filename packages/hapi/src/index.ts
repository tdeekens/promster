import { type Server } from '@hapi/hapi';

import {
  type TPromsterOptions,
  createPlugin,
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

const instrument = async (server: Server, options: TPromsterOptions) =>
  server.register(createPlugin({ options }));

export {
  type TPromsterOptions,
  createPlugin,
  getRequestRecorder,
  signalIsUp,
  signalIsNotUp,
  getSummary,
  getContentType,
  Prometheus,
  defaultRegister,
  defaultNormalizers,
  instrument,
  timing,
};

export * from '@promster/types';
