# @promster/types

## 3.2.4

### Patch Changes

- [#890](https://github.com/tdeekens/promster/pull/890) [`734f471`](https://github.com/tdeekens/promster/commit/734f471ee44c5d49baae423efbba333b0717ef08) Thanks [@tdeekens](https://github.com/tdeekens)! - Fix types for buckets and percentiles to be an array of numbers.

* [`5d4842e`](https://github.com/tdeekens/promster/commit/5d4842e5d60136effcff1905b06b6bae06063c3b) Thanks [@tdeekens](https://github.com/tdeekens)! - Update all dependencies

## 3.2.3

### Patch Changes

- [#848](https://github.com/tdeekens/promster/pull/848) [`0e033fa`](https://github.com/tdeekens/promster/commit/0e033fa7ac414dc3692ceedf54eca6cfc2370ff0) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies

## 3.2.2

### Patch Changes

- [#794](https://github.com/tdeekens/promster/pull/794) [`06cf42b`](https://github.com/tdeekens/promster/commit/06cf42b46bd216f6c3c182452d6badfe1029c7d3) Thanks [@tdeekens](https://github.com/tdeekens)! - Fix package names from `yarn@3` migration

## 3.2.1

### Patch Changes

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

## 3.2.0

### Minor Changes

- [#773](https://github.com/tdeekens/promster/pull/773) [`d49c30f`](https://github.com/tdeekens/promster/commit/d49c30f0004e0f4883ac356598ddf82b87b7c9d6) Thanks [@tdeekens](https://github.com/tdeekens)! - refactor(metrics): measurement taking into exported functions

* [#771](https://github.com/tdeekens/promster/pull/771) [`dfc14a3`](https://github.com/tdeekens/promster/commit/dfc14a3d8ec309723c6b904949e506c63c04c3c0) Thanks [@tdeekens](https://github.com/tdeekens)! - Allow passing a `disableGcMetrics` boolean option to disable Garbage Collection metrics.

### Patch Changes

- [#772](https://github.com/tdeekens/promster/pull/772) [`402c8c0`](https://github.com/tdeekens/promster/commit/402c8c01a3dfa605d47e0f974ac554d65c237d50) Thanks [@tdeekens](https://github.com/tdeekens)! - Refactor to split metric types into `gcMetrics` and `httpMetrics` to empower future metric types.

* [#778](https://github.com/tdeekens/promster/pull/778) [`e5658c7`](https://github.com/tdeekens/promster/commit/e5658c7189d09071a21c299b78423e0782392c07) Thanks [@tdeekens](https://github.com/tdeekens)! - This major change removes the support for the `accurancies` option. Historically, `promster` first supported milliseconds. Then learning that seconds is the default time interval in the Prometheus community. The `accuracies` option was added to enable a soft migration from milliseconds to seconds not to always support both time intervals.

  In case you haven't migrated your metrics to seconds and don't want to loose data we recommend to have the same metric with two names using the `metricNames` option ending in `*_seconds` and `*_milliseconds`. This way you only need to change the time interval in e.g. Grafana when hitting the time when the library was updated. Then migrate all dashboards and recording rules and eventually remove the `*_milliseconds` `metricName` option again.

  If you would like to read more about the reasoning of this decision head [here](https://www.robustperception.io/who-wants-seconds).

- [#778](https://github.com/tdeekens/promster/pull/778) [`e5658c7`](https://github.com/tdeekens/promster/commit/e5658c7189d09071a21c299b78423e0782392c07) Thanks [@tdeekens](https://github.com/tdeekens)! - Fixes that not always a `{ req, res }` object was passed to all normalizers in all plugins by making the typing more explicit.

* [#760](https://github.com/tdeekens/promster/pull/760) [`1b84464`](https://github.com/tdeekens/promster/commit/1b8446455324e4ceefb4b032eddb43e9b8bb63d2) Thanks [@tdeekens](https://github.com/tdeekens)! - Refactor to split metric types and remove double guards for metrics

- [#784](https://github.com/tdeekens/promster/pull/784) [`548c56e`](https://github.com/tdeekens/promster/commit/548c56e1ec7ccaa5b1aca71d33db65ad91e64f3c) Thanks [@tdeekens](https://github.com/tdeekens)! - Fix to remove remaining code using ms

* [#777](https://github.com/tdeekens/promster/pull/777) [`9d6a2ee`](https://github.com/tdeekens/promster/commit/9d6a2ee81ea3e40fac3e788d9942f66c868670a5) Thanks [@tdeekens](https://github.com/tdeekens)! - refactor: to use yarn@3

## 3.1.5

### Patch Changes

- [#758](https://github.com/tdeekens/promster/pull/758) [`f02e6fe`](https://github.com/tdeekens/promster/commit/f02e6fe9950070d7df3cc0854f407cabe10d2aea) Thanks [@tdeekens](https://github.com/tdeekens)! - We droped support for Node.js `< 14` via the `engines` field of the respective `package.json` files.

  We didn't make any changes to our code to prevent e.g. Node.js v9 to work but will not claim to officially support it any longer.

* [#762](https://github.com/tdeekens/promster/pull/762) [`92cdf28`](https://github.com/tdeekens/promster/commit/92cdf281ff57f901835f14d474ae9cc1fb6fe2b2) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies

## 3.1.4

### Patch Changes

- [#755](https://github.com/tdeekens/promster/pull/755) [`84435d4`](https://github.com/tdeekens/promster/commit/84435d46f295ad2e80d40328c95852a1e7beb0de) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and release all packages

## 3.1.3

### Patch Changes

- [`2c726ca`](https://github.com/tdeekens/promster/commit/2c726ca44eb7eb614b801f626a872fba48b7f3fa) Thanks [@renovate[bot]](https://github.com/renovate%5Bbot%5D)! - Added support for `prom-client` v14

## 3.1.2

### Patch Changes

- [`a24f38f`](https://github.com/tdeekens/promster/commit/a24f38ff070220a28da5bf64d7d9e3a3167d1152) Thanks [@tdeekens](https://github.com/tdeekens)! - Update all dependencies including gc-stats

## 3.1.1

### Patch Changes

- [`cbc12c7`](https://github.com/tdeekens/promster/commit/cbc12c76ce1414f08f914ceb5ecd9747d497b71d) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and added spell check as a GitHub Action

## 3.1.0

### Minor Changes

- [#705](https://github.com/tdeekens/promster/pull/705) [`e2a1595`](https://github.com/tdeekens/promster/commit/e2a15959c4f11191093a0f0fa0e472434207f020) Thanks [@tdeekens](https://github.com/tdeekens)! - Add content length metric for both requests and responses. Both are recorded as Prometheus histograms under the name `http_request_content_length_bytes`
  and `http_response_content_length_bytes`.

### Patch Changes

- [#703](https://github.com/tdeekens/promster/pull/703) [`e351e91`](https://github.com/tdeekens/promster/commit/e351e91b68ebf3bb13e70e5fa4925aaa96343344) Thanks [@tdeekens](https://github.com/tdeekens)! - Refactor to require Node.js v14 and drop official support for anything below

  The `engines` field of the `package.json` now requires Node.js v14 and not v9 as prior. There are no actual changes in the library however anything smaler v14 will not be officially supported.

## 3.0.1

### Patch Changes

- [#601](https://github.com/tdeekens/promster/pull/601) [`17a24dc`](https://github.com/tdeekens/promster/commit/17a24dc0d735478001524c853b9f54f862153852) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and apply eslint rule suggestions.

## 3.0.0

### Major Changes

- [`daf8605`](https://github.com/tdeekens/promster/commit/daf86055e64cb420c83dbc7abbcd5024d449c53f) [#557](https://github.com/tdeekens/promster/pull/557) Thanks [@tdeekens](https://github.com/tdeekens)! - # Breaking Changes

  This requires your to update your peer dependency of `prom-client` to v13.

  The new version of `prom-client` has additional small breaking changes `promster` has to incorporate which can leak into your application.

  If you do not use our `@promster/server` package and have a `res.send(register.metrics())` you have to change it to `res.send(await register.metrics())`.

  You can find more on the `prom-client` changes [here](https://github.com/siimon/prom-client/blob/master/CHANGELOG.md).

## 2.0.0

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

## 1.0.8

### Patch Changes

- [`158e7b9`](https://github.com/tdeekens/promster/commit/158e7b9af01133db54376bb96dbdccdd96bfa7a3) Thanks [@tdeekens](https://github.com/tdeekens)! - Dependency updates across all packages

## 1.0.7

### Patch Changes

- [`3d1c10c`](https://github.com/tdeekens/promster/commit/3d1c10c4403374b7557ce4e8ab0e92235f869a21) [#460](https://github.com/tdeekens/promster/pull/460) Thanks [@kppullin](https://github.com/kppullin)! - Add `skip` to typedefs

## 1.0.6

### Patch Changes

- [`c3caa55`](https://github.com/tdeekens/promster/commit/c3caa5569b59928a3ca8976ae05c66c2f51a385a) [#379](https://github.com/tdeekens/promster/pull/379) Thanks [@roikoren755](https://github.com/roikoren755)! - fix(types): update TPromsterOptions

## 1.0.5

### Patch Changes

- [`6f99f64`](https://github.com/tdeekens/promster/commit/6f99f644ccd2cd0b60c172968266c3ac3f76e826) [#360](https://github.com/tdeekens/promster/pull/360) Thanks [@tdeekens](https://github.com/tdeekens)! - Update to eslint v7
