import { type DeepRequired } from 'ts-essentials';
import {
  type Gauge,
  type Counter,
  type Summary,
  type Histogram,
} from 'prom-client';

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
  buckets?: number[];
  percentiles?: number[];
  disableGcMetrics?: boolean;
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
  countOfGcs: Counter[];
  durationOfGc: Counter[];
  reclaimedInGc: Counter[];
};
export type TGraphQlMetrics = {
  graphQlParseDuration?: Histogram[];
  graphQlValidationDuration?: Histogram[];
  graphQlResolveFieldDuration?: Histogram[];
  graphQlRequestDuration?: Histogram[];
  graphQlErrorsTotal?: Counter[];
};

export type TValueOf<T> = T[keyof T];
