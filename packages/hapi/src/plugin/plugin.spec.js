const Hapi = require('@hapi/hapi');
const fetch = require('node-fetch');
const parsePrometheusTextFormat = require('parse-prometheus-text-format');
const {
  createServer: createPrometheusMetricsServer,
} = require('@promster/server');
const {
  createPlugin,
  getAreServerEventsSupported,
  getDoesResponseNeedInvocation,
} = require('./plugin');

async function startServers() {
  const server = new Hapi.Server({
    port: 3000,
    debug: { request: ['error'] },
  });

  const prometheusMetricsServer = await createPrometheusMetricsServer({
    port: 1337,
    detectKubernetes: false,
  });

  await server.register(createPlugin());

  server.route({
    method: 'GET',
    path: '/',
    config: { auth: false },
    handler: () => ({ status: 'ok' }),
  });

  await server.start();

  return {
    close: async () =>
      Promise.all([
        server.stop(),
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
  };
}

let closeServers;

beforeAll(async () => {
  const startedServers = await startServers();

  closeServers = startedServers.close;
});

afterAll(async () => {
  await closeServers();
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
    Array [
      Object {
        "labels": Object {
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
    Array [
      Object {
        "buckets": Object {
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

describe('getAreServerEventsSupported', () => {
  describe('when server supports events', () => {
    it('should return `true`', () => {
      expect(getAreServerEventsSupported('17.0.0')).toBe(true);
      expect(getAreServerEventsSupported('17.1.0')).toBe(true);
      expect(getAreServerEventsSupported('18.0.0')).toBe(true);
    });
  });

  describe('when server does not support events', () => {
    it('should return `false`', () => {
      expect(getAreServerEventsSupported('16.0.0')).toBe(false);
      expect(getAreServerEventsSupported('15.4.0')).toBe(false);
    });
  });
});

describe('getDoesResponseNeedInvocation', () => {
  describe('when server needs reply continue invocation', () => {
    it('should return `true`', () => {
      expect(getDoesResponseNeedInvocation('16.0.0')).toBe(true);
      expect(getDoesResponseNeedInvocation('15.1.0')).toBe(true);
    });
  });

  describe('when server does not need reply continue invocation', () => {
    it('should return `false`', () => {
      expect(getDoesResponseNeedInvocation('17.0.0')).toBe(false);
    });
  });
});
