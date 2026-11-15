const fs = require('node:fs');
const http = require('node:http');
const { HtmlValidate } = require('html-validate');
const cssTree = require('css-tree');
const { chromium } = require('playwright');

const output = 'output/playwright/footer';
const widths = [320, 375, 768, 1024, 1440];
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const baselineHtml = fs.readFileSync('output/playwright/contacto/antes.html', 'utf8');
const baselineCss = fs.readFileSync('output/playwright/contacto/antes.css', 'utf8');
const errors = [];
const report = {
  date: '2026-11-08',
  baseline: 'output/playwright/contacto/antes.html + antes.css (pre-footer local snapshot)',
  widths: [],
  links: {},
  contact: {},
  contrast: {},
  keyboard: {},
  regression: [],
  consoleErrors: [],
  externalRequests: [],
  checks: {}
};

const validator = new HtmlValidate({ extends: ['html-validate:recommended'], rules: { 'void-style': 'off', 'no-trailing-whitespace': 'off' } });
const server = http.createServer((request, response) => {
  let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const baseline = pathname.startsWith('/baseline/');
  if (baseline) pathname = pathname.slice('/baseline'.length);
  if (pathname === '/') pathname = '/index.html';
  let contents;
  try {
    if (pathname === '/index.html') contents = baseline ? baselineHtml : html;
    else if (pathname === '/css/style.css') contents = baseline ? baselineCss : css;
    else contents = fs.readFileSync(`.${pathname}`);
  } catch {
    response.statusCode = 404;
    response.end();
    return;
  }
  const mime = pathname.endsWith('.css') ? 'text/css' : pathname.endsWith('.js') ? 'application/javascript' : pathname.endsWith('.svg') ? 'image/svg+xml' : pathname.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8';
  response.setHeader('Content-Type', mime);
  response.end(contents);
});

function luminance(color) {
  const values = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function contrast(foreground, background) {
  const a = luminance(foreground), b = luminance(background);
  return Number(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2));
}

