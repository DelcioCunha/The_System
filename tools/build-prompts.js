/* Gera as folhas de prompts dos itens a partir dos dados do jogo.
   Uso: node tools/build-prompts.js
   - atualiza a secção Itens de prompts/prompts.html
   - escreve tools/item-sheets.json (ordem dos blocos, para cortar as imagens depois) */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const ctx = {}; ctx.globalThis = ctx; vm.createContext(ctx);
require('../build-order.json').slice(0, 5).forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx));
const S = ctx.SYS, I = S.ITEMS;
const ART = require('./item-art.js');
const RAR = { comum: 'grey (#9AA4B2)', incomum: 'green (#5BE08A)', raro: 'blue (#4AB8FF)', epico: 'purple (#B56CFF)', lendario: 'orange-gold (#FFB02E)', mitico: 'crimson-pink (#FF3D7F)', secreto: 'white-silver with prismatic sparkle (#E0E6FF)' };
const isVariant = (k) => /_art$|_camp$|_maior$|_anc$|_prim$|^ac_t_.*[23]$/.test(k);
const base = Object.keys(I).filter((k) => !isVariant(k));
const missing = base.filter((k) => !ART[k]);
if (missing.length) { console.error('Sem descrição:', missing.join(', ')); process.exit(1); }
const panel = (k) => ({ id: k, pt: I[k].name, en: ART[k] + ', rarity glow ' + RAR[I[k].rarity], file: 'assets/items/' + k + '.png' });

const sheets = [];
// armas de classe: 2 classes por folha (linhas 1-2 e 3-4)
const CL = [['guerreiro', 'assassino'], ['mago', 'guardiao'], ['arqueiro', 'invocador']];
CL.forEach((pair) => {
  const ids = pair.flatMap((c) => S.CLASS_WEAPONS[c]);
  sheets.push({ title: 'Armas: ' + pair.map((c) => S.CLASSES[c].name).join(' e '), cols: 5, rows: 4, ar: '5:4',
    note: 'Linhas 1–2: ' + S.CLASSES[pair[0]].name + '; linhas 3–4: ' + S.CLASSES[pair[1]].name + '. Da esquerda para a direita, cada arma é mais poderosa. As versões do Artesão e do Campeão usam a mesma imagem.',
    intro: 'Rows 1-2 are one weapon family and rows 3-4 another, each evolving from basic to legendary in reading order: more ornate, more runes, stronger glow.',
    panels: ids.map(panel) });
});
// restantes itens, por categoria, em folhas de 20 (5x4) e o resto em grelhas que encaixem
const order = ['lazer', 'arma', 'armadura', 'acessorio', 'consumivel', 'atributo', 'bau', 'secreto'];
// itens criados depois das folhas já geradas: ficam em folhas próprias no fim, para não mudar a ordem das anteriores
const EXTRA_GROUPS = [
  { title: 'Itens novos: Selo de Ascensão', ids: ['el_selo'], cols: 1, rows: 1 },
  { title: 'Itens de horário (dia e noite)', ids: ['ac_sol', 'ac_lua', 'ac_galo', 'ac_coruja', 'ac_aurora', 'ar_meianoite', 'wk_solar', 'wk_lunar', 'po_orvalho', 'po_lunar', 'po_crepusculo', 'po_horamorta'], cols: 4, rows: 3,
    intro: 'Items tied to the time of day: sun and dawn items glow with warm gold daylight, moon and night items glow with cool silver-blue moonlight.' }
];
const EXTRA = EXTRA_GROUPS.flatMap((g) => g.ids);
const rest = order.flatMap((c) => base.filter((k) => I[k].cat === c && !/^w_/.test(k) && EXTRA.indexOf(k) < 0));
const GRIDS = { 20: [5, 4], 16: [4, 4], 15: [5, 3], 12: [4, 3], 10: [5, 2], 9: [3, 3], 8: [4, 2], 6: [3, 2], 4: [2, 2], 3: [3, 1], 2: [2, 1] };
const sizes = [];
let n = rest.length;
while (n > 0) {
  let take = n >= 20 ? 20 : Math.max(...Object.keys(GRIDS).map(Number).filter((x) => x <= n));
  if (n - take === 1) take = Object.keys(GRIDS).map(Number).filter((x) => x < take && x <= n - 2).sort((a, b) => b - a)[0];
  sizes.push(take); n -= take;
}
const CATNAME = { lazer: 'Lazer', arma: 'Armas de rei', armadura: 'Armaduras', acessorio: 'Acessórios', consumivel: 'Poções', atributo: 'Atributos', bau: 'Baús', secreto: 'Secretos' };
let pos = 0;
sizes.forEach((sz, i) => {
  const ids = rest.slice(pos, pos + sz); pos += sz;
  const cats = [...new Set(ids.map((k) => CATNAME[I[k].cat] || I[k].cat))];
  const [cols, rows] = GRIDS[sz];
  sheets.push({ title: 'Itens ' + (i + 1) + ': ' + cats.join(', '), cols, rows, ar: cols + ':' + rows, note: sz + ' itens.', panels: ids.map(panel) });
});
EXTRA_GROUPS.forEach((g) => sheets.push({ title: g.title, cols: g.cols, rows: g.rows, ar: g.cols + ':' + g.rows, intro: g.intro,
  note: g.ids.length === 1 ? 'Uma imagem só.' : g.ids.length + ' itens criados depois das outras folhas.', panels: g.ids.map(panel) }));
