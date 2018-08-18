const { default: createMetricTypes } = require('./create-metric-types');

jest.mock('../client', () => ({
  Prometheus: {
    Gauge: jest.fn(),
    Counter: jest.fn(),
    Summary: jest.fn(),
    Histogram: jest.fn(),
  },
}));

describe('createMetricTypes', () => {
  let metricTypes;
  describe('without accuracy', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes();
    });

    it('should have `up` metric', () => {
      expect(metricTypes).toHaveProperty('up');
    });

    it('should have `countOfGcs` metric', () => {
      expect(metricTypes).toHaveProperty('countOfGcs');
    });

    it('should have `durationOfGc` metric', () => {
      expect(metricTypes).toHaveProperty('durationOfGc');
    });

    it('should have `reclaimedInGc` metric', () => {
      expect(metricTypes).toHaveProperty('reclaimedInGc');
    });

    it('should have `percentilesInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('percentilesInSeconds');
    });

    it('should have `bucketsInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('bucketsInSeconds');
    });
  });

  describe('with millisecond accuracy', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes({ accuracies: ['ms'] });
    });

    it('should have `percentilesInMilliseconds` metric', () => {
      expect(metricTypes).toHaveProperty('percentilesInMilliseconds');
    });

    it('should have `bucketsInMilliseconds` metric', () => {
      expect(metricTypes).toHaveProperty('bucketsInMilliseconds');
    });
  });

  describe('with both second and millisecond accuracy', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes({ accuracies: ['s', 'ms'] });
    });

    it('should have `percentilesInMilliseconds` metric', () => {
      expect(metricTypes).toHaveProperty('percentilesInMilliseconds');
    });

    it('should have `bucketsInMilliseconds` metric', () => {
      expect(metricTypes).toHaveProperty('bucketsInMilliseconds');
    });

    it('should have `percentilesInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('percentilesInSeconds');
    });

    it('should have `bucketsInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('bucketsInSeconds');
    });
  });
});
