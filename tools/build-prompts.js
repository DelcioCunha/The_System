/* Gera as folhas de prompts dos itens a partir dos dados do jogo.
   Uso: node tools/build-prompts.js
   - atualiza a secção Itens de prompts/prompts.html
   - escreve tools/item-sheets.json (ordem dos blocos, para cortar as imagens depois) */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const ctx = {}; ctx.globalThis = ctx; vm.createContext(ctx);
const ORDER = require('../build-order.json');
ORDER.slice(0, ORDER.indexOf('src/data/items-new.js') + 1).concat(['src/data/chests.js']).forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx));
const S = ctx.SYS, I = S.ITEMS;
const ART = require('./item-art.js');
const RAR = { comum: 'grey (#9AA4B2)', incomum: 'green (#5BE08A)', raro: 'blue (#4AB8FF)', epico: 'purple (#B56CFF)', lendario: 'orange-gold (#FFB02E)', mitico: 'crimson-pink (#FF3D7F)', secreto: 'white-silver with prismatic sparkle (#E0E6FF)' };
const isVariant = (k) => /_art$|_camp$|_maior$|_anc$|_prim$|^ac_t_.*[23]$/.test(k);
const NEW = S.NEW_ITEMS || [];
const base = Object.keys(I).filter((k) => !isVariant(k) && NEW.indexOf(k) < 0 && !I[k].premium && I[k].cat !== 'sistema' && !I[k].chestFam);
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
/* ---------- ATUALIZAÇÃO: imagem própria para cada versão (Artesão, Campeão, graus, talismãs) e itens novos ---------- */
const ARTISAN = 'ARTISAN EDITION, same silhouette as the base item but clearly refined: polished steel, fine engraved silver filigree, one small inset blue gem, sharper cleaner edges, new leather wrap, subtle cool silver-blue sheen';
const CHAMPION = 'CHAMPION EDITION, same silhouette as the base item but grander and more decorated: gold and crimson trim, ornate guard or collar, a glowing laurel-and-crown champion sigil, a small red banner ribbon, brighter aura and floating sparks';
const pairPanels = (ids) => ids.flatMap((b) => [
  { id: b + '_art', pt: I[b + '_art'].name, en: ART[b] + '. ' + ARTISAN + ', rarity glow ' + RAR[I[b].rarity], file: 'assets/items/' + b + '_art.png' },
  { id: b + '_camp', pt: I[b + '_camp'].name, en: ART[b] + '. ' + CHAMPION + ', rarity glow ' + RAR[I[b].rarity], file: 'assets/items/' + b + '_camp.png' }]);
