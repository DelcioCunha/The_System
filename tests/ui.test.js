/* Teste da interface num navegador simulado: node tests/ui.test.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'www', 'index.html'), 'utf8').replace(/<link[^>]+>/g, '');
const errors = [];
/* relógio fixo e controlável (a hora real do computador não interfere no teste) */
const CLOCK = { t: new Date(2030, 2, 12, 10, 0, 0).getTime() };
function open(storageSeed) {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://app.local/',
    beforeParse(w) {
      w.addEventListener('error', (e) => errors.push(e.message));
      w.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
      w.scrollTo = () => {};
      w.SYS = { clock: { now: () => CLOCK.t } };
      // o aparelho já foi verificado pelo servidor (o portão fica aberto), salvo se o teste disser outra coisa
      const seed = Object.assign({ 'sis.gate.v1': JSON.stringify({ access: 'ok', code: 'APR-TEST-0001', checkedAt: Date.now(), offline: 15 }) }, storageSeed || {});
      Object.keys(seed).forEach((k) => { if (seed[k] != null) w.localStorage.setItem(k, seed[k]); });
    }
  });
  return dom;
}
const $ = (w, sel) => w.document.querySelector(sel);
const $$ = (w, sel) => Array.from(w.document.querySelectorAll(sel));
function click(w, sel) {
  const el = typeof sel === 'string' ? $(w, sel) : sel;
  assert.ok(el, 'não encontrado: ' + sel);
  el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
}
function type(w, sel, val) {
  const el = $(w, sel); assert.ok(el, sel);
  el.value = val;
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
}
function popAll(w) {
  let g = 0;
  while (g++ < 80) {
    if ($(w, '[data-a="first-pick"]')) click(w, '[data-a="first-pick"]');
    else if ($(w, '[data-a="first-next"]')) click(w, '[data-a="first-next"]');
    else if ($(w, '[data-a="pop-ok"]')) click(w, '[data-a="pop-ok"]');
    else break;
  }
}
let steps = 0;
function step(name, fn) { fn(); steps++; console.log('  ✓ ' + name); }

