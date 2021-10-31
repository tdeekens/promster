# @promster/marblejs

## 5.0.0

### Major Changes

- [#758](https://github.com/tdeekens/promster/pull/758) [`f02e6fe`](https://github.com/tdeekens/promster/commit/f02e6fe9950070d7df3cc0854f407cabe10d2aea) Thanks [@tdeekens](https://github.com/tdeekens)! - We droped support for Node.js `< 14` via the `engines` field of the respective `package.json` files.

  We didn't make any changes to our code to prevent e.g. Node.js v9 to work but will not claim to officially support it any longer.

### Patch Changes

- [#762](https://github.com/tdeekens/promster/pull/762) [`92cdf28`](https://github.com/tdeekens/promster/commit/92cdf281ff57f901835f14d474ae9cc1fb6fe2b2) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies

- Updated dependencies [[`f02e6fe`](https://github.com/tdeekens/promster/commit/f02e6fe9950070d7df3cc0854f407cabe10d2aea), [`7e7a1c6`](https://github.com/tdeekens/promster/commit/7e7a1c615e493217dfed00966f89880db9322485), [`92cdf28`](https://github.com/tdeekens/promster/commit/92cdf281ff57f901835f14d474ae9cc1fb6fe2b2), [`92cdf28`](https://github.com/tdeekens/promster/commit/92cdf281ff57f901835f14d474ae9cc1fb6fe2b2)]:
  - @promster/metrics@8.0.0

## 4.1.2

### Patch Changes

- [#755](https://github.com/tdeekens/promster/pull/755) [`84435d4`](https://github.com/tdeekens/promster/commit/84435d46f295ad2e80d40328c95852a1e7beb0de) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies and release all packages

* [#752](https://github.com/tdeekens/promster/pull/752) [`86c7fe0`](https://github.com/tdeekens/promster/commit/86c7fe085f564b395b386b03c6f2cb755a51f897) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency fp-ts to v2.11.5

* Updated dependencies [[`84435d4`](https://github.com/tdeekens/promster/commit/84435d46f295ad2e80d40328c95852a1e7beb0de)]:
  - @promster/metrics@7.0.4

## 4.1.1

### Patch Changes

- [#740](https://github.com/tdeekens/promster/pull/740) [`08b8029`](https://github.com/tdeekens/promster/commit/08b802983337ca55a95aad887abbf43e6469830b) Thanks [@tdeekens](https://github.com/tdeekens)! - Fix ontent-length mentric to default to 0

* [`a24f38f`](https://github.com/tdeekens/promster/commit/a24f38ff070220a28da5bf64d7d9e3a3167d1152) Thanks [@tdeekens](https://github.com/tdeekens)! - Update all dependencies including gc-stats

* Updated dependencies [[`a24f38f`](https://github.com/tdeekens/promster/commit/a24f38ff070220a28da5bf64d7d9e3a3167d1152)]:
  - @promster/metrics@7.0.2

## 4.1.0

### Minor Changes

- [#705](https://github.com/tdeekens/promster/pull/705) [`e2a1595`](https://github.com/tdeekens/promster/commit/e2a15959c4f11191093a0f0fa0e472434207f020) Thanks [@tdeekens](https://github.com/tdeekens)! - Add content length metric for both requests and responses. Both are recorded as Prometheus histograms under the name `http_request_content_length_bytes`
  and `http_response_content_length_bytes`.

### Patch Changes

- [#703](https://github.com/tdeekens/promster/pull/703) [`e351e91`](https://github.com/tdeekens/promster/commit/e351e91b68ebf3bb13e70e5fa4925aaa96343344) Thanks [@tdeekens](https://github.com/tdeekens)! - Refactor to require Node.js v14 and drop official support for anything below

  The `engines` field of the `package.json` now requires Node.js v14 and not v9 as prior. There are no actual changes in the library however anything smaler v14 will not be officially supported.

- Updated dependencies [[`e351e91`](https://github.com/tdeekens/promster/commit/e351e91b68ebf3bb13e70e5fa4925aaa96343344), [`e2a1595`](https://github.com/tdeekens/promster/commit/e2a15959c4f11191093a0f0fa0e472434207f020), [`e351e91`](https://github.com/tdeekens/promster/commit/e351e91b68ebf3bb13e70e5fa4925aaa96343344)]:
  - @promster/metrics@7.0.0

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
