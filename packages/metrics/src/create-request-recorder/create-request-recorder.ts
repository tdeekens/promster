import type {
  TDefaultedPromsterOptions,
  THttpMetrics,
  TLabelValues,
  TOptionalPromsterOptions,
} from '@promster/types';
import type { Timing } from '../timing';

import merge from 'merge-options';
import { endMeasurementFrom } from '../end-measurement-from';
import { skipMetricsInEnvironment } from '../environment';
import { sortLabels } from '../sort-labels';

type TRecordingOptions = {
  labels: TLabelValues;
  requestContentLength?: number;
  responseContentLength?: number;
};

type TLegacyTiming = [number, number];
export type TRequestRecorder = (
  _timing: Timing | TLegacyTiming,
  _recordingOptions: TRecordingOptions
) => void;

const defaultOptions: TOptionalPromsterOptions = {
  detectKubernetes: false,
};

function isTiming(timing: Timing | TLegacyTiming): timing is Timing {
  return !Array.isArray(timing);
}

const createRequestRecorder = (
  metrics: THttpMetrics,
  options: TOptionalPromsterOptions = defaultOptions
): TRequestRecorder => {
  const defaultedRecorderOptions: TDefaultedPromsterOptions = merge(
    defaultOptions,
    options
  );
  const shouldSkipMetricsByEnvironment = skipMetricsInEnvironment(
    defaultedRecorderOptions
  );

  return (
    timing: Timing | TLegacyTiming,
    recordingOptions: TRecordingOptions
  ) => {
    const durationS = isTiming(timing)
      ? timing.end().value().seconds
      : endMeasurementFrom(timing).durationS;

    const labels = sortLabels(recordingOptions.labels);

    if (!shouldSkipMetricsByEnvironment && durationS !== undefined) {
      if (metrics.httpRequestDurationInSeconds) {
        for (const httpRequestDurationInSecondsMetricType of metrics.httpRequestDurationInSeconds) {
          httpRequestDurationInSecondsMetricType.observe(labels, durationS);
        }
      }
    }

    if (!shouldSkipMetricsByEnvironment && durationS !== undefined) {
      if (metrics.httpRequestDurationPerPercentileInSeconds) {
        for (const httpRequestDurationPerPercentileInSecondsMetricType of metrics.httpRequestDurationPerPercentileInSeconds) {
          httpRequestDurationPerPercentileInSecondsMetricType.observe(
            labels,
            durationS
          );
        }
      }
    }

    if (!shouldSkipMetricsByEnvironment && durationS !== undefined) {
      if (metrics.httpRequestsTotal) {
        for (const httpRequestsTotalMetricType of metrics.httpRequestsTotal) {
          httpRequestsTotalMetricType.inc(labels);
        }
      }
    }

    if (recordingOptions.requestContentLength) {
      if (metrics.httpRequestContentLengthInBytes) {
        for (const httpRequestContentLengthInBytesMetricType of metrics.httpRequestContentLengthInBytes) {
          httpRequestContentLengthInBytesMetricType.observe(
            labels,
            recordingOptions.requestContentLength
          );
        }
      }
    }

    if (recordingOptions.responseContentLength) {
      if (metrics.httpResponseContentLengthInBytes) {
        for (const httpResponseContentLengthInBytesMetricType of metrics.httpResponseContentLengthInBytes) {
          httpResponseContentLengthInBytesMetricType.observe(
            labels,
            recordingOptions.responseContentLength
          );
        }
      }
    }
  };
};

createRequestRecorder.defaultOptions = defaultOptions;

export { createRequestRecorder, sortLabels, endMeasurementFrom };
