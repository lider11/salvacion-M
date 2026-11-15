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

// Único controlador de Contacto: revisión local. Habilitar envíos requiere otra implementación aprobada.
(() => {
  const form = document.getElementById('orientacion-form');
  if (!form) return;

  // Bloqueo independiente de data-preview-only; method=dialog también protege submit() nativo.
  form.method = 'dialog';
  form.removeAttribute('action');
  form.addEventListener('submit', event => {
    event.preventDefault();
    showStatus('Envío bloqueado. No se envió ni se guardó ninguna solicitud.', true);
  });
  const submitButton = form.querySelector('.contacto-enviar');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.hidden = true;
  }
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
  const services = new Set(['negacion', 'medicamentos', 'citas', 'incapacidades', 'eps-ips', 'reclamacion']);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const length = value => [...value].length;
  let reviewed = false;

  function showStatus(message, invalid = false) {
    status.hidden = false;
    status.className = `contacto-estado${invalid ? ' is-error' : ' is-info'}`;
    // No repetir el mismo anuncio en cada pulsación.
    if (status.textContent !== message) status.textContent = message;
  }

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
    show('nombre', length(name) < 3 || length(name) > 100 || !textCharacters.test(name) || !/\p{L}/u.test(name)
      ? 'Nombre completo: escribe entre 3 y 100 caracteres con letras, espacios, apóstrofos o guiones.' : '', [fields.nombre]);
    const email = fields.email.value.trim();
    show('email', !email || email.length > 254 || fields.email.validity.typeMismatch
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || email.split('@')[0].length > 64 || /(^\.|\.@|\.\.)/.test(email)
      ? 'Correo electrónico: escribe una dirección válida de hasta 254 caracteres.' : '', [fields.email]);
    const phone = fields.telefono.value.trim();
    const digits = phone.replace(/\D/g, '');
    show('telefono', phone && (phone.length > 25 || !/^\+?[\d ()\-]+$/.test(phone) || digits.length < 7 || digits.length > 15)
      ? 'Teléfono: usa entre 7 y 15 dígitos y solo + inicial, espacios, paréntesis o guiones.' : '', [fields.telefono]);
    const city = fields.ciudad.value.trim();
    show('ciudad', city && (length(city) < 2 || length(city) > 100 || !textCharacters.test(city) || !/\p{L}/u.test(city))
      ? 'Ciudad o municipio: escribe entre 2 y 100 caracteres con letras, espacios, apóstrofos o guiones.' : '', [fields.ciudad]);
    show('servicio', radios.some(radio => radio.checked && services.has(radio.value)) ? '' : 'Servicio solicitado: selecciona una de las seis opciones.', radios);
    const description = fields.descripcion.value.trim();
    show('descripcion', length(description) < 20 || length(description) > 1000 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(description)
      ? 'Descripción: escribe entre 20 y 1000 caracteres, sin caracteres de control ni información médica sensible.' : '', [fields.descripcion]);
    show('consentimiento', fields.avisoLeido.checked
      ? '' : 'Confirma que consultaste el aviso de privacidad en borrador.', [fields.avisoLeido]);
    summary.hidden = errors === 0;
    showStatus(errors
      ? 'Hay campos por corregir. No se envió ni se guardó ninguna solicitud.'
      : 'Revisión local completada. No se envió ni se guardó ninguna solicitud; la casilla solo confirma que consultaste un aviso en borrador.', errors > 0);
    if (focusSummary && errors) summary.focus();
  }

  review.hidden = false;
  review.addEventListener('click', () => {
    reviewed = true;
    validate(true);
  });
  // Texto: input. Radios y casilla: change. Una validación por interacción.
  form.addEventListener('input', event => {
    if (reviewed && event.target.matches('input:not([type="radio"]):not([type="checkbox"]), textarea')) validate();
  });
  form.addEventListener('change', event => {
    if (reviewed && event.target.matches('input[type="radio"], input[type="checkbox"]')) validate();
  });

  document.querySelectorAll('.servicio-enlace[data-servicio]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const radio = radios.find(control => control.value === link.dataset.servicio && services.has(control.value));
      if (!radio) return;
      event.preventDefault();
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      // Cambiar el fragmento sin provocar un segundo desplazamiento nativo.
      if (window.location.hash !== '#contacto') window.history.replaceState(null, '', '#contacto');
      document.getElementById('contacto')?.scrollIntoView({
        behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start'
      });
      document.getElementById('contacto-titulo')?.focus({ preventScroll: true });
    });
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
