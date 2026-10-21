/* Calibra a força de cada classe nos duelos: torneios simulados entre as 6 classes em cada nível,
   subindo a força de quem perde muito e baixando a de quem ganha muito. Uso: node tools/pvp-tune.mjs
   Escreve a tabela final; copia-a para PVP_K em server/src/index.js. */
import fs from 'node:fs'; import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { handle } from '../server/src/index.js';
import { DUEL_SKILLS } from '../server/src/duel-data.js';
const MIG = new URL('../server/migrations', import.meta.url).pathname;
const db = new DatabaseSync(':memory:'); fs.readdirSync(MIG).sort().forEach((f) => db.exec(fs.readFileSync(path.join(MIG, f), 'utf8')));
function stmt(sql, args) { const exec = (fn) => { const s = db.prepare(sql); return fn(s, args.map((a) => (a === undefined ? null : a))); };
  return { bind: (...a) => stmt(sql, a), first: async () => exec((s, a) => s.get(...a) || null), all: async () => ({ results: exec((s, a) => s.all(...a)) }),
    run: async () => exec((s, a) => { const r = s.run(...a); return { meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; }),
    _sync: () => exec((s, a) => { if (/^\s*(SELECT|.*RETURNING)/is.test(sql)) return { results: s.all(...a) }; const r = s.run(...a); return { meta: { changes: Number(r.changes) } }; }) }; }
const DB = { prepare: (sql) => stmt(sql, []), batch: async (l) => { db.exec('BEGIN'); try { const o = l.map((s) => s._sync()); db.exec('COMMIT'); return o; } catch (e) { db.exec('ROLLBACK'); throw e; } } };
const env = { DB, MODE: 'production', CODE_PEPPER: 'p' };
let ipn = 0;
const C = async (u, b) => { const r = await handle(new Request('https://x' + u, { method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '10.0.' + (ipn++ % 250) + '.1' }, body: JSON.stringify(b) }), env, null); return r.json(); };
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const B = require('../tests/balance.js');
const snaps = {};
for (const cls of ['guerreiro', 'assassino', 'mago', 'guardiao', 'arqueiro', 'invocador']) for (const L of [10, 30, 60, 100]) {
  const G = B.boot(); B.hero(G, cls, L); const st = G.engine.state, c = G.engine.combatStats(st), t = G.engine.totalStats(st);
  snaps[cls + L] = Object.assign({}, c, { cls, hp: c.maxHp, mp: c.maxMp, agi: t.agi, skills: G.combat.unlockedActiveSkills(st).map((s) => s.id), items: { po_vida2: 3, po_mana15: 2 } });
}
let pc = 0;
async function player(cls, L) { const id = 'jogador_sim' + (pc++).toString().padStart(6, '0'), tok = 'token-simulacao-' + id + 'xxxxxxxx'; await C('/api/player/sync', { player_id: id, token: tok, name: cls, cls, level: L }); return { id, tok }; }
function choose(F) {
  if (F.stunned > 0) return { action: 'pass' };
  if (F.hp < F.maxHp * 0.35 && (F.used.po_vida2 || 0) < 3 && F.heals < 3) return { action: 'item', item: 'po_vida2' };
  const val = (o) => o.op === 'dmg' ? o.mult * (o.hits || 1) : o.op === 'summon' ? (F.summons.some((x) => x.name === o.name) ? 0 : o.mult * o.turns * 0.6) : o.op === 'dot' ? o.mult * o.turns * 0.5 : o.op === 'buff' ? (F.st.some((x) => x.key === o.key) ? 0 : 0.8) : o.op === 'debuff' ? 0.7 : o.op === 'stun' ? 0.5 : o.op === 'heal' ? (F.hp < F.maxHp * 0.6 ? o.pct / 20 : 0) : 0.2;
  const ready = F.skills.filter((id) => !(F.cds[id] > 0) && DUEL_SKILLS[id].mp <= F.mp);
  const best = ready.map((id) => [id, DUEL_SKILLS[id].ops.reduce((s, o) => s + val(o), 0)]).filter((x) => x[1] > 1).sort((a, b) => b[1] - a[1])[0];
  return best ? { action: 'skill', skill: best[0] } : { action: 'attack' };
}
async function duel(c1, c2, L, L2) {
  const A = await player(c1, L), Bp = await player(c2, L2 || L);
  const cr = await C('/api/duel/create', { player_id: A.id, token: A.tok, fighter: snaps[c1 + L] });
  let d = (await C('/api/duel/join', { player_id: Bp.id, token: Bp.tok, code: cr.duel.code, fighter: snaps[c2 + (L2 || L)] })).duel;
  const tok = { [A.id]: A.tok, [Bp.id]: Bp.tok };
  let g = 0;
  while (d.status === 'active' && g++ < 300) {
    const F = d.fighters[d.turn];
    const r = await C('/api/duel/act', Object.assign({ player_id: d.turn, token: tok[d.turn], id: d.id, version: d.version }, choose(F)));
    if (!r.ok) { const r2 = await C('/api/duel/act', { player_id: d.turn, token: tok[d.turn], id: d.id, action: 'attack' }); d = r2.duel; } else d = r.duel;
  }
  return { won: d.winner === A.id, turns: d.turn_no };
}
const CL = ['guerreiro', 'assassino', 'mago', 'guardiao', 'arqueiro', 'invocador'];
const LV = [10, 30, 60, 100], ROUNDS = +(process.argv[2] || 6), PER = +(process.argv[3] || 6);
globalThis.__PVP_K = {}; CL.forEach((c) => { globalThis.__PVP_K[c] = [1, 1, 1, 1]; });
const hist = {}; CL.forEach((c) => { hist[c] = [[], [], [], []]; });
for (let li = 0; li < LV.length; li++) {
  const L = LV[li];
  for (let r = 0; r < ROUNDS; r++) {
    const wins = {}; CL.forEach((c) => { wins[c] = [0, 0]; });
    for (const a of CL) for (const b of CL) if (a < b) for (let i = 0; i < PER; i++) { const x = await duel(a, b, L); wins[a][1]++; wins[b][1]++; wins[x.won ? a : b][0]++; }
    const wr = {}; CL.forEach((c) => { wr[c] = wins[c][0] / wins[c][1]; });
    console.log('Nv', L, 'ronda', r + 1, CL.map((c) => c + ' ' + Math.round(wr[c] * 100) + '% (k ' + globalThis.__PVP_K[c][li].toFixed(2) + ')').join(' '));
    if (r >= ROUNDS / 2) CL.forEach((c) => hist[c][li].push(globalThis.__PVP_K[c][li]));
    // passo pequeno (a resposta é quase em degrau) e média geométrica 1
    CL.forEach((c) => { const k = globalThis.__PVP_K[c]; k[li] = k[li] * Math.pow(0.5 / Math.min(0.95, Math.max(0.05, wr[c])), 0.12); });
    const gm = Math.exp(CL.reduce((s2, c) => s2 + Math.log(globalThis.__PVP_K[c][li]), 0) / CL.length);
    CL.forEach((c) => { globalThis.__PVP_K[c][li] /= gm; });
  }
  CL.forEach((c) => { const h = hist[c][li]; globalThis.__PVP_K[c][li] = h.reduce((a2, b2) => a2 + b2, 0) / h.length; });
}
console.log('PVP_K = ' + JSON.stringify(Object.fromEntries(CL.map((c) => [c, globalThis.__PVP_K[c].map((x) => +x.toFixed(2))]))));
