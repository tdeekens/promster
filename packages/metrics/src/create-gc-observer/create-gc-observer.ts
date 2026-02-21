import type { TGcMetrics, TOptionalPromsterOptions } from '@promster/types';

import { gcStats } from '@chainsafe/prometheus-gc-stats';
import once from 'lodash.once';
import { defaultRegister } from '../client/client';

const defaultOptions = {
  disableGcMetrics: false,
};

const createGcObserver = once(
  (_metrics: TGcMetrics, options: TOptionalPromsterOptions) => () => {
    gcStats(defaultRegister, {
      collectionInterval: 6000,
      prefix: options.metricPrefix,
    });
  }
);

// @ts-expect-error
createGcObserver.defaultOptions = defaultOptions;

export { createGcObserver };
