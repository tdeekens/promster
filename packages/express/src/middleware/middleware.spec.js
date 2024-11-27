import { createServer as createPrometheusMetricsServer } from '@promster/server';
import express from 'express';
import parsePrometheusTextFormat from 'parse-prometheus-text-format';
import { createMiddleware } from './middleware';

const metricsPort = '1338';
const appPort = '3001';

const metricsServerUrl = `http://localhost:${metricsPort}`;
const appServerUrl = `http://localhost:${appPort}`;

async function startServer() {
  const app = express();

  app.use(createMiddleware({ app }));

  const prometheusMetricsServer = await createPrometheusMetricsServer({
    port: metricsPort,
    detectKubernetes: false,
  });

  app.get('/', (_req, res) => {
    res.send('I am the server!');
  });

  const server = app.listen(appPort);

  return {
    close: async () =>
      Promise.all([
        new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) {
              reject(err);

              return;
            }

            resolve();
          });
        }),
        new Promise((resolve, reject) => {
          prometheusMetricsServer.close((err) => {
            if (err) {
              reject(err);

              return;
            }

            resolve();
          });
        }),
      ]),
    app,
  };
}

let app;
let closeServer;

beforeAll(async () => {
  const startedServer = await startServer();

  app = startedServer.app;
  closeServer = startedServer.close;
});

afterAll(async () => {
  await closeServer();
});

it('should expose Prometheus on locals', async () => {
  expect(app.locals.Prometheus).toBeDefined();
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

it('should expose http metrics', async () => {
  const response = await fetch(metricsServerUrl);
  const rawMetrics = await response.text();

  const parsedMetrics = parsePrometheusTextFormat(rawMetrics);

  expect(parsedMetrics).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'http_requests_total',
      }),
      expect.objectContaining({
        name: 'http_request_duration_seconds',
      }),
    ])
  );
});

it('should record http metrics', async () => {
  await fetch(appServerUrl);
  const response = await fetch(metricsServerUrl);
  const rawMetrics = await response.text();

  const parsedMetrics = parsePrometheusTextFormat(rawMetrics);
  const httpRequestsTotal = parsedMetrics.find(
    (metric) => metric.name === 'http_requests_total'
  ).metrics;

  expect(httpRequestsTotal).toMatchInlineSnapshot(`
    [
      {
        "labels": {
          "method": "get",
          "path": "/",
          "status_code": "200",
        },
        "value": "1",
      },
    ]
  `);

  const httpRequestDurationSeconds = parsedMetrics.find(
    (metric) => metric.name === 'http_request_duration_seconds'
  ).metrics;

  expect(httpRequestDurationSeconds).toMatchInlineSnapshot(`
    [
      {
        "buckets": {
          "+Inf": "1",
          "0.05": "1",
          "0.1": "1",
          "0.3": "1",
          "0.5": "1",
          "0.8": "1",
          "1": "1",
          "1.5": "1",
          "10": "1",
          "2": "1",
          "3": "1",
        },
      },
    ]
  `);
});
