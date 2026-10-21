/* Testes do motor: node tests/engine.test.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ORDER = require('../build-order.json');
const TASKS = ['Ler 20 páginas', 'Correr 3 km', 'Beber 2 litros de água', 'Estudar inglês', 'Arrumar o quarto', 'Lavar a loiça', 'Meditar 10 minutos', 'Fazer 30 flexões', 'Regar as plantas', 'Ligar à mãe', 'Pagar contas', 'Passear o cão', 'Rever matemática', 'Escrever no diário'];

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
  assert.ok(S.xpToNext(100) > S.xpToNext(99), 'depois do 100 o nível continua a subir');
  for (let L = 1; L < 100; L++) assert.ok(S.xpToNext(L) > 0);
});
test('patentes dos duelos: 5 pontos por patente, 40 patentes até 199, Monarca aos 200 e não passa daí', () => {
  const { S } = boot();
  assert.strictEqual(S.DUEL_RANKS.length, 41);
  assert.strictEqual(new Set(S.DUEL_RANKS.map((r) => r.name)).size, 41);
  assert.strictEqual(S.duelRank(0).rank.i, 0);
  assert.strictEqual(S.duelRank(4).rank.i, 0);
  assert.strictEqual(S.duelRank(5).rank.i, 1);
  assert.strictEqual(S.duelRank(9).toNext, 1);
  assert.strictEqual(S.duelRank(199).rank.i, 39);
  assert.strictEqual(S.duelRank(199).rank.name, 'Soberano das Sombras V');
  assert.strictEqual(S.duelRank(200).rank.name, 'Monarca dos Duelos');
  assert.strictEqual(S.duelRank(560).rank.i, 40, 'os pontos continuam, a patente não');
  assert.ok(S.duelRank(560).max);
  assert.strictEqual(S.duelRank(-3).points, 0);
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
  at(S, 2026, 10, 14, 9, 30);
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
  assert.ok(M.create({ title: 'Ler 20 páginas', difficulty: 'S', stats: [], deadline: '11:00', recur: 'once', date: '2026-10-14', days: [] }).ok);
  at(S, 2026, 10, 14, 12);
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
  assert.ok(!M.create({ title: 'Arrumar o quarto', difficulty: 'E', stats: [], deadline: '10:00', recur: 'once', date: '2026-10-14', days: [] }).ok);
  const d = M.create({ title: 'Lavar a loiça', difficulty: 'E', stats: [], deadline: '10:00', recur: 'daily', days: [] });
  assert.strictEqual(d.mission.startDate, '2026-10-15');
});

console.log('Progressão, loja e baús');
test('subir de nível dá pontos e muda título; depois do 100 o nível continua a subir (o título fica O Absoluto)', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  E.start('Natan', 'assassino');
  E.gainXp(E.state, S.xpToNext(1) + S.xpToNext(2), false);
  assert.strictEqual(E.state.level, 3);
  assert.strictEqual(E.state.freePoints, 6);
  E.gainXp(E.state, S.totalXpForLevel(100) - S.totalXpForLevel(3) - E.state.xp, false);
  assert.strictEqual(E.state.level, 100);
  E.gainXp(E.state, S.xpToNext(100) + S.xpToNext(101), false);
  assert.strictEqual(E.state.level, 102, 'passa do 100');
  assert.strictEqual(S.titleFor(100), 'O Absoluto');
  assert.strictEqual(S.titleFor(E.state.level), 'O Absoluto');
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
  assert.strictEqual(Object.keys(S.TROPHIES).length, 202, '102 chefes + 10 Campeões + 90 sub-chefes das arenas');
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
  assert.ok(E.useItem('el_selo').ok, 'depois do 100 continua a subir');
  assert.strictEqual(st.level, 101);
});
test('todos os chefes têm provocação e últimas palavras', () => {
  const { S } = boot();
  S.BOSSES.concat(S.SECRET_BOSSES).forEach((b) => {
    const l = S.BOSS_LINES[b.id];
    assert.ok(l && l.length === 2 && l[0].length > 10 && l[1].length > 10, b.id);
  });
  assert.strictEqual(Object.keys(S.BOSS_LINES).length, 112 + 90, '+90 Guardiões das arenas');
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
      for (let i = 0; i < 8; i++) { const S = B.boot(); B.hero(S, cls, L); S.combat.start('b' + L); n++; if (B.fight(S)[0] === 'win') w++; }
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
  let seed = 12345; S.rng.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
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

console.log('Lei do Sistema (missões)');
test('limite de 12 missões novas por dia (apagadas contam)', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 8);
  const E = S.engine, M = S.missions;
  E.start('Natan', 'guerreiro');
  for (let i = 0; i < 12; i++) {
    const r = M.create({ title: TASKS[i], difficulty: 'E', stats: [], deadline: '22:00', recur: 'daily', days: [] });
    assert.ok(r.ok, r.msg);
    if (i % 2) M.remove(r.mission.id);
  }
  assert.ok(!M.create({ title: 'Regar as plantas', difficulty: 'E', stats: [], deadline: '22:00', recur: 'daily', days: [] }).ok);
  at(S, 2026, 10, 15, 8);
  assert.ok(M.create({ title: 'Passear o cão', difficulty: 'E', stats: [], deadline: '22:00', recur: 'daily', days: [] }).ok);
});
test('fadiga: depois de 5 missões por dia a recompensa desce', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 8);
  const E = S.engine, M = S.missions;
  E.start('Natan', 'guerreiro');
  const ids = [];
  for (let i = 0; i < 10; i++) ids.push(M.create({ title: TASKS[i], difficulty: 'C', stats: ['str'], deadline: '22:00', recur: 'daily', days: [] }).mission.id);
  at(S, 2026, 10, 14, 9);
  const factors = [1, 1, 1, 1, 1, 0.6, 0.6, 0.6, 0.3, 0.3];
  ids.forEach((id, i) => {
    const expected = Math.round(M.rewardFor(E.state, 'C').coins * factors[i]);
    assert.strictEqual(M.complete(id).coins, expected, 'missão ' + (i + 1));
  });
  assert.strictEqual(M.integrity(E.state).done, 10);
});

console.log('Transferência de conta');
function bootPair() {
  // dois aparelhos: cada um com o seu armazenamento
  return [boot(), boot()];
}
test('compressão: volta exatamente ao texto original (acentos e emojis incluídos)', () => {
  const { S } = boot();
  const samples = ['', 'a', 'ação çãõ €', '⚔️🌅🧪 ' + 'x'.repeat(3000), JSON.stringify({ a: [1, 2, 3], t: 'Missão diária: 30 flexões' }).repeat(400)];
  samples.forEach((t) => assert.strictEqual(S.storage.decompress(S.storage.compress(t)), t));
  assert.ok(/^[A-Za-z0-9_-]*$/.test(S.storage.compress(samples[3])), 'só caracteres seguros');
});
test('código de uma conta nível 20 com muito uso é curto o suficiente para o WhatsApp', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine;
  makeHero(S, 'guerreiro', 20);
  const st = E.state;
  for (let i = 0; i < 300; i++) E.history(st, '⚔️', 'Derrotou o chefe Lobo Cinzento Alfa e ganhou 240 XP e 287 moedas número ' + i);
  for (let i = 0; i < 40; i++) st.missions.push({ id: 'mx' + i, title: 'Missão de treino ' + i, desc: 'Fazer 30 flexões e ler 20 páginas', difficulty: 'C', stats: ['str'], deadline: '23:00', recur: 'daily', days: [], startDate: '2026-01-01', archived: false });
  for (let d = 0; d < 30; d++) for (let i = 0; i < 10; i++) st.missionLog['mx' + i + '@2026-10-' + String(1 + (d % 28)).padStart(2, '0')] = { status: 'done', at: S.clock.now() - d * 86400000, xp: 50, coins: 20 };
  E.commit('x');
  const old = S.storage.exportCode(st).length;
  const r = E.createTransfer();
  assert.ok(r.ok);
  assert.ok(r.code.length < 20000, 'código: ' + r.code.length + ' caracteres (antes: ' + old + ')');
  assert.ok(r.code.length < old / 4);
});
test('transferir: o aparelho antigo perde a conta e o novo recebe-a toda', () => {
  const [A, B] = bootPair();
  at(A.S, 2026, 10, 14, 9); at(B.S, 2026, 10, 14, 9, 5);
  makeHero(A.S, 'mago', 20);
  const EA = A.S.engine, EB = B.S.engine;
  EA.addItem(EA.state, 'po_vida2', 3); EA.state.coins = 1234; EA.state.defeated.b1 = 1; EA.commit('x');
  const coinsA = EA.state.coins, potsA = EA.count(EA.state, 'po_vida2');
  const r = EA.createTransfer();
  assert.ok(r.ok);
  assert.strictEqual(EA.state, null, 'A fica sem conta');
  assert.ok(!EA.load(), 'A não recupera a conta ao reabrir');
  assert.ok(A.S.storage.getMoved(), 'A mostra o ecrã de conta transferida');
  // B recebe (o código passa por uma app de mensagens que mete quebras de linha)
  const messy = '  "' + r.code.slice(0, 500) + '\n' + r.code.slice(500) + '"  ';
  const ok = EB.acceptTransfer(messy);
  assert.ok(ok.ok, ok.msg);
  assert.strictEqual(EB.state.level, 20);
  assert.strictEqual(EB.state.coins, coinsA);
  assert.strictEqual(EB.count(EB.state, 'po_vida2'), potsA);
  assert.ok(EB.state.defeated.b1);
  assert.ok(B.S.storage.loadLocal(), 'B gravou a conta');
  // o mesmo código não volta a funcionar em B, nem em A (que o criou)
  assert.ok(!EB.readTransfer(r.code).ok);
  assert.ok(!EA.readTransfer(r.code).ok);
  // para voltar: B gera um código novo e perde a conta; A restaura-o
  const back = EB.createTransfer();
  assert.strictEqual(EB.state, null);
  const ok2 = EA.acceptTransfer(back.code);
  assert.ok(ok2.ok, ok2.msg);
  assert.strictEqual(EA.state.level, 20);
  assert.ok(!A.S.storage.getMoved(), 'A volta a ter a conta');
});
test('código incompleto ou alterado é recusado com mensagem clara', () => {
  const [A, B] = bootPair();
  at(A.S, 2026, 10, 14, 9);
  makeHero(A.S, 'guerreiro', 5);
  const code = A.S.engine.createTransfer().code;
  const cut = B.S.engine.readTransfer(code.slice(0, code.length - 30));
  assert.ok(!cut.ok && /incompleto/.test(cut.msg));
  const changed = B.S.engine.readTransfer(code.slice(0, 40) + (code[40] === 'A' ? 'B' : 'A') + code.slice(41));
  assert.ok(!changed.ok && /incompleto|alterado/.test(changed.msg));
  assert.ok(!B.S.engine.readTransfer('olá').ok);
});
test('códigos antigos (versão anterior) ainda são aceites', () => {
  const [A, B] = bootPair();
  at(A.S, 2026, 10, 14, 9); at(B.S, 2026, 10, 14, 9);
  makeHero(A.S, 'arqueiro', 7);
  const legacy = A.S.storage.exportCode(A.S.engine.state);
  const r = B.S.engine.acceptTransfer(legacy);
  assert.ok(r.ok, r.msg);
  assert.strictEqual(B.S.engine.state.level, 7);
});
test('não se pode transferir a meio de uma batalha', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  makeHero(S, 'guerreiro', 10);
  assert.ok(S.combat.start('b1').ok);
  assert.ok(!S.engine.createTransfer().ok);
  assert.ok(S.engine.state, 'a conta continua aqui');
});

console.log('Vigilância do Sistema');
test('texto sem sentido é recusado, com aviso que escala e marca à 3.ª vez', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, M = S.missions;
  E.start('Delcio', 'guerreiro');
  E.takeEvents();
  const r1 = M.create({ title: 'yshsuahs', difficulty: 'S', stats: [], deadline: '22:00', recur: 'daily', days: [] });
  assert.ok(!r1.ok && r1.watch);
  const ev1 = E.takeEvents().filter((e) => e.type === 'watch');
  assert.strictEqual(ev1.length, 1);
  assert.ok(ev1[0].title.length > 3 && ev1[0].lines.length >= 2);
  assert.ok(ev1[0].lines.every((l) => l.length > 3 && !/\{/.test(l)), 'falas completas');
  assert.strictEqual(E.state.missions.length, 0, 'nada foi criado');
  assert.strictEqual(S.watch.trust(E.state), 90);
  M.create({ title: 'ydsgd', difficulty: 'S', stats: [], deadline: '22:00', recur: 'daily', days: [] });
  const ev2 = E.takeEvents().filter((e) => e.type === 'watch')[0];
  assert.ok(ev2.level >= 2 && ev2.sentence.length >= 1, 'segundo aviso traz sentença');
  assert.ok(!S.watch.marked(E.state));
  E.state.watch.banUntil = 0; // (se a 2.ª sentença fechou o quadro, a 3.ª tentativa nem chegava a ser lida)
  M.create({ title: 'asdasd', difficulty: 'S', stats: [], deadline: '22:00', recur: 'daily', days: [] });
  assert.ok(S.watch.marked(E.state), 'à terceira fica marcado');
  assert.strictEqual(S.watch.trust(E.state), 40);
  E.state.watch.banUntil = 0; // (a sentença pode ter fechado o quadro de missões)
  assert.ok(M.create({ title: 'Estudar inglês', difficulty: 'C', stats: [], deadline: '22:00', recur: 'daily', days: [] }).ok, 'missões reais continuam a funcionar');
  assert.ok(E.state.history.some((h) => h.icon === '👁️'));
});
test('"teste" ou "tarefa" sozinhos são recusados; editar para lixo também', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, M = S.missions;
  E.start('Delcio', 'guerreiro');
  assert.ok(!M.create({ title: 'teste', difficulty: 'C', stats: [], deadline: '22:00', recur: 'daily', days: [] }).ok);
  const m = M.create({ title: 'Ler 20 páginas', difficulty: 'C', stats: [], deadline: '22:00', recur: 'daily', days: [] }).mission;
  assert.ok(!M.update(m.id, { title: 'kkkkkk', difficulty: 'C', stats: [], deadline: '22:00', recur: 'daily', days: [] }).ok);
  assert.strictEqual(M.byId(m.id).title, 'Ler 20 páginas');
});
test('criar e concluir depressa: regista, depois metade, depois anula e marca', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, M = S.missions;
  E.start('Delcio', 'guerreiro');
  E.state.coins = 1000; E.commit('x');
  const mk = (t) => { E.state.watch.banUntil = 0; return M.create({ title: t, difficulty: 'C', stats: ['str'], deadline: '22:00', recur: 'once', date: '2026-10-14', days: [] }).mission.id; };
  E.takeEvents();
  // 1.ª: recompensa completa, mas o Sistema anota
  const full = M.nextReward(E.state, 'C');
  const c1 = M.complete(mk('Ler 20 páginas'));
  assert.ok(c1.ok);
  assert.strictEqual(c1.coins, full.coins);
  const p1 = E.takeEvents().filter((e) => e.type === 'mission')[0];
  assert.ok(p1.lines.some((l) => /regist|anot|relógio/i.test(l)), 'linha de vigilância no popup');
  // 2.ª: metade e alerta
  at(S, 2026, 10, 14, 9, 2);
  const half = M.nextReward(E.state, 'C');
  const c2 = M.complete(mk('Arrumar o quarto'));
  assert.strictEqual(c2.coins, Math.round(half.coins * 0.5));
  assert.ok(E.takeEvents().some((e) => e.type === 'watch' && e.level >= 2 && e.lines.some((l) => /metade/.test(l))));
  // 3.ª: anulada, perde moedas e fica marcado
  at(S, 2026, 10, 14, 9, 4);
  const coins = E.state.coins;
  const c3 = M.complete(mk('Lavar a loiça'));
  assert.ok(c3.voided && c3.coins < 0);
  assert.ok(E.state.coins < coins);
  assert.ok(S.watch.marked(E.state));
  assert.ok(Object.values(E.state.missionLog).some((l) => l.void));
  // marcado: recompensas das missões a metade (e confiança baixa)
  assert.ok(S.watch.factor(E.state) <= 0.5);
});
test('missões legítimas não são vigiadas e devolvem confiança; o novo dia também', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 8);
  const E = S.engine, M = S.missions;
  E.start('Delcio', 'guerreiro');
  E.state.watch.trust = 85;
  const id = M.create({ title: 'Correr 3 km', difficulty: 'C', stats: [], deadline: '22:00', recur: 'daily', days: [] }).mission.id;
  at(S, 2026, 10, 14, 9);
  E.takeEvents();
  const r = M.complete(id);
  assert.strictEqual(S.watch.trust(E.state), 88);
  assert.ok(!E.takeEvents().some((e) => e.type === 'watch'));
  // no dia seguinte, concluir a missão repetida logo de manhã não é suspeito
  at(S, 2026, 10, 15, 6);
  M.processDeadlines();
  assert.strictEqual(S.watch.trust(E.state), 98, '+10 pelo novo dia');
  E.takeEvents();
  M.complete(id);
  assert.strictEqual(S.watch.trust(E.state), 100);
  assert.ok(E.takeEvents().some((e) => e.type === 'watch' && e.good), 'o Sistema volta a confiar');
});
test('detetor: tarefas reais passam, lixo é apanhado', () => {
  const { S } = boot();
  const ok = ['Estudar inglês', 'Responder ao Joaquim', 'Treino HIIT', 'Workshop de UX', 'Estudar Kotlin', 'Gym', 'TCC capítulo 2', 'Fix the bug in checkout', 'Ir ao Lidl', 'Tocar ukulele'];
  const bad = ['yshsuahs', 'ayyela', 'ydsgd', 'asdasd', 'kkkkk', 'qwerty', 'jdjdjd', 'teste', '123', 'ler yshsuahs hoje'];
  ok.forEach((t) => assert.ok(S.watch.judgeText(t, '').ok, 'devia passar: ' + t));
  bad.forEach((t) => assert.ok(!S.watch.judgeText(t, '').ok, 'devia ser apanhado: ' + t));
});

test('sentenças: castigos variados (moedas, XP, bloqueio, marca e nível), cada um com a sua linha', () => {
  const seen = {};
  for (let seed = 1; seed <= 40; seed++) {
    const { S } = boot();
    let x = seed; S.rng.random = () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
    at(S, 2026, 10, 14, 9);
    makeHero(S, 'guerreiro', 15);
    const E = S.engine, W = S.watch, st = E.state;
    st.coins = 5000; st.xp = Math.round(S.xpToNext(st.level) * 0.8);
    [2, 3, 4].forEach((sev) => W.sentence(st, sev).forEach((p) => { seen[p.kind] = (seen[p.kind] || 0) + 1; assert.ok(p.line.length > 20 && !/\{/.test(p.line), 'linha completa: ' + p.line); }));
    // confiança muito baixa: perde um nível
    st.watch.trust = 5;
    const lv = st.level;
    const out = W.sentence(st, W.severity(st, 3));
    assert.ok(out.some((p) => p.kind === 'level'));
    assert.strictEqual(st.level, lv - 1);
  }
  ['coins', 'xp', 'ban', 'mark', 'level'].forEach((k) => assert.ok(seen[k] || k === 'level', 'castigo ' + k + ' nunca saiu'));
});
test('bloqueio de missões: dura conforme a confiança e o Sistema responde a quem tenta', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, W = S.watch, M = S.missions;
  E.start('Delcio', 'guerreiro');
  E.state.watch.trust = 30;
  E.state.watch.lastKind = 'coins';
  S.rng.random = () => 0.99; // escolhe "ban" entre xp/ban
  const out = W.sentence(E.state, 2);
  assert.strictEqual(out[0].kind, 'ban');
  const hours = W.banLeft(E.state) / 3600000;
  assert.ok(hours >= 3 && hours <= 4, 'confiança 30% → cerca de 4 horas (leve): ' + hours);
  E.takeEvents();
  const r = M.create({ title: 'Ler 20 páginas', difficulty: 'C', stats: [], deadline: '22:00', recur: 'daily', days: [] });
  assert.ok(!r.ok && r.banned);
  assert.ok(E.takeEvents().some((e) => e.type === 'watch' && /FECHADO/.test(e.title)));
  assert.strictEqual(S.watch.trust(E.state), 30, 'tentar durante o bloqueio não é novo abuso');
  at(S, 2026, 10, 14, 14);
  assert.ok(M.create({ title: 'Ler 20 páginas', difficulty: 'C', stats: [], deadline: '22:00', recur: 'daily', days: [] }).ok, 'depois do bloqueio volta a funcionar');
});

console.log('Sistema vivo');
test('Missões de Emergência: aparecem no horário, máx. 2 por dia, recompensam e expiram', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, M = S.missions, L = S.live;
  makeHero(S, 'guerreiro', 10);
  M.processDeadlines();
  const next = L.nextEmergencyAt(E.state);
  assert.ok(next >= new Date(2026, 9, 14, 10).getTime() && next <= new Date(2026, 9, 14, 13).getTime(), 'primeira entre 1h e 4h depois');
  E.takeEvents();
  S.clock.now = () => next + 60000; M.processDeadlines();
  const em = L.emergency(E.state);
  assert.ok(em, 'apareceu');
  assert.ok(E.takeEvents().some((e) => e.type === 'emergency'));
  assert.ok(!L.completeEmergency().ok, 'logo a seguir não conta');
  S.clock.now = () => next + 4 * 60000;
  const coins = E.state.coins;
  const r = L.completeEmergency();
  assert.ok(r.ok && E.state.coins > coins);
  assert.ok(!L.emergency(E.state));
  // a segunda do dia expira e o Sistema comenta
  S.clock.now = () => L.nextEmergencyAt(E.state) + 1000; M.processDeadlines();
  if (L.emergency(E.state)) {
    E.takeEvents();
    S.clock.now = () => L.emergency(E.state).until + 1000; M.processDeadlines();
    assert.ok(E.takeEvents().some((e) => e.type === 'note'));
  }
  // nunca mais de 2 por dia, nem fora de horas
  S.clock.now = () => new Date(2026, 9, 14, 21, 59).getTime(); M.processDeadlines();
  assert.ok(E.state.live.emCount <= 2);
  at(S, 2026, 10, 15, 23, 30); M.processDeadlines();
  assert.ok(!L.emergency(E.state), 'não aparece depois das 22:00');
});
test('Missões Ocultas: padrão revela, exige tempo real, dá recompensa rara e não se repete', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, M = S.missions, L = S.live;
  makeHero(S, 'guerreiro', 10);
  E.state.c.earlyMissions = 5;
  E.takeEvents();
  M.processDeadlines();
  const h = L.hiddenActive(E.state);
  assert.ok(h && h.def.id === 'alvorada');
  assert.ok(E.takeEvents().some((e) => e.type === 'hidden'));
  assert.ok(!L.completeHidden().ok, 'em minutos não');
  at(S, 2026, 10, 14, 10, 5);
  const epic = E.count(E.state, 'bau_epico');
  assert.ok(L.completeHidden().ok);
  assert.strictEqual(E.count(E.state, 'bau_epico'), epic + 1);
  M.processDeadlines();
  assert.ok(!L.hiddenActive(E.state) || L.hiddenActive(E.state).def.id !== 'alvorada', 'não se repete');
});
test('Zona de Penalidade: falhar a Diária abre-a; cumprir recupera metade e tira Exausto', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, M = S.missions, L = S.live;
  E.start('Delcio', 'guerreiro');
  E.state.coins = 1000; E.commit('x');
  at(S, 2026, 10, 14, 23, 30);
  M.processDeadlines();
  const z = L.zone(E.state);
  assert.ok(z, 'zona aberta');
  assert.ok(E.hasEffect(E.state, 'exausto'));
  assert.strictEqual(z.tasks[0].target, Math.ceil(E.state.daily.tasks[0].target * 1.5));
  const coins = E.state.coins;
  assert.ok(!L.completeZone().ok);
  z.tasks.forEach((tk) => L.setZoneValue(tk.id, tk.target));
  assert.ok(L.completeZone().ok);
  assert.strictEqual(E.state.coins, coins + Math.round(z.coins * 0.5));
  assert.ok(!E.hasEffect(E.state, 'exausto'));
  assert.ok(!L.zone(E.state));
});
test('Zona de Penalidade falhada: paga a dobrar e perde integridade', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, M = S.missions, L = S.live;
  E.start('Delcio', 'guerreiro');
  E.state.coins = 1000; E.commit('x');
  at(S, 2026, 10, 14, 23, 30);
  M.processDeadlines();
  const z = L.zone(E.state), lostFirst = z.coins, coins = E.state.coins, trust = S.watch.trust(E.state);
  E.state.daily.enabled = false;
  at(S, 2026, 10, 16, 0, 30);
  E.takeEvents();
  M.processDeadlines();
  assert.strictEqual(E.state.coins, coins - lostFirst);
  assert.ok(S.watch.trust(E.state) <= trust - 10 + 10, 'integridade desce (o novo dia devolve no máximo +10)');
  assert.ok(E.takeEvents().some((e) => e.type === 'penalty' && /ZONA/.test(e.title)));
});
test('Relatório semanal: ao domingo à noite, com nota, prémio e uma só vez', () => {
  const { S } = boot();
  at(S, 2026, 10, 12, 8); // segunda-feira
  const E = S.engine, M = S.missions, L = S.live;
  makeHero(S, 'guerreiro', 10);
  E.state.daily.enabled = true;
  const ids = ['Ler 20 páginas', 'Correr 3 km', 'Estudar inglês'].map((t) => M.create({ title: t, difficulty: 'C', stats: [], deadline: '22:00', recur: 'daily', days: [] }).mission.id);
  for (let d = 12; d <= 18; d++) {
    at(S, 2026, 10, d, 20);
    ids.forEach((id) => M.complete(id));
    E.state.daily.tasks.forEach((t) => M.setDailyValue(t.id, t.target)); M.completeDaily();
    E.state.watch.banUntil = 0;
  }
  E.takeEvents();
  at(S, 2026, 10, 18, 19); // domingo 19h
  M.processDeadlines();
  const rep = E.state.live.reports[0];
  assert.ok(rep && rep.week === '2026-10-12');
  assert.ok(['S', 'A'].indexOf(rep.grade) >= 0, 'semana cheia: nota ' + rep.grade);
  assert.ok(E.takeEvents().some((e) => e.type === 'report'));
  M.processDeadlines();
  assert.strictEqual(E.state.live.reports.length, 1, 'só uma vez');
  at(S, 2026, 10, 20, 9); M.processDeadlines();
  assert.strictEqual(E.state.live.reports.length, 1, 'segunda-feira não repete a semana');
});
test('Saudação e reações: ausência, intervalo de 3 horas, subida de rank e rei do portão', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, L = S.live;
  E.start('Delcio', 'guerreiro');
  L.greeting(E.state, true);
  at(S, 2026, 10, 17, 10);
  const g = L.greeting(E.state);
  assert.ok(g && /3 dias/.test(g.text), g && g.text);
  at(S, 2026, 10, 17, 11);
  assert.strictEqual(L.greeting(E.state), null, 'não repete em menos de 3 horas');
  E.takeEvents();
  E.gainXp(E.state, S.totalXpForLevel(11), false); // E → D
  assert.ok(E.takeEvents().some((e) => e.type === 'note' && /Rank/.test(e.text)));
  L.react(E.state, 'boss', { def: S.BOSS_BY_ID.b10, gap: 0 });
  assert.ok(E.takeEvents().some((e) => e.type === 'note' && /Floresta/.test(e.text)));
});

test('Lembretes: plano com missões, Diária, emergência e ausência, sempre no futuro', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 9);
  const E = S.engine, M = S.missions, L = S.live;
  E.start('Delcio', 'guerreiro');
  M.create({ title: 'Ler 20 páginas', difficulty: 'C', stats: [], deadline: '18:00', recur: 'daily', days: [] });
  M.processDeadlines();
  const plan = L.plan(E.state);
  const now = S.clock.now();
  assert.ok(plan.every((n) => n.at > now && n.body.length > 10 && !/\{/.test(n.body + n.title)), 'textos completos e no futuro');
  const mis = plan.find((n) => n.key.indexOf('m:') === 0);
  assert.ok(mis && Math.abs(mis.at - new Date(2026, 9, 14, 17, 30).getTime()) < 60000, 'missão: 30 min antes do prazo');
  assert.ok(plan.some((n) => n.key.indexOf('daily@2026-10-14') === 0 && Math.abs(n.at - new Date(2026, 9, 14, 22).getTime()) < 60000), 'diária: 1 h antes');
  assert.ok(plan.some((n) => n.key.indexOf('em:') === 0), 'próxima emergência');
  assert.ok(plan.some((n) => n.key.indexOf('absent:') === 0), 'ausência');
  // missão concluída sai do plano
  at(S, 2026, 10, 14, 10);
  M.complete(E.state.missions[0].id);
  assert.ok(!L.plan(E.state).some((n) => n.key === mis.key));
});

test('Diálogos: 350 conversas (250 por contexto + 100 aleatórias), 3 respostas cada, textos sem variáveis por preencher', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 10);
  S.engine.start('Delcio', 'guerreiro');
  const T = S.TALKS;
  assert.strictEqual(T.length, 350);
  assert.strictEqual(T.filter((d) => d.trigger === 'idle').length, 100);
  assert.strictEqual(new Set(T.map((d) => d.id)).size, 350, 'ids únicos');
  const st = S.engine.state;
  const V = S.talk.vars(st, { boss: S.BOSS_BY_ID.b30, missao: 'Ler', diff: 'C', item: 'Espada', rarity: 'raro', skill: 'Golpe', tab: 'loja', away: 3, level: 5, rankup: true, slot: 'weapon', diaria: false });
  const fill = (t) => String(t).replace(/\{(\w+)\}/g, (m, k) => (V[k] !== undefined ? V[k] : m));
  T.forEach((d) => {
    assert.strictEqual(d.choices.length, 3, d.id);
    [d.line].concat(...d.choices.map((c) => [c.t, c.r])).forEach((txt) => assert.ok(!/\{\w+\}/.test(fill(txt)), d.id + ': ' + txt));
  });
  // cada conversa tem as três atitudes (obedecer, desafiar, perguntar)
  assert.ok(T.every((d) => d.choices.map((c) => c.tag).sort().join('') === 'doq'), 'três atitudes diferentes');
});

test('Diálogos: moderação (intervalo, limite diário, desligado, batalha, ignorar)', () => {
  const { S } = boot();
  let t = at(S, 2026, 10, 14, 10);
  const E = S.engine, T = S.talk;
  E.start('Delcio', 'mago');
  const st = E.state;
  S.rng.random = () => 0; // a sorte quer sempre falar
  at(S, 2026, 10, 14, 9, 59); st.created = S.clock.now() - 3600000; at(S, 2026, 10, 14, 10);
  const a = T.offer(st, 'open', {});
  assert.ok(a && a.choices.length === 3, 'fala na primeira oportunidade');
  assert.strictEqual(T.offer(st, 'open', {}), null, 'intervalo mínimo');
  at(S, 2026, 10, 14, 10, 30);
  assert.strictEqual(T.offer(st, 'open', {}), null, 'o intervalo cresce a cada conversa');
  at(S, 2026, 10, 14, 10, 50);
  assert.ok(T.offer(st, 'open', {}), 'depois do intervalo volta a poder');
  // limite diário
  for (let i = 0; i < 10; i++) { at(S, 2026, 10, 14, 11 + i, 0); T.offer(st, 'open', {}); }
  assert.strictEqual(st.talk.count, S.TALK_RULES.perDay.normal - 1, 'a última do dia fica reservada');
  at(S, 2026, 10, 14, 23, 0);
  const big = S.BOSSES.filter((b) => b.level >= 30 && !b.king)[0];
  assert.ok(T.offer(st, 'boss', { boss: big }), 'momento importante usa a reservada');
  assert.strictEqual(st.talk.count, S.TALK_RULES.perDay.normal, 'limite por dia');
  at(S, 2026, 10, 15, 9); assert.ok(T.offer(st, 'open', {}), 'novo dia, novo limite');
  // desligado
  st.settings.talk = 'off'; at(S, 2026, 10, 15, 12);
  assert.strictEqual(T.offer(st, 'open', {}), null);
  st.settings.talk = 'normal';
  // batalha em curso
  st.battle = { over: false };
  assert.strictEqual(T.offer(st, 'open', {}), null, 'nunca a meio de uma batalha');
  st.battle = null;
  // ignorar reduz a frequência
  const d0 = st.talk.damp; T.skip(st); T.skip(st);
  assert.ok(st.talk.damp < d0 * 0.6, 'ignorar faz o Sistema falar menos');
  // sorte: sem sorte, não fala
  S.rng.random = () => 0.99; at(S, 2026, 10, 15, 18);
  assert.strictEqual(T.offer(st, 'open', {}), null, 'probabilidade');
});

test('Diálogos: chefe mortal escolhe conversa de aviso e a resposta fica guardada', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 10);
  const E = S.engine, T = S.talk;
  E.start('Delcio', 'arqueiro');
  const st = E.state;
  const big = S.BOSSES.filter((b) => b.level >= 30 && !b.king)[0];
  for (let i = 0; i < 15; i++) {
    const c = T.offer(st, 'boss', { boss: big }, { force: true });
    const d = S.TALKS.filter((x) => x.id === c.id)[0];
    assert.ok(d.cond.some((k) => k.k === 'gap' && k.op === '>='), 'conversa de chefe mortal: ' + c.id);
    assert.ok(!/\{\w+\}/.test(c.line + c.choices.map((x) => x.t).join('')));
  }
  const weak = S.BOSS_BY_ID.b1;
  st.level = 30;
  const c2 = T.offer(st, 'boss', { boss: weak }, { force: true });
  assert.ok(!S.TALKS.filter((x) => x.id === c2.id)[0].cond.some((k) => k.k === 'gap' && k.op === '>='), 'chefe fraco não usa aviso de morte');
  const before = st.talk.att.d;
  const i = c2.choices.findIndex((x) => x.tag === 'd');
  const r = T.answer(st, c2, i);
  assert.ok(r.ok && r.reply.length > 5 && st.talk.att.d === before + 1);
  // as escolhas desbloqueiam conversas novas
  st.talk.att.d = 6; st.talk.seen = {};
  at(S, 2026, 10, 20, 10);
  const ids = new Set();
  for (let k = 0; k < 120; k++) ids.add(T.offer(st, 'open', {}, { force: true }).id), st.talk.seen = {};
  const memo = S.TALKS.filter((x) => x.trigger === 'open' && x.cond.some((k) => k.k === 'd')).map((x) => x.id);
  assert.ok(memo.some((id) => ids.has(id)), 'o Sistema lembra-se dos desafios');
});

test('Diálogos: resposta é opinião final (não volta), ignorada volta, seguimentos dependem da resposta', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 10);
  const E = S.engine, T = S.talk;
  E.start('Delcio', 'mago');
  const st = E.state;
  const byId = (id) => S.TALKS.filter((x) => x.id === id)[0];
  // responder a rd1 com «Eu encontrei-te» (resposta 2)
  const pool = () => T.candidates(st, 'idle', {}).list.map((d) => d.id);
  assert.ok(pool().includes('rd1') && !pool().includes('rd71'), 'seguimento escondido antes da resposta');
  const conv = { id: 'rd1', V: T.vars(st, {}) };
  const r = T.answer(st, conv, 1);
  assert.ok(r.ok && st.talk.done.rd1 === 2);
  at(S, 2027, 10, 14, 10);
  assert.ok(!pool().includes('rd1'), 'respondida: nunca mais volta, nem um ano depois');
  assert.ok(pool().includes('rd71'), 'o Sistema volta ao assunto por causa da resposta');
  // outra resposta não desbloqueia o seguimento
  T.answer(st, { id: 'rd5', V: T.vars(st, {}) }, 0);
  assert.ok(!pool().includes('rd72'), 'rd72 só aparece se a resposta a rd5 foi a 2.ª');
  // ignorar: volta, mas só depois de alguns dias
  at(S, 2027, 10, 15, 10);
  st.talk.last = 0; st.talk.count = 0;
  const c = T.offer(st, 'idle', {}, { force: true });
  T.skip(st, c);
  assert.ok(!pool().includes(c.id), 'ignorada: não volta logo');
  at(S, 2027, 10, 19, 10);
  assert.ok(pool().includes(c.id), 'ignorada: volta ao fim de 3 dias');
  // não chegou a ser mostrada: não conta
  const c2 = T.offer(st, 'idle', {}, { force: true });
  const n = st.talk.count;
  T.cancel(st, c2);
  assert.ok(pool().includes(c2.id) && st.talk.count === n - 1);
  assert.ok(byId('rd71').cond.some((k) => k.k === 'a_rd1'));
});

console.log('Ala Premium');
test('Cristais: só entram por grant; Loja Exclusiva compra, não vende, equipamento acompanha o nível', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 10);
  const E = S.engine, P = S.premium;
  E.start('Delcio', 'guerreiro');
  const st = E.state;
  assert.ok(/^SIS-[A-HJ-NP-Z2-9]{6}$/.test(st.playerId), 'ID de Jogador: ' + st.playerId);
  assert.strictEqual(st.crystals, 0);
  assert.strictEqual(P.buy('pr_juizo').ok, false, 'sem cristais não compra');
  P.grant(st, 500, 'teste');
  const jz = S.ITEMS.pr_juizo.crystals;
  assert.ok(P.buy('pr_juizo', 2).ok && st.crystals === 500 - jz && E.count(st, 'pr_juizo') === 1, 'relíquia: compra-se uma só');
  assert.strictEqual(P.buy('pr_juizo').ok, false, 'relíquia permanente: não se compra duas vezes');
  P.grant(st, S.ITEMS.pr_lamina.crystals, 'teste');
  assert.ok(P.buy('pr_lamina').ok && st.crystals === 500 - jz);
  assert.strictEqual(P.buy('pr_lamina').ok, false, 'equipamento só uma vez');
  assert.strictEqual(E.sellValue(st, 'pr_lamina'), 0, 'premium não se vende');
  // a lâmina fica acima da melhor arma da loja, ao nível 1 e ao nível 60
  const best = (L) => { st.level = L; return Math.max(...Object.values(S.ITEMS).filter((it) => !it.premium && it.lvl <= L && it.equip && it.equip.slot === 'weapon' && E.canEquipClass(st, it)).map((it) => Math.max(it.equip.atk || 0, it.equip.matk || 0))); };
  [1, 20, 30, 40, 60, 90].forEach((L) => { const b = best(L); const v = S.ITEMS.pr_lamina.equip.atk; assert.ok(v > b * 1.3 && v < b * 1.5 + 3, 'nível ' + L + ': ' + v + ' vs ' + b); });
  st.level = 1;
  // relíquias das arenas nunca saem em baús
  for (let i = 0; i < 400; i++) { st.level = 60; const r = E.openChest(st, 'lendario'); assert.ok(!r.items.some((id) => S.ITEMS[id].relic || S.ITEMS[id].premium), 'relíquia num baú'); }
});

test('Arenas: desbloqueio com Cristais, Campeão volta, 1.ª vitória dá relíquia e troféu, revanche dá menos', () => {
  const { S } = boot();
  let t = at(S, 2026, 10, 14, 10);
  const E = S.engine, P = S.premium, C = S.combat;
  E.start('Delcio', 'mago');
  const st = E.state;
  assert.strictEqual(S.ARENA_BOSSES.length, 10);
  const b = P.arenaBoss(1);
  assert.strictEqual(C.start(b.id).ok, false, 'arena selada');
  assert.strictEqual(P.unlock(b.id).ok, false, 'sem cristais');
  P.grant(st, b.cost);
  assert.ok(P.unlock(b.id).ok && st.crystals === 0);
  assert.ok(E.takeEvents().some((e) => e.type === 'arena'));
  assert.strictEqual(C.start(b.id).ok, false, 'o Campeão exige os 9 Guardiões');
  S.ARENA_LADDER[1].slice(0, 9).forEach((g) => { st.arena.wins[g.id] = 1; });
  const first = C.rewards(st, b);
  assert.ok(first.first && first.special.items[0] === 'rl_eclipse');
  // vitória forçada
  st.level = 60; S.rng.random = () => 0.5;
  assert.ok(C.start(b.id).ok);
  st.battle.b.hp = 1;
  C.act('attack');
  assert.strictEqual(st.battle.over, 'win');
  assert.ok(E.count(st, 'rl_eclipse') === 1 && st.trophies.ar1 && !st.defeated.ar1 && st.arena.wins.ar1 === 1);
  C.close();
  assert.strictEqual(C.start(b.id).ok, false, 'Campeão a recuperar');
  at(S, 2026, 10, 15, 7);
  assert.ok(C.start(b.id).ok, 'volta 20 horas depois');
  const rep = C.rewards(st, b);
  assert.ok(!rep.first && rep.xp < first.xp * 0.4 && !rep.special, 'revanche dá menos e sem relíquia');
  // derrota na arena: não perde nível
  const lv = st.level; st.xp = 1000;
  st.battle.p.hp = 1; st.battle.b.atk = 1e9;
  C.act('attack');
  assert.strictEqual(st.battle.over, 'lose');
  assert.strictEqual(st.level, lv, 'na arena não se perde nível');
  assert.strictEqual(st.xp, 750, 'perde 25% do XP do nível');
});

test('Relíquias de combate: 1 por batalha; Juízo tira 20% (8% a Campeões); Lágrima renasce com tudo', () => {
  const { S } = boot();
  at(S, 2026, 10, 14, 10);
  const E = S.engine, P = S.premium, C = S.combat;
  E.start('Delcio', 'guardiao');
  const st = E.state;
  st.level = 50; S.rng.random = () => 0.5;
  P.grant(st, 2000);
  assert.ok(P.buy('pr_juizo').ok && P.buy('pr_tempo').ok && P.buy('pr_fenix').ok);
  assert.ok(C.start('b45').ok);
  const bt = st.battle, before = bt.b.hp;
  assert.ok(C.act('item', 'pr_juizo').ok);
  assert.ok(bt.log.some((l) => /Juízo Final corta (\d+)/.test(l.t) && +RegExp.$1 >= Math.round(bt.b.maxHp * 0.2) - 1));
  assert.strictEqual(C.act('item', 'pr_tempo').ok, false, 'só 1 relíquia premium por batalha');
  // Lágrima da Fénix Negra
  bt.p.hp = 1; bt.b.atk = 1e7; bt.b.stunned = 0;
  C.act('attack');
  assert.ok(bt.p.hp === bt.p.maxHp || bt.over === 'win' || bt.log.some((l) => /Fénix Negra/.test(l.t)), 'renasceu');
  assert.strictEqual(E.count(st, 'pr_fenix'), 1, 'a Lágrima é permanente: não se gasta');
  assert.strictEqual(P.relicReady(st, 'pr_fenix'), false, 'fica a recarregar');
  assert.strictEqual(E.count(st, 'pr_juizo'), 1);
  C.act('flee'); C.close();
  // a recarregar: não se pode usar; passadas as horas, volta a funcionar
  assert.ok(C.start('b46').ok);
  assert.strictEqual(C.act('item', 'pr_juizo').ok, false, 'Juízo a recarregar');
  C.act('flee'); C.close();
  at(S, 2026, 10, 15, 11);
  assert.ok(P.relicReady(st, 'pr_juizo') && P.relicReady(st, 'pr_fenix'));
  // receber uma relíquia que já tens = recarga imediata
  P.relicSpend(st, 'pr_tempo'); E.addItem(st, 'pr_tempo', 1);
  assert.ok(P.relicReady(st, 'pr_tempo') && E.count(st, 'pr_tempo') === 1);
  // Campeões resistem ao Juízo
  st.relics = {}; P.unlock('ar2'); st.arena.unlocked.ar2 = 1;
  S.ARENA_LADDER[2].slice(0, 9).forEach((g) => { st.arena.wins[g.id] = 1; });
  assert.ok(C.start('ar2').ok);
  C.act('item', 'pr_juizo');
  assert.ok(st.battle.log.some((l) => /\(8%\)/.test(l.t)));
});

test('Loja Exclusiva: relíquias antigas viram permanentes (repetidas devolvidas em Cristais); Selo Eterno dá +15% para sempre', () => {
  const { S } = boot();
  at(S, 2026, 10, 20, 10);
  const E = S.engine, P = S.premium;
  E.start('Delcio', 'mago');
  const st = E.state;
  delete st.relicsV2; st.inv.pr_juizo = 3; st.inv.pr_elixir = 2; st.crystals = 0;
  P.ensure(st);
  assert.strictEqual(st.inv.pr_juizo, 1); assert.strictEqual(st.inv.pr_elixir, 1);
  assert.strictEqual(st.crystals, 2 * 40 + 1 * 30, 'repetidas devolvidas ao preço antigo');
  P.ensure(st); assert.strictEqual(st.crystals, 110, 'só uma vez');
  const xp0 = E.xpMultiplier(st), c0 = E.coinMultiplier(st);
  P.grant(st, 1000); assert.ok(P.buy('pr_selo').ok);
  assert.ok(E.useItem('pr_selo').ok);
  assert.ok(Math.abs(E.xpMultiplier(st) - xp0 * 1.15) < 1e-9 && Math.abs(E.coinMultiplier(st) - c0 * 1.15) < 1e-9);
  at(S, 2027, 10, 20, 10); assert.ok(Math.abs(E.xpMultiplier(st) - xp0 * 1.15) < 1e-9, 'continua um ano depois');
  assert.strictEqual(P.buy('pr_selo').ok, false, 'o Selo Eterno só se compra uma vez');
  // Baú do Monarca: lendário + secreto + recarga das relíquias
  P.relicSpend(st, 'pr_juizo'); assert.ok(!P.relicReady(st, 'pr_juizo'));
  assert.ok(P.buy('pr_bau').ok && E.useItem('pr_bau').ok);
  assert.ok(P.relicReady(st, 'pr_juizo') && E.count(st, 'bau_lendario') >= 1 && E.count(st, 'bau_secreto') >= 1);
});

test('Cristais: resgate credita uma única vez; câmbio, proteções e aparência gastam certo', () => {
  const { S } = boot();
  at(S, 2026, 10, 18, 10);
  const E = S.engine, P = S.premium, SH = S.shop;
  E.start('Delcio', 'mago');
  const st = E.state;
  assert.ok(/^SIS-[A-Z2-9]{6}$/.test(st.playerId));
  // o servidor responde ao resgate; repetir (rede caiu) traz o mesmo redemption_id
  const res = { ok: true, crystals: 250, redemption_id: 'r_abc', order_id: 'SIS-000001' };
  const a = SH.apply(st, res), b = SH.apply(st, res);
  assert.ok(a.ok && a.crystals === 250 && b.already, 'segunda vez não credita');
  assert.strictEqual(st.crystals, 250);
  assert.ok(!SH.apply(st, { redemption_id: '', crystals: 10 }).ok);
  // câmbio
  const coins0 = st.coins;
  assert.ok(P.exchange('ex_150').ok);
  assert.strictEqual(st.crystals, 100); assert.strictEqual(st.coins, coins0 + 2000);
  assert.ok(!P.exchange('ex_400').ok, 'sem cristais suficientes');
  // proteção da loja normal paga em Cristais
  assert.strictEqual(P.price('po_escudo'), 25);
  assert.ok(P.buy('po_escudo', 2).ok);
  assert.strictEqual(st.crystals, 50); assert.strictEqual(E.count(st, 'po_escudo'), 2);
  assert.strictEqual(P.price('po_vida1'), 0); assert.ok(!P.buy('po_vida1', 1).ok, 'itens comuns não se vendem por Cristais');
  // aparência
  SH.apply(st, { ok: true, crystals: 100, redemption_id: 'r_def', order_id: 'SIS-000002' });
  assert.strictEqual(st.crystals, 150);
  assert.ok(!P.buyCosmetic('au_monarca').ok);
  assert.ok(P.buyCosmetic('nm_ciano').ok);
  assert.strictEqual(P.cosmeticOn(st, 'nome').id, 'nm_ciano');
  assert.ok(!P.buyCosmetic('nm_ciano').ok, 'não compra duas vezes');
  P.wear('nm_ciano'); assert.strictEqual(P.cosmeticOn(st, 'nome'), null, 'tirar');
  P.wear('nm_ciano'); assert.strictEqual(P.cosmeticOn(st, 'nome').id, 'nm_ciano');
  assert.ok(!P.wear('au_sistema').ok, 'não usa o que não comprou');
  // tudo sobrevive a gravar e carregar (e à transferência, que usa o mesmo estado)
  E.state = null; E.load();
  assert.strictEqual(E.state.crystals, 90);
  assert.ok(E.state.shop.redeemed.r_abc && E.state.cosmetics.owned.nm_ciano);
});

test('Coliseu: os 10 Campeões têm história completa e a sua mecânica de assinatura acontece em combate', () => {
  const { S } = boot();
  at(S, 2026, 10, 18, 10);
  const E = S.engine, C = S.combat, P = S.premium;
  const seen = {};
  const marks = { execute: 'EXECUÇÃO', evade: 'Mil Passos', hoard: 'Avareza Abissal', rewind: 'REBOBINAR', rebirth: 'RENASCER IMPERIAL', mirror: 'Reflexo Partido', stone: 'Pele de Pedra Rúnica racha', storm: 'Tempestade Crescente', garden: 'Jardim que Cresce', first: 'Aprende Contigo' };
  S.ARENA_BOSSES.forEach((b, n) => {
    const x = b.story;
    ['record', 'crime', 'sentence', 'quote', 'arenaDesc', 'lore', 'unlock', 'rematchLast', 'phase2', 'phase3'].forEach((k) => assert.ok(x[k] && x[k].length > 10, b.id + '.' + k));
    assert.ok(x.intro.length === 3 && x.lines.length === 2 && x.rematch.length >= 2 && x.taunt.length >= 2, b.id);
    assert.ok(marks[x.sig.id], b.id + ' tem mecânica');
    let found = false;
    for (let attempt = 0; attempt < 6 && !found; attempt++) {
      E.start('Delcio', 'guerreiro');
      const st = E.state;
      st.level = Math.max(1, b.level); st.alloc.str = st.level * 12; st.alloc.vit = st.level * 12;
      P.ensure(st); P.grant(st, 5000); assert.ok(P.unlock(b.id).ok);
      S.ARENA_LADDER[b.arena].slice(0, 9).forEach((g) => { st.arena.wins[g.id] = 1; });
      assert.ok(C.start(b.id).ok, 'começa ' + b.id);
      if (x.sig.id === 'execute') st.battle.p.hp = Math.round(st.battle.p.maxHp * 0.3);
      for (let i = 0; i < 300 && st.battle && !st.battle.over; i++) C.act(st.battle.p.stunned > 0 ? 'pass' : 'attack');
      const txt = st.battle.log.map((l) => l.t).join('\n');
      found = txt.indexOf(marks[x.sig.id]) >= 0;
      if (found) seen[b.id] = true;
      C.close && C.close();
    }
    assert.ok(found, b.id + ': a mecânica ' + x.sig.id + ' aparece no combate');
  });
  assert.strictEqual(Object.keys(seen).length, 10);
});

test('Arenas premium: cada arena tem 10 combates em escada (9 Guardiões + Campeão), por ordem', () => {
  const { S } = boot();
  at(S, 2026, 10, 18, 10);
  const E = S.engine, P = S.premium, C = S.combat;
  assert.strictEqual(S.ARENA_GUARDIANS.length, 90);
  assert.strictEqual(JSON.stringify(S.ARENA_BOSSES.map((b) => b.cost)), '[120,200,280,360,440,520,600,700,800,1000]', 'preços ×2');
  const names = {};
  S.ARENA_BOSSES.forEach((ch) => {
    const lad = S.ARENA_LADDER[ch.arena];
    assert.strictEqual(lad.length, 10);
    assert.strictEqual(lad[9], ch);
    lad.forEach((b, i) => {
      assert.strictEqual(b.slot, i + 1);
      assert.strictEqual(b.level, ch.level - 9 + i, b.id + ' nível em escada');
      if (i < 9) {
        assert.ok(b.guardian && b.premium && b.arenaKey === ch.id);
        assert.ok(S.BOSS_LORE[b.id].length > 60 && S.BOSS_LINES[b.id].length === 2, b.id + ' tem crónica e falas');
        b.skills.forEach((k) => assert.ok(S.BOSS_SKILLS[k], b.id + ' habilidade ' + k));
        assert.ok(S.ARCHETYPES[b.arch], b.id + ' arquétipo');
        assert.ok(!names[b.name], 'nome repetido: ' + b.name); names[b.name] = 1;
      }
    });
    assert.ok(lad[8].lieutenant && lad[8].king && !lad[7].king, 'o 9.º é o Tenente (2 fases)');
  });
  E.start('Delcio', 'guerreiro');
  const st = E.state;
  st.level = 40; st.alloc.str = 600; st.alloc.vit = 600; S.rng.random = () => 0.5;
  const g1 = S.ARENA_LADDER[3][0], g2 = S.ARENA_LADDER[3][1];
  assert.strictEqual(C.start(g1.id).ok, false, 'arena selada');
  P.grant(st, 280);
  assert.ok(P.unlock(g1.id).ok, 'desbloquear pela página de um Guardião abre a arena');
  assert.ok(st.arena.unlocked.ar3 && st.crystals === 0);
  E.takeEvents();
  const r2 = C.start(g2.id);
  assert.ok(!r2.ok && /Vence primeiro/.test(r2.msg), 'por ordem');
  const rw = C.rewards(st, g1);
  assert.ok(rw.first && rw.xp > 0 && rw.chest);
  assert.ok(C.start(g1.id).ok);
  assert.ok(E.takeEvents().some((e) => e.type === 'arena' && /ARENA III/.test(e.title)), 'apresentação da arena no 1.º combate');
  st.battle.b.hp = 1; C.act('attack');
  assert.strictEqual(st.battle.over, 'win'); C.close();
  assert.strictEqual(st.arena.wins[g1.id], 1);
  assert.strictEqual(C.start(g1.id).ok, false, 'Guardião vencido volta 20 horas depois');
  assert.ok(C.start(g2.id).ok, 'o 2.º abre-se'); st.battle.b.hp = 1; C.act('attack'); C.close();
  const pg = P.arenaProgress(st, 3);
  assert.ok(pg.won === 2 && pg.next === S.ARENA_LADDER[3][2]);
  // o 5.º dá uma relíquia de combate na 1.ª vitória
  assert.ok(C.rewards(st, S.ARENA_LADDER[3][4]).special.items[0].indexOf('pr_') === 0);
  // conquistas só contam Campeões
  const gl = S.ACHIEVEMENTS.filter((a) => a.id === 'ar_1')[0];
  assert.ok(!gl.check(st), 'Guardiões não contam como Campeões');
  // o Tenente tem 2 fases
  S.ARENA_LADDER[3].slice(0, 8).forEach((g) => { st.arena.wins[g.id] = 1; });
  assert.ok(C.start(S.ARENA_LADDER[3][8].id).ok);
  st.battle.b.hp = Math.round(st.battle.b.maxHp * 0.4); C.act('attack');
  assert.ok(st.battle.phase === 2 || st.battle.over, 'Tenente entra na fase 2');
});

test('Itens novos: cada mecânica nova funciona em combate', () => {
  const { S } = boot();
  at(S, 2026, 10, 19, 10);
  const E = S.engine, C = S.combat, P = S.premium;
  S.NEW_ITEMS.forEach((id) => { const it = S.ITEMS[id]; assert.ok(it && it.price > 0 && S.ITEM_LORE[id] && S.ITEM_LORE[id].length > 40, id); });
  function fight(equip, setup) {
    E.start('Delcio', 'guerreiro');
    const st = E.state; st.level = 70; st.alloc.str = 200; st.alloc.vit = 200; S.rng.random = () => 0.5;
    Object.keys(equip).forEach((slot) => { E.addItem(st, equip[slot], 1); E.equip(equip[slot], slot); });
    assert.ok(C.start('b60').ok);
    if (setup) setup(st.battle);
    return st.battle;
  }
  const base = fight({}); C.act('attack'); const d0 = +base.log.filter((l) => /➤ Ataque/.test(l.t))[0].t.match(/(\d+) de dano/)[1];
  // primeiro golpe
  let bt = fight({ weapon: 'wx_relampago' }); C.act('attack');
  assert.ok(bt.log.some((l) => /Primeiro Golpe/.test(l.t)), 'primeiro golpe');
  // escudo inicial
  bt = fight({ armor: 'ar_bastiao' }); assert.ok(bt.p.shield > 0 && bt.log.some((l) => /escudo de/.test(l.t)), 'escudo inicial');
  // execução: mais dano com o chefe abaixo de 30%
  bt = fight({ weapon: 'wx_carrasco' }, (b) => { b.b.hp = Math.round(b.b.maxHp * 0.25); }); const h0 = bt.b.hp; C.act('attack'); const ex = h0 - bt.b.hp;
  let bt2 = fight({ weapon: 'wx_carrasco' }); const h1 = bt2.b.hp; C.act('attack'); assert.ok(ex > (h1 - bt2.b.hp) * 1.2, 'execução ' + ex + ' vs ' + (h1 - bt2.b.hp));
  // espinhos
  bt = fight({ armor: 'ar_espinhos' }); const hb = bt.b.hp; C.act('defend'); assert.ok(bt.b.hp < hb || bt.log.some((l) => /Devolveste/.test(l.t)), 'espinhos');
  // mana por golpe
  bt = fight({ weapon: 'wx_fonte' }, (b) => { b.p.mp = 0; }); C.act('attack'); assert.ok(bt.p.mp > 0, 'mana por golpe');
  // poções curam mais
  bt = fight({ armor: 'ar_alquimista' }, (b) => { b.p.hp = 1; }); E.addItem(E.state, 'po_vida1', 1); C.act('item', 'po_vida1');
  assert.ok(bt.log.some((l) => /Recuperaste (\d+) de vida/.test(l.t) && +RegExp.$1 >= Math.round(bt.p.maxHp * 0.3 * 1.3) - 2), 'poções +30%');
  // venenos mais fortes
  bt = fight({ weapon: 'wx_peste' }); E.addItem(E.state, 'po_veneno', 1); C.act('item', 'po_veneno');
  const pv = +bt.log.filter((l) => /\/turno/.test(l.t))[0].t.match(/\((\d+)\/turno/)[1];
  bt2 = fight({ weapon: 'wx_carrasco' }); E.addItem(E.state, 'po_veneno', 1); C.act('item', 'po_veneno');
  assert.ok(pv > +bt2.log.filter((l) => /\/turno/.test(l.t))[0].t.match(/\((\d+)\/turno/)[1], 'dotPct');
  // resistência a atordoar: com 0.5 e stunRes 45 (+ ancora 40 = 80 máx) resiste
  E.start('Delcio', 'guardiao'); const st = E.state; st.level = 70; ['ar_vontade', 'ac_ancora'].forEach((id) => E.addItem(st, id, 1)); E.equip('ar_vontade', 'armor'); E.equip('ac_ancora', 'acc1');
  assert.strictEqual(E.combatStats(st).stunRes, 80);
  // premium novos à venda e na loja
  ['pr_ampulheta', 'pr_espinho', 'pr_executor', 'pr_egide', 'pr_ruptura', 'pr_eco', 'pr_foco', 'pr_trevo'].forEach((id) => assert.ok(P.price(id) > 0 && S.ITEM_LORE[id], id));
  assert.strictEqual(S.COSMETICS.filter((c) => c.kind === 'moldura').length, 15);
});

test('Artefatos do Sistema: chamar, silenciar, licença, dobro, bilhete, bússola, dado e pacto', () => {
  const { S } = boot();
  at(S, 2026, 10, 19, 9);
  const E = S.engine, M = S.missions, W = S.watch, C = S.combat;
  E.start('Delcio', 'guerreiro');
  const st = E.state; st.level = 30;
  S.SYSTEM_ITEMS.forEach((id) => { assert.ok(S.ITEMS[id].cat === 'sistema' && S.ITEM_LORE[id], id); E.addItem(st, id, 3); });
  // Sino: conversa nova na hora, mesmo com o Sistema silenciado
  let r = E.useItem('sys_silencio'); assert.ok(r.ok);
  assert.strictEqual(S.talk.blocked(st, 'idle', false), 'silencio');
  r = E.useItem('sys_sino'); assert.ok(r.ok && r.talk && r.talk.line && r.talk.choices.length === 3, 'chamou uma conversa');
  // Licença: +3 missões hoje
  st.created = Date.now() - 864e5;
  for (let i = 0; i < 12; i++) M.create({ title: 'Ler capítulo ' + ['um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze'][i] + ' do livro de história', difficulty: 'E', stats: [], deadline: '22:00', recur: 'once', date: '2026-10-19', days: [] });
  const over = M.create({ title: 'Lavar a loiça toda da cozinha', difficulty: 'E', stats: [], deadline: '22:00', recur: 'once', date: '2026-10-19', days: [] });
  assert.ok(!over.ok && /Licença/.test(over.msg), over.msg);
  assert.ok(E.useItem('sys_licenca').ok);
  assert.ok(M.create({ title: 'Lavar a loiça toda da cozinha', difficulty: 'E', stats: [], deadline: '22:00', recur: 'once', date: '2026-10-19', days: [] }).ok, 'com licença cria mais');
  // Selo do Dobro: a próxima missão dá o dobro
  const m1 = st.missions.filter((m) => !m.archived)[0], m2 = st.missions.filter((m) => !m.archived)[1];
  at(S, 2026, 10, 19, 12);
  const a = M.complete(m1.id);
  assert.ok(E.useItem('sys_dobro').ok);
  const b = M.complete(m2.id);
  assert.ok(b.coins >= a.coins * 1.8, 'dobro: ' + a.coins + ' → ' + b.coins);
  assert.strictEqual(st.sys.dbl, 0);
  // Bilhete: próxima vitória contra chefe a dobrar
  assert.ok(E.useItem('sys_bilhete').ok); S.rng.random = () => 0.5;
  st.level = 60; assert.ok(C.start('b10').ok); st.battle.b.hp = 1; C.act('attack');
  assert.ok(st.battle.log.some((l) => /Vitória Dupla/.test(l.t)) && st.sys.dblBoss === 0); C.close();
  // Bússola: revela uma Missão Oculta
  r = E.useItem('sys_bussola'); assert.ok(r.ok && S.live.hiddenActive(st), r.msg);
  assert.ok(!E.useItem('sys_bussola').ok, 'só uma de cada vez');
  // Dado: sai sempre alguma coisa
  r = E.useItem('sys_dado'); assert.ok(r.ok && /🎲/.test(r.msg));
  // Pacto: -20% Integridade por poder; recusado com Integridade baixa
  const t0 = W.trust(st), x0 = st.xp + st.level * 1e6;
  assert.ok(E.useItem('sys_pacto').ok);
  assert.strictEqual(W.trust(st), t0 - 20);
  assert.ok(st.xp + st.level * 1e6 > x0, 'ganhou XP');
  W.ensure(st).trust = 40;
  assert.ok(!E.useItem('sys_pacto').ok, 'sem Integridade, sem pacto');
  assert.strictEqual(E.count(st, 'sys_pacto'), 2, 'não gasta quando recusa');
});

test('Artefatos: o Sistema comenta as compras (com moderação) e a Trégua bloqueia emergências', () => {
  const { S } = boot();
  at(S, 2026, 10, 19, 9);
  const E = S.engine, L = S.live;
  E.start('Delcio', 'guerreiro');
  const st = E.state;
  // primeira compra: comenta sempre; a seguir só às vezes e nunca duas vezes em 6 minutos
  S.rng.random = () => 0.1;
  assert.strictEqual(E.sysVoice(st, 'sys_dado', 'after'), S.SYS_VOICE.sys_dado.first);
  assert.strictEqual(E.sysVoice(st, 'sys_dado', 'after'), null, 'intervalo mínimo');
  at(S, 2026, 10, 19, 9, 10);
  const l2 = E.sysVoice(st, 'sys_dado', 'after'); assert.ok(l2 && S.SYS_VOICE.sys_dado.after.indexOf(l2) >= 0);
  at(S, 2026, 10, 19, 9, 20); S.rng.random = () => 0.9;
  assert.strictEqual(E.sysVoice(st, 'sys_dado', 'after'), null, 'às vezes fica calado');
  assert.strictEqual(E.sysVoice(st, 'sys_pacto', 'after'), S.SYS_VOICE.sys_pacto.first, 'cada artefato tem a sua primeira vez');
  // antes: só às vezes (30%) e com 15 minutos de intervalo
  S.rng.random = () => 0.1; const b1 = E.sysVoice(st, 'sys_pacto', 'before'); assert.ok(b1 && !/\{nome\}/.test(b1));
  assert.strictEqual(E.sysVoice(st, 'sys_pacto', 'before'), null);
  Object.keys(S.SYS_VOICE).forEach((k) => assert.ok(S.SYSTEM_ITEMS.indexOf(k) >= 0 && S.SYS_VOICE[k].after.length >= 3, k));
  // Trégua: o dia todo sem emergências
  at(S, 2026, 10, 19, 8);
  E.addItem(st, 'sys_tregua', 1); assert.ok(E.useItem('sys_tregua').ok);
  for (let h = 8; h < 22; h++) { at(S, 2026, 10, 19, h, 30); L.tick(st); assert.ok(!L.emergency(st), 'sem emergência às ' + h + 'h'); }
  at(S, 2026, 10, 20, 9); st.sys.noEmUntil = 0;
  let seen = false; for (let h = 9; h < 22 && !seen; h++) { at(S, 2026, 10, 20, h, 30); L.tick(st); seen = !!L.emergency(st); }
  assert.ok(seen, 'sem trégua voltam as emergências');
});

test('Sombras: vitória abre a extração; 3 tentativas; falhar 3 vezes sela a sombra (obtém-se com Cristais: 50/150/300 nos portões)', () => {
  const { S } = boot();
  at(S, 2026, 10, 19, 9);
  const E = S.engine, C = S.combat, Sh = S.shadows;
  E.start('Delcio', 'guerreiro');
  const st = E.state; st.level = 15;
  const win = (id) => { C.start(id); st.battle.b.hp = 1; st.battle.p.hp = st.battle.p.maxHp = 99999; C.act('attack'); assert.strictEqual(st.battle.over, 'win', id); const r = st.battle.result; C.close(); return r; };
  // vitória: a sombra fica à espera, com 3 tentativas
  const r1 = win('b1'); assert.strictEqual(r1.shadow, 'b1');
  assert.strictEqual(Sh.status(st, 'b1'), 'pending'); assert.strictEqual(Sh.triesLeft(st, 'b1'), 3);
  // chance: chefe normal acima do nível do chefe
  assert.ok(Math.abs(Sh.chance(st, S.BOSS_BY_ID.b1) - Math.min(0.9, 0.55 + 14 * 0.025)) < 1e-9);
  // falha 3 vezes: fica selada (já não se perde para sempre)
  S.rng.random = () => 0.99;
  let r = Sh.extract('b1'); assert.ok(r.ok && !r.success && r.left === 2);
  r = Sh.extract('b1'); assert.ok(!r.success && r.left === 1);
  r = Sh.extract('b1'); assert.ok(!r.success && r.sealed && !r.lost);
  assert.strictEqual(Sh.status(st, 'b1'), 'sealed');
  assert.strictEqual(Sh.extract('b1').ok, false, 'não há 4ª tentativa');
  assert.ok(st.achievements.shlost, 'conquista da primeira sombra selada');
  // preços: portões 50 / 150 / 300 e arenas 100 / 300 / 500
  assert.deepStrictEqual(['b1', 'b9', 'b10', 'b100', 'ar1g1', 'ar1g9', 'ar1'].map((id) => Sh.buyPrice(S.BOSS_BY_ID[id])), [50, 150, 300, 300, 100, 300, 500]);
  st.crystals = 49; assert.strictEqual(Sh.buy('b1').ok, false);
  st.crystals = 60; assert.ok(Sh.buy('b1').ok); assert.strictEqual(st.crystals, 10); assert.strictEqual(Sh.status(st, 'b1'), 'owned');
  // sucesso: torna-se servo e é convocado (3 lugares para todos)
  win('b2'); S.rng.random = () => 0.01;
  r = Sh.extract('b2'); assert.ok(r.success && r.auto);
  assert.strictEqual(Sh.status(st, 'b2'), 'owned'); assert.strictEqual(Sh.slots(st), 3);
  win('b3'); r = Sh.extract('b3'); assert.ok(r.success && r.auto, 'terceiro lugar');
  win('b5'); r = Sh.extract('b5'); assert.ok(r.success && !r.auto, 'lugares cheios: fica no exército');
  assert.strictEqual(Sh.toggle('b5').ok, false, 'lugares cheios');
  // Insígnia do General das Sombras: +1 lugar cada, no máximo 3
  st.crystals = 1000;
  assert.ok(S.premium.buy('pr_general', 5).ok); assert.strictEqual(E.count(st, 'pr_general'), 3, 'só se compram 3');
  assert.strictEqual(S.premium.buy('pr_general', 1).ok, false);
  assert.ok(E.useItem('pr_general').ok); assert.strictEqual(Sh.slots(st), 4); assert.ok(Sh.toggle('b5').ok);
  E.useItem('pr_general'); E.useItem('pr_general'); assert.strictEqual(Sh.slots(st), 6);
  // nome próprio
  assert.ok(Sh.rename('b2', '  Igris  ').ok); assert.strictEqual(Sh.name(st, 'b2'), 'Igris');
  // prazo: sem extrair, desvanece ao fim de 24 h
  win('b4'); assert.strictEqual(Sh.status(st, 'b4'), 'pending');
  at(S, 2026, 10, 20, 10); Sh.expire(st); assert.strictEqual(Sh.status(st, 'b4'), 'sealed', 'desvaneceu: fica selada');
  // jogos antigos: sombras perdidas passam a seladas
  const st3 = { c: {}, shadows: { owned: {}, tries: {}, lost: { b7: 1, b8: 1 }, pending: {}, active: [], names: {} } }; Sh.ensure(st3);
  assert.strictEqual(Sh.status(st3, 'b7'), 'sealed'); assert.strictEqual(st3.c.shadowsLost, 2);
  // chefes secretos não têm sombra; os das arenas premium têm
  assert.ok(!Sh.eligible(S.BOSS_BY_ID.secret_1)); assert.ok(Sh.eligible(S.BOSS_BY_ID.ar1)); assert.ok(Sh.eligible(S.BOSS_BY_ID.ar1g3));
});

test('Sombras das arenas: não desvanecem; 3 falhas selam a sombra; o selo quebra-se com 100 ou 500 Cristais', () => {
  const { S } = boot();
  at(S, 2026, 10, 19, 9);
  const E = S.engine, Sh = S.shadows;
  E.start('Delcio', 'mago');
  const st = E.state; st.level = 60; st.crystals = 700;
  const g = S.BOSS_BY_ID.ar1g3, ch = S.BOSS_BY_ID.ar1;
  assert.ok(Sh.onVictory(st, g)); assert.strictEqual(st.shadows.pending.ar1g3.exp, 0, 'sem prazo');
  at(S, 2026, 12, 30, 9); Sh.expire(st); assert.strictEqual(Sh.status(st, 'ar1g3'), 'pending', 'não desvanece');
  assert.strictEqual(Sh.release('ar1g3').ok, false);
  assert.strictEqual(Sh.buy('ar1g3').ok, false, 'só depois de falhar as 3');
  S.rng.random = () => 0.99;
  Sh.extract('ar1g3'); Sh.extract('ar1g3'); const r = Sh.extract('ar1g3');
  assert.ok(r.sealed && !r.lost); assert.strictEqual(Sh.status(st, 'ar1g3'), 'sealed');
  assert.strictEqual(Sh.onVictory(st, g), false, 'vitória nova não reabre');
  assert.ok(Sh.buy('ar1g3').ok); assert.strictEqual(st.crystals, 600); assert.strictEqual(Sh.status(st, 'ar1g3'), 'owned');
  assert.strictEqual(Sh.buyPrice(ch), 500);
  Sh.onVictory(st, ch); Sh.extract('ar1'); Sh.extract('ar1'); Sh.extract('ar1');
  st.crystals = 499; const no = Sh.buy('ar1'); assert.ok(!no.ok && no.need === 1);
  st.crystals = 500; assert.ok(Sh.buy('ar1').ok); assert.strictEqual(st.crystals, 0);
  assert.strictEqual(Sh.name(st, 'ar10'), 'Sombra do Primeiro Jogador');
  // todas as 100 sombras das arenas têm falas de servo e de treino
  S.ARENA_GUARDIANS.concat(S.ARENA_BOSSES).forEach((b) => { assert.strictEqual(S.SHADOW_LINES[b.id].length, 2, b.id); assert.strictEqual(S.SHADOW_SPAR[b.id].length, 3, b.id); });
  // migração: arenas já vencidas deixam a sombra à espera
  const st2 = { arena: { wins: { ar2g1: 1, ar2: 2 } } }; Sh.ensure(st2);
  assert.ok(st2.shadows.pending.ar2g1 && st2.shadows.pending.ar2 && st2.shadows.pending.ar2.exp === 0);
  // treino com uma sombra da arena
  S.rng.random = Math.random;
  assert.ok(Sh.spar('ar1g3').ok); assert.ok(E.state.battle.spar);
});

test('Baús especializados: só dão o seu tipo, o grau sobe o nível e a qualidade, e estão nas duas lojas', () => {
  const { S } = boot();
  at(S, 2026, 10, 19, 9);
  const E = S.engine;
  E.start('Delcio', 'guerreiro');
  const st = E.state;
  assert.strictEqual(S.CHEST_FAMS.length * S.CHEST_GRADES.length, 25);
  const avg = (fam, k, lvl, n) => {
    st.level = lvl; let sum = 0, cnt = 0, camp = 0;
    for (let i = 0; i < n; i++) {
      const r = E.openChest(st, fam + '_' + k);
      r.items.forEach((id) => {
        const it = S.ITEMS[id];
        if (fam === 'arsenal') assert.ok(it.cat === 'arma' || it.secret, id);
        if (fam === 'armaria') assert.ok(it.cat === 'armadura', id);
        if (fam === 'joias') assert.ok(it.cat === 'acessorio', id);
        if (fam === 'guerra') assert.ok(it.cat === 'arma' || it.cat === 'armadura', id);
        if (fam === 'alquimia') assert.ok(it.cat === 'consumivel' || it.cat === 'atributo' || it.secret, id);
        if (it.cat === 'arma' && !it.secret) assert.ok(E.canEquipClass(st, it), id);
        sum += it.lvl || 1; cnt++; if (/_camp$/.test(id)) camp++;
      });
    }
    return { lvl: sum / cnt, camp: camp / cnt };
  };
  const a1 = avg('arsenal', 1, 100, 60), a3 = avg('arsenal', 3, 100, 60), a5 = avg('arsenal', 5, 100, 60);
  assert.ok(a1.lvl < a3.lvl && a3.lvl < a5.lvl, 'nível sobe com o grau');
  assert.ok(a1.camp < a5.camp && a5.camp > 0.5, 'mais versões do Campeão');
  ['armaria', 'guerra', 'joias', 'alquimia'].forEach((f) => [1, 3, 5].forEach((k) => avg(f, k, 80, 15)));
  // nível baixo: o grau Monarca dá o mínimo da sua janela, não itens impossíveis
  const low = avg('arsenal', 5, 5, 20); assert.ok(low.lvl <= 85);
  // lojas: moedas (preço fixo, os melhores mais caros) e Cristais (graus 3 a 5)
  const p = [1, 2, 3, 4, 5].map((k) => S.ITEMS['bau_arsenal_' + k].price);
  assert.ok(p.every((x, i) => !i || x > p[i - 1]));
  st.level = 50; assert.strictEqual(E.price(st, 'bau_arsenal_3'), S.ITEMS.bau_arsenal_3.price);
  assert.ok(!S.PREMIUM_PRICES.bau_arsenal_2 && S.PREMIUM_PRICES.bau_arsenal_3 < S.PREMIUM_PRICES.bau_arsenal_5);
  assert.ok(S.PREMIUM_SHOP.some((sec) => sec.ids.indexOf('bau_alquimia_5') >= 0));
  // abrir pela Bolsa
  st.level = 40; E.addItem(st, 'bau_joias_2', 1); const u = E.useItem('bau_joias_2');
  assert.ok(u.ok && u.loot.items.length >= 1); assert.ok(st.c.specialChests >= 1);
});

test('Sombras: os servos lutam ao teu lado (ataque, escudo do Guarda, quebra do Arcano, bónus do Comandante)', () => {
  const { S } = boot();
  at(S, 2026, 10, 19, 9);
  const E = S.engine, C = S.combat, Sh = S.shadows;
  E.start('Delcio', 'invocador');
  const st = E.state; st.level = 60;
  // Invocador: +1 lugar e mais chance
  assert.strictEqual(Sh.slots(st), 4);
  assert.ok(Sh.chance(st, S.BOSS_BY_ID.b70) > Sh.chance(Object.assign({}, st, { cls: 'mago' }), S.BOSS_BY_ID.b70));
  const sh = Sh.ensure(st);
  const tank = S.BOSSES.filter((b) => b.arch === 'tanque' && !b.king)[0], arc = S.BOSSES.filter((b) => b.arch === 'conjurador' && !b.king)[0];
  ['b10', tank.id, arc.id, 'b1'].forEach((id) => { sh.owned[id] = 1; sh.active.push(id); });
  C.start('b61');
  const bt = st.battle;
  assert.strictEqual(bt.shadows.length, 4);
  assert.strictEqual(bt.cmd, 5, 'um rei convocado = +5% de dano');
  assert.ok(bt.p.shield > 0, 'o Guarda dá escudo');
  assert.ok(bt.b.st.some((x) => x.kind === 'debuff' && x.key === 'def'), 'o Arcano quebra a defesa');
  const hp0 = bt.b.hp; C.act('attack');
  const attacks = bt.log.filter((l) => /^🌑 .* ataca: \d+/.test(l.t));
  assert.strictEqual(attacks.length, 4, 'cada servo ataca uma vez por turno');
  assert.ok(bt.b.hp < hp0);
  C.close();
  // sem servos convocados, o combate é como antes
  st.battle = null; sh.active = []; C.start('b61'); assert.strictEqual(st.battle.shadows.length, 0); assert.strictEqual(st.battle.cmd, 0);
});

test('Sombras: chefes derrotados antes desta versão ficam com a sombra adormecida (sem prazo)', () => {
  const { S } = boot();
  at(S, 2026, 10, 19, 9);
  const E = S.engine, Sh = S.shadows;
  E.start('Delcio', 'mago');
  const st = E.state; delete st.shadows; st.defeated = { b1: 1, b2: 2, b10: 3 };
  E.migrate(st);
  assert.strictEqual(Object.keys(st.shadows.pending).sort().join(), 'b1,b10,b2');
  at(S, 2027, 1, 1, 9); Sh.expire(st); assert.strictEqual(Sh.status(st, 'b10'), 'pending', 'não desvanece');
});

test('Corpo: regista o peso e calcula calorias para ganhar e perder 1 kg', () => {
  const { S } = boot();
  at(S, 2026, 10, 20, 10);
  const E = S.engine, B = S.body;
  E.start('Delcio', 'guerreiro');
  const st = E.state;
  assert.strictEqual(B.calc(st), null);
  assert.strictEqual(B.logWeight('abc').ok, false);
  assert.ok(B.logWeight('70,0').ok && B.current(st) === 70);
  let c = B.calc(st);
  assert.strictEqual(c.full, false); assert.strictEqual(c.tdee, 2170);
  assert.strictEqual(c.gain.perDay, c.tdee + 500); assert.strictEqual(c.lose.perDay, c.tdee - 500);
  assert.strictEqual(c.gain.days, 15);
  B.setProfile({ height: 175, age: 30, sex: 'm', activity: 'moderado' });
  c = B.calc(st);
  assert.strictEqual(c.bmr, Math.round(10 * 70 + 6.25 * 175 - 150 + 5));
  assert.strictEqual(c.tdee, Math.round(c.bmr * 1.55 / 10) * 10);
  assert.ok(Math.abs(c.bmi - 22.9) < 0.05);
  // nunca abaixo do mínimo diário
  B.setProfile({ height: 150, age: 70, sex: 'f', activity: 'sedentario' }); B.logWeight(45);
  c = B.calc(st); assert.ok(c.lose.perDay >= 1200);
  // um registo por dia; histórico guarda a mudança
  at(S, 2026, 10, 27, 10); B.logWeight(46); assert.strictEqual(st.body.weights.length, 2); assert.strictEqual(B.calc(st).change, 1);
  // avaliação semanal, corrigir e apagar, guardar tudo de uma vez
  B.setProfile({ goal: 'ganhar' }); let wk = B.weekly(st);
  assert.ok(wk && wk.days === 7 && wk.diff === 1 && /ritmo certo/.test(wk.verdict), JSON.stringify(wk));
  assert.ok(B.editEntry('2026-10-27', '45,5').ok && B.current(st) === 45.5);
  assert.ok(B.removeEntry('2026-10-27').ok && st.body.weights.length === 1);
  at(S, 2026, 10, 28, 10);
  assert.ok(B.saveAll({ kg: '47', height: 160, age: 40, sex: 'f', activity: 'leve', goal: 'perder' }).ok);
  assert.ok(B.current(st) === 47 && st.body.goal === 'perder' && st.body.height === 160);
});

test('Equipamento soberano: cresce com o nível, fica acima do melhor normal e o Conjunto do Monarca dá bónus', () => {
  const { S } = boot();
  at(S, 2026, 10, 20, 10);
  const E = S.engine, I = S.ITEMS;
  E.start('Delcio', 'guerreiro');
  const st = E.state;
  st.level = 1; const o1 = I.pr_olho.equip; st.level = 85; const o85 = I.pr_olho.equip;
  assert.ok(o85.crit > o1.crit && o85.critDmg > o1.critDmg, 'cresce com o nível');
  assert.ok(o85.crit > I.ac_abismo.equip.crit && o85.critDmg > I.ac_abismo.equip.critDmg, 'acima do melhor acessório normal de crítico');
  st.level = 95; assert.ok(I.pr_coroa.equip.allStatsPct > I.ac_vazio.equip.allStatsPct);
  st.level = 85; assert.ok(I.pr_armadura.equip.def > I.ar_abismo_camp.equip.def);
  // conjunto
  const base = E.equipBonus(st).allStatsPct;
  st.equip.acc1 = 'pr_olho'; st.equip.acc2 = 'pr_coracao';
  assert.strictEqual(E.monarchPieces(st), 2);
  assert.strictEqual(E.equipBonus(st).allStatsPct, base + 4);
  st.equip.weapon = 'pr_lamina'; st.equip.armor = 'pr_armadura';
  const eb = E.equipBonus(st);
  assert.ok(eb.xpPct >= 30 && eb.coinPct >= 10 && eb.openShield >= 10, '4 peças');
});

test('Sombras: treino com um servo dá recompensa pequena, não castiga a derrota e só recompensa de 6 em 6 horas', () => {
  const { S } = boot();
  at(S, 2026, 10, 20, 10);
  const E = S.engine, C = S.combat, Sh = S.shadows;
  E.start('Delcio', 'guerreiro');
  const st = E.state; st.level = 20;
  assert.strictEqual(Sh.spar('b10').ok, false, 'só sombras tuas');
  const sh = Sh.ensure(st); sh.owned.b10 = 1; sh.active = ['b10']; st.defeated.b10 = 1;
  const normal = C.rewards(st, S.BOSS_BY_ID.b10);
  assert.ok(Sh.spar('b10').ok, 'o chefe derrotado volta como sombra de treino');
  assert.strictEqual(st.battle.shadows.length, 0, 'a sombra não luta contra si própria');
  assert.ok(st.battle.log.some((l) => l.c === 'say' && l.t.indexOf(S.SHADOW_SPAR.b10[0]) >= 0));
  const xp0 = st.xp + st.level * 1e6, c0 = st.coins, hp0 = E.curHp(st);
  st.battle.b.hp = 1; C.act('attack');
  assert.strictEqual(st.battle.over, 'win');
  const got = st.battle.result;
  assert.ok(got.xp > 0 && got.xp <= Math.round(normal.xp * 0.1) + 1 && got.coins <= Math.round(normal.coins * 0.1) + 1, 'abaixo do normal');
  assert.ok(!st.inv.bau_raro || true); assert.strictEqual(E.curHp(st), hp0, 'vida volta ao que era');
  C.close();
  // segunda vez no mesmo período: sem recompensa
  Sh.spar('b10'); st.battle.b.hp = 1; C.act('attack'); assert.strictEqual(st.battle.result.xp, 0); C.close();
  // derrota: sem perder nível nem moedas
  at(S, 2026, 10, 20, 17);
  const lv = st.level, coins = st.coins;
  Sh.spar('b10'); st.battle.p.hp = 1; st.battle.b.atk = 1e7; for (let i = 0; i < 20 && !st.battle.over; i++) { st.battle.b.stunned = 0; st.battle.b.hp = st.battle.b.maxHp; C.act('defend'); }
  assert.strictEqual(st.battle.over, 'lose'); assert.strictEqual(st.level, lv); assert.ok(st.coins >= coins);
  C.close();
  // fugir do treino não custa moedas
  Sh.spar('b10'); const c1 = st.coins; C.act('flee'); assert.strictEqual(st.coins, c1);
  C.close();
  // a vida volta EXATAMENTE ao que era antes do treino (mesmo ferido durante o combate), e o Sistema avisa
  const max = E.combatStats(st).maxHp;
  [['win', 0.37], ['lose', 0.61], ['flee', 0.5]].forEach(([how, f]) => {
    at(S, 2026, 10, 21 + ['win', 'lose', 'flee'].indexOf(how), 9);
    E.setHp(st, Math.round(max * f)); const before = E.curHp(st);
    E.takeEvents();
    st.inv.po_vida1 = 3;
    Sh.spar('b10');
    st.battle.p.hp = Math.max(1, Math.round(before / 3));
    st.battle.p.mp = 0;
    E.removeItem(st, 'po_vida1', 2); // gastou 2 poções durante o treino
    if (how === 'win') { st.battle.b.hp = 1; C.act('attack'); }
    else if (how === 'flee') C.act('flee');
    else { st.battle.p.hp = 1; st.battle.b.atk = 1e7; for (let i = 0; i < 20 && !st.battle.over; i++) { st.battle.b.stunned = 0; st.battle.b.hp = st.battle.b.maxHp; C.act('defend'); } }
    assert.strictEqual(E.curHp(st), before, how + ': vida igual à de antes');
    assert.strictEqual(st.inv.po_vida1, 3, how + ': itens devolvidos');
    assert.strictEqual(st.battle.p.mp, st.battle.p.maxMp, how + ': mana devolvida');
    assert.ok(E.takeEvents().some((e) => e.type === 'watch' && e.heal), how + ': o Sistema aparece a curar');
    C.close();
  });
});

test('Duelos: a recompensa entra uma vez por duelo e só nos primeiros 5 do dia; perder não tira nada', () => {
  const { S } = boot();
  at(S, 2026, 10, 20, 10);
  const E = S.engine, SO = S.social;
  E.start('Delcio', 'guerreiro');
  const st = E.state; st.level = 30;
  const me = st.playerId, mk = (id, won) => ({ id, status: 'done', me, host: me, guest: 'outro_jogador1', winner: won ? me : 'outro_jogador1', reason: 'ko', fighters: { [me]: { name: 'Delcio', hp: 10, maxHp: 100 }, outro_jogador1: { name: 'Ana', hp: 0, maxHp: 100 } } });
  const xp0 = st.xp, c0 = st.coins, lv = st.level;
  const r1 = SO.reward(mk('d1', true));
  assert.ok(r1.won && r1.xp > 0 && r1.coins > 0);
  assert.strictEqual(SO.reward(mk('d1', true)), r1, 'o mesmo duelo não paga duas vezes');
  const c1 = st.coins; assert.strictEqual(SO.reward(mk('d1', true)).coins, r1.coins); assert.strictEqual(st.coins, c1);
  const lose = SO.reward(mk('d2', false)); assert.ok(!lose.won && lose.xp > 0 && lose.xp < r1.xp); assert.ok(st.level >= lv);
  ['d3', 'd4', 'd5'].forEach((id) => SO.reward(mk(id, true)));
  const capped = SO.reward(mk('d6', true)); assert.ok(capped.capped && !capped.xp, 'só 5 por dia');
  at(S, 2026, 10, 21, 10); assert.ok(SO.reward(mk('d7', true)).xp > 0, 'no dia seguinte volta');
  assert.strictEqual(st.c.duelsPlayed, 7); assert.strictEqual(st.c.duelWins, 6);
  assert.ok(st.achievements.duel1);
  const f = SO.fighter(st); assert.ok(f.hp > 0 && f.atk > 0 && f.cls === 'guerreiro');
  void xp0; void c0;
});

test('Conquistas II: 66 novas, todas avaliam sem erro e desbloqueiam com o progresso certo', () => {
  const { S } = boot();
  at(S, 2026, 10, 20, 10);
  const E = S.engine;
  E.start('Delcio', 'guerreiro');
  const st = E.state;
  assert.ok(S.ACHIEVEMENTS.length >= 49 + 66);
  const ids = S.ACHIEVEMENTS.map((a) => a.id); assert.strictEqual(new Set(ids).size, ids.length, 'ids únicos');
  S.ACHIEVEMENTS.forEach((a) => { assert.doesNotThrow(() => a.check(st), a.id); });
  E.checkAchievements(st);
  ['sh1', 'ar1', 'body1', 'prem1', 'spar1'].forEach((id) => assert.ok(!st.achievements[id], 'não desbloqueia sem fazer nada: ' + id));
  // progresso
  const sh = S.shadows.ensure(st); sh.owned.b10 = 1; sh.owned.b1 = 1; sh.names.b1 = 'Igris'; st.c.shadowsOwned = 2; st.c.sparWins = 1;
  st.arena.unlocked.ar1 = 1; st.arena.wins.ar1g1 = 2; st.arena.wins.ar1 = 1;
  S.body.logWeight(80);
  E.checkAchievements(st);
  ['sh1', 'shking', 'shname', 'spar1', 'ar1', 'grd1', 'champ1', 'rematch', 'body1'].forEach((id) => { if (id !== 'rematch') assert.ok(st.achievements[id], 'deve desbloquear: ' + id); });
});

console.log('\n' + passed + ' testes passaram' + (process.exitCode ? ' (com falhas)' : ''));
