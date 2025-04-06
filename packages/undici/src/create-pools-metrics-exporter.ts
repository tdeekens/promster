import { Prometheus, defaultRegister } from '@promster/metrics';
import type { Pool } from 'undici';

// Define the stats we want to expose from undici Pool.stats
// See: https://github.com/nodejs/undici/blob/main/docs/docs/api/PoolStats.md

interface TPoolsMetricsExporterOptions {
  metricPrefix?: string;
}

export function createPoolsMetricsExporter(
  pools: Record<string, Pool>,
  options?: TPoolsMetricsExporterOptions
): void {
  const metricName = `${options?.metricPrefix ?? ''}nodejs_undici_pool_stats`;
  const _poolStatsGauge = new Prometheus.Gauge({
    name: metricName,
    help: 'Statistics for Undici connection pools. See https://github.com/nodejs/undici/blob/main/docs/docs/api/PoolStats.md',
    labelNames: ['pool', 'stat'],
    registers: [defaultRegister],
    collect() {
      for (const poolName of Object.keys(pools)) {
        const pool = pools[poolName];
        const stats = pool.stats;

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
