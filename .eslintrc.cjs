module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['xo', 'prettier', 'plugin:jest/recommended'],
  env: {
    es6: true,
    jest: true,
  },
  plugins: ['prettier', 'jest'],
  rules: {
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/valid-expect': 'error',
    'prefer-object-spread': 'off',
    'max-nested-callbacks': ['error', 20],
    'no-unused-vars': ['warn'],
  },
  overrides: [
    {
      files: ['*.spec.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/no-unsafe-argument': 0,
      },
    },
    {
      files: ['*.ts'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
        project: ['./packages/*/tsconfig.json'],
      },
      extends: ['xo-typescript', 'xo', 'prettier', 'plugin:jest/recommended'],
      rules: {
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        '@typescript-eslint/no-unsafe-call': 0,
        '@typescript-eslint/no-require-imports': 0,
        '@typescript-eslint/no-unsafe-member-access': 0,
        '@typescript-eslint/no-unsafe-assignment': 0,
        '@typescript-eslint/no-unsafe-return': 0,
        '@typescript-eslint/ban-ts-comment': 0,
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
        '@typescript-eslint/naming-convention': 0,
        '@typescript-eslint/no-redundant-type-constituents': 0,
        'prefer-object-spread': 'off',
        'no-unused-vars': ['warn'],
      },
    },
  ],
  globals: {
    VERSION: true,
  },
};
