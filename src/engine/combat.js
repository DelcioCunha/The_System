/* ==========================================================
   COMBATE POR TURNOS
   Ronda: ação do jogador → invocações → efeitos no chefe →
          turno do chefe → efeitos no jogador → fim da ronda
   O estado da batalha é gravado a cada ronda: se fechares a app
   a meio, a batalha continua de onde ficou.
   ========================================================== */
(function (S) {
  'use strict';
  var E = S.engine;
  var C = S.combat = {};

  function rnd(a, b) { return a + S.rng.random() * (b - a); }
  function chance(p) { return S.rng.random() < p; }
  function now() { return S.clock.now(); }

  C.bossUnlocked = function (st, b) {
    if (b.premium) {
      // arena aberta com Cristais + escada: cada combate exige o anterior vencido
      if (!(st.arena && st.arena.unlocked[b.arenaKey || b.id])) return false;
      if (st.arena.wins[b.id]) return true;
      var prev = S.premium.prevBoss(b);
      return !prev || !!st.arena.wins[prev.id];
    }
    if (!b.secret) return true;
    if (b.unlock === 'map') return !!st.revealed[b.id];
    if (b.unlock === 'all100') return S.BOSSES.every(function (x) { return st.defeated[x.id]; });
    return false;
  };

  /* Ajuste global de dificuldade dos chefes */
  S.BOSS_TUNE = S.BOSS_TUNE || { hp: 2.1, hpL: 0, atk: 1.8, atkL: 0, def: 1.25 };

  C.bossStats = function (st, b) {
    var L = b.level;
    var a = S.ARCHETYPES[b.arch];
    var T = S.BOSS_TUNE;
    var hp = (100 + 35 * L + 1.0 * L * L) * a.hp * (T.hp + T.hpL * L);
    var atk = (10 + 4 * L + 0.025 * L * L) * a.atk * (T.atk + T.atkL * L);
    var def = (2 + 1.8 * L) * a.def * T.def;
    if (b.special === 'mirror') {
      var ps = E.combatStats(st);
      hp = Math.max(hp * 0.6, ps.maxHp * 2.2);
      atk = Math.max(atk * 0.6, Math.max(ps.atk, ps.matk) * 0.75);
      def = Math.max(def * 0.6, ps.def);
    }
    if (b.special === 'final' || (b.phases === 3 && !b.premium)) hp *= 1.3; // os Campeões já têm mecânicas próprias
    return { maxHp: Math.round(hp), atk: Math.round(atk), def: Math.round(def) };
  };

  C.HEAL_LIMIT = 3; // poções de cura por batalha

  C.rewards = function (st, b) {
    var L = b.level;
    if (b.guardian) {
      // Guardiões: acima dos chefes normais do mesmo nível; o Tenente vale como um rei
      var gf = !(st.arena && st.arena.wins[b.id]);
      var gk = gf ? 1 : S.PREMIUM_RULES.repeatPct;
      var tier = L <= 20 ? 0 : L <= 50 ? 1 : L <= 80 ? 2 : 3;
      var gchest = gf ? (b.lieutenant ? ['epico', 'lendario', 'lendario', 'secreto'] : ['raro', 'epico', 'lendario', 'lendario'])[tier] : (['comum', 'raro', 'raro', 'epico'])[tier];
      var gsp = null;
      if (gf && b.slot === 5) gsp = { items: [S.PREMIUM_CONSUMABLES[(b.arena - 1) % S.PREMIUM_CONSUMABLES.length]] };
      return { xp: Math.round((S.xpToNext(Math.min(L, 99)) * (b.lieutenant ? 0.8 : 0.45) + 25) * gk), coins: Math.round((30 + 12 * L + 0.6 * L * L) * (b.lieutenant ? 3 : 1.6) * gk),
        chest: gchest, special: gsp, first: gf };
    }
    if (b.premium) {
      // Campeões da Arena: a primeira vitória vale muito mais; as revanches dão 35%
      var first = !(st.arena && st.arena.wins[b.id]);
      var k = first ? 1 : S.PREMIUM_RULES.repeatPct;
      return { xp: Math.round((S.xpToNext(Math.min(L, 99)) * 1.3 + 50) * k), coins: Math.round((30 + 12 * L + 0.6 * L * L) * 4 * k),
        chest: first ? (L >= 75 ? 'secreto' : 'lendario') : 'epico', special: first ? { items: [b.relic] } : null, first: first };
    }
    var emp = st.battle && st.battle.bossId === b.id && st.battle.empowered;
    // um chefe dá ~35% de um nível (rei: ~80%): para continuar a avançar é preciso fazer missões
    var xp = Math.round(S.xpToNext(Math.min(L, 99)) * (b.king ? 0.8 : 0.35) + 20);
    var coins = Math.round((30 + 12 * L + 0.6 * L * L) * (b.king ? 2.5 : 1));
    var chest;
    if (L <= 20) chest = b.king ? 'raro' : 'comum';
    else if (L <= 50) chest = b.king ? 'epico' : 'raro';
    else if (L <= 80) chest = b.king ? 'lendario' : 'epico';
    else chest = 'lendario';
    if (emp) { xp = Math.round(xp * 1.2); coins = Math.round(coins * 1.2); }
    return { xp: xp, coins: coins, chest: chest, special: S.BOSS_SPECIAL_DROPS[b.id] || null };
  };

  C.danger = function (st, b) {
    var d = b.level - st.level;
    if (d <= -5) return { label: 'Fácil', color: '#5be08a' };
    if (d <= 0) return { label: 'Equilibrado', color: '#4ab8ff' };
    if (d <= 4) return { label: 'Difícil', color: '#ffd24a' };
    if (d <= 10) return { label: 'Perigoso', color: '#ff8a3d' };
    return { label: 'Mortal', color: '#ff3d5a' };
  };

  /* ---------------- helpers de estados ---------------- */
  function sum(list, kind, key) {
    return list.reduce(function (s, x) { return s + (x.kind === kind && x.key === key ? x.val : 0); }, 0);
  }
  function addStatus(list, s) { list.push(s); }
  function log(b, txt, cls) {
    b.logN = (b.logN || 0) + 1;
    b.log.push({ t: txt, c: cls || '' });
    if (b.log.length > 60) b.log.splice(0, b.log.length - 60);
  }

  /* Pressão de nível: por cada nível que o chefe estiver acima de ti,
     ele causa +4% de dano e tu causas -3% (máx. -60%) */
  C.pressure = function (gap) {
    gap = gap || 0;
    if (gap < 0) { var g = Math.min(10, -gap); return { bossDmg: 1 - g * 0.03, playerDmg: 1 + g * 0.03 }; }
    return { bossDmg: 1 + gap * 0.04, playerDmg: Math.max(0.4, 1 - gap * 0.03) };
  };

  C.start = function (bossId) {
    var st = E.state;
    if (st.battle && !st.battle.over) return { ok: false, msg: 'Já estás numa batalha.' };
    var b = S.BOSS_BY_ID[bossId];
    if (!b) return { ok: false, msg: 'Chefe desconhecido.' };
    if (!b.premium && st.defeated[b.id]) return { ok: false, msg: 'Este chefe já foi derrotado e não volta.' };
    if (b.premium) S.premium.ensure(st);
    if (!C.bossUnlocked(st, b)) {
      if (!b.premium) return { ok: false, msg: 'Este portão ainda está selado.' };
      if (!st.arena.unlocked[b.arenaKey]) return { ok: false, msg: 'Esta arena ainda está selada. Desbloqueia-a com Cristais.' };
      return { ok: false, msg: 'Vence primeiro ' + S.premium.prevBoss(b).name + '.' };
    }
    if (b.premium && S.premium.cooldown(st, b) > now()) return { ok: false, msg: (b.champion ? 'O Campeão' : b.name) + ' ainda está a recuperar. Volta mais tarde.' };
    var ps = E.combatStats(st);
    if (E.curHp(st) < 1) return { ok: false, msg: 'Não tens vida para lutar. Bebe uma poção de vida na Bolsa.' };
    var bs = C.bossStats(st, b);
    var emp = S.time.bossEmpowered(b);
    if (emp) { bs.atk = Math.round(bs.atk * 1.15); bs.maxHp = Math.round(bs.maxHp * 1.15); }
    st.battle = {
      bossId: b.id, started: now(), turn: 1, over: null, took: 0, phase: 1,
      p: { hp: E.curHp(st), maxHp: ps.maxHp, mp: ps.maxMp, maxMp: ps.maxMp, shield: 0, st: [], cds: {}, stunned: 0, stunImmune: 0, stats: ps, lastStandUsed: false, reviveUsed: false },
      b: { hp: bs.maxHp, maxHp: bs.maxHp, atk: bs.atk, def: bs.def, shield: 0, st: [], cds: {}, stunned: 0, stunImmune: 0, bonusAtk: 0, healedFinal: false },
      gap: b.level - st.level,
      empowered: emp || null, healsUsed: 0,
      summons: [], log: [], result: null
    };
    if (ps.openShield) { st.battle.p.shield = Math.round(ps.maxHp * ps.openShield / 100); }
    if (b.level >= st.level + 20) E.bump(st, 'braveFights');
    E.bump(st, 'battlesStarted');
    log(st.battle, '⚔️ ' + b.name + ' (Nv. ' + b.level + ') aparece!', 'sys');
    if (b.lore) log(st.battle, b.lore, 'lore');
    if (st.battle.p.shield) log(st.battle, '🛡️ Entras em combate com um escudo de ' + st.battle.p.shield + '.', 'good');
    if (emp) log(st.battle, (emp === 'noite' ? '🌙 A noite fortalece ' : '☀️ O sol fortalece ') + b.name + ': +15% vida e ataque, mas +20% recompensas.', 'warn');
    var lines = (S.BOSS_LINES || {})[b.id];
    var rematch = b.premium && st.arena && st.arena.wins[b.id];
    if (b.story && rematch) log(st.battle, b.name + ': «' + b.story.rematch[Math.floor(S.rng.random() * b.story.rematch.length)] + '»', 'say');
    else if (lines) log(st.battle, b.name + ': «' + lines[0] + '»', 'say');
    var champ = b.guardian && S.BOSS_BY_ID[b.arenaKey];
    if (champ && champ.story && b.slot === 1) {
      st.arena.seen = st.arena.seen || {};
      if (!st.arena.seen[b.arenaKey + '_in']) { st.arena.seen[b.arenaKey + '_in'] = now(); E.emit({ type: 'arena', title: champ.story.intro[0], name: b.arenaName, boss: champ.id, lines: champ.story.intro.slice(1).concat(['No fim da escada espera-te ' + champ.name + '. Primeiro, os seus 9 Guardiões.']) }); }
    }
    if (b.lieutenant) log(st.battle, '⚠️ ' + b.name + ' é o Tenente da arena: 2 fases. Atrás dele está ' + S.BOSS_BY_ID[b.arenaKey].name + '.', 'warn');
    if (b.story) {
      log(st.battle, '◆ ' + b.story.sig.name + ': ' + b.story.sig.desc, 'warn');
      st.arena.seen = st.arena.seen || {};
      if (!st.arena.seen[b.id]) { st.arena.seen[b.id] = now(); E.emit({ type: 'arena', title: b.story.intro[0], name: b.name, boss: b.id, lines: b.story.intro.slice(1).concat(['«' + b.story.quote + '»']) }); }
    }
    if (st.battle.gap <= -3) log(st.battle, '✨ Vantagem de nível: estás ' + (-st.battle.gap) + ' níveis acima do chefe (o teu dano +' + Math.round((C.pressure(st.battle.gap).playerDmg - 1) * 100) + '%, o dele -' + Math.round((1 - C.pressure(st.battle.gap).bossDmg) * 100) + '%).', 'good');
    if (st.battle.gap >= 3) log(st.battle, '⚠️ Pressão de nível: o chefe está ' + st.battle.gap + ' níveis acima de ti (o teu dano -' + Math.round((1 - C.pressure(st.battle.gap).playerDmg) * 100) + '%, o dele +' + Math.round((C.pressure(st.battle.gap).bossDmg - 1) * 100) + '%).', 'warn');
    E.commit('batalha iniciada');
    return { ok: true };
  };

  /* ---------------- mecânicas de assinatura dos Campeões do Coliseu ---------------- */
  function sigOf(bt) { var d = S.BOSS_BY_ID[bt.bossId]; return (d && d.sig) || null; }
  function sayOf(bt, key) { var d = S.BOSS_BY_ID[bt.bossId]; return d && d.story ? d.story[key] : null; }

  /* ---------------- dano do jogador ---------------- */
  function playerBase(bt, kind) {
    var ps = bt.p.stats;
    var atk = ps.atk * (1 + sum(bt.p.st, 'buff', 'atk') / 100);
    var matk = ps.matk * (1 + (sum(bt.p.st, 'buff', 'matk') + sum(bt.p.st, 'buff', 'atk') * 0.5) / 100);
    var def = ps.def * (1 + sum(bt.p.st, 'buff', 'def') / 100);
    var v;
    if (kind === 'mag') v = matk;
    else if (kind === 'def') v = def * 3;
    else if (kind === 'best') v = Math.max(atk, matk);
    else v = atk;
    if (ps.lowHpAtk && bt.p.hp < bt.p.maxHp * 0.3) v *= 1 + ps.lowHpAtk / 100;
    return v * C.pressure(bt.gap).playerDmg;
  }
  function damageBoss(bt, amount, label) {
    var b = bt.b;
    if (sigOf(bt) === 'stone' && bt.phase === 1) amount *= 0.75; // Pele de Pedra Rúnica
    var dmg = Math.max(1, Math.round(amount));
    if (b.shield > 0) {
      var ab = Math.min(b.shield, dmg);
      b.shield -= ab;
      dmg -= ab;
      if (ab) log(bt, '🛡️ O escudo do chefe absorve ' + ab + '.', 'muted');
    }
    b.hp = Math.max(0, b.hp - dmg);
    return dmg;
  }
  function healPlayer(bt, amount) {
    var p = bt.p;
    var h = Math.max(0, Math.min(p.maxHp - p.hp, Math.round(amount)));
    p.hp += h;
    return h;
  }

  function doPlayerOp(bt, op, srcName) {
    var p = bt.p, b = bt.b, ps = p.stats;
    switch (op.op) {
      case 'dmg': {
        var hits = op.hits || 1;
        var base = playerBase(bt, op.kind === 'phys' || op.kind === 'mag' || op.kind === 'def' || op.kind === 'best' ? op.kind : ps.main);
        var total = 0, crits = 0, dodged = 0, bsig = sigOf(bt);
        for (var i = 0; i < hits && b.hp > 0; i++) {
          if (bsig === 'evade' && chance(0.2)) { dodged++; continue; } // Mil Passos
          var raw = base * op.mult * rnd(0.9, 1.1);
          var critChance = (ps.crit + sum(p.st, 'buff', 'crit') + (op.crit || 0)) / 100;
          var isCrit = op.alwaysCrit || chance(critChance);
          if (isCrit) { raw *= ps.critDmg / 100; crits++; }
          if (op.execute && b.hp < b.maxHp * op.execute.below) raw *= op.execute.mult;
          if (ps.execute && b.hp < b.maxHp * 0.3) raw *= 1 + ps.execute / 100; // Execução (equipamento)
          if (ps.firstStrike && !bt.struck) raw *= 1 + ps.firstStrike / 100; // Primeiro Golpe
          var effDef = Math.max(0, b.def * (1 - sum(b.st, 'debuff', 'def') / 100) * (1 - (op.pierce || 0)));
          var dmg = damageBoss(bt, raw * 100 / (100 + effDef));
          total += dmg;
          var ls = (ps.lifesteal + sum(p.st, 'buff', 'lifesteal')) / 100 + (op.lifesteal || 0);
          if (ls > 0) healPlayer(bt, dmg * ls);
        }
        log(bt, '➤ ' + srcName + ': ' + total + ' de dano' + (hits > 1 ? ' (' + hits + ' golpes)' : '') + (crits ? ' — CRÍTICO' + (crits > 1 ? ' ×' + crits : '') + '!' : '.'), crits ? 'crit' : 'dmg');
        if (ps.firstStrike && !bt.struck && total > 0) log(bt, '⚡ Primeiro Golpe: +' + ps.firstStrike + '% no primeiro ataque.', 'good');
        if (total > 0) bt.struck = true;
        if (ps.manaOnHit && total > 0 && p.mp < p.maxMp) { var gm = Math.min(p.maxMp - p.mp, Math.round(p.maxMp * ps.manaOnHit / 100)); p.mp += gm; }
        if (dodged) log(bt, '🌸 Mil Passos: ' + (dodged === hits ? 'cortaste só pétalas. Ela já não estava lá.' : dodged + ' golpe(s) cortaram só pétalas.'), 'muted');
        if (bsig === 'mirror' && total > 0 && p.hp > 0) { var rf = damagePlayer(bt, total * 0.15); log(bt, '🪞 Reflexo Partido: o espelho devolve-te ' + rf + ' de dano.', 'hurt'); }
        break;
      }
      case 'dot': {
        var per = Math.round(Math.max(playerBase(bt, 'phys'), playerBase(bt, 'mag')) * op.mult * 0.6 * (1 + (ps.dotPct || 0) / 100));
        addStatus(b.st, { kind: 'dot', type: op.type, val: per, turns: op.turns });
        log(bt, '☠️ O chefe sofre ' + C.DOT_NAMES[op.type] + ' (' + per + '/turno).', 'muted');
        break;
      }
      case 'stun': {
        var bossDef = S.BOSS_BY_ID[bt.bossId];
        var ch = op.chance * (bossDef.king ? 0.5 : 1);
        if (op.chance >= 1) ch = 1;
        if (b.stunImmune > 0 && op.chance < 1) { log(bt, '🌀 O chefe resiste ao atordoamento.', 'muted'); break; }
        if (chance(ch)) { b.stunned = Math.max(b.stunned, op.turns); b.stunImmune = op.turns + 2; log(bt, '💫 O chefe ficou atordoado!', 'good'); }
        else log(bt, '🌀 O atordoamento falhou.', 'muted');
        break;
      }
      case 'heal': {
        var h = healPlayer(bt, p.maxHp * op.pct / 100);
        log(bt, '💚 Recuperaste ' + h + ' de vida.', 'good');
        break;
      }
      case 'shield': {
        p.shield += Math.round(p.maxHp * op.pct / 100);
        log(bt, '🛡️ Escudo de ' + p.shield + '.', 'good');
        break;
      }
      case 'mp': {
        var m = Math.min(p.maxMp - p.mp, Math.round(p.maxMp * op.pct / 100));
        p.mp += m;
        log(bt, '💧 Recuperaste ' + m + ' de mana.', 'good');
        break;
      }
      case 'buff':
        addStatus(p.st, { kind: 'buff', key: op.key, val: op.val, turns: op.turns });
        log(bt, '⬆️ ' + C.BUFF_NAMES[op.key] + ' +' + op.val + '% (' + op.turns + ' turnos).', 'good');
        break;
      case 'debuff':
        addStatus(b.st, { kind: 'debuff', key: op.key, val: op.val, turns: op.turns });
        log(bt, '⬇️ ' + C.BUFF_NAMES[op.key] + ' do chefe -' + op.val + '%.', 'good');
        break;
      case 'summon': {
        var power = Math.round(Math.max(ps.matk, ps.atk) * op.mult * (1 + ps.summonPct / 100) * C.pressure(bt.gap).playerDmg);
        bt.summons = bt.summons.filter(function (x) { return x.name !== op.name; });
        bt.summons.push({ name: op.name, power: power, turns: op.turns });
        log(bt, '💀 ' + op.name + ' invocado (' + op.turns + ' turnos).', 'good');
        break;
      }
      case 'resetCd':
        p.cds = {};
        log(bt, '⏳ As tuas recargas foram reiniciadas.', 'good');
        break;
    }
  }

  /* ---------------- turno do chefe ---------------- */
  function bossAtk(bt) {
    var b = bt.b;
    var m = 1 + (sum(b.st, 'buff', 'atk') + b.bonusAtk - sum(b.st, 'debuff', 'atk')) / 100;
    var sig = sigOf(bt), x = 1;
    if (sig === 'execute' && bt.p.hp < bt.p.maxHp * 0.35) {
      x = 1.6;
      if (!bt.sigExec) { bt.sigExec = true; log(bt, '🪓 EXECUÇÃO: a tua vida está abaixo de 35%. Cada golpe dele é agora uma sentença (+60%).', 'warn'); }
    }
    if (sig === 'first') x *= 1 + Math.min(45, bt.firstGrow || 0) / 100;
    return b.atk * Math.max(0.2, m) * x * C.pressure(bt.gap).bossDmg;
  }
  function damagePlayer(bt, amount) {
    var p = bt.p;
    var dmg = Math.max(1, Math.round(amount));
    if (p.shield > 0) {
      var ab = Math.min(p.shield, dmg);
      p.shield -= ab;
      dmg -= ab;
      if (ab) log(bt, '🛡️ O teu escudo absorve ' + ab + '.', 'muted');
    }
    p.hp = Math.max(0, p.hp - dmg);
    bt.took += dmg;
    return dmg;
  }
  function doBossOp(bt, op, name) {
    var p = bt.p, b = bt.b, ps = p.stats;
    switch (op.op) {
      case 'hit': {
        var hits = op.hits || 1, total = 0, dodged = 0;
        for (var i = 0; i < hits && p.hp > 0; i++) {
          var eva = (ps.eva + sum(p.st, 'buff', 'eva')) / 100;
          if (chance(Math.min(0.6, eva))) { dodged++; continue; }
          var raw = bossAtk(bt) * op.mult * rnd(0.9, 1.1);
          var def = Math.max(0, ps.def * (1 + (sum(p.st, 'buff', 'def') - sum(p.st, 'debuff', 'def')) / 100));
          var dmg = damagePlayer(bt, raw * 100 / (100 + def));
          total += dmg;
          var refl = sum(p.st, 'buff', 'reflect') + (ps.thorns || 0);
          if (refl > 0 && dmg > 0) damageBoss(bt, dmg * refl / 100);
          if (op.lifesteal) b.hp = Math.min(b.maxHp, b.hp + Math.round(dmg * op.lifesteal));
        }
        var txt = '◀ ' + name + ': ' + total + ' de dano';
        if (dodged) txt += hits > 1 ? ' (esquivaste ' + dodged + ')' : ' — ESQUIVASTE!';
        log(bt, txt + '.', dodged && !total ? 'good' : 'hurt');
        if (sum(p.st, 'buff', 'reflect') > 0 && total > 0) log(bt, '↩️ Devolveste dano ao chefe.', 'good');
        break;
      }
      case 'dot': {
        var per = Math.round(bossAtk(bt) * op.mult * 0.6);
        addStatus(p.st, { kind: 'dot', type: op.type, val: per, turns: op.turns });
        log(bt, '☠️ Sofres ' + C.DOT_NAMES[op.type] + ' (' + per + '/turno).', 'hurt');
        break;
      }
      case 'stun':
        if (p.stunImmune > 0) { log(bt, '🧠 Resististe ao atordoamento.', 'good'); break; }
        if (ps.stunRes && chance(op.chance) && chance(ps.stunRes / 100)) { log(bt, '🧠 A tua mente aguenta: resististe ao atordoamento.', 'good'); break; }
        if (chance(op.chance)) { p.stunned = Math.max(p.stunned, op.turns); p.stunImmune = op.turns + 2; log(bt, '💫 Ficaste atordoado!', 'hurt'); }
        break;
      case 'heal': {
        var h = Math.min(b.maxHp - b.hp, Math.round(b.maxHp * op.pct / 100));
        b.hp += h;
        log(bt, '💚 O chefe regenera ' + h + ' de vida.', 'hurt');
        break;
      }
      case 'shield':
        // um escudo novo substitui o anterior (fica o maior): os escudos não se acumulam
        b.shield = Math.max(b.shield, Math.round(b.maxHp * op.pct / 100));
        log(bt, '🛡️ O chefe cria um escudo de ' + b.shield + '.', 'hurt');
        break;
      case 'buff':
        addStatus(b.st, { kind: 'buff', key: op.key, val: op.val, turns: op.turns });
        log(bt, '🔥 O chefe fica enfurecido (+' + op.val + '% ataque).', 'hurt');
        break;
      case 'debuff':
        addStatus(p.st, { kind: 'debuff', key: op.key, val: op.val, turns: op.turns });
        log(bt, '⬇️ A tua defesa desce ' + op.val + '%.', 'hurt');
        break;
      case 'drainMp': {
        var d = Math.min(p.mp, Math.round(p.maxMp * op.pct / 100));
        p.mp -= d;
        log(bt, '💧 O chefe drena ' + d + ' de mana.', 'hurt');
        break;
      }
    }
  }
  function chooseBossSkill(bt, def) {
    var b = bt.b;
    var avail = def.skills.filter(function (k) { return S.BOSS_SKILLS[k] && !(b.cds[k] > 0); });
    var has = function (k) { return avail.indexOf(k) >= 0; };
    if (has('heal') && b.hp < b.maxHp * 0.5 && chance(0.7)) return 'heal';
    if (has('shield') && b.shield <= 0 && chance(0.35)) return 'shield';
    if (has('enrage') && sum(b.st, 'buff', 'atk') === 0 && chance(0.45)) return 'enrage';
    var attacks = avail.filter(function (k) { return ['heal', 'shield', 'enrage'].indexOf(k) < 0; });
    if (!attacks.length) return 'strike';
    var weighted = [];
    attacks.forEach(function (k) { var w = k === 'strike' ? 1 : (k === 'apocalypse' || k === 'ult' ? 1 : 2); for (var i = 0; i < w; i++) weighted.push(k); });
    return weighted[Math.floor(S.rng.random() * weighted.length)];
  }
  function bossTurn(bt) {
    var b = bt.b;
    var def = S.BOSS_BY_ID[bt.bossId];
    if (b.stunned > 0) {
      b.stunned--;
      log(bt, '💫 ' + def.name + ' está atordoado e perde o turno.', 'good');
      return;
    }
    var k = chooseBossSkill(bt, def);
    var sk = S.BOSS_SKILLS[k];
    if (sk.cd) b.cds[k] = sk.cd + 1;
    sk.ops.forEach(function (op) { if (bt.p.hp > 0) doBossOp(bt, op, sk.name); });
    signatureTurn(bt, def);
  }
  /* o que cada Campeão faz no fim do seu turno */
  function signatureTurn(bt, def) {
    var p = bt.p, b = bt.b, sig = def.sig;
    if (!sig || p.hp <= 0) return;
    if (sig === 'hoard') {
      var mp = Math.min(p.mp, Math.round(p.maxMp * 0.06)), hh = Math.round(b.maxHp * 0.015);
      p.mp -= mp; b.hp = Math.min(b.maxHp, b.hp + hh);
      log(bt, '🌊 Avareza Abissal: Leviarch rouba ' + mp + ' de mana e recupera ' + hh + ' de vida.', 'hurt');
    } else if (sig === 'storm' && bt.turn % 3 === 0) {
      var d = damagePlayer(bt, bossAtk(bt) * 0.8 * 100 / (100 + p.stats.def * (1 - sum(p.st, 'debuff', 'def') / 100)));
      var stun = p.stunImmune <= 0 && chance(0.3);
      if (stun) { p.stunned = Math.max(p.stunned, 1); p.stunImmune = 3; }
      log(bt, '◀ ⚡ Tempestade Crescente: um relâmpago atinge-te: ' + d + ' de dano' + (stun ? '. Ficaste atordoado!' : '.'), 'hurt');
    } else if (sig === 'garden') {
      var stacks = p.st.filter(function (x) { return x.kind === 'dot' && x.type === 'garden'; }).length;
      if (stacks < 3) { var per = Math.max(1, Math.round(p.maxHp * 0.015)); p.st.push({ kind: 'dot', type: 'garden', val: per, turns: 4 }); log(bt, '🥀 Jardim que Cresce: uma rosa negra nasce em ti (' + (stacks + 1) + '/3, ' + per + '/turno).', 'hurt'); }
    } else if (sig === 'first') {
      bt.firstGrow = Math.min(45, (bt.firstGrow || 0) + 3);
      if (bt.firstGrow % 15 === 0) log(bt, '👤 Aprende Contigo: O Primeiro Jogador está ' + bt.firstGrow + '% mais forte. Já se mexe como tu.', 'warn');
    }
  }
  /* Renascer Imperial: a primeira vez que cai, volta */
  function rebirth(bt) {
    var def = S.BOSS_BY_ID[bt.bossId];
    if (def.sig !== 'rebirth' || bt.reborn || bt.b.hp > 0) return false;
    bt.reborn = true;
    bt.b.hp = Math.round(bt.b.maxHp * 0.25);
    bt.b.st = bt.b.st.filter(function (x) { return x.kind !== 'dot'; });
    log(bt, '🔥 RENASCER IMPERIAL! Ignivar ergue-se das cinzas com ' + bt.b.hp + ' de vida.', 'warn');
    log(bt, def.name + ': «Eu renasço sempre. Tu só morres uma vez.»', 'say');
    return true;
  }
  function checkPhases(bt) {
    var b = bt.b;
    var def = S.BOSS_BY_ID[bt.bossId];
    if (!def.king || b.hp <= 0) return;
    if (bt.phase === 1 && b.hp <= b.maxHp * 0.5) {
      bt.phase = 2;
      b.bonusAtk += 20;
      log(bt, '⚠️ ' + def.name + ' entra na FASE 2: ataque +20%!', 'warn');
      if (def.story) log(bt, def.story.phase2, 'say');
      if (def.sig === 'rewind' && !bt.rewound) {
        bt.rewound = true;
        var rh = Math.round(b.maxHp * 0.2), had = bt.p.st.filter(function (x) { return x.kind === 'buff'; }).length;
        b.hp = Math.min(b.maxHp, b.hp + rh);
        bt.p.st = bt.p.st.filter(function (x) { return x.kind !== 'buff'; });
        log(bt, '⏳ REBOBINAR! O tempo recua: Chronos-9 recupera ' + rh + ' de vida' + (had ? ' e os teus reforços desaparecem.' : '.'), 'warn');
      }
      if (def.sig === 'stone') log(bt, '🪨 A Pele de Pedra Rúnica racha: Gorrath já recebe o dano todo.', 'good');
    }
    if ((def.special === 'final' || def.phases === 3) && bt.phase === 2 && b.hp <= b.maxHp * 0.25) {
      bt.phase = 3;
      b.bonusAtk += 20;
      var h = Math.round(b.maxHp * 0.15);
      b.hp = Math.min(b.maxHp, b.hp + h);
      log(bt, '⚠️ FASE FINAL! ' + def.name + ' liberta todo o seu poder e recupera ' + h + ' de vida!', 'warn');
      if (def.story) log(bt, def.story.phase3, 'say');
    }
  }

  function tickDots(bt, list, isBoss) {
    var total = 0;
    list.forEach(function (s) { if (s.kind === 'dot') total += s.val; });
    if (!total) return;
    if (isBoss) { var d = damageBoss(bt, total); log(bt, '☠️ Efeitos causam ' + d + ' ao chefe.', 'dmg'); }
    else { var d2 = damagePlayer(bt, total); log(bt, '☠️ Efeitos causam-te ' + d2 + ' de dano.', 'hurt'); }
  }
  function endRound(bt) {
    [bt.p.st, bt.b.st].forEach(function (list) {
      for (var i = list.length - 1; i >= 0; i--) { list[i].turns--; if (list[i].turns <= 0) list.splice(i, 1); }
    });
    [bt.p.cds, bt.b.cds].forEach(function (cds) { Object.keys(cds).forEach(function (k) { cds[k]--; if (cds[k] <= 0) delete cds[k]; }); });
    if (bt.p.stunImmune > 0) bt.p.stunImmune--;
    if (bt.b.stunImmune > 0) bt.b.stunImmune--;
    bt.summons = bt.summons.filter(function (s) { s.turns--; return s.turns > 0; });
    var p = bt.p;
    if (p.hp > 0) {
      var mpg = Math.round(p.maxMp * p.stats.regenMp / 100);
      p.mp = Math.min(p.maxMp, p.mp + mpg);
      if (p.stats.regenHp) healPlayer(bt, p.maxHp * p.stats.regenHp / 100);
    }
    bt.turn++;
    // batalhas demasiado longas: o portão começa a colapsar e o chefe fica mais forte
    if (bt.turn > 40 && bt.turn % 5 === 0) {
      bt.b.bonusAtk += 15;
      log(bt, '⏳ O portão está a colapsar! O chefe fica mais forte (+15% ataque).', 'warn');
    }
  }

  function tryRevive(st, bt) {
    var p = bt.p;
    if (p.hp > 0) return;
    if (p.stats.lastStand && !p.lastStandUsed) { p.lastStandUsed = true; p.hp = 1; log(bt, '🔥 Vontade Inabalável! Sobreviveste com 1 de vida.', 'warn'); return; }
    if (p.stats.revive && !p.reviveUsed) { p.reviveUsed = true; p.hp = Math.round(p.maxHp * p.stats.revive / 100); log(bt, '🔥 Renasceste das cinzas com ' + p.hp + ' de vida!', 'warn'); return; }
    if (E.removeItem(st, 'pr_fenix', 1)) { p.hp = p.maxHp; log(bt, '🖤 A Lágrima da Fénix Negra arde: renasces com a vida toda!', 'warn'); return; }
    if (E.removeItem(st, 'sx_fenix', 1)) { p.hp = Math.round(p.maxHp * 0.5); log(bt, '🪶 A Pena da Fénix arde e devolve-te à vida!', 'warn'); }
  }

  function finishWin(st, bt) {
    var def = S.BOSS_BY_ID[bt.bossId];
    var r = C.rewards(st, def);
    bt.over = 'win';
    if (def.premium) {
      st.arena.wins[def.id] = (st.arena.wins[def.id] || 0) + 1;
      (S.COSMETICS || []).forEach(function (c) { if (c.reward === def.id) S.premium.award(st, c.id); });
      st.arena.last[def.id] = now();
    } else st.defeated[def.id] = now();
    var trophy = S.TROPHIES[def.id];
    if (trophy && !st.trophies[def.id]) st.trophies[def.id] = now();
    var levelBefore = st.level;
    var sy = E.sysState(st), dblB = sy.dblBoss > 0;
    if (dblB) { sy.dblBoss--; r = Object.assign({}, r, { xp: r.xp * 2, coins: r.coins * 2 }); log(bt, '🎫 Bilhete da Vitória Dupla: recompensas a dobrar!', 'good'); }
    var xp = E.gainXp(st, r.xp);
    var coins = E.gainCoins(st, r.coins);
    var items = ['bau_' + r.chest];
    E.addItem(st, 'bau_' + r.chest, 1);
    if (r.special) (r.special.items || []).forEach(function (id) { E.addItem(st, id, 1); items.push(id); });
    // drop raro aleatório
    if (def.premium && !r.first && chance(def.guardian ? 0.05 : 0.15)) { var pc = S.PREMIUM_CONSUMABLES[Math.floor(S.rng.random() * S.PREMIUM_CONSUMABLES.length)]; E.addItem(st, pc, 1); items.push(pc); }
    if (chance(0.04 + def.level / 2500)) { var sx = ['sx_moeda', 'sx_fenix', 'sx_fragmento'][Math.floor(S.rng.random() * 3)]; E.addItem(st, sx, 1); items.push(sx); }
    E.bump(st, 'bossesKilled');
    E.bump(st, 'battlesWon');
    if (def.level >= levelBefore + 5) E.bump(st, 'giantKills');
    if (bt.p.hp < bt.p.maxHp * 0.1) E.bump(st, 'lowHpWins');
    if (bt.took === 0 && def.level >= 10) E.bump(st, 'flawlessWins');
    bt.result = { xp: xp, coins: coins, items: items, trophy: trophy ? trophy.name : null };
    var last = def.story && st.arena && st.arena.wins[def.id] > 1 ? def.story.rematchLast : (((S.BOSS_LINES || {})[def.id] || [])[1] || null);
    if (last) { log(bt, def.name + ': «' + last + '»', 'say'); bt.result.lastWords = last; }
    log(bt, '🏆 VITÓRIA! ' + def.name + (def.premium ? ' caiu na arena.' : ' foi derrotado para sempre.'), 'win');
    E.emit({ type: 'victory', title: 'VITÓRIA', name: def.name, lastWords: last, trophy: trophy ? trophy.name : null, lines: ['+' + xp + ' XP', '+' + coins + ' moedas'].concat(items.map(function (id) { return '+1 ' + S.ITEMS[id].name; })) });
    if (trophy && !def.premium) {
      var g = def.gate, set = E.gateTrophies(st, g);
      if (set.have === set.total) {
        var sd = S.TROPHY_SETS[g];
        E.emit({ type: 'info', title: 'CONJUNTO DE TROFÉUS COMPLETO', name: g === 0 ? 'Portões Ocultos' : S.GATES[g - 1].name, lines: ['Bónus permanente: ' + sd.desc] });
        E.history(st, '🏆', 'Completou os troféus de ' + (g === 0 ? 'Portões Ocultos' : S.GATES[g - 1].name) + ': ' + sd.desc + '.');
      }
    }
    if (r.special && r.special.skill) E.grantSkill(st, r.special.skill);
    if (S.live) S.live.react(st, 'boss', { def: def, gap: def.level - levelBefore });
    E.history(st, '🏆', (def.premium ? 'Venceu na arena ' : 'Derrotou ') + def.name + ' (Nv. ' + def.level + '): +' + xp + ' XP, +' + coins + ' moedas.');
  }
  function finishLose(st, bt) {
    var def = S.BOSS_BY_ID[bt.bossId];
    bt.over = 'lose';
    E.bump(st, 'battlesLost');
    if (def.premium) {
      // na arena não se perde nível: o Coliseu humilha, não mata
      var lx = E.loseXp(st, st.xp * S.PREMIUM_RULES.loseXpPct);
      E.setHp(st, E.combatStats(st).maxHp * C.REVIVE_PCT / 100);
      bt.result = { level: st.level, levelFrom: st.level, xpLost: lx };
      log(bt, '💀 CAÍSTE NA ARENA. Perdeste ' + lx + ' XP.', 'lose');
      var taunt = def.story ? def.story.taunt[Math.floor(S.rng.random() * def.story.taunt.length)] : null;
      if (taunt) log(bt, def.name + ': «' + taunt + '»', 'say');
      E.emit({ type: 'defeat', title: 'CAÍSTE NA ARENA', name: def.name, lines: (taunt ? ['«' + taunt + '»'] : []).concat(['Na arena não se perde nível.', 'Perdeste ' + lx + ' XP (25% do XP deste nível).', 'O Sistema reanimou-te com ' + C.REVIVE_PCT + '% da vida.']) });
      E.history(st, '💀', 'Caiu na arena contra ' + def.name + ': -' + lx + ' XP.');
      return;
    }
    var lv = E.loseLevel(st);
    // o Sistema reanima-te com 10% da vida
    E.setHp(st, E.combatStats(st).maxHp * C.REVIVE_PCT / 100);
    bt.result = { level: lv.to, levelFrom: lv.from };
    var lines = lv.to < lv.from
      ? ['Morreste: desceste do nível ' + lv.from + ' para o nível ' + lv.to + '.', 'Perdeste o XP do nível e ' + S.POINTS_PER_LEVEL + ' pontos de atributo.']
      : ['Morreste no nível 1: perdeste o XP acumulado.'];
    lines.push('O Sistema reanimou-te com ' + C.REVIVE_PCT + '% da vida. Bebe poções para recuperar.');
    log(bt, '💀 MORRESTE. ' + (lv.to < lv.from ? 'Desceste para o nível ' + lv.to + '.' : 'Perdeste o XP do nível.'), 'lose');
    E.emit({ type: 'defeat', title: 'MORRESTE', name: def.name, lines: lines });
    E.history(st, '💀', 'Morreu contra ' + def.name + (lv.to < lv.from ? ': desceu do nível ' + lv.from + ' para o ' + lv.to + '.' : '.'));
  }

  C.REVIVE_PCT = 10;

  C.unlockedActiveSkills = function (st) {
    return E.unlockedSkills(st).filter(function (s) { return s.type === 'active'; });
  };

  /* Ação do jogador: {type:'attack'|'skill'|'item'|'defend'|'flee'|'pass', id} */
  /* No fim da batalha (vitória ou fuga) a vida com que ficaste é guardada */
  C.act = function (type, id) {
    var res = actInner(type, id);
    var st = E.state, bt = st && st.battle;
    if (bt && bt.over && bt.over !== 'lose' && !bt.hpSaved) {
      bt.hpSaved = true;
      E.setHp(st, bt.p.hp);
      E.commit('vida');
    }
    return res;
  };
  function actInner(type, id) {
    var st = E.state;
    var bt = st.battle;
    if (!bt) return { ok: false, msg: 'Não estás em batalha.' };
    if (bt.over) return { ok: false, msg: 'A batalha terminou.' };
    var p = bt.p;
    if (p.stunned > 0 && type !== 'pass' && type !== 'flee') return { ok: false, msg: 'Estás atordoado.' };
    if (type === 'pass' && !(p.stunned > 0)) return { ok: false, msg: 'Ação inválida.' };

    switch (type) {
      case 'attack':
        doPlayerOp(bt, { op: 'dmg', kind: p.stats.main, mult: 1 }, 'Ataque');
        break;
      case 'skill': {
        var sk = S.ALL_SKILLS[id];
        var known = C.unlockedActiveSkills(st).some(function (s) { return s.id === id; });
        if (!sk || !known) return { ok: false, msg: 'Habilidade indisponível.' };
        if (p.cds[id] > 0) return { ok: false, msg: 'Em recarga (' + p.cds[id] + ' turnos).' };
        if (p.mp < sk.mp) return { ok: false, msg: 'Mana insuficiente.' };
        p.mp -= sk.mp;
        if (sk.cd) p.cds[id] = sk.cd + 1;
        log(bt, '✦ Usaste ' + sk.name + '.', 'skill');
        sk.ops.forEach(function (op) { if (bt.b.hp > 0 || op.op !== 'dmg') doPlayerOp(bt, op, sk.name); });
        break;
      }
      case 'item': {
        var it = S.ITEMS[id];
        if (!it || !it.battle) return { ok: false, msg: 'Este item não se usa em combate.' };
        if (E.count(st, id) < 1) return { ok: false, msg: 'Não tens este item.' };
        if (!S.time.itemActive(it)) return { ok: false, msg: 'Este item só funciona ' + S.time.PHASES[it.phase].desc + '.' };
        if (it.premium && (bt.premiumUsed || 0) >= S.PREMIUM_RULES.perBattle) return { ok: false, msg: 'O Sistema só permite ' + S.PREMIUM_RULES.perBattle + ' relíquia premium por batalha.' };
        if (it.premium) bt.premiumUsed = (bt.premiumUsed || 0) + 1;
        var isHeal = it.use.type === 'heal' || it.use.type === 'restore';
        if (isHeal && (bt.healsUsed || 0) >= C.HEAL_LIMIT) return { ok: false, msg: 'Já usaste ' + C.HEAL_LIMIT + ' poções de cura nesta batalha. O corpo não aguenta mais.' };
        if (isHeal) bt.healsUsed = (bt.healsUsed || 0) + 1;
        E.removeItem(st, id, 1);
        E.bump(st, 'consumablesUsed');
        var u = it.use;
        log(bt, '🎒 Usaste ' + it.name + '.', 'skill');
        var potK = 1 + (p.stats.potionPct || 0) / 100;
        if (u.type === 'heal') doPlayerOp(bt, { op: 'heal', pct: u.pct * potK });
        else if (u.type === 'mana') doPlayerOp(bt, { op: 'mp', pct: u.pct });
        else if (u.type === 'buffs') u.list.forEach(function (bf) { doPlayerOp(bt, { op: 'buff', key: bf.key, val: bf.val, turns: bf.turns }); });
        else if (u.type === 'cleanse') { p.st = p.st.filter(function (s) { return s.kind === 'buff'; }); log(bt, '🌿 Efeitos negativos removidos.', 'good'); }
        else if (u.type === 'bomb') {
          var d = damageBoss(bt, st.level * u.perLevel); log(bt, '💥 A bomba causa ' + d + ' de dano!', 'dmg');
          if (u.dot && bt.b.hp > 0) doPlayerOp(bt, Object.assign({ op: 'dot' }, u.dot));
          if (u.stun && bt.b.hp > 0) doPlayerOp(bt, { op: 'stun', chance: u.stun, turns: 1 });
        }
        else if (u.type === 'restore') {
          doPlayerOp(bt, { op: 'heal', pct: u.hp * potK }); doPlayerOp(bt, { op: 'mp', pct: u.mp });
          if (u.cleanse) { p.st = p.st.filter(function (s) { return s.kind === 'buff'; }); log(bt, '🌿 Efeitos negativos removidos.', 'good'); }
        }
        else if (u.type === 'judgment') {
          var bdef = S.BOSS_BY_ID[bt.bossId], R = S.PREMIUM_RULES;
          var jp = (bdef.premium || bdef.secret || bdef.special === 'final') ? R.judgmentPctPremium : R.judgmentPct;
          var jd = damageBoss(bt, bt.b.maxHp * jp / 100);
          log(bt, '💥 O Juízo Final corta ' + jd + ' de vida (' + jp + '%)!', 'dmg');
        }
        else if (u.type === 'monarch') {
          doPlayerOp(bt, { op: 'heal', pct: 100 }); doPlayerOp(bt, { op: 'mp', pct: 100 });
          p.st = p.st.filter(function (s) { return s.kind === 'buff'; });
          doPlayerOp(bt, { op: 'buff', key: 'atk', val: 40, turns: 3 }); doPlayerOp(bt, { op: 'buff', key: 'matk', val: 40, turns: 3 });
        }
        else if (u.type === 'ops') u.ops.forEach(function (op) { if (bt.b.hp > 0 || op.op !== 'dmg') doPlayerOp(bt, op); });
        else if (u.type === 'smoke') {
          bt.over = 'fled';
          bt.result = { coins: 0 };
          log(bt, '💨 Desapareceste no fumo. Fuga sem perdas.', 'sys');
          E.history(st, '💨', 'Fugiu de ' + S.BOSS_BY_ID[bt.bossId].name + ' com Pó de Fumo.');
          E.commit('fuga');
          return { ok: true };
        }
        break;
      }
      case 'defend':
        addStatus(p.st, { kind: 'buff', key: 'def', val: 60, turns: 1 });
        var mg = Math.min(p.maxMp - p.mp, Math.round(p.maxMp * 0.1));
        p.mp += mg;
        log(bt, '🛡️ Defendeste (+60% defesa, +' + mg + ' mana).', 'good');
        break;
      case 'flee': {
        var lost = E.loseCoins(st, st.coins * 0.05);
        bt.over = 'fled';
        bt.result = { coins: -lost };
        log(bt, '🏃 Fugiste e perdeste ' + lost + ' moedas.', 'sys');
        E.history(st, '🏃', 'Fugiu de ' + S.BOSS_BY_ID[bt.bossId].name + ': -' + lost + ' moedas.');
        E.commit('fuga');
        return { ok: true };
      }
      case 'pass':
        p.stunned--;
        log(bt, '💫 Estás atordoado e perdes o turno.', 'hurt');
        break;
      default:
        return { ok: false, msg: 'Ação inválida.' };
    }

    // invocações
    if (bt.b.hp > 0 && bt.summons.length) {
      bt.summons.forEach(function (s) {
        if (bt.b.hp <= 0) return;
        var effDef = bt.b.def * (1 - sum(bt.b.st, 'debuff', 'def') / 100);
        var d = damageBoss(bt, s.power * rnd(0.9, 1.1) * 100 / (100 + effDef));
        log(bt, '💀 ' + s.name + ' ataca: ' + d + '.', 'dmg');
      });
    }
    if (bt.b.hp > 0) tickDots(bt, bt.b.st, true);
    checkPhases(bt);
    if (bt.b.hp <= 0 && !rebirth(bt)) { finishWin(st, bt); E.commit('vitória'); return { ok: true }; }

    bossTurn(bt);
    tryRevive(st, bt);
    if (bt.b.hp <= 0 && !rebirth(bt)) { finishWin(st, bt); E.commit('vitória'); return { ok: true }; }
    if (p.hp > 0) { tickDots(bt, p.st, false); tryRevive(st, bt); }
    if (p.hp <= 0) { finishLose(st, bt); E.commit('derrota'); return { ok: true }; }
    endRound(bt);
    if (bt.turn > 150) {
      log(bt, '🌀 O portão fechou-se contigo lá dentro...', 'lose');
      finishLose(st, bt);
      E.commit('derrota');
      return { ok: true };
    }
    E.commit('turno');
    return { ok: true };
  }

  C.close = function () {
    var st = E.state;
    if (!st.battle) return { ok: true };
    if (!st.battle.over) return { ok: false, msg: 'A batalha ainda não acabou.' };
    st.battle = null;
    E.commit('fechar batalha');
    return { ok: true };
  };

  C.DOT_NAMES = { burn: 'queimadura', poison: 'veneno', bleed: 'sangramento', garden: 'rosa negra' };
  C.BUFF_NAMES = { atk: 'Ataque', matk: 'Ataque mágico', def: 'Defesa', crit: 'Crítico', eva: 'Esquiva', lifesteal: 'Roubo de vida', reflect: 'Reflexão' };
})(globalThis.SYS = globalThis.SYS || {});
