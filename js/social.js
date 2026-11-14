(() => {
  /**
   * Cuentas oficiales Salvación M.
   * Actualiza solo las URLs cuando existan los perfiles reales.
   */
  const SOCIAL_LINKS = [
    {
      id: 'facebook',
      label: 'Facebook de Salvación M',
      href: 'https://www.facebook.com/salvacionm',
      path: 'M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.6l.4-3H14V9c0-.3.2-.5.5-.5H14z'
    },
    {
      id: 'instagram',
      label: 'Instagram de Salvación M',
      href: 'https://www.instagram.com/salvacionm',
      path: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7zm5 2.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zm16.5 5.5a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3z'
    },
    {
      id: 'pinterest',
      label: 'Pinterest de Salvación M',
      href: 'https://www.pinterest.com/salvacionm',
      path: 'M12 3a9 9 0 0 0-3.3 17.4c-.1-.7-.2-1.8 0-2.6.2-.7 1.3-5.4 1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.5-.3 1.1.5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.3 0-2.2-1.5-3.8-4.2-3.8-3.1 0-5 2.3-5 4.8 0 .9.3 1.5.7 2 .1.1.1.2.1.3l-.3 1c0 .2-.1.2-.3.1-1.3-.6-1.9-2.1-1.9-3.8 0-2.8 2.4-6.2 7.1-6.2 3.8 0 6.3 2.7 6.3 5.7 0 3.9-2.2 6.8-5.4 6.8-1.1 0-2.1-.6-2.4-1.3l-.7 2.5c-.2.9-.9 2-1.3 2.7A9 9 0 1 0 12 3z'
    },
    {
      id: 'tiktok',
      label: 'TikTok de Salvación M',
      href: 'https://www.tiktok.com/@salvacionm',
      path: 'M14.5 3h2.1c.2 1.5 1.1 2.8 2.4 3.5v2.3a6.4 6.4 0 0 1-2.5-.7v5.6a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.4a3.2 3.2 0 1 0 2.3 3.1V3z'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn de Salvación M',
      href: 'https://www.linkedin.com/company/salvacionm',
      path: 'M6.2 9.3H3.6V20h2.6V9.3zM4.9 4A1.5 1.5 0 1 0 4.9 7a1.5 1.5 0 0 0 0-3zM20.4 20h-2.6v-5.6c0-1.5-.5-2.5-1.8-2.5-1 0-1.5.7-1.8 1.3-.1.2-.1.5-.1.8V20h-2.6s0-9.2 0-10.7h2.6v1.7c.4-.7 1.3-1.9 3.3-1.9 2.4 0 4.1 1.6 4.1 4.9V20z'
    }
  ];

  function renderIcon(path) {
    return `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="${path}"/></svg>`;
  }

  function renderList() {
    return SOCIAL_LINKS.map((item) => (
      `<li>`
      + `<a href="${item.href}" target="_blank" rel="noopener noreferrer" data-network="${item.id}" aria-label="${item.label}">`
      + renderIcon(item.path)
      + `</a>`
      + `</li>`
    )).join('');
  }

  document.querySelectorAll('[data-social-links]').forEach((nav) => {
    let list = nav.querySelector('ul');
    if (!list) {
      list = document.createElement('ul');
      nav.appendChild(list);
    }
    list.innerHTML = renderList();
  });
})();
