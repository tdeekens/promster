import { createRequestRecorder, createGcObserver } from '@promster/metrics';
import {
  createPlugin,
  getAreServerEventsSupported,
  getDoesResponseNeedInvocation,
} from './plugin.js';

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
        plugins: {},
        method: 'GET',
        route: {
          path: 'foo/bar',
        },
      };
      let finishedRequest = {
        plugins: { promster: { start: 2 } },
        method: 'GET',
        response: {
          statusCode: 200,
        },
        route: {
          path: 'foo/bar',
        },
      };
      let reply = {
        continue: Promise.resolve(),
      };
      let options = {};
      let done = jest.fn();

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
            this.ext = (event, cb) => {
              if (event === 'onRequest') this._handlers.request = cb;
            };
          }

          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
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
          server.emit('request', startedRequest, reply);
        });
        it('should assign promster start date on request', () => {
          expect(startedRequest).toHaveProperty('plugins.promster.start');
        });
      });

      describe('when the response finishes', () => {
        beforeEach(() => {
          server.emit('response', finishedRequest, reply);
        });
        it('should have observed the request', () => {
          expect(recordRequest).toHaveBeenCalled();
        });

        it('should pass labels to the observer', () => {
          expect(recordRequest).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              labels: expect.objectContaining({
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

describe('getAreServerEventsSupported', () => {
  describe('when server supports events', () => {
    it('should return `true`', () => {
      expect(getAreServerEventsSupported('17.0.0')).toBe(true);
      expect(getAreServerEventsSupported('17.1.0')).toBe(true);
      expect(getAreServerEventsSupported('18.0.0')).toBe(true);
    });
  });

  describe('when server does not support events', () => {
    it('should return `false`', () => {
      expect(getAreServerEventsSupported('16.0.0')).toBe(false);
      expect(getAreServerEventsSupported('15.4.0')).toBe(false);
    });
  });
});

describe('getDoesResponseNeedInvocation', () => {
  describe('when server needs reply continue invocation', () => {
    it('should return `true`', () => {
      expect(getDoesResponseNeedInvocation('16.0.0')).toBe(true);
      expect(getDoesResponseNeedInvocation('15.1.0')).toBe(true);
    });
  });

  describe('when server does not need reply continue invocation', () => {
    it('should return `false`', () => {
      expect(getDoesResponseNeedInvocation('17.0.0')).toBe(false);
    });
  });
});
