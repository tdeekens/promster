jest.mock('../client', () => ({
  configure: jest.fn(),
  Prometheus: {
    Gauge: jest.fn(),
    Counter: jest.fn(),
    Summary: jest.fn(),
    Histogram: jest.fn(),
  },
}));

const { createHttpMetrics } = require('./create-http-metrics');

describe('createHttpMetrics', () => {
  let metrics;

  describe('without accuracy', () => {
    beforeEach(() => {
      metrics = createHttpMetrics();
    });

    it('should not have `httpRequestContentLengthInBytes` metric', () => {
      expect(metrics).toHaveProperty('httpRequestContentLengthInBytes');
    });

    it('should not have `httpResponseContentLengthInBytes` metric', () => {
      expect(metrics).toHaveProperty('httpResponseContentLengthInBytes');
    });

    describe('with summary enabled', () => {
      beforeEach(() => {
        metrics = createHttpMetrics({
          metricTypes: ['httpRequestsSummary'],
        });
      });

      it('should have `httpRequestDurationPerPercentileInSeconds` metric', () => {
        expect(metrics).toHaveProperty(
          'httpRequestDurationPerPercentileInSeconds'
        );
      });
    });

    it('should have `httpRequestDurationInSeconds` metric', () => {
      expect(metrics).toHaveProperty('httpRequestDurationInSeconds');
    });
  });

  describe('with millisecond accuracy', () => {
    beforeEach(() => {
      metrics = createHttpMetrics({ accuracies: ['ms'] });
    });

    it('should have `httpRequestDurationInMilliseconds` metric', () => {
      expect(metrics).toHaveProperty('httpRequestDurationInMilliseconds');
    });

    describe('with summary enabled', () => {
      beforeEach(() => {
        metrics = createHttpMetrics({
          metricTypes: ['httpRequestsSummary'],
          accuracies: ['ms'],
        });
      });

      it('should have `httpRequestDurationPerPercentileInMilliseconds` metric', () => {
        expect(metrics).toHaveProperty(
          'httpRequestDurationPerPercentileInMilliseconds'
        );
      });
    });
  });

  describe('with both second and millisecond accuracy', () => {
    beforeEach(() => {
      metrics = createHttpMetrics({ accuracies: ['s', 'ms'] });
    });

    it('should have `httpRequestDurationPerPercentileInMilliseconds` metric', () => {
      expect(metrics).toHaveProperty(
        'httpRequestDurationPerPercentileInMilliseconds'
      );
    });

    it('should have `httpRequestDurationInMilliseconds` metric', () => {
      expect(metrics).toHaveProperty('httpRequestDurationInMilliseconds');
    });

    it('should have `httpRequestDurationPerPercentileInSeconds` metric', () => {
      expect(metrics).toHaveProperty(
        'httpRequestDurationPerPercentileInSeconds'
      );
    });
  });

  describe('with histogram metric type', () => {
    beforeEach(() => {
      metrics = createHttpMetrics({
        metricTypes: ['httpRequestsHistogram'],
      });
    });

    it('should have `httpRequestDurationInSeconds` metric', () => {
      expect(metrics).toHaveProperty('httpRequestDurationInSeconds');
    });

    it('should not have `httpRequestDurationPerPercentileInSeconds` metric', () => {
      expect(metrics).toHaveProperty(
        'httpRequestDurationPerPercentileInSeconds',
        undefined
      );
    });
  });

  describe('with summary metric type', () => {
    beforeEach(() => {
      metrics = createHttpMetrics({ metricTypes: ['httpRequestsSummary'] });
    });

    it('should have `httpRequestDurationPerPercentileInSeconds` metric', () => {
      expect(metrics).toHaveProperty(
        'httpRequestDurationPerPercentileInSeconds'
      );
    });

    it('should not have `httpRequestDurationInSeconds` metric', () => {
      expect(metrics).toHaveProperty('httpRequestDurationInSeconds', undefined);
    });
  });

  describe('with count metric type', () => {
    beforeEach(() => {
      metrics = createHttpMetrics({ metricTypes: ['httpRequestsTotal'] });
    });

    it('should have `httpRequestsTotal` metric', () => {
      expect(metrics).toHaveProperty('httpRequestsTotal');
    });
  });

  describe('with content length type', () => {
    beforeEach(() => {
      metrics = createHttpMetrics({
        metricTypes: ['httpContentLengthHistogram'],
      });
    });

    it('should have `httpRequestContentLengthInBytes` metric', () => {
      expect(metrics).toHaveProperty('httpRequestContentLengthInBytes');
    });

    it('should have `httpResponseContentLengthInBytes` metric', () => {
      expect(metrics).toHaveProperty('httpResponseContentLengthInBytes');
    });
  });
});
