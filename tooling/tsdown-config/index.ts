import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { defineConfig } from 'tsdown';

// TypeScript 7 (the native `tsgo` port) no longer ships the classic JS compiler
// API, so rolldown-plugin-dts' default `tsc` backend crashes. Generate `.d.ts`
// with `tsgo` instead. We reuse the native binary already bundled with the
// pinned `typescript` package (resolved via TS' own `getExePath`, which picks
// the right platform binary) so the declaration emitter never drifts from the
// type-checker and we avoid a redundant `@typescript/native-preview` download.
const require = createRequire(import.meta.url);
const typescriptDir = path.dirname(require.resolve('typescript/package.json'));
const { default: getExePath } = await import(
  pathToFileURL(path.join(typescriptDir, 'lib', 'getExePath.js')).href
);
const tsgoPath: string = getExePath();

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  dts: { tsgo: { path: tsgoPath } },
  target: 'esnext',
  clean: true,
  // Keep .js/.cjs (and .d.ts/.d.cts) extensions driven by package.json
  // `type: module`. tsdown defaults this to true for platform 'node', which
  // would emit .mjs/.d.mts and break the `exports` map's .cjs paths.
  fixedExtension: false,
  // Never bundle bare specifiers, i.e. anything that is not a relative (`.`) or
  // absolute (`/`) path. tsdown only auto-externalizes deps + peerDeps, so
  // type-only framework devDeps (fastify, @hapi/hapi, @marblejs/core) would
  // otherwise be pulled into the .d.ts bundle and fail on their own broken
  // upstream re-exports. This mirrors tsup's `skipNodeModulesBundle: true`.
  deps: { neverBundle: [/^[^./]/] },
});
