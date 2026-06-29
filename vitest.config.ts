import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30_000,
    hookTimeout: 30_000,
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
    env: {
      E2E_CAPTURE_VERIFICATION: "true",
      EMAIL_VERIFICATION_REQUIRED: "true",
      PUBLIC_REGISTRATION_ENABLED: "true",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
