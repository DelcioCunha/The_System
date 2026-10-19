/* Gera a app: node build.js
   - www/index.html        → página completa usada pelo Capacitor (APK)
   - www/avatars/...       → imagens dos avatares (copiadas de assets/avatars)
   - dist/preview.html     → mesma app, em formato de pré-visualização
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const order = require('./build-order.json').concat(['src/ui/fx.js', 'src/ui/avatar.js', 'src/ui/app.js']);
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* --- avatares: assets/avatars/<classe>/<nivel>.(png|jpg|jpeg|webp) --- */
const AV_SRC = path.join(ROOT, 'assets', 'avatars');
const manifest = {};
const copies = [];
if (fs.existsSync(AV_SRC)) {
  fs.readdirSync(AV_SRC).forEach((cls) => {
    const dir = path.join(AV_SRC, cls);
    if (!fs.statSync(dir).isDirectory()) return;
    fs.readdirSync(dir).forEach((file) => {
      const m = file.match(/^(\d{1,3})\.(png|jpe?g|webp)$/i);
      if (!m) return;
      const lv = +m[1];
      if (lv < 1 || lv > 100) return;
      manifest[cls] = manifest[cls] || {};
      manifest[cls][lv] = 'avatars/' + cls + '/' + file;
      copies.push([path.join(dir, file), path.join(ROOT, 'www', 'avatars', cls, file)]);
    });
  });
}

/* --- arte das classes: assets/classes/<classe>.(png|jpg|webp) --- */
const CL_SRC = path.join(ROOT, 'assets', 'classes');
const classArt = {};
if (fs.existsSync(CL_SRC)) {
  fs.readdirSync(CL_SRC).forEach((file) => {
    const m = file.match(/^([a-z]+)\.(png|jpe?g|webp)$/i);
    if (!m) return;
    classArt[m[1]] = 'classes/' + file;
    copies.push([path.join(CL_SRC, file), path.join(ROOT, 'www', 'classes', file)]);
  });
}

/* --- chefes: assets/bosses/<id>.(png|jpg|webp), ex.: b1.webp, secret_1.webp --- */
const BS_SRC = path.join(ROOT, 'assets', 'bosses');
const bossArt = {};
if (fs.existsSync(BS_SRC)) {
  fs.readdirSync(BS_SRC).forEach((file) => {
    const m = file.match(/^(b\d{1,3}|secret_\d|ar\d{1,2}(?:g\d)?)\.(png|jpe?g|webp)$/i);
    if (!m) return;
    bossArt[m[1]] = 'bosses/' + file;
    copies.push([path.join(BS_SRC, file), path.join(ROOT, 'www', 'bosses', file)]);
  });
}

/* --- itens: assets/items/<id>.(png|jpg|webp) --- */
const IT_SRC = path.join(ROOT, 'assets', 'items');
const itemArt = {};
if (fs.existsSync(IT_SRC)) {
  fs.readdirSync(IT_SRC).forEach((file) => {
    const m = file.match(/^([a-z0-9_]+)\.(png|jpe?g|webp)$/i);
    if (!m) return;
    itemArt[m[1]] = 'items/' + file;
    copies.push([path.join(IT_SRC, file), path.join(ROOT, 'www', 'items', file)]);
  });
}

/* --- ícones da interface: assets/ui/<id>.(png|jpg|webp) --- */
const UI_SRC = path.join(ROOT, 'assets', 'ui');
const uiArt = {};
if (fs.existsSync(UI_SRC)) {
  fs.readdirSync(UI_SRC).forEach((file) => {
    const m = file.match(/^([a-z0-9_]+)\.(png|jpe?g|webp)$/i);
    if (!m) return;
    uiArt[m[1]] = 'ui/' + file;
    copies.push([path.join(UI_SRC, file), path.join(ROOT, 'www', 'ui', file)]);
  });
}

/* --- troféus e habilidades: assets/trophies/<chefe>.webp, assets/skills/<id>.webp --- */
function scanDir(dir, pub, map) {
  const src = path.join(ROOT, 'assets', dir);
  if (!fs.existsSync(src)) return;
  fs.readdirSync(src).forEach((file) => {
    const m = file.match(/^([a-z0-9_]+)\.(png|jpe?g|webp)$/i);
    if (!m) return;
    map[m[1]] = pub + '/' + file;
    copies.push([path.join(src, file), path.join(ROOT, 'www', pub, file)]);
  });
}
const trophyArt = {}, skillArt = {}, frameArt = {}, arenaArt = {};
scanDir('trophies', 'trophies', trophyArt);
scanDir('frames', 'frames', frameArt);
scanDir('arenas', 'arenas', arenaArt);
scanDir('skills', 'skills', skillArt);

/* --- endereço do servidor da Loja de Cristais (loja.json na raiz) --- */
let SHOP_API = '';
try { SHOP_API = String(JSON.parse(read('loja.json')).api || ''); } catch (e) { SHOP_API = ''; }

