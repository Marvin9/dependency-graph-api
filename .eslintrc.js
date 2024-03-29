module.exports = {
  env: {
    "es6": true,
    "node": true,
    "jest": true,
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint'
  ],
  rules: {
    "prettier/prettier": [
      "error",
      {
        singleQuote: true
      }
    ]
  }
};
