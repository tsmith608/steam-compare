import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    include: ["tests/unit/**/*.test.js"],
    environment: "node",
    env: { SESSION_SECRET: "unit-test-secret-unit-test-secret-1234567890" },
  },
});
