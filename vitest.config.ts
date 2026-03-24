import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

const packageAliases = {
  '@promster/apollo': resolve(__dirname, 'packages/apollo/src/index.ts'),
  '@promster/express': resolve(__dirname, 'packages/express/src/index.ts'),
  '@promster/fastify': resolve(__dirname, 'packages/fastify/src/index.ts'),
  '@promster/hapi': resolve(__dirname, 'packages/hapi/src/index.ts'),
  '@promster/marblejs': resolve(__dirname, 'packages/marblejs/src/index.ts'),
  '@promster/metrics': resolve(__dirname, 'packages/metrics/src/index.ts'),
  '@promster/server': resolve(__dirname, 'packages/server/src/index.ts'),
  '@promster/types': resolve(__dirname, 'packages/types/src/index.ts'),
  '@promster/undici': resolve(__dirname, 'packages/undici/src/index.ts'),
};

export default defineConfig({
  resolve: {
    alias: packageAliases,
  },
  test: {
    globals: true,
    include: ['packages/**/*.spec.ts', 'packages/**/*.spec.js'],
  },
});
