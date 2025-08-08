import type { Server } from '@hapi/hapi';

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
  getRequestRecorder,
  signalIsNotUp,
  signalIsUp,
  type TPromsterOptions,
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

export type * from '@promster/types';
