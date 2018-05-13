module.exports = {
  'packages/**/*.js': ['npm run fix:eslint', 'npm run format:js', 'git add'],
  '*.md': ['npm run format:md', 'git add'],
};
