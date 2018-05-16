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

  // NOTE: Math to get a millisecond based duration which is a good
  // default for Prometheus metrics.
  return Math.round((seconds * NS_PER_SEC + nanoseconds) / NS_PER_MS);
};

const createObserver = options => {
  const metrics = createMetricTypes(options);

  return (start, options) => {
    const durationMs = endMeasurmentFrom(start);
    const labels = sortLabels(options.labels);

    metrics.percentiles.observe(labels, durationMs);
    metrics.buckets.observe(labels, durationMs);
  };
};

exports.default = createObserver;
