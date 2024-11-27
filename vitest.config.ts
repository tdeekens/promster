import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['packages/**/*.spec.ts', 'packages/**/*.spec.js'],
    test: {
      coverage: {
        provider: 'istanbul',
        exclude: ['**/dist/**'],
      },
    },
  },
});
