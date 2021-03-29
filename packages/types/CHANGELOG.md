# @promster/types

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
