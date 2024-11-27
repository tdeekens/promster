vi.mock('../client', () => ({
  defaultRegister: {
    metrics: vi.fn(async () => Promise.resolve('metrics')),
    contentType: 'application/test',
  },
}));

const { defaultRegister } = require('../client');
const { getSummary, getContentType } = require('./summary');

describe('getSummary', () => {
  let summary;

  beforeEach(async () => {
    summary = await getSummary();
  });

  it('should invoke metrics on the default register', () => {
    expect(defaultRegister.metrics).toHaveBeenCalled();
  });

  it('should return metrics from the default register', () => {
    expect(summary).toEqual('metrics');
  });
});

describe('getContentType', () => {
  let contentType;

  beforeEach(() => {
    contentType = getContentType();
  });

  it('should return content type from the default register', () => {
    expect(contentType).toEqual('application/test');
  });
});
