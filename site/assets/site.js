/* ==========================================================
   SITE OFICIAL DO SISTEMA · comportamento partilhado
   - campo de mana animado nos cabeçalhos · revelação ao rolar · números que contam
   - menu do telemóvel · transição entre páginas · preço e compra vindos do servidor
   - janela do Sistema (início) · evolução do avatar · duelo animado · Sistema vivo · lojas
   ========================================================== */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var C = window.SITE_CONFIG || {};
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function kz(n) { return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Kz'; }
  function num(n) { return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  /* ---------- menu e transição entre páginas ---------- */
  var mb = $('.menu-btn');
  if (mb) mb.addEventListener('click', function () { var o = document.body.classList.toggle('menu-open'); mb.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduce || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!/^[a-z-]+\.html(#.*)?$/.test(href) || a.getAttribute('aria-disabled') === 'true') return;
    if (href.split('#')[0] === location.pathname.split('/').pop()) return;
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(function () { location.href = href; }, 170);
  });
  window.addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });

  /* ---------- campo de mana: partículas e linhas de dados por trás dos cabeçalhos ---------- */
  $$('canvas.field').forEach(function (cv) {
    var ctx = cv.getContext && cv.getContext('2d'); if (!ctx) return;
    var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), P = [], mx = 0.5, my = 0.5, running = true, raf = 0;
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, W * H / 14000)); P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, z: .3 + Math.random() * .7, vx: (Math.random() - .5) * .25, vy: -.15 - Math.random() * .35, sq: Math.random() < .18 });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.x += p.vx * p.z + (mx - .5) * .15 * p.z; p.y += p.vy * p.z;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        var a = .25 + p.z * .55;
        if (p.sq) { ctx.strokeStyle = 'rgba(139,107,255,' + a * .7 + ')'; ctx.lineWidth = 1; ctx.strokeRect(p.x, p.y, 5 * p.z + 2, 5 * p.z + 2); }
        else { ctx.fillStyle = 'rgba(111,214,255,' + a + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.1 + p.z * 1.4, 0, 6.283); ctx.fill(); }
        for (var j = i + 1; j < P.length; j++) {
          var q = P[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 9000) { ctx.strokeStyle = 'rgba(111,214,255,' + (1 - d / 9000) * .12 + ')'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
      }
      if (running && !reduce) raf = requestAnimationFrame(draw);
    }
    size(); draw();
    window.addEventListener('resize', function () { size(); if (reduce) draw(); });
    cv.parentNode.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height; });
    if (window.IntersectionObserver) new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting; if (vis && !running) { running = true; draw(); } else if (!vis) { running = false; cancelAnimationFrame(raf); }
    }).observe(cv);
  });

  /* ---------- revelação ao rolar e números que contam ---------- */
  function countUp(el) {
    var to = +el.getAttribute('data-count'), t0 = 0, dur = 1200;
    if (reduce || !to) { el.textContent = num(to); return; }
    (function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur); el.textContent = num(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(performance.now());
  }
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; e.target.classList.add('in'); $$('[data-count]', e.target).forEach(countUp); if (e.target.hasAttribute('data-count')) countUp(e.target); io.unobserve(e.target); }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('.rv, [data-count]').forEach(function (el) { io.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); $$('[data-count]').forEach(countUp); }
  $$('[data-stagger]').forEach(function (g) { $$('.rv', g).forEach(function (el, i) { el.style.setProperty('--d', i); }); });

  /* ---------- brilho que segue o ponteiro nos cartões e inclinação dos chefes ---------- */
  $$('a.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  if (!reduce) $$('.tilt').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; t.style.transform = 'perspective(700px) rotateY(' + x * 10 + 'deg) rotateX(' + -y * 10 + 'deg) translateY(-4px)'; });
    t.addEventListener('pointerleave', function () { t.style.transform = ''; });
  });

  /* ---------- preço e compra: o servidor manda; config.js é a reserva ---------- */
  var info = { price: C.price_kz || 0, old: C.price_old_kz || 0, wa: null, legal: null };
  function waLink() {
    if (info.wa) return info.wa;
    var n = String(C.whatsapp || '').replace(/\D/g, ''); if (!n) return null;
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent('Olá! Quero comprar o código de ativação do Sistema' + (info.price ? ' (' + kz(info.price) + ')' : '') + '. Vou pagar por Multicaixa Express.');
  }
  function paint() {
    $$('[data-bind="price"]').forEach(function (e) { e.textContent = info.price ? kz(info.price) : 'Consulta o preço'; });
    $$('[data-bind="price-old"]').forEach(function (e) { e.textContent = info.old > info.price ? kz(info.old) : ''; e.hidden = !(info.old > info.price); });
    $$('[data-bind="price-line"]').forEach(function (e) { e.textContent = info.price ? 'Ativação por ' + kz(info.price) : 'Ativação única'; });
    $$('[data-bind="legal"]').forEach(function (e) { e.textContent = info.legal != null ? num(info.legal) : '—'; });
    $$('[data-legal-row]').forEach(function (e) { e.hidden = info.legal == null; });
    var link = waLink();
    $$('[data-buy]').forEach(function (a) {
      if (link) { a.href = link; a.target = '_blank'; a.rel = 'noopener'; a.removeAttribute('aria-disabled'); }
      else { a.href = 'comprar.html#perguntas'; a.removeAttribute('target'); a.setAttribute('aria-disabled', 'true'); }
    });
  }
  paint();
  if (C.api && window.fetch) fetch(C.api.replace(/\/$/, '') + '/api/site', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j || !j.ok) return;
    if (j.price_kz) info.price = j.price_kz; info.old = j.price_old_kz || 0;
    if (j.whatsapp_url) info.wa = j.whatsapp_url;
    if (typeof j.legal_players === 'number' && j.legal_players > 0) info.legal = j.legal_players;
    paint();
  }).catch(function () { /* sem servidor: ficam os valores do config.js */ });

  /* ---------- APK: o botão só fica ativo se o ficheiro existir ---------- */
  $$('[data-apk-info]').forEach(function (e) { e.textContent = 'Versão ' + (C.apk_version || '1.0') + (C.apk_size ? ' · ' + C.apk_size : '') + ' · ' + (C.min_android || 'Android'); });
  $$('[data-apk]').forEach(function (a) { a.href = C.apk || 'download/sistema.apk'; });
  function apkMissing() {
    $$('[data-apk]').forEach(function (a) {
      a.setAttribute('aria-disabled', 'true'); a.removeAttribute('download');
      a.addEventListener('click', function (e) { e.preventDefault(); });
      var l = $('[data-apk-label]', a) || a; l.textContent = a.hasAttribute('data-apk-short') ? 'APK em breve' : 'APK disponível em breve';
    });
  }
  if ($('[data-apk]')) {
    if (location.protocol === 'file:') apkMissing();
    else if (window.fetch) fetch(C.apk || 'download/sistema.apk', { method: 'HEAD' }).then(function (r) { if (!r.ok) apkMissing(); }).catch(apkMissing);
  }

  /* ---------- escrever como o Sistema ---------- */
  function type(el, text, done, speed) {
    if (reduce) { el.textContent = text; if (done) done(); return; }
    var i = 0; el.innerHTML = '<span></span><span class="caret"></span>'; var out = el.firstChild;
    (function step() {
      if (!el.isConnected) return;
      i = Math.min(text.length, i + 1); out.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(step, /[.,?!]/.test(text.charAt(i - 1)) ? 240 : (speed || 30));
      else if (done) done();
    })();
  }

  /* janela do Sistema da página inicial */
  var win = $('#syswin');
  if (win) {
    var msg = $('#sys-msg'), act = $('#sys-act'), noCount = 0;
    type(msg, 'Cumpriste as condições. Foste escolhido para te tornares um Jogador. Aceitas?', function () { act.hidden = false; });
    act.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sys]'); if (!b) return;
      act.hidden = true;
      if (b.getAttribute('data-sys') === 'yes') type(msg, 'Registo iniciado. Primeiro passo: obter o código de ativação.', function () { setTimeout(function () { location.href = 'comprar.html'; }, 900); });
      else {
        noCount++; if (!reduce) { win.classList.remove('glitch'); void win.offsetWidth; win.classList.add('glitch'); }
        type(msg, noCount > 1 ? 'Recusar continua indisponível. O Sistema já te escolheu.' : 'A opção «Recusar» não está disponível. Aceitas?', function () { act.hidden = false; });
      }
    });
  }

  /* ---------- telemóveis com capturas que alternam ---------- */
  $$('.phone').forEach(function (ph) {
    var shots = $$('.shots img', ph), dots = $('.dots', ph), i = 0; if (shots.length < 2) return;
    if (dots) dots.innerHTML = shots.map(function (_, k) { return '<i' + (k ? '' : ' class="on"') + '></i>'; }).join('');
    if (reduce) return;
    setInterval(function () { shots[i].classList.remove('on'); if (dots) dots.children[i].classList.remove('on'); i = (i + 1) % shots.length; shots[i].classList.add('on'); if (dots) dots.children[i].classList.add('on'); }, 3400);
  });

  /* ---------- avatar do nível 1: aparência masculina ou feminina (as formas futuras ficam escondidas) ---------- */
  var evoImg = $('#evo-img');
  if (evoImg) $$('.seg button[data-g]').forEach(function (b) {
    b.addEventListener('click', function () {
      var g = b.getAttribute('data-g');
      $$('.seg button[data-g]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      evoImg.classList.add('out');
      setTimeout(function () { evoImg.src = 'img/evo-' + g + '-1.webp'; evoImg.alt = (g === 'f' ? 'Guerreira' : 'Guerreiro') + ' no nível 1'; evoImg.classList.remove('out'); $$('.locked img').forEach(function (i) { i.src = evoImg.src; }); }, reduce ? 0 : 220);
    });
  });

  /* ---------- duelo animado (página dos duelos) ---------- */
  var duel = $('#duel');
  if (duel) {
    var log = $('.log', duel), hpA = $('#hpA'), hpB = $('#hpB'), mpA = $('#mpA'), mpB = $('#mpB'), tn = $('#duel-turn');
    var SCRIPT = [
      ['l', 'Delcio usa Golpe Pesado: 412 de dano.', 0, 18, 6, 0], ['r', 'Ana usa Chuva de Flechas: 5 flechas, 388 de dano.', 16, 0, 0, 12],
      ['l', 'Delcio usa Fúria Sanguinária: +50% de ataque.', 0, 0, 14, 0], ['r', 'Ana esquiva-se do ataque.', 0, 0, 0, 0],
      ['l', 'Delcio usa Corte do Titã: 1 120 de dano. Crítico!', 0, 34, 22, 0], ['s', 'Ana bebe uma Poção de Vida (+30%).', 0, -20, 0, 0],
      ['r', 'Ana usa Tiro Perfurante: 640 de dano, ignora a defesa.', 24, 0, 0, 18], ['l', 'Delcio usa Grito de Guerra: +30% de ataque.', 0, 0, 10, 0],
      ['r', 'Ana tenta fugir. O Sistema não deixa.', 0, 0, 0, 0], ['l', 'Delcio usa Ira do Rei Guerreiro: 2 300 de dano.', 0, 68, 35, 0],
      ['s', 'Vitória de Delcio. +1 ponto de patente.', 0, 0, 0, 0]
    ];
    var k = 0, A = 100, B = 100, MA = 100, MB = 100, turn = 1, dt = null;
    function set() { hpA.style.width = A + '%'; hpB.style.width = B + '%'; mpA.style.width = MA + '%'; mpB.style.width = MB + '%'; tn.textContent = 'Turno ' + turn; }
    function stepD() {
      if (k >= SCRIPT.length) { k = 0; A = B = MA = MB = 100; turn = 1; log.innerHTML = ''; set(); return; }
      var s = SCRIPT[k++], p = document.createElement('p'); p.className = s[0]; p.textContent = s[1]; log.appendChild(p);
      while (log.children.length > 7) log.removeChild(log.firstChild);
      A = Math.max(0, Math.min(100, A - s[2])); B = Math.max(0, Math.min(100, B - s[3])); MA = Math.max(0, MA - s[4]) + 4; MB = Math.max(0, MB - s[5]) + 4; MA = Math.min(100, MA); MB = Math.min(100, MB);
      if (s[2] > 0) $('#fA').classList.remove('hit'), void duel.offsetWidth, $('#fA').classList.add('hit');
      if (s[3] > 0) $('#fB').classList.remove('hit'), void duel.offsetWidth, $('#fB').classList.add('hit');
      if (s[0] !== 's') turn++;
      set();
    }
    set();
    if (reduce) { for (var q = 0; q < 6; q++) stepD(); }
    else if (window.IntersectionObserver) new IntersectionObserver(function (es) { if (es[0].isIntersecting && !dt) dt = setInterval(stepD, 1500); else if (!es[0].isIntersecting) { clearInterval(dt); dt = null; } }).observe(duel);
  }

  /* ---------- Sistema vivo: avisos que vão chegando ---------- */
  var feed = $('#feed');
  if (feed) {
    var N = [
      ['ui-eye', '', 'SISTEMA', 'Bom dia. Tens 4 missões para hoje e a Diária ainda está a zeros.'],
      ['h-mission-fail', 'red', 'MISSÃO DE EMERGÊNCIA', 'Faz 15 flexões. Tens 20 minutos. Não te perguntei se tinhas tempo.'],
      ['ui-eye', '', 'SISTEMA', '«Ler 20 páginas» foi concluída 2 minutos depois de ser criada. Registado.'],
      ['h-chains', 'red', 'ZONA DE PENALIDADE', 'Falhaste a Diária. Tens 24 horas para cumprir o castigo.'],
      ['h-key', 'gold', 'MISSÃO OCULTA', 'Desbloqueaste uma missão que não aparece em nenhum lado. Recompensa rara.'],
      ['ui-eye', '', 'SISTEMA', 'Hora Morta. A esta hora até os chefes dormem. Tu não devias.'],
      ['h-mission-done', 'gold', 'RELATÓRIO SEMANAL', 'Nota da semana: A. Cumpriste 31 de 34 missões. Quase te elogio.'],
      ['ui-eye', '', 'SISTEMA', 'Faltam 30 minutos para o prazo de «Treino de 45 minutos».']
    ], ni = 0;
    function push() {
      var n = N[ni++ % N.length], d = document.createElement('div');
      d.className = 'note ' + n[1]; d.innerHTML = '<img src="img/ui-' + n[0] + '.webp" alt=""><div><b>' + n[2] + '</b><p>' + n[3] + '</p></div>';
      feed.appendChild(d); while (feed.children.length > 5) feed.removeChild(feed.firstChild);
    }
    for (var f0 = 0; f0 < 3; f0++) push();
    var ft = null;
    if (!reduce && window.IntersectionObserver) new IntersectionObserver(function (es) { if (es[0].isIntersecting && !ft) ft = setInterval(push, 2600); else if (!es[0].isIntersecting) { clearInterval(ft); ft = null; } }).observe(feed);
  }
  /* integridade a descer e a subir (Sistema vivo) */
  var meter = $('#trust');
  if (meter && !reduce && window.IntersectionObserver) {
    var tv = [100, 80, 55, 70, 90, 100], ti = 0, mlab = $('#trust-v');
    new IntersectionObserver(function (es) { if (!es[0].isIntersecting) return; setInterval(function () { ti = (ti + 1) % tv.length; meter.style.width = tv[ti] + '%'; mlab.textContent = tv[ti] + '%'; }, 1700); }, {}).observe(meter);
  }

  /* ---------- separadores (lojas) ---------- */
  $$('[role="tablist"]').forEach(function (tl) {
    var tabs = $$('[role="tab"]', tl);
    function open(t) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { open(t); });
      t.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); open(n); } });
    });
    var h = location.hash.slice(1), want = h && $('[role="tab"][aria-controls="' + h + '"]', tl);
    open(want || tabs[0]);
  });

  /* ---------- barra de compra no telemóvel depois do cabeçalho ---------- */
  var bar = $('#mbar'), head = $('.hero, .page-head');
  if (bar && head && window.IntersectionObserver) new IntersectionObserver(function (es) { bar.classList.toggle('on', !es[0].isIntersecting); }).observe(head);
})();