const PAIR_INTRO = 'Each row shows two items, each one twice: first its Artisan edition (silver-blue refinement), then its Champion edition (gold and crimson grandeur). Both editions of the same item keep the same basic shape so they are clearly related, but must look clearly different from each other.';
const UPD = [];
S.CLASS_ORDER.forEach((c) => {
  UPD.push({ title: 'Versões do Artesão e do Campeão: armas do ' + S.CLASSES[c].name, cols: 4, rows: 5, ar: '4:5', intro: PAIR_INTRO,
    note: 'As 10 armas do ' + S.CLASSES[c].name + ', cada uma em duas versões (Artesão e Campeão), por ordem de poder. Assim deixa de haver armas com a mesma imagem.',
    panels: pairPanels(S.CLASS_WEAPONS[c]) });
});
const ARMS = Object.keys(I).filter((k) => I[k].cat === 'armadura' && I[k + '_art']);
UPD.push({ title: 'Versões do Artesão e do Campeão: armaduras I', cols: 4, rows: 5, ar: '4:5', intro: PAIR_INTRO, note: '10 armaduras, cada uma em versão do Artesão e do Campeão.', panels: pairPanels(ARMS.slice(0, 10)) });
UPD.push({ title: 'Versões do Artesão e do Campeão: armaduras II', cols: 2, rows: ARMS.length - 10, ar: '2:' + (ARMS.length - 10), intro: PAIR_INTRO, note: 'As restantes armaduras, em versão do Artesão e do Campeão.', panels: pairPanels(ARMS.slice(10)) });
const TIERS = [['_maior', 'GREATER version: larger polished gem, thicker silver band'], ['_anc', 'ANCIENT version: old dark gold carved with glowing runes, worn but powerful'], ['_prim', 'PRIMORDIAL version: made of raw glowing crystal and starlight, floating fragments around it']];
const ATTR = [['str', 'ac_forca'], ['agi', 'ac_agi'], ['vit', 'ac_vit'], ['int', 'ac_int'], ['per', 'ac_per']];
UPD.push({ title: 'Acessórios de atributo: Maior, Ancestral e Primordial', cols: 5, rows: 3, ar: '5:3',
  intro: 'Row 1: Greater versions, row 2: Ancient versions, row 3: Primordial versions of the same five accessories, each tier more powerful.',
  note: 'Linha 1: versões Maior; linha 2: Ancestral; linha 3: Primordial. Colunas: Força, Agilidade, Vitalidade, Inteligência, Percepção.',
  panels: TIERS.flatMap((t) => ATTR.map((a) => ({ id: 'ac_' + a[0] + t[0], pt: I['ac_' + a[0] + t[0]].name, en: ART[a[1]] + '. ' + t[1] + ', rarity glow ' + RAR[I['ac_' + a[0] + t[0]].rarity], file: 'assets/items/ac_' + a[0] + t[0] + '.png' }))) });
const TAL = ['crit', 'lifesteal', 'eva', 'def'];
UPD.push({ title: 'Talismãs de combate II e III', cols: 4, rows: 2, ar: '2:1',
  intro: 'Row 1: second tier (II) of four talismans, row 2: third tier (III), bigger, more ornate and glowing stronger than row 1.',
  note: 'Linha 1: talismãs II; linha 2: talismãs III (Precisão, Vampírico, Brisa, Ferro).',
  panels: [2, 3].flatMap((n) => TAL.map((t) => ({ id: 'ac_t_' + t + n, pt: I['ac_t_' + t + n].name, en: ART['ac_t_' + t + '1'] + '. ' + (n === 2 ? 'TIER II: more ornate, a second gem' : 'TIER III: masterwork, three gems, radiant aura') + ', rarity glow ' + RAR[I['ac_t_' + t + n].rarity], file: 'assets/items/ac_t_' + t + n + '.png' }))) });
