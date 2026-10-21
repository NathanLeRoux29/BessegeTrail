/* Maquette du site public.
 * Chaque section est rendue à partir d'un bloc de contenu, comme le feront les
 * composants Nuxt. En mode aperçu (?apercu=1, dans l'iframe du back-office),
 * le contenu arrive du formulaire par postMessage et la page se re-rend. */
(function () {
  'use strict';

  const params = new URLSearchParams(location.search);
  const isPreview = params.has('apercu');
  const pageType = document.body.dataset.page; // home | infos | race | legal
  let content = DemoStore.published();
  let focused = null;

  /* ---------- Utilitaires ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, '<a href="$2">$1</a>');
  /* Texte mis en forme minimal : paragraphes, listes « - », titres « ### »,
   * gras « ** », italique « * », liens « [texte](https://…) ». */
  function rich(text) {
    return String(text || '').trim().split(/\n\s*\n/).map((block) => {
      const lines = block.split('\n');
      if (lines.every((l) => l.trim().startsWith('- '))) {
        return '<ul>' + lines.map((l) => `<li>${inline(l.trim().slice(2))}</li>`).join('') + '</ul>';
      }
      let html = '';
      if (lines[0].startsWith('### ')) { html += `<h3>${inline(lines.shift().slice(4))}</h3>`; }
      if (lines.length) html += `<p>${lines.map(inline).join('<br>')}</p>`;
      return html;
    }).join('');
  }
  const raceUrl = (slug) => `epreuve.html?epreuve=${encodeURIComponent(slug)}${isPreview ? '&apercu=1' : ''}`;
  const visibleRaces = () => RACE_ORDER.filter((s) => content.races[s] && content.races[s].visible);
  const fmt = (n) => Number(n).toLocaleString('fr-FR');
  const ext = (url) => /^https?:\/\//.test(url || '');

  const I = {
    lieu: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
    parking: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 17V8h3.5a2.5 2.5 0 0 1 0 5H10"/>',
    dossard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="7" cy="9" r="1"/><circle cx="17" cy="9" r="1"/><path d="M8 15h8M10 12h4"/>',
    horaire: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    douche: '<path d="M4 4h6a6 6 0 0 1 6 6v1"/><path d="M12 11h8"/><path d="M14 15v1M17 15v2M20 15v1M14 19v1M17 20v1M20 19v1"/>',
    restauration: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 21V3c-2 1.5-3 4-3 7h3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 21h8M10 17h4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    play: '<path d="M7 5l12 7-12 7V5Z"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    prev: '<path d="M15 6l-6 6 6 6"/>',
    next: '<path d="M9 6l6 6-6 6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
    strava: '<path d="m10 3-6 12h4l2-4 2 4h4L10 3ZM15 15l-2 4 2 2 2-2-2-4Z"/>',
    youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3V9Z"/>',
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || I.info}</svg>`;
  const SOCIAL_NAMES = { facebook: 'Facebook', instagram: 'Instagram', strava: 'Strava', youtube: 'YouTube' };
  const newTab = '<span class="visually-hidden">(nouvel onglet)</span>';

  function socialsList(socials, cls = 'socials') {
    const items = Object.entries(socials || {}).filter(([, url]) => url);
    if (!items.length) return '';
    return `<ul class="${cls}">` + items.map(([k, url]) =>
      `<li><a href="${esc(url)}" target="_blank" rel="noopener">${icon(k)}<span class="visually-hidden">${SOCIAL_NAMES[k]} du ${esc(content.settings.eventName)} (nouvel onglet)</span></a></li>`
    ).join('') + '</ul>';
  }

  /* ---------- Header / footer ---------- */
  /* Une entrée de menu dont la section cible est masquée n'est pas affichée (SOC-03). */
  function targetVisible(target) {
    const [page, hash] = target.split('#');
    if (!page) return !content.home[hash] || content.home[hash].visible !== false;
    if (page === 'infos-pratiques.html' && hash) return !content.infos[hash] || content.infos[hash].visible !== false;
    return true;
  }
  const currentFile = { home: 'index.html', infos: 'infos-pratiques.html' }[pageType];
  function renderHeader() {
    const h = content.header;
    const home = pageType === 'home' ? '' : 'index.html' + (isPreview ? '?apercu=1' : '');
    const items = h.menu.filter((m) => targetVisible(m.target));
    document.getElementById('site-header').innerHTML = `
      <div class="container">
        <a class="brand" href="${home || '#accueil'}"><img src="${esc(h.logo.src)}" alt="${esc(h.logo.alt)}" width="44" height="44"><span>${esc(h.title)}</span></a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">${icon('menu')}<span class="label">Menu</span></button>
        <nav class="main-nav" id="main-nav" aria-label="Navigation principale">
          <ul>${items.map((m) => {
            const isExt = ext(m.target);
            const href = m.target.startsWith('#') ? home + m.target : m.target;
            const current = m.target === currentFile ? ' aria-current="page"' : '';
            return `<li><a href="${esc(href)}"${current}${isExt ? ' target="_blank" rel="noopener"' : ''}>${esc(m.label)}${isExt ? newTab : ''}</a></li>`;
          }).join('')}</ul>
        </nav>
        <a class="btn btn-primary header-cta" href="${esc(h.cta.url)}" target="_blank" rel="noopener" data-umami-event="inscription-header">${esc(h.cta.label)}${newTab}</a>
      </div>`;
  }
  function renderFooter() {
    const s = content.settings, f = content.footer;
    const legal = (slug) => `page-legale.html?page=${slug}${isPreview ? '&apercu=1' : ''}`;
    document.getElementById('site-footer').innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="brand" href="index.html${isPreview ? '?apercu=1' : ''}"><img src="${esc(content.header.logo.src)}" alt="" width="44" height="44"><span>${esc(content.header.title)}</span></a>
            <p>${esc(s.dateLabel)} · ${esc(s.place)}</p>
            ${socialsList(s.socials)}
          </div>
          <div>
            <h2>Contact</h2>
            <ul><li>${esc(f.association)}</li><li><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li></ul>
          </div>
          <div>
            <h2>Informations</h2>
            <ul>
              <li><a href="${legal('mentions-legales')}">Mentions légales</a></li>
              <li><a href="${legal('confidentialite')}">Politique de confidentialité</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom"><span>${esc(f.text)}</span><span>Site sans cookie</span></div>
      </div>`;
  }

  /* ---------- Sections de l'accueil ---------- */
  function countdownHtml() {
    const hero = content.home.hero;
    if (!hero.showCountdown) return '';
    const diff = new Date(content.settings.startDate) - new Date();
    if (!(diff > 0)) return `<p class="countdown-after">${esc(hero.afterText)}</p>`;
    const d = Math.floor(diff / 864e5), h = Math.floor((diff % 864e5) / 36e5), m = Math.floor((diff % 36e5) / 6e4);
    return `<div class="countdown">
      <span class="countdown-label" aria-hidden="true">Départ dans</span>
      <p class="visually-hidden">Départ dans ${d} jours</p>
      <div class="countdown-boxes" aria-hidden="true">
        <div class="countdown-box"><strong>${d}</strong><span>jours</span></div>
        <div class="countdown-box"><strong>${h}</strong><span>heures</span></div>
        <div class="countdown-box"><strong>${m}</strong><span>minutes</span></div>
      </div></div>`;
  }
  const S = {
    hero() {
      const s = content.settings, h = content.home.hero;
      return `<section class="hero" id="accueil" data-section="home.hero" data-label="Bannière">
        <img class="hero-bg" src="${esc(h.image.src)}" alt="" fetchpriority="high">
        <div class="container hero-grid">
          <div>
            <span class="eyebrow">${esc(s.edition)}</span>
            <h1>${esc(s.eventName)}</h1>
            <p class="hero-subtitle">${esc(h.subtitle)}</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="${esc(h.cta.url)}" target="_blank" rel="noopener" data-umami-event="inscription-banniere">${esc(h.cta.label)}${newTab}</a>
              <a class="btn btn-outline-light" href="#epreuves">Voir les épreuves</a>
            </div>
          </div>
          <div>
            <div class="hero-meta"><span>${icon('calendar')}${esc(s.dateLabel)}</span><span>${icon('lieu')}${esc(s.place)}</span></div>
            <div style="margin-top:18px" id="countdown">${countdownHtml()}</div>
          </div>
        </div>
      </section>`;
    },
    keyfigures() {
      const races = visibleRaces().map((k) => content.races[k]);
      if (!races.length) return '';
      const maxD = Math.max(...races.map((r) => +r.distance || 0));
      const maxP = Math.max(...races.map((r) => +r.dplus || 0));
      return `<div class="keyfigures" aria-label="Chiffres clés"><div class="container"><ul>
        <li><strong>${races.length}</strong><span>épreuves</span></li>
        <li><strong>${maxD} km</strong><span>le plus long</span></li>
        <li><strong>${fmt(maxP)} m</strong><span>de dénivelé positif</span></li>
        <li><strong>${esc(content.settings.edition.split(' ')[0])}</strong><span>${esc(content.settings.edition.split(' ').slice(1).join(' ') || 'édition')}</span></li>
      </ul></div></div>`;
    },
    presentation() {
      const p = content.home.presentation;
      return `<section class="section" id="presentation" data-section="home.presentation" data-label="Présentation" aria-labelledby="t-presentation">
        <div class="container split">
          <div>
            <div class="section-head" style="margin-bottom:24px"><span class="eyebrow">${esc(content.settings.edition)}</span></div>
            <h2 id="t-presentation" style="margin-bottom:24px">${esc(p.title)}</h2>
            <div class="rich">${rich(p.text)}</div>
          </div>
          ${p.image && p.image.src ? `<div class="split-media"><img src="${esc(p.image.src)}" alt="${esc(p.image.alt)}" loading="lazy" width="1200" height="900"></div>` : ''}
        </div>
      </section>`;
    },
    epreuves() {
      const e = content.home.epreuves;
      return `<section class="section" id="epreuves" data-section="home.epreuves" data-label="Les épreuves" aria-labelledby="t-epreuves">
        <div class="container">
          <div class="section-head"><span class="eyebrow">Choisissez votre défi</span><h2 id="t-epreuves" style="margin-top:14px">${esc(e.title)}</h2>${e.intro ? `<p>${esc(e.intro)}</p>` : ''}</div>
          <ul class="race-grid">${visibleRaces().map((slug) => {
            const r = content.races[slug];
            return `<li><a class="race-card" href="${raceUrl(slug)}" data-section="race.${slug}" data-label="${esc(r.name)}">
              <img src="${esc(r.image)}" alt="" loading="lazy">
              <span class="race-badge">${esc(r.type)}</span>
              <span class="race-distance">${esc(r.distance)}<small>km</small></span>
              <span class="race-name">${esc(r.name)}</span>
              <span class="race-more">Découvrir ${icon('arrow')}</span>
            </a></li>`;
          }).join('')}</ul>
        </div>
      </section>`;
    },
    pratiques() {
      const n = content.infos.pratiques;
      if (!n.visible) return '';
      return `<section class="section" id="pratiques" data-section="infos.pratiques" data-label="Sur place" aria-labelledby="t-pratiques">
        <div class="container">
          <div class="section-head"><span class="eyebrow">Le jour J</span><h2 id="t-pratiques" style="margin-top:14px">${esc(n.title)}</h2></div>
          <ul class="info-grid">${n.items.map((it) => `<li class="info-card"><div class="info-icon">${icon(it.icon)}</div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></li>`).join('')}</ul>
          <div class="info-footer">
            <address>${icon('lieu')}${esc(n.address)}</address>
            <div class="actions">
              ${n.mapUrl ? `<a class="btn btn-outline-light" href="${esc(n.mapUrl)}" target="_blank" rel="noopener">Voir sur la carte${newTab}</a>` : ''}
              ${n.rules && n.rules.name ? `<a class="btn btn-primary" href="#" download>${icon('download')}Règlement (PDF, ${esc(n.rules.size)})</a>` : ''}
            </div>
          </div>
        </div>
      </section>`;
    },
    galerie() {
      const g = content.home.galerie;
      if (!g.visible || !g.photos.length) return '';
      return `<section class="section" id="galerie" data-section="home.galerie" data-label="Galerie" aria-labelledby="t-galerie">
        <div class="container">
          <div class="section-head"><span class="eyebrow">En images</span><h2 id="t-galerie" style="margin-top:14px">${esc(g.title)}</h2></div>
          <ul class="gallery">${g.photos.map((p, i) => `<li><button type="button" data-lightbox="${i}" aria-label="Agrandir : ${esc(p.alt)}"><img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy"></button></li>`).join('')}</ul>
        </div>
        <dialog class="lightbox" aria-label="Visionneuse de photos">
          <figure><img src="" alt=""><figcaption><span class="lb-caption"></span>
            <span class="lightbox-nav">
              <button class="icon-btn lb-prev" type="button" aria-label="Photo précédente">${icon('prev')}</button>
              <button class="icon-btn lb-next" type="button" aria-label="Photo suivante">${icon('next')}</button>
              <button class="icon-btn lb-close" type="button" aria-label="Fermer">${icon('close')}</button>
            </span></figcaption></figure>
        </dialog>
      </section>`;
    },
    benevoles() {
      const b = content.home.benevoles;
      if (!b.visible) return '';
      return `<section class="section" id="benevoles" data-section="home.benevoles" data-label="Bénévoles" aria-labelledby="t-benevoles">
        <div class="container"><div class="volunteer-panel">
          ${b.image && b.image.src ? `<img src="${esc(b.image.src)}" alt="${esc(b.image.alt)}" loading="lazy">` : ''}
          <div class="volunteer-body">
            <span class="eyebrow">Rejoignez l'équipe</span>
            <h2 id="t-benevoles" style="margin-top:14px">${esc(b.title)}</h2>
            <div class="rich">${rich(b.text)}</div>
            ${b.button.url ? `<a class="btn btn-primary" href="${esc(b.button.url)}" target="_blank" rel="noopener">${esc(b.button.label)}${newTab}</a>` : ''}
          </div>
        </div></div>
      </section>`;
    },
    faq() {
      const f = content.infos.faq;
      if (!f.visible || !f.items.length) return '';
      return `<section class="section" id="faq" data-section="infos.faq" data-label="FAQ" aria-labelledby="t-faq">
        <div class="container">
          <div class="section-head"><span class="eyebrow">Vous vous demandez</span><h2 id="t-faq" style="margin-top:14px">${esc(f.title)}</h2></div>
          <div class="faq-list">${f.items.map((it) => `<details><summary>${esc(it.q)}</summary><div class="rich">${rich(it.a)}</div></details>`).join('')}</div>
        </div>
      </section>`;
    },
    partenaires() {
      const p = content.home.partenaires;
      if (!p.visible || !p.items.length) return '';
      return `<section class="section" id="partenaires" data-section="home.partenaires" data-label="Partenaires" aria-labelledby="t-partenaires">
        <div class="container">
          <div class="section-head"><span class="eyebrow">Merci à eux</span><h2 id="t-partenaires" style="margin-top:14px">${esc(p.title)}</h2></div>
          <div class="marquee" style="--duration:${p.items.length * 5}s">
            <ul class="marquee-track">${partnerItems(p.items, false)}</ul>
            <ul class="marquee-track" aria-hidden="true">${partnerItems(p.items, true)}</ul>
          </div>
          <button class="btn btn-outline marquee-toggle" type="button" aria-pressed="false">${icon('pause')}<span>Mettre en pause le défilement</span></button>
        </div>
      </section>`;
    },
    contact() {
      const c = content.home.contact, s = content.settings;
      if (!c.visible) return '';
      return `<section class="section contact" id="contact" data-section="home.contact" data-label="Contact" aria-labelledby="t-contact">
        <div class="container">
          <div class="section-head"><span class="eyebrow">Une question ?</span><h2 id="t-contact" style="margin-top:14px">${esc(c.title)}</h2><p>${esc(c.text)}</p></div>
          <a class="contact-mail" href="mailto:${esc(s.email)}">${esc(s.email)}</a>
          ${socialsList(s.socials)}
        </div>
      </section>`;
    },
  };

  /* Logos des partenaires. La seconde copie sert uniquement à la boucle visuelle :
   * elle est cachée aux lecteurs d'écran et retirée de l'ordre de tabulation. */
  function partnerItems(items, copy) {
    const alt = (it) => (copy ? '' : esc(it.name));
    const tab = copy ? ' tabindex="-1"' : '';
    return items.map((it) => it.url
      ? `<li><a href="${esc(it.url)}" target="_blank" rel="noopener"${tab}><img src="${esc(it.logo)}" alt="${alt(it)}" loading="lazy">${copy ? '' : newTab}</a></li>`
      : `<li><div><img src="${esc(it.logo)}" alt="${alt(it)}" loading="lazy"></div></li>`).join('');
  }

  /* Défilement des partenaires (ACC-31 à ACC-34) : uniquement si les logos
   * dépassent la largeur disponible ; pause au survol, au focus et par bouton. */
  function initMarquee(root) {
    const m = root.querySelector('.marquee');
    if (!m) return;
    const btn = root.querySelector('.marquee-toggle');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const layout = () => {
      m.classList.remove('is-static');
      const fits = m.querySelector('.marquee-track').scrollWidth <= m.clientWidth;
      const isStatic = fits || reduce.matches;
      m.classList.toggle('is-static', isStatic);
      btn.hidden = isStatic;
    };
    btn.addEventListener('click', () => {
      const paused = m.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', String(paused));
      btn.innerHTML = icon(paused ? 'play' : 'pause') + `<span>${paused ? 'Reprendre le défilement' : 'Mettre en pause le défilement'}</span>`;
    });
    layout();
    window.addEventListener('resize', layout);
  }

  /* Alternance automatique des fonds (ACC-02). */
  function applyAlternation(root) {
    root.querySelectorAll('.section').forEach((el, i) => {
      el.classList.remove('bg-a', 'bg-b');
      el.classList.add(i % 2 === 0 ? 'bg-a' : 'bg-b');
    });
  }

  /* ---------- Pages ---------- */
  function renderHome(main) {
    main.innerHTML = ['hero', 'keyfigures', 'presentation', 'epreuves', 'galerie', 'benevoles', 'partenaires', 'contact'].map((k) => S[k]()).join('');
    applyAlternation(main);
    initLightbox(main);
    initMarquee(main);
    document.title = content.settings.seoTitle;
  }

  function renderInfos(main) {
    const pg = content.infos.page, n = content.infos.pratiques, f = content.infos.faq;
    const links = [
      n.visible && ['#pratiques', n.title],
      f.visible && f.items.length && ['#faq', f.title],
    ].filter(Boolean);
    main.innerHTML = `
      <section class="page-hero" data-section="infos.page" data-label="En-tête de page">
        <div class="container">
          <span class="eyebrow">${esc(content.settings.dateLabel)} · ${esc(content.settings.place)}</span>
          <h1>${esc(pg.title)}</h1>
          ${pg.intro ? `<p>${esc(pg.intro)}</p>` : ''}
          ${links.length > 1 ? `<nav class="page-anchors" aria-label="Sur cette page"><ul>${links.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul></nav>` : ''}
        </div>
      </section>
      ${S.pratiques()}${S.faq()}`;
    applyAlternation(main);
    document.title = `${pg.title} · ${content.settings.eventName}`;
  }

  function renderRace(main) {
    const slug = params.get('epreuve') || 'trail-40';
    const r = content.races[slug];
    if (!r || !r.visible) {
      main.innerHTML = `<section class="legal-hero"><div class="container"><h1>Page introuvable</h1></div></section>
        <section class="section"><div class="container"><p>Cette épreuve n'existe pas ou n'est plus proposée.</p><a class="btn btn-secondary" href="index.html">Retour à l'accueil</a></div></section>`;
      document.title = 'Page introuvable';
      return;
    }
    const list = visibleRaces(), idx = list.indexOf(slug);
    const prev = list[idx - 1], next = list[idx + 1];
    const figures = [
      ['Distance', r.distance && `${r.distance} km`],
      ['Dénivelé positif', r.dplus && `${fmt(r.dplus)} m`],
      [r.start && r.start.includes(', ') ? 'Départ ' + r.start.split(', ')[0].toLowerCase() : 'Départ', r.start && (r.start.split(', ')[1] || r.start)],
      ['Tarif', r.price && r.price.split(',')[0]],
    ].filter(([, v]) => v);
    main.innerHTML = `
      <section class="hero race-hero" data-section="race.${slug}" data-label="${esc(r.name)}">
        <img class="hero-bg" src="${esc(r.image)}" alt="" fetchpriority="high">
        <div class="container">
          <a class="breadcrumb" href="index.html${isPreview ? '?apercu=1' : ''}#epreuves">${icon('back')}Toutes les épreuves</a><br>
          <span class="eyebrow">${esc(r.type)} · ${esc(r.distance)} km</span>
          <h1>${esc(r.name)}</h1>
        </div>
      </section>
      <div class="container"><ul class="figures">${figures.map(([k, v]) => `<li class="figure-card"><span>${k}</span><strong>${esc(v)}</strong></li>`).join('')}</ul></div>
      <section class="section bg-a">
        <div class="container race-layout">
          <div>
            <h2 style="margin-bottom:20px">Le parcours</h2>
            <div class="rich">${rich(r.description)}</div>
            ${r.extra ? `<div class="extra-box"><h2>Informations complémentaires</h2><div class="rich">${rich(r.extra)}</div></div>` : ''}
            <div class="maps">
              ${r.trace ? `<figure><img src="${esc(r.trace)}" alt="Tracé du parcours ${esc(r.name)}, boucle au départ de Bessèges" loading="lazy"><figcaption>Tracé</figcaption></figure>` : ''}
              ${r.profil ? `<figure><img src="${esc(r.profil)}" alt="Profil altimétrique : ${esc(r.distance)} km, ${fmt(r.dplus)} m de dénivelé positif" loading="lazy"><figcaption>Profil</figcaption></figure>` : ''}
            </div>
          </div>
          <aside class="race-aside" aria-label="Inscription et fichiers">
            <h2>Inscription</h2>
            <p class="price">${esc(r.price)}</p>
            ${r.registerUrl ? `<a class="btn btn-primary" href="${esc(r.registerUrl)}" target="_blank" rel="noopener" data-umami-event="inscription" data-umami-event-epreuve="${esc(slug)}">${icon('external')}S'inscrire<span class="visually-hidden"> à ${esc(r.name)} (nouvel onglet)</span></a>` : '<p class="note">Les inscriptions ouvriront prochainement.</p>'}
            ${r.resultsUrl ? `<a class="btn btn-secondary" href="${esc(r.resultsUrl)}" target="_blank" rel="noopener">${icon('trophy')}Voir les résultats<span class="visually-hidden"> de ${esc(r.name)} (nouvel onglet)</span></a>` : ''}
            ${r.gpx ? `<a class="btn btn-outline" href="#" download="${esc(r.gpx)}">${icon('download')}Télécharger le GPX</a>` : ''}
          </aside>
        </div>
        <div class="container">
          <nav class="race-pager" aria-label="Autres épreuves">
            ${prev ? `<a href="${raceUrl(prev)}"><span>← Épreuve précédente</span><strong>${esc(content.races[prev].name)}</strong></a>` : '<span></span>'}
            ${next ? `<a href="${raceUrl(next)}"><span>Épreuve suivante →</span><strong>${esc(content.races[next].name)}</strong></a>` : ''}
          </nav>
        </div>
      </section>`;
    document.title = `${r.name} (${r.distance} km) · ${content.settings.eventName}`;
  }

  function renderLegal(main) {
    const slug = params.get('page') || 'mentions-legales';
    const p = content.pages[slug] || content.pages['mentions-legales'];
    main.innerHTML = `
      <section class="legal-hero" data-section="page.${slug}" data-label="${esc(p.title)}"><div class="container"><h1>${esc(p.title)}</h1></div></section>
      <section class="section bg-a"><div class="container"><div class="rich legal-body">${rich(p.text)}</div></div></section>`;
    document.title = `${p.title} · ${content.settings.eventName}`;
  }

  function render() {
    renderHeader();
    const main = document.getElementById('contenu');
    ({ home: renderHome, infos: renderInfos, race: renderRace, legal: renderLegal })[pageType](main);
    renderFooter();
    initMenu();
    if (focused) highlight(focused, false);
  }

  /* ---------- Interactions ---------- */
  function initMenu() {
    const btn = document.querySelector('.menu-toggle'), nav = document.getElementById('main-nav');
    if (!btn) return;
    const close = () => { nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) nav.querySelector('a')?.focus();
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); btn.focus(); } });
  }

  function initLightbox(root) {
    const dlg = root.querySelector('.lightbox');
    if (!dlg) return;
    const photos = content.home.galerie.photos;
    let i = 0, opener = null;
    const show = () => {
      dlg.querySelector('img').src = photos[i].src;
      dlg.querySelector('img').alt = photos[i].alt;
      dlg.querySelector('.lb-caption').textContent = `${photos[i].alt} (${i + 1}/${photos.length})`;
    };
    root.querySelectorAll('[data-lightbox]').forEach((b) => b.addEventListener('click', () => {
      i = +b.dataset.lightbox; opener = b; show(); dlg.showModal();
    }));
    dlg.querySelector('.lb-prev').addEventListener('click', () => { i = (i - 1 + photos.length) % photos.length; show(); });
    dlg.querySelector('.lb-next').addEventListener('click', () => { i = (i + 1) % photos.length; show(); });
    dlg.querySelector('.lb-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') dlg.querySelector('.lb-prev').click();
      if (e.key === 'ArrowRight') dlg.querySelector('.lb-next').click();
    });
    dlg.addEventListener('close', () => opener && opener.focus());
  }

  /* Compte à rebours mis à jour chaque minute (ACC-08). */
  setInterval(() => {
    const el = document.getElementById('countdown');
    if (el) el.innerHTML = countdownHtml();
  }, 60000);

  /* ---------- Pont avec l'aperçu du back-office ---------- */
  function highlight(section, scroll) {
    document.querySelectorAll('.preview-highlight').forEach((el) => el.classList.remove('preview-highlight'));
    document.querySelectorAll('.preview-tag').forEach((el) => el.remove());
    focused = section;
    const el = document.querySelector(`[data-section="${CSS.escape(section)}"]`);
    if (!el) return;
    el.classList.add('preview-highlight');
    const tag = document.createElement('span');
    tag.className = 'preview-tag';
    tag.textContent = 'En cours de modification : ' + (el.dataset.label || '');
    el.appendChild(tag);
    /* Défilement manuel : scrollIntoView ferait aussi défiler la page du back-office. */
    if (scroll) {
      const top = el.getBoundingClientRect().top + window.scrollY - (section === 'header' ? 0 : 90);
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }

  if (isPreview) {
    document.documentElement.classList.add('is-preview');
    window.addEventListener('message', (e) => {
      const m = e.data;
      if (!m || m.source !== 'bo') return;
      if (m.type === 'content') { content = m.content; render(); }
      if (m.type === 'focus') highlight(m.section, true);
    });
    /* Liens désactivés dans l'aperçu (EDI-09) ; un clic sur une section la sélectionne (EDI-08). */
    document.addEventListener('click', (e) => {
      if (e.target.closest('a')) e.preventDefault();
      const sec = e.target.closest('[data-section]');
      if (sec) parent.postMessage({ source: 'site', type: 'select', section: sec.dataset.section }, '*');
    }, true);
  }

  render();
  if (isPreview) parent.postMessage({ source: 'site', type: 'ready' }, '*');
})();
