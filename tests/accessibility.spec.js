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

test("G4 keyboard and validation flow exposes accessible errors", async ({ page }) => {
  await page.goto("/index.html", { waitUntil: "networkidle" });
  await page.locator("#consulta").scrollIntoViewIfNeeded();
  await page.locator("#submit-button").click();

  await expect(page.locator("#form-status")).toHaveAttribute("role", "alert");
  await expect(page.locator("#form-status")).toContainText("Revisa los campos");
  await expect(page.locator("#nombre")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#nombre")).toBeFocused();
  await expect(page.locator("#nombre-error")).toBeVisible();
});

test("G4 mobile menu supports keyboard escape and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html", { waitUntil: "networkidle" });

  const toggle = page.locator(".menu-toggle");
  await toggle.focus();
  await toggle.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});
