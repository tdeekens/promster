class Timing {
  static NS_PER_SEC = BigInt(1e9);

  #startTime?: bigint;
  #endTime?: bigint;

  constructor() {
    this.reset();
  }

  value() {
    const startTime = this.#startTime;
    const endTime = this.#endTime;

    return {
      seconds:
        endTime &&
        startTime &&
        Number((endTime - startTime) / Timing.NS_PER_SEC),
    };
  }

  reset() {
    this.#startTime = process.hrtime.bigint();
    this.#endTime = undefined;

    return this;
  }

  end() {
    this.#endTime = process.hrtime.bigint();

    return this;
  }
}

const timing = {
  start() {
    return new Timing();
  },
};

export default timing;
export { Timing };
