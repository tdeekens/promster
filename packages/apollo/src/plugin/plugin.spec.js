import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { createServer as createPrometheusMetricsServer } from '@promster/server';
import gql from 'graphql-tag';
import parsePrometheusTextFormat from 'parse-prometheus-text-format';
import { afterAll, beforeAll, expect, it } from 'vitest';

import { createPlugin as createPromsterMetricsPlugin } from './plugin';

function throwErrorDirectiveTransformer(schema, directiveName = 'error') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD](fieldConfig) {
      const directive = getDirective(schema, fieldConfig, directiveName);

      const firstErrorDirective = directive?.[0];

      if (firstErrorDirective) {
        fieldConfig.resolve = () => {
          throw new Error('test');
        };
      }

      return fieldConfig;
    },
  });
}

const metricsPort = '1337';
const appPort = 3000;

const metricsServerUrl = `http://localhost:${metricsPort}`;

async function startServer() {
  const typeDefs = [
    gql`
      directive @error(reason: String = "test") on FIELD_DEFINITION

      type Book {
        title: String
        author: String
        isbn: String @error
      }

      type Query {
        books: [Book]
      }
    `,
  ];

  const books = [
    {
      title: 'The Awakening',
      author: 'Kate Chopin',
      isbn: '9780393044348',
    },
    {
      title: 'City of Glass',
      author: 'Paul Auster',
      isbn: '9788433970831',
    },
  ];

  const resolvers = {
    Query: {
      books: () => books,
    },
  };

  let schema = makeExecutableSchema({ typeDefs, resolvers });
  schema = throwErrorDirectiveTransformer(schema);

  const server = new ApolloServer({
    schema,
    plugins: [createPromsterMetricsPlugin()],
  });

  const prometheusMetricsServer = await createPrometheusMetricsServer({
    port: metricsPort,
    detectKubernetes: false,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: appPort },
  });

  return {
    close: async () =>
      Promise.all([
        server.stop(),
        new Promise((resolve, reject) => {
          prometheusMetricsServer.close((err) => {
            if (err) {
              reject(err);
            }
            resolve();
          });
        }),
      ]),
    url,
  };
}

let serverUrl;
let closeServer;

beforeAll(async () => {
  const startedServer = await startServer();
  serverUrl = startedServer.url;
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

it('should expose GraphQL metrics', async () => {
  const response = await fetch(metricsServerUrl);
  const rawMetrics = await response.text();

  const parsedMetrics = parsePrometheusTextFormat(rawMetrics);

  expect(parsedMetrics).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'graphql_errors_total',
      }),
      expect.objectContaining({
        name: 'graphql_request_duration_seconds',
      }),
      expect.objectContaining({
        name: 'graphql_resolve_field_duration_seconds',
      }),
      expect.objectContaining({
        name: 'graphql_validation_duration_seconds',
      }),
      expect.objectContaining({
        name: 'graphql_parse_duration_seconds',
      }),
    ])
  );
});

it('should record GraphQL metrics for successful requests', async () => {
  await fetch(serverUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
          query MyBooks {
            books {
              title
            }
          }
        `,
    }),
  });

  const response = await fetch(metricsServerUrl);
  const rawMetrics = await response.text();

  const parsedMetrics = parsePrometheusTextFormat(rawMetrics);
  const graphQlRequestDurationSeconds = parsedMetrics.find(
    (metric) => metric.name === 'graphql_request_duration_seconds'
  ).metrics;

  expect(graphQlRequestDurationSeconds).toMatchInlineSnapshot(`
    [
      {
        "buckets": {
          "+Inf": "1",
          "0.5": "1",
          "0.9": "1",
          "0.95": "1",
          "0.98": "1",
          "0.99": "1",
        },
      },
    ]
  `);

  const graphQlResolveFieldDurationSeconds = parsedMetrics.find(
    (metric) => metric.name === 'graphql_resolve_field_duration_seconds'
  ).metrics;

  expect(graphQlResolveFieldDurationSeconds).toMatchInlineSnapshot(`
    [
      {
        "buckets": {
          "+Inf": "2",
          "0.5": "2",
          "0.9": "2",
          "0.95": "2",
          "0.98": "2",
          "0.99": "2",
        },
      },
    ]
  `);
});

it('should record GraphQL metrics for failed requests in validation phase', async () => {
  await fetch(serverUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
          query MyBooks {
            books {
              titles
            }
          }
        `,
    }),
  });

  const response = await fetch(metricsServerUrl);
  const rawMetrics = await response.text();

  const parsedMetrics = parsePrometheusTextFormat(rawMetrics);
  const graphQlErrorsTotal = parsedMetrics.find(
    (metric) => metric.name === 'graphql_errors_total'
  ).metrics;

  expect(graphQlErrorsTotal).toMatchInlineSnapshot(`
    [
      {
        "labels": {
          "operation_name": "undefined",
          "phase": "validation",
        },
        "value": "1",
      },
    ]
  `);
});

it('should record GraphQL metrics for failed requests in execute phase', async () => {
  await fetch(serverUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
          query MyBooks {
            books {
              isbn
            }
          }
        `,
    }),
  });

  const response = await fetch(metricsServerUrl);
  const rawMetrics = await response.text();

  const parsedMetrics = parsePrometheusTextFormat(rawMetrics);
  const graphQlErrorsTotal = parsedMetrics.find(
    (metric) => metric.name === 'graphql_errors_total'
  ).metrics;

  expect(graphQlErrorsTotal).toMatchInlineSnapshot(`
    [
      {
        "labels": {
          "operation_name": "undefined",
          "phase": "validation",
        },
        "value": "1",
      },
      {
        "labels": {
          "field_name": "isbn",
          "operation_name": "undefined",
          "phase": "execution",
        },
        "value": "2",
      },
    ]
  `);
});
