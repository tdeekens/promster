import { beforeEach, describe, expect, it } from 'vitest';

import { normalizeMethod } from '../../src/normalizers/method';

describe('normalizeMethod', () => {
  const method = 'GET';
  let normalizedMethod;
  beforeEach(() => {
    normalizedMethod = normalizeMethod(method);
  });

  it('should lowercase the method', () => {
    expect(normalizedMethod).toEqual('get');
  });
});
