jest.mock('../client', () => ({
  configure: jest.fn(),
  Prometheus: {
    Gauge: jest.fn(),
    Counter: jest.fn(),
    Summary: jest.fn(),
    Histogram: jest.fn(),
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
