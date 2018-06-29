module.exports = {
  parser: 'babel-eslint',
  extends: 'eslint:recommended',
  env: {
    browser: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  globals: {
    DEBUG: false,
    EumState: false,
    EumEvent: false,
    ErrorLike: false
  },
  rules: {
    indent: [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    quotes: [
      'error',
      'single'
    ],
    semi: [
      'error',
      'always'
    ]
  }
};
