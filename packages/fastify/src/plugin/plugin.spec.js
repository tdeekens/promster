jest.mock('@promster/metrics', () => ({
  Prometheus: 'MockPrometheus',
  createHttpMetrics: jest.fn(),
  createGcMetrics: jest.fn(),
  createRequestRecorder: jest.fn(() => jest.fn()),
  createGcObserver: jest.fn(() => jest.fn()),
  getSummary: jest.fn(() => 'metrics'),
  getContentType: jest.fn(() => 'text'),
  defaultNormalizers: {
    normalizePath: jest.fn((_) => _),
    normalizeStatusCode: jest.fn((_) => _),
    normalizeMethod: jest.fn((_) => _),
  },
  skipMetricsInEnvironment: jest.fn(() => false),
}));

const Fastify = require('fastify');
const {
  createRequestRecorder,
  createGcObserver,
} = require('@promster/metrics');
const { extractPath, plugin } = require('./plugin');

describe('extracting path', () => {
  let extractedPath;
  describe('with original url', () => {
    const req = { raw: { originalUrl: 'originalUrl', url: 'nextUrl' } };

    beforeEach(() => {
      extractedPath = extractPath(req);
    });

    it('should extract original url', () => {
      expect(extractedPath).toEqual(req.raw.originalUrl);
    });
  });

  describe('with out original url', () => {
    const req = { raw: { url: 'nextUrl' } };

    beforeEach(() => {
      extractedPath = extractPath(req);
    });

    it('should extract url', () => {
      expect(extractedPath).toEqual(req.raw.url);
    });
  });
});

describe('plugin', () => {
  let fastify;

  beforeEach(async () => {
    fastify = new Fastify();
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe('when registering plugin', () => {
    const observeGc = jest.fn();

    beforeEach(() => {
      createGcObserver.mockReturnValue(jest.fn(observeGc));
    });

    it('should start observing garbage collection', async () => {
      await fastify.register(plugin).ready();
      expect(observeGc).toHaveBeenCalled();
    });

    describe('decorates fastify', () => {
      it('should expose Prometheus on fastify', async () => {
        await fastify.register(plugin).ready();

        expect(fastify).toHaveProperty('Prometheus');
        expect(fastify).toHaveProperty('recordRequest');
      });
    });

    describe('when request starts', () => {
      const method = 'GET';
      const url = '/promster';

      describe('decorates fastify request', () => {
        it('should have __promsterStartTime__ on request', async () => {
          fastify.route({
            url,
            method,
            handler: (req, reply) => {
              expect(req).toHaveProperty('__promsterStartTime__');
              reply.send();
            },
          });

          await fastify.register(plugin).ready();
          await fastify.inject({ method, url });
        });
      });

      describe('when the response finishes', () => {
        const recordRequest = jest.fn();

        beforeEach(async () => {
          createRequestRecorder.mockReturnValue(jest.fn(recordRequest));
          await fastify.register(plugin).ready();
          await fastify.inject({ method, url });
        });

        it('should have observed the request', async () => {
          expect(recordRequest).toHaveBeenCalled();
        });

        it('should pass labels to the observer', async () => {
          expect(recordRequest).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              labels: expect.objectContaining({
                status_code: 404,
                method,
                path: url,
              }),
              responseContentLength: 80,
            })
          );
        });
      });
    });
  });
});
