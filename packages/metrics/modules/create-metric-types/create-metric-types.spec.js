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

    describe('with summary enabled', () => {
      beforeEach(() => {
        metricTypes = createMetricTypes({
          metricTypes: ['httpRequestsSummary'],
        });
      });

      it('should have `percentilesInSeconds` metric', () => {
        expect(metricTypes).toHaveProperty('percentilesInSeconds');
      });
    });

    it('should have `bucketsInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('bucketsInSeconds');
    });
  });

  describe('with millisecond accuracy', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes({ accuracies: ['ms'] });
    });

    it('should have `bucketsInMilliseconds` metric', () => {
      expect(metricTypes).toHaveProperty('bucketsInMilliseconds');
    });

    describe('with summary enabled', () => {
      beforeEach(() => {
        metricTypes = createMetricTypes({
          metricTypes: ['httpRequestsSummary'],
          accuracies: ['ms'],
        });
      });

      it('should have `percentilesInMilliseconds` metric', () => {
        expect(metricTypes).toHaveProperty('percentilesInMilliseconds');
      });
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
  });

  describe('with histogram metric type', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes({
        metricTypes: ['httpRequestsHistogram'],
      });
    });

    it('should have `bucketsInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('bucketsInSeconds');
    });

    it('should not have `percentilesInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('percentilesInSeconds', false);
    });
  });

  describe('with summary metric type', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes({ metricTypes: ['httpRequestsSummary'] });
    });

    it('should have `percentilesInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('percentilesInSeconds');
    });

    it('should not have `bucketsInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('bucketsInSeconds', false);
    });
  });

  describe('with count metric type', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes({ metricTypes: ['httpRequestsTotal'] });
    });

    it('should have `requestsTotal` metric', () => {
      expect(metricTypes).toHaveProperty('requestsTotal');
    });
  });
});
