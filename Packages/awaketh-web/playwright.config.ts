import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

/**
 * Playwright captures screenshots for Sentry Snapshots (visual regression).
 *
 * Tests write PNGs into SNAPSHOT_OUTPUT_DIR; they do not diff locally. CI uploads
 * that directory via `sentry-cli snapshots upload` and Sentry does the diffing.
 * See .github/workflows/visual-snapshots.yml.
 */
export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  webServer: {
    command: "bun run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
