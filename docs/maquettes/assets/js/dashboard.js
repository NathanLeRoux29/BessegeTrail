/* Tableau de bord (maquette, spec 07). Les statistiques sont simulées ; dans
 * l'application, l'admin les lit côté serveur via l'API d'Umami (DSH-09). */
(function () {
  'use strict';
  const { icon, state, PAGES } = Admin;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = (n) => Math.round(n).toLocaleString('fr-FR');

  /* ---------- Données simulées (déterministes) ---------- */
  function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const rand = rng(42);
  const DAYS = 90;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const series = Array.from({ length: DAYS * 2 }, (_, i) => {
    const date = new Date(today); date.setDate(today.getDate() - (DAYS * 2 - 1 - i));
    const growth = 18 + Math.pow(i / (DAYS * 2), 1.7) * 90;
    const weekend = [0, 6].includes(date.getDay()) ? 1.35 : 1;
    const spike = i === DAYS * 2 - 24 ? 2.6 : i === DAYS * 2 - 23 ? 1.7 : 1; // ouverture des inscriptions
    const visitors = growth * weekend * spike * (0.8 + rand() * 0.4);
    return { date, visitors: Math.round(visitors), views: Math.round(visitors * (2.6 + rand() * 0.8)), clicks: Math.round(visitors * (0.07 + rand() * 0.04)) };
  });
  const SPLITS = {
    pages: [['Accueil', 0.42], ['Infos pratiques', 0.17], ['Trail 40 km', 0.14], ['Trail 20 km', 0.12], ['Trail 13 km', 0.08]],
    races: [['Trail 40 km', 0.33], ['Trail 20 km', 0.29], ['Trail 13 km', 0.2], ['Randonnée', 0.11], ['Marche solidaire', 0.07]],
    sources: [['Google', 0.41], ['Facebook', 0.27], ['Accès direct', 0.18], ['Instagram', 0.1], ['Autres sites', 0.04]],
    devices: [['Mobile', 0.68], ['Ordinateur', 0.27], ['Tablette', 0.05]],
  };

  /* ---------- En-tête ---------- */
  const days = Math.ceil((new Date(state.published.settings.startDate) - new Date()) / 864e5);
  document.getElementById('greeting').textContent = `Bonjour ${Admin.user()}`;
  document.getElementById('countdown').textContent = days > 0 ? `Départ dans ${days} jours` : 'La course est passée';

  /* ---------- État du site ---------- */
  function renderStatus(checking) {
    document.getElementById('status-row').innerHTML = [
      checking
        ? { cls: 'info', ic: 'refresh', title: 'Vérification…', text: 'Interrogation du site public', spin: true }
        : { cls: 'ok', ic: 'globe', title: 'Site en ligne', text: `Vérifié à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` },
      { cls: 'ok', ic: 'database', title: 'Sauvegarde réussie', text: 'Cette nuit à 03:00 (Google Drive)' },
      { cls: 'info', ic: 'tag', title: 'Version 1.0.0', text: 'Mise en ligne le 2 janvier' },
      { cls: 'ok', ic: 'disk', title: 'Espace disque', text: '72 % libre', p2: true },
    ].map((s) => `<div class="card status-item"><div class="status-icon ${s.cls}">${icon(s.ic).replace('<svg', s.spin ? '<svg class="spin"' : '<svg')}</div>
      <div><strong>${s.title}${s.p2 ? '<span class="p2" title="Priorité 2">P2</span>' : ''}</strong><span>${s.text}</span></div></div>`).join('');
  }
  renderStatus(false);
  document.getElementById('btn-check').addEventListener('click', () => { renderStatus(true); setTimeout(() => renderStatus(false), 1200); });

  /* ---------- Fréquentation ---------- */
  let period = 30;
  function slice(n) { return series.slice(series.length - n); }
  function prevSlice(n) { return series.slice(series.length - 2 * n, series.length - n); }
  const sum = (arr, k) => arr.reduce((a, d) => a + d[k], 0);

  function renderTiles() {
    const cur = slice(period), prev = period === DAYS ? null : prevSlice(period);
    const tiles = [['Visiteurs uniques', 'visitors'], ['Pages vues', 'views'], ['Clics sur « S’inscrire »', 'clicks']];
    document.getElementById('tiles').innerHTML = tiles.map(([label, k]) => {
      const v = sum(cur, k);
      let delta = '';
      if (prev) {
        const pv = sum(prev, k), pct = Math.round(((v - pv) / pv) * 100);
        delta = `<div class="delta ${pct >= 0 ? 'up' : 'down'}">${pct >= 0 ? '▲' : '▼'} ${pct >= 0 ? '+' : ''}${pct} % <span class="muted" style="font-weight:500">vs ${period} jours précédents</span></div>`;
      }
      return `<div class="card tile"><div class="label">${label}</div><div class="value">${nf(v)}</div>${delta}</div>`;
    }).join('');
  }

  /* Courbe des visiteurs par jour : une série, aire légère, réticule et info-bulle. */
  const chartWrap = document.getElementById('chart');
  let points = [], activeIdx = null;
  function niceStep(max) {
    const raw = max / 4, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  }
  function renderChart() {
    const data = slice(period);
    const W = chartWrap.clientWidth - 32, H = 260, m = { l: 40, r: 16, t: 12, b: 28 };
    const step = niceStep(Math.max(...data.map((d) => d.visitors)));
    const yMax = step * Math.ceil(Math.max(...data.map((d) => d.visitors)) / step);
    const x = (i) => m.l + (i / (data.length - 1)) * (W - m.l - m.r);
    const y = (v) => m.t + (1 - v / yMax) * (H - m.t - m.b);
    points = data.map((d, i) => ({ x: x(i), y: y(d.visitors), d }));
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
    const area = `${line}L${points[points.length - 1].x},${y(0)}L${points[0].x},${y(0)}Z`;
    let grid = '';
    for (let v = 0; v <= yMax; v += step) {
      grid += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--border)" stroke-width="1"/>
        <text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--text-muted)" style="font-variant-numeric:tabular-nums">${nf(v)}</text>`;
    }
    const ticks = 5;
    let xt = '';
    for (let k = 0; k < ticks; k++) {
      const i = Math.round((k / (ticks - 1)) * (data.length - 1));
      xt += `<text x="${x(i)}" y="${H - 8}" text-anchor="${k === 0 ? 'start' : k === ticks - 1 ? 'end' : 'middle'}" font-size="11" fill="var(--text-muted)">${data[i].date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</text>`;
    }
    const last = points[points.length - 1];
    const total = sum(data, 'visitors');
    chartWrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" tabindex="0" aria-label="Visiteurs par jour sur ${period} jours, ${nf(total)} au total. Utilisez les flèches pour parcourir les jours.">
        ${grid}${xt}
        <path d="${area}" fill="var(--brand)" opacity=".1"/>
        <path d="${line}" fill="none" stroke="var(--brand)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="${last.x}" cy="${last.y}" r="4" fill="var(--brand)" stroke="var(--surface)" stroke-width="2"/>
        <text x="${last.x - 8}" y="${last.y - 10}" text-anchor="end" font-size="12" font-weight="700" fill="var(--text)">${nf(last.d.visitors)}</text>
        <g class="crosshair" style="display:none">
          <line y1="${m.t}" y2="${H - m.b}" stroke="var(--text-muted)" stroke-width="1"/>
          <circle r="4" fill="var(--brand)" stroke="var(--surface)" stroke-width="2"/>
        </g>
        <rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent" class="hit"/>
      </svg><div class="chart-tooltip" aria-hidden="true"></div>`;
    const svg = chartWrap.querySelector('svg');
    svg.querySelector('.hit').addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * W;
      const i = Math.round(((px - m.l) / (W - m.l - m.r)) * (points.length - 1));
      show(Math.max(0, Math.min(points.length - 1, i)));
    });
    svg.addEventListener('pointerleave', hide);
    svg.addEventListener('blur', hide);
    svg.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const n = points.length - 1;
      activeIdx = e.key === 'Home' ? 0 : e.key === 'End' ? n : Math.max(0, Math.min(n, (activeIdx ?? n) + (e.key === 'ArrowLeft' ? -1 : 1)));
      show(activeIdx);
    });
    renderTable(data);
  }
  function show(i) {
    activeIdx = i;
    const svg = chartWrap.querySelector('svg'), p = points[i];
    const ch = svg.querySelector('.crosshair');
    ch.style.display = '';
    ch.querySelector('line').setAttribute('x1', p.x); ch.querySelector('line').setAttribute('x2', p.x);
    ch.querySelector('circle').setAttribute('cx', p.x); ch.querySelector('circle').setAttribute('cy', p.y);
    const tt = chartWrap.querySelector('.chart-tooltip');
    tt.innerHTML = '';
    const v = document.createElement('div'); v.className = 'tt-value'; v.innerHTML = '<i></i>';
    v.appendChild(document.createTextNode(`${nf(p.d.visitors)} visiteurs`));
    const l = document.createElement('div'); l.className = 'tt-label';
    l.textContent = p.d.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const c = document.createElement('div'); c.className = 'tt-label';
    c.textContent = `${nf(p.d.clicks)} clics « S'inscrire »`;
    tt.append(v, l, c);
    const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    const left = p.x * scale + 16;
    tt.style.left = `${Math.min(left + 12, chartWrap.clientWidth - 170)}px`;
    tt.style.top = `${Math.max(0, p.y * scale - 20)}px`;
    tt.classList.add('show');
  }
  function hide() {
    const ch = chartWrap.querySelector('.crosshair'); if (ch) ch.style.display = 'none';
    chartWrap.querySelector('.chart-tooltip')?.classList.remove('show');
  }
  function renderTable(data) {
    document.getElementById('chart-table').innerHTML = `<table class="data-table"><caption class="visually-hidden">Visiteurs, pages vues et clics par jour</caption>
      <thead><tr><th>Jour</th><th class="num">Visiteurs</th><th class="num">Pages vues</th><th class="num">Clics « S'inscrire »</th></tr></thead>
      <tbody>${data.slice().reverse().map((d) => `<tr><td>${d.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</td><td class="num">${nf(d.visitors)}</td><td class="num">${nf(d.views)}</td><td class="num">${nf(d.clicks)}</td></tr>`).join('')}</tbody></table>`;
  }
  document.getElementById('btn-table').addEventListener('click', (e) => {
    const t = document.getElementById('chart-table-wrap');
    t.hidden = !t.hidden;
    e.currentTarget.setAttribute('aria-pressed', String(!t.hidden));
    e.currentTarget.lastChild.textContent = t.hidden ? 'Voir le tableau' : 'Masquer le tableau';
  });

  /* Listes en barres horizontales : une seule couleur, valeur au bout de la barre. */
  function renderBars() {
    const cur = slice(period);
    const totals = { pages: sum(cur, 'views'), races: sum(cur, 'clicks'), sources: sum(cur, 'visitors'), devices: sum(cur, 'visitors') };
    Object.entries(SPLITS).forEach(([k, rows]) => {
      const vals = rows.map(([label, share]) => [label, totals[k] * share]);
      const max = Math.max(...vals.map(([, v]) => v));
      const isPct = k === 'devices' || k === 'sources';
      document.getElementById(`bars-${k}`).innerHTML = vals.map(([label, v]) => {
        const shown = isPct ? `${Math.round((v / totals[k]) * 100)} %` : nf(v);
        return `<li class="bar-row" title="${esc(label)} : ${shown}"><div class="bar-label"><span>${esc(label)}</span><span>${shown}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(v / max) * 100}%"></div></div></li>`;
      }).join('');
    });
  }

  function renderStats() { renderTiles(); renderChart(); renderBars(); }
  document.querySelectorAll('[data-period]').forEach((b) => b.addEventListener('click', () => {
    period = +b.dataset.period;
    document.querySelectorAll('[data-period]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    document.getElementById('period-label').textContent = period === DAYS ? 'depuis la mise en ligne' : `sur les ${period} derniers jours`;
    renderStats();
  }));
  window.addEventListener('resize', renderChart);

  /* ---------- À faire ---------- */
  function renderTodo() {
    const items = [];
    PAGES.forEach((p) => {
      if (Admin.pageStatus(p) === 'draft') {
        const m = state.meta[p.id] || {};
        items.push({ ic: 'alert', cls: 'warn', title: `${p.label} : modifications non publiées`, text: m.savedAt ? `Enregistrées par ${m.savedBy} ${Admin.when(m.savedAt)}` : 'Brouillon en attente de publication', href: p.href });
      }
    });
    RACE_ORDER.forEach((s) => {
      const r = state.draft.races[s];
      if (r.visible && !r.registerUrl) items.push({ ic: 'link', cls: 'warn', title: `${Admin.RACE_LABELS[s]} : lien d'inscription manquant`, text: 'Le bouton « S’inscrire » ne s’affiche pas sur la page de l’épreuve.', href: `editeur.html?page=epreuve&slug=${s}` });
    });
    const h = state.draft.home;
    const noAlt = [h.presentation.image, h.benevoles.image, ...h.galerie.photos].filter((i) => i && i.src && !String(i.alt || '').trim()).length;
    if (noAlt) items.push({ ic: 'eye', cls: 'warn', title: `${noAlt} image${noAlt > 1 ? 's' : ''} sans description`, text: 'Nécessaire pour les personnes malvoyantes et pour Google.', href: 'editeur.html?page=accueil' });
    if (!state.draft.settings.startDate) items.push({ ic: 'alert', cls: 'danger', title: 'Date de départ non renseignée', text: 'Le compte à rebours ne peut pas s’afficher.', href: 'editeur.html?page=communs' });
    document.getElementById('todo').innerHTML = items.length
      ? `<ul class="todo-list">${items.map((it) => `<li><span class="status-icon ${it.cls}">${icon(it.ic)}</span><div><strong>${esc(it.title)}</strong><span>${esc(it.text)}</span></div><a class="btn btn-sm" href="${it.href}">Ouvrir</a></li>`).join('')}</ul>`
      : `<p class="todo-empty">✔ Rien à faire, tout est publié.</p>`;
    document.getElementById('todo-count').textContent = items.length ? `${items.length}` : '';
    document.getElementById('todo-count').hidden = !items.length;
  }

  /* ---------- Accès aux pages ---------- */
  function renderTiles2() {
    document.getElementById('page-tiles').innerHTML = PAGES.map((p) => {
      const hidden = p.slug && !state.draft.races[p.slug].visible;
      const st = Admin.pageStatus(p);
      const badge = hidden ? '<span class="badge badge-muted">Masquée</span>' : st === 'draft' ? '<span class="badge badge-info">Brouillon</span>' : '<span class="badge badge-ok">Publié</span>';
      return `<a class="page-tile" href="${p.href}"><span class="kind">${esc(p.kind)}</span><strong>${esc(p.label)}</strong>${badge}</a>`;
    }).join('');
  }

  Admin.renderSidebar('dashboard');
  renderStats();
  renderTodo();
  renderTiles2();
})();
