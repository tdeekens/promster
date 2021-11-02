import type { TPromsterOptions } from '@promster/types';
import { isRunningInKubernetes } from './kubernetes';

const skipMetricsInEnvironment = (options: TPromsterOptions) =>
  options.detectKubernetes === true && !isRunningInKubernetes();

export { skipMetricsInEnvironment };
