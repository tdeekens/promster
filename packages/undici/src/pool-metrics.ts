import { Prometheus, defaultRegister } from '@promster/metrics';
import type { Pool } from 'undici';

// Define the stats we want to expose from undici Pool.stats
// See: https://github.com/nodejs/undici/blob/main/docs/docs/api/PoolStats.md

type TPoolsMetricsExporterOptions = {
  metricPrefix?: string;
};

export class ObservedPools {
  private pools: Map<string, Pool>;

  constructor(initialPools?: Record<string, Pool>) {
    this.pools = new Map();

    if (initialPools) {
      this.addMany(initialPools);
    }
  }

  add(origin: string, pool: Pool): void {
    this.pools.set(origin, pool);
  }

  addMany(pools: Record<string, Pool>): void {
    for (const [origin, pool] of Object.entries(pools)) {
      this.add(origin, pool);
    }
  }

  remove(origin: string): boolean {
    return this.pools.delete(origin);
  }

  get(origin: string): Pool | undefined {
    return this.pools.get(origin);
  }

  [Symbol.iterator](): IterableIterator<[string, Pool]> {
    return this.pools.entries();
  }
}

const observedPools = new ObservedPools();

function addObservedPool(origin: string, pool: Pool): void {
  observedPools.add(origin, pool);
}

function createPoolMetricsExporter(
  initialPools?: Record<string, Pool>,
  options?: TPoolsMetricsExporterOptions
): void {
  const metricName = `${options?.metricPrefix ?? ''}nodejs_undici_pool_stats`;

  if (initialPools) {
    observedPools.addMany(initialPools);
  }

  const _poolStatsGauge = new Prometheus.Gauge({
    name: metricName,
    help: 'Statistics for Undici connection pools. See https://github.com/nodejs/undici/blob/main/docs/docs/api/PoolStats.md',
    labelNames: ['origin', 'stat_name'],
    registers: [defaultRegister],
    collect() {
      for (const [origin, pool] of observedPools) {
        const stats = pool.stats;

        // If the pool has made no requests, it will not have stats
        if (!stats) {
          continue;
        }

        for (const [statName, value] of Object.entries(stats)) {
          if (typeof value === 'number' && !Number.isNaN(value)) {
            this.labels(origin, statName).set(value);
          }
        }
      }
    },
  });
}

export {
  createPoolMetricsExporter,
  addObservedPool,
  type TPoolsMetricsExporterOptions,
};
