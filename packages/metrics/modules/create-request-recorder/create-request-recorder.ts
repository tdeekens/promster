import type { TLabelValues, TMetricTypes } from '@promster/types';

import merge from 'merge-options';
import { isRunningInKubernetes } from '../kubernetes';

type TRecorderAccuracy = 'ms' | 's';
type TRecorderMetricType =
  | 'httpRequestsTotal'
  | 'httpRequestsHistogram'
  | 'httpRequestsSummary';
type TRequestRecorderOptions = {
  accuracies: TRecorderAccuracy[];
  metricTypes: TRecorderMetricType[];
  skip: () => boolean;
};
type TRecordingOptions = {
  labels: TLabelValues;
};

const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;

const sortLabels = (unsortedLabels: TLabelValues): TLabelValues => {
  return Object.keys(unsortedLabels)
    .sort((a, b) => {
      if (a < b) {
        return -1;
      }

      if (a > b) {
        return 1;
      }

      return 0;
    })
    .reduce((sortedLabels, labelName) => {
      sortedLabels[labelName] = unsortedLabels[labelName];
      return sortedLabels;
    }, {});
};

const endMeasurmentFrom = (start: [number, number]) => {
  const [seconds, nanoseconds] = process.hrtime(start);

  return {
    durationMs: Math.round((seconds * NS_PER_SEC + nanoseconds) / NS_PER_MS),
    durationS: (seconds * NS_PER_SEC + nanoseconds) / NS_PER_SEC,
  };
};

const shouldObserveMetricType = (metricType: TRecorderMetricType) => (
  options: TRequestRecorderOptions
) => options.metricTypes.includes(metricType);
const shouldObserveMetricAccuracy = (accuracy: TRecorderAccuracy) => (
  options: TRequestRecorderOptions
) => options.accuracies.includes(accuracy);

const defaultOptions: TRequestRecorderOptions = {
  accuracies: ['s'],
  metricTypes: ['httpRequestsTotal', 'httpRequestsHistogram'],
  skip: () => false,
};

const createRequestRecorder = (
  metricTypes: TMetricTypes,
  options: Partial<TRequestRecorderOptions> = defaultOptions
) => {
  const defaultedRecorderOptions = merge(defaultOptions, options);
  const shouldSkipMetricsByEnvironment =
    defaultedRecorderOptions.detectKubernetes === true &&
    isRunningInKubernetes() === false;

  const shouldObserveInSeconds = shouldObserveMetricAccuracy('s')(
    defaultedRecorderOptions
  );
  const shouldObserveInMilliseconds = shouldObserveMetricAccuracy('ms')(
    defaultedRecorderOptions
  );
  const shouldObserveInSummary = shouldObserveMetricType('httpRequestsSummary')(
    defaultedRecorderOptions
  );
  const shouldObserveInHistogram = shouldObserveMetricType(
    'httpRequestsHistogram'
  )(defaultedRecorderOptions);
  const shouldObserveInCounter = shouldObserveMetricType('httpRequestsTotal')(
    defaultedRecorderOptions
  );

  return (start: [number, number], recordingOptions: TRecordingOptions) => {
    const { durationMs, durationS } = endMeasurmentFrom(start);
    const labels = sortLabels(recordingOptions.labels);

    if (
      shouldObserveInMilliseconds &&
      shouldObserveInHistogram &&
      !shouldSkipMetricsByEnvironment
    ) {
      metricTypes.httpRequestDurationInMilliseconds.forEach(
        (httpRequestDurationInMillisecondsMetricType) =>
          httpRequestDurationInMillisecondsMetricType.observe(
            labels,
            durationMs
          )
      );
    }

    if (
      shouldObserveInMilliseconds &&
      shouldObserveInSummary &&
      !shouldSkipMetricsByEnvironment
    ) {
      metricTypes.httpRequestDurationPerPercentileInMilliseconds.forEach(
        (httpRequestDurationPerPercentileInMillisecondsMetricType) =>
          httpRequestDurationPerPercentileInMillisecondsMetricType.observe(
            labels,
            durationMs
          )
      );
    }

    if (
      shouldObserveInSeconds &&
      shouldObserveInHistogram &&
      !shouldSkipMetricsByEnvironment
    ) {
      metricTypes.httpRequestDurationInSeconds.forEach(
        (httpRequestDurationInSecondsMetricType) =>
          httpRequestDurationInSecondsMetricType.observe(labels, durationS)
      );
    }

    if (
      shouldObserveInSeconds &&
      shouldObserveInSummary &&
      !shouldSkipMetricsByEnvironment
    ) {
      metricTypes.httpRequestDurationPerPercentileInSeconds.forEach(
        (httpRequestDurationPerPercentileInSecondsMetricType) =>
          httpRequestDurationPerPercentileInSecondsMetricType.observe(
            labels,
            durationS
          )
      );
    }

    if (shouldObserveInCounter && !shouldSkipMetricsByEnvironment) {
      metricTypes.httpRequestsTotal.forEach((httpRequestsTotalMetricType) =>
        httpRequestsTotalMetricType.inc(labels)
      );
    }
  };
};

createRequestRecorder.defaultOptions = defaultOptions;

export { createRequestRecorder, sortLabels, endMeasurmentFrom };
