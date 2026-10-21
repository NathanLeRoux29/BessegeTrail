/* Éditeur de pages (maquette, spec 06) : aperçu à gauche, formulaire à droite.
 * Les formulaires sont générés à partir d'une configuration par page, comme le
 * seront les formulaires Nuxt générés depuis les schémas Zod. */
(function () {
  'use strict';
  const { clone, get, set, icon, state } = Admin;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Page courante ---------- */
  const P = new URLSearchParams(location.search);
  const kind = P.get('page') || 'accueil';
  const slug = P.get('slug');
  const pageId = kind === 'epreuve' ? `epreuve:${slug}` : kind === 'legal' ? `legal:${slug}` : kind;
  const page = Admin.pageById(pageId) || Admin.pageById('accueil');

  /* ---------- Configuration des formulaires ---------- */
  const T = (k, label, o = {}) => ({ type: 'text', k, label, ...o });
  const TARGETS = ['#presentation', '#epreuves', '#galerie', '#benevoles', '#partenaires', '#contact', 'infos-pratiques.html', 'infos-pratiques.html#faq', ...RACE_ORDER.map((s) => `epreuve.html?epreuve=${s}`)];
  const ICON_OPTIONS = [['lieu', 'Lieu'], ['parking', 'Parking'], ['dossard', 'Dossard'], ['horaire', 'Horaire'], ['douche', 'Douche'], ['restauration', 'Restauration'], ['info', 'Information']];

  function config() {
    if (page.id === 'accueil') {
      const h = (k) => ['home', k];
      return {
        title: 'Accueil', preview: '../site/index.html?apercu=1', sections: [
          { key: 'hero', base: h('hero'), label: 'Bannière', focus: 'home.hero', fields: [
            { type: 'image', k: 'image', label: 'Image de fond', decorative: true, help: 'Photo paysage, au moins 1 600 px de large. Elle est assombrie automatiquement pour que le texte reste lisible.' },
            { type: 'textarea', k: 'subtitle', label: 'Sous-titre', max: 200, rows: 3 },
            { type: 'row', fields: [T('cta.label', 'Texte du bouton', { max: 30, required: true }), { type: 'url', k: 'cta.url', label: 'Lien du bouton', required: true }] },
            { type: 'toggle', k: 'showCountdown', label: 'Afficher le compte à rebours', help: 'Calculé à partir de la date de départ (Paramètres généraux).' },
            T('afterText', 'Texte affiché après le départ', { max: 80, help: 'Remplace le compte à rebours une fois la course passée.' }),
          ] },
          { key: 'presentation', base: h('presentation'), label: 'Présentation', focus: 'home.presentation', hideable: true, fields: [
            T('title', 'Titre', { max: 80, required: true }), { type: 'rich', k: 'text', label: 'Texte' }, { type: 'image', k: 'image', label: 'Image (facultative)' },
          ] },
          { key: 'epreuves', base: h('epreuves'), label: 'Les épreuves', focus: 'home.epreuves', fields: [
            T('title', 'Titre', { max: 80, required: true }), { type: 'textarea', k: 'intro', label: "Texte d'introduction", max: 200, rows: 2 }, { type: 'racelinks' },
          ] },
          { key: 'galerie', base: h('galerie'), label: 'Galerie', focus: 'home.galerie', hideable: true, fields: [
            T('title', 'Titre', { max: 80, required: true }),
            { type: 'list', k: 'photos', label: 'Photos', itemName: 'photo', itemTitle: (it) => it.alt || 'Nouvelle photo', max: 30, collapsed: true,
              newItem: () => ({ src: '', alt: '' }), fields: [{ type: 'image', k: '', label: 'Photo', self: true }] },
          ] },
          { key: 'benevoles', base: h('benevoles'), label: 'Bénévoles', focus: 'home.benevoles', hideable: true, fields: [
            T('title', 'Titre', { max: 80, required: true }), { type: 'rich', k: 'text', label: 'Texte' }, { type: 'image', k: 'image', label: 'Image (facultative)' },
            { type: 'row', fields: [T('button.label', 'Texte du bouton', { max: 30 }), { type: 'url', k: 'button.url', label: 'Lien du formulaire', help: 'Ex. Google Forms. Vide : pas de bouton.' }] },
          ] },
          { key: 'partenaires', base: h('partenaires'), label: 'Partenaires', focus: 'home.partenaires', hideable: true, fields: [
            T('title', 'Titre', { max: 80, required: true }),
            { type: 'list', k: 'items', label: 'Partenaires', itemName: 'partenaire', itemTitle: (it) => it.name || 'Nouveau partenaire', max: 40, collapsed: true,
              newItem: () => ({ name: '', logo: '', url: '' }),
              fields: [T('name', 'Nom', { max: 60, required: true, help: 'Sert aussi de texte alternatif du logo.' }), { type: 'image', k: 'logo', label: 'Logo', mode: 'string', logo: true }, { type: 'url', k: 'url', label: 'Site du partenaire (facultatif)' }] },
          ] },
          { key: 'contact', base: h('contact'), label: 'Contact', focus: 'home.contact', hideable: true, fields: [
            T('title', 'Titre', { max: 80, required: true }), { type: 'textarea', k: 'text', label: "Texte d'introduction", max: 240, rows: 3 },
            { type: 'note', html: `L'adresse e-mail et les réseaux sociaux se modifient dans <a href="editeur.html?page=communs">Paramètres généraux</a>.` },
          ] },
        ],
      };
    }
    if (page.id === 'infos') {
      const i = (k) => ['infos', k];
      return {
        title: 'Infos pratiques', preview: '../site/infos-pratiques.html?apercu=1', sections: [
          { key: 'page', base: i('page'), label: 'En-tête de la page', focus: 'infos.page', fields: [
            T('title', 'Titre de la page', { max: 60, required: true }), { type: 'textarea', k: 'intro', label: "Texte d'introduction", max: 240, rows: 3 },
          ] },
          { key: 'pratiques', base: i('pratiques'), label: 'Sur place', focus: 'infos.pratiques', hideable: true, fields: [
            T('title', 'Titre', { max: 80, required: true }),
            { type: 'list', k: 'items', label: "Blocs d'information", itemName: 'bloc', itemTitle: (it) => it.title || 'Nouveau bloc', max: 9,
              newItem: () => ({ icon: 'info', title: '', text: '' }),
              fields: [{ type: 'select', k: 'icon', label: 'Icône', options: ICON_OPTIONS }, T('title', 'Titre', { max: 40, required: true }), { type: 'textarea', k: 'text', label: 'Texte', max: 200, rows: 3 }] },
            T('address', 'Adresse du lieu de départ', { max: 120 }),
            { type: 'url', k: 'mapUrl', label: 'Lien « Voir sur la carte »', help: 'Copiez le lien de partage Google Maps ou OpenStreetMap.' },
            { type: 'file', k: 'rules', label: 'Règlement (PDF)', accept: '.pdf,application/pdf', ext: 'pdf', maxMo: 10, mode: 'object' },
          ] },
          { key: 'faq', base: i('faq'), label: 'Questions fréquentes', focus: 'infos.faq', hideable: true, fields: [
            T('title', 'Titre', { max: 80, required: true }),
            { type: 'list', k: 'items', label: 'Questions', itemName: 'question', itemTitle: (it) => it.q || 'Nouvelle question', max: 30, collapsed: true,
              newItem: () => ({ q: '', a: '' }), fields: [T('q', 'Question', { max: 120, required: true }), { type: 'rich', k: 'a', label: 'Réponse' }] },
          ] },
        ],
      };
    }
    if (page.id === 'communs') {
      return {
        title: 'Header, footer et paramètres', preview: '../site/index.html?apercu=1', sections: [
          { key: 'settings', base: ['settings'], label: 'Paramètres généraux', focus: 'home.hero', fields: [
            T('eventName', "Nom de l'événement", { max: 60, required: true }),
            { type: 'row', fields: [T('edition', 'Édition', { max: 30, help: 'Ex. « 1re édition »' }), T('place', 'Lieu', { max: 60 })] },
            { type: 'row', fields: [{ type: 'datetime', k: 'startDate', label: 'Date et heure du premier départ', required: true, help: 'Utilisée par le compte à rebours.' }, T('dateLabel', 'Date affichée', { max: 40 })] },
            { type: 'email', k: 'email', label: 'E-mail de contact', required: true },
            { type: 'url', k: 'registerUrl', label: "Lien d'inscription général" },
            { type: 'group', label: 'Réseaux sociaux', help: 'Laisser vide pour masquer un réseau.', fields: [
              { type: 'url', k: 'socials.facebook', label: 'Facebook' }, { type: 'url', k: 'socials.instagram', label: 'Instagram' },
              { type: 'url', k: 'socials.strava', label: 'Strava' }, { type: 'url', k: 'socials.youtube', label: 'YouTube' }] },
            { type: 'group', label: 'Référencement (Google)', fields: [
              T('seoTitle', "Titre de l'accueil dans Google", { max: 70 }), { type: 'textarea', k: 'seoDescription', label: 'Description dans Google', max: 160, rows: 3 }] },
          ] },
          { key: 'header', base: ['header'], label: 'Header', focus: 'header', fields: [
            { type: 'image', k: 'logo', label: 'Logo', logo: true },
            T('title', 'Titre du site', { max: 40, required: true }),
            { type: 'list', k: 'menu', label: 'Menu', itemName: 'lien', itemTitle: (it) => it.label || 'Nouveau lien', max: 8, collapsed: true,
              newItem: () => ({ label: '', target: '#' }),
              fields: [T('label', 'Libellé', { max: 25, required: true }), { type: 'target', k: 'target', label: 'Destination', help: 'Choisissez dans la liste : une section de l\u2019accueil, la page Infos pratiques, une épreuve, ou un lien https://' }] },
            { type: 'row', fields: [T('cta.label', 'Texte du bouton', { max: 20, required: true }), { type: 'url', k: 'cta.url', label: 'Lien du bouton', required: true }] },
          ] },
          { key: 'footer', base: ['footer'], label: 'Footer', focus: 'footer', fields: [
            T('association', "Nom de l'association", { max: 80 }), T('text', 'Texte de bas de page', { max: 120 }),
          ] },
        ],
      };
    }
    if (page.id.startsWith('epreuve:')) {
      const b = ['races', slug], f = `race.${slug}`;
      return {
        title: Admin.RACE_LABELS[slug], preview: `../site/epreuve.html?epreuve=${slug}&apercu=1`, sections: [
          { key: 'general', base: b, label: 'Informations générales', focus: f, hideable: true, fields: [
            T('name', "Nom de l'épreuve", { max: 40, required: true }),
            { type: 'row', fields: [{ type: 'select', k: 'type', label: 'Type', options: [['Trail', 'Trail'], ['Randonnée', 'Randonnée'], ['Marche', 'Marche']] }, T('start', 'Départ', { max: 40, help: 'Ex. « Samedi 17 avril, 7 h 30 »' })] },
            { type: 'row', fields: [{ type: 'number', k: 'distance', label: 'Distance (km)', required: true }, { type: 'number', k: 'dplus', label: 'Dénivelé positif (m)' }] },
            T('price', 'Tarif', { max: 80, help: 'Texte libre, ex. « 25 € en ligne, 30 € sur place »' }),
            { type: 'image', k: 'image', label: 'Image de bannière et de carte', mode: 'string', decorative: true },
          ] },
          { key: 'parcours', base: b, label: 'Parcours', focus: f, fields: [
            { type: 'rich', k: 'description', label: 'Description' }, { type: 'rich', k: 'extra', label: 'Informations complémentaires', help: 'Ravitaillements, barrières horaires, matériel obligatoire…' },
            { type: 'image', k: 'trace', label: 'Image du tracé', mode: 'string', help: 'Export image depuis OpenRunner, Visorando…' },
            { type: 'image', k: 'profil', label: 'Image du profil', mode: 'string' },
            { type: 'file', k: 'gpx', label: 'Fichier GPX', accept: '.gpx', ext: 'gpx', maxMo: 5, mode: 'string' },
          ] },
          { key: 'liens', base: b, label: 'Inscription et résultats', focus: f, fields: [
            { type: 'url', k: 'registerUrl', label: "Lien d'inscription", help: 'Vide : le bouton « S’inscrire » est masqué.' },
            { type: 'url', k: 'resultsUrl', label: 'Lien des résultats', help: 'À renseigner après la course. Vide : bouton masqué.' },
          ] },
        ],
      };
    }
    const b = ['pages', slug];
    return {
      title: page.label, preview: `../site/page-legale.html?page=${slug}&apercu=1`, sections: [
        { key: 'contenu', base: b, label: 'Contenu', focus: `page.${slug}`, fields: [
          T('title', 'Titre', { max: 80, required: true }), { type: 'rich', k: 'text', label: 'Texte', rows: 14, help: 'Intertitres : commencez la ligne par « ### ».' },
        ] },
      ],
    };
  }

  const CFG = config();
  let working = clone(state.draft);
  const snapshot = () => JSON.stringify(page.paths.map((p) => get(working, p)));
  let saved = snapshot();
  let openKey = CFG.sections[0].key;
  let showErrors = false;
  const touched = new Set();
  const path = (base, k) => (k ? base.concat(k.split('.')) : base);

  /* ---------- Validation ---------- */
  function check(field, value, item) {
    const v = value == null ? '' : value;
    if (field.type === 'image' && field.self) {
      if (!item.src) return 'Ajoutez une photo.';
      if (!String(item.alt || '').trim()) return 'Décrivez la photo pour les personnes malvoyantes.';
      return '';
    }
    if (field.type === 'image' && !field.decorative && !field.logo && field.mode !== 'string') {
      if (v && v.src && !String(v.alt || '').trim()) return 'Décrivez l’image pour les personnes malvoyantes (texte alternatif).';
      return '';
    }
    if (typeof v === 'object') return '';
    const s = String(v).trim();
    if (field.required && !s) return 'Ce champ est obligatoire.';
    if (field.max && s.length > field.max) return `${field.max} caractères maximum (actuellement ${s.length}).`;
    if (field.type === 'url' && s && !/^(https:\/\/|mailto:)\S+$/.test(s)) return 'Le lien doit commencer par https://';
    if (field.type === 'email' && s && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) return 'Adresse e-mail invalide.';
    if (field.type === 'target' && s && !/^(#\w+|infos-pratiques\.html(#\w+)?|epreuve\.html\?epreuve=[\w-]+|https:\/\/\S+)$/.test(s)) return 'Indiquez une section (#galerie), une page, une épreuve, ou un lien https://';
    if (field.type === 'number' && s && !(Number(s) >= 0)) return 'Indiquez un nombre positif.';
    return '';
  }
  /* Parcourt tous les champs (y compris ceux des listes) avec leur chemin. */
  function walk(fields, base, cb) {
    fields.forEach((f) => {
      if (f.type === 'row' || f.type === 'group') return walk(f.fields, base, cb);
      if (f.type === 'list') {
        const p = path(base, f.k);
        (get(working, p) || []).forEach((item, i) => walk(f.fields, p.concat([i]), (ff, pp) => cb(ff, pp, item)));
        return;
      }
      if (['note', 'racelinks'].includes(f.type)) return;
      cb(f, f.self ? base : path(base, f.k), null);
    });
  }
  function errors() {
    const out = [];
    CFG.sections.forEach((s) => walk(s.fields, s.base, (f, p, item) => {
      const msg = check(f, get(working, p), item || get(working, p));
      if (msg) out.push({ section: s.key, id: JSON.stringify(p), msg });
    }));
    return out;
  }

  /* ---------- Rendu des champs ---------- */
  const fid = (p) => 'f-' + p.join('-').replace(/[^\w-]/g, '_');
  function fieldError(f, p, item) {
    const id = JSON.stringify(p);
    if (!showErrors && !touched.has(id)) return '';
    const msg = check(f, get(working, p), item || get(working, p));
    return msg ? `<p class="error" id="${fid(p)}-err">${icon('alert')}${esc(msg)}</p>` : '';
  }
  function wrap(f, p, inner, item) {
    const err = fieldError(f, p, item);
    const v = get(working, p);
    const counter = f.max ? `<span class="counter${String(v || '').length > f.max ? ' over' : ''}" data-counter="${fid(p)}">${String(v || '').length} / ${f.max}</span>` : '';
    return `<div class="field${err ? ' has-error' : ''}" data-field="${esc(JSON.stringify(p))}">
      <div class="field-row"><label for="${fid(p)}">${esc(f.label)}${f.required ? ' <span aria-hidden="true" style="color:var(--danger)">*</span>' : ''}</label>${counter}</div>
      ${inner}
      ${f.help ? `<p class="help" id="${fid(p)}-help">${esc(f.help)}</p>` : ''}
      <div data-err>${err}</div>
    </div>`;
  }
  function renderField(f, base, item) {
    if (f.type === 'row') return `<div class="grid-2">${f.fields.map((x) => renderField(x, base, item)).join('')}</div>`;
    if (f.type === 'group') return `<fieldset style="border:1px solid var(--border);border-radius:8px;padding:12px 12px 0;margin:0 0 16px"><legend class="field-label" style="padding:0 6px">${esc(f.label)}</legend>${f.help ? `<p class="help muted" style="margin:0 0 10px;font-size:.8rem">${esc(f.help)}</p>` : ''}${f.fields.map((x) => renderField(x, base, item)).join('')}</fieldset>`;
    if (f.type === 'note') return `<p class="help" style="background:var(--info-bg);color:var(--info);padding:10px 12px;border-radius:8px;font-size:.84rem">${f.html}</p>`;
    if (f.type === 'racelinks') {
      return `<div class="field"><span class="field-label">Cartes des épreuves</span><div class="race-links">${RACE_ORDER.map((s) => {
        const r = working.races[s];
        return `<a class="race-link" href="editeur.html?page=epreuve&slug=${s}"><strong>${esc(r.name)} · ${esc(r.distance)} km</strong>${r.visible ? '<span class="badge badge-ok">Visible</span>' : '<span class="badge badge-muted">Masquée</span>'}${icon('chevron')}</a>`;
      }).join('')}</div><p class="help">Chaque épreuve se modifie sur sa propre page.</p></div>`;
    }
    if (f.type === 'list') return renderList(f, base);
    const p = f.self ? base : path(base, f.k);
    const v = get(working, p);
    const attrs = `id="${fid(p)}" data-path="${esc(JSON.stringify(p))}" data-type="${f.type}"${f.help ? ` aria-describedby="${fid(p)}-help"` : ''}`;
    switch (f.type) {
      case 'text': case 'email': case 'number': case 'datetime':
        return wrap(f, p, `<input class="input" ${attrs} type="${{ text: 'text', email: 'email', number: 'number', datetime: 'datetime-local' }[f.type]}" value="${esc(v)}"${f.type === 'number' ? ' min="0" inputmode="numeric"' : ''}>`);
      case 'url':
        return wrap(f, p, `<div class="input-with-action"><input class="input" ${attrs} type="url" placeholder="https://" value="${esc(v)}"><a class="btn btn-sm" href="${esc(v || '#')}" target="_blank" rel="noopener" data-test-link title="Tester le lien (nouvel onglet)">${icon('external')}<span class="visually-hidden">Tester le lien</span></a></div>`);
      case 'target':
        return wrap(f, p, `<input class="input" ${attrs} type="text" list="targets" value="${esc(v)}">`);
      case 'textarea':
        return wrap(f, p, `<textarea class="input" ${attrs} rows="${f.rows || 4}">${esc(v)}</textarea>`);
      case 'rich':
        return wrap(f, p, `<div class="rich-toolbar" role="toolbar" aria-label="Mise en forme">
            <button type="button" data-rich="bold" data-for="${fid(p)}" title="Gras">B</button>
            <button type="button" data-rich="italic" data-for="${fid(p)}" title="Italique"><em>I</em></button>
            <button type="button" data-rich="link" data-for="${fid(p)}" title="Lien">${icon('link').replace('<svg', '<svg width="15" height="15"')}</button>
            <button type="button" data-rich="list" data-for="${fid(p)}" title="Liste à puces">• Liste</button>
            <button type="button" data-rich="title" data-for="${fid(p)}" title="Intertitre">Titre</button>
          </div><textarea class="input" ${attrs} rows="${f.rows || 6}">${esc(v)}</textarea>`);
      case 'select':
        return wrap(f, p, `<select class="input" ${attrs}>${f.options.map(([val, lab]) => `<option value="${esc(val)}"${val === v ? ' selected' : ''}>${esc(lab)}</option>`).join('')}</select>`);
      case 'toggle':
        return `<div class="field"><label class="switch"><input type="checkbox" ${attrs}${v ? ' checked' : ''}><span class="track"></span>${esc(f.label)}</label>${f.help ? `<p class="help">${esc(f.help)}</p>` : ''}</div>`;
      case 'image': return renderImage(f, p, v, item);
      case 'file': return renderFile(f, p, v);
      default: return '';
    }
  }
  function renderImage(f, p, v, item) {
    const isObj = f.mode !== 'string';
    const src = isObj ? (v && v.src) : v;
    const name = src ? (src.startsWith('data:') ? 'image-envoyee.webp' : src.split('/').pop()) : 'Aucune image';
    const altP = p.concat(['alt']);
    const err = fieldError(f, p, item);
    return `<div class="field${err ? ' has-error' : ''}" data-field="${esc(JSON.stringify(p))}">
      <span class="field-label">${esc(f.label)}</span>
      <div class="media-field">
        ${src ? `<img class="media-thumb${f.logo ? ' logo' : ''}" src="${esc(src)}" alt="">` : `<div class="media-thumb" aria-hidden="true"></div>`}
        <div class="media-info">
          <span class="name">${esc(name)}</span>
          <div class="progress" hidden><span></span></div>
          <div class="media-actions">
            <label class="btn btn-sm">${icon('upload')}${src ? 'Remplacer' : 'Ajouter'}<input type="file" accept="image/jpeg,image/png,image/webp${f.logo ? ',image/svg+xml' : ''}" class="visually-hidden" data-image-path="${esc(JSON.stringify(p))}" data-image-mode="${isObj ? 'object' : 'string'}"></label>
            ${src && !f.self ? `<button type="button" class="btn btn-sm btn-ghost btn-danger" data-image-remove="${esc(JSON.stringify(p))}" data-image-mode="${isObj ? 'object' : 'string'}">Retirer</button>` : ''}
          </div>
        </div>
      </div>
      ${isObj && !f.decorative && !f.logo ? `<label class="field-label" for="${fid(altP)}" style="margin-top:8px">Description de l'image</label><input class="input" id="${fid(altP)}" data-path="${esc(JSON.stringify(altP))}" data-type="text" value="${esc(v && v.alt)}" placeholder="Ex. Coureurs sur une crête au lever du soleil">` : ''}
      ${f.help ? `<p class="help">${esc(f.help)}</p>` : ''}
      <p class="help">JPEG, PNG ou WebP, 10 Mo maximum. Convertie et redimensionnée automatiquement.</p>
      <div data-err>${err}</div>
    </div>`;
  }
  function renderFile(f, p, v) {
    const name = f.mode === 'object' ? v && v.name : v;
    const size = f.mode === 'object' && v ? v.size : '';
    return `<div class="field" data-field="${esc(JSON.stringify(p))}">
      <span class="field-label">${esc(f.label)}</span>
      <div class="media-field">
        <div class="file-icon">${f.ext.toUpperCase()}</div>
        <div class="media-info">
          <span class="name">${name ? esc(name) + (size ? ` · ${esc(size)}` : '') : 'Aucun fichier'}</span>
          <div class="media-actions">
            <label class="btn btn-sm">${icon('upload')}${name ? 'Remplacer' : 'Ajouter'}<input type="file" accept="${f.accept}" class="visually-hidden" data-file-path="${esc(JSON.stringify(p))}" data-file-mode="${f.mode}" data-ext="${f.ext}" data-max="${f.maxMo}"></label>
            ${name ? `<button type="button" class="btn btn-sm btn-ghost btn-danger" data-file-remove="${esc(JSON.stringify(p))}" data-file-mode="${f.mode}">Retirer</button>` : ''}
          </div>
        </div>
      </div>
      <p class="help">${f.ext.toUpperCase()}, ${f.maxMo} Mo maximum.</p>
      <div data-err></div>
    </div>`;
  }
  const collapsedItems = new Set();
  function renderList(f, base) {
    const p = path(base, f.k);
    const items = get(working, p) || [];
    const pid = JSON.stringify(p);
    return `<div class="field"><div class="field-row"><span class="field-label">${esc(f.label)}</span><span class="counter">${items.length} / ${f.max}</span></div>
      <div class="list-editor">
        ${items.map((it, i) => {
          const key = pid + i;
          const collapsed = f.collapsed ? !collapsedItems.has('open:' + key) : collapsedItems.has(key);
          return `<div class="list-item${collapsed ? ' collapsed' : ''}">
            <div class="list-item-head">
              <button type="button" class="icon-btn" data-list="toggle" data-list-path="${esc(pid)}" data-i="${i}" data-collapsed-default="${f.collapsed ? 1 : 0}" aria-expanded="${!collapsed}" aria-label="${collapsed ? 'Déplier' : 'Replier'}">${icon(collapsed ? 'chevron' : 'down')}</button>
              ${f.fields[0].type === 'image' && f.fields[0].self && it.src ? `<img src="${esc(it.src)}" alt="" style="width:40px;height:28px;object-fit:cover;border-radius:4px">` : ''}
              <strong>${esc(f.itemTitle(it))}</strong>
              <button type="button" class="icon-btn" data-list="up" data-list-path="${esc(pid)}" data-i="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Monter">${icon('up')}</button>
              <button type="button" class="icon-btn" data-list="down" data-list-path="${esc(pid)}" data-i="${i}" ${i === items.length - 1 ? 'disabled' : ''} aria-label="Descendre">${icon('down')}</button>
              <button type="button" class="icon-btn" data-list="remove" data-list-path="${esc(pid)}" data-i="${i}" data-name="${esc(f.itemName)}" aria-label="Supprimer">${icon('trash')}</button>
            </div>
            <div class="list-item-body">${f.fields.map((x) => renderField(x, p.concat([i]), it)).join('')}</div>
          </div>`;
        }).join('')}
        <button type="button" class="btn btn-sm list-add" data-list="add" data-list-path="${esc(pid)}" ${items.length >= f.max ? 'disabled' : ''}>${icon('plus')}Ajouter un ${esc(f.itemName)}</button>
      </div></div>`;
  }
  const listField = (p) => {
    let found = null;
    CFG.sections.forEach((s) => (function scan(fields, base) {
      fields.forEach((f) => {
        if (f.type === 'row' || f.type === 'group') scan(f.fields, base);
        if (f.type === 'list' && JSON.stringify(path(base, f.k)) === JSON.stringify(p)) found = f;
      });
    })(s.fields, s.base));
    return found;
  };

  /* ---------- Rendu du formulaire ---------- */
  const formEl = () => document.getElementById('form-sections');
  function renderForm() {
    const errs = showErrors ? errors() : [];
    formEl().innerHTML = CFG.sections.map((s) => {
      const open = s.key === openKey;
      const visible = s.hideable ? get(working, s.base.concat(['visible'])) !== false : true;
      const n = errs.filter((e) => e.section === s.key).length;
      return `<section class="acc${open ? ' is-open' : ''}${visible ? '' : ' is-hidden'}" data-acc="${s.key}">
        <div class="acc-head">
          <button class="acc-toggle" type="button" aria-expanded="${open}" aria-controls="acc-${s.key}" data-open="${s.key}">${icon('chevron')}<span class="acc-title">${esc(s.label)}</span>${n ? `<span class="acc-err">${n} erreur${n > 1 ? 's' : ''}</span>` : ''}</button>
          ${s.hideable ? `<label class="switch" title="Afficher ou masquer sur le site"><input type="checkbox" data-visible="${s.key}"${visible ? ' checked' : ''}><span class="track"></span><span>${visible ? 'Visible' : 'Masquée'}</span></label>` : ''}
        </div>
        <div class="acc-body" id="acc-${s.key}"${open ? '' : ' hidden'}>
          ${!visible ? `<div class="hidden-note">${icon('eye')}Cette ${s.key === 'general' ? 'épreuve' : 'section'} est masquée : elle n'apparaîtra pas sur le site.</div>` : ''}
          ${open ? s.fields.map((f) => renderField(f, s.base)).join('') : ''}
        </div>
      </section>`;
    }).join('');
    updateBar();
  }
  function rerenderSection(key) {
    const keep = document.querySelector('.form-pane').scrollTop;
    renderForm();
    document.querySelector('.form-pane').scrollTop = keep;
  }

  /* ---------- Barre du haut ---------- */
  function updateBar() {
    const unsaved = snapshot() !== saved;
    const draft = Admin.differs(working, state.published, page.paths);
    const badge = document.getElementById('status');
    if (unsaved) { badge.className = 'badge badge-warn'; badge.textContent = 'Modifications non enregistrées'; }
    else if (draft) { badge.className = 'badge badge-info'; badge.textContent = 'Brouillon non publié'; }
    else { badge.className = 'badge badge-ok'; badge.textContent = 'Publié'; }
    const m = state.meta[page.id] || {};
    const metaEl = document.getElementById('meta');
    if (draft && m.savedAt) metaEl.textContent = `Brouillon enregistré par ${m.savedBy} ${Admin.when(m.savedAt)}`;
    else if (m.publishedAt) metaEl.textContent = `Publié par ${m.publishedBy} ${Admin.when(m.publishedAt)}`;
    else metaEl.textContent = 'Version initiale (contenu de démonstration)';
    document.getElementById('btn-cancel').disabled = !unsaved && !draft;
    document.getElementById('btn-save').disabled = !unsaved;
    document.getElementById('btn-publish').disabled = !unsaved && !draft;
    const n = showErrors ? errors().length : 0;
    document.getElementById('save-label').textContent = n ? `Enregistrer (${n} erreur${n > 1 ? 's' : ''})` : 'Enregistrer le brouillon';
  }

  /* ---------- Aperçu ---------- */
  const frame = () => document.getElementById('preview');
  let timer = null;
  function sendPreview() {
    clearTimeout(timer);
    timer = setTimeout(() => frame().contentWindow?.postMessage({ source: 'bo', type: 'content', content: working }, '*'), 120);
  }
  function focusPreview() {
    const s = CFG.sections.find((x) => x.key === openKey);
    if (s) frame().contentWindow?.postMessage({ source: 'bo', type: 'focus', section: s.focus }, '*');
  }
  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || m.source !== 'site') return;
    if (m.type === 'ready') { frame().contentWindow.postMessage({ source: 'bo', type: 'content', content: working }, '*'); setTimeout(focusPreview, 50); }
    if (m.type === 'select') {
      const s = CFG.sections.find((x) => x.focus === m.section);
      if (s && s.key !== openKey) { openKey = s.key; renderForm(); focusPreview(); document.querySelector(`[data-acc="${s.key}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    }
  });
  let device = 'desktop';
  function layoutPreview() {
    const stage = document.querySelector('.preview-stage'), wrapEl = document.querySelector('.preview-frame-wrap');
    const W = stage.clientWidth - 32, H = stage.clientHeight - 32;
    stage.classList.toggle('mobile', device === 'mobile');
    if (device === 'desktop') {
      const s = Math.min(1, W / 1280);
      Object.assign(wrapEl.style, { width: '1280px', height: `${H / s}px`, transform: `scale(${s})`, flex: 'none' });
    } else {
      const h = Math.min(844, H), s = Math.min(1, H / 864);
      Object.assign(wrapEl.style, { width: '410px', height: `${Math.max(h / s, 600)}px`, transform: `scale(${s})`, flex: 'none' });
    }
  }

  /* ---------- Événements du formulaire ---------- */
  function onValue(el) {
    const p = JSON.parse(el.dataset.path);
    let v = el.type === 'checkbox' ? el.checked : el.value;
    if (el.dataset.type === 'number') v = el.value === '' ? '' : Number(el.value);
    set(working, p, v);
    touched.add(JSON.stringify(p));
    const field = el.closest('.field');
    const c = field && field.querySelector('[data-counter]');
    if (c) { const max = +c.textContent.split('/ ')[1]; c.textContent = `${String(v).length} / ${max}`; c.classList.toggle('over', String(v).length > max); }
    const link = field && field.querySelector('[data-test-link]');
    if (link) link.href = v || '#';
    sendPreview();
    updateBar();
  }
  function refreshFieldError(el) {
    const field = el.closest('[data-field]');
    if (!field) return;
    const p = JSON.parse(field.dataset.field);
    let def = null, item = null;
    CFG.sections.forEach((s) => walk(s.fields, s.base, (f, pp, it) => { if (JSON.stringify(pp) === JSON.stringify(p)) { def = f; item = it; } }));
    if (!def) return;
    const msg = check(def, get(working, p), item || get(working, p));
    field.classList.toggle('has-error', !!msg);
    field.querySelector('[data-err]').innerHTML = msg ? `<p class="error">${icon('alert')}${esc(msg)}</p>` : '';
  }
  function bindForm() {
    const pane = document.querySelector('.form-pane');
    pane.addEventListener('input', (e) => {
      const el = e.target;
      if (el.dataset.path) { onValue(el); if (touched.has(el.dataset.path) && (showErrors || el.closest('.has-error'))) refreshFieldError(el); }
      if (el.closest('.list-item') && el.closest('.list-item-body')) {
        const head = el.closest('.list-item').querySelector('.list-item-head strong');
        const lp = JSON.parse(el.closest('.list-item').querySelector('[data-list-path]').dataset.listPath);
        const i = +el.closest('.list-item').querySelector('[data-i]').dataset.i;
        const f = listField(lp);
        if (f && head) head.textContent = f.itemTitle(get(working, lp)[i]);
      }
    });
    pane.addEventListener('focusout', (e) => {
      const el = e.target;
      if (el.dataset && el.dataset.path) { touched.add(el.dataset.path); refreshFieldError(el); }
    });
    pane.addEventListener('change', async (e) => {
      const el = e.target;
      if (el.dataset.visible) {
        const s = CFG.sections.find((x) => x.key === el.dataset.visible);
        set(working, s.base.concat(['visible']), el.checked);
        rerenderSection(s.key); sendPreview();
        Admin.toast(el.checked ? `« ${s.label} » sera affichée sur le site.` : `« ${s.label} » sera masquée sur le site.`, 'info');
        return;
      }
      if (el.type === 'checkbox' && el.dataset.path) { onValue(el); return; }
      if (el.tagName === 'SELECT' && el.dataset.path) { onValue(el); return; }
      if (el.dataset.imagePath) return uploadImage(el);
      if (el.dataset.filePath) return uploadFile(el);
    });
    pane.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.open) {
        openKey = openKey === btn.dataset.open ? null : btn.dataset.open;
        renderForm();
        if (openKey) { focusPreview(); document.querySelector(`[data-acc="${openKey}"]`)?.scrollIntoView({ block: 'start' }); }
        return;
      }
      if (btn.dataset.list) return listAction(btn);
      if (btn.dataset.rich) return richAction(btn);
      if (btn.dataset.imageRemove) {
        const p = JSON.parse(btn.dataset.imageRemove);
        set(working, p, btn.dataset.imageMode === 'object' ? { src: '', alt: '' } : '');
        rerenderSection(); sendPreview(); return;
      }
      if (btn.dataset.fileRemove) {
        const p = JSON.parse(btn.dataset.fileRemove);
        set(working, p, btn.dataset.fileMode === 'object' ? { name: '', size: '' } : '');
        rerenderSection(); sendPreview();
      }
    });
  }
  async function listAction(btn) {
    const p = JSON.parse(btn.dataset.listPath);
    const list = get(working, p);
    const i = +btn.dataset.i;
    const f = listField(p);
    const key = btn.dataset.listPath + i;
    switch (btn.dataset.list) {
      case 'toggle': {
        const defCollapsed = btn.dataset.collapsedDefault === '1';
        const k = defCollapsed ? 'open:' + key : key;
        collapsedItems.has(k) ? collapsedItems.delete(k) : collapsedItems.add(k);
        break;
      }
      case 'up': [list[i - 1], list[i]] = [list[i], list[i - 1]]; break;
      case 'down': [list[i + 1], list[i]] = [list[i], list[i + 1]]; break;
      case 'remove':
        if (!(await Admin.confirmDialog({ title: `Supprimer ce ${btn.dataset.name} ?`, text: `« ${f.itemTitle(list[i])} » sera retiré de la page. Vous pourrez annuler tant que la page n'est pas publiée.`, ok: 'Supprimer', danger: true }))) return;
        list.splice(i, 1); break;
      case 'add':
        list.push(f.newItem());
        collapsedItems.add('open:' + btn.dataset.listPath + (list.length - 1));
        break;
    }
    rerenderSection(); sendPreview();
  }
  function richAction(btn) {
    const ta = document.getElementById(btn.dataset.for);
    const a = ta.selectionStart, b = ta.selectionEnd, sel = ta.value.slice(a, b);
    const wrapSel = (pre, post, ph) => {
      const txt = sel || ph;
      ta.setRangeText(pre + txt + post, a, b, 'end');
    };
    switch (btn.dataset.rich) {
      case 'bold': wrapSel('**', '**', 'texte en gras'); break;
      case 'italic': wrapSel('*', '*', 'texte en italique'); break;
      case 'link': {
        const url = prompt('Adresse du lien (https://…)', 'https://');
        if (!url) return;
        wrapSel('[', `](${url})`, 'texte du lien'); break;
      }
      case 'list': ta.setRangeText(`${a && ta.value[a - 1] !== '\n' ? '\n\n' : ''}- ${sel || 'élément de liste'}`, a, b, 'end'); break;
      case 'title': ta.setRangeText(`${a && ta.value[a - 1] !== '\n' ? '\n\n' : ''}### ${sel || 'Intertitre'}\n`, a, b, 'end'); break;
    }
    ta.focus();
    onValue(ta);
  }

  /* Envoi d'image simulé : barre de progression, puis redimensionnement côté
   * navigateur (dans l'application, conversion WebP côté serveur, CNT-19). */
  function uploadImage(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return Admin.toast('Image trop lourde : 10 Mo maximum.', 'error');
    const field = input.closest('.field');
    const bar = field.querySelector('.progress');
    bar.hidden = false;
    let pct = 0;
    const tick = setInterval(() => { pct = Math.min(90, pct + 15); bar.firstElementChild.style.width = pct + '%'; }, 80);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1200 / img.width);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const data = file.type === 'image/svg+xml' ? reader.result : c.toDataURL('image/jpeg', 0.82);
        clearInterval(tick);
        bar.firstElementChild.style.width = '100%';
        setTimeout(() => {
          const p = JSON.parse(input.dataset.imagePath);
          if (input.dataset.imageMode === 'object') {
            const cur = get(working, p);
            if (cur && typeof cur === 'object' && 'src' in cur) set(working, p.concat(['src']), data);
            else set(working, p, { src: data, alt: '' });
          } else set(working, p, data);
          rerenderSection(); sendPreview();
          Admin.toast('Image envoyée. Pensez à la décrire si elle porte une information.');
        }, 250);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
  function uploadFile(input) {
    const file = input.files[0];
    if (!file) return;
    const ext = input.dataset.ext;
    if (!file.name.toLowerCase().endsWith('.' + ext)) return Admin.toast(`Ce fichier n'est pas un ${ext.toUpperCase()}.`, 'error');
    if (file.size > +input.dataset.max * 1024 * 1024) return Admin.toast(`Fichier trop lourd : ${input.dataset.max} Mo maximum.`, 'error');
    const p = JSON.parse(input.dataset.filePath);
    const size = (file.size / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' Mo';
    set(working, p, input.dataset.fileMode === 'object' ? { name: file.name, size } : file.name);
    rerenderSection(); sendPreview();
    Admin.toast('Fichier envoyé.');
  }

  /* ---------- Actions ---------- */
  function validateAll() {
    showErrors = true;
    const errs = errors();
    if (errs.length) {
      openKey = errs[0].section;
      renderForm();
      document.querySelector('.field.has-error')?.scrollIntoView({ block: 'center' });
      Admin.toast(`${errs.length} erreur${errs.length > 1 ? 's' : ''} à corriger avant d'enregistrer.`, 'error');
      return false;
    }
    renderForm();
    return true;
  }
  async function onSave() {
    if (!validateAll()) return;
    Admin.saveDraft(working, page.id);
    saved = snapshot();
    updateBar(); Admin.renderSidebar(page.id);
    Admin.toast("Brouillon enregistré. Il n'est pas encore visible sur le site.");
  }
  async function onPublish() {
    if (!validateAll()) return;
    const ok = await Admin.confirmDialog({ title: `Publier « ${CFG.title} » ?`, text: 'Les modifications seront visibles immédiatement par tous les visiteurs du site.', ok: 'Publier' });
    if (!ok) return;
    Admin.publish(working, page);
    saved = snapshot();
    updateBar(); Admin.renderSidebar(page.id);
    Admin.toast('Page publiée : elle est maintenant visible sur le site.');
  }
  async function onCancel() {
    const ok = await Admin.confirmDialog({ title: 'Annuler les modifications ?', text: 'Toutes les modifications non publiées de cette page seront perdues. La version en ligne ne change pas.', ok: 'Annuler les modifications', danger: true });
    if (!ok) return;
    page.paths.forEach((p) => set(working, p, clone(get(state.published, p))));
    Admin.saveDraft(working, page.id);
    saved = snapshot(); showErrors = false; touched.clear();
    renderForm(); sendPreview(); Admin.renderSidebar(page.id);
    Admin.toast('Modifications annulées : la page est revenue à la version en ligne.');
  }

  /* ---------- Initialisation ---------- */
  document.getElementById('page-title').textContent = CFG.title;
  document.getElementById('page-kind').textContent = page.kind;
  document.title = `${CFG.title} · Back-office`;
  const live = CFG.preview.replace(/[?&]apercu=1/, '').replace(/\?$/, '');
  document.getElementById('live-link').href = live;
  document.getElementById('form-intro').textContent = page.id === 'communs'
    ? 'Ces éléments apparaissent sur toutes les pages du site.'
    : 'Dépliez une section pour la modifier. L’aperçu se met à jour pendant la saisie.';
  const dl = document.createElement('datalist'); dl.id = 'targets';
  dl.innerHTML = TARGETS.map((t) => `<option value="${t}">`).join(''); document.body.appendChild(dl);

  Admin.renderSidebar(page.id);
  renderForm();
  bindForm();
  frame().src = CFG.preview;
  document.querySelectorAll('[data-device]').forEach((b) => b.addEventListener('click', () => {
    device = b.dataset.device;
    document.querySelectorAll('[data-device]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    layoutPreview();
  }));
  window.addEventListener('resize', layoutPreview);
  layoutPreview();
  document.getElementById('btn-save').addEventListener('click', onSave);
  document.getElementById('btn-publish').addEventListener('click', onPublish);
  document.getElementById('btn-cancel').addEventListener('click', onCancel);
  /* Avertissement si on quitte avec des saisies non enregistrées (EDI-21). */
  window.addEventListener('beforeunload', (e) => { if (snapshot() !== saved) { e.preventDefault(); e.returnValue = ''; } });
})();
