import { afterEach, describe, expect, it } from 'vitest';

import { defaultRegister } from '../client';
import { startGcStats } from './gc-stats';

const metricNames = [
  'nodejs_gc_runs_total',
  'nodejs_gc_pause_seconds_total',
  'nodejs_gc_reclaimed_bytes_total',
];

describe('gc-stats', () => {
  const stops = [];

  afterEach(() => {
    while (stops.length > 0) {
      stops.pop()();
    }

    for (const name of metricNames) {
      defaultRegister.removeSingleMetric(name);
      defaultRegister.removeSingleMetric(`promster_test_${name}`);
    }
  });

  const start = (options) => {
    const stop = startGcStats(options);

    stops.push(stop);

    return stop;
  };

  it('should register the garbage collection metrics', () => {
    start({ collectionInterval: 6000 });

    for (const name of metricNames) {
      expect(defaultRegister.getSingleMetric(name)).toBeDefined();
    }
  });

  it('should label the metrics by garbage collection type', async () => {
    start({ collectionInterval: 6000 });

    const metric = await defaultRegister
      .getSingleMetric('nodejs_gc_runs_total')
      .get();

    expect(metric.help).toBe('Count of total garbage collections.');
    expect(metric.type).toBe('counter');
  });

  it('should prefix the metric names when a prefix is given', () => {
    start({ collectionInterval: 6000, prefix: 'promster_test_' });

    for (const name of metricNames) {
      expect(
        defaultRegister.getSingleMetric(`promster_test_${name}`),
      ).toBeDefined();
    }
  });

  it('should reuse the registered metrics when started again', () => {
    start({ collectionInterval: 6000 });

    const registered = defaultRegister.getSingleMetric('nodejs_gc_runs_total');

    expect(() => start({ collectionInterval: 6000 })).not.toThrow();
    expect(defaultRegister.getSingleMetric('nodejs_gc_runs_total')).toBe(
      registered,
    );
  });

  it('should stop collecting when the returned teardown is called', () => {
    const stop = startGcStats({ collectionInterval: 6000 });

    expect(stop).toBeTypeOf('function');
    expect(() => stop()).not.toThrow();
  });

  describe('given an abort signal', () => {
    it('should not register any metrics when it is already aborted', () => {
      start({ collectionInterval: 6000, signal: AbortSignal.abort() });

      for (const name of metricNames) {
        expect(defaultRegister.getSingleMetric(name)).toBeUndefined();
      }
    });

    it('should stop collecting when it is aborted', () => {
      const controller = new AbortController();

      start({ collectionInterval: 6000, signal: controller.signal });

      expect(() => controller.abort()).not.toThrow();
    });

    it('should drop its abort listener once stopped directly', () => {
      const controller = new AbortController();
      const stop = start({
        collectionInterval: 6000,
        signal: controller.signal,
      });

      stop();

      // NOTE:
      //   Aborting afterwards must not reach the already detached teardown,
      //   otherwise a long lived signal keeps the closure alive for good.
      expect(() => controller.abort()).not.toThrow();
    });

    it('should tolerate both the teardown and an abort', () => {
      const controller = new AbortController();
      const stop = start({
        collectionInterval: 6000,
        signal: controller.signal,
      });

      controller.abort();

      expect(() => stop()).not.toThrow();
    });
  });
});
