# @promster/marblejs

## 4.0.3

### Patch Changes

- [#620](https://github.com/tdeekens/promster/pull/620) [`ec2a8f8`](https://github.com/tdeekens/promster/commit/ec2a8f83a94bbe63360cf7027eeba92895315a19) Thanks [@tdeekens](https://github.com/tdeekens)! - refactor: improve typings (not exposed part)

* [#618](https://github.com/tdeekens/promster/pull/618) [`bbab9ca`](https://github.com/tdeekens/promster/commit/bbab9cad6a3484e4894d159267d62e54e202812a) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update deps

* Updated dependencies [[`ec2a8f8`](https://github.com/tdeekens/promster/commit/ec2a8f83a94bbe63360cf7027eeba92895315a19), [`bbab9ca`](https://github.com/tdeekens/promster/commit/bbab9cad6a3484e4894d159267d62e54e202812a)]:
  - @promster/metrics@6.0.2

## 4.0.2

### Patch Changes

- [#601](https://github.com/tdeekens/promster/pull/601) [`17a24dc`](https://github.com/tdeekens/promster/commit/17a24dc0d735478001524c853b9f54f862153852) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and apply eslint rule suggestions.

- Updated dependencies [[`17a24dc`](https://github.com/tdeekens/promster/commit/17a24dc0d735478001524c853b9f54f862153852)]:
  - @promster/metrics@6.0.1

## 4.0.1

### Patch Changes

- Updated dependencies [[`daf8605`](https://github.com/tdeekens/promster/commit/daf86055e64cb420c83dbc7abbcd5024d449c53f)]:
  - @promster/metrics@6.0.0

## 4.0.0

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

- Updated dependencies [[`bdf75de`](https://github.com/tdeekens/promster/commit/bdf75dec8d0ce6be65ecccf5963f348e1a0a96b3), [`0eb64ca`](https://github.com/tdeekens/promster/commit/0eb64cac9a4a51dab1a556f46c97a2a5542bcc88)]:
  - @promster/metrics@5.0.0

## 3.1.14

### Patch Changes

- [`4c3af06`](https://github.com/tdeekens/promster/commit/4c3af06bc0b65eb067f195591e48839e632375bd) [#483](https://github.com/tdeekens/promster/pull/483) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update dependencies

- Updated dependencies [[`4c3af06`](https://github.com/tdeekens/promster/commit/4c3af06bc0b65eb067f195591e48839e632375bd)]:
  - @promster/metrics@4.1.13

## 3.1.13

### Patch Changes

- [`158e7b9`](https://github.com/tdeekens/promster/commit/158e7b9af01133db54376bb96dbdccdd96bfa7a3) Thanks [@tdeekens](https://github.com/tdeekens)! - Dependency updates across all packages

- Updated dependencies [[`158e7b9`](https://github.com/tdeekens/promster/commit/158e7b9af01133db54376bb96dbdccdd96bfa7a3)]:
  - @promster/metrics@4.1.12

## 3.1.12

### Patch Changes

- [`7853faa`](https://github.com/tdeekens/promster/commit/7853faa4e140eaae0622fb7c66d8145d258d7f5e) [#447](https://github.com/tdeekens/promster/pull/447) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update deps

- Updated dependencies [[`7853faa`](https://github.com/tdeekens/promster/commit/7853faa4e140eaae0622fb7c66d8145d258d7f5e)]:
  - @promster/metrics@4.1.11

## 3.1.11

### Patch Changes

- [`c2b8e0d`](https://github.com/tdeekens/promster/commit/c2b8e0d472b6e31e053460d8f714eaf790a17eb9) [#358](https://github.com/tdeekens/promster/pull/358) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies.

* [`6f99f64`](https://github.com/tdeekens/promster/commit/6f99f644ccd2cd0b60c172968266c3ac3f76e826) [#360](https://github.com/tdeekens/promster/pull/360) Thanks [@tdeekens](https://github.com/tdeekens)! - Update to eslint v7

* Updated dependencies [[`c2b8e0d`](https://github.com/tdeekens/promster/commit/c2b8e0d472b6e31e053460d8f714eaf790a17eb9), [`6f99f64`](https://github.com/tdeekens/promster/commit/6f99f644ccd2cd0b60c172968266c3ac3f76e826)]:
  - @promster/metrics@4.1.10
