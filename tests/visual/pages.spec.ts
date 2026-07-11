import { test } from "@playwright/test";

/**
 * Captures full-page screenshots into SNAPSHOT_OUTPUT_DIR. The images are not
 * diffed locally — CI uploads this directory to Sentry Snapshots, which handles
 * baseline tracking and diffing against the PR's merge base.
 *
 * Add routes here to include them in visual coverage. Filenames are the identity
 * key Sentry uses to diff, so keep them stable across runs.
 */
const OUTPUT_DIR = process.env.SNAPSHOT_OUTPUT_DIR ?? "snapshots";

const routes = [{ name: "home", path: "/" }] as const;

for (const route of routes) {
  test(`capture ${route.name}`, async ({ page }) => {
    await page.goto(route.path);
    // Let fonts/images settle so the capture is deterministic.
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: `${OUTPUT_DIR}/${route.name}.png`,
      fullPage: true,
      animations: "disabled",
    });
  });
}
