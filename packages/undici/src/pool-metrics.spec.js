import { createMiddleware as createExpressMetricsMiddleware } from '@promster/express';
import { createServer as createPrometheusMetricsServer } from '@promster/server';
import express from 'express';
import parsePrometheusTextFormat from 'parse-prometheus-text-format';
import { MockAgent, Pool, request as undiciRequest } from 'undici';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createPoolsMetricsExporter, observedPools } from './pool-metrics';

const metricsPort = '1340';
const appPort = '3011';

const metricsServerUrl = `http://localhost:${metricsPort}`;
const appServerUrl = `http://localhost:${appPort}`;

async function startServer() {
  const app = express();

  app.use(createExpressMetricsMiddleware({ app }));

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

it('should expose undici metrics of pools', async () => {
  const mockAgent = new MockAgent({ connections: 1 });
  mockAgent.disableNetConnect();

  const originA = 'http://localhost:9001';
  const originB = 'http://localhost:9002';

  const poolA = mockAgent.get(originA);
  const poolB = mockAgent.get(originB);

  poolA.intercept({ path: '/', method: 'GET' }).reply(200, { message: 'ok-a' });
  poolB
    .intercept({ path: '/', method: 'POST' })
    .reply(200, { message: 'ok-b' });

  // The pool is a mock pool which doesn't have the stats property.
  poolA.stats = {};
  poolB.stats = {};

  poolA.stats.size = 100;
  poolA.stats.running = 0;
  poolA.stats.free = 100;
  poolB.stats.size = 50;
  poolB.stats.connected = 1;
  poolB.stats.free = 50;

  createPoolsMetricsExporter({ poolA });
  observedPools.add('poolB', poolB);

  const requestToPoolA = await poolA.request({ path: '/', method: 'GET' });
  await requestToPoolA.body.dump();

  const requestToPoolB = await poolB.request({ path: '/', method: 'POST' });
  await requestToPoolB.body.dump();

  const response = await fetch(metricsServerUrl);
  const rawMetrics = await response.text();

  const parsedMetrics = parsePrometheusTextFormat(rawMetrics);

  expect(parsedMetrics).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'nodejs_undici_pool_stats',
      }),
    ])
  );

  const nodejsUndiciPoolStats = parsedMetrics.find(
    (metric) => metric.name === 'nodejs_undici_pool_stats'
  ).metrics;

  expect(nodejsUndiciPoolStats).toMatchInlineSnapshot(`
    [
      {
        "labels": {
          "pool": "poolA",
          "stat": "size",
        },
        "value": "100",
      },
      {
        "labels": {
          "pool": "poolA",
          "stat": "running",
        },
        "value": "0",
      },
      {
        "labels": {
          "pool": "poolA",
          "stat": "free",
        },
        "value": "100",
      },
      {
        "labels": {
          "pool": "poolB",
          "stat": "size",
        },
        "value": "50",
      },
      {
        "labels": {
          "pool": "poolB",
          "stat": "connected",
        },
        "value": "1",
      },
      {
        "labels": {
          "pool": "poolB",
          "stat": "free",
        },
        "value": "50",
      },
    ]
  `);

  await mockAgent?.close();
});

it('should record the http metrics of requests made', async () => {
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
