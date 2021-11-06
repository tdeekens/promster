import type { DeepRequired } from 'ts-essentials';
import { Gauge, Counter, Summary, Histogram } from 'prom-client';

export type TLabelValues = Record<string, string | number>;

type TContext<Q, S> = {
  req: Q;
  res: S;
};
export type TPromsterOptions = {
  labels?: string[];
  metricPrefix?: string;
  metricTypes?: string[];
  metricNames?: Record<string, string | string[]>;
  normalizePath?: <Q, S>(path: string, context: TContext<Q, S>) => string;
  normalizeStatusCode?: <Q, S>(code: number, context: TContext<Q, S>) => number;
  normalizeMethod?: <Q, S>(method: string, context: TContext<Q, S>) => string;
  getLabelValues?: <Q, S>(request: Q, response: S) => TLabelValues;
  detectKubernetes?: boolean;
  buckets?: [number];
  percentiles?: [number];
  skip?: <Q, S>(request: Q, response: S, labels: TLabelValues) => boolean;
  disableGcMetrics?: boolean;
};
export type TDefaultedPromsterOptions = DeepRequired<TPromsterOptions>;

export type THttpMetrics = {
  httpRequestDurationPerPercentileInSeconds?: Array<Summary<string>>;
  httpRequestDurationInSeconds?: Array<Histogram<string>>;
  httpRequestsTotal?: Array<Counter<string>>;
  httpRequestContentLengthInBytes?: Array<Histogram<string>>;
  httpResponseContentLengthInBytes?: Array<Histogram<string>>;
};
export type TGcMetrics = {
  up: Array<Gauge<string>>;
  countOfGcs: Array<Counter<string>>;
  durationOfGc: Array<Counter<string>>;
  reclaimedInGc: Array<Counter<string>>;
};
export type TGraphQlMetrics = {
  graphQlParseDuration?: Array<Histogram<string>>;
  graphQlValidationDuration?: Array<Histogram<string>>;
  graphQlResolveFieldDuration?: Array<Histogram<string>>;
  graphQlRequestDuration?: Array<Histogram<string>>;
  graphQlErrorsTotal?: Array<Counter<string>>;
};

export type TValueOf<T> = T[keyof T];

export type TRequestTiming = [number, number];
