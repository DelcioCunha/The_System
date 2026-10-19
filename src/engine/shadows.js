/* ==========================================================
   SOMBRAS — "Tornar Servo"
   Depois de derrotar um chefe dos portões, o Sistema deteta a sua
   sombra. Há 3 tentativas para a extrair. Se as 3 falharem, a sombra
   dissipa-se e esse chefe nunca poderá ser servo.
   A sombra fica à espera 24 horas; depois desvanece (perdida).
   Servos convocados lutam ao teu lado em todos os combates.
   ========================================================== */
(function (S) {
  'use strict';
  var E = S.engine;
  var now = function () { return S.clock ? S.clock.now() : Date.now(); };
  var rnd = function () { return S.rng ? S.rng.random() : Math.random(); };

  var R = S.SHADOW_RULES = {
    tries: 3,
    waitH: 24,                 // horas até a sombra desvanecer
    baseChance: 0.55,          // chefe normal
    kingChance: 0.32,          // rei do portão
    levelStep: 0.025,          // por nível de diferença (jogador acima = mais fácil)
    minChance: 0.08, maxChance: 0.9,
    summonerBonus: 0.12,       // Invocador: caminho das almas
    slotLevels: [1, 25, 50, 75], // níveis em que se ganha um lugar de servo convocado
    summonerExtraSlot: 1
  };

  /* papel do servo pelo arquétipo do chefe */
  var ROLES = {
    feroz: 'atacante', berserker: 'atacante', equilibrado: 'atacante',
    conjurador: 'arcano', tanque: 'guarda', rei: 'comandante'
  };
  var ROLE_INFO = S.SHADOW_ROLES = {
    atacante: { name: 'Atacante', desc: 'Ataca o inimigo em todos os turnos.' },
    arcano: { name: 'Arcano', desc: 'Ataca com magia e enfraquece a defesa do inimigo no primeiro turno.' },
    guarda: { name: 'Guarda', desc: 'Ataca com menos força, mas dá-te um escudo no início do combate.' },
    comandante: { name: 'Comandante', desc: 'Rei de um portão: ataque mais forte e +5% ao teu dano enquanto estiver convocado.' }
  };

  var Sh = S.shadows = {};

  Sh.eligible = function (b) { return !!b && !b.premium && !b.secret && /^b\d+$/.test(b.id); };

  Sh.ensure = function (st) {
    if (!st.shadows) {
      st.shadows = { owned: {}, tries: {}, lost: {}, pending: {}, active: [], names: {} };
      // chefes derrotados antes desta versão: a sombra ficou adormecida e pode ser extraída (sem prazo)
      Object.keys(st.defeated || {}).forEach(function (id) { if (Sh.eligible(S.BOSS_BY_ID[id])) st.shadows.pending[id] = { at: st.defeated[id], exp: 0 }; });
    }
    var s = st.shadows;
    ['owned', 'tries', 'lost', 'pending', 'names'].forEach(function (k) { if (!s[k]) s[k] = {}; });
    if (!Array.isArray(s.active)) s.active = [];
    return s;
  };

  /* sombras à espera que expiraram: perdidas */
  Sh.expire = function (st) {
    var s = Sh.ensure(st), t = now(), changed = false;
    Object.keys(s.pending).forEach(function (id) {
      var p = s.pending[id];
      if (p.exp && p.exp <= t) {
        delete s.pending[id]; s.lost[id] = t; changed = true;
        E.history(st, '🌫️', 'A sombra de ' + S.BOSS_BY_ID[id].name + ' desvaneceu sem ser extraída.');
      }
    });
    return changed;
  };

  Sh.triesLeft = function (st, id) { return Math.max(0, R.tries - (Sh.ensure(st).tries[id] || 0)); };

  Sh.chance = function (st, b) {
    var c = b.king ? R.kingChance : R.baseChance;
    c += (st.level - b.level) * R.levelStep;
    if (st.cls === 'invocador') c += R.summonerBonus;
    return Math.max(R.minChance, Math.min(R.maxChance, c));
  };

  Sh.status = function (st, id) {
    var s = Sh.ensure(st);
    if (s.owned[id]) return 'owned';
    if (s.lost[id]) return 'lost';
    if (s.pending[id]) return 'pending';
    return 'none';
  };

  /* chamado na vitória contra um chefe */
  Sh.onVictory = function (st, b) {
    if (!Sh.eligible(b)) return false;
    var s = Sh.ensure(st);
    if (s.owned[b.id] || s.lost[b.id] || Sh.triesLeft(st, b.id) < 1) return false;
    s.pending[b.id] = { at: now(), exp: now() + R.waitH * 3600000 };
    return true;
  };

  Sh.pendingList = function (st) {
    Sh.expire(st);
    var s = Sh.ensure(st);
    return Object.keys(s.pending).map(function (id) { return { id: id, def: S.BOSS_BY_ID[id], exp: s.pending[id].exp, tries: Sh.triesLeft(st, id) }; })
      .sort(function (a, c) { return (a.exp || 9e15) - (c.exp || 9e15); });
  };

  /* uma tentativa de extração */
  Sh.extract = function (id) {
    var st = E.state, s = Sh.ensure(st), b = S.BOSS_BY_ID[id];
    Sh.expire(st);
    if (!b || !s.pending[id]) return { ok: false, msg: s.lost[id] ? 'Esta sombra já se dissipou.' : 'Não há sombra para extrair.' };
    var left = Sh.triesLeft(st, id);
    if (left < 1) return { ok: false, msg: 'Não restam tentativas.' };
    var ch = Sh.chance(st, b);
    s.tries[id] = (s.tries[id] || 0) + 1;
    E.bump(st, 'shadowTries');
    if (rnd() < ch) {
      delete s.pending[id];
      s.owned[id] = now();
      E.bump(st, 'shadowsOwned');
      var auto = s.active.length < Sh.slots(st);
      if (auto) s.active.push(id);
      E.history(st, '🌑', 'Extraiu a sombra de ' + b.name + '. Agora é um servo' + (auto ? ' e já está convocado.' : '.'));
      E.commit('sombra extraída');
      return { ok: true, success: true, auto: auto, left: R.tries - s.tries[id], chance: ch };
    }
    left = R.tries - s.tries[id];
    if (left < 1) {
      delete s.pending[id];
      s.lost[id] = now();
      E.history(st, '🌫️', 'A sombra de ' + b.name + ' resistiu 3 vezes e dissipou-se para sempre.');
    }
    E.commit('extração falhada');
    return { ok: true, success: false, left: left, lost: left < 1, chance: ch };
  };

  /* deixa a sombra dissipar-se de propósito */
  Sh.release = function (id) {
    var st = E.state, s = Sh.ensure(st);
    if (!s.pending[id]) return { ok: false, msg: 'Não há sombra à espera.' };
    delete s.pending[id]; s.lost[id] = now();
    E.history(st, '🌫️', 'Deixou a sombra de ' + S.BOSS_BY_ID[id].name + ' dissipar-se.');
    E.commit('sombra libertada');
    return { ok: true };
  };

  /* lugares de servos convocados */
  Sh.slots = function (st) {
    var n = R.slotLevels.filter(function (l) { return st.level >= l; }).length;
    return n + (st.cls === 'invocador' ? R.summonerExtraSlot : 0);
  };
  Sh.nextSlotLevel = function (st) { return R.slotLevels.filter(function (l) { return st.level < l; })[0] || null; };

  Sh.toggle = function (id) {
    var st = E.state, s = Sh.ensure(st);
    if (!s.owned[id]) return { ok: false, msg: 'Este servo não é teu.' };
    var i = s.active.indexOf(id);
    if (i >= 0) { s.active.splice(i, 1); E.commit('servo dispensado'); return { ok: true, msg: Sh.name(st, id) + ' regressa às sombras.' }; }
    if (s.active.length >= Sh.slots(st)) return { ok: false, msg: 'Todos os lugares estão ocupados (' + Sh.slots(st) + '). Dispensa um servo primeiro.' };
    s.active.push(id);
    E.commit('servo convocado');
    return { ok: true, msg: Sh.name(st, id) + ' está convocado.' };
  };

  Sh.rename = function (id, name) {
    var st = E.state, s = Sh.ensure(st);
    if (!s.owned[id]) return { ok: false, msg: 'Este servo não é teu.' };
    name = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 18);
    if (name) s.names[id] = name; else delete s.names[id];
    E.commit('servo renomeado');
    return { ok: true, msg: name ? 'Agora chama-se ' + name + '.' : 'Nome original reposto.' };
  };

  /* fala do servo: roda pelas falas da sua personalidade */
  Sh.line = function (st, id, advance) {
    var s = Sh.ensure(st), lines = (S.SHADOW_LINES || {})[id];
    if (!lines || !lines.length) return 'Às tuas ordens, meu senhor.';
    s.lineAt = s.lineAt || {};
    var i = s.lineAt[id] || 0;
    if (advance) s.lineAt[id] = (i + 1) % lines.length;
    return lines[i % lines.length].replace(/\{nome\}/g, st.name);
  };
  Sh.name = function (st, id) { var s = Sh.ensure(st); return s.names[id] || 'Sombra de ' + S.BOSS_BY_ID[id].name.split(',')[0]; };
  Sh.role = function (b) { return b.king ? 'comandante' : (ROLES[b.arch] || 'atacante'); };

  /* força do servo: fração do teu ataque, cresce com o nível do chefe de origem */
  Sh.factor = function (st, b) {
    var f = (b.king ? 0.14 : 0.07) + b.level * 0.0006;
    if (Sh.role(b) === 'guarda') f *= 0.6;
    if (st.cls === 'invocador') f *= 1.25;
    return f;
  };

  Sh.owned = function (st) {
    var s = Sh.ensure(st);
    return Object.keys(s.owned).map(function (id) { return S.BOSS_BY_ID[id]; }).filter(Boolean).sort(function (a, b) { return b.level - a.level; });
  };
  Sh.active = function (st) {
    var s = Sh.ensure(st);
    s.active = s.active.filter(function (id) { return s.owned[id]; }).slice(0, Sh.slots(st));
    return s.active.map(function (id) { return S.BOSS_BY_ID[id]; });
  };

  /* servos que entram num combate */
  Sh.battleSquad = function (st, ps, pressure) {
    return Sh.active(st).map(function (b) {
      var role = Sh.role(b);
      return {
        id: b.id, name: Sh.name(st, b.id), role: role,
        power: Math.max(1, Math.round(Math.max(ps.atk, ps.matk) * Sh.factor(st, b) * pressure)),
        shieldPct: role === 'guarda' ? 4 + Math.round(b.level / 20) : 0,
        defBreak: role === 'arcano' ? 8 : 0
      };
    });
  };
  /* bónus passivo dos comandantes convocados (+5% dano cada, máx. 15%) */
  Sh.commandBonus = function (st) {
    return Math.min(15, Sh.active(st).filter(function (b) { return b.king; }).length * 5);
  };
})(globalThis.SYS = globalThis.SYS || {});
