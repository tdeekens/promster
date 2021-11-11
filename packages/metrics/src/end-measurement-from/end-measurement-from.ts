import type { TRequestTiming } from '@promster/types';

const NS_PER_SEC = BigInt(1e9);

function endMeasurementFrom(startTime: TRequestTiming) {
  const endTime = process.hrtime.bigint();

  return {
    durationS: Number((endTime - startTime) / NS_PER_SEC),
  };
}

export { endMeasurementFrom };
