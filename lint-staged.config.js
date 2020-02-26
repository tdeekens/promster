module.exports = {
  'packages/**/*.js': ['npm run fix:eslint', 'npm run format:js'],
  '*.md': ['npm run format:md'],
};
