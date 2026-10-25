/* ==========================================================
   MÚSICA: trilhas dos chefes finais, créditos e duelos
   - assets/music/<id>.mp3 (b10…b100 reis dos portões, ar1…ar10 Campeões, credits, duel)
   - ficheiros à parte (não embutidos); Web Audio para o loop não ter falhas
   - em batalha toca em loop; ao abrir a ficha do chefe toca uma vez (pré-escuta)
   - respeita o interruptor e o volume da música nas Definições; para quando a app vai para segundo plano
   ========================================================== */
(function (S) {
  'use strict';
  var M = S.music = { current: null, loop: false };
  var cache = {}, loading = {}, node = null, gain = null, token = 0;

  function settings() { var st = S.engine && S.engine.state; return (st && st.settings) || {}; }
  M.enabled = function () { var s = settings(); return s.music !== false && s.sound !== false; };
  M.volume = function () { var v = settings().musicVol; return v == null ? 0.55 : Math.max(0, Math.min(1, v)); };
  M.has = function (id) { return !!(S.MUSIC && S.MUSIC[id]); };
  function ctx() { return S.sfx && S.sfx.init ? S.sfx.init() : null; }

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
  function stopNode(fade) {
    var c = ctx(), n = node, g = gain;
    node = null; gain = null;
    if (!n || !c) return;
    try {
      if (fade && g) { g.gain.cancelScheduledValues(c.currentTime); g.gain.setValueAtTime(g.gain.value, c.currentTime); g.gain.linearRampToValueAtTime(0, c.currentTime + fade); n.stop(c.currentTime + fade + 0.05); }
      else n.stop();
    } catch (e) { /* ignora */ }
  }
  /* toca uma faixa: loop (batalha) ou uma vez (pré-escuta) */
  M.play = function (id, opts) {
    opts = opts || {};
    var loop = !!opts.loop;
    if (!M.enabled() || !M.has(id)) return M.stop();
    if (M.current === id && node) { if (M.loop !== loop) { node.loop = loop; M.loop = loop; } return; }
    stopNode(0.5);
    M.current = id; M.loop = loop;
    var my = ++token;
    load(id).then(function (b) {
      var c = ctx();
      if (!b || !c || my !== token || M.current !== id) return;
      if (c.state === 'suspended' && c.resume) c.resume();
      try {
        var src = c.createBufferSource(), g = c.createGain();
        src.buffer = b; src.loop = M.loop;
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(M.volume(), c.currentTime + 0.8);
        src.connect(g); g.connect(c.destination);
        src.onended = function () { if (node === src) { node = null; gain = null; if (!M.loop) { M.current = null; M.ended = id; } } };
        src.start(0);
        node = src; gain = g;
      } catch (e) { /* ignora */ }
    });
  };
  M.stop = function (fade) { token++; if (!M.current && !node) return; M.current = null; M.loop = false; stopNode(fade == null ? 0.6 : fade); };
  M.setVolume = function () { var c = ctx(); if (gain && c) { try { gain.gain.setValueAtTime(M.volume(), c.currentTime); } catch (e) { /* ignora */ } } };
  M.isPlaying = function (id) { return M.current === id && !!node; };
})(globalThis.SYS = globalThis.SYS || {});
