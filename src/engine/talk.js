/* ==========================================================
   DIÁLOGOS DO SISTEMA
   Conversas curtas com 3 respostas, que o Sistema inicia de vez em quando
   (ao abrir a app, ao olhar para um chefe, depois de uma batalha, etc.).

   Moderação (para nunca atrapalhar):
   - cada gatilho tem uma probabilidade baixa; ninguém é interrompido sempre;
   - intervalo mínimo entre conversas e limite por dia;
   - se o jogador ignora conversas, o Sistema fala cada vez menos;
   - um diálogo não se repete antes de muitos dias (alguns só uma vez na vida);
   - os diálogos com condições específicas (chefe mortal, Zona, Marca…) têm prioridade.

   Opiniões: depois de o jogador responder, a conversa fica concluída e nunca mais volta;
   a resposta fica guardada (st.talk.done) e há conversas que só aparecem por causa dela
   (condição "a_<id>=<n.º da resposta>"). Se o jogador ignorar, a conversa pode voltar mais tarde.

   Cada resposta tem uma atitude: o = obedecer, d = desafiar, q = perguntar.
   O Sistema guarda as atitudes e há diálogos que só aparecem por causa delas.
   ========================================================== */
(function (S) {
  'use strict';
  var E = S.engine;
  var MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;

  S.TALK_RULES = {
    gap: 25 * MIN,          // intervalo mínimo entre conversas
    gapPrio: 15 * MIN,      // para diálogos importantes (chefe mortal, derrota…)
    perDay: { normal: 6, raro: 2, off: 0 },
    mode: { normal: 1, raro: 0.45, off: 0 },
    repeatDays: 21,         // conversa mostrada mas não respondida não volta antes disto
    skipDays: 3,            // conversa ignorada pode voltar ao fim de 3 dias
    chance: {
      open: 0.35, ret: 0.85, boss: 0.12, win: 0.3, lose: 0.5, flee: 0.5,
      create: 0.12, done: 0.15, fail: 0.4, daily: 0.35, tab: 0.06,
      buy: 0.15, equip: 0.2, chest: 0.2, level: 0.35, skill: 0.4, alloc: 0.08,
      idle: 0.06              // conversa aleatória: verificada a cada minuto de uso ativo
    }
  };
  /* bónus de probabilidade quando um diálogo específico encaixa (ex.: chefe mortal) */
  var SPECIAL = { gap: 0.33, king: 0.23, final: 0.5, zone: 0.25, marked: 0.2, trust: 0.15, streak: 0.15, away: 0.3 };

  function now() { return S.clock.now(); }
  function rnd() { return S.rng.random(); }
  function hhmm(ts) { var d = new Date(ts); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function fill(t, v) { return String(t).replace(/\{(\w+)\}/g, function (m, k) { return v[k] !== undefined && v[k] !== null ? v[k] : m; }); }

  var T = S.talk = {};
  /* ---------- lista de diálogos ----------
     Cada ficheiro de dados faz S.TALK_RAW.push([prefixo, [[gatilho, condições, fala, [[resposta, atitude, réplica, efeito], ×3], opções], …]]) */
  S.TALKS = [];
  S.talkAdd = function (prefix, list) {
    list.forEach(function (d, i) {
      S.TALKS.push({ id: prefix + (i + 1), trigger: d[0], cond: parseCond(d[1]), line: d[2],
        choices: d[3].map(function (c) { return { t: c[0], tag: c[1], r: c[2], fx: c[3] || null }; }),
        w: (d[4] && d[4].w) || (d[1] ? 2 : 1), once: !!(d[4] && d[4].once), prio: !!(d[4] && d[4].prio) });
    });
  };

  /* condições: "lvl>=10,gap>=8,king,!dead,h<6" */
  function parseCond(s) {
    if (!s) return [];
    return s.split(',').map(function (p) {
      p = p.trim();
      var m = p.match(/^(!?)([a-z][a-z0-9_]*)\s*(>=|<=|=|<|>)?\s*([\w.-]*)$/i);
      if (!m) throw new Error('Condição inválida: ' + p);
      return { not: !!m[1], k: m[2], op: m[3] || null, v: m[4] === '' ? null : (isNaN(+m[4]) ? m[4] : +m[4]) };
    });
  }
  function test(c, V) {
    var x = V[c.k], r;
    if (!c.op) r = !!x;
    else if (c.op === '=') r = String(x) === String(c.v);
    else if (x === undefined || x === null) r = false;
    else r = c.op === '>=' ? x >= c.v : c.op === '<=' ? x <= c.v : c.op === '<' ? x < c.v : x > c.v;
    return c.not ? !r : r;
  }

  (S.TALK_RAW || []).forEach(function (g) { S.talkAdd(g[0], g[1]); });

  T.ensure = function (st) {
    if (!st.talk) st.talk = { seen: {}, last: 0, day: '', count: 0, att: { o: 0, d: 0, q: 0 }, skips: 0, damp: 1, talks: 0 };
    var t = st.talk;
    if (!t.att) t.att = { o: 0, d: 0, q: 0 };
    if (t.damp == null) t.damp = 1;
    if (!t.done) t.done = {};
    return t;
  };
  T.mode = function (st) { var m = st.settings && st.settings.talk; return S.TALK_RULES.mode[m] !== undefined ? m : 'normal'; };

  /* variáveis disponíveis para condições e textos */
  T.vars = function (st, ctx) {
    ctx = ctx || {};
    var t = T.ensure(st), ts = now(), d = new Date(ts);
    var cs = E.combatStats(st), hpPct = Math.round(E.curHp(st) / Math.max(1, cs.maxHp) * 100);
    var rank = S.rankFor(st.level);
    var V = {
      nome: st.name, NOME: String(st.name).toUpperCase(), hora: hhmm(ts), h: d.getHours(), wd: d.getDay(),
      lvl: st.level, nivel: st.level, classe: S.CLASSES[st.cls].name, cls: st.cls, rank: rank.rank,
      coins: st.coins, moedas: st.coins, hp: hpPct, streak: st.daily.streak, best: st.daily.bestStreak,
      o: t.att.o, d: t.att.d, q: t.att.q, talks: t.talks || 0,
      trust: S.watch ? S.watch.trust(st) : 100, marked: S.watch ? S.watch.marked(st) : false,
      zone: S.live ? !!S.live.zone(st) : false,
      won: st.c.battlesWon || 0, lost: st.c.battlesLost || 0, kills: st.c.bossesKilled || 0, done: st.c.missionsDone || 0, failed: st.c.missionsFailed || 0,
      bought: st.c.itemsBought || 0, chests: st.c.chestsOpened || 0, missions: (st.missions || []).filter(function (m) { return !m.deleted; }).length,
      away: ctx.away || 0, dias: ctx.away || 0
    };
    if (ctx.boss) {
      var b = ctx.boss, g = S.GATES[b.gate - 1];
      V.boss = b.name; V.blvl = b.level; V.gap = b.level - st.level; V.king = !!b.king; V.final = b.special === 'final' || b.level >= 100;
      V.secret = !!b.secret; V.dead = !!st.defeated[b.id]; V.portao = g ? g.name : (b.arenaName || ''); V.premium = !!b.premium; V.gate = b.gate;
    }
    ['missao', 'diff', 'item', 'rarity', 'skill', 'tab', 'tier', 'slot', 'price', 'diaria'].forEach(function (k) { if (ctx[k] !== undefined) V[k] = ctx[k]; });
    if (ctx.level) { V.nivel = ctx.level; V.rankup = !!ctx.rankup; }
    V.abs = V.gap !== undefined ? Math.abs(V.gap) : 0;
    Object.keys(t.done).forEach(function (id) { V['a_' + id] = t.done[id]; });
    return V;
  };

  function weightOf(d, V) {
    var w = d.w;
    d.cond.forEach(function (c) { if (c.k === 'gap' && c.op === '>=' && c.v >= 8) w += 2; });
    return w;
  }
  function specialBonus(list, V) {
    var b = 0;
    list.forEach(function (d) {
      d.cond.forEach(function (c) {
        if (c.not) return;
        var k = c.k === 'gap' ? (c.op === '>=' && c.v >= 8 ? 'gap' : null) : (c.k === 'trust' ? 'trust' : (c.k === 'streak' && c.v >= 7 ? 'streak' : c.k));
        if (k && SPECIAL[k] && SPECIAL[k] > b) b = SPECIAL[k];
      });
    });
    return b;
  }

  /* candidatos que encaixam agora (sem moderação) */
  T.candidates = function (st, trigger, ctx) {
    var t = T.ensure(st), V = T.vars(st, ctx), ts = now();
    var all = S.TALKS.filter(function (d) { return d.trigger === trigger && d.cond.every(function (c) { return test(c, V); }); });
    var fresh = all.filter(function (d) {
      if (t.done[d.id]) return false; // já respondida: opinião concluída
      var seen = t.seen[d.id];
      if (!seen) return true;
      if (d.once) return false;
      return ts - seen > S.TALK_RULES.repeatDays * DAY;
    });
    return { list: fresh, V: V };
  };

  /* Moderação: devolve o motivo para não falar, ou null se pode falar */
  T.blocked = function (st, trigger, prio) {
    var R = S.TALK_RULES, t = T.ensure(st), m = T.mode(st), ts = now(), day = E.dateKey(ts);
    if (m === 'off') return 'desligado';
    if (st.battle && !st.battle.over) return 'batalha';
    if (t.day !== day) { t.day = day; t.count = 0; }
    if (t.count >= R.perDay[m]) return 'limite';
    // a última conversa do dia fica reservada para momentos importantes (chefe mortal, derrota, missão falhada)
    if (!prio && t.count >= R.perDay[m] - 1 && R.perDay[m] > 1) return 'reservada';
    // o intervalo cresce a cada conversa do dia, para as espalhar
    if (t.last && ts - t.last < (prio ? R.gapPrio * (1 + t.count * 0.5) : R.gap * (1 + t.count * 0.8))) return 'cedo';
    if (ts - (st.created || 0) < 3 * MIN && trigger !== 'boss') return 'novo';
    return null;
  };

  /* O Sistema decide se fala. Devolve uma conversa ou null. opts.force ignora sorte e intervalos (testes). */
  T.offer = function (st, trigger, ctx, opts) {
    if (!st) return null;
    opts = opts || {};
    var t = T.ensure(st), R = S.TALK_RULES;
    var c = T.candidates(st, trigger, ctx);
    if (!c.list.length) return null;
    var specific = c.list.filter(function (d) { return d.cond.length; });
    var prio = c.list.some(function (d) { return d.prio; });
    if (!opts.force) {
      if (T.blocked(st, trigger, prio)) return null;
      var p = ((R.chance[trigger] || 0.1) + specialBonus(specific, c.V)) * R.mode[T.mode(st)] * t.damp;
      if (rnd() >= Math.min(0.9, p)) return null;
    }
    // escolhe: os específicos pesam mais
    var pool = c.list, tot = 0;
    var ws = pool.map(function (d) { var w = weightOf(d, c.V); tot += w; return w; });
    var r = rnd() * tot, d = pool[pool.length - 1];
    for (var i = 0; i < pool.length; i++) { r -= ws[i]; if (r < 0) { d = pool[i]; break; } }
    var ts = now();
    t.seen[d.id] = ts; t.last = ts; t.count++; t.talks = (t.talks || 0) + 1;
    return { id: d.id, trigger: trigger, line: fill(d.line, c.V), choices: d.choices.map(function (x) { return { t: fill(x.t, c.V), tag: x.tag }; }), V: c.V };
  };

  function fxText(fx) {
    var out = [];
    if (fx.c) out.push((fx.c > 0 ? '+' : '') + fx.c + ' moedas');
    if (fx.x) out.push((fx.x > 0 ? '+' : '') + fx.x + ' XP');
    if (fx.t) out.push('Integridade ' + (fx.t > 0 ? '+' : '') + fx.t + '%');
    if (fx.e) out.push((S.TIMED_EFFECTS[fx.e[0]] || {}).name + ' (' + fx.e[1] + 'h)');
    return out;
  }
  /* O jogador responde */
  T.answer = function (st, conv, i) {
    var d = S.TALKS.filter(function (x) { return x.id === conv.id; })[0];
    if (!d || !d.choices[i]) return { ok: false };
    var t = T.ensure(st), ch = d.choices[i];
    t.done[d.id] = i + 1;
    t.att[ch.tag] = (t.att[ch.tag] || 0) + 1;
    t.damp = Math.min(1, t.damp + 0.15);
    t.skips = 0;
    var V = Object.assign({}, conv.V, { o: t.att.o, d: t.att.d, q: t.att.q });
    var fx = ch.fx, lines = [];
    if (fx) {
      if (fx.c > 0) E.gainCoins(st, fx.c, false);
      if (fx.c < 0) E.loseCoins(st, -fx.c);
      if (fx.x > 0) E.gainXp(st, fx.x, false);
      if (fx.x < 0) E.loseXp(st, -fx.x);
      if (fx.t && S.watch) { var w = S.watch.ensure(st); w.trust = Math.max(0, Math.min(100, w.trust + fx.t)); }
      if (fx.e) E.addEffect(st, fx.e[0], fx.e[1]);
      lines = fxText(fx);
      E.history(st, '👁️', 'Conversa com o Sistema: ' + lines.join(', ') + '.');
    }
    E.commit('conversa');
    return { ok: true, reply: fill(ch.r, V), said: fill(ch.t, V), fx: lines, tag: ch.tag };
  };
  /* A conversa nunca chegou a ser mostrada (o jogador saiu, ou estava ocupado): não conta */
  T.cancel = function (st, conv) {
    var t = T.ensure(st);
    if (!conv || !conv.id) return;
    delete t.seen[conv.id];
    t.count = Math.max(0, t.count - 1); t.talks = Math.max(0, (t.talks || 1) - 1);
  };
  /* O jogador fecha sem responder: o Sistema fala menos a seguir */
  T.skip = function (st, conv) {
    var t = T.ensure(st);
    if (conv && conv.id) t.seen[conv.id] = now() - (S.TALK_RULES.repeatDays - S.TALK_RULES.skipDays) * DAY;
    t.skips = (t.skips || 0) + 1;
    t.damp = Math.max(0.25, t.damp * 0.7);
    E.commit('conversa ignorada');
  };
})(globalThis.SYS = globalThis.SYS || {});
