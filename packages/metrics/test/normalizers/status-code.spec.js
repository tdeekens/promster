import { beforeEach, describe, expect, it } from 'vitest';

import { normalizeStatusCode } from '../../src/normalizers/status-code';

describe('normalizeStatusCode', () => {
  let normalizedStatusCode;
  beforeEach(() => {
    normalizedStatusCode = normalizeStatusCode(200);
  });

  it('should return the status code', () => {
    expect(normalizedStatusCode).toEqual(200);
  });
});
