// https://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  // parser: 'babel-eslint',
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'egg',
  ],
  rules: {
    strict: 0,
  },
};
