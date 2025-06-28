import type { TPromsterTiming, TRequestRecorder } from '@promster/metrics';
import {
  createGcMetrics,
  createGcObserver,
  createHttpMetrics,
  createRequestRecorder,
  defaultNormalizers,
  Prometheus,
  skipMetricsInEnvironment,
  timing,
} from '@promster/metrics';
import type {
  TDefaultedPromsterOptions,
  TGcMetrics,
  THttpMetrics,
  TLabelValues,
  TOptionalPromsterOptions,
} from '@promster/types';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import merge from 'merge-options';
// @ts-expect-error
import pkg from '../../package.json';

let recordRequest: TRequestRecorder;
let upMetric: TGcMetrics['up'];

const extractPath = (req: FastifyRequest): string =>
  // @ts-expect-error
  req.raw.originalUrl || req.raw.url;
const getRequestRecorder = () => recordRequest;
const signalIsUp = () => {
  if (!upMetric) {
    return;
  }

  for (const upMetricType of upMetric) {
    upMetricType.set(1);
  }
};

const signalIsNotUp = () => {
  if (!upMetric) {
    return;
  }

  for (const upMetricType of upMetric) {
    upMetricType.set(0);
  }
};

type TSkipFunction = <TRequest = FastifyRequest, TResponse = FastifyReply>(
  _req: TRequest,
  _res: TResponse,
  _labels: TLabelValues
) => boolean;

export type TPromsterOptions = TOptionalPromsterOptions & {
  skip?: TSkipFunction;
};
const createPlugin = async (
  fastify: FastifyInstance,
  options: TPromsterOptions
) => {
  const allDefaultedOptions: TDefaultedPromsterOptions & {
    skip?: TSkipFunction;
  } = merge(
    createHttpMetrics.defaultOptions,
    createGcMetrics.defaultOptions,
    createRequestRecorder.defaultOptions,
    // @ts-expect-error
    createGcObserver.defaultOptions,
    defaultNormalizers,
    options
  );

  const shouldSkipMetricsByEnvironment =
    skipMetricsInEnvironment(allDefaultedOptions);

  const httpMetrics: THttpMetrics = createHttpMetrics(allDefaultedOptions);
  const gcMetrics: TGcMetrics = createGcMetrics(allDefaultedOptions);

  const observeGc = createGcObserver(gcMetrics, allDefaultedOptions);

  recordRequest = createRequestRecorder(httpMetrics, allDefaultedOptions);
  upMetric = gcMetrics?.up;

  if (!shouldSkipMetricsByEnvironment) {
    observeGc();
  }

  fastify.decorate('Prometheus', Prometheus);
  fastify.decorate('recordRequest', recordRequest);
  fastify.decorateRequest<TPromsterTiming | null>('__promsterTiming__', null);

  fastify.addHook('onRequest', async (request, _) => {
    // @ts-expect-error
    request.__promsterTiming__ = timing.start();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const labels = Object.assign(
      {},
      {
        method: allDefaultedOptions.normalizeMethod(request.raw.method ?? '', {
          req: request,
          res: reply,
        }),
        status_code: allDefaultedOptions.normalizeStatusCode(reply.statusCode, {
          req: request,
          res: reply,
        }),
        path: allDefaultedOptions.normalizePath(extractPath(request), {
          req: request,
          res: reply,
        }),
      },
      allDefaultedOptions.getLabelValues?.(request, reply)
    );

    const requestContentLength = Number(request.headers['content-length'] ?? 0);
    const responseContentLength = Number(
      reply.getHeader('content-length') ?? 0
    );

    const shouldSkipByRequest = allDefaultedOptions.skip?.(
      request,
      reply,
      labels
    );

    if (!shouldSkipByRequest && !shouldSkipMetricsByEnvironment) {
      // @ts-expect-error
      recordRequest(request.__promsterTiming__ as TPromsterTiming, {
        labels,
        requestContentLength,
        responseContentLength,
      });
    }
  });
};

const plugin = fastifyPlugin(createPlugin, {
  fastify: '>= 1.6.0',
  name: pkg.name,
});

export { plugin, getRequestRecorder, signalIsUp, signalIsNotUp, extractPath };
