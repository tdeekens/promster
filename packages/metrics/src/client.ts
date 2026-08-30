import type { PrometheusContentType } from '@prometheus-io/client';
import * as Prometheus from '@prometheus-io/client';
import { once } from 'es-toolkit/function';

import { skipMetricsInEnvironment } from './environment';

// NOTE:
//   This is the `globalRegistry` provided by `@prometheus-io/client`.
//   We could create multiple registries with `new Prometheus.registry()`.
//
//   The registry is global to the module instance, not to the process. A
//   consumer that still has the deprecated `prom-client` installed for its
//   own metrics registers those into a second, separate registry which this
//   one never sees.
const defaultRegister = Prometheus.register;

interface TClientOptions extends Prometheus.DefaultMetricsCollectorConfiguration<PrometheusContentType> {
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
