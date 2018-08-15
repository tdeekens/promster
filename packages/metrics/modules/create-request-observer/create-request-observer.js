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

const createRequestObserver = (
  metricTypes,
  observerOptions = { accuracies: ['s'] }
) => {
  return (start, recordingOptions) => {
    const { durationMs, durationS } = endMeasurmentFrom(start);
    const labels = sortLabels(recordingOptions.labels);

    if (observerOptions.accuracies.includes('ms')) {
      metricTypes.bucketsInMilliseconds.observe(labels, durationMs);
      metricTypes.percentilesInMilliseconds.observe(labels, durationMs);
    }
    if (observerOptions.accuracies.includes('s')) {
      metricTypes.bucketsInSeconds.observe(labels, durationS);
      metricTypes.percentilesInSeconds.observe(labels, durationS);
    }
  };
};

exports.default = createRequestObserver;
