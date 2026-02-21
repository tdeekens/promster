import type { TGcMetrics, TOptionalPromsterOptions } from '@promster/types';

import once from 'lodash.once';

const defaultOptions = {
  disableGcMetrics: false,
};

const createGcObserver = once(
  (_metrics: TGcMetrics, _options: TOptionalPromsterOptions) => () => {
    // GC metrics are now collected by prom-client's collectDefaultMetrics()
    // which is invoked in the client module's configure function.
  }
);

// @ts-expect-error
createGcObserver.defaultOptions = defaultOptions;

export { createGcObserver };
