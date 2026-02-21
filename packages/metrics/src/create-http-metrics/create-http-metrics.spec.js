vi.mock('../client', () => ({
  configure: vi.fn(),
  Prometheus: {
    Gauge: vi.fn(),
    Counter: vi.fn(),
    Summary: vi.fn(),
    Histogram: vi.fn(),
  },
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createHttpMetrics } from './create-http-metrics';

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
          'httpRequestDurationPerPercentileInSeconds',
        );
      });
    });

    it('should have `httpRequestDurationInSeconds` metric', () => {
      expect(metrics).toHaveProperty('httpRequestDurationInSeconds');
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
        undefined,
      );
    });
  });

  describe('with summary metric type', () => {
    beforeEach(() => {
      metrics = createHttpMetrics({ metricTypes: ['httpRequestsSummary'] });
    });

    it('should have `httpRequestDurationPerPercentileInSeconds` metric', () => {
      expect(metrics).toHaveProperty(
        'httpRequestDurationPerPercentileInSeconds',
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
