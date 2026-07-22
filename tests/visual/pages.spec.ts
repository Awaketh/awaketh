import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { test } from '@playwright/test';

/**
 * Captures full-page screenshots into SNAPSHOT_OUTPUT_DIR. The images are not
 * diffed locally — CI uploads this directory to Sentry Snapshots, which handles
 * baseline tracking and diffing against the PR's merge base.
 *
 * Routes are discovered from the App Router file tree, so adding a page.tsx
 * automatically adds it to visual coverage. Filenames are the identity key
 * Sentry uses to diff, so they stay stable as long as the route path does.
 */
const OUTPUT_DIR = process.env.SNAPSHOT_OUTPUT_DIR ?? 'snapshots';

const APP_DIR = join(process.cwd(), 'src', 'app');
const PAGE_FILE = /^page\.(tsx|ts|jsx|js)$/;

// Walk src/app for page files and map each to its URL path. Route groups
// (folder) are stripped from the URL; private (_folder), parallel (@slot),
// and dynamic ([param]) segments are skipped since they can't be rendered
// with a plain GET. Add those manually if you ever need them.
function discoverRoutes(): { name: string; path: string }[] {
  const routes: { name: string; path: string }[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const name = entry.name;
      if (entry.isDirectory()) {
        if (name.startsWith('_') || name.startsWith('@')) continue;
        walk(join(dir, name));
      } else if (PAGE_FILE.test(name)) {
        const segments = relative(APP_DIR, dir)
          .split(sep)
          .filter(Boolean)
          .filter((s) => !(s.startsWith('(') && s.endsWith(')')));
        if (segments.some((s) => s.includes('['))) continue;
        routes.push({
          name: segments.length ? segments.join('-') : 'home',
          path: '/' + segments.join('/'),
        });
      }
    }
  }

  walk(APP_DIR);
  return routes;
}

const routes = discoverRoutes();

for (const route of routes) {
  test(`capture ${route.name}`, async ({ page }) => {
    await page.goto(route.path);
    // Let fonts/images settle so the capture is deterministic.
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${OUTPUT_DIR}/${route.name}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  });
}