const NEW_ART = {
  wx_carrasco: 'heavy executioner axe with a crescent blade and a dark iron chain wrapped around the haft, red glow on the edge',
  wx_espinheira: 'long war spear whose shaft and blade are covered in sharp iron thorns',
  wx_relampago: 'silver lance with a lightning bolt frozen inside a crystal spearhead, crackling sparks',
  wx_fonte: 'staff topped with a small floating fountain of glowing blue mana water',
  wx_peste: 'curved scythe with a green-black blade dripping glowing venom, withered vines on the handle',
  ar_alquimista: 'thick leather alchemist apron with many pockets full of colorful potion vials',
  ar_espinhos: 'dark iron cuirass covered in outward-pointing spikes',
  ar_bastiao: 'massive fortress plate armor with tower-like shoulder guards and a glowing blue rune shield emblem',
  ar_vontade: 'long grey monk mantle embroidered with steel threads and a calm glowing mind sigil on the chest',
  ac_herbalista: 'small linen pouch with dried green herbs peeking out',
  ac_primeiro: 'silver ring with a single lightning-shaped gem',
  ac_ourico: 'small leather bracelet covered in short sharp spikes',
  ac_fonte: 'glass pendant holding one drop of glowing water that never dries',
  ac_toxina: 'tiny corked vial on a chain with a moving green toxic liquid inside',
  ac_sentenca: 'bronze medal shaped like a balance scale tilted to one side',
  ac_ancora: 'small iron anchor pendant with a glowing calm blue core',
  ac_muralha: 'heavy belt buckle shaped like a castle wall with a thin glowing barrier',
  po_mel: 'glass jar of dark golden honey with a wooden dipper and a small healing glow',
  po_equilibrio: 'potion flask split in half: red fire on one side, blue ice on the other',
  po_raio: 'corked bottle with a real lightning bolt trapped inside',
  po_eclipse: 'pouch of black ash with a small blood-red eclipse sigil',
  po_areia: 'handful of glowing golden sand pouring upward from an open palm-shaped vial',
  po_ritual: 'stone ritual cup filled with dark red liquid, faint runes around it',
  po_cafe: 'tin mug of steaming black coffee with a small flame-shaped steam swirl',
  po_mercador: 'red wax seal stamped with a coin and a merchant scale'
};
const newIds = NEW.filter((k) => NEW_ART[k]);
UPD.push({ title: 'Itens novos da loja (atualização)', cols: 5, rows: 5, ar: '1:1',
  intro: 'Brand new items for the shop: row 1 weapons, row 2 armors and the first accessory, rows 3-4 accessories and potions, row 5 consumables.',
  note: 'Os ' + newIds.length + ' itens novos: armas, armaduras, acessórios e consumíveis com mecânicas novas.',
  panels: newIds.map((k) => ({ id: k, pt: I[k].name, en: NEW_ART[k] + ', rarity glow ' + RAR[I[k].rarity], file: 'assets/items/' + k + '.png' })) });
const SYS_ART = {
  sys_sino: 'cracked bronze hand bell surrounded by faint blue holographic sound rings and tiny System window fragments',
  sys_silencio: 'black paper order sealed with dark wax, a closed-eye sigil on the seal, muted grey glow',
  sys_licenca: 'official parchment license with a glowing blue System stamp and a ribbon',
  sys_dobro: 'round seal with two overlapping glowing circles, gold and blue',
  sys_bilhete: 'golden arena ticket with a colosseum stamp and two crossed swords',
  sys_bussola: 'antique brass compass whose needle is a glowing violet eye pointing at something hidden',
  sys_dado: 'six-sided bone die with no numbers, faint runes and a mysterious glow',
  sys_pacto: 'blood-red contract scroll that does not burn, with a dark wax seal and a thin flame around it',
  sys_tregua: 'white parchment scroll with a silver dove drawing and a quiet blue glow, a small silenced alarm bell beside it'
};
const sysIds = (S.SYSTEM_ITEMS || []).filter((k) => SYS_ART[k]);
UPD.push({ title: 'Artefatos do Sistema', cols: 3, rows: 3, ar: '1:1',
  intro: 'Mysterious artifacts that interact with the holographic System itself: each one has a subtle cold ice-blue holographic shimmer around it, as if the System is watching.',
  note: 'Os 9 artefatos que mexem com o próprio Sistema (separador Sistema da Loja).',
  panels: sysIds.map((k) => ({ id: k, pt: I[k].name, en: SYS_ART[k] + ', rarity glow ' + RAR[I[k].rarity], file: 'assets/items/' + k + '.png' })) });
