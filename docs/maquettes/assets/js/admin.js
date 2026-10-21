/* Socle commun du back-office (maquette) : barre latérale, état des pages,
 * notifications et confirmations. Le contenu publié et le brouillon sont
 * conservés dans le stockage local pour que la démo soit cohérente d'un écran
 * à l'autre (dans l'application réelle : SQLite, voir spec 05). */
(function () {
  'use strict';

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const get = (obj, path) => path.reduce((o, k) => (o == null ? o : o[k]), obj);
  const set = (obj, path, value) => {
    const last = path[path.length - 1];
    const parent = path.slice(0, -1).reduce((o, k) => (o[k] ??= {}), obj);
    parent[last] = value;
  };

  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 15h18"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17v.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    desktop: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    mobile: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    save: '<path d="M5 3h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M7 3v6h8M7 21v-7h10v7"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    tag: '<path d="M3 12V3h9l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.5"/>',
    disk: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 16h.01M3 12h18"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-5 4 3 5-7"/>',
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------- Pages éditables ---------- */
  const RACE_LABELS = { 'trail-40': 'Trail 40 km', 'trail-20': 'Trail 20 km', 'trail-13': 'Trail 13 km', randonnee: 'Randonnée', 'marche-solidaire': 'Marche solidaire' };
  const PAGES = [
    { id: 'accueil', label: 'Accueil', kind: 'Page', group: 'pages', icon: 'home', paths: [['home']], href: 'editeur.html?page=accueil' },
    { id: 'infos', label: 'Infos pratiques', kind: 'Page', group: 'pages', icon: 'info', paths: [['infos']], href: 'editeur.html?page=infos' },
    ...RACE_ORDER.map((slug) => ({ id: `epreuve:${slug}`, label: RACE_LABELS[slug], kind: 'Épreuve', group: 'races', icon: 'flag', paths: [['races', slug]], href: `editeur.html?page=epreuve&slug=${slug}`, slug })),
    { id: 'legal:mentions-legales', label: 'Mentions légales', kind: 'Page légale', group: 'pages', icon: 'doc', paths: [['pages', 'mentions-legales']], href: 'editeur.html?page=legal&slug=mentions-legales' },
    { id: 'legal:confidentialite', label: 'Confidentialité', kind: 'Page légale', group: 'pages', icon: 'doc', paths: [['pages', 'confidentialite']], href: 'editeur.html?page=legal&slug=confidentialite' },
    { id: 'communs', label: 'Header, footer et paramètres', kind: 'Éléments communs', group: 'common', icon: 'layout', paths: [['header'], ['footer'], ['settings']], href: 'editeur.html?page=communs' },
  ];

  /* ---------- État ---------- */
  const state = {
    published: DemoStore.published(),
    draft: DemoStore.draft() || DemoStore.published(),
    meta: DemoStore.read('maquette.v2.meta') || {},
  };
  const pageById = (id) => PAGES.find((p) => p.id === id);
  const differs = (a, b, paths) => paths.some((p) => JSON.stringify(get(a, p)) !== JSON.stringify(get(b, p)));
  function pageStatus(page) {
    return differs(state.draft, state.published, page.paths) ? 'draft' : 'published';
  }
  function saveDraft(next, pageId) {
    state.draft = clone(next);
    DemoStore.write('maquette.v2.draft', state.draft);
    state.meta[pageId] = { ...(state.meta[pageId] || {}), savedBy: user(), savedAt: new Date().toISOString() };
    DemoStore.write('maquette.v2.meta', state.meta);
  }
  function publish(next, page) {
    saveDraft(next, page.id);
    page.paths.forEach((p) => set(state.published, p, clone(get(state.draft, p))));
    DemoStore.write('maquette.v2.published', state.published);
    state.meta[page.id] = { ...state.meta[page.id], publishedBy: user(), publishedAt: new Date().toISOString() };
    DemoStore.write('maquette.v2.meta', state.meta);
  }

  function user() {
    try { return sessionStorage.getItem('maquette.user') || 'Léa'; } catch (e) { return 'Léa'; }
  }
  function when(iso) {
    if (!iso) return '';
    const d = new Date(iso), now = new Date();
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return `aujourd'hui à ${time}`;
    return `le ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${time}`;
  }

  /* ---------- Barre latérale ---------- */
  function renderSidebar(activeId) {
    const el = document.getElementById('sidebar');
    if (!el) return;
    const link = (p, sub) => {
      const dot = pageStatus(p) === 'draft' ? '<span class="dot" title="Modifications non publiées"></span><span class="visually-hidden">(modifications non publiées)</span>' : '';
      return `<li><a href="${p.href}"${p.id === activeId ? ' aria-current="page"' : ''}>${sub ? '' : icon(p.icon)}${p.label}${dot}</a></li>`;
    };
    el.innerHTML = `
      <a class="sidebar-brand" href="tableau-de-bord.html"><img src="../assets/img/logo.svg" alt=""><div><strong>Trail de Bessèges</strong><span>Back-office</span></div></a>
      <nav aria-label="Back-office">
        <ul><li><a href="tableau-de-bord.html"${activeId === 'dashboard' ? ' aria-current="page"' : ''}>${icon('dashboard')}Tableau de bord</a></li></ul>
        <div class="nav-group"><span>Pages</span><ul>
          ${link(pageById('accueil'))}
          ${link(pageById('infos'))}
          <li><span style="display:flex;gap:10px;padding:9px 10px;font-size:.92rem;font-weight:500">${icon('flag')}Épreuves</span>
            <ul class="sub-list">${PAGES.filter((p) => p.group === 'races').map((p) => link(p, true)).join('')}</ul></li>
          ${link(pageById('legal:mentions-legales'))}
          ${link(pageById('legal:confidentialite'))}
        </ul></div>
        <div class="nav-group"><span>Éléments communs</span><ul>${link(pageById('communs'))}</ul></div>
      </nav>
      <div class="sidebar-user">
        <div class="user-chip"><span class="avatar" aria-hidden="true">${user()[0]}</span><div><strong style="display:block;font-size:.9rem">${user()}</strong><span style="font-size:.75rem;opacity:.75">Éditrice</span></div></div>
        <ul>
          <li><button class="nav-link" type="button" data-mock="Mon compte : modifier son prénom et son mot de passe (spec 08, AUT-10).">${icon('user')}Mon compte</button></li>
          <li><a href="../site/index.html" target="_blank" rel="noopener">${icon('globe')}Voir le site<span class="visually-hidden"> (nouvel onglet)</span></a></li>
          <li><a href="connexion.html">${icon('logout')}Se déconnecter</a></li>
        </ul>
      </div>`;
    el.querySelectorAll('[data-mock]').forEach((b) => b.addEventListener('click', () => toast('Hors maquette. ' + b.dataset.mock, 'info')));
  }

  /* ---------- Notifications et confirmations ---------- */
  function toast(message, type = 'ok') {
    let box = document.querySelector('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' error' : '');
    t.innerHTML = icon(type === 'error' ? 'alert' : type === 'info' ? 'eye' : 'check');
    const span = document.createElement('span'); span.textContent = message; t.appendChild(span);
    box.appendChild(t);
    setTimeout(() => t.remove(), 4200);
  }
  function confirmDialog({ title, text, ok = 'Confirmer', danger = false }) {
    return new Promise((resolve) => {
      const d = document.createElement('dialog');
      d.className = 'modal';
      d.innerHTML = `<div class="modal-body"><h2></h2><p></p></div>
        <div class="modal-actions"><button class="btn" value="cancel" type="button">Annuler</button><button class="btn ${danger ? 'btn-danger' : 'btn-accent'}" type="button" value="ok"></button></div>`;
      d.querySelector('h2').textContent = title;
      d.querySelector('p').textContent = text;
      d.querySelector('[value="ok"]').textContent = ok;
      document.body.appendChild(d);
      let done = false;
      const finish = (okay) => { if (done) return; done = true; resolve(okay); d.remove(); };
      d.addEventListener('click', (e) => { const v = e.target.closest('button')?.value; if (v) { d.close(v); finish(v === 'ok'); } });
      d.addEventListener('close', () => finish(d.returnValue === 'ok'));
      d.showModal();
      d.querySelector('[value="ok"]').focus();
    });
  }

  window.Admin = { clone, get, set, icon, PAGES, RACE_LABELS, state, pageById, pageStatus, saveDraft, publish, differs, user, when, renderSidebar, toast, confirmDialog };
})();