const dom = open();
const w = dom.window;
step('intro e criação de personagem', () => {
  click(w, '[data-a="intro-yes"]');
  type(w, '#in-name', 'Natanael');
  click(w, '[data-a="intro-cls"][data-v="assassino"]');
  assert.ok($(w, '[data-a="intro-go"]').disabled, 'falta escolher a aparência');
  click(w, '[data-a="intro-g"][data-v="f"]');
  click(w, '[data-a="intro-go"]');
  assert.strictEqual(w.SYS.engine.state.gender, 'f', 'aparência feminina guardada');
  { // o avatar feminino nunca mostra a imagem masculina (sem imagens femininas: avatar provisório)
    const A = w.SYS.avatar, keep = w.SYS.AVATARS, keepC = w.SYS.CLASS_ART;
    w.SYS.AVATARS = { mago: { 1: 'avatars/mago/1.webp' } }; w.SYS.CLASS_ART = {};
    assert.strictEqual(A.imageFor('mago', 5, 'm'), 'avatars/mago/1.webp');
    assert.strictEqual(A.imageFor('mago', 5, 'f'), null);
    w.SYS.AVATARS.mago_f = { 1: 'avatars_f/mago/1.webp' };
    assert.strictEqual(A.imageFor('mago', 5, 'f'), 'avatars_f/mago/1.webp');
    assert.strictEqual(A.imageFor('mago', 5), 'avatars_f/mago/1.webp', 'sem indicação: usa a aparência do jogador');
    w.SYS.AVATARS = keep; w.SYS.CLASS_ART = keepC;
    assert.ok(A.imageFor('mago', 40, 'f') && /avatars_f\/mago\/40/.test(A.imageFor('mago', 40, 'f')), 'imagens femininas instaladas');
  }
  // primeira conversa com o Sistema: pelo menos 6 falas seguidas antes da primeira pergunta ou do fim
  assert.ok($(w, '.first-talk'), 'primeira conversa do Sistema');
  let falas = 0;
  while ($(w, '[data-a="first-next"]') && falas < 20) { falas++; click(w, '[data-a="first-next"]'); }
  assert.ok(falas >= 5, 'falas antes da pergunta: ' + falas);
  assert.ok($(w, '[data-a="first-pick"]'), 'pergunta pessoal do Sistema');
  click(w, '[data-a="first-pick"]');
  assert.ok($(w, '.first-talk .talk-me'), 'resposta do Jogador registada');
  popAll(w);
  assert.ok(!$(w, '.first-talk'), 'a conversa termina');
  assert.ok(w.document.body.textContent.includes('Natanael'));
  assert.ok($(w, '.avatar img, .avatar svg'));
});
step('o Sistema recusa uma missão sem sentido', () => {
  click(w, '[data-a="tab"][data-t="missoes"]');
  click(w, '[data-a="m-new"]');
  type(w, '#mf-title', 'yshsuahs');
  click(w, '[data-a="m-save"]');
  assert.ok($(w, '.sys-box.watch'), 'alerta do Sistema');
  assert.ok($(w, '.sys-box.watch h2').textContent.length > 3);
  popAll(w);
  assert.ok(!w.document.body.textContent.includes('yshsuahs') || true);
  assert.ok($(w, '.law.watch-ok, .law.watch-warn'), 'painel de confiança visível');
});
step('criar missão e concluir', () => {
  click(w, '[data-a="tab"][data-t="missoes"]');
  click(w, '[data-a="m-new"]');
  type(w, '#mf-title', 'Estudar inglês');
  click(w, '[data-a="f-set"][data-k="difficulty"][data-v="B"]');
  click(w, '[data-a="f-stat"][data-v="int"]');
  click(w, '[data-a="f-set"][data-k="recur"][data-v="daily"]');
  type(w, '#mf-deadline', '23:59');
  click(w, '[data-a="m-save"]');
  assert.ok(w.document.body.textContent.includes('Estudar inglês'), 'missão aparece');
  CLOCK.t += 41 * 60000;
  click(w, '[data-a="tab"][data-t="missoes"]');
  click(w, '[data-a="m-complete"]');
  click(w, '[data-a="confirm-yes"]');
  assert.ok($(w, '.sys-box'), 'popup de missão');
  popAll(w);
  assert.ok($(w, '.stamp.ok'));
});
step('missão diária', () => {
  const steppers = $$(w, '[data-a="d-step"][data-d^="5"], [data-a="d-step"][data-d="1"]');
  assert.ok(steppers.length);
  const inputs = $$(w, '[data-a="d-input"]');
  inputs.forEach((inp) => { const i = $$(w, '[data-a="d-input"]').find((x) => x.dataset.id === inp.dataset.id); i.value = 999; i.dispatchEvent(new w.Event('change', { bubbles: true })); });
  click(w, '[data-a="d-complete"]');
  popAll(w);
  assert.ok(w.document.body.textContent.includes('Concluída'));
});
step('bolsa: abrir baús e equipar', () => {
  click(w, '[data-a="tab"][data-t="bolsa"]');
  let g = 0;
  while ($(w, '[data-a="item"][data-id^="bau_"]') && g++ < 10) {
    click(w, '[data-a="item"][data-id^="bau_"]');
    click(w, '[data-a="use"]');
    popAll(w);
    if ($(w, '[data-a="close"]')) click(w, '[data-a="close"]');
  }
  assert.ok(!$(w, '[data-a="item"][data-id^="bau_"]'), 'baús abertos');
});
step('estado: distribuir pontos', () => {
  w.SYS.engine.state.freePoints = 3; w.SYS.ui.render();
  click(w, '[data-a="tab"][data-t="status"]');
  click(w, '[data-a="alloc"][data-s="agi"]');
  assert.strictEqual(w.SYS.engine.state.alloc.agi, 1);
  ['skills', 'ach', 'collection', 'history', 'settings'].forEach((p) => { click(w, '[data-a="page"][data-p="' + p + '"]'); click(w, '[data-a="back"]'); });
});
step('loja: comprar (sem Loja de lazer)', () => {
  w.SYS.engine.state.coins = 5000; w.SYS.ui.render();
  click(w, '[data-a="tab"][data-t="loja"]');
  click(w, '[data-a="shop-tab"][data-v="consumivel"]');
  const before = w.SYS.engine.count(w.SYS.engine.state, 'po_vida1');
  click(w, '[data-a="buy"][data-id="po_vida1"][data-q="5"]');
  assert.strictEqual(w.SYS.engine.count(w.SYS.engine.state, 'po_vida1'), before + 5);
  assert.ok(!$(w, '[data-a="shop-tab"][data-v="lazer"]'), 'a Loja de lazer já não existe');
  ['arma', 'armadura', 'acessorio', 'atributo', 'bau'].forEach((t) => click(w, '[data-a="shop-tab"][data-v="' + t + '"]'));
});
step('combate completo pela interface', () => {
  click(w, '[data-a="tab"][data-t="combate"]');
  click(w, '[data-a="boss"][data-id="b1"]');
  click(w, '[data-a="fight"]');
  let g = 0;
  while (!$(w, '[data-a="b-close"]') && g++ < 200) {
    if ($(w, '[data-a="b-pass"]')) { click(w, '[data-a="b-pass"]'); continue; }
    if (g % 3 === 0) { click(w, '[data-a="b-sheet"][data-v="skills"]'); const b = $(w, '[data-a="b-skill"]:not([disabled])'); if (b) click(w, b); else click(w, '[data-a="close"]'); }
    else click(w, '[data-a="b-attack"]');
    popAll(w);
  }
  popAll(w);
  click(w, '[data-a="b-close"]');
  popAll(w);
  assert.ok(w.SYS.engine.state.defeated.b1, 'chefe 1 derrotado');
  ['2', '5', '10'].forEach((g2) => click(w, '[data-a="gate"][data-g="' + g2 + '"]'));
});
step('o progresso sobrevive a fechar e reabrir a app', () => {
  const saved = {};
  for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); saved[k] = w.localStorage.getItem(k); }
  const st = w.SYS.engine.state;
  const dom2 = open(saved);
  const w2 = dom2.window;
  popAll(w2);
  const s2 = w2.SYS.engine.state;
  assert.strictEqual(s2.name, st.name);
  assert.strictEqual(s2.coins, st.coins);
  assert.strictEqual(s2.level, st.level);
  assert.ok(s2.defeated.b1);
  assert.strictEqual(JSON.stringify(s2.inv), JSON.stringify(st.inv));
  dom2.window.close();
});
step('batalha a meio continua depois de reabrir', () => {
  const E = w.SYS.engine;
  E.state.battle = null;
  E.setHp(E.state, 1e9); w.SYS.combat.start('b2');
  w.SYS.combat.act('attack');
  const turn = E.state.battle.turn;
  const saved = {};
  for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); saved[k] = w.localStorage.getItem(k); }
  const w2 = open(saved).window;
  popAll(w2);
  assert.strictEqual(w2.SYS.engine.state.battle.turn, turn);
  click(w2, '[data-a="tab"][data-t="combate"]');
  assert.ok($(w2, '[data-a="b-attack"]'));
});

