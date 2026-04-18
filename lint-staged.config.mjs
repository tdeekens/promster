export default {
  '*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}': [
    'oxlint --fix', // Lint and apply safe fixes
    'oxfmt --write', // Format and sort imports
  ],
};
