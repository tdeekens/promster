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

const defaultOptions = {
  observerOptions: { accuracies: ['s'] },
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

    if (defaultedObserverOptions.accuracies.includes('ms')) {
      metricTypes.bucketsInMilliseconds.observe(labels, durationMs);
      metricTypes.percentilesInMilliseconds.observe(labels, durationMs);
    }
    if (defaultedObserverOptions.accuracies.includes('s')) {
      metricTypes.bucketsInSeconds.observe(labels, durationS);
      metricTypes.percentilesInSeconds.observe(labels, durationS);
    }
  };
};
createRequestObserver.defaultOptions = defaultOptions;

exports.default = createRequestObserver;
exports.sortLabels = sortLabels;
exports.endMeasurmentFrom = endMeasurmentFrom;