const js = order.map((f) => '/* ' + f + ' */\n' + read(f)).join('\n') +
  '\nSYS.SHOP_API = ' + JSON.stringify(SHOP_API) + ';' +
  '\nSYS.AVATARS = ' + JSON.stringify(manifest) + ';\nSYS.CLASS_ART = ' + JSON.stringify(classArt) + ';\nSYS.BOSS_ART = ' + JSON.stringify(bossArt) + ';\nSYS.ITEM_ART = ' + JSON.stringify(itemArt) + ';\nSYS.UI_ART = ' + JSON.stringify(uiArt) + ';\nSYS.TROPHY_ART = ' + JSON.stringify(trophyArt) + ';\nSYS.SKILL_ART = ' + JSON.stringify(skillArt) + ';\nSYS.FRAME_ART = ' + JSON.stringify(frameArt) + ';\nSYS.ARENA_ART = ' + JSON.stringify(arenaArt) + ';\nSYS.boot(document.getElementById("app"));\n';
const css = read('src/ui/styles.css') + '\n' + read('src/ui/fx.css');
const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Oxanium:wght@500;600;700;800&display=swap">';

// garante que nenhum "</script>" no código parte a página
const safeJs = js.replace(/<\/script/gi, '<\\/script');

/* Página da app. A mesma página serve dois sítios:
   - www/index.html   → Android (Capacitor). Imagens em www/<pasta>/...
   - index.html       → raiz do projeto, para o GitHub Pages ("Deploy from a branch", pasta / root).
                        Usa as imagens diretamente de assets/<pasta>/..., sem duplicar ficheiros.
   O service worker (funcionar offline / instalar no ecrã principal) só é registado na web, nunca no Android. */
function webPage(code, iconBase) {
  const webHead = '<meta name="description" content="Sistema: um RPG da vida real. Criado por Delcio Cunha.">\n' +
    '<meta name="author" content="Delcio Cunha">\n' +
    '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" type="image/png" href="' + iconBase + 'favicon.png">\n' +
    '<link rel="apple-touch-icon" href="' + iconBase + 'apple-touch-icon.png">\n<meta name="mobile-web-app-capable" content="yes">\n' +
    '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="Sistema">\n';
  const swReg = '<script>\nif (\'serviceWorker\' in navigator && !window.Capacitor && (location.protocol === \'https:\' || location.hostname === \'localhost\')) {\n' +
    '  window.addEventListener(\'load\', function () { navigator.serviceWorker.register(\'sw.js\').catch(function () {}); });\n}\n</script>\n';
  return '<!doctype html>\n<html lang="pt">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">\n' +
    '<meta name="theme-color" content="#060a14">\n<title>Sistema</title>\n' + webHead + fonts + '\n<style>\n:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:0}\n' + css + '\n</style>\n</head>\n<body>\n<div id="app"></div>\n<script>\n' + code + '</script>\n' + swReg + '</body>\n</html>\n';
}
const full = webPage(safeJs, 'icons/');

/* versão da raiz: os caminhos das imagens passam a começar por assets/ */
const ART_MAPS = { CLASS_ART: classArt, BOSS_ART: bossArt, ITEM_ART: itemArt, UI_ART: uiArt, TROPHY_ART: trophyArt, SKILL_ART: skillArt, FRAME_ART: frameArt, ARENA_ART: arenaArt };
const prefixMap = (m) => { const o = {}; Object.keys(m).forEach((k) => { o[k] = 'assets/' + m[k]; }); return o; };
let rootJs = safeJs.replace('SYS.AVATARS = ' + JSON.stringify(manifest) + ';', 'SYS.AVATARS = ' + JSON.stringify(Object.keys(manifest).reduce((o, c) => { o[c] = prefixMap(manifest[c]); return o; }, {})) + ';');
Object.keys(ART_MAPS).forEach((name) => { rootJs = rootJs.replace('SYS.' + name + ' = ' + JSON.stringify(ART_MAPS[name]) + ';', 'SYS.' + name + ' = ' + JSON.stringify(prefixMap(ART_MAPS[name])) + ';'); });
const rootPage = webPage(rootJs, 'assets/web/');

