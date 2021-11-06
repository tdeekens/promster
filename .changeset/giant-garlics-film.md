---
"@promster/express": major
"@promster/fastify": major
"@promster/hapi": major
"@promster/marblejs": major
"@promster/metrics": major
"@promster/types": patch
---

This major change removes the support for the `accurancies` option. Historically, `promster` first supported milliseconds. Then learning that seconds is the default time interval in the Prometheus community. The `accuracies` option was added to enable a soft migration from milliseconds to seconds not to always support both time intervals.

In case you haven't migrated your metrics to seconds and don't want to loose data we recommend to have the same metric with two names using the `metricNames` option ending in `*_seconds` and `*_milliseconds`. This way you only need to change the time interval in e.g. Grafana when hitting the time when the library was updated. Then migrate all dashboards and recording rules and eventually remove the `*_milliseconds` `metricName` option again.

If you would like to read more about the reasoning of this decision head [here](https://www.robustperception.io/who-wants-seconds).
