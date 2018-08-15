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
  options = { accuracies: ['s'] }
) => {
  return (start, options) => {
    const { durationMs, durationS } = endMeasurmentFrom(start);
    const labels = sortLabels(options.labels);

    if (options.accuracies.includes('ms')) {
      metricTypes.percentilesInMilliseconds.observe(labels, durationMs);
      metricTypes.percentilesInSeconds.observe(labels, durationS);
    }
    if (options.accuracies.includes('s')) {
      metricTypes.bucketsInMilliseconds.observe(labels, durationMs);
      metricTypes.bucketsInSeconds.observe(labels, durationS);
    }
  };
};

exports.default = createRequestObserver;
