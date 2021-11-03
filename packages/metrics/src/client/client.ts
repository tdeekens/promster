import once from 'lodash.once';
import * as Prometheus from 'prom-client';
import { skipMetricsInEnvironment } from '../environment';

// NOTE:
//   This is the `globalRegistry` provided by the `prom-client`
//   We could create multiple registries with `new Prometheus.registry()`.
const defaultRegister = Prometheus.register;

interface TClientOptions
  extends Prometheus.DefaultMetricsCollectorConfiguration {
  detectKubernetes?: boolean;
}

const configure = once((options: TClientOptions) => {
  const shouldSkipMetricsInEnvironment = skipMetricsInEnvironment(options);

  if (!shouldSkipMetricsInEnvironment) {
    Prometheus.collectDefaultMetrics(options);
  }
});

export { Prometheus, defaultRegister, configure };
