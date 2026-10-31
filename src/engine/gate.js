/* ==========================================================
   PORTÃO DO APARELHO: acesso privado e bloqueio por aparelho
   - ao abrir, o jogo pergunta ao servidor se este aparelho pode jogar
   - o servidor reconhece o aparelho pelo hardware (não pela instalação):
     desinstalar e instalar outra vez não apaga um bloqueio
   - a resposta fica guardada: sem internet, o jogo continua a cumprir a última decisão
   - um aparelho autorizado pode jogar sem internet durante alguns dias (definido no painel);
     depois tem de se ligar para o Sistema voltar a ver
   - sem servidor configurado (testes, pré-visualização) o portão fica aberto
   ========================================================== */
(function (S) {
  'use strict';
  var G = S.gate = {};
  var KEY = 'sis.gate.v1', WEB_KEY = 'sis.dev.v1';
  var DAY = 86400000;
  var cache = null, checking = null, ids = null, lastCheck = 0;
  G.ui = { msg: null, err: null, busy: false, reqOpen: false };

  function store() { try { var ls = globalThis.localStorage; return ls || null; } catch (e) { return null; } }
  function load() {
    if (cache) return cache;
    var ls = store(); var raw = null;
    try { raw = ls && ls.getItem(KEY); } catch (e) { raw = null; }
    try { cache = raw ? JSON.parse(raw) : null; } catch (e) { cache = null; }
    if (!cache || typeof cache !== 'object') cache = {};
    return cache;
  }
  function save() { var ls = store(); try { if (ls) ls.setItem(KEY, JSON.stringify(cache)); } catch (e) { /* sem espaço */ } }
  function hexRandom(n) {
    var a = new Uint8Array(n), c = globalThis.crypto;
    if (c && c.getRandomValues) c.getRandomValues(a); else for (var i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function native() { var C = globalThis.Capacitor; return !!(C && C.isNativePlatform && C.isNativePlatform()); }
  function plugin() { var C = globalThis.Capacitor; return C && C.Plugins && C.Plugins.SistemaDevice; }

  /* o portão só funciona com o servidor ligado e fora da pré-visualização */
  G.active = function () { return !S.PREVIEW && (!!(S.shop && S.shop.ready && S.shop.ready()) || !!load().checkedAt); };

  /* identificadores do aparelho */
  G.ids = function () {
    if (ids) return Promise.resolve(ids);
    var P = plugin();
    if (native() && P && P.getIds) {
      return P.getIds().then(function (r) {
        ids = { hw: r.drmId || null, aid: r.androidId || null, model: r.model || null, os: r.os || null, platform: 'android' };
        if (!ids.hw && !ids.aid) ids = webIds();
        return ids;
      }, function () { ids = webIds(); return ids; });
    }
    ids = webIds();
    return Promise.resolve(ids);
  };
  function webIds() {
    var ls = store(), v = null;
    try { v = ls && ls.getItem(WEB_KEY); } catch (e) { v = null; }
    if (!v || !/^[0-9a-f]{32}$/.test(v)) { v = hexRandom(16); try { if (ls) ls.setItem(WEB_KEY, v); } catch (e) { /* ignora */ } }
    var nav = globalThis.navigator || {};
    return { web: 'w' + v, model: String(nav.platform || 'Navegador').slice(0, 40), os: String(nav.userAgent || '').slice(0, 30), platform: native() ? 'android' : 'web' };
  }
  function idsBody(I) { var o = {}; ['hw', 'aid', 'web'].forEach(function (k) { if (I[k]) o[k] = I[k]; }); return o; }
  function body(I, extra) {
    var st = S.engine && S.engine.state, b = { ids: idsBody(I), platform: I.platform, model: I.model, os: I.os, app_version: S.VERSION };
    if (st && st.playerId && st.shop && st.shop.secret) { b.player_id = st.playerId; b.token = st.shop.secret; }
    Object.keys(extra || {}).forEach(function (k) { b[k] = extra[k]; });
    return b;
  }
  G.idsForSync = function () { return ids ? idsBody(ids) : null; };

  /* guarda a decisão do servidor */
  function apply(j) {
    var C = load(), was = C.access;
    C.access = j.access; C.code = (j.device && j.device.code) || C.code || null;
    C.block = j.block || null; C.private = !!j.private; C.offline = +j.offline_days || 15;
    C.requested = !!j.requested; C.wa = j.whatsapp_url || null; C.checkedAt = Date.now();
    C.activation = j.activation || null; C.legal = !!j.legal;
    if (j.access === 'blocked' && was !== 'blocked') C.blockedSeen = false;
    // estava bloqueado e voltou: o Sistema avisa uma vez
    if (j.access === 'ok' && was === 'blocked') C.liftNote = Date.now();
    if (j.access === 'ok' && was === 'pending') C.welcomeNote = Date.now();
    save();
    return C;
  }
  /* pergunta ao servidor (nunca mais do que uma vez de cada vez) */
  G.check = function (force) {
    if (S.PREVIEW || !(S.shop && S.shop.ready())) return Promise.resolve({ ok: false, skipped: true });
    if (checking) return checking;
    if (!force && Date.now() - lastCheck < 5 * 60000 && load().checkedAt) return Promise.resolve({ ok: true, skipped: true });
    lastCheck = Date.now();
    checking = G.ids().then(function (I) { return S.shop.call('POST', '/api/device/check', body(I)); }).then(function (j) {
      checking = null;
      if (j && j.ok) { apply(j); return { ok: true, access: j.access }; }
      return { ok: false, offline: !!(j && j.offline), msg: j && j.msg };
    }, function () { checking = null; return { ok: false, offline: true }; });
    return checking;
  };
  G.redeem = function (code) {
    code = String(code || '').trim();
    if (code.replace(/[^A-Za-z0-9]/g, '').replace(/^ACS/i, '').length !== 8) return Promise.resolve({ ok: false, msg: 'O código de ativação tem 8 letras e números (ex.: ACS-ABCD-EFGH).' });
    return G.ids().then(function (I) { return S.shop.call('POST', '/api/device/redeem', body(I, { code: code })); }).then(function (j) {
      if (j && j.ok) { apply(j); return { ok: j.access === 'ok', access: j.access, msg: j.access === 'ok' ? null : 'Este aparelho não pode usar códigos de ativação.' }; }
      return { ok: false, msg: (j && j.msg) || 'Não foi possível validar o código.' };
    });
  };
  G.request = function (name, message) {
    name = String(name || '').trim();
    if (name.length < 2) return Promise.resolve({ ok: false, msg: 'Escreve o teu nome ou contacto.' });
    return G.ids().then(function (I) { return S.shop.call('POST', '/api/device/request', body(I, { name: name, message: message || '' })); }).then(function (j) {
      if (j && j.ok) { apply(j); return { ok: true, wa: j.whatsapp_url || null }; }
      return { ok: false, msg: (j && j.msg) || 'Não foi possível enviar o pedido.' };
    });
  };
  /* a sincronização também traz o estado do aparelho */
  G.fromSync = function (j) { if (j && j.device && j.device.access) apply(j.device); };

  /* o que o jogo deve mostrar agora: null = pode jogar */
  G.screen = function () {
    if (!G.active()) return null;
    var C = load();
    if (C.access === 'blocked') return { type: 'blocked', code: C.code, block: C.block || {}, wa: C.wa };
    if (C.access === 'pending') return { type: 'pending', code: C.code, requested: C.requested, wa: C.wa, act: C.activation || {} };
    if (!C.checkedAt) return { type: 'verify' };
    if (C.access === 'ok' && Date.now() - C.checkedAt > (C.offline || 15) * DAY) return { type: 'stale', days: C.offline || 15, code: C.code };
    return null;
  };
  /* avisos de uma só vez (bloqueio levantado, acesso concedido) */
  G.takeNote = function () {
    var C = load();
    if (C.liftNote) { C.liftNote = 0; save(); return 'lift'; }
    if (C.welcomeNote) { C.welcomeNote = 0; save(); return C.legal ? 'activated' : 'welcome'; }
    return null;
  };
  G.firstBlockView = function () { var C = load(); if (C.access === 'blocked' && !C.blockedSeen) { C.blockedSeen = true; save(); return true; } return false; };
  G.code = function () { return load().code || null; };
  G._reset = function () { cache = null; ids = null; checking = null; lastCheck = 0; };

  /* falas do Sistema (fixas para cada aparelho: não mudam a cada ecrã) */
  S.GATE_VOICE = {
    blockedTitle: ['APARELHO BLOQUEADO', 'ACESSO NEGADO', 'ESTE APARELHO FOI SELADO'],
    blocked: [
      'Este aparelho já não responde ao meu chamado. A decisão foi tomada.',
      'Reconheço este aparelho. E ele já não tem lugar no Sistema.',
      'Apagar e instalar outra vez não muda o que eu vi. Eu lembro-me deste aparelho.',
      'A porta fechou-se. Não por acaso. Não por engano.',
      'Algumas portas não voltam a abrir por insistência.'
    ],
    blockedSub: [
      'Se acreditas que houve um erro, só a administração pode rever esta decisão.',
      'Há um caminho para contestar. Não passa por mim: passa pela administração.',
      'Contestar é um direito. Exige o código deste aparelho.'
    ],
    pendingTitle: ['ATIVAÇÃO NECESSÁRIA', 'O SISTEMA AINDA NÃO TE CONHECE', 'CÓDIGO DE ATIVAÇÃO'],
    pending: [
      'Antes de te dar a primeira missão, preciso do teu código de ativação.',
      'Não respondo a qualquer um. Mostra-me o teu código e eu desperto.',
      'Encontraste a porta. Para ela abrir, precisas do código que só o Sistema oficial te dá.',
      'Cada Jogador é registado. Começa pelo teu código de ativação.'
    ],
    stale: [
      'Há {dias} dias que não te vejo. Liga-te à internet para eu confirmar quem és.',
      'Passaste demasiado tempo fora do meu alcance. Liga-te para continuar.'
    ],
    verify: [
      'Antes de começar, preciso de ver este aparelho. Liga-te à internet.',
      'Primeiro contacto: o Sistema precisa de uma ligação para te reconhecer.'
    ],
    lift: [
      'O bloqueio foi levantado. Este aparelho volta a ouvir-me.',
      'A decisão foi revista. A porta abriu-se outra vez. Não a desperdices.',
      'Voltaste. O registo do que aconteceu fica comigo.'
    ],
    activated: [
      'Código aceite. Este aparelho é legítimo. A partir de agora, és um Jogador legalizado.',
      'Ativação concluída. O teu nome vai entrar no registo com a marca dos legalizados.',
      'Reconheço o teu código. Bem-vindo ao Sistema oficial, Jogador.'
    ],
    welcome: [
      'Acesso concedido. A partir de agora, este aparelho é meu conhecido.',
      'Foste aceite. Muitos batem à porta. Poucos entram.',
      'A porta abriu-se. Lembra-te de quem a abriu.'
    ]
  };
  G.pick = function (list, seed) { var h = 7; seed = String(seed || ''); for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0; return list[h % list.length]; };
})(globalThis.SYS = globalThis.SYS || {});
