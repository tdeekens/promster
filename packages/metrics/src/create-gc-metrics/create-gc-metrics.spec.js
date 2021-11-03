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

  it('should have `countOfGcs` metric', () => {
    expect(metrics).toHaveProperty('countOfGcs');
  });

  it('should have `durationOfGc` metric', () => {
    expect(metrics).toHaveProperty('durationOfGc');
  });

  it('should have `reclaimedInGc` metric', () => {
    expect(metrics).toHaveProperty('reclaimedInGc');
  });
});
