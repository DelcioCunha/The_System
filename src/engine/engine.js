/* ==========================================================
   MOTOR: estado, atributos, XP, moedas, itens, loja, baús,
   efeitos temporários, conquistas e histórico.
   Todas as funções que mudam o estado chamam commit() → grava.
   ========================================================== */
(function (S) {
  'use strict';

  var E = S.engine = {};
  S.clock = S.clock || { now: function () { return Date.now(); } };
  S.rng = S.rng || { random: function () { return Math.random(); } };

  E.state = null;
  E.events = [];
  E.listeners = [];

  /* ---------------- utilitários de data ---------------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  E.dateKey = function (ts) {
    var d = new Date(ts == null ? S.clock.now() : ts);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };
  E.parseKey = function (key) {
    var p = key.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  };
  E.addDays = function (key, n) {
    var d = E.parseKey(key);
    d.setDate(d.getDate() + n);
    return E.dateKey(d.getTime());
  };
  E.weekday = function (key) { return E.parseKey(key).getDay(); };
  /* prazo: fim do minuto indicado nesse dia */
  E.deadlineTs = function (key, hhmm) {
    var d = E.parseKey(key);
    var p = String(hhmm || '23:59').split(':');
    d.setHours(+p[0] || 0, +p[1] || 0, 59, 999);
    return d.getTime();
  };
  E.validTime = function (t) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(t)); };

  function rint(a, b) { return a + Math.floor(S.rng.random() * (b - a + 1)); }
  E.rint = rint;
  function uid(prefix) { return prefix + Date.now().toString(36) + Math.floor(S.rng.random() * 1e6).toString(36); }
  E.uid = uid;

  /* ---------------- eventos / notificações ---------------- */
  E.emit = function (ev) { E.events.push(ev); };
  E.takeEvents = function () { var e = E.events; E.events = []; return e; };
  E.history = function (st, icon, text) {
    st.history.unshift({ t: S.clock.now(), icon: icon, text: text });
    if (st.history.length > 300) st.history.length = 300;
  };

  /* ---------------- gravação ---------------- */
  E.commit = function (reason) {
    var st = E.state;
    if (!st) return false;
    E.checkAchievements(st);
    S.time.observe(st);
    st.meta.savedAt = Math.max(S.clock.now(), st.meta.savedAt || 0);
    st.meta.saveCount = (st.meta.saveCount || 0) + 1;
    st.meta.lastReason = reason || '';
    var ok = S.storage.write(st);
    E.listeners.forEach(function (fn) { try { fn(reason); } catch (e) { /* UI */ } });
    return ok;
  };

  /* ---------------- novo jogo ---------------- */
  function zeroStats() { var o = {}; S.STATS.forEach(function (k) { o[k] = 0; }); return o; }

  E.newState = function (name, cls, gender) {
    var now = S.clock.now();
    var today = E.dateKey(now);
    var st = {
      schema: S.SAVE_SCHEMA, appVersion: S.VERSION, created: now, lastRestore: today, watch: { trust: 100, text: [], quick: [], lastDay: today, total: 0 }, live: { hidden: {}, reports: [], reacted: {}, emDay: '', emCount: 0, emNext: 0, lastSeen: now }, talk: { seen: {}, last: 0, day: '', count: 0, att: { o: 0, d: 0, q: 0 }, skips: 0, damp: 1, talks: 0, done: {} }, crystals: 0, arena: { unlocked: {}, wins: {}, last: {} }, cosmetics: { owned: {}, moldura: null, nome: null }, shop: { orders: [], redeemed: {} }, playerId: S.premium ? S.premium.newId() : '',
      name: String(name).trim().slice(0, 24), cls: cls, gender: gender === 'f' ? 'f' : 'm',
      level: 1, xp: 0, coins: 100, freePoints: 0,
      alloc: zeroStats(), trained: zeroStats(), bonus: zeroStats(),
      inv: {}, equip: { weapon: null, armor: null, acc1: null, acc2: null },
      seen: {}, bought: {}, effects: [], secretSkills: [],
      missions: [], missionLog: {},
      daily: {
        enabled: true, deadline: '23:00', startDate: today,
        tasks: [
          { id: 't1', name: 'Flexões', target: 30, unit: 'rep' },
          { id: 't2', name: 'Abdominais', target: 30, unit: 'rep' },
          { id: 't3', name: 'Agachamentos', target: 30, unit: 'rep' },
          { id: 't4', name: 'Caminhada / corrida', target: 2, unit: 'km' }
        ],
        progress: { date: today, values: {} }, streak: 0, bestStreak: 0, lastDone: ''
      },
      lastProcessed: today,
      hp: null, // vida atual (null = cheia); só recupera com poções e itens
      defeated: {}, trophies: {}, revealed: {}, battle: null,
      achievements: {}, c: {}, history: [],
      settings: { vibrate: true },
      meta: { savedAt: now, saveCount: 0 }
    };
    if (E.dateKey(E.deadlineTs(today, st.daily.deadline)) === today && E.deadlineTs(today, st.daily.deadline) < now) {
      st.daily.startDate = E.addDays(today, 1);
    }
    // equipamento inicial
    var w = S.CLASS_WEAPONS[cls][0];
    st.equip.weapon = w; st.seen[w] = true;
    st.equip.armor = 'ar_couro'; st.seen.ar_couro = true;
    E.addItem(st, 'po_vida1', 3);
    E.addItem(st, 'po_mana1', 2);
    E.addItem(st, 'bau_comum', 1);
    E.history(st, '✨', 'O Sistema escolheu ' + st.name + ' como ' + S.CLASSES[cls].name + '.');
    if (S.shop) S.shop.ensure(st);
    return st;
  };

  /* Garante que gravações antigas têm todos os campos */
  E.migrate = function (st) {
    var fresh = E.newState(st.name || 'Caçador', S.CLASSES[st.cls] ? st.cls : 'guerreiro');
    Object.keys(fresh).forEach(function (k) { if (st[k] === undefined) st[k] = fresh[k]; });
    ['alloc', 'trained', 'bonus'].forEach(function (k) { S.STATS.forEach(function (s) { if (typeof st[k][s] !== 'number') st[k][s] = 0; }); });
    Object.keys(fresh.daily).forEach(function (k) { if (st.daily[k] === undefined) st.daily[k] = fresh.daily[k]; });
    Object.keys(fresh.equip).forEach(function (k) { if (st.equip[k] === undefined) st.equip[k] = null; });
    S.time.ensure(st);
    if (S.watch) S.watch.ensure(st);
    if (S.live) S.live.ensure(st);
    if (S.talk) S.talk.ensure(st);
    if (S.premium) S.premium.ensure(st);
    if (S.shop) S.shop.ensure(st);
    if (S.shadows) S.shadows.ensure(st);
    if (S.body) S.body.ensure(st);
    if (st.hp === undefined) st.hp = null;
    // a Loja de lazer foi removida: as recompensas que ainda estavam na Bolsa voltam a moedas
    var lzBack = 0, lzN = 0;
    Object.keys(st.inv || {}).forEach(function (id) {
      if (!/^(lz_|cl_)/.test(id) || S.ITEMS[id]) return;
      var n = st.inv[id] || 0, cl = (st.customLeisure || []).filter(function (c) { return c.id === id; })[0];
      var p = (S.LEISURE_REFUND || {})[id] || (cl && cl.price) || 0;
      lzBack += p * n; lzN += n; delete st.inv[id];
    });
    if (st.customLeisure && st.customLeisure.length) st.customLeisure = [];
    if (lzN) { st.coins += lzBack; st.leisureRefund = { coins: lzBack, n: lzN }; E.history(st, '🪙', 'A Loja de lazer fechou: ' + lzN + ' recompensa(s) devolvida(s), +' + lzBack + ' moedas.'); }
    // os chefes secretos mudaram (A Última Arena): quem os venceu com as regras antigas volta a enfrentá-los no fim
    if (!(st.finale && st.finale.seen) && ((st.defeated || {}).secret_1 || (st.defeated || {}).secret_2 || (st.revealed || {}).secret_1)) {
      st.oldSecrets = { secret_1: st.defeated.secret_1 || 0, secret_2: st.defeated.secret_2 || 0 };
      ['secret_1', 'secret_2'].forEach(function (id) { delete st.defeated[id]; delete st.trophies[id]; if (st.revealed) delete st.revealed[id]; });
    }
    if (S.combat && S.combat.finalProgress && !st.finale && S.combat.finalProgress(st).ready) st.finale = { at: S.clock.now(), seen: 0 };
    // troféus de chefes derrotados antes desta versão
    Object.keys(st.defeated || {}).forEach(function (id) { if (S.TROPHIES[id] && !st.trophies[id]) st.trophies[id] = st.defeated[id]; });
    // itens que deixaram de existir são convertidos em moedas
    Object.keys(st.inv).forEach(function (id) { if (!E.item(id, st)) { st.coins += 100 * st.inv[id]; delete st.inv[id]; } });
    Object.keys(st.equip).forEach(function (k) { if (st.equip[k] && !E.item(st.equip[k], st)) st.equip[k] = null; });
    st.schema = S.SAVE_SCHEMA;
    st.appVersion = S.VERSION;
    return st;
  };

  /* ---------------- itens ---------------- */
  E.item = function (id, st) {
    st = st || E.state;
    if (S.ITEMS[id]) return S.ITEMS[id];
    return null;
  };
  E.count = function (st, id) { return st.inv[id] || 0; };
  E.addItem = function (st, id, qty) {
    qty = qty || 1;
    // relíquias permanentes: só se tem uma; receber outra = recarga imediata
    var rel = S.ITEMS[id];
    if (rel && rel.perma) { if (st.inv[id] > 0) { if (st.relics) st.relics[id] = 0; return; } qty = 1; }
    st.inv[id] = (st.inv[id] || 0) + qty;
    st.seen[id] = true;
  };
  E.removeItem = function (st, id, qty) {
    qty = qty || 1;
    if ((st.inv[id] || 0) < qty) return false;
    st.inv[id] -= qty;
    if (st.inv[id] <= 0) delete st.inv[id];
    return true;
  };

  /* ---------------- atributos e estatísticas ---------------- */
  E.unlockedSkills = function (st) {
    var out = [];
    S.CLASS_SKILLS[st.cls].forEach(function (s) { if (st.level >= s.unlock) out.push(s); });
    S.COMMON_SKILLS.forEach(function (s) { if (st.level >= s.unlock) out.push(s); });
    st.secretSkills.forEach(function (id) { if (S.ALL_SKILLS[id]) out.push(S.ALL_SKILLS[id]); });
    return out;
  };
  E.passives = function (st) {
    var p = {};
    E.unlockedSkills(st).forEach(function (s) {
      if (s.type !== 'passive') return;
      Object.keys(s.passive).forEach(function (k) { p[k] = (p[k] || 0) + s.passive[k]; });
    });
    return p;
  };
  E.equipBonus = function (st) {
    var b = { atk: 0, matk: 0, def: 0, crit: 0, critDmg: 0, eva: 0, lifesteal: 0, hpPct: 0, mpPct: 0, regenHp: 0, regenMp: 0, summonPct: 0, xpPct: 0, coinPct: 0, allStatsPct: 0, stats: zeroStats() };
    function addAll(src) {
      Object.keys(src).forEach(function (k) {
        if (k === 'slot') return;
        if (k === 'stats') { Object.keys(src.stats).forEach(function (s) { b.stats[s] += src.stats[s]; }); }
        else b[k] = (b[k] || 0) + src[k];
      });
    }
    Object.keys(st.equip).forEach(function (slot) {
      var id = st.equip[slot];
      var it = id && E.item(id, st);
      if (it && it.equip && S.time.itemActive(it)) addAll(it.equip);
    });
    E.completedSets(st).forEach(function (g) { addAll(S.TROPHY_SETS[g].bonus); });
    // Conjunto do Monarca (peças soberanas equipadas)
    var nPrem = E.monarchPieces(st);
    (S.MONARCH_SET || []).forEach(function (t) { if (nPrem >= t.n) addAll(t.bonus); });
    return b;
  };
  E.monarchPieces = function (st) {
    return Object.keys(st.equip).filter(function (slot) { var it = st.equip[slot] && E.item(st.equip[slot], st); return it && it.premium && it.equip; }).length;
  };
  /* ---------------- troféus ---------------- */
  E.trophyCount = function (st) { return Object.keys(st.trophies || {}).length; };
  E.gateTrophies = function (st, gate) {
    var list = gate === 0 ? S.SECRET_BOSSES : S.BOSSES.filter(function (b) { return b.gate === gate; });
    return { have: list.filter(function (b) { return st.trophies && st.trophies[b.id]; }).length, total: list.length };
  };
  E.completedSets = function (st) {
    var out = [];
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0].forEach(function (g) { var t = E.gateTrophies(st, g); if (t.have === t.total) out.push(g); });
    return out;
  };

  /* ---------------- condições de compra ---------------- */
  E.reqStatus = function (st, it) {
    var lines = [];
    if (it.lvl > 1) lines.push({ ok: st.level >= it.lvl, text: 'Nível ' + it.lvl });
    var q = it.req;
    if (q) {
      if (q.boss) {
        var b = S.BOSS_BY_ID[q.boss];
        var known = !b.secret || S.combat.bossUnlocked(st, b) || st.defeated[b.id];
        lines.push({ ok: !!st.defeated[q.boss], text: 'Derrotar ' + (known ? b.name + ' (Nv ' + b.level + ')' : '???') });
      }
      if (q.bosses) lines.push({ ok: (st.c.bossesKilled || 0) >= q.bosses, text: 'Derrotar ' + q.bosses + ' chefes (' + (st.c.bossesKilled || 0) + ')' });
      if (q.trophies) lines.push({ ok: E.trophyCount(st) >= q.trophies, text: 'Ter ' + q.trophies + ' troféus (' + E.trophyCount(st) + ')' });
      if (q.ach) {
        var a = S.ACH_BY_ID[q.ach];
        lines.push({ ok: !!st.achievements[q.ach], text: 'Conquista: ' + (a ? (a.realName || a.name) : q.ach) });
      }
    }
    return { ok: lines.every(function (l) { return l.ok; }), lines: lines };
  };

  E.totalStats = function (st) {
    var cls = S.CLASSES[st.cls];
    var eb = E.equipBonus(st);
    var pas = E.passives(st);
    var pct = 1 + ((eb.allStatsPct || 0) + (pas.allStatsPct || 0)) / 100;
    var t = {};
    S.STATS.forEach(function (k) {
      var growth = cls.growth.indexOf(k) >= 0 ? (st.level - 1) : 0;
      var v = cls.base[k] + growth + st.alloc[k] + st.trained[k] + st.bonus[k] + eb.stats[k];
      t[k] = v * pct;
    });
    return t;
  };
  E.combatStats = function (st) {
    var t = E.totalStats(st);
    var eb = E.equipBonus(st);
    var p = E.passives(st);
    var L = st.level;
    var s = {};
    var cls = S.CLASSES[st.cls];
    function scaled(map) { return Object.keys(map).reduce(function (sum, k) { return sum + t[k] * map[k]; }, 0); }
    s.maxHp = Math.round((80 + t.vit * 10 + L * 15) * (cls.hpMult || 1) * (1 + ((eb.hpPct || 0) + (p.hpPct || 0)) / 100));
    s.maxMp = Math.round((30 + t.int * 5 + L * 3) * (1 + ((p.mpPct || 0) + (eb.mpPct || 0)) / 100));
    s.atk = Math.round((scaled(cls.atkScale) + eb.atk) * (1 + (p.atkPct || 0) / 100));
    s.matk = Math.round((scaled(cls.matkScale) + eb.matk) * (1 + (p.matkPct || 0) / 100));
    s.def = Math.round((t.vit * 0.9 + eb.def) * (1 + (p.defPct || 0) / 100));
    s.crit = Math.min(75, 5 + t.agi * 0.25 + t.per * 0.15 + eb.crit + (p.crit || 0));
    s.critDmg = 150 + eb.critDmg + (p.critDmg || 0);
    s.eva = Math.min(40, t.agi * 0.2 + t.per * 0.05 + eb.eva + (p.eva || 0));
    s.lifesteal = eb.lifesteal + (p.lifesteal || 0);
    s.regenHp = (p.regenHp || 0) + (eb.regenHp || 0);
    s.regenMp = 3 + (p.regenMp || 0) + (eb.regenMp || 0);
    s.summonPct = (p.summonPct || 0) + (eb.summonPct || 0);
    s.lastStand = !!p.lastStand;
    s.revive = p.revive || 0;
    s.lowHpAtk = p.lowHpAtk || 0;
    s.xpPct = (eb.xpPct || 0) + (p.xpPct || 0);
    s.coinPct = eb.coinPct || 0;
    // mecânicas de equipamento (itens novos)
    ['thorns', 'openShield', 'execute', 'firstStrike', 'manaOnHit', 'dotPct', 'stunRes', 'potionPct'].forEach(function (k) { s[k] = eb[k] || 0; });
    s.stunRes = Math.min(80, s.stunRes);
    s.main = S.CLASSES[st.cls].main;
    s.power = Math.round(s.maxHp / 10 + Math.max(s.atk, s.matk) * 1.5 + s.def + s.crit * 3);
    return s;
  };

  /* quanto o equipamento vestido acrescenta (compara com o jogador sem nada equipado) */
  E.equipDelta = function (st) {
    var bare = Object.assign({}, st, { equip: { weapon: null, armor: null, acc1: null, acc2: null } });
    var t1 = E.totalStats(st), t0 = E.totalStats(bare), c1 = E.combatStats(st), c0 = E.combatStats(bare);
    var stats = {}, combat = {};
    S.STATS.forEach(function (k) { stats[k] = Math.floor(t1[k]) - Math.floor(t0[k]); });
    Object.keys(c1).forEach(function (k) { if (typeof c1[k] === 'number' && typeof c0[k] === 'number') combat[k] = Math.round((c1[k] - c0[k]) * 10) / 10; });
    return { stats: stats, combat: combat };
  };

  /* ---------------- vida atual (persiste entre batalhas) ---------------- */
  E.curHp = function (st) {
    var max = E.combatStats(st).maxHp;
    if (st.hp == null) return max;
    return Math.max(0, Math.min(max, Math.round(st.hp)));
  };
  E.setHp = function (st, v) {
    var max = E.combatStats(st).maxHp;
    st.hp = Math.max(0, Math.min(max, Math.round(v)));
    if (st.hp >= max) st.hp = null;
  };
  /* Novo dia: o Sistema restaura toda a vida e mana do jogador.
     - Acontece uma vez por dia, na primeira verificação depois da meia-noite (hora do telemóvel).
     - Se houver uma batalha a decorrer, espera que ela acabe.
     - Com o relógio do telemóvel atrasado (batota), não restaura. */
  E.dailyRestore = function (st) {
    if (!st) return false;
    var today = E.dateKey();
    if (!st.lastRestore) { st.lastRestore = today; return false; }
    if (st.lastRestore >= today) return false;
    if (S.time && S.time.tampered(st)) return false;
    if (st.battle && !st.battle.over) return false;
    var max = E.combatStats(st).maxHp, before = E.curHp(st);
    st.lastRestore = today;
    st.hp = null; // vida cheia (a mana começa sempre cheia em cada batalha)
    var day = S.time ? S.time.systemDay(st) : 0;
    E.emit({ type: 'info', restore: true, title: 'NOVO DIA', name: 'Dia ' + day + ' do Sistema',
      lines: before < max ? ['Vida restaurada: ' + before + ' → ' + max, 'Mana restaurada ao máximo', 'O Sistema espera grandes feitos hoje.'] : ['Vida e mana no máximo', 'O Sistema espera grandes feitos hoje.'] });
    E.history(st, '🌅', 'Novo dia: o Sistema restaurou toda a vida e mana' + (before < max ? ' (' + before + ' → ' + max + ').' : '.'));
    return true;
  };
  E.healHp = function (st, pct) {
    var max = E.combatStats(st).maxHp, cur = E.curHp(st);
    var h = Math.min(max - cur, Math.round(max * pct / 100));
    E.setHp(st, cur + h);
    return h;
  };

  /* Morte: desce um nível (mínimo 1), perde o XP do nível e os pontos desse nível */
  E.loseLevel = function (st) {
    var from = st.level;
    if (st.level > 1) {
      st.level -= 1;
      var take = S.POINTS_PER_LEVEL;
      var free = Math.min(st.freePoints, take);
      st.freePoints -= free; take -= free;
      while (take > 0) {
        var k = S.STATS.slice().sort(function (a, b) { return st.alloc[b] - st.alloc[a]; })[0];
        if (!st.alloc[k]) break;
        st.alloc[k] -= 1; take -= 1;
      }
    }
    st.xp = 0;
    return { from: from, to: st.level };
  };

  E.allocate = function (stat, n) {
    var st = E.state;
    n = n || 1;
    if (S.STATS.indexOf(stat) < 0) return { ok: false, msg: 'Atributo inválido.' };
    if (st.freePoints < n) return { ok: false, msg: 'Sem pontos livres.' };
    st.freePoints -= n;
    st.alloc[stat] += n;
    st.c.pointsAllocated = (st.c.pointsAllocated || 0) + n;
    E.commit('alocar');
    return { ok: true };
  };

  /* ---------------- efeitos temporários ---------------- */
  E.cleanEffects = function (st) {
    var now = S.clock.now();
    st.effects = st.effects.filter(function (e) { return e.until > now; });
  };
  E.hasEffect = function (st, id) {
    var now = S.clock.now();
    return st.effects.some(function (e) { return e.id === id && e.until > now; });
  };
  E.addEffect = function (st, id, hours) {
    E.cleanEffects(st);
    var now = S.clock.now();
    var ex = st.effects.filter(function (e) { return e.id === id; })[0];
    if (ex) ex.until += hours * 3600000;
    else st.effects.push({ id: id, until: now + hours * 3600000 });
  };

  /* ---------------- XP e moedas ---------------- */
  E.xpMultiplier = function (st) {
    var m = 1;
    if (E.hasEffect(st, 'xp2')) m *= 2;
    if (E.hasEffect(st, 'xp15')) m *= 1.5;
    if (E.hasEffect(st, 'exausto')) m *= 0.8;
    if (E.hasEffect(st, 'monarca')) m *= 1.5;
    if (st.perks && st.perks.monarca) m *= 1.15;
    m *= 1 + E.combatStats(st).xpPct / 100;
    return m;
  };
  E.coinMultiplier = function (st) {
    var m = 1;
    if (E.hasEffect(st, 'coin2')) m *= 2;
    if (E.hasEffect(st, 'monarca')) m *= 1.5;
    if (st.perks && st.perks.monarca) m *= 1.15;
    m *= 1 + E.combatStats(st).coinPct / 100;
    return m;
  };

  E.gainXp = function (st, base, useMult) {
    var amount = Math.max(0, Math.round(base * (useMult === false ? 1 : E.xpMultiplier(st))));
    st.xp += amount;
    st.c.xpEarned = (st.c.xpEarned || 0) + amount;
    while (st.xp >= S.xpToNext(st.level)) {
      st.xp -= S.xpToNext(st.level);
      st.level += 1;
      st.freePoints += S.POINTS_PER_LEVEL;
      var newSkills = E.unlockedSkills(st).filter(function (s) { return s.unlock === st.level && !s.secret; });
      E.emit({ type: 'levelup', level: st.level, title: S.titleFor(st.level), skills: newSkills.map(function (s) { return s.name; }) });
      E.history(st, '⬆️', 'Subiu para o nível ' + st.level + ' — ' + S.titleFor(st.level) + '.');
      if (S.live) S.live.react(st, 'level', { level: st.level });
    }
    return amount;
  };
  /* Perde XP só dentro do nível atual (nunca desce de nível) */
  E.loseXp = function (st, amount) {
    var lost = Math.min(st.xp, Math.max(0, Math.round(amount)));
    st.xp -= lost;
    return lost;
  };
  E.gainCoins = function (st, base, useMult) {
    var amount = Math.max(0, Math.round(base * (useMult === false ? 1 : E.coinMultiplier(st))));
    st.coins += amount;
    st.c.coinsEarned = (st.c.coinsEarned || 0) + amount;
    return amount;
  };
  E.loseCoins = function (st, amount) {
    var lost = Math.min(st.coins, Math.max(0, Math.round(amount)));
    st.coins -= lost;
    st.c.coinsLost = (st.c.coinsLost || 0) + lost;
    return lost;
  };
  /* fim da conversa final: abre a Última Arena */
  E.finaleSeen = function () {
    var st = E.state;
    if (!st || !st.finale) return null;
    if (st.finale.seen) return { first: false };
    st.finale.seen = S.clock.now();
    E.history(st, '✒️', 'Conheceu o Arquiteto. A Última Arena abriu-se.');
    E.emit({ type: 'info', title: 'A ÚLTIMA ARENA', name: 'Dois últimos adversários', lines: ['O Sistema, Forma Suprema (Nv ' + S.BOSS_BY_ID.secret_1.level + ')', 'Delcio Cunha, o Arquiteto (Nv ' + S.BOSS_BY_ID.secret_2.level + ')', 'Encontra-os no separador Combate.'] });
    E.commit('última arena');
    return { first: true };
  };
  E.bump = function (st, key, n) { st.c[key] = (st.c[key] || 0) + (n == null ? 1 : n); };

  /* ---------------- loja ---------------- */
  E.price = function (st, id) {
    var it = E.item(id, st);
    if (!it || !it.price) return null;
    var n = st.bought[id] || 0;
    var base = it.price;
    // preço que acompanha o nível (ex.: Selo de Ascensão)
    if (it.priceScale) base = it.priceScale * S.levelMult(st.level) * (1 + st.level / 25);
    var p = base * Math.pow(1 + (it.priceStep || 0), n);
    if (it.priceScale) return Math.round(p / 100) * 100;
    // consumíveis e baús acompanham o nível, para nunca ficarem baratos
    var f = E.priceFactor(st, it);
    if (f !== 1) return Math.max(10, Math.round(it.price * f / 10) * 10);
    return it.priceStep ? Math.round(p / 10) * 10 : it.price;
  };
  E.priceFactor = function (st, it) {
    if (!it || it.custom) return 1;
    var lm = S.levelMult(st.level);
    if (it.cat === 'consumivel') return lm * (1 + st.level / 40);
    if (it.fixedPrice) return 1;
    if (it.cat === 'bau') return lm;
    return 1;
  };
  E.canEquipClass = function (st, it) { return !it.cls || it.cls.indexOf(st.cls) >= 0; };
  E.shopList = function (st, tab) {
    var list = Object.keys(S.ITEMS).map(function (k) { return S.ITEMS[k]; })
      .filter(function (it) { return it.cat === tab && it.price && !it.secret; });
    if (tab === 'arma') list = list.filter(function (it) { return E.canEquipClass(st, it); });
    return list.sort(function (a, b) { return (a.lvl - b.lvl) || (a.price - b.price); });
  };
  E.buy = function (id, qty) {
    var st = E.state;
    qty = Math.max(1, Math.min(99, qty || 1));
    var it = E.item(id, st);
    if (!it || !it.price) return { ok: false, msg: 'Este item não está à venda.' };
    var rq = E.reqStatus(st, it);
    if (!rq.ok) return { ok: false, msg: 'Bloqueado: ' + rq.lines.filter(function (l) { return !l.ok; }).map(function (l) { return l.text; }).join(', ') + '.' };
    if (it.cat === 'arma' && !E.canEquipClass(st, it)) return { ok: false, msg: 'A tua classe não pode usar esta arma.' };
    var total = 0;
    var b0 = st.bought[id] || 0;
    for (var i = 0; i < qty; i++) {
      st.bought[id] = b0 + i;
      total += E.price(st, id);
    }
    st.bought[id] = b0;
    if (st.coins < total) return { ok: false, msg: 'Moedas insuficientes (precisas de ' + total + ').' };
    st.coins -= total;
    st.bought[id] = b0 + qty;
    E.bump(st, 'coinsSpent', total);
    E.bump(st, 'itemsBought', qty);
    E.addItem(st, id, qty);
    E.history(st, '🛒', 'Comprou ' + (qty > 1 ? qty + '× ' : '') + it.name + ' por ' + total + ' moedas.');
    E.commit('compra');
    return { ok: true, total: total };
  };
  E.sellValue = function (st, id) {
    var it = E.item(id, st);
    if (!it || it.custom || it.premium) return 0;
    if (it.price) return Math.max(1, Math.floor(it.price * 0.35));
    var byR = { comum: 20, incomum: 60, raro: 250, epico: 900, lendario: 3000, mitico: 6000, secreto: 4000 };
    return byR[it.rarity] || 10;
  };
  E.sell = function (id, qty) {
    var st = E.state;
    qty = qty || 1;
    var v = E.sellValue(st, id);
    if (!v) return { ok: false, msg: 'Este item não pode ser vendido.' };
    if (!E.removeItem(st, id, qty)) return { ok: false, msg: 'Não tens esse item.' };
    var got = E.gainCoins(st, v * qty, false);
    E.bump(st, 'itemsSold', qty);
    E.history(st, '💱', 'Vendeu ' + (qty > 1 ? qty + '× ' : '') + E.item(id, st).name + ' por ' + got + ' moedas.');
    E.commit('venda');
    return { ok: true, coins: got };
  };
  /* ---------------- equipamento ---------------- */
  E.equip = function (id, slotHint) {
    var st = E.state;
    var it = E.item(id, st);
    if (!it || !it.equip) return { ok: false, msg: 'Não é equipável.' };
    if (st.battle && !st.battle.over) return { ok: false, msg: 'Não podes trocar de equipamento a meio de uma batalha.' };
    if (E.count(st, id) < 1) return { ok: false, msg: 'Não tens este item.' };
    if (st.level < it.lvl) return { ok: false, msg: 'Precisas de nível ' + it.lvl + '.' };
    if (!E.canEquipClass(st, it)) return { ok: false, msg: 'A tua classe não pode usar isto.' };
    var slot = it.equip.slot;
    if (slot === 'acc') {
      if (slotHint === 'acc1' || slotHint === 'acc2') slot = slotHint;
      else slot = !st.equip.acc1 ? 'acc1' : (!st.equip.acc2 ? 'acc2' : 'acc1');
    }
    E.removeItem(st, id, 1);
    var old = st.equip[slot];
    if (old) E.addItem(st, old, 1);
    st.equip[slot] = id;
    E.commit('equipar');
    return { ok: true, slot: slot };
  };
  E.unequip = function (slot) {
    var st = E.state;
    if (st.battle && !st.battle.over) return { ok: false, msg: 'Não podes trocar de equipamento a meio de uma batalha.' };
    var id = st.equip[slot];
    if (!id) return { ok: false, msg: 'Nada equipado.' };
    st.equip[slot] = null;
    E.addItem(st, id, 1);
    E.commit('desequipar');
    return { ok: true };
  };

  /* ---------------- baús ---------------- */
  function pickWeighted(table) {
    var total = table.reduce(function (s, r) { return s + r[1]; }, 0);
    var x = S.rng.random() * total;
    for (var i = 0; i < table.length; i++) { x -= table[i][1]; if (x < 0) return table[i][0]; }
    return table[table.length - 1][0];
  }
  function resolveLoot(st, key) {
    if (key.indexOf('@weapon:') === 0) {
      var tier = +key.split(':')[1];
      var list = S.CLASS_WEAPONS[st.cls];
      return list[Math.min(list.length, Math.max(1, tier)) - 1];
    }
    if (key === '@acc') {
      var accs = Object.keys(S.ITEMS).filter(function (k) { var a = S.ITEMS[k]; return a.cat === 'acessorio' && !a.secret && !a.req && a.lvl <= st.level + 5; });
      return accs[Math.floor(S.rng.random() * accs.length)];
    }
    return key;
  }
  /* baús especializados: só um tipo de item, nível e qualidade pelo grau */
  var VAR_RE = /_(art|camp)$/;
  function hasVariants(id) { return !!(S.ITEMS[id + '_art'] || S.ITEMS[id + '_camp']); }
  function specPool(st, cat, g) {
    var top = Math.max(g.lo + 10, st.level + 10);
    var list = Object.keys(S.ITEMS).filter(function (k) {
      var it = S.ITEMS[k];
      if (it.cat !== cat || it.secret || it.premium || it.relic || it.custom || it.chestFam) return false;
      if (cat === 'arma' && !E.canEquipClass(st, it)) return false;
      if (cat === 'consumivel' || cat === 'atributo') return !it.priceScale && it.use && it.use.type !== 'reset' && it.use.type !== 'levelUp';
      return it.lvl >= g.lo && it.lvl <= Math.min(g.hi, top);
    });
    if (!list.length && cat !== 'consumivel' && cat !== 'atributo') list = Object.keys(S.ITEMS).filter(function (k) { var it = S.ITEMS[k]; return it.cat === cat && !it.secret && !it.premium && !it.relic && !it.chestFam && it.lvl >= g.lo && it.lvl <= g.hi && (cat !== 'arma' || E.canEquipClass(st, it)); });
    return list;
  }
  var ALCH_RAR = [['comum', 'incomum'], ['incomum', 'raro'], ['raro', 'epico'], ['epico', 'lendario'], ['lendario', 'mitico']];
  function rollSpec(st, cat, gk) {
    var g = S.CHEST_GRADES[gk - 1], pool = specPool(st, cat, g);
    if (cat === 'consumivel' || cat === 'atributo') {
      var rr = ALCH_RAR[gk - 1];
      var ok = pool.filter(function (k) { return rr.indexOf(S.ITEMS[k].rarity) >= 0 && (S.ITEMS[k].lvl || 1) <= Math.max(st.level + 15, g.lo + 20); });
      if (!ok.length) ok = pool.filter(function (k) { return rr.indexOf(S.ITEMS[k].rarity) >= 0; });
      return ok.length ? ok[Math.floor(S.rng.random() * ok.length)] : null;
    }
    var buckets = [[], [], [], []];
    pool.forEach(function (k) { var m = k.match(VAR_RE); buckets[m ? (m[1] === 'art' ? 1 : 2) : (hasVariants(k) ? 0 : 3)].push(k); });
    var w = g.w.map(function (x, i) { return buckets[i].length ? x : 0; });
    var tot = w.reduce(function (a, b) { return a + b; }, 0);
    if (!tot) return pool.length ? pool[Math.floor(S.rng.random() * pool.length)] : null;
    var x = S.rng.random() * tot, bi = 0;
    for (; bi < 4; bi++) { x -= w[bi]; if (x < 0) break; }
    var b = buckets[Math.min(bi, 3)];
    // dentro do grupo, os itens de nível mais alto saem um pouco mais vezes
    var ws = b.map(function (k) { return 1 + (S.ITEMS[k].lvl - g.lo) / 20; }), t2 = ws.reduce(function (a, c) { return a + c; }, 0), y = S.rng.random() * t2;
    for (var i = 0; i < b.length; i++) { y -= ws[i]; if (y < 0) return b[i]; }
    return b[b.length - 1];
  }
  function openSpecial(st, tier, def) {
    var fam = S.CHEST_FAMS.filter(function (f) { return f.id === def.fam; })[0];
    var per = E.totalStats(st).per;
    var rolls = def.rolls + (S.rng.random() < Math.min(0.5, per / 400) ? 1 : 0) + (E.hasEffect(st, 'sorte') ? 1 : 0);
    var items = [];
    for (var i = 0; i < rolls; i++) {
      var cat = fam.id === 'guerra' ? fam.pool[i % 2] : fam.id === 'alquimia' ? (def.grade >= 2 && S.rng.random() < [0, 0.15, 0.25, 0.35, 0.45][def.grade - 1] ? 'atributo' : 'consumivel') : fam.pool[0];
      var id = rollSpec(st, cat, def.grade);
      if (!id || !S.ITEMS[id]) continue;
      E.addItem(st, id, 1); items.push(id);
    }
    // grau Monarca: pequena hipótese de um item secreto do mesmo tipo
    if (def.grade === 5) {
      var sx = { arsenal: ['sx_lamina'], armaria: ['ar_soberano'], guerra: ['sx_lamina', 'ar_soberano'], joias: ['sx_coroa', 'sx_olho'], alquimia: ['sx_coracao', 'el_nectar'] }[fam.id];
      if (sx && S.rng.random() < 0.05) { var sid = sx[Math.floor(S.rng.random() * sx.length)]; E.addItem(st, sid, 1); items.push(sid); }
    }
    E.bump(st, 'chestsOpened');
    E.bump(st, 'specialChests');
    if (def.grade === 5) E.bump(st, 'monarchChests');
    return { coins: 0, items: items };
  }
  E.openChest = function (st, tier) {
    var def = S.CHESTS[tier];
    if (!def) return null;
    if (def.fam) return openSpecial(st, tier, def);
    var lm = S.levelMult(st.level);
    var coins = E.gainCoins(st, rint(def.coins[0], def.coins[1]) * lm, false);
    var items = [];
    var per = E.totalStats(st).per;
    var rolls = def.rolls + (S.rng.random() < Math.min(0.5, per / 400) ? 1 : 0) + (E.hasEffect(st, 'sorte') ? 1 : 0);
    for (var i = 0; i < rolls; i++) {
      var id = resolveLoot(st, pickWeighted(def.table));
      if (!S.ITEMS[id]) continue;
      E.addItem(st, id, 1);
      items.push(id);
    }
    E.bump(st, 'chestsOpened');
    if (tier === 'secreto') E.bump(st, 'secretChests');
    return { coins: coins, items: items };
  };

  /* ---------------- usar itens fora de combate ---------------- */
  E.useItem = function (id) {
    var st = E.state;
    var it = E.item(id, st);
    if (!it || !it.use) return { ok: false, msg: 'Este item não pode ser usado.' };
    if (E.count(st, id) < 1) return { ok: false, msg: 'Não tens este item.' };
    if (!it.field) return { ok: false, msg: it.battle ? 'Este item só se usa em combate.' : 'Este item funciona sozinho enquanto estiver na bolsa.' };
    if (!S.time.itemActive(it)) return { ok: false, msg: 'Este item só funciona ' + S.time.PHASES[it.phase].desc + ' (' + S.time.PHASES[it.phase].name + ').' };
    var u = it.use;
    var res = { ok: true, msg: '' };
    switch (u.type) {
      case 'levelUp':
        E.removeItem(st, id);
        var keep = st.xp, before = st.level;
        st.xp = 0;
        E.gainXp(st, S.xpToNext(st.level), false);
        st.xp = Math.min(keep, Math.max(0, S.xpToNext(st.level) - 1));
        res.msg = 'Ascensão! Nível ' + before + ' → ' + st.level + '.';
        res.levelUp = true;
        E.history(st, it.icon, 'Usou ' + it.name + ': subiu para o nível ' + st.level + '.');
        break;
      case 'heal':
      case 'restore':
        var max = E.combatStats(st).maxHp;
        if (E.curHp(st) >= max) return { ok: false, msg: 'A tua vida já está cheia.' };
        if (st.battle && !st.battle.over) return { ok: false, msg: 'Em batalha, usa as poções pelo botão Itens.' };
        E.removeItem(st, id);
        var hh = E.healHp(st, u.type === 'heal' ? u.pct : u.hp);
        E.bump(st, 'consumablesUsed');
        res.msg = '+' + hh + ' de vida (' + E.curHp(st) + ' / ' + max + ').';
        res.healed = hh;
        E.history(st, it.icon, 'Bebeu ' + it.name + ': +' + hh + ' de vida.');
        break;
      case 'rename':
        return { ok: false, rename: true, msg: 'Escolhe o novo nome.' };
      case 'shadowSlot':
        if (!S.shadows.addSlot(st)) return { ok: false, msg: 'Já tens os 3 lugares extra de servos.' };
        E.removeItem(st, id);
        res.msg = 'Mais um lugar de servo convocado: agora tens ' + S.shadows.slots(st) + ' lugares.';
        E.history(st, it.icon, 'Usou ' + it.name + ': ' + S.shadows.slots(st) + ' lugares de servos convocados.');
        break;
      case 'perk':
        st.perks = st.perks || {};
        if (st.perks[u.perk]) return { ok: false, msg: 'Este bónus já é teu para sempre.' };
        E.removeItem(st, id);
        st.perks[u.perk] = Date.now();
        res.msg = it.name + ': o bónus é teu para sempre.';
        E.history(st, it.icon, 'Ativou para sempre ' + it.name + '.');
        break;
      case 'timed':
        E.removeItem(st, id);
        E.addEffect(st, u.effect, u.hours);
        E.bump(st, 'consumablesUsed');
        res.msg = S.TIMED_EFFECTS[u.effect].name + ' ativo durante ' + u.hours + 'h.';
        E.history(st, it.icon, 'Ativou ' + it.name + '.');
        break;
      case 'removeEffect':
        if (!E.hasEffect(st, u.effect)) return { ok: false, msg: 'Não tens esse estado.' };
        E.removeItem(st, id);
        st.effects = st.effects.filter(function (e) { return e.id !== u.effect; });
        E.bump(st, 'consumablesUsed');
        res.msg = 'Estado removido.';
        break;
      case 'perm':
        E.removeItem(st, id);
        st.bonus[u.stat] += u.amount;
        res.msg = '+' + u.amount + ' ' + S.STAT_INFO[u.stat].name + ' permanente!';
        E.history(st, it.icon, 'Bebeu ' + it.name + '.');
        break;
      case 'permAll':
        E.removeItem(st, id);
        S.STATS.forEach(function (k) { st.bonus[k] += u.amount; });
        res.msg = '+' + u.amount + ' em todos os atributos!';
        E.history(st, it.icon, 'Absorveu ' + it.name + '.');
        break;
      case 'point':
        E.removeItem(st, id);
        st.freePoints += u.amount;
        res.msg = '+' + u.amount + ' ponto livre.';
        break;
      case 'reset':
        var total = S.STATS.reduce(function (s, k) { return s + st.alloc[k]; }, 0);
        if (!total) return { ok: false, msg: 'Ainda não distribuíste pontos.' };
        E.removeItem(st, id);
        st.freePoints += total;
        S.STATS.forEach(function (k) { st.alloc[k] = 0; });
        res.msg = total + ' pontos devolvidos. Redistribui-os no ecrã de Estado.';
        break;
      case 'chest':
        E.removeItem(st, id);
        var loot = E.openChest(st, u.tier);
        if (u.bonus && S.rng.random() < (u.bonusChance || 0)) { E.addItem(st, 'bau_' + u.bonus, 1); loot.items.push('bau_' + u.bonus); }
        res.loot = loot;
        res.msg = 'Baú aberto!';
        E.emit({ type: 'loot', title: it.name, icon: it.icon, tier: u.tier, coins: loot.coins, items: loot.items });
        E.history(st, it.icon, 'Abriu ' + it.name + ': ' + loot.coins + ' moedas' + (loot.items.length ? ', ' + loot.items.map(function (x) { return E.item(x).name; }).join(', ') : '') + '.');
        break;
      case 'monarchChest': {
        E.removeItem(st, id);
        var got = ['bau_lendario', 'bau_secreto'];
        got.forEach(function (x) { E.addItem(st, x, 1); });
        var mc = E.gainCoins(st, Math.round(3000 * S.levelMult(st.level)), false);
        var rec = S.premium ? S.premium.rechargeAll(st) : 0;
        E.bump(st, 'chestsOpened');
        res.msg = 'Baú do Monarca aberto!' + (rec ? ' ' + rec + (rec > 1 ? ' relíquias recarregadas.' : ' relíquia recarregada.') : '');
        E.emit({ type: 'loot', title: it.name, icon: it.icon, tier: 'monarca', coins: mc, items: got });
        E.history(st, it.icon, 'Abriu ' + it.name + ': ' + mc + ' moedas, ' + got.map(function (x) { return E.item(x).name; }).join(', ') + '.');
        break;
      }
      case 'coins':
        E.removeItem(st, id);
        var g = E.gainCoins(st, u.amount, false);
        res.msg = '+' + g + ' moedas.';
        break;
      case 'unlockSkill':
        if (st.secretSkills.indexOf(u.skill) >= 0) return { ok: false, msg: 'Já conheces esta habilidade. Podes vender o item.' };
        E.removeItem(st, id);
        E.grantSkill(st, u.skill);
        res.msg = 'Habilidade secreta aprendida: ' + S.ALL_SKILLS[u.skill].name + '!';
        break;
      case 'finalMap':
        var fp = S.combat.finalProgress(st);
        res.msg = fp.ready ? 'A última linha do mapa está acesa.' : 'Faltam ' + (fp.gatesTotal - fp.gates + fp.arenasTotal - fp.arenas) + ' chefes.';
        E.emit({ type: 'info', title: fp.ready ? 'A ÚLTIMA ARENA' : 'MAPA DA ÚLTIMA ARENA', lines: fp.ready ? ['O caminho está aberto. Alguém espera por ti.'] :
          ['Chefes dos portões: ' + fp.gates + '/' + fp.gatesTotal, 'Campeões do Coliseu: ' + fp.arenas + '/' + fp.arenasTotal, 'Quando não faltar nenhum, a última linha acende-se.'] });
        return res;
      case 'revealBoss':
        if (st.revealed[u.boss]) return { ok: false, msg: 'Esse portão já foi revelado.' };
        E.removeItem(st, id);
        st.revealed[u.boss] = true;
        res.msg = 'Um portão oculto apareceu no separador Combate!';
        E.emit({ type: 'info', title: 'PORTÃO OCULTO REVELADO', lines: [S.BOSS_BY_ID[u.boss].name + ' espera por ti.'] });
        E.history(st, '🗺️', 'Revelou o Portão Oculto.');
        break;
      case 'fragment':
        if (E.count(st, id) < u.need) return { ok: false, msg: 'Precisas de ' + u.need + ' fragmentos (tens ' + E.count(st, id) + ').' };
        E.removeItem(st, id, u.need);
        E.addItem(st, u.result, 1);
        E.bump(st, 'coresMade');
        res.msg = 'Os fragmentos fundiram-se: ' + S.ITEMS[u.result].name + '!';
        E.history(st, '💠', 'Formou o Núcleo do Sistema.');
        break;
      case 'core':
        E.removeItem(st, id);
        st.freePoints += u.points;
        if (st.secretSkills.indexOf(u.skill) < 0) E.grantSkill(st, u.skill);
        res.msg = '+' + u.points + ' pontos livres e a autoridade do Sistema é tua.';
        break;
      case 'system': {
        var r2 = E.systemArtifact(st, it, u);
        if (!r2.ok) return r2;
        E.removeItem(st, id);
        res = r2;
        break;
      }
      default:
        return { ok: false, msg: 'Este item não pode ser usado aqui.' };
    }
    E.commit('usar item');
    return res;
  };

  /* ---------------- Artefatos do Sistema: itens que mexem com o próprio Sistema ---------------- */
  E.sysState = function (st) {
    if (!st.sys) st.sys = { dbl: 0, dblBoss: 0, extra: null };
    return st.sys;
  };
  E.extraMissions = function (st) { var x = E.sysState(st).extra; return x && x.day === E.dateKey() ? x.n : 0; };
  /* A voz do Sistema na loja de artefatos (com moderação) */
  E.sysVoice = function (st, id, when) {
    var V = S.SYS_VOICE && S.SYS_VOICE[id];
    if (!V) return null;
    var sy = E.sysState(st), t = S.clock.now();
    if (!sy.voice) sy.voice = { bought: {}, lastA: 0, lastB: 0, idx: {} };
    var v = sy.voice, line = null;
    if (when === 'before') {
      if (t - v.lastB < 15 * 60000 || S.rng.random() >= 0.3) return null;
      v.lastB = t;
      line = V.before[Math.floor(S.rng.random() * V.before.length)];
    } else {
      var n = v.bought[id] || 0;
      v.bought[id] = n + 1;
      if (n === 0) line = V.first;
      else {
        if (t - v.lastA < 6 * 60000 || S.rng.random() >= 0.6) return null;
        var k = Math.floor(S.rng.random() * V.after.length);
        if (k === v.idx[id]) k = (k + 1) % V.after.length;
        v.idx[id] = k;
        line = V.after[k];
      }
      v.lastA = t;
    }
    return line.replace(/\{nome\}/g, st.name);
  };
  E.systemArtifact = function (st, it, u) {
    var sy = E.sysState(st), lv = st.level, out;
    switch (u.action) {
      case 'call': { // chamar o Sistema: uma conversa nova, agora
        var conv = null, tries = ['idle', 'open', 'tab', 'level', 'daily'];
        for (var i = 0; i < tries.length && !conv; i++) conv = S.talk.offer(st, tries[i], {}, { force: true });
        if (!conv) return { ok: false, msg: 'O Sistema já te disse tudo o que tinha para dizer. Por agora.' };
        E.history(st, '🔔', 'Chamou o Sistema com o ' + it.name + '.');
        return { ok: true, msg: '', talk: conv };
      }
      case 'pact': { // Pacto Proibido: troca Integridade por poder
        var tr = S.watch.trust(st);
        if (tr < u.minTrust) return { ok: false, msg: 'O Sistema não faz pactos com quem já não tem palavra. Integridade mínima: ' + u.minTrust + '%.' };
        S.watch.ensure(st).trust = Math.max(0, tr - u.trust);
        var gx = E.gainXp(st, Math.round(S.xpToNext(Math.min(lv, 99)) * u.xpPct / 100));
        var gc = E.gainCoins(st, u.coinsPerLevel * lv);
        E.emit({ type: 'watch', level: 1, title: 'PACTO ACEITE', lines: ['Deste-me ' + u.trust + '% da tua palavra, ' + st.name + '.', 'Eu dei-te +' + gx + ' XP e +' + gc + ' moedas.', 'Integridade: ' + tr + '% → ' + S.watch.trust(st) + '%. Eu não esqueço os pactos.'] });
        E.history(st, '🩸', 'Fez um Pacto Proibido: -' + u.trust + '% Integridade, +' + gx + ' XP, +' + gc + ' moedas.');
        return { ok: true, msg: 'Pacto aceite: +' + gx + ' XP e +' + gc + ' moedas.' };
      }
      case 'license': { // mais missões novas hoje
        var today = E.dateKey();
        if (!sy.extra || sy.extra.day !== today) sy.extra = { day: today, n: 0 };
        if (sy.extra.n >= u.max) return { ok: false, msg: 'O Sistema já te deu ' + u.max + ' missões extra hoje. Volta amanhã.' };
        sy.extra.n = Math.min(u.max, sy.extra.n + u.n);
        E.history(st, '📜', 'Usou a ' + it.name + ': +' + u.n + ' missões novas hoje.');
        return { ok: true, msg: 'Licença aceite: hoje podes criar mais ' + u.n + ' missões (' + (S.MISSION_RULES.newPerDay + sy.extra.n) + ' no total).' };
      }
      case 'double': {
        var k = u.target === 'boss' ? 'dblBoss' : 'dbl';
        if (sy[k] >= u.max) return { ok: false, msg: 'Já tens ' + sy[k] + ' selos destes à espera. Usa-os primeiro.' };
        sy[k]++;
        return { ok: true, msg: u.target === 'boss' ? 'A próxima vitória contra um chefe dá recompensas a dobrar.' : 'A próxima missão que concluíres dá XP e moedas a dobrar.' };
      }
      case 'silence': {
        var tk = S.talk.ensure(st);
        tk.silentUntil = Math.max(tk.silentUntil || 0, S.clock.now()) + u.hours * 3600000;
        return { ok: true, msg: 'O Sistema vai ficar em silêncio durante ' + u.hours + ' horas. Mas continua a ver.' };
      }
      case 'hidden': {
        var hr = S.live.forceHidden(st);
        if (!hr.ok) return hr;
        return { ok: true, msg: 'A bússola encontrou uma Missão Oculta: «' + hr.name + '».' };
      }
      case 'truce': {
        sy.noEmUntil = Math.max(sy.noEmUntil || 0, S.clock.now()) + u.hours * 3600000;
        var act0 = S.live && S.live.emergency(st);
        return { ok: true, msg: 'Trégua aceite: sem Missões de Emergência durante ' + u.hours + ' horas.' + (act0 ? ' A que já está ativa continua até acabar.' : '') };
      }
      case 'dice': {
        var roll = S.rng.random();
        if (roll < 0.35) { out = E.gainCoins(st, Math.round(lv * (15 + S.rng.random() * 25) + 50)); return { ok: true, msg: '🎲 O dado sorriu: +' + out + ' moedas.' }; }
        if (roll < 0.57) { out = E.gainXp(st, Math.round(S.xpToNext(Math.min(lv, 99)) * (0.1 + S.rng.random() * 0.15))); return { ok: true, msg: '🎲 O dado sorriu: +' + out + ' XP.' }; }
        if (roll < 0.7) { var pool = ['po_vida2', 'po_mana15', 'po_furia', 'po_foco', 'po_xp15', 'po_coin2', 'po_mel', 'po_raio']; var pk = pool[Math.floor(S.rng.random() * pool.length)]; E.addItem(st, pk, 1); return { ok: true, msg: '🎲 O dado deu-te: ' + S.ITEMS[pk].name + '.' }; }
        if (roll < 0.8) { E.addItem(st, 'bau_raro', 1); return { ok: true, msg: '🎲 Sorte grande: um Baú Raro!' }; }
        out = E.loseCoins(st, Math.max(st.coins * 0.25, Math.min(st.coins, lv * 20)));
        return { ok: true, msg: '🎲 O dado virou-se contra ti: -' + out + ' moedas. O Sistema riu-se.' };
      }
    }
    return { ok: false, msg: 'Este artefato não responde.' };
  };

  E.grantSkill = function (st, skillId) {
    if (st.secretSkills.indexOf(skillId) >= 0) return false;
    st.secretSkills.push(skillId);
    var sk = S.ALL_SKILLS[skillId];
    E.emit({ type: 'skill', title: 'HABILIDADE SECRETA', lines: [sk.name, sk.desc] });
    E.history(st, '🌀', 'Aprendeu a habilidade secreta ' + sk.name + '.');
    return true;
  };

  /* ---------------- conquistas ---------------- */
  E.grantReward = function (st, r) {
    var lines = [];
    if (r.chest) { E.addItem(st, 'bau_' + r.chest, 1); lines.push('+1 ' + S.ITEMS['bau_' + r.chest].name); }
    if (r.coins) { E.gainCoins(st, r.coins, false); lines.push('+' + r.coins + ' moedas'); }
    if (r.item) { E.addItem(st, r.item, 1); lines.push('+1 ' + S.ITEMS[r.item].name); }
    if (r.skill) { E.grantSkill(st, r.skill); lines.push('Habilidade: ' + S.ALL_SKILLS[r.skill].name); }
    return lines;
  };
  E.checkAchievements = function (st) {
    var guard = 0;
    var changed = true;
    while (changed && guard++ < 5) {
      changed = false;
      S.ACHIEVEMENTS.forEach(function (a) {
        if (st.achievements[a.id]) return;
        var ok = false;
        try { ok = a.check(st); } catch (e) { ok = false; }
        if (!ok) return;
        st.achievements[a.id] = S.clock.now();
        var lines = E.grantReward(st, a.reward || {});
        var nm = a.realName || a.name;
        E.emit({ type: 'achievement', id: a.id, title: nm, desc: a.desc, icon: a.icon, lines: lines });
        E.history(st, '🏅', 'Conquista: ' + nm + '.');
        changed = true;
      });
    }
  };

  /* ---------------- arranque ---------------- */
  E.load = function () {
    var r = S.storage.loadLocal();
    if (r) {
      E.state = E.migrate(r.state);
      return true;
    }
    E.state = null;
    return false;
  };
  E.start = function (name, cls, gender) {
    if (!S.CLASSES[cls]) return { ok: false, msg: 'Escolhe uma classe.' };
    name = String(name || '').trim();
    if (name.length < 2) return { ok: false, msg: 'O nome precisa de pelo menos 2 letras.' };
    S.storage.clearMoved();
    E.state = E.newState(name, cls, gender);
    if (S.shadows) S.shadows.ensure(E.state);
    if (S.premium) S.premium.ensure(E.state);
    if (S.body) S.body.ensure(E.state);
    E.commit('novo jogo');
    return { ok: true };
  };
  /* aparência do avatar (masculina ou feminina): só muda o desenho, nunca a progressão */
  E.setGender = function (g) {
    var st = E.state; if (!st) return { ok: false };
    g = g === 'f' ? 'f' : 'm';
    if (st.gender === g) return { ok: true, same: true };
    st.gender = g; E.commit('aparência');
    return { ok: true, msg: g === 'f' ? 'Aparência feminina escolhida.' : 'Aparência masculina escolhida.' };
  };
  /* Pergaminho do Novo Nome (Loja Exclusiva): troca o nome e gasta o pergaminho */
  E.rename = function (name) {
    var st = E.state; if (!st) return { ok: false };
    if (E.count(st, 'pr_nome') < 1) return { ok: false, msg: 'Precisas do Pergaminho do Novo Nome (Loja Exclusiva).' };
    name = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 24);
    if (name.length < 2) return { ok: false, msg: 'O nome precisa de pelo menos 2 letras.' };
    if (name === st.name) return { ok: false, msg: 'Esse já é o teu nome.' };
    var old = st.name;
    E.removeItem(st, 'pr_nome');
    st.name = name;
    E.bump(st, 'consumablesUsed');
    E.history(st, '✒️', 'Mudou o nome de «' + old + '» para «' + name + '».');
    E.commit('novo nome');
    return { ok: true, msg: 'A partir de agora, o Sistema chama-te ' + name + '.', old: old };
  };
  E.importState = function (st) {
    E.state = E.migrate(st);
    E.commit('importar');
    return { ok: true };
  };
  /* ---------- Transferência de conta ----------
     Uma conta só pode estar num aparelho de cada vez:
     - Ao criar o código, ESTE aparelho perde a conta no mesmo instante (fica no ecrã "Conta transferida").
     - O código só pode ser usado uma vez em cada aparelho, e nunca no aparelho que o criou.
     - Para voltar, gera-se um código novo no outro aparelho e restaura-se aqui. */
  E.createTransfer = function () {
    var st = E.state;
    if (!st) return { ok: false, msg: 'Não há conta neste aparelho.' };
    if (st.battle && !st.battle.over) return { ok: false, msg: 'Termina a batalha em curso antes de transferir a conta.' };
    st.account = st.account || { id: E.uid('acc_'), transfers: 0 };
    st.account.transfers = (st.account.transfers || 0) + 1;
    var id = E.uid('tr_'), at = S.clock.now();
    st.meta.savedAt = at;
    var code = S.storage.encodeTransfer(st, { id: id, at: at });
    S.storage.markTransferUsed(id);
    S.storage.setMoved({ id: id, at: at, name: st.name, level: st.level, cls: st.cls, code: code });
    S.storage.clear();
    E.state = null;
    return { ok: true, code: code, id: id };
  };
  /* Lê um código sem o aplicar (para mostrar de quem é a conta antes de confirmar) */
  E.readTransfer = function (code) {
    var t = S.storage.normalizeCode(code);
    if (!t) return { ok: false, msg: 'Cola o código de transferência.' };
    var r = S.storage.decodeTransfer(t);
    if (!r) {
      // códigos antigos (antes desta versão) ainda são aceites
      var legacy = S.storage.importCode(t);
      if (legacy) return { ok: true, legacy: true, id: 'legacy_' + S.storage.hash(t), state: legacy };
      return { ok: false, msg: 'Isto não é um código do Sistema. O código começa por SISTEMA2-.' };
    }
    if (r.error === 'incomplete') return { ok: false, msg: 'O código está incompleto ou foi alterado: faltam ou mudaram caracteres. Copia-o outra vez, inteiro, do início (SISTEMA2-) até ao fim.' };
    if (r.error) return { ok: false, msg: 'O código está danificado. Gera um novo no outro aparelho.' };
    if (S.storage.usedTransfers().indexOf(r.id) >= 0) return { ok: false, msg: 'Este código já foi usado (ou criado) neste aparelho. Para trazer a conta de volta, gera um código novo no aparelho onde ela está agora.' };
    return { ok: true, id: r.id, at: r.at, state: r.state };
  };
  E.acceptTransfer = function (code) {
    var r = E.readTransfer(code);
    if (!r.ok) return r;
    var st = r.state;
    S.storage.markTransferUsed(r.id);
    S.storage.clearMoved();
    E.state = E.migrate(st);
    var c = S.time.ensure(E.state), now = S.clock.now();
    // o relógio do outro aparelho pode estar adiantado: não conta como batota aqui
    if (c.maxSeen > now) c.maxSeen = now;
    E.state.lastTransferIn = { id: r.id, at: now };
    E.history(E.state, '📲', 'Conta restaurada neste aparelho a partir de um código de transferência.');
    E.commit('transferência recebida');
    return { ok: true, name: E.state.name, level: E.state.level };
  };
  E.resetAll = function () {
    S.storage.clear();
    E.state = null;
  };
})(globalThis.SYS = globalThis.SYS || {});
