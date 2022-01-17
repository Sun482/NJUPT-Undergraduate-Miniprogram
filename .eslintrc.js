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
    "consistent-return": "off"
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"]
};
