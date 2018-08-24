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
    durationS: seconds,
  };
};

const shouldObserveMetricType = (metricType, options) =>
  options.metricTypes.includes(metricType);
const shouldObserveMetricAccuracy = (accuracy, options) =>
  options.accuracies.includes(accuracy);

const defaultOptions = {
  accuracies: ['s'],
  metricTypes: [
    'httpRequestsTotal',
    'httpRequestsHistogram',
    'httpRequestsSummary',
  ],
};
const createRequestObserver = (
  metricTypes,
  observerOptions = defaultOptions
) => {
  const defaultedObserverOptions = {
    ...defaultOptions,
    ...observerOptions,
  };
  return (start, recordingOptions) => {
    const { durationMs, durationS } = endMeasurmentFrom(start);
    const labels = sortLabels(recordingOptions.labels);

    if (
      shouldObserveMetricAccuracy('ms', defaultedObserverOptions) &&
      shouldObserveMetricType('httpRequestsHistogram', defaultedObserverOptions)
    ) {
      metricTypes.bucketsInMilliseconds.observe(labels, durationMs);
    }
    if (
      shouldObserveMetricAccuracy('ms', defaultedObserverOptions) &&
      shouldObserveMetricType('httpRequestsSummary', defaultedObserverOptions)
    ) {
      metricTypes.percentilesInMilliseconds.observe(labels, durationMs);
    }
    if (
      shouldObserveMetricAccuracy('s', defaultedObserverOptions) &&
      shouldObserveMetricType('httpRequestsHistogram', defaultedObserverOptions)
    ) {
      metricTypes.bucketsInSeconds.observe(labels, durationS);
    }
    if (
      shouldObserveMetricAccuracy('s', defaultedObserverOptions) &&
      shouldObserveMetricType('httpRequestsSummary', defaultedObserverOptions)
    ) {
      metricTypes.percentilesInSeconds.observe(labels, durationS);
    }
    if (
      shouldObserveMetricType('httpRequestsTotal', defaultedObserverOptions)
    ) {
      metricTypes.requestsTotal.inc(labels);
    }
  };
};
createRequestObserver.defaultOptions = defaultOptions;

exports.default = createRequestObserver;
exports.sortLabels = sortLabels;
exports.endMeasurmentFrom = endMeasurmentFrom;
