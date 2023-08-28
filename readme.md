<p align="center">
  <img alt="Logo" height="150" src="https://raw.githubusercontent.com/tdeekens/promster/main/logo.png" /><br /><br />
</p>

<h2 align="center">⏰ Promster - Measure metrics from Hapi, express, Marble.js, Apollo or Fastify servers with Prometheus 🚦</h2>
<p align="center">
  <b>Promster is an Prometheus Exporter for Node.js servers written for Express, Hapi, Marble.js, Apollo or Fastify.</b>
</p>

<p align="center">
  <sub>
  ❤️
  Hapi
  · Express
  · Marble.js
  · Fastify
  · Apollo
  · Prettier
  · TypeScript
  · Jest
  · ESLint
  · Changesets
  · Prometheus
  🙏
  </sub>
</p>

<p align="center">
  <a href="https://github.com/tdeekens/promster/actions/workflows/test.yml">
    <img alt="Test & build status" src="https://github.com/tdeekens/promster/actions/workflows/test.yml/badge.svg">
  </a>
  <a href="https://codecov.io/gh/tdeekens/promster">
    <img alt="Codecov Coverage Status" src="https://img.shields.io/codecov/c/github/tdeekens/promster.svg?style=flat-square">
  </a>
  <a href="https://app.fossa.io/projects/git%2Bgithub.com%2Ftdeekens%2Fpromster?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Ftdeekens%2Fpromster.svg?type=shield"/></a>
  <a href="https://snyk.io/test/github/tdeekens/promster"><img src="https://snyk.io/test/github/tdeekens/promster/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/{username}/{repo}" style="max-width:100%;"/></a>
  <img alt="Made with Coffee" src="https://img.shields.io/badge/made%20with-%E2%98%95%EF%B8%8F%20coffee-yellow.svg">
</p>

## ❯ Package Status

| Package                                   | Version                                                | Downloads                                                       |
| ----------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| [`promster/hapi`](/packages/hapi)         | [![hapi Version][hapi-icon]][hapi-version]             | [![hapi Downloads][hapi-downloads]][hapi-downloads]             |
| [`promster/express`](/packages/express)   | [![express Version][express-icon]][express-version]    | [![express Downloads][express-downloads]][express-downloads]    |
| [`promster/marblejs`](/packages/marblejs) | [![marblejs Version][marblejs-icon]][marblejs-version] | [![marblejs Downloads][marblejs-downloads]][marblejs-downloads] |
| [`promster/fastify`](/packages/fastify)   | [![fastify Version][fastify-icon]][fastify-version]    | [![fastify Downloads][fastify-downloads]][fastify-downloads]    |
| [`promster/apollo`](/packages/apollo)     | [![apollo Version][apollo-icon]][apollo-version]       | [![apollo Downloads][apollo-downloads]][apollo-downloads]       |
| [`promster/server`](/packages/server)     | [![server Version][server-icon]][server-version]       | [![server Downloads][server-downloads]][server-downloads]       |
| [`promster/metrics`](/packages/metrics)   | [![metrics Version][metrics-icon]][metrics-version]    | [![metrics Downloads][metrics-downloads]][metrics-downloads]    |

[metrics-version]: https://www.npmjs.com/package/@promster/metrics
[metrics-icon]: https://img.shields.io/npm/v/@promster/metrics.svg?style=flat-square
[metrics-downloads]: https://img.shields.io/npm/dm/@promster/metrics.svg
[hapi-version]: https://www.npmjs.com/package/@promster/hapi
[hapi-icon]: https://img.shields.io/npm/v/@promster/hapi.svg?style=flat-square
[hapi-dependencies]: https://david-dm.org/tdeekens/promster?path=packages/hapi
[hapi-dependencies-icon]: https://david-dm.org/tdeekens/promster/status.svg?style=flat-square&
[hapi-downloads]: https://img.shields.io/npm/dm/@promster/hapi.svg
[express-version]: https://www.npmjs.com/package/@promster/express
[express-icon]: https://img.shields.io/npm/v/@promster/express.svg?style=flat-square
[express-downloads]: https://img.shields.io/npm/dm/@promster/express.svg
[marblejs-version]: https://www.npmjs.com/package/@promster/marblejs
[marblejs-icon]: https://img.shields.io/npm/v/@promster/marblejs.svg?style=flat-square
[marblejs-downloads]: https://img.shields.io/npm/dm/@promster/marblejs.svg
[fastify-version]: https://www.npmjs.com/package/@promster/fastify
[fastify-icon]: https://img.shields.io/npm/v/@promster/fastify.svg?style=flat-square
[fastify-downloads]: https://img.shields.io/npm/dm/@promster/fastify.svg
[apollo-version]: https://www.npmjs.com/package/@promster/apollo
[apollo-icon]: https://img.shields.io/npm/v/@promster/apollo.svg?style=flat-square
[apollo-downloads]: https://img.shields.io/npm/dm/@promster/apollo.svg
[server-version]: https://www.npmjs.com/package/@promster/server
[server-icon]: https://img.shields.io/npm/v/@promster/server.svg?style=flat-square
[server-downloads]: https://img.shields.io/npm/dm/@promster/server.svg

