import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  dts: true,
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
