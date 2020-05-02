import { createMetricTypes } from './create-metric-types';

jest.mock('../client', () => ({
  configure: jest.fn(),
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

      it('should have `httpRequestDurationPerPercentileInSeconds` metric', () => {
        expect(metricTypes).toHaveProperty(
          'httpRequestDurationPerPercentileInSeconds'
        );
      });
    });

    it('should have `httpRequestDurationInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('httpRequestDurationInSeconds');
    });
  });

  describe('with millisecond accuracy', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes({ accuracies: ['ms'] });
    });

    it('should have `httpRequestDurationInMilliseconds` metric', () => {
      expect(metricTypes).toHaveProperty('httpRequestDurationInMilliseconds');
    });

    describe('with summary enabled', () => {
      beforeEach(() => {
        metricTypes = createMetricTypes({
          metricTypes: ['httpRequestsSummary'],
          accuracies: ['ms'],
        });
      });

      it('should have `httpRequestDurationPerPercentileInMilliseconds` metric', () => {
        expect(metricTypes).toHaveProperty(
          'httpRequestDurationPerPercentileInMilliseconds'
        );
      });
    });
  });

  describe('with both second and millisecond accuracy', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes({ accuracies: ['s', 'ms'] });
    });

    it('should have `httpRequestDurationPerPercentileInMilliseconds` metric', () => {
      expect(metricTypes).toHaveProperty(
        'httpRequestDurationPerPercentileInMilliseconds'
      );
    });

    it('should have `httpRequestDurationInMilliseconds` metric', () => {
      expect(metricTypes).toHaveProperty('httpRequestDurationInMilliseconds');
    });

    it('should have `httpRequestDurationPerPercentileInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty(
        'httpRequestDurationPerPercentileInSeconds'
      );
    });
  });

  describe('with histogram metric type', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes({
        metricTypes: ['httpRequestsHistogram'],
      });
    });

    it('should have `httpRequestDurationInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('httpRequestDurationInSeconds');
    });

    it('should not have `httpRequestDurationPerPercentileInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty(
        'httpRequestDurationPerPercentileInSeconds',
        false
      );
    });
  });

  describe('with summary metric type', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes({ metricTypes: ['httpRequestsSummary'] });
    });

    it('should have `httpRequestDurationPerPercentileInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty(
        'httpRequestDurationPerPercentileInSeconds'
      );
    });

    it('should not have `httpRequestDurationInSeconds` metric', () => {
      expect(metricTypes).toHaveProperty('httpRequestDurationInSeconds', false);
    });
  });

  describe('with count metric type', () => {
    beforeEach(() => {
      metricTypes = createMetricTypes({ metricTypes: ['httpRequestsTotal'] });
    });

    it('should have `httpRequestsTotal` metric', () => {
      expect(metricTypes).toHaveProperty('httpRequestsTotal');
    });
  });
});
