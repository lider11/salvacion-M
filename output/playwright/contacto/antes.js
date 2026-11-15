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
