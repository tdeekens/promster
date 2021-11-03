import type { TRequestTiming } from '@promster/types';

const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;

function endMeasurementFrom(start: TRequestTiming) {
  const [seconds, nanoseconds] = process.hrtime(start);

  return {
    durationMs: Math.round((seconds * NS_PER_SEC + nanoseconds) / NS_PER_MS),
    durationS: (seconds * NS_PER_SEC + nanoseconds) / NS_PER_SEC,
  };
}

export { endMeasurementFrom };
