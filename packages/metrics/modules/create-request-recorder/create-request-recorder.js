const merge = require('merge-options');

const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;

const sortLabels = unsortedLabels => {
  return Object.keys(unsortedLabels)
    .sort((a, b) => a > b)
    .reduce((sortedLabels, labelName) => {
      sortedLabels[labelName] = unsortedLabels[labelName];
      return sortedLabels;
    }, {});
};

const endMeasurmentFrom = start => {
  const [seconds, nanoseconds] = process.hrtime(start);

  return {
    durationMs: Math.round((seconds * NS_PER_SEC + nanoseconds) / NS_PER_MS),
    durationS: (seconds * NS_PER_SEC + nanoseconds) / NS_PER_SEC,
  };
};

const shouldObserveMetricType = metricType => options =>
  options.metricTypes.includes(metricType);
const shouldObserveMetricAccuracy = accuracy => options =>
  options.accuracies.includes(accuracy);

const defaultOptions = {
  accuracies: ['s'],
  metricTypes: ['httpRequestsTotal', 'httpRequestsHistogram'],
  skip: () => false,
};
const createRequestRecorder = (
  metricTypes,
  recorderOptions = defaultOptions
) => {
  const defaultedRecorderOptions = merge(defaultOptions, recorderOptions);
  const shouldObserveInSeconds = shouldObserveMetricAccuracy('s')(
    defaultedRecorderOptions
  );
  const shouldObserveInMilliseconds = shouldObserveMetricAccuracy('ms')(
    defaultedRecorderOptions
  );
  const shouldObserveInSummary = shouldObserveMetricType('httpRequestsSummary')(
    defaultedRecorderOptions
  );
  const shouldObserveInHistogram = shouldObserveMetricType(
    'httpRequestsHistogram'
  )(defaultedRecorderOptions);
  const shouldObserveInCounter = shouldObserveMetricType('httpRequestsTotal')(
    defaultedRecorderOptions
  );

  return (start, recordingOptions) => {
    const { durationMs, durationS } = endMeasurmentFrom(start);
    const labels = sortLabels(recordingOptions.labels);

    if (shouldObserveInMilliseconds && shouldObserveInHistogram) {
      metricTypes.httpRequestDurationInMilliseconds.observe(labels, durationMs);
    }

    if (shouldObserveInMilliseconds && shouldObserveInSummary) {
      metricTypes.httpRequestDurationPerPercentileInMilliseconds.observe(
        labels,
        durationMs
      );
    }

    if (shouldObserveInSeconds && shouldObserveInHistogram) {
      metricTypes.httpRequestDurationInSeconds.observe(labels, durationS);
    }

    if (shouldObserveInSeconds && shouldObserveInSummary) {
      metricTypes.httpRequestDurationPerPercentileInSeconds.observe(
        labels,
        durationS
      );
    }

    if (shouldObserveInCounter) {
      metricTypes.httpRequestsTotal.inc(labels);
    }
  };
};

createRequestRecorder.defaultOptions = defaultOptions;

exports.default = createRequestRecorder;
exports.sortLabels = sortLabels;
exports.endMeasurmentFrom = endMeasurmentFrom;
