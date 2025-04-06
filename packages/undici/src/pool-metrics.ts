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

const supportedPoolStats = [
  'connected',
  'free',
  'pending',
  'queued',
  'running',
  'size',
];

function createPoolMetricsExporter(
  initialPools?: Record<string, Pool>,
  options?: TPoolsMetricsExporterOptions
): void {
  const metricName = `${options?.metricPrefix ?? ''}nodejs_undici_pool`;

  if (initialPools) {
    observedPools.addMany(initialPools);
  }

  for (const supportedStat of supportedPoolStats) {
    const _poolStatsGauge = new Prometheus.Gauge({
      name: `${metricName}_${supportedStat}`,
      help: `Statistics for Undici connection pools ${supportedStat} stat. See https://github.com/nodejs/undici/blob/main/docs/docs/api/PoolStats.md`,
      labelNames: ['origin'],
      registers: [defaultRegister],
      collect() {
        for (const [origin, pool] of observedPools) {
          const stats = pool.stats;

          // If the pool has made no requests, it will not have stats
          if (!stats) {
            continue;
          }

          const statValue = stats[supportedStat];

          if (typeof statValue === 'number' && !Number.isNaN(statValue)) {
            this.labels(origin).set(statValue);
          }
        }
      },
    });
  }
}

export {
  createPoolMetricsExporter,
  supportedPoolStats,
  addObservedPool,
  type TPoolsMetricsExporterOptions,
};
