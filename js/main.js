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

(() => {
  const form = document.getElementById('orientacion-form');
  if (!form) return;

  const status = document.getElementById('contacto-estado');
  const errorBox = document.getElementById('contacto-errores');
  const errorList = errorBox?.querySelector('ul');
  const reviewButton = form.querySelector('.contacto-revisar');
  const submitButton = form.querySelector('.contacto-enviar');

  const fields = {
    nombre: document.getElementById('contacto-nombre'),
    email: document.getElementById('contacto-email'),
    telefono: document.getElementById('contacto-telefono'),
    ciudad: document.getElementById('contacto-ciudad'),
    descripcion: document.getElementById('contacto-descripcion'),
    consentimiento: document.getElementById('contacto-consentimiento')
  };

  function setFieldError(id, message) {
    const error = document.getElementById(`${id}-error`);
    const control = document.getElementById(id) || form.querySelector(`input[name="${id}"]`);
    if (!error) return;
    if (message) {
      error.hidden = false;
      error.textContent = message;
      if (control) control.setAttribute('aria-invalid', 'true');
    } else {
      error.hidden = true;
      error.textContent = '';
      if (control) control.removeAttribute('aria-invalid');
    }
  }

  function clearErrors() {
    ['contacto-nombre', 'contacto-email', 'contacto-telefono', 'contacto-ciudad', 'contacto-descripcion', 'contacto-servicio', 'contacto-consentimiento']
      .forEach((id) => setFieldError(id, ''));
    if (errorBox) errorBox.hidden = true;
    if (errorList) errorList.innerHTML = '';
  }

  function validate() {
    clearErrors();
    const issues = [];
    let firstInvalid = null;

    const nombre = String(fields.nombre?.value || '').trim();
    const email = String(fields.email?.value || '').trim();
    const telefono = String(fields.telefono?.value || '').trim();
    const ciudad = String(fields.ciudad?.value || '').trim();
    const descripcion = String(fields.descripcion?.value || '').trim();
    const servicio = form.querySelector('input[name="servicio"]:checked');
    const consentimiento = Boolean(fields.consentimiento?.checked);

    if (nombre.length < 3) {
      setFieldError('contacto-nombre', 'Escribe tu nombre completo (mínimo 3 caracteres).');
      issues.push('Nombre completo');
      firstInvalid ??= fields.nombre;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('contacto-email', 'Escribe un correo electrónico válido.');
      issues.push('Correo electrónico');
      firstInvalid ??= fields.email;
    }

    if (telefono) {
      const digits = telefono.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        setFieldError('contacto-telefono', 'Si indicas teléfono, usa entre 7 y 15 dígitos.');
        issues.push('Teléfono');
        firstInvalid ??= fields.telefono;
      }
    }

    if (ciudad && ciudad.length < 2) {
      setFieldError('contacto-ciudad', 'Si indicas ciudad, escribe al menos 2 caracteres.');
      issues.push('Ciudad');
      firstInvalid ??= fields.ciudad;
    }

    if (!servicio) {
      setFieldError('contacto-servicio', 'Selecciona el servicio solicitado.');
      issues.push('Servicio solicitado');
      firstInvalid ??= form.querySelector('input[name="servicio"]');
    }

    if (descripcion.length < 20) {
      setFieldError('contacto-descripcion', 'Describe un poco más tu situación (mínimo 20 caracteres).');
      issues.push('Descripción');
      firstInvalid ??= fields.descripcion;
    }

    if (!consentimiento) {
      setFieldError('contacto-consentimiento', 'Debes aceptar el aviso de privacidad para continuar.');
      issues.push('Autorización de datos');
      firstInvalid ??= fields.consentimiento;
    }

    if (issues.length && errorBox && errorList) {
      errorList.innerHTML = issues.map((item) => `<li>${item}</li>`).join('');
      errorBox.hidden = false;
    }

    return { ok: issues.length === 0, firstInvalid };
  }

  function showStatus(type, message) {
    if (!status) return;
    status.className = `contacto-estado${type ? ` is-${type}` : ''}`;
    status.textContent = message;
  }

  reviewButton?.addEventListener('click', () => {
    const result = validate();
    if (!result.ok) {
      showStatus('error', 'Hay campos por corregir. No se envió ninguna solicitud.');
      result.firstInvalid?.focus();
      errorBox?.focus();
      return;
    }
    showStatus(
      'ok',
      'Los campos están completos. El envío permanece deshabilitado hasta que exista persistencia segura en el servidor.'
    );
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    // method=dialog + botón deshabilitado: defensa en profundidad.
    showStatus(
      'error',
      'El envío no está disponible todavía. Usa “Revisar campos sin enviar”. No se almacenó ninguna solicitud.'
    );
    if (submitButton) submitButton.disabled = true;
  });
})();
