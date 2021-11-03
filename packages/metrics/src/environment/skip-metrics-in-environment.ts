import type { TPromsterOptions } from '@promster/types';
import { isRunningInKubernetes } from './kubernetes';

type TSkipMetricsInEnvironmentOptions = {
  detectKubernetes?: TPromsterOptions['detectKubernetes'];
};

const skipMetricsInEnvironment = (options: TSkipMetricsInEnvironmentOptions) =>
  options.detectKubernetes === true && !isRunningInKubernetes();

export { skipMetricsInEnvironment };
