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

type TRecordingOptions = {
  labels: TLabelValues;
  requestContentLength?: number;
  responseContentLength?: number;
};

export type TRequestRecorder = (
  startTime: TRequestTiming,
  recordingOptions: TRecordingOptions
) => void;

const defaultOptions: TPromsterOptions = {
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

  return (startTime: TRequestTiming, recordingOptions: TRecordingOptions) => {
    const { durationS } = endMeasurementFrom(startTime);
    const labels = sortLabels(recordingOptions.labels);

    if (!shouldSkipMetricsByEnvironment) {
      metrics.httpRequestDurationInSeconds?.forEach(
        (httpRequestDurationInSecondsMetricType) => {
          httpRequestDurationInSecondsMetricType.observe(labels, durationS);
        }
      );
    }

    if (!shouldSkipMetricsByEnvironment) {
      metrics.httpRequestDurationPerPercentileInSeconds?.forEach(
        (httpRequestDurationPerPercentileInSecondsMetricType) => {
          httpRequestDurationPerPercentileInSecondsMetricType.observe(
            labels,
            durationS
          );
        }
      );
    }

    if (!shouldSkipMetricsByEnvironment) {
      metrics.httpRequestsTotal?.forEach((httpRequestsTotalMetricType) => {
        httpRequestsTotalMetricType.inc(labels);
      });
    }

    if (recordingOptions.requestContentLength) {
      metrics.httpRequestContentLengthInBytes?.forEach(
        (httpRequestContentLengthInBytesMetricType) => {
          httpRequestContentLengthInBytesMetricType.observe(
            labels,
            // @ts-expect-error
            recordingOptions.requestContentLength
          );
        }
      );
    }

    if (recordingOptions.responseContentLength) {
      metrics.httpResponseContentLengthInBytes?.forEach(
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
