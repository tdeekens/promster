# @promster/express

## 5.1.3

### Patch Changes

- [#755](https://github.com/tdeekens/promster/pull/755) [`84435d4`](https://github.com/tdeekens/promster/commit/84435d46f295ad2e80d40328c95852a1e7beb0de) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and release all packages

- Updated dependencies [[`84435d4`](https://github.com/tdeekens/promster/commit/84435d46f295ad2e80d40328c95852a1e7beb0de)]:
  - @promster/metrics@7.0.4

## 5.1.2

### Patch Changes

- [#740](https://github.com/tdeekens/promster/pull/740) [`08b8029`](https://github.com/tdeekens/promster/commit/08b802983337ca55a95aad887abbf43e6469830b) Thanks [@tdeekens](https://github.com/tdeekens)! - Fix ontent-length mentric to default to 0

* [`a24f38f`](https://github.com/tdeekens/promster/commit/a24f38ff070220a28da5bf64d7d9e3a3167d1152) Thanks [@tdeekens](https://github.com/tdeekens)! - Update all dependencies including gc-stats

* Updated dependencies [[`a24f38f`](https://github.com/tdeekens/promster/commit/a24f38ff070220a28da5bf64d7d9e3a3167d1152)]:
  - @promster/metrics@7.0.2

## 5.1.1

### Patch Changes

- [`cbc12c7`](https://github.com/tdeekens/promster/commit/cbc12c76ce1414f08f914ceb5ecd9747d497b71d) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and added spell check as a GitHub Action

- Updated dependencies [[`cbc12c7`](https://github.com/tdeekens/promster/commit/cbc12c76ce1414f08f914ceb5ecd9747d497b71d)]:
  - @promster/metrics@7.0.1

## 5.1.0

### Minor Changes

- [#705](https://github.com/tdeekens/promster/pull/705) [`e2a1595`](https://github.com/tdeekens/promster/commit/e2a15959c4f11191093a0f0fa0e472434207f020) Thanks [@tdeekens](https://github.com/tdeekens)! - Add content length metric for both requests and responses. Both are recorded as Prometheus histograms under the name `http_request_content_length_bytes`
  and `http_response_content_length_bytes`.

### Patch Changes

- Updated dependencies [[`e351e91`](https://github.com/tdeekens/promster/commit/e351e91b68ebf3bb13e70e5fa4925aaa96343344), [`e2a1595`](https://github.com/tdeekens/promster/commit/e2a15959c4f11191093a0f0fa0e472434207f020), [`e351e91`](https://github.com/tdeekens/promster/commit/e351e91b68ebf3bb13e70e5fa4925aaa96343344)]:
  - @promster/metrics@7.0.0

## 5.0.3

### Patch Changes

- [#620](https://github.com/tdeekens/promster/pull/620) [`ec2a8f8`](https://github.com/tdeekens/promster/commit/ec2a8f83a94bbe63360cf7027eeba92895315a19) Thanks [@tdeekens](https://github.com/tdeekens)! - refactor: improve typings (not exposed part)

* [#618](https://github.com/tdeekens/promster/pull/618) [`bbab9ca`](https://github.com/tdeekens/promster/commit/bbab9cad6a3484e4894d159267d62e54e202812a) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update deps

* Updated dependencies [[`ec2a8f8`](https://github.com/tdeekens/promster/commit/ec2a8f83a94bbe63360cf7027eeba92895315a19), [`bbab9ca`](https://github.com/tdeekens/promster/commit/bbab9cad6a3484e4894d159267d62e54e202812a)]:
  - @promster/metrics@6.0.2

## 5.0.2

### Patch Changes

- [#601](https://github.com/tdeekens/promster/pull/601) [`17a24dc`](https://github.com/tdeekens/promster/commit/17a24dc0d735478001524c853b9f54f862153852) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and apply eslint rule suggestions.

- Updated dependencies [[`17a24dc`](https://github.com/tdeekens/promster/commit/17a24dc0d735478001524c853b9f54f862153852)]:
  - @promster/metrics@6.0.1

## 5.0.1

### Patch Changes

- Updated dependencies [[`daf8605`](https://github.com/tdeekens/promster/commit/daf86055e64cb420c83dbc7abbcd5024d449c53f)]:
  - @promster/metrics@6.0.0

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

- Updated dependencies [[`bdf75de`](https://github.com/tdeekens/promster/commit/bdf75dec8d0ce6be65ecccf5963f348e1a0a96b3), [`0eb64ca`](https://github.com/tdeekens/promster/commit/0eb64cac9a4a51dab1a556f46c97a2a5542bcc88)]:
  - @promster/metrics@5.0.0

## 4.1.15

### Patch Changes

- [`a0dc407`](https://github.com/tdeekens/promster/commit/a0dc407f1ceca1129942b30b7149a0d4e2b5fef8) [#500](https://github.com/tdeekens/promster/pull/500) Thanks [@natoehv](https://github.com/natoehv)! - changed TApp typing

## 4.1.14

### Patch Changes

- [`4c3af06`](https://github.com/tdeekens/promster/commit/4c3af06bc0b65eb067f195591e48839e632375bd) [#483](https://github.com/tdeekens/promster/pull/483) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update dependencies

- Updated dependencies [[`4c3af06`](https://github.com/tdeekens/promster/commit/4c3af06bc0b65eb067f195591e48839e632375bd)]:
  - @promster/metrics@4.1.13

## 4.1.13

### Patch Changes

- [`158e7b9`](https://github.com/tdeekens/promster/commit/158e7b9af01133db54376bb96dbdccdd96bfa7a3) Thanks [@tdeekens](https://github.com/tdeekens)! - Dependency updates across all packages

- Updated dependencies [[`158e7b9`](https://github.com/tdeekens/promster/commit/158e7b9af01133db54376bb96dbdccdd96bfa7a3)]:
  - @promster/metrics@4.1.12

## 4.1.12

### Patch Changes

- [`7853faa`](https://github.com/tdeekens/promster/commit/7853faa4e140eaae0622fb7c66d8145d258d7f5e) [#447](https://github.com/tdeekens/promster/pull/447) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update deps

- Updated dependencies [[`7853faa`](https://github.com/tdeekens/promster/commit/7853faa4e140eaae0622fb7c66d8145d258d7f5e)]:
  - @promster/metrics@4.1.11

## 4.1.11

### Patch Changes

- [`c2b8e0d`](https://github.com/tdeekens/promster/commit/c2b8e0d472b6e31e053460d8f714eaf790a17eb9) [#358](https://github.com/tdeekens/promster/pull/358) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies.

* [`6f99f64`](https://github.com/tdeekens/promster/commit/6f99f644ccd2cd0b60c172968266c3ac3f76e826) [#360](https://github.com/tdeekens/promster/pull/360) Thanks [@tdeekens](https://github.com/tdeekens)! - Update to eslint v7

* Updated dependencies [[`c2b8e0d`](https://github.com/tdeekens/promster/commit/c2b8e0d472b6e31e053460d8f714eaf790a17eb9), [`6f99f64`](https://github.com/tdeekens/promster/commit/6f99f644ccd2cd0b60c172968266c3ac3f76e826)]:
  - @promster/metrics@4.1.10
