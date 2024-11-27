import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../client', () => ({
  configure: vi.fn(),
  Prometheus: {
    Gauge: vi.fn(),
    Counter: vi.fn(),
    Summary: vi.fn(),
    Histogram: vi.fn(),
  },
}));

const { createGcMetrics } = require('./create-gc-metrics');

describe('createGcMetrics', () => {
  let metrics;

  beforeEach(() => {
    metrics = createGcMetrics();
  });

  it('should have `up` metric', () => {
    expect(metrics).toHaveProperty('up');
  });
});
