const { createMetricTypes } = require('../types');

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

const createObserver = options => {
  const metrics = createMetricTypes(options);

  return (start, options) => {
    const { durationMs, durationS } = endMeasurmentFrom(start);
    const labels = sortLabels(options.labels);

    metrics.percentilesInMilliseconds.observe(labels, durationMs);
    metrics.percentilesInSeconds.observe(labels, durationS);
    metrics.bucketsInMilliseconds.observe(labels, durationMs);
    metrics.bucketsInSeconds.observe(labels, durationS);
  };
};

exports.default = createObserver;
