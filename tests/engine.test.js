/* Testes do motor: node tests/engine.test.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ORDER = require('../build-order.json');

function boot() {
  const store = {};
  const ctx = {
    console, Math, Date, JSON, Object, Array, String, Number, Promise, Error, parseInt, parseFloat, isNaN, encodeURIComponent, decodeURIComponent, escape, unescape,
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; }
    }
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  ORDER.filter((f) => f.includes('/data/') || f.includes('/engine/')).forEach((f) => {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
  });
  return { S: ctx.SYS, store };
}

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { console.error('  ✗ ' + name + '\n    ' + (e.stack || e)); process.exitCode = 1; }
}

function at(S, y, m, d, h, min) { const t = new Date(y, m - 1, d, h, min || 0, 0).getTime(); S.clock.now = () => t; return t; }

console.log('Dados');
test('100 títulos, 100 chefes, níveis 1–100', () => {
  const { S } = boot();
  assert.strictEqual(S.TITLES.length, 100);
  assert.strictEqual(new Set(S.TITLES).size, 100);
  assert.strictEqual(S.BOSSES.length, 100);
  assert.strictEqual(new Set(S.BOSSES.map((b) => b.name)).size, 100);
  S.BOSSES.forEach((b, i) => { assert.strictEqual(b.level, i + 1); b.skills.forEach((k) => assert.ok(S.BOSS_SKILLS[k], b.name + ' habilidade ' + k)); });
  assert.strictEqual(S.xpToNext(100), 0);
  for (let L = 1; L < 100; L++) assert.ok(S.xpToNext(L) > 0);
});
test('todas as referências de itens existem', () => {
  const { S } = boot();
  Object.values(S.CHESTS).forEach((c) => c.table.forEach(([id]) => { if (id[0] !== '@') assert.ok(S.ITEMS[id], id); }));
  Object.values(S.BOSS_SPECIAL_DROPS).forEach((d) => { (d.items || []).forEach((id) => assert.ok(S.ITEMS[id], id)); if (d.skill) assert.ok(S.ALL_SKILLS[d.skill]); });
  S.ACHIEVEMENTS.forEach((a) => { const r = a.reward || {}; if (r.chest) assert.ok(S.ITEMS['bau_' + r.chest]); if (r.item) assert.ok(S.ITEMS[r.item]); if (r.skill) assert.ok(S.ALL_SKILLS[r.skill]); });
  Object.values(S.ITEMS).forEach((it) => { if (it.use && it.use.skill) assert.ok(S.ALL_SKILLS[it.use.skill]); if (it.use && it.use.result) assert.ok(S.ITEMS[it.use.result]); });
});

console.log('Salvamento');
test('grava a cada ação e volta a carregar igual', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  assert.ok(E.start('Natan', 'guerreiro').ok);
  E.state.coins = 5000; E.commit('t');
  E.buy('po_vida2', 3);
  const before = JSON.stringify(E.state);
  E.state = null;
  assert.ok(E.load());
  assert.strictEqual(JSON.stringify(E.state), before);
  assert.strictEqual(E.count(E.state, 'po_vida2'), 3);
});
test('gravação corrompida → recupera a cópia de segurança', () => {
  const { S, store } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'mago');
  E.state.coins = 777; E.commit('a');
  E.state.coins = 888; E.commit('b');
  store['sistema.save.v1'] = store['sistema.save.v1'].replace('888', '999'); // corrompe
  E.state = null;
  assert.ok(E.load());
  assert.strictEqual(E.state.coins, 777);
});
test('exportar / importar código de backup', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'arqueiro');
  E.state.coins = 4321; E.commit('x');
  const code = S.storage.exportCode(E.state);
  const st = S.storage.importCode(code);
  assert.strictEqual(st.coins, 4321);
  assert.strictEqual(S.storage.importCode('lixo'), null);
});

console.log('Missões');
test('concluir antes do prazo dá XP, moedas e treino', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, M = S.missions;
  E.start('Natan', 'guerreiro');
  const r = M.create({ title: 'Ler 20 páginas', difficulty: 'C', stats: ['int', 'per'], deadline: '18:00', recur: 'daily', days: [] });
  assert.ok(r.ok, r.msg);
  const coins0 = E.state.coins;
  const c = M.complete(r.mission.id);
  assert.ok(c.ok, c.msg);
  assert.ok(E.state.xp > 0 || E.state.level > 1);
  assert.strictEqual(E.state.coins, coins0 + c.coins);
  assert.strictEqual(E.state.trained.int, 0.3);
  assert.ok(!M.complete(r.mission.id).ok, 'não pode concluir duas vezes');
  // gravado?
  const saved = S.storage.loadLocal().state;
  assert.strictEqual(saved.missionLog[r.mission.id + '@2026-10-14'].status, 'done');
});
test('passar do prazo aplica penalidade e grava', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, M = S.missions;
  E.start('Natan', 'guerreiro');
  E.state.coins = 1000; E.state.xp = 50; E.commit('x');
  const r = M.create({ title: 'Correr', difficulty: 'B', stats: ['agi'], deadline: '10:00', recur: 'once', date: '2026-10-14', days: [] });
  at(S, 2026, 10, 14, 10, 5);
  assert.ok(!M.complete(r.mission.id).ok);
  const log = E.state.missionLog[r.mission.id + '@2026-10-14'];
  assert.strictEqual(log.status, 'failed');
  assert.ok(E.state.coins < 1000);
  assert.ok(E.state.xp < 50);
  assert.strictEqual(S.storage.loadLocal().state.missionLog[r.mission.id + '@2026-10-14'].status, 'failed');
  // processar outra vez não penaliza de novo
  const coins = E.state.coins;
  M.processDeadlines();
  assert.strictEqual(E.state.coins, coins);
});
test('dias em que a app esteve fechada são verificados (até 7)', () => {
  const { S } = boot();
  at(S, 2026, 10, 1, 8);
  const E = S.engine, M = S.missions;
  E.start('Natan', 'guerreiro');
  E.state.daily.enabled = false;
  E.state.coins = 100000; E.commit('x');
  const r = M.create({ title: 'Meditar', difficulty: 'E', stats: [], deadline: '21:00', recur: 'daily', days: [] });
  at(S, 2026, 10, 14, 12); // 13 dias depois
  const fails = M.processDeadlines();
  assert.strictEqual(fails, 7, 'de 7 a 13 = 7 dias (janela de 7 dias)');
  assert.ok(!E.state.missionLog[r.mission.id + '@2026-10-14'], 'hoje ainda está a tempo');
  assert.strictEqual(M.processDeadlines(), 0);
});
test('Escudo de Penalidade protege uma vez', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, M = S.missions;
  E.start('Natan', 'guerreiro');
  E.state.daily.enabled = false;
  E.addItem(E.state, 'po_escudo', 1);
  E.state.coins = 500; E.commit('x');
  M.create({ title: 'AA', difficulty: 'S', stats: [], deadline: '09:30', recur: 'once', date: '2026-10-14', days: [] });
  at(S, 2026, 10, 14, 10);
  M.processDeadlines();
  assert.strictEqual(E.state.coins, 500);
  assert.strictEqual(E.count(E.state, 'po_escudo'), 0);
});
test('missão diária: progresso, conclusão, sequência e falha', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 8);
  const E = S.engine, M = S.missions;
  E.start('Natan', 'guardiao');
  assert.ok(!M.completeDaily().ok);
  E.state.daily.tasks.forEach((t) => M.setDailyValue(t.id, t.target));
  assert.ok(M.completeDaily().ok);
  assert.strictEqual(E.state.daily.streak, 1);
  at(S, 2026, 10, 15, 8);
  M.processDeadlines();
  E.state.daily.tasks.forEach((t) => M.setDailyValue(t.id, t.target));
  assert.ok(M.completeDaily().ok);
  assert.strictEqual(E.state.daily.streak, 2);
  at(S, 2026, 10, 16, 23, 30); // passou das 23:00
  M.processDeadlines();
  assert.strictEqual(E.state.daily.streak, 0);
  assert.ok(E.hasEffect(E.state, 'exausto'));
});
test('não deixa criar missão única no passado', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 15);
  const E = S.engine, M = S.missions;
  E.start('Natan', 'guerreiro');
  assert.ok(!M.create({ title: 'X', difficulty: 'E', stats: [], deadline: '10:00', recur: 'once', date: '2026-10-14', days: [] }).ok);
  const d = M.create({ title: 'YY', difficulty: 'E', stats: [], deadline: '10:00', recur: 'daily', days: [] });
  assert.strictEqual(d.mission.startDate, '2026-10-15');
});

console.log('Progressão, loja e baús');
test('subir de nível dá pontos e muda título; nunca passa de 100', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'assassino');
  E.gainXp(E.state, S.xpToNext(1) + S.xpToNext(2), false);
  assert.strictEqual(E.state.level, 3);
  assert.strictEqual(E.state.freePoints, 6);
  E.gainXp(E.state, 1e9, false);
  assert.strictEqual(E.state.level, 100);
  assert.strictEqual(E.state.xp, 0);
  assert.strictEqual(S.titleFor(100), 'O Absoluto');
});
test('perder XP nunca desce de nível', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'assassino');
  E.gainXp(E.state, S.xpToNext(1) + 10, false);
  E.loseXp(E.state, 9999);
  assert.strictEqual(E.state.level, 2);
  assert.strictEqual(E.state.xp, 0);
});
test('loja: preço de elixir sobe, nível mínimo, classe', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'mago');
  E.state.coins = 100000;
  const p1 = E.price(E.state, 'el_str');
  assert.ok(E.buy('el_str').ok);
  assert.ok(E.price(E.state, 'el_str') > p1);
  assert.ok(!E.buy('w_mago_2').ok, 'nível insuficiente');
  assert.ok(!E.buy('w_guerreiro_1').ok, 'classe errada');
  assert.ok(E.useItem('el_str').ok);
  assert.strictEqual(E.state.bonus.str, 1);
});
test('equipar / desequipar mantém inventário consistente', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'guerreiro');
  E.state.coins = 100000; E.state.level = 10;
  E.buy('ac_forca'); E.buy('ac_agi'); E.buy('ac_vit');
  assert.ok(E.equip('ac_forca').ok); assert.ok(E.equip('ac_agi').ok);
  assert.strictEqual(E.state.equip.acc1, 'ac_forca'); assert.strictEqual(E.state.equip.acc2, 'ac_agi');
  assert.ok(E.equip('ac_vit', 'acc2').ok);
  assert.strictEqual(E.count(E.state, 'ac_agi'), 1);
  assert.ok(E.unequip('acc1').ok);
  assert.strictEqual(E.count(E.state, 'ac_forca'), 1);
});
test('abrir 300 baús de todos os tipos sem erros', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'invocador');
  ['comum', 'raro', 'epico', 'lendario', 'secreto'].forEach((t) => {
    for (let i = 0; i < 60; i++) { E.addItem(E.state, 'bau_' + t); const r = E.useItem('bau_' + t); assert.ok(r.ok, r.msg); r.loot.items.forEach((id) => assert.ok(S.ITEMS[id], id)); }
  });
  assert.ok(E.state.achievements.chest100);
});
test('fragmentos → núcleo → habilidade secreta', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'guerreiro');
  E.addItem(E.state, 'sx_fragmento', 5);
  assert.ok(E.useItem('sx_fragmento').ok);
  assert.ok(E.useItem('sx_nucleo').ok);
  assert.ok(E.state.secretSkills.includes('s8'));
  assert.strictEqual(E.state.freePoints, 10);
});
test('pedra do renascimento devolve os pontos', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'guerreiro');
  E.state.freePoints = 6;
  E.allocate('str', 4); E.allocate('agi', 2);
  E.addItem(E.state, 'el_reset');
  assert.ok(E.useItem('el_reset').ok);
  assert.strictEqual(E.state.freePoints, 6);
  assert.strictEqual(E.state.alloc.str, 0);
});

test('catálogo: mais de 200 itens, condições e troféus', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  const n = Object.keys(S.ITEMS).length;
  assert.ok(n >= 200, 'itens: ' + n);
  assert.strictEqual(Object.keys(S.TROPHIES).length, 102);
  Object.values(S.ITEMS).forEach((it) => { if (it.req && it.req.boss) assert.ok(S.BOSS_BY_ID[it.req.boss], it.id); if (it.req && it.req.ach) assert.ok(S.ACH_BY_ID[it.req.ach], it.id); });
  E.start('Natan', 'guerreiro');
  E.state.coins = 1e6; E.state.level = 15;
  const r = E.buy('ac_lobo');
  assert.ok(!r.ok && /Fenrath/.test(r.msg), r.msg);
  E.state.defeated.b10 = 1;
  assert.ok(E.buy('ac_lobo').ok);
  assert.ok(!E.buy('ac_disciplina').ok, 'precisa da conquista');
  assert.ok(E.buy('wk_fenrath').ok, 'arma de rei para qualquer classe');
  assert.ok(E.equip('wk_fenrath').ok);
});
test('loja: cada categoria tem muitos itens', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'mago');
  const counts = {};
  S.SHOP_TABS.forEach((t) => { counts[t.id] = E.shopList(E.state, t.id).length; });
  console.log('    ' + JSON.stringify(counts));
  assert.ok(counts.lazer >= 20 && counts.arma >= 20 && counts.armadura >= 12 && counts.acessorio >= 30 && counts.consumivel >= 30 && counts.atributo >= 12);
});
test('troféus: vitória dá troféu, conjunto completo dá bónus', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, C = S.combat;
  makeHero(S, 'guerreiro', 15);
  const vitBefore = E.totalStats(E.state).vit;
  for (let i = 1; i <= 9; i++) { E.state.defeated['b' + i] = 1; E.state.trophies['b' + i] = 1; }
  C.start('b10'); E.state.battle.b.hp = 1; C.act('attack');
  assert.strictEqual(E.state.battle.over, 'win');
  assert.ok(E.state.trophies.b10);
  assert.ok(E.state.battle.result.trophy);
  assert.ok(E.completedSets(E.state).includes(1));
  assert.ok(E.totalStats(E.state).vit >= vitBefore + 5);
  assert.ok(E.takeEvents().some((e) => e.title === 'CONJUNTO DE TROFÉUS COMPLETO'));
});
test('novos consumíveis de combate funcionam', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, C = S.combat;
  makeHero(S, 'mago', 50);
  ['po_restaura', 'po_fenix', 'po_fogo', 'po_gelo', 'po_veneno', 'po_fraqueza', 'po_correntes', 'po_barreira', 'po_espelho', 'po_furia2', 'po_abismo'].forEach((id) => E.addItem(E.state, id, 1));
  C.start('b60');
  ['po_restaura', 'po_fenix', 'po_fogo', 'po_gelo', 'po_veneno', 'po_fraqueza', 'po_correntes', 'po_barreira', 'po_espelho', 'po_furia2', 'po_abismo'].forEach((id) => {
    if (E.state.battle.over) return;
    if (E.state.battle.p.stunned) C.act('pass');
    const r = C.act('item', id); assert.ok(r.ok, id + ': ' + r.msg);
  });
});
test('gravação antiga recebe troféus e perde itens que já não existem', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'guerreiro');
  const st = JSON.parse(JSON.stringify(E.state));
  delete st.trophies; st.defeated = { b1: 5, b2: 6 }; st.inv.item_antigo = 2;
  const coins = st.coins;
  E.importState(st);
  assert.ok(E.state.trophies.b1 && E.state.trophies.b2);
  assert.ok(!E.state.inv.item_antigo);
  assert.strictEqual(E.state.coins, coins + 200);
});

test('Selo de Ascensão: sobe 1 nível, guarda o XP, exige Varyss e fica mais caro', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'guerreiro');
  const st = E.state;
  E.gainXp(st, S.totalXpForLevel(12), false); E.takeEvents();
  st.xp = 30; st.coins = 1e6; E.commit('x');
  assert.ok(!E.buy('el_selo').ok, 'precisa de derrotar Varyss');
  st.defeated.b20 = 1;
  const p1 = E.price(st, 'el_selo');
  assert.ok(E.buy('el_selo').ok);
  assert.ok(E.price(st, 'el_selo') > p1);
  const lv = st.level, pts = st.freePoints;
  const r = E.useItem('el_selo');
  assert.ok(r.ok && r.levelUp, r.msg);
  assert.strictEqual(st.level, lv + 1);
  assert.strictEqual(st.freePoints, pts + 3);
  assert.strictEqual(st.xp, 30);
  assert.ok(E.takeEvents().some((e) => e.type === 'levelup'));
  st.level = 100; st.xp = 0; E.addItem(st, 'el_selo');
  assert.ok(!E.useItem('el_selo').ok, 'nível máximo');
});
test('todos os chefes têm provocação e últimas palavras', () => {
  const { S } = boot();
  S.BOSSES.concat(S.SECRET_BOSSES).forEach((b) => {
    const l = S.BOSS_LINES[b.id];
    assert.ok(l && l.length === 2 && l[0].length > 10 && l[1].length > 10, b.id);
  });
  assert.strictEqual(Object.keys(S.BOSS_LINES).length, 102);
});
console.log('Relógio do Sistema e preços');
test('fases do dia, dia do Sistema e deteção de relógio atrasado', () => {
  const { S } = boot();
  const E = S.engine, M = S.missions, T = S.time;
  at(S, 2026, 10, 14, 9);
  assert.strictEqual(T.main(), 'dia'); assert.ok(T.is('manha'));
  E.start('Natan', 'guerreiro');
  E.state.daily.enabled = false;
  const r = M.create({ title: 'Ler', difficulty: 'C', stats: [], deadline: '23:59', recur: 'daily', days: [] });
  at(S, 2026, 10, 16, 22); M.processDeadlines();
  assert.strictEqual(T.main(), 'noite'); assert.ok(T.is('noite') && !T.is('crepusculo'));
  assert.strictEqual(T.systemDay(E.state), 3);
  at(S, 2026, 10, 16, 0, 30); assert.ok(T.is('horaMorta'));
  // o jogador atrasa o relógio 2 dias
  at(S, 2026, 10, 14, 10);
  M.processDeadlines();
  assert.ok(T.tampered(E.state));
  assert.ok(E.takeEvents().some((e) => e.title === 'ANOMALIA TEMPORAL'));
  assert.ok(!M.complete(r.mission.id).ok, 'missões bloqueadas');
  assert.strictEqual(T.systemDay(E.state), 3, 'o dia do Sistema não volta atrás');
  at(S, 2026, 10, 16, 23, 0);
  assert.ok(!T.tampered(E.state));
  assert.ok(M.complete(r.mission.id).ok);
});
test('itens de horário só funcionam na sua fase', () => {
  const { S } = boot();
  const E = S.engine, C = S.combat;
  at(S, 2026, 10, 14, 13);
  E.start('Natan', 'guerreiro');
  const st = E.state; st.level = 30;
  E.addItem(st, 'ac_lua', 1); E.addItem(st, 'ac_sol', 1);
  E.equip('ac_lua', 'acc1'); E.equip('ac_sol', 'acc2');
  const agiDay = E.totalStats(st).agi, strDay = E.totalStats(st).str;
  at(S, 2026, 10, 14, 23);
  assert.ok(E.totalStats(st).agi > agiDay, 'a lua liga-se à noite');
  assert.ok(E.totalStats(st).str < strDay, 'o sol desliga-se à noite');
  E.addItem(st, 'po_orvalho', 1);
  E.setHp(st, 10);
  assert.ok(!E.useItem('po_orvalho').ok, 'orvalho só de manhã');
  at(S, 2026, 10, 15, 7);
  assert.ok(E.useItem('po_orvalho').ok);
  E.addItem(st, 'po_horamorta', 1);
  assert.ok(!E.useItem('po_horamorta').ok);
  at(S, 2026, 10, 16, 1);
  assert.ok(E.useItem('po_horamorta').ok);
});
test('preços de poções, baús e lazer acompanham o nível', () => {
  const { S } = boot();
  const E = S.engine;
  at(S, 2026, 10, 14, 9);
  E.start('Natan', 'guerreiro');
  const st = E.state;
  st.level = 1; const p1 = E.price(st, 'po_vida2'), c1 = E.price(st, 'bau_comum'), w1 = E.price(st, 'w_guerreiro_1');
  st.level = 50; const p50 = E.price(st, 'po_vida2');
  assert.ok(p50 >= p1 * 5, p1 + ' → ' + p50);
  assert.ok(E.price(st, 'bau_comum') > c1);
  assert.strictEqual(E.price(st, 'w_guerreiro_1'), w1, 'equipamento tem preço fixo');
  assert.ok(E.sellValue(st, 'po_vida2') < p1, 'vender nunca dá lucro');
});
test('limite de 3 poções de cura por batalha', () => {
  const { S } = boot();
  const E = S.engine, C = S.combat;
  at(S, 2026, 10, 14, 9);
  makeHero(S, 'guardiao', 30);
  E.addItem(E.state, 'po_vida1', 6);
  C.start('b30');
  let ok = 0;
  for (let i = 0; i < 5 && !E.state.battle.over; i++) { if (E.state.battle.p.stunned) { C.act('pass'); continue; } if (C.act('item', 'po_vida1').ok) ok++; }
  assert.ok(ok <= 3, 'usou ' + ok);
  if (!E.state.battle.over) assert.ok(!C.act('item', 'po_vida1').ok);
});

console.log('Combate');
function makeHero(S, cls, level) {
  const E = S.engine;
  E.start('Herói', cls);
  const st = E.state;
  st.daily.enabled = false;
  E.gainXp(st, S.totalXpForLevel(level), false);
  // distribui pontos: 2/3 no atributo principal, resto em vitalidade
  const main = { guerreiro: 'str', assassino: 'agi', mago: 'int', guardiao: 'vit', arqueiro: 'per', invocador: 'int' }[cls];
  const n = st.freePoints;
  st.alloc[main] += Math.round(n * 0.6); st.alloc.vit += n - Math.round(n * 0.6); st.freePoints = 0;
  if (cls === 'assassino' || cls === 'arqueiro') { st.alloc.str += 0; }
  // treino de missões estimado (~0.6 por nível)
  S.STATS.forEach((k) => { st.trained[k] = level * 0.15; });
  // equipamento adequado ao nível
  let t = 0; S.CLASS_WEAPONS[cls].forEach((id, i) => { if (level >= S.ITEMS[id].lvl) t = i; });
  st.equip.weapon = S.CLASS_WEAPONS[cls][t];
  const arm = ['ar_couro', 'ar_malha', 'ar_escamas', 'ar_runica', 'ar_celeste', 'ar_soberano'];
  const armL = [1, 10, 25, 45, 65, 85];
  let a = 0; armL.forEach((lv, i) => { if (level >= lv) a = i; });
  st.equip.armor = arm[a];
  E.addItem(st, 'po_vida2', 3); E.addItem(st, 'po_mana1', 3);
  return st;
}
function autoFight(S) {
  const E = S.engine, C = S.combat;
  let guard = 0;
  while (E.state.battle && !E.state.battle.over && guard++ < 400) {
    const bt = E.state.battle;
    if (bt.p.stunned > 0) { C.act('pass'); continue; }
    if (bt.p.hp < bt.p.maxHp * 0.3 && E.count(E.state, 'po_vida2')) { C.act('item', 'po_vida2'); continue; }
    const skills = C.unlockedActiveSkills(E.state).filter((s) => !(bt.p.cds[s.id] > 0) && bt.p.mp >= s.mp).sort((a, b) => b.unlock - a.unlock);
    const r = skills.length ? C.act('skill', skills[0].id) : C.act('attack');
    assert.ok(r.ok, r.msg);
  }
  assert.ok(guard < 400, 'batalha infinita');
  return E.state.battle.over;
}
test('batalha completa grava a cada turno e o chefe morto não volta', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, C = S.combat;
  makeHero(S, 'guerreiro', 5);
  assert.ok(C.start('b1').ok);
  C.act('attack');
  const saved = S.storage.loadLocal().state;
  assert.ok(saved.battle && saved.battle.turn === 2, 'turno gravado');
  const res = autoFight(S);
  assert.strictEqual(res, 'win');
  assert.ok(E.state.defeated.b1);
  assert.ok(C.close().ok);
  assert.ok(!C.start('b1').ok, 'não reaparece');
  assert.ok(S.storage.loadLocal().state.defeated.b1);
});
test('equilíbrio: mesmo nível vence na maioria; 12 níveis abaixo nunca', () => {
  const B = require('./balance.js');
  ['guerreiro', 'assassino', 'mago', 'guardiao', 'arqueiro', 'invocador'].forEach((cls) => {
    let w = 0, n = 0, ww = 0, nn = 0;
    [10, 40, 70, 100].forEach((L) => {
      for (let i = 0; i < 3; i++) { const S = B.boot(); B.hero(S, cls, L); S.combat.start('b' + L); n++; if (B.fight(S)[0] === 'win') w++; }
      if (L > 12) for (let i = 0; i < 2; i++) { const S = B.boot(); B.hero(S, cls, L - 12); S.combat.start('b' + L); nn++; if (B.fight(S)[0] === 'win') ww++; }
    });
    assert.ok(w / n >= 0.5, cls + ' mesmo nível ' + w + '/' + n);
    assert.ok(ww / nn <= 0.1, cls + ' -12 níveis ' + ww + '/' + nn);
  });
});
test('morrer desce um nível, tira os pontos desse nível e reanima com 10% de vida', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, C = S.combat;
  makeHero(S, 'mago', 5);
  const st = E.state;
  st.xp = 40; st.freePoints = 1; st.coins = 1000; E.commit('x');
  const coins0 = st.coins;
  const allocBefore = S.STATS.reduce((a, k) => a + st.alloc[k], 0);
  C.start('b60');
  assert.strictEqual(autoFight(S), 'lose');
  assert.strictEqual(st.level, 4);
  assert.strictEqual(st.xp, 0);
  assert.strictEqual(st.freePoints, 0);
  assert.strictEqual(S.STATS.reduce((a, k) => a + st.alloc[k], 0), allocBefore - 2, 'os pontos que faltavam saem dos atributos');
  assert.strictEqual(st.coins, coins0, 'a morte já não tira moedas');
  const max = E.combatStats(st).maxHp;
  assert.strictEqual(E.curHp(st), Math.round(max * 0.1));
  const saved = S.storage.loadLocal().state;
  assert.strictEqual(saved.level, 4);
  C.close();
  // nível 1 não desce mais
  makeHero(S, 'mago', 1);
  C.start('b60'); autoFight(S);
  assert.strictEqual(E.state.level, 1);
});
test('a vida fica guardada entre batalhas e só sobe com poções (ou no novo dia)', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, C = S.combat;
  makeHero(S, 'guerreiro', 20);
  const st = E.state, max = E.combatStats(st).maxHp;
  C.start('b3');
  autoFight(S);
  assert.strictEqual(st.battle.over, 'win');
  const after = E.curHp(st);
  assert.ok(after < max, 'perdeu vida na batalha');
  C.close();
  at(S, 2026, 10, 14, 23); S.missions.processDeadlines();
  assert.strictEqual(E.curHp(st), after, 'não recupera com o tempo no mesmo dia');
  E.gainXp(st, S.xpToNext(st.level), false);
  assert.ok(E.curHp(st) <= after + 0, 'subir de nível não cura');
  C.start('b4');
  assert.strictEqual(st.battle.p.hp, E.curHp(st), 'a batalha começa com a vida atual');
  C.act('flee');
  assert.strictEqual(E.curHp(st), st.battle.p.hp, 'fugir guarda a vida');
  C.close();
  E.addItem(st, 'po_vida2', 1);
  const r = E.useItem('po_vida2');
  assert.ok(r.ok && r.healed > 0, r.msg);
  assert.ok(E.curHp(st) > after);
  E.setHp(st, E.combatStats(st).maxHp); E.addItem(st, 'po_vida1', 1);
  assert.ok(!E.useItem('po_vida1').ok, 'vida cheia');
  E.setHp(st, 0); E.commit('x');
  assert.ok(!C.start('b5').ok, 'sem vida não pode lutar');
});
test('fugir guarda a batalha como fuga e o chefe continua vivo', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, C = S.combat;
  makeHero(S, 'mago', 10);
  C.start('b60'); C.act('flee');
  assert.strictEqual(E.state.battle.over, 'fled');
  assert.ok(!E.state.defeated.b60);
});
test('chefe secreto só aparece com o mapa', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, C = S.combat;
  makeHero(S, 'guerreiro', 10);
  assert.ok(!C.start('secret_1').ok);
  E.addItem(E.state, 'sx_mapa');
  assert.ok(E.useItem('sx_mapa').ok);
  assert.ok(C.start('secret_1').ok);
});

console.log('Narrativa');
test('todos os chefes, habilidades, itens e troféus têm narrativa e ficha completa', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  makeHero(S, 'mago', 30);
  const st = S.engine.state, L = S.lore;
  const bad = (v) => /undefined|NaN|null|\[object/.test(JSON.stringify(v));
  S.BOSSES.concat(S.SECRET_BOSSES).forEach((b) => {
    assert.ok(L.bossText(b).length > 80, 'crónica curta: ' + b.id);
    assert.ok(L.gateText(b).length > 40, 'portão sem texto: ' + b.id);
    assert.ok(L.trophyText(b).length > 30, 'troféu sem texto: ' + b.id);
    b.skills.forEach((k) => assert.ok(!bad(L.bossSkillText(k)), 'habilidade de chefe: ' + k));
  });
  Object.keys(S.ALL_SKILLS).forEach((id) => {
    const s = S.ALL_SKILLS[id];
    assert.ok(L.skillText(s).length > 40, 'habilidade sem narrativa: ' + id);
    const sec = L.skillSections(s, st);
    assert.ok(sec[1].rows.length > 0, 'habilidade sem efeito: ' + id);
    assert.ok(!bad(sec), 'ficha inválida: ' + id);
  });
  Object.keys(S.ITEMS).forEach((id) => {
    const it = S.ITEMS[id];
    const t = L.itemText(it);
    assert.ok(t.length > 40 && t !== it.desc, 'item sem narrativa: ' + id);
    const sec = L.itemSections(it, st);
    assert.ok(!bad(sec), 'ficha inválida: ' + id + ' ' + JSON.stringify(sec));
    if (it.equip) assert.ok(sec.some((x) => x.title === 'Bónus ao equipar' && x.rows.length), 'sem bónus: ' + id);
    if (it.use && it.use.type !== 'leisure') assert.ok(sec.some((x) => x.title === 'Ao usar'), 'sem efeito: ' + id);
  });
});

console.log('Novo dia');
test('à meia-noite o Sistema restaura toda a vida (espera o fim da batalha e ignora relógio atrasado)', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 20);
  const E = S.engine, M = S.missions, C = S.combat;
  makeHero(S, 'guerreiro', 10);
  const st = E.state, max = E.combatStats(st).maxHp;
  E.setHp(st, 50); E.commit('x');
  M.processDeadlines();
  assert.strictEqual(E.curHp(st), 50, 'no mesmo dia não restaura');
  // batalha a decorrer à meia-noite: espera
  assert.ok(C.start('b1').ok);
  at(S, 2026, 10, 15, 0, 5);
  M.processDeadlines();
  assert.ok(E.curHp(st) < max, 'não restaura a meio da batalha');
  st.battle.over = 'fled'; C.close && C.close();
  M.processDeadlines();
  assert.strictEqual(E.curHp(st), max, 'restaura depois da batalha');
  assert.ok(E.takeEvents().some((e) => e.restore), 'mostra aviso de novo dia');
  // só uma vez por dia
  E.setHp(st, 40); at(S, 2026, 10, 15, 13);
  M.processDeadlines();
  assert.strictEqual(E.curHp(st), 40);
  // a gravação guarda o dia do restauro
  const saved = JSON.parse(JSON.stringify(st));
  assert.strictEqual(saved.lastRestore, '2026-10-15');
});

console.log('\n' + passed + ' testes passaram' + (process.exitCode ? ' (com falhas)' : ''));
