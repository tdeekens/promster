const { default: normalizePath } = require('./path');

describe('normalizePath', () => {
  let normalizedPath;

  describe('with resources in path', () => {
    beforeEach(() => {
      normalizedPath = normalizePath('/some/path/154/userId/ABC363AFE2');
    });

    it('should not remove the path resource', () => {
      expect(normalizedPath).toEqual(expect.stringContaining('path'));
      expect(normalizedPath).toEqual(expect.stringContaining('userId'));
    });

    it('should the path value to the resource', () => {
      expect(normalizedPath).not.toEqual(expect.stringContaining('154'));
      expect(normalizedPath).not.toEqual(expect.stringContaining('ABC363AFE2'));
    });

    it('should insert placeholders for removed path fragments', () => {
      expect(normalizedPath).toEqual('/some/path/#val/userId/#val');
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
