import type { Server } from '@hapi/hapi';

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
  getRequestRecorder,
  signalIsNotUp,
  signalIsUp,
} from './plugin';

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
