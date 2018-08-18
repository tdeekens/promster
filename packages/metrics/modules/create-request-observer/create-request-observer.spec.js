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
    bucketsInMilliseconds: {
      observe: jest.fn(),
    },
    percentilesInMilliseconds: {
      observe: jest.fn(),
    },
    bucketsInSeconds: {
      observe: jest.fn(),
    },
    percentilesInSeconds: {
      observe: jest.fn(),
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

    it('should record on bucketsInSeconds', () => {
      expect(metricTypes.bucketsInSeconds.observe).toHaveBeenCalledWith(
        recordingOptions.labels,
        expect.anything()
      );
    });

    it('should record on percentilesInSeconds', () => {
      expect(metricTypes.bucketsInSeconds.observe).toHaveBeenCalledWith(
        recordingOptions.labels,
        expect.anything()
      );
    });
  });

  describe('with second accuracy', () => {
    beforeEach(() => {
      requestObserver = createRequestObserver(metricTypes, {
        accuracies: ['s'],
      });
      requestObserver(start, recordingOptions);
    });

    it('should record on bucketsInSeconds', () => {
      expect(metricTypes.bucketsInSeconds.observe).toHaveBeenCalledWith(
        recordingOptions.labels,
        expect.anything()
      );
    });

    it('should record on percentilesInSeconds', () => {
      expect(metricTypes.bucketsInSeconds.observe).toHaveBeenCalledWith(
        recordingOptions.labels,
        expect.anything()
      );
    });
  });

  describe('with millisecond accuracy', () => {
    beforeEach(() => {
      requestObserver = createRequestObserver(metricTypes, {
        accuracies: ['ms'],
      });
      requestObserver(start, recordingOptions);
    });

    it('should record on bucketsInMilliseconds', () => {
      expect(metricTypes.bucketsInMilliseconds.observe).toHaveBeenCalledWith(
        recordingOptions.labels,
        expect.anything()
      );
    });

    it('should record on percentilesInMilliseconds', () => {
      expect(
        metricTypes.percentilesInMilliseconds.observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });
  });

  describe('with both second and millisecond accuracy', () => {
    beforeEach(() => {
      requestObserver = createRequestObserver(metricTypes, {
        accuracies: ['s', 'ms'],
      });
      requestObserver(start, recordingOptions);
    });

    it('should record on bucketsInSeconds', () => {
      expect(metricTypes.bucketsInSeconds.observe).toHaveBeenCalledWith(
        recordingOptions.labels,
        expect.anything()
      );
    });

    it('should record on percentilesInSeconds', () => {
      expect(metricTypes.bucketsInSeconds.observe).toHaveBeenCalledWith(
        recordingOptions.labels,
        expect.anything()
      );
    });

    it('should record on bucketsInMilliseconds', () => {
      expect(metricTypes.bucketsInMilliseconds.observe).toHaveBeenCalledWith(
        recordingOptions.labels,
        expect.anything()
      );
    });

    it('should record on percentilesInMilliseconds', () => {
      expect(
        metricTypes.percentilesInMilliseconds.observe
      ).toHaveBeenCalledWith(recordingOptions.labels, expect.anything());
    });
  });
});
