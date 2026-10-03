// End-to-end tests against a production build in Steam mock mode.
//   npm run build && npm run test:e2e
// Needs a Postgres with the migrations applied (share links and votes are
// stored): E2E_DATABASE_URL, default postgresql://postgres:postgres@localhost:5432/webothplay
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT || 3210);
const DATABASE_URL = process.env.E2E_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/webothplay";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    reducedMotion: "reduce",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      STEAM_MOCK: "1",
      STEAM_API_KEY: "e2e-dummy",
      DATABASE_URL,
      SESSION_SECRET: "e2e-session-secret-e2e-session-secret-0000",
    },
  },
});
