// Run with a local static server and Playwright installed as development tooling.
// BASE_URL=http://127.0.0.1:8765 node tests/frontend-preview.cjs
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://127.0.0.1:8765';
  assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Only a local preview may be tested');
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const posts = [];
  const errors = [];
  page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
  page.on('pageerror', error => errors.push(error.message));
  let checks = 0;
  function check(condition, name) {
    assert(condition, name);
    checks++;
    console.log(`PASS: ${name}`);
  }
  try {
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base);
      await page.locator('.contacto-revisar').waitFor({ state: 'visible' });
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no horizontal overflow at ${width}px`);
    }
    check(await page.locator('#orientacion-form').getAttribute('data-preview-only') === 'true', 'preview remains enabled');
    check(await page.locator('.contacto-enviar').isDisabled() && !await page.locator('.contacto-enviar').isVisible(), 'submit remains hidden and disabled');
    await page.locator('.contacto-revisar').focus();
    await page.keyboard.press('Enter');
    check(await page.locator('#contacto-errores').isVisible() && await page.evaluate(() => document.activeElement.id === 'contacto-errores'), 'keyboard validation focuses the error summary');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    check(await page.evaluate(() => document.activeElement.id === 'contacto-nombre'), 'keyboard error link focuses its field');
    await page.locator('#contacto-nombre').fill('Persona Sintetica');
    await page.locator('#contacto-email').fill('qa@example.invalid');
    await page.locator('#contacto-servicio-negacion').check();
    await page.locator('#contacto-descripcion').fill('Ejemplo ficticio para revisar el formulario sin datos personales.');
    await page.locator('#contacto-consentimiento').focus();
    await page.keyboard.press('Space');
    await page.locator('.contacto-revisar').focus();
    await page.keyboard.press('Enter');
    check(!await page.locator('#contacto-errores').isVisible(), 'synthetic valid fields pass local review');
    check((await page.locator('#contacto-estado').innerText()).includes('No se envió ni se guardó'), 'review does not claim receipt or consent');
    await page.locator('#orientacion-form').evaluate(form => form.requestSubmit());
    check((await page.locator('#contacto-estado').innerText()).includes('Envío bloqueado'), 'programmatic submit is blocked');
    check(posts.length === 0, 'review and submit produce zero POST requests');
    check(await page.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0), 'preview does not store synthetic input in browser storage');
    const links = await page.locator('a[href], img[src], script[src], link[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href') || node.getAttribute('src')).filter(Boolean));
    const checked = new Set();
    for (const link of links) {
      if (/^(mailto:|tel:|https?:|data:)/.test(link)) continue;
      const target = new URL(link, base);
      if (checked.has(target.href)) continue;
      checked.add(target.href);
      const response = await page.request.get(target.href);
      assert.equal(response.status(), 200, `local target ${link}`);
      if (target.hash) {
        const html = await response.text();
        assert(html.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `anchor ${link}`);
      }
    }
    check(true, `${checked.size} local resources and link targets resolve`);
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(base);
    await page.locator('.menu-toggle').focus();
    await page.keyboard.press('Enter');
    check(await page.locator('.menu-toggle').getAttribute('aria-expanded') === 'true', 'mobile menu opens with keyboard');
    await page.keyboard.press('Escape');
    check(await page.locator('.menu-toggle').getAttribute('aria-expanded') === 'false', 'mobile menu closes with Escape');
    if (process.env.SCREENSHOT_PATH) {
      await page.locator('#contacto').screenshot({ path: process.env.SCREENSHOT_PATH });
    }
    check(errors.length === 0, 'no JavaScript runtime errors');
    const noJs = await browser.newPage({ javaScriptEnabled: false });
    await noJs.goto(base);
    check(await noJs.locator('.contacto-enviar').isDisabled() && await noJs.locator('#orientacion-form').getAttribute('method') === 'dialog', 'no-JavaScript preview also blocks submission');
    await noJs.close();
    console.log(`Passed checks: ${checks}`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
