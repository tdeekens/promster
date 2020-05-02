import { Gauge, Counter, Summary, Histogram } from 'prom-client';
export type TLabelValues = {
  [key: string]: string | number;
};

export type TPromsterOptions = {
  labels?: Array<string>;
  accuracies?: Array<'ms' | 's'>;
  metricPrefix?: string;
  metricTypes?: Array<string>;
  metricNames?: {
    [key: string]: string | string[];
  };
  normalizePath?: (path: string) => string;
  normalizeStatusCode?: (code: number) => number;
  normalizeMethod?: (method: string) => string;
  getLabelValues?: <Q, S>(request: Q, response: S) => TLabelValues;
  detectKubernetes?: boolean;
};

export type TMetricTypes = {
  up: Gauge<string>[];
  countOfGcs: Counter<string>[];
  durationOfGc: Counter<string>[];
  reclaimedInGc: Counter<string>[];
  httpRequestDurationPerPercentileInMilliseconds: Summary<string>[];
  httpRequestDurationInMilliseconds: Histogram<string>[];
  httpRequestDurationPerPercentileInSeconds: Summary<string>[];
  httpRequestDurationInSeconds: Histogram<string>[];
  httpRequestsTotal: Counter<string>[];
};

export type TValueOf<T> = T[keyof T];
