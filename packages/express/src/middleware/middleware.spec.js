jest.mock('@promster/metrics', () => ({
  Prometheus: 'MockPrometheus',
  createMetricTypes: jest.fn(),
  createRequestRecorder: jest.fn(() => jest.fn()),
  createGcObserver: jest.fn(() => jest.fn()),
  defaultNormalizers: {
    normalizePath: jest.fn((_) => _),
    normalizeStatusCode: jest.fn((_) => _),
    normalizeMethod: jest.fn((_) => _),
  },
}));

const {
  Prometheus,
  createRequestRecorder,
  createGcObserver,
} = require('@promster/metrics');
const {
  exposeOnLocals,
  extractPath,
  createMiddleware,
} = require('./middleware');

describe('exposing Prometheus', () => {
  describe('with app and locals', () => {
    const app = { locals: {} };
    beforeEach(() => {
      exposeOnLocals({ app, key: 'Prometheus', value: Prometheus });
    });

    it('should expose Prometheus on app locals', () => {
      expect(app.locals).toHaveProperty('Prometheus', 'MockPrometheus');
    });
  });

  describe('without app and locals', () => {
    const app = {};
    beforeEach(() => {
      exposeOnLocals({ app, key: 'Prometheus', value: Prometheus });
    });

    it('should not expose Prometheus on app locals', () => {
      expect(app).not.toHaveProperty('locals');
    });
  });
});

describe('extracting path', () => {
  let extractedPath;
  describe('with original url', () => {
    const req = { originalUrl: 'originalUrl', url: 'nextUrl' };

    beforeEach(() => {
      extractedPath = extractPath(req);
    });

    it('should extract original url', () => {
      expect(extractedPath).toEqual(req.originalUrl);
    });
  });

  describe('with out original url', () => {
    const req = { url: 'nextUrl' };

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
    const observeGc = jest.fn();
    const recordRequest = jest.fn();

    beforeEach(() => {
      createGcObserver.mockReturnValue(jest.fn(observeGc));
      createRequestRecorder.mockReturnValue(jest.fn(recordRequest));

      middleware = createMiddleware();
    });

    it('should start observing garbage collection', () => {
      expect(observeGc).toHaveBeenCalled();
    });

    describe('when request starts', () => {
      let req;
      let res;
      let next;
      const onRequest = jest.fn();

      beforeEach(() => {
        req = {
          method: 'GET',
          getHeader: jest.fn(() => 123),
        };
        next = jest.fn();
        res = {
          statusCode: 200,
          url: 'foo/bar',
          on: onRequest,
          getHeader: jest.fn(() => 456),
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
          expect(recordRequest).toHaveBeenCalled();
        });

        it('should pass labels to the observer', () => {
          expect(recordRequest).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              labels: expect.objectContaining({
                // eslint-disable-next-line camelcase
                status_code: res.statusCode,
                method: req.method,
                path: req.url,
              }),
              requestContentLength: 123,
              responseContentLength: 456,
            })
          );
        });
      });
    });
  });
});