/* baús especializados: uma linha por família, uma coluna por grau */
const CH_FAM = {
  arsenal: 'a weapons chest: a long armory crate with sword hilts, an axe head and a staff tip sticking out of the half-open lid',
  armaria: 'an armor chest: a sturdy trunk with a breastplate and a helmet resting on the open lid',
  guerra: 'a war chest: a heavy trunk with two locks, one shaped like a sword and one like a shield, with a crossed sword and shield emblem on the front',
  joias: 'a jewelry chest: an elegant velvet-lined jewelry box with rings, amulets and a necklace glinting inside',
  alquimia: 'an alchemy chest: a padded box with rows of glowing potion bottles and bubbling vials packed in straw'
};
const CH_GRADE = {
  1: 'IRON grade: rough dark iron and plain wood, simple rivets, modest look',
  2: 'SILVER grade: polished silver bands, clean engravings, cool silver-blue sheen',
  3: 'GOLD grade: ornate gold trim and runes, a glowing gem lock',
  4: 'DRAGON grade: dragon-scale surface, a dragon head clasp, warm ember glow leaking from the seams',
  5: 'MONARCH grade: obsidian black with violet shadow flames, a black crown seal and a dark purple aura, the most powerful and luxurious'
};
const chIds = Object.keys(I).filter((k) => I[k].chestFam).sort((a, b) => (S.CHEST_FAMS.map((f) => f.id).indexOf(I[a].chestFam) - S.CHEST_FAMS.map((f) => f.id).indexOf(I[b].chestFam)) || (I[a].chestGrade - I[b].chestGrade));
if (chIds.length) UPD.push({ title: 'Baús especializados', cols: 5, rows: 5, ar: '1:1',
  intro: 'Treasure chests for an RPG shop. Each ROW is one chest family (same shape and contents), and each COLUMN is a grade that gets clearly richer from left to right: iron, silver, gold, dragon, monarch. Same camera angle and scale for all 25.',
  note: 'Os 25 baús especializados: linha 1 Arsenal (armas), linha 2 Armaria (armaduras), linha 3 Arca de Guerra (armas e armaduras), linha 4 Porta-Joias (acessórios), linha 5 Cofre Alquímico (poções). Da esquerda para a direita: Ferro, Prata, Ouro, Dragão, Monarca.',
  panels: chIds.map((k) => ({ id: k, pt: I[k].name, en: CH_FAM[I[k].chestFam] + '; ' + CH_GRADE[I[k].chestGrade] + ', rarity glow ' + RAR[I[k].rarity], file: 'assets/items/' + k + '.png' })) });
UPD.forEach((u) => sheets.push(u));
sheets.forEach((s) => { s.shape = 'square'; });

// injeta na página
const page = path.join(ROOT, 'prompts', 'prompts.html');
let html = fs.readFileSync(page, 'utf8');
let a = html.indexOf('  /* ---------- itens (gerado por tools/build-prompts.js) ---------- */');
if (a < 0) a = html.indexOf('  /* ---------- itens ---------- */');
const b = html.indexOf('  items.forEach(function (p) { p.icon = true;');
if (a < 0 || b < 0) throw new Error('secção de itens não encontrada');
html = html.slice(0, a) + '  /* ---------- itens (gerado por tools/build-prompts.js) ---------- */\n  var items = ' + JSON.stringify(sheets.map((s) => ({ title: s.title, cols: s.cols, rows: s.rows, shape: s.shape, ar: s.ar, note: s.note, intro: s.intro, panels: s.panels.map((p) => ({ pt: p.pt, en: p.en, file: p.file })) }))) + ';\n' + html.slice(b);
html = html.replace(/\{ id: 'itens', name: 'Itens', text: '[^']*'/, "{ id: 'itens', name: 'Itens', text: 'Ícones de inventário: " + sheets.reduce((n, x) => n + x.panels.length, 0) + " imagens em " + sheets.length + " folhas, uma imagem própria para cada item. As folhas 1 a 14 têm os itens base. As folhas 15 a 24 (atualização) dão aparência própria às versões do Artesão (prateado e azul, mais refinada) e do Campeão (ouro e carmesim, mais grandiosa), aos graus Maior, Ancestral e Primordial e aos talismãs II e III. A folha 25 tem os itens novos da loja, a folha 26 os Artefatos do Sistema e a folha 27 os baús especializados. A cor do brilho é a da raridade: cinza comum, verde incomum, azul raro, roxo épico, dourado lendário, rosa mítico, prateado secreto.'");
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

require('./prompt-status.js');
