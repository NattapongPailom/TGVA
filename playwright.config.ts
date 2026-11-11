import { defineConfig, devices } from "@playwright/test";

/**
 * The smoke tests behind `npm run verify` and the live check.
 *
 * With BASE_URL unset they run against this checkout's own production build,
 * served by `next start` — so `npm run build` has to come first, which is the
 * order `verify` runs in. With BASE_URL set (the live check sets it to
 * tgva.vercel.app) they run against that address and start nothing.
 */
const baseURL = process.env.BASE_URL?.replace(/\/$/, "");
const port = 3100;
const ci = !!process.env.CI;

export default defineConfig({
  testDir: "tests/smoke",
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  workers: ci ? 2 : undefined,
  reporter: ci ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: baseURL ?? `http://localhost:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
    /* Every browser on an iPhone is WebKit, which Chromium's phone emulation
       does not stand in for. */
    { name: "phone-webkit", use: { ...devices["iPhone 15"] } },
  ],
  webServer: baseURL
    ? undefined
    : {
        command: `npx next start -p ${port}`,
        url: `http://localhost:${port}`,
        reuseExistingServer: !ci,
        timeout: 60_000,
      },
});
