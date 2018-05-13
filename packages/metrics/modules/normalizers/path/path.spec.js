const { default: normalizePath } = require('./path');

describe('normalizePath', () => {
  let normalizedPath;
  beforeEach(() => {
    normalizedPath = normalizePath('/userId/123?query=foo');
  });

  it('should remove path variables', () => {
    expect(normalizedPath).not.toEqual(expect.stringContaining('123'));
  });

  it('should remove query variables', () => {
    expect(normalizedPath).not.toEqual(expect.stringContaining('query'));
  });

  it('should insert placeholders for variables', () => {
    expect(normalizedPath).toEqual('/userId/#val');
  });
});
