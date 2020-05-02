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
  isRunningInKubernetes,
} from '@promster/metrics';
import pkg from '../../package.json';

let recordRequest: TRequestRecorder;
let upMetric: TMetricTypes['up'];

// @ts-ignore
const extractPath = (req: FastifyRequest) => req.raw.originalUrl || req.raw.url;
const getRequestRecorder = () => recordRequest;
const signalIsUp = () =>
  upMetric?.forEach((upMetricType) => upMetricType.set(1));
const signalIsNotUp = () =>
  upMetric?.forEach((upMetricType) => upMetricType.set(0));

const createPlugin = async (
  fastify: FastifyInstance,
  options: TPromsterOptions
) => {
  const defaultedOptions = merge(
    createMetricTypes.defaultOptions,
    createRequestRecorder.defaultOptions,
    defaultNormalizers,
    options
  );

  const shouldSkipMetricsByEnvironment =
    defaultedOptions.detectKubernetes === true && !isRunningInKubernetes;

  const metricTypes = createMetricTypes(defaultedOptions);
  const observeGc = createGcObserver(metricTypes);

  recordRequest = createRequestRecorder(metricTypes, defaultedOptions);
  upMetric = metricTypes?.up;

  if (!shouldSkipMetricsByEnvironment) {
    observeGc();
  }

  fastify.decorate('Prometheus', Prometheus);
  fastify.decorate('recordRequest', recordRequest);
  fastify.decorateRequest('__promsterStartTime__', null);

  fastify.addHook('onRequest', async (request, _) => {
    // @ts-ignore
    request.__promsterStartTime__ = process.hrtime();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const labels = Object.assign(
      {},
      {
        method: defaultedOptions.normalizeMethod(request.raw.method, {
          request,
          reply,
        }),
        status_code: defaultedOptions.normalizeStatusCode(
          reply.res.statusCode,
          { request, reply }
        ),
        path: defaultedOptions.normalizePath(extractPath(request), {
          request,
          reply,
        }),
      },
      defaultedOptions.getLabelValues &&
        defaultedOptions.getLabelValues(request, reply)
    );

    const shouldSkipByRequest =
      defaultedOptions.skip && defaultedOptions.skip(request, reply);

    if (!shouldSkipByRequest && !shouldSkipMetricsByEnvironment) {
      // @ts-ignore
      recordRequest(request.__promsterStartTime__, {
        labels,
      });
    }
  });
};

const plugin = fastifyPlugin(createPlugin, {
  fastify: '>= 1.6.0',
  name: pkg.name,
});

export { plugin, getRequestRecorder, signalIsUp, signalIsNotUp, extractPath };
