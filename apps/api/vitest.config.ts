import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000, // hookTimeout is the maximum time a hook (beforeAll, beforeEach, afterAll, afterEach) can take before failing the test suite
    pool: "forks", // Use forks to run tests in parallel, which is faster than using threads
  },
});
