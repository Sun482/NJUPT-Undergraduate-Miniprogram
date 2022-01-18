module.exports = {
  extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended", "plugin:rax-compile-time-miniapp/recommended"],
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
    "@typescript-eslint/no-var-requires": "off",
    "consistent-return": "off",
    "no-shadow": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/quotes": "off",
    "comma-dangle": "off",
    "@typescript-eslint/no-shadow": "off"
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "rax-compile-time-miniapp"]
};
