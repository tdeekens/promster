import { sortLabels } from './sort-labels';

describe('sortLabels', () => {
  const unsorted = { b: 'c', a: 'b' };
  let sorted;

  beforeEach(() => {
    sorted = sortLabels(unsorted);
  });

  it('should sort the labels in accending order', () => {
    expect(sorted).toEqual({ a: 'b', b: 'c' });
  });
});
