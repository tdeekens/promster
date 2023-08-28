---
'@promster/apollo': major
'@promster/express': major
'@promster/fastify': major
'@promster/hapi': major
'@promster/marblejs': major
'@promster/metrics': major
'@promster/server': major
---

The `up` metric of each server integrating `@promster` has been renamed to `nodejs_up`. This is to avoid a collision with the existing `up` metric [Prometheus uses](https://prometheus.io/docs/concepts/jobs_instances/#automatically-generated-labels-and-time-series).

You can still rename this metric to anything you prefer when condfigurating `@promster/express` for instance like this:

```js
const prometheusMetricsMiddleware = createPrometheusMetricsMiddleware({
  options: {
    metricNames: {
      up: ['service_name_up'],
    },
  },
});
```
