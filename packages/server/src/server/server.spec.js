const parsePrometheusTextFormat = require('parse-prometheus-text-format');
const { createGcMetrics } = require('@promster/metrics');
const { createServer } = require('./server');

const metricsPort = '1342';

const metricsServerUrl = `http://0.0.0.0:${metricsPort}`;

async function startServer() {
  const server = await createServer({
    port: metricsServerUrl,
    detectKubernetes: false,
  });

  // Needed to setup Prometheus.
  createGcMetrics();

  return {
    close: async () =>
      new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);

            return;
          }

          resolve();
        });
      }),
  };
}

let closeServer;

beforeAll(async () => {
  const startedServer = await startServer();

  closeServer = startedServer.close;
});

afterAll(async () => {
  await closeServer();
});

it('should up metric', async () => {
  const response = await fetch(metricsServerUrl);
  const rawMetrics = await response.text();

  const parsedMetrics = parsePrometheusTextFormat(rawMetrics);

  expect(parsedMetrics).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'nodejs_up',
      }),
    ])
  );
});

it('should expose garbage collection metrics', async () => {
  const response = await fetch(metricsServerUrl);
  const rawMetrics = await response.text();

  const parsedMetrics = parsePrometheusTextFormat(rawMetrics);

  expect(parsedMetrics).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'process_cpu_user_seconds_total',
      }),
      expect.objectContaining({
        name: 'process_cpu_system_seconds_total',
      }),
      expect.objectContaining({
        name: 'process_cpu_seconds_total',
      }),
      expect.objectContaining({
        name: 'process_start_time_seconds',
      }),
      expect.objectContaining({
        name: 'process_resident_memory_bytes',
      }),
      expect.objectContaining({
        name: 'nodejs_eventloop_lag_seconds',
      }),
      expect.objectContaining({
        name: 'nodejs_gc_runs_total',
      }),
      expect.objectContaining({
        name: 'nodejs_gc_duration_seconds',
      }),
      expect.objectContaining({
        name: 'nodejs_eventloop_lag_max_seconds',
      }),
      expect.objectContaining({
        name: 'nodejs_eventloop_lag_p50_seconds',
      }),
      expect.objectContaining({
        name: 'nodejs_version_info',
      }),
    ])
  );
});
