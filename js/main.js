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
  const section = document.querySelector('[data-hero-parallax]');
  const media = section?.querySelector('.hero-parallax-media');
  if (!section || !media) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;

  function updateParallax() {
    ticking = false;
    if (reduceMotion.matches) {
      section.style.setProperty('--parallax-y', '0px');
      section.style.setProperty('--hero-photo', '0');
      section.style.setProperty('--hero-veil', '1');
      section.style.setProperty('--hero-content', '1');
      return;
    }

    const rect = section.getBoundingClientRect();
    const travel = Math.max(rect.height - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, -rect.top / travel));
    // Ease mid-scroll so the photo reads first, then yields to the hero.
    const eased = progress * progress * (3 - 2 * progress);
    const shift = (progress - 0.5) * Math.min(100, window.innerHeight * 0.12);
    const photo = Math.max(0, 1 - eased * 1.15);
    const veil = 0.22 + eased * 0.78;
    const content = 0.12 + eased * 0.88;

    section.style.setProperty('--parallax-y', `${shift.toFixed(1)}px`);
    section.style.setProperty('--hero-photo', photo.toFixed(3));
    section.style.setProperty('--hero-veil', veil.toFixed(3));
    section.style.setProperty('--hero-content', content.toFixed(3));
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  reduceMotion.addEventListener('change', requestUpdate);
  updateParallax();
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
  const contactTitle = document.getElementById('contacto-titulo');

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

  function showStatus(type, message) {
    if (!status) return;
    status.hidden = false;
    status.className = `contacto-estado${type ? ` is-${type}` : ''}`;
    status.textContent = message;
  }

  function selectServicio(value) {
    if (!value) return;
    const radio = form.querySelector(`input[name="servicio"][value="${CSS.escape(value)}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function goToContact() {
    const section = document.getElementById('contacto');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    contactTitle?.focus({ preventScroll: true });
  }

  function addIssue(issues, label, targetId, control) {
    issues.push({ label, targetId });
    return control;
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
      const control = addIssue(issues, 'Nombre completo', 'contacto-nombre', fields.nombre);
      firstInvalid ??= control;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('contacto-email', 'Escribe un correo electrónico válido.');
      const control = addIssue(issues, 'Correo electrónico', 'contacto-email', fields.email);
      firstInvalid ??= control;
    }

    if (telefono) {
      const digits = telefono.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        setFieldError('contacto-telefono', 'Si indicas teléfono, usa entre 7 y 15 dígitos.');
        const control = addIssue(issues, 'Teléfono', 'contacto-telefono', fields.telefono);
        firstInvalid ??= control;
      }
    }

    if (ciudad && ciudad.length < 2) {
      setFieldError('contacto-ciudad', 'Si indicas ciudad, escribe al menos 2 caracteres.');
      const control = addIssue(issues, 'Ciudad', 'contacto-ciudad', fields.ciudad);
      firstInvalid ??= control;
    }

    if (!servicio) {
      setFieldError('contacto-servicio', 'Elige la dificultad que mejor describe tu caso.');
      const firstServicio = form.querySelector('#contacto-servicio-negacion') || form.querySelector('input[name="servicio"]');
      const control = addIssue(issues, 'Dificultad que enfrentas', 'contacto-servicio-negacion', firstServicio);
      firstInvalid ??= control;
    }

    if (descripcion.length < 20) {
      setFieldError('contacto-descripcion', 'Cuéntanos un poco más (mínimo 20 caracteres), sin datos clínicos.');
      const control = addIssue(issues, 'Descripción', 'contacto-descripcion', fields.descripcion);
      firstInvalid ??= control;
    }

    if (!consentimiento) {
      setFieldError('contacto-consentimiento', 'Marca la casilla si aceptas el aviso de privacidad.');
      const control = addIssue(issues, 'Autorización de datos', 'contacto-consentimiento', fields.consentimiento);
      firstInvalid ??= control;
    }

    if (issues.length && errorBox && errorList) {
      errorList.innerHTML = issues.map((item) => (
        `<li><a href="#${item.targetId}">${item.label}</a></li>`
      )).join('');
      errorBox.hidden = false;
    }

    return { ok: issues.length === 0, firstInvalid };
  }

  errorList?.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !errorList.contains(link)) return;
    const id = link.getAttribute('href')?.slice(1);
    const control = id ? document.getElementById(id) : null;
    if (!control) return;
    event.preventDefault();
    control.focus();
  });

  document.querySelectorAll('.servicio-enlace[data-servicio]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      selectServicio(link.getAttribute('data-servicio'));
      if (window.location.hash !== '#contacto') window.location.hash = 'contacto';
      goToContact();
    });
  });

  reviewButton?.addEventListener('click', () => {
    const result = validate();
    if (!result.ok) {
      showStatus('error', 'Hay campos por corregir. No enviamos nada todavía.');
      (errorBox?.hidden === false ? errorBox : result.firstInvalid)?.focus();
      return;
    }
    showStatus(
      'ok',
      'Tus datos están listos para cuando abramos el envío en línea. Mientras tanto puedes escribirnos o llamarnos con la información que preparaste.'
    );
    reviewButton.focus();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    showStatus(
      'error',
      'El envío en línea aún no está disponible. Usa “Revisar mi solicitud” o contáctanos por teléfono o correo. No guardamos ninguna solicitud desde este formulario.'
    );
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.hidden = true;
    }
  });
})();
