import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    root: "./",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "build/**",
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/test/**",
        "src/server.ts",
        "src/config.ts",
        "src/main.ts",
        "src/@shared/infrastructure/config/**",
        "vitest.config.ts",
        "eslint.config.mjs",
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    include: ["test/**/*.spec.ts", "test/**/*.test.ts"],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "./src/@app"),
      "@contexts": path.resolve(__dirname, "./src/@contexts"),
      "@shared": path.resolve(__dirname, "./src/@shared"),
    },
  },
});
