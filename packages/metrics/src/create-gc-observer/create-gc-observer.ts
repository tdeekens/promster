import { gcStats } from '@chainsafe/prometheus-gc-stats';
import type { TDefaultedPromsterOptions, TGcMetrics } from '@promster/types';
import once from 'lodash.once';
import { defaultRegister } from '../client/client';

const defaultOptions = {
  disableGcMetrics: false,
};

const createGcObserver = once(
  (_metrics: TGcMetrics, options: TDefaultedPromsterOptions) => () => {
    gcStats(defaultRegister, {
      collectionInterval: options.gcCollectionInterval,
      prefix: options.metricPrefix,
    });
  }
);

// @ts-expect-error
createGcObserver.defaultOptions = defaultOptions;

export { createGcObserver };
