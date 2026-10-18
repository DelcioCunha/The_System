/* ==========================================================
   EFEITOS VISUAIS
   - fundo: partículas de mana que sobem (mais intensas em combate)
   - camada de partículas: explosões e faíscas
   - camada DOM: números de dano, cortes, círculos mágicos, faixas,
     clarões, portal, despertar
   Modo "reduzido": sem partículas, sem tremer o ecrã.
   ========================================================== */
(function (S) {
  'use strict';
  var FX = S.fx = {};
  var layer, bg, bgCtx, fc, fCtx;
  var dots = [], parts = [];
  var running = false, bgRunning = false;
  var W = 0, H = 0, DPR = 1;
  var mode = 'full';
  var battleTint = 0, battleTarget = 0;

  FX.full = function () { return mode === 'full'; };
  FX.setMode = function (m) {
    mode = m === 'reduced' ? 'reduced' : 'full';
    var root = document.documentElement;
    root.classList.toggle('fx-full', mode === 'full');
    root.classList.toggle('fx-reduced', mode !== 'full');
    if (mode === 'full') startBg(); else stopBg();
  };
  FX.defaultMode = function () {
    try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced'; } catch (e) { /* ignora */ }
    return 'full';
  };

  function ctx2d(c) { try { return c.getContext && c.getContext('2d'); } catch (e) { return null; } }

  FX.init = function () {
    layer = document.createElement('div'); layer.id = 'fx-layer';
    bg = document.createElement('canvas'); bg.id = 'bg-fx';
    fc = document.createElement('canvas'); fc.id = 'fx-canvas';
    document.body.insertBefore(bg, document.body.firstChild);
    document.body.appendChild(layer);
    document.body.appendChild(fc);
    bgCtx = ctx2d(bg); fCtx = ctx2d(fc);
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && mode === 'full') startBg(); });
    for (var i = 0; i < 46; i++) dots.push(newDot(true));
  };
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth || 400; H = window.innerHeight || 800;
    [bg, fc].forEach(function (c) { if (!c) return; c.width = W * DPR; c.height = H * DPR; });
    if (bgCtx) bgCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (fCtx) fCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ---------------- fundo ---------------- */
  function newDot(anywhere) {
    return {
      x: Math.random() * W, y: anywhere ? Math.random() * H : H + 10,
      r: .6 + Math.random() * 1.8, v: .15 + Math.random() * .5, sway: Math.random() * Math.PI * 2,
      a: .2 + Math.random() * .6, tw: Math.random() * Math.PI * 2, streak: Math.random() < .08
    };
  }
  function startBg() { if (bgRunning || !bgCtx || mode !== 'full') return; bgRunning = true; requestAnimationFrame(bgLoop); }
  function stopBg() { bgRunning = false; if (bgCtx) bgCtx.clearRect(0, 0, W, H); }
  FX.battle = function (on) { battleTarget = on ? 1 : 0; document.body.classList.toggle('battle-mode', !!on); };
  function bgLoop() {
    if (!bgRunning) return;
    if (document.visibilityState === 'hidden') { bgRunning = false; return; }
    battleTint += (battleTarget - battleTint) * .03;
    var c = bgCtx;
    c.clearRect(0, 0, W, H);
    var speed = 1 + battleTint * 1.6;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      d.y -= d.v * speed; d.sway += .01; d.tw += .05;
      d.x += Math.sin(d.sway) * .25;
      if (d.y < -20) dots[i] = d = newDot(false);
      var al = d.a * (.6 + .4 * Math.sin(d.tw));
      var r = Math.round(111 + (255 - 111) * battleTint), g = Math.round(214 - 150 * battleTint), b = Math.round(255 - 140 * battleTint);
      if (d.streak) {
        var grd = c.createLinearGradient(d.x, d.y, d.x, d.y + 26);
        grd.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + al + ')');
        grd.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
        c.fillStyle = grd; c.fillRect(d.x - .6, d.y, 1.2, 26);
      } else {
        c.beginPath(); c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        c.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + al + ')';
        c.shadowColor = 'rgba(' + r + ',' + g + ',' + b + ',1)'; c.shadowBlur = 6;
        c.fill(); c.shadowBlur = 0;
      }
    }
    requestAnimationFrame(bgLoop);
  }

  /* ---------------- partículas ---------------- */
  function hexToRgb(h) {
    h = String(h || '#6fd6ff').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  FX.burst = function (x, y, color, n, opts) {
    if (mode !== 'full' || !fCtx) return;
    opts = opts || {};
    var rgb = hexToRgb(color);
    n = n || 40;
    for (var i = 0; i < n; i++) {
      var ang = opts.up ? (-Math.PI / 2 + (Math.random() - .5) * 1.4) : Math.random() * Math.PI * 2;
      var sp = (opts.speed || 6) * (.3 + Math.random());
      parts.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, decay: .012 + Math.random() * .02,
        r: 1 + Math.random() * (opts.size || 3), rgb: Math.random() < .25 ? [255, 255, 255] : rgb, g: opts.gravity == null ? .08 : opts.gravity, spark: Math.random() < .4 });
    }
    if (!running) { running = true; requestAnimationFrame(partLoop); }
  };
  FX.rise = function (x, y, w, color, n) {
    if (mode !== 'full' || !fCtx) return;
    var rgb = hexToRgb(color);
    for (var i = 0; i < (n || 30); i++) {
      parts.push({ x: x + (Math.random() - .5) * w, y: y + Math.random() * 40, vx: (Math.random() - .5) * .6, vy: -1.5 - Math.random() * 3, life: 1, decay: .01 + Math.random() * .012,
        r: 1 + Math.random() * 2.5, rgb: rgb, g: -.02, spark: true });
    }
    if (!running) { running = true; requestAnimationFrame(partLoop); }
  };
  function partLoop() {
    var c = fCtx;
    c.clearRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vx *= .97; p.vy = p.vy * .97 + p.g; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      var a = Math.max(0, p.life);
      c.fillStyle = 'rgba(' + p.rgb[0] + ',' + p.rgb[1] + ',' + p.rgb[2] + ',' + a + ')';
      if (p.spark) {
        c.save(); c.translate(p.x, p.y); c.rotate(Math.atan2(p.vy, p.vx));
        c.fillRect(-p.r * 2.5, -p.r * .35, p.r * 5, p.r * .7); c.restore();
      } else {
        c.beginPath(); c.arc(p.x, p.y, p.r * (0.5 + a * .5), 0, Math.PI * 2); c.fill();
      }
    }
    c.globalCompositeOperation = 'source-over';
    if (parts.length) requestAnimationFrame(partLoop);
    else { running = false; c.clearRect(0, 0, W, H); }
  }

  /* ---------------- elementos DOM ---------------- */
  function el(cls, x, y, css, html, life) {
    if (!layer) return null;
    var d = document.createElement('div');
    d.className = cls;
    if (x != null) d.style.left = x + 'px';
    if (y != null) d.style.top = y + 'px';
    if (css) Object.keys(css).forEach(function (k) { d.style.setProperty(k, css[k]); });
    if (html != null) d.innerHTML = html;
    layer.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, life || 1800);
    return d;
  }
  FX.center = function (node) {
    if (!node || !node.getBoundingClientRect) return { x: W / 2, y: H / 2 };
    var r = node.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  };
  FX.text = function (txt, x, y, color, delay) {
    var go = function () { el('float-txt', x, y, { color: color || 'var(--glow)' }, txt, 1400); };
    if (delay) setTimeout(go, delay); else go();
  };
  FX.number = function (txt, x, y, kind, delay) {
    var go = function () { el('dmg-num ' + (kind || ''), x + (Math.random() - .5) * 50, y + (Math.random() - .5) * 20, null, txt, 1100); };
    if (delay) setTimeout(go, delay); else go();
  };
  FX.tap = function (x, y) { if (mode === 'full') el('tap-ring', x, y, null, null, 600); };
  FX.flash = function (color, o) { el('screen-flash', null, null, { background: color || '#fff', '--o': o || .5 }, null, 600); };
  FX.vignette = function () { el('hurt-vignette', null, null, null, null, 800); };
  FX.shock = function (x, y, color) {
    var d = el('shock', null, null, { '--c': color || 'var(--gold)' }, null, 1000);
    if (d && x != null) { d.style.left = x + 'px'; d.style.top = y + 'px'; }
  };
  FX.banner = function (txt, sub, color, glow) {
    el('banner', null, null, { '--c': color || 'rgba(111,214,255,.45)', '--c2': glow || '#6fd6ff' }, txt + (sub ? '<small>' + sub + '</small>' : ''), 1800);
  };
  FX.shake = function (level) {
    if (mode !== 'full') return;
    var app = document.getElementById('app');
    if (!app) return;
    app.classList.remove('shake-1', 'shake-2', 'shake-3');
    void app.offsetWidth;
    app.classList.add('shake-' + Math.max(1, Math.min(3, level)));
    setTimeout(function () { app.classList.remove('shake-' + level); }, 700);
  };
  FX.vibrate = function (p) {
    try { if (S.engine.state && S.engine.state.settings.vibrate && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* sem vibração */ }
  };

  /* ---------------- ataques ---------------- */
  FX.attack = function (style, x, y, color, hits, crit) {
    hits = Math.max(1, Math.min(10, hits || 1));
    var gap = hits > 4 ? 70 : 110;
    for (var i = 0; i < hits; i++) {
      (function (i) {
        setTimeout(function () {
          var rot = -35 + Math.random() * 70 + (i % 2 ? 90 : 0);
          if (style === 'slash') {
            el('slash', x, y, { '--r': rot + 'deg', '--c': color }, null, 500);
            if (crit) el('slash', x, y, { '--r': (rot + 90) + 'deg', '--c': '#ffc85a' }, null, 500);
          } else if (style === 'quick') {
            el('slash', x + (Math.random() - .5) * 40, y + (Math.random() - .5) * 40, { '--r': rot + 'deg', '--c': color, width: '140px', 'margin-left': '-70px' }, null, 500);
          } else if (style === 'magic') {
            el('magic-circle', x, y, { '--c': color }, null, 900);
            el('impact', x, y, { '--c': color }, null, 600);
          } else if (style === 'arrow') {
            el('arrow-streak', x + (Math.random() - .5) * 30, y - 40, { '--c': color, '--r': ((Math.random() - .5) * 20) + 'deg' }, null, 500);
            setTimeout(function () { el('impact', x, y, { '--c': color }, null, 600); }, 260);
          } else if (style === 'impact') {
            el('impact', x, y, { '--c': color }, null, 600);
            FX.shock(x, y, color);
          } else if (style === 'spirit') {
            el('wisp', x, y, { '--c': color, '--dx': ((Math.random() - .5) * 120) + 'px' }, null, 900);
            setTimeout(function () { el('impact', x, y, { '--c': color }, null, 600); }, 500);
          }
          FX.burst(x, y, crit ? '#ffc85a' : color, crit ? 26 : 12, { speed: crit ? 8 : 5 });
        }, i * gap);
      })(i);
    }
    return (hits - 1) * gap;
  };
  FX.chains = function (x, y) { el('chains', x, y, null, null, 900); };
  FX.stars = function (x, y) { el('stars', x, y, null, '⭐ 💫 ⭐', 1100); };
  FX.buff = function (x, y, color) { for (var i = 0; i < 3; i++) el('buff-up', x - 40 + i * 40, y, { color: color || 'var(--glow)', 'animation-delay': (i * 120) + 'ms' }, '⌃', 1200); };

  /* ---------------- transições grandes ---------------- */
  FX.portal = function (color, name, sub) {
    if (mode !== 'full') { FX.banner(name, sub, 'rgba(255,90,110,.45)', '#ff5a6e'); return; }
    el('portal', null, null, { '--c': color || '#6fd6ff' }, null, 1400);
    FX.flash(color || '#6fd6ff', .35);
    FX.vibrate([30, 60, 30]);
    setTimeout(function () { FX.banner(name, sub, 'rgba(255,90,110,.42)', '#ff5a6e'); }, 650);
  };
  FX.awaken = function (color) {
    var d = el('awaken', null, null, { '--c': color }, '<div class="col"></div><div class="word">DESPERTAR<small>O SISTEMA ESCOLHEU-TE</small></div>', 2200);
    if (!d) return;
    FX.vibrate([40, 80, 40, 80, 160]);
    setTimeout(function () { FX.rise(W / 2, H, 160, color, 80); }, 100);
    setTimeout(function () { FX.flash('#ffffff', .8); FX.burst(W / 2, H / 2, color, 90, { speed: 10 }); }, 1500);
  };
})(globalThis.SYS = globalThis.SYS || {});
