module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@stylistic/disable-legacy',
    'plugin:@stylistic/recommended-extends',
  ],
  ignorePatterns: ['node_modules', 'dist', 'coverage', 'dist', 'html', 'static', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@stylistic/jsx-one-expression-per-line': 'off'
  },
}
