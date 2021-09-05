const {
  sortLabels,
  endMeasurmentFrom,
  createRequestRecorder,
} = require('./create-request-recorder');

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

describe('createRequestRecorder', () => {
  const createMetricTypes = () => ({
    httpRequestDurationInMilliseconds: [
      {
        observe: jest.fn(),
      },
    ],
    httpRequestDurationPerPercentileInMilliseconds: [
      {
        observe: jest.fn(),
      },
    ],
    httpRequestDurationInSeconds: [
      {
        observe: jest.fn(),
      },
    ],
    httpRequestDurationPerPercentileInSeconds: [
      {
        observe: jest.fn(),
      },
    ],
    httpRequestsTotal: [
      {
        inc: jest.fn(),
      },
    ],
    httpRequestContentLengthInBytes: [
      {
        observe: jest.fn(),
      },
    ],
    httpResponseContentLengthInBytes: [
      {
        observe: jest.fn(),
      },
    ],
  });
  const recordingOptions = {
    labels: {
      a: 'b',
    },
  };
  const start = [1, 2];
  let metricTypes;
  let recordRequest;

  beforeEach(() => {
    metricTypes = createMetricTypes();
  });

  describe('with content length', () => {
    beforeEach(() => {
      recordRequest = createRequestRecorder(metricTypes);
      recordRequest(start, { ...recordingOptions, requestContentLength: 123, responseContentLength: 456 });
    });

    it('should record on `httpRequestContentLengthInBytes`', () => {
      expect(
        metricTypes.httpRequestContentLengthInBytes[0].observe
      ).toHaveBeenCalledWith(recordingOptions.labels, 123);
    });

    it('should record on `httpResponseContentLengthInBytes`', () => {
      expect(
        metricTypes.httpResponseContentLengthInBytes[0].observe
      ).toHaveBeenCalledWith(recordingOptions.labels, 456);
    });
  });

  describe('without content length', () => {
    beforeEach(() => {
      recordRequest = createRequestRecorder(metricTypes);
      recordRequest(start, recordingOptions);
    });

    it('should not record on `httpRequestContentLengthInBytes`', () => {
      expect(
        metricTypes.httpRequestContentLengthInBytes[0].observe
      ).not.toHaveBeenCalled();
    });

    it('should not record on `httpResponseContentLengthInBytes`', () => {
      expect(
        metricTypes.httpResponseContentLengthInBytes[0].observe
      ).not.toHaveBeenCalled();
    });
  });

  describe('without accuracy', () => {
    beforeEach(() => {
      recordRequest = createRequestRecorder(metricTypes);
      recordRequest(start, recordingOptions);
    });

    it('should record on `httpRequestDurationInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds[0].observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    it('should record on `httpRequestDurationPerPercentileInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds[0].observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });
  });

  describe('with second accuracy', () => {
    beforeEach(() => {
      recordRequest = createRequestRecorder(metricTypes, {
        accuracies: ['s'],
      });
      recordRequest(start, recordingOptions);
    });

    it('should record on `httpRequestDurationInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds[0].observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    it('should record on `httpRequestDurationPerPercentileInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds[0].observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });
  });

  describe('with millisecond accuracy', () => {
    beforeEach(() => {
      recordRequest = createRequestRecorder(metricTypes, {
        accuracies: ['ms'],
      });
      recordRequest(start, recordingOptions);
    });

    it('should record on `httpRequestDurationInMilliseconds`', () => {
      expect(
        metricTypes.httpRequestDurationInMilliseconds[0].observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    describe('with summary enabled', () => {
      beforeEach(() => {
        recordRequest = createRequestRecorder(metricTypes, {
          accuracies: ['ms'],
          metricTypes: ['httpRequestsSummary'],
        });
        recordRequest(start, recordingOptions);
      });

      it('should record on `httpRequestDurationPerPercentileInMilliseconds`', () => {
        expect(
          metricTypes.httpRequestDurationPerPercentileInMilliseconds[0].observe
        ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
      });
    });
  });

  describe('with both second and millisecond accuracy', () => {
    beforeEach(() => {
      recordRequest = createRequestRecorder(metricTypes, {
        accuracies: ['s', 'ms'],
      });
      recordRequest(start, recordingOptions);
    });

    it('should record on `httpRequestDurationInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds[0].observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    it('should record on `httpRequestDurationPerPercentileInSeconds`', () => {
      expect(
        metricTypes.httpRequestDurationInSeconds[0].observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    it('should record on `httpRequestDurationInMilliseconds`', () => {
      expect(
        metricTypes.httpRequestDurationInMilliseconds[0].observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });

    describe('with summary enabled', () => {
      beforeEach(() => {
        recordRequest = createRequestRecorder(metricTypes, {
          accuracies: ['s', 'ms'],
          metricTypes: ['httpRequestsSummary'],
        });
        recordRequest(start, recordingOptions);
      });

      it('should record on `httpRequestDurationPerPercentileInMilliseconds`', () => {
        expect(
          metricTypes.httpRequestDurationPerPercentileInMilliseconds[0].observe
        ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
      });
    });
  });

  describe('with request count', () => {
    beforeEach(() => {
      recordRequest = createRequestRecorder(metricTypes, {
        metricTypes: ['httpRequestsTotal'],
      });
      recordRequest(start, recordingOptions);
    });
    it('should record on `httpRequestsTotal`', () => {
      expect(metricTypes.httpRequestsTotal[0].inc).toHaveBeenCalledWith(
        recordingOptions.labels
      );
    });
  });
});
