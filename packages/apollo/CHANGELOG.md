# @promster/apollo

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
