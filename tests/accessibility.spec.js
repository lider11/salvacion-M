import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  "/index.html",
  "/privacidad.html",
  "/terminos.html"
];

for (const path of pages) {
  test(`WCAG automated audit: ${path}`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:4173${path}`, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}
