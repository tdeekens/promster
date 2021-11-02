import type { TPromsterOptions, TMetricTypes } from '@promster/types';
import type { TRequestRecorder } from '@promster/metrics';
import { FastifyInstance, FastifyRequest } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import merge from 'merge-options';
import {
  Prometheus,
  createMetricTypes,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
  skipMetricsInEnvironment,
} from '@promster/metrics';
import pkg from '../../package.json';

let recordRequest: TRequestRecorder;
let upMetric: TMetricTypes['up'];

const extractPath = (req: FastifyRequest): string =>
  // @ts-expect-error
  req.raw.originalUrl || req.raw.url;
const getRequestRecorder = () => recordRequest;
const signalIsUp = () => {
  if (!upMetric) {
    return;
  }

  upMetric.forEach((upMetricType) => {
    upMetricType.set(1);
  });
};

const signalIsNotUp = () => {
  if (!upMetric) {
    return;
  }

  upMetric.forEach((upMetricType) => {
    upMetricType.set(0);
  });
};

const createPlugin = async (
  fastify: FastifyInstance,
  options: TPromsterOptions
) => {
  const allDefaultedOptions = merge(
    createMetricTypes.defaultOptions,
    createRequestRecorder.defaultOptions,
    createGcObserver.defaultOptions,
    defaultNormalizers,
    options
  );

  const shouldSkipMetricsByEnvironment =
    skipMetricsInEnvironment(allDefaultedOptions);

  const metricTypes: TMetricTypes = createMetricTypes(allDefaultedOptions);
  const observeGc = createGcObserver(allDefaultedOptions, metricTypes);

  recordRequest = createRequestRecorder(metricTypes, allDefaultedOptions);
  upMetric = metricTypes?.up;

  if (!shouldSkipMetricsByEnvironment) {
    observeGc();
  }

  fastify.decorate('Prometheus', Prometheus);
  fastify.decorate('recordRequest', recordRequest);
  fastify.decorateRequest('__promsterStartTime__', null);

  fastify.addHook('onRequest', async (request, _) => {
    // @ts-expect-error
    request.__promsterStartTime__ = process.hrtime();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const labels = Object.assign(
      {},
      {
        method: allDefaultedOptions.normalizeMethod(request.raw.method, {
          request,
          reply,
        }),
        status_code: allDefaultedOptions.normalizeStatusCode(reply.statusCode, {
          request,
          reply,
        }),
        path: allDefaultedOptions.normalizePath(extractPath(request), {
          request,
          reply,
        }),
      },
      allDefaultedOptions.getLabelValues?.(request, reply)
    );

    const requestContentLength = Number(request.headers['content-length'] ?? 0);
    const responseContentLength = Number(
      reply.getHeader('content-length') ?? 0
    );

    const shouldSkipByRequest = allDefaultedOptions.skip?.(request, reply);

    if (!shouldSkipByRequest && !shouldSkipMetricsByEnvironment) {
      // @ts-expect-error
      recordRequest(request.__promsterStartTime__, {
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
