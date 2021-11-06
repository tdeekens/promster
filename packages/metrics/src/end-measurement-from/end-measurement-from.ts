import type { TRequestTiming } from '@promster/types';

const NS_PER_SEC = 1e9;

function endMeasurementFrom(start: TRequestTiming) {
  const [seconds, nanoseconds] = process.hrtime(start);

  return {
    durationS: (seconds * NS_PER_SEC + nanoseconds) / NS_PER_SEC,
  };
}

export { endMeasurementFrom };
