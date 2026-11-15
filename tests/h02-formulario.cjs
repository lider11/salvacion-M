// Ejecutar desde la raíz con Playwright y axe-core disponibles en NODE_PATH.
// CHROMIUM_PATH permite usar Chromium instalado. Solo servidor local, datos ficticios.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { chromium } = require('playwright');

const root = path.resolve(process.env.H02_ROOT || '.');
const output = path.resolve(process.env.H02_OUTPUT || 'output/h02');
const services = ['negacion', 'medicamentos', 'citas', 'incapacidades', 'eps-ips', 'reclamacion'];
const result = { scope: 'H02, navegador local; sin API ni producción', checks: [], accessibility: [], screenshots: [], network: {}, limitations: ['Lectores de pantalla reales NO VERIFICADOS.', 'Hostinger, MySQL y recepción real fuera del alcance.'] };
const requests = [];
const errors = [];
const form = '#orientacion-form';
const status = '#contacto-estado';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  requests.push({ method: req.method, path: url.pathname, query: url.search });
  if (req.method !== 'GET' || url.pathname.startsWith('/api/')) { res.writeHead(405).end(); return; }
  const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); }
  catch { res.writeHead(404).end(); }
});

(async () => {
  fs.mkdirSync(output, { recursive: true });
  for (const file of ['js/main.js', 'index.html', 'css/style.css', 'privacidad.html']) {
    result[file] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
  }
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  result.browser = browser.version();
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const network = [];
  page.on('request', request => network.push({ method: request.method(), url: request.url() }));
  await page.addInitScript(() => {
    window.h02Listeners = [];
    const add = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, ...rest) {
      if (this.id === 'orientacion-form' || this.classList?.contains('contacto-revisar') || this.classList?.contains('servicio-enlace')) {
        window.h02Listeners.push({ target: this.id || this.className, type });
      }
      return add.call(this, type, ...rest);
    };
  });
  async function check(name, fn) {
    try { await fn(); result.checks.push({ name, pass: true }); }
    catch (error) { result.checks.push({ name, pass: false, error: error.message }); }
  }
  async function fresh() { await page.goto(origin); }
  async function valid() {
    await page.locator('#contacto-nombre').fill('Persona Ficticia');
    await page.locator('#contacto-email').fill('prueba@example.invalid');
    await page.locator('#contacto-descripcion').fill('Texto ficticio para revisar el formulario sin datos reales.');
    await page.locator('#contacto-servicio-negacion').check();
    await page.locator('#contacto-consentimiento').check();
  }
  async function review() { await page.locator('.contacto-revisar').click(); }
  async function invalid(id) { assert.equal(await page.locator('#contacto-' + id).getAttribute('aria-invalid'), 'true'); }
  async function accepted() {
    assert.equal(await page.locator('#contacto-errores').isVisible(), false);
    assert.match(await page.locator(status).innerText(), /^Revisión local completada/);
    assert.match(await page.locator(status).innerText(), /No se envió ni se guardó/);
    assert.match(await page.locator(status).innerText(), /aviso en borrador/);
  }
  try {
    await check('Controlador único y estado inicial seguro', async () => {
      await fresh();
      const listeners = await page.evaluate(() => window.h02Listeners);
      for (const type of ['input', 'change', 'submit']) assert.equal(listeners.filter(x => x.target === 'orientacion-form' && x.type === type).length, 1);
      assert.equal(listeners.filter(x => x.target === 'contacto-revisar' && x.type === 'click').length, 1);
      assert.equal(listeners.filter(x => x.target === 'servicio-enlace' && x.type === 'click').length, 6);
      assert.equal(await page.locator(form).getAttribute('method'), 'dialog');
      assert.equal(await page.locator(form).getAttribute('data-preview-only'), 'true');
      assert.equal(await page.locator('.contacto-enviar').isDisabled(), true);
      assert.equal(await page.locator('.contacto-enviar').isVisible(), false);
      assert.equal(await page.locator(status).isVisible(), false);
    });
    await check('Vacío: cinco errores, resumen enfocado y enlaces accesibles', async () => {
      await fresh(); await review();
      assert.equal(await page.locator('#contacto-errores li').count(), 5);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'contacto-errores');
      for (const id of ['nombre', 'email', 'servicio-negacion', 'descripcion', 'consentimiento']) await invalid(id);
      await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'contacto-nombre');
      assert.equal(await page.locator('#contacto-telefono').getAttribute('aria-invalid'), null);
      assert.equal(await page.locator('#contacto-ciudad').getAttribute('aria-invalid'), null);
    });
    const cases = [
      ['nombre', 'Ab'], ['nombre', 'A'.repeat(101)], ['nombre', '1234'], ['nombre', '---'],
      ['email', 'invalido'], ['email', 'prueba@localhost'], ['email', 'a..b@example.invalid'],
      ['email', '.a@example.invalid'], ['email', 'a'.repeat(65) + '@example.invalid'],
      ['email', 'a'.repeat(64) + '@' + ['b'.repeat(63), 'c'.repeat(63), 'd'.repeat(63)].join('.')],
      ['telefono', '123456'], ['telefono', '1'.repeat(16)], ['telefono', 'abc1234567'],
      ['telefono', '12+3456789'], ['telefono', '1'.repeat(7) + ' '.repeat(19) + '2'],
      ['ciudad', 'A'], ['ciudad', 'A'.repeat(101)], ['ciudad', '1234'],
      ['descripcion', 'Muy breve'], ['descripcion', 'A'.repeat(1001)], ['descripcion', 'Texto ficticio de prueba\u0001 con carácter de control.']
    ];
    for (const [id, value] of cases) {
      await check(`Validación ${id}: ${value.length} caracteres (${cases.findIndex(x => x[0] === id && x[1] === value) + 1})`, async () => {
        await fresh(); await valid();
        // Asignación DOM prueba límites incluso si maxlength impide escribir más.
        await page.locator('#contacto-' + id).evaluate((element, text) => { element.value = text; }, value);
        await review(); await invalid(id);
        assert.equal(await page.locator('#contacto-errores li').count(), 1);
      });
    }
    await check('Sin categoría; categoría manipulada fuera de la lista', async () => {
      await fresh(); await valid();
      await page.locator('input[name="servicio"]:checked').evaluate(el => { el.checked = false; });
      await review(); await invalid('servicio-negacion');
      await page.locator('#contacto-servicio-negacion').evaluate(el => { el.value = 'desconocido'; el.checked = true; });
      await review(); await invalid('servicio-negacion');
    });
    await check('Casilla sin marcar: error de lectura, nunca de autorización', async () => {
      await fresh(); await valid(); await page.locator('#contacto-consentimiento').uncheck(); await review();
      await invalid('consentimiento');
      assert.match(await page.locator('#contacto-consentimiento-error').innerText(), /consultaste.*borrador/);
      assert.match(await page.locator('#contacto-consentimiento').getAttribute('aria-describedby'), /contacto-consentimiento-error/);
    });
    await check('Datos válidos con teléfono y ciudad opcionales vacíos; sin fake-success', async () => {
      await fresh(); await valid(); await review(); await accepted();
      assert.equal(await page.locator('[aria-invalid="true"]').count(), 0);
    });
    await check('Límites válidos, Unicode y datos opcionales con formato', async () => {
      await fresh(); await valid();
      for (const [name, description] of [['Ana', 'A'.repeat(20)], ['Á'.repeat(100), '😀'.repeat(1000)]]) {
        await page.locator('#contacto-nombre').evaluate((el, v) => { el.value = v; }, name);
        await page.locator('#contacto-descripcion').evaluate((el, v) => { el.value = v; }, description);
        await page.locator('#contacto-telefono').fill('+57 (300) 000-0000');
        await page.locator('#contacto-ciudad').fill('Municipio Ficticio');
        await review(); await accepted();
      }
    });
    await check('Corrección en vivo sin duplicar anuncios ni validación input/change', async () => {
      await fresh(); await review(); await valid(); await accepted();
      await page.evaluate(() => {
        window.h02Updates = 0;
        window.h02StatusUpdates = 0;
        const list = document.querySelector('#contacto-errores ul');
        const replace = list.replaceChildren;
        list.replaceChildren = function (...args) { window.h02Updates++; return replace.apply(this, args); };
        new MutationObserver(records => { window.h02StatusUpdates += records.length; }).observe(document.querySelector('#contacto-estado'), { childList: true });
      });
      await page.locator('#contacto-servicio-citas').check();
      const counts = await page.evaluate(() => ({ validations: window.h02Updates, announcements: window.h02StatusUpdates }));
      assert.equal(counts.validations, 1); assert.equal(counts.announcements, 0);
      await page.locator('#contacto-nombre').fill('X'); await invalid('nombre');
      await page.locator('#contacto-nombre').fill('Persona Ficticia'); await accepted();
    });
    for (const service of services) {
      await check(`Enlace ${service}: clic y Enter, una selección, un foco y un desplazamiento`, async () => {
        await fresh();
        await page.evaluate(() => {
          window.h02Actions = { scroll: 0, focus: 0, change: 0 };
          const scroll = Element.prototype.scrollIntoView;
          Element.prototype.scrollIntoView = function (...args) { window.h02Actions.scroll++; return scroll.apply(this, args); };
          document.getElementById('contacto-titulo').addEventListener('focus', () => { window.h02Actions.focus++; });
          document.getElementById('orientacion-form').addEventListener('change', () => { window.h02Actions.change++; });
        });
        const link = page.locator(`.servicio-enlace[data-servicio="${service}"]`);
        await link.click();
        assert.equal(await page.locator('#contacto-servicio-' + service).isChecked(), true);
        assert.equal(await page.evaluate(() => location.hash), '#contacto');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'contacto-titulo');
        assert.deepEqual(await page.evaluate(() => window.h02Actions), { scroll: 1, focus: 1, change: 1 });
        await link.focus(); await page.keyboard.press('Enter');
        assert.deepEqual(await page.evaluate(() => window.h02Actions), { scroll: 2, focus: 2, change: 2 });
      });
    }
    for (const preview of ['true', 'false', null]) {
      await check(`Bloqueo al cargar con data-preview-only=${preview}`, async () => {
        const route = async r => {
          let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
          html = html.replace('data-preview-only="true"', preview === null ? '' : `data-preview-only="${preview}"`);
          await r.fulfill({ contentType: 'text/html', body: html });
        };
        await page.route(origin + '/', route);
        try {
          await fresh(); await valid(); await review(); await accepted();
          const before = network.length;
          await page.locator(form).evaluate(el => { el.requestSubmit(); });
          assert.equal(await page.locator(status).isVisible(), true);
          assert.match(await page.locator(status).innerText(), /^Envío bloqueado/);
          await page.locator(form).evaluate(el => { HTMLFormElement.prototype.submit.call(el); });
          await page.locator('#contacto-nombre').focus(); await page.keyboard.press('Enter');
          await page.locator('.contacto-enviar').evaluate(el => { el.hidden = false; el.disabled = false; });
          await page.locator('.contacto-enviar').click();
          await page.locator(form).evaluate(el => { el.method = 'post'; el.action = '/api/requests.php'; el.requestSubmit(); });
          await page.evaluate(() => new Promise(requestAnimationFrame));
          assert.equal(network.length, before);
          assert.equal(await page.evaluate(() => location.pathname), '/');
        } finally { await page.unroute(origin + '/', route); }
      });
    }
    await check('submit antes de revisar muestra un estado visible', async () => {
      await fresh(); await page.locator(form).evaluate(el => el.requestSubmit());
      assert.equal(await page.locator(status).isVisible(), true);
      assert.match(await page.locator(status).innerText(), /^Envío bloqueado/);
    });
    await check('Texto HTML se mantiene inerte; sin almacenamiento local', async () => {
      await fresh(); await valid();
      await page.locator('#contacto-descripcion').fill('<img src=x onerror="window.h02Xss=true"> Texto ficticio.');
      await review(); await accepted();
      assert.equal(await page.evaluate(() => window.h02Xss), undefined);
      assert.equal(await page.locator(form + ' img').count(), 0);
      assert.deepEqual(await page.evaluate(async () => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie, databases: await indexedDB.databases(), caches: await caches.keys() })), { local: 0, session: 0, cookies: '', databases: [], caches: [] });
    });
    for (const width of [320, 375, 768, 1024, 1440]) {
      await check(`Responsive ${width}px: sin desbordamiento, teclado y axe`, async () => {
        await page.setViewportSize({ width, height: 1000 }); await fresh(); await review();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
        const audit = await page.evaluate(async () => {
          const r = await axe.run({ include: ['#contacto', '#servicios'] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
          return { violations: r.violations, incomplete: r.incomplete.map(x => ({ id: x.id, impact: x.impact, nodes: x.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })) };
        });
        result.accessibility.push({ width, ...audit });
        assert.equal(audit.violations.length, 0);
        assert.equal(await page.locator('#contacto-nombre').evaluate(el => (el.focus(), getComputedStyle(el).outlineStyle)), 'solid');
        if ([375, 1440].includes(width)) {
          for (const section of ['contacto', 'servicios']) {
            const file = `${section}-${width}.png`;
            await page.locator('#' + section).screenshot({ path: path.join(output, file) });
            result.screenshots.push(file);
          }
        }
      });
    }
    await check('Menú móvil: teclado, Escape, selección y transición a escritorio', async () => {
      await page.setViewportSize({ width: 375, height: 900 }); await fresh();
      const toggle = page.locator('.menu-toggle');
      await toggle.focus(); await page.keyboard.press('Enter');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.closest('nav')?.id), 'primary-navigation');
      await page.keyboard.press('Escape'); assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(await page.evaluate(() => document.activeElement.className), 'menu-toggle');
      await toggle.click(); await page.locator('#primary-navigation a[href="#contacto"]').click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(await page.evaluate(() => location.hash), '#contacto');
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.locator('#primary-navigation').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#primary-navigation').isVisible(), true);
    });
    await check('Hero, CTA de proceso, enlaces internos y página de privacidad', async () => {
      await fresh();
      assert.equal(await page.locator('[data-hero-parallax]').evaluate(el => el.classList.contains('is-settled')), true);
      await page.locator('.hero .btn-primary').click();
      assert.equal(await page.evaluate(() => document.activeElement.id), 'contacto-titulo');
      await page.locator('.proceso-cta').click(); assert.equal(await page.evaluate(() => location.hash), '#contacto');
      assert.equal(await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].every(a => document.getElementById(a.hash.slice(1)))), true);
      await page.goto(origin + '/privacidad.html');
      assert.match(await page.locator('#autorizacion').innerText(), /casilla solo confirma.*borrador/);
      await page.locator('nav[aria-label="Navegación principal"] a[href="./index.html#contacto"]').click();
      assert.equal(await page.locator(form).count(), 1);
    });
    await check('JavaScript desactivado: botón inactivo y submit nativo no transmite', async () => {
      const noJs = await browser.newContext({ javaScriptEnabled: false });
      try {
        const p = await noJs.newPage(); await p.goto(origin);
        assert.equal(await p.locator('.contacto-enviar').isDisabled(), true);
        assert.equal(await p.locator('.contacto-revisar').isVisible(), false);
        const before = requests.length;
        await p.locator(form).evaluate(el => HTMLFormElement.prototype.submit.call(el));
        await p.locator('#contacto-nombre').focus(); await p.keyboard.press('Enter');
        assert.equal(requests.length, before);
      } finally { await noJs.close(); }
    });
    await check('Red y consola: cero POST, cero API, cero consultas con datos, cero excepciones', async () => {
      result.network = { post: requests.filter(x => x.method === 'POST').length, api: requests.filter(x => x.path.startsWith('/api/')).length, query: requests.filter(x => x.query).length, browserNonGet: network.filter(x => x.method !== 'GET').length };
      assert.deepEqual(result.network, { post: 0, api: 0, query: 0, browserNonGet: 0 });
      assert.deepEqual(errors, []);
    });
  } finally {
    result.runtimeErrors = errors;
    result.passed = result.checks.filter(x => x.pass).length;
    result.failed = result.checks.filter(x => !x.pass).length;
    result.pass = result.failed === 0;
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ passed: result.passed, failed: result.failed, failures: result.checks.filter(x => !x.pass), network: result.network }, null, 2));
    await browser.close(); server.close();
  }
  if (!result.pass) process.exitCode = 1;
})().catch(error => {
  result.status = 'BLOCKED';
  result.blocker = error.message.includes('socket() failed')
    ? 'Chromium: socket() failed: Operation not permitted (1)'
    : error.message.split('\n')[0];
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2) + '\n');
  console.error(result.blocker); server.close(); process.exitCode = 1;
});
