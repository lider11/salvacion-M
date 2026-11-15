/* Salvación M — integración de formulario. Inerte por defecto: NO envía en vista previa.
 * Activación requiere revisión jurídica y configuración explícita en HTML de staging.
 * No se incluyen secretos ni datos personales en el código.
 */
(() => {
  'use strict';
  const form = document.getElementById('orientacion-form');
  if (!form || form.dataset.previewOnly !== 'false' || form.dataset.privacyApproved !== 'true') return;

  const privacyVersion = form.dataset.privacyVersion || '';
  if (!/^[\w.-]{1,80}$/.test(privacyVersion)) return;
  const endpoint = new URL('./api/requests.php', document.baseURI);
  if (endpoint.origin !== window.location.origin) return;

  const status = document.getElementById('contacto-estado');
  const errorBox = document.getElementById('contacto-errores');
  const errorList = errorBox?.querySelector('ul');
  const review = form.querySelector('.contacto-revisar');
  const submit = form.querySelector('.contacto-enviar');
  const contactTitle = document.getElementById('contacto-titulo');
  if (!status || !errorBox || !errorList || !review || !submit) return;

  const ids = {
    nombre: 'contacto-nombre', email: 'contacto-email', telefono: 'contacto-telefono',
    ciudad: 'contacto-ciudad', descripcion: 'contacto-descripcion',
    consentimiento: 'contacto-consentimiento', servicio: 'contacto-servicio-negacion'
  };
  const get = key => document.getElementById(ids[key]);
  const validServices = new Set(['negacion', 'medicamentos', 'citas', 'incapacidades', 'eps-ips', 'reclamacion']);
  let pending = false;
  let attempted = false; // Evitar reintento ciego después de POST de resultado ambiguo.

  function showStatus(kind, message) {
    status.hidden = false;
    status.className = `contacto-estado is-${kind}`;
    status.textContent = message;
  }

  function fieldError(key, message) {
    const id = key === 'servicio' ? 'contacto-servicio' : ids[key];
    const errorElement = document.getElementById(`${id}-error`);
    const field = get(key);
    if (errorElement) {
      errorElement.textContent = message || '';
      errorElement.hidden = !message;
    }
    if (field) {
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }
  }

  function showIssues(issues) {
    errorList.replaceChildren();
    Object.keys(ids).forEach(key => fieldError(key, issues[key] || ''));
    for (const [key, message] of Object.entries(issues)) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${ids[key]}`;
      a.textContent = message;
      a.addEventListener('click', e => {
        e.preventDefault();
        get(key)?.focus();
      });
      li.append(a);
      errorList.append(li);
    }
    errorBox.hidden = Object.keys(issues).length === 0;
    if (!errorBox.hidden) errorBox.focus();
  }

  function collectAndValidate() {
    const trim = key => get(key)?.value.trim() || '';
    const nombre = trim('nombre');
    const email = trim('email').toLowerCase();
    const telefono = trim('telefono');
    const ciudad = trim('ciudad');
    const descripcion = trim('descripcion');
    const checked = form.querySelector('input[name="servicio"]:checked');
    const servicio = checked?.value || '';
    const consentimiento = get('consentimiento')?.checked === true;
    const issues = {};
    const allowedText = /^[\p{L}\p{M} .’'\-]+$/u;
    const len = value => [...value].length;
    if (len(nombre) < 3 || len(nombre) > 100 || !allowedText.test(nombre) || !/\p{L}/u.test(nombre)) {
      issues.nombre = 'Nombre: escribe de 3 a 100 caracteres válidos.';
    }
    if (email.length > 254 || !get('email')?.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      issues.email = 'Correo electrónico: escribe una dirección válida.';
    }
    const digits = telefono.replace(/\D/g, '');
    if (telefono && (telefono.length > 25 || !/^\+?[\d ()\-]+$/.test(telefono) || digits.length < 7 || digits.length > 15)) {
      issues.telefono = 'Teléfono: usa de 7 a 15 dígitos.';
    }
    if (ciudad && (len(ciudad) < 2 || len(ciudad) > 100 || !allowedText.test(ciudad) || !/\p{L}/u.test(ciudad))) {
      issues.ciudad = 'Ciudad: escribe de 2 a 100 caracteres válidos.';
    }
    if (!validServices.has(servicio)) issues.servicio = 'Selecciona un servicio.';
    if (len(descripcion) < 20 || len(descripcion) > 1000 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(descripcion)) {
      issues.descripcion = 'Descripción: escribe de 20 a 1000 caracteres, sin datos médicos.';
    }
    if (!consentimiento) issues.consentimiento = 'Debes autorizar expresamente el tratamiento de los datos informados.';
    return {
      issues,
      payload: {nombre, email, telefono, ciudad, servicio, descripcion, consentimiento,
        privacy_version: privacyVersion, website: ''}
    };
  }

  function markAmbiguous() {
    attempted = true;
    submit.disabled = true;
    showStatus('error', 'No pudimos confirmar si la solicitud se guardó. Por seguridad, no reenvíes el formulario. Contacta a Salvación M para verificarlo.');
  }

  function validateDisplay() {
    const {issues} = collectAndValidate();
    showIssues(issues);
    return Object.keys(issues).length === 0;
  }

  review.hidden = false;
  submit.hidden = false;
  submit.disabled = false;
  review.addEventListener('click', () => {
    if (pending || attempted) return;
    if (validateDisplay()) showStatus('info', 'Datos revisados. Puedes enviar la solicitud cuando confirmes tu autorización.');
    else showStatus('error', 'Corrige los campos indicados. No hemos enviado nada.');
  });

  document.querySelectorAll('.servicio-enlace[data-servicio]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const servicio = link.getAttribute('data-servicio');
      if (!validServices.has(servicio)) return;
      const choice = [...form.querySelectorAll('input[name="servicio"]')].find(item => item.value === servicio);
      if (!choice) return;
      event.preventDefault();
      choice.checked = true;
      location.hash = '#contacto';
      contactTitle?.focus({preventScroll: true});
      choice.dispatchEvent(new Event('change', {bubbles: true}));
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || attempted) return;
    const {issues, payload} = collectAndValidate();
    showIssues(issues);
    if (Object.keys(issues).length !== 0) {
      showStatus('error', 'Corrige los campos indicados. No hemos enviado nada.');
      return;
    }
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      showStatus('error', 'El envío requiere HTTPS. No se enviaron datos.');
      return;
    }
    const body = JSON.stringify(payload);
    if (new TextEncoder().encode(body).byteLength > 16384) {
      showStatus('error', 'La solicitud es demasiado extensa. No se enviaron datos.');
      return;
    }
    pending = true;
    attempted = true;
    submit.disabled = true;
    review.disabled = true;
    showStatus('info', 'Enviando solicitud. No cierres la página ni vuelvas a enviarla.');
    try {
      const response = await fetch(endpoint.href, {
        method: 'POST', credentials: 'same-origin', redirect: 'error', cache: 'no-store',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'}, body
      });
      let data;
      try { data = await response.json(); } catch { markAmbiguous(); return; }
      if (response.status === 201 && data?.ok === true &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id || '')) {
        showStatus('ok', `Solicitud registrada correctamente. Código de seguimiento: ${data.id}.`);
        form.reset();
        submit.hidden = true;
        review.hidden = true;
        return;
      }
      if (response.status === 422 && data?.error === 'validation_failed') {
        const map = {nombre: 'nombre', email: 'email', telefono: 'telefono', ciudad: 'ciudad',
          servicio: 'servicio', descripcion: 'descripcion', consentimiento: 'consentimiento'};
        const serverIssues = {};
        for (const [key, message] of Object.entries(data.fields || {})) {
          if (Object.hasOwn(map, key) && typeof message === 'string') serverIssues[map[key]] = message;
        }
        showIssues(serverIssues);
        showStatus('error', 'El servidor rechazó los datos. Revisa las indicaciones; no se ha guardado la solicitud.');
        attempted = false; // 422 declara validación fallida y ausencia de persistencia.
        return;
      }
      if (response.status === 429) {
        showStatus('error', 'Se alcanzó el límite temporal de solicitudes. No vuelvas a enviar ahora.');
        return;
      }
      if (response.status >= 400) {
        // Otros errores pueden implicar una ejecución parcial; no reintentar ciegamente.
        markAmbiguous();
        return;
      }
      markAmbiguous();
    } catch {
      markAmbiguous();
    } finally {
      pending = false;
      review.disabled = attempted;
      submit.disabled = attempted;
    }
  });
})();
