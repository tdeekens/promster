import { afterEach, describe, expect, it } from 'vitest';

import { defaultRegister } from '../client';
import {
  createCounter,
  createGauge,
  createHistogram,
  createSummary,
} from './create-metric';

const testMetricNames = [
  'promster_test_histogram_seconds',
  'promster_test_counter_total',
  'promster_test_gauge',
  'promster_test_summary_seconds',
];

describe('create-metric', () => {
  afterEach(() => {
    testMetricNames.forEach((name) => defaultRegister.removeSingleMetric(name));
  });

  it('should return the existing histogram on a second registration', () => {
    const configuration = {
      name: 'promster_test_histogram_seconds',
      help: 'Test histogram for duplicate registration',
      labelNames: ['outcome'],
      buckets: [1],
    };

    expect(createHistogram(configuration)).toBe(createHistogram(configuration));
  });

  it('should return the existing counter on a second registration', () => {
    const configuration = {
      name: 'promster_test_counter_total',
      help: 'Test counter for duplicate registration',
      labelNames: ['outcome'],
    };

    expect(createCounter(configuration)).toBe(createCounter(configuration));
  });

  it('should return the existing gauge on a second registration', () => {
    const configuration = {
      name: 'promster_test_gauge',
      help: 'Test gauge for duplicate registration',
    };

    expect(createGauge(configuration)).toBe(createGauge(configuration));
  });

  it('should return the existing summary on a second registration', () => {
    const configuration = {
      name: 'promster_test_summary_seconds',
      help: 'Test summary for duplicate registration',
      percentiles: [0.5],
    };

    expect(createSummary(configuration)).toBe(createSummary(configuration));
  });

  it('should throw when a name is reused for a different metric type', () => {
    const name = 'promster_test_histogram_seconds';

    createHistogram({
      name,
      help: 'Test histogram for cross-type reuse',
      labelNames: ['outcome'],
      buckets: [1],
    });

    expect(() =>
      createCounter({ name, help: 'Test counter for cross-type reuse' }),
    ).toThrow(/has already been registered/);
  });
});
