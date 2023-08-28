# @promster/apollo

## 2.0.0

### Major Changes

- [#1088](https://github.com/tdeekens/promster/pull/1088) [`7cfd21c`](https://github.com/tdeekens/promster/commit/7cfd21c2cd4d402cabd454cdc67f76ecce104fb0) Thanks [@tdeekens](https://github.com/tdeekens)! - Breaking droping support for Node.js v14

- [#1087](https://github.com/tdeekens/promster/pull/1087) [`2e848c1`](https://github.com/tdeekens/promster/commit/2e848c13be1053ad22b0aa2210bcbb677b66ed62) Thanks [@roumigus](https://github.com/roumigus)! - The `up` metric of each server integrating `@promster` has been renamed to `nodejs_up`. This is to avoid a collision with the existing `up` metric [Prometheus uses](https://prometheus.io/docs/concepts/jobs_instances/#automatically-generated-labels-and-time-series).

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

### Patch Changes

- [#1090](https://github.com/tdeekens/promster/pull/1090) [`31b82fd`](https://github.com/tdeekens/promster/commit/31b82fd59139f0faf273c8e70e63f4bd5e0b4af7) Thanks [@tdeekens](https://github.com/tdeekens)! - Replace yarn with pnpm.

- Updated dependencies [[`31b82fd`](https://github.com/tdeekens/promster/commit/31b82fd59139f0faf273c8e70e63f4bd5e0b4af7), [`7cfd21c`](https://github.com/tdeekens/promster/commit/7cfd21c2cd4d402cabd454cdc67f76ecce104fb0), [`2e848c1`](https://github.com/tdeekens/promster/commit/2e848c13be1053ad22b0aa2210bcbb677b66ed62)]:
  - @promster/metrics@10.0.0

## 1.0.8

### Patch Changes

- [#1006](https://github.com/tdeekens/promster/pull/1006) [`8df4fe6`](https://github.com/tdeekens/promster/commit/8df4fe6a4cd6ff86260ce546411200d7e4d98802) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update deps

- Updated dependencies [[`58ffa97`](https://github.com/tdeekens/promster/commit/58ffa977892fa97f47fdbf208f76bd0ef2b8b2ee), [`8df4fe6`](https://github.com/tdeekens/promster/commit/8df4fe6a4cd6ff86260ce546411200d7e4d98802)]:
  - @promster/metrics@9.1.6

## 1.0.7

### Patch Changes

- [`5d4842e`](https://github.com/tdeekens/promster/commit/5d4842e5d60136effcff1905b06b6bae06063c3b) Thanks [@tdeekens](https://github.com/tdeekens)! - Update all dependencies

- Updated dependencies [[`5d4842e`](https://github.com/tdeekens/promster/commit/5d4842e5d60136effcff1905b06b6bae06063c3b)]:
  - @promster/metrics@9.1.5

## 1.0.6

### Patch Changes

- [#868](https://github.com/tdeekens/promster/pull/868) [`7a084f2`](https://github.com/tdeekens/promster/commit/7a084f214ef7f7d81e8c06f04b5a7abdbf78c456) Thanks [@earnubs](https://github.com/earnubs)! - Fix GraphQL execution error counting

  This fixes a bug which caused GraphQL errors thrown were not counted when
  encountered in GraphQL execution phase.

  During the execution phase GraphQL request are fulfilled and can result in data or an error.

  Additionally, the any error not handled would threw a plugin error due to a missing label `field_name` in the intial label set.

## 1.0.5

### Patch Changes

- [#865](https://github.com/tdeekens/promster/pull/865) [`abc0df1`](https://github.com/tdeekens/promster/commit/abc0df1a08e46c36659165938b62b3764501cf6d) Thanks [@tdeekens](https://github.com/tdeekens)! - Fix timing to not truncate fractional numbers.

- Updated dependencies [[`abc0df1`](https://github.com/tdeekens/promster/commit/abc0df1a08e46c36659165938b62b3764501cf6d)]:
  - @promster/metrics@9.1.4

## 1.0.4

### Patch Changes

- [#848](https://github.com/tdeekens/promster/pull/848) [`0e033fa`](https://github.com/tdeekens/promster/commit/0e033fa7ac414dc3692ceedf54eca6cfc2370ff0) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies

- Updated dependencies [[`defcae7`](https://github.com/tdeekens/promster/commit/defcae775e7280a5746db4c2e75226353d7bdf40), [`0e033fa`](https://github.com/tdeekens/promster/commit/0e033fa7ac414dc3692ceedf54eca6cfc2370ff0)]:
  - @promster/metrics@9.1.3

## 1.0.3

### Patch Changes

- [#804](https://github.com/tdeekens/promster/pull/804) [`9a1827d`](https://github.com/tdeekens/promster/commit/9a1827da3d4983ce141e77a0e7ea05f11f2bcee6) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update deps

- Updated dependencies [[`9a1827d`](https://github.com/tdeekens/promster/commit/9a1827da3d4983ce141e77a0e7ea05f11f2bcee6)]:
  - @promster/metrics@9.1.2

## 1.0.2

### Patch Changes

- [#794](https://github.com/tdeekens/promster/pull/794) [`06cf42b`](https://github.com/tdeekens/promster/commit/06cf42b46bd216f6c3c182452d6badfe1029c7d3) Thanks [@tdeekens](https://github.com/tdeekens)! - Fix package names from `yarn@3` migration

- Updated dependencies [[`06cf42b`](https://github.com/tdeekens/promster/commit/06cf42b46bd216f6c3c182452d6badfe1029c7d3)]:
  - @promster/metrics@9.1.1

## 1.0.1

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

- Updated dependencies [[`7f44d2e`](https://github.com/tdeekens/promster/commit/7f44d2e16b506cb53ff0009f4f74a8ccef192ce0)]:
  - @promster/metrics@9.1.0

## 1.0.0

### Major Changes

- [#786](https://github.com/tdeekens/promster/pull/786) [`b32db63`](https://github.com/tdeekens/promster/commit/b32db6353b09af41c4a053f976771938cadde233) Thanks [@tdeekens](https://github.com/tdeekens)! - Iniitial release of `@promster/apollo`.

### Patch Changes

- [#777](https://github.com/tdeekens/promster/pull/777) [`9d6a2ee`](https://github.com/tdeekens/promster/commit/9d6a2ee81ea3e40fac3e788d9942f66c868670a5) Thanks [@tdeekens](https://github.com/tdeekens)! - refactor: to use yarn@3

* [#776](https://github.com/tdeekens/promster/pull/776) [`7158530`](https://github.com/tdeekens/promster/commit/71585308af86964ede48412b3e0d75545aee7aca) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: add changeset for apollo

* Updated dependencies [[`d49c30f`](https://github.com/tdeekens/promster/commit/d49c30f0004e0f4883ac356598ddf82b87b7c9d6), [`402c8c0`](https://github.com/tdeekens/promster/commit/402c8c01a3dfa605d47e0f974ac554d65c237d50), [`e5658c7`](https://github.com/tdeekens/promster/commit/e5658c7189d09071a21c299b78423e0782392c07), [`e5658c7`](https://github.com/tdeekens/promster/commit/e5658c7189d09071a21c299b78423e0782392c07), [`1b84464`](https://github.com/tdeekens/promster/commit/1b8446455324e4ceefb4b032eddb43e9b8bb63d2), [`548c56e`](https://github.com/tdeekens/promster/commit/548c56e1ec7ccaa5b1aca71d33db65ad91e64f3c), [`5e67884`](https://github.com/tdeekens/promster/commit/5e6788481fee15479c6505d3475ab716f7378f33), [`dfc14a3`](https://github.com/tdeekens/promster/commit/dfc14a3d8ec309723c6b904949e506c63c04c3c0), [`9d6a2ee`](https://github.com/tdeekens/promster/commit/9d6a2ee81ea3e40fac3e788d9942f66c868670a5)]:
  - @promster/metrics@9.0.0
