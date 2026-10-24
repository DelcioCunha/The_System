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
    var c = E.combatStats(st), t = E.totalStats(st), keys = ['atk', 'matk', 'def', 'crit', 'critDmg', 'eva', 'lifesteal', 'regenHp', 'regenMp', 'summonPct', 'dotPct', 'potionPct', 'lowHpAtk', 'execute', 'firstStrike', 'manaOnHit', 'thorns', 'openShield', 'stunRes', 'lastStand', 'revive'];
    var f = { cls: st.cls, gender: st.gender === 'f' ? 'f' : 'm', hp: c.maxHp, mp: c.maxMp, agi: t.agi, avatar: String(st.level) };
    keys.forEach(function (k) { f[k] = c[k] || 0; });
    f.skills = S.combat.unlockedActiveSkills(st).map(function (s) { return s.id; });
    // itens de combate da Bolsa (as relíquias premium só se estiverem prontas)
    f.items = {};
    Object.keys(st.inv || {}).forEach(function (id) {
      var it = S.ITEMS[id];
      if (!it || !(st.inv[id] > 0)) return;
      if ((it.battle && it.use && it.use.type !== 'smoke') || id === 'sx_fenix' || id === 'pr_fenix') {
        if (it.perma && S.premium && !S.premium.relicReady(st, id)) return;
        f.items[id] = it.perma ? 1 : st.inv[id];
      }
    });
    // servos convocados
    f.squad = S.shadows ? S.shadows.active(st).map(function (b) { return { name: S.shadows.name(st, b.id), level: b.level, king: !!b.king, role: S.shadows.role(b) }; }) : [];
    return f;
  };
  /* depois do duelo: os itens usados saem da Bolsa (como num combate contra um chefe) */
  SO.consume = function (st, d) {
    var F = d.fighters && d.fighters[d.me];
    if (!F || !F.used) return [];
    var out = [];
    Object.keys(F.used).forEach(function (id) {
      var n = F.used[id], it = S.ITEMS[id];
      if (!it || !n) return;
      if (it.perma && S.premium) S.premium.relicSpend(st, id); else E.removeItem(st, id, Math.min(n, E.count(st, id)));
      out.push((n > 1 ? n + '× ' : '') + it.name);
    });
    return out;
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
  /* ---------- perfis e fotos ---------- */
  var PIC_KEY = 'sis.pics.v1';
  SO.pics = (function () { try { var r = globalThis.localStorage && globalThis.localStorage.getItem(PIC_KEY); return r ? JSON.parse(r) || {} : {}; } catch (e) { return {}; } })();
  function savePics() {
    try {
      var ids = Object.keys(SO.pics);
      if (ids.length > 60) ids.sort(function (a, b) { return (SO.pics[a].t || 0) - (SO.pics[b].t || 0); }).slice(0, ids.length - 60).forEach(function (k) { delete SO.pics[k]; });
      if (globalThis.localStorage) globalThis.localStorage.setItem(PIC_KEY, JSON.stringify(SO.pics));
    } catch (e) { /* sem espaço: fica só na memória */ }
  }
  /* foto de um jogador (só se a versão em cache for a atual) */
  SO.pic = function (p) { if (!p || !p.photo_ver) return null; var c = SO.pics[p.id]; return c && c.v === p.photo_ver ? c.src : null; };
  /* vai buscar as fotos que faltam (amigos e a própria) */
  SO.loadPics = function (list) {
    var need = (list || []).filter(function (p) { return p && p.photo_ver && !SO.pic(p); }).map(function (p) { return p.id; });
    if (!need.length) return Promise.resolve(0);
    return post('/api/social/photos', { ids: need.slice(0, 40) }).then(function (j) {
      if (!j.ok) return 0;
      var n = 0; Object.keys(j.photos || {}).forEach(function (id) { var x = j.photos[id]; if (x.src) { SO.pics[id] = { v: x.v, src: x.src, t: Date.now() }; n++; } else delete SO.pics[id]; });
      savePics(); return n;
    });
  };
  SO.setPhoto = function (dataUrl) {
    return post('/api/social/photo', { photo: dataUrl || null }).then(function (j) {
      var st = E.state;
      if (j.ok && st) { if (dataUrl) SO.pics[st.playerId] = { v: j.photo_ver, src: dataUrl, t: Date.now() }; else delete SO.pics[st.playerId]; savePics(); if (SO.cache && SO.cache.me) SO.cache.me.photo_ver = j.photo_ver; }
      return j;
    });
  };
  SO.profile = function (id) {
    return post('/api/social/profile', { id: id }).then(function (j) {
      if (j.ok && j.profile && j.profile.photo) { SO.pics[id] = { v: j.profile.photo_ver, src: j.profile.photo, t: Date.now() }; savePics(); }
      return j;
    });
  };
  /* redimensiona e corta ao centro (quadrado) uma imagem escolhida no telemóvel */
  SO.shrink = function (file, size) {
    size = size || 160;
    return new Promise(function (res, rej) {
      if (!file || !/^image\//.test(file.type || '')) return rej(new Error('Escolhe uma imagem.'));
      var fr = new FileReader();
      fr.onerror = function () { rej(new Error('Não foi possível ler a imagem.')); };
      fr.onload = function () {
        var img = new Image();
        img.onerror = function () { rej(new Error('Formato de imagem não suportado.')); };
        img.onload = function () {
          var s = Math.min(img.width, img.height), cv = document.createElement('canvas'); cv.width = cv.height = size;
          var cx = cv.getContext && cv.getContext('2d'); if (!cx) return rej(new Error('Este aparelho não consegue preparar a foto.'));
          cx.imageSmoothingQuality = 'high';
          cx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
          var q = 0.85, out = cv.toDataURL('image/jpeg', q);
          while (out.length > 60000 && q > 0.4) { q -= 0.1; out = cv.toDataURL('image/jpeg', q); }
          res(out);
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  };
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
  SO.act = function (id, action, version, extra) { return post('/api/duel/act', Object.assign({ id: id, action: action, version: version }, extra || {})); };
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
    var won = d.winner === d.me, L = st.level, res = { won: won, xp: 0, coins: 0, capped: false, used: SO.consume(st, d) };
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
    // patente: +1 ponto por vitória, -1 por derrota (o servidor decide; aqui só se mostra)
    var pts = d.result && d.result.points && d.result.points[d.me];
    if (pts && S.duelRank) {
      var r0 = S.duelRank(pts[0]).rank, r1 = S.duelRank(pts[1]).rank;
      so.points = pts[1]; so.best = Math.max(so.best || 0, pts[1]);
      res.points = pts; res.rankFrom = r0.i; res.rankTo = r1.i;
      if (r1.i !== r0.i) {
        var up = r1.i > r0.i;
        if (up) so.bestRank = Math.max(so.bestRank || 0, r1.i);
        E.emit({ type: 'rank', up: up, rank: r1.i, from: r0.i, title: up ? 'NOVA PATENTE' : 'PATENTE PERDIDA', name: r1.name,
          lines: up ? [(r1.i === 40 ? 'A patente máxima dos duelos. Acima disto já não há nome, só pontos.' : 'Próxima patente aos ' + S.DUEL_RANKS[r1.i + 1].min + ' pontos.'), 'Pontos de patente: ' + pts[1]]
            : ['Desceste de ' + r0.name + '.', 'Vence ' + (r0.min - pts[1]) + (r0.min - pts[1] === 1 ? ' duelo' : ' duelos') + ' para a recuperar.'] });
        E.history(st, up ? '🎖️' : '⬇️', (up ? 'Nova patente: ' : 'Patente perdida. Voltaste a ') + r1.name + '.');
      }
    }
    so.rewarded[d.id] = res;
    // guarda só os últimos 200 duelos
    var ks = Object.keys(so.rewarded); if (ks.length > 200) ks.slice(0, ks.length - 200).forEach(function (k) { delete so.rewarded[k]; });
    E.checkAchievements(st);
    E.commit('duelo terminado');
    return res;
  };
})(globalThis.SYS = globalThis.SYS || {});
