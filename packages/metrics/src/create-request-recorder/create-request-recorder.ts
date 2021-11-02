import type {
  TPromsterOptions,
  TDefaultedPromsterOptions,
  TLabelValues,
  TMetricTypes,
} from '@promster/types';

import merge from 'merge-options';
import { skipMetricsInEnvironment } from '../environment';

type TRecorderAccuracy = 'ms' | 's';
type TRecorderMetricType =
  | 'httpRequestsTotal'
  | 'httpRequestsHistogram'
  | 'httpRequestsSummary'
  | 'httpContentLengthHistogram';
type TRecordingOptions = {
  labels: TLabelValues;
  requestContentLength?: number;
  responseContentLength?: number;
};
type TRequestTiming = [number, number];
export type TRequestRecorder = (
  start: TRequestTiming,
  recordingOptions: TRecordingOptions
) => void;

const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;

const sortLabels = (unsortedLabels: TLabelValues): TLabelValues =>
  Object.keys(unsortedLabels)
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

const endMeasurementFrom = (start: TRequestTiming) => {
  const [seconds, nanoseconds] = process.hrtime(start);

  return {
    durationMs: Math.round((seconds * NS_PER_SEC + nanoseconds) / NS_PER_MS),
    durationS: (seconds * NS_PER_SEC + nanoseconds) / NS_PER_SEC,
  };
};

const shouldObserveMetricType =
  (metricType: TRecorderMetricType) => (options: TDefaultedPromsterOptions) =>
    options.metricTypes?.includes(metricType);
const shouldObserveMetricAccuracy =
  (accuracy: TRecorderAccuracy) => (options: TDefaultedPromsterOptions) =>
    options.accuracies?.includes(accuracy);

const defaultOptions: TPromsterOptions = {
  accuracies: ['s'],
  metricTypes: ['httpRequestsTotal', 'httpRequestsHistogram'],
  skip: () => false,
  detectKubernetes: false,
};

const createRequestRecorder = (
  metricTypes: TMetricTypes,
  options: TPromsterOptions = defaultOptions
): TRequestRecorder => {
  const defaultedRecorderOptions: TDefaultedPromsterOptions = merge(
    defaultOptions,
    options
  );
  const shouldSkipMetricsByEnvironment = skipMetricsInEnvironment(
    defaultedRecorderOptions
  );

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
  const shouldObserveContentLengthInHistogram = shouldObserveMetricType(
    'httpContentLengthHistogram'
  )(defaultedRecorderOptions);

  // eslint-disable-next-line complexity
  return (start: TRequestTiming, recordingOptions: TRecordingOptions) => {
    const { durationMs, durationS } = endMeasurementFrom(start);
    const labels = sortLabels(recordingOptions.labels);

    if (
      shouldObserveInMilliseconds &&
      shouldObserveInHistogram &&
      !shouldSkipMetricsByEnvironment
    ) {
      metricTypes.httpRequestDurationInMilliseconds.forEach(
        (httpRequestDurationInMillisecondsMetricType) => {
          httpRequestDurationInMillisecondsMetricType.observe(
            labels,
            durationMs
          );
        }
      );
    }

    if (
      shouldObserveInMilliseconds &&
      shouldObserveInSummary &&
      !shouldSkipMetricsByEnvironment
    ) {
      metricTypes.httpRequestDurationPerPercentileInMilliseconds.forEach(
        (httpRequestDurationPerPercentileInMillisecondsMetricType) => {
          httpRequestDurationPerPercentileInMillisecondsMetricType.observe(
            labels,
            durationMs
          );
        }
      );
    }

    if (
      shouldObserveInSeconds &&
      shouldObserveInHistogram &&
      !shouldSkipMetricsByEnvironment
    ) {
      metricTypes.httpRequestDurationInSeconds.forEach(
        (httpRequestDurationInSecondsMetricType) => {
          httpRequestDurationInSecondsMetricType.observe(labels, durationS);
        }
      );
    }

    if (
      shouldObserveInSeconds &&
      shouldObserveInSummary &&
      !shouldSkipMetricsByEnvironment
    ) {
      metricTypes.httpRequestDurationPerPercentileInSeconds.forEach(
        (httpRequestDurationPerPercentileInSecondsMetricType) => {
          httpRequestDurationPerPercentileInSecondsMetricType.observe(
            labels,
            durationS
          );
        }
      );
    }

    if (shouldObserveInCounter && !shouldSkipMetricsByEnvironment) {
      metricTypes.httpRequestsTotal.forEach((httpRequestsTotalMetricType) => {
        httpRequestsTotalMetricType.inc(labels);
      });
    }

    if (
      !shouldSkipMetricsByEnvironment &&
      shouldObserveContentLengthInHistogram &&
      recordingOptions.requestContentLength
    ) {
      metricTypes.httpRequestContentLengthInBytes.forEach(
        (httpRequestContentLengthInBytesMetricType) => {
          httpRequestContentLengthInBytesMetricType.observe(
            labels,
            // @ts-expect-error
            recordingOptions.requestContentLength
          );
        }
      );
    }

    if (
      !shouldSkipMetricsByEnvironment &&
      shouldObserveContentLengthInHistogram &&
      recordingOptions.responseContentLength
    ) {
      metricTypes.httpResponseContentLengthInBytes.forEach(
        (httpResponseContentLengthInBytesMetricType) => {
          httpResponseContentLengthInBytesMetricType.observe(
            labels,
            // @ts-expect-error
            recordingOptions.responseContentLength
          );
        }
      );
    }
  };
};

createRequestRecorder.defaultOptions = defaultOptions;

export { createRequestRecorder, sortLabels, endMeasurementFrom };
