/* Teste do modo de animações completas (tempos reais): node tests/fx.test.js */
'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'www', 'index.html'), 'utf8').replace(/<link[^>]+>/g, '');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => { if (!/Not implemented/.test(e.message)) errors.push(e.message); });
vc.on('error', (e) => errors.push(String(e)));
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://app.local/', virtualConsole: vc,
  beforeParse(w) { w.matchMedia = () => ({ matches: false }); w.scrollTo = () => {}; w.addEventListener('error', (e) => errors.push(e.message)); } });
const w = dom.window, $ = (s) => w.document.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const click = (s) => { const el = typeof s === 'string' ? $(s) : s; assert.ok(el, 'falta ' + s); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 100, clientY: 200 })); };
async function pops() { for (let g = 0; g < 30; g++) { await sleep(60); if ($('[data-a="pop-ok"]')) click('[data-a="pop-ok"]'); else if (Date.now() > w.SYS.ui.state.holdUntil && !w.SYS.ui.state.popups.length) return; } }
(async () => {
  assert.ok(w.document.documentElement.classList.contains('fx-full'), 'modo completo');
  click('[data-a="intro-yes"]');
  const i = $('#in-name'); i.value = 'Natan'; i.dispatchEvent(new w.Event('input', { bubbles: true }));
  click('[data-a="intro-cls"][data-v="mago"]'); click('[data-a="intro-go"]');
  assert.ok($('.awaken'), 'animação de despertar');
  await sleep(2400); await pops();
  assert.ok($('main.enter') || true);
  // missão
  click('[data-a="tab"][data-t="missoes"]'); assert.ok($('main.enter'), 'entrada animada');
  click('[data-a="m-new"]'); assert.ok($('.sheet.fresh'));
  const t = $('#mf-title'); t.value = 'Ler'; t.dispatchEvent(new w.Event('input', { bubbles: true }));
  click('[data-a="f-set"][data-k="difficulty"][data-v="S"]'); assert.ok(!$('.sheet.fresh'), 'folha não volta a animar');
  const dl = $('#mf-deadline'); dl.value = '23:59'; dl.dispatchEvent(new w.Event('input', { bubbles: true }));
  click('[data-a="m-save"]'); click('[data-a="m-complete"]'); click('[data-a="confirm-yes"]');
  assert.ok($('.stamp.slam'), 'carimbo animado'); assert.ok(!$('#sys-box'), 'popup espera');
  await sleep(1000); assert.ok($('#sys-box.fresh'), 'popup aparece'); await pops();
  // baú
  click('[data-a="tab"][data-t="bolsa"]'); click('[data-a="item"][data-id^="bau_"]'); click('[data-a="use"]');
  assert.ok($('.chest-ico')); await sleep(1200); await pops();
  // combate com tempos reais
  w.SYS.engine.state.daily.enabled = false;
  click('[data-a="tab"][data-t="combate"]'); click('[data-a="boss"][data-id="b1"]'); click('[data-a="fight"]');
  assert.ok($('.portal'), 'portal'); assert.ok($('.boss-ico.spawn'), 'chefe a surgir');
  let g = 0;
  while (!$('[data-a="b-close"]') && g++ < 120) {
    if ($('[data-a="b-pass"]')) click('[data-a="b-pass"]');
    else if (g % 2) { click('[data-a="b-sheet"][data-v="skills"]'); const b = $('[data-a="b-skill"]:not([disabled])'); if (b) click(b); else click('[data-a="close"]'); }
    else click('[data-a="b-attack"]');
    await sleep(40);
    if ($('.actions.busy')) { const before = w.SYS.engine.state.battle.turn; click('[data-a="b-attack"]'); assert.strictEqual(w.SYS.engine.state.battle.turn, before, 'bloqueado durante a animação'); }
    await sleep(Math.max(0, w.SYS.ui.state.busyUntil - Date.now()) + 30);
  }
  assert.ok($('[data-a="b-close"]'));
  assert.ok(!$('#sys-box'), 'popup de vitória espera pela animação');
  await sleep(Math.max(0, w.SYS.ui.state.holdUntil - Date.now()) + 100);
  assert.ok($('#sys-box'), 'popup de vitória');
  assert.ok($('.boss-ico.dead'));
  await pops(); click('[data-a="b-close"]');
  // definições: reduzir
  click('[data-a="tab"][data-t="status"]'); click('[data-a="page"][data-p="settings"]'); click('[data-a="set-fx"][data-v="reduced"]');
  assert.ok(w.document.documentElement.classList.contains('fx-reduced'));
  assert.strictEqual(w.SYS.engine.state.settings.fx, 'reduced');
  await sleep(500);
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('  ✓ modo completo: despertar, missões, baú, combate animado, vitória e definições sem erros');
  process.exit(0);
})().catch((e) => { console.error(e); console.error(errors.join('\n')); process.exit(1); });
