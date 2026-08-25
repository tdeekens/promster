import type { Counter, Gauge, Histogram, Summary } from 'prom-client';
import type { DeepRequired } from 'ts-essentials';

export type TLabelValues = Record<string, string | number>;

type TContext<Q, S> = {
  req: Q;
  res: S;
};
export type TOptionalPromsterOptions = {
  labels?: string[];
  metricPrefix?: string;
  metricTypes?: string[];
  metricNames?: Record<string, string | string[]>;
  normalizePath?: <Q, S>(path: string, context: TContext<Q, S>) => string;
  normalizeStatusCode?: <Q, S>(code: number, context: TContext<Q, S>) => number;
  normalizeMethod?: <Q, S>(method: string, context: TContext<Q, S>) => string;
  getLabelValues?: <Q, S>(request: Q, response: S) => TLabelValues;
  detectKubernetes?: boolean;
  metricBuckets?: Record<string, number[]>;
  metricPercentiles?: Record<string, number[]>;
  disableGcMetrics?: boolean;
  gcCollectionInterval?: number;
  // NOTE:
  //   Aborting stops garbage collection metrics from being collected. There
  //   is no default, so leaving this unset keeps collection running for the
  //   lifetime of the process, which is the behavior every release so far
  //   has had.
  signal?: AbortSignal;
};
export type TDefaultedPromsterOptions = DeepRequired<TOptionalPromsterOptions>;

// NOTE:
//   The label name type is spelled out as `<string>` rather than left to the
//   default. `prom-client` defaults it to `string`, so today both spellings
//   mean the same thing, but its successor `@prometheus-io/client` defaults it
//   to `NoLabelNameType`, which is `never`. Under that default a bare
//   `Counter` is a metric that accepts no labels at all, which would silently
//   break every consumer calling `.inc({ method: 'GET' })` on these.
export type THttpMetrics = {
  httpRequestDurationPerPercentileInSeconds?: Summary<string>[];
  httpRequestDurationInSeconds?: Histogram<string>[];
  httpRequestsTotal?: Counter<string>[];
  httpRequestContentLengthInBytes?: Histogram<string>[];
  httpResponseContentLengthInBytes?: Histogram<string>[];
};
export type TGcMetrics = {
  up: Gauge<string>[];
};
export type TGraphQlMetrics = {
  graphQlParseDuration?: Histogram<string>[];
  graphQlValidationDuration?: Histogram<string>[];
  graphQlResolveFieldDuration?: Histogram<string>[];
  graphQlRequestDuration?: Histogram<string>[];
  graphQlErrorsTotal?: Counter<string>[];
};

export type TValueOf<T> = T[keyof T];
