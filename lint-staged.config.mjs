export default {
  '*': ['oxlint --fix'], // Lint and apply safe fixes
  '*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}': ['oxfmt --write'], // Format and sort imports
};
