import type { TOptionalPromsterOptions } from '@promster/types';

import { isRunningInKubernetes } from './kubernetes';

type TSkipMetricsInEnvironmentOptions = {
  detectKubernetes?: TOptionalPromsterOptions['detectKubernetes'];
};

const skipMetricsInEnvironment = (options: TSkipMetricsInEnvironmentOptions) =>
  options.detectKubernetes === true && !isRunningInKubernetes();

export { skipMetricsInEnvironment };
