import { beforeEach, describe, expect, it } from 'vitest';

const { endMeasurementFrom } = require('./end-measurement-from');

describe('endMeasurementFrom', () => {
  const start = [1, 2];
  let measurement;

  beforeEach(() => {
    measurement = endMeasurementFrom(start);
  });

  it('should have second duration', () => {
    expect(measurement).toHaveProperty('durationS');
  });
});
