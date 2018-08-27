const {
  sortLabels,
  endMeasurmentFrom,
  default: createRequestObserver,
} = require('./create-request-observer');

describe('sortLabels', () => {
  const unsorted = { b: 'c', a: 'b' };
  let sorted;

  beforeEach(() => {
    sorted = sortLabels(unsorted);
  });

  it('should sort the labels in accending order', () => {
    expect(sorted).toEqual({ a: 'b', b: 'c' });
  });
});

describe('endMeasurmentFrom', () => {
  const start = [1, 2];
  let measurement;

  beforeEach(() => {
    measurement = endMeasurmentFrom(start);
  });

  it('should have millisecond duration', () => {
    expect(measurement).toHaveProperty('durationMs');
  });

  it('should have second duration', () => {
    expect(measurement).toHaveProperty('durationS');
  });
});

describe('createRequestObserver', () => {
  const createMetricTypes = () => ({
    httpRequestDurationInMilliseconds: {
      observe: jest.fn(),
    },
    httpRequestDurationPerPercentileInMilliseconds: {
      observe: jest.fn(),
    },
    httpRequestDurationInSeconds: {
      observe: jest.fn(),
    },
    httpRequestDurationPerPercentileInSeconds: {
      observe: jest.fn(),
    },
    httpRequestsTotal: {
      inc: jest.fn(),
    },
  });
  const recordingOptions = {
    labels: {
      a: 'b',
    },
  };
  const start = [1, 2];
  let metricTypes;
  let requestObserver;

  beforeEach(() => {
    metricTypes = createMetricTypes();
  });

  describe('without accuracy', () => {
    beforeEach(() => {
      requestObserver = createRequestObserver(metricTypes);
      requestObserver(start, recordingOptions);
    });

    it('should record on `httpRequestDurationInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds.observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    it('should record on `httpRequestDurationPerPercentileInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds.observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });
  });

  describe('with second accuracy', () => {
    beforeEach(() => {
      requestObserver = createRequestObserver(metricTypes, {
        accuracies: ['s'],
      });
      requestObserver(start, recordingOptions);
    });

    it('should record on `httpRequestDurationInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds.observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    it('should record on `httpRequestDurationPerPercentileInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds.observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });
  });

  describe('with millisecond accuracy', () => {
    beforeEach(() => {
      requestObserver = createRequestObserver(metricTypes, {
        accuracies: ['ms'],
      });
      requestObserver(start, recordingOptions);
    });

    it('should record on `httpRequestDurationInMilliseconds`', () => {
      expect(
        metricTypes.httpRequestDurationInMilliseconds.observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    describe('with summary enabled', () => {
      beforeEach(() => {
        requestObserver = createRequestObserver(metricTypes, {
          accuracies: ['ms'],
          metricTypes: ['httpRequestsSummary'],
        });
        requestObserver(start, recordingOptions);
      });

      it('should record on `httpRequestDurationPerPercentileInMilliseconds`', () => {
        expect(
          metricTypes.httpRequestDurationPerPercentileInMilliseconds.observe
        ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
      });
    });
  });

  describe('with both second and millisecond accuracy', () => {
    beforeEach(() => {
      requestObserver = createRequestObserver(metricTypes, {
        accuracies: ['s', 'ms'],
      });
      requestObserver(start, recordingOptions);
    });

    it('should record on `httpRequestDurationInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds.observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    it('should record on `httpRequestDurationPerPercentileInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds.observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    it('should record on `httpRequestDurationInMilliseconds`', () => {
      expect(
        metricTypes.httpRequestDurationInMilliseconds.observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    describe('with summary enabled', () => {
      beforeEach(() => {
        requestObserver = createRequestObserver(metricTypes, {
          accuracies: ['s', 'ms'],
          metricTypes: ['httpRequestsSummary'],
        });
        requestObserver(start, recordingOptions);
      });

      it('should record on `httpRequestDurationPerPercentileInMilliseconds`', () => {
        expect(
          metricTypes.httpRequestDurationPerPercentileInMilliseconds.observe
        ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
      });
    });
  });

  describe('with request count', () => {
    beforeEach(() => {
      requestObserver = createRequestObserver(metricTypes, {
        metricTypes: ['httpRequestsTotal'],
      });
      requestObserver(start, recordingOptions);
    });
    it('should record on `requestsCount`', () => {
      expect(metricTypes.httpRequestsTotal.inc).toHaveBeenCalledWith(
        recordingOptions.labels
      );
    });
  });
});
