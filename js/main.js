(() => {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.menu-toggle');
  const navigation = document.getElementById('primary-navigation');
  if (!toggle || !navigation) return;

  const mobile = window.matchMedia('(max-width: 600px)');

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    navigation.hidden = mobile.matches && !open;
  }

  function syncViewport() {
    if (mobile.matches && navigation.contains(document.activeElement)) {
      toggle.hidden = false;
      toggle.focus();
    } else if (!mobile.matches && document.activeElement === toggle) {
      navigation.hidden = false;
      navigation.querySelector('a')?.focus();
    }
    toggle.hidden = !mobile.matches;
    setOpen(false);
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobile.matches && !navigation.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  header.addEventListener('click', (event) => {
    if (mobile.matches && event.target.closest('a')) {
      if (navigation.contains(document.activeElement)) toggle.focus();
      setOpen(false);
    }
  });

  mobile.addEventListener('change', syncViewport);
  syncViewport();
})();

// El servidor local habilita pruebas; el HTML público conserva la vista previa.
(() => {
  const form = document.getElementById('orientacion-form');
  if (!form) return;
  const localVersion = document.querySelector('meta[name="salvacion-local-privacy"]')?.content;
  const local = Boolean(localVersion) && ['127.0.0.1', 'localhost'].includes(location.hostname);
  const submit = form.querySelector('.contacto-enviar');
  let sending = false;
  const review = form.querySelector('.contacto-revisar');
  const summary = document.getElementById('contacto-errores');
  const list = summary.querySelector('ul');
  const status = document.getElementById('contacto-estado');
  const fields = {
    nombre: document.getElementById('contacto-nombre'),
    email: document.getElementById('contacto-email'),
    telefono: document.getElementById('contacto-telefono'),
    ciudad: document.getElementById('contacto-ciudad'),
    descripcion: document.getElementById('contacto-descripcion'),
    avisoLeido: document.getElementById('contacto-consentimiento')
  };
  const radios = [...form.querySelectorAll('input[name="servicio"]')];
  const textCharacters = /^[\p{L}\p{M} .’'\-]+$/u;
  let reviewing = false;
  let reviewed = false;

  function validate(focusSummary = false) {
    list.replaceChildren();
    let errors = 0;
    function show(key, message, controls) {
      const error = document.getElementById(`contacto-${key}-error`);
      error.textContent = message;
      error.hidden = !message;
      controls.forEach(control => {
        if (message) control.setAttribute('aria-invalid', 'true');
        else control.removeAttribute('aria-invalid');
      });
      if (!message) return;
      errors += 1;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${controls[0].id}`;
      link.textContent = message;
      link.addEventListener('click', event => {
        event.preventDefault();
        controls[0].focus();
      });
      item.append(link);
      list.append(item);
    }
    const name = fields.nombre.value.trim();
    show('nombre', name.length < 3 || name.length > 100 || !textCharacters.test(name) || !/\p{L}/u.test(name)
      ? 'Nombre completo: escribe entre 3 y 100 caracteres con letras, espacios, apóstrofos o guiones.' : '', [fields.nombre]);
    const email = fields.email.value.trim();
    show('email', !email || email.length > 254 || fields.email.validity.typeMismatch
      ? 'Correo electrónico: escribe una dirección válida de hasta 254 caracteres.' : '', [fields.email]);
    const phone = fields.telefono.value.trim();
    const digits = phone.replace(/\D/g, '');
    show('telefono', phone && (phone.length > 25 || !/^\+?[\d ()\-]+$/.test(phone) || digits.length < 7 || digits.length > 15)
      ? 'Teléfono: usa entre 7 y 15 dígitos y solo + inicial, espacios, paréntesis o guiones.' : '', [fields.telefono]);
    const city = fields.ciudad.value.trim();
    show('ciudad', city && (city.length < 2 || city.length > 100 || !textCharacters.test(city) || !/\p{L}/u.test(city))
      ? 'Ciudad o municipio: escribe hasta 100 caracteres con letras, espacios, apóstrofos o guiones.' : '', [fields.ciudad]);
    show('servicio', radios.some(radio => radio.checked) ? '' : 'Servicio solicitado: selecciona una de las seis opciones.', radios);
    const description = fields.descripcion.value.trim();
    show('descripcion', description.length < 20 || description.length > 1000
      ? 'Descripción: escribe entre 20 y 1000 caracteres, sin información médica sensible.' : '', [fields.descripcion]);
    show('consentimiento', fields.avisoLeido.checked
      ? '' : 'Confirma que consultaste el aviso de privacidad en borrador.', [fields.avisoLeido]);
    summary.hidden = errors === 0;
    status.hidden = false;
    status.className = `contacto-estado${errors ? ' is-error' : ' is-info'}`;
    status.textContent = errors
      ? 'Hay campos por corregir. No se envió ni se guardó ninguna solicitud.'
      : 'Revisión local completada. No se envió ni se guardó ninguna solicitud; la casilla solo confirma que consultaste un aviso en borrador.';
    if (focusSummary && errors) summary.focus();
    return errors === 0;
  }

  if (local) {
    form.dataset.previewOnly = 'false';
    submit.hidden = false;
    submit.disabled = false;
    submit.textContent = 'Enviar prueba local';
    document.getElementById('contacto-disponibilidad').textContent = 'Pruebas locales: el envío guarda en una base SQLite de este equipo. Usa exclusivamente datos ficticios.';
    document.getElementById('contacto-politica-estado').textContent = 'La casilla confirma una prueba con datos ficticios. No constituye aprobación del aviso para recibir datos reales.';
  }
  review.hidden = false;
  review.addEventListener('click', () => {
    if (reviewing) return;
    reviewing = true;
    reviewed = true;
    try { validate(true); } finally { reviewing = false; }
  });
  form.addEventListener('input', () => { if (reviewed && !sending) validate(); });
  form.addEventListener('change', () => { if (reviewed && !sending) validate(); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    if (!local) {
      status.hidden = false;
      status.textContent = 'Envío bloqueado. La recepción segura y la política de datos no están verificadas. No se ha enviado ninguna solicitud.';
      return;
    }
    reviewed = true;
    if (!validate(true)) return;
    const payload = Object.fromEntries(['nombre', 'email', 'telefono', 'ciudad', 'descripcion'].map(key => [key, fields[key].value.trim()]));
    payload.servicio = form.querySelector('input[name="servicio"]:checked').value;
    payload.consentimiento = fields.avisoLeido.checked;
    payload.privacy_version = localVersion;
    sending = true;
    const editable = [...form.querySelectorAll('input, textarea')].map(control => [control, control.disabled]);
    editable.forEach(([control]) => { control.disabled = true; });
    submit.disabled = true;
    review.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Guardando prueba local…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/requests.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin', body: JSON.stringify(payload), signal: controller.signal
      });
      const result = await response.json();
      if (response.status === 201 && result.ok === true && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result.id)) {
        form.reset();
        reviewed = false;
        status.className = 'contacto-estado is-ok';
        status.textContent = `Prueba guardada en este equipo. Identificador: ${result.id}. No se enviaron correos ni notificaciones.`;
      } else {
        status.className = 'contacto-estado is-error';
        const messages = {
          422: 'El servidor rechazó los datos o la versión de prueba. Revisa los campos.',
          429: 'Alcanzaste el límite de pruebas con este correo. Espera a la siguiente hora o usa otro correo ficticio.',
          403: 'El origen de la página no está autorizado. Abre la dirección indicada al iniciar el servidor.',
          500: 'No se pudo guardar la solicitud. Tus campos se conservan.',
          503: 'La configuración local no está disponible. Revisa el servidor.'
        };
        status.textContent = messages[response.status] || 'No se pudo confirmar el guardado. No reenvíes automáticamente; comprueba el registro local.';
      }
    } catch {
      status.className = 'contacto-estado is-error';
      status.textContent = 'No se pudo confirmar el guardado. La conexión o la respuesta falló; podría haberse guardado. Conservamos los campos. Comprueba el registro local antes de repetir.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      submit.disabled = false;
      review.disabled = false;
      editable.forEach(([control, disabled]) => { control.disabled = disabled; });
      form.removeAttribute('aria-busy');
    }
  });
})();

(() => {
  const section = document.querySelector('[data-hero-parallax]');
  const media = section?.querySelector('.hero-parallax-media');
  const photo = media?.querySelector('img');
  const skipButton = section?.querySelector('[data-hero-skip]');
  if (!section || !media || !photo) return;

  // Dissolve cinematográfico: hold breve + crossfade lento (sin shatter).
  const HOLD_MS = 400;
  const FADE_MS = 2600;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let holdTimer = 0;
  let fadeTimer = 0;
  let settled = false;

  function settle() {
    if (settled) return;
    settled = true;
    window.clearTimeout(holdTimer);
    window.clearTimeout(fadeTimer);
    section.classList.add('is-revealing', 'is-settled');
    media.replaceChildren();
    if (skipButton) {
      skipButton.hidden = true;
      skipButton.setAttribute('aria-hidden', 'true');
    }
  }

  function beginReveal() {
    if (settled) return;
    section.classList.add('is-revealing');
    fadeTimer = window.setTimeout(settle, FADE_MS);
  }

  function start() {
    if (reduceMotion.matches) {
      settle();
      return;
    }

    const arm = () => {
      holdTimer = window.setTimeout(beginReveal, HOLD_MS);
    };

    if (photo.complete) arm();
    else photo.addEventListener('load', arm, { once: true });
  }

  skipButton?.addEventListener('click', () => {
    settle();
    section.querySelector('.hero-actions .btn-primary')?.focus({ preventScroll: true });
  });

  start();
})();

(() => {
  const consultationLink = document.querySelector('.hero .btn-primary[href="#contacto"]');
  const contactTitle = document.getElementById('contacto-titulo');
  const contactContent = contactTitle?.closest('.container');
  if (!consultationLink || !contactTitle || !contactContent) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let buttonEffect;
  let destinationEffect;
  let activation = 0;

  consultationLink.addEventListener('click', async (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;

    event.preventDefault();
    const currentActivation = ++activation;
    buttonEffect?.cancel();
    destinationEffect?.cancel();

    if (!reducedMotion.matches && typeof consultationLink.animate === 'function') {
      buttonEffect = consultationLink.animate([
        { transform: 'scale(1)', backgroundColor: '#ffffff' },
        { transform: 'scale(0.95)', backgroundColor: '#ffda85', offset: 0.4 },
        { transform: 'scale(1)', backgroundColor: '#ffffff' }
      ], { duration: 320, easing: 'ease-out' });
      try {
        await buttonEffect.finished;
      } catch {
        // cancelación por clic repetido o prefers-reduced-motion
      }
    }

    if (currentActivation !== activation) return;
    if (window.location.hash !== '#contacto') window.location.hash = 'contacto';
    contactTitle.closest('section').scrollIntoView({
      behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start'
    });
    contactTitle.focus({ preventScroll: true });

    if (!reducedMotion.matches && typeof contactContent.animate === 'function') {
      destinationEffect = contactContent.animate([
        { backgroundColor: '#fff0c2', boxShadow: '0 0 0 12px #fff0c2' },
        { backgroundColor: '#fff0c2', boxShadow: '0 0 0 12px #fff0c2', offset: 0.45 },
        { backgroundColor: 'transparent', boxShadow: '0 0 0 12px transparent' }
      ], { duration: 2400, easing: 'ease-out' });
    }
  });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      buttonEffect?.cancel();
      destinationEffect?.cancel();
    }
  });
})();
