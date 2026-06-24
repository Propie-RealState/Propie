import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

import base from "./playwright.config";

dotenv.config();

export default defineConfig({
  ...base,
  webServer: undefined,
  use: {
    ...base.use,
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