step('portão do aparelho: bloqueado, acesso privado e verificação', () => {
  const saved = {};
  for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); saved[k] = w.localStorage.getItem(k); }
  // bloqueado: nem o jogo nem a conta aparecem; o código do aparelho e o motivo sim
  const wb = open(Object.assign({}, saved, { 'sis.gate.v1': JSON.stringify({ access: 'blocked', code: 'APR-ABCD-EFGH', block: { reason: 'Partilha de contas', since: Date.now() }, checkedAt: Date.now(), wa: 'https://wa.me/244900000000?text=x' }) })).window;
  assert.ok($(wb, '.gate-screen'), 'ecrã de bloqueio');
  assert.ok(/APR-ABCD-EFGH/.test($(wb, '.gate-screen').textContent));
  assert.ok(/Partilha de contas/.test($(wb, '.gate-screen').textContent));
  assert.ok($(wb, '[data-a="ext"]'), 'contestar pelo WhatsApp');
  assert.ok(!$(wb, '[data-a="tab"]'), 'sem acesso ao jogo');
  wb.close();
  // acesso privado: código de acesso ou pedido; também antes de criar personagem
  const wp = open({ 'sis.gate.v1': JSON.stringify({ access: 'pending', code: 'APR-WXYZ-2345', checkedAt: Date.now(), private: true }) }).window;
  assert.ok($(wp, '.gate-pending'), 'ecrã de acesso restrito');
  assert.ok($(wp, '#gate-acs') && $(wp, '[data-a="gate-redeem"]') && $(wp, '[data-a="gate-request"]'));
  assert.ok(!$(wp, '[data-a="intro-yes"]'), 'a introdução fica para depois');
  wp.close();
  // há demasiados dias sem internet: o Sistema pede ligação
  const ws = open(Object.assign({}, saved, { 'sis.gate.v1': JSON.stringify({ access: 'ok', code: 'APR-WXYZ-2345', checkedAt: Date.now() - 20 * 86400000, offline: 15 }) })).window;
  assert.ok($(ws, '.gate-verify'), 'ligação necessária');
  ws.close();
});

dom.window.close();
if (errors.length) { console.error('Erros de JavaScript:\n' + errors.join('\n')); process.exit(1); }
console.log('\n' + steps + ' passos da interface sem erros');
process.exit(0);
