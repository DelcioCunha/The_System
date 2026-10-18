/* ==========================================================
   INTERFACE
   ========================================================== */
(function (S) {
  'use strict';
  var E = S.engine, M = S.missions, C = S.combat, FX = S.fx;
  var root;
  var ui = {
    tab: 'status', page: null, shopTab: 'lazer', gate: 1, bag: 'tudo',
    modal: null, popups: [], form: null, sheet: null, toast: null,
    intro: { step: 0, name: '', cls: null }, histLimit: 40, notes: [],
    pt: { x: 0, y: 0 }, popSeq: 0, shownPop: null, shownModal: null, lastView: null, holdUntil: 0, holdTimer: null,
    busyUntil: 0, bars: {}, lastCoins: null, lastSaves: null, lastLevel: null,
    fxMission: null, fxDaily: false, spawn: false, victoryAnim: false
  };

  /* ---------------- utilitários ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return Math.floor(n).toLocaleString('pt-PT'); }
  /* imagem do item (as versões melhoradas usam a imagem do item base) */
  function artId(id) {
    if (!S.ITEM_ART) return null;
    if (S.ITEM_ART[id]) return S.ITEM_ART[id];
    var b = id.replace(/_(art|camp)$/, '');
    var m = b.match(/^ac_(str|agi|vit|int|per)_(maior|anc|prim)$/);
    if (m) b = { str: 'ac_forca', agi: 'ac_agi', vit: 'ac_vit', int: 'ac_int', per: 'ac_per' }[m[1]];
    b = b.replace(/^(ac_t_[a-z]+)[23]$/, '$11');
    return S.ITEM_ART[b] || null;
  }
  function itemIco(it, cls) {
    var src = it && artId(it.id);
    var c = 'ico' + (cls ? ' ' + cls : '');
    if (!it) return '<div class="' + c + '">·</div>';
    if (!src && it.custom && LZ_CUSTOM[it.icon] && hasArt(LZ_CUSTOM[it.icon])) return '<div class="' + c + ' has-img"><img src="' + S.UI_ART[LZ_CUSTOM[it.icon]] + '" alt=""></div>';
    if (!src) return '<div class="' + c + '">' + it.icon + '</div>';
    return '<div class="' + c + ' has-img" style="--rc:' + rc(it.rarity) + '"><img src="' + src + '" alt="" loading="lazy"></div>';
  }
  function itemTiny(it) {
    var src = artId(it.id);
    return src ? '<img class="tiny-ico" src="' + src + '" alt="">' : it.icon;
  }
  /* ícones da interface: imagem se existir em assets/ui, senão o ícone atual */
  function uiIcon(key, fallback, cls) {
    var src = S.UI_ART && S.UI_ART[key];
    return src ? '<img class="ui-ico' + (cls ? ' ' + cls : '') + '" src="' + src + '" alt="">' : fallback;
  }
  function clockOf(ts) { var d = new Date(ts); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function clockText() { var d = new Date(now()); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  /* ---------- ícones próprios no lugar dos emojis ----------
     Cada emoji que ainda aparece na app tem uma chave de ícone (assets/ui/<chave>.webp).
     Enquanto a imagem não existir, continua a aparecer o emoji. */
  var LOG_ICON = { '⚔️': 'log_appear', '🌙': 'phase_noite', '☀️': 'phase_dia', '✨': 'log_advantage', '⚠️': 'log_pressure', '🛡️': 'st_shield', '➤': 'log_hit',
    '☠️': 'log_dot', '🌀': 'st_resist', '💫': 'st_stun', '💚': 'st_heal', '💧': 'st_mana', '⬆️': 'st_buff', '⬇️': 'st_debuff', '💀': 'st_summon', '⏳': 'log_reset',
    '🧠': 'st_resist', '🔥': 'log_enrage', '🪶': 'log_revive', '🏆': 'log_victory', '✦': 'log_skill', '🎒': 'log_item', '🌿': 'log_cleanse', '💥': 'log_bomb',
    '💨': 'log_smoke', '🏃': 'log_flee', '↩️': 'st_reflect' };
  var HIST_ICON = { '⏱️': 'h_time', '✅': 'h_mission_done', '✨': 'h_awaken', '❌': 'h_mission_fail', '⬆️': 'h_levelup', '🌀': 'h_secret_skill', '🌅': 'h_newday',
    '🏃': 'log_flee', '🏅': 'h_achievement', '🏆': 'log_victory', '💀': 'log_defeat', '💠': 'h_core', '💨': 'log_smoke', '💱': 'h_sell', '📝': 'h_mission_new',
    '📲': 'h_transfer', '🔰': 'h_shield', '🗺️': 'h_map', '🛒': 'h_buy', '👁️': 'ui_eye' };
  var LZ_CUSTOM = { '🎁': 'lz_c_gift', '🍕': 'lz_c_food', '🎮': 'lz_c_game', '🎬': 'lz_c_movie', '🛍️': 'lz_c_shop', '🏖️': 'lz_c_beach', '🍦': 'lz_c_sweet', '📱': 'lz_c_phone' };
  function hasArt(key) { return !!(S.UI_ART && S.UI_ART[key]); }
  /* texto que começa por emoji (registo de batalha) → ícone + texto */
  function iconText(txt, table, special) {
    var keys = Object.keys(table);
    for (var i = 0; i < keys.length; i++) {
      var e = keys[i];
      if (txt.indexOf(e) === 0) {
        var key = (special && special(txt)) || table[e];
        if (hasArt(key)) return uiIcon(key, '', 'line-ico') + esc(txt.slice(e.length).replace(/^\s+/, ''));
        break;
      }
    }
    return esc(txt);
  }
  function logLine(txt) { return iconText(txt, LOG_ICON, function (t) { return t.indexOf('💀 MORRESTE') === 0 ? 'log_defeat' : null; }); }
  function histIcon(x) {
    var key = HIST_ICON[x.icon];
    if (x.icon === '🏆' && /^Completou os troféus/.test(x.text)) key = 'h_set';
    return key ? uiIcon(key, x.icon, 'hist-ico') : x.icon;
  }
  function phaseIcon(k, cls) { return uiIcon('phase_' + k, S.time.PHASES[k].icon, cls || 'phase-img'); }
  function classIcon(id, cls) { return uiIcon('class_' + id, S.CLASSES[id].icon, cls || 'class-img'); }
  function customIcon(emoji, cls) { return LZ_CUSTOM[emoji] ? uiIcon(LZ_CUSTOM[emoji], emoji, cls) : emoji; }
  function coins(n) { return '<span class="coins"><i class="coin-ico"></i><b class="cn">' + fmt(n) + '</b></span>'; }
  function rc(r) { return (S.RARITY[r] || S.RARITY.comum).color; }
  function now() { return S.clock.now(); }
  function cdText(ts) {
    var d = ts - now();
    if (d <= 0) return 'encerrado';
    var s = Math.floor(d / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    if (h >= 24) return Math.floor(h / 24) + 'd ' + (h % 24) + 'h';
    if (h > 0) return h + 'h ' + (m < 10 ? '0' : '') + m + 'm';
    return m + 'm ' + (x < 10 ? '0' : '') + x + 's';
  }
  function cd(ts) { return '<span class="cd' + (ts - now() < 3600000 ? ' urgent' : '') + '" data-cd="' + ts + '">' + cdText(ts) + '</span>'; }
  function timeStr(ts) { var d = new Date(ts); return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }); }
  function bar(cls, v, max, label, key, late) {
    var pct = max > 0 ? Math.max(0, Math.min(100, v / max * 100)) : 0;
    return (label ? '<div class="bar-l"><span>' + label + '</span><span>' + fmt(v) + ' / ' + fmt(max) + '</span></div>' : '') +
      '<div class="bar ' + cls + (late ? ' late' : '') + '"' + (key ? ' data-k="' + key + '" data-p="' + pct.toFixed(2) + '"' : '') + '>' +
      (key ? '<span class="gh" style="width:' + pct.toFixed(1) + '%"></span>' : '') + '<i style="width:' + pct.toFixed(1) + '%"></i></div>';
  }
  function busyCls() { return FX.full() && Date.now() < ui.busyUntil ? ' busy' : ''; }
  function vibrate(p) { try { if (E.state && E.state.settings.vibrate && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* sem vibração */ } }
  function toast(msg, bad) { ui.toast = { msg: msg, bad: !!bad, t: Date.now() }; renderToast(); }
  function act(res, okMsg) {
    if (res && res.ok === false) toast(res.msg, true);
    else if (okMsg || (res && res.msg)) toast(okMsg || res.msg);
    pullEvents();
    render();
    return res;
  }
  function pullEvents() {
    var evs = E.takeEvents();
    evs.forEach(function (ev) {
      if (ev.type === 'note') { ui.notes.push(ev.text); return; }
      ev._id = ++ui.popSeq; ui.popups.push(ev);
    });
    talkFromEvents(evs);
    if (ui.notes.length) setTimeout(showNote, ui.popups.length ? 1200 : 400);
  }
  /* faixa do Sistema: aparece no topo, sem bloquear, e desaparece sozinha */
  function showNote() {
    if (document.getElementById('sys-note') || !ui.notes.length) return;
    if (ui.popups.length) { setTimeout(showNote, 1500); return; }
    var text = ui.notes.shift();
    var d = document.createElement('button');
    d.id = 'sys-note'; d.className = 'sys-note'; d.type = 'button';
    d.innerHTML = '<span class="sn-eye">' + uiIcon('ui_eye', '<span class="eye-fallback"></span>', 'eye-img') + '</span><span class="sn-txt"><b>SISTEMA</b>' + esc(text) + '</span>';
    var close = function () { if (!d.parentNode) return; d.classList.add('out'); setTimeout(function () { d.remove(); if (ui.notes.length) setTimeout(showNote, 500); }, 350); };
    d.addEventListener('click', close);
    document.body.appendChild(d);
    FX.vibrate(25);
    setTimeout(close, Math.max(5000, text.length * 70));
  }
  function confirmBox(title, text, yes, fn, bad) { ui.modal = { type: 'confirm', title: title, text: text, yes: yes, fn: fn, bad: bad }; render(); }

  var ICONS = {
    status: '<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg>',
    missoes: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 9l2 2 4-4M8 16h8"/></svg>',
    combate: '<svg viewBox="0 0 24 24"><path d="M4 4l10 10M4 4h4M4 4v4M20 4L10 14M20 4h-4M20 4v4M7 17l-3 3M17 17l3 3M8 13l3 3M16 13l-3 3"/></svg>',
    loja: '<svg viewBox="0 0 24 24"><path d="M12 2l8 7-8 13L4 9z"/><path d="M4 9h16M9 9l3 13 3-13"/></svg>',
    bolsa: '<svg viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="13" rx="2"/><path d="M8 8V6a4 4 0 018 0v2M4 13h16"/></svg>'
  };

  /* ================= ARRANQUE / INTRO ================= */
  var INTRO_TEXT = '[SISTEMA]\n\nCumpriste as condições secretas.\nFoste escolhido como Jogador.\n\nA partir de hoje, cada missão que cumprires\nvai tornar-te mais forte.\nCada missão que falhares terá um preço.\n\nAceitas?';
  /* ---------- Transferência de conta: ecrãs sem conta ---------- */
  function codeBox(code) {
    return '<textarea class="in mono code-box" id="exp-code" readonly rows="5">' + esc(code) + '</textarea>' +
      '<div class="code-check mono">' + fmt(code.length) + ' caracteres · termina em <b>' + esc(code.slice(-8)) + '</b></div>' +
      '<button class="btn gold block" data-a="exp-copy">Copiar código</button>';
  }
  function movedHtml(mv) {
    var c = S.CLASSES[mv.cls] || {};
    return '<div class="intro"><section class="win danger moved"><div class="win-h">Conta transferida</div>' +
      '<p class="small" style="margin-top:0"><b>' + esc(mv.name) + '</b> (' + esc(c.name || '') + ', nível ' + mv.level + ') já não está neste aparelho. O Sistema só permite uma conta ativa num aparelho de cada vez.</p>' +
      '<p class="small muted">Usa este código no outro aparelho: Estado → Definições → Receber uma conta (ou no ecrã inicial, em "Tenho um código"). Confirma que chegou inteiro: tem de terminar nas mesmas letras.</p>' +
      codeBox(mv.code) +
      '<p class="hint">Este código não volta a funcionar neste aparelho. Para trazer a conta de volta, gera um código novo no aparelho onde ela estiver.</p></section>' +
      '<div class="stack"><button class="btn pri block" data-a="tr-open">Receber uma conta (outro código)</button>' +
      (ui.intro.confirmNew ? '<p class="small" style="color:var(--warn);text-align:center;margin:0">Ao começar de novo, este código deixa de aparecer aqui. Já o copiaste?</p><button class="btn bad block" data-a="tr-new">Sim, começar nova jornada</button>'
        : '<button class="btn ghost block" data-a="tr-new-ask">Começar uma nova jornada</button>') + '</div></div>';
  }
  function receiveHtml(inApp) {
    var P = ui.trPending;
    var h = '<label class="f">Código de transferência<textarea class="in mono code-box" id="tr-code" rows="5" placeholder="Cola aqui o código que começa por SISTEMA2-" autocomplete="off" spellcheck="false"></textarea></label>' +
      '<button class="btn block" data-a="tr-paste">Colar da área de transferência</button>' +
      '<button class="btn gold block" data-a="tr-read">Verificar código</button>';
    if (P) {
      var c = S.CLASSES[P.cls] || {};
      h += '<div class="card tr-found"><div class="card-h">' + (S.avatar ? S.avatar.html(P.cls, P.level) : '') + '<div class="grow"><div class="hint">Conta encontrada</div><div class="card-t">' + esc(P.name) + '</div>' +
        '<div class="meta"><span>' + esc(c.name || '') + '</span><span class="mono">Nível ' + P.level + '</span><span class="mono">' + fmt(P.coins) + ' moedas</span></div></div></div>' +
        (inApp ? '<p class="small" style="color:var(--warn)">A conta atual deste aparelho (' + esc(E.state.name) + ', nível ' + E.state.level + ') será substituída e perdida.</p>' : '') +
        '<button class="btn pri block" data-a="tr-accept">Restaurar esta conta aqui</button></div>';
    }
    return h;
  }
  function introHtml() {
    var I = ui.intro;
    var mv = S.storage.getMoved();
    if (I.step === 0 && mv) return movedHtml(mv);
    if (I.step === 'restore') {
      return '<div class="intro"><section class="win"><div class="win-h">Receber uma conta</div>' +
        '<p class="small muted" style="margin-top:0">No aparelho onde a conta está: Estado → Definições → Transferir conta. Esse aparelho perde a conta e mostra um código. Cola-o aqui.</p>' +
        receiveHtml(false) + '</section><button class="btn ghost block" data-a="tr-back">‹ Voltar</button></div>';
    }
    if (I.step === 0) {
      return '<div class="intro"><div class="win boot"><div class="win-h">Notificação <small>v' + S.VERSION + '</small></div>' +
        '<div class="type" id="typer"></div></div>' +
        '<div class="row"><button class="btn pri block" data-a="intro-yes">Aceitar</button></div>' +
        '<p class="hint" style="text-align:center">O teu progresso fica guardado neste aparelho e é gravado automaticamente a cada ação.</p>' +
        '<button class="btn ghost block" data-a="tr-open" style="margin-top:6px">Tenho um código de transferência</button>' +
        '<p class="made-by">Criado por <b>' + esc(S.CREDITS.creator) + '</b></p></div>';
    }
    var cards = S.CLASS_ORDER.map(function (id) {
      var c = S.CLASSES[id];
      var bars = S.STATS.map(function (k) { return '<div>' + S.STAT_INFO[k].short + '<span><i style="width:' + (c.base[k] / 15 * 100).toFixed(0) + '%"></i></span></div>'; }).join('');
      var art = S.CLASS_ART[id];
      return '<button class="class-card' + (I.cls === id ? ' on' : '') + '" data-a="intro-cls" data-v="' + id + '">' +
        (art ? '<div class="art"><img src="' + art + '" alt="' + c.name + '" loading="lazy"></div>' : '') +
        '<div class="row"><span style="font-size:22px">' + classIcon(id) + '</span><span class="nm" style="color:' + c.color + '">' + c.name + '</span></div>' +
        '<div class="minibars">' + bars + '</div></button>';
    }).join('');
    var sel = I.cls ? S.CLASSES[I.cls] : null;
    return '<div class="intro">' +
      '<div class="win"><div class="win-h">Registo do Jogador</div>' +
      '<label class="f">Nome do jogador<input class="in" id="in-name" maxlength="24" placeholder="Como te chamas?" value="' + esc(I.name) + '" data-f="intro-name" autocomplete="off"></label></div>' +
      '<div class="win"><div class="win-h">Escolhe a tua classe</div><div class="class-grid">' + cards + '</div>' +
      (sel ? '<div class="card class-detail" style="margin-top:10px">' + S.avatar.html(sel.id, 1) + '<div class="stack" style="gap:6px;min-width:0">' +
        '<div><b style="color:' + sel.color + '">' + sel.name + '</b> — ' + esc(sel.desc) + '</div>' +
        '<div class="meta">' + S.STATS.map(function (k) { return S.STAT_INFO[k].short + ' ' + sel.base[k]; }).join(' · ') + '</div>' +
        '<div class="hint">Cresce sozinho em ' + sel.growth.map(function (k) { return S.STAT_INFO[k].name; }).join(' e ') + ' a cada nível.</div></div></div>' : '') +
      '</div>' +
      '<button class="btn pri block" data-a="intro-go"' + (I.cls ? '' : ' disabled') + '>Despertar</button></div>';
  }
  function runTyper() {
    var el = document.getElementById('typer');
    if (!el) return;
    var i = 0;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.textContent = INTRO_TEXT; return; }
    (function tick() {
      if (!document.getElementById('typer')) return;
      i += 2;
      el.textContent = INTRO_TEXT.slice(0, i);
      if (i < INTRO_TEXT.length) setTimeout(tick, 22);
    })();
  }

  /* ================= TOPO E NAVEGAÇÃO ================= */
  function topHtml(st) {
    var need = S.xpToNext(st.level);
    var pct = need ? st.xp / need * 100 : 100;
    var r = S.rankFor(st.level);
    return '<header class="top"><div class="top-row">' +
      '<span class="rank" style="color:' + r.color + '">' + r.rank + '</span>' +
      '<span class="top-lv">Nv ' + st.level + '</span>' +
      '<span class="top-name">' + esc(st.name) + '</span>' +
      '<span class="top-time' + (S.time.tampered(st) ? ' bad' : '') + '" title="' + (S.time.tampered(st) ? 'Relógio do telemóvel atrasado: o Sistema não aceita' : 'Hora do aparelho') + '">' +
        '<span class="phase-chip" title="' + S.time.PHASES[S.time.current()].name + '">' + phaseIcon(S.time.current()) + '</span>' +
        '<b id="top-clock" class="mono">' + clockText() + '</b></span>' +
      '<span class="save-dot' + (S.storage.lastError ? ' err' : '') + '" title="' + (S.storage.lastError ? 'Erro ao gravar' : 'Progresso gravado') + '"></span>' +
      '<span id="top-coins">' + coins(st.coins) + '</span></div>' +
      '<div class="top-xp" data-k="top-xp" data-p="' + pct.toFixed(2) + '"><i style="width:' + pct.toFixed(1) + '%"></i></div></header>';
  }
  function navHtml(st) {
    var pendingMissions = M.forDay(st, E.dateKey()).filter(function (x) { return x.status === 'pending'; }).length + (M.dailyStatus(st) === 'pending' ? 1 : 0) +
      (S.live.emergency(st) ? 1 : 0) + (S.live.hiddenActive(st) ? 1 : 0) + (S.live.zone(st) ? 1 : 0);
    var chests = Object.keys(st.inv).filter(function (id) { return id.indexOf('bau_') === 0; }).reduce(function (s, id) { return s + st.inv[id]; }, 0);
    var tabs = [['status', 'Estado', st.freePoints], ['missoes', 'Missões', pendingMissions], ['combate', 'Combate', st.battle && !st.battle.over ? '!' : 0], ['loja', 'Loja', 0], ['bolsa', 'Bolsa', chests]];
    return '<nav class="nav"><div class="nav-in">' + tabs.map(function (t) {
      return '<button class="' + (ui.tab === t[0] ? 'on' : '') + '" data-a="tab" data-t="' + t[0] + '" aria-label="' + t[1] + '">' + uiIcon('nav_' + t[0], ICONS[t[0]], 'nav-img') + t[1] +
        (t[2] ? '<span class="badge">' + t[2] + '</span>' : '') + '</button>';
    }).join('') + '</div></nav>';
  }

  /* ================= ESTADO ================= */
  function statusHtml(st) {
    if (ui.page === 'skills') return skillsPage(st);
    if (ui.page === 'ach') return achPage(st);
    if (ui.page === 'collection') return collectionPage(st);
    if (ui.page === 'history') return historyPage(st);
    if (ui.page === 'trophies') return trophiesPage(st);
    if (ui.page === 'settings') return settingsPage(st);
    if (ui.page === 'credits') return creditsPage(st);
    if (ui.page === 'reports') return reportsPage(st);
    var cls = S.CLASSES[st.cls];
    var cs = E.combatStats(st);
    var t = E.totalStats(st);
    var need = S.xpToNext(st.level);
    var r = S.rankFor(st.level);
    var h = '';
    h += '<section class="win"><div class="win-h">Estado <small>' + uiIcon('ui_sysday', '', 'tag-ico') + 'Dia ' + S.time.systemDay(st) + ' do Sistema · Poder ' + fmt(cs.power) + '</small></div>' +
      '<div class="hero" style="--aura:' + r.color + '">' + S.avatar.html(st.cls, st.level) +
      '<div class="stack" style="gap:8px;min-width:0">' +
      '<div><div class="hero-name">' + esc(st.name) + '</div><div class="hero-title shine">' + esc(S.titleFor(st.level)) + '</div></div>' +
      '<div class="row" style="align-items:flex-end"><div><div class="lv-lab">Nível</div><div class="lv-big">' + st.level + '</div></div>' +
      '<div class="grow" style="padding-bottom:4px"><div class="lv-lab">Classe</div><div style="color:' + cls.color + ';font-family:var(--f-display);font-weight:700">' + classIcon(st.cls) + ' ' + cls.name + '</div>' +
      '<div class="lv-lab" style="margin-top:4px">Rank <b style="color:' + r.color + '">' + r.rank + '</b></div></div></div>' +
      '<div>' + (need ? bar('xp', st.xp, need, 'XP', 'st-xp') : '<div class="hint" style="color:var(--gold)">NÍVEL MÁXIMO</div>') + '</div>' +
      '</div></div>' +
      '<div class="stack" style="margin-top:12px;gap:8px">' + bar('hp', E.curHp(st), cs.maxHp, 'Vida', 'st-hp') + bar('mp', cs.maxMp, cs.maxMp, 'Mana') + '</div>' +
      '<div class="kv" style="margin-top:12px">' +
      '<div><span class="muted">Ataque</span><b>' + fmt(cs.atk) + '</b></div><div><span class="muted">Ataque mágico</span><b>' + fmt(cs.matk) + '</b></div>' +
      '<div><span class="muted">Defesa</span><b>' + fmt(cs.def) + '</b></div><div><span class="muted">Crítico</span><b>' + cs.crit.toFixed(1) + '%</b></div>' +
      '<div><span class="muted">Dano crítico</span><b>' + cs.critDmg + '%</b></div><div><span class="muted">Esquiva</span><b>' + cs.eva.toFixed(1) + '%</b></div>' +
      '</div>' + effectsHtml(st) + '</section>';

    h += '<section class="win' + (st.freePoints ? ' gold' : '') + '"><div class="win-h">Atributos' + (st.freePoints ? ' <span class="points">' + st.freePoints + ' pontos livres</span>' : '<small>+' + S.POINTS_PER_LEVEL + ' pontos por nível</small>') + '</div>' +
      S.STATS.map(function (k) {
        var info = S.STAT_INFO[k];
        var tr = st.trained[k];
        return '<div class="stat"><span class="stat-k">' + uiIcon('stat_' + k, '', 'stat-img') + info.short + '</span>' +
          '<span class="stat-n">' + info.name + '<small>' + info.desc + (tr > 0 ? ' · treino +' + tr.toFixed(1) : '') + '</small></span>' +
          '<span class="stat-v" data-stat="' + k + '">' + Math.floor(t[k]) + '</span>' +
          (st.freePoints ? '<button class="btn icon gold" data-a="alloc" data-s="' + k + '" aria-label="Adicionar ponto em ' + info.name + '">+</button>' : '<span></span>') + '</div>';
      }).join('') + '</section>';

    h += '<section class="win"><div class="win-h">Equipamento</div><div class="list">' +
      [['weapon', 'Arma'], ['armor', 'Armadura'], ['acc1', 'Acessório 1'], ['acc2', 'Acessório 2']].map(function (sl) {
        var id = st.equip[sl[0]], it = id && E.item(id);
        return '<button class="card tap" data-a="slot" data-s="' + sl[0] + '"><div class="card-h">' + itemIco(it) + '' +
          '<div class="grow"><div class="hint">' + sl[1] + '</div><div class="card-t" style="color:' + (it ? rc(it.rarity) : 'var(--faint)') + '">' + (it ? esc(it.name) : 'Vazio') + '</div>' +
          (it ? '<div class="meta">' + equipSummary(it) + phaseTag(it) + '</div>' : '') + '</div></div></button>';
      }).join('') + '</div></section>';

    var achDone = Object.keys(st.achievements).length;
    h += '<section class="win"><div class="win-h">Registos</div><div class="menu-grid">' +
      '<button class="btn" data-a="page" data-p="skills">Habilidades <span class="muted">' + E.unlockedSkills(st).length + '</span></button>' +
      '<button class="btn" data-a="page" data-p="ach">Conquistas <span class="muted">' + achDone + '/' + S.ACHIEVEMENTS.length + '</span></button>' +
      '<button class="btn" data-a="page" data-p="trophies">' + uiIcon('ui_trofeus', '', 'menu-img') + 'Troféus <span class="muted">' + E.trophyCount(st) + '/' + Object.keys(S.TROPHIES).length + '</span></button>' +
      '<button class="btn" data-a="page" data-p="collection">Coleção</button>' +
      '<button class="btn" data-a="page" data-p="history">Histórico</button>' +
      '<button class="btn" data-a="page" data-p="settings">Definições</button>' +
      '<button class="btn" data-a="page" data-p="reports">Relatórios <span class="muted">' + ((st.live && st.live.reports) || []).length + '</span></button>' +
      '<button class="btn credits-btn" data-a="page" data-p="credits">Créditos</button>' +
      '</div></section>';
    return h;
  }
  function effectsHtml(st) {
    E.cleanEffects(st);
    if (!st.effects.length) return '';
    return '<div class="row wrap" style="margin-top:10px">' + st.effects.map(function (e) {
      var d = S.TIMED_EFFECTS[e.id];
      return '<span class="tag" style="border-color:' + (d.good ? 'var(--good)' : 'var(--danger)') + '">' + uiIcon('eff_' + e.id, d.icon, 'tag-ico') + ' ' + d.name + ' · ' + cd(e.until) + '</span>';
    }).join('') + '</div>';
  }
  function phaseTag(it) {
    if (!it || !it.phase) return '';
    var on = S.time.itemActive(it), ph = S.time.PHASES[it.phase];
    return '<span class="tag phase ' + (on ? 'on' : 'off') + '" title="' + ph.desc + '">' + phaseIcon(it.phase, 'tag-ico') + ' ' + (on ? 'Ativo agora' : 'Só ' + ph.desc) + '</span>';
  }
  function equipSummary(it) {
    var q = it.equip, out = [];
    if (q.atk) out.push('ATQ +' + q.atk);
    if (q.matk) out.push('ATQ MÁG +' + q.matk);
    if (q.def) out.push('DEF +' + q.def);
    if (q.stats) Object.keys(q.stats).forEach(function (k) { out.push(S.STAT_INFO[k].short + ' +' + q.stats[k]); });
    if (q.crit) out.push('Crít +' + q.crit + '%');
    if (q.critDmg) out.push('Dano crít +' + q.critDmg + '%');
    if (q.eva) out.push('Esquiva +' + q.eva + '%');
    if (q.lifesteal) out.push('Roubo de vida ' + q.lifesteal + '%');
    if (q.hpPct) out.push('Vida +' + q.hpPct + '%');
    if (q.xpPct) out.push('XP +' + q.xpPct + '%');
    if (q.coinPct) out.push('Moedas +' + q.coinPct + '%');
    if (q.allStatsPct) out.push('Todos os atributos +' + q.allStatsPct + '%');
    if (q.mpPct) out.push('Mana +' + q.mpPct + '%');
    if (q.regenHp) out.push('Regenera ' + q.regenHp + '% vida/turno');
    if (q.regenMp) out.push('Regenera ' + q.regenMp + '% mana/turno');
    if (q.summonPct) out.push('Invocações +' + q.summonPct + '%');
    return out.map(function (x) { return '<span>' + x + '</span>'; }).join('');
  }
  function backBtn(title) { return '<div class="row" style="margin-top:14px"><button class="btn sm ghost" data-a="back">‹ Voltar</button><h2 style="font-size:18px">' + title + '</h2></div>'; }

  function skillIco(s, cls) {
    var src = S.SKILL_ART && S.SKILL_ART[s.id];
    return src ? '<div class="ico has-img skill-ico' + (cls ? ' ' + cls : '') + '"><img src="' + src + '" alt="" loading="lazy"></div>' : '';
  }
  function trophyArt(b) { return (S.TROPHY_ART && S.TROPHY_ART[b.id]) || null; }
  /* imagem que abre a ficha detalhada ao tocar */
  function tapInfo(html, k, id) { return '<span class="info-tap" data-a="info" data-k="' + k + '" data-id="' + id + '" role="button" aria-label="Ver detalhes">' + html + '</span>'; }
  function loreHtml(t, cls) { return t ? '<p class="lore' + (cls ? ' ' + cls : '') + '">' + esc(t) + '</p>' : ''; }
  function infoSecs(secs) {
    return '<div class="info-secs">' + secs.filter(function (x) { return x.rows.length; }).map(function (x) {
      return '<div class="info-sec"><div class="info-h">' + esc(x.title) + '</div>' + x.rows.map(function (r) {
        return '<div class="info-r"><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>';
      }).join('') + '</div>';
    }).join('') + '</div>';
  }
  function backOrClose(m) { return m && m.back ? '<button class="btn sm ghost" data-a="info-back">‹ Voltar</button>' : '<button class="btn sm ghost" data-a="close">Fechar</button>'; }
  function skillInfoModal(m) {
    var st = E.state, s = S.ALL_SKILLS[m.id];
    if (!s) return '';
    var src = S.SKILL_ART && S.SKILL_ART[s.id];
    return '<div class="sheet-h"><h2>' + esc(s.name) + '</h2>' + backOrClose(m) + '</div>' +
      '<div class="info-hero">' + (src ? '<div class="info-img skill"><img src="' + src + '" alt=""></div>' : '') +
      '<div class="grow"><div class="small">' + esc(s.desc) + '</div><div class="meta" style="margin-top:6px"><span class="tag">' + (s.type === 'passive' ? 'Passiva' : 'Ativa') + '</span>' +
      (s.secret ? '<span class="tag" style="color:var(--gold)">Secreta</span>' : '') + '</div></div></div>' +
      loreHtml(S.lore.skillText(s)) + infoSecs(S.lore.skillSections(s, st));
  }
  function trophyInfoModal(m) {
    var st = E.state, b = S.BOSS_BY_ID[m.id], tr = S.TROPHIES[m.id];
    if (!b || !tr || !st.trophies[b.id]) return '<div class="sheet-h"><h2>Troféu bloqueado</h2>' + backOrClose(m) + '</div><div class="empty">🔒</div>';
    var art = trophyArt(b) || (S.BOSS_ART && S.BOSS_ART[b.id]);
    var g = S.GATES.filter(function (x) { return x.id === b.gate; })[0];
    var t = E.gateTrophies(st, b.gate), done = E.completedSets(st).indexOf(b.gate) >= 0;
    var when = typeof st.defeated[b.id] === 'number' && st.defeated[b.id] > 1e9 ? timeStr(st.defeated[b.id]) : '';
    var rows = [['Raridade', S.RARITY[tr.rarity].name], ['Chefe', b.name + ' (Nv ' + b.level + ')'], ['Portão', g ? g.name : 'Portão oculto']];
    if (when) rows.push(['Conquistado', when]);
    return '<div class="sheet-h"><h2 style="color:' + rc(tr.rarity) + '">' + esc(tr.name) + '</h2>' + backOrClose(m) + '</div>' +
      (art ? '<div class="info-img trophy-big" style="--rc:' + rc(tr.rarity) + '"><img src="' + art + '" alt=""></div>' : '') +
      loreHtml(S.lore.trophyText(b)) +
      infoSecs([{ title: 'Registo', rows: rows }, { title: 'Conjunto do portão', rows: [['Troféus', t.have + ' / ' + t.total], [done ? 'Bónus ativo' : 'Bónus ao completar', S.TROPHY_SETS[b.gate].desc]] }]);
  }
  function skillCard(s, locked) {
    var tag = s.type === 'passive' ? '<span class="tag">Passiva</span>' : '<span class="tag">' + s.mp + ' MP · recarga ' + s.cd + '</span>';
    return '<button class="card tap' + (locked ? ' done' : '') + '" data-a="info" data-k="skill" data-id="' + s.id + '"><div class="card-h">' + skillIco(s) + '<div class="grow"><div class="card-t">' + esc(s.name) + '</div>' +
      '<div class="small muted">' + esc(s.desc) + '</div></div>' + (locked ? '<span class="tag">Nv ' + s.unlock + '</span>' : tag) + '</div></button>';
  }
  function skillsPage(st) {
    var cls = S.CLASS_SKILLS[st.cls];
    var h = backBtn('Habilidades');
    h += '<section class="win"><div class="win-h">' + S.CLASSES[st.cls].name + '</div><div class="list">' + cls.map(function (s) { return skillCard(s, st.level < s.unlock); }).join('') + '</div></section>';
    h += '<section class="win"><div class="win-h">Gerais</div><div class="list">' + S.COMMON_SKILLS.map(function (s) { return skillCard(s, st.level < s.unlock); }).join('') + '</div></section>';
    h += '<section class="win gold"><div class="win-h">Secretas <small>' + st.secretSkills.length + '/' + S.SECRET_SKILLS.length + '</small></div><div class="list">' +
      S.SECRET_SKILLS.map(function (s) {
        if (st.secretSkills.indexOf(s.id) >= 0) return skillCard(s, false);
        return '<div class="card done"><div class="card-t">???</div><div class="small muted">Pista: ' + esc(s.hint) + '</div></div>';
      }).join('') + '</div></section>';
    return h;
  }
  function achPage(st) {
    var h = backBtn('Conquistas');
    h += '<section class="win"><div class="list">' + S.ACHIEVEMENTS.map(function (a) {
      var done = st.achievements[a.id];
      var hidden = a.secret && !done;
      var r = a.reward || {};
      var rw = [];
      if (r.chest) rw.push(S.ITEMS['bau_' + r.chest].name);
      if (r.coins) rw.push(fmt(r.coins) + ' moedas');
      if (r.item) rw.push(S.ITEMS[r.item].name);
      if (r.skill) rw.push(hidden ? 'Habilidade secreta' : 'Habilidade ' + S.ALL_SKILLS[r.skill].name);
      return '<div class="card' + (done ? '' : ' done') + '"><div class="card-h"><div class="ico' + (hasArt(hidden ? 'ach_hidden' : 'ach_' + a.id) ? ' has-img' : '') + '">' + (hidden ? uiIcon('ach_hidden', '❔', 'ach-img') : uiIcon('ach_' + a.id, a.icon, 'ach-img')) + '</div><div class="grow">' +
        '<div class="card-t">' + esc(hidden ? '???' : (a.realName || a.name)) + '</div><div class="small muted">' + esc(hidden ? 'Conquista secreta.' : a.desc) + '</div>' +
        '<div class="reward">' + esc(rw.join(' · ')) + '</div></div>' + (done ? '<span class="stamp ok">Feito</span>' : '') + '</div></div>';
    }).join('') + '</div></section>';
    return h;
  }
  function collectionPage(st) {
    var h = backBtn('Coleção');
    var secrets = Object.keys(S.ITEMS).filter(function (k) { return S.ITEMS[k].secret; });
    h += '<section class="win gold"><div class="win-h">Itens secretos <small>' + secrets.filter(function (k) { return st.seen[k]; }).length + '/' + secrets.length + '</small></div><div class="list">' +
      secrets.map(function (k) {
        var it = S.ITEMS[k];
        if (!st.seen[k]) return '<div class="card done"><div class="card-h"><div class="ico">' + uiIcon('ui_unknown', '❔', 'ach-img') + '</div><div class="grow"><div class="card-t">???</div><div class="small muted">Ainda não encontrado.</div></div></div></div>';
        return '<button class="card tap" data-a="info" data-k="item" data-id="' + k + '"><div class="card-h">' + itemIco(it) + '<div class="grow"><div class="card-t" style="color:' + rc(it.rarity) + '">' + esc(it.name) + '</div><div class="small muted">' + esc(it.desc) + '</div></div></div></button>';
      }).join('') + '</div></section>';
    var killed = S.BOSSES.filter(function (b) { return st.defeated[b.id]; }).length;
    h += '<section class="win"><div class="win-h">Chefes derrotados <small>' + killed + '/100</small></div>' +
      '<div class="chips" style="flex-wrap:wrap">' + S.GATES.map(function (g) {
        var k = S.BOSSES.filter(function (b) { return b.gate === g.id && st.defeated[b.id]; }).length;
        return '<span class="tag">' + uiIcon('gate_' + g.id, g.icon, 'tag-ico') + ' ' + esc(g.name) + ' ' + k + '/10</span>';
      }).join('') + '</div>' +
      '<div class="kv" style="margin-top:12px"><div><span class="muted">Itens obtidos</span><b>' + Object.keys(st.seen).length + '</b></div><div><span class="muted">Baús abertos</span><b>' + (st.c.chestsOpened || 0) + '</b></div>' +
      '<div><span class="muted">Missões feitas</span><b>' + (st.c.missionsDone || 0) + '</b></div><div><span class="muted">Missões falhadas</span><b>' + (st.c.missionsFailed || 0) + '</b></div>' +
      '<div><span class="muted">Vitórias</span><b>' + (st.c.battlesWon || 0) + '</b></div><div><span class="muted">Derrotas</span><b>' + (st.c.battlesLost || 0) + '</b></div>' +
      '<div><span class="muted">Moedas ganhas</span><b>' + fmt(st.c.coinsEarned || 0) + '</b></div><div><span class="muted">Melhor sequência</span><b>' + st.daily.bestStreak + '</b></div>' +
      '<div><span class="muted">Dia do Sistema</span><b>' + S.time.systemDay(st) + '</b></div><div><span class="muted">Despertar</span><b>' + timeStr(S.time.ensure(st).first) + '</b></div></div></section>';
    return h;
  }
  function trophiesPage(st) {
    var h = backBtn('Sala de Troféus');
    var total = Object.keys(S.TROPHIES).length, have = E.trophyCount(st);
    var sets = E.completedSets(st);
    h += '<section class="win gold"><div class="win-h">Coleção <small>' + have + '/' + total + '</small></div>' +
      '<p class="small muted" style="margin:0">Cada chefe derrotado deixa um troféu. Junta os 10 troféus de um portão para ganhares um bónus permanente.</p>' +
      '<div class="bar xp" style="margin-top:10px"><i style="width:' + (have / total * 100).toFixed(1) + '%"></i></div></section>';
    var gates = S.GATES.map(function (g) { return { id: g.id, ico: uiIcon('gate_' + g.id, g.icon), name: g.name, color: g.color, bosses: S.BOSSES.filter(function (b) { return b.gate === g.id; }) }; });
    if (S.SECRET_BOSSES.some(function (b) { return st.trophies[b.id] || S.combat.bossUnlocked(st, b); })) gates.push({ id: 0, ico: uiIcon('gate_0', '🗝️'), name: 'Portões Ocultos', color: 'var(--gold)', bosses: S.SECRET_BOSSES });
    gates.forEach(function (g) {
      var t = E.gateTrophies(st, g.id), done = sets.indexOf(g.id) >= 0;
      h += '<section class="win' + (done ? ' gold' : '') + '"><div class="win-h"><span style="color:' + g.color + '">' + g.ico + ' ' + esc(g.name) + '</span><small>' + t.have + '/' + t.total + '</small></div>' +
        '<div class="trophy-grid">' + g.bosses.map(function (b) {
          var tr = S.TROPHIES[b.id], got = st.trophies[b.id], tart = trophyArt(b), art = tart || (S.BOSS_ART && S.BOSS_ART[b.id]);
          if (!got) return '<div class="trophy locked" aria-label="Troféu bloqueado"><span class="tr-seal"></span><span class="tr-lock">' + uiIcon('ic_lock', '🔒', 'lock-img') + '</span></div>';
          return '<button class="trophy got' + (tart ? ' t-art' : '') + '" style="--rc:' + rc(tr.rarity) + '" title="' + esc(tr.name) + '" data-a="info" data-k="trophy" data-id="' + b.id + '">' +
            (art ? '<img src="' + art + '" alt="" loading="lazy">' : '<span class="tr-ico">' + b.icon + '</span>') +
            '<span class="tr-name">' + esc(tr.name) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="set-bonus ' + (done ? 'on' : '') + '">' + (done ? '✓ Bónus ativo: ' : 'Bónus do conjunto: ') + esc(S.TROPHY_SETS[g.id].desc) + '</div></section>';
    });
    return h;
  }
  function historyPage(st) {
    var h = backBtn('Histórico');
    var list = st.history.slice(0, ui.histLimit);
    h += '<section class="win"><div class="list">' + (list.length ? list.map(function (x) {
      return '<div class="row" style="align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:8px"><span style="width:24px;text-align:center">' + histIcon(x) + '</span>' +
        '<div class="grow"><div class="small">' + esc(x.text) + '</div><div class="hint mono">' + timeStr(x.t) + '</div></div></div>';
    }).join('') : '<div class="empty">Ainda sem registos.</div>') + '</div>' +
      (st.history.length > ui.histLimit ? '<button class="btn block ghost" style="margin-top:10px" data-a="hist-more">Ver mais</button>' : '') + '</section>';
    return h;
  }
  function reportsPage(st) {
    var reps = (st.live && st.live.reports) || [];
    var h = backBtn('Relatórios do Sistema');
    h += '<section class="win"><p class="small muted" style="margin-top:0">Todos os domingos, a partir das 18:00, o Sistema avalia a tua semana de E a S.</p><div class="list">' +
      (reps.length ? reps.map(function (r) {
        return '<div class="card report-card"><div class="card-h"><div class="grade-mini grade-' + r.grade + '">' + r.grade + '</div><div class="grow"><div class="card-t">Semana de ' + r.week.slice(8) + '/' + r.week.slice(5, 7) + '</div>' +
          '<div class="small muted">' + r.stats.done + ' missões · ' + r.stats.daily + '/7 diárias · ' + r.stats.bosses + ' chefes · ' + r.stats.failed + ' falhadas</div>' +
          '<div class="small" style="margin-top:4px;font-style:italic">«' + esc(r.say) + '»</div></div></div></div>';
      }).join('') : '<div class="empty">Ainda não há relatórios. O primeiro chega no domingo.</div>') + '</div></section>';
    return h;
  }
  function creditsPage(st) {
    var K = S.CREDITS, i = 0;
    function d() { return ' style="--d:' + (i++ * 70) + 'ms"'; }
    var h = backBtn('Créditos');
    h += '<section class="win credits"><div class="cr-top"' + d() + '><div class="cr-game">' + esc(K.game) + '</div><div class="cr-tag">' + esc(K.tagline) + '</div></div>' +
      '<div class="cr-creator"' + d() + '><div class="cr-label">' + esc(K.creatorRole) + '</div><div class="cr-name">' + esc(K.creator) + '</div>' +
      '<div class="cr-note">Todas as áreas do projeto foram criadas e desenvolvidas por ' + esc(K.creator) + '.</div></div>' +
      '<div class="cr-roles">' + K.roles.map(function (r) {
        return '<div class="cr-role"' + d() + '><div class="cr-area">' + esc(r[0]) + '</div><div class="cr-who">' + esc(K.creator) + '</div><div class="cr-what">' + esc(r[1]) + '</div></div>';
      }).join('') + '</div></section>';
    h += '<section class="win"><div class="win-h">Contactos e redes</div><div class="cr-links">' + K.links.map(function (l) {
      return '<a class="cr-link" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" data-a="ext" data-url="' + esc(l.url) + '"' + d() + '>' +
        '<span class="cr-ico cr-' + l.key + '">' + esc(l.icon) + '</span><span class="grow"><b>' + esc(l.label) + '</b><small>' + esc(l.handle) + '</small></span><span class="cr-go">↗</span></a>';
    }).join('') + '</div></section>';
    h += '<p class="cr-end">' + esc(K.closing) + '<br><span class="mono">© ' + K.year + ' ' + esc(K.creator) + ' · v' + S.VERSION + '</span></p>';
    return h;
  }
  function settingsPage(st) {
    var h = backBtn('Definições');
    var ok = !S.storage.lastError;
    h += '<section class="win"><div class="win-h">Salvamento</div>' +
      '<div class="kv"><div><span class="muted">Estado</span><b style="color:' + (ok ? 'var(--good)' : 'var(--danger)') + '">' + (ok ? 'OK' : 'ERRO') + '</b></div>' +
      '<div><span class="muted">Gravações</span><b>' + fmt(st.meta.saveCount) + '</b></div>' +
      '<div style="grid-column:1/-1"><span class="muted">Última gravação</span><b>' + timeStr(st.meta.savedAt) + '</b></div></div>' +
      (ok ? '' : '<p class="small" style="color:var(--danger)">Não foi possível gravar: ' + esc(S.storage.lastError) + '. Copia o código de backup abaixo.</p>') +
      '<p class="hint">Cada ganho ou perda é gravado no momento, com uma cópia de segurança da gravação anterior. No Android a gravação é também guardada no armazenamento da app.</p></section>';
    h += '<section class="win"><div class="win-h">Transferir conta</div><div class="stack">' +
      '<p class="small muted" style="margin:0">Leva a tua conta para outro telemóvel. O Sistema só permite <b>uma conta ativa num aparelho de cada vez</b>: ao gerar o código, este aparelho perde a conta imediatamente.</p>' +
      '<ul class="tr-rules"><li>O código é curto o suficiente para enviar pelo WhatsApp.</li><li>Só pode ser usado uma vez em cada aparelho, e nunca neste.</li><li>Para voltar, gera um código novo no outro aparelho e recebe-o aqui.</li></ul>' +
      '<button class="btn bad block" data-a="tr-start"' + (st.battle && !st.battle.over ? ' disabled' : '') + '>Transferir para outro aparelho</button>' +
      (st.battle && !st.battle.over ? '<p class="hint" style="margin:0">Termina a batalha em curso primeiro.</p>' : '') + '</div></section>';
    h += '<section class="win"><div class="win-h">Receber uma conta</div><div class="stack">' + receiveHtml(true) + '</div></section>';
    h += '<section class="win"><div class="win-h">Preferências</div>' +
      (Notify.available()
        ? '<label class="row between" style="margin-bottom:6px"><span>Lembretes do Sistema<br><small class="muted">Avisos no telemóvel antes dos prazos, emergências e Zona de Penalidade</small></span><input type="checkbox" id="set-rem" data-a="set-rem"' + (st.settings.reminders !== false ? ' checked' : '') + '></label>' +
          '<div id="notif-status" class="notif-status small muted">A verificar autorizações…</div>' +
          '<button class="btn sm ghost block" data-a="notif-test" style="margin:6px 0 12px">Testar lembrete (chega em 5 segundos)</button>'
        : '<p class="hint" style="margin:0 0 10px">Lembretes do Sistema no telemóvel: disponíveis na app Android (APK).</p>') +
      '<label class="row between"><span>Vibrar ao subir de nível e em vitórias</span><input type="checkbox" id="set-vib" data-a="set-vib"' + (st.settings.vibrate ? ' checked' : '') + '></label>' +
      '<div class="f" style="margin-top:12px"><span class="small muted">Animações</span><div class="seg">' +
      [['full', 'Completas'], ['reduced', 'Reduzidas']].map(function (o) { return '<button class="' + ((st.settings.fx || FX.defaultMode()) === o[0] ? 'on' : '') + '" data-a="set-fx" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') +
      '</div><div class="hint">Reduzidas: sem partículas, sem tremer o ecrã e transições mais curtas. Útil em telemóveis mais lentos.</div></div>' +
      '<div class="f" style="margin-top:12px"><span class="small muted">Conversas do Sistema</span><div class="seg">' +
      [['normal', 'Normais'], ['raro', 'Raras'], ['off', 'Desligadas']].map(function (o) { return '<button class="' + (S.talk.mode(st) === o[0] ? 'on' : '') + '" data-a="set-talk" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') +
      '</div><div class="hint">O Sistema às vezes faz-te uma pergunta, ao abrir a app ou depois de algo importante. Nunca a meio de uma batalha. Se ignorares as conversas, ele fala cada vez menos.</div></div></section>';
    h += '<section class="win danger"><div class="win-h">Zona perigosa</div><p class="small muted" style="margin-top:0">Apaga todo o progresso deste aparelho. Não há volta.</p>' +
      '<button class="btn bad block" data-a="reset">Recomeçar do zero</button></section>';
    h += '<p class="hint" style="text-align:center;margin-top:16px">Sistema v' + S.VERSION + '</p>';
    return h;
  }

  /* ================= MISSÕES ================= */
  function liveCards(st) {
    var h = '', L = S.live;
    var z = L.zone(st);
    if (z) {
      h += '<section class="win zone-win"><div class="win-h">Zona de Penalidade <small>' + cd(z.until) + '</small></div>' +
        '<p class="small" style="margin:0 0 10px;color:#ffb3bd">A mesma missão, uma vez e meia mais dura. Cumpre-a e recuperas metade do que perdeste (' + z.coins + ' moedas, ' + z.xp + ' XP). Falha, e pagas a dobrar.</p>' +
        '<div class="stack">' + z.tasks.map(function (tk) {
          var v = z.values[tk.id] || 0, step = tk.target >= 20 ? 5 : 1;
          return '<div class="task"><div><b>' + esc(tk.name) + '</b> <span class="muted mono small">' + v + ' / ' + tk.target + ' ' + esc(tk.unit) + '</span></div>' +
            '<div class="stepper"><button data-a="z-step" data-id="' + tk.id + '" data-d="-' + step + '" aria-label="Menos">−</button>' +
            '<input type="number" inputmode="decimal" min="0" value="' + v + '" data-a="z-input" data-id="' + tk.id + '" aria-label="' + esc(tk.name) + '">' +
            '<button data-a="z-step" data-id="' + tk.id + '" data-d="' + step + '" aria-label="Mais">+</button></div>' +
            '<div class="bar hp"><i style="width:' + Math.min(100, v / tk.target * 100).toFixed(0) + '%"></i></div></div>';
        }).join('') + '</div>' +
        '<button class="btn bad block" style="margin-top:12px" data-a="z-complete"' + (L.zoneAllDone(z) ? '' : ' disabled') + '>Sair da Zona de Penalidade</button></section>';
    }
    var em = L.emergency(st);
    if (em) {
      h += '<section class="win em-win"><div class="win-h">Missão de Emergência <small>' + cd(em.until) + '</small></div>' +
        '<div class="em-task">' + esc(em.text) + '</div><div class="meta"><span class="reward">+' + em.xp + ' XP · +' + em.coins + '◈ · baú possível</span></div>' +
        '<button class="btn pri block" style="margin-top:10px" data-a="e-done">Cumpri</button></section>';
    }
    var hq = L.hiddenActive(st);
    if (hq) {
      h += '<section class="win hq-win"><div class="win-h">Missão Oculta <small>' + cd(hq.until) + '</small></div>' +
        '<div class="hq-name">' + esc(hq.def.name) + '</div><div class="em-task">' + esc(hq.def.task) + '</div>' +
        '<div class="meta"><span class="reward">' + esc(hq.def.reward.map(function (id) { return S.ITEMS[id] ? (S.ITEMS[id].secret ? 'item secreto' : S.ITEMS[id].name) : id; }).join(' + ')) + '</span></div>' +
        '<button class="btn gold block" style="margin-top:10px" data-a="h-done">Cumpri</button></section>';
    }
    return h;
  }
  function missionsHtml(st) {
    var t = E.dateKey();
    var h = liveCards(st);
    if (S.time.tampered(st)) h += '<section class="win danger"><div class="win-h">Anomalia temporal</div><p class="small" style="margin:0">O relógio do teu telemóvel está atrás da hora que o Sistema já registou. As missões ficam bloqueadas até acertares a hora.</p></section>';
    // Diária
    var ds = M.dailyStatus(st);
    if (st.daily.enabled) {
      var vals = M.dailyValues(st);
      var dl = E.deadlineTs(t, st.daily.deadline);
      var dr = M.dailyReward(st);
      h += '<section class="win' + (ds === 'done' ? '' : ' gold') + '" id="daily-win"><div class="win-h">Missão diária <small>Sequência ' + st.daily.streak + '</small></div>' +
        '<div class="row between" style="margin-bottom:10px"><div><h3 style="font-size:17px">Treino do Sistema</h3>' +
        '<div class="meta"><span>até ' + st.daily.deadline + '</span>' + (ds === 'pending' ? cd(dl) : '') + '<span class="reward">+' + dr.xp + ' XP · +' + dr.coins + ' moedas · baú</span></div></div>' +
        '<button class="btn sm ghost" data-a="d-config">Editar</button></div>';
      if (ds === 'inactive') h += '<div class="empty">Começa amanhã (o horário de hoje já tinha passado).</div>';
      else if (ds === 'done') h += '<div class="row"><span class="stamp ok' + (ui.fxDaily ? ' slam' : '') + '">Concluída</span><span class="small muted">Volta amanhã. Não quebres a sequência.</span></div>';
      else if (ds === 'failed' || ds === 'expired') h += '<div class="row"><span class="stamp no">Falhada</span><span class="small muted">Penalidade aplicada. Amanhã há outra.</span></div>';
      else {
        h += '<div class="stack">' + st.daily.tasks.map(function (tk) {
          var v = vals[tk.id] || 0;
          var step = tk.target >= 20 ? 5 : 1;
          return '<div class="task"><div><b>' + esc(tk.name) + '</b> <span class="muted mono small">' + v + ' / ' + tk.target + ' ' + esc(tk.unit) + '</span></div>' +
            '<div class="stepper"><button data-a="d-step" data-id="' + tk.id + '" data-d="-' + step + '" aria-label="Menos">−</button>' +
            '<input type="number" inputmode="decimal" min="0" value="' + v + '" data-a="d-input" data-id="' + tk.id + '" aria-label="' + esc(tk.name) + '">' +
            '<button data-a="d-step" data-id="' + tk.id + '" data-d="' + step + '" aria-label="Mais">+</button></div>' +
            '<div class="bar xp"><i style="width:' + Math.min(100, v / tk.target * 100).toFixed(0) + '%"></i></div></div>';
        }).join('') + '</div>' +
          '<button class="btn pri block" style="margin-top:12px" data-a="d-complete"' + (M.dailyAllDone(st) ? '' : ' disabled') + '>Concluir missão diária</button>';
      }
      h += '</section>';
    } else {
      h += '<section class="win"><div class="win-h">Missão diária</div><div class="row between"><span class="muted small">Desativada.</span><button class="btn sm" data-a="d-config">Ativar</button></div></section>';
    }

    // Hoje
    var today = M.forDay(st, t);
    var ig = M.integrity(st), R = S.MISSION_RULES;
    h += '<section class="win"><div class="win-h">Missões de hoje <small>' + today.filter(function (x) { return x.status === 'done'; }).length + '/' + today.length + ' feitas</small></div>' +
      watchPanel(st, ig, R) +
      (S.watch.banLeft(st) > 0
        ? '<button class="btn block ban-btn" data-a="m-new" style="margin-bottom:12px">' + uiIcon('ic_lock', '', 'btn-ico') + 'Quadro fechado · <span class="mono" data-cd="' + st.watch.banUntil + '">' + cdText(st.watch.banUntil) + '</span></button>'
        : '<button class="btn pri block" data-a="m-new" style="margin-bottom:12px"' + (ig.created >= ig.maxCreate ? ' disabled' : '') + '>' + (ig.created >= ig.maxCreate ? 'Limite de missões novas atingido hoje' : '+ Nova missão') + '</button>') +
      '<div class="list">' + (today.length ? today.map(function (x) { return missionCard(st, x); }).join('') :
        '<div class="empty">Sem missões para hoje. Cria a primeira: escolhe o nome, a dificuldade, os atributos que ela treina e a hora limite.</div>') + '</div></section>';

    var up = M.upcomingOnce(st);
    if (up.length) {
      h += '<section class="win"><div class="win-h">Próximas</div><div class="list">' + up.map(function (m) {
        return '<button class="card tap" data-a="m-edit" data-id="' + m.id + '"><div class="card-h">' + diffBadge(m.difficulty) +
          '<div class="grow"><div class="card-t">' + esc(m.title) + '</div><div class="meta"><span>' + m.date.slice(8) + '/' + m.date.slice(5, 7) + ' até ' + m.deadline + '</span></div></div></div></button>';
      }).join('') + '</div></section>';
    }
    var rec = st.missions.filter(function (m) { return !m.archived && m.recur !== 'once'; });
    if (rec.length) {
      h += '<section class="win"><div class="win-h">Missões repetidas <small>' + rec.length + '</small></div><div class="list">' + rec.map(function (m) {
        var when = m.recur === 'daily' ? 'Todos os dias' : m.days.slice().sort().map(function (d) { return M.WEEKDAYS[d]; }).join(', ');
        return '<button class="card tap" data-a="m-edit" data-id="' + m.id + '"><div class="card-h">' + diffBadge(m.difficulty) +
          '<div class="grow"><div class="card-t">' + esc(m.title) + '</div><div class="meta"><span>' + when + ' · até ' + m.deadline + '</span></div></div><span class="muted">Editar</span></div></button>';
      }).join('') + '</div></section>';
    }
    var hist = M.history(st, 12);
    if (hist.length) {
      h += '<section class="win"><div class="win-h">Registo recente</div><div class="list">' + hist.map(function (x) {
        var ok = x.log.status === 'done';
        return '<div class="row between small" style="border-bottom:1px solid var(--line);padding-bottom:6px"><span class="grow" style="overflow-wrap:anywhere">' + esc(x.title) + ' <span class="faint mono">' + x.date.slice(8) + '/' + x.date.slice(5, 7) + '</span></span>' +
          '<span class="mono" style="color:' + (ok ? 'var(--good)' : 'var(--danger)') + '">' + (x.log.shielded ? 'protegida' : (x.log.xp >= 0 ? '+' : '') + x.log.xp + ' XP ' + (x.log.coins >= 0 ? '+' : '') + x.log.coins + '◈') + '</span></div>';
      }).join('') + '</div></section>';
    }
    return h;
  }
  /* Olho do Sistema: integridade, fadiga e regras */
  function watchPanel(st, ig, R) {
    var tr = S.watch.trust(st), md = S.watch.mood(st), f = S.watch.factor(st);
    return '<div class="law watch-' + md.level + '">' +
      '<div class="eye-row">' + uiIcon('ui_eye', '<span class="eye-fallback"></span>', 'eye-img') +
      '<div class="grow"><div class="eye-mood">' + esc(md.text) + '</div>' +
      '<div class="trust"><i style="width:' + tr + '%"></i></div>' +
      '<div class="eye-sub"><span>Integridade <b class="mono">' + tr + '%</b></span>' + (f < 1 ? '<span class="warn">Recompensas a ' + Math.round(f * 100) + '%</span>' : '') + '</div></div></div>' +
      (S.watch.banLeft(st) > 0 ? '<div class="law-note">Missões novas proibidas pelo Sistema até às ' + clockOf(st.watch.banUntil) + '. Podes cumprir as que já tens.</div>' : '') +
      '<div class="law-row"><span>Recompensa total</span><b class="' + (ig.done >= ig.full ? 'warn' : '') + '">' + Math.min(ig.done, ig.full) + ' / ' + ig.full + '</b>' +
      '<span>Missões novas</span><b class="' + (ig.created >= ig.maxCreate ? 'warn' : '') + '">' + ig.created + ' / ' + ig.maxCreate + '</b></div>' +
      (ig.factor < 1 ? '<div class="law-note">Fadiga do Sistema: as próximas missões de hoje dão ' + Math.round(ig.factor * 100) + '% da recompensa.</div>' : '') +
      '<details class="law-more"><summary>Lei do Sistema</summary><p>O Sistema lê tudo o que escreves e observa como cumpres as tuas missões.</p><ul>' +
      '<li><b>Missões reais.</b> Nomes sem sentido ("asdasd", "kkkk", "teste") são recusados. Insistir marca-te.</li>' +
      '<li><b>Sem missões relâmpago.</b> Criar e concluir em poucos minutos é registado. À segunda vez a recompensa cai para metade; à terceira é anulada.</li>' +
      '<li><b>Sentenças.</b> Quem insiste é castigado: moedas, XP, a Marca do Sistema, o quadro de missões fechado durante horas (mais horas quanto menor a integridade) e, nos casos graves, a perda de um nível.</li>' +
      '<li><b>Integridade.</b> Cada abuso baixa a tua integridade e, abaixo de 80%, as recompensas das missões descem. Missões legítimas e cada novo dia repõem-na aos poucos.</li>' +
      '<li><b>Fadiga.</b> As primeiras ' + R.fatigue[0][0] + ' missões concluídas em cada dia dão a recompensa toda; depois 60%, 30% e 10%.</li>' +
      '<li><b>Limite.</b> Até ' + R.newPerDay + ' missões novas por dia (as apagadas também contam).</li></ul></details></div>';
  }
  function lockText(ts) { var s = Math.max(0, Math.ceil((ts - now()) / 1000)), m = Math.floor(s / 60); return m + ':' + ('0' + (s % 60)).slice(-2); }
  function diffBadge(d) { var D = S.DIFFICULTY[d]; return '<span class="diff" style="color:' + D.color + '" title="' + D.name + '">' + D.id + '</span>'; }
  function missionCard(st, x) {
    var m = x.m, r = M.nextReward(st, m.difficulty);
    var stats = m.stats.map(function (k) { return '<span class="tag">' + S.STAT_INFO[k].short + ' +' + r.stat + '</span>'; }).join('');
    var right = '', lock = 0;
    if (x.status === 'pending') right = '<button class="btn sm pri" data-a="m-complete" data-id="' + m.id + '">Concluir</button>';
    else if (x.status === 'done' && x.log && x.log.void) right = '<span class="stamp no void">Anulada</span>';
    else if (x.status === 'done') right = '<span class="stamp ok' + (ui.fxMission === m.id ? ' slam' : '') + '">Feita</span>';
    else right = '<span class="stamp no">Falhada</span>';
    var fl = ui.fxMission === m.id;
    return '<div class="card ' + (x.status === 'done' ? 'done' : (x.status === 'pending' ? '' : 'failed')) + (fl ? ' flash' : '') + '" data-mid="' + m.id + '"><div class="card-h">' + diffBadge(m.difficulty) +
      '<div class="grow"><div class="card-t">' + esc(m.title) + '</div>' + (m.desc ? '<div class="small muted" style="overflow-wrap:anywhere">' + esc(m.desc) + '</div>' : '') + '</div>' + right + '</div>' +
      '<div class="meta"><span>até ' + m.deadline + '</span>' + (x.status === 'pending' ? cd(x.deadline) : '') +
      (x.status === 'pending' ? '<span class="reward">+' + r.xp + ' XP · +' + r.coins + '◈' + (r.factor < 1 ? ' <small>(' + Math.round(r.factor * 100) + '%)</small>' : '') + '</span>' : '') + stats +

      '<button class="btn sm ghost" style="margin-left:auto;min-height:26px" data-a="m-edit" data-id="' + m.id + '">Editar</button></div></div>';
  }

  function missionForm() {
    var f = ui.form;
    var st = E.state;
    var r = M.rewardFor(st, f.difficulty);
    var h = '<div class="sheet-h"><h2>' + (f.id ? 'Editar missão' : 'Nova missão') + '</h2><button class="btn sm ghost" data-a="close">Fechar</button></div><div class="stack">' +
      '<label class="f">Nome<input class="in" id="mf-title" maxlength="60" placeholder="Ex.: Estudar 1 hora" value="' + esc(f.title) + '" data-f="title"></label>' +
      '<label class="f">Descrição (opcional)<textarea class="in" id="mf-desc" maxlength="240" rows="2" data-f="desc" placeholder="Detalhes da missão">' + esc(f.desc) + '</textarea></label>' +
      '<div class="f"><span class="small muted">Dificuldade</span><div class="seg diffs">' + S.DIFF_ORDER.map(function (d) {
        return '<button class="' + (f.difficulty === d ? 'on' : '') + '" style="color:' + S.DIFFICULTY[d].color + '" data-a="f-set" data-k="difficulty" data-v="' + d + '">' + d + '</button>';
      }).join('') + '</div><div class="hint">' + S.DIFFICULTY[f.difficulty].name + ': <span class="reward">+' + r.xp + ' XP · +' + r.coins + ' moedas</span> · +' + r.stat + ' por atributo. Se falhares: -' + Math.round(r.coins * S.MISSION_FAIL_COIN_PCT) + ' moedas e -' + Math.round(r.xp * S.MISSION_FAIL_XP_PCT) + ' XP.</div></div>' +
      '<div class="f"><span class="small muted">Atributos que esta missão treina (até 3)</span><div class="seg">' + S.STATS.map(function (k) {
        return '<button class="' + (f.stats.indexOf(k) >= 0 ? 'on' : '') + '" data-a="f-stat" data-v="' + k + '">' + S.STAT_INFO[k].short + '</button>';
      }).join('') + '</div><div class="hint">' + (f.stats.length ? f.stats.map(function (k) { return S.STAT_INFO[k].name; }).join(', ') : 'Nenhum: só XP e moedas.') + '</div></div>' +
      '<div class="f"><span class="small muted">Repetição</span><div class="seg">' +
      [['once', 'Uma vez'], ['daily', 'Todos os dias'], ['weekly', 'Dias da semana']].map(function (o) {
        return '<button class="' + (f.recur === o[0] ? 'on' : '') + '" data-a="f-set" data-k="recur" data-v="' + o[0] + '">' + o[1] + '</button>';
      }).join('') + '</div></div>' +
      (f.recur === 'once' ? '<label class="f">Data<input class="in" type="date" id="mf-date" value="' + esc(f.date) + '" min="' + E.dateKey() + '" data-f="date"></label>' : '') +
      (f.recur === 'weekly' ? '<div class="seg">' + [1, 2, 3, 4, 5, 6, 0].map(function (d) {
        return '<button class="' + (f.days.indexOf(d) >= 0 ? 'on' : '') + '" data-a="f-day" data-v="' + d + '">' + M.WEEKDAYS[d] + '</button>';
      }).join('') + '</div>' : '') +
      '<label class="f">Horário de encerramento<input class="in" type="time" id="mf-deadline" value="' + esc(f.deadline) + '" data-f="deadline"></label>' +
      '<p class="hint law-hint">' + uiIcon('ui_eye', '', 'tag-ico') + ' O Sistema lê o que escreves e observa como concluis. Cria só tarefas reais.' + (f.id ? '' : ' Missões novas hoje: ' + M.createdToday(st) + ' / ' + S.MISSION_RULES.newPerDay + '.') + '</p>' +
      '<button class="btn pri block" data-a="m-save">' + (f.id ? 'Guardar alterações' : 'Criar missão') + '</button>' +
      (f.id ? '<button class="btn bad block" data-a="m-delete">Apagar missão</button>' : '') + '</div>';
    return h;
  }
  function openMissionForm(id) {
    var m = id ? M.byId(id) : null;
    var nextHour = new Date(now() + 3 * 3600000);
    var dl = m ? m.deadline : ((nextHour.getHours() < 10 ? '0' : '') + nextHour.getHours() + ':00');
    if (!m && E.dateKey(nextHour.getTime()) !== E.dateKey()) dl = '23:59';
    ui.form = m ? { id: m.id, title: m.title, desc: m.desc, difficulty: m.difficulty, stats: m.stats.slice(), recur: m.recur, days: m.days.slice(), date: m.date || E.dateKey(), deadline: m.deadline }
      : { id: null, title: '', desc: '', difficulty: 'C', stats: [], recur: 'once', days: [1, 2, 3, 4, 5], date: E.dateKey(), deadline: dl };
    ui.modal = { type: 'mission' };
    render();
    setTimeout(function () { var el = document.getElementById('mf-title'); if (el && !m) el.focus(); }, 50);
  }

  function dailyForm() {
    var f = ui.form;
    return '<div class="sheet-h"><h2>Missão diária</h2><button class="btn sm ghost" data-a="close">Fechar</button></div><div class="stack">' +
      '<label class="row between"><span>Ativa</span><input type="checkbox" id="df-enabled" data-a="df-enabled"' + (f.enabled ? ' checked' : '') + '></label>' +
      '<label class="f">Horário de encerramento<input class="in" type="time" id="df-deadline" value="' + esc(f.deadline) + '" data-f="deadline"></label>' +
      '<div class="small muted">Tarefas (o objetivo de cada uma)</div>' +
      f.tasks.map(function (tk, i) {
        return '<div class="row"><input class="in grow" id="df-n' + i + '" maxlength="40" value="' + esc(tk.name) + '" data-f="task-name" data-i="' + i + '" aria-label="Nome da tarefa">' +
          '<input class="in" style="width:80px" id="df-t' + i + '" type="number" min="1" value="' + tk.target + '" data-f="task-target" data-i="' + i + '" aria-label="Objetivo">' +
          '<input class="in" style="width:64px" id="df-u' + i + '" maxlength="10" value="' + esc(tk.unit) + '" data-f="task-unit" data-i="' + i + '" aria-label="Unidade">' +
          '<button class="btn icon bad" data-a="df-del" data-i="' + i + '" aria-label="Remover">×</button></div>';
      }).join('') +
      (f.tasks.length < 8 ? '<button class="btn ghost" data-a="df-add">+ Adicionar tarefa</button>' : '') +
      '<p class="hint" style="margin:0">Se falhares a diária: perdes moedas e XP, a sequência volta a 0 e ficas Exausto durante 12h (-20% XP). Cada 7 dias seguidos dão um Baú Raro.</p>' +
      '<button class="btn pri block" data-a="df-save">Guardar</button></div>';
  }

  /* ================= COMBATE ================= */
  function hpPanel(st) {
    var max = E.combatStats(st).maxHp, cur = E.curHp(st), low = cur < max * 0.5;
    var pots = ['po_vida1', 'po_vida2', 'po_vida3', 'po_restaura', 'po_fenix'].reduce(function (n, id) { return n + E.count(st, id); }, 0);
    return '<section class="win' + (low ? ' danger' : '') + '"><div class="win-h">Vida atual<small>' + pots + ' poções de vida na bolsa</small></div>' +
      bar('hp', cur, max, 'Vida', 'cb-hp') +
      '<p class="hint" style="margin:8px 0 0">' + (cur >= max ? 'Vida cheia.' : 'A vida não recupera sozinha durante o dia: bebe poções de vida na Bolsa. À meia-noite o Sistema restaura tudo.') + '</p>' +
      (cur < max && pots ? '<button class="btn sm' + (low ? ' pri' : '') + '" style="margin-top:8px" data-a="tab" data-t="bolsa">Abrir a Bolsa</button>' : '') +
      (cur < max && !pots ? '<button class="btn sm gold" style="margin-top:8px" data-a="go-potions">Comprar poções</button>' : '') + '</section>';
  }
  function combatHtml(st) {
    if (st.battle) return battleHtml(st);
    var hpHtml = hpPanel(st);
    var gates = S.GATES.slice();
    var secretOn = S.SECRET_BOSSES.some(function (b) { return C.bossUnlocked(st, b); });
    var h = hpHtml + '<div class="chips" style="margin-top:14px">' + gates.map(function (g) {
      var k = S.BOSSES.filter(function (b) { return b.gate === g.id && st.defeated[b.id]; }).length;
      return '<button class="chip' + (ui.gate === g.id ? ' on' : '') + '" data-a="gate" data-g="' + g.id + '">' + uiIcon('gate_' + g.id, g.icon) + ' ' + g.id + (k === 10 ? ' ✓' : '') + '</button>';
    }).join('') + (secretOn ? '<button class="chip' + (ui.gate === 0 ? ' on' : '') + '" data-a="gate" data-g="0">' + uiIcon('gate_0', '🗝️') + ' Oculto</button>' : '') + '</div>';
    var list, gname, gcolor;
    if (ui.gate === 0) { list = S.SECRET_BOSSES.filter(function (b) { return C.bossUnlocked(st, b); }); gname = 'Portões Ocultos'; gcolor = 'var(--gold)'; }
    else { var g = S.GATES[ui.gate - 1]; list = S.BOSSES.filter(function (b) { return b.gate === g.id; }); gname = g.name; gcolor = g.color; }
    var killed = list.filter(function (b) { return st.defeated[b.id]; }).length;
    h += '<section class="win"><div class="win-h"><span style="color:' + gcolor + '">' + uiIcon('gate_' + ui.gate, '', 'gate-head') + esc(gname) + '</span><small>' + killed + '/' + list.length + ' derrotados</small></div>' +
      '<p class="hint" style="margin-top:0">Todos os chefes estão disponíveis. Cada um tem o seu nível: lutar acima do teu nível é muito mais perigoso. Os chefes derrotados não voltam.</p>' +
      '<div class="boss-grid">' + list.map(function (b) {
        var dead = st.defeated[b.id];
        var dg = C.danger(st, b);
        var art = S.BOSS_ART && S.BOSS_ART[b.id];
        return '<button class="boss-tile card' + (dead ? ' done' : '') + (b.king ? ' king' : '') + '" data-a="boss" data-id="' + b.id + '" style="--dg:' + (dead ? 'var(--good)' : dg.color) + '">' +
          (art ? '<img src="' + art + '" alt="" loading="lazy">' : '<span class="bt-ico">' + b.icon + '</span>') +
          '<span class="bt-lv mono">' + b.level + '</span>' + (b.king ? '<span class="bt-crown">' + uiIcon('ui_king', '♛', 'crown-img') + '</span>' : '') +
          '<span class="bt-info"><span class="bt-name">' + esc(b.name) + '</span><span class="bt-dg">' + (dead ? 'Derrotado' : dg.label) + '</span></span></button>';
      }).join('') + '</div></section>';
    return h;
  }
  function bossArt(b, cls, id) {
    var src = S.BOSS_ART && S.BOSS_ART[b.id];
    var ida = id ? ' id="' + id + '"' : '';
    if (!src) return '<div class="' + cls + '"' + ida + '>' + b.icon + '</div>';
    return '<div class="' + cls + ' has-art"' + ida + '><img src="' + src + '" alt="' + esc(b.name) + '" loading="lazy" onerror="this.parentNode.classList.remove(\'has-art\');this.replaceWith(document.createTextNode(\'' + b.icon + '\'))"></div>';
  }
  function bossModal(id) {
    var st = E.state, b = S.BOSS_BY_ID[id];
    var bs = C.bossStats(st, b), r = C.rewards(st, b), dg = C.danger(st, b), dead = st.defeated[b.id];
    var pr = C.pressure(b.level - st.level);
    var drops = ['+1 ' + S.ITEMS['bau_' + r.chest].name];
    if (r.special) (r.special.items || []).forEach(function (x) { drops.push('+1 ' + (st.seen[x] || !S.ITEMS[x].secret ? S.ITEMS[x].name : 'Item secreto')); });
    if (r.special && r.special.skill) drops.push('Habilidade secreta');
    return '<div class="sheet-h"><h2>' + esc(b.name) + '</h2><button class="btn sm ghost" data-a="close">Fechar</button></div>' +
      (S.BOSS_ART && S.BOSS_ART[b.id] ? '<div class="boss-hero">' + bossArt(b, 'boss-hero-img') + '</div>' : '') +
      '<div class="row" style="align-items:flex-start">' + (S.BOSS_ART && S.BOSS_ART[b.id] ? '' : '<div class="ico big">' + b.icon + '</div>') + '<div class="grow"><div class="meta"><span class="mono">Nível ' + b.level + '</span><span>' + S.ARCHETYPES[b.arch].name + '</span>' +
      (b.king ? '<span class="tag" style="color:var(--gold)">Rei do portão: 2 fases</span>' : '') + '</div>' +
      (b.lore ? '<p class="small muted" style="font-style:italic;margin:6px 0 0">«' + esc(b.lore) + '»</p>' : '') + '</div></div>' +
      '<div class="chronicle"><div class="info-h">Crónica</div>' + loreHtml(S.lore.bossText(b), 'boss-lore') +
      (S.lore.gateText(b) ? '<details class="gate-lore"><summary>' + (b.gate ? 'Sobre o portão: ' + esc((S.GATES[b.gate - 1] || {}).name || '') : 'Sobre os portões ocultos') + '</summary>' + loreHtml(S.lore.gateText(b)) + '</details>' : '') + '</div>' +
      '<div class="kv" style="margin-top:12px"><div><span class="muted">Vida</span><b>' + fmt(bs.maxHp) + '</b></div><div><span class="muted">Ataque</span><b>' + fmt(bs.atk) + '</b></div>' +
      '<div><span class="muted">Defesa</span><b>' + fmt(bs.def) + '</b></div><div><span class="muted">Perigo</span><b style="color:' + dg.color + '">' + dg.label + '</b></div></div>' +
      (b.level > st.level + 2 ? '<p class="small" style="color:var(--warn)">Pressão de nível: o teu dano -' + Math.round((1 - pr.playerDmg) * 100) + '%, o dano dele +' + Math.round((pr.bossDmg - 1) * 100) + '%.</p>' : '') +
      (b.level < st.level - 2 ? '<p class="small" style="color:var(--good)">Vantagem de nível: o teu dano +' + Math.round((pr.playerDmg - 1) * 100) + '%, o dano dele -' + Math.round((1 - pr.bossDmg) * 100) + '%.</p>' : '') +
      '<div class="info-sec" style="margin-top:12px"><div class="info-h">Estilo de combate: ' + esc(S.ARCHETYPES[b.arch].name) + '</div><p class="small muted" style="margin:0 0 6px">' + esc(S.lore.archText(b.arch)) + '</p>' +
        b.skills.map(function (k) { return '<div class="info-r col"><span>' + esc(S.BOSS_SKILLS[k].name) + '</span><b>' + esc(S.lore.bossSkillText(k)) + '</b></div>'; }).join('') + '</div>' +
      (S.time.bossEmpowered(b) ? '<p class="small" style="color:var(--warn)">' + (S.time.bossEmpowered(b) === 'noite' ? phaseIcon('noite', 'tag-ico') + ' À noite' : phaseIcon('dia', 'tag-ico') + ' De dia') + ' este chefe fica +15% mais forte, mas dá +20% de recompensas.</p>' : (S.time.BOSS_PHASES[b.gate] ? '<p class="hint">' + (S.time.BOSS_PHASES[b.gate] === 'noite' ? phaseIcon('noite', 'tag-ico') + ' À noite' : phaseIcon('dia', 'tag-ico') + ' De dia') + ' este portão fica mais forte e dá mais recompensas.</p>' : '')) +
      '<div class="card" style="margin-top:12px"><div class="small muted">Recompensas</div><div class="reward">+' + fmt(r.xp) + ' XP · +' + fmt(r.coins) + ' moedas</div><div class="small">' + drops.map(esc).join(' · ') + '</div></div>' +
      (function () { var mx = E.combatStats(st).maxHp, cu = E.curHp(st);
        return '<div style="margin-top:10px">' + bar('hp', cu, mx, 'A tua vida ao entrar') + '</div>' + (cu < mx * 0.5 ? '<p class="small" style="color:var(--warn)">Estás com pouca vida. Bebe uma poção antes de entrar.</p>' : ''); })() +
      '<p class="hint">Se morreres, desces um nível e o Sistema reanima-te com ' + C.REVIVE_PCT + '% da vida. A vida só recupera com poções ou à meia-noite, quando o Sistema restaura vida e mana. Fuga: perdes 5% das moedas (sem perdas com Pó de Fumo).</p>' +
      (dead ? '<div class="empty">Derrotado em ' + timeStr(dead) + '. Não volta.</div>' : '<button class="btn pri block" data-a="fight" data-id="' + b.id + '">Entrar no portão</button>');
  }
  function statusTags(list, isBoss) {
    return list.map(function (s) {
      var good = isBoss ? s.kind !== 'buff' : s.kind === 'buff';
      var name = s.kind === 'dot' ? C.DOT_NAMES[s.type] : C.BUFF_NAMES[s.key];
      var val = s.kind === 'dot' ? s.val + '/t' : (s.kind === 'debuff' ? '-' : '+') + s.val + '%';
      return '<span class="tag ' + (good ? 'good' : 'bad') + '">' + esc(name) + ' ' + val + ' · ' + s.turns + 't</span>';
    }).join('');
  }
  /* balão de fala do chefe: provocação no início, últimas palavras na vitória */
  function bossSpeech(bt, b) {
    var lines = (S.BOSS_LINES || {})[b.id];
    if (!lines) return '';
    var txt = null, cls = '';
    if (bt.over === 'win') { txt = lines[1]; cls = ' last'; }
    else if (!bt.over && bt.turn <= 2) txt = lines[0];
    if (!txt) return '';
    var key = bt.bossId + (bt.over === 'win' ? ':last' : ':intro');
    var fresh = ui.lastSpeech !== key;
    ui.lastSpeech = key;
    return '<div class="speech' + cls + (fresh ? ' fresh' : '') + '"><span class="speech-name">' + esc(b.name) + '</span><span class="speech-txt">«' + esc(txt) + '»</span></div>';
  }
  function battleHtml(st) {
    var bt = st.battle, b = S.BOSS_BY_ID[bt.bossId], p = bt.p;
    var bossCls = ui.spawn ? ' spawn' : (bt.over === 'win' && !ui.victoryAnim ? ' dead' : '');
    var auraC = b.king ? 'rgba(255,176,46,.55)' : 'rgba(255,60,90,.5)';
    var h = '<div class="battle">';
    h += '<section class="win danger boss-panel phase-' + bt.phase + '"><div class="win-h"><span>' + esc(b.name) + '</span><small>Nv ' + b.level + ' · turno ' + bt.turn + (bt.phase > 1 ? ' · fase ' + bt.phase : '') + '</small></div>' +
      '<div class="boss-wrap"><div class="boss-aura" style="--c:' + auraC + '"></div>' + bossArt(b, 'boss-ico' + bossCls, 'boss-ico') + '</div>' + bossSpeech(bt, b) +
      '<div style="margin-top:8px">' + bar('boss', bt.b.hp, bt.b.maxHp, 'Vida' + (bt.b.shield ? ' · escudo ' + fmt(bt.b.shield) : ''), 'boss-' + bt.bossId + '-' + bt.started) + '</div>' +
      '<div class="statuses" style="margin-top:6px">' + statusTags(bt.b.st, true) + (bt.b.stunned ? '<span class="tag good">atordoado</span>' : '') + '</div></section>';
    h += '<div class="log" id="blog" aria-live="polite">' + bt.log.map(function (l) { return '<div class="' + l.c + '">' + logLine(l.t) + '</div>'; }).join('') + '</div>';
    h += '<section class="win ppanel" id="ppanel" style="margin-top:10px"><div class="win-h"><span>' + esc(st.name) + '</span><small>' + (bt.summons.length ? bt.summons.map(function (s) { return esc(s.name) + ' ' + s.turns + 't'; }).join(' · ') : 'sem invocações') + '</small></div>' +
      '<div class="stack" style="gap:6px">' + bar('hp', p.hp, p.maxHp, 'Vida' + (p.shield ? ' · escudo ' + fmt(p.shield) : ''), 'php-' + bt.started, true) + bar('mp', p.mp, p.maxMp, 'Mana', 'pmp-' + bt.started, true) + '</div>' +
      '<div class="statuses" style="margin-top:6px;justify-content:flex-start">' + statusTags(p.st, false) + (p.stunned ? '<span class="tag bad">atordoado</span>' : '') + '</div>';
    if (bt.over) {
      var r = bt.result || {};
      var title = bt.over === 'win' ? 'Vitória' : (bt.over === 'lose' ? 'Derrota' : 'Fuga');
      h += '<div class="card" style="margin-top:10px;text-align:center"><h3 style="color:' + (bt.over === 'win' ? 'var(--gold)' : 'var(--danger)') + '">' + title + '</h3>' +
        (r.xp ? '<div class="reward">+' + fmt(r.xp) + ' XP · +' + fmt(r.coins) + ' moedas</div>' : '') +
        (r.coins < 0 ? '<div class="mono" style="color:var(--danger)">' + fmt(r.coins) + ' moedas</div>' : '') +
        (r.levelFrom ? '<div class="mono" style="color:var(--danger)">' + (r.level < r.levelFrom ? 'Nível ' + r.levelFrom + ' → ' + r.level : 'XP do nível perdido') + '</div>' : '') +
        (r.items ? '<div class="small">' + r.items.map(function (x) { return esc(S.ITEMS[x].name); }).join(' · ') + '</div>' : '') +
        (r.trophy ? '<div class="trophy-won">' + (trophyArt(b) ? '<img class="trophy-img" src="' + trophyArt(b) + '" alt="">' : '🏆 ') + 'Troféu: ' + esc(r.trophy) + '</div>' : '') +
        '<button class="btn pri block" style="margin-top:10px" data-a="b-close">Sair do portão</button></div>';
    } else if (p.stunned > 0) {
      h += '<div class="actions' + busyCls() + '" style="margin-top:10px"><button class="btn pri" style="grid-column:1/-1" data-a="b-pass">Atordoado: passar o turno</button><button class="btn bad" style="grid-column:1/-1" data-a="b-flee">Fugir</button></div>';
    } else {
      h += '<div class="actions' + busyCls() + '" style="margin-top:10px">' +
        '<button class="btn pri" data-a="b-attack">Atacar</button>' +
        '<button class="btn" data-a="b-sheet" data-v="skills">Habilidades</button>' +
        '<button class="btn" data-a="b-sheet" data-v="items">Itens</button>' +
        '<button class="btn" data-a="b-defend">Defender</button>' +
        '<button class="btn bad" style="grid-column:1/-1" data-a="b-flee">Fugir</button></div>';
    }
    h += '</section></div>';
    return h;
  }
  function battleSheet() {
    var st = E.state, bt = st.battle, p = bt.p;
    if (ui.modal.v === 'skills') {
      var sk = C.unlockedActiveSkills(st);
      return '<div class="sheet-h"><h2>Habilidades</h2><button class="btn sm ghost" data-a="close">Fechar</button></div><div class="skill-grid">' +
        sk.map(function (s) {
          var cdv = p.cds[s.id] || 0;
          var dis = cdv > 0 || p.mp < s.mp;
          return '<button class="skill-btn' + (S.SKILL_ART && S.SKILL_ART[s.id] ? ' has-ico' : '') + '" data-a="b-skill" data-id="' + s.id + '"' + (dis ? ' disabled' : '') + '>' + tapInfo(skillIco(s, 'sk-b'), 'skill', s.id) + '<b>' + esc(s.name) + '</b>' +
            '<span class="mono small" style="color:var(--glow)">' + (cdv > 0 ? 'recarga ' + cdv : s.mp + ' MP') + '</span><small>' + esc(s.desc) + '</small></button>';
        }).join('') + '</div>';
    }
    var items = Object.keys(st.inv).filter(function (id) { return S.ITEMS[id] && S.ITEMS[id].battle; });
    var used = bt.healsUsed || 0, lim = C.HEAL_LIMIT;
    return '<div class="sheet-h"><h2>Itens</h2><button class="btn sm ghost" data-a="close">Fechar</button></div>' +
      '<p class="hint" style="margin:-4px 0 10px">Poções de cura nesta batalha: <b class="mono">' + used + ' / ' + lim + '</b></p><div class="skill-grid">' +
      (items.length ? items.map(function (id) {
        var it = S.ITEMS[id];
        var heal = it.use.type === 'heal' || it.use.type === 'restore';
        var dis = (heal && used >= lim) || !S.time.itemActive(it);
        return '<button class="skill-btn" data-a="b-item" data-id="' + id + '"' + (dis ? ' disabled' : '') + '><b>' + tapInfo(itemTiny(it), 'item', id) + ' ' + esc(it.name) + '</b><span class="mono small">×' + st.inv[id] + '</span><small>' + esc(it.desc) + (it.phase && !S.time.itemActive(it) ? ' — inativo agora' : '') + '</small></button>';
      }).join('') : '<div class="empty">Sem itens de combate. Compra poções na Loja.</div>') + '</div>';
  }

  /* ================= LOJA ================= */
  function shopHtml(st) {
    var h = '<div class="chips" style="margin-top:14px">' + S.SHOP_TABS.map(function (t) {
      return '<button class="chip' + (ui.shopTab === t.id ? ' on' : '') + '" data-a="shop-tab" data-v="' + t.id + '">' + uiIcon('tab_' + t.id, t.icon) + ' ' + t.name + '</button>';
    }).join('') + '</div>';
    var list = E.shopList(st, ui.shopTab);
    var tab = S.SHOP_TABS.filter(function (t) { return t.id === ui.shopTab; })[0];
    h += '<section class="win"><div class="win-h">' + tab.name + coins(st.coins) + '</div>';
    if (ui.shopTab === 'lazer') h += '<p class="hint" style="margin-top:0">Recompensas para a vida real. Compra com as moedas que ganhas nas missões e usa-as na Bolsa quando quiseres.</p><button class="btn gold block" data-a="cl-new" style="margin-bottom:10px">+ Criar a minha recompensa</button>';
    if (ui.shopTab === 'atributo') h += '<p class="hint" style="margin-top:0">Melhorias permanentes. Os elixires ficam mais caros a cada compra.</p>';
    var rows = list.map(function (it) { return { it: it, rq: it.custom ? { ok: true, lines: [] } : E.reqStatus(st, it) }; });
    var open = rows.filter(function (x) { return x.rq.ok; }), locked = rows.filter(function (x) { return !x.rq.ok; });
    var card = function (x) {
      var it = x.it, rq = x.rq;
      var price = E.price(st, it.id);
      var can = rq.ok && st.coins >= price;
      var own = E.count(st, it.id) + Object.keys(st.equip).filter(function (k) { return st.equip[k] === it.id; }).length;
      var reqHtml = rq.lines.filter(function (l) { return !(l.ok && /^Nível/.test(l.text)); }).map(function (l) {
        return '<span class="req ' + (l.ok ? 'ok' : 'no') + '">' + (l.ok ? '✓ ' : uiIcon('ic_lock', '🔒', 'req-ico') + ' ') + esc(l.text) + '</span>';
      }).join('');
      return '<div class="card shop-card' + (rq.ok ? '' : ' locked') + '"><div class="card-h">' + (it.custom ? itemIco(it) : tapInfo(itemIco(it), 'item', it.id)) + '<div class="grow">' +
        '<div class="card-t" style="color:' + rc(it.rarity) + '">' + esc(it.name) + '</div>' +
        '<div class="small muted">' + esc(it.desc) + '</div>' + (it.equip ? '<div class="meta">' + equipSummary(it) + '</div>' : '') +
        '<div class="meta"><span class="tag" style="color:' + rc(it.rarity) + '">' + (it.custom ? 'Personalizada' : S.RARITY[it.rarity].name) + '</span>' + phaseTag(it) +
        (it.lvl > 1 && st.level >= it.lvl ? '<span class="tag">Nv ' + it.lvl + '</span>' : '') + (own ? '<span class="tag">Tens ' + own + '</span>' : '') + '</div>' +
        (reqHtml ? '<div class="reqs">' + reqHtml + '</div>' : '') + '</div></div>' +
        '<div class="row between">' + coins(price) + '<div class="row">' +
        (it.custom ? '<button class="btn sm ghost" data-a="cl-del" data-id="' + it.id + '">Remover</button>' : '') +
        (it.cat === 'consumivel' && rq.ok ? '<button class="btn sm" data-a="buy" data-id="' + it.id + '" data-q="5"' + (st.coins >= price * 5 ? '' : ' disabled') + '>×5</button>' : '') +
        (rq.ok ? '<button class="btn sm ' + (can ? 'gold' : '') + '" data-a="buy" data-id="' + it.id + '" data-q="1"' + (can ? '' : ' disabled') + '>Comprar</button>'
          : '<span class="tag locked-tag">Bloqueado</span>') + '</div></div></div>';
    };
    h += '<div class="shop-count small muted">' + open.length + ' disponíveis · ' + locked.length + ' bloqueados</div>';
    h += '<div class="list">' + open.map(card).join('') + (open.length ? '' : '<div class="empty">Nada disponível ainda nesta categoria. Sobe de nível e derrota chefes para desbloquear.</div>') + '</div>';
    if (locked.length) {
      h += '<button class="btn block ghost" style="margin-top:12px" data-a="shop-locked">' + (ui.showLocked ? 'Esconder bloqueados' : 'Ver ' + locked.length + ' itens bloqueados e como os desbloquear') + '</button>';
      if (ui.showLocked) h += '<div class="list" style="margin-top:10px">' + locked.map(card).join('') + '</div>';
    }
    h += '</section>';
    return h;
  }
  function leisureForm() {
    var f = ui.form;
    return '<div class="sheet-h"><h2>Nova recompensa</h2><button class="btn sm ghost" data-a="close">Fechar</button></div><div class="stack">' +
      '<label class="f">Nome<input class="in" id="cl-name" maxlength="40" placeholder="Ex.: Pizza ao sábado" value="' + esc(f.name) + '" data-f="name"></label>' +
      '<label class="f">Preço em moedas<input class="in" id="cl-price" type="number" min="10" max="100000" value="' + esc(f.price) + '" data-f="price"></label>' +
      '<div class="f"><span class="small muted">Ícone</span><div class="seg">' + ['🎁', '🍕', '🎮', '🎬', '🛍️', '🏖️', '🍦', '📱'].map(function (i) {
        return '<button class="' + (f.icon === i ? 'on' : '') + '" data-a="f-set" data-k="icon" data-v="' + i + '">' + customIcon(i, 'pick-img') + '</button>';
      }).join('') + '</div></div>' +
      '<button class="btn pri block" data-a="cl-save">Criar recompensa</button></div>';
  }

  /* ================= BOLSA ================= */
  var BAG_FILTERS = [['tudo', 'Tudo'], ['equip', 'Equipamento'], ['consumivel', 'Poções'], ['bau', 'Baús'], ['lazer', 'Lazer'], ['atributo', 'Atributos'], ['secreto', 'Secretos']];
  function bagMatch(it, f) {
    if (f === 'tudo') return true;
    if (f === 'equip') return !!it.equip;
    if (f === 'secreto') return !!it.secret;
    return it.cat === f;
  }
  function bagHtml(st) {
    var h = '<div class="chips" style="margin-top:14px">' + BAG_FILTERS.map(function (f) {
      return '<button class="chip' + (ui.bag === f[0] ? ' on' : '') + '" data-a="bag" data-v="' + f[0] + '">' + uiIcon({ tudo: 'bag_tudo', equip: 'bag_equip', secreto: 'bag_secreto' }[f[0]] || 'tab_' + f[0], '') + f[1] + '</button>';
    }).join('') + '</div>';
    var ids = Object.keys(st.inv).filter(function (id) { var it = E.item(id); return it && bagMatch(it, ui.bag); })
      .sort(function (a, b) { var A = E.item(a), B = E.item(b); return (A.cat === 'bau' ? -1 : 0) - (B.cat === 'bau' ? -1 : 0) || S.RARITY[B.rarity].order - S.RARITY[A.rarity].order || A.name.localeCompare(B.name); });
    h += '<section class="win"><div class="win-h">Bolsa <small>' + ids.length + ' itens</small></div><div class="list">' +
      (ids.length ? ids.map(function (id) {
        var it = E.item(id);
        return '<button class="card tap" data-a="item" data-id="' + id + '"><div class="card-h">' + itemIco(it) + '<div class="grow">' +
          '<div class="card-t" style="color:' + rc(it.rarity) + '">' + esc(it.name) + '</div><div class="small muted">' + esc(it.desc) + '</div></div>' +
          '<span class="mono">×' + st.inv[id] + '</span></div></button>';
      }).join('') : '<div class="empty">Nada aqui. Ganha baús nas missões diárias e nos chefes, ou compra na Loja.</div>') + '</div></section>';
    return h;
  }
  function itemModal(id) {
    var st = E.state, it = E.item(id);
    if (!it) return '';
    var n = E.count(st, id);
    var sv = E.sellValue(st, id);
    var btns = [];
    if (it.cat === 'bau' && n) btns.push('<button class="btn pri block" data-a="use" data-id="' + id + '">Abrir baú</button>');
    else if (it.field && n) btns.push('<button class="btn pri block" data-a="use" data-id="' + id + '">' + (it.cat === 'lazer' ? 'Usar recompensa' : 'Usar') + '</button>');
    if (it.equip && n) {
      if (it.equip.slot === 'acc') btns.push('<div class="row"><button class="btn pri grow" data-a="equip" data-id="' + id + '" data-s="acc1">Equipar no espaço 1</button><button class="btn pri grow" data-a="equip" data-id="' + id + '" data-s="acc2">No espaço 2</button></div>');
      else btns.push('<button class="btn pri block" data-a="equip" data-id="' + id + '">Equipar</button>');
    }
    if (it.battle && !it.field) btns.push('<p class="hint">Usa este item durante uma batalha, no botão Itens.</p>');
    if (it.use && (it.use.type === 'penaltyShield' || it.use.type === 'revive')) btns.push('<p class="hint">Funciona sozinho enquanto estiver na bolsa.</p>');
    if (sv && n) btns.push('<button class="btn bad block" data-a="sell" data-id="' + id + '">Vender por ' + fmt(sv) + ' moedas</button>');
    var reqs = [];
    if (it.lvl > 1) reqs.push('Nível ' + it.lvl);
    if (it.cls) reqs.push(it.cls.map(function (c) { return S.CLASSES[c].name; }).join(', '));
    var m = ui.modal || {};
    if (m.type === 'info' && ui.tab === 'loja' && !n && it.price && !it.secret) {
      var rq = E.reqStatus(st, it), pr = E.price(st, id);
      if (rq.ok && E.canEquipClass(st, it)) btns.push('<button class="btn gold block" data-a="buy" data-id="' + id + '" data-q="1"' + (st.coins >= pr ? '' : ' disabled') + '>Comprar por ' + fmt(pr) + ' moedas</button>');
    }
    var big = artId(it.id);
    return '<div class="sheet-h"><h2 style="color:' + rc(it.rarity) + '">' + esc(it.name) + '</h2>' + backOrClose(m) + '</div>' +
      (big ? '<div class="info-img item-big" style="--rc:' + rc(it.rarity) + '"><img src="' + big + '" alt=""></div>' : '') +
      '<div class="row" style="align-items:flex-start">' + (big ? '' : itemIco(it, 'big')) + '<div class="grow"><div class="small">' + esc(it.desc) + '</div>' +
      (it.equip ? '<div class="meta" style="margin-top:6px">' + equipSummary(it) + '</div>' : '') +
      '<div class="meta" style="margin-top:6px"><span class="tag" style="color:' + rc(it.rarity) + '">' + (S.RARITY[it.rarity] || {}).name + '</span>' + (reqs.length ? '<span class="tag">' + reqs.join(' · ') + '</span>' : '') + '<span class="tag">Tens ' + n + '</span>' + phaseTag(it) + '</div></div></div>' +
      '<div class="stack" style="margin-top:14px">' + btns.join('') + '</div>' +
      loreHtml(S.lore.itemText(it)) + (it.custom ? '' : infoSecs(S.lore.itemSections(it, st)));
  }
  function slotModal(slot) {
    var st = E.state;
    var cur = st.equip[slot];
    var cands = Object.keys(st.inv).filter(function (id) {
      var it = E.item(id);
      if (!it || !it.equip) return false;
      var s = it.equip.slot;
      return slot === 'weapon' ? s === 'weapon' : slot === 'armor' ? s === 'armor' : s === 'acc';
    });
    var names = { weapon: 'Arma', armor: 'Armadura', acc1: 'Acessório 1', acc2: 'Acessório 2' };
    return '<div class="sheet-h"><h2>' + names[slot] + '</h2><button class="btn sm ghost" data-a="close">Fechar</button></div><div class="list">' +
      (cur ? '<div class="card"><div class="card-h">' + tapInfo(itemIco(E.item(cur)), 'item', cur) + '<div class="grow"><div class="hint">Equipado</div><div class="card-t">' + esc(E.item(cur).name) + '</div><div class="meta">' + equipSummary(E.item(cur)) + '</div></div>' +
        '<button class="btn sm ghost" data-a="unequip" data-s="' + slot + '">Tirar</button></div></div>' : '') +
      (cands.length ? cands.map(function (id) {
        var it = E.item(id);
        var ok = st.level >= it.lvl && E.canEquipClass(st, it);
        return '<div class="card"><div class="card-h">' + tapInfo(itemIco(it), 'item', id) + '<div class="grow"><div class="card-t" style="color:' + rc(it.rarity) + '">' + esc(it.name) + '</div><div class="meta">' + equipSummary(it) + '</div>' +
          (ok ? '' : '<div class="small" style="color:var(--danger)">Precisas de nível ' + it.lvl + (E.canEquipClass(st, it) ? '' : ' e outra classe') + '</div>') + '</div>' +
          '<button class="btn sm pri" data-a="equip" data-id="' + id + '" data-s="' + slot + '"' + (ok ? '' : ' disabled') + '>Equipar</button></div></div>';
      }).join('') : '<div class="empty">Não tens itens para este espaço. Vê a Loja.</div>') + '</div>';
  }

  /* ================= MODAIS E POPUPS ================= */
  function modalHtml() {
    var m = ui.modal;
    if (!m) return '';
    var inner = '';
    if (m.type === 'confirm') {
      inner = '<div class="sheet-h"><h2>' + esc(m.title) + '</h2></div><p class="small" style="white-space:pre-line">' + esc(m.text) + '</p>' +
        (m.typed ? '<label class="f">Escreve <b>' + esc(m.typed) + '</b> para confirmar<input class="in" id="cf-typed" autocomplete="off"></label>' : '') +
        '<div class="row" style="margin-top:12px"><button class="btn ghost grow" data-a="close">Cancelar</button><button class="btn grow ' + (m.bad ? 'bad' : 'pri') + '" data-a="confirm-yes">' + esc(m.yes || 'Confirmar') + '</button></div>';
    } else if (m.type === 'mission') inner = missionForm();
    else if (m.type === 'daily') inner = dailyForm();
    else if (m.type === 'boss') inner = bossModal(m.id);
    else if (m.type === 'item') inner = itemModal(m.id);
    else if (m.type === 'info') inner = m.k === 'skill' ? skillInfoModal(m) : (m.k === 'trophy' ? trophyInfoModal(m) : itemModal(m.id));
    else if (m.type === 'slot') inner = slotModal(m.slot);
    else if (m.type === 'bsheet') inner = battleSheet();
    else if (m.type === 'leisure') inner = leisureForm();
    var fresh = ui.modal !== ui.shownModal;
    return '<div class="overlay' + (fresh ? ' fresh' : '') + '" data-a="overlay"><div class="sheet' + (fresh ? ' fresh' : '') + '" role="dialog" aria-modal="true">' + inner + '</div></div>';
  }
  function topRarity(ids) {
    var best = 'comum';
    (ids || []).forEach(function (id) { var it = S.ITEMS[id]; if (it && S.RARITY[it.rarity].order > S.RARITY[best].order) best = it.rarity; });
    return best;
  }
  function popupHtml() {
    var ev = ui.popups[0];
    if (!ev || Date.now() < ui.holdUntil) return '';
    var fresh = ev._id !== ui.shownPop;
    var cls = '', tag = 'SISTEMA', body = '', extra = '';
    var li = function (l, i, style) { return '<li style="--k:' + i + (style ? ';' + style : '') + '">' + l + '</li>'; };
    var lines = (ev.lines || []).map(function (l, i) { return li(esc(l), i); }).join('');
    var nLines = (ev.lines || []).length;
    if (ev.type === 'levelup') {
      cls = 'gold lvl'; extra = '<div class="rays"></div>';
      var ls = ['+' + S.POINTS_PER_LEVEL + ' pontos de atributo'].concat((ev.skills || []).map(function (s) { return 'Nova habilidade: ' + s; }));
      nLines = ls.length;
      var evo = E.state && S.avatar.evolved(E.state.cls, ev.level);
      if (evo) { ls.unshift('Nova forma desbloqueada'); nLines = ls.length; }
      body = '<div class="lvl-label">NÍVEL AUMENTOU</div><div class="big">' + ev.level + '</div><div class="hero-title shine">' + esc(ev.title) + '</div>' +
        (evo ? '<div class="evo" style="--aura:' + S.rankFor(ev.level).color + '">' + S.avatar.html(E.state.cls, ev.level) + '<div class="evo-label">EVOLUÇÃO</div></div>' : '') +
        '<ul class="sys-lines">' + ls.map(function (l, i) { return li(esc(l), i + 2); }).join('') + '</ul>';
    } else if (ev.type === 'penalty' || ev.type === 'defeat') {
      cls = 'bad'; tag = 'AVISO';
      body = '<div class="warn-stripes"></div><h2>' + esc(ev.title) + '</h2>' + (ev.name ? '<div class="muted">' + esc(ev.name) + '</div>' : '') + '<ul class="sys-lines">' + lines + '</ul>';
    } else if (ev.type === 'achievement') {
      cls = 'gold'; tag = 'CONQUISTA'; extra = '<div class="rays"></div>';
      body = '<div class="medal">' + (ev.id ? uiIcon('ach_' + ev.id, ev.icon, 'medal-img') : ev.icon) + '</div><h2>' + esc(ev.title) + '</h2><div class="small muted">' + esc(ev.desc) + '</div><ul class="sys-lines">' + lines + '</ul>';
    } else if (ev.type === 'loot') {
      var r = topRarity(ev.items), rc2 = rc(r);
      cls = 'loot' + (S.RARITY[r].order >= 4 ? ' gold' : ''); tag = 'BAÚ';
      nLines = ev.items.length + 1;
      body = '<div class="chest-stage" style="--c:' + rc2 + '"><div class="pillar"></div><span class="chest-ico">' + (artId('bau_' + ev.tier) ? '<img src="' + artId('bau_' + ev.tier) + '" alt="">' : (ev.icon || '📦')) + '</span></div><h2>' + esc(ev.title) + '</h2>' +
        '<ul class="sys-lines">' + li('+' + fmt(ev.coins) + ' moedas', 0, 'color:var(--gold)') +
        ev.items.map(function (id, i) { var it = S.ITEMS[id]; return li(itemTiny(it) + ' ' + esc(it.name), i + 1, 'color:' + rc(it.rarity) + (S.RARITY[it.rarity].order >= 3 ? ';text-shadow:0 0 10px ' + rc(it.rarity) : '')); }).join('') + '</ul>';
    } else if (ev.type === 'victory') {
      cls = 'gold'; extra = '<div class="rays"></div>';
      var vb = S.BOSSES.concat(S.SECRET_BOSSES).filter(function (x) { return x.name === ev.name; })[0];
      body = (vb && S.BOSS_ART && S.BOSS_ART[vb.id] ? '<div class="victory-art"><img src="' + S.BOSS_ART[vb.id] + '" alt=""></div>' : '') +
        '<h2>VITÓRIA</h2><div class="muted">' + esc(ev.name) + ' foi derrotado</div>' +
        (ev.lastWords ? '<p class="last-words">«' + esc(ev.lastWords) + '»</p>' : '') +
        (ev.trophy ? '<div class="trophy-won" style="--k:0">' + (vb && trophyArt(vb) ? '<img class="trophy-img" src="' + trophyArt(vb) + '" alt="">' : '🏆 ') + 'Troféu obtido: ' + esc(ev.trophy) + '</div>' : '') + '<ul class="sys-lines">' + lines + '</ul>';
    } else if (ev.type === 'emergency' || ev.type === 'hidden' || ev.type === 'zone') {
      cls = ev.type === 'emergency' ? 'em-pop' : (ev.type === 'hidden' ? 'gold hq-pop' : (ev.done ? 'zone-pop ok' : 'zone-pop'));
      tag = ev.type === 'emergency' ? 'ALERTA' : (ev.type === 'hidden' ? 'SEGREDO' : 'PENALIDADE');
      extra = ev.type === 'hidden' ? '<div class="rays"></div>' : (ev.type === 'zone' && !ev.done ? '<div class="watch-veil"></div>' : '<div class="rays blue"></div>');
      body = '<h2>' + esc(ev.title) + '</h2>' + (ev.name ? '<div class="muted">' + esc(ev.name) + '</div>' : '') + '<ul class="sys-lines">' + lines + '</ul>';
    } else if (ev.type === 'report') {
      var rp = ev.report, sx = rp.stats;
      cls = 'report-pop grade-' + rp.grade; tag = 'RELATÓRIO';
      extra = rp.grade === 'S' || rp.grade === 'A' ? '<div class="rays"></div>' : '';
      var rl = ['Missões cumpridas: ' + sx.done, 'Missões Diárias: ' + sx.daily + ' / 7', 'Chefes derrotados: ' + sx.bosses, 'Falhadas: ' + sx.failed + (sx.voided ? ' · Anuladas: ' + sx.voided : ''),
        sx.sentences ? 'Sentenças do Sistema: ' + sx.sentences : null, 'Integridade: ' + rp.integrity + '%'].filter(Boolean);
      nLines = rl.length + 2;
      body = '<div class="muted small">Semana de ' + rp.week.slice(8) + '/' + rp.week.slice(5, 7) + '</div><div class="grade-big">' + rp.grade + '</div>' +
        '<ul class="sys-lines">' + rl.map(function (l, i) { return li(esc(l), i); }).join('') +
        li('<i>«' + esc(rp.say) + '»</i>', rl.length) +
        ((rp.coins || rp.items.length) ? li('Prémio: ' + [rp.coins ? '+' + rp.coins + ' moedas' : null].concat(rp.items.map(function (id) { return S.ITEMS[id].name; })).filter(Boolean).join(' · '), rl.length + 1, 'color:var(--gold)') : '') + '</ul>';
    } else if (ev.type === 'watch') {
      cls = ev.good ? 'watch good' : 'watch lv' + ev.level; tag = ev.good ? 'SISTEMA' : 'AVISO DO SISTEMA';
      extra = ev.good ? '<div class="rays blue"></div>' : '<div class="watch-veil"></div>';
      body = '<div class="watch-eye">' + uiIcon('ui_eye', '<span class="eye-fallback big"></span>', 'eye-big') + '</div>' +
        '<h2 class="glitch" data-t="' + esc(ev.title) + '">' + esc(ev.title) + '</h2><ul class="sys-lines">' + lines + '</ul>';
    } else if (ev.type === 'talk') {
      var cv = ev.conv, R = ev.res;
      cls = 'talk' + (R ? ' answered tag-' + R.tag : ''); tag = 'SISTEMA';
      extra = '<div class="rays blue"></div>';
      body = '<div class="talk-eye">' + uiIcon('ui_eye', '<span class="eye-fallback big"></span>', 'eye-big') + '</div>' +
        '<p class="talk-line" id="talk-line" data-full="' + esc(cv.line) + '">' + (fresh && FX.full() ? '' : esc(cv.line)) + '</p>';
      if (!R) {
        body += '<div class="talk-ch' + (fresh && FX.full() ? ' wait' : '') + '" id="talk-ch">' + cv.choices.map(function (c, i) { return '<button class="btn talk-opt" data-a="talk-pick" data-i="' + i + '" style="--k:' + i + '"><span class="talk-n">' + (i + 1) + '</span>' + esc(c.t) + '</button>'; }).join('') + '</div>' +
          '<button class="talk-skip" data-a="talk-skip">Ignorar</button>';
      } else {
        body += '<p class="talk-me">' + esc(E.state.name) + ': «' + esc(R.said) + '»</p><p class="talk-reply">' + esc(R.reply) + '</p>' +
          (R.fx.length ? '<ul class="sys-lines">' + R.fx.map(function (l, i) { return li(esc(l), i, 'color:' + (/^\+/.test(l) ? 'var(--gold)' : 'var(--danger)')); }).join('') + '</ul>' : '');
      }
      nLines = 1;
      if (!R) return '<div class="overlay sys-pop' + (fresh ? ' fresh' : '') + '">' + extra + '<div class="sys-box ' + cls + (fresh ? ' fresh' : '') + '" id="sys-box" role="alertdialog" data-type="talk"><span class="sys-tag">' + tag + '</span>' + body + '</div></div>';
    } else if (ev.type === 'mission') {
      body = '<h2>' + esc(ev.title) + '</h2><div class="muted">' + esc(ev.name) + '</div><ul class="sys-lines">' + lines + '</ul>';
    } else {
      extra = ev.type === 'skill' || ev.type === 'info' ? '<div class="rays blue"></div>' : '';
      body = '<h2>' + esc(ev.title) + '</h2>' + (ev.name ? '<div class="muted">' + esc(ev.name) + '</div>' : '') + '<ul class="sys-lines">' + lines + '</ul>';
    }
    return '<div class="overlay sys-pop' + (fresh ? ' fresh' : '') + '">' + extra + '<div class="sys-box ' + cls + (fresh ? ' fresh' : '') + '" id="sys-box" role="alertdialog" data-type="' + ev.type + '"><span class="sys-tag">' + tag + '</span>' + body +
      '<button class="btn pri block" data-a="pop-ok" style="--n:' + nLines + '">' + (ui.popups.length > 1 ? 'Seguinte (' + (ui.popups.length - 1) + ')' : 'OK') + '</button></div></div>';
  }
  function popupFx(ev) {
    var c = FX.center(document.getElementById('sys-box'));
    if (ev.type === 'talk') { talkType(); FX.vibrate(20); return; }
    if (ev.type === 'levelup') {
      FX.vibrate([60, 40, 60, 40, 200]);
      setTimeout(function () { FX.flash('#ffe7a8', .55); FX.shock(c.x, c.y, '#ffc85a'); FX.burst(c.x, c.y, '#ffc85a', 90, { speed: 12 }); }, 500);
      setTimeout(function () { FX.shock(c.x, c.y, '#6fd6ff'); FX.burst(c.x, c.y, '#6fd6ff', 50, { speed: 9 }); FX.rise(c.x, window.innerHeight, 260, '#ffc85a', 60); }, 800);
    } else if (ev.type === 'loot') {
      var col = rc(topRarity(ev.items));
      var ch = FX.center(document.querySelector('#sys-box .chest-ico'));
      FX.vibrate([20, 40, 20, 40, 20]);
      setTimeout(function () {
        FX.flash(col, S.RARITY[topRarity(ev.items)].order >= 4 ? .6 : .3);
        FX.shock(ch.x, ch.y, col); FX.burst(ch.x, ch.y, col, 70, { speed: 10 }); FX.burst(ch.x, ch.y, '#ffc85a', 30, { speed: 7 });
        FX.vibrate(80);
      }, 950);
    } else if (ev.type === 'achievement') {
      setTimeout(function () { FX.burst(c.x, c.y - 60, '#ffc85a', 50, { speed: 8 }); FX.shock(c.x, c.y - 60, '#ffc85a'); }, 700);
      FX.vibrate([40, 40, 80]);
    } else if (ev.type === 'victory') {
      setTimeout(function () { FX.burst(c.x, c.y, '#ffc85a', 70, { speed: 10 }); }, 400);
    } else if (ev.type === 'penalty' || ev.type === 'defeat') {
      FX.shake(2); FX.vignette(); FX.vibrate([120, 60, 120]);
    } else if (ev.type === 'emergency') {
      FX.flash('#ffb02e', .25); FX.vibrate([60, 50, 60, 50, 60, 50, 300]); setTimeout(function () { FX.shake(1); }, 300);
    } else if (ev.type === 'hidden') {
      setTimeout(function () { FX.shock(c.x, c.y, '#b56cff'); FX.burst(c.x, c.y, '#ffc85a', 70, { speed: 10 }); }, 500); FX.vibrate([40, 40, 40, 40, 160]);
    } else if (ev.type === 'zone' && !ev.done) {
      FX.flash('#ff1f3d', .3); FX.vignette(); FX.vibrate([200, 80, 200, 80, 400]); setTimeout(function () { FX.shake(2); }, 300);
    } else if (ev.type === 'report' && (ev.report.grade === 'S' || ev.report.grade === 'A')) {
      setTimeout(function () { FX.burst(c.x, c.y - 60, '#ffc85a', 60, { speed: 9 }); FX.shock(c.x, c.y - 60, '#ffc85a'); }, 600);
    } else if (ev.type === 'watch' && !ev.good) {
      FX.flash('#ff1f3d', .18 + ev.level * .08); FX.vignette();
      FX.vibrate(ev.level >= 3 ? [300, 80, 300, 80, 600] : [80, 60, 80, 60, 220]);
      setTimeout(function () { FX.shake(ev.level >= 2 ? 3 : 1); }, 350);
    } else if (ev.restore) {
      setTimeout(function () { FX.burst(c.x, c.y - 40, '#5be08a', 46, { speed: 7 }); FX.burst(c.x, c.y - 40, '#6fd6ff', 30, { speed: 5 }); }, 400);
    } else if (ev.type === 'mission' || ev.type === 'skill') {
      setTimeout(function () { FX.burst(c.x, c.y - 40, ev.type === 'skill' ? '#b56cff' : '#5be08a', 40, { speed: 8 }); }, 500);
    }
  }
  function renderToast() {
    var old = document.getElementById('toast');
    if (old) old.remove();
    if (!ui.toast) return;
    var d = document.createElement('div');
    d.id = 'toast';
    d.className = 'toast' + (ui.toast.bad ? ' bad' : '');
    d.setAttribute('role', 'status');
    d.textContent = ui.toast.msg;
    document.body.appendChild(d);
    var t = ui.toast.t;
    setTimeout(function () { if (ui.toast && ui.toast.t === t) { ui.toast = null; var x = document.getElementById('toast'); if (x) x.remove(); } }, 2800);
  }

  /* ================= RENDER ================= */
  function viewKey(st) {
    return ui.tab + '|' + (ui.page || '') + '|' + (st.battle ? 'b' + st.battle.started : '') + '|' +
      (ui.tab === 'combate' ? ui.gate : ui.tab === 'loja' ? ui.shopTab : ui.tab === 'bolsa' ? ui.bag : '');
  }
  function animateBars() {
    var full = FX.full();
    root.querySelectorAll('[data-k]').forEach(function (b) {
      var k = b.getAttribute('data-k'), p = +b.getAttribute('data-p');
      var prev = ui.bars[k];
      if (k === 'top-xp' && ui.lastLevel != null && E.state.level > ui.lastLevel) prev = 0;
      ui.bars[k] = p;
      if (!full || prev == null || Math.abs(prev - p) < 0.01) return;
      var i = b.querySelector('i'), gh = b.querySelector('.gh');
      b.classList.remove('anim');
      i.style.transition = 'none'; i.style.width = prev + '%';
      if (gh) { gh.style.transition = 'none'; gh.style.width = prev + '%'; }
      void b.offsetWidth;
      i.style.transition = ''; if (gh) gh.style.transition = '';
      b.classList.add('anim');
      if (b.classList.contains('top-xp')) i.style.transition = 'width .7s cubic-bezier(.3,.8,.3,1)';
      i.style.width = p + '%'; if (gh) gh.style.width = p + '%';
    });
  }
  function animateCoins(st) {
    var prev = ui.lastCoins;
    ui.lastCoins = st.coins;
    if (prev == null || prev === st.coins || !FX.full()) return;
    var box = root.querySelector('#top-coins .coins'), num = root.querySelector('#top-coins .cn');
    if (!box || !num) return;
    box.classList.add(st.coins > prev ? 'up' : 'down');
    var t0 = performance.now(), to = st.coins, from = prev;
    (function step(t) {
      var k = Math.min(1, (t - t0) / 700);
      var e = 1 - Math.pow(1 - k, 3);
      if (!num.isConnected) return;
      num.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step); else num.textContent = fmt(to);
    })(t0);
  }
  function render() {
    if (!root) return;
    var sheet = root.querySelector('.sheet');
    var sheetScroll = sheet ? sheet.scrollTop : 0;
    var modalKey = ui.modal ? ui.modal.type : null;
    if (!E.state) {
      FX.battle(false);
      root.innerHTML = introHtml();
      if (ui.intro.step === 0) runTyper();
      return;
    }
    var st = E.state;
    var body = '';
    if (st.battle && ui.tab !== 'combate') body += '<button class="btn bad block" style="margin-top:12px" data-a="tab" data-t="combate">' + uiIcon('ui_battle', '⚔', 'btn-ico') + ' Batalha em curso: voltar</button>';
    if (ui.tab === 'status') body += statusHtml(st);
    else if (ui.tab === 'missoes') body += missionsHtml(st);
    else if (ui.tab === 'combate') body += combatHtml(st);
    else if (ui.tab === 'loja') body += shopHtml(st);
    else if (ui.tab === 'bolsa') body += bagHtml(st);
    var vk = viewKey(st);
    var entering = vk !== ui.lastView;
    var tabChanged = !ui.lastView || ui.lastView.split('|')[0] !== ui.tab;
    var pop = ui.popups[0];
    root.innerHTML = topHtml(st) + '<main' + (entering ? ' class="enter"' : '') + '>' + body + '</main>' + navHtml(st) + modalHtml() + popupHtml();

    if (entering) {
      var wi = 0;
      root.querySelectorAll('main > .win, main > section, main > .battle > .win, main > .battle > .log, main > .chips, main > .row').forEach(function (w) {
        w.style.setProperty('--i', Math.min(wi++, 8));
        if (FX.full() && w.classList.contains('win') && wi <= 3) { var sl = document.createElement('div'); sl.className = 'scanline'; w.appendChild(sl); setTimeout(function () { if (sl.parentNode) sl.parentNode.removeChild(sl); }, 1300); }
        var j = 0;
        w.querySelectorAll('.card, .stat, .chip').forEach(function (c) { c.style.setProperty('--j', Math.min(j++, 14)); });
      });
      if (tabChanged) { var nb = root.querySelector('.nav button.on'); if (nb) nb.classList.add('fresh'); }
    }
    ui.lastView = vk;
    animateBars();
    animateCoins(st);
    if (ui.lastSaves != null && st.meta.saveCount !== ui.lastSaves) { var sd = root.querySelector('.save-dot'); if (sd) sd.classList.add('pulse'); }
    ui.lastSaves = st.meta.saveCount;
    ui.lastLevel = st.level;
    FX.battle(!!st.battle && !st.battle.over && ui.tab === 'combate');

    var log = document.getElementById('blog');
    if (log) log.scrollTop = log.scrollHeight;
    var ns = root.querySelector('.sheet');
    if (ns && modalKey && ui.modal && ui.modal.type === modalKey) ns.scrollTop = sheetScroll;
    ui.shownModal = ui.modal;
    // popups: efeitos quando aparecem pela primeira vez; espera se houver uma animação a decorrer
    if (pop && Date.now() < ui.holdUntil) {
      if (!ui.holdTimer) ui.holdTimer = setTimeout(function () { ui.holdTimer = null; render(); }, ui.holdUntil - Date.now() + 20);
    } else if (pop && pop._id !== ui.shownPop) {
      ui.shownPop = pop._id;
      popupFx(pop);
    }
    ui.fxMission = null; ui.fxDaily = false; ui.spawn = false;
    if (ui.toast) renderToast();
    if (document.getElementById('notif-status')) notifStatus();
  }
  S.ui = { render: render, state: ui };

  /* ================= EFEITOS DE COMBATE ================= */
  var STYLE = { guerreiro: 'slash', assassino: 'quick', mago: 'magic', guardiao: 'impact', arqueiro: 'arrow', invocador: 'spirit' };
  var DOT_COLOR = { queimadura: '#ff8a3d', veneno: '#7ee05b', sangramento: '#ff3d5a' };
  function num(re, t) { var m = t.match(re); return m ? +m[1] : null; }
  function combatFx(prevN) {
    var st = E.state, bt = st.battle;
    if (!bt) return 0;
    var n = Math.min((bt.logN || 0) - prevN, bt.log.length);
    var entries = n > 0 ? bt.log.slice(-n) : [];
    var bossEl = document.getElementById('boss-ico'), pp = document.getElementById('ppanel');
    var bc = FX.center(bossEl), pc = FX.center(pp);
    var cls = st.cls, color = S.CLASSES[cls].color, style = STYLE[cls];
    var t = 0, bossTurn = false;
    var at = function (ms, fn) { setTimeout(fn, ms); };
    var hitBoss = function () { if (!bossEl || !bossEl.isConnected) return; bossEl.classList.remove('hit'); void bossEl.offsetWidth; bossEl.classList.add('hit'); setTimeout(function () { bossEl.classList.remove('hit'); }, 420); };
    var panel = function (c) { if (!pp || !pp.isConnected) return; pp.classList.remove('hit', 'healed'); void pp.offsetWidth; pp.classList.add(c); };
    var skillColor = color;
    entries.forEach(function (e) {
      var txt = e.t, v;
      var isBossSide = /^◀|O chefe regenera|O chefe cria|O chefe fica|A tua defesa desce|O chefe drena|Ficaste atordoado|Resististe|causam-te|está atordoado e perde/.test(txt);
      if (isBossSide && !bossTurn) { bossTurn = true; t = Math.max(t + 120, 550); }
      if (txt.indexOf('✦ Usaste') === 0) {
        var nm = txt.replace('✦ Usaste ', '').replace(/\.$/, '');
        var sk = Object.keys(S.ALL_SKILLS).map(function (k) { return S.ALL_SKILLS[k]; }).filter(function (x) { return x.name === nm; })[0];
        skillColor = sk && sk.secret ? '#ffc85a' : color;
        if (sk && sk.secret) at(t, function () { FX.flash('#ffc85a', .25); });
        at(t, function () { FX.text(nm, pc.x, pc.y - 40, skillColor); });
        t += 120;
      } else if (txt.indexOf('➤') === 0) {
        v = num(/: (\d+) de dano/, txt);
        var hits = num(/\((\d+) golpes\)/, txt) || 1, crit = e.c === 'crit';
        (function (t0, v, hits, crit, col) {
          at(t0, function () {
            var d = FX.attack(style, bc.x, bc.y, col, hits, crit);
            setTimeout(function () { hitBoss(); FX.number(fmt(v), bc.x, bc.y - 30, crit ? 'crit' : ''); if (crit) { FX.shake(1); FX.vibrate(40); } }, Math.min(d, 400) + 120);
          });
        })(t, v, hits, crit, skillColor);
        t += Math.min(hits * (hits > 4 ? 70 : 110), 700) + 250;
        skillColor = color;
      } else if (/ataca: (\d+)/.test(txt)) {
        v = num(/ataca: (\d+)/, txt);
        (function (t0, v) { at(t0, function () { FX.attack('spirit', bc.x, bc.y, '#a184ff', 1, false); setTimeout(function () { hitBoss(); FX.number(fmt(v), bc.x + 30, bc.y, 'small'); }, 500); }); })(t, v);
        t += 200;
      } else if (/causam (\d+) ao chefe/.test(txt)) {
        v = num(/causam (\d+) ao chefe/, txt);
        (function (t0, v) { at(t0, function () { FX.number(fmt(v), bc.x - 30, bc.y + 10, 'small'); FX.burst(bc.x, bc.y, '#ff8a3d', 14, { speed: 3 }); }); })(t, v);
        t += 150;
      } else if (txt.indexOf('Recuperaste') >= 0 && /de vida/.test(txt)) {
        v = num(/Recuperaste (\d+)/, txt);
        (function (t0, v) { at(t0, function () { panel('healed'); FX.number('+' + fmt(v), pc.x, pc.y - 20, 'heal'); FX.rise(pc.x, pc.y + 30, pc.w || 200, '#5be08a', 30); }); })(t, v);
      } else if (txt.indexOf('💧 Recuperaste') === 0) {
        (function (t0) { at(t0, function () { FX.rise(pc.x, pc.y + 30, pc.w || 200, '#6fd6ff', 20); }); })(t);
      } else if (/^(⬆️|🛡️ Escudo de|🛡️ Defendeste)/.test(txt)) {
        (function (t0) { at(t0, function () { FX.buff(pc.x, pc.y, txt.indexOf('Escudo') >= 0 || txt.indexOf('Defend') >= 0 ? '#dce8ff' : '#6fd6ff'); }); })(t);
      } else if (/do chefe -/.test(txt)) {
        (function (t0) { at(t0, function () { FX.chains(bc.x, bc.y); }); })(t);
      } else if (txt.indexOf('O chefe ficou atordoado') >= 0) {
        (function (t0) { at(t0, function () { FX.stars(bc.x, bc.y); FX.text('ATORDOADO', bc.x, bc.y - 60, '#ffd24a'); }); })(t);
      } else if (txt.indexOf('O chefe sofre') >= 0) {
        var dn = (txt.match(/sofre (\w+)/) || [])[1];
        (function (t0, c) { at(t0, function () { FX.burst(bc.x, bc.y, c, 20, { speed: 4, gravity: -.05 }); }); })(t, DOT_COLOR[dn] || '#ff8a3d');
      } else if (txt.indexOf('💥 A bomba') === 0) {
        (function (t0) { at(t0, function () { FX.attack('impact', bc.x, bc.y, '#ff8a3d', 1, true); FX.shake(2); }); })(t);
      } else if (txt.indexOf('FASE') >= 0) {
        (function (t0, full) { at(t0, function () { FX.flash('#ff2040', .35); FX.shake(3); FX.vibrate([100, 50, 200]); FX.banner(full ? 'FASE FINAL' : 'FASE 2', 'O chefe libertou o seu poder', 'rgba(255,40,70,.55)', '#ff5a6e'); }); })(t, txt.indexOf('FINAL') >= 0);
        t += 500;
      } else if (txt.indexOf('◀') === 0) {
        v = num(/: (\d+) de dano/, txt) || 0;
        var dodged = txt.indexOf('ESQUIVASTE') >= 0;
        (function (t0, v, dodged) {
          at(t0, function () {
            if (bossEl && bossEl.isConnected) { bossEl.classList.remove('hit'); }
            if (dodged && !v) { FX.number('ESQUIVA', pc.x, pc.y - 10, 'miss'); return; }
            var pct = bt.p.maxHp ? v / bt.p.maxHp : 0;
            panel('hit'); FX.number('-' + fmt(v), pc.x, pc.y - 10, 'hurt');
            FX.burst(pc.x, pc.y, '#ff5a6e', 16, { speed: 5 });
            FX.shake(pct > .25 ? 3 : pct > .1 ? 2 : 1);
            if (pct > .15) FX.vignette();
            FX.vibrate(pct > .25 ? [80, 40, 80] : 50);
          });
        })(t, v, dodged);
        t += 380;
      } else if (/O chefe regenera (\d+)/.test(txt)) {
        v = num(/regenera (\d+)/, txt);
        (function (t0, v) { at(t0, function () { FX.number('+' + fmt(v), bc.x, bc.y - 20, 'heal'); FX.rise(bc.x, bc.y + 40, 120, '#5be08a', 20); }); })(t, v);
        t += 300;
      } else if (txt.indexOf('O chefe cria um escudo') >= 0) {
        (function (t0) { at(t0, function () { FX.shock(bc.x, bc.y, '#dce8ff'); }); })(t);
        t += 300;
      } else if (txt.indexOf('enfurecido') >= 0) {
        (function (t0) { at(t0, function () { FX.burst(bc.x, bc.y, '#ff3d3d', 40, { speed: 6, gravity: -.05 }); FX.text('FÚRIA', bc.x, bc.y - 60, '#ff5a6e'); FX.shake(1); }); })(t);
        t += 300;
      } else if (txt.indexOf('Ficaste atordoado') >= 0) {
        (function (t0) { at(t0, function () { FX.stars(pc.x, pc.y + 40); }); })(t);
      } else if (/causam-te (\d+)/.test(txt)) {
        v = num(/causam-te (\d+)/, txt);
        (function (t0, v) { at(t0, function () { FX.number('-' + fmt(v), pc.x + 40, pc.y, 'hurt small'); }); })(t + 200, v);
      } else if (/Vontade|Renasceste|Pena da Fénix/.test(txt)) {
        (function (t0) { at(t0 + 200, function () { FX.flash('#ffc85a', .5); FX.rise(pc.x, pc.y + 40, 200, '#ffc85a', 60); FX.banner('RENASCER', '', 'rgba(255,176,46,.5)', '#ffc85a'); }); })(t);
        t += 600;
      } else if (txt.indexOf('colapsar') >= 0) {
        (function (t0) { at(t0, function () { FX.shake(2); FX.text('O PORTÃO COLAPSA', bc.x, bc.y + 60, '#ffb02e'); }); })(t);
      } else if (txt.indexOf('🏆') === 0) {
        (function (t0) {
          at(t0 + 150, function () {
            if (bossEl && bossEl.isConnected) { bossEl.classList.remove('hit'); bossEl.classList.add('dying'); }
            FX.flash('#ffffff', .6); FX.shake(3); FX.vibrate([60, 40, 60, 40, 250]);
            FX.burst(bc.x, bc.y, '#ffc85a', 90, { speed: 12 }); FX.burst(bc.x, bc.y, '#ff5a6e', 40, { speed: 8 });
            FX.shock(bc.x, bc.y, '#ffc85a');
            setTimeout(function () { FX.banner('VITÓRIA', S.BOSS_BY_ID[bt.bossId].name + ' foi derrotado', 'rgba(255,176,46,.5)', '#ffc85a'); }, 500);
            setTimeout(function () { ui.victoryAnim = false; }, 1300);
          });
        })(t);
        t += 1300;
      } else if (txt.indexOf('💀 DERROTA') === 0 || txt.indexOf('fechou-se') >= 0) {
        (function (t0) {
          at(t0 + 300, function () {
            var app = document.getElementById('app');
            if (app && FX.full()) { app.classList.add('defeat-tint'); setTimeout(function () { app.classList.remove('defeat-tint'); }, 1700); }
            FX.vignette(); FX.banner('DERROTA', 'Volta mais forte', 'rgba(255,40,70,.5)', '#ff5a6e'); FX.vibrate([200, 80, 200]);
          });
        })(t);
        t += 1300;
      }
    });
    return t + 250;
  }
  function battleAct(type, id) {
    if (FX.full() && Date.now() < ui.busyUntil) return;
    var bt = E.state.battle;
    if (!bt) return;
    var prevN = bt.logN || 0;
    var res = C.act(type, id);
    if (res && res.ok === false) { toast(res.msg, true); return; }
    var over = E.state.battle && E.state.battle.over;
    if (over === 'win') ui.victoryAnim = true;
    if (over === 'fled') talkTry('flee', { boss: S.BOSS_BY_ID[bt.bossId] }, 1800);
    if (FX.full()) {
      ui.busyUntil = Date.now() + 900;
      if (over === 'win' || over === 'lose') ui.holdUntil = Date.now() + 3200;
    }
    pullEvents();
    render();
    var dur = combatFx(prevN);
    if (FX.full()) {
      ui.busyUntil = Date.now() + dur;
      if (over === 'win' || over === 'lose') {
        ui.holdUntil = Date.now() + dur + 200;
        if (ui.holdTimer) clearTimeout(ui.holdTimer);
        ui.holdTimer = setTimeout(function () { ui.holdTimer = null; render(); }, dur + 220);
      }
      setTimeout(function () { var a = document.querySelector('.actions'); if (a) a.classList.remove('busy'); }, dur);
    } else ui.victoryAnim = false;
  }

  /* ================= AÇÕES ================= */
  var H = {
    'intro-yes': function () { FX.flash('#6fd6ff', .3); FX.burst(ui.pt.x, ui.pt.y, '#6fd6ff', 40, { speed: 7 }); ui.intro.step = 1; render(); },
    'intro-cls': function (d) { ui.intro.cls = d.v; render(); },
    'intro-go': function () {
      var r = E.start(ui.intro.name, ui.intro.cls);
      if (!r.ok) return toast(r.msg, true);
      ui.popups.push({ _id: ++ui.popSeq, type: 'info', title: 'BEM-VINDO, JOGADOR', name: E.state.name, lines: ['Classe: ' + S.CLASSES[E.state.cls].name, 'Começas com 100 moedas, poções e um Baú Comum.', 'Cria as tuas missões no separador Missões.'] });
      ui.tab = 'status';
      if (Notify.available()) { E.state.settings.notifAsked = true; setTimeout(function () { Notify.ask().then(function () { Notify.sync(true); }); }, 3500); }
      if (FX.full()) {
        FX.awaken(S.CLASSES[E.state.cls].color);
        ui.holdUntil = Date.now() + 2300;
        setTimeout(function () { ui.lastView = null; render(); }, 1650);
      }
      render();
    },
    tab: function (d) { var was = ui.tab; ui.tab = d.t; ui.page = null; ui.modal = null; render(); window.scrollTo(0, 0); if (was !== d.t) talkTry('tab', { tab: d.t }, 1400); },
    page: function (d) { ui.page = d.p; ui.histLimit = 40; render(); window.scrollTo(0, 0); },
    back: function () { ui.page = null; render(); },
    'hist-more': function () { ui.histLimit += 60; render(); },
    alloc: function (d) {
      var p = { x: ui.pt.x, y: ui.pt.y };
      var r = act(E.allocate(d.s, 1));
      if (!r.ok) return;
      talkTry('alloc', {}, 1500);
      var v = root.querySelector('[data-stat="' + d.s + '"]');
      if (v) v.classList.add('bump');
      FX.text('+1 ' + S.STAT_INFO[d.s].short, p.x - 20, p.y - 10, '#ffc85a');
      FX.burst(p.x, p.y, '#ffc85a', 18, { speed: 5 });
    },
    slot: function (d) { ui.modal = { type: 'slot', slot: d.s }; render(); },
    close: function () { ui.modal = null; ui.form = null; render(); },
    info: function (d) {
      var prev = ui.modal;
      ui.modal = { type: 'info', k: d.k, id: d.id, back: prev ? (prev.type === 'info' ? prev.back : prev) : null };
      render();
    },
    ext: function (d, el, ev) {
      if (ev && ev.preventDefault) ev.preventDefault();
      var url = d.url;
      if (!/^https:\/\//.test(url)) return;
      var cap = window.Capacitor;
      if (cap && cap.isNativePlatform && cap.isNativePlatform()) window.location.href = url; // o Android abre no navegador
      else window.open(url, '_blank', 'noopener');
    },
    'info-back': function () { ui.modal = (ui.modal && ui.modal.back) || null; render(); },
    overlay: function (d, el, ev) { if (ev.target === el) H.close(); },
    'confirm-yes': function () {
      var m = ui.modal;
      if (m.typed) { var v = (document.getElementById('cf-typed') || {}).value || ''; if (v.trim().toUpperCase() !== m.typed) return toast('Texto de confirmação incorreto.', true); }
      ui.modal = null;
      m.fn();
    },
    'pop-ok': function () { ui.popups.shift(); render(); },
    'talk-pick': function (d) {
      var ev = ui.popups[0];
      if (!ev || ev.type !== 'talk' || ev.res) return;
      ev.res = S.talk.answer(E.state, ev.conv, +d.i);
      if (!ev.res.ok) { ui.popups.shift(); render(); return; }
      render();
      var b = document.getElementById('sys-box');
      if (ev.res.tag === 'd' && FX.full()) { if (b) b.classList.add('glitching'); FX.shake(1); FX.vibrate([30, 30, 60]); }
      else FX.vibrate(15);
      if (ev.res.fx.length) { var cc = FX.center(b); FX.burst(cc.x, cc.y, /^\+/.test(ev.res.fx[0]) ? '#ffc85a' : '#ff5a6e', 26, { speed: 6 }); }
    },
    'talk-skip': function () {
      var ev = ui.popups[0];
      if (ev && ev.type === 'talk') { S.talk.skip(E.state, ev.conv); ui.popups.shift(); render(); }
    },

    // missões
    'm-new': function () {
      if (S.watch.banLeft(E.state) > 0) { var bv = S.watch.bannedVoice(E.state); ui.popups.push({ _id: ++ui.popSeq, type: 'watch', level: 1, title: bv.title, lines: bv.lines }); render(); return; }
      openMissionForm();
    },
    'm-edit': function (d) { openMissionForm(d.id); },
    'f-set': function (d) { ui.form[d.k] = d.v; render(); },
    'f-stat': function (d) {
      var s = ui.form.stats, i = s.indexOf(d.v);
      if (i >= 0) s.splice(i, 1); else if (s.length < 3) s.push(d.v); else toast('Máximo de 3 atributos.', true);
      render();
    },
    'f-day': function (d) { var v = +d.v, s = ui.form.days, i = s.indexOf(v); if (i >= 0) s.splice(i, 1); else s.push(v); render(); },
    'm-save': function () {
      var f = ui.form;
      var r = f.id ? M.update(f.id, f) : M.create(f);
      if (r.watch) { ui.modal = null; pullEvents(); render(); return; }
      if (!r.ok) return toast(r.msg, true);
      ui.modal = null; ui.form = null;
      act(r, f.id ? 'Missão atualizada.' : 'Missão criada.');
      if (!f.id && r.ok) talkTry('create', { missao: f.title, diff: f.difficulty }, 1300);
    },
    'm-delete': function () {
      var id = ui.form.id;
      confirmBox('Apagar missão', 'A missão deixa de aparecer. O histórico fica guardado.', 'Apagar', function () { ui.form = null; act(M.remove(id), 'Missão apagada.'); }, true);
    },
    'm-complete': function (d) {
      var m = M.byId(d.id);
      var r = M.nextReward(E.state, m.difficulty);
      confirmBox('Concluir missão', '"' + m.title + '"\n\nConfirmas que cumpriste mesmo esta missão?\nRecebes +' + r.xp + ' XP e +' + r.coins + ' moedas' + (r.factor < 1 ? ' (' + Math.round(r.factor * 100) + '% da recompensa: ' + (r.fatigue < 1 ? 'fadiga' : '') + (r.fatigue < 1 && r.trust < 1 ? ' e ' : '') + (r.trust < 1 ? 'integridade baixa' : '') + ')' : '') + '.', 'Sim, cumpri', function () {
        ui.fxMission = d.id;
        if (FX.full()) ui.holdUntil = Date.now() + 900;
        var res = act(M.complete(d.id));
        if (!res.ok) return;
        if (!ui.popups.some(function (p) { return p.type === 'watch'; })) talkTry('done', { missao: m.title, diff: m.difficulty }, 1500);
        var c = FX.center(root.querySelector('[data-mid="' + d.id + '"] .stamp'));
        FX.text('+' + res.xp + ' XP', c.x - 30, c.y - 10, '#6fd6ff');
        FX.text('+' + res.coins + ' ◈', c.x + 30, c.y - 10, '#ffc85a', 180);
        FX.burst(c.x, c.y, '#5be08a', 40, { speed: 7 });
        FX.vibrate(60);
      });
    },
    'e-done': function () {
      var em = S.live.emergency(E.state);
      if (!em) return;
      confirmBox('Missão de Emergência', '«' + em.text + '»\n\nCumpriste mesmo?', 'Sim, cumpri', function () { act(S.live.completeEmergency()); });
    },
    'h-done': function () {
      var hq = S.live.hiddenActive(E.state);
      if (!hq) return;
      confirmBox('Missão Oculta', '«' + hq.def.task + '»\n\nCumpriste mesmo? O Sistema vai saber se mentires.', 'Sim, cumpri', function () { act(S.live.completeHidden()); });
    },
    'z-step': function (d) {
      var z = S.live.zone(E.state); if (!z) return;
      act(S.live.setZoneValue(d.id, Math.max(0, (z.values[d.id] || 0) + (+d.d))));
    },
    'z-complete': function () { act(S.live.completeZone()); },
    'd-step': function (d) {
      var v = (M.dailyValues(E.state)[d.id] || 0) + (+d.d);
      act(M.setDailyValue(d.id, Math.max(0, v)));
    },
    'd-complete': function () {
      ui.fxDaily = true;
      if (FX.full()) ui.holdUntil = Date.now() + 900;
      var res = act(M.completeDaily());
      if (!res.ok) return;
      talkTry('daily', {}, 1500);
      var c = FX.center(root.querySelector('#daily-win .stamp'));
      FX.burst(c.x, c.y, '#ffc85a', 60, { speed: 9 }); FX.shock(c.x, c.y, '#ffc85a');
      FX.text('SEQUÊNCIA ' + E.state.daily.streak, c.x, c.y - 30, '#ffc85a');
      FX.vibrate([40, 40, 80]);
    },
    'd-config': function () {
      var dd = E.state.daily;
      ui.form = { enabled: dd.enabled, deadline: dd.deadline, tasks: dd.tasks.map(function (t) { return { id: t.id, name: t.name, target: t.target, unit: t.unit }; }) };
      ui.modal = { type: 'daily' };
      render();
    },
    'df-enabled': function (d, el) { ui.form.enabled = el.checked; },
    'df-add': function () { ui.form.tasks.push({ id: null, name: '', target: 10, unit: 'rep' }); render(); },
    'df-del': function (d) { ui.form.tasks.splice(+d.i, 1); render(); },
    'df-save': function () {
      var r = M.updateDailyConfig(ui.form);
      if (!r.ok) return toast(r.msg, true);
      ui.modal = null; ui.form = null;
      act(r, 'Missão diária atualizada.');
    },

    // combate
    gate: function (d) { ui.gate = +d.g; render(); },
    boss: function (d) { ui.modal = { type: 'boss', id: d.id }; render(); talkTry('boss', { boss: S.BOSS_BY_ID[d.id] }, 1100); },
    fight: function (d) {
      ui.modal = null;
      var b = S.BOSS_BY_ID[d.id];
      var g = S.GATES[b.gate - 1];
      ui.spawn = true;
      var r = act(C.start(d.id));
      window.scrollTo(0, 0);
      if (r && r.ok !== false) FX.portal(g ? g.color : '#ffc85a', b.name, 'NÍVEL ' + b.level + (b.king ? ' · REI DO PORTÃO' : ''));
    },
    'b-attack': function () { battleAct('attack'); },
    'b-defend': function () { battleAct('defend'); },
    'b-pass': function () { battleAct('pass'); },
    'b-sheet': function (d) { ui.modal = { type: 'bsheet', v: d.v }; render(); },
    'b-skill': function (d) { ui.modal = null; battleAct('skill', d.id); },
    'b-item': function (d) { ui.modal = null; battleAct('item', d.id); },
    'b-flee': function () {
      var lost = Math.round(E.state.coins * 0.05);
      confirmBox('Fugir', 'Se fugires perdes ' + lost + ' moedas (usa Pó de Fumo para fugir sem perdas). O chefe continua vivo.', 'Fugir', function () { battleAct('flee'); FX.text('FUGA', window.innerWidth / 2, window.innerHeight / 2, '#8396ba'); }, true);
    },
    'b-close': function () { FX.battle(false); FX.flash('#6fd6ff', .25); ui.lastView = null; act(C.close()); },

    // loja
    'shop-tab': function (d) { ui.shopTab = d.v; ui.showLocked = false; render(); },
    'go-potions': function () { ui.tab = 'loja'; ui.shopTab = 'consumivel'; ui.page = null; render(); window.scrollTo(0, 0); },
    'shop-locked': function () { ui.showLocked = !ui.showLocked; render(); },
    buy: function (d) {
      var it = E.item(d.id), q = +d.q || 1;
      var p = { x: ui.pt.x, y: ui.pt.y };
      var r = E.buy(d.id, q);
      act(r, r.ok ? 'Compraste ' + (q > 1 ? q + '× ' : '') + it.name + '.' : null);
      if (r.ok) talkTry('buy', { item: it.name, rarity: it.rarity }, 1200);
      if (r.ok) { FX.text('-' + fmt(r.total) + ' ◈', p.x, p.y - 10, '#ffc85a'); FX.burst(p.x, p.y, rc(it.rarity), 24, { speed: 6 }); FX.vibrate(30); }
    },
    'cl-new': function () { ui.form = { name: '', price: 150, icon: '🎁' }; ui.modal = { type: 'leisure' }; render(); },
    'cl-save': function () {
      var f = ui.form;
      var r = E.addCustomLeisure(f.name, f.price, f.icon);
      if (!r.ok) return toast(r.msg, true);
      ui.modal = null; ui.form = null;
      act(r, 'Recompensa criada na Loja.');
    },
    'cl-del': function (d) { confirmBox('Remover recompensa', 'Remove esta recompensa da loja. As que já compraste ficam na bolsa.', 'Remover', function () { act(E.removeCustomLeisure(d.id)); }, true); },

    // bolsa
    bag: function (d) { ui.bag = d.v; render(); },
    item: function (d) { ui.modal = { type: 'item', id: d.id }; render(); },
    use: function (d) {
      var it = E.item(d.id);
      var go = function () {
        var p = { x: ui.pt.x, y: ui.pt.y };
        var r = E.useItem(d.id);
        if (r.ok && E.count(E.state, d.id) < 1) ui.modal = null;
        act(r, r.ok && it.cat !== 'bau' ? r.msg : null);
        if (!r.ok || it.cat === 'bau') return;
        var u = it.use || {};
        if (u.type === 'heal' || u.type === 'restore') { FX.rise(window.innerWidth / 2, window.innerHeight * .7, 220, '#5be08a', 50); FX.text('+' + r.healed + ' VIDA', p.x, p.y - 20, '#5be08a'); }
        else if (u.type === 'leisure') { ['#ffc85a', '#6fd6ff', '#ff3d7f', '#5be08a'].forEach(function (c, i) { setTimeout(function () { FX.burst(window.innerWidth / 2, window.innerHeight * .45, c, 30, { speed: 9 }); }, i * 120); }); FX.banner('APROVEITA', it.name, 'rgba(255,200,90,.4)', '#ffc85a'); }
        else if (u.type === 'perm' || u.type === 'permAll' || u.type === 'point' || u.type === 'core') { FX.rise(window.innerWidth / 2, window.innerHeight, 240, '#ffc85a', 70); FX.flash('#ffc85a', .3); FX.banner('PODER AUMENTOU', r.msg, 'rgba(255,200,90,.4)', '#ffc85a'); }
        else if (u.type === 'timed') { FX.rise(window.innerWidth / 2, window.innerHeight, 240, '#6fd6ff', 50); FX.text(r.msg, p.x, p.y - 20, '#6fd6ff'); }
        else if (u.type === 'unlockSkill' || u.type === 'revealBoss' || u.type === 'fragment') { FX.flash('#e0e6ff', .5); FX.burst(window.innerWidth / 2, window.innerHeight / 2, '#e0e6ff', 80, { speed: 11 }); }
        else FX.burst(p.x, p.y, rc(it.rarity), 30, { speed: 6 });
      };
      if (it.cat === 'lazer') confirmBox('Usar recompensa', 'Vais usar "' + it.name + '" agora. Aproveita!', 'Usar', go);
      else go();
    },
    equip: function (d) {
      var it = E.item(d.id);
      var r = E.equip(d.id, d.s); if (r.ok) ui.modal = null; act(r, r.ok ? 'Equipado.' : null);
      if (r.ok) { FX.rise(window.innerWidth / 2, window.innerHeight * .6, 200, rc(it.rarity), 40); FX.flash(rc(it.rarity), .2); FX.vibrate(40); talkTry('equip', { item: it.name, rarity: it.rarity, slot: d.s === 'weapon' ? 'weapon' : d.s === 'armor' ? 'armor' : 'acc' }, 1200); }
    },
    unequip: function (d) { var r = E.unequip(d.s); if (r.ok) ui.modal = null; act(r, r.ok ? 'Item guardado na bolsa.' : null); },
    sell: function (d) {
      var it = E.item(d.id), v = E.sellValue(E.state, d.id);
      confirmBox('Vender', 'Vender 1× ' + it.name + ' por ' + v + ' moedas?', 'Vender', function () {
        var r = E.sell(d.id, 1);
        if (r.ok && E.count(E.state, d.id) < 1) ui.modal = null;
        act(r, r.ok ? '+' + r.coins + ' moedas.' : null);
      }, true);
    },

    // definições
    'tr-open': function () { ui.intro.step = 'restore'; ui.trPending = null; render(); },
    'tr-back': function () { ui.intro.step = 0; ui.trPending = null; render(); },
    'tr-new-ask': function () { ui.intro.confirmNew = true; render(); },
    'tr-new': function () { S.storage.clearMoved(); ui.intro = { step: 0, name: '', cls: null }; render(); },
    'tr-paste': function () {
      var ta = document.getElementById('tr-code');
      try {
        navigator.clipboard.readText().then(function (t) { ta.value = t; toast('Código colado (' + fmt(S.storage.normalizeCode(t).length) + ' caracteres).'); }, function () { toast('Não deu para colar sozinho: toca na caixa e cola.', true); });
      } catch (e) { toast('Não deu para colar sozinho: toca na caixa e cola.', true); }
    },
    'tr-read': function () {
      var code = (document.getElementById('tr-code') || {}).value || '';
      var r = E.readTransfer(code);
      if (!r.ok) { ui.trPending = null; render(); return toast(r.msg, true); }
      ui.trPending = { code: code, name: r.state.name, level: r.state.level, cls: r.state.cls, coins: r.state.coins || 0 };
      render();
      var ta = document.getElementById('tr-code'); if (ta) ta.value = code;
    },
    'tr-accept': function () {
      var P = ui.trPending;
      if (!P) return;
      var go = function () {
        var r = E.acceptTransfer(P.code);
        if (!r.ok) return toast(r.msg, true);
        ui.trPending = null; ui.intro = { step: 0, name: '', cls: null }; ui.page = null; ui.tab = 'status'; ui.modal = null; ui.lastView = null;
        ui.popups.push({ _id: ++ui.popSeq, type: 'info', title: 'CONTA RESTAURADA', name: r.name, lines: ['Nível ' + r.level, 'A conta está agora só neste aparelho.', 'O código usado já não volta a funcionar aqui.'] });
        render();
      };
      if (E.state) confirmBox('Receber conta', 'A conta atual (' + E.state.name + ', nível ' + E.state.level + ') será substituída e perdida.\nVais ficar com ' + P.name + ' (nível ' + P.level + ').', 'Substituir', go, true);
      else go();
    },
    'tr-start': function () {
      ui.modal = { type: 'confirm', title: 'Transferir conta', bad: true, typed: 'TRANSFERIR', yes: 'Transferir agora',
        text: 'A conta ' + E.state.name + ' (nível ' + E.state.level + ') vai sair deste aparelho AGORA.\n\nVais receber um código para usar no outro aparelho. Este aparelho fica sem conta e o código não volta a funcionar aqui.',
        fn: function () {
          var r = E.createTransfer();
          if (!r.ok) return toast(r.msg, true);
          ui.intro = { step: 0, name: '', cls: null }; ui.page = null; ui.tab = 'status'; ui.popups = []; ui.modal = null; ui.lastView = null;
          FX.flash('#ff5a6e', .25);
          render();
        } };
      render();
    },
    'exp-copy': function () {
      var ta = document.getElementById('exp-code');
      var txt = ta.value;
      var okMsg = 'Código copiado (' + fmt(txt.length) + ' caracteres). Envia-o inteiro.';
      var fallback = function () { ta.focus(); ta.select(); ta.setSelectionRange(0, txt.length); try { document.execCommand('copy'); toast(okMsg); } catch (e) { toast('Seleciona o texto e copia manualmente.', true); } };
      try { navigator.clipboard.writeText(txt).then(function () { toast(okMsg); }, fallback); } catch (e) { fallback(); }
    },
    imp: function () {
      var code = (document.getElementById('imp-code') || {}).value || '';
      var st = S.storage.importCode(code);
      if (!st) return toast('Código inválido ou incompleto.', true);
      confirmBox('Restaurar backup', 'Vais substituir o progresso atual pelo de ' + st.name + ' (nível ' + st.level + '). Continuar?', 'Restaurar', function () {
        act(E.importState(st), 'Progresso restaurado.');
        ui.page = null; ui.tab = 'status'; render();
      }, true);
    },
    'set-rem': function (d, el) {
      E.state.settings.reminders = el.checked; E.commit('definições');
      if (el.checked) Notify.ask().then(function (ok) { if (!ok) toast('Autoriza as notificações do Sistema nas definições do telemóvel.', true); Notify.sync(true); });
      else Notify.sync(true);
    },
    'set-talk': function (d) { E.state.settings.talk = d.v; E.commit('definições'); render(); toast(d.v === 'off' ? 'O Sistema vai ficar calado. Não quer dizer que deixe de ver.' : d.v === 'raro' ? 'Conversas raras.' : 'Conversas normais.'); },
    'notif-test': function () {
      Notify.ask().then(function (ok) {
        if (!ok) { toast('Sem autorização. Ativa as notificações do Sistema nas definições do telemóvel.', true); notifStatus(); return; }
        Notify.test().then(function (r) { toast(r ? 'Lembrete enviado. Podes fechar a app: chega em 5 segundos.' : 'Não foi possível agendar o teste.', !r); });
      });
    },
    'notif-exact': function () { Notify.openExact().then(function () { setTimeout(notifStatus, 800); }); },
    'notif-perm': function () { Notify.ask().then(function () { notifStatus(); Notify.sync(true); }); },
    'set-vib': function (d, el) { E.state.settings.vibrate = el.checked; E.commit('definições'); },
    'set-fx': function (d) { E.state.settings.fx = d.v; E.commit('definições'); FX.setMode(d.v); render(); toast(d.v === 'full' ? 'Animações completas.' : 'Animações reduzidas.'); },
    reset: function () {
      ui.modal = { type: 'confirm', title: 'Recomeçar do zero', text: 'Todo o progresso deste aparelho será apagado: nível, itens, missões e chefes derrotados.', yes: 'Apagar tudo', bad: true, typed: 'APAGAR',
        fn: function () { E.resetAll(); ui.intro = { step: 0, name: '', cls: null }; ui.tab = 'status'; ui.page = null; ui.popups = []; ui.bars = {}; ui.lastCoins = null; ui.lastView = null; render(); } };
      render();
    }
  };

  function onClick(ev) {
    var el = ev.target.closest('[data-a]');
    if (!el || !root.contains(el)) return;
    var a = el.getAttribute('data-a');
    if (el.tagName === 'INPUT' && el.type !== 'checkbox') return;
    if (el.disabled) return;
    var fn = H[a];
    if (!fn) return;
    ui.lastAct = Date.now();
    if (typeof ev.clientX === 'number' && (ev.clientX || ev.clientY)) ui.pt = { x: ev.clientX, y: ev.clientY };
    else { var c0 = FX.center(el); ui.pt = { x: c0.x, y: c0.y }; }
    if (a !== 'overlay' && el.tagName === 'BUTTON') FX.tap(ui.pt.x, ui.pt.y);
    if (a === 'overlay' && ev.target !== el) return;
    if (el.type === 'checkbox') { fn(el.dataset, el, ev); return; }
    ev.preventDefault();
    fn(el.dataset, el, ev);
  }
  function onInput(ev) {
    var el = ev.target;
    var f = el.getAttribute('data-f');
    if (!f) return;
    if (f === 'intro-name') { ui.intro.name = el.value; return; }
    if (!ui.form) return;
    if (f === 'task-name' || f === 'task-target' || f === 'task-unit') {
      var tk = ui.form.tasks[+el.dataset.i];
      if (tk) tk[f.slice(5)] = f === 'task-target' ? +el.value : el.value;
      return;
    }
    ui.form[f] = el.value;
  }
  function onChange(ev) {
    var el = ev.target;
    if (el.getAttribute('data-a') === 'd-input') {
      act(M.setDailyValue(el.dataset.id, +el.value || 0));
    }
    if (el.getAttribute('data-a') === 'z-input') {
      act(S.live.setZoneValue(el.dataset.id, +el.value || 0));
    }
  }
  function onKey(ev) {
    if (ev.key === 'Escape' && ui.modal) { H.close(); }
    if (ev.key === 'Enter' && ev.target && ev.target.id === 'in-name' && ui.intro.cls) H['intro-go']();
  }

  /* ---------------- relógio ---------------- */
  var lastDay = null;
  function tick() {
    var unlocked = false;
    document.querySelectorAll('[data-lock]').forEach(function (el) {
      var ts = +el.getAttribute('data-lock');
      if (ts <= now()) unlocked = true; else el.textContent = lockText(ts);
    });
    if (unlocked && !ui.modal) render();
    var ck = document.getElementById('top-clock');
    if (ck) { var hm = clockText(); if (ck.textContent !== hm) ck.textContent = hm; }
    document.querySelectorAll('[data-cd]').forEach(function (el) {
      var ts = +el.getAttribute('data-cd');
      el.textContent = cdText(ts);
      el.classList.toggle('urgent', ts - now() < 3600000);
    });
  }
  var lastPhase = null;
  /* ---------- Lembretes do Sistema (notificações locais, só na app Android) ---------- */
  var Notify = S.notify = (function () {
    var IDS = 'sistema.notif.ids', CHANNEL = 'sistema', lastSig = null, ready = null;
    function plugin() {
      try { var C = globalThis.Capacitor; if (C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.LocalNotifications) return C.Plugins.LocalNotifications; } catch (e) { /* web */ }
      return null;
    }
    function idFor(key) { var h = 7; for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 2147483000; return h + 1; }
    function stored() { try { return JSON.parse(localStorage.getItem(IDS) || '[]'); } catch (e) { return []; } }
    function enabled(st) { return st && st.settings && st.settings.reminders !== false; }
    function note(id, n, at) {
      return { id: id, title: n.title, body: n.body, largeBody: n.body, schedule: { at: new Date(at), allowWhileIdle: true }, channelId: CHANNEL,
        smallIcon: 'ic_stat_sistema', iconColor: '#6FD6FF', autoCancel: true, extra: { tab: n.tab || 'status' } };
    }
    /* canal próprio (Android 8+) e toque na notificação → abre o separador certo */
    function setup() {
      if (ready) return ready;
      var P = plugin();
      if (!P) return (ready = Promise.resolve());
      try {
        if (P.addListener) P.addListener('localNotificationActionPerformed', function (a) {
          var tab = a && a.notification && a.notification.extra && a.notification.extra.tab;
          if (!E.state || !tab) return;
          ui.tab = tab; ui.page = null; ui.modal = null; render(); window.scrollTo(0, 0);
        });
      } catch (e) { /* ignora */ }
      ready = (P.createChannel ? P.createChannel({ id: CHANNEL, name: 'Avisos do Sistema', description: 'Prazos das missões, Missão Diária, emergências e Zona de Penalidade', importance: 4, visibility: 1, vibration: true, lights: true, lightColor: '#6FD6FF' }) : Promise.resolve()).catch(function () {});
      return ready;
    }
    return {
      available: function () { return !!plugin(); },
      setup: setup,
      ask: function () {
        var P = plugin(); if (!P) return Promise.resolve(false);
        return P.requestPermissions().then(function (r) { return r && r.display === 'granted'; }).catch(function () { return false; });
      },
      /* estado das autorizações, para mostrar nas Definições */
      status: function () {
        var P = plugin(); if (!P) return Promise.resolve(null);
        var perm = P.checkPermissions ? P.checkPermissions().then(function (r) { return r.display; }).catch(function () { return 'unknown'; }) : Promise.resolve('unknown');
        var exact = P.checkExactNotificationSetting ? P.checkExactNotificationSetting().then(function (r) { return r.exact_alarm; }).catch(function () { return 'granted'; }) : Promise.resolve('granted');
        return Promise.all([perm, exact]).then(function (r) { return { display: r[0], exact: r[1] }; });
      },
      openExact: function () { var P = plugin(); return P && P.changeExactNotificationSetting ? P.changeExactNotificationSetting().catch(function () {}) : Promise.resolve(); },
      test: function () {
        var P = plugin(); if (!P) return Promise.resolve(false);
        return setup().then(function () {
          var n = { title: 'SISTEMA', body: 'Teste concluído, ' + (E.state ? E.state.name : 'Jogador') + '. Eu consigo chegar a ti. Mesmo com a app fechada.', tab: 'status' };
          return P.schedule({ notifications: [note(2147483001, n, Date.now() + 5000)] }).then(function () { return true; });
        }).catch(function () { return false; });
      },
      sync: function (force) {
        var P = plugin(), st = E.state;
        if (!P) return;
        var plan = enabled(st) ? S.live.plan(st) : [];
        var sig = JSON.stringify(plan.map(function (n) { return [n.key, n.at]; }));
        if (sig === lastSig && !force) return;
        lastSig = sig;
        var old = stored().map(function (id) { return { id: id }; });
        var go = function () {
          var list = plan.map(function (n) { n.tab = S.live.noteTab(n.key); return note(idFor(n.key), n, n.at); });
          try { localStorage.setItem(IDS, JSON.stringify(list.map(function (n) { return n.id; }))); } catch (e) { /* ignora */ }
          if (list.length) return P.schedule({ notifications: list }).catch(function () { lastSig = null; });
        };
        setup().then(function () { return old.length ? P.cancel({ notifications: old }).catch(function () {}) : null; }).then(go);
      }
    };
  })();
  /* mostra nas Definições se o telemóvel autorizou os lembretes */
  function notifStatus() {
    var box = document.getElementById('notif-status');
    if (!box) return;
    Notify.status().then(function (r) {
      if (!r || !box.isConnected) return;
      var h = [];
      if (r.display === 'granted') h.push('<span class="ok">● Notificações autorizadas</span>');
      else h.push('<span class="bad">● Notificações bloqueadas</span> <button class="btn sm" data-a="notif-perm">Autorizar</button>');
      if (r.exact === 'granted') h.push('<span class="ok">● Avisos à hora exata</span>');
      else h.push('<span class="warn">● Avisos podem atrasar alguns minutos</span> <button class="btn sm" data-a="notif-exact">Ativar hora exata</button>');
      box.innerHTML = h.join('<br>');
    });
  }
  function greet() {
    if (!E.state || !S.live) return;
    var l = S.live.ensure(E.state), away = Math.floor((now() - (l.lastSeen || now())) / 86400000);
    var g = S.live.greeting(E.state);
    // às vezes, em vez da faixa de saudação, o Sistema inicia uma conversa
    var talked = away >= 1 ? talkTry('ret', { away: away }, 1600) : (g ? talkTry('open', {}, 1600) : false);
    if (g && !talked) ui.notes.push(g.text);
    if (g || talked) S.storage.write(E.state);
  }
  /* ---------- Diálogos do Sistema ----------
     talkTry pede ao motor uma conversa (que decide com moderação se fala).
     A conversa espera que não haja janelas, animações nem batalhas a decorrer. */
  function talkTry(trigger, ctx, delay) {
    if (!E.state || !S.talk || ui.talkWait) return false;
    if (ui.popups.some(function (p) { return p.type === 'talk' || p.type === 'watch'; })) return false;
    var conv = S.talk.offer(E.state, trigger, ctx);
    if (!conv) return false;
    S.storage.write(E.state);
    ui.talkWait = { conv: conv, until: Date.now() + 25000 };
    setTimeout(talkShow, delay || 1000);
    return true;
  }
  function talkShow() {
    var w = ui.talkWait;
    if (!w || !E.state) { ui.talkWait = null; return; }
    if (Date.now() > w.until) { ui.talkWait = null; S.talk.cancel(E.state, w.conv); S.storage.write(E.state); return; }
    var busy = ui.popups.length || Date.now() < ui.holdUntil || Date.now() < ui.busyUntil || document.getElementById('sys-note') ||
      (ui.modal && !/^(boss|info|item)$/.test(ui.modal.type)) || (E.state.battle && !E.state.battle.over) || document.visibilityState === 'hidden' ||
      (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName));
    if (busy) { setTimeout(talkShow, 800); return; }
    ui.talkWait = null;
    ui.popups.push({ _id: ++ui.popSeq, type: 'talk', conv: w.conv });
    render();
  }
  function talkType() {
    var el = document.getElementById('talk-line'), ch = document.getElementById('talk-ch');
    if (!el) return;
    var full = el.getAttribute('data-full') || '';
    if (!FX.full()) { el.textContent = full; if (ch) ch.classList.remove('wait'); return; }
    var i = 0, id = ui.popups[0] && ui.popups[0]._id;
    el.classList.add('typing');
    (function step() {
      if (!el.isConnected || !ui.popups[0] || ui.popups[0]._id !== id) return;
      i = Math.min(full.length, i + (full.charAt(i) === ' ' ? 2 : 1));
      el.textContent = full.slice(0, i);
      if (i < full.length) setTimeout(step, /[.,?!]/.test(full.charAt(i - 1)) ? 140 : 22);
      else { el.classList.remove('typing'); var c2 = document.getElementById('talk-ch'); if (c2) c2.classList.remove('wait'); }
    })();
  }
  function talkFromEvents(evs) {
    if (!E.state) return;
    var bt = E.state.battle;
    for (var i = 0; i < evs.length; i++) {
      var ev = evs[i], r = false;
      if (ev.type === 'victory') r = talkTry('win', { boss: bt ? S.BOSS_BY_ID[bt.bossId] : S.BOSSES.concat(S.SECRET_BOSSES).filter(function (b) { return b.name === ev.name; })[0] }, 1200);
      else if (ev.type === 'defeat') r = talkTry('lose', { boss: bt ? S.BOSS_BY_ID[bt.bossId] : null }, 1200);
      else if (ev.type === 'penalty' && ev.title === 'MISSÃO FALHADA') r = talkTry('fail', { missao: ev.name, diaria: /^Missão Diária/.test(ev.name || '') }, 1200);
      else if (ev.type === 'levelup') r = talkTry('level', { level: ev.level, rankup: S.rankFor(ev.level).rank !== S.rankFor(ev.level - 1).rank }, 1200);
      else if (ev.type === 'skill') r = talkTry('skill', { skill: (ev.lines || [])[0] || '' }, 1200);
      else if (ev.type === 'loot') r = talkTry('chest', { tier: ev.tier }, 1200);
      if (r) return;
    }
  }
  function checkDeadlines() {
    if (!E.state) return;
    var ph = S.time.current();
    if (lastPhase && ph !== lastPhase) {
      var P = S.time.PHASES[ph];
      toast((hasArt('phase_' + ph) ? '' : P.icon + ' ') + P.name + ' (' + P.desc + '). Alguns itens mudaram de estado.');
      FX.banner(P.name.toUpperCase(), P.desc, ph === 'dia' || ph === 'manha' ? 'rgba(255,200,90,.4)' : 'rgba(120,100,255,.4)', ph === 'dia' || ph === 'manha' ? '#ffc85a' : '#a184ff');
      lastPhase = ph; render();
    }
    lastPhase = ph;
    var day = E.dateKey();
    var before = JSON.stringify(E.state.missionLog).length;
    var fails = M.processDeadlines();
    pullEvents();
    Notify.sync();
    var typing = document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if ((fails || day !== lastDay || JSON.stringify(E.state.missionLog).length !== before) && !(typing && ui.modal)) render();
    lastDay = day;
  }

  S.boot = function (el) {
    root = el;
    FX.init();
    root.addEventListener('click', onClick);
    Notify.setup();
    root.addEventListener('input', onInput);
    root.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
    E.load();
    FX.setMode((E.state && E.state.settings.fx) || FX.defaultMode());
    if (E.state) {
      lastDay = E.dateKey(); M.processDeadlines(); greet(); pullEvents(); Notify.sync(true);
      // pede autorização uma única vez (Android 13+)
      if (Notify.available() && !E.state.settings.notifAsked) { E.state.settings.notifAsked = true; E.commit('lembretes'); setTimeout(function () { Notify.ask().then(function () { Notify.sync(true); }); }, 4000); }
    }
    render();
    // No Android, confirma se a cópia nativa é mais recente (ex.: dados da WebView limpos)
    S.storage.loadNative().then(function (r) {
      if (r && (!E.state || r.t > (E.state.meta.savedAt || 0))) {
        E.state = E.migrate(r.state);
        S.storage.write(E.state);
        M.processDeadlines(); pullEvents(); render();
      }
    });
    setInterval(tick, 1000);
    setInterval(checkDeadlines, 30000);
    // conversas aleatórias: só enquanto o jogador está a usar a app (tocou em algo nos últimos 2 minutos)
    ui.bootAt = Date.now();
    setInterval(function () {
      if (!E.state || document.visibilityState === 'hidden') return;
      if (Date.now() - (ui.lastAct || 0) > 120000 || Date.now() - ui.bootAt < 90000) return;
      talkTry('idle', {}, 700);
    }, 60000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') { checkDeadlines(); if (E.state) { greet(); pullEvents(); } }
      else if (E.state) { S.storage.write(E.state); Notify.sync(true); }
    });
    window.addEventListener('pagehide', function () { if (E.state) S.storage.write(E.state); });
    // botão "voltar" do Android fecha janelas em vez de sair da app
    try {
      var App = globalThis.Capacitor && globalThis.Capacitor.Plugins && globalThis.Capacitor.Plugins.App;
      if (App && App.addListener) App.addListener('backButton', function () {
        if (ui.popups.length) { if (ui.popups[0].type === 'talk' && !ui.popups[0].res) H['talk-skip'](); else { ui.popups.shift(); render(); } }
        else if (ui.modal) H.close();
        else if (ui.page) H.back();
        else if (ui.tab !== 'status') H.tab({ t: 'status' });
        else if (App.minimizeApp) App.minimizeApp();
      });
    } catch (e) { /* sem plugin */ }
  };
})(globalThis.SYS = globalThis.SYS || {});
