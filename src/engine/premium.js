/* ==========================================================
   ALA PREMIUM: carteira de Cristais, Loja Exclusiva e Arenas
   Os Cristais entram APENAS por S.premium.grant (chamado pelo resgate
   de códigos validado no servidor). Aqui só se gastam.
   ========================================================== */
(function (S) {
  'use strict';
  var E = S.engine;
  var P = S.premium = {};
  var HOUR = 3600000;
  function now() { return S.clock.now(); }

  /* ID de Jogador: SIS- + 6 caracteres sem letras confundíveis (0/O, 1/I) */
  var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  P.newId = function () {
    var out = '', bytes = null;
    try { if (globalThis.crypto && globalThis.crypto.getRandomValues) { bytes = new Uint8Array(6); globalThis.crypto.getRandomValues(bytes); } } catch (e) { bytes = null; }
    for (var i = 0; i < 6; i++) out += ALPHA[(bytes ? bytes[i] : Math.floor(Math.random() * 256)) % ALPHA.length];
    return 'SIS-' + out;
  };
  P.ensure = function (st) {
    if (typeof st.crystals !== 'number') st.crystals = 0;
    if (!st.relics) st.relics = {};
    if (!st.perks) st.perks = {};
    // relíquias passaram a ser permanentes: quem tinha várias fica com uma e recebe o resto em Cristais
    if (!st.relicsV2) {
      st.relicsV2 = 1;
      var back = 0;
      (S.PREMIUM_RELICS || []).forEach(function (id) { var n = st.inv[id] || 0, it = S.ITEMS[id]; if (n > 1) { back += (n - 1) * (it.oldPrice || 0); st.inv[id] = 1; } });
      if (back) { st.crystals += back; if (E.history) E.history(st, '◆', 'As relíquias premium passaram a ser permanentes: ficaste com uma de cada e recebeste +' + back + ' Cristais pelas repetidas.'); }
    }
    if (!st.arena) st.arena = { unlocked: {}, wins: {}, last: {} };
    ['unlocked', 'wins', 'last'].forEach(function (k) { if (!st.arena[k]) st.arena[k] = {}; });
    // troféus dos sub-chefes das arenas (novos): quem já os venceu recebe-os
    if (st.trophies) Object.keys(st.arena.wins || {}).forEach(function (id) { if (S.TROPHIES[id] && !st.trophies[id]) st.trophies[id] = st.arena.last[id] || 1; });
    if (!st.playerId) st.playerId = P.newId();
    if (!st.cosmetics) st.cosmetics = { owned: {}, moldura: null, nome: null };
    if (!st.cosmetics.owned) st.cosmetics.owned = {};
    if (st.cosmetics.moldura === undefined) st.cosmetics.moldura = null;
    // as auras saíram da loja: devolve os Cristais a quem as comprou
    var refund = 0;
    Object.keys(S.OLD_AURAS || {}).forEach(function (id) { if (st.cosmetics.owned[id]) { refund += S.OLD_AURAS[id]; delete st.cosmetics.owned[id]; } });
    if ('aura' in st.cosmetics) delete st.cosmetics.aura;
    if (refund) { st.crystals = (st.crystals || 0) + refund; if (E.history) E.history(st, '◆', 'As auras saíram da loja: +' + refund + ' Cristais devolvidos.'); }
    return st;
  };

  /* entrada de Cristais (resgate de código validado pelo servidor) */
  P.grant = function (st, amount, source) {
    P.ensure(st);
    amount = Math.max(0, Math.floor(amount));
    if (!amount) return 0;
    st.crystals += amount;
    E.bump(st, 'crystalsEarned', amount);
    E.history(st, '◆', '+' + amount + ' Cristais' + (source ? ' (' + source + ')' : '') + '.');
    return amount;
  };

  P.buy = function (id, qty) {
    var st = E.state;
    P.ensure(st);
    qty = Math.max(1, Math.floor(qty || 1));
    var it = S.ITEMS[id], price = P.price(id);
    if (!it || !price) return { ok: false, msg: 'Este item não está na Loja Exclusiva.' };
    if ((it.equip || it.perma || it.perk) && qty > 1) qty = 1;
    if (it.perma && E.count(st, id) > 0) return { ok: false, msg: 'Esta relíquia já é tua para sempre.' };
    if (it.perk && ((st.perks && st.perks[it.perk]) || E.count(st, id) > 0)) return { ok: false, msg: 'Este bónus já é teu.' };
    if (it.equip && (E.count(st, id) > 0 || Object.keys(st.equip).some(function (k) { return st.equip[k] === id; }))) return { ok: false, msg: 'Já tens este equipamento.' };
    if (it.use && it.use.type === 'shadowSlot') {
      var room = S.SHADOW_RULES.maxExtraSlots - S.shadows.extraSlots(st) - E.count(st, id);
      if (room < 1) return { ok: false, msg: 'Já tens as 3 insígnias (6 lugares de servos).' };
      qty = Math.min(qty, room);
    }
    var total = price * qty;
    if (st.crystals < total) return { ok: false, msg: 'Faltam ' + (total - st.crystals) + ' Cristais.', need: total - st.crystals };
    st.crystals -= total;
    E.addItem(st, id, qty);
    E.bump(st, 'crystalsSpent', total);
    E.bump(st, 'premiumBought', qty);
    E.history(st, '◆', 'Comprou ' + (qty > 1 ? qty + '× ' : '') + it.name + ' por ' + total + ' Cristais.');
    E.checkAchievements(st);
    E.commit('compra premium');
    return { ok: true, total: total, msg: 'Compraste ' + (qty > 1 ? qty + '× ' : '') + it.name + '.' };
  };

  /* relíquias permanentes: prontas ou a recarregar */
  P.relicReady = function (st, id) { return !(st.relics && st.relics[id] > now()); };
  P.relicReadyAt = function (st, id) { return (st.relics && st.relics[id]) || 0; };
  P.relicSpend = function (st, id) { st.relics = st.relics || {}; st.relics[id] = now() + (S.ITEMS[id].recharge || 24) * 3600000; E.bump(st, 'consumablesUsed'); };
  P.rechargeAll = function (st) {
    var n = 0; st.relics = st.relics || {};
    (S.PREMIUM_RELICS || []).forEach(function (id) { if (st.inv[id] > 0 && st.relics[id] > now()) { st.relics[id] = 0; n++; } });
    return n;
  };
  /* preço em Cristais: itens premium ou itens normais vendidos também por Cristais */
  P.price = function (id) { var it = S.ITEMS[id]; return it ? (it.premium && it.crystals) || (S.PREMIUM_PRICES && S.PREMIUM_PRICES[id]) || 0 : 0; };

  /* câmbio: Cristais → moedas */
  P.exchange = function (id) {
    var st = E.state; P.ensure(st);
    var x = (S.PREMIUM_EXCHANGE || []).filter(function (e) { return e.id === id; })[0];
    if (!x) return { ok: false, msg: 'Câmbio desconhecido.' };
    if (st.crystals < x.crystals) return { ok: false, msg: 'Faltam ' + (x.crystals - st.crystals) + ' Cristais.', need: x.crystals - st.crystals };
    st.crystals -= x.crystals;
    st.coins += x.coins;
    E.bump(st, 'crystalsSpent', x.crystals);
    E.bump(st, 'coinsEarned', x.coins);
    E.history(st, '◆', 'Trocou ' + x.crystals + ' Cristais por ' + x.coins + ' moedas.');
    E.commit('câmbio');
    return { ok: true, coins: x.coins, msg: '+' + x.coins + ' moedas.' };
  };

  /* aparência */
  P.cosmeticOn = function (st, kind) { P.ensure(st); var id = st.cosmetics[kind]; return id && st.cosmetics.owned[id] ? S.COSMETIC_BY_ID[id] || null : null; };
  P.buyCosmetic = function (id) {
    var st = E.state; P.ensure(st);
    var c = S.COSMETIC_BY_ID[id];
    if (!c) return { ok: false, msg: 'Aparência desconhecida.' };
    if (st.cosmetics.owned[id]) return { ok: false, msg: 'Já é tua.' };
    if (c.reward || !c.crystals) return { ok: false, msg: 'Esta não se compra. Ganha-se.' };
    if (st.crystals < c.crystals) return { ok: false, msg: 'Faltam ' + (c.crystals - st.crystals) + ' Cristais.', need: c.crystals - st.crystals };
    st.crystals -= c.crystals;
    st.cosmetics.owned[id] = now();
    st.cosmetics[c.kind] = id;
    E.bump(st, 'crystalsSpent', c.crystals);
    E.history(st, '◆', 'Comprou ' + c.name + ' por ' + c.crystals + ' Cristais.');
    E.commit('aparência');
    return { ok: true, msg: c.name + ' ativa.' };
  };
  P.wear = function (id) {
    var st = E.state; P.ensure(st);
    var c = S.COSMETIC_BY_ID[id];
    if (!c || !st.cosmetics.owned[id]) return { ok: false, msg: 'Ainda não tens esta aparência.' };
    st.cosmetics[c.kind] = st.cosmetics[c.kind] === id ? null : id;
    E.commit('aparência');
    return { ok: true, msg: st.cosmetics[c.kind] ? c.name + ' ativa.' : c.name + ' guardada.' };
  };

  /* aparência ganha (não comprada): a Moldura do Primeiro Jogador */
  P.award = function (st, id) {
    P.ensure(st);
    var c = S.COSMETIC_BY_ID[id];
    if (!c || st.cosmetics.owned[id]) return false;
    st.cosmetics.owned[id] = now();
    st.cosmetics[c.kind] = id;
    E.history(st, '◆', 'Ganhou ' + c.name + '.');
    E.emit({ type: 'gift', title: 'MOLDURA EXCLUSIVA', name: c.name, lines: ['Só quem venceu O Primeiro Jogador a pode usar.', 'Já está à volta do teu retrato.'] });
    return true;
  };

  /* ---------------- arenas ---------------- */
  P.arenaBoss = function (n) { return S.BOSS_BY_ID['ar' + n]; };
  P.cooldown = function (st, b) {
    var last = st.arena && st.arena.last[b.id];
    return last ? last + S.PREMIUM_RULES.arenaCooldownH * HOUR : 0;
  };
  P.status = function (st, b) {
    P.ensure(st);
    var cd = P.cooldown(st, b);
    return { unlocked: !!st.arena.unlocked[b.arenaKey || b.id], open: S.combat.bossUnlocked(st, b), prev: P.prevBoss(b),
      wins: st.arena.wins[b.id] || 0, readyAt: cd > now() ? cd : 0 };
  };
  /* o combate anterior na escada da arena (null no 1.º Guardião) */
  P.prevBoss = function (b) {
    if (!b || !b.slot || b.slot === 1) return null;
    return S.ARENA_LADDER[b.arena][b.slot - 2] || null;
  };
  /* progresso de uma arena: quantos dos 10 combates já foram vencidos, e qual é o próximo */
  P.arenaProgress = function (st, n) {
    P.ensure(st);
    var lad = S.ARENA_LADDER[n] || [], won = 0, next = null;
    lad.forEach(function (b) { if (st.arena.wins[b.id]) won++; else if (!next) next = b; });
    return { won: won, total: lad.length, next: next, unlocked: !!st.arena.unlocked['ar' + n], champion: lad[lad.length - 1] };
  };
  var UNLOCK_VOICE = [
    'A cela abriu-se. {boss} levantou a cabeça. Ele lembra-se do que é ser Jogador. Tu vais lembrar-te do que é ser presa.',
    'Tributo aceite. {boss} está acordado. Não lhe digas que vieste por escolha. Ele também achava que tinha escolha.',
    'Paga. Registado. A arena está aberta, {nome}. A saída não está incluída no preço.'
  ];
  P.unlock = function (bossId) {
    var st = E.state;
    P.ensure(st);
    var b = S.BOSS_BY_ID[bossId];
    if (b && b.arenaKey) b = S.BOSS_BY_ID[b.arenaKey]; // a chave de cada arena é o seu Campeão
    if (!b || !b.premium) return { ok: false, msg: 'Arena desconhecida.' };
    if (st.arena.unlocked[b.id]) return { ok: false, msg: 'Esta arena já está aberta.' };
    if (st.crystals < b.cost) return { ok: false, msg: 'Faltam ' + (b.cost - st.crystals) + ' Cristais para abrir esta arena.', need: b.cost - st.crystals };
    st.crystals -= b.cost;
    st.arena.unlocked[b.id] = now();
    E.bump(st, 'crystalsSpent', b.cost);
    E.bump(st, 'arenasUnlocked');
    E.history(st, '◆', 'Abriu a ' + b.arenaName + ' por ' + b.cost + ' Cristais.');
    var line = (b.story && b.story.unlock) || UNLOCK_VOICE[Math.floor(S.rng.random() * UNLOCK_VOICE.length)].replace('{boss}', b.name.split(',')[0]).replace('{nome}', st.name);
    var g1 = S.ARENA_LADDER[b.arena][0];
    E.emit({ type: 'arena', title: 'ARENA DESBLOQUEADA', name: b.arenaName, boss: b.id, lines: [line, '10 combates: 9 Guardiões (Nv ' + g1.level + ' a ' + (b.level - 1) + ') e, no fim, ' + b.name + ' (Nv ' + b.level + ').'] });
    E.commit('arena desbloqueada');
    return { ok: true };
  };
})(globalThis.SYS = globalThis.SYS || {});
