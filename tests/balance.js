/* Simulação de equilíbrio: node tests/balance.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ORDER = require('../build-order.json');
function boot() {
  const store = {};
  const ctx = { console, Math, Date, JSON, localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } } };
  ctx.globalThis = ctx; vm.createContext(ctx);
  ORDER.forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx));
  const t = new Date(2026, 9, 14, 9).getTime(); ctx.SYS.clock.now = () => t;
  if (!process.env.REALSAVE) ctx.SYS.storage.write = () => true; // mais rápido
  return ctx.SYS;
}
const MAIN = { guerreiro: 'str', assassino: 'agi', mago: 'int', guardiao: 'vit', arqueiro: 'per', invocador: 'int' };
function hero(S, cls, L) {
  const E = S.engine; E.start('Herói', cls); const st = E.state; st.daily.enabled = false;
  E.gainXp(st, S.totalXpForLevel(L), false); E.takeEvents();
  const n = st.freePoints, m = MAIN[cls];
  const sec = cls === 'guardiao' ? 'str' : 'vit';
  st.alloc[m] += Math.round(n * 0.6); st.alloc[sec] += n - Math.round(n * 0.6); st.freePoints = 0;
  S.STATS.forEach(k => { st.trained[k] = L * 0.15; });
  let t = 0; S.CLASS_WEAPONS[cls].forEach((id, i) => { if (L >= S.ITEMS[id].lvl) t = i; });
  st.equip.weapon = S.CLASS_WEAPONS[cls][t];
  let a = 0; [1, 10, 25, 45, 65, 85].forEach((lv, i) => { if (L >= lv) a = i; });
  st.equip.armor = ['ar_couro', 'ar_malha', 'ar_escamas', 'ar_runica', 'ar_celeste', 'ar_soberano'][a];
  E.addItem(st, 'po_vida2', 3); E.addItem(st, 'po_mana1', 3);
}
function fight(S) {
  const E = S.engine, C = S.combat; let g = 0;
  while (!E.state.battle.over && g++ < 500) {
    const bt = E.state.battle;
    if (bt.p.stunned > 0) { C.act('pass'); continue; }
    if (bt.p.hp < bt.p.maxHp * 0.3 && E.count(E.state, 'po_vida2')) { C.act('item', 'po_vida2'); continue; }
    if (bt.p.mp < bt.p.maxMp * 0.15 && E.count(E.state, 'po_mana1')) { C.act('item', 'po_mana1'); continue; }
    const avail = C.unlockedActiveSkills(E.state).filter(s => !(bt.p.cds[s.id] > 0) && bt.p.mp >= S.skillCost(s, E.state.cls, E.state.level));
    const score = (s) => s.ops.reduce((t, o) => t + (o.op === 'dmg' ? o.mult * (o.hits || 1) : o.op === 'summon' ? o.mult * o.turns * 0.8 : o.op === 'dot' ? o.mult * o.turns * 0.6 : 0), 0);
    const heal = avail.find(s => s.ops.some(o => o.op === 'heal' || o.op === 'shield'));
    if (heal && bt.p.hp < bt.p.maxHp * 0.45) { C.act('skill', heal.id); continue; }
    const buff = avail.find(s => s.ops.every(o => o.op === 'buff' || o.op === 'debuff') && !bt.p.st.some(x => x.kind === 'buff'));
    if (buff && Math.random() < 0.5) { C.act('skill', buff.id); continue; }
    const dmg = avail.filter(s => score(s) > 0).sort((a, b) => score(b) - score(a));
    dmg.length ? C.act('skill', dmg[0].id) : C.act('attack');
  }
  return [E.state.battle.over, E.state.battle.turn];
}
module.exports = { boot, hero, fight };
if (require.main === module) {
const levels = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const N = +process.env.N || 6;
const rows = {};
Object.keys(MAIN).forEach(cls => {
  rows[cls] = levels.map(L => {
    let w = 0, turns = 0;
    for (let i = 0; i < N; i++) { const S = boot(); hero(S, cls, L); S.combat.start('b' + L); const [r, t] = fight(S); if (r === 'win') w++; turns += t; }
    let ww = 0;
    if (L >= 20) for (let i = 0; i < N; i++) { const S = boot(); hero(S, cls, L - 12); S.combat.start('b' + L); if (fight(S)[0] === 'win') ww++; }
    return `${L}:${w}/${N}(${Math.round(turns / N)}t)${L >= 20 ? ' -12:' + ww : ''}`;
  });
  console.log(cls.padEnd(10), rows[cls].join('  '));
});
}
