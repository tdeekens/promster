const express = require('express');
const fetch = require('node-fetch');
const parsePrometheusTextFormat = require('parse-prometheus-text-format');
const { createMiddleware } = require('./middleware');
const {
  createServer: createPrometheusMetricsServer,
} = require('@promster/server');

async function startServer() {
  const app = express();

  app.use(createMiddleware({ app }));

  const prometheusMetricsServer = await createPrometheusMetricsServer({
    port: 1337,
    detectKubernetes: false,
  });

  app.get('/', (req, res) => {
    res.send('I am the server!');
  });

  const port = 3000;

  const server = app.listen(port);

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
let closeServers;

beforeAll(async () => {
  const startedServer = await startServer();

  app = startedServer.app;
  closeServers = startedServer.close;
});

afterAll(async () => {
  await closeServers();
});

it('should expose Prometheus on locals', async () => {
  expect(app.locals.Prometheus).toBeDefined();
});

it('should up metric', async () => {
  const response = await fetch('http://0.0.0.0:1337');
  const rawMetrics = await response.text();

  const parsedMetrics = parsePrometheusTextFormat(rawMetrics);

  expect(parsedMetrics).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'up',
      }),
    ])
  );
});

it('should expose garbage collection metrics', async () => {
  const response = await fetch('http://0.0.0.0:1337');
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

it('should expose http metrics', async () => {
  const response = await fetch('http://0.0.0.0:1337');
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
  await fetch('http://0.0.0.0:3000');
  const response = await fetch('http://0.0.0.0:1337');
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
