const {} = require('../types');

const NS_PER_SEC = 1e9;

const endMeasurmentFrom = start => {
  const [seconds, nanoseconds] = process.hrtime(start);

  // NOTE: Math to get a millisecond based duration which is a good
  // default for Prometheus metrics.
  return Math.round((seconds * NS_PER_SEC + nanoseconds) / 1000);
};

const observe = (start, options) => {
  const durationMs = endMeasurmentFrom(start);

  metrics.duration.observe(options.labels, duration);
  metrics.buckets.observe(options.labels, duration);
};

exports.default = observe;
