const {
  createRequestRecorder,
  createGcObserver,
} = require('@promster/metrics');
const { default: createPlugin } = require('./plugin.js');

jest.mock('@promster/metrics', () => ({
  Prometheus: 'MockPrometheus',
  createMetricTypes: jest.fn(),
  createRequestRecorder: jest.fn(() => jest.fn()),
  createGcObserver: jest.fn(() => jest.fn()),
  defaultNormalizers: {
    normalizePath: jest.fn(_ => _),
    normalizeStatusCode: jest.fn(_ => _),
    normalizeMethod: jest.fn(_ => _),
  },
}));

describe('plugin', () => {
  let plugin;
  describe('when creating plugin', () => {
    let observeGc = jest.fn();
    let recordRequest = jest.fn();

    beforeEach(() => {
      createGcObserver.mockReturnValue(jest.fn(observeGc));
      createRequestRecorder.mockReturnValue(jest.fn(recordRequest));

      plugin = createPlugin();
    });

    it('should start observing garbage collection', () => {
      expect(observeGc).toHaveBeenCalled();
    });

    describe('when request starts', () => {
      let server;
      let startedRequest = {
        method: 'GET',
        route: {
          path: 'foo/bar',
        },
      };
      let finishedRequest = {
        promster: { start: 2 },
        method: 'GET',
        response: {
          statusCode: 200,
        },
        route: {
          path: 'foo/bar',
        },
      };
      let options = {};
      let done = jest.fn();
      let h = { continue: 'continue' };

      beforeEach(() => {
        class Server {
          constructor() {
            this.version = '17.0.0';

            this._handlers = {
              request: null,
              response: null,
            };
            this.decorate = jest.fn();

            this.events = {
              on: jest.fn((event, cb) => {
                if (event === 'request') this._handlers.request = cb;
                if (event === 'response') this._handlers.response = cb;
              }),
            };
          }

          emit(event, ...args) {
            this._handlers[event](...args);
          }
        }
        server = new Server();

        plugin.register(server, options, done);
      });

      it('should decorate the server', () => {
        expect(server.decorate).toHaveBeenCalledTimes(2);
      });

      it('should invoke the done callback', () => {
        expect(done).toHaveBeenCalled();
      });

      describe('when the request starts', () => {
        beforeEach(() => {
          server.emit('request', startedRequest, h);
        });
        it('should assign promster start date on request', () => {
          expect(startedRequest).toHaveProperty('promster.start');
        });
      });

      describe('when the response finishes', () => {
        beforeEach(() => {
          server.emit('response', finishedRequest);
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
                status_code: finishedRequest.response.statusCode,
                method: finishedRequest.method,
                path: finishedRequest.route.path,
              }),
            })
          );
        });
      });
    });
  });
});
