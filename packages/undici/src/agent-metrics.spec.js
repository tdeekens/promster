import { createMiddleware as createExpressMetricsMiddleware } from '@promster/express';
import { createServer as createPrometheusMetricsServer } from '@promster/server';
import express from 'express';
import parsePrometheusTextFormat from 'parse-prometheus-text-format';
import { MockAgent } from 'undici';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  addObservedAgent,
  createAgentMetricsExporter,
  supportedAgentStats,
} from './agent-metrics';

const metricsPort = '1344';
const appPort = '3023';

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

describe('agent metrics', () => {
  let mockAgent;

  beforeAll(async () => {
    mockAgent = new MockAgent({ connections: 1 });
    mockAgent.disableNetConnect();

    const originA = 'http://localhost:9001';
    const originB = 'http://localhost:9002';

    const agentA = mockAgent.get(originA);
    const agentB = mockAgent.get(originB);

    agentA
      .intercept({ path: '/', method: 'GET' })
      .reply(200, { message: 'ok-a' });
    agentB
      .intercept({ path: '/', method: 'POST' })
      .reply(200, { message: 'ok-b' });

    createAgentMetricsExporter([agentA]);
    addObservedAgent(agentB);

    const requestToAgentA = await agentA.request({ path: '/', method: 'GET' });
    await requestToAgentA.body.dump();

    const requestToAgentB = await agentB.request({ path: '/', method: 'POST' });
    await requestToAgentB.body.dump();
  });

  afterAll(() => {
    // Close the mock agent
    mockAgent.close();
  });

  it.each(supportedAgentStats)(
    'for undici agent %s metric',
    async (statName) => {
      const response = await fetch(metricsServerUrl);
      const rawMetrics = await response.text();

      const parsedMetrics = parsePrometheusTextFormat(rawMetrics);

      const nodejsUndiciAgentStats = parsedMetrics.find(
        (metric) => metric.name === `nodejs_undici_agent_${statName}`
      ).metrics;

      const expectedMetrics = {
        connected: [],
        free: [],
        pending: [],
        queued: [],
        running: [],
        size: [],
      };

      // Use array containment assertion
      expect(nodejsUndiciAgentStats).toEqual(expectedMetrics[statName]);
    }
  );

  it('should expose the total number of agents', async () => {
    const response = await fetch(metricsServerUrl);
    const rawMetrics = await response.text();

    const parsedMetrics = parsePrometheusTextFormat(rawMetrics);
    const observedAgentsCounter = parsedMetrics.find(
      (metric) => metric.name === 'nodejs_undici_agents_total'
    );

    expect(observedAgentsCounter).toBeDefined();
    expect(observedAgentsCounter.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: '2',
        }),
      ])
    );
  });
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
