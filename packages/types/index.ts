type TLabelValues = {
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
