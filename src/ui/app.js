/* ==========================================================
   INTERFACE
   ========================================================== */
(function (S) {
  'use strict';
  var E = S.engine, M = S.missions, C = S.combat, FX = S.fx;
  var root;
  var ui = {
    tab: 'status', page: null, shopTab: 'arma', gate: 1, bag: 'tudo',
    modal: null, popups: [], form: null, sheet: null, toast: null,
    intro: { step: 0, name: '', cls: null }, histLimit: 40, notes: [],
    pt: { x: 0, y: 0 }, popSeq: 0, shownPop: null, shownModal: null, lastView: null, holdUntil: 0, holdTimer: null,
    busyUntil: 0, bars: {}, lastCoins: null, lastSaves: null, lastLevel: null,
    fxMission: null, fxDaily: false, spawn: false, victoryAnim: false
  };

  /* ---------------- utilitários ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return Math.floor(n).toLocaleString('pt-PT'); }
  function kzFmt(n) { return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
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
    '💨': 'log_smoke', '🏃': 'log_flee', '↩️': 'st_reflect', '◀': 'log_hurt',
    '🌑': 'log_shadow', '👑': 'log_king', '⚡': 'log_storm', '🌸': 'log_petals', '🪞': 'log_mirror', '🪓': 'log_execute', '🌊': 'log_tide', '🥀': 'log_garden',
    '👤': 'log_first', '🪨': 'log_stone', '🖤': 'log_blackphoenix', '✚': 'log_restore', '🎫': 'log_ticket', '🌵': 'log_thorns' };
  var HIST_ICON = { '⏱️': 'h_time', '✅': 'h_mission_done', '✨': 'h_awaken', '❌': 'h_mission_fail', '⬆️': 'h_levelup', '🌀': 'h_secret_skill', '🌅': 'h_newday',
    '🏃': 'log_flee', '🏅': 'h_achievement', '🏆': 'log_victory', '💀': 'log_defeat', '💠': 'h_core', '💨': 'log_smoke', '💱': 'h_sell', '📝': 'h_mission_new',
    '📲': 'h_transfer', '🔰': 'h_shield', '🗺️': 'h_map', '🛒': 'h_buy', '👁️': 'ui_eye', '◆': 'ui_crystal',
    '🔔': 'h_bell', '🩸': 'h_blood', '📜': 'h_scroll', '🌑': 'log_shadow', '🌫️': 'h_fade', '🔒': 'ic_lock', '⚔️': 'log_appear', '⚡': 'log_storm',
    '🗝️': 'h_key', '🧭': 'h_compass', '⛓️': 'h_chains', '📊': 'h_stats' };
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
  function coins(n) { return '<span class="coins"><i class="coin-ico"></i><b class="cn">' + fmt(n) + '</b></span>'; }
  function crys(n) { return '<span class="crys"><i class="crys-ico"></i><b>' + fmt(n) + '</b></span>'; }
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
  function toast(msg, bad) { ui.toast = { msg: msg, bad: !!bad, t: Date.now() }; if (bad) sfx('error'); renderToast(); }
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
      if (ev.type === 'finale') return; // a conversa final entra pelo render (finaleTry)
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
    sfx('notify');
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
      h += '<div class="card tr-found"><div class="card-h">' + (S.avatar ? S.avatar.html(P.cls, P.level, '', P.gender || 'm') : '') + '<div class="grow"><div class="hint">Conta encontrada</div><div class="card-t">' + esc(P.name) + '</div>' +
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
      var art = I.gender === 'f' ? (S.CLASS_ART[id + '_f'] || (S.AVATARS[id + '_f'] && S.AVATARS[id + '_f'][1]) || null) : S.CLASS_ART[id];
      return '<button class="class-card' + (I.cls === id ? ' on' : '') + '" data-a="intro-cls" data-v="' + id + '">' +
        (art ? '<div class="art"><img src="' + art + '" alt="' + c.name + '" loading="lazy"></div>' : '') +
        '<div class="row"><span style="font-size:22px">' + classIcon(id) + '</span><span class="nm" style="color:' + c.color + '">' + c.name + '</span></div>' +
        '<div class="minibars">' + bars + '</div></button>';
    }).join('');
    var sel = I.cls ? S.CLASSES[I.cls] : null;
    return '<div class="intro">' +
      '<div class="win"><div class="win-h">Registo do Jogador</div>' +
      '<label class="f">Nome do jogador<input class="in" id="in-name" maxlength="24" placeholder="Como te chamas?" value="' + esc(I.name) + '" data-f="intro-name" autocomplete="off"></label>' +
      '<div class="small muted" style="margin-top:10px">Aparência</div><div class="gender-pick">' + [['m', 'Masculina', '♂'], ['f', 'Feminina', '♀']].map(function (g) {
        return '<button class="gender-opt' + (I.gender === g[0] ? ' on' : '') + '" data-a="intro-g" data-v="' + g[0] + '"><span class="g-ico">' + g[2] + '</span>' + g[1] + '</button>'; }).join('') + '</div>' +
      '<p class="hint" style="margin:6px 0 0">Muda só o avatar. As classes e a progressão são iguais.</p></div>' +
      '<div class="win"><div class="win-h">Escolhe a tua classe</div><div class="class-grid">' + cards + '</div>' +
      (sel ? '<div class="card class-detail" style="margin-top:10px">' + S.avatar.html(sel.id, 1, '', I.gender || 'm') + '<div class="stack" style="gap:6px;min-width:0">' +
        '<div><b style="color:' + sel.color + '">' + sel.name + '</b> — ' + esc(sel.desc) + '</div>' +
        '<div class="meta">' + S.STATS.map(function (k) { return S.STAT_INFO[k].short + ' ' + sel.base[k]; }).join(' · ') + '</div>' +
        '<div class="hint">Cresce sozinho em ' + sel.growth.map(function (k) { return S.STAT_INFO[k].name; }).join(' e ') + ' a cada nível.</div></div></div>' : '') +
      '</div>' +
      '<button class="btn pri block" data-a="intro-go"' + (I.cls && I.gender ? '' : ' disabled') + '>Despertar</button>' + (I.cls && !I.gender ? '<p class="hint" style="text-align:center">Escolhe a aparência do teu avatar.</p>' : '') + '</div>';
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
      if (i % 6 === 0 && INTRO_TEXT.charAt(i - 1) !== ' ') sfx('type');
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
      '<span class="top-name' + nameCls(st) + '"' + nameStyle(st) + '>' + esc(st.name) + '</span>' +
      '<span class="top-time' + (S.time.tampered(st) ? ' bad' : '') + '" title="' + (S.time.tampered(st) ? 'Relógio do telemóvel atrasado: o Sistema não aceita' : 'Hora do aparelho') + '">' +
        '<span class="phase-chip" title="' + S.time.PHASES[S.time.current()].name + '">' + phaseIcon(S.time.current()) + '</span>' +
        '<b id="top-clock" class="mono">' + clockText() + '</b></span>' +
      '<span class="save-dot' + (S.storage.lastError ? ' err' : '') + '" title="' + (S.storage.lastError ? 'Erro ao gravar' : 'Progresso gravado') + '"></span>' +
      '<span id="top-coins">' + coins(st.coins) + '</span>' +
      '<button class="top-crys" data-a="prem-open" aria-label="Ala Premium: ' + (st.crystals || 0) + ' Cristais">' + crys(st.crystals || 0) + '</button></div>' +
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
    if (ui.page === 'servos') return servantsPage(st);
    if (ui.page === 'avisos') return noticesPage(st);
    if (ui.page === 'social') return socialPage(st);
    if (ui.page === 'chat') return chatPage(st);
    if (ui.page === 'duel') return duelPage(st);
    if (ui.page === 'settings') return settingsPage(st);
    if (ui.page === 'credits') return creditsPage(st);
    if (ui.page === 'reports') return reportsPage(st);
    if (ui.page === 'premium') return premiumPage(st);
    var cls = S.CLASSES[st.cls];
    var cs = E.combatStats(st);
    var t = E.totalStats(st);
    var need = S.xpToNext(st.level);
    var r = S.rankFor(st.level);
    var dl = E.equipDelta(st);
    var h = '';
    h += '<section class="win"><div class="win-h">Estado <small>' + uiIcon('ui_sysday', '', 'tag-ico') + 'Dia ' + S.time.systemDay(st) + ' do Sistema · Poder ' + fmt(cs.power) + '</small></div>' +
      '<div class="hero" style="--aura:' + r.color + '">' + heroAvatar(st) +
      '<div class="stack" style="gap:8px;min-width:0">' +
      '<div><div class="hero-name' + nameCls(st) + '"' + nameStyle(st) + '>' + esc(st.name) + '</div><div class="hero-title shine"' + titleStyle(st) + '>' + esc(S.premium.titleOf(st)) + '</div>' + selfLegal(st) + '</div>' +
      '<div class="row" style="align-items:flex-end"><div><div class="lv-lab">Nível</div><div class="lv-big">' + st.level + '</div></div>' +
      '<div class="grow" style="padding-bottom:4px"><div class="lv-lab">Classe</div><div style="color:' + cls.color + ';font-family:var(--f-display);font-weight:700">' + classIcon(st.cls) + ' ' + cls.name + '</div>' +
      '<div class="lv-lab" style="margin-top:4px">Rank <b style="color:' + r.color + '">' + r.rank + '</b>' + (S.body.current(st) ? ' · Peso <b>' + String(S.body.current(st)).replace('.', ',') + ' kg</b>' : '') + '</div></div></div>' +
      '<div>' + (need ? bar('xp', st.xp, need, 'XP', 'st-xp') : '<div class="hint" style="color:var(--gold)">NÍVEL MÁXIMO</div>') + '</div>' +
      formsHtml(st) +
      '</div></div>' +
      '<div class="stack" style="margin-top:12px;gap:8px">' + bar('hp', E.curHp(st), cs.maxHp, 'Vida', 'st-hp') + bar('mp', cs.maxMp, cs.maxMp, 'Mana') + '</div>' +
      '<div class="kv" style="margin-top:12px">' +
      '<div><span class="muted">Ataque</span><b>' + fmt(cs.atk) + eqPlus(dl.combat.atk) + '</b></div><div><span class="muted">Ataque mágico</span><b>' + fmt(cs.matk) + eqPlus(dl.combat.matk) + '</b></div>' +
      '<div><span class="muted">Defesa</span><b>' + fmt(cs.def) + eqPlus(dl.combat.def) + '</b></div><div><span class="muted">Crítico</span><b>' + cs.crit.toFixed(1) + '%' + eqPlus(dl.combat.crit, '%') + '</b></div>' +
      '<div><span class="muted">Dano crítico</span><b>' + cs.critDmg + '%' + eqPlus(dl.combat.critDmg, '%') + '</b></div><div><span class="muted">Esquiva</span><b>' + cs.eva.toFixed(1) + '%' + eqPlus(dl.combat.eva, '%') + '</b></div>' +
      '</div>' + effectsHtml(st) + '</section>';

    h += '<section class="win' + (st.freePoints ? ' gold' : '') + '"><div class="win-h">Atributos' + (st.freePoints ? ' <span class="points">' + st.freePoints + ' pontos livres</span>' : '<small>+' + S.POINTS_PER_LEVEL + ' pontos por nível</small>') + '</div>' +
      S.STATS.map(function (k) {
        var info = S.STAT_INFO[k];
        var tr = st.trained[k], eqb = dl.stats[k];
        return '<div class="stat"><span class="stat-k">' + uiIcon('stat_' + k, '', 'stat-img') + info.short + '</span>' +
          '<span class="stat-n">' + info.name + '<small>' + info.desc + (tr > 0 ? ' · treino +' + tr.toFixed(1) : '') + '</small></span>' +
          '<span class="stat-v" data-stat="' + k + '">' + Math.floor(t[k]) + (eqb ? '<small class="eq-plus' + (eqb < 0 ? ' neg' : '') + '">' + (eqb > 0 ? '+' : '') + eqb + '</small>' : '') + '</span>' +
          (st.freePoints ? '<button class="btn icon gold" data-a="alloc" data-s="' + k + '" aria-label="Adicionar ponto em ' + info.name + '">+</button>' : '<span></span>') + '</div>';
      }).join('') + '</section>';

    h += '<section class="win"><div class="win-h">Equipamento</div><div class="list">' +
      [['weapon', 'Arma'], ['armor', 'Armadura'], ['acc1', 'Acessório 1'], ['acc2', 'Acessório 2']].map(function (sl) {
        var id = st.equip[sl[0]], it = id && E.item(id);
        return '<button class="card tap" data-a="slot" data-s="' + sl[0] + '"><div class="card-h">' + itemIco(it) + '' +
          '<div class="grow"><div class="hint">' + sl[1] + '</div><div class="card-t" style="color:' + (it ? rc(it.rarity) : 'var(--faint)') + '">' + (it ? esc(it.name) : 'Vazio') + '</div>' +
          (it ? '<div class="meta">' + equipSummary(it) + phaseTag(it) + '</div>' : '') + '</div></div></button>';
      }).join('') + '</div>' + equipTotalsHtml(dl) + '</section>';

    var achDone = Object.keys(st.achievements).length;
    var unr = S.shop.unread(st);
    if (unr) h += '<button class="notice-banner" data-a="page" data-p="avisos"><span class="nb-ico">' + uiIcon('ui_mail', '✉', 'nb-img') + '</span><span class="grow"><b>' + (unr === 1 ? '1 aviso novo' : unr + ' avisos novos') + '</b><span class="small muted">da administração do Sistema</span></span><span class="nb-go">Ler ›</span></button>';
    h += '<section class="win"><div class="win-h">Registos</div><div class="menu-grid">' +
      '<button class="btn prem menu-prem" data-a="prem-open" data-t="loja"><i class="crys-ico"></i> Loja Premium <span class="muted">' + fmt(st.crystals || 0) + '</span></button>' +
      '<button class="btn" data-a="page" data-p="skills">Habilidades <span class="muted">' + E.unlockedSkills(st).length + '</span></button>' +
      '<button class="btn" data-a="page" data-p="ach">Conquistas <span class="muted">' + achDone + '/' + S.ACHIEVEMENTS.length + '</span></button>' +
      '<button class="btn" data-a="page" data-p="trophies">Troféus <span class="muted">' + E.trophyCount(st) + '/' + Object.keys(S.TROPHIES).length + '</span></button>' +
      '<button class="btn notice-menu' + (S.shop.unread(st) ? ' has-new' : '') + '" data-a="page" data-p="avisos">Avisos ' + (S.shop.unread(st) ? '<span class="badge-in">' + S.shop.unread(st) + '</span>' : '<span class="muted">' + S.shop.notices(st).list.length + '</span>') + '</button>' +
      '<button class="btn soc-menu' + (SO.badge() ? ' has-new' : '') + '" data-a="page" data-p="social">' + 'Duelos e Amigos ' + (SO.badge() ? '<span class="badge-in">' + SO.badge() + '</span>' : (SO.cache && SO.cache.ok ? '<span class="muted">' + SO.cache.friends.filter(function (f) { return f.online; }).length + ' online</span>' : '')) + '</button>' +
      '<button class="btn sh-menu" data-a="page" data-p="servos">Servos <span class="muted">' + Sh.owned(st).length + '</span></button>' +
      '<button class="btn" data-a="page" data-p="collection">Coleção</button>' +
      '<button class="btn" data-a="page" data-p="history">Histórico</button>' +
      '<button class="btn" data-a="page" data-p="settings">Definições</button>' +
      '<button class="btn" data-a="page" data-p="reports">Relatórios <span class="muted">' + ((st.live && st.live.reports) || []).length + '</span></button>' +
      '<button class="btn credits-btn" data-a="page" data-p="credits">Créditos</button>' +
      '</div></section>';
    return h;
  }
  /* bónus do equipamento: pequeno "+N" ao lado de cada valor */
  function eqPlus(v, unit) {
    if (!v) return '';
    var n = Math.abs(v) % 1 ? Math.abs(v).toFixed(1) : fmt(Math.abs(v));
    return '<small class="eq-plus' + (v < 0 ? ' neg' : '') + '">' + (v > 0 ? '+' : '−') + n + (unit || '') + '</small>';
  }
  var EQ_LABELS = [['maxHp', 'Vida máxima', ''], ['maxMp', 'Mana máxima', ''], ['atk', 'Ataque', ''], ['matk', 'Ataque mágico', ''], ['def', 'Defesa', ''],
    ['crit', 'Crítico', '%'], ['critDmg', 'Dano crítico', '%'], ['eva', 'Esquiva', '%'], ['lifesteal', 'Roubo de vida', '%'], ['regenHp', 'Regeneração de vida', '%/turno'],
    ['regenMp', 'Regeneração de mana', '/turno'], ['summonPct', 'Força das invocações', '%'], ['xpPct', 'XP ganho', '%'], ['coinPct', 'Moedas ganhas', '%'],
    ['thorns', 'Espinhos (devolve dano)', '%'], ['openShield', 'Escudo inicial', '% da vida'], ['execute', 'Dano a chefes com <30% de vida', '%'], ['firstStrike', 'Dano do 1.º golpe', '%'],
    ['manaOnHit', 'Mana por golpe', '%'], ['dotPct', 'Dano de veneno/queimadura', '%'], ['stunRes', 'Resistência a atordoar', '%'], ['potionPct', 'Força das poções', '%']];
  /* Conjunto do Monarca: bónus por peças soberanas equipadas */
  function monarchSetHtml(st) {
    var n = E.monarchPieces(st);
    return '<div class="mset"><div class="mset-h">Conjunto do Monarca <span class="mono">' + n + '/4 equipadas</span></div><p class="small muted" style="margin:2px 0 6px">Todo o equipamento soberano cresce contigo e fica sempre acima do melhor equipamento normal do teu nível. Usar várias peças ao mesmo tempo dá bónus extra:</p><ul>' +
      S.MONARCH_SET.map(function (t) { return '<li class="' + (n >= t.n ? 'on' : '') + '"><b>' + t.n + ' peças</b> ' + esc(t.desc) + '</li>'; }).join('') + '</ul></div>';
  }
  function equipTotalsHtml(dl) {
    var stats = S.STATS.filter(function (k) { return dl.stats[k]; }).map(function (k) { return '<li><span>' + S.STAT_INFO[k].name + '</span>' + eqPlus(dl.stats[k]) + '</li>'; });
    var comb = EQ_LABELS.filter(function (x) { return dl.combat[x[0]]; }).map(function (x) { return '<li><span>' + x[1] + '</span>' + eqPlus(dl.combat[x[0]], x[2]) + '</li>'; });
    if (!stats.length && !comb.length) return '<p class="hint" style="margin:10px 0 0">Sem equipamento: nenhum bónus ativo.</p>';
    var mp = E.monarchPieces(E.state);
    if (mp >= 2) comb.push('<li class="eq-set"><span>Conjunto do Monarca (' + mp + ' peças)</span><small class="eq-plus">ativo</small></li>');
    return '<div class="eq-total"><div class="eq-total-h">Total que o teu equipamento te dá</div><ul>' + stats.concat(comb).join('') + '</ul>' +
      '<p class="hint" style="margin:6px 0 0">Valores somados de todas as peças equipadas, já com as percentagens aplicadas aos teus atributos.</p></div>';
  }
  function effectsHtml(st) {
    E.cleanEffects(st);
    var perk = st.perks && st.perks.monarca ? '<span class="tag prem-perm">' + (artId('pr_selo') ? '<img class="chip-img" src="' + artId('pr_selo') + '" alt="">' : '🔱 ') + 'Selo do Monarca Eterno · +15% XP e moedas</span>' : '';
    if (!st.effects.length && !perk) return '';
    return '<div class="row wrap" style="margin-top:10px">' + perk + st.effects.map(function (e) {
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
    if (q.thorns) out.push('Espinhos: devolve ' + q.thorns + '% do dano');
    if (q.openShield) out.push('Escudo inicial ' + q.openShield + '% vida');
    if (q.execute) out.push('Execução +' + q.execute + '% (chefe <30%)');
    if (q.firstStrike) out.push('Primeiro golpe +' + q.firstStrike + '%');
    if (q.manaOnHit) out.push('+' + q.manaOnHit + '% mana por golpe');
    if (q.dotPct) out.push('Venenos e chamas +' + q.dotPct + '%');
    if (q.stunRes) out.push('Resiste a atordoar ' + q.stunRes + '%');
    if (q.potionPct) out.push('Poções curam +' + q.potionPct + '%');
    return out.map(function (x) { return '<span>' + x + '</span>'; }).join('');
  }
  function backBtn(title) { return '<div class="row" style="margin-top:14px"><button class="btn sm ghost" data-a="back">‹ Voltar</button><h2 style="font-size:18px">' + title + '</h2></div>'; }

  function skillIco(s, cls) {
    var src = S.SKILL_ART && S.SKILL_ART[s.id];
    return src ? '<div class="ico has-img skill-ico' + (cls ? ' ' + cls : '') + '"><img src="' + src + '" alt="" loading="lazy"></div>' : '';
  }
  /* ---------- patentes dos duelos ---------- */
  function ptIcon(i, cls) { var r = S.DUEL_RANKS[i]; return uiIcon(r.id, '<span class="pt-fb" style="--pc:' + r.color + '">' + r.icon + '</span>', cls || 'pt-img'); }
  function ptChip(points) {
    if (points == null || !S.duelRank) return '';
    var r = S.duelRank(points).rank;
    return '<span class="pt-chip" style="--pc:' + r.color + '">' + ptIcon(r.i, 'pt-chip-img') + esc(r.tierName) + (r.div ? ' ' + ['I', 'II', 'III', 'IV', 'V'][r.div - 1] : '') + '</span>';
  }
  function ptCard(points) {
    var R = S.duelRank(points), r = R.rank;
    return '<button class="pt-card" data-a="pt-info" style="--pc:' + r.color + '"><span class="pt-big">' + ptIcon(r.i, 'pt-big-img') + '</span><span class="grow"><span class="small muted">Patente</span><b class="pt-name">' + esc(r.name) + '</b>' +
      (R.max ? '<span class="small">Patente máxima · <b class="mono">' + R.points + '</b> pontos</span>' :
        '<span class="pt-bar"><i style="width:' + Math.round(R.into / R.need * 100) + '%"></i></span><span class="small muted">' + R.into + '/' + R.need + ' · faltam ' + R.toNext + (R.toNext === 1 ? ' vitória' : ' vitórias') + ' para ' + esc(R.next.name) + '</span>') +
      '</span><span class="muted">›</span></button>';
  }
  function ptModal() {
    var c = SO.cache, so = E.state.social || {}, pts = c && c.me ? c.me.points || 0 : (so.points || 0), R = S.duelRank(pts);
    var best = Math.max(R.rank.i, so.bestRank || 0, c && c.me && c.me.best != null ? S.duelRank(c.me.best).rank.i : 0);
    var h = '<div class="sheet-h"><h2>Patentes dos duelos</h2><button class="btn sm ghost" data-a="close">Fechar</button></div>' +
      '<p class="small" style="margin-top:0">Cada vitória num duelo dá <b>+1 ponto</b> e cada derrota tira <b>1 ponto</b>. A cada 5 pontos sobes de patente; se desceres abaixo do limite, voltas à anterior. Aos <b>200 pontos</b> chegas a Monarca dos Duelos: daí para a frente os pontos continuam a contar, mas a patente só muda se voltares aos 199.</p>' +
      '<div class="pt-now" style="--pc:' + R.rank.color + '">' + ptIcon(R.rank.i, 'pt-now-img') + '<div><b>' + esc(R.rank.name) + '</b><div class="small muted">' + R.points + ' pontos</div></div></div>';
    S.DUEL_TIERS.concat([{ id: 'monarca', short: 'Monarca', color: '#ffd86b' }]).forEach(function (t) {
      var list = S.DUEL_RANKS.filter(function (r) { return r.tier === t.id; });
      h += '<div class="info-h" style="color:' + t.color + '">' + esc(t.short) + '</div><div class="pt-grid">' + list.map(function (r) {
        var got = r.i <= best, cur = r.i === R.rank.i;
        return '<div class="pt-cell' + (got ? ' got' : '') + (cur ? ' cur' : '') + '" style="--pc:' + r.color + '">' + ptIcon(r.i, 'pt-cell-img') + '<span class="pt-cell-n">' + (r.div ? ['I', 'II', 'III', 'IV', 'V'][r.div - 1] : '♛') + '</span><span class="pt-cell-p mono">' + r.min + '</span></div>';
      }).join('') + '</div>';
    });
    return h;
  }
  /* identificador do Comandante (penúltimo) e do Chefe da arena (último) */
  function rankBadge(b, cls) {
    var r = S.shadows && S.shadows.rank(b);
    if (r === 'commander') return '<span class="rk-badge rk-c' + (cls ? ' ' + cls : '') + '">Comandante</span>';
    if (r === 'final') return '<span class="rk-badge rk-f' + (cls ? ' ' + cls : '') + '">' + (cls === 'bt-rk' ? 'Chefe' : 'Chefe da arena') + '</span>';
    return '';
  }
  function trophyArt(b) { return (S.TROPHY_ART && S.TROPHY_ART[b.id]) || null; }
  /* imagem que abre a ficha detalhada ao tocar */
  /* marca de jogador legalizado (código de ativação oficial) e de premium legalizado (comprou na Loja de Cristais) */
  function titleStyle(st) { var c = S.premium.titleColor(st); return c ? ' style="color:' + c + ';-webkit-text-fill-color:' + c + ';text-shadow:0 0 10px ' + c + '66"' : ''; }
  function legalTag(legal, premium, cls) { if (!legal) return ''; return '<span class="legal-tag' + (premium ? ' prem' : '') + (cls ? ' ' + cls : '') + '" title="Ativado com um código oficial">' + (premium ? '◆ Premium legalizado' : '✔ Legalizado') + '</span>'; }
  function selfLegal(st) { return legalTag(st.shop && st.shop.legal, st.shop && st.shop.role && st.shop.role.id === 'premium'); }
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
    if (b && b.premium && tr && st.trophies[b.id]) {
      /* troféus das arenas exclusivas: mesma ficha dos troféus comuns, com o troféu em grande */
      var part = trophyArt(b) || (S.BOSS_ART && S.BOSS_ART[b.id]), champ = S.ARENA_BOSSES.filter(function (c) { return c.arena === b.arena; })[0];
      var gs = S.ARENA_LADDER[b.arena] ? S.ARENA_LADDER[b.arena].filter(function (x) { return x.guardian; }) : [], gh = gs.filter(function (x) { return st.trophies[x.id]; }).length;
      var pw = typeof st.defeated[b.id] === 'number' && st.defeated[b.id] > 1e9 ? timeStr(st.defeated[b.id]) : '';
      var prow = [['Raridade', S.RARITY[tr.rarity].name], [b.guardian ? 'Sub-chefe' : 'Campeão', b.name + ' (Nv ' + b.level + ')'], ['Arena', b.arenaName || (champ && champ.arenaName) || 'Coliseu dos Condenados'], ['Vitórias', String((st.arena && st.arena.wins && st.arena.wins[b.id]) || 0)]];
      if (pw) prow.push(['Conquistado', pw]);
      return '<div class="sheet-h"><h2 style="color:' + rc(tr.rarity) + '">' + esc(tr.name) + '</h2>' + backOrClose(m) + '</div>' +
        (part ? '<div class="info-img trophy-big" style="--rc:' + rc(tr.rarity) + '"><img src="' + part + '" alt=""></div>' : '<div class="nc-big">' + b.icon + '</div>') +
        loreHtml(S.lore.trophyText(b) || S.lore.bossText(b)) +
        infoSecs([{ title: 'Registo', rows: prow }, b.guardian ?
          { title: 'Sub-chefes desta arena', rows: [['Troféus', gh + ' / ' + gs.length]] } :
          { title: 'Coliseu dos Condenados', rows: [['Campeões vencidos', S.ARENA_BOSSES.filter(function (c) { return st.trophies[c.id]; }).length + ' / ' + S.ARENA_BOSSES.length]] }]);
    }
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
    var tag = s.type === 'passive' ? '<span class="tag">Passiva</span>' : '<span class="tag">' + S.skillCost(s, E.state.cls, E.state.level) + ' MP · recarga ' + s.cd + '</span>';
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
  /* conquistas: grelha de medalhas por categoria */
  var ACH_CATS = [
    ['missoes', 'Missões e disciplina', '📋', 'm1 m10 m50 m100 m500 m1000 mS mS10 create10 d1 d7 d30 d100 d365 emg1 emg10 hid1 hid10 zone1 trust leisure night early fail1'],
    ['progresso', 'Progresso e poder', '⭐', 'l5 l10 l25 l50 l75 l100 points all50 all100 core skill20 secret3 form10 form34'],
    ['combate', 'Combate e portões', '⚔️', 'b1 b10 b25 b50 b100 b200 giant giant10 giant3 clutch flawless flaw10 lose5 lose15 brave secretboss architect'],
    ['sombras', 'Sombras e servos', '🌑', 'duel1 duel10 duel50 duelperf friend5 friend20 sh1 sh10 sh25 sh50 sh100 shking shking10 shar1 shar10 sharch shar100 shfirst shlast shlost shlost10 shname shfull spar1 spar25 sparlose'],
    ['coliseu', 'Coliseu', '🏟️', 'ar_1 ar_5 ar_10 ar_first ar1 ar5 ar10 grd1 grd45 grd90 ten1 champ1 champ5 champ10 firstp rematch'],
    ['trofeus', 'Troféus', '🏆', 'tr25 tr100 tr202 set1 set5 set10'],
    ['riqueza', 'Riqueza e coleção', '💰', 'rich rich2 rich3 spend sell50 collector items100 arsenal chest25 chest100 chest500 spch10 spchm secretchest potions talk50'],
    ['exclusiva', 'Loja Exclusiva e aparência', '💎', 'prem1 relic1 relic7 mset2 mset4 eternal frame1 frame5'],
    ['corpo', 'Corpo e peso', '⚖️', 'body1 body7 body30 bodyg']
  ];
  function achGroups() {
    var byId = {}, used = {};
    S.ACHIEVEMENTS.forEach(function (a) { byId[a.id] = a; });
    var g = ACH_CATS.map(function (c) {
      var list = c[3].split(' ').filter(function (id) { return byId[id] && !used[id] && (used[id] = 1); }).map(function (id) { return byId[id]; });
      return { id: c[0], name: c[1], icon: c[2], list: list };
    });
    var rest = S.ACHIEVEMENTS.filter(function (a) { return !used[a.id]; });
    if (rest.length) g.push({ id: 'outras', name: 'Outras', icon: '✨', list: rest });
    return g;
  }
  function achReward(a, hidden) {
    var r = a.reward || {}, rw = [];
    if (r.chest) rw.push(S.ITEMS['bau_' + r.chest].name);
    if (r.coins) rw.push(fmt(r.coins) + ' moedas');
    if (r.item) rw.push(S.ITEMS[r.item].name);
    if (r.skill) rw.push(hidden ? 'Habilidade secreta' : 'Habilidade ' + S.ALL_SKILLS[r.skill].name);
    return rw.join(' · ');
  }
  function achTile(st, a) {
    var done = st.achievements[a.id], hidden = a.secret && !done;
    var img = hidden ? uiIcon('ach_hidden', '<span class="ach-emo">❔</span>', 'ach-medal') : uiIcon('ach_' + a.id, '<span class="ach-emo">' + a.icon + '</span>', 'ach-medal');
    return '<button class="ach-tile' + (done ? ' got' : '') + (a.secret ? ' secret' : '') + '" data-a="ach-info" data-id="' + a.id + '">' +
      '<span class="ach-orb">' + img + (done ? '<i class="ach-ok">✓</i>' : '') + '</span>' +
      '<span class="ach-name">' + esc(hidden ? '???' : (a.realName || a.name)) + '</span></button>';
  }
  function achPage(st) {
    var f = ui.achFilter || 'todas', groups = achGroups();
    var total = S.ACHIEVEMENTS.length, got = S.ACHIEVEMENTS.filter(function (a) { return st.achievements[a.id]; }).length;
    var h = backBtn('Conquistas');
    h += '<section class="win ach-head"><div class="ach-sum"><b>' + got + '</b><span class="muted">/ ' + total + '</span><span class="small muted grow" style="text-align:right">' + Math.round(got / total * 100) + '% completo</span></div>' +
      '<div class="ach-bar"><i style="width:' + (got / total * 100).toFixed(1) + '%"></i></div>' +
      '<div class="chips" style="margin-top:10px">' + [['todas', 'Todas'], ['feitas', 'Feitas'], ['falta', 'Por fazer']].map(function (x) {
        return '<button class="chip' + (f === x[0] ? ' on' : '') + '" data-a="ach-filter" data-f="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></section>';
    var any = false;
    groups.forEach(function (g) {
      var n = g.list.filter(function (a) { return st.achievements[a.id]; }).length;
      var list = g.list.filter(function (a) { var d = !!st.achievements[a.id]; return f === 'todas' || (f === 'feitas' ? d : !d); });
      if (!list.length) return;
      any = true;
      h += '<section class="win ach-sec"><div class="win-h">' + uiIcon('achcat_' + g.id, g.icon, 'tag-ico') + ' ' + esc(g.name) + ' <small>' + n + '/' + g.list.length + '</small></div>' +
        '<div class="ach-bar thin"><i style="width:' + (n / g.list.length * 100).toFixed(1) + '%"></i></div>' +
        '<div class="ach-grid">' + list.map(function (a) { return achTile(st, a); }).join('') + '</div></section>';
    });
    if (!any) h += '<section class="win"><div class="empty">' + (f === 'feitas' ? 'Ainda não tens conquistas.' : 'Completaste todas as conquistas!') + '</div></section>';
    return h;
  }
  function achInfoModal(m) {
    var st = E.state, a = S.ACHIEVEMENTS.filter(function (x) { return x.id === m.id; })[0];
    if (!a) return '';
    var done = st.achievements[a.id], hidden = a.secret && !done, rw = achReward(a, hidden);
    var g = achGroups().filter(function (x) { return x.list.indexOf(a) >= 0; })[0];
    var when = typeof done === 'number' && done > 1e9 ? timeStr(done) : '';
    var img = hidden ? uiIcon('ach_hidden', '❔', 'medal-img') : uiIcon('ach_' + a.id, a.icon, 'medal-img');
    return '<div class="sheet-h"><h2>' + esc(hidden ? 'Conquista secreta' : (a.realName || a.name)) + '</h2>' + backOrClose(m) + '</div>' +
      '<div class="ach-big' + (done ? ' got' : '') + '">' + img + '</div>' +
      '<p class="small" style="text-align:center">' + esc(hidden ? 'Esta conquista é secreta. Descobre-a a jogar.' : a.desc) + '</p>' +
      infoSecs([{ title: 'Registo', rows: [['Categoria', g ? g.name : '—'], ['Estado', done ? 'Concluída' : 'Por fazer']].concat(when ? [['Conquistada', when]] : []).concat(rw ? [['Recompensa', rw]] : []) }]);
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
  /* ================= ALA PREMIUM ================= */
  function dossierHtml(b) {
    var x = b.story;
    if (!x) return '';
    return '<div class="dossier" style="--ac:' + b.color + '"><div class="dos-h"><span>DOSSIÊ DO SISTEMA</span><span class="mono">' + esc(b.arenaName) + '</span></div>' +
      '<blockquote class="dos-quote">«' + esc(x.quote) + '»</blockquote>' +
      '<dl class="dos-kv"><dt>Registo</dt><dd class="mono">' + esc(x.record) + '</dd><dt>Crime</dt><dd>' + esc(x.crime) + '</dd><dt>Sentença</dt><dd>' + esc(x.sentence) + '</dd><dt>Arena</dt><dd>' + esc(x.arenaDesc) + '</dd></dl>' +
      '<div class="dos-sig"><b><i class="crys-ico"></i> ' + esc(x.sig.name) + '</b><span>' + esc(x.sig.desc) + '</span></div></div>';
  }
  function arenaFoot(st, b) {
    var ps = S.premium.status(st, b), h = '';
    var rules = '<p class="hint">Na arena não se perde nível: se caíres, perdes 25% do XP do nível. Um adversário já vencido pode ser revisitado quando quiseres, mas a revisitação não dá recompensas nem tira XP. Só podes usar ' + S.PREMIUM_RULES.perBattle + ' relíquia premium por batalha.</p>';
    if (b.champion) {
      var rl = S.ITEMS[b.relic];
      h = dossierHtml(b) + '<div class="card prem-card" style="margin-top:12px;--ac:' + b.color + '"><div class="small muted">Relíquia da primeira vitória</div><div class="card-h" style="margin-top:6px">' + tapInfo(itemIco(rl), 'item', rl.id) +
        '<div class="grow"><div class="card-t" style="color:' + rc(rl.rarity) + '">' + esc(rl.name) + '</div><div class="meta">' + equipSummary(rl) + '</div></div>' + (st.inv[rl.id] || ps.wins ? '<span class="tag good">Tua</span>' : '') + '</div></div>';
    } else {
      var ch = S.BOSS_BY_ID[b.arenaKey];
      h = '<div class="card prem-card" style="margin-top:12px;--ac:' + b.color + '"><div class="small muted">' + esc(b.arenaName) + ' · combate ' + b.slot + ' de 10</div>' +
        '<div class="small" style="margin-top:4px">' + (b.lieutenant ? 'O Comandante guarda a porta de ' : 'Ao fundo da escada espera ') + '<b style="color:' + b.color + '">' + esc(ch.name) + '</b>.</div></div>';
    }
    h += rules;
    if (!ps.unlocked) h += '<button class="btn prem block" data-a="arena-unlock" data-id="' + b.arenaKey + '"><i class="crys-ico"></i> Desbloquear a arena por ' + S.BOSS_BY_ID[b.arenaKey].cost + ' Cristais</button>';
    else if (!ps.open) h += '<div class="empty">' + uiIcon('ic_lock', '🔒', 'btn-ico') + ' Vence primeiro ' + esc(ps.prev.name) + '.</div>';
    else if (ps.readyAt) h += '<div class="empty">' + esc(b.champion ? 'O Campeão' : b.name.split(',')[0]) + ' recupera em ' + cd(ps.readyAt) + '.</div>';
    else h += '<button class="btn pri block" data-a="fight" data-id="' + b.id + '">' + (ps.wins ? 'Revisitar (sem recompensas)' : 'Entrar na arena') + '</button>';
    return h;
  }
  function premItemCard(st, it) {
    var owned = (it.equip && (E.count(st, it.id) > 0 || Object.keys(st.equip).some(function (k) { return st.equip[k] === it.id; }))) ||
      (it.perma && E.count(st, it.id) > 0) || (it.perk && ((st.perks && st.perks[it.perk]) || E.count(st, it.id) > 0));
    var tag = it.perma ? '<span class="tag prem-perm">Permanente · recarrega em ' + it.recharge + 'h</span>' : it.perk ? '<span class="tag prem-perm">Bónus para sempre</span>' : it.equip ? '<span class="tag prem-perm">Equipamento permanente</span>' : '';
    var price = S.premium.price(it.id);
    var can = (st.crystals || 0) >= price;
    return '<div class="card prem-card"><div class="card-h">' + tapInfo(itemIco(it), 'item', it.id) + '<div class="grow">' +
      '<div class="card-t" style="color:' + rc(it.rarity) + '">' + esc(it.name) + '</div>' + (tag ? '<div style="margin:2px 0 4px">' + tag + '</div>' : '') + '<div class="small muted">' + esc(it.desc) + '</div>' +
      (it.equip ? '<div class="meta">' + equipSummary(it) + '</div>' : '') +
      (it.perma && owned ? '<div class="hint">' + (S.premium.relicReady(st, it.id) ? 'Pronta a usar' : 'A recarregar: <span data-cd="' + S.premium.relicReadyAt(st, it.id) + '">' + cdText(S.premium.relicReadyAt(st, it.id)) + '</span>') + '</div>' : '') +
      (st.inv[it.id] && !it.equip && !it.perma && !it.perk ? '<div class="hint">Tens ' + st.inv[it.id] + '</div>' : '') + '</div></div>' +
      '<div class="row between" style="margin-top:8px">' + crys(price) +
      (owned ? '<span class="tag good">Já é teu</span>' : '<button class="btn sm prem" data-a="prem-buy" data-id="' + it.id + '"' + (can ? '' : ' disabled') + '>' + (can ? 'Comprar' : 'Faltam ' + (price - (st.crystals || 0))) + '</button>') + '</div></div>';
  }
  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  /* próxima evolução da aparência (muda a cada 3 níveis) */
  function formsHtml(st) {
    var f = S.avatar.forms && S.avatar.forms(st.cls, st.level);
    if (!f) return '';
    var left = f.next ? f.next - st.level : 0;
    return '<div class="evo-next"><span class="lv-lab">Forma ' + f.n + '/' + f.total + '</span>' +
      (f.next ? '<span>Próxima evolução no <b>nível ' + f.next + '</b>' + (left > 1 ? ' · faltam ' + left + ' níveis' : ' · falta 1 nível') + '</span>' : '<span style="color:var(--gold)">Forma final</span>') + '</div>';
  }
  function arenaCard(st, b) {
    var pg = S.premium.arenaProgress(st, b.arena), art = S.BOSS_ART && S.BOSS_ART[b.id], ps = S.premium.status(st, b);
    var g1 = S.ARENA_LADDER[b.arena][0];
    var state = !pg.unlocked ? '<span class="ar-cost">' + crys(b.cost) + '</span>' : '<span class="ar-st' + (pg.won < pg.total ? ' ok' : '') + '">' + (pg.won >= pg.total ? 'Completa' : 'Combate ' + (pg.won + 1) + '/10') + '</span>';
    return '<button class="arena-card' + (pg.unlocked ? ' open' : ' locked') + (ps.wins ? ' won' : '') + '" data-a="arena-view" data-n="' + b.arena + '" style="--ac:' + b.color + (S.ARENA_ART && S.ARENA_ART[b.id] ? ';--ar-scene:url(\'' + S.ARENA_ART[b.id] + '\')' : '') + '">' +
      '<span class="ar-art">' + (art ? '<img src="' + art + '" alt="" loading="lazy">' : '<span class="ar-ico">' + b.icon + '</span>') + '</span>' +
      '<span class="ar-n mono">' + ROMAN[b.arena - 1] + '</span>' +
      (ps.wins ? '<span class="ar-crown">' + uiIcon('ui_king', '♛', 'crown-img') + (ps.wins > 1 ? '×' + ps.wins : '') + '</span>' : '') +
      '<span class="ar-info"><span class="ar-arena">' + esc(b.arenaName) + '</span><span class="ar-boss">' + esc(b.name) + '</span>' +
      '<span class="ar-row"><span class="mono">Nv ' + g1.level + '–' + b.level + '</span><span>10 combates</span>' + state + '</span>' +
      (S.ARENA_CHRONICLE && S.ARENA_CHRONICLE[b.id] ? '<span class="ar-chron"><span class="ar-chron-h">Crónica do Sistema</span>' + esc(S.ARENA_CHRONICLE[b.id].chron) + '</span><span class="ar-sys">' + uiIcon('ui_eye', '', 'ar-sys-eye') + '<span>«' + esc(S.ARENA_CHRONICLE[b.id].sys) + '»</span></span>' : '') +
      (pg.unlocked ? '<span class="ar-prog"><i style="width:' + Math.round(pg.won / pg.total * 100) + '%"></i></span>' : '') + '</span></button>';
  }
  /* dentro de uma arena: a escada de 10 combates */
  function arenaView(st, n) {
    var champ = S.BOSS_BY_ID['ar' + n], pg = S.premium.arenaProgress(st, n), x = champ.story || {};
    var h = '<section class="win prem-win arena-view" style="--ac:' + champ.color + '"><div class="win-h"><button class="btn sm ghost" data-a="arena-view" data-n="0">‹ Arenas</button><small>' + pg.won + '/10 vencidos</small></div>' +
      '<div class="av-head' + (S.ARENA_ART && S.ARENA_ART[champ.id] ? ' has-art" style="--av-art:url(\'' + S.ARENA_ART[champ.id] + '\')' : '') + '"><span class="ar-n mono">ARENA ' + ROMAN[n - 1] + '</span><h2 class="av-title">' + esc(champ.arenaName) + '</h2>' +
      (x.arenaDesc ? '<p class="small muted" style="margin:4px 0 0">' + esc(x.arenaDesc) + '</p>' : '') + '</div>' +
      '<div class="ar-prog big"><i style="width:' + Math.round(pg.won / pg.total * 100) + '%"></i></div>';
    if (!pg.unlocked) h += '<p class="small" style="margin:10px 0 6px">10 combates em escada: 9 Guardiões e, no fim, o Campeão. A arena fica aberta para sempre.</p>' +
      '<button class="btn prem block" data-a="arena-unlock" data-id="' + champ.id + '"><i class="crys-ico"></i> Desbloquear a arena por ' + champ.cost + ' Cristais</button>' +
      ((st.crystals || 0) < champ.cost ? '<p class="hint" style="text-align:center">Tens ' + (st.crystals || 0) + ' Cristais. <button class="btn sm ghost" data-a="prem-open" data-t="obter">Obter Cristais</button></p>' : '');
    h += '<ol class="ladder">' + S.ARENA_LADDER[n].map(function (b) {
      var ps = S.premium.status(st, b), art = S.BOSS_ART && S.BOSS_ART[b.id], dg = C.danger(st, b);
      var cls = !pg.unlocked ? 'sealed' : ps.wins ? 'won' : ps.open ? 'next' : 'locked';
      var lock = uiIcon('ic_lock', '🔒', 'lad-img');
      var tag = !pg.unlocked ? lock : ps.wins ? (ps.readyAt ? '<span class="mono">' + cd(ps.readyAt) + '</span>' : uiIcon('h_mission_done', '✓', 'lad-img')) : ps.open ? (ps.readyAt ? '<span class="mono">' + cd(ps.readyAt) + '</span>' : '<b>Lutar</b>') : lock;
      var role = b.champion ? 'Campeão' : b.lieutenant ? 'Comandante' : 'Guardião ' + b.slot;
      var hide = !b.champion && (!pg.unlocked || (!ps.wins && !ps.open && b.slot > pg.won + 2));
      return '<li><button class="lad ' + cls + (b.champion ? ' champ' : '') + '"' + (hide ? ' disabled' : ' data-a="boss" data-id="' + b.id + '"') + '>' +
        '<span class="lad-n mono">' + b.slot + '</span>' +
        '<span class="lad-ico">' + (hide ? uiIcon('ui_unknown', '❔', 'lad-unk') : art ? '<img src="' + art + '" alt="" loading="lazy">' : b.icon) + '</span>' +
        '<span class="lad-info"><span class="lad-role">' + role + ' · Nv ' + b.level + '</span><span class="lad-name">' + (cls === 'sealed' || cls === 'locked' && !b.champion && b.slot > pg.won + 2 ? '???' : esc(b.name)) + '</span>' +
        (cls === 'next' ? '<span class="lad-dg" style="color:' + dg.color + '">' + dg.label + '</span>' : '') + '</span>' +
        '<span class="lad-st">' + tag + '</span></button></li>';
    }).join('') + '</ol></section>';
    return h;
  }
  /* ---------- avisos da administração ---------- */
  var NOTICE_ICO = { info: 'ℹ', importante: '!', evento: '★', manutencao: '⚙' };
  function noticeDate(t) { var d = new Date(t); return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear() + ' · ' + clockOf(t); }
  function noticesPage(st) {
    var N = S.shop.notices(st), list = N.list.slice().sort(function (a, b) { return b.at - a.at; });
    var h = backBtn('Avisos');
    h += '<section class="win notice-win"><div class="win-h">Mensagens da administração <small>' + list.length + '</small></div>' +
      '<p class="small muted" style="margin:0">Comunicados oficiais da equipa do Sistema: novidades, eventos, manutenções e mensagens só para ti. Chegam sozinhos quando abres o jogo com internet.</p></section>';
    if (!list.length) h += '<section class="win"><div class="empty">Ainda não há avisos.' + (S.shop.ready() ? '' : ' Liga-te à internet para os receber.') + '</div></section>';
    list.forEach(function (n) {
      var isNew = !N.read[n.id];
      h += '<section class="win notice-card k-' + n.kind + (isNew ? ' new' : '') + '"><div class="nc-h"><span class="nc-ico">' + uiIcon('notice_' + n.kind, NOTICE_ICO[n.kind] || 'ℹ', 'nc-img') + '</span>' +
        '<div class="grow"><div class="nc-t">' + esc(n.title) + '</div><div class="nc-meta">' + esc(S.shop.NOTICE_KINDS[n.kind] || 'Informação') + (n.personal ? ' · <b>só para ti</b>' : '') + ' · ' + noticeDate(n.at) + '</div></div>' +
        (isNew ? '<span class="tag good">Novo</span>' : '') + '</div><div class="nc-body">' + esc(n.body).replace(/\n/g, '<br>') + '</div></section>';
    });
    return h;
  }
  /* ---------- conta apagada pela administração ---------- */
  /* ---------- portão do aparelho (acesso privado e bloqueios) ---------- */
  function gateHtml(g) {
    var V = S.GATE_VOICE, P = S.gate.pick, U = S.gate.ui, seed = g.code || 'aparelho';
    var eye = '<div class="watch-eye">' + uiIcon('ui_eye', '<span class="eye-fallback big"></span>', 'eye-big') + '</div>';
    var codeRow = g.code ? '<div class="small muted" style="margin-top:8px">Código do aparelho</div><div class="mono gate-code">' + esc(g.code) + '</div>' : '';
    var note = (U.err ? '<p class="ban-reply">' + esc(U.err) + '</p>' : '') + (U.msg ? '<p class="gate-ok">' + esc(U.msg) + '</p>' : '');
    var busy = U.busy ? ' disabled' : '';
    var checkBtn = '<button class="btn ghost block" data-a="gate-check"' + busy + '>' + (U.busy ? 'A verificar…' : 'Verificar com o Sistema') + '</button>';
    if (g.type === 'blocked') {
      var title = P(V.blockedTitle, seed);
      return '<div class="ban-screen perm gate-screen"><div class="ban-veil"></div><div class="ban-box">' + eye +
        '<div class="ban-tag">AVISO DO SISTEMA · APARELHO</div><h1 class="glitch" data-t="' + esc(title) + '">' + esc(title) + '</h1>' +
        '<p class="ban-voice">' + esc(P(V.blocked, seed + 'v')) + '</p>' +
        '<div class="ban-card"><div class="small muted">Motivo registado</div><div>' + esc(g.block.reason || 'Violação das regras do Sistema.') + '</div>' +
        (g.block.since ? '<div class="small muted" style="margin-top:8px">Desde</div><div>' + esc(timeStr(g.block.since)) + '</div>' : '') + codeRow + '</div>' +
        '<p class="ban-sub">' + esc(P(V.blockedSub, seed + 's')) + '</p>' + note +
        (g.wa ? '<button class="btn bad block" data-a="ext" data-url="' + esc(g.wa) + '">Contestar o bloqueio (WhatsApp)</button>' : '') + checkBtn + '</div></div>';
    }
    if (g.type === 'pending') {
      // ativação: o APK é vendido; cada aparelho entra com um código de ativação oficial
      var tt = P(V.pendingTitle, seed), act = g.act || {};
      var price = act.price_kz ? '<div class="act-price"><span class="act-k">Ativação do Sistema</span><span class="act-v mono">' + kzFmt(act.price_kz) + ' Kz</span>' +
        (act.price_old_kz ? '<span class="act-old mono">' + kzFmt(act.price_old_kz) + ' Kz</span>' : '') + '<span class="small muted">Pagamento único por ' + esc(act.payment || 'Multicaixa Express') + '</span></div>' : '';
      var steps = '<ol class="act-steps"><li><b>Fala connosco no WhatsApp</b> e diz que queres o código de ativação.</li><li><b>Paga por Multicaixa Express.</b> Nunca te pedimos o PIN nem códigos do banco.</li><li><b>Recebes o código</b> e escreves-o no campo «Código de ativação», acima.</li></ol>';
      return '<div class="ban-screen gate-screen gate-pending act-screen"><div class="ban-veil"></div><div class="ban-box">' + eye +
        '<div class="ban-tag">SISTEMA · ATIVAÇÃO</div><h1 class="glitch" data-t="' + esc(tt) + '">' + esc(tt) + '</h1>' +
        '<p class="ban-voice">' + esc(P(V.pending, seed + 'v')) + '</p>' + price + note +
        '<div class="gate-form"><label class="small muted" for="gate-acs">Código de ativação</label>' +
        '<input class="in mono" id="gate-acs" placeholder="ACS-XXXX-XXXX" autocapitalize="characters" autocomplete="off" spellcheck="false" maxlength="16">' +
        '<button class="btn pri block" data-a="gate-redeem"' + busy + '>Ativar o Sistema</button></div>' +
        '<div class="ban-card act-buy"><div class="small muted" style="margin-bottom:6px">Ainda não tens código?</div>' + steps +
        (g.wa ? '<button class="btn wa block" data-a="ext" data-url="' + esc(g.wa) + '">Comprar o código pelo WhatsApp</button>' : '<p class="small muted" style="margin:0">Contacta a administração do Sistema para comprar o teu código.</p>') +
        codeRow + '<div class="small muted" style="margin-top:4px">Este código identifica o teu aparelho. Vai na mensagem de compra.</div></div>' +
        '<p class="act-warn">Só o APK oficial, ativado com um código comprado ao Sistema, é legal. Cópias não oficiais e códigos partilhados ou revendidos levam ao <b>bloqueio permanente do aparelho</b>: desinstalar e instalar outra vez não o desbloqueia.</p>' +
        (g.requested
          ? '<p class="gate-ok">Recebemos os teus dados. Assim que o pagamento for confirmado, recebes o código.</p>'
          : '<details class="act-paid"><summary>Já pagaste e ainda não recebeste o código?</summary><div class="gate-form" style="margin-top:8px">' +
            '<input class="in" id="gate-name" placeholder="O teu nome e número de WhatsApp" maxlength="60">' +
            '<textarea class="in" id="gate-msg" rows="2" maxlength="300" placeholder="Referência ou hora do pagamento (opcional)"></textarea>' +
            '<button class="btn block" data-a="gate-request"' + busy + '>Enviar os meus dados</button></div></details>') +
        checkBtn + '</div></div>';
    }
    var line = g.type === 'stale' ? P(V.stale, seed).replace('{dias}', g.days) : P(V.verify, seed);
    return '<div class="ban-screen gate-screen gate-verify"><div class="ban-veil"></div><div class="ban-box">' + eye +
      '<div class="ban-tag">AVISO DO SISTEMA · VERIFICAÇÃO</div><h1 class="glitch" data-t="LIGAÇÃO NECESSÁRIA">LIGAÇÃO NECESSÁRIA</h1>' +
      '<p class="ban-voice">' + esc(line) + '</p>' + note + checkBtn.replace('btn ghost block', 'btn pri block') + '</div></div>';
  }
  /* depois de falar com o servidor: avisos de uma só vez e retomar o jogo */
  function afterGate() {
    var n = S.gate.takeNote(), V = S.GATE_VOICE;
    var tt = { lift: 'BLOQUEIO LEVANTADO', welcome: 'ACESSO CONCEDIDO', activated: 'SISTEMA ATIVADO' }[n], ln = { lift: 'Este aparelho voltou a ter acesso ao Sistema.', welcome: 'Este aparelho tem agora acesso ao Sistema.', activated: 'Jogador legalizado: a marca aparece no teu perfil.' }[n];
    if (n && E.state) ui.popups.push({ _id: ++ui.popSeq, type: 'watch', good: n === 'activated', level: 1, title: tt, lines: [S.gate.pick(V[n], String(Date.now())), ln] });
    else if (n) { toast(n === 'lift' ? 'Bloqueio levantado.' : n === 'activated' ? 'Sistema ativado. Bem-vindo, Jogador legalizado.' : 'Acesso concedido.'); if (n === 'activated') { sfx('awaken'); FX.flash('#67d5ff', .3); } }
    if (!S.gate.screen()) { S.gate.ui.err = null; S.gate.ui.msg = null; shopSync(true); }
    render();
  }
  function gateCheck(force) {
    if (!S.gate) return;
    S.gate.check(force).then(function (r) {
      var U = S.gate.ui, wasBusy = U.busy; U.busy = false;
      if (r && !r.ok && !r.skipped && S.gate.screen()) U.err = r.offline ? 'Sem ligação. Liga-te à internet e toca em «Verificar».' : (r.msg || null);
      if (r && r.ok && !r.skipped) afterGate(); else if (S.gate.screen() || wasBusy) render();
    });
  }
  function deletedHtml(st, d) {
    return '<div class="ban-screen perm"><div class="ban-veil"></div><div class="ban-box">' +
      '<div class="watch-eye">' + uiIcon('ui_eye', '<span class="eye-fallback big"></span>', 'eye-big') + '</div>' +
      '<div class="ban-tag">AVISO DO SISTEMA · REGISTO APAGADO</div><h1 class="glitch" data-t="CONTA APAGADA">CONTA APAGADA</h1>' +
      '<p class="ban-voice">O teu registo foi removido pela administração, ' + esc(st.name) + '. Para o Sistema, este Jogador deixou de existir.</p>' +
      '<div class="ban-card">' + (d.reason ? '<div class="small muted">Motivo registado</div><div>' + esc(d.reason) + '</div>' : '') +
      '<div class="small muted" style="margin-top:8px">Jogador</div><div class="mono">' + esc(st.name) + ' · ' + esc(st.playerId) + '</div></div>' +
      '<p class="ban-sub">Se achas que foi um engano, fala com o atendimento e indica o teu ID. Ou começa um registo novo: o Sistema aceita-te outra vez, do zero.</p>' +
      '<button class="btn pri block" data-a="del-restart">Começar de novo</button></div></div>';
  }
  /* ---------- conta suspensa pelo administrador ---------- */
  function banHtml(st, b) {
    var v = S.shop.banVoice(st, b);
    return '<div class="ban-screen' + (v.perm ? ' perm' : '') + '"><div class="ban-veil"></div><div class="ban-box" id="ban-box">' +
      '<div class="watch-eye">' + uiIcon('ui_eye', '<span class="eye-fallback big"></span>', 'eye-big') + '</div>' +
      '<div class="ban-tag">AVISO DO SISTEMA · ' + (v.perm ? 'SENTENÇA FINAL' : 'SENTENÇA') + '</div><h1 class="glitch" data-t="' + esc(v.title) + '">' + esc(v.title) + '</h1>' +
      '<p class="ban-voice">' + esc(v.line) + '</p>' +
      '<div class="ban-card"><div class="small muted">Motivo registado</div><div>' + esc(b.reason) + '</div>' +
      '<div class="small muted" style="margin-top:8px">Pena</div><div>' + (b.until ? 'Até ' + timeStr(b.until) + ' <span class="muted">(' + cdText(b.until) + ')</span>' : '<b style="color:#ff4d66">Permanente</b>') + '</div>' +
      '<div class="small muted" style="margin-top:8px">Jogador</div><div class="mono">' + esc(st.name) + ' · ' + esc(st.playerId) + '</div></div>' +
      '<p class="ban-sub">' + esc(v.sub) + '</p>' +
      (ui.banLine ? '<p class="ban-reply glitch" data-t="' + esc(ui.banLine) + '">«' + esc(ui.banLine) + '»</p>' : '') +
      '<button class="btn bad block" data-a="ban-check">Verificar com o Sistema</button></div></div>';
  }
  /* ---------- aparência no retrato e no nome ---------- */
  /* retrato com moldura: imagem da moldura (assets/frames) por cima; sem imagem, moldura em CSS */
  function framed(inner, c, small) {
    if (!c) return inner;
    var art = S.FRAME_ART && S.FRAME_ART[c.id];
    return '<div class="frame-wrap ' + c.id + (art ? ' has-art' : ' css-frame') + (small ? ' small' : '') + '" style="--fc:' + c.color + '">' + inner +
      (art ? '<img class="frame-img" src="' + art + '" alt="">' : '<i class="fc tl"></i><i class="fc tr"></i><i class="fc bl"></i><i class="fc br"></i>') + '</div>';
  }
  function heroAvatar(st) {
    var c = S.premium && S.premium.cosmeticOn(st, 'moldura');
    return framed(S.avatar.html(st.cls, st.level), c);
  }
  function nameCls(st) { var n = S.premium && S.premium.cosmeticOn(st, 'nome'); return n ? (n.prism ? ' name-prism' : ' name-cos') : ''; }
  function nameStyle(st) { var n = S.premium && S.premium.cosmeticOn(st, 'nome'); return n && !n.prism ? ' style="--nc:' + n.color + '"' : ''; }
  /* ---------- Obter Cristais: pacotes do servidor, pedidos e resgate ---------- */
  function kz(n) { return fmt(n) + ' Kz'; }
  /* o que dá para fazer com um pacote (ajuda o jogador a escolher) */
  function pkgHint(c) {
    if (c >= 2500) return 'As 7 primeiras arenas: 70 combates';
    if (c >= 1200) return 'As 4 primeiras arenas e uma moldura';
    if (c >= 550) return 'As 3 primeiras arenas: 30 combates';
    if (c >= 250) return 'A 2.ª arena e uma relíquia, ou uma moldura épica';
    if (c >= 120) return 'A 1.ª arena inteira: 10 combates';
    return 'Uma moldura ou proteções';
  }
  function coinHint(c) {
    if (c >= 50000) return 'Um Baú do Dragão e ainda sobra para armas de topo';
    if (c >= 25000) return 'Um Arsenal de Ouro e uma Armaria de Ouro';
    if (c >= 12000) return 'Um Arsenal de Ouro, ou várias armaduras de Prata';
    if (c >= 5000) return 'Um Baú de Prata e poções para muitas lutas';
    if (c >= 2000) return 'Dois Baús de Ferro ou um bom acessório';
    return 'Poções e um Baú de Ferro';
  }
  /* comprar só moedas com dinheiro real (para quem não quer Cristais) */
  function moedasHtml(st) {
    var cfg = S.shop.cached(), ready = S.shop.ready(), orders = ((st.shop && st.shop.orders) || []).filter(function (o) { return o.coins > 0; });
    var live = ready && cfg && cfg.open && cfg.packages && cfg.packages.some(function (p) { return p.kind === 'coins'; });
    var packs = live ? cfg.packages.filter(function (p) { return p.kind === 'coins'; }) : S.COIN_PACKS;
    var sel = packs.filter(function (p) { return p.id === ui.pack; })[0];
    var h = '<section class="win prem-win coin-shop"><div class="win-h"><span class="prem-t coin-t">Comprar Moedas</span><small>Tens ' + coins(st.coins || 0) + '</small></div>' +
      '<p class="small" style="margin-top:0">Só queres moedas para a Loja (baús, armas, poções) e não precisas de Cristais? Compra-as aqui diretamente. Quanto maior o pacote, mais moedas de bónus.</p>' +
      (ready && cfg && !cfg.open ? '<p class="small" style="color:var(--warn)">A loja está fechada de momento. Volta mais tarde.</p>' : '') +
      '<div class="pkg-grid">' + packs.map(function (p) {
        var pct = p.bonus && p.base ? Math.round(p.bonus / p.base * 100) : 0;
        return '<button class="pkg coin-pkg' + (p.badge ? ' hot' : '') + (sel && sel.id === p.id ? ' sel' : '') + '" data-a="pack-pick" data-id="' + p.id + '">' + (p.badge ? '<span class="pkg-badge">' + esc(p.badge) + '</span>' : '') +
          '<span class="pkg-cr">' + coins(p.coins) + '</span>' + (p.bonus ? '<span class="pkg-bonus">' + fmt(p.base) + ' + ' + fmt(p.bonus) + ' de bónus (+' + pct + '%)</span>' : '<span class="pkg-bonus muted">sem bónus</span>') +
          '<span class="pkg-name">' + esc(p.name) + '</span><span class="pkg-price mono">' + kz(p.price_kz) + '</span><span class="pkg-hint">' + esc(coinHint(p.coins)) + '</span>' +
          '<span class="pkg-buy">' + (sel && sel.id === p.id ? '✓ Escolhido' : 'Comprar') + '</span></button>';
      }).join('') + '</div>' +
      '<div class="buy-box' + (sel ? ' on' : '') + '" id="buy-box">' + (sel
        ? '<div class="row between"><span>' + coins(sel.coins) + ' <span class="small muted">' + esc(sel.name) + '</span></span><b class="mono" style="color:var(--gold)">' + kz(sel.price_kz) + '</b></div>' +
          '<button class="btn wa block" data-a="buy-wa" data-id="' + sel.id + '" style="margin-top:10px">Comprar pelo WhatsApp</button>' +
          '<p class="small muted" style="margin:8px 0 0;text-align:center">Atendimento: <span class="mono">' + esc(S.SHOP_WHATSAPP_SHOW) + '</span></p>'
        : '<p class="small muted" style="margin:0;text-align:center">Toca num pacote para o comprar.</p>') + '</div>' +
      '<ol class="small prem-steps"><li>Escolhe o pacote e toca em <b>Comprar pelo WhatsApp</b>: abre a conversa com o administrador, com a mensagem já escrita.</li><li>Faz a transferência por <b>MULTICAIXA Express</b>, com os dados que o administrador te envia.</li><li>Depois de confirmada, as moedas entram sozinhas na tua conta, ou recebes um <b>código de resgate</b> para escreveres aqui em baixo.</li></ol>' +
      '<p class="hint">Fala só com o número oficial ' + esc(S.SHOP_WHATSAPP_SHOW) + '. Nunca te pediremos o PIN nem códigos de confirmação do banco.</p>' +
      '<label class="f" style="margin-top:10px">Código de resgate<input class="in mono" id="redeem-code" placeholder="SIS-XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>' +
      '<button class="btn prem block" data-a="redeem"' + (ready ? '' : ' disabled') + '>Resgatar código</button></section>';
    if (orders.length) {
      h += '<section class="win prem-win"><div class="win-h"><span class="prem-t">Os meus pedidos de moedas</span><button class="btn sm ghost" data-a="ord-refresh">Atualizar</button></div><div class="list">' +
        orders.slice(0, 10).map(function (o) {
          var stt = S.shop.STATUS[o.status] || { name: o.status, tone: '' };
          return '<div class="card ord-card"><div class="row between"><b class="mono">' + esc(o.id) + '</b><span class="ord-st ' + stt.tone + '">' + esc(stt.name) + '</span></div>' +
            '<div class="meta">' + coins(o.coins) + '<span class="mono">' + kz(o.price) + '</span><span>' + timeStr(o.at) + '</span></div>' +
            (o.status === 'pending_payment' ? '<div class="row" style="margin-top:8px"><button class="btn sm pri grow" data-a="ord-open" data-id="' + o.id + '">Instruções / WhatsApp</button><button class="btn sm ghost" data-a="ord-cancel" data-id="' + o.id + '">Cancelar</button></div>' : '') +
            (o.status === 'code_issued' ? '<p class="hint" style="margin:6px 0 0">O código foi-te enviado no WhatsApp. Escreve-o acima.</p>' : '') + '</div>';
        }).join('') + '</div></section>';
    }
    return h;
  }
  function obterHtml(st) {
    var cfg = S.shop.cached(), ready = S.shop.ready(), orders = (st.shop && st.shop.orders) || [];
    var h = '<section class="win prem-win"><div class="win-h"><span class="prem-t">Obter Cristais</span></div>' +
      (st.shop && st.shop.conflict ? '<p class="small" style="margin-top:0;color:var(--warn)">Esta conta está registada noutro aparelho. Se mudaste de telemóvel, usa a Transferência de conta. Se não foste tu, fala com o atendimento com o teu ID de Jogador.</p>' : '');
    var live = ready && cfg && cfg.open && cfg.packages && cfg.packages.length;
    var note = '';
    if (!ready) note = '';
    else if (!cfg) note = ui.shopErr ? esc(ui.shopErr) + ' <button class="btn sm" data-a="shop-load">Tentar outra vez</button>' : 'A ligar ao Sistema…';
    else if (!cfg.open) note = 'A loja de Cristais está fechada de momento. Volta mais tarde.';
    else if (!cfg.packages.length) note = 'Ainda não há pacotes à venda.';
    if (note) h += '<p class="small" style="margin-top:0">' + note + '</p>';
    var packs = live ? cfg.packages.filter(function (p) { return p.kind !== 'coins'; }) : S.CRYSTAL_PACKS;
    var sel = packs.filter(function (p) { return p.id === ui.pack; })[0];
    h += '<div class="win-h" style="margin:4px 0 6px"><span class="prem-t" style="font-size:13px">Tabela de preços</span></div>' +
      '<p class="small muted" style="margin:0 0 8px">Escolhe o pacote. Quanto maior, mais Cristais de bónus.</p><div class="pkg-grid">' + packs.map(function (p) {
      var pct = p.bonus && p.base ? Math.round(p.bonus / p.base * 100) : 0;
      return '<button class="pkg' + (p.badge ? ' hot' : '') + (sel && sel.id === p.id ? ' sel' : '') + '" data-a="pack-pick" data-id="' + p.id + '">' + (p.badge ? '<span class="pkg-badge">' + esc(p.badge) + '</span>' : '') +
        '<span class="pkg-cr">' + crys(p.crystals) + '</span>' + (p.bonus ? '<span class="pkg-bonus">' + (p.base || p.crystals - p.bonus) + ' + ' + p.bonus + ' de bónus (+' + pct + '%)</span>' : '<span class="pkg-bonus muted">sem bónus</span>') +
        '<span class="pkg-name">' + esc(p.name) + '</span><span class="pkg-price mono">' + kz(p.price_kz) + '</span><span class="pkg-hint">' + esc(pkgHint(p.crystals)) + '</span>' +
        '<span class="pkg-buy">' + (sel && sel.id === p.id ? '✓ Escolhido' : 'Comprar') + '</span></button>';
    }).join('') + '</div>';
    h += '<div class="buy-box' + (sel ? ' on' : '') + '" id="buy-box">' + (sel
      ? '<div class="row between"><span>' + crys(sel.crystals) + ' <span class="small muted">' + esc(sel.name) + '</span></span><b class="mono" style="color:var(--gold)">' + kz(sel.price_kz) + '</b></div>' +
        (live && ((SO.cache && SO.cache.friends) || []).length ? '<div class="gift-to"><span class="small muted">Para quem?</span><div class="seg">' + '<button type="button" data-a="gift-to" aria-pressed="' + (!ui.giftTo) + '">Para mim</button>' +
          SO.cache.friends.slice(0, 20).map(function (f) { return '<button type="button" data-a="gift-to" data-id="' + esc(f.id) + '" aria-pressed="' + (ui.giftTo === f.id) + '">🎁 ' + esc(f.name) + '</button>'; }).join('') + '</div></div>' : '') +
        (live && ui.giftTo ? '<button class="btn wa block" data-a="buy-gift" data-id="' + sel.id + '" style="margin-top:10px">Oferecer pelo WhatsApp</button><p class="small muted" style="margin:6px 0 0;text-align:center">O amigo recebe os Cristais quando o pagamento for confirmado.</p>'
          : '<button class="btn wa block" data-a="buy-wa" data-id="' + sel.id + '" style="margin-top:10px">Comprar pelo WhatsApp</button>') +
        '<p class="small muted" style="margin:8px 0 0;text-align:center">Atendimento: <span class="mono">' + esc(S.SHOP_WHATSAPP_SHOW) + '</span></p>'
      : '<p class="small muted" style="margin:0;text-align:center">Toca num pacote para o comprar.</p>') + '</div>' +
      '<ol class="small prem-steps"><li>Escolhe o pacote e toca em <b>Comprar pelo WhatsApp</b>: abre a conversa com o administrador, com a mensagem já escrita.</li><li>Faz a transferência do valor por <b>MULTICAIXA Express</b>, com os dados que o administrador te envia.</li><li>Depois de confirmada a transferência, o administrador envia-te um <b>código de resgate</b>.</li><li>Escreve o código aqui em baixo e os Cristais entram na tua conta.</li></ol>' +
      '<p class="hint">Fala só com o número oficial ' + esc(S.SHOP_WHATSAPP_SHOW) + '. Nunca te pediremos o PIN nem códigos de confirmação do banco.</p>';
    h += '<label class="f" style="margin-top:10px">Código de resgate<input class="in mono" id="redeem-code" placeholder="SIS-XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>' +
      '<button class="btn prem block" data-a="redeem"' + (ready ? '' : ' disabled') + '>Resgatar código</button>' +
      '</section>';
    if (orders.length) {
      h += '<section class="win prem-win"><div class="win-h"><span class="prem-t">Os meus pedidos</span><button class="btn sm ghost" data-a="ord-refresh">Atualizar</button></div><div class="list">' +
        orders.slice(0, 10).map(function (o) {
          var stt = S.shop.STATUS[o.status] || { name: o.status, tone: '' };
          return '<div class="card ord-card"><div class="row between"><b class="mono">' + esc(o.id) + '</b><span class="ord-st ' + stt.tone + '">' + esc(stt.name) + '</span></div>' +
            '<div class="meta">' + (o.coins ? coins(o.coins) : crys(o.crystals)) + '<span class="mono">' + kz(o.price) + '</span><span>' + timeStr(o.at) + '</span>' + '</div>' +
            (o.status === 'pending_payment' ? '<div class="row" style="margin-top:8px"><button class="btn sm pri grow" data-a="ord-open" data-id="' + o.id + '">Instruções / WhatsApp</button><button class="btn sm ghost" data-a="ord-cancel" data-id="' + o.id + '">Cancelar</button></div>' : '') +
            (o.status === 'code_issued' ? '<p class="hint" style="margin:6px 0 0">O código foi-te enviado no WhatsApp. Escreve-o acima.</p>' : '') + '</div>';
        }).join('') + '</div></section>';
    }
    h += '<section class="win prem-win"><div class="win-h"><span class="prem-t">ID de Jogador</span></div><p class="small muted" style="margin-top:0">Identifica a tua conta nos pedidos e nos presentes do Sistema. Se mudares de telemóvel, usa a Transferência de conta: os Cristais vão contigo.</p><p class="hint" style="margin-top:0">Com internet, o jogo envia ao servidor o teu ID, nome, classe, nível e números de progresso (Cristais, moedas, missões, chefes), para a loja, os presentes e o apoio. Nada mais.</p>' +
      '<button class="mono id-chip" data-a="id-copy">' + esc(st.playerId) + '</button></section>';
    return h;
  }
  function orderModal(m) {
    var o = ((E.state.shop && E.state.shop.orders) || []).filter(function (x) { return x.id === m.id; })[0];
    if (!o) return '<div class="sheet-h"><h2>Pedido</h2><button class="btn sm ghost" data-a="close">Fechar</button></div><div class="empty">Pedido não encontrado.</div>';
    var cfg = S.shop.cached();
    return '<div class="sheet-h"><h2>Pedido ' + esc(o.id) + '</h2><button class="btn sm ghost" data-a="close">Fechar</button></div>' +
      (o.test ? '<p class="hint test-note">Modo de teste: não faças pagamentos reais.</p>' : '') +
      '<div class="ord-sum"><div>' + (o.coins ? coins(o.coins) : crys(o.crystals)) + '<div class="small muted">' + esc(o.pkg) + (o.gift ? ' · 🎁 para ' + esc(o.gift) : '') + '</div></div><div class="ord-price mono">' + kz(o.price) + '</div></div>' +
      '<ol class="small prem-steps"><li>Toca em <b>Abrir WhatsApp</b>: a mensagem com o número do pedido já vai escrita.</li><li>Segue as instruções de pagamento por MULTICAIXA Express que vais receber.</li><li>Depois de confirmado, ' + (o.coins ? 'as moedas entram sozinhas ou ' : '') + 'recebes um código. Resgata-o em Ala Premium → ' + (o.coins ? 'Comprar Moedas' : 'Obter Cristais') + '.</li></ol>' +
      (cfg && cfg.payment_info ? '<p class="hint">' + esc(cfg.payment_info) + '</p>' : '') +
      (o.wa ? '<button class="btn wa block" data-a="ext" data-url="' + esc(o.wa) + '">Abrir WhatsApp</button>' : '<p class="small" style="color:var(--warn)">O número de atendimento ainda não está configurado. Copia a mensagem e envia-a ao atendimento.</p>') +
      '<button class="btn ghost block" data-a="ord-copy" data-id="' + o.id + '" style="margin-top:8px">Copiar mensagem</button>';
  }
  function coliseuHtml(st) {
    S.premium.ensure(st);
    if (ui.arenaN) return arenaView(st, ui.arenaN);
    var won = S.ARENA_BOSSES.filter(function (b) { return st.arena.wins[b.id]; }).length;
    return '<section class="win prem-win"><div class="win-h"><span class="prem-t"><i class="crys-ico"></i> Coliseu dos Condenados</span><small>' + won + '/10 Campeões vencidos</small></div>' +
      '<p class="small muted" style="margin-top:0">' + esc(S.GATE_LORE.arena) + '</p>' +
      '<p class="hint" style="margin-top:0">Cada arena tem 10 combates: 9 Guardiões em escada e o Campeão no fim. Pagas uma vez e fica aberta para sempre.</p>' +
      '<div class="row" style="margin-bottom:10px"><span class="small">Os teus Cristais: ' + crys(st.crystals || 0) + '</span><button class="btn sm prem" style="margin-left:auto" data-a="prem-open" data-t="obter">Obter Cristais</button></div>' +
      '<div class="arena-list">' + S.ARENA_BOSSES.map(function (b) { return arenaCard(st, b); }).join('') + '</div></section>';
  }
  /* ---------- Apoiar o criador (doações por WhatsApp / MULTICAIXA Express) ---------- */
  var DONATE = [500, 1000, 2500, 5000];
  function donateHtml(st) {
    var v = ui.donate || 1000;
    return '<section class="win prem-win donate"><div class="win-h"><span class="prem-t">\u2665 Apoiar o criador</span></div>' +
      '<p class="small" style="margin-top:0">O Sistema é feito por uma só pessoa, Delcio Cunha. Se o jogo te ajuda a cumprir as tuas missões da vida real e quiseres apoiar o desenvolvimento, podes fazer uma doação com o valor que quiseres. É totalmente opcional e não dá vantagens no jogo: é só um obrigado.</p>' +
      '<div class="chips donate-chips">' + DONATE.map(function (x) { return '<button class="chip' + (v === x ? ' on' : '') + '" data-a="don-pick" data-v="' + x + '">' + fmt(x) + ' Kz</button>'; }).join('') +
      '<button class="chip' + (DONATE.indexOf(v) < 0 ? ' on' : '') + '" data-a="don-pick" data-v="0">Outro valor</button></div>' +
      '<button class="btn wa block" data-a="don-go" style="margin-top:10px">Doar ' + (DONATE.indexOf(v) >= 0 ? fmt(v) + ' Kz ' : '') + 'pelo WhatsApp</button>' +
      '<p class="hint" style="margin:8px 0 0">Recebes os dados para a transferência por MULTICAIXA Express no WhatsApp ' + esc(S.SHOP_WHATSAPP_SHOW) + '. Nunca te pediremos o PIN nem códigos do banco.</p></section>';
  }
  function premiumPage(st) {
    var t = ui.premTab || 'arenas';
    var h = backBtn('Ala Premium');
    h += '<section class="win prem-win prem-head"><div class="prem-bal"><span class="small muted">Os teus Cristais</span><span class="prem-big">' + crys(st.crystals || 0) + '</span></div>' +
      '<div class="prem-id"><span class="small muted">ID de Jogador</span><button class="mono id-chip" data-a="id-copy">' + esc(st.playerId) + '</button></div>' +
      (st.shop && st.shop.role ? '<div class="prem-id"><span class="small muted">Tipo de conta</span><span class="role-chip r-' + esc(st.shop.role.id) + '">' + esc(st.shop.role.name) + '</span></div>' : '') +
      '<div class="prem-id"><span class="small muted">Licença</span>' + (st.shop && st.shop.legal ? selfLegal(st) : '<span class="legal-tag no">Sem registo de ativação</span>') + '</div>' +
      '<div class="row" style="margin-top:10px;gap:8px"><button class="btn prem grow" data-a="prem-tab" data-t="obter"><i class="crys-ico"></i> Cristais</button><button class="btn coin-btn" data-a="prem-tab" data-t="moedas"><i class="coin-ico"></i> Moedas</button><button class="btn don-btn" data-a="prem-tab" data-t="loja">\u2665 Doar</button></div></section>';
    h += '<div class="chips" style="margin-top:12px">' + [['arenas', 'Arenas'], ['loja', 'Loja Exclusiva'], ['aparencia', 'Aparência'], ['obter', 'Obter Cristais'], ['moedas', 'Comprar Moedas']].map(function (x) {
      return '<button class="chip' + (t === x[0] ? ' on' : '') + '" data-a="prem-tab" data-t="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    if (t === 'arenas') {
      h += coliseuHtml(st);
    } else if (t === 'loja') {
      h += donateHtml(st);
      S.PREMIUM_SHOP.forEach(function (g) {
        h += '<section class="win prem-win"><div class="win-h"><span class="prem-t">' + esc(g.title) + '</span></div>' + (g.note ? '<p class="hint" style="margin-top:0">' + esc(g.note) + '</p>' : '') +
          (g.ids.indexOf('pr_lamina') >= 0 ? monarchSetHtml(st) : '') +
          '<div class="list">' + g.ids.map(function (id) { return premItemCard(st, S.ITEMS[id]); }).join('') + '</div></section>';
      });
      h += '<section class="win prem-win"><div class="win-h"><span class="prem-t">Câmbio do Sistema</span></div><p class="hint" style="margin-top:0">Troca Cristais por moedas do jogo. O contrário não existe.</p><div class="list">' +
        S.PREMIUM_EXCHANGE.map(function (x) {
          var can = (st.crystals || 0) >= x.crystals;
          return '<div class="card prem-card"><div class="row between"><div><div class="card-t">' + esc(x.name) + '</div><div class="meta">' + crys(x.crystals) + ' <span class="muted">→</span> ' + coins(x.coins) + '</div></div>' +
            '<button class="btn sm prem" data-a="prem-ex" data-id="' + x.id + '"' + (can ? '' : ' disabled') + '>' + (can ? 'Trocar' : 'Faltam ' + (x.crystals - (st.crystals || 0))) + '</button></div></div>';
        }).join('') + '</div></section>';
    } else if (t === 'aparencia') {
      var mold = S.premium.cosmeticOn(st, 'moldura'), nm = S.premium.cosmeticOn(st, 'nome');
      h += '<section class="win prem-win"><div class="win-h"><span class="prem-t">Aparência</span><small>Só visual: não dá vantagem</small></div>' +
        '<div class="hero cos-preview" style="--aura:' + S.rankFor(st.level).color + '">' + heroAvatar(st) +
        '<div class="stack" style="gap:6px;min-width:0"><div class="hero-name' + nameCls(st) + '"' + nameStyle(st) + '>' + esc(st.name) + '</div><div class="hero-title"' + titleStyle(st) + '>' + esc(S.premium.titleOf(st)) + '</div>' +
        '<div class="small muted">' + (mold ? esc(mold.name) : 'Moldura simples') + ' · ' + (nm ? esc(nm.name) : 'Assinatura normal') + '</div></div></div></section>';
      var TIER = { raro: 'Rara', epico: 'Épica', lendario: 'Lendária', mitico: 'Mítica', secreto: 'Exclusiva' };
      h += '<section class="win prem-win"><div class="win-h"><span class="prem-t">Molduras do retrato</span></div><p class="hint" style="margin-top:0">Substituem o quadrado simples à volta do teu personagem, no Estado e no teu perfil.</p><div class="cos-grid">' +
        S.COSMETICS.filter(function (c) { return c.kind === 'moldura'; }).map(function (c) {
          var own = !!st.cosmetics.owned[c.id], on = st.cosmetics.moldura === c.id, can = (st.crystals || 0) >= c.crystals;
          var act = own ? '<button class="btn sm ' + (on ? 'ghost' : 'pri') + ' block" data-a="cos-wear" data-id="' + c.id + '">' + (on ? 'Tirar' : 'Usar') + '</button>'
            : c.reward ? '<span class="tag prem-tag">Vence O Primeiro Jogador</span>'
            : '<div class="row between">' + crys(c.crystals) + '<button class="btn sm prem" data-a="cos-buy" data-id="' + c.id + '"' + (can ? '' : ' disabled') + '>' + (can ? 'Comprar' : 'Faltam ' + (c.crystals - (st.crystals || 0))) + '</button></div>';
          return '<div class="cos-card' + (on ? ' on' : '') + '" style="--cc:' + c.color + '"><div class="cos-frame">' + framed(S.avatar.html(st.cls, st.level), c, true) + '</div>' +
            '<div class="card-t">' + esc(c.name) + '</div><div class="tier t-' + c.tier + '">' + (TIER[c.tier] || '') + '</div><div class="small muted">' + esc(c.desc) + '</div>' + act + '</div>';
        }).join('') + '</div></section>';
      h += '<section class="win prem-win"><div class="win-h"><span class="prem-t">Assinaturas do nome</span></div><div class="cos-grid">' +
        S.COSMETICS.filter(function (c) { return c.kind === 'nome'; }).map(function (c) {
          var own = !!st.cosmetics.owned[c.id], on = st.cosmetics.nome === c.id, can = (st.crystals || 0) >= c.crystals;
          return '<div class="cos-card' + (on ? ' on' : '') + '" style="--cc:' + c.color + '"><div class="cos-sw nome' + (c.prism ? ' prism' : '') + '"><b>' + esc(st.name) + '</b></div>' +
            '<div class="card-t">' + esc(c.name) + '</div><div class="small muted">' + esc(c.desc) + '</div>' +
            (own ? '<button class="btn sm ' + (on ? 'ghost' : 'pri') + ' block" data-a="cos-wear" data-id="' + c.id + '">' + (on ? 'Tirar' : 'Usar') + '</button>'
              : '<div class="row between">' + crys(c.crystals) + '<button class="btn sm prem" data-a="cos-buy" data-id="' + c.id + '"' + (can ? '' : ' disabled') + '>' + (can ? 'Comprar' : 'Faltam ' + (c.crystals - (st.crystals || 0))) + '</button></div>') + '</div>';
        }).join('') + '</div></section>';
      var buyBtn = function (c) { var can = (st.crystals || 0) >= c.crystals; return '<div class="row between">' + crys(c.crystals) + '<button class="btn sm prem" data-a="cos-buy" data-id="' + c.id + '"' + (can ? '' : ' disabled') + '>' + (can ? 'Comprar' : 'Faltam ' + (c.crystals - (st.crystals || 0))) + '</button></div>'; };
      var wearBtn = function (c, on) { return '<button class="btn sm ' + (on ? 'ghost' : 'pri') + ' block" data-a="cos-wear" data-id="' + c.id + '">' + (on ? 'Tirar' : 'Usar') + '</button>'; };
      var giftBtn = function (c) { return S.shop.ready() && S.GIFTABLE && S.GIFTABLE[c.id] ? '<button class="btn sm ghost block" data-a="gift-open" data-id="' + c.id + '">🎁 Oferecer a um amigo</button>' : ''; };
      h += '<section class="win prem-win"><div class="win-h"><span class="prem-t">Títulos exclusivos</span></div><p class="hint" style="margin-top:0">Substituem o título do teu nível. Aparecem no Estado, no teu perfil e nos duelos.</p><div class="cos-grid">' +
        S.COSMETICS.filter(function (c) { return c.kind === 'titulo'; }).map(function (c) {
          var own = !!st.cosmetics.owned[c.id], on = st.cosmetics.titulo === c.id;
          return '<div class="cos-card' + (on ? ' on' : '') + '" style="--cc:' + c.color + '"><div class="cos-sw titulo"><small>' + esc(st.name) + '</small><b style="color:' + c.color + ';text-shadow:0 0 10px ' + c.color + '88">' + esc(c.name) + '</b></div>' +
            '<div class="small muted">' + esc(c.desc) + '</div>' + (own ? wearBtn(c, on) : buyBtn(c)) + giftBtn(c) + '</div>';
        }).join('') + '</div></section>';
      h += '<section class="win prem-win"><div class="win-h"><span class="prem-t">Efeitos de vitória</span></div><p class="hint" style="margin-top:0">Tocam quando derrotas um chefe, vences um duelo ou sobes de nível. Usa só um de cada vez.</p><div class="cos-grid">' +
        S.COSMETICS.filter(function (c) { return c.kind === 'efeito'; }).map(function (c) {
          var own = !!st.cosmetics.owned[c.id], on = st.cosmetics.efeito === c.id;
          return '<div class="cos-card' + (on ? ' on' : '') + '" style="--cc:' + c.color + '"><div class="cos-sw efeito fx-' + c.fx + '">' + (artId(c.id) ? '<img src="' + artId(c.id) + '" alt="">' : '<b>' + esc(c.icon || '*') + '</b>') + '</div>' +
            '<div class="card-t">' + esc(c.name) + '</div><div class="small muted">' + esc(c.desc) + '</div>' +
            '<button class="btn sm ghost block" data-a="cos-test" data-id="' + c.id + '">Ver efeito</button>' + (own ? wearBtn(c, on) : buyBtn(c)) + giftBtn(c) + '</div>';
        }).join('') + '</div></section>';
      h += '<section class="win prem-win"><div class="win-h"><span class="prem-t">Emotes de duelo</span></div><p class="hint" style="margin-top:0">Frases curtas que mandas ao adversário durante um duelo online. Todos têm ' + S.EMOTES_FREE.map(function (t) { return '«' + esc(t) + '»'; }).join(', ') + '. Cada pacote junta mais 4.</p><div class="cos-grid">' +
        S.COSMETICS.filter(function (c) { return c.kind === 'emote'; }).map(function (c) {
          var own = !!st.cosmetics.owned[c.id];
          return '<div class="cos-card' + (own ? ' on' : '') + '" style="--cc:' + c.color + '">' + (artId(c.id) ? '<div class="cos-sw efeito"><img src="' + artId(c.id) + '" alt=""></div>' : '') + '<div class="card-t">' + esc(c.name) + '</div><ul class="emote-list">' + c.lines.map(function (l) { return '<li>«' + esc(l) + '»</li>'; }).join('') + '</ul>' +
            (own ? '<span class="tag prem-tag">Já é teu</span>' : buyBtn(c)) + giftBtn(c) + '</div>';
        }).join('') + '</div></section>';
    } else if (t === 'moedas') {
      h += moedasHtml(st);
    } else {
      h += obterHtml(st);
    }
    return h;
  }
  /* ================= SOCIAL: amigos, conversas e duelos ================= */
  var SO = S.social;
  function clsName(c) { return S.CLASSES[c] ? S.CLASSES[c].name : 'Caçador'; }
  /* foto redonda (se o jogador pôs uma) ou o avatar da classe; clicável para abrir o perfil de um amigo */
  function socAvatar(p, cls, open) {
    var pic = SO.pic(p);
    var inner = pic ? '<span class="soc-photo"><img src="' + pic + '" alt=""></span>' : (p.cls && S.CLASSES[p.cls] ? S.avatar.html(p.cls, p.level || 1, 'mini', p.gender || 'm') : '<span class="soc-av-x">' + esc((p.name || '?')[0]) + '</span>');
    var dot = p.online != null ? '<i class="dot ' + (p.online ? 'on' : 'off') + '"></i>' : '';
    return open ? '<button class="soc-av soc-av-btn ' + (cls || '') + '" data-a="soc-profile" data-id="' + esc(p.id) + '" aria-label="Ver o perfil de ' + esc(p.name) + '">' + inner + dot + '</button>'
      : '<span class="soc-av ' + (cls || '') + '">' + inner + dot + '</span>';
  }
  function seenText(p) {
    if (p.online) return 'Online';
    if (!p.seen) return 'Offline';
    var d = SO.serverNow() - p.seen, m = Math.floor(d / 60000);
    return m < 60 ? 'Visto há ' + Math.max(1, m) + ' min' : m < 1440 ? 'Visto há ' + Math.floor(m / 60) + ' h' : 'Visto há ' + Math.floor(m / 1440) + ' d';
  }
  function socNoLink() {
    return '<section class="win"><div class="empty">O Social precisa de ligação ao servidor do Sistema.<br><span class="small muted">Verifica a internet e volta a abrir esta página.</span></div></section>';
  }
  /* perfil de um amigo: visão geral */
  function profileModal(m) {
    var h = '<div class="sheet-h"><h2>Perfil</h2><button class="btn sm ghost" data-a="close" aria-label="Fechar">✕</button></div>';
    if (m.err) return h + '<div class="empty">' + esc(m.err) + '</div>';
    var p = m.data;
    if (!p) return h + '<div class="empty">A abrir o perfil…</div>';
    var x = p.extra || {}, s = p.stats || {}, self = E.state && p.id === E.state.playerId;
    var pic = p.photo || SO.pic(p);
    var face = pic ? '<span class="prof-photo"><img src="' + pic + '" alt=""></span>' : '<span class="prof-photo av">' + (S.CLASSES[p.cls] ? S.avatar.html(p.cls, p.level || 1, '', p.gender || 'm') : '') + '</span>';
    var cell = function (v, l) { return '<div class="prof-stat"><b class="mono">' + v + '</b><span>' + l + '</span></div>'; };
    var days = function (ts) { return ts ? Math.max(1, Math.round((SO.serverNow() - ts) / 86400000)) : 0; };
    h += '<div class="prof-head">' + face + '<div class="grow" style="min-width:0"><div class="prof-name"' + (x.color ? ' style="color:' + esc(x.color) + '"' : '') + '>' + esc(p.name) + '</div>' +
      '<div class="hero-title">' + esc(x.title || S.titleFor(p.level || 1)) + '</div>' + (self ? selfLegal(E.state) : legalTag(p.legal, p.premium)) +
      '<div class="small muted">' + clsName(p.cls) + ' · Nv ' + p.level + ' · <span class="' + (p.online ? 'on-txt' : '') + '">' + seenText(p) + '</span></div></div></div>' +
      ptCard(p.points || 0) +
      '<div class="prof-grid">' + cell(p.wins || 0, 'Vitórias') + cell(p.losses || 0, 'Derrotas') + cell(s.bosses || 0, 'Chefes') + cell(s.arenas || 0, 'Arenas') +
      cell((x.ach || 0) + (x.achTotal ? '<small>/' + x.achTotal + '</small>' : ''), 'Conquistas') + cell(x.shadows || 0, 'Sombras') + cell(s.streak || 0, 'Sequência') + cell(s.best || 0, 'Melhor sequência') + '</div>' +
      '<div class="small muted" style="margin-top:10px">' + (p.since ? 'Amigos há ' + days(p.since) + ' dia(s) · ' : '') + 'No Sistema há ' + days(p.joined) + ' dia(s)' + (s.day ? ' · Dia ' + s.day + ' do Sistema' : '') + '</div>';
    if (!self) h += '<div class="row" style="gap:6px;margin-top:12px"><button class="btn grow" data-a="chat-open" data-id="' + esc(p.id) + '">' + uiIcon('ui_chat', '💬', 'btn-ico') + ' Conversar</button><button class="btn grow bad" data-a="duel-invite" data-id="' + esc(p.id) + '">' + uiIcon('ui_duel', '⚔', 'btn-ico') + ' Desafiar</button></div>';
    return h;
  }
  function socialPage(st) {
    var h = backBtn('Social');
    if (!SO.ready()) return h + socNoLink();
    var c = SO.cache, t = ui.socTab || 'amigos';
    if (!c) { socLoad(true); return h + '<section class="win"><div class="empty">A ligar ao Sistema…</div></section>'; }
    if (!c.ok) return h + '<section class="win"><div class="empty">' + esc(c.msg || 'Não foi possível ligar.') + '</div><button class="btn block" data-a="soc-reload">Tentar outra vez</button></section>';
    var me = c.me, inc = c.requests_in.length + c.invites.length;
    var meP = { id: st.playerId, cls: st.cls, level: st.level, name: st.name, gender: st.gender, online: true, photo_ver: me.photo_ver || 0 };
    h += '<section class="win soc-me"><div class="row">' + socAvatar(meP, 'big', true) +
      '<div class="grow"><div class="card-t">' + esc(st.name) + '</div><div class="small muted">' + clsName(st.cls) + ' · Nv ' + st.level + '</div>' +
      '<button class="btn sm mono id-chip" data-a="id-copy">' + esc(st.playerId) + ' ⧉</button></div>' +
      '<div class="soc-rec"><b class="mono">' + (me.points || 0) + '</b><span class="small muted">pontos</span><span class="small"><span style="color:var(--good)">' + me.wins + 'V</span> · <span style="color:var(--danger)">' + me.losses + 'D</span></span></div></div>' +
      ptCard(me.points || 0) +
      '<div class="row" style="gap:6px;margin-top:10px"><label class="btn sm grow photo-pick">' + uiIcon('ui_camera', '📷', 'btn-ico') + (me.photo_ver ? ' Mudar foto de perfil' : ' Pôr foto de perfil') + '<input type="file" accept="image/*" id="photo-in" hidden></label>' +
      (me.photo_ver ? '<button class="btn sm ghost" data-a="photo-del">Tirar foto</button>' : '') + '</div>' +
      '<p class="hint" style="margin:8px 0 0">Só os teus amigos veem a tua foto. Partilha o teu ID para os outros jogadores te adicionarem.</p></section>';
    h += '<div class="chips" style="margin-top:12px">' + [['amigos', 'Amigos', c.friends.length, c.unread], ['duelos', 'Duelos', null, c.invites.length], ['pedidos', 'Pedidos', null, c.requests_in.length]].map(function (x) {
      return '<button class="chip' + (t === x[0] ? ' on' : '') + '" data-a="soc-tab" data-v="' + x[0] + '">' + x[1] + (x[2] != null ? ' <span class="muted">' + x[2] + '</span>' : '') + (x[3] ? ' <span class="badge-in">' + x[3] + '</span>' : '') + '</button>';
    }).join('') + '</div>';
    if (c.duel) h += '<button class="notice-banner duel-banner" data-a="duel-open" data-id="' + c.duel.id + '"><span class="nb-ico">' + uiIcon('ui_duel', '⚔', 'nb-img') + '</span><span class="grow"><b>' + (c.duel.status === 'active' ? 'Duelo em curso' : 'A tua sala de duelo está aberta') + '</b><span class="small muted">Sala ' + esc(c.duel.code) + '</span></span><span class="nb-go">Abrir ›</span></button>';
    if (t === 'amigos') h += friendsTab(st, c);
    else if (t === 'duelos') h += duelsTab(st, c);
    else h += requestsTab(st, c);
    return h;
  }
  function friendsTab(st, c) {
    var h = '<section class="win"><div class="win-h">Adicionar amigo</div><div class="row"><input class="in grow" id="soc-q" data-keep maxlength="40" placeholder="ID de Jogador ou nome" autocomplete="off"><button class="btn" data-a="soc-find">Procurar</button></div>';
    if (ui.socFound) {
      h += '<div class="stack" style="gap:8px;margin-top:10px">' + (ui.socFound.length ? ui.socFound.map(function (p) {
        var rel = p.relation, btn = rel === 'friend' ? '<span class="tag good">Amigo</span>' : rel === 'sent' ? '<span class="tag">Pedido enviado</span>' : rel === 'received' ? '<button class="btn sm pri" data-a="soc-accept" data-id="' + esc(p.id) + '">Aceitar</button>' : '<button class="btn sm pri" data-a="soc-add" data-id="' + esc(p.id) + '">Adicionar</button>';
        return '<div class="card soc-row"><div class="card-h">' + socAvatar(p) + '<div class="grow"><div class="card-t">' + esc(p.name) + '</div><div class="small muted">' + clsName(p.cls) + ' · Nv ' + p.level + ' · ' + seenText(p) + '</div></div>' + btn + '</div></div>';
      }).join('') : '<div class="small muted">Ninguém encontrado.</div>') + '</div>';
    }
    h += '</section>';
    var on = c.friends.filter(function (f) { return f.online; }).length;
    h += '<section class="win"><div class="win-h">Amigos <small>' + on + ' online · ' + c.friends.length + '</small></div>';
    if (!c.friends.length) h += '<div class="empty">Ainda não tens amigos no Sistema. Procura alguém pelo ID ou pelo nome.</div>';
    else h += '<div class="stack" style="gap:8px">' + c.friends.map(function (f) {
      return '<div class="card soc-row' + (f.online ? ' online' : '') + '"><div class="card-h">' + socAvatar(f, '', true) + '<div class="grow"><div class="card-t">' + esc(f.name) + (f.unread ? ' <span class="badge-in">' + f.unread + '</span>' : '') + legalTag(f.legal, f.premium, 'sm') + '</div>' +
        '<div class="small muted">' + clsName(f.cls) + ' · Nv ' + f.level + ' · <span class="' + (f.online ? 'on-txt' : '') + '">' + seenText(f) + '</span></div>' + ptChip(f.points) + '</div></div>' +
        '<div class="row" style="gap:6px;margin-top:8px"><button class="btn sm grow" data-a="chat-open" data-id="' + esc(f.id) + '">' + uiIcon('ui_chat', '💬', 'btn-ico') + ' Conversar</button><button class="btn sm grow bad" data-a="duel-invite" data-id="' + esc(f.id) + '">' + uiIcon('ui_duel', '⚔', 'btn-ico') + ' Desafiar</button><button class="btn sm ghost" data-a="soc-remove" data-id="' + esc(f.id) + '" aria-label="Remover amigo">✕</button></div></div>';
    }).join('') + '</div>';
    return h + '</section>';
  }
  function requestsTab(st, c) {
    var h = '<section class="win"><div class="win-h">Pedidos recebidos <small>' + c.requests_in.length + '</small></div>';
    h += c.requests_in.length ? '<div class="stack" style="gap:8px">' + c.requests_in.map(function (p) {
      return '<div class="card soc-row"><div class="card-h">' + socAvatar(p) + '<div class="grow"><div class="card-t">' + esc(p.name) + '</div><div class="small muted">' + clsName(p.cls) + ' · Nv ' + p.level + '</div></div></div>' +
        '<div class="row" style="gap:6px;margin-top:8px"><button class="btn sm pri grow" data-a="soc-accept" data-id="' + esc(p.id) + '">Aceitar</button><button class="btn sm ghost grow" data-a="soc-decline" data-id="' + esc(p.id) + '">Recusar</button></div></div>';
    }).join('') + '</div>' : '<div class="empty">Sem pedidos de amizade.</div>';
    h += '</section><section class="win"><div class="win-h">Pedidos enviados <small>' + c.requests_out.length + '</small></div>';
    h += c.requests_out.length ? '<div class="stack" style="gap:8px">' + c.requests_out.map(function (p) {
      return '<div class="card soc-row"><div class="card-h">' + socAvatar(p) + '<div class="grow"><div class="card-t">' + esc(p.name) + '</div><div class="small muted">À espera de resposta</div></div><button class="btn sm ghost" data-a="soc-remove" data-id="' + esc(p.id) + '">Cancelar</button></div></div>';
    }).join('') + '</div>' : '<div class="empty">Nenhum pedido à espera.</div>';
    return h + '</section>';
  }
  function duelsTab(st, c) {
    var so = SO.ensure(st), today = E.dateKey(), left = Math.max(0, SO.DAILY - (so.day === today ? so.count : 0));
    var h = '<section class="win duel-win"><div class="win-h">Arena de Duelos</div>' +
      '<p class="small muted" style="margin:0 0 10px">Combate 1 contra 1, por turnos, contra jogadores reais. Cada um usa os seus atributos e a habilidade da sua classe. Cada vitória dá +1 ponto de patente e cada derrota tira 1. Recompensas hoje: <b>' + left + '/' + SO.DAILY + '</b> duelos.</p>' +
      '<div class="row" style="gap:6px"><button class="btn bad grow" data-a="duel-create" data-p="1">' + uiIcon('ui_duel', '⚔', 'btn-ico') + ' Criar sala pública</button><button class="btn grow" data-a="duel-create" data-p="0">Sala privada</button></div>' +
      '<div class="row" style="margin-top:8px"><input class="in grow mono" id="duel-code" data-keep maxlength="6" placeholder="Código da sala" autocomplete="off" style="text-transform:uppercase"><button class="btn" data-a="duel-join-code">Entrar</button></div></section>';
    if (c.invites.length) h += '<section class="win gold"><div class="win-h">Desafios recebidos <small>' + c.invites.length + '</small></div><div class="stack" style="gap:8px">' + c.invites.map(function (d) {
      return '<div class="card soc-row"><div class="card-h">' + socAvatar(d) + '<div class="grow"><div class="card-t">' + esc(d.name) + ' desafia-te</div><div class="small muted">' + clsName(d.cls) + ' · Nv ' + d.level + ' · sala ' + esc(d.code) + '</div>' + ptChip(d.points) + '</div><button class="btn sm bad" data-a="duel-join" data-id="' + esc(d.id) + '">Aceitar</button></div></div>';
    }).join('') + '</div></section>';
    h += '<section class="win"><div class="win-h">Salas abertas <small>' + c.open.length + '</small></div>' + (c.open.length ? '<div class="stack" style="gap:8px">' + c.open.map(function (d) {
      var gap = d.level - st.level;
      return '<div class="card soc-row"><div class="card-h">' + socAvatar(d) + '<div class="grow"><div class="card-t">' + esc(d.name) + '</div><div class="small muted">' + clsName(d.cls) + ' · Nv ' + d.level + ' · ' + (d.points || 0) + ' pontos' + (Math.abs(gap) >= 10 ? ' · <span style="color:' + (gap > 0 ? 'var(--danger)' : 'var(--good)') + '">' + (gap > 0 ? '+' : '') + gap + ' níveis</span>' : '') + '</div></div><button class="btn sm bad" data-a="duel-join" data-id="' + esc(d.id) + '">Lutar</button></div></div>';
    }).join('') + '</div>' : '<div class="empty">Nenhuma sala aberta agora. Cria a tua e espera por um adversário.</div>') + '</section>';
    h += '<section class="win"><div class="win-h">Últimos duelos</div>' + (ui.duelHist ? (ui.duelHist.length ? '<div class="stack" style="gap:6px">' + ui.duelHist.map(function (x) {
      return '<div class="row between small"><span>' + (x.won ? '<b style="color:var(--good)">Vitória</b>' : '<b style="color:var(--danger)">Derrota</b>') + ' contra ' + esc(x.opponent || '?') + '</span><span class="muted">' + timeStr(x.at) + '</span></div>';
    }).join('') + '</div>' : '<div class="empty">Ainda não fizeste nenhum duelo.</div>') : '<button class="btn block ghost" data-a="duel-hist">Ver histórico</button>') + '</section>';
    return h;
  }
  function chatPage(st) {
    var c = SO.cache, fid = ui.chatWith, f = (c && c.friends || []).filter(function (x) { return x.id === fid; })[0] || ui.chatFriend || { id: fid, name: 'Amigo' };
    var msgs = ui.chatMsgs || [];
    var h = '<div class="row" style="margin-top:14px"><button class="btn sm ghost" data-a="soc-back">‹ Voltar</button>' + socAvatar(f) + '<div class="grow"><h2 style="font-size:17px;margin:0">' + esc(f.name) + '</h2><div class="small muted">' + (f.level ? clsName(f.cls) + ' · Nv ' + f.level + ' · ' : '') + seenText(f) + '</div></div>' +
      '<button class="btn sm bad" data-a="duel-invite" data-id="' + esc(fid) + '">' + uiIcon('ui_duel', '⚔', 'btn-ico') + '</button></div>';
    h += '<section class="win chat-win"><div class="chat-list" id="chat-list">' + (ui.chatLoading && !msgs.length ? '<div class="empty">A carregar…</div>' : msgs.length ? msgs.map(function (m, i) {
      var mine = m.from === st.playerId, prev = msgs[i - 1], day = new Date(m.at).toDateString(), sep = !prev || new Date(prev.at).toDateString() !== day;
      return (sep ? '<div class="chat-day">' + new Date(m.at).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' }) + '</div>' : '') +
        '<div class="msg ' + (mine ? 'me' : 'them') + (m.pending ? ' pending' : '') + '"><div class="bubble">' + esc(m.text) + '</div><div class="msg-t">' + clockOf(m.at) + (mine ? (m.pending ? ' · a enviar' : m.failed ? ' · falhou' : '') : '') + '</div></div>';
    }).join('') : '<div class="empty">Ainda não há mensagens. Diz olá!</div>') + '</div>' +
      '<div class="chat-in"><input class="in grow" id="chat-text" data-keep maxlength="500" placeholder="Escreve uma mensagem…" autocomplete="off"><button class="btn pri" data-a="chat-send">Enviar</button></div></section>';
    return h;
  }
  /* ---------- duelo (mesma disposição do combate contra chefes) ---------- */
  function duelLogCls(l, me) {
    var c = l.c || '';
    if (c === 'hit' || c === 'crit') return l.tg === me ? 'hurt' : (c === 'crit' ? 'crit' : 'dmg');
    if (c === 'heal' || c === 'buff') return l.w === me ? 'good' : 'muted';
    if (c === 'status') return l.tg === me ? 'hurt' : 'good';
    if (c === 'skill') return l.w === me ? 'skill' : 'warn';
    if (c === 'win') return l.w === me ? 'win' : 'lose';
    if (c === 'miss') return 'muted';
    return c === 'warn' ? 'warn' : 'sys';
  }
  function duelAvatar(F, cls, id) {
    var img = S.CLASSES[F.cls] ? S.avatar.imageFor(F.cls, F.level) : null;
    return '<div class="' + cls + ' has-art duel-av"' + (id ? ' id="' + id + '"' : '') + '>' + (img ? '<img src="' + img + '" alt="">' : S.avatar.html(F.cls, F.level)) + '</div>';
  }
  function duelPage(st) {
    var d = ui.duel;
    var h = '<div class="row" style="margin-top:14px"><button class="btn sm ghost" data-a="soc-back">‹ Social</button><h2 style="font-size:18px">Duelo</h2></div>';
    if (!d) return h + '<section class="win"><div class="empty">A carregar o duelo…</div></section>';
    var me = d.me, opId = d.host === me ? d.guest : d.host, F = d.fighters || {}, A = F[me], B = opId ? F[opId] : null;
    if (d.status === 'waiting') {
      var c = SO.cache, fr = (c && c.friends) || [];
      h += '<section class="win duel-win duel-wait"><div class="win-h">Sala de duelo</div><div class="duel-code mono">' + esc(d.code) + '</div>' +
        '<p class="small muted" style="text-align:center;margin:4px 0 12px">' + (d.public ? 'Sala pública: aparece na lista de salas abertas.' : 'Sala privada: só entra quem tiver o código ou for convidado.') + '<br>A sala fecha sozinha ao fim de 30 minutos sem adversário.</p>' +
        '<div class="duel-radar"><i></i><i></i><i></i></div><p style="text-align:center" class="small">À espera de um adversário…</p>' +
        '<button class="btn block" data-a="duel-copy">Copiar código</button>';
      if (fr.length) h += '<div class="info-h" style="margin-top:12px">Convidar um amigo</div><div class="stack" style="gap:6px">' + fr.slice(0, 12).map(function (f) {
        return '<div class="row between"><span class="row" style="gap:8px">' + socAvatar(f) + '<span>' + esc(f.name) + ' <span class="small muted">Nv ' + f.level + '</span></span></span>' + (d.invited === f.id ? '<span class="tag good">Convidado</span>' : '<button class="btn sm" data-a="duel-reinvite" data-id="' + esc(f.id) + '">Convidar</button>') + '</div>';
      }).join('') + '</div>';
      h += '<button class="btn block ghost" style="margin-top:12px" data-a="duel-leave">Fechar a sala</button></section>';
      return h;
    }
    if (d.status === 'cancelled' || !A || !B) return h + '<section class="win"><div class="empty">Esta sala foi fechada.</div><button class="btn block" data-a="soc-back">Voltar</button></section>';
    var myTurn = d.status === 'active' && d.turn === me, secs = Math.max(0, Math.ceil((d.deadline - SO.serverNow()) / 1000));
    var opDead = d.status === 'done' && d.winner === me;
    h += '<div class="battle duel-battle">';
    // adversário: em cima, como um chefe
    var bubble = function (id) { var e = (d.emotes || []).filter(function (x) { return x.w === id; }).pop(); return e && SO.serverNow() - e.at < 9000 ? '<div class="emote-bubble' + (id === me ? ' mine' : '') + '">«' + esc(e.t) + '»</div>' : ''; };
    var ttl = function (F0) { return F0.title ? '<div class="duel-title" style="' + (F0.tcolor ? 'color:' + F0.tcolor + ';text-shadow:0 0 8px ' + F0.tcolor + '88' : 'color:var(--glow)') + '">' + esc(F0.title) + '</div>' : ''; };
    h += '<section class="win danger boss-panel duel-op' + (d.turn === opId ? ' op-turn' : '') + '"><div class="win-h"><span class="duel-nm">' + esc(B.name) + ttl(B) + '</span><small>' + clsName(B.cls) + ' · Nv ' + B.level + ' · turno ' + d.turn_no +
      (d.status === 'active' ? ' · <span class="duel-timer' + (secs <= 10 ? ' urgent' : '') + '" data-until="' + d.deadline + '">' + secs + 's</span>' : '') + '</small></div>' +
      '<div class="boss-wrap"><div class="boss-aura" style="--c:' + (d.turn === opId ? 'rgba(255,60,90,.65)' : 'rgba(255,60,90,.35)') + '"></div>' + duelAvatar(B, 'boss-ico' + (opDead ? ' dead' : ''), 'boss-ico') + bubble(opId) + '</div>' +
      (d.status === 'active' && d.turn === opId ? '<div class="speech duel-thinking"><span class="speech-name">' + esc(B.name) + '</span><span class="speech-txt">está a escolher a jogada<i class="dots"><b>.</b><b>.</b><b>.</b></i></span></div>' : '') +
      '<div style="margin-top:8px">' + bar('boss', B.hp, B.maxHp, 'Vida' + (B.shield ? ' · escudo ' + fmt(B.shield) : ''), 'dop-' + d.id) + '</div>' +
      '<div style="margin-top:6px">' + bar('mp', B.mp, B.maxMp, 'Mana', 'dopm-' + d.id) + '</div>' +
      '<div class="statuses" style="margin-top:6px">' + statusTags(B.st, true) + (B.stunned ? '<span class="tag good">atordoado</span>' : '') +
      (B.summons.length ? '<span class="tag">' + B.summons.map(function (s) { return esc(s.name) + ' ' + s.turns + 't'; }).join(' · ') + '</span>' : '') + (B.squad && B.squad.length ? '<span class="tag">🌑 ' + B.squad.length + ' servo' + (B.squad.length > 1 ? 's' : '') + '</span>' : '') + '</div></section>';
    // registo
    h += '<div class="log" id="blog" aria-live="polite">' + (d.log || []).map(function (l) { return '<div class="' + duelLogCls(l, me) + '">' + logLine(l.t) + '</div>'; }).join('') + '</div>';
    // o teu painel
    h += '<section class="win ppanel' + (myTurn ? ' my-turn' : '') + '" id="ppanel" style="margin-top:10px">' + bubble(me) + '<div class="win-h"><span class="duel-nm">' + esc(st.name) + ttl(A) + '</span><small>' + (A.summons.length ? A.summons.map(function (s) { return esc(s.name) + ' ' + s.turns + 't'; }).join(' · ') : (A.squad && A.squad.length ? '🌑 ' + A.squad.map(function (s) { return esc(s.name); }).join(', ') : 'sem invocações')) + '</small></div>' +
      '<div class="stack" style="gap:6px">' + bar('hp', A.hp, A.maxHp, 'Vida' + (A.shield ? ' · escudo ' + fmt(A.shield) : ''), 'dme-' + d.id, true) + bar('mp', A.mp, A.maxMp, 'Mana', 'dmem-' + d.id, true) + '</div>' +
      '<div class="statuses" style="margin-top:6px;justify-content:flex-start">' + statusTags(A.st, false) + (A.stunned ? '<span class="tag bad">atordoado</span>' : '') + '</div>';
    if (d.status === 'done') {
      var won = d.winner === me, rw = SO.reward(d), rt = d.result && d.result.rating && d.result.rating[me];
      var isFriend = ((SO.cache && SO.cache.friends) || []).some(function (f) { return f.id === opId; });
      h += '<div class="card duel-end ' + (won ? 'win' : 'lose') + '" style="margin-top:10px;text-align:center"><h3 style="color:' + (won ? 'var(--gold)' : 'var(--danger)') + '">' + (won ? 'Vitória' : 'Derrota') + '</h3>' +
        '<div class="small">' + (d.reason === 'forfeit' ? (won ? 'O adversário desistiu.' : 'Desististe do duelo.') : d.reason === 'timeout' ? (won ? 'O adversário deixou passar o tempo duas vezes.' : 'Deixaste passar o tempo duas vezes.') : d.reason === 'turns' ? 'Limite de turnos: venceu quem tinha mais vida.' : (won ? 'Derrubaste ' + esc(B.name) + '.' : esc(B.name) + ' derrubou-te.')) + '</div>' +
        (d.result && d.result.points && d.result.points[me] ? (function (pp) { var a = S.duelRank(pp[0]).rank, b = S.duelRank(pp[1]).rank;
          return '<div class="pt-end' + (b.i > a.i ? ' up' : b.i < a.i ? ' down' : '') + '" style="--pc:' + b.color + '">' + ptIcon(b.i, 'pt-end-img') + '<div><div class="small muted">' + (b.i > a.i ? 'Subiste de patente' : b.i < a.i ? 'Desceste de patente' : 'Patente') + '</div><b>' + esc(b.name) + '</b>' +
            '<div class="small mono">Pontos: ' + pp[0] + ' → <b>' + pp[1] + '</b> (' + (pp[1] >= pp[0] ? '+' : '') + (pp[1] - pp[0]) + ')</div></div></div>'; })(d.result.points[me]) : '') +
        (rw ? (rw.capped ? '<div class="small muted" style="margin-top:6px">Já recebeste as recompensas de duelo de hoje (' + SO.DAILY + ').</div>' : '<div class="reward">+' + fmt(rw.xp) + ' XP · +' + fmt(rw.coins) + ' moedas</div>') +
          (rw.used && rw.used.length ? '<div class="small muted" style="margin-top:4px">Gastaste: ' + esc(rw.used.join(', ')) + '</div>' : '') : '') +
        '<div class="row" style="gap:6px;margin-top:10px"><button class="btn grow" data-a="soc-back">Sair do duelo</button>' + (isFriend ? '<button class="btn bad grow" data-a="duel-invite" data-id="' + esc(opId) + '">Revanche</button>' : '<button class="btn bad grow" data-a="duel-create" data-p="1">Nova sala</button>') + '</div></div>';
    } else if (!myTurn) {
      h += '<div class="actions busy duel-wait-acts" style="margin-top:10px"><button class="btn pri" disabled>Atacar</button><button class="btn" disabled>Habilidades</button><button class="btn" disabled>Itens</button><button class="btn" disabled>Defender</button>' +
        '<div class="duel-turn wait" style="grid-column:1/-1">Vez de ' + esc(B.name) + '…</div><button class="btn ghost emote-btn" data-a="emote-open">💬 Emote</button><button class="btn bad" data-a="duel-leave">Desistir</button></div>';
    } else if (A.stunned > 0) {
      h += '<div class="actions" style="margin-top:10px"><button class="btn pri" style="grid-column:1/-1" data-a="duel-act" data-v="pass">Atordoado: passar o turno</button><button class="btn bad" style="grid-column:1/-1" data-a="duel-leave">Desistir</button></div>';
    } else {
      h += '<div class="duel-turn">É A TUA VEZ</div><div class="actions' + (ui.duelBusy ? ' busy' : '') + '" style="margin-top:6px">' +
        '<button class="btn pri" data-a="duel-act" data-v="attack">Atacar</button>' +
        '<button class="btn" data-a="d-sheet" data-v="skills">Habilidades</button>' +
        '<button class="btn" data-a="d-sheet" data-v="items">Itens</button>' +
        '<button class="btn" data-a="duel-act" data-v="defend">Defender</button>' +
        '<button class="btn ghost emote-btn" data-a="emote-open">💬 Emote</button><button class="btn bad" data-a="duel-leave">Desistir</button></div>';
    }
    h += '</section></div>';
    return h;
  }
  /* emotes: frases que mandas ao adversário */
  function emoteSheet() {
    var d = ui.duel, list = S.premium.emotesOf(E.state), sent = d ? (d.emotes || []).filter(function (x) { return x.w === d.me; }).length : 0;
    return '<div class="sheet-h"><h2>Emotes</h2><button class="btn sm ghost" data-a="close">Fechar</button></div><p class="hint" style="margin:-4px 0 10px">Até 8 frases por duelo, com uns segundos entre elas. Já mandaste <b class="mono">' + sent + ' / 8</b>. Mais frases em Loja Premium › Aparência.</p>' +
      '<div class="emote-pick">' + list.map(function (x) { return '<button class="btn sm" data-a="duel-emote" data-id="' + esc(x.id) + '"' + (sent >= 8 ? ' disabled' : '') + '>«' + esc(x.t) + '»</button>'; }).join('') + '</div>';
  }
  /* oferecer um item de aparência a um amigo */
  function giftModal(m) {
    var c = S.COSMETIC_BY_ID[m.id], st = E.state, fr = ((SO.cache && SO.cache.friends) || []);
    if (!c) return '';
    var can = (st.crystals || 0) >= c.crystals;
    return '<div class="sheet-h"><h2>🎁 Oferecer</h2><button class="btn sm ghost" data-a="close">Fechar</button></div>' +
      (artId(c.id) || artId('ui_presente') ? '<div class="gift-art"><img src="' + (artId(c.id) || artId('ui_presente')) + '" alt=""></div>' : '') + '<p class="small" style="margin-top:0"><b>' + esc(c.name) + '</b> por ' + crys(c.crystals) + '. Pagas com os teus Cristais e o amigo recebe na próxima vez que abrir o jogo com internet. Se já a tiver, recebe o valor em Cristais.</p>' +
      (!can ? '<p class="small" style="color:var(--warn)">Faltam ' + (c.crystals - (st.crystals || 0)) + ' Cristais.</p>' : '') +
      (fr.length ? '<div class="stack" style="gap:6px">' + fr.map(function (f) {
        return '<div class="row between"><span class="row" style="gap:8px">' + socAvatar(f) + '<span>' + esc(f.name) + ' <span class="small muted">Nv ' + f.level + '</span></span></span><button class="btn sm prem" data-a="gift-send" data-id="' + esc(c.id) + '" data-to="' + esc(f.id) + '" data-n="' + esc(f.name) + '"' + (can && !ui.giftBusy ? '' : ' disabled') + '>Oferecer</button></div>';
      }).join('') + '</div>' : '<div class="empty">Ainda não tens amigos. Adiciona-os em Social.</div>') +
      '<p class="hint">Até 5 presentes por dia.</p>';
  }
  /* habilidades e itens do duelo (como no combate contra chefes) */
  function duelSheet() {
    var d = ui.duel, A = d && d.fighters && d.fighters[d.me];
    if (!A) return '';
    if (ui.modal.v === 'skills') {
      var list = A.skills.map(function (id) { return S.ALL_SKILLS[id]; }).filter(Boolean);
      return '<div class="sheet-h"><h2>Habilidades</h2><button class="btn sm ghost" data-a="close">Fechar</button></div><p class="hint" style="margin:-4px 0 10px">Num duelo, os golpes muito fortes, as curas, os escudos e os bónus têm a força reduzida.</p><div class="skill-grid">' +
        (list.length ? list.map(function (s) {
          var cdv = A.cds[s.id] || 0, dcost = S.skillCost(s, A.cls, A.level), dis = cdv > 0 || A.mp < dcost;
          return '<button class="skill-btn' + (S.SKILL_ART && S.SKILL_ART[s.id] ? ' has-ico' : '') + '" data-a="duel-skill" data-id="' + s.id + '"' + (dis ? ' disabled' : '') + '>' + skillIco(s, 'sk-b') + '<b>' + esc(s.name) + '</b>' +
            '<span class="mono small" style="color:var(--glow)">' + (cdv > 0 ? 'recarga ' + cdv : dcost + ' MP') + '</span><small>' + esc(s.desc) + '</small></button>';
        }).join('') : '<div class="empty">Ainda não tens habilidades ativas.</div>') + '</div>';
    }
    var ids = Object.keys(A.items || {}).filter(function (id) { return (A.items[id] || 0) > (A.used[id] || 0) && S.ITEMS[id] && S.ITEMS[id].battle; });
    var lim = d.heal_limit || 3;
    return '<div class="sheet-h"><h2>Itens</h2><button class="btn sm ghost" data-a="close">Fechar</button></div>' +
      '<p class="hint" style="margin:-4px 0 10px">Poções de cura neste duelo: <b class="mono">' + (A.heals || 0) + ' / ' + lim + '</b>. Só 1 relíquia premium por duelo. Os itens usados saem da Bolsa no fim.</p><div class="skill-grid">' +
      (ids.length ? ids.map(function (id) {
        var it = S.ITEMS[id], heal = it.use && (it.use.type === 'heal' || it.use.type === 'restore'), dis = (heal && (A.heals || 0) >= lim) || (it.premium && (A.premUsed || 0) >= 1);
        return '<button class="skill-btn" data-a="duel-item" data-id="' + id + '"' + (dis ? ' disabled' : '') + '><b>' + itemTiny(it) + ' ' + esc(it.name) + '</b><span class="mono small">×' + ((A.items[id] || 0) - (A.used[id] || 0)) + '</span><small>' + esc(it.desc) + '</small></button>';
      }).join('') : '<div class="empty">Sem itens de combate. Compra poções na Loja.</div>') + '</div>';
  }
  /* animações das jogadas novas (as tuas e as do adversário) */
  function duelFx(fresh, d) {
    var me = d.me, bossEl = document.getElementById('boss-ico'), pp = document.getElementById('ppanel');
    if (!fresh.length || !FX.full()) return 0;
    var bc = FX.center(bossEl), pc = FX.center(pp), style = STYLE[E.state.cls], color = S.CLASSES[E.state.cls].color;
    var t = 0, at = function (ms, fn) { setTimeout(fn, ms); };
    var hitBoss = function () { if (!bossEl || !bossEl.isConnected) return; bossEl.classList.remove('hit'); void bossEl.offsetWidth; bossEl.classList.add('hit'); setTimeout(function () { bossEl.classList.remove('hit'); }, 420); };
    var panel = function (c) { if (!pp || !pp.isConnected) return; pp.classList.remove('hit', 'healed'); void pp.offsetWidth; pp.classList.add(c); };
    fresh.forEach(function (e) {
      var txt = e.t, v = num(/(\d+) de (dano|vida)/, txt) || num(/: (\d+)\./, txt);
      if (e.c === 'skill') {
        var nm = txt.replace(/^.*? usou /, '').replace(/[.!]$/, '');
        var skn = Object.keys(S.ALL_SKILLS).map(function (k) { return S.ALL_SKILLS[k]; }).filter(function (x) { return x.name === nm; })[0], itn = !skn && Object.keys(S.ITEMS).map(function (k) { return S.ITEMS[k]; }).filter(function (x) { return x.name === nm; })[0];
        var snd = skn ? skillSound(skn) : itn && drinkable(itn) ? drinkSound(itn) : null;
        (function (t0, mine, snd) { at(t0, function () { if (snd && !(mine && snd !== 'skill' && /potion|drink/.test(snd))) sfx(snd); FX.text(nm, mine ? pc.x : bc.x, (mine ? pc.y : bc.y) - 40, mine ? color : '#ff7a8a'); }); })(t, e.w === me, snd);
        t += 140;
      } else if (e.c === 'hit' || e.c === 'crit') {
        var crit = e.c === 'crit', hits = num(/\((\d+) golpes\)/, txt) || 1;
        if (e.tg !== me) {
          (function (t0, v, hits, crit, summon) { at(t0, function () { sfx(crit ? 'crit' : 'attack'); var dd = FX.attack(summon ? 'spirit' : style, bc.x, bc.y, summon ? '#a184ff' : color, hits, crit); setTimeout(function () { hitBoss(); FX.number(fmt(v || 0), bc.x, bc.y - 30, crit ? 'crit' : (summon ? 'small' : '')); if (crit) { FX.shake(1); FX.vibrate(40); } }, Math.min(dd, 400) + 120); }); })(t, v, hits, crit, /^(💀|🌑|☠️)/.test(txt));
          t += Math.min(hits * (hits > 4 ? 70 : 110), 700) + 250;
        } else {
          (function (t0, v, crit) { at(t0, function () { sfx('hurt', crit ? 1.1 : 1); panel('hit'); FX.number('-' + fmt(v || 0), pc.x, pc.y - 20, crit ? 'crit' : 'hurt'); FX.shake(crit ? 2 : 1); FX.vibrate(crit ? 80 : 40); }); })(t, v, crit);
          t += 320;
        }
      } else if (e.c === 'heal') {
        (function (t0, mine, v) { at(t0, function () { if (mine) { panel('healed'); FX.number('+' + fmt(v || 0), pc.x, pc.y - 20, 'heal'); FX.rise(pc.x, pc.y + 30, pc.w || 200, '#5be08a', 30); } else FX.number('+' + fmt(v || 0), bc.x, bc.y - 30, 'heal'); }); })(t, e.w === me, v);
        t += 200;
      } else if (e.c === 'buff') {
        (function (t0, mine) { at(t0, function () { if (mine) FX.buff(pc.x, pc.y, '#6fd6ff'); else FX.buff(bc.x, bc.y, '#ff8a9a'); }); })(t, e.w === me);
        t += 150;
      } else if (e.c === 'status') {
        var onOp = e.tg !== me, x = onOp ? bc : pc;
        (function (t0, x) { at(t0, function () { if (/atordoado/.test(txt)) { FX.stars(x.x, x.y); FX.text('ATORDOADO', x.x, x.y - 60, '#ffd24a'); } else if (/sofre/.test(txt)) FX.burst(x.x, x.y, '#ff8a3d', 20, { speed: 4, gravity: -.05 }); else FX.chains(x.x, x.y); }); })(t, x);
        t += 150;
      } else if (e.c === 'miss') {
        (function (t0, onOp) { at(t0, function () { FX.text('ESQUIVA', onOp ? bc.x : pc.x, (onOp ? bc.y : pc.y) - 50, '#dce8ff'); }); })(t, e.w !== me);
        t += 150;
      }
    });
    return t + 300;
  }

  /* ================= SOMBRAS: Tornar Servo e menu Servos ================= */
  var Sh = S.shadows;
  /* aparência sombria: imagem própria (assets/shadows) ou a do chefe escurecida */
  function shadowArt(b, cls) {
    var own = S.SHADOW_ART && S.SHADOW_ART[b.id], art = S.BOSS_ART && S.BOSS_ART[b.id];
    if (own) return '<span class="sh-art own ' + (cls || '') + '"><img src="' + own + '" alt="" loading="lazy"></span>';
    return '<span class="sh-art shade ' + (cls || '') + '">' + (art ? '<img src="' + art + '" alt="" loading="lazy">' : '<span class="sh-ico">' + b.icon + '</span>') + '</span>';
  }
  function preShadowArt(b, cls) {
    var art = S.BOSS_ART && S.BOSS_ART[b.id];
    return '<span class="sh-art ' + (cls || '') + '">' + (art ? '<img src="' + art + '" alt="" loading="lazy">' : '<span class="sh-ico">' + b.icon + '</span>') + '</span>';
  }
  function triesDots(left) {
    var h = ''; for (var i = 0; i < S.SHADOW_RULES.tries; i++) h += '<i class="' + (i < left ? 'on' : '') + '"></i>';
    return '<span class="sh-tries" aria-label="' + left + ' tentativas">' + h + '</span>';
  }
  function ariseModal(m) {
    var st = E.state, b = S.BOSS_BY_ID[m.id], res = m.res, left = Sh.triesLeft(st, b.id), status = Sh.status(st, b.id);
    var pend = st.shadows.pending[b.id], ch = Math.round(Sh.chance(st, b) * 100);
    var h = '<div class="arise' + (res && res.success ? ' risen' : '') + (res && res.lost ? ' gone' : '') + '">' +
      '<div class="arise-tag">SISTEMA · EXTRAÇÃO DE SOMBRA</div>' +
      '<div class="arise-stage" id="arise-stage">' + (status === 'owned' ? shadowArt(b, 'big') : preShadowArt(b, 'big dead')) + '<div class="arise-smoke"></div></div>';
    if (res && res.success) {
      h += '<div class="arise-cry">ERGA-SE.</div>' +
        '<p class="arise-say">«' + esc(Sh.line(st, b.id)) + '»</p>' +
        '<p class="arise-txt">A sombra de <b>' + esc(b.name) + '</b> obedece-te. É agora o teu servo.<br><span class="muted">' + (res.auto ? 'Já está convocado e luta ao teu lado no próximo combate.' : 'Convoca-o no menu Servos quando tiveres um lugar livre.') + '</span></p>' +
        '<div class="row" style="margin-top:12px"><button class="btn ghost grow" data-a="close">Fechar</button><button class="btn pri grow" data-a="sh-open" data-id="' + b.id + '">Ver servo</button></div>';
    } else if (status === 'sealed') {
      var price = Sh.buyPrice(b), have = st.crystals || 0;
      h += '<h2 class="arise-name">' + esc(b.name) + '</h2>' +
        '<p class="arise-txt bad">A sombra resistiu ' + S.SHADOW_RULES.tries + ' vezes e ficou <b>selada</b>.</p>' +
        '<p class="arise-txt"><span class="muted">' + Sh.RANK_NAME[Sh.rank(b)] + (b.premium ? ' da arena' : ' dos portões') + '. O Sistema aceita quebrar o selo em troca de Cristais, e a sombra torna-se tua serva na hora.</span></p>' +
        triesDots(0) +
        '<button class="btn prem block" style="margin-top:14px" data-a="sh-buy" data-id="' + b.id + '"><i class="crys-ico"></i> Quebrar o selo · ' + price + ' Cristais</button>' +
        (have < price ? '<p class="hint" style="text-align:center;margin:6px 0 0">Tens ' + have + ' Cristais.</p>' : '') +
        '<button class="btn ghost block sm" style="margin-top:8px" data-a="close">Fechar</button>';
    } else if (status === 'lost') {
      h += '<h2 class="arise-name">' + esc(b.name) + '</h2>' +
        '<p class="arise-txt bad">A sombra resistiu ' + S.SHADOW_RULES.tries + ' vezes e dissipou-se para sempre.<br><span class="muted">Este inimigo nunca poderá ser teu servo.</span></p>' +
        triesDots(0) + '<button class="btn block" style="margin-top:14px" data-a="close">Fechar</button>';
    } else if (status === 'pending') {
      h += '<h2 class="arise-name">' + esc(b.name) + '</h2>' +
        (res && !res.success ? '<p class="arise-txt bad">A sombra resistiu. ' + (left === 1 ? 'Resta uma última tentativa.' : 'Restam ' + left + ' tentativas.') + '</p>'
          : '<p class="arise-txt">A sombra deste inimigo ainda não se dissipou. O Sistema permite-te tentar extraí-la e torná-la tua serva.</p>') +
        '<div class="arise-info">' + triesDots(left) +
        '<div><span class="muted small">Hipótese por tentativa</span><b class="mono">' + ch + '%</b></div>' +
        '<div><span class="muted small">' + (pend.exp ? 'A sombra desvanece em' : 'Sombra adormecida') + '</span><b class="mono">' + (pend.exp ? '<span data-cd="' + pend.exp + '">' + cdText(pend.exp) + '</span>' : 'sem prazo') + '</b></div></div>' +
        '<p class="hint" style="text-align:center;margin:6px 0 0">' + (Sh.isArena(b) ? 'Sombra da arena: nunca desvanece. ' : '') + 'Se falhares as ' + S.SHADOW_RULES.tries + ' tentativas' + (Sh.isArena(b) ? '' : ' ou ela desvanecer') + ', fica selada e podes obtê-la por ' + Sh.buyPrice(b) + ' Cristais (' + Sh.RANK_NAME[Sh.rank(b)].toLowerCase() + ').' + (st.cls === 'invocador' ? ' Como Invocador, as almas ouvem-te melhor (+12%).' : '') + '</p>' +
        '<button class="btn arise-btn block" data-a="arise-try" data-id="' + b.id + '">EXTRAIR SOMBRA</button>' +
        '<button class="btn ghost block sm" style="margin-top:8px" data-a="close">' + (pend.exp ? 'Deixar para depois' : 'Fechar') + '</button>';
    } else {
      h += '<h2 class="arise-name">' + esc(b.name) + '</h2><p class="arise-txt">Esta sombra já é tua.</p><button class="btn block" data-a="close">Fechar</button>';
    }
    return h + '</div>';
  }
  function shadowModal(m) {
    var st = E.state, b = S.BOSS_BY_ID[m.id], role = Sh.role(b), ri = S.SHADOW_ROLES[role];
    var on = st.shadows.active.indexOf(b.id) >= 0, f = Math.round(Sh.factor(st, b) * 100);
    var g = S.GATES[b.gate - 1];
    var fx = role === 'guarda' ? 'Escudo inicial de ' + (4 + Math.round(b.level / 20)) + '% da tua vida' : role === 'arcano' ? 'Defesa do inimigo -8% nos primeiros turnos' : role === 'comandante' ? 'O teu dano +5%' : null;
    return '<div class="sheet-h"><h2>' + esc(Sh.name(st, b.id)) + '</h2><button class="btn sm ghost" data-a="close">Fechar</button></div>' +
      '<button class="sh-say" data-a="sh-talk" data-id="' + b.id + '"><span class="sh-say-t">«' + esc(m.line || Sh.line(st, b.id)) + '»</span><span class="sh-say-h">toca para ouvir outra vez</span></button>' +
      '<div class="sh-detail">' + shadowArt(b, 'big') + '<div class="stack" style="gap:6px;min-width:0">' +
      '<div class="small muted">Sombra de ' + esc(b.name) + '<br>' + (b.premium ? esc(b.arenaName) + ' · Nv ' + b.level + (b.champion ? ' · Campeão da Arena' : b.lieutenant ? ' · Comandante' : ' · Sub-chefe') : esc(g ? g.name : '') + ' · Nv ' + b.level + (b.king ? ' · Rei do Portão' : '')) + '</div>' +
      '<div><span class="tag sh-role ' + role + '">' + ri.name + '</span> ' + (on ? '<span class="tag good">Convocado</span>' : '') + '</div>' +
      '<div class="small">' + esc(ri.desc) + '</div>' +
      '<ul class="sh-stats"><li>Ataca em cada turno com <b>' + f + '%</b> do teu ataque</li>' + (fx ? '<li>' + fx + '</li>' : '') + '</ul>' +
      '</div></div>' +
      '<label class="f" style="margin-top:12px"><span class="small muted">Nome do servo</span><div class="row"><input class="in grow" id="sh-name" maxlength="18" value="' + esc(st.shadows.names[b.id] || '') + '" placeholder="' + esc(Sh.baseName(b)) + '"><button class="btn sm" data-a="sh-rename" data-id="' + b.id + '">Guardar</button></div></label>' +
      '<button class="btn block ' + (on ? 'ghost' : 'arise-btn') + '" style="margin-top:12px" data-a="sh-toggle" data-id="' + b.id + '">' + (on ? 'Dispensar (regressa às sombras)' : 'Convocar para os combates') + '</button>' +
      (function () {
        var rw = Sh.sparReward(st, b, true), ready = Sh.sparReady(st, b.id);
        return '<div class="sh-spar"><div class="info-h">Treinar com esta sombra</div><p class="small muted" style="margin:0 0 6px">Enfrenta ' + esc(Sh.name(st, b.id)) + ' na sua forma dominada, com a força que tinha quando o venceste. Não perdes nível, XP nem moedas, e a vida volta ao que era.</p>' +
          '<div class="small">' + (ready ? 'Recompensa de treino: <b>+' + fmt(rw.xp) + ' XP · +' + fmt(rw.coins) + ' moedas</b> se venceres (menos se perderes).' : 'Já te deu recompensa: volta em <span data-cd="' + Sh.sparReadyAt(st, b.id) + '">' + cdText(Sh.sparReadyAt(st, b.id)) + '</span> para ganhar mais. Podes treinar na mesma, sem recompensa.') + '</div>' +
          '<button class="btn block" style="margin-top:8px" data-a="sh-spar" data-id="' + b.id + '">Desafiar ' + esc(Sh.name(st, b.id)) + '</button></div>';
      })();
  }
  function shadowCard(st, b, act) {
    var on = st.shadows.active.indexOf(b.id) >= 0;
    return '<button class="sh-card' + (on ? ' on' : '') + (b.king ? ' king' : '') + '" data-a="sh-open" data-id="' + b.id + '">' + shadowArt(b) +
      '<span class="sh-lv mono">' + b.level + '</span>' + (b.king ? '<span class="sh-crown">' + uiIcon('ui_king', '♛', 'crown-img') + '</span>' : '') +
      '<span class="sh-info"><span class="sh-name">' + esc(Sh.name(st, b.id)) + '</span><span class="sh-sub">' + S.SHADOW_ROLES[Sh.role(b)].name + (on ? ' · convocado' : '') + '</span></span></button>';
  }
  function servantsPage(st) {
    var h = backBtn('Servos');
    Sh.expire(st);
    var owned = Sh.owned(st), active = Sh.active(st), pend = Sh.pendingList(st), slots = Sh.slots(st), extra = Sh.extraSlots(st);
    var total = S.BOSSES.length + (S.ARENA_GUARDIANS || []).length + (S.ARENA_BOSSES || []).length;
    var sealed = Object.keys(st.shadows.sealed).map(function (id) { return S.BOSS_BY_ID[id]; }).filter(Boolean).sort(function (a, c) { return a.level - c.level; });
    h += '<section class="win sh-win"><div class="win-h">Exército das Sombras <small>' + owned.length + '/' + total + '</small></div>' +
      '<p class="small muted" style="margin:0">Quando derrotas um chefe, a sua sombra fica para trás. Tens 3 tentativas para a extrair e torná-la tua serva. Os servos convocados lutam ao teu lado em todos os combates.</p>' +
      '<p class="small muted" style="margin:6px 0 0">Se as tentativas falharem (ou a sombra de um portão desvanecer ao fim de 24 h), fica selada e podes obtê-la com Cristais. Nas arenas premium a sombra nunca desvanece.</p>' +
      '<div class="sh-prices"><div><b>Portões</b><span>Normal ' + S.SHADOW_RULES.prices.gate.normal + '</span><span>Comandante ' + S.SHADOW_RULES.prices.gate.commander + '</span><span>Chefe final ' + S.SHADOW_RULES.prices.gate.final + '</span></div>' +
      '<div><b>Arenas</b><span>Normal ' + S.SHADOW_RULES.prices.arena.normal + '</span><span>Comandante ' + S.SHADOW_RULES.prices.arena.commander + '</span><span>Chefe final ' + S.SHADOW_RULES.prices.arena.final + '</span></div></div>' +
      '<div class="kv" style="margin-top:10px"><div><span class="muted">Convocados</span><b>' + active.length + '/' + slots + '</b></div>' +
      '<div><span class="muted">Lugares extra</span><b>' + extra + '/' + S.SHADOW_RULES.maxExtraSlots + '</b></div>' +
      '<div><span class="muted">À espera</span><b>' + pend.length + '</b></div><div><span class="muted">Seladas</span><b>' + sealed.length + '</b></div></div>' +
      (extra < S.SHADOW_RULES.maxExtraSlots ? '<button class="btn sm prem block" style="margin-top:10px" data-a="prem-open" data-t="loja"><i class="crys-ico"></i> Mais lugares: Insígnia do General das Sombras</button>' : '') +
      (st.cls === 'invocador' ? '<p class="hint" style="margin:8px 0 0">Invocador: +1 lugar, servos 25% mais fortes e +12% na extração.</p>' : '') + '</section>';
    if (pend.length) {
      h += '<section class="win sh-win"><div class="win-h">Sombras por extrair <small>' + pend.length + '</small></div><div class="stack" style="gap:8px">' + pend.map(function (p) {
        return '<div class="card sh-pend"><div class="card-h">' + preShadowArt(p.def, 'sm dead') + '<div class="grow"><div class="card-t">' + esc(p.def.name) + '</div>' +
          '<div class="meta">' + triesDots(p.tries) + '<span>' + Math.round(Sh.chance(st, p.def) * 100) + '%</span><span>' + (p.exp ? 'desvanece em <span data-cd="' + p.exp + '">' + cdText(p.exp) + '</span>' : 'adormecida') + '</span></div></div>' +
          '<button class="btn sm arise-btn" data-a="arise-open" data-id="' + p.id + '">Extrair</button></div></div>';
      }).join('') + '</div></section>';
    }
    if (sealed.length) {
      h += '<section class="win sh-win"><div class="win-h">Sombras seladas <small>' + sealed.length + '</small></div><div class="stack" style="gap:8px">' + sealed.map(function (b) {
        var g = S.GATES[b.gate - 1];
        return '<div class="card sh-pend"><div class="card-h">' + preShadowArt(b, 'sm dead') + '<div class="grow"><div class="card-t">' + esc(b.name) + '</div>' +
          '<div class="meta"><span>' + esc(b.premium ? b.arenaName : (g ? g.name : '')) + '</span><span>' + Sh.RANK_NAME[Sh.rank(b)] + '</span></div></div>' +
          '<button class="btn sm prem" data-a="arise-open" data-id="' + b.id + '"><i class="crys-ico"></i> ' + Sh.buyPrice(b) + '</button></div></div>';
      }).join('') + '</div></section>';
    }
    if (active.length) h += '<section class="win sh-win"><div class="win-h">Convocados <small>lutam contigo</small></div><div class="sh-grid">' + active.map(function (b) { return shadowCard(st, b); }).join('') + '</div></section>';
    var ownG = owned.filter(function (b) { return !b.premium; }), ownA = owned.filter(function (b) { return b.premium; });
    h += '<section class="win sh-win"><div class="win-h">Exército dos Portões <small>' + ownG.length + '/' + S.BOSSES.length + '</small></div>' +
      (ownG.length ? '<div class="sh-grid">' + ownG.map(function (b) { return shadowCard(st, b); }).join('') + '</div>'
        : '<div class="empty">Ainda não tens servos dos portões. Derrota um chefe e extrai a sua sombra.</div>') + '</section>';
    if (ownA.length) h += '<section class="win sh-win"><div class="win-h">Exército das Arenas <small>' + ownA.length + '/' + ((S.ARENA_GUARDIANS || []).length + (S.ARENA_BOSSES || []).length) + '</small></div>' +
      '<div class="sh-grid">' + ownA.map(function (b) { return shadowCard(st, b); }).join('') + '</div></section>';
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
    if (S.SECRET_BOSSES.some(function (b) { return st.trophies[b.id] || S.combat.bossUnlocked(st, b); })) gates.push({ id: 0, ico: uiIcon('gate_0', '👁️'), name: 'A Última Arena', color: '#f4f8ff', bosses: S.SECRET_BOSSES });
    if (S.ARENA_BOSSES.some(function (b) { return st.trophies[b.id] || (st.arena && st.arena.unlocked[b.id]); })) {
      h += '<section class="win prem-win"><div class="win-h"><span class="prem-t"><i class="crys-ico"></i> Coliseu dos Condenados</span><small>' + S.ARENA_BOSSES.filter(function (b) { return st.trophies[b.id]; }).length + '/10</small></div><div class="trophy-grid">' +
        S.ARENA_BOSSES.map(function (b) {
          var tr = S.TROPHIES[b.id], art = trophyArt(b) || (S.BOSS_ART && S.BOSS_ART[b.id]);
          if (!st.trophies[b.id]) return '<div class="trophy locked"><span class="tr-seal"></span><span class="tr-lock">' + uiIcon('ic_lock', '🔒', 'lock-img') + '</span></div>';
          return '<button class="trophy got' + (trophyArt(b) ? ' t-art' : '') + '" style="--rc:' + rc(tr.rarity) + '" title="' + esc(tr.name) + '" data-a="info" data-k="trophy" data-id="' + b.id + '">' + (art ? '<img src="' + art + '" alt="" loading="lazy">' : '<span class="tr-ico">' + b.icon + '</span>') + '<span class="tr-name">' + esc(tr.name) + '</span></button>';
        }).join('') + '</div></section>';
      S.ARENA_BOSSES.forEach(function (c) {
        if (!(st.arena && st.arena.unlocked[c.id])) return;
        var gs = S.ARENA_LADDER[c.arena].filter(function (b) { return b.guardian; }), have = gs.filter(function (b) { return st.trophies[b.id]; }).length;
        h += '<section class="win prem-win"><div class="win-h"><span style="color:' + c.color + '">' + esc(c.arenaName) + '</span><small>sub-chefes ' + have + '/9</small></div><div class="trophy-grid">' +
          gs.map(function (b) {
            var tr = S.TROPHIES[b.id], tart = trophyArt(b), art = tart || (S.BOSS_ART && S.BOSS_ART[b.id]);
            if (!st.trophies[b.id]) return '<div class="trophy locked"><span class="tr-seal"></span><span class="tr-lock">' + uiIcon('ic_lock', '🔒', 'lock-img') + '</span></div>';
            return '<button class="trophy got' + (tart ? ' t-art' : '') + '" style="--rc:' + rc(tr.rarity) + '" title="' + esc(tr.name) + '" data-a="info" data-k="trophy" data-id="' + b.id + '">' + (art ? '<img src="' + art + '" alt="" loading="lazy">' : '<span class="tr-ico">' + b.icon + '</span>') + '<span class="tr-name">' + esc(tr.name) + '</span></button>';
          }).join('') + '</div></section>';
      });
    }
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
      '<div class="small muted">Aparência do avatar</div><div class="gender-pick" style="margin-bottom:12px">' + [['m', 'Masculina', '♂'], ['f', 'Feminina', '♀']].map(function (g) {
        return '<button class="gender-opt' + ((st.gender === 'f' ? 'f' : 'm') === g[0] ? ' on' : '') + '" data-a="set-gender" data-v="' + g[0] + '"><span class="g-ico">' + g[2] + '</span>' + g[1] + '</button>'; }).join('') + '</div>' +
      (Notify.available()
        ? '<label class="row between" style="margin-bottom:6px"><span>Lembretes do Sistema<br><small class="muted">Avisos no telemóvel antes dos prazos, emergências e Zona de Penalidade</small></span><input type="checkbox" id="set-rem" data-a="set-rem"' + (st.settings.reminders !== false ? ' checked' : '') + '></label>' +
          '<div id="notif-status" class="notif-status small muted">A verificar autorizações…</div>' +
          '<button class="btn sm ghost block" data-a="notif-test" style="margin:6px 0 12px">Testar lembrete (chega em 5 segundos)</button>'
        : '<p class="hint" style="margin:0 0 10px">Lembretes do Sistema no telemóvel: disponíveis na app Android (APK).</p>') +
      '<label class="row between" style="margin-bottom:6px"><span>Sons do Sistema</span><input type="checkbox" id="set-snd" data-a="set-snd"' + (st.settings.sound !== false ? ' checked' : '') + '></label>' +
      (st.settings.sound !== false ? '<label class="row between" style="margin-bottom:10px;gap:12px"><span class="small muted">Volume</span><input type="range" min="0" max="100" step="5" style="flex:1;max-width:200px" data-a="set-vol" value="' + Math.round((st.settings.soundVol == null ? .8 : st.settings.soundVol) * 100) + '"></label>' : '') +
      (st.settings.sound !== false ? '<label class="row between" style="margin-bottom:6px"><span>Música dos chefes<br><small class="muted">Trilha em loop nas batalhas contra os reis e os Campeões; pré-escuta ao abrir a ficha</small></span><input type="checkbox" id="set-mus" data-a="set-mus"' + (st.settings.music !== false ? ' checked' : '') + '></label>' +
        (st.settings.music !== false ? '<label class="row between" style="margin-bottom:10px;gap:12px"><span class="small muted">Volume da música</span><input type="range" min="0" max="100" step="5" style="flex:1;max-width:200px" data-a="set-mvol" value="' + Math.round((st.settings.musicVol == null ? .55 : st.settings.musicVol) * 100) + '"></label>' : '') : '') +
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
  /* ---------- corpo: peso e calorias ---------- */
  function kcal(n) { return fmt(Math.round(n)) + ' kcal'; }
  function kgTxt(n) { return String(Math.round(n * 10) / 10).replace('.', ',') + ' kg'; }
  function bodyHtml(st) {
    var B = S.body, b = B.ensure(st), c = B.calc(st), editing = ui.bodyEdit || !c;
    var GOALS = [['perder', 'Perder peso'], ['manter', 'Manter'], ['ganhar', 'Ganhar peso']];
    var h = '<section class="win body-win" id="body-win"><div class="win-h">Corpo e peso <small>' + (c ? kgTxt(c.kg) : 'sem registo') + '</small></div>';
    if (editing) {
      h += '<p class="small muted" style="margin:0 0 8px">' + (c ? 'Corrige o que mudou e guarda.' : 'Escreve o teu peso e, se quiseres, os outros dados para um cálculo mais certo. Depois carrega em Guardar.') + '</p>' +
        '<div class="stack" style="gap:8px">' +
        '<label class="f" style="margin:0"><span class="small muted">Peso de hoje (kg)</span><input class="in" id="body-kg" inputmode="decimal" placeholder="ex.: 72,5" value="' + (c ? String(c.kg).replace('.', ',') : '') + '"></label>' +
        '<div class="row" style="gap:8px"><label class="f grow" style="margin:0"><span class="small muted">Altura (cm)</span><input class="in" id="body-h" inputmode="numeric" placeholder="ex.: 175" value="' + (b.height || '') + '"></label>' +
        '<label class="f grow" style="margin:0"><span class="small muted">Idade</span><input class="in" id="body-a" inputmode="numeric" placeholder="ex.: 28" value="' + (b.age || '') + '"></label></div>' +
        '<label class="f" style="margin:0"><span class="small muted">Sexo</span><select class="in" id="body-s"><option value="">—</option><option value="m"' + (b.sex === 'm' ? ' selected' : '') + '>Masculino</option><option value="f"' + (b.sex === 'f' ? ' selected' : '') + '>Feminino</option></select></label>' +
        '<label class="f" style="margin:0"><span class="small muted">Atividade física</span><select class="in" id="body-act">' + Object.keys(B.ACT).map(function (k) { return '<option value="' + k + '"' + (b.activity === k ? ' selected' : '') + '>' + B.ACT[k].name + ': ' + B.ACT[k].desc + '</option>'; }).join('') + '</select></label>' +
        '<label class="f" style="margin:0"><span class="small muted">Objetivo</span><select class="in" id="body-goal">' + GOALS.map(function (g) { return '<option value="' + g[0] + '"' + ((b.goal || 'manter') === g[0] ? ' selected' : '') + '>' + g[1] + '</option>'; }).join('') + '</select></label>' +
        '<div class="row" style="gap:8px">' + (c ? '<button class="btn ghost grow" data-a="body-cancel">Cancelar</button>' : '') + '<button class="btn pri grow" data-a="body-save">Guardar</button></div></div>';
      return h + '</section>';
    }
    // resumo guardado
    h += '<div class="kv"><div><span class="muted">Peso</span><b>' + kgTxt(c.kg) + '</b></div>' +
      (b.height ? '<div><span class="muted">Altura</span><b>' + b.height + ' cm</b></div>' : '') +
      (b.age ? '<div><span class="muted">Idade</span><b>' + b.age + '</b></div>' : '') +
      '<div><span class="muted">Objetivo</span><b>' + ({ perder: 'Perder peso', ganhar: 'Ganhar peso', manter: 'Manter' }[b.goal || 'manter']) + '</b></div>' +
      '<div><span class="muted">Manutenção</span><b>' + kcal(c.tdee) + '/dia</b></div>' +
      (c.bmi ? '<div><span class="muted">IMC</span><b>' + String(c.bmi).replace('.', ',') + ' · ' + B.bmiLabel(c.bmi) + '</b></div>' : '') + '</div>';
    var g = b.goal || 'manter';
    h += '<div class="body-goals">' +
      '<div class="body-goal up' + (g === 'ganhar' ? ' sel' : '') + '"><div class="bg-h">Ganhar 1 kg</div><div class="bg-v">' + kcal(c.gain.perDay) + '<small>/dia</small></div>' +
      '<div class="small muted">+' + c.gain.extra + ' kcal acima da manutenção durante cerca de <b>' + c.gain.days + ' dias</b> (' + fmt(c.kcalPerKg) + ' kcal a mais no total).</div></div>' +
      '<div class="body-goal down' + (g === 'perder' ? ' sel' : '') + '"><div class="bg-h">Perder 1 kg</div><div class="bg-v">' + kcal(c.lose.perDay) + '<small>/dia</small></div>' +
      '<div class="small muted">−' + c.lose.less + ' kcal abaixo da manutenção durante cerca de <b>' + c.lose.days + ' dias</b> (' + fmt(c.kcalPerKg) + ' kcal a menos no total).' + (c.lose.floored ? ' O Sistema não desce abaixo deste mínimo diário.' : '') + '</div></div></div>';
    h += '<p class="hint" style="margin:8px 0 0">' + (c.full ? 'Calculado com o teu peso, altura, idade, sexo e atividade.' : 'Estimativa só com o peso. Junta altura, idade e sexo para um valor mais certo.') +
      ' Ritmo de cerca de 0,5 kg por semana. São estimativas: um nutricionista ou médico dá-te valores exatos.</p>';
    var wk = B.weekly(st);
    if (wk) {
      h += '<div class="body-week"><div class="bg-h">Avaliação semanal</div><div class="row between"><span class="small muted">' + wk.from.d.split('-').reverse().slice(0, 2).join('/') + ' → ' + wk.to.d.split('-').reverse().slice(0, 2).join('/') + ' (' + wk.days + ' dias)</span>' +
        '<b class="mono" style="color:' + (wk.diff > 0 ? 'var(--gold)' : wk.diff < 0 ? 'var(--glow)' : 'inherit') + '">' + (wk.diff > 0 ? '+' : '') + kgTxt(wk.diff) + '</b></div>' +
        '<div class="small">≈ ' + (wk.perWeek > 0 ? '+' : '') + String(wk.perWeek).replace('.', ',') + ' kg por semana · ' + esc(wk.verdict) + '</div></div>';
    }
    h += '<div class="row" style="gap:8px;margin-top:10px"><button class="btn grow" data-a="body-edit">Atualizar peso e dados</button></div>';
    h += '<details style="margin-top:10px"' + (ui.bodyHist ? ' open' : '') + '><summary class="small muted" data-a="body-hist">Registos de peso (' + b.weights.length + ')</summary><div class="list" style="margin-top:6px">' +
      b.weights.slice(-20).reverse().map(function (w) {
        if (ui.bodyFix === w.d) return '<div class="row small body-row"><span class="mono faint">' + w.d.split('-').reverse().join('/') + '</span><input class="in grow" id="body-fix-in" inputmode="decimal" style="padding:6px 8px" value="' + String(w.kg).replace('.', ',') + '">' +
          '<button class="btn sm pri" data-a="body-fix-ok" data-d="' + w.d + '">Guardar</button><button class="btn sm ghost" data-a="body-fix-no">✕</button></div>';
        return '<div class="row between small body-row"><span class="mono faint">' + w.d.split('-').reverse().join('/') + '</span><b class="mono grow" style="text-align:right;margin-right:8px">' + kgTxt(w.kg) + '</b>' +
          '<button class="btn sm ghost" data-a="body-fix" data-d="' + w.d + '">Corrigir</button><button class="btn sm ghost" data-a="body-del" data-d="' + w.d + '" aria-label="Apagar">✕</button></div>';
      }).join('') + '</div></details>';
    return h + '</section>';
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
    h += bodyHtml(st);
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
  /* Combate → Arenas: igual aos portões gratuitos (10 combates por arena: 9 sub-chefes + o Campeão) */
  function finalArenaHtml(st) {
    var list = S.SECRET_BOSSES, art = S.ARENA_ART && S.ARENA_ART.final;
    var killed = list.filter(function (b) { return st.defeated[b.id]; }).length;
    var h = '<section class="win fin-win"><div class="win-h"><span class="fin-t">' + uiIcon('gate_0', '', 'gate-head') + 'A Última Arena</span><small>' + killed + '/' + list.length + ' derrotados</small></div>' +
      (art ? '<div class="arena-banner" style="--av-art:url(\'' + art + '\')"></div>' : '') +
      '<p class="hint" style="margin-top:0">' + (killed === 2 ? 'Não há portão depois deste. O caminho que sobra é o teu.' : 'Primeiro, o Sistema na sua forma suprema. Depois, quem o criou. Três fases cada um.') + '</p>' +
      '<div class="boss-grid">' + list.map(function (b) {
        var dead = st.defeated[b.id], open = C.bossUnlocked(st, b), dg = C.danger(st, b), art2 = S.BOSS_ART && S.BOSS_ART[b.id];
        return '<button class="boss-tile card king fin-tile' + (dead ? ' done' : '') + (open ? '' : ' locked') + '"' + (open || dead ? ' data-a="boss" data-id="' + b.id + '"' : ' disabled') + ' style="--dg:' + (dead ? 'var(--good)' : open ? dg.color : 'var(--muted)') + '">' +
          (art2 ? '<img src="' + art2 + '" alt="" loading="lazy">' : '<span class="bt-ico">' + b.icon + '</span>') +
          '<span class="bt-tl"><span class="bt-lv mono">' + b.level + '</span></span><span class="bt-crown">' + uiIcon('ui_king', '♛', 'crown-img') + '</span>' +
          (open || dead ? '' : '<span class="bt-lock">' + uiIcon('ic_lock', '🔒', 'bt-lock-img') + '</span>') +
          '<span class="bt-info"><span class="bt-name">' + esc(b.name.split(',')[0]) + '</span><span class="bt-dg">' + (dead ? 'Derrotado' : open ? dg.label : 'Vence o Sistema primeiro') + '</span></span></button>';
      }).join('') + '</div>' +
      '<button class="btn ghost block" style="margin-top:12px" data-a="finale-replay">' + uiIcon('ui_eye', '👁️', 'btn-ico') + ' Rever a conversa final</button></section>';
    return h;
  }
  function arenaCombatHtml(st) {
    S.premium.ensure(st);
    var n = ui.arenaN || (function () { for (var i = 1; i <= 10; i++) if (st.arena.unlocked['ar' + i] && S.premium.arenaProgress(st, i).won < 10) return i; return 1; })();
    ui.arenaN = n;
    var champ = S.BOSS_BY_ID['ar' + n], pg = S.premium.arenaProgress(st, n), lad = S.ARENA_LADDER[n];
    var h = '<div class="chips arena-chips">' + S.ARENA_BOSSES.map(function (b) {
      var p = S.premium.arenaProgress(st, b.arena);
      return '<button class="chip' + (n === b.arena ? ' on' : '') + (p.unlocked ? '' : ' sealed') + '" data-a="arena-view" data-n="' + b.arena + '" style="--ac:' + b.color + '">' +
        (p.unlocked ? '' : uiIcon('ic_lock', '🔒', 'tag-ico') + ' ') + ROMAN[b.arena - 1] + (p.won === 10 ? ' ✓' : '') + '</button>';
    }).join('') + '</div>';
    var art = S.ARENA_ART && S.ARENA_ART[champ.id];
    h += '<section class="win prem-win arena-sec" style="--ac:' + champ.color + '"><div class="win-h"><span style="color:' + champ.color + '">Arena ' + ROMAN[n - 1] + ': ' + esc(champ.arenaName.replace(/^Arena (d[oa]s?|Abissal) /, function (m) { return m; })) + '</span><small>' + pg.won + '/10 vencidos</small></div>' +
      (art ? '<div class="arena-banner" style="--av-art:url(\'' + art + '\')"></div>' : '') +
      '<p class="hint" style="margin-top:0">' + (pg.unlocked ? '9 sub-chefes por ordem e, no fim, o Campeão. Os já vencidos podem ser revisitados, sem recompensas.' : 'Arena selada. Abre-a uma vez com Cristais e fica aberta para sempre: 9 sub-chefes (Nv ' + lad[0].level + ' a ' + (champ.level - 1) + ') e o Campeão (Nv ' + champ.level + ').') + '</p>';
    if (!pg.unlocked) h += '<button class="btn prem block" style="margin-bottom:12px" data-a="arena-unlock" data-id="' + champ.id + '"><i class="crys-ico"></i> Desbloquear a arena por ' + champ.cost + ' Cristais</button>';
    h += '<div class="boss-grid">' + lad.map(function (b) {
      var ps = S.premium.status(st, b), dg = C.danger(st, b), bart = S.BOSS_ART && S.BOSS_ART[b.id];
      var hide = !b.champion && (!pg.unlocked || (!ps.wins && !ps.open && b.slot > pg.won + 2));
      var locked = !pg.unlocked || (!ps.open && !ps.wins);
      var label = ps.wins ? (ps.readyAt ? cdText(ps.readyAt) : 'Revisitar') : locked ? 'Selado' : dg.label;
      return '<button class="boss-tile card' + (ps.wins ? ' done' : '') + (b.champion || b.lieutenant ? ' king' : '') + (locked ? ' locked' : '') + '"' + (hide ? ' disabled' : ' data-a="boss" data-id="' + b.id + '"') +
        ' style="--dg:' + (ps.wins ? 'var(--good)' : locked ? 'var(--muted)' : dg.color) + '">' +
        (hide ? '<span class="bt-ico">' + uiIcon('ui_unknown', '❔', 'bt-unk') + '</span>' : bart ? '<img src="' + bart + '" alt="" loading="lazy">' : '<span class="bt-ico">' + b.icon + '</span>') +
        '<span class="bt-tl"><span class="bt-lv mono">' + b.level + '</span>' + rankBadge(b, 'bt-rk') + '</span>' + (b.champion ? '<span class="bt-crown">' + uiIcon('ui_king', '♛', 'crown-img') + '</span>' : '') +
        (locked && !ps.wins ? '<span class="bt-lock">' + uiIcon('ic_lock', '🔒', 'bt-lock-img') + '</span>' : '') +
        '<span class="bt-info"><span class="bt-name">' + (hide ? '???' : esc(b.name.split(',')[0])) + '</span><span class="bt-dg">' + label + '</span></span></button>';
    }).join('') + '</div></section>';
    return h;
  }
  function combatHtml(st) {
    if (st.battle) return battleHtml(st);
    var hpHtml = hpPanel(st);
    var gates = S.GATES.slice();
    var secretOn = S.SECRET_BOSSES.some(function (b) { return C.bossUnlocked(st, b); });
    var h = hpHtml + '<div class="chips" style="margin-top:14px">' + gates.map(function (g) {
      var k = S.BOSSES.filter(function (b) { return b.gate === g.id && st.defeated[b.id]; }).length;
      return '<button class="chip' + (ui.gate === g.id ? ' on' : '') + '" data-a="gate" data-g="' + g.id + '">' + uiIcon('gate_' + g.id, g.icon) + ' ' + g.id + (k === 10 ? ' ✓' : '') + '</button>';
    }).join('') + (secretOn ? '<button class="chip fin-chip' + (ui.gate === 0 ? ' on' : '') + '" data-a="gate" data-g="0">' + uiIcon('gate_0', '👁️') + ' Última</button>' : '') +
      '<button class="chip prem-chip' + (ui.gate === 'arena' ? ' on' : '') + '" data-a="gate" data-g="arena"><i class="crys-ico"></i> Arenas</button></div>';
    if (ui.gate === 'arena') return h + arenaCombatHtml(st);
    var list, gname, gcolor;
    if (ui.gate === 0 && !secretOn) ui.gate = 1;
    if (ui.gate === 0) return h + finalArenaHtml(st);
    else { var g = S.GATES[ui.gate - 1]; list = S.BOSSES.filter(function (b) { return b.gate === g.id; }); gname = g.name; gcolor = g.color; }
    var killed = list.filter(function (b) { return st.defeated[b.id]; }).length;
    h += '<section class="win"><div class="win-h"><span style="color:' + gcolor + '">' + uiIcon('gate_' + ui.gate, '', 'gate-head') + esc(gname) + '</span><small>' + killed + '/' + list.length + ' derrotados</small></div>' +
      '<p class="hint" style="margin-top:0">Todos os chefes estão disponíveis. Cada um tem o seu nível: lutar acima do teu nível é muito mais perigoso. Os chefes derrotados não voltam.</p>' +
      '<div class="boss-grid">' + list.map(function (b) {
        var dead = st.defeated[b.id];
        var dg = C.danger(st, b);
        var art = S.BOSS_ART && S.BOSS_ART[b.id];
        return '<button class="boss-tile card' + (dead ? ' done' : '') + (S.shadows.rank(b) !== 'normal' ? ' king' : '') + '" data-a="boss" data-id="' + b.id + '" style="--dg:' + (dead ? 'var(--good)' : dg.color) + '">' +
          (art ? '<img src="' + art + '" alt="" loading="lazy">' : '<span class="bt-ico">' + b.icon + '</span>') +
          '<span class="bt-tl"><span class="bt-lv mono">' + b.level + '</span>' + rankBadge(b, 'bt-rk') + '</span>' + (b.king ? '<span class="bt-crown">' + uiIcon('ui_king', '♛', 'crown-img') + '</span>' : '') +
          '<span class="bt-info"><span class="bt-name">' + esc(b.name) + '</span><span class="bt-dg">' + (dead ? 'Derrotado' : dg.label) + '</span></span></button>';
      }).join('') + '</div></section>';
    return h;
  }
  function bossArt(b, cls, id, phase) {
    // na segunda fase (e seguintes), os reis e os Campeões mostram a forma final, se a imagem existir
    var src = S.BOSS_ART && ((phase >= 2 && S.BOSS_ART[b.id + '_f2']) || S.BOSS_ART[b.id]);
    var ida = id ? ' id="' + id + '"' : '';
    if (!src) return '<div class="' + cls + '"' + ida + '>' + b.icon + '</div>';
    return '<div class="' + cls + ' has-art"' + ida + '><img src="' + src + '" alt="' + esc(b.name) + '" loading="lazy" onerror="this.parentNode.classList.remove(\'has-art\');this.replaceWith(document.createTextNode(\'' + b.icon + '\'))"></div>';
  }
  function bossModal(id) {
    var st = E.state, b = S.BOSS_BY_ID[id];
    var bs = C.bossStats(st, b), r = C.rewards(st, b), dg = C.danger(st, b), dead = st.defeated[b.id];
    var pr = C.pressure(b.level - st.level);
    var drops = ['+1 ' + S.ITEMS['bau_' + r.chest].name];
    if (b.premium && !r.first) drops.push('15% de hipótese de uma relíquia de combate premium');
    if (r.special) (r.special.items || []).forEach(function (x) { drops.push('+1 ' + (st.seen[x] || !S.ITEMS[x].secret ? S.ITEMS[x].name : 'Item secreto')); });
    if (r.special && r.special.skill) drops.push('Habilidade secreta');
    return '<div class="sheet-h"><h2>' + esc(b.name) + '</h2><button class="btn sm ghost" data-a="close">Fechar</button></div>' +
      (S.BOSS_ART && S.BOSS_ART[b.id] ? '<div class="boss-hero">' + bossArt(b, 'boss-hero-img') + '</div>' : '') +
      '<div class="row" style="align-items:flex-start">' + (S.BOSS_ART && S.BOSS_ART[b.id] ? '' : '<div class="ico big">' + b.icon + '</div>') + '<div class="grow"><div class="meta"><span class="mono">Nível ' + b.level + '</span><span>' + S.ARCHETYPES[b.arch].name + '</span>' +
      rankBadge(b) + (b.champion ? '<span class="tag prem-tag">Campeão da Arena: 3 fases</span>' : b.lieutenant ? '<span class="tag prem-tag">2 fases</span>' : b.guardian ? '<span class="tag prem-tag">Guardião ' + b.slot + ' de 9</span>' : (b.form2 ? '<span class="tag" style="color:#f4f8ff">2 formas, cada uma com a sua vida</span>' + (st.forms && st.forms[b.id] && !dead ? '<span class="tag" style="color:var(--good)">1.ª forma vencida: começas em ' + esc(b.form2.name.split(',')[0] === b.name.split(',')[0] ? b.form2.name.split(', ')[1] || b.form2.name : b.form2.name) + '</span>' : '') : b.king ? '<span class="tag" style="color:var(--gold)">Rei do portão: 2 fases</span>' : '')) + '</div>' +
      (b.lore ? '<p class="small muted" style="font-style:italic;margin:6px 0 0">«' + esc(b.lore) + '»</p>' : '') + '</div></div>' +
      '<div class="chronicle"><div class="info-h">Crónica</div>' + loreHtml(S.lore.bossText(b), 'boss-lore') +
      (S.lore.gateText(b) ? '<details class="gate-lore"><summary>' + (b.premium ? 'Sobre o Coliseu dos Condenados' : b.gate ? 'Sobre o portão: ' + esc((S.GATES[b.gate - 1] || {}).name || '') : 'Sobre os portões ocultos') + '</summary>' + loreHtml(S.lore.gateText(b)) + '</details>' : '') + '</div>' +
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
      (b.premium ? arenaFoot(st, b) :
      '<p class="hint">Se morreres, desces um nível e o Sistema reanima-te com ' + C.REVIVE_PCT + '% da vida. A vida só recupera com poções ou à meia-noite, quando o Sistema restaura vida e mana. Fuga: perdes 5% das moedas (sem perdas com Pó de Fumo).</p>' +
      (dead ? '<div class="empty">Derrotado em ' + timeStr(dead) + '. Não volta.</div>' : '<button class="btn pri block" data-a="fight" data-id="' + b.id + '">Entrar no portão</button>'));
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
    if (bt.spar) {
      var sl = (S.SHADOW_SPAR || {})[b.id]; if (!sl) return '';
      var stx = bt.over === 'win' ? sl[1] : bt.over === 'lose' ? sl[2] : (bt.turn <= 2 ? sl[0] : null);
      if (!stx) return '';
      var sk = bt.bossId + ':spar:' + (bt.over || 'in'), sf = ui.lastSpeech !== sk; ui.lastSpeech = sk;
      return '<div class="speech sh-speech' + (sf ? ' fresh' : '') + '"><span class="speech-name">' + esc(S.shadows.name(E.state, b.id)) + '</span><span class="speech-txt">«' + esc(stx.replace(/\{nome\}/g, E.state.name)) + '»</span></div>';
    }
    var lines = (S.BOSS_LINES || {})[b.id];
    if (!lines) return '';
    var txt = null, cls = '';
    if (bt.over === 'win') { txt = lines[1]; cls = ' last'; }
    else if (!bt.over && bt.turn <= 2) txt = b.form2 && bt.phase >= 2 ? b.form2.say : lines[0];
    if (!txt) return '';
    var key = bt.bossId + (bt.over === 'win' ? ':last' : ':intro');
    var fresh = ui.lastSpeech !== key;
    ui.lastSpeech = key;
    return '<div class="speech' + cls + (fresh ? ' fresh' : '') + '"><span class="speech-name">' + esc(b.form2 && bt.phase >= 2 ? b.form2.name : b.name) + '</span><span class="speech-txt">«' + esc(txt) + '»</span></div>';
  }
  function battleHtml(st) {
    var bt = st.battle, b = S.BOSS_BY_ID[bt.bossId], p = bt.p;
    var bossCls = ui.spawn ? ' spawn' : (bt.over === 'win' && !ui.victoryAnim ? ' dead' : '');
    var auraC = b.king ? 'rgba(255,176,46,.55)' : 'rgba(255,60,90,.5)';
    var h = '<div class="battle">';
    if (bt.spar) auraC = 'rgba(123,77,255,.6)';
    var shSrc = bt.spar && S.SHADOW_ART && S.SHADOW_ART[b.id];
    h += '<section class="win danger boss-panel phase-' + bt.phase + (bt.spar ? ' spar-panel' : '') + '"><div class="win-h"><span>' + esc(bt.spar ? S.shadows.name(st, b.id) : (b.form2 && bt.phase >= 2 ? b.form2.name : b.name)) + (bt.spar ? '' : ' ' + rankBadge(b, 'rk-sm')) + '</span><small>' + (bt.spar ? 'Treino · ' : '') + 'Nv ' + b.level + ' · turno ' + bt.turn + (bt.phase > 1 ? ' · fase ' + bt.phase : '') + '</small></div>' +
      '<div class="boss-wrap"><div class="boss-aura" style="--c:' + auraC + '"></div>' + (bt.spar ? (shSrc ? '<div class="boss-ico' + bossCls + ' has-art sh-boss" id="boss-ico"><img src="' + shSrc + '" alt=""></div>' : '<div class="boss-ico' + bossCls + ' has-art sh-boss shade-boss" id="boss-ico">' + (S.BOSS_ART && S.BOSS_ART[b.id] ? '<img src="' + S.BOSS_ART[b.id] + '" alt="">' : b.icon) + '</div>') : bossArt(b, 'boss-ico' + bossCls, 'boss-ico', bt.phase)) + '</div>' + bossSpeech(bt, b) +
      '<div style="margin-top:8px">' + bar('boss', bt.b.hp, bt.b.maxHp, 'Vida' + (bt.b.shield ? ' · escudo ' + fmt(bt.b.shield) : ''), 'boss-' + bt.bossId + '-' + bt.started) + '</div>' +
      '<div class="statuses" style="margin-top:6px">' + statusTags(bt.b.st, true) + (bt.b.stunned ? '<span class="tag good">atordoado</span>' : '') + '</div></section>';
    h += '<div class="log" id="blog" aria-live="polite">' + bt.log.map(function (l) { return '<div class="' + l.c + '">' + logLine(l.t) + '</div>'; }).join('') + '</div>';
    h += '<section class="win ppanel" id="ppanel" style="margin-top:10px"><div class="win-h"><span>' + esc(st.name) + '</span><small>' + (bt.summons.length ? bt.summons.map(function (s) { return esc(s.name) + ' ' + s.turns + 't'; }).join(' · ') : 'sem invocações') + '</small></div>' +
      '<div class="stack" style="gap:6px">' + bar('hp', p.hp, p.maxHp, 'Vida' + (p.shield ? ' · escudo ' + fmt(p.shield) : ''), 'php-' + bt.started, true) + bar('mp', p.mp, p.maxMp, 'Mana', 'pmp-' + bt.started, true) + '</div>' +
      '<div class="statuses" style="margin-top:6px;justify-content:flex-start">' + statusTags(p.st, false) + (p.stunned ? '<span class="tag bad">atordoado</span>' : '') + '</div>';
    if (bt.over) {
      var r = bt.result || {};
      var title = bt.over === 'win' ? 'Vitória' : (bt.over === 'lose' ? 'Derrota' : 'Fuga');
      var bsay = !bt.spar && S.live && S.live.bossSay ? S.live.bossSay(st, b, bt.over, bt.started) : null;
      h += '<div class="card" style="margin-top:10px;text-align:center"><h3 style="color:' + (bt.over === 'win' ? 'var(--gold)' : 'var(--danger)') + '">' + title + '</h3>' +
        (bsay ? '<p class="boss-sys-say"><span class="sys-tag-mini">SISTEMA</span>' + esc(bsay) + '</p>' : '') +
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
          var cost = S.skillCost(s, st.cls, st.level), dis = cdv > 0 || p.mp < cost;
          return '<button class="skill-btn' + (S.SKILL_ART && S.SKILL_ART[s.id] ? ' has-ico' : '') + '" data-a="b-skill" data-id="' + s.id + '"' + (dis ? ' disabled' : '') + '>' + tapInfo(skillIco(s, 'sk-b'), 'skill', s.id) + '<b>' + esc(s.name) + '</b>' +
            '<span class="mono small" style="color:var(--glow)">' + (cdv > 0 ? 'recarga ' + cdv : cost + ' MP') + '</span><small>' + esc(s.desc) + '</small></button>';
        }).join('') + '</div>';
    }
    var items = Object.keys(st.inv).filter(function (id) { return S.ITEMS[id] && S.ITEMS[id].battle; });
    var used = bt.healsUsed || 0, lim = C.HEAL_LIMIT;
    return '<div class="sheet-h"><h2>Itens</h2><button class="btn sm ghost" data-a="close">Fechar</button></div>' +
      '<p class="hint" style="margin:-4px 0 10px">Poções de cura nesta batalha: <b class="mono">' + used + ' / ' + lim + '</b></p><div class="skill-grid">' +
      (items.length ? items.map(function (id) {
        var it = S.ITEMS[id];
        var heal = it.use.type === 'heal' || it.use.type === 'restore';
        var cool = it.perma && !S.premium.relicReady(st, id);
        var dis = (heal && used >= lim) || !S.time.itemActive(it) || cool;
        return '<button class="skill-btn" data-a="b-item" data-id="' + id + '"' + (dis ? ' disabled' : '') + '><b>' + tapInfo(itemTiny(it), 'item', id) + ' ' + esc(it.name) + '</b><span class="mono small">' + (it.perma ? (cool ? 'recarrega em ' + cdText(S.premium.relicReadyAt(st, id)) : 'pronta') : '×' + st.inv[id]) + '</span><small>' + esc(it.desc) + (it.phase && !S.time.itemActive(it) ? ' — inativo agora' : '') + '</small></button>';
      }).join('') : '<div class="empty">Sem itens de combate. Compra poções na Loja.</div>') + '</div>';
  }

  /* depois de comprar um artefato do Sistema: o Sistema comenta (sempre na primeira compra, depois às vezes) */
  function sysAfter(it) {
    var line = E.sysVoice(E.state, it.id, 'after');
    if (!line) return;
    E.emit(it.id === 'sys_pacto' ? { type: 'watch', level: 1, title: 'O SISTEMA REGISTOU', lines: [line] } : { type: 'watch', good: true, level: 1, title: 'O SISTEMA REGISTOU', lines: [line] });
  }
  /* ================= LOJA ================= */
  function shopHtml(st) {
    var h = '<div class="chips" style="margin-top:14px">' + S.SHOP_TABS.map(function (t) {
      return '<button class="chip' + (ui.shopTab === t.id ? ' on' : '') + '" data-a="shop-tab" data-v="' + t.id + '">' + uiIcon(t.id === 'sistema' && !hasArt('tab_sistema') ? 'ui_eye' : 'tab_' + t.id, t.icon) + ' ' + t.name + '</button>';
    }).join('') + '</div>';
    var list = E.shopList(st, ui.shopTab);
    var tab = S.SHOP_TABS.filter(function (t) { return t.id === ui.shopTab; })[0];
    h += '<section class="win"><div class="win-h">' + tab.name + coins(st.coins) + '</div>';
    if (ui.shopTab === 'sistema') { var sy = E.sysState(st), xs = [];
      if (sy.dbl) xs.push(sy.dbl + ' Selo(s) do Dobro à espera da próxima missão');
      if (sy.dblBoss) xs.push(sy.dblBoss + ' Bilhete(s) da Vitória Dupla à espera do próximo chefe');
      if (E.extraMissions(st)) xs.push('+' + E.extraMissions(st) + ' missões novas permitidas hoje');
      h += '<p class="hint" style="margin-top:0">' + uiIcon('ui_eye', '', 'tag-ico') + ' Artefatos que mexem com o próprio Sistema. Usam-se na Bolsa. O Sistema permite-os, mas regista cada um.</p>' + (xs.length ? '<p class="small" style="color:var(--good);margin-top:0">Ativo: ' + xs.map(esc).join(' · ') + '</p>' : ''); }
    if (ui.shopTab === 'atributo') h += '<p class="hint" style="margin-top:0">Melhorias permanentes. Os elixires ficam mais caros a cada compra.</p>';
    if (ui.shopTab === 'bau') {
      var cf = ui.chestFam || 'todos';
      h += '<p class="hint" style="margin-top:0">Os baús especializados só dão um tipo de item. Quanto melhor o grau (Ferro, Prata, Ouro, Dragão, Monarca), mais alto o nível e melhor a versão do que sai. Os graus Ouro, Dragão e Monarca também estão na Loja Exclusiva, em Cristais.</p>' +
        '<div class="chips" style="margin-bottom:10px">' + [['todos', 'Todos', 'bau_lendario'], ['gerais', 'Gerais', 'bau_comum']].concat(S.CHEST_FAMS.map(function (f) { return [f.id, f.name, 'bau_' + f.id + '_3']; })).map(function (x) {
          var src = artId(x[2]);
          return '<button class="chip' + (cf === x[0] ? ' on' : '') + '" data-a="chest-fam" data-v="' + x[0] + '">' + (src ? '<img class="chip-img" src="' + src + '" alt="">' : '') + esc(x[1]) + '</button>'; }).join('') + '</div>';
      if (cf !== 'todos') list = list.filter(function (it) { return cf === 'gerais' ? !it.chestFam : it.chestFam === cf; });
      list = list.slice().sort(function (a, b) { var fa = a.chestFam ? S.CHEST_FAMS.map(function (f) { return f.id; }).indexOf(a.chestFam) + 1 : 0, fb = b.chestFam ? S.CHEST_FAMS.map(function (f) { return f.id; }).indexOf(b.chestFam) + 1 : 0; return fa - fb || (a.chestGrade || 0) - (b.chestGrade || 0) || a.price - b.price; });
    }
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

  /* ================= BOLSA ================= */
  var BAG_FILTERS = [['tudo', 'Tudo'], ['equip', 'Equipamento'], ['consumivel', 'Poções'], ['sistema', 'Sistema'], ['bau', 'Baús'], ['atributo', 'Atributos'], ['secreto', 'Secretos'], ['premium', 'Premium']];
  function bagMatch(it, f) {
    if (f === 'tudo') return true;
    if (f === 'equip') return !!it.equip;
    if (f === 'secreto') return !!it.secret && !it.premium;
    if (f === 'premium') return !!it.premium;
    return it.cat === f;
  }
  function bagHtml(st) {
    var h = '<div class="chips" style="margin-top:14px">' + BAG_FILTERS.map(function (f) {
      return '<button class="chip' + (ui.bag === f[0] ? ' on' : '') + '" data-a="bag" data-v="' + f[0] + '">' + uiIcon(hasArt('tab_' + f[0]) ? 'tab_' + f[0] : ({ tudo: 'bag_tudo', equip: 'bag_equip', secreto: 'bag_secreto', sistema: 'ui_eye', premium: 'ui_crystal' }[f[0]] || 'tab_' + f[0]), '') + f[1] + '</button>';
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
    else if (it.field && n) btns.push('<button class="btn pri block" data-a="use" data-id="' + id + '">' + 'Usar' + '</button>');
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
    else if (m.type === 'ptinfo') inner = ptModal();
    else if (m.type === 'info') inner = m.k === 'skill' ? skillInfoModal(m) : (m.k === 'trophy' ? trophyInfoModal(m) : itemModal(m.id));
    else if (m.type === 'slot') inner = slotModal(m.slot);
    else if (m.type === 'bsheet') inner = battleSheet();
    else if (m.type === 'dsheet') inner = duelSheet();
    else if (m.type === 'gift') inner = giftModal(m);
    else if (m.type === 'emotes') inner = emoteSheet();
    else if (m.type === 'order') inner = orderModal(m);
    else if (m.type === 'arise') inner = ariseModal(m);
    else if (m.type === 'shadow') inner = shadowModal(m);
    else if (m.type === 'ach') inner = achInfoModal(m);
    else if (m.type === 'profile') inner = profileModal(m);
    else if (m.type === 'rename') inner = '<div class="sheet-h"><h2>✒️ Novo nome</h2></div><p class="small muted" style="margin-top:0">Nome atual: <b>' + esc(E.state.name) + '</b>. O progresso, o ID de Jogador e os amigos ficam iguais.</p>' +
      '<label class="f">Novo nome<input class="in" id="rn-name" maxlength="24" autocomplete="off" placeholder="Como queres ser chamado?"></label>' +
      '<div class="row" style="margin-top:12px"><button class="btn ghost grow" data-a="close">Mais tarde</button><button class="btn pri grow" data-a="rename-go">Mudar nome</button></div>';
    var fresh = ui.modal !== ui.shownModal;
    return '<div class="overlay' + (fresh ? ' fresh' : '') + (m.type === 'arise' ? ' arise-ov' : '') + '" data-a="overlay"><div class="sheet' + (fresh ? ' fresh' : '') + (m.type === 'arise' ? ' arise-sheet' : '') + '" role="dialog" aria-modal="true">' + inner + '</div></div>';
  }
  function topRarity(ids) {
    var best = 'comum';
    (ids || []).forEach(function (id) { var it = S.ITEMS[id]; if (it && S.RARITY[it.rarity].order > S.RARITY[best].order) best = it.rarity; });
    return best;
  }
  /* ---------- A Última Arena: a conversa final (Sistema + Arquiteto) ---------- */
  function finalePop() { return { _id: ++ui.popSeq, type: 'first', finale: true, script: S.finaleScript(E.state), i: 0, log: [], typed: -1 }; }
  function finaleTry(st) {
    if (!st.finale || st.finale.seen || (st.battle && !st.battle.over) || inDuel()) return;
    if (ui.popups.some(function (p) { return p.finale; })) return;
    ui.popups.push(finalePop());
    setTimeout(firstType, 60);
  }
  /* ---------- primeira conversa com o Sistema (só ao criar o Jogador) ---------- */
  function firstScript(st) {
    var F0 = S.FIRST_TALK, FP = S.FIRST_TALK_PLUS || {}, pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
    var F = { open: F0.open.concat(FP.open || []), ask: F0.ask.concat(FP.ask || []), close: F0.close.concat(FP.close || []), cls: {} };
    Object.keys(F0.cls).forEach(function (k) { F.cls[k] = F0.cls[k].concat((FP.cls || {})[k] || []); });
    var fill = function (t) { return t.replace(/\{nome\}/g, st.name).replace(/\{classe\}/g, S.CLASSES[st.cls].name); };
    var cl = F.cls[st.cls] || F.cls.guerreiro, q = pick(F.ask), out = [];
    pick(F.open).concat(pick(cl)).forEach(function (t) { out.push({ s: fill(t) }); });
    out.push({ ask: fill(q.q), opts: q.a.map(function (o) { return { t: fill(o[0]), tag: o[1], r: fill(o[2]) }; }) });
    pick(F.close).forEach(function (t) { out.push({ s: fill(t) }); });
    return out;
  }
  function firstHtml(ev, fresh) {
    var step = ev.script[ev.i], typed = ev.typed === ev.i || !FX.full(), last = ev.i === ev.script.length - 1;
    var hist = ev.log.slice(-3).map(function (h) { return h.me ? '<p class="talk-me">' + esc(E.state.name) + ': «' + esc(h.me) + '»</p>' : '<p class="ft-old' + (h.who ? ' w-' + h.who : '') + '">' + esc(h.s) + '</p>'; }).join('');
    var txt = step.ask || step.s, who = step.who || 'sys';
    if (step.name) ev.named = true;
    var arqArt = S.BOSS_ART && S.BOSS_ART.secret_2;
    var face = who === 'arq' ? '<div class="arq-face' + (arqArt ? ' has-art' : '') + '">' + (arqArt ? '<img src="' + arqArt + '" alt="">' : '<span class="arq-orb"></span>') + '</div>'
      : who === 'cut' ? '<span class="eye-fallback big cut-eye"></span>' : uiIcon('ui_eye', '<span class="eye-fallback big"></span>', 'eye-big');
    var tagTxt = who === 'arq' ? (ev.named ? 'DELCIO CUNHA · O ARQUITETO' : '???') : who === 'cut' ? 'ERRO' : 'SISTEMA';
    var body = '<div class="talk-eye">' + face + '</div>' +
      '<div class="ft-hist">' + hist + '</div>' +
      '<p class="talk-line" id="talk-line" data-full="' + esc(txt) + '">' + (typed ? esc(txt) : '') + '</p>';
    if (step.ask) body += '<div class="talk-ch' + (typed ? '' : ' wait') + '" id="talk-ch">' + step.opts.map(function (c, i) { return '<button class="btn talk-opt" data-a="first-pick" data-i="' + i + '" style="--k:' + i + '"><span class="talk-n">' + (i + 1) + '</span>' + esc(c.t) + '</button>'; }).join('') + '</div>';
    else body += '<div class="talk-ch' + (typed ? '' : ' wait') + '" id="talk-ch"><button class="btn pri block talk-opt ft-next" data-a="first-next" style="--k:0">' + (last ? (ev.finale ? 'Entrar na Última Arena' : 'Começar') : 'Continuar') + '</button></div>';
    body += '<div class="ft-foot"><span class="ft-dots">' + ev.script.map(function (x, i) { return '<i class="' + (i < ev.i ? 'on' : i === ev.i ? 'cur' : '') + '"></i>'; }).join('') + '</span>' +
      (last ? '' : '<button class="talk-skip" data-a="first-skip">Saltar</button>') + '</div>';
    var fin = ev.finale ? ' finale-talk w-' + who + (step.name ? ' w-name' : '') : '';
    return '<div class="overlay sys-pop' + (fresh ? ' fresh' : '') + (ev.finale ? ' finale-ov' + (who === 'arq' ? ' arq-on' : '') : '') + '"><div class="rays ' + (who === 'arq' ? 'white' : 'blue') + '"></div><div class="sys-box talk first-talk' + fin + (fresh ? ' fresh' : '') + '" id="sys-box" role="alertdialog" data-type="first"><span class="sys-tag">' + tagTxt + '</span>' + body + '</div></div>';
  }
  function firstType() {
    var ev = ui.popups[0];
    if (!ev || ev.type !== 'first' || ev.typed === ev.i) return;
    ev.typed = ev.i;
    talkType();
  }
  function popupHtml() {
    var ev = ui.popups[0];
    if (!ev || Date.now() < ui.holdUntil) return '';
    var fresh = ev._id !== ui.shownPop;
    var cls = '', tag = 'SISTEMA', body = '', extra = '';
    var li = function (l, i, style) { return '<li style="--k:' + i + (style ? ';' + style : '') + '">' + l + '</li>'; };
    var lines = (ev.lines || []).map(function (l, i) { return li(esc(l), i); }).join('');
    var nLines = (ev.lines || []).length;
    if (ev.type === 'first') return firstHtml(ev, fresh);
    if (ev.type === 'rank') {
      var pr = S.DUEL_RANKS[ev.rank];
      cls = 'rank-pop' + (ev.up ? ' up' : ' down'); tag = 'DUELOS'; extra = ev.up ? '<div class="rays"></div>' : '<div class="watch-veil"></div>';
      body = '<div class="pt-pop" style="--pc:' + pr.color + '">' + ptIcon(pr.i, 'pt-pop-img') + '</div><h2>' + esc(ev.title) + '</h2><div class="pt-pop-name" style="color:' + pr.color + '">' + esc(pr.name) + '</div><ul class="sys-lines">' + lines + '</ul>';
    } else
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
        '<ul class="sys-lines">' + (ev.coins ? li('+' + fmt(ev.coins) + ' moedas', 0, 'color:var(--gold)') : '') +
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
      if (R && R.more) return '<div class="overlay sys-pop">' + extra + '<div class="sys-box ' + cls + '" id="sys-box" role="alertdialog" data-type="talk"><span class="sys-tag">' + tag + '</span>' + body +
        '<button class="btn pri block" data-a="talk-next" style="--n:1">Continuar <span class="muted small">(' + (cv.step + 1) + '/' + cv.steps + ')</span></button></div></div>';
      if (!R) return '<div class="overlay sys-pop' + (fresh ? ' fresh' : '') + '">' + extra + '<div class="sys-box ' + cls + (fresh ? ' fresh' : '') + '" id="sys-box" role="alertdialog" data-type="talk"><span class="sys-tag">' + tag + '</span>' + body + '</div></div>';
    } else if (ev.type === 'notice') {
      var nt = ev.notice;
      cls = 'watch good notice-pop k-' + nt.kind; tag = 'ADMINISTRAÇÃO'; extra = '<div class="rays blue"></div>';
      body = '<div class="nc-big">' + uiIcon('notice_' + nt.kind, NOTICE_ICO[nt.kind] || 'ℹ', 'nc-big-img') + '</div><h2>' + esc(nt.title) + '</h2><div class="muted small">' + esc(S.shop.NOTICE_KINDS[nt.kind] || 'Informação') + (nt.personal ? ' · só para ti' : '') + '</div>' +
        '<div class="nc-body pop">' + esc(nt.body).replace(/\n/g, '<br>') + '</div>';
      nLines = 2;
    } else if (ev.type === 'mission') {
      body = '<h2>' + esc(ev.title) + '</h2><div class="muted">' + esc(ev.name) + '</div><ul class="sys-lines">' + lines + '</ul>';
    } else {
      extra = ev.type === 'skill' || ev.type === 'info' || ev.type === 'arena' ? '<div class="rays blue"></div>' : '';
      if (ev.type === 'arena') { cls = 'prem-pop'; tag = 'COLISEU'; }
      if (ev.type === 'crystals') { cls = 'prem-pop'; tag = 'CRISTAIS'; extra = '<div class="rays blue"></div>'; }
      if (ev.type === 'gift') { cls = 'prem-pop gift-pop'; tag = 'PRESENTE'; extra = '<div class="rays"></div>'; }
      body = '<h2>' + esc(ev.title) + '</h2>' + (ev.name ? '<div class="muted">' + esc(ev.name) + '</div>' : '') + '<ul class="sys-lines">' + lines + '</ul>';
    }
    return '<div class="overlay sys-pop' + (fresh ? ' fresh' : '') + '">' + extra + '<div class="sys-box ' + cls + (fresh ? ' fresh' : '') + '" id="sys-box" role="alertdialog" data-type="' + ev.type + '"><span class="sys-tag">' + tag + '</span>' + body +
      '<button class="btn pri block" data-a="pop-ok" style="--n:' + nLines + '">' + (ui.popups.length > 1 ? 'Seguinte (' + (ui.popups.length - 1) + ')' : 'OK') + '</button></div></div>';
  }
  function popupFx(ev) {
    var c = FX.center(document.getElementById('sys-box'));
    if (ev.type === 'talk') { talkType(); FX.vibrate(20); return; }
    if (ev.type === 'first') { firstType(); FX.vibrate(20); return; }
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
    } else if (ev.type === 'watch' && ev.heal) {
      FX.flash('#5be08a', .3); FX.vibrate([30, 40, 120]);
      setTimeout(function () { FX.rise(c.x, window.innerHeight, 240, '#5be08a', 60); FX.burst(c.x, c.y - 40, '#5be08a', 50, { speed: 8 }); }, 300);
    } else if (ev.type === 'watch' && !ev.good) {
      FX.flash('#ff1f3d', .18 + ev.level * .08); FX.vignette();
      FX.vibrate(ev.level >= 3 ? [300, 80, 300, 80, 600] : [80, 60, 80, 60, 220]);
      setTimeout(function () { FX.shake(ev.level >= 2 ? 3 : 1); }, 350);
    } else if (ev.type === 'crystals' || ev.type === 'gift') {
      FX.flash('#67d5ff', .35); FX.vibrate([40, 40, 40, 40, 200]);
      setTimeout(function () { FX.shock(c.x, c.y - 40, '#67d5ff'); FX.burst(c.x, c.y - 40, '#67d5ff', 90, { speed: 11 }); FX.rise(c.x, window.innerHeight, 260, '#67d5ff', 50); }, 400);
    } else if (ev.restore) {
      setTimeout(function () { FX.burst(c.x, c.y - 40, '#5be08a', 46, { speed: 7 }); FX.burst(c.x, c.y - 40, '#6fd6ff', 30, { speed: 5 }); }, 400);
    } else if (ev.type === 'arena') {
      FX.flash('#67d5ff', .3); FX.vibrate([60, 40, 60, 40, 200]); setTimeout(function () { FX.shock(c.x, c.y, '#67d5ff'); FX.burst(c.x, c.y, '#e0f6ff', 60, { speed: 9 }); FX.shake(1); }, 400);
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
      (ui.tab === 'combate' ? ui.gate : ui.tab === 'loja' ? ui.shopTab : ui.tab === 'bolsa' ? ui.bag : '') + '|' + (ui.chatWith || ui.duelId || '');
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
  /* som de cada janela do Sistema */
  function popSound(pop) {
    if (pop.type === 'rank') return pop.up ? 'levelup' : 'penalty';
    if (pop.type === 'loot') return (pop.items || []).some(function (id) { var it = S.ITEMS[id]; return it && /^(lendario|mitico|secreto)$/.test(it.rarity); }) ? 'chest_rare' : 'chest';
    if ((pop.type === 'victory' || pop.type === 'defeat') && /^TREINO/.test(pop.title || '')) return 'shadow_down';
    return { levelup: 'levelup', victory: 'victory', mission: 'quest', crystals: 'gain', gift: 'gain', defeat: 'death', emergency: 'emergency', penalty: 'penalty', zone: 'penalty', achievement: 'achievement', hidden: 'system' }[pop.type] || 'system';
  }
  /* música: trilha do chefe em batalha (loop), pré-escuta na ficha do chefe (uma vez), créditos */
  function musicSync() {
    var MU = S.music; if (!MU) return;
    var st = E.state, bt = st && st.battle;
    if (bt && !bt.over && !bt.spar && MU.has(bt.bossId)) {
      ui.musicPreview = null;
      // a segunda forma (ou fase) tem a sua própria música, se existir: <id>_f2
      var f2 = bt.bossId + '_f2';
      if (MU.preload && MU.has(f2)) MU.preload(f2);
      return MU.play(bt.phase >= 2 && MU.has(f2) ? f2 : bt.bossId, { loop: true });
    }
    if (ui.modal && ui.modal.type === 'boss' && MU.has(ui.modal.id)) {
      if (ui.musicPreview !== ui.modal) { ui.musicPreview = ui.modal; MU.play(ui.modal.id, { loop: false }); }
      return;
    }
    ui.musicPreview = null;
    if (st && ui.page === 'credits' && MU.has('credits')) return MU.play('credits', { loop: true });
    if (ui.page === 'duel' && MU.current === 'duel') return;
    if (MU.current) MU.stop();
  }
  function render() {
    if (!root) return;
    var sheet = root.querySelector('.sheet');
    var sheetScroll = sheet ? sheet.scrollTop : 0;
    var modalKey = ui.modal ? ui.modal.type : null;
    // portão do aparelho: bloqueado, à espera de autorização ou por verificar → nada mais aparece
    var gs = S.gate && S.gate.screen();
    if (gs) {
      FX.battle(false); root.innerHTML = gateHtml(gs);
      if (gs.type === 'blocked' && S.gate.firstBlockView()) { sfx('denied'); FX.flash('#ff1f3d', .25); FX.vibrate([80, 50, 160]); setTimeout(function () { FX.shake(1); }, 140); }
      return;
    }
    if (!E.state) {
      FX.battle(false);
      root.innerHTML = introHtml();
      if (ui.intro.step === 0) runTyper();
      return;
    }
    var st = E.state;
    if (st.shop && st.shop.deleted) { FX.battle(false); root.innerHTML = deletedHtml(st, st.shop.deleted) + (ui.modal ? modalHtml() : ''); return; }
    var ban = S.shop && S.shop.banned(st);
    if (ban) {
      FX.battle(false); root.innerHTML = banHtml(st, ban);
      // a primeira vez que a sentença aparece: o Sistema faz-se sentir
      var key = (ban.since || 0) + '';
      if (ui.banShown !== key) {
        ui.banShown = key;
        setTimeout(function () { FX.flash('#ff1f3d', .45); FX.vignette(); FX.vibrate([300, 80, 300, 80, 600]); setTimeout(function () { FX.shake(3); }, 300); }, 150);
      }
      return;
    }
    ui.banShown = null; ui.banLine = null;
    finaleTry(st);
    // depois da vitória (e das janelas do Sistema), abre a extração da sombra
    if (ui.ariseId && !ui.popups.length && !ui.modal && Date.now() >= (ui.holdUntil || 0)) { ui.modal = { type: 'arise', id: ui.ariseId }; ui.ariseId = null; sfx('system'); }
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
    var keep = {}, ae = document.activeElement, focus = null;
    root.querySelectorAll('[data-keep]').forEach(function (el) { if (el.id) keep[el.id] = el.value; });
    if (ae && ae.id && keep[ae.id] != null) focus = { id: ae.id, s: ae.selectionStart, e: ae.selectionEnd };
    var chatEl = document.getElementById('chat-list'), chatTop = chatEl ? chatEl.scrollTop : null;
    root.innerHTML = topHtml(st) + '<main' + (entering ? ' class="enter"' : '') + '>' + body + '</main>' + navHtml(st) + modalHtml() + popupHtml();
    Object.keys(keep).forEach(function (id) { var el = document.getElementById(id); if (el && !entering) el.value = keep[id]; });
    if (focus && !entering) { var fe = document.getElementById(focus.id); if (fe) { fe.focus({ preventScroll: true }); try { fe.setSelectionRange(focus.s, focus.e); } catch (e) { /* tipo sem seleção */ } } }
    if (chatTop != null && !entering) { var ce = document.getElementById('chat-list'); if (ce) ce.scrollTop = chatTop; }

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
      sfx(popSound(pop));
      if ((pop.type === 'levelup' || (pop.type === 'victory' && !/^TREINO/.test(pop.title || ''))) && S.premium.effectOf(E.state)) setTimeout(function () { FX.celebrate(S.premium.effectOf(E.state)); }, 250);
      popupFx(pop);
    }
    ui.fxMission = null; ui.fxDaily = false; ui.spawn = false;
    musicSync();
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
    var t = 0, bossTurn = false, usedSkill = false;
    var at = function (ms, fn) { setTimeout(fn, ms); };
    var hitBoss = function () { if (!bossEl || !bossEl.isConnected) return; bossEl.classList.remove('hit'); void bossEl.offsetWidth; bossEl.classList.add('hit'); setTimeout(function () { bossEl.classList.remove('hit'); }, 420); };
    var panel = function (c) { if (!pp || !pp.isConnected) return; pp.classList.remove('hit', 'healed'); void pp.offsetWidth; pp.classList.add(c); };
    var skillColor = color;
    entries.forEach(function (e) {
      var txt = e.t, v;
      var isBossSide = /^◀|O chefe regenera|O chefe cria|O chefe fica|A tua defesa desce|O chefe drena|Ficaste atordoado|Resististe|causam-te|está atordoado e perde/.test(txt);
      if (isBossSide && !bossTurn) { bossTurn = true; t = Math.max(t + 120, 550); }
      if (txt.indexOf('✦ Usaste') === 0) {
        usedSkill = true;
        var nm = txt.replace('✦ Usaste ', '').replace(/\.$/, '');
        var sk = Object.keys(S.ALL_SKILLS).map(function (k) { return S.ALL_SKILLS[k]; }).filter(function (x) { return x.name === nm; })[0];
        skillColor = sk && sk.secret ? '#ffc85a' : color;
        if (sk && sk.secret) at(t, function () { FX.flash('#ffc85a', .25); });
        at(t, function () { FX.text(nm, pc.x, pc.y - 40, skillColor); });
        t += 120;
      } else if (txt.indexOf('➤') === 0) {
        v = num(/: (\d+) de dano/, txt);
        var hits = num(/\((\d+) golpes\)/, txt) || 1, crit = e.c === 'crit';
        (function (t0, v, hits, crit, col, sk) {
          at(t0, function () {
            sfx(sk || (crit ? 'crit' : 'attack'), crit && sk ? 1.15 : 1);
            var d = FX.attack(style, bc.x, bc.y, col, hits, crit);
            setTimeout(function () { hitBoss(); FX.number(fmt(v), bc.x, bc.y - 30, crit ? 'crit' : ''); if (crit) { FX.shake(1); FX.vibrate(40); } }, Math.min(d, 400) + 120);
          });
        })(t, v, hits, crit, skillColor, usedSkill ? (ui.skillSnd || 'skill') : null);
        usedSkill = false;
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
        (function (t0) { at(t0, function () { sfx('skill', 1.1); FX.attack('impact', bc.x, bc.y, '#ff8a3d', 1, true); FX.shake(2); }); })(t);
      } else if (txt.indexOf('SEGUNDA FORMA') >= 0) {
        (function (t0, nm) { at(t0, function () { sfx('awaken'); FX.flash('#ffffff', .55); FX.shake(3); FX.vibrate([120, 60, 240]); FX.banner('SEGUNDA FORMA', nm, 'rgba(255,255,255,.45)', '#f4f8ff'); }); })(t, (txt.match(/FORMA: (.+?) ergue-se/) || [])[1] || '');
        t += 900;
      } else if (txt.indexOf('FASE') >= 0) {
        (function (t0, full) { at(t0, function () { sfx('phase'); FX.flash('#ff2040', .35); FX.shake(3); FX.vibrate([100, 50, 200]); FX.banner(full ? 'FASE FINAL' : 'FASE 2', 'O chefe libertou o seu poder', 'rgba(255,40,70,.55)', '#ff5a6e'); }); })(t, txt.indexOf('FINAL') >= 0);
        t += 500;
      } else if (txt.indexOf('◀') === 0) {
        v = num(/: (\d+) de dano/, txt) || 0;
        var dodged = txt.indexOf('ESQUIVASTE') >= 0;
        (function (t0, v, dodged) {
          at(t0, function () {
            if (bossEl && bossEl.isConnected) { bossEl.classList.remove('hit'); }
            if (dodged && !v) { sfx('back'); FX.number('ESQUIVA', pc.x, pc.y - 10, 'miss'); return; }
            sfx('hurt');
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
        (function (t0) { at(t0, function () { FX.burst(bc.x, bc.y, '#ff3d3d', 40, { speed: 6, gravity: -.05 }); FX.text('FÚRIA', bc.x, bc.y - 60, '#ff5a6e'); FX.shake(1); sfx('fury'); }); })(t);
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
    if (type === 'item') sfx(drinkable(E.item(id)) ? drinkSound(E.item(id)) : 'click');
    if (type === 'skill') { var skx = S.ALL_SKILLS[id]; ui.skillSnd = skillSound(skx); if (!(skx && skx.ops || []).some(function (o) { return o.op === 'dmg'; })) sfx(ui.skillSnd); }
    var over = E.state.battle && E.state.battle.over;
    if (over === 'win') ui.victoryAnim = true;
    if (over === 'win' && E.state.battle.result && E.state.battle.result.shadow) ui.ariseId = E.state.battle.result.shadow;
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
    'rename-go': function () {
      var e = document.getElementById('rn-name'), r = E.rename(e ? e.value : '');
      if (!r.ok) return toast(r.msg, true);
      ui.modal = null; toast(r.msg); sfx('quest'); FX.flash('#67d5ff', .2); shopSync(true); render();
    },
    'set-gender': function (d) { var r = E.setGender(d.v); if (r.ok && !r.same) { toast(r.msg); shopSync(true); } render(); },
    'intro-g': function (d) { ui.intro.gender = d.v === 'f' ? 'f' : 'm'; render(); },
    'intro-go': function () {
      if (!ui.intro.gender) return toast('Escolhe a aparência do teu avatar.', true);
      var r = E.start(ui.intro.name, ui.intro.cls, ui.intro.gender);
      if (!r.ok) return toast(r.msg, true);
      sfx('awaken');
      ui.popups.push({ _id: ++ui.popSeq, type: 'first', script: firstScript(E.state), i: 0, log: [], typed: -1 });
      ui.popups.push({ _id: ++ui.popSeq, type: 'info', title: 'BEM-VINDO, JOGADOR', name: E.state.name, lines: ['Classe: ' + S.CLASSES[E.state.cls].name, 'Começas com 100 moedas, poções e um Baú Comum.', 'Cria as tuas missões no separador Missões.'] });
      ui.tab = 'status';
      setTimeout(function () { shopSync(true); }, 5000);
      if (Notify.available()) { E.state.settings.notifAsked = true; setTimeout(function () { Notify.ask().then(function () { Notify.sync(true); }); }, 3500); }
      if (FX.full()) {
        FX.awaken(S.CLASSES[E.state.cls].color);
        ui.holdUntil = Date.now() + 2300;
        setTimeout(function () { ui.lastView = null; render(); }, 1650);
      }
      render();
    },
    tab: function (d) { var was = ui.tab; ui.tab = d.t; ui.page = null; ui.modal = null; render(); window.scrollTo(0, 0); if (was !== d.t) talkTry('tab', { tab: d.t }, 1400); },
    page: function (d) { ui.page = d.p; ui.histLimit = 40; render(); window.scrollTo(0, 0); if (d.p === 'avisos') S.shop.markRead(E.state); if (d.p === 'social') socLoad(true); },
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
    // sombras
    'sh-buy': function (d) {
      var b = S.BOSS_BY_ID[d.id], price = S.shadows.buyPrice(b);
      confirmBox('Quebrar o selo', 'Usar ' + price + ' Cristais para tornar a sombra de ' + b.name + ' tua serva?', 'Pagar ' + price + ' Cristais', function () {
        var r = S.shadows.buy(d.id);
        if (!r.ok) { if (r.need) { ui.modal = null; ui.tab = 'status'; ui.page = 'premium'; ui.premTab = 'obter'; loadShop(); } return act(r); }
        ui.modal = { type: 'arise', id: d.id, res: r }; pullEvents(); render();
        var c = FX.center(document.getElementById('arise-stage'));
        sfx('arise'); FX.flash('#7b4dff', .55); FX.burst(c.x, c.y, '#8b6bff', 90, { speed: 10 }); FX.vibrate([80, 40, 220]);
      });
    },
    'arise-open': function (d) { ui.modal = { type: 'arise', id: d.id }; render(); },
    'arise-try': function (d) {
      if (ui.ariseBusy) return;
      ui.ariseBusy = true;
      var stage = document.getElementById('arise-stage');
      if (stage) stage.classList.add('pulling');
      sfx('system'); FX.vibrate([30, 40, 30, 40, 30]);
      setTimeout(function () {
        ui.ariseBusy = false;
        var r = S.shadows.extract(d.id);
        if (!r.ok) { toast(r.msg, true); render(); return; }
        ui.modal = { type: 'arise', id: d.id, res: r };
        pullEvents(); render();
        var c = FX.center(document.getElementById('arise-stage'));
        if (r.success) { sfx('arise'); FX.flash('#7b4dff', .55); FX.burst(c.x, c.y, '#8b6bff', 90, { speed: 10 }); FX.rise(c.x, c.y + 80, 220, '#5a3dff', 60); FX.shake(2); FX.vibrate([80, 40, 220]); }
        else { sfx(r.lost ? 'shadow_down' : 'extract_fail'); FX.shake(r.lost ? 2 : 1); FX.vibrate(r.lost ? [120, 60, 120] : 60); }
      }, FX.full() ? 1150 : 150);
    },
    'body-edit': function () { ui.bodyEdit = true; render(); var e = document.getElementById('body-win'); if (e) e.scrollIntoView(); },
    'body-cancel': function () { ui.bodyEdit = false; render(); },
    'body-save': function () {
      var v = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };
      var r = S.body.saveAll({ kg: v('body-kg'), height: v('body-h'), age: v('body-a'), sex: v('body-s'), activity: v('body-act'), goal: v('body-goal') });
      if (r.ok) ui.bodyEdit = false;
      act(r); var e = document.getElementById('body-win'); if (e && r.ok) e.scrollIntoView();
    },
    'body-hist': function () { ui.bodyHist = !ui.bodyHist; },
    'body-fix': function (d) { ui.bodyHist = true; ui.bodyFix = d.d; render(); var e = document.getElementById('body-fix-in'); if (e) e.focus(); },
    'body-fix-ok': function (d) { var e = document.getElementById('body-fix-in'); var r = S.body.editEntry(d.d, e ? e.value : ''); if (r.ok) ui.bodyFix = null; act(r); },
    'body-fix-no': function () { ui.bodyFix = null; render(); },
    'body-del': function (d) { confirmBox('Apagar registo', 'Apagar o peso de ' + d.d.split('-').reverse().join('/') + '?', 'Apagar', function () { ui.bodyHist = true; act(S.body.removeEntry(d.d)); }, true); },
    'sh-open': function (d) { ui.modal = { type: 'shadow', id: d.id, line: S.shadows.line(E.state, d.id, true) }; S.storage.write(E.state); render(); },
    'sh-talk': function (d) { ui.modal.line = S.shadows.line(E.state, d.id, true); S.storage.write(E.state); render(); },
    'sh-toggle': function (d) { var r = S.shadows.toggle(d.id); act(r); },
    'sh-rename': function (d) { var el = document.getElementById('sh-name'); act(S.shadows.rename(d.id, el ? el.value : '')); },
    'prem-open': function (d) { ui.tab = 'status'; ui.page = 'premium'; ui.premTab = d.t || ui.premTab || 'arenas'; ui.modal = null; render(); window.scrollTo(0, 0); if (ui.premTab === 'obter' || ui.premTab === 'moedas') loadShop(); },
    'ach-filter': function (d) { ui.achFilter = d.f; render(); },
    'ach-info': function (d) { ui.modal = { type: 'ach', id: d.id }; render(); },
    'del-restart': function () {
      confirmBox('Começar de novo', 'O progresso deste aparelho é apagado e começas um registo novo, do nível 1.', 'Começar de novo', function () {
        E.resetAll(); ui.intro = { step: 0, name: '', cls: null }; ui.tab = 'status'; ui.page = null; ui.popups = []; ui.bars = {}; ui.lastCoins = null; ui.lastView = null; render();
      }, true);
    },
    // ---- social ----
    'soc-profile': function (d) {
      ui.modal = { type: 'profile', id: d.id }; render();
      SO.profile(d.id).then(function (j) {
        if (!ui.modal || ui.modal.type !== 'profile' || ui.modal.id !== d.id) return;
        if (j.ok) ui.modal.data = j.profile; else ui.modal.err = j.msg || 'Não foi possível abrir o perfil.';
        ui.shownModal = ui.modal; render();
      });
    },
    'photo-del': function () {
      confirmBox('Tirar a foto de perfil', 'Os teus amigos voltam a ver o teu avatar.', 'Tirar', function () {
        SO.setPhoto(null).then(function (j) { if (!j.ok) return toast(j.msg, true); toast('Foto removida.'); socLoad(true); render(); });
      }, true);
    },
    'soc-tab': function (d) { ui.socTab = d.v; render(); if (d.v === 'duelos') { ui.duelHist = null; } },
    'soc-reload': function () { SO.cache = null; render(); },
    'soc-back': function () { ui.page = 'social'; ui.chatWith = null; ui.chatMsgs = null; ui.duelId = null; ui.duel = null; render(); socLoad(true); window.scrollTo(0, 0); },
    'soc-find': function () {
      var q = (document.getElementById('soc-q') || {}).value || '';
      SO.find(q.trim()).then(function (j) { if (!j.ok) return toast(j.msg, true); ui.socFound = j.players; render(); });
    },
    'soc-add': function (d) { SO.request(d.id).then(function (j) { act(j); if (j.ok) { ui.socFound = (ui.socFound || []).map(function (p) { return p.id === d.id ? Object.assign({}, p, { relation: j.status }) : p; }); socLoad(true); } }); },
    'soc-accept': function (d) { SO.respond(d.id, true).then(function (j) { if (j.ok) { toast('Agora são amigos.'); sfx('quest'); ui.socFound = null; } else toast(j.msg, true); socLoad(true); }); },
    'soc-decline': function (d) { SO.respond(d.id, false).then(function (j) { if (!j.ok) toast(j.msg, true); socLoad(true); }); },
    'soc-remove': function (d) {
      var f = ((SO.cache && SO.cache.friends) || []).filter(function (x) { return x.id === d.id; })[0];
      var go = function () { SO.remove(d.id).then(function (j) { if (!j.ok) toast(j.msg, true); socLoad(true); }); };
      if (f) confirmBox('Remover amigo', 'Remover ' + f.name + ' da tua lista de amigos? As conversas deixam de estar disponíveis.', 'Remover', go, true); else go();
    },
    'chat-open': function (d) {
      if (ui.modal && ui.modal.type === 'profile') ui.modal = null;
      ui.page = 'chat'; ui.chatWith = d.id; ui.chatMsgs = []; ui.chatLoading = true; ui.chatFriend = ((SO.cache && SO.cache.friends) || []).filter(function (x) { return x.id === d.id; })[0] || null;
      render(); window.scrollTo(0, 0); chatLoad(true);
    },
    'chat-send': function () {
      var el = document.getElementById('chat-text'), text = el ? el.value.trim() : '';
      if (!text || !ui.chatWith) return;
      el.value = '';
      var tmp = { id: 'tmp' + Date.now(), from: E.state.playerId, text: text, at: SO.serverNow(), pending: true };
      ui.chatMsgs = (ui.chatMsgs || []).concat([tmp]); render(); chatScroll(); sfx('click');
      SO.send(ui.chatWith, text).then(function (j) {
        if (!j.ok) { tmp.pending = false; tmp.failed = true; toast(j.msg, true); render(); return; }
        ui.chatMsgs = ui.chatMsgs.map(function (m) { return m === tmp ? j.message : m; }); render(); chatScroll();
      });
      var nel = document.getElementById('chat-text'); if (nel) nel.focus();
    },
    'duel-hist': function () { SO.duels().then(function (j) { if (!j.ok) return toast(j.msg, true); ui.duelHist = j.duels; render(); }); },
    'duel-create': function (d) { duelStart(SO.create({ public: d.p === '1' })); },
    'duel-invite': function (d) {
      if (ui.modal && ui.modal.type === 'profile') ui.modal = null;
      var c = SO.cache, open = c && c.duel;
      if (open && open.status === 'active') { toast('Já tens um duelo em curso.', true); return H['duel-open']({ id: open.id }); }
      if (open && open.status === 'waiting') { SO.invite(open.id, d.id).then(function (j) { act(j, j.ok ? 'Convite enviado.' : null); if (j.ok) { ui.duelId = open.id; ui.duel = j.duel; ui.page = 'duel'; render(); duelPoll(); } }); return; }
      duelStart(SO.create({ public: false, invite: d.id }), 'Convite enviado. À espera que aceite…');
    },
    'duel-reinvite': function (d) { if (ui.duel) SO.invite(ui.duel.id, d.id).then(function (j) { act(j, j.ok ? 'Convite enviado.' : null); if (j.ok) { ui.duel = j.duel; render(); } }); },
    'duel-join': function (d) { duelStart(SO.join({ id: d.id })); },
    'duel-join-code': function () { var v = ((document.getElementById('duel-code') || {}).value || '').trim(); if (v.length < 6) return toast('Escreve o código da sala (6 letras).', true); duelStart(SO.join({ code: v })); },
    'pt-info': function () { ui.modal = { type: 'ptinfo' }; render(); },
    'duel-open': function (d) { ui.page = 'duel'; ui.duelId = d.id; ui.duel = null; render(); window.scrollTo(0, 0); duelPoll(); },
    'duel-copy': function () { if (ui.duel) copyText(ui.duel.code, 'Código ' + ui.duel.code + ' copiado.'); },
    'duel-act': function (d) { duelMove(d.v); },
    'emote-open': function () { if (!ui.duel || ui.duel.status !== 'active') return; ui.modal = { type: 'emotes' }; render(); },
    'duel-emote': function (d) {
      ui.modal = null; render();
      if (!ui.duel) return;
      SO.emote(ui.duel.id, d.id).then(function (j) { if (!j.ok) return toast(j.msg, true); sfx('click'); ui.duel.emotes = j.duel.emotes; softRender(); setTimeout(softRender, 9500); });
    },
    'gift-open': function (d) {
      ui.modal = { type: 'gift', id: d.id }; render();
      if (SO.ready() && !(SO.cache && SO.cache.friends)) SO.state && SO.state().then(function () { if (ui.modal && ui.modal.type === 'gift') render(); });
    },
    'gift-send': function (d) {
      var c = S.COSMETIC_BY_ID[d.id];
      confirmBox('Oferecer', 'Oferecer ' + c.name + ' a ' + d.n + ' por ' + c.crystals + ' Cristais?', 'Oferecer', function () {
        ui.giftBusy = true; toast('A enviar o presente…');
        SO.gift(d.to, d.id, d.n).then(function (j) {
          ui.giftBusy = false;
          if (!j.ok) return toast(j.msg, true);
          sfx('crystal'); FX.burst(window.innerWidth / 2, window.innerHeight * .4, c.color, 50, { speed: 8 });
          ui.modal = null; render(); toast('Presente enviado a ' + d.n + '.');
        });
      });
    },
    'gift-to': function (d) { ui.giftTo = d.id || null; render(); },
    'buy-gift': function (d) {
      var p = ((S.shop.cached() || {}).packages || []).filter(function (x) { return x.id === d.id; })[0], f = ((SO.cache && SO.cache.friends) || []).filter(function (x) { return x.id === ui.giftTo; })[0];
      if (!p || !f) return;
      confirmBox('Oferecer Cristais', p.crystals + ' Cristais para ' + f.name + ' por ' + kz(p.price_kz) + '.\n\nO pedido fica registado e abre-se o WhatsApp com a mensagem pronta. ' + f.name + ' recebe depois de o pagamento ser confirmado.', 'Pedir', function () {
        toast('A registar o pedido…');
        S.shop.order(p.id, f.id).then(function (r) {
          if (!r.ok) return toast(r.msg, true);
          ui.giftTo = null;
          ui.modal = { type: 'order', id: r.order.id }; pullEvents(); render();
        });
      });
    },
    'd-sheet': function (d) { if (!ui.duel || ui.duel.turn !== ui.duel.me) return; ui.modal = { type: 'dsheet', v: d.v }; render(); },
    'duel-skill': function (d) { ui.modal = null; duelMove('skill', { skill: d.id }); },
    'duel-item': function (d) { ui.modal = null; var it = S.ITEMS[d.id]; sfx(it && drinkable(it) ? drinkSound(it) : 'click'); duelMove('item', { item: d.id }); },
    'duel-leave': function () {
      var d = ui.duel; if (!d) return;
      var go = function () { SO.leave(d.id).then(function (j) { if (!j.ok) return toast(j.msg, true); duelShow(j.duel); if (j.duel.status === 'cancelled') H['soc-back'](); }); };
      if (d.status === 'active') confirmBox('Desistir do duelo', 'Se desistires, o adversário ganha e perdes pontos de duelo.', 'Desistir', go, true); else go();
    },
    'chest-fam': function (d) { ui.chestFam = d.v; render(); },
    'prem-tab': function (d) { ui.premTab = d.t; render(); if (d.t === 'obter' || d.t === 'moedas') loadShop(); },
    'prem-buy': function (d) {
      var it = S.ITEMS[d.id], p = { x: ui.pt.x, y: ui.pt.y };
      confirmBox('Loja Exclusiva', 'Comprar ' + it.name + ' por ' + S.premium.price(d.id) + ' Cristais?', 'Comprar', function () {
        var r0 = S.premium.buy(d.id, 1);
        if (r0.ok && it.cat === 'sistema') sysAfter(it);
        var r = act(r0);
        if (r.ok && it.use && it.use.type === 'rename') { ui.modal = { type: 'rename' }; render(); }
        if (r.ok) { sfx('crystal'); FX.burst(p.x, p.y, '#67d5ff', 40, { speed: 8 }); FX.flash('#67d5ff', .2); FX.vibrate([30, 30, 60]); }
      });
    },
    'arena-view': function (d) { ui.arenaN = +d.n || 0; render(); window.scrollTo(0, 0); },
    'arena-unlock': function (d) {
      var b = S.BOSS_BY_ID[d.id];
      var g1 = S.ARENA_LADDER[b.arena][0], gap = g1.level - E.state.level;
      confirmBox('Abrir a arena', b.arenaName + '\n10 combates: 9 Guardiões (Nv ' + g1.level + ' a ' + (b.level - 1) + ') e ' + b.name + ' (Nv ' + b.level + ').\n\nTributo: ' + b.cost + ' Cristais. A arena fica aberta para sempre.' +
        (gap >= 8 ? '\n\n⚠️ O primeiro Guardião é nível ' + g1.level + ' e tu és nível ' + E.state.level + '. Vais lutar com pressão de nível.' : ''), 'Pagar tributo', function () {
        var r = S.premium.unlock(d.id);
        if (!r.ok) { if (r.need) { ui.page = 'premium'; ui.premTab = 'obter'; loadShop(); } return act(r); }
        ui.modal = null; ui.arenaN = b.arena;
        sfx('arena_open');
        act(r);
      });
    },
    'id-copy': function () {
      var id = E.state.playerId;
      try { navigator.clipboard.writeText(id).then(function () { toast('ID copiado: ' + id); }, function () { toast(id); }); } catch (e) { toast(id); }
    },
    redeem: function () {
      var code = ((document.getElementById('redeem-code') || {}).value || '').trim();
      if (!code) return toast('Escreve o código.', true);
      if (!S.shop || !S.shop.ready()) return toast('A loja de Cristais ainda não está ligada ao servidor.', true);
      S.shop.redeem(code).then(function (r) { act(r); if (r.ok) { sfx('gain'); FX.flash('#67d5ff', .35); FX.burst(window.innerWidth / 2, window.innerHeight / 2, '#67d5ff', 80, { speed: 10 }); } });
    },
    'prem-ex': function (d) {
      var x = S.PREMIUM_EXCHANGE.filter(function (e) { return e.id === d.id; })[0];
      confirmBox('Câmbio do Sistema', 'Trocar ' + x.crystals + ' Cristais por ' + fmt(x.coins) + ' moedas?', 'Trocar', function () { var r = act(S.premium.exchange(d.id)); if (r && r.ok) sfx('crystal'); });
    },
    'cos-buy': function (d) {
      var c = S.COSMETIC_BY_ID[d.id];
      confirmBox('Aparência', 'Comprar ' + c.name + ' por ' + c.crystals + ' Cristais?\nÉ só visual e fica tua para sempre.', 'Comprar', function () {
        var r = act(S.premium.buyCosmetic(d.id));
        if (r.ok) { sfx('crystal'); FX.flash(c.color, .3); FX.burst(window.innerWidth / 2, window.innerHeight * .3, c.color, 60, { speed: 9 }); }
      });
    },
    'cos-wear': function (d) { act(S.premium.wear(d.id)); },
    'cos-test': function (d) { var c = S.COSMETIC_BY_ID[d.id]; if (c && c.fx) FX.celebrate(c.fx); },
    'shop-load': function () { loadShop(true); },
    'gate-check': function () {
      var U = S.gate.ui; if (U.busy) return;
      if (!S.shop.ready()) { U.err = 'Sem ligação ao servidor.'; return render(); }
      U.busy = true; U.err = null; U.msg = null; render();
      S.gate.check(true).then(function (r) {
        U.busy = false;
        if (!r.ok) U.err = r.offline ? 'Sem ligação. Liga-te à internet e tenta outra vez.' : (r.msg || 'O Sistema não respondeu.');
        else { var g = S.gate.screen(); if (g && g.type === 'blocked') { sfx('denied'); FX.flash('#ff1f3d', .2); FX.vibrate([60, 40, 120]); } }
        afterGate();
      });
    },
    'gate-redeem': function () {
      var U = S.gate.ui, el = document.getElementById('gate-acs'), code = el ? el.value : '';
      if (U.busy) return;
      U.busy = true; U.err = null; U.msg = null; render();
      S.gate.redeem(code).then(function (r) {
        U.busy = false;
        if (!r.ok) { U.err = r.msg; render(); var e2 = document.getElementById('gate-acs'); if (e2) e2.value = code; return; }
        afterGate();
      });
    },
    'gate-request': function () {
      var U = S.gate.ui, n = document.getElementById('gate-name'), m = document.getElementById('gate-msg');
      var name = n ? n.value : '', msg = m ? m.value : '';
      if (U.busy) return;
      U.busy = true; U.err = null; U.msg = null; render();
      S.gate.request(name, msg).then(function (r) {
        U.busy = false;
        if (!r.ok) { U.err = r.msg; render(); var a = document.getElementById('gate-name'), b = document.getElementById('gate-msg'); if (a) a.value = name; if (b) b.value = msg; return; }
        U.msg = 'Pedido enviado. Envia também uma mensagem no WhatsApp para ser visto mais depressa.'; render();
        if (r.wa) H.ext({ url: r.wa });
      });
    },
    'ban-check': function () {
      if (!S.shop.ready()) return toast('Sem ligação ao servidor.', true);
      toast('A verificar…');
      S.shop.sync(true).then(function (r) {
        if (r.ok && r.banned) { ui.banLine = S.shop.banCheckLine(); FX.flash('#ff1f3d', .2); FX.vibrate([60, 40, 120]); setTimeout(function () { FX.shake(1); }, 120); }
        else ui.banLine = null;
        pullEvents(); render();
        if (!r.ok) toast(r.msg || 'Sem ligação ao servidor. A suspensão mantém-se.', true);
      });
    },
    'don-pick': function (d) { ui.donate = +d.v || -1; render(); },
    'don-go': function () {
      var st = E.state, v = ui.donate || 1000;
      var msg = 'Olá! Quero apoiar o criador do Sistema com uma doação' + (v > 0 ? ' de ' + fmt(v) + ' Kz' : '') + '.\n\nJogador: ' + st.name + '\nID de Jogador: ' + st.playerId +
        '\n\nVou pagar por MULTICAIXA Express. Fico à espera dos dados para a transferência. Obrigado pelo jogo!';
      H.ext({ url: 'https://wa.me/' + S.SHOP_WHATSAPP + '?text=' + encodeURIComponent(msg) });
    },
    'pack-pick': function (d) {
      ui.pack = d.id; render();
      var bx = document.getElementById('buy-box'); if (bx && bx.scrollIntoView) bx.scrollIntoView({ block: 'center', behavior: 'smooth' });
    },
    'buy-wa': function (d) {
      var cfg = S.shop.cached(), live = S.shop.ready() && cfg && cfg.open && cfg.packages && cfg.packages.length;
      if (live && cfg.packages.some(function (x) { return x.id === d.id; })) return H['prem-order'](d);
      var p = S.CRYSTAL_PACKS.concat(S.COIN_PACKS).filter(function (x) { return x.id === d.id; })[0], st = E.state;
      if (!p) return;
      var isC = p.kind === 'coins', what = isC ? 'Moedas' : 'Cristais';
      var msg = 'Olá! Quero comprar ' + what.toLowerCase() + ' no Sistema.\n\n' +
        'Pacote: ' + p.name + '\n' + what + ': ' + (isC ? p.coins : p.crystals) + (p.bonus ? ' (' + p.base + ' + ' + p.bonus + ' de bónus)' : '') + '\nValor: ' + kz(p.price_kz) +
        '\n\nJogador: ' + st.name + '\nID de Jogador: ' + st.playerId +
        '\n\nVou pagar por MULTICAIXA Express. Fico à espera dos dados para a transferência.';
      H.ext({ url: 'https://wa.me/' + S.SHOP_WHATSAPP + '?text=' + encodeURIComponent(msg) });
    },
    'prem-order': function (d) {
      var p = (S.shop.cached().packages || []).filter(function (x) { return x.id === d.id; })[0];
      if (!p) return;
      confirmBox(p.kind === 'coins' ? 'Pedir moedas' : 'Pedir Cristais', (p.kind === 'coins' ? fmt(p.coins) + ' moedas' : p.crystals + ' Cristais') + ' por ' + kz(p.price_kz) + '.\n\nO pedido fica registado e abre-se o WhatsApp com a mensagem pronta. Só pagas depois de receberes as instruções.', 'Fazer pedido', function () {
        toast('A registar o pedido…');
        S.shop.order(p.id).then(function (r) {
          if (!r.ok) return toast(r.msg, true);
          ui.toast = null; var tt = document.getElementById('toast'); if (tt) tt.remove();
          ui.modal = { type: 'order', id: r.order.id }; pullEvents(); render();
        });
      });
    },
    'ord-open': function (d) { ui.modal = { type: 'order', id: d.id }; render(); },
    'ord-refresh': function () { toast('A verificar os pedidos…'); S.shop.refresh().then(function (r) { render(); toast(r.changed ? 'Pedidos atualizados.' : 'Sem novidades.'); }); },
    'ord-cancel': function (d) { confirmBox('Cancelar pedido', 'Cancelar o pedido ' + d.id + '? Só deves cancelar se ainda não pagaste.', 'Cancelar pedido', function () { S.shop.cancel(d.id).then(function (r) { act(r); }); }, true); },
    'ord-copy': function (d) {
      var o = E.state.shop.orders.filter(function (x) { return x.id === d.id; })[0];
      var txt = (o && o.msg) || ('Pedido ' + d.id);
      try { navigator.clipboard.writeText(txt).then(function () { toast('Mensagem copiada.'); }, function () { toast(txt); }); } catch (e) { toast(txt); }
    },
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
    'talk-next': function () {
      var ev = ui.popups[0];
      if (!ev || ev.type !== 'talk' || !ev.res || !ev.res.more) return;
      if (!S.talk.next(E.state, ev.conv)) { ui.popups.shift(); render(); return; }
      ev.res = null; ev._id = ++ui.popSeq;
      render();
    },
    'first-next': function () {
      var ev = ui.popups[0];
      if (!ev || ev.type !== 'first') return;
      if (ev.i >= ev.script.length - 1) {
        ui.popups.shift();
        if (ev.finale) { var fr = E.finaleSeen(); if (fr && fr.first) { ui.tab = 'combate'; ui.page = null; ui.gate = 0; sfx('arena_open'); FX.flash('#ffffff', .35); } pullEvents(); }
        render(); return;
      }
      var cur = ev.script[ev.i];
      ev.log.push({ s: cur.s, who: cur.who }); ev.i++;
      render(); firstType();
      var nx = ev.script[ev.i];
      if (ev.finale && nx && FX.full()) {
        if (nx.who === 'cut') { var bx = document.getElementById('sys-box'); if (bx) bx.classList.add('glitching'); FX.shake(2); FX.flash('#ffffff', .5); sfx('dark'); FX.vibrate([60, 40, 120]); }
        else if (nx.name) { FX.flash('#ffffff', .4); sfx('awaken'); }
        else if (nx.who === 'arq' && cur.who !== 'arq') sfx('holy');
      }
    },
    'first-pick': function (d) {
      var ev = ui.popups[0];
      if (!ev || ev.type !== 'first') return;
      var st = ev.script[ev.i], o = st.opts[+d.i];
      if (ev.finale) { if (E.state.finale) E.state.finale.answer = o.tag; }
      else E.state.firstTalk = { q: st.ask, a: o.t, tag: o.tag };
      S.storage.write(E.state);
      ev.log.push({ s: st.ask, who: st.who }); ev.log.push({ me: o.t });
      ev.script.splice(ev.i + 1, 0, { s: o.r, who: st.who }); ev.i++;
      render(); firstType();
      if (o.tag === 'd' && FX.full()) { var b = document.getElementById('sys-box'); if (b) b.classList.add('glitching'); FX.shake(1); }
    },
    'finale-replay': function () { if (E.state && E.state.finale && E.state.finale.seen) { ui.popups.push(finalePop()); render(); firstType(); } },
    'first-skip': function () {
      var ev = ui.popups[0];
      if (!ev || ev.type !== 'first') return;
      if (ev.finale) ev.script.forEach(function (x) { if (x.name) ev.named = true; });
      ev.log = []; ev.i = ev.script.length - 1; ev.typed = -1;
      render(); firstType();
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
      if (!f.id) sfx('create');
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
        sfx('quest');
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
      confirmBox('Missão de Emergência', '«' + em.text + '»\n\nCumpriste mesmo?', 'Sim, cumpri', function () { var r = act(S.live.completeEmergency()); if (r && r.ok) sfx('quest'); });
    },
    'h-done': function () {
      var hq = S.live.hiddenActive(E.state);
      if (!hq) return;
      confirmBox('Missão Oculta', '«' + hq.def.task + '»\n\nCumpriste mesmo? O Sistema vai saber se mentires.', 'Sim, cumpri', function () { var r = act(S.live.completeHidden()); if (r && r.ok) sfx('quest'); });
    },
    'z-step': function (d) {
      var z = S.live.zone(E.state); if (!z) return;
      act(S.live.setZoneValue(d.id, Math.max(0, (z.values[d.id] || 0) + (+d.d))));
    },
    'z-complete': function () { var r = act(S.live.completeZone()); if (r && r.ok) sfx('quest'); },
    'd-step': function (d) {
      var v = (M.dailyValues(E.state)[d.id] || 0) + (+d.d);
      act(M.setDailyValue(d.id, Math.max(0, v)));
    },
    'd-complete': function () {
      ui.fxDaily = true;
      if (FX.full()) ui.holdUntil = Date.now() + 900;
      var res = act(M.completeDaily());
      if (!res.ok) return;
      sfx('daily');
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
    gate: function (d) { ui.gate = d.g === 'arena' ? 'arena' : +d.g; render(); },
    boss: function (d) { ui.modal = { type: 'boss', id: d.id }; render(); talkTry('boss', { boss: S.BOSS_BY_ID[d.id] }, 1100); },
    fight: function (d) {
      ui.modal = null; ui.tab = 'combate'; ui.page = null;
      var b = S.BOSS_BY_ID[d.id];
      var g = S.GATES[b.gate - 1];
      ui.spawn = true;
      var r = act(C.start(d.id));
      window.scrollTo(0, 0);
      if (r && r.ok !== false) FX.portal(g ? g.color : '#ffc85a', b.name, 'NÍVEL ' + b.level + (b.king ? ' · REI DO PORTÃO' : ''));
    },
    'sh-spar': function (d) {
      var st = E.state;
      if (st.battle && !st.battle.over) return toast('Já estás numa batalha.', true);
      if (st.battle) C.close();
      ui.modal = null; ui.tab = 'combate'; ui.page = null; ui.spawn = true;
      var b = S.BOSS_BY_ID[d.id], r = act(S.shadows.spar(d.id));
      window.scrollTo(0, 0);
      if (r && r.ok !== false) { sfx('arise'); FX.portal('#8b6bff', S.shadows.name(st, d.id), 'TREINO · NÍVEL ' + b.level); }
    },
    'b-attack': function () { battleAct('attack'); },
    'b-defend': function () { sfx('block'); battleAct('defend'); },
    'b-pass': function () { battleAct('pass'); },
    'b-sheet': function (d) { ui.modal = { type: 'bsheet', v: d.v }; render(); },
    'b-skill': function (d) { ui.modal = null; battleAct('skill', d.id); },
    'b-item': function (d) { ui.modal = null; battleAct('item', d.id); },
    'b-flee': function () {
      var lost = Math.round(E.state.coins * 0.05);
      confirmBox('Fugir', 'Se fugires perdes ' + lost + ' moedas (usa Pó de Fumo para fugir sem perdas). O chefe continua vivo.', 'Fugir', function () { sfx('death'); battleAct('flee'); FX.text('FUGA', window.innerWidth / 2, window.innerHeight / 2, '#8396ba'); }, true);
    },
    'b-close': function () { FX.battle(false); FX.flash('#6fd6ff', .25); ui.lastView = null; act(C.close()); },

    // loja
    'shop-tab': function (d) { ui.shopTab = d.v; ui.showLocked = false; render(); },
    'go-potions': function () { ui.tab = 'loja'; ui.shopTab = 'consumivel'; ui.page = null; render(); window.scrollTo(0, 0); },
    'shop-locked': function () { ui.showLocked = !ui.showLocked; render(); },
    buy: function (d) {
      var it = E.item(d.id), q = +d.q || 1;
      var p = { x: ui.pt.x, y: ui.pt.y };
      var go = function () {
        var r = E.buy(d.id, q);
        if (r.ok && it.cat === 'sistema') sysAfter(it);
        act(r, r.ok ? 'Compraste ' + (q > 1 ? q + '× ' : '') + it.name + '.' : null);
        if (r.ok && it.cat !== 'sistema') talkTry('buy', { item: it.name, rarity: it.rarity }, 1200);
        if (r.ok) sfx('buy');
        if (r.ok) { FX.text('-' + fmt(r.total) + ' ◈', p.x, p.y - 10, '#ffc85a'); FX.burst(p.x, p.y, rc(it.rarity), 24, { speed: 6 }); FX.vibrate(30); }
      };
      var before = it.cat === 'sistema' && E.state.coins >= E.price(E.state, d.id) * q ? E.sysVoice(E.state, d.id, 'before') : null;
      if (before) { sfx('click'); S.storage.write(E.state); return confirmBox('O SISTEMA OBSERVA', '«' + before + '»\n\nComprar ' + it.name + '?', 'Comprar', go); }
      go();
    },

    // bolsa
    bag: function (d) { ui.bag = d.v; render(); },
    item: function (d) { ui.modal = { type: 'item', id: d.id }; render(); },
    use: function (d) {
      var it = E.item(d.id);
      if (it && it.use && it.use.type === 'rename') { ui.modal = { type: 'rename' }; render(); setTimeout(function () { var e = document.getElementById('rn-name'); if (e) e.focus(); }, 60); return; }
      if (!drinkable(it)) sfx('click');
      var go = function () {
        var p = { x: ui.pt.x, y: ui.pt.y };
        var r = E.useItem(d.id);
        if (drinkable(it)) sfx(r.ok ? drinkSound(it) : 'click');
        if (r.ok && E.count(E.state, d.id) < 1) ui.modal = null;
        act(r, r.ok && it.cat !== 'bau' ? r.msg : null);
        if (!r.ok || it.cat === 'bau') return;
        var u = it.use || {};
        if (u.type === 'heal' || u.type === 'restore') { FX.rise(window.innerWidth / 2, window.innerHeight * .7, 220, '#5be08a', 50); FX.text('+' + r.healed + ' VIDA', p.x, p.y - 20, '#5be08a'); }
        else if (u.type === 'perm' || u.type === 'permAll' || u.type === 'point' || u.type === 'core') { FX.rise(window.innerWidth / 2, window.innerHeight, 240, '#ffc85a', 70); FX.flash('#ffc85a', .3); FX.banner('PODER AUMENTOU', r.msg, 'rgba(255,200,90,.4)', '#ffc85a'); }
        else if (u.type === 'timed') { FX.rise(window.innerWidth / 2, window.innerHeight, 240, '#6fd6ff', 50); FX.text(r.msg, p.x, p.y - 20, '#6fd6ff'); }
        else if (u.type === 'system') {
          FX.flash('#6fd6ff', .25); FX.burst(window.innerWidth / 2, window.innerHeight / 2, '#6fd6ff', 50, { speed: 8 });
          if (r.talk) { ui.modal = null; ui.popups.push({ _id: ++ui.popSeq, type: 'talk', conv: r.talk }); render(); }
        }
        else if (u.type === 'unlockSkill' || u.type === 'revealBoss' || u.type === 'fragment') { FX.flash('#e0e6ff', .5); FX.burst(window.innerWidth / 2, window.innerHeight / 2, '#e0e6ff', 80, { speed: 11 }); }
        else FX.burst(p.x, p.y, rc(it.rarity), 30, { speed: 6 });
      };
      go();
    },
    equip: function (d) {
      var it = E.item(d.id);
      var r = E.equip(d.id, d.s); if (r.ok) ui.modal = null; sfx(r.ok ? 'equip' : 'click'); act(r, r.ok ? 'Equipado.' : null);
      if (r.ok) { FX.rise(window.innerWidth / 2, window.innerHeight * .6, 200, rc(it.rarity), 40); FX.flash(rc(it.rarity), .2); FX.vibrate(40); talkTry('equip', { item: it.name, rarity: it.rarity, slot: d.s === 'weapon' ? 'weapon' : d.s === 'armor' ? 'armor' : 'acc' }, 1200); }
    },
    unequip: function (d) { var r = E.unequip(d.s); if (r.ok) { ui.modal = null; sfx('unequip'); } else sfx('click'); act(r, r.ok ? 'Item guardado na bolsa.' : null); },
    sell: function (d) {
      var it = E.item(d.id), v = E.sellValue(E.state, d.id);
      confirmBox('Vender', 'Vender 1× ' + it.name + ' por ' + v + ' moedas?', 'Vender', function () {
        var r = E.sell(d.id, 1);
        if (r.ok) sfx('sell');
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
    'set-snd': function (d, el) { E.state.settings.sound = el.checked; E.commit('definições'); if (!el.checked && S.music) S.music.stop(0); render(); if (el.checked) sfx('click'); },
    'set-mus': function (d, el) { E.state.settings.music = el.checked; E.commit('definições'); if (!el.checked && S.music) S.music.stop(0); render(); },
    'set-vib': function (d, el) { E.state.settings.vibrate = el.checked; E.commit('definições'); },
    'set-fx': function (d) { E.state.settings.fx = d.v; E.commit('definições'); FX.setMode(d.v); render(); toast(d.v === 'full' ? 'Animações completas.' : 'Animações reduzidas.'); },
    reset: function () {
      ui.modal = { type: 'confirm', title: 'Recomeçar do zero', text: 'Todo o progresso deste aparelho será apagado: nível, itens, missões e chefes derrotados.', yes: 'Apagar tudo', bad: true, typed: 'APAGAR',
        fn: function () { E.resetAll(); ui.intro = { step: 0, name: '', cls: null }; ui.tab = 'status'; ui.page = null; ui.popups = []; ui.bars = {}; ui.lastCoins = null; ui.lastView = null; render(); } };
      render();
    }
  };

  /* sons: estes botões tocam o seu próprio som quando a ação resulta */
  var SFX_SELF = { 'b-defend': 1, buy: 1, use: 1, equip: 1, 'b-item': 1, 'duel-act': 1, 'duel-skill': 1, 'duel-item': 1, unequip: 1, 'b-attack': 1, 'b-skill': 1, 'arise-try': 1 };
  var SFX_BACK = { back: 1, close: 1, 'info-back': 1, 'tr-back': 1, 'pop-ok': 1, overlay: 1 };
  function sfx(n, g) { if (S.sfx) S.sfx.play(n, g); }
  /* poções e elixires que se bebem (bombas e fumo não) */
  /* som de uma poção: vida e mana soam a poção; bónus, elixires e tónicos soam a "beber" */
  function drinkSound(it) { var t = (it && it.use || {}).type; return t === 'heal' || t === 'restore' || t === 'mana' ? 'potion' : 'drink'; }
  /* som de uma habilidade pelo elemento ou pelo efeito */
  var SKILL_SND = {};
  function skillSound(sk) {
    if (!sk) return 'skill';
    if (SKILL_SND[sk.id]) return SKILL_SND[sk.id];
    var t = (sk.name + ' ' + (sk.desc || '')).toLowerCase(), ops = sk.ops || [], has = function (o) { return ops.some(function (x) { return x.op === o; }); };
    var dmg = has('dmg'), r = 'skill';
    if (has('heal') && !dmg) r = 'heal';
    else if (/fogo|chama|flamej|brasa|incênd|queimad|infern|magma|lava|fénix|ígne|solar|sol /.test(t) || ops.some(function (x) { return x.type === 'burn'; })) r = 'fire';
    else if (/trov|raio|relâmp|elétric|tempest|descarga|faísca/.test(t)) r = 'thunder';
    else if (/fúria|(^|\s)ira(\s|$)|frenesi|raiva|berserk|sanguinária/.test(t)) r = 'fury';
    else if (has('summon') || /invoca|convoca|servo|esqueleto|espírit|lacaio|ergue-se/.test(t)) r = 'summon';
    else if (/gelo|gélid|congel|neve|frio|inverno|glacia|cristal de gelo/.test(t) || ops.some(function (x) { return x.type === 'freeze'; })) r = 'ice';
    else if (/luz|sagrad|divin|celest|santo|bênç|radian|aurora|julgamento/.test(t)) r = 'holy';
    else if (/sombra|trevas|escurid|abismo|vazio|noite|eclipse|maldiç|necro|alma/.test(t)) r = 'dark';
    else if (/grito|rugido|estandarte|legião|exército|clone|guerra|comando|horda/.test(t)) r = 'warcry';
    else if (/vento|vendaval|furacão|tornado|rajada|ciclone|tufão|furtivo|fumo/.test(t) || ops.some(function (x) { return x.key === 'eva'; })) r = 'wind';
    else if (!dmg && (has('buff') || has('shield') || has('mp') || has('debuff'))) r = 'buff';
    SKILL_SND[sk.id] = r;
    return r;
  }
  function drinkable(it) { var t = (it.use || {}).type; return !!it && ((/^(po|el|elg)_/.test(it.id) && t !== 'bomb' && t !== 'smoke' && t !== 'chest') || it.id === 'pr_elixir'); }
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
    if (!SFX_SELF[a]) sfx(SFX_BACK[a] || (a === 'arena-view' && !+el.getAttribute('data-n')) ? 'back' : 'click');
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
    if (el.id === 'photo-in' && el.files && el.files[0]) {
      toast('A preparar a foto…');
      SO.shrink(el.files[0], 160).then(function (url) { return SO.setPhoto(url); }).then(function (j) {
        if (!j.ok) return toast(j.msg || 'Não foi possível guardar a foto.', true);
        toast('Foto de perfil guardada. Os teus amigos já a veem.'); sfx('quest'); socLoad(true); render();
      }, function (e) { toast(e.message || 'Não foi possível usar essa imagem.', true); });
      el.value = '';
      return;
    }
    if (el.getAttribute('data-a') === 'd-input') {
      act(M.setDailyValue(el.dataset.id, +el.value || 0));
    }
    if (el.getAttribute('data-a') === 'set-vol') {
      E.state.settings.soundVol = Math.max(0, Math.min(1, (+el.value || 0) / 100)); E.commit('definições'); sfx('buy');
    }
    if (el.getAttribute('data-a') === 'set-mvol') {
      E.state.settings.musicVol = Math.max(0, Math.min(1, (+el.value || 0) / 100)); E.commit('definições'); if (S.music) S.music.setVolume();
    }
    if (el.getAttribute('data-a') === 'z-input') {
      act(S.live.setZoneValue(el.dataset.id, +el.value || 0));
    }
  }
  function onKey(ev) {
    if (ev.key === 'Escape' && ui.modal) { H.close(); }
    if (ev.key === 'Enter' && ev.target && ev.target.id === 'in-name' && ui.intro.cls && ui.intro.gender) H['intro-go']();
    if (ev.key === 'Enter' && ev.target && ev.target.id === 'chat-text') { ev.preventDefault(); H['chat-send'](); }
    if (ev.key === 'Enter' && ev.target && ev.target.id === 'soc-q') { ev.preventDefault(); H['soc-find'](); }
    if (ev.key === 'Enter' && ev.target && ev.target.id === 'duel-code') { ev.preventDefault(); H['duel-join-code'](); }
  }

  /* ---------- social: atualização automática ---------- */
  var socBusy = false, chatBusy = false, duelBusy = false;
  function socLoad(force) {
    if (!E.state || !SO.ready() || socBusy) return;
    if (!force && Date.now() - SO.cacheAt < 8000) return;
    socBusy = true;
    SO.state().then(function (j) {
      socBusy = false;
      if (!j.ok) { if (!SO.cache || !SO.cache.ok) { SO.cache = j; if (ui.page === 'social') render(); } return; }
      var news = (j.news || []).filter(function (n) { return !(n.type === 'message' && ui.page === 'chat' && ui.chatWith === n.id); });
      if (news.length) {
        var n = news[0];
        toast(n.type === 'request' ? n.name + ' quer ser teu amigo.' : n.type === 'invite' ? n.name + ' desafiou-te para um duelo!' : n.type === 'accepted' ? n.name + ' aceitou o teu pedido de amizade.' : 'Mensagem nova de ' + n.name + '.');
        sfx(n.type === 'message' ? 'message' : (n.type === 'request' || n.type === 'accepted') ? 'friend' : 'notify'); if (n.type === 'invite') FX.vibrate([60, 40, 60]);
      }
      if (ui.page === 'social' || ui.page === 'chat' || news.length || ui.tab === 'status') softRender();
      // fotos dos amigos (só as que mudaram)
      SO.loadPics((j.friends || []).concat(j.me ? [Object.assign({}, j.me, { id: E.state.playerId })] : [])).then(function (n) { if (n && (ui.page === 'social' || ui.page === 'chat')) softRender(); });
    }, function () { socBusy = false; });
  }
  function chatScroll() { var l = document.getElementById('chat-list'); if (l) l.scrollTop = l.scrollHeight; }
  function chatLoad(first) {
    if (!ui.chatWith || chatBusy) return;
    chatBusy = true;
    var fid = ui.chatWith, real = (ui.chatMsgs || []).filter(function (m) { return typeof m.id === 'number'; }), after = first ? 0 : (real.length ? real[real.length - 1].id : 0);
    SO.history(fid, after).then(function (j) {
      chatBusy = false; ui.chatLoading = false;
      if (ui.chatWith !== fid) return;
      if (!j.ok) { toast(j.msg, true); render(); return; }
      if (j.friend) ui.chatFriend = j.friend;
      var have = {}; (ui.chatMsgs || []).forEach(function (m) { have[m.id] = 1; });
      var add = j.messages.filter(function (m) { return !have[m.id]; });
      if (first) { ui.chatMsgs = j.messages.concat((ui.chatMsgs || []).filter(function (m) { return m.pending; })); render(); chatScroll(); return; }
      if (add.length) {
        var list = document.getElementById('chat-list'), atEnd = list && list.scrollHeight - list.scrollTop - list.clientHeight < 60;
        ui.chatMsgs = ui.chatMsgs.concat(add);
        if (add.some(function (m) { return m.from !== E.state.playerId; })) sfx('message');
        softRender(); if (atEnd) chatScroll();
      }
    }, function () { chatBusy = false; });
  }
  function duelStart(p, msg) {
    p.then(function (j) {
      if (!j.ok) { toast(j.msg, true); socLoad(true); return; }
      if (msg) toast(msg);
      ui.page = 'duel'; ui.tab = 'status'; ui.duelId = j.duel.id; ui.duel = null; duelShow(j.duel); window.scrollTo(0, 0); socLoad(true);
    });
  }
  function duelMove(action, extra) {
    if (!ui.duel || ui.duelBusy) return;
    ui.duelBusy = true;
    document.querySelectorAll('.duel-battle .actions .btn').forEach(function (b) { b.disabled = true; });
    if (action === 'defend') sfx('block'); else if (action === 'pass') sfx('click');
    SO.act(ui.duel.id, action, ui.duel.version, extra).then(function (j) {
      if (!j.ok) { ui.duelBusy = false; toast(j.msg, true); render(); return; }
      duelShow(j.duel, true);
    });
  }
  function duelShow(d, mine) {
    var prev = ui.duel;
    ui.duel = d; ui.duelId = d.id;
    var me = d.me, last = prev && prev.log && prev.log.length ? prev.log[prev.log.length - 1].n : 0;
    var fresh = prev ? (d.log || []).filter(function (l) { return l.n > last; }) : [];
    if (prev && prev.status === 'waiting' && d.status === 'active') { if (S.music && S.music.has('duel')) S.music.play('duel', { loop: false }); else sfx('emergency'); FX.flash('#ff2a48', .35); FX.vibrate([120, 60, 120]); FX.portal('#ff3d5a', 'DUELO', 'CONTRA ' + ((d.fighters[d.host === me ? d.guest : d.host] || {}).name || '').toUpperCase()); }
    render(); pullEvents();
    var dur = duelFx(fresh, d);
    var endFx = function () {
      ui.duelBusy = false;
      if (prev && prev.status === 'active' && d.status === 'done') {
        var won = d.winner === me;
        sfx(won ? 'levelup' : 'death'); FX.flash(won ? '#ffc85a' : '#ff1f3d', .5); FX.vibrate(won ? [80, 40, 200] : [300, 80, 300]);
        if (won && S.premium.effectOf(E.state)) setTimeout(function () { FX.celebrate(S.premium.effectOf(E.state)); }, 300);
      } else if (d.status === 'active' && d.turn === me && (!prev || prev.turn !== me)) { sfx('turn'); FX.vibrate(50); }
      var a = document.querySelector('.duel-battle .actions'); if (a && !(d.status === 'active' && d.turn !== me)) a.classList.remove('busy');
      render();
    };
    if (dur) { if (mine) ui.duelBusy = true; setTimeout(endFx, Math.min(dur, 2500)); } else endFx();
  }
  function duelPoll() {
    if (ui.page !== 'duel' || !ui.duelId || duelBusy || ui.duelBusy) return;
    duelBusy = true;
    SO.duel(ui.duelId).then(function (j) {
      duelBusy = false;
      if (!j.ok) { toast(j.msg, true); return; }
      var lastE = function (x) { var a = (x && x.emotes) || []; return a.length ? a[a.length - 1].n : 0; };
      if (!ui.duel || j.duel.version !== ui.duel.version || j.duel.status !== ui.duel.status) duelShow(j.duel);
      else if (lastE(j.duel) !== lastE(ui.duel)) { var ne = (j.duel.emotes || []).slice(-1)[0]; ui.duel.emotes = j.duel.emotes; if (ne && ne.w !== ui.duel.me) sfx('click'); softRender(); setTimeout(softRender, 9500); }
    }, function () { duelBusy = false; });
  }
  /* redesenha sem animação de entrada, mantendo a posição da página */
  function softRender() { if (ui.modal || ui.popups.length) return; var y = window.scrollY; render(); window.scrollTo(0, y); }
  function copyText(t, msg) {
    try { if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast(msg); }, function () { toast(t); }); else toast(t); } catch (e) { toast(t); }
  }
  var socTicks = 0;
  function socTick() {
    if (!E.state || document.visibilityState === 'hidden' || !SO.ready()) return;
    socTicks++;
    if (ui.page === 'duel') {
      if (ui.duel && ui.duel.status !== 'done' && ui.duel.status !== 'cancelled' && socTicks % 2 === 0) duelPoll();
      document.querySelectorAll('.duel-timer').forEach(function (el) { var s = Math.max(0, Math.ceil((+el.getAttribute('data-until') - SO.serverNow()) / 1000)); el.textContent = s + 's'; el.classList.toggle('urgent', s <= 10); });
    }
    if (ui.page === 'chat' && socTicks % 3 === 0) chatLoad(false);
    if (ui.page === 'social' && socTicks % 8 === 0) socLoad(true);
    else if (socTicks % 45 === 0) socLoad(true); // de fundo: pedidos, convites e mensagens novas
  }

  /* ---------------- relógio ---------------- */
  var lastDay = null;
  function tick() {
    if (FX.scrolling && FX.scrolling()) return; // não mexe na página enquanto se rola
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
    var IDS = 'sistema.notif.ids', CHANNEL = 'sistema_v2', lastSig = null, ready = null; // v2: canal com o som do Sistema (res/raw/sistema_aviso.mp3)
    function plugin() {
      try { var C = globalThis.Capacitor; if (C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.LocalNotifications) return C.Plugins.LocalNotifications; } catch (e) { /* web */ }
      return null;
    }
    function idFor(key) { var h = 7; for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 2147483000; return h + 1; }
    function stored() { try { return JSON.parse(localStorage.getItem(IDS) || '[]'); } catch (e) { return []; } }
    function enabled(st) { return st && st.settings && st.settings.reminders !== false; }
    function note(id, n, at) {
      return { id: id, title: n.title, body: n.body, largeBody: n.body, schedule: { at: new Date(at), allowWhileIdle: true }, channelId: CHANNEL, sound: 'sistema_aviso.mp3',
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
      if (P.deleteChannel) P.deleteChannel({ id: 'sistema' }).catch(function () {}); // canal antigo, sem som próprio
      ready = (P.createChannel ? P.createChannel({ id: CHANNEL, sound: 'sistema_aviso.mp3', name: 'Avisos do Sistema', description: 'Prazos das missões, Missão Diária, emergências e Zona de Penalidade', importance: 4, visibility: 1, vibration: true, lights: true, lightColor: '#6FD6FF' }) : Promise.resolve()).catch(function () {});
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
  /* sincronização com o servidor: presentes do administrador e suspensões */
  function shopSync(force) {
    if (!E.state || !S.shop || !S.shop.ready()) return;
    if (S.gate && S.gate.screen()) return;
    S.shop.sync(force).then(function (r) { if (r && r.changed) { pullEvents(); render(); } });
  }
  /* Loja de Cristais: pacotes do servidor e estado dos pedidos */
  function loadShop(force) {
    if (!S.shop || !S.shop.ready()) return;
    ui.shopErr = null;
    S.shop.config(force).then(function (c) {
      if (!c.ok) ui.shopErr = c.msg;
      if (E.state && S.shop.pending(E.state).length) return S.shop.refresh();
    }).then(function () { if (ui.page === 'premium') render(); });
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
  /* duelo contra outro jogador: o Sistema nunca interrompe */
  function inDuel() { return ui.page === 'duel' || !!ui.duelId || !!(SO.cache && SO.cache.duel && SO.cache.duel.status === 'active'); }
  function talkTry(trigger, ctx, delay, opts) {
    if (!E.state || !S.talk || ui.talkWait || inDuel()) return false;
    if (ui.popups.some(function (p) { return p.type === 'talk' || p.type === 'watch'; })) return false;
    var conv = S.talk.offer(E.state, trigger, ctx, opts);
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
      (ui.modal && !/^(boss|info|item)$/.test(ui.modal.type)) || (E.state.battle && !E.state.battle.over) || document.visibilityState === 'hidden' || inDuel() ||
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
      if (i % 4 === 0 && full.charAt(i - 1) !== ' ') sfx('type');
      if (i < full.length) setTimeout(step, /[.,?!]/.test(full.charAt(i - 1)) ? 140 : 22);
      else { el.classList.remove('typing'); var c2 = document.getElementById('talk-ch'); if (c2) c2.classList.remove('wait'); }
    })();
  }
  function talkFromEvents(evs) {
    if (!E.state) return;
    if (E.state.finale && !E.state.finale.seen) return; // a conversa final tem a palavra
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
    // ícone do Cristal: se existir assets/ui/ui_crystal, substitui o losango desenhado em CSS
    if (S.UI_ART && S.UI_ART.ui_crystal) { var rs = document.documentElement; rs.style.setProperty('--crys-art', 'url("' + S.UI_ART.ui_crystal + '")'); rs.classList.add('has-crys-art'); }
    root = el;
    FX.init();
    root.addEventListener('click', onClick);
    Notify.setup();
    if (S.shop) S.shop.init().then(function () {
      // primeiro o aparelho: só depois a conta
      if (S.gate && S.shop.ready()) { var g0 = S.gate.screen(); if (g0 && g0.type === 'verify') S.gate.ui.busy = true; render(); gateCheck(true); }
      if (!E.state || !S.shop.ready()) return;
      shopSync(true);
      if (S.shop.pending(E.state).length) S.shop.refresh().then(function (r) { if (r.changed) render(); });
    });
    // sincroniza com o servidor de 10 em 10 minutos enquanto a app está aberta (presentes, suspensões)
    setInterval(function () { if (document.visibilityState === 'visible') { shopSync(false); gateCheck(false); } }, 600000);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
    E.load();
    FX.setMode((E.state && E.state.settings.fx) || FX.defaultMode());
    if (E.state) {
      lastDay = E.dateKey(); M.processDeadlines(); greet(); pullEvents(); Notify.sync(true);
      if (E.state.leisureRefund) { var lr = E.state.leisureRefund; delete E.state.leisureRefund; E.commit('loja de lazer'); ui.popups.push({ _id: ++ui.popSeq, type: 'info', title: 'LOJA DE LAZER ENCERRADA', name: '+' + fmt(lr.coins) + ' moedas', lines: ['O Sistema fechou a Loja de lazer.', 'As ' + lr.n + ' recompensa(s) que tinhas na Bolsa foram devolvidas em moedas, pelo preço base.'] }); }
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
    setInterval(socTick, 1000);
    setTimeout(function () { socLoad(true); }, 6000);
    setInterval(checkDeadlines, 30000);
    // conversas aleatórias: só enquanto o jogador está a usar a app (tocou em algo nos últimos 2 minutos)
    ui.bootAt = Date.now();
    // conversas espontâneas: o Sistema aparece a cada 15 minutos de uso (só com a app aberta e em uso; nunca num duelo nem numa batalha)
    ['touchstart', 'pointerdown', 'scroll', 'keydown'].forEach(function (n) { document.addEventListener(n, function () { ui.lastAct = Date.now(); }, { passive: true, capture: true }); });
    setInterval(function () {
      if (!E.state || document.visibilityState === 'hidden') return;
      if (Date.now() - (ui.lastAct || 0) > 3 * 60000) return; // aberta mas parada: não conta como uso
      ui.useMs = (ui.useMs || 0) + 30000;
      if (ui.useMs < S.TALK_RULES.spontMin * 60000 || inDuel() || (E.state.battle && !E.state.battle.over)) return;
      if (talkTry('idle', {}, 700, { spont: true })) ui.useMs = 0;
    }, 30000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        checkDeadlines(); if (E.state) { greet(); pullEvents(); }
        gateCheck(false);
        shopSync(false);
        // voltou do WhatsApp: vê se o pedido já foi pago
        if (E.state && S.shop && S.shop.ready() && S.shop.pending(E.state).length) S.shop.refresh().then(function (r) { if (r.changed) render(); });
      }
      else if (E.state) { S.storage.write(E.state); Notify.sync(true); }
    });
    window.addEventListener('pagehide', function () { if (E.state) S.storage.write(E.state); });
    // botão "voltar" do Android fecha janelas em vez de sair da app
    try {
      var App = globalThis.Capacitor && globalThis.Capacitor.Plugins && globalThis.Capacitor.Plugins.App;
      if (App && App.addListener) App.addListener('backButton', function () {
        if (ui.popups.length) { if (ui.popups[0].type === 'talk' && !ui.popups[0].res) H['talk-skip'](); else if (ui.popups[0].type === 'first') H['first-skip'](); else { ui.popups.shift(); render(); } }
        else if (ui.modal) H.close();
        else if (ui.page) H.back();
        else if (ui.tab !== 'status') H.tab({ t: 'status' });
        else if (App.minimizeApp) App.minimizeApp();
      });
    } catch (e) { /* sem plugin */ }
  };
})(globalThis.SYS = globalThis.SYS || {});
