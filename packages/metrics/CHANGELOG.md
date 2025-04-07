# @promster/metrics

## 15.2.0

### Patch Changes

- Updated dependencies []:
  - @promster/types@15.2.0

## 15.1.0

### Patch Changes

- Updated dependencies []:
  - @promster/types@15.1.0

## 15.0.1

### Patch Changes

- Updated dependencies []:
  - @promster/types@15.0.1

## 15.0.0

### Patch Changes

- [#1217](https://github.com/tdeekens/promster/pull/1217) [`9d3f8b1`](https://github.com/tdeekens/promster/commit/9d3f8b14ba5b2aa4e6094d1cdf09ea049895f44d) Thanks [@tdeekens](https://github.com/tdeekens)! - Update all dependencies

- [#1352](https://github.com/tdeekens/promster/pull/1352) [`3e09699`](https://github.com/tdeekens/promster/commit/3e096994cf3c1f77c6f0adec549e0a36d6e15ed8) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and update documentatation

- Updated dependencies [[`9d3f8b1`](https://github.com/tdeekens/promster/commit/9d3f8b14ba5b2aa4e6094d1cdf09ea049895f44d), [`3e09699`](https://github.com/tdeekens/promster/commit/3e096994cf3c1f77c6f0adec549e0a36d6e15ed8)]:
  - @promster/types@15.0.0

## 14.0.0

### Major Changes

- [#1210](https://github.com/tdeekens/promster/pull/1210) [`7668337`](https://github.com/tdeekens/promster/commit/766833787529d8a1ee603211240d31be6eaa939e) Thanks [@tdeekens](https://github.com/tdeekens)! - Replace `@sematext/gc-stats` with `prometheus-gc-stats`.

  The latter is better supported and doesn't require any userland install. The module however does not allow to full configuration of metric names. Hence the metric names have changed:

  We now expose:

  1. nodejs_gc_runs_total: Counts the number of time GC is invoked
  2. nodejs_gc_pause_seconds_total: Time spent in GC in seconds
  3. nodejs_gc_reclaimed_bytes_total: The number of bytes GC has freed

### Patch Changes

- Updated dependencies [[`7668337`](https://github.com/tdeekens/promster/commit/766833787529d8a1ee603211240d31be6eaa939e)]:
  - @promster/types@14.0.0

## 13.0.0

### Major Changes

- [#1175](https://github.com/tdeekens/promster/pull/1175) [`2da8d99`](https://github.com/tdeekens/promster/commit/2da8d99cc59e0223e89b985c6dddc9883e3f2f5c) Thanks [@tdeekens](https://github.com/tdeekens)! - Remove support for Node.js v18

  We didn't adjust functionality to remove support but changed the `engines` requirement.

### Patch Changes

- [#1177](https://github.com/tdeekens/promster/pull/1177) [`0d8acff`](https://github.com/tdeekens/promster/commit/0d8acff62b395046023295068aa2849c5a9a55f9) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies

- Updated dependencies [[`2da8d99`](https://github.com/tdeekens/promster/commit/2da8d99cc59e0223e89b985c6dddc9883e3f2f5c), [`0d8acff`](https://github.com/tdeekens/promster/commit/0d8acff62b395046023295068aa2849c5a9a55f9)]:
  - @promster/types@13.0.0

## 12.1.0

### Minor Changes

- [`6bc4617`](https://github.com/tdeekens/promster/commit/6bc4617236c86c8849f8d0ee64ace8916db907d6) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and support prom-client v15.

### Patch Changes

- Updated dependencies [[`6bc4617`](https://github.com/tdeekens/promster/commit/6bc4617236c86c8849f8d0ee64ace8916db907d6)]:
  - @promster/types@12.1.0

## 12.0.0

### Major Changes

- [#1123](https://github.com/tdeekens/promster/pull/1123) [`eab1f5c`](https://github.com/tdeekens/promster/commit/eab1f5c92e46e0855a5a340675bb7b837cc270e5) Thanks [@tdeekens](https://github.com/tdeekens)! - Drop support for node.js v16

### Minor Changes

- [#1121](https://github.com/tdeekens/promster/pull/1121) [`660af55`](https://github.com/tdeekens/promster/commit/660af55e8d6d15f08fbb26544fea546513184458) Thanks [@tdeekens](https://github.com/tdeekens)! - Add support for prom-client v15

### Patch Changes

- Updated dependencies [[`660af55`](https://github.com/tdeekens/promster/commit/660af55e8d6d15f08fbb26544fea546513184458), [`eab1f5c`](https://github.com/tdeekens/promster/commit/eab1f5c92e46e0855a5a340675bb7b837cc270e5)]:
  - @promster/types@12.0.0

## 11.0.0

### Major Changes

- [#1099](https://github.com/tdeekens/promster/pull/1099) [`c3fbd90`](https://github.com/tdeekens/promster/commit/c3fbd90808d2a9b244d1ca14f0ac6bfdf973dcda) Thanks [@tdeekens](https://github.com/tdeekens)! - Allow customization of individual metrics.

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

### Minor Changes

- [#1096](https://github.com/tdeekens/promster/pull/1096) [`3ce4835`](https://github.com/tdeekens/promster/commit/3ce4835adde92e5bce10398e8dfad759c9db4753) Thanks [@tdeekens](https://github.com/tdeekens)! - Restructure TypeScript and improve types of `skip`-fn

  Previously the `skip` function received generics to pass the `request` and `response` type. These are not needed any more. The function exported from the respective package is now typed to it.

### Patch Changes

- [#1093](https://github.com/tdeekens/promster/pull/1093) [`ec70682`](https://github.com/tdeekens/promster/commit/ec70682c131d3e9abf9ad5e49d82f6a5168ad8a7) Thanks [@tdeekens](https://github.com/tdeekens)! - Re-export types from each package.

  This is a convenience re-export where prior you had to use the `@promster/types` package as a standalone import you can now use the package you're using.

  ```diff
  -import { TPromsterOptions } from '@promster/types'
  +import { TPromsterOptions } from '@promster/express'
  ```

- [#1098](https://github.com/tdeekens/promster/pull/1098) [`dae8f75`](https://github.com/tdeekens/promster/commit/dae8f756e532160bb977cf3a4e18aeedbb6e61a3) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies

- [#1097](https://github.com/tdeekens/promster/pull/1097) [`04f37e7`](https://github.com/tdeekens/promster/commit/04f37e7fe6c47433ad4082579b1af129aca8b7af) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies

- Updated dependencies [[`dae8f75`](https://github.com/tdeekens/promster/commit/dae8f756e532160bb977cf3a4e18aeedbb6e61a3), [`c3fbd90`](https://github.com/tdeekens/promster/commit/c3fbd90808d2a9b244d1ca14f0ac6bfdf973dcda), [`04f37e7`](https://github.com/tdeekens/promster/commit/04f37e7fe6c47433ad4082579b1af129aca8b7af)]:
  - @promster/types@5.0.0

## 10.0.0

### Major Changes

- [#1088](https://github.com/tdeekens/promster/pull/1088) [`7cfd21c`](https://github.com/tdeekens/promster/commit/7cfd21c2cd4d402cabd454cdc67f76ecce104fb0) Thanks [@tdeekens](https://github.com/tdeekens)! - Breaking droping support for Node.js v14

- [#1087](https://github.com/tdeekens/promster/pull/1087) [`2e848c1`](https://github.com/tdeekens/promster/commit/2e848c13be1053ad22b0aa2210bcbb677b66ed62) Thanks [@roumigus](https://github.com/roumigus)! - The `up` metric of each server integrating `@promster` has been renamed to `nodejs_up`. This is to avoid a collision with the existing `up` metric [Prometheus uses](https://prometheus.io/docs/concepts/jobs_instances/#automatically-generated-labels-and-time-series).

  You can still rename this metric to anything you prefer when condfigurating `@promster/express` for instance like this:

  ```js
  const prometheusMetricsMiddleware = createPrometheusMetricsMiddleware({
    options: {
      metricNames: {
        up: ["service_name_up"],
      },
    },
  });
  ```

### Patch Changes

- [#1090](https://github.com/tdeekens/promster/pull/1090) [`31b82fd`](https://github.com/tdeekens/promster/commit/31b82fd59139f0faf273c8e70e63f4bd5e0b4af7) Thanks [@tdeekens](https://github.com/tdeekens)! - Replace yarn with pnpm.

## 9.1.6

### Patch Changes

- [#993](https://github.com/tdeekens/promster/pull/993) [`58ffa97`](https://github.com/tdeekens/promster/commit/58ffa977892fa97f47fdbf208f76bd0ef2b8b2ee) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency prom-client to v14.1.0

- [#1006](https://github.com/tdeekens/promster/pull/1006) [`8df4fe6`](https://github.com/tdeekens/promster/commit/8df4fe6a4cd6ff86260ce546411200d7e4d98802) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update deps

## 9.1.5

### Patch Changes

- [`5d4842e`](https://github.com/tdeekens/promster/commit/5d4842e5d60136effcff1905b06b6bae06063c3b) Thanks [@tdeekens](https://github.com/tdeekens)! - Update all dependencies

## 9.1.4

### Patch Changes

- [#865](https://github.com/tdeekens/promster/pull/865) [`abc0df1`](https://github.com/tdeekens/promster/commit/abc0df1a08e46c36659165938b62b3764501cf6d) Thanks [@tdeekens](https://github.com/tdeekens)! - Fix timing to not truncate fractional numbers.

## 9.1.3

### Patch Changes

- [#846](https://github.com/tdeekens/promster/pull/846) [`defcae7`](https://github.com/tdeekens/promster/commit/defcae775e7280a5746db4c2e75226353d7bdf40) Thanks [@dhs3000](https://github.com/dhs3000)! - Use Node.js provided url module instead of external module to prevent deprecation warning

* [#848](https://github.com/tdeekens/promster/pull/848) [`0e033fa`](https://github.com/tdeekens/promster/commit/0e033fa7ac414dc3692ceedf54eca6cfc2370ff0) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies

## 9.1.2

### Patch Changes

- [#804](https://github.com/tdeekens/promster/pull/804) [`9a1827d`](https://github.com/tdeekens/promster/commit/9a1827da3d4983ce141e77a0e7ea05f11f2bcee6) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update deps

## 9.1.1

### Patch Changes

- [#794](https://github.com/tdeekens/promster/pull/794) [`06cf42b`](https://github.com/tdeekens/promster/commit/06cf42b46bd216f6c3c182452d6badfe1029c7d3) Thanks [@tdeekens](https://github.com/tdeekens)! - Fix package names from `yarn@3` migration

## 9.1.0

### Minor Changes

- [#791](https://github.com/tdeekens/promster/pull/791) [`7f44d2e`](https://github.com/tdeekens/promster/commit/7f44d2e16b506cb53ff0009f4f74a8ccef192ce0) Thanks [@tdeekens](https://github.com/tdeekens)! - Refactor to use `process.hrtime.bigint()` over `process.hrtime()`.

  The [Node.js documentation](https://nodejs.org/api/process.html#processhrtimetime) lists `process.hrtime([time])` as a [legacy feature](https://nodejs.org/api/documentation.html#stability-index). It is no longer recommended for use, and should be avoided. As such it is recommended to use `process.hrtime.bigint()` which works slightly different.

  This change is backwards compatible. A new `timing` module was added to `@promster/metrics` which encapsulates timings so you never have to worry about the details.

  ```diff
  import { getRequestRecorder } = require('@promster/express');
  +import { timing } = require('@promster/express');

  +const requestTiming = timing.start();
  -const requestTiming = process.hrtime();

  recordRequest(requestTiming);
  ```

  We recommend to change all explicit calls to `process.hrtime()` with calls to `timing.start()` over time. The `recordRequest` function will continue to accept a `[number, number]` as the return of `process.hrtime()` so you can change code as you work with it.

## 9.0.0

### Major Changes

- [#778](https://github.com/tdeekens/promster/pull/778) [`e5658c7`](https://github.com/tdeekens/promster/commit/e5658c7189d09071a21c299b78423e0782392c07) Thanks [@tdeekens](https://github.com/tdeekens)! - This major change removes the support for the `accurancies` option. Historically, `promster` first supported milliseconds. Then learning that seconds is the default time interval in the Prometheus community. The `accuracies` option was added to enable a soft migration from milliseconds to seconds not to always support both time intervals.

  In case you haven't migrated your metrics to seconds and don't want to loose data we recommend to have the same metric with two names using the `metricNames` option ending in `*_seconds` and `*_milliseconds`. This way you only need to change the time interval in e.g. Grafana when hitting the time when the library was updated. Then migrate all dashboards and recording rules and eventually remove the `*_milliseconds` `metricName` option again.

  If you would like to read more about the reasoning of this decision head [here](https://www.robustperception.io/who-wants-seconds).

### Minor Changes

- [#771](https://github.com/tdeekens/promster/pull/771) [`dfc14a3`](https://github.com/tdeekens/promster/commit/dfc14a3d8ec309723c6b904949e506c63c04c3c0) Thanks [@tdeekens](https://github.com/tdeekens)! - Allow passing a `disableGcMetrics` boolean option to disable Garbage Collection metrics.

### Patch Changes

- [#773](https://github.com/tdeekens/promster/pull/773) [`d49c30f`](https://github.com/tdeekens/promster/commit/d49c30f0004e0f4883ac356598ddf82b87b7c9d6) Thanks [@tdeekens](https://github.com/tdeekens)! - refactor(metrics): measurement taking into exported functions

* [#772](https://github.com/tdeekens/promster/pull/772) [`402c8c0`](https://github.com/tdeekens/promster/commit/402c8c01a3dfa605d47e0f974ac554d65c237d50) Thanks [@tdeekens](https://github.com/tdeekens)! - Refactor to split metric types into `gcMetrics` and `httpMetrics` to empower future metric types.

- [#778](https://github.com/tdeekens/promster/pull/778) [`e5658c7`](https://github.com/tdeekens/promster/commit/e5658c7189d09071a21c299b78423e0782392c07) Thanks [@tdeekens](https://github.com/tdeekens)! - Fixes that not always a `{ req, res }` object was passed to all normalizers in all plugins by making the typing more explicit.

* [#760](https://github.com/tdeekens/promster/pull/760) [`1b84464`](https://github.com/tdeekens/promster/commit/1b8446455324e4ceefb4b032eddb43e9b8bb63d2) Thanks [@tdeekens](https://github.com/tdeekens)! - Refactor to split metric types and remove double guards for metrics

- [#784](https://github.com/tdeekens/promster/pull/784) [`548c56e`](https://github.com/tdeekens/promster/commit/548c56e1ec7ccaa5b1aca71d33db65ad91e64f3c) Thanks [@tdeekens](https://github.com/tdeekens)! - Fix to remove remaining code using ms

* [#769](https://github.com/tdeekens/promster/pull/769) [`5e67884`](https://github.com/tdeekens/promster/commit/5e6788481fee15479c6505d3475ab716f7378f33) Thanks [@tdeekens](https://github.com/tdeekens)! - Refactor to colocate environment detection

- [#777](https://github.com/tdeekens/promster/pull/777) [`9d6a2ee`](https://github.com/tdeekens/promster/commit/9d6a2ee81ea3e40fac3e788d9942f66c868670a5) Thanks [@tdeekens](https://github.com/tdeekens)! - refactor: to use yarn@3

## 8.0.0

### Major Changes

- [#758](https://github.com/tdeekens/promster/pull/758) [`f02e6fe`](https://github.com/tdeekens/promster/commit/f02e6fe9950070d7df3cc0854f407cabe10d2aea) Thanks [@tdeekens](https://github.com/tdeekens)! - We droped support for Node.js `< 14` via the `engines` field of the respective `package.json` files.

  We didn't make any changes to our code to prevent e.g. Node.js v9 to work but will not claim to officially support it any longer.

* [#762](https://github.com/tdeekens/promster/pull/762) [`92cdf28`](https://github.com/tdeekens/promster/commit/92cdf281ff57f901835f14d474ae9cc1fb6fe2b2) Thanks [@tdeekens](https://github.com/tdeekens)! - Remove content length being recorded by default

### Patch Changes

- [#763](https://github.com/tdeekens/promster/pull/763) [`7e7a1c6`](https://github.com/tdeekens/promster/commit/7e7a1c615e493217dfed00966f89880db9322485) Thanks [@tdeekens](https://github.com/tdeekens)! - Fix unmet dev dependency of ts-essentials.

* [#762](https://github.com/tdeekens/promster/pull/762) [`92cdf28`](https://github.com/tdeekens/promster/commit/92cdf281ff57f901835f14d474ae9cc1fb6fe2b2) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies

## 7.0.4

### Patch Changes

- [#755](https://github.com/tdeekens/promster/pull/755) [`84435d4`](https://github.com/tdeekens/promster/commit/84435d46f295ad2e80d40328c95852a1e7beb0de) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and release all packages

## 7.0.3

### Patch Changes

- [`2c726ca`](https://github.com/tdeekens/promster/commit/2c726ca44eb7eb614b801f626a872fba48b7f3fa) Thanks [@renovate[bot]](https://github.com/renovate%5Bbot%5D)! - Added support for `prom-client` v14

## 7.0.2

### Patch Changes

- [`a24f38f`](https://github.com/tdeekens/promster/commit/a24f38ff070220a28da5bf64d7d9e3a3167d1152) Thanks [@tdeekens](https://github.com/tdeekens)! - Update all dependencies including gc-stats

## 7.0.1

### Patch Changes

- [`cbc12c7`](https://github.com/tdeekens/promster/commit/cbc12c76ce1414f08f914ceb5ecd9747d497b71d) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and added spell check as a GitHub Action

## 7.0.0

### Major Changes

- [#703](https://github.com/tdeekens/promster/pull/703) [`e351e91`](https://github.com/tdeekens/promster/commit/e351e91b68ebf3bb13e70e5fa4925aaa96343344) Thanks [@tdeekens](https://github.com/tdeekens)! - Refactor to use fork of `gc-stats` due to `npm audit`.

  The `gc-stats` project seems unmaintained and causes audit warnings as discussed [here](https://github.com/tdeekens/promster/issues/579).

  This is a breaking change is any project having `gc-stats` installed needs to move to `@sematext/gc-stats`. As such the please make the following change in your `package.json`:

  ```diff
  -"gc-stats": "1.4.0"
  +"@sematext/gc-stats": "1.5.3"
  ```

  Any other change is encapsulated in `promster` itself.

### Minor Changes

- [#705](https://github.com/tdeekens/promster/pull/705) [`e2a1595`](https://github.com/tdeekens/promster/commit/e2a15959c4f11191093a0f0fa0e472434207f020) Thanks [@tdeekens](https://github.com/tdeekens)! - Add content length metric for both requests and responses. Both are recorded as Prometheus histograms under the name `http_request_content_length_bytes`
  and `http_response_content_length_bytes`.

### Patch Changes

- [#703](https://github.com/tdeekens/promster/pull/703) [`e351e91`](https://github.com/tdeekens/promster/commit/e351e91b68ebf3bb13e70e5fa4925aaa96343344) Thanks [@tdeekens](https://github.com/tdeekens)! - Refactor to require Node.js v14 and drop official support for anything below

  The `engines` field of the `package.json` now requires Node.js v14 and not v9 as prior. There are no actual changes in the library however anything smaler v14 will not be officially supported.

## 6.0.2

### Patch Changes

- [#620](https://github.com/tdeekens/promster/pull/620) [`ec2a8f8`](https://github.com/tdeekens/promster/commit/ec2a8f83a94bbe63360cf7027eeba92895315a19) Thanks [@tdeekens](https://github.com/tdeekens)! - refactor: improve typings (not exposed part)

* [#618](https://github.com/tdeekens/promster/pull/618) [`bbab9ca`](https://github.com/tdeekens/promster/commit/bbab9cad6a3484e4894d159267d62e54e202812a) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update deps

## 6.0.1

### Patch Changes

- [#601](https://github.com/tdeekens/promster/pull/601) [`17a24dc`](https://github.com/tdeekens/promster/commit/17a24dc0d735478001524c853b9f54f862153852) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and apply eslint rule suggestions.

## 6.0.0

### Major Changes

- [`daf8605`](https://github.com/tdeekens/promster/commit/daf86055e64cb420c83dbc7abbcd5024d449c53f) [#557](https://github.com/tdeekens/promster/pull/557) Thanks [@tdeekens](https://github.com/tdeekens)! - # Breaking Changes

  This requires your to update your peer dependency of `prom-client` to v13.

  The new version of `prom-client` has additional small breaking changes `promster` has to incorporate which can leak into your application.

  If you do not use our `@promster/server` package and have a `res.send(register.metrics())` you have to change it to `res.send(await register.metrics())`.

  You can find more on the `prom-client` changes [here](https://github.com/siimon/prom-client/blob/master/CHANGELOG.md).

## 5.0.0

### Major Changes

- [`0eb64ca`](https://github.com/tdeekens/promster/commit/0eb64cac9a4a51dab1a556f46c97a2a5542bcc88) [#529](https://github.com/tdeekens/promster/pull/529) Thanks [@tdeekens](https://github.com/tdeekens)! - # Introduction

  refactor: to use preconstruct for building

  Prior TypeScript was used to build bundles. In all this should not affect consumers of this library. Under the hood preconstruct uses rollup and babel which is now instructed to build for Node.js v12 using the preset-env preset.

  # Breaking Change

  This release can _potentially_ be breaking for you. We want to respect semantic versioning and follow it strictly.

  While migrating to preconstruct the `version` exports had to be removed as preconstruct's rollup will not resolve them. If you relied on this value you should either load the `package.json` of each module yourself or drop the usage.

  ```diff
  - const { version } = require('@promster/server');
  + const { version } = require('@promster/server/package.json');
  ```

### Patch Changes

- [`bdf75de`](https://github.com/tdeekens/promster/commit/bdf75dec8d0ce6be65ecccf5963f348e1a0a96b3) [#531](https://github.com/tdeekens/promster/pull/531) Thanks [@tdeekens](https://github.com/tdeekens)! - fix: update dependencies

## 4.1.13

### Patch Changes

- [`4c3af06`](https://github.com/tdeekens/promster/commit/4c3af06bc0b65eb067f195591e48839e632375bd) [#483](https://github.com/tdeekens/promster/pull/483) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update dependencies

## 4.1.12

### Patch Changes

- [`158e7b9`](https://github.com/tdeekens/promster/commit/158e7b9af01133db54376bb96dbdccdd96bfa7a3) Thanks [@tdeekens](https://github.com/tdeekens)! - Dependency updates across all packages

## 4.1.11

### Patch Changes

- [`7853faa`](https://github.com/tdeekens/promster/commit/7853faa4e140eaae0622fb7c66d8145d258d7f5e) [#447](https://github.com/tdeekens/promster/pull/447) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update deps

## 4.1.10

### Patch Changes

- [`c2b8e0d`](https://github.com/tdeekens/promster/commit/c2b8e0d472b6e31e053460d8f714eaf790a17eb9) [#358](https://github.com/tdeekens/promster/pull/358) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies.

* [`6f99f64`](https://github.com/tdeekens/promster/commit/6f99f644ccd2cd0b60c172968266c3ac3f76e826) [#360](https://github.com/tdeekens/promster/pull/360) Thanks [@tdeekens](https://github.com/tdeekens)! - Update to eslint v7
