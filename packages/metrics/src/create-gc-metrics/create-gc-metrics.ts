import {
  type TDefaultedPromsterOptions,
  type TGcMetrics,
} from '@promster/types';

import merge from 'merge-options';
import { configure, Prometheus } from '../client';

const defaultLabels = ['gc_type'];
const asArray = (maybeArray: Readonly<string[] | string>) =>
  Array.isArray(maybeArray) ? maybeArray : [maybeArray];

const defaultOptions = {
  getLabelValues: () => ({}),
  labels: [],
  metricPrefix: '',
  metricNames: {
    up: ['nodejs_up'],
    countOfGcs: ['nodejs_gc_runs_total'],
    durationOfGc: ['nodejs_gc_pause_seconds_total'],
    reclaimedInGc: ['nodejs_gc_reclaimed_bytes_total'],
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
  countOfGcs: asArray(options.metricNames.countOfGcs).map(
    (nameOfCountOfGcsMetric: string) =>
      new Prometheus.Counter({
        name: `${options.metricPrefix}${nameOfCountOfGcsMetric}`,
        help: 'Count of total garbage collections.',
        labelNames: defaultLabels,
      })
  ),
  durationOfGc: asArray(options.metricNames.durationOfGc).map(
    (nameOfDurationOfGcMetric: string) =>
      new Prometheus.Counter({
        name: `${options.metricPrefix}${nameOfDurationOfGcMetric}`,
        help: 'Time spent in GC Pause in seconds.',
        labelNames: defaultLabels,
      })
  ),
  reclaimedInGc: asArray(options.metricNames.reclaimedInGc).map(
    (nameOfReclaimedInGcMetric: string) =>
      new Prometheus.Counter({
        name: `${options.metricPrefix}${nameOfReclaimedInGcMetric}`,
        help: 'Total number of bytes reclaimed by GC.',
        labelNames: defaultLabels,
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
