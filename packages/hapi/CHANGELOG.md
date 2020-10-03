# @promster/hapi

## 5.0.0

### Major Changes

- [`56fe635`](https://github.com/tdeekens/promster/commit/56fe63515d46e179912f61037c10ebb086bc5324) [#473](https://github.com/tdeekens/promster/pull/473) Thanks [@tdeekens](https://github.com/tdeekens)! - breaking(hapi): to bump required node to v12

  The `@promster/hapi` package now requires at least Node.js v12. This is rooted in the `@hapi/hapi` package being used which were introduced in 18.2.0.

### Patch Changes

- [`158e7b9`](https://github.com/tdeekens/promster/commit/158e7b9af01133db54376bb96dbdccdd96bfa7a3) Thanks [@tdeekens](https://github.com/tdeekens)! - Dependency updates across all packages

- Updated dependencies [[`158e7b9`](https://github.com/tdeekens/promster/commit/158e7b9af01133db54376bb96dbdccdd96bfa7a3)]:
  - @promster/metrics@4.1.12

## 4.2.1

### Patch Changes

- [`7853faa`](https://github.com/tdeekens/promster/commit/7853faa4e140eaae0622fb7c66d8145d258d7f5e) [#447](https://github.com/tdeekens/promster/pull/447) Thanks [@tdeekens](https://github.com/tdeekens)! - chore: update deps

- Updated dependencies [[`7853faa`](https://github.com/tdeekens/promster/commit/7853faa4e140eaae0622fb7c66d8145d258d7f5e)]:
  - @promster/metrics@4.1.11

## 4.2.0

### Minor Changes

- [`68a8aaf`](https://github.com/tdeekens/promster/commit/68a8aaf82ed0e5736240542781e9642efb31869e) [#440](https://github.com/tdeekens/promster/pull/440) Thanks [@todd](https://github.com/todd)! - Use correct status code when Hapi response is a Boom object

## 4.1.11

### Patch Changes

- [`79bbda4`](https://github.com/tdeekens/promster/commit/79bbda4119ad5d0aa1f49d025e9bdce94b7ae20c) [#373](https://github.com/tdeekens/promster/pull/373) Thanks [@iiroj](https://github.com/iiroj)! - @promster/hapi decorator fix

  We had a breaking change sneak in. The decorator of promster of exposing the Prometheus instance was changed from a property to a function returning the property. This reverts that change.

## 4.1.10

### Patch Changes

- [`c2b8e0d`](https://github.com/tdeekens/promster/commit/c2b8e0d472b6e31e053460d8f714eaf790a17eb9) [#358](https://github.com/tdeekens/promster/pull/358) Thanks [@tdeekens](https://github.com/tdeekens)! - Update dependencies.

* [`6f99f64`](https://github.com/tdeekens/promster/commit/6f99f644ccd2cd0b60c172968266c3ac3f76e826) [#360](https://github.com/tdeekens/promster/pull/360) Thanks [@tdeekens](https://github.com/tdeekens)! - Update to eslint v7

* Updated dependencies [[`c2b8e0d`](https://github.com/tdeekens/promster/commit/c2b8e0d472b6e31e053460d8f714eaf790a17eb9), [`6f99f64`](https://github.com/tdeekens/promster/commit/6f99f644ccd2cd0b60c172968266c3ac3f76e826)]:
  - @promster/metrics@4.1.10
