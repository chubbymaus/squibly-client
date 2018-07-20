module.exports = {
  extends: "airbnb",
  plugins: ['react', 'jsx-ally', 'import'],
  rules: {
    "react/jsx-filename-extension": 0,
    "no-undef": 0,
    "react/jsx-one-expression-per-line": 0,
    "import/no-named-as-default": 0,
    "import/no-named-as-default-member": 0
  },
  parser: "babel-eslint",
  env: {
    browser: 1
  }
};
