/* Marca na página de prompts as imagens que já existem no projeto.
   Uso: node tools/prompt-status.js  (corre também no fim de tools/build-prompts.js) */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const page = path.join(ROOT, 'prompts', 'prompts.html');
const have = [];
(function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.(png|jpe?g|webp)$/i.test(e.name)) have.push(path.relative(ROOT, f).replace(/\\/g, '/').replace(/\.(png|jpe?g|webp)$/i, ''));
  });
})(path.join(ROOT, 'assets'));
let html = fs.readFileSync(page, 'utf8');
const M1 = '  /* ---------- imagens que já existem (gerado por tools/prompt-status.js) ---------- */', M2 = '  /* ---------- fim imagens existentes ---------- */';
const block = M1 + '\n  var HAVE = ' + JSON.stringify(have.sort()) + ';\n' + M2 + '\n';
if (html.indexOf(M1) >= 0) html = html.slice(0, html.indexOf(M1)) + block + html.slice(html.indexOf(M2) + M2.length + 1);
else html = html.replace('  var SECTIONS = [', block + '  var SECTIONS = [');
fs.writeFileSync(page, html);
console.log(have.length + ' imagens existentes marcadas na página de prompts');
// página só com as folhas que faltam
const falta = html
  .replace('<title>Prompts do Sistema</title>', '<title>Prompts em Falta</title>')
  .replace('<h1>Prompts de imagem</h1>', '<h1>Prompts em falta</h1>')
  .replace(/<p class="lead">[\s\S]*?<\/p>/, '<p class="lead">Só as imagens que <b>ainda não foram geradas</b>. Cada prompt gera uma imagem em grelha; depois eu corto-a e cada bloco vira o ficheiro indicado na tabela. A página completa, com tudo o que já está feito, continua em «Prompts do Sistema».</p>')
  .replace(M1, '  var ONLY_PENDING = true;\n' + M1);
fs.writeFileSync(path.join(ROOT, 'prompts', 'em-falta.html'), falta);
console.log('prompts/em-falta.html escrito');
