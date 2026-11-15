// Comprobaciones DOM con jsdom: no sustituyen navegador, red real, layout o lector de pantalla.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { JSDOM } = require('jsdom');
const root = path.resolve(process.env.H02_ROOT || '.');
const output = path.resolve(process.env.H02_OUTPUT || 'output/h02');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
const services = ['negacion', 'medicamentos', 'citas', 'incapacidades', 'eps-ips', 'reclamacion'];
const result = { environment: 'jsdom 26.1.0 — DOM simulado, sin motor de renderizado', checks: [], limitations: ['No acredita red real ni envío nativo del navegador.', 'Responsive, teclado físico, foco visual, axe y lectores de pantalla NO VERIFICADOS.'] };
for (const file of ['js/main.js', 'index.html', 'css/style.css', 'privacidad.html']) result[file] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
function setup(preview = 'true') {
  const markup = html.replace('data-preview-only="true"', preview === null ? '' : `data-preview-only="${preview}"`);
  const dom = new JSDOM(markup, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  const calls = { network: 0, storage: 0, scroll: 0, focus: 0, change: 0 };
  const listeners = [];
  w.matchMedia = query => ({ matches: query.includes('reduce'), addEventListener() {} });
  w.Element.prototype.scrollIntoView = () => { calls.scroll++; };
  const noNetwork = () => { calls.network++; throw new Error('Se intentó transmitir desde la vista previa'); };
  w.fetch = noNetwork;
  w.XMLHttpRequest = noNetwork;
  w.navigator.sendBeacon = noNetwork;
  w.Storage.prototype.setItem = () => { calls.storage++; throw new Error('Se intentó guardar desde la vista previa'); };
  w.indexedDB = { open: () => { calls.storage++; } };
  const add = w.EventTarget.prototype.addEventListener;
  w.EventTarget.prototype.addEventListener = function(type, ...args) {
    if (this.id === 'orientacion-form' || this.classList?.contains('contacto-revisar')) listeners.push({ target: this.id || this.className, type });
    return add.call(this, type, ...args);
  };
  w.eval(source);
  const field = id => d.getElementById('contacto-' + id);
  function fill(values = {}) {
    const defaults = { nombre: 'Persona Ficticia', email: 'prueba@example.invalid', telefono: '', ciudad: '', descripcion: 'Texto de prueba ficticio sin información personal real.' };
    for (const [id, value] of Object.entries({ ...defaults, ...values })) field(id).value = value;
    field('servicio-negacion').checked = true;
    field('consentimiento').checked = true;
  }
  function review() { d.querySelector('.contacto-revisar').click(); }
  function accepted() { assert.equal(field('errores').hidden, true); assert.match(field('estado').textContent, /^Revisión local completada/); }
  function invalid(id) { assert.equal(field(id).getAttribute('aria-invalid'), 'true'); }
  return { dom, w, d, field, fill, review, accepted, invalid, calls, listeners };
}
async function check(name, fn, preview = 'true') {
  let env;
  try { env = setup(preview); await fn(env); assert.equal(env.calls.network, 0); assert.equal(env.calls.storage, 0); result.checks.push({ name, pass: true }); }
  catch (error) { result.checks.push({ name, pass: false, error: error.message }); }
  finally { env?.dom.window.close(); }
}
(async () => {
  await check('Un registro de cada evento del controlador y estado inicial bloqueado', ({ d, listeners }) => {
    for (const type of ['input', 'change', 'submit']) assert.equal(listeners.filter(x => x.target === 'orientacion-form' && x.type === type).length, 1);
    assert.equal(listeners.filter(x => x.target === 'contacto-revisar' && x.type === 'click').length, 1);
    assert.equal(d.querySelector('form').method, 'dialog');
    assert.equal(d.querySelector('.contacto-enviar').disabled, true);
    assert.equal(d.querySelector('.contacto-enviar').hidden, true);
  });
  await check('Vacío: cinco errores, foco DOM en resumen y enlace al campo', ({ d, field, review, invalid }) => {
    review(); assert.equal(d.querySelectorAll('#contacto-errores li').length, 5);
    assert.equal(d.activeElement, field('errores'));
    for (const id of ['nombre', 'email', 'servicio-negacion', 'descripcion', 'consentimiento']) invalid(id);
    d.querySelector('#contacto-errores a').click(); assert.equal(d.activeElement, field('nombre'));
    assert.equal(field('telefono').hasAttribute('aria-invalid'), false);
    assert.equal(field('ciudad').hasAttribute('aria-invalid'), false);
  });
  const cases = [
    ['nombre', 'Ab'], ['nombre', 'A'.repeat(101)], ['nombre', '1234'], ['nombre', '---'],
    ['email', 'invalido'], ['email', 'prueba@localhost'], ['email', 'a..b@example.invalid'], ['email', '.a@example.invalid'],
    ['email', 'a'.repeat(65) + '@example.invalid'], ['email', 'a'.repeat(64) + '@' + ['b'.repeat(63), 'c'.repeat(63), 'd'.repeat(63)].join('.')],
    ['telefono', '123456'], ['telefono', '1'.repeat(16)], ['telefono', 'abc1234567'], ['telefono', '12+3456789'], ['telefono', '1'.repeat(7) + ' '.repeat(19) + '2'],
    ['ciudad', 'A'], ['ciudad', 'A'.repeat(101)], ['ciudad', '1234'],
    ['descripcion', 'Muy breve'], ['descripcion', 'A'.repeat(1001)], ['descripcion', 'Texto ficticio de prueba\u0001 con carácter de control.']
  ];
  for (const [i, [id, value]] of cases.entries()) await check(`Caso inválido ${i + 1}: ${id}`, ({ d, fill, review, invalid }) => {
    fill({ [id]: value }); review(); invalid(id); assert.equal(d.querySelectorAll('#contacto-errores li').length, 1);
  });
  await check('Servicio requerido y lista cerrada', ({ field, fill, review, invalid }) => {
    fill(); field('servicio-negacion').checked = false; review(); invalid('servicio-negacion');
    field('servicio-negacion').checked = true; field('servicio-negacion').value = 'inventado'; review(); invalid('servicio-negacion');
  });
  await check('Casilla de lectura requerida, sin afirmar consentimiento', ({ field, fill, review, invalid }) => {
    fill(); field('consentimiento').checked = false; review(); invalid('consentimiento');
    assert.match(field('consentimiento-error').textContent, /consultaste.*borrador/);
  });
  await check('Datos válidos y campos opcionales vacíos', ({ fill, review, accepted, field }) => {
    fill(); review(); accepted();
    assert.match(field('estado').textContent, /No se envió ni se guardó/);
    assert.match(field('estado').textContent, /aviso en borrador/);
  });
  await check('Límites válidos y conteo Unicode compatible con mb_strlen', ({ fill, review, accepted }) => {
    for (const values of [
      { nombre: 'Ana', descripcion: 'A'.repeat(20) },
      { nombre: 'Á'.repeat(100), descripcion: '😀'.repeat(1000), telefono: '+57 (300) 000-0000', ciudad: 'Municipio Ficticio' },
      { nombre: "Persona D’Prueba", ciudad: 'Ab', telefono: '1234567' },
      { telefono: '1'.repeat(15), ciudad: 'A'.repeat(100) }
    ]) { fill(values); review(); accepted(); }
  });
  await check('Errores asociados a todos los controles', ({ d, field }) => {
    for (const input of d.querySelectorAll('#orientacion-form input, #orientacion-form textarea')) {
      const expected = input.name === 'servicio' ? 'contacto-servicio-error' : input.id + '-error';
      assert.equal((input.getAttribute('aria-describedby') || '').split(' ').includes(expected), true);
      assert.ok(d.getElementById(expected));
    }
    assert.equal(field('estado').getAttribute('role'), 'status');
  });
  await check('Una validación por cambio de radio y sin repetir anuncio idéntico', async ({ w, d, field, fill, review, accepted }) => {
    fill(); review(); accepted();
    let validations = 0, announcements = 0;
    const list = d.querySelector('#contacto-errores ul');
    const replace = list.replaceChildren;
    list.replaceChildren = function (...args) { validations++; return replace.apply(this, args); };
    new w.MutationObserver(records => { announcements += records.length; }).observe(field('estado'), { childList: true });
    field('servicio-citas').click(); await Promise.resolve();
    assert.equal(validations, 1); assert.equal(announcements, 0);
    field('nombre').value = 'X'; field('nombre').dispatchEvent(new w.Event('input', { bubbles: true }));
    assert.equal(field('nombre').getAttribute('aria-invalid'), 'true');
    field('nombre').value = 'Persona Ficticia'; field('nombre').dispatchEvent(new w.Event('input', { bubbles: true })); accepted();
  });
  for (const service of services) await check(`Enlace y selección DOM: ${service}`, ({ d, field, calls }) => {
    const link = d.querySelector(`.servicio-enlace[data-servicio="${service}"]`); assert.ok(link);
    field('titulo').addEventListener('focus', () => { calls.focus++; });
    d.querySelector('form').addEventListener('change', () => { calls.change++; });
    link.click(); assert.equal(field('servicio-' + service).checked, true);
    assert.equal(d.location.hash, '#contacto'); assert.equal(d.activeElement, field('titulo'));
    assert.equal(calls.scroll, 1); assert.equal(calls.focus, 1); assert.equal(calls.change, 1);
  });
  for (const preview of ['true', 'false', null]) await check(`submit cancelado con atributo ${preview}`, ({ w, d, field, fill, review, accepted, listeners }) => {
    fill(); review(); accepted();
    assert.equal(listeners.filter(x => x.target === 'orientacion-form' && x.type === 'submit').length, 1);
    const event = new w.Event('submit', { bubbles: true, cancelable: true });
    assert.equal(d.querySelector('form').dispatchEvent(event), false); assert.equal(event.defaultPrevented, true);
    assert.equal(field('estado').hidden, false); assert.match(field('estado').textContent, /^Envío bloqueado/);
  }, preview);
  await check('submit antes de revisión presenta estado visible', ({ w, d, field }) => {
    d.querySelector('form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(field('estado').hidden, false); assert.match(field('estado').textContent, /^Envío bloqueado/);
  });
  await check('Contenido HTML en descripción se trata como texto', ({ d, w, fill, review, accepted }) => {
    fill({ descripcion: '<img src=x onerror="window.h02Xss=true"> Texto ficticio.' }); review(); accepted();
    assert.equal(w.h02Xss, undefined); assert.equal(d.querySelectorAll('form img').length, 0);
  });
  await check('Código sin transporte, almacenamiento o segundo controlador', () => {
    assert.equal((source.match(/getElementById\('orientacion-form'\)/g) || []).length, 1);
    assert.equal((source.match(/function validate\(/g) || []).length, 1);
    assert.equal(/\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB)\b/.test(source), false);
  });
  result.passed = result.checks.filter(x => x.pass).length;
  result.failed = result.checks.filter(x => !x.pass).length;
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'dom-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ passed: result.passed, failed: result.failed, failures: result.checks.filter(x => !x.pass) }, null, 2));
  if (result.failed) process.exitCode = 1;
})();
