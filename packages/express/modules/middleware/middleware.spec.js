const {
  Prometheus,
  createRequestObserver,
  createGcObserver,
} = require('@promster/metrics');
const {
  exposeOnLocals,
  extractPath,
  default: createMiddleware,
} = require('./middleware.js');

jest.mock('@promster/metrics', () => ({
  Prometheus: 'MockPrometheus',
  createMetricTypes: jest.fn(),
  createRequestObserver: jest.fn(() => jest.fn()),
  createGcObserver: jest.fn(() => jest.fn()),
  defaultNormalizers: {
    normalizePath: jest.fn(_ => _),
    normalizeStatusCode: jest.fn(_ => _),
    normalizeMethod: jest.fn(_ => _),
  },
}));

describe('exposing Prometheus', () => {
  describe('with app and locals', () => {
    let app = { locals: {} };
    beforeEach(() => {
      exposeOnLocals(app, { key: 'Prometheus', value: Prometheus });
    });

    it('should expose Prometheus on app locals', () => {
      expect(app.locals).toHaveProperty('Prometheus', 'MockPrometheus');
    });
  });

  describe('without app and locals', () => {
    let app = {};
    beforeEach(() => {
      exposeOnLocals(app, { key: 'Prometheus', value: Prometheus });
    });

    it('should not expose Prometheus on app locals', () => {
      expect(app).not.toHaveProperty('locals');
    });
  });
});

describe('extracting path', () => {
  let extractedPath;
  describe('with original url', () => {
    let req = { originalUrl: 'originalUrl', url: 'nextUrl' };

    beforeEach(() => {
      extractedPath = extractPath(req);
    });

    it('should extract original url', () => {
      expect(extractedPath).toEqual(req.originalUrl);
    });
  });

  describe('with out original url', () => {
    let req = { url: 'nextUrl' };

    beforeEach(() => {
      extractedPath = extractPath(req);
    });

    it('should extract url', () => {
      expect(extractedPath).toEqual(req.url);
    });
  });
});

describe('middleware', () => {
  let middleware;
  describe('when creating middleware', () => {
    let observeGc = jest.fn();
    let observeRequest = jest.fn();

    beforeEach(() => {
      createGcObserver.mockReturnValue(jest.fn(observeGc));
      createRequestObserver.mockReturnValue(jest.fn(observeRequest));

      middleware = createMiddleware();
    });

    it('should start observing garbage collection', () => {
      expect(observeGc).toHaveBeenCalled();
    });

    describe('when request starts', () => {
      let req;
      let res;
      let next;
      let onRequest = jest.fn();

      beforeEach(() => {
        req = {
          method: 'GET',
        };
        next = jest.fn();
        res = {
          statusCode: 200,
          url: 'foo/bar',
          on: onRequest,
        };

        middleware(req, res, next);
      });

      it('should invoke `next` to pass the middleware', () => {
        expect(next).toHaveBeenCalled();
      });

      it('should listen to the response to finish', () => {
        expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
      });

      describe('when the response finishes', () => {
        beforeEach(() => {
          res.on.mock.calls[res.on.mock.calls.length - 1][1]();
        });

        it('should have observed the request', () => {
          expect(observeRequest).toHaveBeenCalled();
        });

        it('should pass labels to the observer', () => {
          expect(observeRequest).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              labels: expect.objectContaining({
                // eslint-disable-next-line camelcase
                status_code: res.statusCode,
                method: req.method,
                path: req.url,
              }),
            })
          );
        });
      });
    });
  });
});