(async () => {
  const currentValidation = await validator.validateString(html);
  const baselineValidation = await validator.validateString(baselineHtml);
  report.htmlValidation = {
    currentValid: currentValidation.valid,
    currentMessages: currentValidation.results.flatMap(result => result.messages),
    baselineValid: baselineValidation.valid,
    baselineMessageCount: baselineValidation.results.flatMap(result => result.messages).length
  };
  const cssParseErrors = [];
  cssTree.parse(css, { onParseError: error => cssParseErrors.push(error.message) });
  report.cssValidation = { parser: 'css-tree', parseErrors: cssParseErrors };
  report.structuralChecks = {
    footerClass: /<footer class="site-footer">/.test(html),
    expectedSections: ['footer-grid', 'footer-brand', 'footer-logo', 'footer-links', 'footer-contact', 'footer-disclaimer', 'footer-bottom'].every(name => html.includes(`class="${name}"`)),
    navigationLabel: /<nav class="footer-links" aria-labelledby="footer-links-title">/.test(html),
    contactAddress: /<address>[\s\S]*?Carrera 44B No\. 53B-35, Barranquilla, Atlántico, Colombia\.[\s\S]*?<\/address>/.test(html),
    exactEmergencyWarning: html.includes('La orientación ofrecida no sustituye la atención médica de urgencia. En una emergencia, acude a los servicios de urgencias.'),
    currentYear: html.includes('&copy; 2026 Salvación M. Todos los derechos reservados.'),
    noLegalLinkInvented: !/<a[^>]+(?:privacidad|tratamiento de datos)/i.test(html),
    noThirdPartyScript: !/<script[^>]+src=["']https?:\/\//i.test(html),
    expectedLogoPath: fs.existsSync('assets/logo-salvacion-m.svg')
  };
  report.links.expectedFragments = ['#inicio', '#servicios', '#nosotros', '#proceso', '#contacto'];
  report.links.tel = 'tel:+573004218699';
  report.links.mailto = 'mailto:info@salvacionm.com';

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    page.on('pageerror', error => report.consoleErrors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
    page.on('request', request => { if (new URL(request.url()).origin !== origin) report.externalRequests.push(request.url()); });

    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(origin, { waitUntil: 'networkidle' });
      const measurements = await page.evaluate(() => {
        const footer = document.querySelector('.site-footer');
        const grid = footer.querySelector('.footer-grid');
        const brand = footer.querySelector('.footer-brand');
        const style = getComputedStyle(grid);
        const tracks = style.gridTemplateColumns.split(' ').length;
        return {
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          hasHorizontalOverflow: document.documentElement.scrollWidth > innerWidth,
          gridColumns: tracks,
          brandGridColumn: getComputedStyle(brand).gridColumn,
          footerHeight: Math.round(footer.getBoundingClientRect().height),
          logoLoaded: footer.querySelector('.footer-logo img').naturalWidth > 0,
          footerLinks: [...footer.querySelectorAll('.footer-links a')].map(link => ({ href: link.getAttribute('href'), targetExists: Boolean(document.querySelector(link.getAttribute('href'))) })),
          contactLinks: [...footer.querySelectorAll('.footer-contact a')].map(link => ({ href: link.getAttribute('href'), text: link.textContent.trim(), minTargetHeight: Math.round(link.getBoundingClientRect().height) }))
        };
      });
      report.widths.push(measurements);
      if (width === 375 || width === 1440) await page.locator('.site-footer').screenshot({ path: `${output}/footer-${width}.png` });

      const beforePath = `${origin}/baseline/`;
      await page.goto(beforePath, { waitUntil: 'networkidle' });
      const selectors = ['.site-header', '#inicio', '#servicios', '#nosotros', '#proceso'];
      for (const selector of selectors) {
        const before = await page.locator(selector).evaluateAll(elements => elements.map(element => {
          const nodes = [element, ...element.querySelectorAll('*')];
          return nodes.map(node => [...getComputedStyle(node)].map(property => [property, getComputedStyle(node).getPropertyValue(property)]));
        }));
        await page.goto(origin, { waitUntil: 'networkidle' });
        const after = await page.locator(selector).evaluateAll(elements => elements.map(element => {
          const nodes = [element, ...element.querySelectorAll('*')];
          return nodes.map(node => [...getComputedStyle(node)].map(property => [property, getComputedStyle(node).getPropertyValue(property)]));
        }));
        report.regression.push({ width, selector, computedStylesUnchanged: JSON.stringify(before) === JSON.stringify(after) });
      }
    }

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(origin, { waitUntil: 'networkidle' });
    report.links.allFooterFragmentsResolve = await page.evaluate(() => [...document.querySelectorAll('.footer-links a[href^="#"]')].every(link => Boolean(document.querySelector(link.getAttribute('href')))));
    const firstFooterLink = page.locator('.footer-links a').first();
    await firstFooterLink.focus();
    await page.keyboard.press('Tab');
    report.keyboard = await page.evaluate(() => {
      const focused = document.activeElement;
      return { keyboardFocusedFooterLink: focused.matches('.footer-links a'), focusedText: focused.textContent.trim(), outlineStyle: getComputedStyle(focused).outlineStyle, outlineWidth: getComputedStyle(focused).outlineWidth };
    });
    report.contrast = await page.evaluate(() => {
      const style = selector => getComputedStyle(document.querySelector(selector));
      const ratio = (foreground, background) => {
        const luminance = color => { const [r, g, b] = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4); return r * .2126 + g * .7152 + b * .0722; };
        const a = luminance(foreground), b = luminance(background);
        return Number(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2));
      };
      const samples = [
        ['heading', '.footer-links h2'], ['bodySecondary', '.footer-brand > p'], ['link', '.footer-links a'], ['disclaimer', '.footer-disclaimer']
      ];
      return Object.fromEntries(samples.map(([name, selector]) => { const element = document.querySelector(selector); const computed = getComputedStyle(element); return [name, { foreground: computed.color, background: computed.backgroundColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(document.querySelector('.site-footer')).backgroundColor : computed.backgroundColor, ratio: ratio(computed.color, computed.backgroundColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(document.querySelector('.site-footer')).backgroundColor : computed.backgroundColor) }]; }));
    });
    await page.addScriptTag({ path: require.resolve('axe-core') });
    const axe = await page.evaluate(async () => {
      const result = await axe.run('.site-footer', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
      return { violations: result.violations.map(item => ({ id: item.id, impact: item.impact, description: item.description, nodes: item.nodes.map(node => node.target) })), incomplete: result.incomplete.map(item => item.id), passes: result.passes.map(item => item.id) };
    });
    report.axe = axe;
    report.checks = {
      htmlValidationHasNoNewFooterIssues: true,
      cssParses: cssParseErrors.length === 0,
      allResponsiveWidthsFit: report.widths.every(item => !item.hasHorizontalOverflow),
      responsiveColumnsMatch: report.widths.every(item => item.viewport < 601 ? item.gridColumns === 1 : item.viewport < 1024 ? item.gridColumns === 2 : item.gridColumns === 3),
      allFooterLinksResolve: report.links.allFooterFragmentsResolve,
      exactContactSchemes: report.widths.every(item => item.contactLinks.some(link => link.href === 'tel:+573004218699') && item.contactLinks.some(link => link.href === 'mailto:info@salvacionm.com')),
      touchTargetsAtLeast44px: report.widths.every(item => item.contactLinks.every(link => link.minTargetHeight >= 44)),
      keyboardFocusVisible: report.keyboard.keyboardFocusedFooterLink && report.keyboard.outlineStyle !== 'none' && report.keyboard.outlineWidth !== '0px',
      sampledTextContrastAtLeastAA: Object.values(report.contrast).every(item => item.ratio >= 4.5),
      noAxeViolations: axe.violations.length === 0,
      unaffectedSectionsComputedStylesUnchanged: report.regression.every(item => item.computedStylesUnchanged),
      noConsoleErrors: report.consoleErrors.length === 0,
      noThirdPartyNetworkRequests: report.externalRequests.length === 0,
      allStructuralChecks: Object.values(report.structuralChecks).every(Boolean)
    };
    report.checks.htmlValidationHasNoNewFooterIssues = currentValidation.results.flatMap(result => result.messages).filter(message => message.line >= 299).length === 0;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
  report.generatedAt = new Date().toISOString();
  report.overall = Object.values(report.checks).every(Boolean);
  fs.writeFileSync(`${output}/resultados.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!report.overall) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
