const { of } = require('rxjs');
const {
  createRequestRecorder,
  createGcObserver,
} = require('@promster/metrics');
const { extractPath, createMiddleware } = require('./middleware.js');
const { EventEmitter } = require('events');

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
    let recordRequest = jest.fn();

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
      let onRequest = jest.fn();
      let observer;

      beforeEach(() => {
        req = {
          method: 'GET',
        };

        res = new EventEmitter();
        res.statusCode = 200;
        res.on = onRequest;
        res.url = 'foo/bar';
        res.method = 'GET';

        const result$ = middleware(of(req), res);
        observer = jest.fn();
        result$.subscribe(observer);
      });

      it('should return req', () => {
        expect(observer).toHaveBeenCalledWith({
          method: 'GET',
        });
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
                status_code: 200,
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
