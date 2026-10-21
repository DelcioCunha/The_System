/* ==========================================================
   SOMBRAS — "Tornar Servo"
   Depois de derrotar um chefe dos portões, o Sistema deteta a sua
   sombra. Há 3 tentativas para a extrair. Se as 3 falharem, a sombra
   dissipa-se e esse chefe nunca poderá ser servo.
   A sombra fica à espera 24 horas; depois desvanece (perdida).
   Servos convocados lutam ao teu lado em todos os combates.
   Se as 3 tentativas falharem (ou a sombra de um portão desvanecer ao fim
   de 24 h), a sombra fica SELADA e pode ser obtida com Cristais:
     portões:  normal 50 · comandante (rei do portão) 150 · chefe final 300
     arenas:   normal 100 · comandante (penúltimo) 300 · chefe final (último) 500
   Nas arenas premium a sombra nunca desvanece.
   Lugares de servos convocados: 3 (+1 do Invocador) e até +3 com a
   Insígnia do General das Sombras (Loja Exclusiva).
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
    baseSlots: 3,              // lugares de servos convocados para todos
    summonerExtraSlot: 1,
    maxExtraSlots: 3,          // +3 com a Insígnia do General das Sombras
    prices: {                  // Cristais para quebrar o selo de uma sombra
      gate: { normal: 50, commander: 150, final: 300 },
      arena: { normal: 100, commander: 300, final: 500 }
    }
  };

  /* papel do servo pelo arquétipo do chefe */
  var ROLES = {
    feroz: 'atacante', berserker: 'atacante', equilibrado: 'atacante',
    conjurador: 'arcano', tanque: 'guarda', muralha: 'guarda', rei: 'comandante'
  };
  var ROLE_INFO = S.SHADOW_ROLES = {
    atacante: { name: 'Atacante', desc: 'Ataca o inimigo em todos os turnos.' },
    arcano: { name: 'Arcano', desc: 'Ataca com magia e enfraquece a defesa do inimigo no primeiro turno.' },
    guarda: { name: 'Guarda', desc: 'Ataca com menos força, mas dá-te um escudo no início do combate.' },
    comandante: { name: 'Comandante', desc: 'Rei de um portão, Tenente ou Campeão de uma arena: ataque mais forte e +5% ao teu dano enquanto estiver convocado.' }
  };

  var Sh = S.shadows = {};

  /* treino com as sombras: recompensa pequena (abaixo do normal), uma vez a cada SPAR_H horas por sombra */
  Sh.SPAR_H = 6;
  Sh.sparReady = function (st, id) { var t = Sh.ensure(st).spar[id] || 0; return !t || now() - t >= Sh.SPAR_H * 3600000; };
  Sh.sparReadyAt = function (st, id) { var t = Sh.ensure(st).spar[id] || 0; return t ? t + Sh.SPAR_H * 3600000 : 0; };
  Sh.sparReward = function (st, b, won) {
    if (!Sh.sparReady(st, b.id)) return null;
    var r = S.combat.rewards(st, b), f = won ? 0.1 : 0.03;
    return { xp: Math.max(1, Math.round(r.xp * f)), coins: Math.max(1, Math.round(r.coins * f)) };
  };
  Sh.spar = function (id) { return S.combat.start(id, { spar: true }); };
  Sh.isArena = function (b) { return !!b && !!b.premium && (!!b.guardian || !!b.champion) && /^ar\d+(g\d+)?$/.test(b.id); };
  Sh.eligible = function (b) { return !!b && !b.secret && (/^b\d+$/.test(b.id) && !b.premium || Sh.isArena(b)); };
  /* normal, comandante (o penúltimo de cada arena) ou chefe final (o último de cada arena) */
  /* em todas as arenas (portões gratuitos e arenas exclusivas): o último chefe é o Chefe final e o penúltimo é o Comandante */
  Sh.rank = function (b) {
    if (!b) return 'normal';
    if (Sh.isArena(b)) return b.champion ? 'final' : b.lieutenant ? 'commander' : 'normal';
    if (b.secret || !b.gate) return 'normal';
    var list = S.BOSSES.filter(function (x) { return x.gate === b.gate; }), i = list.indexOf(b);
    return i === list.length - 1 ? 'final' : i === list.length - 2 ? 'commander' : 'normal';
  };
  Sh.RANK_NAME = { normal: 'Normal', commander: 'Comandante', final: 'Chefe da arena' };
  Sh.buyPrice = function (b) { return R.prices[Sh.isArena(b) ? 'arena' : 'gate'][Sh.rank(b)]; };

  Sh.ensure = function (st) {
    if (!st.shadows) {
      st.shadows = { owned: {}, tries: {}, lost: {}, pending: {}, active: [], names: {} };
      // chefes derrotados antes desta versão: a sombra ficou adormecida e pode ser extraída (sem prazo)
      Object.keys(st.defeated || {}).forEach(function (id) { if (Sh.eligible(S.BOSS_BY_ID[id])) st.shadows.pending[id] = { at: st.defeated[id], exp: 0 }; });
    }
    var s = st.shadows;
    ['owned', 'tries', 'lost', 'pending', 'names', 'spar', 'sealed'].forEach(function (k) { if (!s[k]) s[k] = {}; });
    if (!Array.isArray(s.active)) s.active = [];
    if (!(s.extra >= 0)) s.extra = 0;
    // versão nova: as sombras dos portões que se tinham perdido ficam seladas (podem obter-se com Cristais)
    if (!s.sealV) {
      s.sealV = 1;
      var lostN = Object.keys(s.lost).length;
      if (lostN && st.c) st.c.shadowsLost = Math.max(st.c.shadowsLost || 0, lostN);
      Object.keys(s.lost).forEach(function (id) { if (Sh.eligible(S.BOSS_BY_ID[id]) && !s.owned[id]) s.sealed[id] = s.lost[id]; });
      s.lost = {};
    }
    // arenas premium: os sub-chefes e Campeões já vencidos antes desta versão deixam a sombra à espera (sem prazo)
    if (!s.premV) {
      s.premV = 1;
      Object.keys((st.arena && st.arena.wins) || {}).forEach(function (id) {
        var b = S.BOSS_BY_ID[id];
        if (Sh.isArena(b) && !s.owned[id] && !s.sealed[id] && !s.lost[id]) s.pending[id] = { at: now(), exp: 0 };
      });
    }
    return s;
  };

  /* sombras à espera que expiraram: perdidas */
  Sh.expire = function (st) {
    var s = Sh.ensure(st), t = now(), changed = false;
    Object.keys(s.pending).forEach(function (id) {
      var p = s.pending[id];
      if (p.exp && p.exp <= t) {
        delete s.pending[id]; s.sealed[id] = t; changed = true; if (st.c) E.bump(st, 'shadowsLost');
        E.history(st, '🌫️', 'A sombra de ' + S.BOSS_BY_ID[id].name + ' desvaneceu e ficou selada. Pode ser obtida por ' + Sh.buyPrice(S.BOSS_BY_ID[id]) + ' Cristais.');
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
    if (s.sealed[id]) return 'sealed';
    if (s.lost[id]) return 'lost';
    if (s.pending[id]) return 'pending';
    return 'none';
  };

  /* chamado na vitória contra um chefe */
  Sh.onVictory = function (st, b) {
    if (!Sh.eligible(b)) return false;
    var s = Sh.ensure(st);
    if (s.owned[b.id] || s.lost[b.id] || s.sealed[b.id] || s.pending[b.id] || Sh.triesLeft(st, b.id) < 1) return false;
    s.pending[b.id] = { at: now(), exp: Sh.isArena(b) ? 0 : now() + R.waitH * 3600000 };
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
      if (s.tries[id] === 1) E.bump(st, 'shadowFirstTry');
      if (s.tries[id] === R.tries) E.bump(st, 'shadowLastTry');
      var auto = s.active.length < Sh.slots(st);
      if (auto) s.active.push(id);
      E.history(st, '🌑', 'Extraiu a sombra de ' + b.name + '. Agora é um servo' + (auto ? ' e já está convocado.' : '.'));
      E.commit('sombra extraída');
      return { ok: true, success: true, auto: auto, left: R.tries - s.tries[id], chance: ch };
    }
    left = R.tries - s.tries[id];
    var sealed = false;
    if (left < 1) {
      delete s.pending[id];
      s.sealed[id] = now(); sealed = true; E.bump(st, 'shadowsLost');
      E.history(st, '🔒', 'A sombra de ' + b.name + ' resistiu 3 vezes e ficou selada. Pode ser obtida por ' + Sh.buyPrice(b) + ' Cristais.');
    }
    E.commit('extração falhada');
    return { ok: true, success: false, left: left, lost: left < 1 && !sealed, sealed: sealed, chance: ch };
  };

  /* sombra selada de uma arena premium: obtém-se com Cristais */
  Sh.buy = function (id) {
    var st = E.state, s = Sh.ensure(st), b = S.BOSS_BY_ID[id];
    if (!b || !Sh.eligible(b)) return { ok: false, msg: 'Esta sombra não se pode comprar.' };
    if (s.owned[id]) return { ok: false, msg: 'Esta sombra já é tua.' };
    if (!s.sealed[id]) return { ok: false, msg: s.pending[id] ? 'Primeiro tenta extrair a sombra (3 tentativas).' : 'Primeiro derrota este inimigo.' };
    var price = Sh.buyPrice(b);
    if ((st.crystals || 0) < price) return { ok: false, msg: 'Faltam ' + (price - (st.crystals || 0)) + ' Cristais.', need: price - (st.crystals || 0) };
    st.crystals -= price;
    delete s.sealed[id];
    s.owned[id] = now();
    E.bump(st, 'crystalsSpent', price);
    E.bump(st, 'shadowsOwned');
    E.bump(st, 'shadowsBought');
    var auto = s.active.length < Sh.slots(st);
    if (auto) s.active.push(id);
    E.history(st, '🌑', 'Quebrou o selo da sombra de ' + b.name + ' com ' + price + ' Cristais. Agora é um servo' + (auto ? ' e já está convocado.' : '.'));
    E.checkAchievements(st);
    E.commit('sombra comprada');
    return { ok: true, success: true, auto: auto, bought: true, msg: 'A sombra de ' + b.name + ' é tua.' };
  };

  /* deixa a sombra dissipar-se de propósito */
  Sh.release = function (id) {
    var st = E.state, s = Sh.ensure(st);
    if (!s.pending[id]) return { ok: false, msg: 'Não há sombra à espera.' };
    if (Sh.isArena(S.BOSS_BY_ID[id])) return { ok: false, msg: 'As sombras das arenas não se dissipam.' };
    delete s.pending[id]; s.sealed[id] = now(); E.bump(st, 'shadowsLost');
    E.history(st, '🌫️', 'Deixou a sombra de ' + S.BOSS_BY_ID[id].name + ' dissipar-se.');
    E.commit('sombra libertada');
    return { ok: true };
  };

  /* lugares de servos convocados */
  Sh.extraSlots = function (st) { return Math.min(R.maxExtraSlots, Sh.ensure(st).extra || 0); };
  Sh.slots = function (st) { return R.baseSlots + (st.cls === 'invocador' ? R.summonerExtraSlot : 0) + Sh.extraSlots(st); };
  Sh.nextSlotLevel = function () { return null; };
  /* Insígnia do General das Sombras: +1 lugar para sempre (máx. 3) */
  Sh.addSlot = function (st) {
    var s = Sh.ensure(st);
    if (s.extra >= R.maxExtraSlots) return false;
    s.extra++; return true;
  };

  Sh.toggle = function (id) {
    var st = E.state, s = Sh.ensure(st);
    if (!s.owned[id]) return { ok: false, msg: 'Este servo não é teu.' };
    var i = s.active.indexOf(id);
    if (i >= 0) { s.active.splice(i, 1); E.commit('servo dispensado'); return { ok: true, msg: Sh.name(st, id) + ' regressa às sombras.' }; }
    if (s.active.length >= Sh.slots(st)) return { ok: false, msg: 'Todos os lugares estão ocupados (' + Sh.slots(st) + '). Dispensa um servo primeiro' + (Sh.extraSlots(st) < R.maxExtraSlots ? ' ou ganha mais lugares com a Insígnia do General das Sombras (Loja Exclusiva).' : '.') };
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
  Sh.baseName = function (b) { var n = b.name.split(',')[0]; return /^O /.test(n) ? 'Sombra do ' + n.slice(2) : /^A /.test(n) ? 'Sombra da ' + n.slice(2) : 'Sombra de ' + n; };
  Sh.name = function (st, id) { var s = Sh.ensure(st); return s.names[id] || Sh.baseName(S.BOSS_BY_ID[id]); };
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
