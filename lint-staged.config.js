module.exports = {
  'packages/**/*.{ts,js}': ['npm run fix:eslint', 'npm run format:js'],
  '*.md': ['npm run format:md'],
};
