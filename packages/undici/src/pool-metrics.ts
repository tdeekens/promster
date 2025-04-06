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

  add(name: string, pool: Pool): void {
    this.pools.set(name, pool);
  }

  addMany(pools: Record<string, Pool>): void {
    for (const [name, pool] of Object.entries(pools)) {
      this.add(name, pool);
    }
  }

  remove(name: string): boolean {
    return this.pools.delete(name);
  }
  /**
   * Get a pool by name
   * @returns The pool or undefined if not found
   */
  get(name: string): Pool | undefined {
    return this.pools.get(name);
  }

  [Symbol.iterator](): IterableIterator<[string, Pool]> {
    return this.pools.entries();
  }
}

const observedPools = new ObservedPools();

function createPoolsMetricsExporter(
  pools: Record<string, Pool>,
  options?: TPoolsMetricsExporterOptions
): void {
  const metricName = `${options?.metricPrefix ?? ''}nodejs_undici_pool_stats`;

  observedPools.addMany(pools);

  const _poolStatsGauge = new Prometheus.Gauge({
    name: metricName,
    help: 'Statistics for Undici connection pools. See https://github.com/nodejs/undici/blob/main/docs/docs/api/PoolStats.md',
    labelNames: ['pool', 'stat'],
    registers: [defaultRegister],
    collect() {
      for (const [poolName, pool] of observedPools) {
        const stats = pool.stats;

        // If the pool has made no requests, it will not have stats
        if (!stats) {
          continue;
        }

        for (const [statName, value] of Object.entries(stats)) {
          if (typeof value === 'number' && !Number.isNaN(value)) {
            this.labels(poolName, statName).set(value);
          }
        }
      }
    },
  });
}

export {
  createPoolsMetricsExporter,
  observedPools,
  type TPoolsMetricsExporterOptions,
};
