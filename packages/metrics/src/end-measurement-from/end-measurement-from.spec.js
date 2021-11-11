const { endMeasurementFrom } = require('./end-measurement-from');

describe('endMeasurementFrom', () => {
  const start = process.hrtime.bigint();
  let measurement;

  beforeEach(() => {
    measurement = endMeasurementFrom(start);
  });

  it('should have second duration', () => {
    expect(measurement).toHaveProperty('durationS');
  });
});
