import { Prometheus, defaultRegister } from '@promster/metrics';
import {
  type Agent as TUndiciAgent,
  type Pool as TUndiciPool,
  Client as UndiciClient,
  Dispatcher as UndiciDispatcher,
  Pool as UndiciPool,
} from 'undici';

// Define the stats we want to expose from undici Pool.stats
// See: https://github.com/nodejs/undici/blob/main/docs/docs/api/PoolStats.md

type TPoolsMetricsExporterOptions = {
  metricPrefix?: string;
};

export class ObservedPools {
  private pools: Map<string, TUndiciPool>;

  constructor(initialPools?: Record<string, TUndiciPool>) {
    this.pools = new Map();

    if (initialPools) {
      this.addMany(initialPools);
    }
  }

  add(origin: string, pool: TUndiciPool): TUndiciPool {
    this.pools.set(origin, pool);

    return pool;
  }

  addMany(pools: Record<string, TUndiciPool>): void {
    for (const [origin, pool] of Object.entries(pools)) {
      this.add(origin, pool);
    }
  }

  remove(origin: string): boolean {
    return this.pools.delete(origin);
  }

  get(origin: string): TUndiciPool | undefined {
    return this.pools.get(origin);
  }

  get size(): number {
    return this.pools.size;
  }

  [Symbol.iterator](): IterableIterator<[string, TUndiciPool]> {
    return this.pools.entries();
  }
}

const observedPools = new ObservedPools();

function addObservedPool(origin: string, pool: TUndiciPool) {
  return observedPools.add(origin, pool);
}

class Agent extends UndiciDispatcher {
  constructor(opts?: TUndiciAgent.Options) {
    opts.factory = (origin: string | URL, opts: object) => {
      if (opts.connections === 1) {
        return new Client(origin, opts);
      }

      return addObservedPool(origin, new UndiciPool(origin, opts));
    };

    super(opts);
  }
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
  initialPools?: Record<string, TUndiciPool>,
  options?: TPoolsMetricsExporterOptions
): void {
  const metricName = `${options?.metricPrefix ?? ''}nodejs_undici_pool`;

  if (initialPools) {
    observedPools.addMany(initialPools);
  }

  new Prometheus.Gauge({
    name: `${metricName}s_total`,
    help: 'Number of Undici connection pools.',
    registers: [defaultRegister],
    collect() {
      this.set(observedPools.size);
    },
  });

  for (const supportedStat of supportedPoolStats) {
    new Prometheus.Gauge({
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
  Agent,
  type TPoolsMetricsExporterOptions,
};
