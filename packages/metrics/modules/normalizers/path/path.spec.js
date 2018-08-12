const { default: normalizePath } = require('./path');

describe('normalizePath', () => {
  let normalizedPath;

  describe('with resources in path', () => {
    beforeEach(() => {
      normalizedPath = normalizePath('/userId/123');
    });

    it('should not remove the first resource', () => {
      expect(normalizedPath).toEqual(expect.stringContaining('userId'));
    });

    it('should remove the subsequent resource', () => {
      expect(normalizedPath).not.toEqual(expect.stringContaining('123'));
    });

    it('should insert placeholders for removed path fragments', () => {
      expect(normalizedPath).toEqual('/userId/#val');
    });
  });

  describe('with query paramters', () => {
    beforeEach(() => {
      normalizedPath = normalizePath('/userId/123?query=foo');
    });

    it('should remove the query variables', () => {
      expect(normalizedPath).not.toEqual(expect.stringContaining('query'));
    });
  });
});
