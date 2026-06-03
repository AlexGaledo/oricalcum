import { defineConfig, devices } from "@playwright/test";

const FRONTEND = "http://localhost:3000";
const BACKEND = "http://localhost:3001";

/**
 * E2E config. Drives the REAL stack: Next dev server + the FastAPI backend,
 * against real Supabase auth (a throwaway account is minted in global-setup).
 *
 * Both servers are launched here; set PW_NO_SERVER=1 to reuse already-running
 * ones (faster local iteration).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["html", { open: "never" }], ["list"]],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: FRONTEND,
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PW_NO_SERVER
    ? undefined
    : [
        {
          command: "uv run uvicorn app.main:app --port 3001",
          cwd: "../oricalcum-api",
          url: `${BACKEND}/health`,
          reuseExistingServer: true,
          timeout: 60_000,
        },
        {
          command: "npm run dev",
          url: FRONTEND,
          // Force the browser to talk to the backend we launch above (3001),
          // regardless of what .env's NEXT_PUBLIC_API_URL points at. Next.js
          // does not override env vars already present in process.env.
          env: { NEXT_PUBLIC_API_URL: `${BACKEND}/api/v1` },
          reuseExistingServer: false,
          timeout: 120_000,
        },
      ],
});
