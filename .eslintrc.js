module.exports = {
  extends: 'eslint:recommended',
  env: {
    browser: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  globals: {
    DEBUG: false
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
