const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, '../js/formulario-api.js'), 'utf8');

function fixture({preview = 'false', approved = 'true', fetcher} = {}) {
  class Element {
    constructor(value = '') {
      this.value = value; this.checked = false; this.hidden = true; this.disabled = true;
      this.validity = {valid: true}; this.dataset = {}; this.events = {};
      this.children = []; this.attributes = {}; this.textContent = ''; this.focused = false;
    }
    addEventListener(type, handler) { (this.events[type] ||= []).push(handler); }
    setAttribute(k, v) { this.attributes[k] = v; }
    removeAttribute(k) { delete this.attributes[k]; }
    focus() { this.focused = true; }
    replaceChildren() { this.children = []; }
    append(elem) { this.children.push(elem); }
    querySelector(s) {
      if (s === 'ul') return errorList;
      if (s === '.contacto-revisar') return review;
      if (s === '.contacto-enviar') return submit;
      if (s === 'input[name="servicio"]:checked') return chosen;
      return null;
    }
    querySelectorAll(s) {
      if (s === 'input[name="servicio"]') return [chosen];
      return [];
    }
    reset() { this.resetCalled = true; }
  }
  const fields = {};
  for (const key of ['nombre', 'email', 'telefono', 'ciudad', 'descripcion', 'consentimiento', 'servicio-negacion']) fields[`contacto-${key}`] = new Element();
  Object.assign(fields['contacto-nombre'], {value: 'Persona Sintetica'});
  Object.assign(fields['contacto-email'], {value: 'qa@example.invalid'});
  Object.assign(fields['contacto-descripcion'], {value: 'Solo datos ficticios para prueba de QA.'});
  Object.assign(fields['contacto-consentimiento'], {checked: true});
  for (const key of ['nombre', 'email', 'telefono', 'ciudad', 'descripcion', 'consentimiento', 'servicio']) fields[`contacto-${key}-error`] = new Element();
  const form = new Element(); form.dataset = {previewOnly: preview, privacyApproved: approved, privacyVersion: 'sm-h03-staging-sintetico-v1'};
  const chosen = new Element('citas');
  const status = new Element(); const errorBox = new Element(); const errorList = new Element();
  const review = new Element(); const submit = new Element(); const title = new Element();
  const ids = {...fields, 'orientacion-form': form, 'contacto-estado': status,
    'contacto-errores': errorBox, 'contacto-titulo': title};
  const doc = {
    baseURI: 'https://staging.example.invalid/index.html',
    getElementById: id => ids[id] || null,
    querySelectorAll: () => [],
    createElement: () => new Element()
  };
  const context = {
    document: doc,
    window: {location: {origin: 'https://staging.example.invalid', protocol: 'https:', hostname: 'staging.example.invalid'}},
    URL, TextEncoder, Object, console,
    fetch: fetcher || (async () => {throw Error('Unexpected fetch');}),
    Event: class {}
  };
  vm.runInNewContext(src, context);
  return {form, status, errorBox, submit, review, fields, context, chosen};
}
async function send(fx) {
  const handler = fx.form.events.submit?.[0];
  assert.equal(typeof handler, 'function');
  await handler({preventDefault(){}});
}

test('Preview is inert even with a fictitious valid form', async () => {
  const fx = fixture({preview: 'true', fetcher: () => {throw Error('Should never send');}});
  assert.equal(fx.form.events.submit, undefined);
  assert.equal(fx.submit.hidden, true);
});

test('Requires explicit privacy approval flag', () => {
  const fx = fixture({preview: 'false', approved: 'false'});
  assert.equal(fx.form.events.submit, undefined);
});

test('A confirmed HTTP 201 with UUID shows success and resets once', async () => {
  const calls = [];
  const fx = fixture({fetcher: async (url, options) => {
    calls.push({url, options});
    return {status: 201, json: async () => ({ok: true, id: '979ec848-c417-4266-bb89-51b2d3b86569'})};
  }});
  await send(fx);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(JSON.parse(calls[0].options.body).servicio, 'citas');
  assert.equal(JSON.parse(calls[0].options.body).privacy_version, 'sm-h03-staging-sintetico-v1');
  assert.equal(fx.status.className, 'contacto-estado is-ok');
  assert.equal(fx.form.resetCalled, true);
  await send(fx);
  assert.equal(calls.length, 1, 'repeat after 201 must be blocked');
});

test('Ambiguous network failure never causes a resend', async () => {
  let count = 0;
  const fx = fixture({fetcher: async () => {count++; throw Error('timeout');}});
  await send(fx);
  await send(fx);
  assert.equal(count, 1);
  assert.match(fx.status.textContent, /no reenvíes/i);
  assert.equal(fx.submit.disabled, true);
});

test('Invalid form does not send', async () => {
  let count = 0;
  const fx = fixture({fetcher: async () => {count++; throw Error('unexpected');}});
  fx.fields['contacto-nombre'].value = '';
  await send(fx);
  assert.equal(count, 0);
  assert.equal(fx.errorBox.hidden, false);
});

for (const [label, response] of [
  ['invalid UUID', {status: 201, json: async () => ({ok: true, id: 'invalid'})}],
  ['invalid JSON', {status: 201, json: async () => {throw Error('invalid JSON');}}],
  ['HTTP 500', {status: 500, json: async () => ({error: 'persistence_unavailable'})}],
  ['unexpected HTTP 200', {status: 200, json: async () => ({ok: true})}],
  ['HTTP 429', {status: 429, json: async () => ({error: 'rate_limit_exceeded'})}]
]) {
  test(label + ' never reports success or retries', async () => {
    let count = 0;
    const fx = fixture({fetcher: async () => {count++; return response;}});
    await send(fx); await send(fx);
    assert.equal(count, 1);
    assert.equal(fx.status.className, 'contacto-estado is-error');
    assert.equal(fx.form.resetCalled, undefined);
    assert.equal(fx.submit.disabled, true);
  });
}

test('HTTP 422 shows field errors and permits an explicit corrected submission', async () => {
  let count = 0;
  const fx = fixture({fetcher: async () => {
    count++;
    return {status: 422, json: async () => ({error: 'validation_failed', fields: {
      email: 'Correo rechazado', desconocido: '<script>unexpected</script>'
    }})};
  }});
  await send(fx);
  assert.equal(count, 1, 'no automatic retry');
  assert.equal(fx.fields['contacto-email-error'].textContent, 'Correo rechazado');
  assert.equal(fx.submit.disabled, false);
  await send(fx);
  assert.equal(count, 2, 'only explicit submission retries 422');
});

test('A double click while a request is pending sends once', async () => {
  let finish, count = 0;
  const fx = fixture({fetcher: () => {count++; return new Promise(resolve => {finish = resolve;});}});
  const first = send(fx);
  await send(fx);
  assert.equal(count, 1);
  finish({status: 429, json: async () => ({error: 'rate_limit_exceeded'})});
  await first;
  assert.equal(count, 1);
});

test('Consent, categories, control characters and punctuation-only cities are rejected locally', async () => {
  for (const mutate of [
    fx => {fx.fields['contacto-consentimiento'].checked = false;},
    fx => {fx.fields['contacto-ciudad'].value = '--';},
    fx => {fx.fields['contacto-descripcion'].value += String.fromCharCode(1);},
    fx => {fx.fields['contacto-email'].value = 'invalid';},
    fx => {fx.chosen.value = 'unknown';}
  ]) {
    let count = 0;
    const fx = fixture({fetcher: async () => {count++; throw Error('unexpected');}});
    mutate(fx); await send(fx);
    assert.equal(count, 0);
    assert.equal(fx.errorBox.hidden, false);
  }
});
