import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.mts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.mts"],
    },
  },
  fmt: {
    ignorePatterns: [".devcontainer/**"],
  },
  lint: {
    plugins: ["typescript", "unicorn", "oxc"],
    categories: {
      correctness: "error",
    },
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      // Parser/Serializer pass static methods as callbacks (`.map(Parser.mapElement)`); they never use `this`.
      "typescript/unbound-method": "off",
      // String(value) on `unknown` input is the intended conversion in the parser and property formatters.
      "typescript/no-base-to-string": "off",
    },
    env: {
      builtin: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
});