sheets.forEach((s) => { s.shape = 'square'; });

// injeta na página
const page = path.join(ROOT, 'prompts', 'prompts.html');
let html = fs.readFileSync(page, 'utf8');
let a = html.indexOf('  /* ---------- itens (gerado por tools/build-prompts.js) ---------- */');
if (a < 0) a = html.indexOf('  /* ---------- itens ---------- */');
const b = html.indexOf('  items.forEach(function (p) { p.icon = true;');
if (a < 0 || b < 0) throw new Error('secção de itens não encontrada');
html = html.slice(0, a) + '  /* ---------- itens (gerado por tools/build-prompts.js) ---------- */\n  var items = ' + JSON.stringify(sheets.map((s) => ({ title: s.title, cols: s.cols, rows: s.rows, shape: s.shape, ar: s.ar, note: s.note, intro: s.intro, panels: s.panels.map((p) => ({ pt: p.pt, en: p.en, file: p.file })) }))) + ';\n' + html.slice(b);
html = html.replace(/\{ id: 'itens', name: 'Itens', text: '[^']*'/, "{ id: 'itens', name: 'Itens', text: 'Ícones de inventário: " + base.length + " imagens em " + sheets.length + " folhas, que cobrem os " + Object.keys(I).length + " itens do jogo. As versões do Artesão e do Campeão e os graus Maior, Ancestral e Primordial usam a imagem do item base. A cor do brilho é a da raridade: cinza comum, verde incomum, azul raro, roxo épico, dourado lendário, rosa mítico, prateado secreto.'");
fs.writeFileSync(page, html);
fs.writeFileSync(path.join(__dirname, 'item-sheets.json'), JSON.stringify(sheets.map((s) => ({ title: s.title, cols: s.cols, rows: s.rows, ids: s.panels.map((p) => p.id) })), null, 1));
console.log(sheets.length + ' folhas, ' + base.length + ' imagens:');
sheets.forEach((s, i) => console.log('  ' + (i + 1) + '. ' + s.title + ' (' + s.cols + '×' + s.rows + ')'));

/* ================= TROFÉUS E HABILIDADES ================= */
{
  const vm2 = require('vm');
  const ctx2 = {}; ctx2.globalThis = ctx2; vm2.createContext(ctx2);
  require('../build-order.json').slice(0, 6).forEach((f) => vm2.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx2));
  const S2 = ctx2.SYS;
  const TA = require('./trophy-art.js'), SA = require('./skill-art.js');
  const TROPHY_STYLE = 'Art style: premium dark-fantasy RPG collectible trophy icons, painterly semi-realistic rendering with sharp ink outlines, each trophy shown as a precious relic resting on a small dark carved stone display pedestal, centered inside its own dark square slot (#0D182E) with a thin glowing gold (#FFC85A) holographic border and tiny corner brackets, soft glow in the trophy\'s rarity color, front three-quarter view, strong rim light, crisp silhouette readable at small size, consistent scale and lighting across all trophies.';
  const SKILL_STYLE = (cls, color) => 'Art style: dark fantasy RPG skill ability icons, each a dramatic painterly illustration of a magical combat effect that fills most of its square, bold simple silhouette readable at small size, high contrast, deep navy-black background, each inside its own square slot with a thin glowing border and tiny corner brackets in ' + color + '. All icons of this sheet share the ' + cls + ' palette so they read as one skill tree.';
  const missingT = Object.keys(S2.TROPHIES).filter((k) => !TA[k]);
  const missingS = Object.keys(S2.ALL_SKILLS).filter((k) => !SA[k]);
  if (missingT.length || missingS.length) { console.error('Sem descrição:', missingT.concat(missingS).join(', ')); process.exit(1); }

  const tSheets = [];
  for (let g = 1; g <= 10; g += 2) {
    const bs = S2.BOSSES.filter((b) => b.gate === g || b.gate === g + 1);
    tSheets.push({ title: 'Troféus: portões ' + g + ' e ' + (g + 1), cols: 5, rows: 4, shape: 'square', ar: '5:4', style: TROPHY_STYLE,
      note: 'Linhas 1–2: ' + S2.GATES[g - 1].name + '; linhas 3–4: ' + S2.GATES[g].name + '. O último troféu de cada portão é o do rei.',
      panels: bs.map((b) => ({ id: b.id, pt: S2.TROPHIES[b.id].name + ' (' + b.name + ')', en: TA[b.id] + ', rarity glow ' + RAR[S2.TROPHIES[b.id].rarity], file: 'assets/trophies/' + b.id + '.png' })) });
  }
  tSheets.push({ title: 'Troféus: portões ocultos', cols: 2, rows: 1, shape: 'square', ar: '2:1', style: TROPHY_STYLE, note: 'Os dois chefes secretos.',
    panels: S2.SECRET_BOSSES.map((b) => ({ id: b.id, pt: S2.TROPHIES[b.id].name + ' (' + b.name + ')', en: TA[b.id] + ', rarity glow ' + RAR.secreto, file: 'assets/trophies/' + b.id + '.png' })) });

  const PAL = { guerreiro: ['Warrior (iron grey, ember red and molten gold, fire)', 'ember red (#FF6B4A)'], assassino: ['Assassin (charcoal, violet and silver moonlight, smoke)', 'violet (#B56CFF)'],
    mago: ['Mage (navy, cyan and white-gold starlight, arcane runes)', 'cyan (#4AB8FF)'], guardiao: ['Guardian (steel, bronze and radiant sun-gold, stone)', 'sun gold (#FFD24A)'],
    arqueiro: ['Archer (forest green, storm teal and electric white, wind and lightning)', 'emerald green (#5BE08A)'], invocador: ['Summoner (indigo, bone white and emerald soul-fire)', 'emerald (#3DFFB0)'] };
  const sSheets = S2.CLASS_ORDER.map((c) => ({ title: 'Habilidades: ' + S2.CLASSES[c].name, cols: 6, rows: 3, shape: 'square', ar: '2:1', style: SKILL_STYLE(PAL[c][0], PAL[c][1]),
    note: 'As 18 habilidades do ' + S2.CLASSES[c].name + ', da primeira (nível 1) à última (nível 100).',
    intro: 'Skill icons ordered from the weakest (panel 1) to the most powerful ultimate (panel 18): effects get bigger, brighter and more epic.',
    panels: S2.CLASS_SKILLS[c].map((s) => ({ id: s.id, pt: s.name + ' (Nv ' + s.unlock + (s.type === 'passive' ? ', passiva' : '') + ')', en: SA[s.id] + (s.type === 'passive' ? ', passive aura style with a circular emblem' : ''), file: 'assets/skills/' + s.id + '.png' })) }));
  const extra = S2.COMMON_SKILLS.concat(S2.SECRET_SKILLS);
  sSheets.push({ title: 'Habilidades gerais e secretas', cols: 4, rows: 4, shape: 'square', ar: '1:1',
    style: 'Art style: dark fantasy RPG skill ability icons, each a dramatic painterly illustration of a magical effect filling most of its square, bold simple silhouette readable at small size, high contrast, deep navy-black background, each inside its own square slot with a thin glowing border and corner brackets. Panels 1-6 use an ice-blue (#6FD6FF) border; panels 7-16 are SECRET skills with a gold (#FFC85A) border and a mysterious, legendary glow.',
    note: 'Blocos 1–6: habilidades gerais. Blocos 7–16: as 10 habilidades secretas.',
    panels: extra.map((s) => ({ id: s.id, pt: s.name + (s.secret ? ' (secreta)' : ' (Nv ' + s.unlock + ')'), en: SA[s.id], file: 'assets/skills/' + s.id + '.png' })) });

  const strip = (arr) => arr.map((s) => ({ title: s.title, cols: s.cols, rows: s.rows, shape: s.shape, ar: s.ar, note: s.note, intro: s.intro, style: s.style, panels: s.panels.map((p) => ({ pt: p.pt, en: p.en, file: p.file })) }));
  let page2 = fs.readFileSync(page, 'utf8');
  const M1 = '  /* ---------- troféus e habilidades (gerado) ---------- */', M2 = '  /* ---------- fim troféus e habilidades ---------- */';
  const block = M1 + '\n  var trophySheets = ' + JSON.stringify(strip(tSheets)) + ';\n  var skillSheets = ' + JSON.stringify(strip(sSheets)) + ';\n' + M2 + '\n';
  if (page2.indexOf(M1) >= 0) page2 = page2.slice(0, page2.indexOf(M1)) + block + page2.slice(page2.indexOf(M2) + M2.length + 1);
  else page2 = page2.replace('  /* ---------- montagem ---------- */', block + '  /* ---------- montagem ---------- */');
  if (page2.indexOf("{ id: 'trofeus'") < 0) {
    page2 = page2.replace("    { id: 'icones', name: 'Ícones',", "    { id: 'trofeus', name: 'Troféus', text: 'Um troféu por chefe: 102 imagens em 6 folhas, cada folha com 2 portões. Cada troféu aparece como uma relíquia num pequeno pedestal de pedra, com moldura dourada e o brilho da raridade (azul raro, roxo épico, dourado lendário para os reis, rosa mítico para o último, prateado secreto).', list: trophySheets },\n    { id: 'habilidades', name: 'Habilidades', text: 'Ícones das 124 habilidades: uma folha por classe (18 habilidades, da mais fraca à mais poderosa, na paleta do caminho da classe) e uma folha com as 6 gerais e as 10 secretas.', list: skillSheets },\n    { id: 'icones', name: 'Ícones',");
  }
  fs.writeFileSync(page, page2);
  const man = (arr) => arr.map((s) => ({ title: s.title, cols: s.cols, rows: s.rows, ids: s.panels.map((p) => p.id) }));
  fs.writeFileSync(path.join(__dirname, 'trophy-sheets.json'), JSON.stringify(man(tSheets), null, 1));
  fs.writeFileSync(path.join(__dirname, 'skill-sheets.json'), JSON.stringify(man(sSheets), null, 1));
  console.log('troféus: ' + tSheets.length + ' folhas; habilidades: ' + sSheets.length + ' folhas');
}
