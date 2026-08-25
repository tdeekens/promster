const NS_PER_SEC = 1e9;

function endMeasurementFrom(start: [number, number]) {
  const [seconds, nanoseconds] = process.hrtime(start);

  return {
    durationS: (seconds * NS_PER_SEC + nanoseconds) / NS_PER_SEC,
  };
}

export { endMeasurementFrom };
