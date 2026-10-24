/* ==========================================================
   LOJA DE CRISTAIS: ligação ao servidor (API da Loja)
   - O endereço do servidor está em loja.json (raiz do projeto) → { "api": "https://…" }.
     Sem endereço, a loja mostra "ainda não ligada" e o resto do jogo funciona igual.
   - Pedido → WhatsApp → o administrador confirma o pagamento → envia um código → resgate aqui.
   - Os Cristais entram uma única vez por resgate: cada resgate tem um identificador
     (redemption_id) e o jogo guarda os que já creditou. Se a rede cair a meio e o jogador
     repetir, o servidor devolve o mesmo resgate e o jogo não credita duas vezes.
   ========================================================== */
(function (S) {
  'use strict';
  var E = S.engine;
  var SH = S.shop = {};
  var FINAL = { redeemed: 1, cancelled: 1, refunded: 1 };
  var cfgCache = null, cfgAt = 0;

  SH.STATUS = {
    pending_payment: { name: 'À espera de pagamento', tone: 'warn' },
    payment_confirmed: { name: 'Pago · código a caminho', tone: 'good' },
    code_issued: { name: 'Código enviado (vê o WhatsApp)', tone: 'good' },
    redeemed: { name: 'Resgatado', tone: 'done' },
    cancelled: { name: 'Cancelado', tone: 'bad' },
    refunded: { name: 'Reembolsado', tone: 'bad' }
  };

  function base() { return String(S.SHOP_API || '').replace(/\/+$/, ''); }
  SH.ready = function () { return /^https?:\/\//.test(base()); };
  function secret() {
    var a = new Uint8Array(24), out = '';
    try { globalThis.crypto.getRandomValues(a); } catch (e) { for (var i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); }
    for (var j = 0; j < a.length; j++) out += ('0' + a[j].toString(16)).slice(-2);
    return out;
  }
  SH.ensure = function (st) {
    if (!st.shop) st.shop = { orders: [], redeemed: {} };
    if (!st.shop.orders) st.shop.orders = [];
    if (!st.shop.redeemed) st.shop.redeemed = {};
    if (!st.shop.secret) st.shop.secret = secret(); // identifica esta conta perante o servidor (vai com a transferência de conta)
    return st.shop;
  };
  /* ---------- a voz do Sistema na suspensão (mesmo tom da Vigilância: intimidante, irónico, dono do jogo) ---------- */
  S.BAN_VOICE = {
    tempTitle: ['ACESSO REVOGADO', 'CONTA SUSPENSA', 'O SISTEMA FECHOU A PORTA'],
    permTitle: ['CONTA DESATIVADA', 'JOGADOR APAGADO DO REGISTO', 'ACESSO NEGADO. PARA SEMPRE.'],
    temp: [
      '{nome}. Achaste que eu não estava a ver. Eu estou sempre a ver.',
      'Brincaste com o Sistema. Agora o Sistema brinca contigo. Durante {tempo}.',
      'Não te apaguei. Ainda. Considera isto um aviso com prazo.',
      'O teu progresso está guardado. Tu é que ficaste do lado de fora.',
      'Durante {tempo}, não és Jogador. És só alguém a olhar para uma porta fechada.',
      'Eu dei-te regras. Tu deste-me um motivo.'
    ],
    tempSub: [
      'Volta quando o tempo acabar. Se o Sistema ainda te quiser.',
      'Quando a porta abrir, lembra-te de quem a fechou.',
      'Conta os dias. Eu já os contei por ti.'
    ],
    perm: [
      '{nome}. O Sistema já não te reconhece como Jogador.',
      'Não há prazo. Não há contagem. Há apenas este ecrã.',
      'Escolheste quebrar as regras. Eu escolhi não te esquecer.',
      'A tua conta continua aqui. Tu não.',
      'Os chefes que derrotaste continuam mortos. Tu continuas aqui fora.'
    ],
    permSub: [
      'Se achas que é um engano, fala com o atendimento. O Sistema ouve. Raramente muda de ideias.',
      'Podes pedir revisão ao atendimento. Leva o teu ID. E uma boa razão.'
    ],
    check: [
      'Ainda não.',
      'Bater à porta não a abre.',
      'Verificado. Continuas suspenso. Eu não me esqueço tão depressa.',
      'O Sistema respondeu: não.',
      'Insistir não reduz a pena. Só a torna mais divertida para mim.',
      'Cada vez que tocas aqui, eu registo. Continua.'
    ],
    liftTitle: ['ACESSO RESTAURADO', 'A PORTA ABRIU'],
    lift: [
      'A porta abriu. Não confundas isto com perdão.',
      'Voltaste, {nome}. O registo da tua suspensão não sai daqui.',
      'Segunda oportunidade concedida. Não existe terceira.',
      'Estás de volta. Eu também nunca saí.'
    ]
  };
  function seedPick(list, seed) { var h = 7; seed = String(seed); for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0; return list[h % list.length]; }
  function left(until) {
    var ms = until - S.clock.now(); if (ms <= 0) return 'pouco tempo';
    var h = Math.ceil(ms / 3600000); if (h < 48) return h + (h === 1 ? ' hora' : ' horas');
    var d = Math.ceil(h / 24); return d + ' dias';
  }
  /* falas da suspensão: fixas para cada suspensão (não mudam a cada ecrã) */
  SH.banVoice = function (st, b) {
    var V = S.BAN_VOICE, perm = !b.until, seed = (b.since || 0) + '|' + st.playerId;
    var fill = function (t) { return t.replace('{nome}', st.name).replace('{tempo}', b.until ? left(b.until) : 'sempre'); };
    return { title: seedPick(perm ? V.permTitle : V.tempTitle, seed), line: fill(seedPick(perm ? V.perm : V.temp, seed + 'l')), sub: fill(seedPick(perm ? V.permSub : V.tempSub, seed + 's')), perm: perm };
  };
  SH.banCheckLine = function () { var c = S.BAN_VOICE.check; return c[Math.floor(Math.random() * c.length)]; };
  /* conta suspensa pelo administrador? (fica gravado: sem internet, a suspensão continua) */
  SH.banned = function (st) {
    var b = st && st.shop && st.shop.ban;
    if (!b) return null;
    if (b.until && b.until <= S.clock.now()) return null;
    return b;
  };
  /* lê loja.json (permite mudar o servidor sem recompilar a app) */
  SH.init = function () {
    if (typeof fetch !== 'function' || typeof location === 'undefined' || !/^https?:/.test(location.protocol)) return Promise.resolve(SH.ready());
    return fetch('loja.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && /^https?:\/\//.test(j.api || '')) S.SHOP_API = j.api; return SH.ready(); })
      .catch(function () { return SH.ready(); });
  };

  function call(method, path, body) {
    if (!SH.ready()) return Promise.resolve({ ok: false, offline: true, msg: 'A loja de Cristais ainda não está ligada ao servidor.' });
    if (typeof fetch !== 'function') return Promise.resolve({ ok: false, offline: true, msg: 'Sem ligação ao servidor.' });
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 15000) : null;
    return fetch(base() + path, { method: method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Resposta inválida do servidor.' }; }); })
      .then(function (j) { if (timer) clearTimeout(timer); if (!j.ok) j.msg = j.error || 'Erro no servidor.'; return j; })
      .catch(function () { if (timer) clearTimeout(timer); return { ok: false, offline: true, msg: 'Sem ligação ao servidor. Verifica a internet e tenta outra vez.' }; });
  }

  SH.call = call;
  /* pacotes, preços e se a loja está aberta (o preço vem SEMPRE do servidor) */
  SH.config = function (force) {
    if (!force && cfgCache && Date.now() - cfgAt < 60000) return Promise.resolve(cfgCache);
    return call('GET', '/api/config').then(function (j) { if (j.ok) { cfgCache = j; cfgAt = Date.now(); } return j; });
  };
  SH.cached = function () { return cfgCache; };

  /* cria o pedido no servidor e guarda-o no jogo */
  SH.order = function (packageId) {
    var st = E.state;
    S.premium.ensure(st); SH.ensure(st);
    return call('POST', '/api/orders', { package_id: packageId, player_id: st.playerId, player_name: st.name }).then(function (j) {
      if (!j.ok) { if (j.banned) setBan(st, j.ban); return j; }
      st.shop.orders.unshift({ id: j.order.id, token: j.token, pkg: j.order.package, crystals: j.order.crystals, coins: j.order.coins || 0, price: j.order.price_kz, status: j.order.status, at: j.order.created_at, test: !!j.order.test, wa: j.whatsapp_url || (S.SHOP_WHATSAPP ? 'https://wa.me/' + S.SHOP_WHATSAPP + '?text=' + encodeURIComponent(j.message || ('Pedido ' + j.order.id)) : ''), msg: j.message || '' });
      st.shop.orders = st.shop.orders.slice(0, 30);
      E.history(st, j.order.coins ? '🪙' : '◆', 'Pedido ' + j.order.id + ': ' + (j.order.coins ? j.order.coins + ' moedas' : j.order.crystals + ' Cristais') + ' (' + j.order.price_kz + ' Kz).');
      E.commit('pedido de cristais');
      return { ok: true, order: st.shop.orders[0], whatsapp_url: j.whatsapp_url, message: j.message, payment_info: j.payment_info };
    });
  };

  /* atualiza o estado dos pedidos que ainda não terminaram */
  SH.refresh = function () {
    var st = E.state; SH.ensure(st);
    var open = st.shop.orders.filter(function (o) { return !FINAL[o.status]; });
    if (!open.length) return Promise.resolve({ ok: true, changed: 0 });
    return Promise.all(open.map(function (o) {
      return call('GET', '/api/orders/' + o.id + '?token=' + encodeURIComponent(o.token)).then(function (j) {
        if (j.ok && j.order.status !== o.status) { o.status = j.order.status; return 1; }
        return 0;
      });
    })).then(function (r) {
      var n = r.reduce(function (a, b) { return a + b; }, 0);
      if (n) E.commit('estado dos pedidos');
      return { ok: true, changed: n };
    });
  };
  SH.cancel = function (id) {
    var st = E.state; SH.ensure(st);
    var o = st.shop.orders.filter(function (x) { return x.id === id; })[0];
    if (!o) return Promise.resolve({ ok: false, msg: 'Pedido não encontrado.' });
    return call('POST', '/api/orders/' + id + '/cancel', { token: o.token }).then(function (j) {
      if (j.ok) { o.status = 'cancelled'; E.commit('pedido cancelado'); j.msg = 'Pedido ' + id + ' cancelado.'; }
      return j;
    });
  };
  SH.pending = function (st) { SH.ensure(st); return st.shop.orders.filter(function (o) { return !FINAL[o.status]; }); };

  /* credita um resgate validado pelo servidor (uma única vez por redemption_id) */
  SH.apply = function (st, res) {
    SH.ensure(st);
    var rid = String(res.redemption_id || '');
    if (!rid || !(res.crystals > 0 || res.coins > 0)) return { ok: false, msg: 'Resposta inválida do servidor.' };
    if (st.shop.redeemed[rid]) return { ok: true, already: true, crystals: 0, msg: 'Este código já tinha sido resgatado nesta conta. O que comprou já está contigo.' };
    st.shop.redeemed[rid] = { at: S.clock.now(), crystals: res.crystals || 0, coins: res.coins || 0, order: res.order_id || '' };
    if (res.crystals > 0) S.premium.grant(st, res.crystals, res.order_id ? 'pedido ' + res.order_id : 'oferta do Sistema');
    if (res.coins > 0) { st.coins += res.coins; E.bump(st, 'coinsEarned', res.coins); E.history(st, '🪙', '+' + res.coins + ' moedas (' + (res.order_id ? 'pedido ' + res.order_id : 'oferta do Sistema') + ').'); }
    st.shop.orders.forEach(function (o) { if (o.id === res.order_id) o.status = 'redeemed'; });
    E.checkAchievements(st);
    E.commit('cristais resgatados');
    var got = [res.crystals ? '+' + res.crystals + ' Cristais' : '', res.coins ? '+' + res.coins + ' moedas' : ''].filter(Boolean).join(' e ');
    return { ok: true, crystals: res.crystals || 0, coins: res.coins || 0, msg: got + '. O Sistema registou.' };
  };
  SH.redeem = function (code) {
    var st = E.state;
    S.premium.ensure(st);
    code = String(code || '').trim();
    if (code.replace(/[^A-Za-z0-9]/g, '').length < 12) return Promise.resolve({ ok: false, msg: 'O código tem 12 letras e números (ex.: SIS-ABCD-EFGH-JKMN).' });
    return call('POST', '/api/redeem', { code: code, player_id: st.playerId, player_name: st.name }).then(function (j) {
      if (!j.ok) { if (j.banned) setBan(st, j.ban); return j; }
      var r = SH.apply(st, j);
      if (r.ok && !r.already) E.emit(j.order_id && !(j.coins > 0)
        ? { type: 'crystals', title: 'CRISTAIS RECEBIDOS', name: '+' + j.crystals + ' Cristais', lines: ['Pedido ' + j.order_id + ' concluído.', 'Usa-os na Ala Premium: Loja Exclusiva, Arenas e Aparência.'] }
        : giftEvent(j));
      return r;
    });
  };

  /* ---------------- sincronização com o servidor ----------------
     O jogo envia um resumo (nome, nível, números) e recebe:
     - o estado da conta (ativa ou suspensa pelo administrador);
     - os presentes por receber (Cristais e moedas), que entram sozinhos e uma única vez. */
  function giftEvent(g) {
    var what = [g.crystals ? '+' + g.crystals + ' Cristais' : '', g.coins ? '+' + g.coins + ' moedas' : ''].filter(Boolean).join(' · ');
    return { type: 'gift', title: g.order_id ? 'COMPRA ENTREGUE' : 'O SISTEMA ENVIOU-TE ALGO', name: what,
      lines: [g.order_id ? 'Pedido ' + g.order_id + ': pagamento confirmado.' : (g.reason || 'Oferta do Sistema.'), g.message || 'Não agradeças. Usa-o bem.'].filter(Boolean) };
  }
  function setBan(st, ban) {
    var was = !!SH.banned(st);
    st.shop.ban = { reason: (ban && ban.reason) || 'Violação das regras do Sistema.', until: (ban && ban.until) || null, since: (ban && ban.since) || S.clock.now() };
    if (!was) E.history(st, '👁️', 'Conta suspensa pelo Sistema: ' + st.shop.ban.reason);
    E.commit('conta suspensa');
  }
  function stats(st) {
    var c = st.c || {};
    return { missions: c.missionsDone || 0, failed: c.missionsFailed || 0, bosses: c.bossesKilled || 0, streak: st.daily.streak || 0, best: st.daily.bestStreak || 0,
      trust: S.watch ? S.watch.trust(st) : 100, day: S.time && S.time.systemDay ? S.time.systemDay(st) : 0,
      arenas: st.arena ? Object.keys(st.arena.wins || {}).length : 0, spentCrystals: c.crystalsSpent || 0 };
  }
  /* resumo do perfil que os amigos veem (Social → perfil do amigo) */
  function profileOf(st) {
    var fr = S.premium && S.premium.cosmeticOn ? S.premium.cosmeticOn(st, 'moldura') : null, nm = S.premium && S.premium.cosmeticOn ? S.premium.cosmeticOn(st, 'nome') : null;
    var sh = st.shadows && st.shadows.owned ? Object.keys(st.shadows.owned).length : 0;
    return { title: S.titleFor ? S.titleFor(st.level) : '', ach: Object.keys(st.achievements || {}).length, achTotal: (S.ACHIEVEMENTS || []).length, shadows: sh,
      trophies: Object.keys(st.trophies || {}).length, frame: fr ? fr.id : null, color: nm && nm.color ? nm.color : null };
  }
  /* avisos da administração: guardados no jogo; os novos aparecem uma vez e ficam na área de Avisos */
  SH.NOTICE_KINDS = { info: 'Informação', importante: 'Importante', evento: 'Evento', manutencao: 'Manutenção' };
  SH.notices = function (st) {
    if (!st.notices) st.notices = { list: [], read: {}, shown: {} };
    ['read', 'shown'].forEach(function (k) { if (!st.notices[k]) st.notices[k] = {}; });
    if (!Array.isArray(st.notices.list)) st.notices.list = [];
    return st.notices;
  };
  SH.unread = function (st) { var N = SH.notices(st); return N.list.filter(function (n) { return !N.read[n.id]; }).length; };
  SH.markRead = function (st) { var N = SH.notices(st), ch = false; N.list.forEach(function (n) { if (!N.read[n.id]) { N.read[n.id] = 1; ch = true; } }); if (ch) E.commit('avisos lidos'); };
  SH.applyNotices = function (st, list) {
    var N = SH.notices(st), fresh = [];
    // avisos gerais enviados antes de esta jornada começar não interessam a um jogador novo (os pessoais ficam)
    var born = +st.created || 0;
    N.list = list.filter(function (n) { return n && n.id && n.title && (n.personal || !born || (+n.at || 0) >= born - 60000); }).slice(0, 30).map(function (n) {
      return { id: String(n.id), title: String(n.title).slice(0, 80), body: String(n.body || '').slice(0, 1500), kind: SH.NOTICE_KINDS[n.kind] ? n.kind : 'info', at: +n.at || 0, personal: !!n.personal };
    });
    N.list.forEach(function (n) { if (!N.shown[n.id]) { N.shown[n.id] = 1; fresh.push(n); } });
    // os ids que já não existem (apagados pela administração) saem da memória
    var ids = {}; N.list.forEach(function (n) { ids[n.id] = 1; });
    Object.keys(N.read).forEach(function (k) { if (!ids[k]) delete N.read[k]; });
    Object.keys(N.shown).forEach(function (k) { if (!ids[k]) delete N.shown[k]; });
    fresh.sort(function (a, b) { return a.at - b.at; }).slice(-2).forEach(function (n) { E.emit({ type: 'notice', notice: n }); });
    return fresh.length;
  };
  var syncing = null, lastSync = 0;
  SH.sync = function (force) {
    var st = E.state;
    if (!st || !SH.ready()) return Promise.resolve({ ok: false, skipped: true });
    if (syncing) return syncing;
    if (!force && Date.now() - lastSync < 60000) return Promise.resolve({ ok: true, skipped: true });
    S.premium.ensure(st); SH.ensure(st);
    lastSync = Date.now();
    var C = globalThis.Capacitor, platform = C && C.isNativePlatform && C.isNativePlatform() ? 'android' : 'web';
    syncing = call('POST', '/api/player/sync', { player_id: st.playerId, token: st.shop.secret, name: st.name, cls: st.cls, level: st.level, crystals: st.crystals, coins: st.coins,
      stats: stats(st), app_version: S.VERSION, platform: platform, device: S.gate ? S.gate.idsForSync() : null, gender: st.gender === 'f' ? 'f' : 'm', profile: profileOf(st) }).then(function (j) {
      if (!j.ok) {
        if (j.conflict && !st.shop.conflict) { st.shop.conflict = true; E.commit('conta noutro aparelho'); }
        return j;
      }
      st.shop.conflict = false; st.shop.lastSync = S.clock.now();
      // aparelho bloqueado ou à espera de autorização: o portão do aparelho trata do ecrã
      if (j.account === 'device_blocked' || j.account === 'device_pending') { if (S.gate) S.gate.fromSync(j); return { ok: true, gate: true, changed: true }; }
      if (j.account === 'deleted') {
        if (!st.shop.deleted) { st.shop.deleted = { reason: j.reason || null, at: j.deleted_at || S.clock.now() }; E.commit('conta apagada'); }
        return { ok: true, deleted: true, changed: true };
      }
      if (j.role && j.role.id) st.shop.role = { id: j.role.id, name: j.role.name };
      var nn = Array.isArray(j.notices) ? SH.applyNotices(st, j.notices) : 0;
      if (j.account === 'banned') { setBan(st, j.ban); return { ok: true, banned: true, changed: true }; }
      var changed = false;
      if (st.shop.ban) {
        var V = S.BAN_VOICE, sd = (st.shop.ban.since || 0) + st.playerId;
        st.shop.ban = null; changed = true; E.history(st, '👁️', 'O Sistema levantou a suspensão da conta.');
        E.emit({ type: 'watch', level: 1, title: seedPick(V.liftTitle, sd), lines: [seedPick(V.lift, sd + 'l').replace('{nome}', st.name), 'A tua conta voltou a estar ativa. Eu continuo a ver.'] });
      }
      var inbox = j.inbox || [];
      return inbox.reduce(function (p, g) {
        return p.then(function () {
          return call('POST', '/api/player/claim', { player_id: st.playerId, token: st.shop.secret, grant_id: g.id }).then(function (c) {
            if (!c.ok) return;
            var r = SH.apply(st, c);
            if (r.ok && !r.already) { changed = true; E.emit(giftEvent(c)); }
          });
        });
      }, Promise.resolve()).then(function () { E.commit('sincronização'); return { ok: true, changed: changed || nn > 0, gifts: inbox.length, notices: nn }; });
    }).then(function (r) { syncing = null; return r; }, function () { syncing = null; return { ok: false }; });
    return syncing;
  };
})(globalThis.SYS = globalThis.SYS || {});
