import { afterAll, describe, expect, it } from 'vitest';

import { Prometheus, defaultRegister } from '../src/client';

// NOTE:
//   The names below are what consumers scrape and build dashboards and alerts
//   on, and they come from the client rather than from promster. A client
//   upgrade that drops or renames one of them is a breaking change for every
//   downstream, and nothing else in this suite would notice. Pinning the set
//   turns that into a failing test.
//
//   Additions are expected and harmless, so this asserts the list is fully
//   contained rather than exactly equal. Removals and renames fail.
const expectedDefaultMetricNames = [
  'nodejs_active_handles',
  'nodejs_active_handles_total',
  'nodejs_active_requests',
  'nodejs_active_requests_total',
  'nodejs_active_resources',
  'nodejs_active_resources_total',
  'nodejs_eventloop_lag_max_seconds',
  'nodejs_eventloop_lag_mean_seconds',
  'nodejs_eventloop_lag_min_seconds',
  'nodejs_eventloop_lag_p50_seconds',
  'nodejs_eventloop_lag_p90_seconds',
  'nodejs_eventloop_lag_p99_seconds',
  'nodejs_eventloop_lag_seconds',
  'nodejs_eventloop_lag_stddev_seconds',
  'nodejs_external_memory_bytes',
  'nodejs_gc_duration_seconds',
  'nodejs_heap_size_total_bytes',
  'nodejs_heap_size_used_bytes',
  'nodejs_heap_space_size_available_bytes',
  'nodejs_heap_space_size_total_bytes',
  'nodejs_heap_space_size_used_bytes',
  'nodejs_version_info',
  'process_cpu_seconds_total',
  'process_cpu_system_seconds_total',
  'process_cpu_user_seconds_total',
  'process_resident_memory_bytes',
  'process_start_time_seconds',
];

describe('default metrics', () => {
  Prometheus.collectDefaultMetrics();

  afterAll(() => {
    defaultRegister.clear();
  });

  it('should expose every default metric consumers rely on', async () => {
    const exposition = await defaultRegister.metrics();
    const names = exposition
      .split('\n')
      .filter((line) => line.startsWith('# TYPE '))
      .map((line) => line.split(' ')[2]);

    expect(names).toEqual(expect.arrayContaining(expectedDefaultMetricNames));
  });
});
