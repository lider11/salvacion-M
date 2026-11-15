// Ejecutar con el servidor local activo. Solo datos ficticios.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const origin = process.env.LOCAL_ORIGIN || 'http://127.0.0.1:8088';
assert.match(origin, /^http:\/\/127\.0\.0\.1:\d+$/, 'Solo se prueba contra loopback');
const php = process.env.PHP_BINARY || 'C:/xampp/php/php.exe';
const state = path.join(os.tmpdir(), 'salvacion-local-' + crypto.createHash('sha256').update(path.resolve(__dirname, '..')).digest('hex').slice(0, 12));
const config = path.join(state, 'config.php');
function sql(statement, args = []) {
  const result = spawnSync(php, ['-r', '$c=require $argv[1];$db=new PDO($c["dsn"]);$s=$db->prepare($argv[2]);$s->execute(array_slice($argv,3));echo json_encode($s->fetchAll(PDO::FETCH_ASSOC));', config, statement, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}
let checks = 0;
function check(value, label) { assert.ok(value, label); console.log('PASS: ' + label); checks++; }
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let posts = 0;
  page.on('request', r => { if (r.method() === 'POST') posts++; });
  async function fill(email) {
    await page.locator('#contacto-nombre').fill('Persona Ficticia');
    await page.locator('#contacto-email').fill(email);
    await page.locator('#contacto-servicio-citas').check();
    await page.locator('#contacto-descripcion').fill('Solicitud ficticia para comprobar el formulario local.');
    await page.locator('#contacto-consentimiento').check();
  }
  try {
    await page.goto(origin);
    check(await page.locator('.contacto-enviar').isVisible(), 'envio local visible');
    check(!await page.locator('#contacto-consentimiento').isChecked(), 'casilla inicialmente desmarcada');
    await page.locator('.contacto-enviar').click();
    check(posts === 0 && await page.locator('#contacto-errores').isVisible(), 'datos invalidos no generan POST');
    const email = `qa-${Date.now()}@example.invalid`;
    await fill(email);
    await page.route('**/api/requests.php', async route => {
      await new Promise(resolve => setTimeout(resolve, 350));
      await route.continue();
    });
    const responsePromise = page.waitForResponse(r => r.url().endsWith('/api/requests.php'));
    await page.locator('.contacto-enviar').click();
    check(await page.locator('.contacto-enviar').isDisabled(), 'doble envio bloqueado durante guardado');
    check(await page.locator('#contacto-email').isDisabled(), 'campos bloqueados durante envio para no perder ediciones');
    const response = await responsePromise;
    const result = await response.json();
    await page.waitForFunction(() => document.getElementById('contacto-estado').textContent.includes('Prueba guardada'));
    check(response.status() === 201 && result.ok && posts === 1, 'un unico POST confirma 201');
    const rows = sql('SELECT id, email, privacy_version FROM requests WHERE id = ?', [result.id]);
    check(rows.length === 1 && rows[0].email === email && rows[0].privacy_version === 'local-ficticio-v1', 'ID visible corresponde a fila SQLite real');
    check((await page.locator('#contacto-estado').textContent()).includes(result.id), 'confirmacion muestra el ID persistido');
    check(!await page.locator('#contacto-email').isDisabled(), 'campos disponibles tras respuesta');
    fs.mkdirSync('output/playwright/local-form', { recursive: true });
    await page.locator('#orientacion-form').screenshot({ path: 'output/playwright/local-form/guardado.png' });
    fs.writeFileSync('output/playwright/local-form/persistencia.json', JSON.stringify({
      environment: 'local-synthetic-only', database: 'SQLite', httpStatus: response.status(),
      returnedId: result.id, persistedId: rows[0].id, privacyVersion: rows[0].privacy_version
    }, null, 2) + '\n');
    await page.unroute('**/api/requests.php');

    // Fallo real dentro de la transaccion: trigger limitado a un correo ficticio.
    sql("CREATE TRIGGER IF NOT EXISTS smoke_fail BEFORE INSERT ON requests WHEN NEW.email = 'fallo@example.invalid' BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END");
    try {
      await fill('fallo@example.invalid');
      const failure = page.waitForResponse(r => r.url().endsWith('/api/requests.php'));
      await page.locator('.contacto-enviar').click();
      check((await failure).status() === 500, 'fallo real de persistencia devuelve 500');
      await page.waitForFunction(() => document.getElementById('contacto-estado').textContent.includes('No se pudo guardar'));
      check(sql('SELECT id FROM requests WHERE email = ?', ['fallo@example.invalid']).length === 0, 'fallo de transaccion no guarda solicitud');
      check(await page.locator('#contacto-email').inputValue() === 'fallo@example.invalid', 'error conserva campos');
    } finally { sql('DROP TRIGGER IF EXISTS smoke_fail'); }

    for (const [status, body, expected] of [
      [422, { ok: false }, 'rechazó'], [429, { ok: false }, 'límite'],
      [503, { ok: false }, 'configuración'], [201, { ok: true }, 'No se pudo confirmar']
    ]) {
      await page.route('**/api/requests.php', route => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }));
      await page.locator('.contacto-enviar').click();
      await page.waitForFunction(text => document.getElementById('contacto-estado').textContent.includes(text), expected);
      check((await page.locator('#contacto-estado').getAttribute('class')).includes('is-error'), `respuesta ${status} sin confirmacion valida no muestra exito`);
      await page.unroute('**/api/requests.php');
    }
    await page.route('**/api/requests.php', route => route.abort());
    await page.locator('.contacto-enviar').click();
    await page.waitForFunction(() => document.getElementById('contacto-estado').textContent.includes('podría haberse guardado'));
    check(await page.locator('#contacto-email').inputValue() === 'fallo@example.invalid', 'red interrumpida informa incertidumbre y conserva campos');
    await page.unroute('**/api/requests.php');
    for (const url of ['/backend/bootstrap.php', '/backend/config.example.php', '/.git/config', '/tests/php-api-smoke.php']) {
      check((await page.request.get(origin + url)).status() === 404, 'archivo interno bloqueado: ' + url);
    }
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'sin overflow a ' + width);
    }
    fs.mkdirSync('output/playwright/local-form', { recursive: true });
    await page.locator('#orientacion-form').screenshot({ path: 'output/playwright/local-form/formulario.png' });
    // HTML sin marcador local: simula la pagina estatica publica sin cambiarla.
    await page.route(origin + '/', async route => {
      const response = await route.fetch();
      const html = (await response.text()).replace(/<meta name="salvacion-local-privacy"[^>]*>/, '');
      await route.fulfill({ response, body: html });
    });
    await page.goto(origin);
    check(!await page.locator('.contacto-enviar').isVisible(), 'HTML publico conserva envio oculto');
    const before = posts;
    await fill('preview@example.invalid');
    await page.locator('.contacto-revisar').click();
    check(posts === before, 'revision publica no envia');
    check(errors.length === 0, 'sin errores JavaScript');
    console.log(`Passed checks: ${checks}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
