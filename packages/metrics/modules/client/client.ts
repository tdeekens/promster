import once from 'lodash.once';
import Prometheus, { DefaultMetricsCollectorConfiguration } from 'prom-client';
import { isRunningInKubernetes } from '../kubernetes';

// NOTE:
//   This is the `globalRegistry` provided by the `prom-client`
//   We could create multiple registries with `new Prometheus.registry()`.
const defaultRegister = Prometheus.register;

interface TClientOptions extends DefaultMetricsCollectorConfiguration {
  detectKubernetes?: boolean;
}

const configure = once((options: TClientOptions) => {
  const shouldSkipMetricsByEnvironment =
    options.detectKubernetes === true && isRunningInKubernetes() === false;

  if (!shouldSkipMetricsByEnvironment) {
    Prometheus.collectDefaultMetrics(options);
  }
});

export { Prometheus, defaultRegister, configure };
