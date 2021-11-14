import type { TPromsterOptions } from '@promster/types';
import type { Server } from '@hapi/hapi';

import {
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
