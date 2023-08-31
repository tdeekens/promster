---
'@promster/metrics': major
'@promster/types': major
'@promster/apollo': major
'@promster/express': major
'@promster/fastify': major
'@promster/hapi': major
'@promster/marblejs': major
'@promster/server': major
---

Allow customization of individual metrics.

Previously we only allowed customizing a all histogram and percentile based metrics once with a `buckets` and `percentiles` option. This is too restrictive in cases in which you need to customize metrics individually.

As a result you can now pass `metricBuckets` and `metricPercentiles` as options. Both of which are a `Record<string, number[]>`. The key needs to match a an existing metric type.

This is a more elaborate example:

```js
const middleware = createMiddleware({
  app,
  options: {
    metricBuckets: {
      httpRequestContentLengthInBytes: [
        100000, 200000, 500000, 1000000, 1500000, 2000000, 3000000, 5000000,
        10000000,
      ],
      httpRequestDurationInSeconds: [
        0.05, 0.1, 0.3, 0.5, 0.8, 1, 1.5, 2, 3, 10,
      ],
    },
    metricPercentiles: {
      httpRequestDurationPerPercentileInSeconds: [0.5, 0.9, 0.95, 0.98, 0.99],
      httpResponseContentLengthInBytes: [
        100000, 200000, 500000, 1000000, 1500000, 2000000, 3000000, 5000000,
        10000000,
      ],
    },
  },
});
```

If you used `buckets` or `percentiles` before you migrate the values into the structure above.
