module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: '12',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
};
