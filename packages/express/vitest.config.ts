import configShared from '@promster/vitest-config';
import { defineProject, mergeConfig } from 'vitest/config';

export default mergeConfig(
  configShared,
  defineProject({
    test: {
      environment: 'node',
    },
  }),
);