// Pré-visualização: os troféus e os ícones da interface vão embutidos na página (limite de ficheiros por publicação)
const INLINE = { TROPHY_ART: trophyArt, UI_ART: uiArt, SKILL_ART: skillArt, FRAME_ART: frameArt, ARENA_ART: arenaArt };
const inlineMap = (m) => { const o = {}; Object.keys(m).forEach((k) => { const f = path.join(ROOT, 'assets', m[k]); const ext = path.extname(f).slice(1).replace('jpg', 'jpeg'); o[k] = 'data:image/' + ext + ';base64,' + fs.readFileSync(f).toString('base64'); }); return o; };
let previewJs = 'globalThis.SYS = { PREVIEW: true };\n' + safeJs;
Object.keys(INLINE).forEach((name) => { previewJs = previewJs.replace('SYS.' + name + ' = ' + JSON.stringify(INLINE[name]) + ';', 'SYS.' + name + ' = ' + JSON.stringify(inlineMap(INLINE[name])) + ';'); });
// as imagens das classes são iguais ao retrato de nível 1: a pré-visualização usa essas (limite de 512 ficheiros)
previewJs = previewJs.replace(/"classes\/([a-z]+)\.webp"/g, '"avatars/$1/1.webp"');
// itens que ainda não estão publicados como ficheiros na pré-visualização (limite de ficheiros): vão embutidos
const PUB_LIST = path.join(ROOT, 'tools', 'preview-published.json');
if (fs.existsSync(PUB_LIST)) {
  const pub = new Set(JSON.parse(fs.readFileSync(PUB_LIST, 'utf8')));
  Object.keys(itemArt).forEach((id) => {
    const rel = itemArt[id];
    if (pub.has(rel)) return;
    const data = 'data:image/webp;base64,' + fs.readFileSync(path.join(ROOT, 'assets', rel)).toString('base64');
    previewJs = previewJs.split('"' + rel + '"').join('"' + data + '"');
  });
}
const preview = '<title>Sistema do Caçador</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n' + fonts + '\n<style>\n' + css + '\n</style>\n<div id="app"></div>\n<script>\n' + previewJs + '</script>\n';

fs.rmSync(path.join(ROOT, 'www', 'avatars'), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'www', 'classes'), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'www', 'bosses'), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'www', 'items'), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'www', 'ui'), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'www', 'trophies'), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'www', 'skills'), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'www', 'frames'), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'www', 'arenas'), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'www', 'icons'), { recursive: true, force: true });
fs.mkdirSync(path.join(ROOT, 'www'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'www', 'index.html'), full);
fs.writeFileSync(path.join(ROOT, 'dist', 'preview.html'), preview);
copies.forEach(([from, to]) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); });

/* --- versão web: manifesto, ícones e service worker --- */
const WEB_ICONS = path.join(ROOT, 'assets', 'web');
const icons = fs.existsSync(WEB_ICONS) ? fs.readdirSync(WEB_ICONS).filter((f) => /\.png$/.test(f)) : [];
fs.mkdirSync(path.join(ROOT, 'www', 'icons'), { recursive: true });
icons.forEach((f) => fs.copyFileSync(path.join(WEB_ICONS, f), path.join(ROOT, 'www', 'icons', f)));
const manifestFor = (base) => ({
  name: 'Sistema', short_name: 'Sistema', description: 'Um RPG da vida real. Criado por Delcio Cunha.',
  lang: 'pt', dir: 'ltr', start_url: './', scope: './', id: './', display: 'standalone', orientation: 'portrait',
  background_color: '#060a14', theme_color: '#060a14', categories: ['productivity', 'games', 'lifestyle'],
  icons: [
    { src: base + 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: base + 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: base + 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
});
const crypto = require('crypto');
const version = crypto.createHash('sha1').update(full).update(JSON.stringify(copies.map((c) => [path.relative(ROOT, c[1]), fs.statSync(c[0]).size]))).update(icons.join()).digest('hex').slice(0, 10);
const swFor = (base) => read('src/web/sw.js').replace('__VERSION__', version).replace('__ICONS__', base);
// Android / www
fs.writeFileSync(path.join(ROOT, 'www', 'manifest.webmanifest'), JSON.stringify(manifestFor('icons/'), null, 2));
fs.writeFileSync(path.join(ROOT, 'www', 'sw.js'), swFor('icons/'));
fs.writeFileSync(path.join(ROOT, 'www', '.nojekyll'), '');
if (fs.existsSync(path.join(ROOT, 'loja.json'))) fs.copyFileSync(path.join(ROOT, 'loja.json'), path.join(ROOT, 'www', 'loja.json'));
// GitHub Pages / raiz do projeto
fs.writeFileSync(path.join(ROOT, 'index.html'), rootPage);
fs.writeFileSync(path.join(ROOT, 'manifest.webmanifest'), JSON.stringify(manifestFor('assets/web/'), null, 2));
fs.writeFileSync(path.join(ROOT, 'sw.js'), swFor('assets/web/'));
fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');
console.log('www/index.html  ' + (full.length / 1024).toFixed(0) + ' KB · versão web ' + version);
console.log('index.html (raiz, GitHub Pages)  ' + (rootPage.length / 1024).toFixed(0) + ' KB');
console.log('dist/preview.html  ' + (preview.length / 1024).toFixed(0) + ' KB');
fs.writeFileSync(path.join(ROOT, 'dist', 'assets.json'), JSON.stringify(copies.map((c) => path.relative(path.join(ROOT, 'www'), c[1]))));
console.log('imagens: ' + copies.length + ' imagens (' + Object.keys(manifest).join(', ') + ')');
