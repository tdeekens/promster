import once from 'lodash.once';
import type { PrometheusContentType } from 'prom-client';
import * as Prometheus from 'prom-client';
import { skipMetricsInEnvironment } from '../environment';

// NOTE:
//   This is the `globalRegistry` provided by the `prom-client`
//   We could create multiple registries with `new Prometheus.registry()`.
const defaultRegister = Prometheus.register;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface TClientOptions
  extends Prometheus.DefaultMetricsCollectorConfiguration<PrometheusContentType> {
  detectKubernetes?: boolean;
  prefix?: string;
}

const configure = once((options: TClientOptions) => {
  const shouldSkipMetricsInEnvironment = skipMetricsInEnvironment(options);

  if (!shouldSkipMetricsInEnvironment) {
    Prometheus.collectDefaultMetrics(options);
  }
});

export { Prometheus, defaultRegister, configure };
