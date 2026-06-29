import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";

const backendBootCommand =
  process.platform === "win32"
    ? "pnpm run dev"
    : "pnpm db:up && pnpm run db:setup && pnpm run dev";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  globalSetup: "./e2e/global-setup.ts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: backendBootCommand,
      url: "http://127.0.0.1:3000/auth/health",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        E2E_CAPTURE_VERIFICATION: "true",
        EMAIL_VERIFICATION_REQUIRED: "true",
        PUBLIC_REGISTRATION_ENABLED: "true",
      },
    },
    {
      command:
        "pnpm -C web exec vite --host 127.0.0.1 --port 5173 --strictPort",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_EMAIL_VERIFICATION_ENABLED: "true",
        VITE_PUBLIC_REGISTRATION_ENABLED: "true",
      },
    },
  ],
});
