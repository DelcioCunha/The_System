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
    intro: { step: 0, name: '', cls: null }, histLimit: 40,
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
    E.takeEvents().forEach(function (ev) { ev._id = ++ui.popSeq; ui.popups.push(ev); });
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
  function introHtml() {
    var I = ui.intro;
    if (I.step === 0) {
      return '<div class="intro"><div class="win boot"><div class="win-h">Notificação <small>v' + S.VERSION + '</small></div>' +
        '<div class="type" id="typer"></div></div>' +
        '<div class="row"><button class="btn pri block" data-a="intro-yes">Aceitar</button></div>' +
        '<p class="hint" style="text-align:center">O teu progresso fica guardado neste aparelho e é gravado automaticamente a cada ação.</p>' +
        '<p class="made-by">Criado por <b>' + esc(S.CREDITS.creator) + '</b></p></div>';
    }
    var cards = S.CLASS_ORDER.map(function (id) {
      var c = S.CLASSES[id];
      var bars = S.STATS.map(function (k) { return '<div>' + S.STAT_INFO[k].short + '<span><i style="width:' + (c.base[k] / 15 * 100).toFixed(0) + '%"></i></span></div>'; }).join('');
      var art = S.CLASS_ART[id];
      return '<button class="class-card' + (I.cls === id ? ' on' : '') + '" data-a="intro-cls" data-v="' + id + '">' +
        (art ? '<div class="art"><img src="' + art + '" alt="' + c.name + '" loading="lazy"></div>' : '') +
        '<div class="row"><span style="font-size:22px">' + c.icon + '</span><span class="nm" style="color:' + c.color + '">' + c.name + '</span></div>' +
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
      '<span class="phase-chip" title="' + S.time.PHASES[S.time.current()].name + '">' + S.time.PHASES[S.time.current()].icon + '</span>' +
      '<span class="save-dot' + (S.storage.lastError ? ' err' : '') + '" title="' + (S.storage.lastError ? 'Erro ao gravar' : 'Progresso gravado') + '"></span>' +
      '<span id="top-coins">' + coins(st.coins) + '</span></div>' +
      '<div class="top-xp" data-k="top-xp" data-p="' + pct.toFixed(2) + '"><i style="width:' + pct.toFixed(1) + '%"></i></div></header>';
  }
  function navHtml(st) {
    var pendingMissions = M.forDay(st, E.dateKey()).filter(function (x) { return x.status === 'pending'; }).length + (M.dailyStatus(st) === 'pending' ? 1 : 0);
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
    var cls = S.CLASSES[st.cls];
    var cs = E.combatStats(st);
    var t = E.totalStats(st);
    var need = S.xpToNext(st.level);
    var r = S.rankFor(st.level);
    var h = '';
    h += '<section class="win"><div class="win-h">Estado <small>Dia ' + S.time.systemDay(st) + ' do Sistema · Poder ' + fmt(cs.power) + '</small></div>' +
      '<div class="hero" style="--aura:' + r.color + '">' + S.avatar.html(st.cls, st.level) +
      '<div class="stack" style="gap:8px;min-width:0">' +
      '<div><div class="hero-name">' + esc(st.name) + '</div><div class="hero-title shine">' + esc(S.titleFor(st.level)) + '</div></div>' +
      '<div class="row" style="align-items:flex-end"><div><div class="lv-lab">Nível</div><div class="lv-big">' + st.level + '</div></div>' +
      '<div class="grow" style="padding-bottom:4px"><div class="lv-lab">Classe</div><div style="color:' + cls.color + ';font-family:var(--f-display);font-weight:700">' + cls.icon + ' ' + cls.name + '</div>' +
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
        return '<div class="stat"><span class="stat-k">' + info.short + '</span>' +
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
      '<button class="btn credits-btn" data-a="page" data-p="credits">Créditos</button>' +
      '</div></section>';
    return h;
  }
  function effectsHtml(st) {
    E.cleanEffects(st);
    if (!st.effects.length) return '';
    return '<div class="row wrap" style="margin-top:10px">' + st.effects.map(function (e) {
      var d = S.TIMED_EFFECTS[e.id];
      return '<span class="tag" style="border-color:' + (d.good ? 'var(--good)' : 'var(--danger)') + '">' + d.icon + ' ' + d.name + ' · ' + cd(e.until) + '</span>';
    }).join('') + '</div>';
  }
  function phaseTag(it) {
    if (!it || !it.phase) return '';
    var on = S.time.itemActive(it), ph = S.time.PHASES[it.phase];
    return '<span class="tag phase ' + (on ? 'on' : 'off') + '" title="' + ph.desc + '">' + ph.icon + ' ' + (on ? 'Ativo agora' : 'Só ' + ph.desc) + '</span>';
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
      return '<div class="card' + (done ? '' : ' done') + '"><div class="card-h"><div class="ico">' + (hidden ? '❔' : a.icon) + '</div><div class="grow">' +
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
        if (!st.seen[k]) return '<div class="card done"><div class="card-h"><div class="ico">❔</div><div class="grow"><div class="card-t">???</div><div class="small muted">Ainda não encontrado.</div></div></div></div>';
        return '<button class="card tap" data-a="info" data-k="item" data-id="' + k + '"><div class="card-h">' + itemIco(it) + '<div class="grow"><div class="card-t" style="color:' + rc(it.rarity) + '">' + esc(it.name) + '</div><div class="small muted">' + esc(it.desc) + '</div></div></div></button>';
      }).join('') + '</div></section>';
    var killed = S.BOSSES.filter(function (b) { return st.defeated[b.id]; }).length;
    h += '<section class="win"><div class="win-h">Chefes derrotados <small>' + killed + '/100</small></div>' +
      '<div class="chips" style="flex-wrap:wrap">' + S.GATES.map(function (g) {
        var k = S.BOSSES.filter(function (b) { return b.gate === g.id && st.defeated[b.id]; }).length;
        return '<span class="tag">' + g.icon + ' ' + esc(g.name) + ' ' + k + '/10</span>';
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
          if (!got) return '<div class="trophy locked" aria-label="Troféu bloqueado"><span class="tr-seal"></span><span class="tr-lock">🔒</span></div>';
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
      return '<div class="row" style="align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:8px"><span style="width:24px;text-align:center">' + x.icon + '</span>' +
        '<div class="grow"><div class="small">' + esc(x.text) + '</div><div class="hint mono">' + timeStr(x.t) + '</div></div></div>';
    }).join('') : '<div class="empty">Ainda sem registos.</div>') + '</div>' +
      (st.history.length > ui.histLimit ? '<button class="btn block ghost" style="margin-top:10px" data-a="hist-more">Ver mais</button>' : '') + '</section>';
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
    h += '<section class="win"><div class="win-h">Backup</div><div class="stack">' +
      '<p class="small muted" style="margin:0">Copia este código e guarda-o num lugar seguro. Serve para recuperar o progresso noutro telemóvel.</p>' +
      '<textarea class="in mono" id="exp-code" readonly rows="3" style="font-size:11px">' + esc(S.storage.exportCode(st)) + '</textarea>' +
      '<button class="btn" data-a="exp-copy">Copiar código</button>' +
      '<label class="f">Restaurar a partir de um código<textarea class="in mono" id="imp-code" rows="3" style="font-size:11px" placeholder="Cola aqui o código de backup"></textarea></label>' +
      '<button class="btn gold" data-a="imp">Restaurar</button></div></section>';
    h += '<section class="win"><div class="win-h">Preferências</div>' +
      '<label class="row between"><span>Vibrar ao subir de nível e em vitórias</span><input type="checkbox" id="set-vib" data-a="set-vib"' + (st.settings.vibrate ? ' checked' : '') + '></label>' +
      '<div class="f" style="margin-top:12px"><span class="small muted">Animações</span><div class="seg">' +
      [['full', 'Completas'], ['reduced', 'Reduzidas']].map(function (o) { return '<button class="' + ((st.settings.fx || FX.defaultMode()) === o[0] ? 'on' : '') + '" data-a="set-fx" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') +
      '</div><div class="hint">Reduzidas: sem partículas, sem tremer o ecrã e transições mais curtas. Útil em telemóveis mais lentos.</div></div></section>';
    h += '<section class="win danger"><div class="win-h">Zona perigosa</div><p class="small muted" style="margin-top:0">Apaga todo o progresso deste aparelho. Não há volta.</p>' +
      '<button class="btn bad block" data-a="reset">Recomeçar do zero</button></section>';
    h += '<p class="hint" style="text-align:center;margin-top:16px">Sistema v' + S.VERSION + '</p>';
    return h;
  }

  /* ================= MISSÕES ================= */
  function missionsHtml(st) {
    var t = E.dateKey();
    var h = '';
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
    h += '<section class="win"><div class="win-h">Missões de hoje <small>' + today.filter(function (x) { return x.status === 'done'; }).length + '/' + today.length + ' feitas</small></div>' +
      '<button class="btn pri block" data-a="m-new" style="margin-bottom:12px">+ Nova missão</button>' +
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
  function diffBadge(d) { var D = S.DIFFICULTY[d]; return '<span class="diff" style="color:' + D.color + '" title="' + D.name + '">' + D.id + '</span>'; }
  function missionCard(st, x) {
    var m = x.m, r = M.rewardFor(st, m.difficulty);
    var stats = m.stats.map(function (k) { return '<span class="tag">' + S.STAT_INFO[k].short + ' +' + r.stat + '</span>'; }).join('');
    var right = '';
    if (x.status === 'pending') right = '<button class="btn sm pri" data-a="m-complete" data-id="' + m.id + '">Concluir</button>';
    else if (x.status === 'done') right = '<span class="stamp ok' + (ui.fxMission === m.id ? ' slam' : '') + '">Feita</span>';
    else right = '<span class="stamp no">Falhada</span>';
    var fl = ui.fxMission === m.id;
    return '<div class="card ' + (x.status === 'done' ? 'done' : (x.status === 'pending' ? '' : 'failed')) + (fl ? ' flash' : '') + '" data-mid="' + m.id + '"><div class="card-h">' + diffBadge(m.difficulty) +
      '<div class="grow"><div class="card-t">' + esc(m.title) + '</div>' + (m.desc ? '<div class="small muted" style="overflow-wrap:anywhere">' + esc(m.desc) + '</div>' : '') + '</div>' + right + '</div>' +
      '<div class="meta"><span>até ' + m.deadline + '</span>' + (x.status === 'pending' ? cd(x.deadline) : '') +
      (x.status === 'pending' ? '<span class="reward">+' + r.xp + ' XP · +' + r.coins + '◈</span>' : '') + stats +
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
          '<span class="bt-lv mono">' + b.level + '</span>' + (b.king ? '<span class="bt-crown">♛</span>' : '') +
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
      (S.time.bossEmpowered(b) ? '<p class="small" style="color:var(--warn)">' + (S.time.bossEmpowered(b) === 'noite' ? '🌙 À noite' : '☀️ De dia') + ' este chefe fica +15% mais forte, mas dá +20% de recompensas.</p>' : (S.time.BOSS_PHASES[b.gate] ? '<p class="hint">' + (S.time.BOSS_PHASES[b.gate] === 'noite' ? '🌙 À noite' : '☀️ De dia') + ' este portão fica mais forte e dá mais recompensas.</p>' : '')) +
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
    h += '<div class="log" id="blog" aria-live="polite">' + bt.log.map(function (l) { return '<div class="' + l.c + '">' + esc(l.t) + '</div>'; }).join('') + '</div>';
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
        return '<span class="req ' + (l.ok ? 'ok' : 'no') + '">' + (l.ok ? '✓ ' : '🔒 ') + esc(l.text) + '</span>';
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
        return '<button class="' + (f.icon === i ? 'on' : '') + '" data-a="f-set" data-k="icon" data-v="' + i + '">' + i + '</button>';
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
      body = '<div class="medal">' + ev.icon + '</div><h2>' + esc(ev.title) + '</h2><div class="small muted">' + esc(ev.desc) + '</div><ul class="sys-lines">' + lines + '</ul>';
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
    if (st.battle && ui.tab !== 'combate') body += '<button class="btn bad block" style="margin-top:12px" data-a="tab" data-t="combate">⚔ Batalha em curso: voltar</button>';
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
      if (FX.full()) {
        FX.awaken(S.CLASSES[E.state.cls].color);
        ui.holdUntil = Date.now() + 2300;
        setTimeout(function () { ui.lastView = null; render(); }, 1650);
      }
      render();
    },
    tab: function (d) { ui.tab = d.t; ui.page = null; ui.modal = null; render(); window.scrollTo(0, 0); },
    page: function (d) { ui.page = d.p; ui.histLimit = 40; render(); window.scrollTo(0, 0); },
    back: function () { ui.page = null; render(); },
    'hist-more': function () { ui.histLimit += 60; render(); },
    alloc: function (d) {
      var p = { x: ui.pt.x, y: ui.pt.y };
      var r = act(E.allocate(d.s, 1));
      if (!r.ok) return;
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

    // missões
    'm-new': function () { openMissionForm(null); },
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
      if (!r.ok) return toast(r.msg, true);
      ui.modal = null; ui.form = null;
      act(r, f.id ? 'Missão atualizada.' : 'Missão criada.');
    },
    'm-delete': function () {
      var id = ui.form.id;
      confirmBox('Apagar missão', 'A missão deixa de aparecer. O histórico fica guardado.', 'Apagar', function () { ui.form = null; act(M.remove(id), 'Missão apagada.'); }, true);
    },
    'm-complete': function (d) {
      var m = M.byId(d.id);
      var r = M.rewardFor(E.state, m.difficulty);
      confirmBox('Concluir missão', '"' + m.title + '"\n\nConfirmas que cumpriste esta missão?\nRecebes +' + r.xp + ' XP e +' + r.coins + ' moedas.', 'Sim, cumpri', function () {
        ui.fxMission = d.id;
        if (FX.full()) ui.holdUntil = Date.now() + 900;
        var res = act(M.complete(d.id));
        if (!res.ok) return;
        var c = FX.center(root.querySelector('[data-mid="' + d.id + '"] .stamp'));
        FX.text('+' + res.xp + ' XP', c.x - 30, c.y - 10, '#6fd6ff');
        FX.text('+' + res.coins + ' ◈', c.x + 30, c.y - 10, '#ffc85a', 180);
        FX.burst(c.x, c.y, '#5be08a', 40, { speed: 7 });
        FX.vibrate(60);
      });
    },
    'd-step': function (d) {
      var v = (M.dailyValues(E.state)[d.id] || 0) + (+d.d);
      act(M.setDailyValue(d.id, Math.max(0, v)));
    },
    'd-complete': function () {
      ui.fxDaily = true;
      if (FX.full()) ui.holdUntil = Date.now() + 900;
      var res = act(M.completeDaily());
      if (!res.ok) return;
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
    boss: function (d) { ui.modal = { type: 'boss', id: d.id }; render(); },
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
      if (r.ok) { FX.rise(window.innerWidth / 2, window.innerHeight * .6, 200, rc(it.rarity), 40); FX.flash(rc(it.rarity), .2); FX.vibrate(40); }
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
    'exp-copy': function () {
      var ta = document.getElementById('exp-code');
      var txt = ta.value;
      var fallback = function () { ta.select(); try { document.execCommand('copy'); toast('Código copiado.'); } catch (e) { toast('Seleciona o texto e copia manualmente.', true); } };
      try { navigator.clipboard.writeText(txt).then(function () { toast('Código copiado.'); }, fallback); } catch (e) { fallback(); }
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
  }
  function onKey(ev) {
    if (ev.key === 'Escape' && ui.modal) { H.close(); }
    if (ev.key === 'Enter' && ev.target && ev.target.id === 'in-name' && ui.intro.cls) H['intro-go']();
  }

  /* ---------------- relógio ---------------- */
  var lastDay = null;
  function tick() {
    document.querySelectorAll('[data-cd]').forEach(function (el) {
      var ts = +el.getAttribute('data-cd');
      el.textContent = cdText(ts);
      el.classList.toggle('urgent', ts - now() < 3600000);
    });
  }
  var lastPhase = null;
  function checkDeadlines() {
    if (!E.state) return;
    var ph = S.time.current();
    if (lastPhase && ph !== lastPhase) {
      var P = S.time.PHASES[ph];
      toast(P.icon + ' ' + P.name + ' (' + P.desc + '). Alguns itens mudaram de estado.');
      FX.banner(P.name.toUpperCase(), P.desc, ph === 'dia' || ph === 'manha' ? 'rgba(255,200,90,.4)' : 'rgba(120,100,255,.4)', ph === 'dia' || ph === 'manha' ? '#ffc85a' : '#a184ff');
      lastPhase = ph; render();
    }
    lastPhase = ph;
    var day = E.dateKey();
    var before = JSON.stringify(E.state.missionLog).length;
    var fails = M.processDeadlines();
    pullEvents();
    var typing = document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if ((fails || day !== lastDay || JSON.stringify(E.state.missionLog).length !== before) && !(typing && ui.modal)) render();
    lastDay = day;
  }

  S.boot = function (el) {
    root = el;
    FX.init();
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
    E.load();
    FX.setMode((E.state && E.state.settings.fx) || FX.defaultMode());
    if (E.state) { lastDay = E.dateKey(); M.processDeadlines(); pullEvents(); }
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
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') checkDeadlines();
      else if (E.state) S.storage.write(E.state);
    });
    window.addEventListener('pagehide', function () { if (E.state) S.storage.write(E.state); });
    // botão "voltar" do Android fecha janelas em vez de sair da app
    try {
      var App = globalThis.Capacitor && globalThis.Capacitor.Plugins && globalThis.Capacitor.Plugins.App;
      if (App && App.addListener) App.addListener('backButton', function () {
        if (ui.popups.length) { ui.popups.shift(); render(); }
        else if (ui.modal) H.close();
        else if (ui.page) H.back();
        else if (ui.tab !== 'status') H.tab({ t: 'status' });
        else if (App.minimizeApp) App.minimizeApp();
      });
    } catch (e) { /* sem plugin */ }
  };
})(globalThis.SYS = globalThis.SYS || {});
