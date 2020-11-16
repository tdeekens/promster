import { Gauge, Counter, Summary, Histogram } from 'prom-client';

export type TLabelValues = Record<string, string | number>

export type TPromsterOptions = {
  labels?: string[];
  accuracies?: Array<'ms' | 's'>;
  metricPrefix?: string;
  metricTypes?: string[];
  metricNames?: Record<string, string | string[]>;
  normalizePath?: (path: string) => string;
  normalizeStatusCode?: (code: number) => number;
  normalizeMethod?: (method: string) => string;
  getLabelValues?: <Q, S>(request: Q, response: S) => TLabelValues;
  detectKubernetes?: boolean;
  buckets?: [number];
  percentiles?: [number];
  skip?: <Q, S>(request: Q, response: S, labels: TLabelValues) => boolean;
};

export type TMetricTypes = {
  up: Array<Gauge<string>>;
  countOfGcs: Array<Counter<string>>;
  durationOfGc: Array<Counter<string>>;
  reclaimedInGc: Array<Counter<string>>;
  httpRequestDurationPerPercentileInMilliseconds: Array<Summary<string>>;
  httpRequestDurationInMilliseconds: Array<Histogram<string>>;
  httpRequestDurationPerPercentileInSeconds: Array<Summary<string>>;
  httpRequestDurationInSeconds: Array<Histogram<string>>;
  httpRequestsTotal: Array<Counter<string>>;
};

export type TValueOf<T> = T[keyof T];
