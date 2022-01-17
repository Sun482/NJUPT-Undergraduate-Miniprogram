module.exports = {
  extends: ["eslint-config-airbnb-base", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        singleQuote: false
      }
    ],
    "no-console": "off",
    "import/no-extraneous-dependencies": "off"
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"]
}
