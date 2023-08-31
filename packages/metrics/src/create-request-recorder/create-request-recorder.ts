import {
  type TOptionalPromsterOptions,
  type TDefaultedPromsterOptions,
  type TLabelValues,
  type THttpMetrics,
} from '@promster/types';
import { type Timing } from '../timing';

import merge from 'merge-options';
import { skipMetricsInEnvironment } from '../environment';
import { sortLabels } from '../sort-labels';
import { endMeasurementFrom } from '../end-measurement-from';

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
      metrics.httpRequestDurationInSeconds?.forEach(
        (httpRequestDurationInSecondsMetricType) => {
          httpRequestDurationInSecondsMetricType.observe(labels, durationS);
        }
      );
    }

    if (!shouldSkipMetricsByEnvironment && durationS !== undefined) {
      metrics.httpRequestDurationPerPercentileInSeconds?.forEach(
        (httpRequestDurationPerPercentileInSecondsMetricType) => {
          httpRequestDurationPerPercentileInSecondsMetricType.observe(
            labels,
            durationS
          );
        }
      );
    }

    if (!shouldSkipMetricsByEnvironment && durationS !== undefined) {
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
