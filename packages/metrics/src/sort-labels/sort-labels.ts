import type { TLabelValues } from '@promster/types';

function sortLabels(unsortedLabels: TLabelValues): TLabelValues {
  return Object.keys(unsortedLabels)
    .sort((a, b) => {
      if (a < b) {
        return -1;
      }

      if (a > b) {
        return 1;
      }

      return 0;
    })
    .reduce<TLabelValues>((sortedLabels, labelName) => {
      sortedLabels[labelName] = unsortedLabels[labelName];
      return sortedLabels;
    }, {});
}

export { sortLabels };
