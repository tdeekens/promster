import type { TGcMetrics, TOptionalPromsterOptions } from '@promster/types';

import once from 'lodash.once';
// @ts-expect-error
import gcStats from 'prometheus-gc-stats';
import { defaultRegister } from '../client/client';

const defaultOptions = {
  disableGcMetrics: false,
};

const createGcObserver = once(
  (metrics: TGcMetrics, options: TOptionalPromsterOptions) => () => {
    const startGcStats = gcStats(defaultRegister, {
      prefix: options.metricPrefix,
    });

    startGcStats();
  }
);

// @ts-expect-error
createGcObserver.defaultOptions = defaultOptions;

export { createGcObserver };
