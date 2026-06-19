(function () {
  // ── Percorso base (root o blog/) ──────────────────────────────
  const inBlog = window.location.pathname.includes('/blog/');
  const r = inBlog ? '../' : '';

  // ── Indice dei contenuti ──────────────────────────────────────
  const DATA = [
    {
      title: "Microlearning: cos'è, come funziona e quando usarlo davvero",
      category: 'Guida',
      excerpt: "Non è solo fare le cose brevi. Il microlearning funziona quando è focalizzato su un solo comportamento alla volta, con una strategia dietro.",
      url: r + 'blog/microlearning-guida-completa.html'
    },
    {
      title: "Imparare a imparare non è un modo di dire",
      category: 'Riflessioni',
      excerpt: "Imparare a imparare è diventata la meta-competenza che decide il valore di tutte le altre. Cosa significa, e perché la staticità è un rischio.",
      url: r + 'blog/imparare-a-imparare-meta-competenza.html'
    },
    {
      title: "Quanto costa un corso e-learning? La domanda (spesso) sbagliata",
      category: 'Consulenza',
      excerpt: "Prima del budget, viene l'analisi. Cosa vuoi cambiare? In chi? Perché un corso è la risposta giusta e non un altro strumento?",
      url: r + 'blog/quanto-costa-corso-elearning-domanda-sbagliata.html'
    },
    {
      title: "Valutazione della formazione: misuriamo i risultati, ma sappiamo da dove partiamo?",
      category: 'Formazione',
      excerpt: "Valutiamo sempre i risultati della formazione, ma quasi mai misuriamo da dove partivamo. L'analisi baseline cambia tutto.",
      url: r + 'blog/misurare-efficacia-formazione-baseline.html'
    },
    {
      title: "Nuova piattaforma e-learning, stesso engagement: cosa manca",
      category: 'Riflessioni',
      excerpt: "Cambiare LMS non risolve il problema se il problema non è tecnico. La tecnologia amplifica quello che hai già, nel bene e nel male.",
      url: r + 'blog/piattaforma-elearning-engagement-non-basta.html'
    },
    {
      title: 'Corsi e-learning — Demo',
      category: 'Portfolio',
      excerpt: 'Tre demo con Articulate Storyline e Rise: gamification, responsive design e micro-interazioni con voce sintetica.',
      url: r + 'corsi-elearning.html'
    },
    {
      title: 'Contattami',
      category: 'Pagina',
      excerpt: 'Scrivimi per parlare del tuo progetto formativo. Consulenza e-learning, strategia formativa, sviluppo corsi.',
      url: r + 'contattami.html'
    },
    {
      title: 'Blog — Formazione digitale',
      category: 'Pagina',
      excerpt: 'Articoli sull\'instructional design applicato. Strategie, strumenti, riflessioni oneste sulla formazione aziendale.',
      url: r + 'blog/index.html'
    },
  ];

  // ── Scoring ───────────────────────────────────────────────────
  function score(item, q) {
    const lq = q.toLowerCase();
    const title = item.title.toLowerCase();
    const excerpt = item.excerpt.toLowerCase();
    const cat = item.category.toLowerCase();
    let s = 0;
    if (title.includes(lq)) s += 12;
    if (cat.includes(lq)) s += 6;
    if (excerpt.includes(lq)) s += 4;
    lq.split(/\s+/).forEach(function (w) {
      if (w.length < 3) return;
      if (title.includes(w)) s += 5;
      if (excerpt.includes(w)) s += 2;
    });
    return s;
  }

  function doSearch(q) {
    if (!q || q.trim().length < 2) return [];
    return DATA
      .map(function (item) { return { item: item, s: score(item, q.trim()) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .map(function (r) { return r.item; });
  }

  // ── Overlay HTML ──────────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.id = 'search-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Ricerca nel sito');
  overlay.innerHTML =
    '<div id="search-panel">' +
      '<div id="search-input-wrap">' +
        '<svg id="search-icon-svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
        '<input id="search-input" type="search" placeholder="Cerca nel sito…" autocomplete="off" autocorrect="off" spellcheck="false">' +
        '<span id="search-kbd">⌘K</span>' +
        '<button id="search-close" aria-label="Chiudi ricerca">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div id="search-results"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var input   = document.getElementById('search-input');
  var results = document.getElementById('search-results');

  // ── Render risultati ──────────────────────────────────────────
  function render(items, q) {
    if (!q || q.trim().length < 2) {
      results.innerHTML = '<p class="search-hint">Digita almeno 2 caratteri per cercare nel blog e nelle pagine.</p>';
      return;
    }
    if (!items.length) {
      results.innerHTML = '<p class="search-hint">Nessun risultato per <strong>' + q + '</strong>.</p>';
      return;
    }
    results.innerHTML = items.map(function (item, i) {
      return '<a href="' + item.url + '" class="search-result' + (i === 0 ? ' active' : '') + '">' +
        '<span class="search-result-cat">' + item.category + '</span>' +
        '<strong class="search-result-title">' + item.title + '</strong>' +
        '<span class="search-result-excerpt">' + item.excerpt.substring(0, 110) + '…</span>' +
        '</a>';
    }).join('');
  }

  input.addEventListener('input', function () {
    render(doSearch(this.value), this.value);
  });

  // ── Navigazione tastiera ──────────────────────────────────────
  input.addEventListener('keydown', function (e) {
    var items  = results.querySelectorAll('.search-result');
    var active = results.querySelector('.search-result.active');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!active) { if (items[0]) items[0].classList.add('active'); return; }
      active.classList.remove('active');
      ((active.nextElementSibling) || items[0]).classList.add('active');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!active) { if (items[items.length - 1]) items[items.length - 1].classList.add('active'); return; }
      active.classList.remove('active');
      ((active.previousElementSibling) || items[items.length - 1]).classList.add('active');
    } else if (e.key === 'Enter') {
      var t = results.querySelector('.search-result.active');
      if (t) window.location.href = t.href;
    } else if (e.key === 'Escape') {
      close();
    }
  });

  // ── Open / Close ──────────────────────────────────────────────
  function open() {
    overlay.classList.add('open');
    input.value = '';
    results.innerHTML = '<p class="search-hint">Digita almeno 2 caratteri per cercare nel blog e nelle pagine.</p>';
    requestAnimationFrame(function () { input.focus(); });
  }
  function close() {
    overlay.classList.remove('open');
  }

  document.getElementById('search-close').addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { close(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? close() : open();
    }
  });

  // Collega i pulsanti lente già nel DOM
  document.querySelectorAll('.nav-search-btn').forEach(function (btn) {
    btn.addEventListener('click', open);
  });

  window.openSiteSearch = open;
})();
