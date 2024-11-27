import type { TDefaultedPromsterOptions, TGcMetrics } from '@promster/types';

import merge from 'merge-options';
import { Prometheus, configure } from '../client';

const asArray = (maybeArray: Readonly<string[] | string>) =>
  Array.isArray(maybeArray) ? maybeArray : [maybeArray];

const defaultOptions = {
  getLabelValues: () => ({}),
  labels: [],
  metricPrefix: '',
  metricNames: {
    up: ['nodejs_up'],
  },
};

const getMetrics = (options: TDefaultedPromsterOptions) => ({
  up: asArray(options.metricNames.up).map(
    (nameOfUpMetric: string) =>
      new Prometheus.Gauge({
        name: `${options.metricPrefix}${nameOfUpMetric}`,
        help: '1 = nodejs server is up, 0 = nodejs server is not up',
      })
  ),
});

const createGcMetrics = (options: TDefaultedPromsterOptions): TGcMetrics => {
  const defaultedOptions: TDefaultedPromsterOptions = merge(
    defaultOptions,
    options
  );

  configure({
    prefix: defaultedOptions.metricPrefix,
  });

  const gcMetrics = getMetrics(defaultedOptions);

  return gcMetrics;
};

createGcMetrics.defaultOptions = defaultOptions;

export { createGcMetrics };
