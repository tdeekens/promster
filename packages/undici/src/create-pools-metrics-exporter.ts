import type { Pool } from 'undici';
import type { Registry } from 'prom-client';
import { Gauge, register as defaultRegister } from 'prom-client';

// Define the stats we want to expose from undici Pool.stats
// See: https://github.com/nodejs/undici/blob/main/docs/api/Pool.md#poolstats
const UNDICI_STATS_METRICS = [
  'requests.average', // Average number of requests completed per second.
  'requests.mean', // Alias for requests.average.
  'requests.stddev', // Standard deviation of requests completed per second.
  'requests.max', // Maximum number of requests completed per second.
  'requests.min', // Minimum number of requests completed per second.
  'requests.p50', // 50th percentile of requests completed per second.
  'requests.p90', // 90th percentile of requests completed per second.
  'requests.p99', // 99th percentile of requests completed per second.
  'requests.p999', // 999th percentile of requests completed per second.
  'latency.average', // Average latency in milliseconds.
  'latency.mean', // Alias for latency.average.
  'latency.stddev', // Standard deviation of latency in milliseconds.
  'latency.max', // Maximum latency in milliseconds.
  'latency.min', // Minimum latency in milliseconds.
  'latency.p50', // 50th percentile of latency in milliseconds.
  'latency.p90', // 90th percentile of latency in milliseconds.
  'latency.p99', // 99th percentile of latency in milliseconds.
  'latency.p999', // 999th percentile of latency in milliseconds.
  'pipelining.average', // Average pipelining size.
  'pipelining.mean', // Alias for pipelining.average.
  'pipelining.stddev', // Standard deviation of pipelining size.
  'pipelining.max', // Maximum pipelining size.
  'pipelining.min', // Minimum pipelining size.
  'pipelining.p50', // 50th percentile of pipelining size.
  'pipelining.p90', // 90th percentile of pipelining size.
  'pipelining.p99', // 99th percentile of pipelining size.
  'pipelining.p999', // 999th percentile of pipelining size.
  'size', // number of requests queued.
  'pending', // number of requests pending.
  'running', // number of requests running.
  'connected', // number of connections connected.
  'free', // number of connections free.
  'connections', // number of connections.
] as const;

interface TPoolsMetricsExporterOptions {
  /**
   * Optional prom-client registry.
   * @default require('prom-client').register
   */
  register?: Registry;
  /**
   * Optional prefix for metric names.
   * @default ''
   */
  metricPrefix?: string;
}

export function createPoolsMetricsExporter(
  pools: Pool[],
  options?: TPoolsMetricsExporterOptions
): void {
  const { register = defaultRegister, metricPrefix = '' } = options || {};

  if (!Array.isArray(pools) || pools.length === 0) {
    console.warn('Promster: No Undici pools provided to createPoolsMetricsExporter. No metrics will be exported.');
    return;
  }

  // Check if metric is already registered
  const metricName = `${metricPrefix}nodejs_undici_pool_stats`;
  const existingMetric = register.getSingleMetric(metricName);

  if (existingMetric) {
    // Maybe warn? Or assume it's okay if called multiple times with same registry?
    // For now, let's just return to avoid re-registering collectors.
    console.warn(`Promster: Metric ${metricName} is already registered. Skipping registration.`);
    return;
  }

  // Assign to _poolStatsGauge to indicate the variable is unused but registration side-effect is intended
  const _poolStatsGauge = new Gauge({
    name: metricName,
    help: 'Statistics for Undici connection pools',
    labelNames: ['origin', 'stat'],
    registers: [register],
    collect() {
      // This function is called when Prometheus scrapes metrics
      this.reset(); // Reset gauges to remove stale data if pools change (though we don't support dynamic pools here)

      for (const pool of pools) {
        if (pool && typeof pool.stats === 'object' && pool.stats !== null && pool.origin) {
          const stats = pool.stats;
          const origin = pool.origin.toString();

          for (const statName of UNDICI_STATS_METRICS) {
            let value: number | undefined;

            // Access nested stats like 'requests.average'
            if (statName.includes('.')) {
              const [category, subStat] = statName.split('.') as [keyof typeof stats, string];
              const categoryStats = stats[category];
              if (categoryStats && typeof categoryStats === 'object' && subStat in categoryStats) {
                value = (categoryStats as any)[subStat];
              }
            } else {
               value = (stats as any)[statName];
            }

            if (typeof value === 'number' && !Number.isNaN(value)) {
              this.labels(origin, statName).set(value);
            } else {
              // Optionally log or handle missing/invalid stats
              // console.debug(`Promster: Stat ${statName} not found or invalid for origin ${origin}`);
            }
          }
        } else {
           console.warn(`Promster: Skipping invalid or incomplete pool object: ${pool?.origin?.toString() ?? 'unknown origin'}`);
        }
      }
    },
  });
}