## ❯ Why another Prometheus exporter for Express and Hapi?

> These packages are a combination of observations and experiences I have had with other exporters which I tried to fix.

1.  🏎 Use `process.hrtime.bigint()` for high-resolution real time in metrics in seconds (converting from nanoseconds)
    - `process.hrtime.bigint()` calls libuv's `uv_hrtime`, without system call like `new Date`
2.  ⚔️ Allow normalization of all pre-defined label values
3.  🖥 Expose Garbage Collection among other metric of the Node.js process by default
4.  🚨 Expose a built-in server to expose metrics quickly (on a different port) while also allowing users to integrate with existing servers
5.  📊 Define two metrics one histogram for buckets and a summary for percentiles for performant graphs in e.g. Grafana
6.  👩‍👩‍👧 One library to integrate with Hapi, Express and potentially more (managed as a mono repository)
7.  🦄 Allow customization of labels while sorting them internally before reporting
8.  🐼 Expose Prometheus client on Express locals or Hapi app to easily allow adding more app metrics

## ❯ Installation

This is a mono repository maintained using
[changesets](https://github.com/atlassian/changesets). It currently contains four
[packages](/packages) in a `metrics`, a `hapi` or
`express` integration, and a `server` exposing the metrics for you if you do not want to do that via your existing server.

Depending on the preferred integration use:

`yarn add @promster/express` or `npm i @promster/express --save`

or

`yarn add @promster/hapi` or `npm i @promster/hapi --save`

Please additionally make sure you have a `prom-client` installed. It is a peer dependency of `@promster` as some projects might already have an existing `prom-client` installed. Which otherwise would result in different default registries.

`yarn add prom-client` or `npm i prom-client --save`

## ❯ Documentation

Promster has to be setup with your server. Either as an Express middleware of an Hapi plugin. You can expose the gathered metrics via a built-in small server or through our own.

> Please, do not be scared by the variety of options. `@promster` can be setup without any additional configuration options and has sensible defaults. However, trying to suit many needs and different existing setups (e.g. metrics having recording rules over histograms) it comes with all those options listed below.

## The following metrics are exposed

### Garbage Collection

- `nodejs_up`: an indication if the nodejs server is started: either 0 (not up) or 1 (up)
- `nodejs_gc_runs_total`: total garbage collections count
- `nodejs_gc_pause_seconds_total`: time spent in garbage collection
- `nodejs_gc_reclaimed_bytes_total`: number of bytes reclaimed by garbage collection

With all garbage collection metrics a `gc_type` label with one of: `unknown`, `scavenge`, `mark_sweep_compact`, `scavenge_and_mark_sweep_compact`, `incremental_marking`, `weak_phantom` or `all` will be recorded.

### HTTP Timings (Hapi, Express, Marble.js and Fastify)

- `http_requests_total`: a Prometheus counter for the http request total
  - This metric is also exposed on the following histogram and summary which both have a `_sum` and `_count` and enabled for ease of use. It can be disabled by configuring with `metricTypes: Array<String>`.
- `http_request_duration_seconds`: a Prometheus histogram with request time buckets in seconds (defaults to `[ 0.05, 0.1, 0.3, 0.5, 0.8, 1, 1.5, 2, 3, 5, 10 ]`)
  - A histogram exposes a `_sum` and `_count` which are a duplicate to the above counter metric.
  - A histogram can be used to compute percentiles with a PromQL query using the `histogram_quantile` function. It is advised to create a Prometheus recording rule for performance.
- `http_request_duration_per_percentile_seconds`: a Prometheus summary with request time percentiles in seconds (defaults to `[ 0.5, 0.9, 0.99 ]`)
  - This metric is disabled by default and can be enabled by passing `metricTypes: ['httpRequestsSummary]`. It exists for cases in which the above histogram is not sufficient, slow or recording rules can not be set up.
- `http_request_content_length_bytes`: a Prometheus histogram with the request content length in bytes (defaults to `[ 100000, 200000, 500000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000, ]`)
  - This metric is disabled by default and can be enabled by passing `metricTypes: ['httpContentLengthHistogram]`.
- `http_response_content_length_bytes`: a Prometheus histogram with the request content length in bytes (defaults to `[ 100000, 200000, 500000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000, ]`)
  - This metric is disabled by default and can be enabled by passing `metricTypes: ['httpContentLengthHistogram]`.

In addition with each http request metric the following default labels are measured: `method`, `status_code` and `path`. You can configure more `labels` (see below).

- `http_requests_total`: a Prometheus counter for the total amount of http requests

You can also opt out of either the Prometheus summary or histogram by passing in `{ metricTypes: ['httpRequestsSummary'] }`, `{ metricTypes: ['httpRequestsHistogram'] }` or `{ metricTypes: ['httpRequestsTotal'] }`.

### GraphQL Timings (Apollo)

- `graphql_parse_duration_seconds`: a Prometheus histogram with the request parse duration in seconds.
- `graphql_validation_duration_seconds`: a Prometheus histogram with the request validation duration in seconds.
- `graphql_resolve_field_duration_seconds`: a Prometheus histogram with the field resolving duration in seconds.
- `graphql_request_duration_seconds`: a Prometheus histogram with the request duration in seconds.
- `graphql_errors_total`: a Prometheus counter with the errors occurred during parsing, validation or field resolving.

In addition with each GraphQL request metric the following default labels are measured: `operation_name` and `field_name`. For errors a `phase` label is present.

### `@promster/express`

```js
const app = require('./your-express-app');
const { createMiddleware } = require('@promster/express');

// Note: This should be done BEFORE other routes
// Pass 'app' as middleware parameter to additionally expose Prometheus under 'app.locals'
app.use(createMiddleware({ app, options }));
```

Passing the `app` into the `createMiddleware` call attaches the internal `prom-client` to your Express app's locals. This may come in handy as later you can:

```js
// Create an e.g. custom counter
const counter = new app.locals.Prometheus.Counter({
  name: 'metric_name',
  help: 'metric_help',
});

// to later increment it
counter.inc();
```

### `@promster/fastify`

```js
const app = require('./your-fastify-app');
const { plugin: promsterPlugin } = require('@promster/fastify');

fastify.register(promsterPlugin);
```

Plugin attaches the internal `prom-client` to your Fastify instance. This may come in handy as later you can:

```js
// Create an e.g. custom counter
const counter = new fastify.Prometheus.Counter({
  name: 'metric_name',
  help: 'metric_help',
});

// to later increment it
counter.inc();
```

### `@promster/hapi`

```js
const { createPlugin } = require('@promster/hapi');
const app = require('./your-hapi-app');

app.register(createPlugin({ options }));
```

Here you do not have to pass in the `app` into the `createPlugin` call as the internal `prom-client` will be exposed onto Hapi as in:

```js
// Create an e.g. custom counter
const counter = new app.Prometheus.Counter({
  name: 'metric_name',
  help: 'metric_help',
});

// to later increment it
counter.inc();
```

### `@promster/marblejs`

```js
const promster = require('@promster/marblejs');

const middlewares = [
  promster.createMiddleware(),
  //...
];

const serveMetrics$ = r
  .matchPath('/metrics')
  .matchType('GET')
  .use(async (req$) =>
    req$.pipe(
      mapTo({
        headers: { 'Content-Type': promster.getContentType() },
        body: await promster.getSummary(),
      })
    )
  );
```

### `@promster/apollo`

```js
const {
  createPlugin: createPromsterMetricsPlugin,
} = require('@promster/apollo');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [createPromsterMetricsPlugin()],
});

await server.listen();
```

When creating either the Express middleware or Hapi plugin the following options can be passed:

- `labels`: an `Array<String>` of custom labels to be configured both on all metrics mentioned above
- `metricPrefix`: a prefix applied to all metrics. The prom-client's default metrics and the request metrics
- `metricTypes`: an `Array<String>` containing one of `histogram`, `summary` or both
- `metricNames`: an object containing custom names for one or all metrics with keys of `up, countOfGcs, durationOfGc, reclaimedInGc, httpRequestDurationPerPercentileInSeconds, httpRequestDurationInSeconds`
  - Note that each value can be an `Array<String>` so `httpRequestDurationInSeconds: ['deprecated_name', 'next_name']` which helps when migrated metrics without having gaps in their intake. In such a case `deprecated_name` would be removed after e.g. Recording Rules and dashboards have been adjusted to use `next_name`. During the transition each metric will be captured/recorded twice.
- `getLabelValues`: a function receiving `req` and `res` on reach request. It has to return an object with keys of the configured `labels` above and the respective values
- `normalizePath`: a function called on each request to normalize the request's path. Invoked with `(path: string, { request, response })`
- `normalizeStatusCode`: a function called on each request to normalize the respond's status code (e.g. to get 2xx, 5xx codes instead of detailed ones). Invoked with `(statusCode: number, { request, response })`
- `normalizeMethod`: a function called on each request to normalize the request's method (to e.g. hide it fully). Invoked with `(method: string, { request, response })`
- `skip`: a function called on each response giving the ability to skip a metric. The method receives `req`, `res` and `labels` and returns a boolean: `skip(req, res, labels) => Boolean`
- `detectKubernetes`: a boolean defaulting to `false`. Whenever `true`is passed the process does not run within Kubernetes any metric intake is skipped (good e.g. during testing).
- `disableGcMetrics`: a boolean defaulted to `false` to indicate if Garbage Collection metric should be disabled and hence not collected.

Moreover, both `@promster/hapi` and `@promster/express` expose the request recorder configured with the passed options and used to measure request timings. It allows easy tracking of other requests not handled through express or Hapi for instance calls to an external API while using promster's already defined metric types (the `httpRequestsHistogram` etc).

```js
// Note that a getter is exposed as the request recorder is only available after initialisation.
const { getRequestRecorder, timing } = require('@promster/express');
const fetch = request('node-fetch');

const async fetchSomeData = () => {
  const recordRequest = getRequestRecorder();
  const requestTiming = timing.start();

  const data = await fetch('https://another-api.com').then(res => res.json());

  recordRequest(requestTiming, {
    other: 'label-values'
  });

  return data;
}
```

Lastly, both `@promster/hapi` and `@promster/express` expose setters for the `up` Prometheus gauge. Whenever the server finished booting and is ready you can call `signalIsUp()`. Given the server goes down again you can call `signalIsNotUp()` to set the gauge back to `0`. There is no standard hook in both `express` and `Hapi` to tie this into automatically. Other tools to indicate service health such as `lightship` indicating Kubernetes Pod liveliness and readiness probes also offer setters to alter state.

### `@promster/server`

In some cases you might want to expose the gathered metrics through an individual server. This is useful for instance to not have `GET /metrics` expose internal server and business metrics to the outside world. For this you can use `@promster/server`:

```js
const { createServer } = require('@promster/server');

// NOTE: The port defaults to `7788`.
createServer({ port: 8888 }).then((server) =>
  console.log(`@promster/server started on port 8888.`)
);
```

Options with their respective defaults are `port: 7788`, `hostname: '0.0.0.0'` and `detectKubernetes: false`. Whenever `detectKubernetes` is passed as `true` and the server will not start locally.

### `@promster/{express,hapi}`

You can use the `express` or `hapi` package to expose the gathered metrics through your existing server. To do so just:

```js
const app = require('./your-express-app');
const { getSummary, getContentType } = require('@promster/express');

app.use('/metrics', async (req, res) => {
  req.statusCode = 200;

  res.setHeader('Content-Type', getContentType());
  res.end(await getSummary());
});
```

This may slightly depend on the server you are using but should be roughly the same for all.

The packages re-export most things from the `@promster/metrics` package including two other potentially useful exports in `Prometheus` (the actual client) and `defaultRegister` which is the default register of the client. After all you should never really have to install `@promster/metrics` as it is only and internally shared packages between the others.

Additionally you can import the default normalizers via `const { defaultNormalizers } = require('@promster/express)` and use `normalizePath`, `normalizeStatusCode` and `normalizeMethod` from you `getLabelValues`. A more involved example with `getLabelValues` could look like:

```js
app.use(
  createMiddleware({
    app,
    options: {
      labels: ['proxied_to'],
      getLabelValues: (req, res) => {
        if (res.proxyTo === 'someProxyTarget')
          return {
            proxied_to: 'someProxyTarget',
            path: '/',
          };
        if (req.get('x-custom-header'))
          return {
            path: null,
            proxied_to: null,
          };
      },
    },
  })
);
```

Note that the same configuration can be passed to `@promster/hapi`.

### Example PromQL queries

In the past we have struggled and learned a lot getting appropriate operational insights into our various Node.js based services. PromQL is powerful and a great tool but can have a steep learning curve. Here are a few queries per metric type to maybe flatten that curve. Remember that you may need to configure the `metricTypes: Array<String>` to e.g. `metricTypes: ['httpRequestsTotal', 'httpRequestsSummary', 'httpRequestsHistogram'] }`.

#### `http_requests_total`

> HTTP requests averaged over the last 5 minutes

`rate(http_requests_total[5m])`

A recording rule for this query could be named `http_requests:rate5m`

> HTTP requests averaged over the last 5 minutes by Kubernetes pod

`sum by (kubernetes_pod_name) (rate(http_requests_total[5m]))`

A recording rule for this query could be named `kubernetes_pod_name:http_requests:rate5m`

> Http requests in the last hour

`increase(http_requests_total[1h])`

> Average Http requests by status code over the last 5 minutes

`sum by (status_code) (rate(http_requests[5m]))`

A recording rule for this query could be named `status_code:http_requests:rate5m`

> Http error rates as a percentage of the traffic averaged over the last 5 minutes

`rate(http_requests_total{status_code=~"5.*"}[5m]) / rate(http_requests_total[5m])`

A recording rule for this query could be named `http_requests_per_status_code5xx:ratio_rate5m`

#### `http_request_duration_seconds`

> Http requests per proxy target

`sum by (proxied_to) (increase(http_request_duration_seconds_count{proxied_to!=""}[2m]))`

A recording rule for this query should be named something like `proxied_to_:http_request_duration_seconds:increase2m`.

> 99th percentile of http request latency per proxy target

`histogram_quantile(0.99, sum by (proxied_to,le) (rate(http_request_duration_seconds_bucket{proxied_to!=""}[5m])))`

A recording rule for this query could be named `proxied_to_le:http_request_duration_seconds_bucket:p99_rate5m`

#### `http_request_duration_per_percentile_seconds`

> Maximum 99th percentile of http request latency by Kubernetes pod

`max(http_request_duration_per_percentile_seconds{quantile="0.99") by (kubernetes_pod_name)`

#### `nodejs_eventloop_lag_seconds`

> Event loop lag averaged over the last 5 minutes by release

`sum by (release) (rate(nodejs_eventloop_lag_seconds[5m]))`

#### `network_concurrent_connections_count`

> Concurrent network connections

`sum(rate(network_concurrent_connections_count[5m]))`

A recording rule for this query could be named `network_concurrent_connections:rate5m`

#### `nodejs_gc_reclaimed_bytes_total`

> Bytes reclaimed in garbage collection by type

`sum by (gc_type) (rate(nodejs_gc_reclaimed_bytes_total[5m]))`

#### `nodejs_gc_pause_seconds_total`

> Time spend in garbage collection by type

`sum by (gc_type) (rate(nodejs_gc_pause_seconds_total[5m]))`
