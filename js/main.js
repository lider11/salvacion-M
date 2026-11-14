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
    // Move focus before hiding the currently focused control or link.
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

    // Show the feedback before navigating away from the button.
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
        // A repeated click or preference change can cancel this animation.
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

(() => {
  const form = document.getElementById('solicitud-form');
  const status = document.getElementById('formulario-estado');
  if (!form || !status) return;

  const fields = {
    nombre: form.elements.namedItem('nombre'),
    correo: form.elements.namedItem('correo'),
    telefono: form.elements.namedItem('telefono'),
    tipo: form.elements.namedItem('tipo'),
    mensaje: form.elements.namedItem('mensaje'),
    consentimiento: form.elements.namedItem('consentimiento')
  };
  const submitButton = form.querySelector('button[type="submit"]');
  const endpoint = '/api/v1/requests';
  // Habilitar solo con el manejador JS activo: evita GET nativo con datos sensibles en la URL.
  if (submitButton) submitButton.disabled = false;

  function setStatus(type, message) {
    status.className = `form-status${type ? ` is-${type}` : ''}`;
    status.textContent = message;
  }

  function setFieldError(name, message) {
    const field = fields[name];
    const error = document.getElementById(`${name}-error`);
    if (!field || !error) return;
    if (message) {
      error.hidden = false;
      error.textContent = message;
      field.setAttribute('aria-invalid', 'true');
    } else {
      error.hidden = true;
      error.textContent = '';
      field.removeAttribute('aria-invalid');
    }
  }

  function clearErrors() {
    Object.keys(fields).forEach((name) => setFieldError(name, ''));
  }

  function validate() {
    clearErrors();
    let firstInvalid = null;

    const nombre = String(fields.nombre.value || '').trim();
    const correo = String(fields.correo.value || '').trim();
    const telefono = String(fields.telefono.value || '').trim();
    const tipo = String(fields.tipo.value || '');
    const mensaje = String(fields.mensaje.value || '').trim();
    const consentimiento = fields.consentimiento.checked;

    if (nombre.length < 2) {
      setFieldError('nombre', 'Escribe tu nombre (mínimo 2 caracteres).');
      firstInvalid ??= fields.nombre;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setFieldError('correo', 'Escribe un correo válido.');
      firstInvalid ??= fields.correo;
    }

    if (telefono && telefono.replace(/\D/g, '').length < 7) {
      setFieldError('telefono', 'Si indicas teléfono, usa al menos 7 dígitos.');
      firstInvalid ??= fields.telefono;
    }

    if (!tipo) {
      setFieldError('tipo', 'Selecciona el tipo de situación.');
      firstInvalid ??= fields.tipo;
    }

    if (mensaje.length < 20) {
      setFieldError('mensaje', 'Cuéntanos un poco más (mínimo 20 caracteres).');
      firstInvalid ??= fields.mensaje;
    }

    if (!consentimiento) {
      setFieldError('consentimiento', 'Debes autorizar el tratamiento de datos para enviar la solicitud.');
      firstInvalid ??= fields.consentimiento;
    }

    return { ok: !firstInvalid, firstInvalid, payload: { nombre, correo, telefono, tipo, mensaje, consentimiento: true } };
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const result = validate();
    if (!result.ok) {
      setStatus('error', 'Revisa los campos marcados. Tu solicitud aún no se envió.');
      result.firstInvalid?.focus();
      return;
    }

    submitButton.disabled = true;
    setStatus('pending', 'Intentando guardar tu solicitud…');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(result.payload)
      });

      if (!response.ok) {
        const unavailable = response.status === 404 || response.status === 501 || response.status === 502 || response.status === 503;
        setStatus(
          'error',
          unavailable
            ? 'El servicio de envío aún no está disponible. No pudimos confirmar la recepción; conservamos lo que escribiste para que puedas reintentar más tarde.'
            : 'No pudimos confirmar la recepción de tu solicitud. Conservamos lo que escribiste; intenta de nuevo en unos minutos.'
        );
        return;
      }

      let data = {};
      try {
        data = await response.json();
      } catch {
        setStatus(
          'error',
          'El servidor respondió, pero no pudimos confirmar un identificador. Conservamos lo que escribiste; no afirmamos que la solicitud haya quedado registrada.'
        );
        return;
      }

      const id = data.id || data.requestId;
      if (!id) {
        setStatus(
          'error',
          'El servidor respondió sin identificador. Conservamos lo que escribiste; no afirmamos que la solicitud haya quedado registrada.'
        );
        return;
      }

      setStatus('success', `Recibimos tu solicitud. Identificador: ${id}.`);
      form.reset();
      clearErrors();
    } catch {
      // Fallo de red u otro error antes de una confirmación fiable.
      setStatus(
        'error',
        'No pudimos confirmar la recepción de tu solicitud. Conservamos lo que escribiste; intenta de nuevo cuando haya conexión o el servicio esté disponible.'
      );
    } finally {
      submitButton.disabled = false;
    }
  });
})();
