const { default: timing, Timing } = require('./timing');

describe('timing', () => {
  it('should return an instance of Timing', () => {
    expect(timing.start()).toBeInstanceOf(Timing);
  });

  it('should allow ending timing when started', () => {
    const requestTiming = timing.start();
    requestTiming.end();

    expect(requestTiming.value().seconds).toBeGreaterThanOrEqual(0);
  });
});
