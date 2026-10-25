/* ==========================================================
   EFEITOS SONOROS DO SISTEMA
   Sons em assets/sfx/<nome>.mp3 (embutidos pelo build em SYS.SFX_DATA).
   click   · qualquer botão
   back    · voltar, fechar, OK das janelas
   buy     · compra com moedas
   crystal · gastar Cristais (e receber Cristais por código)
   potion  · beber poção ou elixir (também em combate)
   unequip · desequipar
   attack  · o teu ataque normal          skill · golpes das habilidades
   hurt    · golpe do chefe em ti         system · uma janela do Sistema surge
   notify  · aviso do Sistema no topo do ecrã
   gain    · recebeste Cristais            levelup · subiste de nível
   quest   · missão concluída / chefe vencido   sell · vender um item
   create  · criar missão    death · derrota ou fuga    emergency · missão de emergência
   penalty · penalização     arise · sombra extraída (Tornar Servo)
   fire / thunder / wind · habilidades de fogo, trovão e vento
   fury    · fúria (habilidades de fúria e chefe enfurecido)   warcry · grito de guerra, estandartes e exércitos
   heal    · habilidades de cura      buff · habilidades que melhoram o estado (bónus, escudos, mana)
   drink   · beber outras poções (bónus, elixires, tónicos)   equip · equipar   chest · abrir um baú
   achievement · conquista   arena_open · abrir uma cela do Coliseu   awaken · despertar (início)
   block · defender / escudo   chest_rare · baú com item lendário ou melhor   crit · golpe crítico
   daily · Missão Diária cumprida   dark / holy / ice · habilidades de sombra, luz e gelo
   victory · chefe derrotado   shadow_down · sombra perdida ou treino terminado   denied · aparelho bloqueado
   error · ação recusada   extract_fail · extração falhada   friend · pedido de amizade
   message · mensagem de um amigo   phase · o chefe muda de fase   summon · invocações e servos
   turn · a tua vez no duelo   type · o Sistema a escrever
   Web Audio: baixa latência, vários sons ao mesmo tempo, volume por som.
   O áudio só arranca depois do primeiro toque (regra dos telemóveis).
   ========================================================== */
(function (S) {
  'use strict';
  var GAIN = { click: 0.5, back: 0.4, buy: 0.85, crystal: 0.8, potion: 0.55, unequip: 0.95, attack: 0.8, skill: 0.75, hurt: 0.75, system: 0.7, notify: 0.7, gain: 0.85, levelup: 0.9, quest: 0.85, sell: 0.75, create: 0.7, death: 0.9, emergency: 0.85, penalty: 0.85, arise: 0.95, fire: 0.8, thunder: 0.75, wind: 0.8, fury: 0.8, warcry: 0.85, heal: 0.7, buff: 0.7, drink: 0.7, equip: 0.85, chest: 0.85,
    achievement: 0.85, arena_open: 0.9, awaken: 0.9, block: 0.8, chest_rare: 0.9, crit: 0.85, daily: 0.85, dark: 0.8, victory: 0.85, shadow_down: 0.8,
    denied: 0.85, error: 0.6, extract_fail: 0.8, friend: 0.75, holy: 0.8, ice: 0.8, message: 0.7, phase: 0.9, summon: 0.8, turn: 0.75, type: 0.18 };
  var ctx = null, bufs = {}, last = {}, failed = false;

  function settings() { var st = S.engine && S.engine.state; return (st && st.settings) || {}; }
  function enabled() { return settings().sound !== false; }
  function volume() { var v = settings().soundVol; return v == null ? 0.8 : Math.max(0, Math.min(1, v)); }

  function decode(name) {
    var src = (S.SFX_DATA || {})[name];
    if (!src || !ctx) return;
    try {
      var bin = atob(src.slice(src.indexOf(',') + 1)), u = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      var p = ctx.decodeAudioData(u.buffer, function (b) { bufs[name] = b; }, function () { /* formato não suportado */ });
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* ignora */ }
  }
  function init() {
    if (ctx || failed) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { failed = true; return null; }
      ctx = new AC();
      Object.keys(S.SFX_DATA || {}).forEach(decode);
    } catch (e) { failed = true; }
    return ctx;
  }
  function play(name, gain) {
    if (!enabled()) return;
    var c = init();
    if (!c) return;
    if (c.state === 'suspended' && c.resume) c.resume();
    var t = Date.now();
    if (last[name] && t - last[name] < 55) return; // evita sons empilhados no mesmo toque
    last[name] = t;
    var b = bufs[name];
    if (!b) return;
    try {
      var src = c.createBufferSource(), g = c.createGain();
      src.buffer = b;
      g.gain.value = (GAIN[name] || 1) * (gain == null ? 1 : gain) * volume();
      src.connect(g); g.connect(c.destination);
      src.start(0);
      S.sfx.log.push(name); if (S.sfx.log.length > 20) S.sfx.log.shift(); // registo (testes)
    } catch (e) { /* ignora */ }
  }
  /* o primeiro toque desbloqueia o áudio e prepara os sons */
  function unlock() { init(); if (ctx && ctx.state === 'suspended' && ctx.resume) ctx.resume(); }
  if (typeof document !== 'undefined') {
    document.addEventListener('pointerdown', unlock, { passive: true, capture: true });
    document.addEventListener('touchstart', unlock, { passive: true, capture: true });
    document.addEventListener('visibilitychange', function () { if (ctx && document.visibilityState === 'hidden' && ctx.suspend) ctx.suspend(); });
  }
  /* sons que chegaram depois (pré-visualização: ficheiro à parte) */
  function reload() { if (ctx) Object.keys(S.SFX_DATA || {}).forEach(function (k) { if (!bufs[k]) decode(k); }); }
  S.sfx = { play: play, init: init, reload: reload, has: function (n) { return !!(S.SFX_DATA || {})[n]; }, log: [], ready: function () { return Object.keys(bufs); } };
})(globalThis.SYS = globalThis.SYS || {});
