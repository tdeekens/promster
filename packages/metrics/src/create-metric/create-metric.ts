import type {
  Counter,
  CounterConfiguration,
  Gauge,
  GaugeConfiguration,
  Histogram,
  HistogramConfiguration,
  Summary,
  SummaryConfiguration,
} from 'prom-client';

import { defaultRegister, Prometheus } from '../client';

// NOTE:
//   All metrics share the `prom-client` global registry (see `../client`).
//   Registering a metric whose name already exists throws. This happens when
//   a metric-defining module is evaluated more than once, for instance when a
//   bundler or package manager ships duplicate physical copies of a package.
//   These helpers make registration idempotent: an already registered metric
//   of the same name and type is returned instead of re-created. The first
//   registration wins, so a later differing configuration is ignored. A name
//   already taken by a different metric type falls through to `prom-client`,
//   which rejects it with the clear "already registered" error.

const createHistogram = (
  configuration: HistogramConfiguration<string>,
): Histogram<string> => {
  const existingMetric = defaultRegister.getSingleMetric(configuration.name);

  if (existingMetric instanceof Prometheus.Histogram) {
    return existingMetric;
  }

  return new Prometheus.Histogram(configuration);
};

const createCounter = (
  configuration: CounterConfiguration<string>,
): Counter<string> => {
  const existingMetric = defaultRegister.getSingleMetric(configuration.name);

  if (existingMetric instanceof Prometheus.Counter) {
    return existingMetric;
  }

  return new Prometheus.Counter(configuration);
};

const createGauge = (
  configuration: GaugeConfiguration<string>,
): Gauge<string> => {
  const existingMetric = defaultRegister.getSingleMetric(configuration.name);

  if (existingMetric instanceof Prometheus.Gauge) {
    return existingMetric;
  }

  return new Prometheus.Gauge(configuration);
};

const createSummary = (
  configuration: SummaryConfiguration<string>,
): Summary<string> => {
  const existingMetric = defaultRegister.getSingleMetric(configuration.name);

  if (existingMetric instanceof Prometheus.Summary) {
    return existingMetric;
  }

  return new Prometheus.Summary(configuration);
};

export { createCounter, createGauge, createHistogram, createSummary };
