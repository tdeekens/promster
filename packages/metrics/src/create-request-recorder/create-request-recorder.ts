import type {
  TPromsterOptions,
  TDefaultedPromsterOptions,
  TLabelValues,
  THttpMetrics,
  TRequestTiming,
} from '@promster/types';

import merge from 'merge-options';
import { skipMetricsInEnvironment } from '../environment';
import { sortLabels } from '../sort-labels';
import { endMeasurementFrom } from '../end-measurement-from';

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

export type TRequestRecorder = (
  start: TRequestTiming,
  recordingOptions: TRecordingOptions
) => void;

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
  metrics: THttpMetrics,
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
      metrics.httpRequestDurationInMilliseconds.forEach(
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
      metrics.httpRequestDurationPerPercentileInMilliseconds.forEach(
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
      metrics.httpRequestDurationInSeconds.forEach(
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
      metrics.httpRequestDurationPerPercentileInSeconds.forEach(
        (httpRequestDurationPerPercentileInSecondsMetricType) => {
          httpRequestDurationPerPercentileInSecondsMetricType.observe(
            labels,
            durationS
          );
        }
      );
    }

    if (shouldObserveInCounter && !shouldSkipMetricsByEnvironment) {
      metrics.httpRequestsTotal.forEach((httpRequestsTotalMetricType) => {
        httpRequestsTotalMetricType.inc(labels);
      });
    }

    if (
      !shouldSkipMetricsByEnvironment &&
      shouldObserveContentLengthInHistogram &&
      recordingOptions.requestContentLength
    ) {
      metrics.httpRequestContentLengthInBytes.forEach(
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
      metrics.httpResponseContentLengthInBytes.forEach(
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
