import once from 'lodash.once';
import * as Prometheus from 'prom-client';
import { isRunningInKubernetes } from '../kubernetes';

// NOTE:
//   This is the `globalRegistry` provided by the `prom-client`
//   We could create multiple registries with `new Prometheus.registry()`.
const defaultRegister = Prometheus.register;

interface TClientOptions
  extends Prometheus.DefaultMetricsCollectorConfiguration {
  detectKubernetes?: boolean;
}

const configure = once((options: TClientOptions) => {
  const shouldSkipMetricsByEnvironment =
    options.detectKubernetes === true && !isRunningInKubernetes();

  if (!shouldSkipMetricsByEnvironment) {
    Prometheus.collectDefaultMetrics(options);
  }
});

export { Prometheus, defaultRegister, configure };
