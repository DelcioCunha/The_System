/* Gera server/src/duel-data.js a partir dos dados do jogo: as habilidades ativas e os itens
   de combate, para o servidor decidir os duelos com as mesmas regras do combate contra chefes.
   Corre sozinho em cada build (node build.js). */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
module.exports = function exportDuelData() {
  const ctx = { console, Math, Date, JSON }; ctx.globalThis = ctx; vm.createContext(ctx);
  const ORDER = require('../build-order.json');
  ORDER.filter((f) => f.includes('/data/')).forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }));
  const S = ctx.SYS;
  const skills = {};
  const add = (s, c) => { if (s.type === 'active') skills[s.id] = { n: s.name, mp: s.mp, cd: s.cd, u: s.unlock || 1, c, ops: s.ops }; };
  Object.keys(S.CLASS_SKILLS).forEach((cls) => S.CLASS_SKILLS[cls].forEach((s) => add(s, cls)));
  (S.COMMON_SKILLS || []).forEach((s) => add(s, '*'));
  (S.SECRET_SKILLS || []).forEach((s) => add(s, 'secret'));
  const items = {};
  Object.keys(S.ITEMS).forEach((id) => {
    const it = S.ITEMS[id];
    if (!it.battle || !it.use || it.use.type === 'smoke') return;
    items[id] = { n: it.name, use: it.use, prem: !!it.premium, perma: !!it.perma };
  });
  const main = {}; Object.keys(S.CLASSES).forEach((c) => { main[c] = S.CLASSES[c].main; });
  const out = '/* GERADO por tools/export-duel-data.js a partir dos dados do jogo. Não editar à mão. */\n' +
    'export const DUEL_SKILLS = ' + JSON.stringify(skills) + ';\n' +
    'export const DUEL_ITEMS = ' + JSON.stringify(items) + ';\n' +
    'export const CLASS_MAIN = ' + JSON.stringify(main) + ';\n' +
    'export const HEAL_LIMIT = ' + JSON.stringify((S.PREMIUM_RULES && 3) || 3) + ';\n' +
    'export const DOT_NAMES = { burn: "queimadura", poison: "veneno", bleed: "sangramento" };\n' +
    'export const BUFF_NAMES = { atk: "Ataque", matk: "Ataque mágico", def: "Defesa", crit: "Crítico", eva: "Esquiva", lifesteal: "Roubo de vida", reflect: "Reflexão" };\n';
  const file = path.join(ROOT, 'server', 'src', 'duel-data.js');
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== out) fs.writeFileSync(file, out);
  return { skills: Object.keys(skills).length, items: Object.keys(items).length };
};
if (require.main === module) console.log(module.exports());
