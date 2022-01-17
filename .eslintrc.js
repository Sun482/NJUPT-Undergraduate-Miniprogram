module.exports = {
  extends: ["eslint-config-airbnb-base", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        singleQuote: false,
        semi: true
      }
    ],
    "no-console": "off",
    "import/no-extraneous-dependencies": "off",
    "@typescript-eslint/no-var-requires": 0,
    "consistent-return": "off",
    "no-shadow": "off",
    "@typescript-eslint/no-empty-function": 0
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"]
};
