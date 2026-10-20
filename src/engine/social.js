/* ==========================================================
   SOCIAL: amigos, conversas e duelos entre jogadores
   Tudo passa pelo servidor da loja (S.shop). O servidor decide os
   duelos; o jogo só escolhe a ação e mostra o resultado.
   A recompensa de um duelo entra uma única vez (por ID do duelo) e
   só os primeiros DAILY duelos de cada dia dão recompensa.
   ========================================================== */
(function (S) {
  'use strict';
  var E = S.engine;
  var SO = S.social = { DAILY: 5, cache: null, cacheAt: 0, offset: 0 };

  SO.ensure = function (st) {
    if (!st.social) st.social = { rewarded: {}, day: null, count: 0 };
    if (!st.social.rewarded) st.social.rewarded = {};
    return st.social;
  };
  SO.ready = function () { return S.shop && S.shop.ready(); };
  function auth(st) { S.shop.ensure(st); return { player_id: st.playerId, token: st.shop.secret }; }
  /* o servidor só conhece jogadores que já sincronizaram: sincroniza uma vez antes */
  function registered(st) {
    if (st.shop && st.shop.lastSync) return Promise.resolve(true);
    return S.shop.sync(true).then(function (r) { return !!(r && r.ok); });
  }
  function post(path, body) {
    var st = E.state;
    if (!st) return Promise.resolve({ ok: false, msg: 'Sem jogo.' });
    if (!SO.ready()) return Promise.resolve({ ok: false, offline: true, msg: 'O social precisa de ligação ao servidor do Sistema.' });
    return registered(st).then(function () {
      return S.shop.call('POST', path, Object.assign(auth(st), body || {}));
    }).then(function (j) {
      if (j && j.server_time) SO.offset = j.server_time - Date.now();
      if (j && j.duel && j.duel.server_time) SO.offset = j.duel.server_time - Date.now();
      return j;
    });
  }
  SO.serverNow = function () { return Date.now() + SO.offset; };

  /* atributos de combate enviados para o duelo (o servidor limita-os ao nível) */
  SO.fighter = function (st) {
    var c = E.combatStats(st), t = E.totalStats(st);
    return { cls: st.cls, hp: c.maxHp, mp: c.maxMp, atk: c.atk, matk: c.matk, def: c.def, crit: c.crit, critDmg: c.critDmg, eva: c.eva, lifesteal: c.lifesteal || 0, agi: t.agi, avatar: String(st.level) };
  };

  SO.state = function () {
    return post('/api/social/state').then(function (j) {
      if (j.ok) {
        var prev = SO.cache;
        SO.cache = j; SO.cacheAt = Date.now();
        var st = E.state;
        if (st && j.friends) { var n = j.friends.length; if (n > (st.c.friendsMax || 0)) { st.c.friendsMax = n; E.checkAchievements(st); E.commit('amigos'); } }
        j.news = diff(prev, j);
      }
      return j;
    });
  };
  /* o que mudou desde a última vez (para avisar o jogador) */
  function diff(a, b) {
    var out = [];
    if (!a) return out;
    var had = {}; (a.requests_in || []).forEach(function (r) { had[r.id] = 1; });
    (b.requests_in || []).forEach(function (r) { if (!had[r.id]) out.push({ type: 'request', name: r.name }); });
    var inv = {}; (a.invites || []).forEach(function (r) { inv[r.id] = 1; });
    (b.invites || []).forEach(function (r) { if (!inv[r.id]) out.push({ type: 'invite', name: r.name, id: r.id }); });
    var un = {}; (a.friends || []).forEach(function (f) { un[f.id] = f.unread || 0; });
    (b.friends || []).forEach(function (f) { if ((f.unread || 0) > (un[f.id] || 0)) out.push({ type: 'message', name: f.name, id: f.id }); });
    var acc = {}; (a.requests_out || []).forEach(function (r) { acc[r.id] = 1; });
    (b.friends || []).forEach(function (f) { if (acc[f.id]) out.push({ type: 'accepted', name: f.name }); });
    return out;
  }
  SO.badge = function () { var c = SO.cache; if (!c || !c.ok) return 0; return (c.unread || 0) + (c.requests_in || []).length + (c.invites || []).length; };

  SO.find = function (q) { return post('/api/social/find', { query: q }); };
  SO.request = function (to) { return post('/api/social/friend/request', { to: to }); };
  SO.respond = function (from, accept) { return post('/api/social/friend/respond', { from: from, accept: !!accept }); };
  SO.remove = function (other) { return post('/api/social/friend/remove', { other: other }); };
  SO.history = function (w, after) { return post('/api/social/chat/history', { with: w, after: after || 0 }); };
  SO.send = function (to, text) { return post('/api/social/chat/send', { to: to, text: text }); };

  SO.create = function (opts) { opts = opts || {}; return post('/api/duel/create', { fighter: SO.fighter(E.state), public: opts.public !== false, invite: opts.invite || null }); };
  SO.join = function (opts) { return post('/api/duel/join', Object.assign({ fighter: SO.fighter(E.state) }, opts)); };
  SO.duel = function (id) { return post('/api/duel/state', { id: id }); };
  SO.act = function (id, action, version) { return post('/api/duel/act', { id: id, action: action, version: version }); };
  SO.invite = function (id, to) { return post('/api/duel/invite', { id: id, to: to }); };
  SO.leave = function (id) { return post('/api/duel/leave', { id: id }); };
  SO.duels = function () { return post('/api/duel/history'); };

  /* recompensa de um duelo terminado: uma única vez por duelo, até DAILY por dia */
  SO.reward = function (d) {
    var st = E.state;
    if (!st || !d || d.status !== 'done' || !d.winner) return null;
    var so = SO.ensure(st);
    if (so.rewarded[d.id]) return so.rewarded[d.id] === 1 ? null : so.rewarded[d.id];
    var today = E.dateKey();
    if (so.day !== today) { so.day = today; so.count = 0; }
    var won = d.winner === d.me, L = st.level, res = { won: won, xp: 0, coins: 0, capped: false };
    if (so.count < SO.DAILY) {
      so.count++;
      var xp = Math.max(5, Math.round(S.xpToNext(Math.min(L, 99)) * (won ? 0.06 : 0.02)));
      var coins = won ? Math.round((30 + 12 * L + 0.6 * L * L) * 0.5) : Math.round((30 + 12 * L) * 0.3);
      res.xp = E.gainXp(st, xp); res.coins = E.gainCoins(st, coins);
    } else res.capped = true;
    E.bump(st, 'duelsPlayed');
    if (won) E.bump(st, 'duelWins'); else E.bump(st, 'duelLosses');
    if (won && d.reason === 'ko' && d.fighters && d.fighters[d.me] && d.fighters[d.me].hp === d.fighters[d.me].maxHp) E.bump(st, 'duelFlawless');
    var opp = d.fighters ? d.fighters[d.me === d.host ? d.guest : d.host] : null;
    E.history(st, '⚔️', 'Duelo contra ' + (opp ? opp.name : 'outro jogador') + ': ' + (won ? 'vitória' : 'derrota') + (res.xp ? ' (+' + res.xp + ' XP, +' + res.coins + ' moedas)' : '') + '.');
    so.rewarded[d.id] = res;
    // guarda só os últimos 200 duelos
    var ks = Object.keys(so.rewarded); if (ks.length > 200) ks.slice(0, ks.length - 200).forEach(function (k) { delete so.rewarded[k]; });
    E.checkAchievements(st);
    E.commit('duelo terminado');
    return res;
  };
})(globalThis.SYS = globalThis.SYS || {});
