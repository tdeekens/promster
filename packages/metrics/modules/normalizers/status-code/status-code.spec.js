const { default: normalizeStatusCode } = require('./status-code');

describe('normalizeStatusCode', () => {
  let normalizedStatusCode;
  beforeEach(() => {
    normalizedStatusCode = normalizeStatusCode(200);
  });

  it('should return the status code', () => {
    expect(normalizedStatusCode).toEqual(200);
  });
});
