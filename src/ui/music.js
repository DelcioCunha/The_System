/* ==========================================================
   MÚSICA: trilhas dos chefes finais, créditos e duelos
   - assets/music/<id>.mp3 (b10…b100 reis dos portões, ar1…ar10 Campeões, credits, duel)
   - ficheiros à parte (não embutidos); Web Audio com tempo exato
   - em batalha toca em loop contínuo: o loop salta o silêncio do início e a cauda que se apaga
     no fim (pontos em assets/music/loops.json, calculados por tools/music_loops.py) e as duas
     pontas cruzam-se durante XFADE segundos, por isso nunca soa a "acabou e recomeçou"
   - ao abrir a ficha do chefe toca uma vez (pré-escuta), do princípio ao fim
   - respeita o interruptor e o volume da música nas Definições; para quando a app vai para segundo plano
   ========================================================== */
(function (S) {
  'use strict';
  var M = S.music = { current: null, loop: false, XFADE: 1.2 };
  var cache = {}, loading = {}, token = 0, master = null, voices = [], timer = null;

  function settings() { var st = S.engine && S.engine.state; return (st && st.settings) || {}; }
  M.enabled = function () { var s = settings(); return s.music !== false && s.sound !== false; };
  M.volume = function () { var v = settings().musicVol; return v == null ? 0.55 : Math.max(0, Math.min(1, v)); };
  M.has = function (id) { return !!(S.MUSIC && S.MUSIC[id]); };
  function ctx() { return S.sfx && S.sfx.init ? S.sfx.init() : null; }
  /* pontos de loop [início, fim] dentro da faixa */
  M.points = function (id, b) {
    var p = (S.MUSIC_LOOP || {})[id], dur = b ? b.duration : (p ? p[2] : 0);
    var s = p ? Math.max(0, p[0]) : 0, e = p ? Math.min(dur || p[1], p[1]) : dur;
    if (!(e - s > M.XFADE * 3)) { s = 0; e = dur; }
    return [s, e];
  };

  function load(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    if (loading[id]) return loading[id];
    var c = ctx(), url = S.MUSIC && S.MUSIC[id];
    if (!c || !url || typeof fetch !== 'function') return Promise.resolve(null);
    loading[id] = fetch(url).then(function (r) { return r.ok ? r.arrayBuffer() : null; }).then(function (ab) {
      if (!ab) return null;
      return new Promise(function (res) { var p = c.decodeAudioData(ab, res, function () { res(null); }); if (p && p.catch) p.catch(function () { res(null); }); });
    }).then(function (b) {
      delete loading[id];
      if (b) { cache[id] = b; Object.keys(cache).forEach(function (k) { if (k !== id && k !== M.current) delete cache[k]; }); } // guarda só a que toca
      return b;
    }, function () { delete loading[id]; return null; });
    return loading[id];
  }
  function bus(c) {
    if (!master) { master = c.createGain(); master.connect(c.destination); }
    master.gain.setValueAtTime(M.volume(), c.currentTime);
    return master;
  }
  /* uma "voz": um pedaço da faixa, de offset até ao fim do segmento, com subida e descida de volume */
  function voice(c, b, at, offset, length, fadeIn, fadeOut) {
    var src = c.createBufferSource(), g = c.createGain();
    src.buffer = b;
    g.gain.setValueAtTime(fadeIn ? 0 : 1, at);
    if (fadeIn) g.gain.linearRampToValueAtTime(1, at + fadeIn);
    if (fadeOut) { g.gain.setValueAtTime(1, at + length - fadeOut); g.gain.linearRampToValueAtTime(0, at + length); }
    src.connect(g); g.connect(bus(c));
    src.start(at, offset, length + 0.02);
    var v = { src: src, g: g, end: at + length };
    src.onended = function () { voices = voices.filter(function (x) { return x !== v; }); if (!M.loop && !voices.length && M.current && !timer) { M.ended = M.current; M.current = null; } };
    voices.push(v);
    return v;
  }
  /* loop contínuo: cada volta começa XFADE segundos antes de a anterior acabar, e as duas cruzam-se */
  function schedule(c, b, id, my, at, first) {
    if (my !== token) return;
    var p = M.points(id, b), X = M.XFADE, len = p[1] - p[0];
    // a primeira volta começa no princípio da faixa (com a introdução); as seguintes no ponto de loop
    var off = first ? Math.min(p[0], 0) : p[0], seg = first ? p[1] : len;
    voice(c, b, at, off, seg, first ? 0.6 : X, X);
    var next = at + seg - X;
    timer = setTimeout(function () { timer = null; if (my === token && M.loop) schedule(c, b, id, my, next, false); }, Math.max(0, (next - c.currentTime - 1.5) * 1000));
  }
  function stopAll(fade) {
    var c = ctx();
    if (timer) { clearTimeout(timer); timer = null; }
    var vs = voices; voices = [];
    if (!c) return;
    vs.forEach(function (v) {
      try {
        var t0 = c.currentTime;
        if (fade) { v.g.gain.cancelScheduledValues(t0); v.g.gain.setValueAtTime(v.g.gain.value, t0); v.g.gain.linearRampToValueAtTime(0, t0 + fade); v.src.stop(t0 + fade + 0.05); }
        else v.src.stop();
      } catch (e) { /* ignora */ }
    });
  }
  /* toca uma faixa: loop contínuo (batalha) ou uma vez (pré-escuta) */
  M.play = function (id, opts) {
    opts = opts || {};
    var loop = !!opts.loop;
    if (!M.enabled() || !M.has(id)) return M.stop();
    if (M.current === id && (voices.length || loading[id])) {
      // pré-escuta que passa a batalha: continua a mesma música e liga o loop
      if (loop && !M.loop) {
        M.loop = true;
        var c0 = ctx(), b0 = cache[id], last = voices[voices.length - 1];
        if (c0 && b0 && last && !timer) {
          var p = M.points(id, b0), into = c0.currentTime - (last.end - b0.duration), left = p[1] - into;
          if (left > M.XFADE * 2) {
            // corta a cauda desta volta e prepara a próxima a partir do ponto de loop
            var cut = c0.currentTime + left;
            try { last.g.gain.cancelScheduledValues(c0.currentTime); last.g.gain.setValueAtTime(1, cut - M.XFADE); last.g.gain.linearRampToValueAtTime(0, cut); last.src.stop(cut + 0.05); } catch (e) { /* ignora */ }
            var my0 = token;
            timer = setTimeout(function () { timer = null; if (my0 === token && M.loop) schedule(c0, b0, id, my0, cut - M.XFADE, false); }, Math.max(0, (cut - M.XFADE - c0.currentTime - 1.5) * 1000));
          }
        }
      }
      return;
    }
    stopAll(0.5);
    M.current = id; M.loop = loop;
    var my = ++token;
    load(id).then(function (b) {
      var c = ctx();
      if (!b || !c || my !== token || M.current !== id) return;
      if (c.state === 'suspended' && c.resume) c.resume();
      try {
        if (M.loop) schedule(c, b, id, my, c.currentTime + 0.05, true);
        else voice(c, b, c.currentTime + 0.05, 0, b.duration, 0.6, 0);
      } catch (e) { /* ignora */ }
    });
  };
  M.preload = function (id) { if (M.enabled() && M.has(id) && !cache[id]) load(id); };
  M.stop = function (fade) { token++; if (!M.current && !voices.length) return; M.current = null; M.loop = false; stopAll(fade == null ? 0.6 : fade); };
  M.setVolume = function () { var c = ctx(); if (master && c) { try { master.gain.setValueAtTime(M.volume(), c.currentTime); } catch (e) { /* ignora */ } } };
  M.isPlaying = function (id) { return M.current === id && voices.length > 0; };
  M._bus = function () { return master; }; // testes
})(globalThis.SYS = globalThis.SYS || {});
