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
};
export type TDefaultedPromsterOptions = DeepRequired<TOptionalPromsterOptions>;

export type THttpMetrics = {
  httpRequestDurationPerPercentileInSeconds?: Summary[];
  httpRequestDurationInSeconds?: Histogram[];
  httpRequestsTotal?: Counter[];
  httpRequestContentLengthInBytes?: Histogram[];
  httpResponseContentLengthInBytes?: Histogram[];
};
export type TGcMetrics = {
  up: Gauge[];
};
export type TGraphQlMetrics = {
  graphQlParseDuration?: Histogram[];
  graphQlValidationDuration?: Histogram[];
  graphQlResolveFieldDuration?: Histogram[];
  graphQlRequestDuration?: Histogram[];
  graphQlErrorsTotal?: Counter[];
};

export type TValueOf<T> = T[keyof T];
