/* Testes da API da Loja de Cristais.
   Usa uma réplica do Cloudflare D1 por cima do SQLite do Node (node:sqlite) e corre o Worker tal como está.
   Inclui todos os "Testes de aceitação obrigatórios" do Plano Mestre (secção 07). */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { handle, hashPassword } from '../src/index.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));

/* ---------- réplica do D1 ---------- */
function d1() {
  const db = new DatabaseSync(':memory:');
  const mig = fs.readdirSync(path.join(DIR, '..', 'migrations')).sort();
  mig.forEach((f) => db.exec(fs.readFileSync(path.join(DIR, '..', 'migrations', f), 'utf8')));
  function stmt(sql, args) {
    const exec = (fn) => { const s = db.prepare(sql); return fn(s, args.map((a) => (a === undefined ? null : a))); };
    return {
      bind: (...a) => stmt(sql, a),
      first: async () => exec((s, a) => s.get(...a) || null),
      all: async () => ({ results: exec((s, a) => s.all(...a)) }),
      run: async () => exec((s, a) => { const r = s.run(...a); return { meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; }),
      _sync: () => exec((s, a) => { if (/^\s*(SELECT|.*RETURNING)/is.test(sql)) return { results: s.all(...a) }; const r = s.run(...a); return { meta: { changes: Number(r.changes) } }; })
    };
  }
  return {
    raw: db,
    prepare: (sql) => stmt(sql, []),
    batch: async (list) => {
      db.exec('BEGIN');
      try { const out = list.map((s) => s._sync()); db.exec('COMMIT'); return out; }
      catch (e) { db.exec('ROLLBACK'); throw e; }
    }
  };
}

let T0 = Date.UTC(2026, 9, 18, 10, 0, 0);
let clock = T0;
Date.now = () => clock;
const tick = (ms) => { clock += ms; };

async function setup(mode) {
  const DB = d1();
  const env = { DB, MODE: mode || 'staging', ADMIN_USER: 'delcio', ADMIN_PASS_HASH: await hashPassword('palavra-passe-forte-123'), CODE_PEPPER: 'pimenta-de-teste' };
  let ip = '10.0.0.1';
  async function call(method, url, body, headers) {
    const req = new Request('https://api.test' + url, { method, headers: Object.assign({ 'Content-Type': 'application/json', 'CF-Connecting-IP': ip }, headers || {}), body: body ? JSON.stringify(body) : undefined });
    const res = await handle(req, env, null);
    return { status: res.status, ...(await res.json()) };
  }
  const api = {
    env, DB, call, setIp: (v) => { ip = v; },
    async login() { const r = await call('POST', '/api/admin/auth/login', { user: 'delcio', password: 'palavra-passe-forte-123' }); assert.equal(r.status, 200, r.error); return r.token; },
    admin(token) {
      const H = (k) => Object.assign({ Authorization: 'Bearer ' + token }, k ? { 'Idempotency-Key': k } : {});
      return {
        get: (u) => call('GET', u, null, H()),
        post: (u, b, k) => call('POST', u, b || {}, H(k)),
        put: (u, b) => call('PUT', u, b, H())
      };
    }
  };
  return api;
}
async function activate(A, id, price) { const r = await A.put('/api/admin/packages/' + id, { price_kz: price, active: true }); assert.equal(r.status, 200, r.error); }
const P1 = 'jogador_abc12345', P2 = 'jogador_xyz98765';
const key = (n) => 'chave-idempotencia-' + n + '-aaaaaa';

let passed = 0;
async function test(name, fn) {
  clock = T0;
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { console.error('  ✗ ' + name + '\n    ' + (e.stack || e)); process.exitCode = 1; }
}

console.log('API da Loja de Cristais');

await test('loja: tabela de preços inicial (6 pacotes, bónus crescente); pacote sem preço não se ativa', async () => {
  const S = await setup();
  let c = await S.call('GET', '/api/config');
  const coinPk = c.packages.filter((p) => p.kind === 'coins');
  assert.deepEqual(coinPk.map((p) => [p.id, p.coins, p.price_kz]), [['m_punhado', 1000, 500], ['m_bolsa', 2200, 1000], ['m_saco', 6000, 2500], ['m_cofre', 13000, 5000], ['m_tesouro', 28000, 10000], ['m_monarca', 60000, 20000]]);
  coinPk.forEach((p) => assert.equal(p.crystals, 0, 'pacote de moedas não dá Cristais'));
  c.packages = c.packages.filter((p) => p.kind !== 'coins');
  assert.deepEqual(c.packages.map((p) => [p.id, p.crystals, p.price_kz]), [['p_punhado', 60, 600], ['p_bolsa', 130, 1200], ['p_saco', 280, 2500], ['p_cofre', 600, 5000], ['p_tesouro', 1300, 10000], ['p_monarca', 2800, 20000]]);
  const per = c.packages.map((p) => p.price_kz / p.crystals);
  per.slice(1).forEach((v, i) => assert.ok(v < per[i], 'quanto maior o pacote, mais barato o Cristal'));
  assert.equal(c.packages.find((p) => p.id === 'p_saco').badge, 'Mais popular');
  assert.equal(c.test, true, 'ambiente de teste identificado');
  const A = S.admin(await S.login());
  const bad = await A.put('/api/admin/packages/c250', { active: true });
  assert.equal(bad.status, 400, 'não ativa sem preço');
  await activate(A, 'c250', 2500);
  await A.put('/api/admin/packages/p_monarca', { badge: 'Oferta de lançamento' });
  c = await S.call('GET', '/api/config');
  assert.ok(c.packages.some((p) => p.id === 'c250' && p.price_kz === 2500));
  assert.equal(c.packages.find((p) => p.id === 'p_monarca').badge, 'Oferta de lançamento');
});

await test('aceitação: credenciais inválidas e sessão expirada bloqueiam todas as operações', async () => {
  const S = await setup();
  const r = await S.call('POST', '/api/admin/auth/login', { user: 'delcio', password: 'errada' });
  assert.equal(r.status, 401);
  const r2 = await S.call('POST', '/api/admin/auth/login', { user: 'outro', password: 'palavra-passe-forte-123' });
  assert.equal(r2.status, 401);
  assert.equal((await S.call('GET', '/api/admin/dashboard')).status, 401, 'sem sessão');
  assert.equal((await S.admin('token-inventado-0123456789abcdef').get('/api/admin/orders')).status, 401, 'token falso');
  const tk = await S.login();
  const A = S.admin(tk);
  assert.equal((await A.get('/api/admin/dashboard')).status, 200);
  tick(2 * 3600000 + 1000);
  assert.equal((await A.get('/api/admin/dashboard')).status, 401, 'expira sem uso (2 h)');
  const B = S.admin(await S.login());
  for (let i = 0; i < 14; i++) { tick(55 * 60000); assert.equal((await B.get('/api/admin/session')).status, i < 13 ? 200 : 401, 'expira às 12 h mesmo em uso: ' + i); }
  const C = S.admin(await S.login());
  assert.equal((await C.post('/api/admin/auth/logout')).status, 200);
  assert.equal((await C.get('/api/admin/dashboard')).status, 401, 'depois de sair');
});

await test('segurança: 5 palavras-passe erradas bloqueiam o login durante 15 minutos', async () => {
  const S = await setup();
  for (let i = 0; i < 5; i++) assert.equal((await S.call('POST', '/api/admin/auth/login', { user: 'delcio', password: 'x' + i })).status, 401);
  const r = await S.call('POST', '/api/admin/auth/login', { user: 'delcio', password: 'palavra-passe-forte-123' });
  assert.equal(r.status, 429, 'bloqueado mesmo com a certa');
  tick(16 * 60000);
  assert.ok(await S.login());
  const au = (await S.admin(await S.login()).get('/api/admin/audit')).audit;
  assert.ok(au.filter((a) => a.action === 'auth.login' && a.result === 'denied').length === 5);
});

async function flow(S, A, player) {
  const o = await S.call('POST', '/api/orders', { package_id: 'c250', player_id: player || P1, player_name: 'Delcio' });
  assert.equal(o.status, 200, o.error);
  return o;
}

await test('pedido: o jogo cria o pedido, recebe o link do WhatsApp e consulta o estado com o token', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  await A.put('/api/admin/settings', { whatsapp: '+244 923 000 000' });
  const o = await flow(S, A);
  assert.match(o.order.id, /^SIS-\d{6}$/);
  assert.equal(o.order.crystals, 250);
  assert.ok(o.whatsapp_url.startsWith('https://wa.me/244923000000?text='));
  assert.ok(decodeURIComponent(o.whatsapp_url).includes(o.order.id));
  const st = await S.call('GET', '/api/orders/' + o.order.id + '?token=' + o.token);
  assert.equal(st.order.status, 'pending_payment');
  assert.equal((await S.call('GET', '/api/orders/' + o.order.id + '?token=errado')).status, 404, 'sem token não revela o pedido');
  const o2 = await flow(S, A);
  assert.equal(+o2.order.id.slice(4), +o.order.id.slice(4) + 1, 'números seguidos');
  // o preço fica fixo no pedido, mesmo que mude depois
  await A.put('/api/admin/packages/c250', { price_kz: 3000 });
  const d = await A.get('/api/admin/orders/' + o.order.id);
  assert.equal(d.order.price_kz, 2500);
});

await test('aceitação: um pedido pendente não permite emitir código', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  const o = await flow(S, A);
  const r = await A.post('/api/admin/orders/' + o.order.id + '/issue-code', {}, key(1));
  assert.equal(r.status, 409);
  assert.match(r.error, /não foi confirmado/);
  assert.equal(S.DB.raw.prepare('SELECT COUNT(*) AS n FROM codes').get().n, 0);
});

await test('confirmação exige verificação real e referência; captura de ecrã não basta', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  const o = await flow(S, A);
  assert.equal((await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { payment_ref: 'MCX123' })).status, 400, 'sem "verifiquei"');
  assert.equal((await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { verified: true })).status, 400, 'sem referência');
  const ok = await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { verified: true, payment_ref: 'MCX123' });
  assert.equal(ok.order.status, 'payment_confirmed');
  // a mesma referência noutro pedido é avisada (provável pagamento repetido)
  const o2 = await flow(S, A);
  const dup = await A.post('/api/admin/orders/' + o2.order.id + '/confirm-payment', { verified: true, payment_ref: 'MCX123' });
  assert.equal(dup.status, 409); assert.equal(dup.duplicate_of, o.order.id);
});

await test('aceitação: uma confirmação duplicada não cria uma segunda venda', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  const o = await flow(S, A);
  const u = '/api/admin/orders/' + o.order.id + '/confirm-payment', b = { verified: true, payment_ref: 'MCX-777' };
  const r1 = await A.post(u, b), r2 = await A.post(u, b), r3 = await A.post(u, b);
  assert.equal(r1.repeated, false); assert.equal(r2.repeated, true); assert.equal(r3.repeated, true);
  const d = await A.get('/api/admin/dashboard?period=today');
  assert.equal(d.confirmed_sales, 1); assert.equal(d.revenue_kz, 2500);
  assert.equal((await A.get('/api/admin/audit')).audit.filter((a) => a.action === 'order.confirm_payment').length, 1);
});

await test('aceitação: um pedido não recebe dois códigos ativos por repetição da chamada', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  const o = await flow(S, A);
  await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-001' });
  const u = '/api/admin/orders/' + o.order.id + '/issue-code';
  assert.equal((await A.post(u, {})).status, 400, 'exige chave de idempotência');
  const c1 = await A.post(u, {}, key(1));
  assert.match(c1.code, /^SIS-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
  const c2 = await A.post(u, {}, key(1)); // rede caiu: repete com a mesma chave → mesmo código
  assert.equal(c2.code, c1.code); assert.equal(c2.repeated, true);
  const c3 = await A.post(u, {}, key(2)); // nova chave → recusado
  assert.equal(c3.status, 409);
  assert.equal(S.DB.raw.prepare("SELECT COUNT(*) AS n FROM codes WHERE status != 'revoked'").get().n, 1);
  // o código nunca fica guardado em claro
  const row = S.DB.raw.prepare('SELECT * FROM codes').get();
  assert.ok(!JSON.stringify(row).includes(c1.code.slice(4)) && row.code_hash.length === 64);
  const det = await A.get('/api/admin/orders/' + o.order.id);
  assert.ok(!JSON.stringify(det).includes(c1.code.replace(/^SIS-/, '')), 'o detalhe não revela o código');
  // passados 15 min a resposta guardada desaparece
  tick(16 * 60000);
  await S.call('GET', '/'); // (limpeza é ocasional; força a verificação pela expiração)
  const c4 = await A.post(u, {}, key(1));
  assert.equal(c4.status, 409, 'depois de 15 min já não mostra o código outra vez');
});

await test('aceitação: o código não pode ser resgatado duas vezes nem por outro jogador; cristais só uma vez', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  const o = await flow(S, A);
  await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-001' });
  const { code } = await A.post('/api/admin/orders/' + o.order.id + '/issue-code', {}, key(1));
  const r1 = await S.call('POST', '/api/redeem', { code: code.toLowerCase().replace(/-/g, ' '), player_id: P1 }); // escrito à pressa
  assert.equal(r1.status, 200, r1.error); assert.equal(r1.crystals, 250); assert.equal(r1.repeated, false);
  // o mesmo jogador repete (a rede caiu): o servidor devolve o MESMO resgate (o jogo não credita duas vezes)
  const r2 = await S.call('POST', '/api/redeem', { code, player_id: P1 });
  assert.equal(r2.redemption_id, r1.redemption_id); assert.equal(r2.repeated, true);
  // outro jogador: recusado, sem dizer que o código existe
  const r3 = await S.call('POST', '/api/redeem', { code, player_id: P2 });
  assert.equal(r3.status, 400); assert.equal(r3.error, 'Código inválido ou já utilizado.');
  const inv = await S.call('POST', '/api/redeem', { code: 'SIS-AAAA-BBBB-CCCC', player_id: P2 });
  assert.equal(inv.error, r3.error, 'mesma mensagem para código inexistente');
  const d = await A.get('/api/admin/orders/' + o.order.id);
  assert.equal(d.order.status, 'redeemed'); assert.equal(d.codes[0].redeemed_player, P1);
  assert.equal((await A.get('/api/admin/audit')).audit.filter((a) => a.action === 'code.redeem' && a.result === 'ok').length, 1);
  // um pedido resgatado não pode ser cancelado (os cristais já foram entregues)
  assert.equal((await A.post('/api/admin/orders/' + o.order.id + '/cancel', { reason: 'teste' })).status, 409);
});

await test('resgate simultâneo: duas tentativas ao mesmo tempo, só uma ganha', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  const o = await flow(S, A);
  await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-001' });
  const { code } = await A.post('/api/admin/orders/' + o.order.id + '/issue-code', {}, key(1));
  const rs = await Promise.all([S.call('POST', '/api/redeem', { code, player_id: P1 }), S.call('POST', '/api/redeem', { code, player_id: P2 })]);
  assert.equal(rs.filter((r) => r.status === 200).length, 1);
  assert.equal(S.DB.raw.prepare("SELECT COUNT(*) AS n FROM codes WHERE status = 'redeemed'").get().n, 1);
});

await test('segurança: tentativas de adivinhar códigos são limitadas', async () => {
  const S = await setup();
  for (let i = 0; i < 8; i++) assert.equal((await S.call('POST', '/api/redeem', { code: 'SIS-AAAA-AAAA-AAA' + 'BCDEFGHJ'[i], player_id: P1 })).status, 400);
  assert.equal((await S.call('POST', '/api/redeem', { code: 'SIS-AAAA-AAAA-AAAK', player_id: P1 })).status, 429);
  tick(16 * 60000);
  assert.equal((await S.call('POST', '/api/redeem', { code: 'SIS-AAAA-AAAA-AAAK', player_id: P1 })).status, 400);
});

await test('substituir código: revoga o antigo (com motivo na auditoria) e o antigo deixa de funcionar', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  const o = await flow(S, A);
  await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-001' });
  const c1 = await A.post('/api/admin/orders/' + o.order.id + '/issue-code', {}, key(1));
  assert.equal((await A.post('/api/admin/orders/' + o.order.id + '/reissue-code', {}, key(2))).status, 400, 'motivo obrigatório');
  const c2 = await A.post('/api/admin/orders/' + o.order.id + '/reissue-code', { reason: 'Jogador apagou a mensagem' }, key(3));
  assert.notEqual(c2.code, c1.code);
  assert.equal((await S.call('POST', '/api/redeem', { code: c1.code, player_id: P1 })).status, 400);
  assert.equal((await S.call('POST', '/api/redeem', { code: c2.code, player_id: P1 })).status, 200);
  const au = (await A.get('/api/admin/audit')).audit.filter((a) => a.action === 'code.reissue');
  assert.equal(au.length, 1); assert.match(au[0].detail, /apagou a mensagem/);
});

await test('cancelar / reembolsar: revoga o código e regista; o jogador pode cancelar o seu pedido pendente', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  const o = await flow(S, A);
  await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-001' });
  const c = await A.post('/api/admin/orders/' + o.order.id + '/issue-code', {}, key(1));
  const r = await A.post('/api/admin/orders/' + o.order.id + '/cancel', { reason: 'Pagamento estornado pelo banco', refunded: true });
  assert.equal(r.order.status, 'refunded');
  assert.equal((await S.call('POST', '/api/redeem', { code: c.code, player_id: P1 })).status, 400, 'código revogado');
  const o2 = await flow(S, A);
  const pc = await S.call('POST', '/api/orders/' + o2.order.id + '/cancel', { token: o2.token });
  assert.equal(pc.order.status, 'cancelled');
  assert.equal((await S.call('POST', '/api/orders/' + o2.order.id + '/cancel', { token: 'x' })).status, 404);
});

await test('limites: no máximo 3 pedidos pendentes por jogador; pendentes expiram ao fim de 7 dias', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  await flow(S, A); await flow(S, A); await flow(S, A);
  const r = await S.call('POST', '/api/orders', { package_id: 'c250', player_id: P1, player_name: 'Delcio' });
  assert.equal(r.status, 409);
  tick(8 * 86400000);
  const real = Math.random; Math.random = () => 0; // força a limpeza neste pedido
  await S.call('GET', '/api/config');
  Math.random = real;
  assert.equal(S.DB.raw.prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'cancelled'").get().n, 3);
  assert.equal((await S.call('POST', '/api/orders', { package_id: 'c250', player_id: P1, player_name: 'Delcio' })).status, 200);
});

await test('aceitação: após falha de rede, o estado é recuperado por consulta à API', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  const o = await flow(S, A);
  await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-009' });
  // o APK perdeu a resposta: consulta o pedido e vê que já está confirmado
  const d = await A.get('/api/admin/orders/' + o.order.id);
  assert.equal(d.order.status, 'payment_confirmed'); assert.equal(d.order.payment_ref, 'REF-009');
  // o jogo perdeu a resposta do resgate: repete e recebe o mesmo
  const { code } = await A.post('/api/admin/orders/' + o.order.id + '/issue-code', {}, key(5));
  const a = await S.call('POST', '/api/redeem', { code, player_id: P1 });
  const b = await S.call('POST', '/api/redeem', { code, player_id: P1 });
  assert.equal(a.redemption_id, b.redemption_id);
  const st = await S.call('GET', '/api/orders/' + o.order.id + '?token=' + o.token);
  assert.equal(st.order.status, 'redeemed');
});

await test('aceitação: o painel identifica dados de teste e não os mistura com produção', async () => {
  const S = await setup('staging');
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  const o = await flow(S, A);
  assert.equal(o.order.test, true);
  assert.equal((await A.get('/api/admin/dashboard')).test, true);
  const P = await setup('production');
  const B = P.admin(await P.login());
  await activate(B, 'c250', 2500);
  const o2 = await flow(P, B);
  assert.equal(o2.order.test, false);
  assert.equal((await P.call('GET', '/api/config')).test, false);
});

await test('painel: pendentes primeiro, estatísticas por período e por pacote, sessões e definições', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500); await activate(A, 'c100', 1200);
  const a = await flow(S, A);
  const b = await S.call('POST', '/api/orders', { package_id: 'c100', player_id: P2, player_name: 'Ana' });
  await A.post('/api/admin/orders/' + a.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-A01' });
  const d = await A.get('/api/admin/dashboard?period=today');
  assert.equal(d.pending, 1); assert.equal(d.awaiting_code, 1); assert.equal(d.queue[0].id, a.order.id, 'mais antigo primeiro');
  const s = await A.get('/api/admin/stats?days=30');
  assert.equal(s.total_sales, 1); assert.equal(s.total_kz, 2500); assert.equal(s.daily.length, 1);
  const l = await A.get('/api/admin/orders?status=pending_payment');
  assert.deepEqual(l.orders.map((x) => x.id), [b.order.id]);
  const f = await A.get('/api/admin/orders?q=Ana');
  assert.equal(f.orders.length, 1);
  const B = S.admin(await S.login());
  assert.equal((await A.get('/api/admin/sessions')).sessions.length, 2);
  await A.post('/api/admin/sessions/revoke-others');
  assert.equal((await B.get('/api/admin/session')).status, 401, 'outras sessões terminadas');
  const st = await A.put('/api/admin/settings', { shop_open: false });
  assert.equal(st.settings.shop_open, '0');
  assert.equal((await S.call('POST', '/api/orders', { package_id: 'c250', player_id: P2, player_name: 'Ana' })).status, 403, 'loja fechada');
  assert.equal((await A.put('/api/admin/settings', { whatsapp: '12' })).status, 400);
});

await test('sem administrador configurado, ninguém entra', async () => {
  const S = await setup();
  delete S.env.ADMIN_PASS_HASH;
  assert.equal((await S.call('POST', '/api/admin/auth/login', { user: 'delcio', password: 'palavra-passe-forte-123' })).status, 503);
});

await test('produção: os pedidos feitos em teste não entram nas contas nem nas listas', async () => {
  const S = await setup('staging');
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  const t = await flow(S, A);
  await A.post('/api/admin/orders/' + t.order.id + '/confirm-payment', { verified: true, payment_ref: 'TESTE-001' });
  S.env.MODE = 'production'; // a mesma base de dados passa a produção
  const B = S.admin(await S.login());
  const r = await flow(S, B);
  await B.post('/api/admin/orders/' + r.order.id + '/confirm-payment', { verified: true, payment_ref: 'REAL-001' });
  const d = await B.get('/api/admin/dashboard?period=today');
  assert.equal(d.confirmed_sales, 1); assert.equal(d.test, false);
  assert.deepEqual((await B.get('/api/admin/orders?status=all')).orders.map((o) => o.id), [r.order.id]);
  assert.equal((await B.get('/api/admin/orders?status=all&test=1')).orders.length, 2, 'ainda consultáveis se pedido');
  assert.equal((await B.get('/api/admin/stats?days=30')).total_sales, 1);
});

const TOK1 = 'segredo-do-jogador-um-0123456789', TOK2 = 'segredo-do-jogador-dois-987654321';
const syncP = (S, pid, tok, extra) => S.call('POST', '/api/player/sync', Object.assign({ player_id: pid, token: tok, name: 'Delcio', cls: 'mago', level: 12, crystals: 40, coins: 900, stats: { missions: 30, bosses: 4, streak: 5, hack: 'x' }, app_version: '1.0.0', platform: 'android' }, extra || {}));

await test('jogadores: o jogo regista-se com um segredo; outro aparelho não pode usar o mesmo ID', async () => {
  const S = await setup();
  const r = await syncP(S, P1, TOK1);
  assert.equal(r.status, 200); assert.equal(r.account, 'active'); assert.deepEqual(r.inbox, []);
  const again = await syncP(S, P1, TOK1, { level: 13 });
  assert.equal(again.ok, true);
  const thief = await syncP(S, P1, TOK2);
  assert.equal(thief.status, 403); assert.equal(thief.conflict, true);
  const A = S.admin(await S.login());
  const l = await A.get('/api/admin/players?q=' + P1.slice(0, 8));
  assert.equal(l.players.length, 1); assert.equal(l.players[0].level, 13); assert.equal(l.totals.players, 1);
  assert.equal(l.players[0].stats.hack, undefined, 'só guarda os números conhecidos');
  const d = await A.get('/api/admin/players/' + P1);
  assert.equal(d.player.name, 'Delcio'); assert.equal(d.player.syncs, 2);
});

await test('banir: o jogo recebe o bloqueio, não compra nem resgata; temporário levanta-se sozinho; desbanir', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  await syncP(S, P1, TOK1);
  assert.equal((await A.post('/api/admin/players/' + P1 + '/ban', {})).status, 400, 'motivo obrigatório');
  const b = await A.post('/api/admin/players/' + P1 + '/ban', { reason: 'Uso de batota', days: 3 });
  assert.equal(b.player.status, 'banned');
  const s1 = await syncP(S, P1, TOK1);
  assert.equal(s1.account, 'banned'); assert.equal(s1.ban.reason, 'Uso de batota'); assert.ok(s1.ban.until > Date.now());
  const o = await S.call('POST', '/api/orders', { package_id: 'c250', player_id: P1, player_name: 'Delcio' });
  assert.equal(o.status, 403); assert.equal(o.banned, true);
  assert.equal((await S.call('POST', '/api/redeem', { code: 'SIS-AAAA-BBBB-CCCC', player_id: P1 })).status, 403);
  tick(3 * 86400000 + 1000);
  assert.equal((await syncP(S, P1, TOK1)).account, 'active', 'suspensão de 3 dias acabou');
  const A2 = S.admin(await S.login()); // a sessão anterior expirou (2 h sem uso)
  await A2.post('/api/admin/players/' + P1 + '/ban', { reason: 'Conta desativada' }); // permanente
  tick(400 * 86400000);
  const s2 = await syncP(S, P1, TOK1); assert.equal(s2.account, 'banned'); assert.equal(s2.ban.until, null);
  const A3 = S.admin(await S.login());
  await A3.post('/api/admin/players/' + P1 + '/unban', { reason: 'Recurso aceite' });
  assert.equal((await syncP(S, P1, TOK1)).account, 'active');
  const au = (await A3.get('/api/admin/players/' + P1)).audit.map((a) => a.action);
  ['player.ban', 'player.disable', 'player.unban'].forEach((x) => assert.ok(au.includes(x), x));
});

await test('ofertas automáticas: chegam ao jogo na sincronização e só se recebem uma vez', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  assert.equal((await A.post('/api/admin/grants', { player_id: P1, crystals: 100, reason: 'Evento', mode: 'auto' }, key(1))).status, 404, 'jogador ainda não registado');
  await syncP(S, P1, TOK1);
  const g = await A.post('/api/admin/grants', { player_id: P1, crystals: 100, coins: 500, reason: 'Vencedor do evento', message: 'Parabéns, Jogador.', mode: 'auto' }, key(2));
  assert.equal(g.status, 200, g.error); assert.equal(g.code, undefined, 'sem código');
  const again = await A.post('/api/admin/grants', { player_id: P1, crystals: 100, coins: 500, reason: 'Vencedor do evento', mode: 'auto' }, key(2));
  assert.equal(again.repeated, true, 'repetir com a mesma chave não duplica');
  const s = await syncP(S, P1, TOK1);
  assert.equal(s.inbox.length, 1); assert.equal(s.inbox[0].crystals, 100); assert.equal(s.inbox[0].message, 'Parabéns, Jogador.');
  assert.equal((await S.call('POST', '/api/player/claim', { player_id: P1, token: TOK2, grant_id: s.inbox[0].id })).status, 403, 'outro aparelho não recebe');
  const c1 = await S.call('POST', '/api/player/claim', { player_id: P1, token: TOK1, grant_id: s.inbox[0].id });
  const c2 = await S.call('POST', '/api/player/claim', { player_id: P1, token: TOK1, grant_id: s.inbox[0].id });
  assert.equal(c1.crystals, 100); assert.equal(c1.coins, 500); assert.equal(c2.repeated, true); assert.equal(c1.redemption_id, c2.redemption_id);
  assert.equal((await syncP(S, P1, TOK1)).inbox.length, 0, 'já recebido');
  // anular uma oferta pendente
  const g2 = await A.post('/api/admin/grants', { player_id: P1, crystals: 50, reason: 'Engano', mode: 'auto' }, key(3));
  assert.equal((await A.post('/api/admin/grants/' + g2.grant.id + '/revoke', { reason: 'Enviado por engano' })).grant.status, 'revoked');
  assert.equal((await syncP(S, P1, TOK1)).inbox.length, 0);
  assert.equal((await A.post('/api/admin/grants/' + g.grant.id + '/revoke', { reason: 'tarde' })).status, 409, 'já recebida não se anula');
});

await test('ofertas por código: presas a um jogador ou para qualquer um; uso único', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  const g = await A.post('/api/admin/grants', { player_id: P1, crystals: 30, reason: 'Compensação', mode: 'code' }, key(4));
  assert.match(g.code, /^SIS-/); assert.ok(g.message.includes(g.code));
  assert.equal((await S.call('POST', '/api/redeem', { code: g.code, player_id: P2 })).status, 400, 'só na conta indicada');
  const r = await S.call('POST', '/api/redeem', { code: g.code, player_id: P1 });
  assert.equal(r.crystals, 30); assert.ok(r.redemption_id.startsWith('g_'));
  assert.equal((await S.call('POST', '/api/redeem', { code: g.code, player_id: P1 })).repeated, true);
  const open = await A.post('/api/admin/grants', { crystals: 10, reason: 'Sorteio no Instagram', mode: 'code' }, key(5));
  assert.equal((await S.call('POST', '/api/redeem', { code: open.code, player_id: P2 })).crystals, 10, 'código aberto: qualquer jogador');
  assert.equal((await S.call('POST', '/api/redeem', { code: open.code, player_id: P1 })).status, 400, 'mas só uma vez');
  assert.ok(!JSON.stringify(S.DB.raw.prepare('SELECT * FROM grants').all()).includes(g.code.slice(4)), 'código nunca guardado em claro');
});

await test('moedas com dinheiro real: pedido, código e entrega automática dão moedas e não Cristais', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await syncP(S, P1, TOK1);
  const o = await S.call('POST', '/api/orders', { package_id: 'm_saco', player_id: P1, player_name: 'Delcio' });
  assert.equal(o.status, 200, o.error); assert.equal(o.order.coins, 6000); assert.equal(o.order.crystals, 0);
  assert.ok(/6\.?000 moedas/.test(o.message), o.message);
  await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-M-1' });
  const { code } = await A.post('/api/admin/orders/' + o.order.id + '/issue-code', {}, key(31));
  const r = await S.call('POST', '/api/redeem', { code, player_id: P1 });
  assert.equal(r.status, 200, r.error); assert.equal(r.coins, 6000); assert.equal(r.crystals, 0);
  // entrega automática
  const o2 = await S.call('POST', '/api/orders', { package_id: 'm_punhado', player_id: P1, player_name: 'Delcio' });
  await A.post('/api/admin/orders/' + o2.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-M-2' });
  const d = await A.post('/api/admin/orders/' + o2.order.id + '/deliver', {}, key(32));
  assert.equal(d.status, 200, d.error); assert.equal(d.coins, 1000);
  const sy = await syncP(S, P1, TOK1);
  const g = await S.call('POST', '/api/player/claim', { player_id: P1, token: TOK1, grant_id: sy.inbox[0].id });
  assert.equal(g.coins, 1000); assert.equal(g.crystals, 0);
  assert.equal((await A.get('/api/admin/orders/' + o2.order.id)).order.coins, 1000);
});

await test('entrega automática de uma compra: sem código, o pedido fica resgatado quando o jogo recebe', async () => {
  const S = await setup();
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  await syncP(S, P1, TOK1);
  const o = await flow(S, A);
  assert.equal((await A.post('/api/admin/orders/' + o.order.id + '/deliver', {}, key(6))).status, 409, 'não entrega sem pagamento');
  await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-AUTO-1' });
  const d = await A.post('/api/admin/orders/' + o.order.id + '/deliver', {}, key(7));
  assert.equal(d.status, 200, d.error); assert.equal(d.registered, true);
  assert.equal((await A.post('/api/admin/orders/' + o.order.id + '/deliver', {}, key(7))).repeated, true);
  assert.equal((await A.post('/api/admin/orders/' + o.order.id + '/deliver', {}, key(8))).status, 409, 'não entrega duas vezes');
  assert.equal((await A.post('/api/admin/orders/' + o.order.id + '/issue-code', {}, key(9))).status, 409, 'nem código depois da entrega');
  let det = await A.get('/api/admin/orders/' + o.order.id);
  assert.equal(det.order.status, 'code_issued'); assert.equal(det.order.delivery, 'auto'); assert.equal(det.grants.length, 1);
  const s = await syncP(S, P1, TOK1);
  const c = await S.call('POST', '/api/player/claim', { player_id: P1, token: TOK1, grant_id: s.inbox[0].id });
  assert.equal(c.crystals, 250); assert.equal(c.order_id, o.order.id);
  det = await A.get('/api/admin/orders/' + o.order.id);
  assert.equal(det.order.status, 'redeemed');
  assert.equal((await S.call('GET', '/api/orders/' + o.order.id + '?token=' + o.token)).order.status, 'redeemed');
  // cancelar uma compra com entrega ainda por receber anula a entrega
  const o2 = await flow(S, A);
  await A.post('/api/admin/orders/' + o2.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-AUTO-2' });
  await A.post('/api/admin/orders/' + o2.order.id + '/deliver', {}, key(10));
  await A.post('/api/admin/orders/' + o2.order.id + '/cancel', { reason: 'Estorno', refunded: true });
  assert.equal((await syncP(S, P1, TOK1)).inbox.length, 0);
  const dash = await A.get('/api/admin/dashboard');
  assert.equal(dash.players.total, 1);
});

await test('tipos de utilizador: automático (Usuário → Usuário Premium depois de comprar) e definido pelo administrador', async () => {
  const S = await setup('production');
  const A = S.admin(await S.login());
  await activate(A, 'c250', 2500);
  assert.equal((await syncP(S, P1, TOK1)).role.id, 'usuario');
  let l = await A.get('/api/admin/players');
  assert.equal(l.players[0].role, 'usuario'); assert.equal(l.players[0].role_auto, true); assert.equal(l.totals.roles.usuario, 1);
  assert.equal(l.players[0].test, undefined, 'sem marca de teste');
  const o = await flow(S, A, P1);
  await A.post('/api/admin/orders/' + o.order.id + '/confirm-payment', { verified: true, payment_ref: 'REF-ROLE-1' });
  assert.equal((await syncP(S, P1, TOK1)).role.id, 'premium');
  assert.equal((await A.get('/api/admin/players?role=premium')).players.length, 1);
  for (const r of ['doador', 'teste', 'admin', 'funcionario', 'parceria', 'usuario']) {
    const d = await A.put('/api/admin/players/' + P1 + '/role', { role: r });
    assert.equal(d.status, 200, d.error); assert.equal(d.player.role, r); assert.equal(d.player.role_auto, false);
  }
  assert.equal((await A.put('/api/admin/players/' + P1 + '/role', { role: 'rei' })).status, 400);
  const back = await A.put('/api/admin/players/' + P1 + '/role', { role: 'auto' });
  assert.equal(back.player.role, 'premium'); assert.equal(back.player.role_auto, true);
  assert.ok((await A.get('/api/admin/audit')).audit.some((e) => e.action === 'player.role'));
});

await test('avisos: para todos ou para um jogador; aparecem no jogo; apagar tira-os do jogo', async () => {
  const S = await setup('production');
  const A = S.admin(await S.login());
  await syncP(S, P1, TOK1); await syncP(S, P2, TOK2);
  assert.equal((await A.post('/api/admin/notices', { title: 'Olá', body: 'x' }, key('n0'))).status, 400);
  const all = await A.post('/api/admin/notices', { title: 'Nova atualização', body: 'Linha 1\nLinha 2', kind: 'evento' }, key('n1'));
  assert.equal(all.status, 200, all.error); assert.equal(all.notice.body, 'Linha 1\nLinha 2');
  assert.equal((await A.post('/api/admin/notices', { title: 'Nova atualização', body: 'Linha 1\nLinha 2', kind: 'evento' }, key('n1'))).repeated, true);
  const one = await A.post('/api/admin/notices', { title: 'Só para ti', body: 'Mensagem privada', player_id: P1 }, key('n2'));
  assert.equal((await A.post('/api/admin/notices', { title: 'Ninguém', body: 'Mensagem', player_id: 'jogador_naoexiste1' }, key('n3'))).status, 404);
  let s1 = await syncP(S, P1, TOK1), s2 = await syncP(S, P2, TOK2);
  assert.deepEqual(s1.notices.map((n) => n.title).sort(), ['Nova atualização', 'Só para ti']);
  assert.deepEqual(s2.notices.map((n) => n.title), ['Nova atualização']);
  assert.equal(s1.notices.find((n) => n.personal).body, 'Mensagem privada');
  assert.equal((await A.get('/api/admin/notices')).notices.length, 2);
  assert.equal((await A.get('/api/admin/players/' + P1)).notices.length, 1);
  assert.equal((await A.post('/api/admin/notices/' + all.notice.id + '/delete', {})).status, 200);
  s2 = await syncP(S, P2, TOK2); assert.equal(s2.notices.length, 0);
  assert.equal((await A.get('/api/admin/notices')).notices.length, 1);
  void one;
});

await test('apagar conta: exige confirmação, apaga os dados, o jogo é avisado e o ID não volta a registar-se', async () => {
  const S = await setup('production');
  const A = S.admin(await S.login());
  await syncP(S, P1, TOK1);
  await A.post('/api/admin/grants', { mode: 'auto', player_id: P1, crystals: 50, reason: 'Oferta' }, key('d1'));
  assert.equal((await A.post('/api/admin/players/' + P1 + '/delete', { confirm: 'outro' })).status, 400);
  const d = await A.post('/api/admin/players/' + P1 + '/delete', { confirm: P1, reason: 'Conta duplicada' });
  assert.equal(d.status, 200, d.error);
  assert.equal((await A.get('/api/admin/players')).players.length, 0);
  const s = await syncP(S, P1, TOK1);
  assert.equal(s.account, 'deleted'); assert.equal(s.reason, 'Conta duplicada');
  assert.equal((await A.get('/api/admin/players')).players.length, 0, 'não volta a registar-se');
  assert.equal((await S.call('POST', '/api/orders', { player_id: P1, player_name: 'X', package_id: 'p_saco' })).status, 410);
  assert.equal((await A.get('/api/admin/grants?status=revoked')).grants.length, 1, 'ofertas por receber anuladas');
  assert.ok((await A.get('/api/admin/audit')).audit.some((e) => e.action === 'player.delete'));
});

console.log('Social e duelos');
const P3 = 'jogador_ttt33333', TOK3 = 'segredo-do-jogador-3-xxxxxxxxxxxxxx';
const as = (pid, tok) => ({ player_id: pid, token: tok });
async function trio(S) {
  await syncP(S, P1, TOK1, { name: 'Delcio', cls: 'guerreiro', level: 30 });
  await syncP(S, P2, TOK2, { name: 'Ana', cls: 'mago', level: 30 });
  await syncP(S, P3, TOK3, { name: 'Rui', cls: 'assassino', level: 5 });
}
const FIGHT = { cls: 'guerreiro', hp: 1400, mp: 170, atk: 330, matk: 17, def: 108, crit: 10, critDmg: 150, eva: 3, lifesteal: 0, agi: 12, skills: ['g1', 'g3', 'g11', 'g9', 'm1'], items: { po_vida1: 5, po_bomba: 1, nada: 3 } };

await test('amigos: pedido, aceitar, lista com online/offline, recusar e remover; só jogadores reais', async () => {
  const S = await setup('production'); await trio(S);
  const C = (u, b) => S.call('POST', u, b);
  assert.equal((await C('/api/social/state', as(P1, 'token-errado-xxxxxxxxxxxxxx'))).status, 403);
  assert.equal((await C('/api/social/friend/request', Object.assign(as(P1, TOK1), { to: 'jogador_inexistente' }))).status, 404);
  assert.equal((await C('/api/social/friend/request', Object.assign(as(P1, TOK1), { to: P1 }))).status, 400);
  const f = await C('/api/social/find', Object.assign(as(P1, TOK1), { query: 'An' }));
  assert.equal(f.players.length, 1); assert.equal(f.players[0].id, P2); assert.equal(f.players[0].relation, 'none');
  assert.equal((await C('/api/social/friend/request', Object.assign(as(P1, TOK1), { to: P2 }))).status, 'sent');
  let s2 = await C('/api/social/state', as(P2, TOK2));
  assert.equal(s2.requests_in.length, 1); assert.equal(s2.requests_in[0].name, 'Delcio');
  assert.equal((await C('/api/social/friend/respond', Object.assign(as(P2, TOK2), { from: P1, accept: true }))).status, 'friend');
  let s1 = await C('/api/social/state', as(P1, TOK1));
  assert.equal(s1.friends.length, 1); assert.ok(s1.friends[0].online, 'acabou de usar o jogo: online');
  tick(10 * 60 * 1000);
  s1 = await C('/api/social/state', as(P1, TOK1)); assert.ok(!s1.friends[0].online, 'sem atividade há 10 min: offline');
  // pedido cruzado vira amizade; recusar apaga
  await C('/api/social/friend/request', Object.assign(as(P3, TOK3), { to: P1 }));
  assert.equal((await C('/api/social/friend/respond', Object.assign(as(P1, TOK1), { from: P3, accept: false }))).status, 'none');
  assert.equal((await C('/api/social/state', as(P3, TOK3))).requests_out.length, 0);
  await C('/api/social/friend/request', Object.assign(as(P3, TOK3), { to: P1 }));
  assert.equal((await C('/api/social/friend/request', Object.assign(as(P1, TOK1), { to: P3 }))).status, 'friend');
  assert.equal((await C('/api/social/friend/remove', Object.assign(as(P1, TOK1), { other: P3 }))).status, 'none');
  assert.equal((await C('/api/social/state', as(P1, TOK1))).friends.length, 1);
});

await test('conversa: só entre amigos, mensagens por ler, histórico e limite de envio', async () => {
  const S = await setup('production'); await trio(S);
  const C = (u, b) => S.call('POST', u, b);
  assert.equal((await C('/api/social/chat/send', Object.assign(as(P1, TOK1), { to: P2, text: 'olá' }))).status, 403, 'ainda não são amigos');
  await C('/api/social/friend/request', Object.assign(as(P1, TOK1), { to: P2 }));
  await C('/api/social/friend/respond', Object.assign(as(P2, TOK2), { from: P1, accept: true }));
  const m = await C('/api/social/chat/send', Object.assign(as(P1, TOK1), { to: P2, text: '  Bora um duelo? <b>x</b>  ' }));
  assert.equal(m.status, 200, m.error); assert.equal(m.message.text, 'Bora um duelo? <b>x</b>');
  await C('/api/social/chat/send', Object.assign(as(P1, TOK1), { to: P2, text: 'Estou online' }));
  let s2 = await C('/api/social/state', as(P2, TOK2));
  assert.equal(s2.unread, 2); assert.equal(s2.friends[0].unread, 2);
  const h = await C('/api/social/chat/history', Object.assign(as(P2, TOK2), { with: P1 }));
  assert.deepEqual(h.messages.map((x) => x.text), ['Bora um duelo? <b>x</b>', 'Estou online']);
  s2 = await C('/api/social/state', as(P2, TOK2)); assert.equal(s2.unread, 0, 'lidas');
  const r = await C('/api/social/chat/send', Object.assign(as(P2, TOK2), { to: P1, text: 'Vamos!' }));
  const after = await C('/api/social/chat/history', Object.assign(as(P1, TOK1), { with: P2, after: h.messages[1].id }));
  assert.deepEqual(after.messages.map((x) => x.id), [r.message.id], 'só as novas');
  assert.equal((await C('/api/social/chat/send', Object.assign(as(P1, TOK1), { to: P2, text: '   ' }))).status, 400);
  let last; for (let i = 0; i < 31; i++) last = await C('/api/social/chat/send', Object.assign(as(P1, TOK1), { to: P2, text: 'spam ' + i }));
  assert.equal(last.status, 429);
  assert.equal((await C('/api/social/chat/history', Object.assign(as(P3, TOK3), { with: P1 }))).status, 403);
});

await test('duelo: sala, convite, entrar por código, turnos decididos pelo servidor até ao fim, registo e pontuação', async () => {
  const S = await setup('production'); await trio(S);
  const C = (u, b) => S.call('POST', u, b);
  await C('/api/social/friend/request', Object.assign(as(P1, TOK1), { to: P2 }));
  await C('/api/social/friend/respond', Object.assign(as(P2, TOK2), { from: P1, accept: true }));
  assert.equal((await C('/api/duel/create', Object.assign(as(P1, TOK1), { fighter: FIGHT, invite: P3 }))).status, 400, 'só convida amigos');
  const c = await C('/api/duel/create', Object.assign(as(P1, TOK1), { fighter: Object.assign({}, FIGHT, { hp: 1e9, atk: 1e9, crit: 100 }), invite: P2, public: false }));
  assert.equal(c.status, 200, c.error); assert.match(c.duel.code, /^[A-Z2-9]{6}$/);
  const F1 = c.duel.fighters[P1];
  assert.ok(F1.maxHp <= (150 * 30 + 800) * 2 && F1.stats.atk <= 25 * 30 + 200 && F1.stats.crit <= 40, 'atributos limitados ao nível registado');
  assert.deepEqual(F1.skills, ['g1', 'g3', 'g11'], 'só habilidades da classe até ao nível (g9 é do nível 100; m1 é de outra classe)');
  assert.deepEqual(Object.keys(F1.items).sort(), ['po_bomba', 'po_vida1'], 'só itens de combate que existem');
  assert.equal((await C('/api/duel/create', Object.assign(as(P1, TOK1), { fighter: FIGHT }))).status, 409, 'só uma sala de cada vez');
  let s2 = await C('/api/social/state', as(P2, TOK2));
  assert.equal(s2.invites.length, 1); assert.equal(s2.open.length, 0, 'sala privada não aparece na lista');
  assert.equal((await C('/api/duel/join', Object.assign(as(P1, TOK1), { code: c.duel.code, fighter: FIGHT }))).status, 400, 'o dono não entra na própria sala');
  const j = await C('/api/duel/join', Object.assign(as(P2, TOK2), { code: c.duel.code.toLowerCase(), fighter: Object.assign({}, FIGHT, { agi: 50 }) }));
  assert.equal(j.status, 200, j.error); assert.equal(j.duel.status, 'active'); assert.equal(j.duel.turn, P2, 'mais ágil começa');
  assert.equal((await C('/api/duel/join', Object.assign(as(P3, TOK3), { code: c.duel.code, fighter: FIGHT }))).status, 409, 'sala cheia');
  assert.equal((await C('/api/duel/act', Object.assign(as(P1, TOK1), { id: c.duel.id, action: 'attack' }))).status, 409, 'não é a vez dele');
  // jogada repetida (mesma versão) não conta duas vezes
  const v = j.duel.version;
  const a1 = await C('/api/duel/act', Object.assign(as(P2, TOK2), { id: c.duel.id, action: 'attack', version: v }));
  assert.equal(a1.duel.turn, P1);
  const a2 = await C('/api/duel/act', Object.assign(as(P2, TOK2), { id: c.duel.id, action: 'attack', version: v }));
  assert.ok(a2.stale); assert.equal(a2.duel.version, a1.duel.version);
  // combate com habilidades, recargas, mana e itens (limite de poções de cura)
  let d = a1.duel, turnOf = { [P1]: TOK1, [P2]: TOK2 }, used = { [P1]: 0, [P2]: 0 }, guard = 0, sawSkill = false, sawCd = false;
  while (d.status === 'active' && guard++ < 400) {
    const who = d.turn, tok = turnOf[who], F = d.fighters[who];
    let body = { action: 'attack' };
    if (F.hp < F.maxHp * 0.5 && used[who] < 3) body = { action: 'item', item: 'po_vida1' };
    else { const ready = F.skills.filter((id) => !(F.cds[id] > 0)); const busy = F.skills.filter((id) => F.cds[id] > 0); if (busy.length && !sawCd) { sawCd = true; const rb = await C('/api/duel/act', Object.assign(as(who, tok), { id: d.id, action: 'skill', skill: busy[0] })); assert.equal(rb.status, 400, 'em recarga'); } if (ready.length) body = { action: 'skill', skill: ready[ready.length - 1] }; }
    const r = await C('/api/duel/act', Object.assign(as(who, tok), { id: d.id, version: d.version }, body));
    assert.equal(r.status, 200, r.error);
    if (body.action === 'item') used[who]++;
    if (body.action === 'skill') sawSkill = true;
    d = r.duel;
    if (body.action === 'item') assert.equal(d.fighters[who].used.po_vida1, used[who]);
  }
  assert.ok(sawSkill && sawCd);
  assert.equal(d.status, 'done'); assert.ok(d.winner === P1 || d.winner === P2);
  assert.ok(d.log.some((l) => /venceu o duelo/.test(l.t)));
  const loser = d.winner === P1 ? P2 : P1;
  assert.equal((await C('/api/duel/act', Object.assign(as(d.winner, turnOf[d.winner]), { id: d.id, action: 'attack' }))).status, 409);
  const sw = await C('/api/social/state', as(d.winner, turnOf[d.winner])), sl = await C('/api/social/state', as(loser, turnOf[loser]));
  assert.equal(sw.me.wins, 1); assert.equal(sl.me.losses, 1); assert.ok(sw.me.rating > 1000 && sl.me.rating < 1000);
  assert.equal((await C('/api/duel/history', as(P1, TOK1))).duels.length, 1);
});

await test('duelo: limite de 3 poções, estados (atordoar, veneno, bónus), servos e item que não se tem', async () => {
  const S = await setup('production'); await trio(S);
  const C = (u, b) => S.call('POST', u, b);
  const F2 = Object.assign({}, FIGHT, { cls: 'assassino', skills: ['a3', 'a2', 'a10'], items: {}, squad: [{ name: 'Sombra de Igris', level: 30, king: true, role: 'comandante' }, { name: 'Guarda', level: 20, role: 'guarda' }, { name: 'x', level: 999, role: 'hack' }], agi: 99 });
  const c = await C('/api/duel/create', Object.assign(as(P1, TOK1), { fighter: FIGHT }));
  const j = await C('/api/duel/join', Object.assign(as(P2, TOK2), { code: c.duel.code, fighter: F2 }));
  let d = j.duel; const B = d.fighters[P2];
  assert.equal(d.turn, P2); assert.equal(B.squad.length, 3); assert.equal(B.cmd, 5); assert.ok(B.shield > 0, 'o servo guarda dá escudo inicial');
  assert.ok(B.squad.every((x) => x.power > 0 && x.power < 1000));
  assert.equal((await C('/api/duel/act', Object.assign(as(P2, TOK2), { id: d.id, action: 'item', item: 'po_vida1' }))).status, 400, 'não tem esse item');
  let r = await C('/api/duel/act', Object.assign(as(P2, TOK2), { id: d.id, action: 'skill', skill: 'a3' }));
  assert.equal(r.status, 200, r.error); d = r.duel;
  assert.ok(d.fighters[P1].st.some((x) => x.kind === 'dot' && x.type === 'poison') || d.status === 'done', 'veneno aplicado');
  assert.ok(d.log.some((l) => /Sombra de Igris ataca/.test(l.t)), 'os servos atacam');
  // P1: 3 poções de cura no máximo
  let n = 0;
  while (d.status === 'active' && n < 3) {
    if (d.turn === P1) { r = await C('/api/duel/act', Object.assign(as(P1, TOK1), { id: d.id, action: 'item', item: 'po_vida1' })); assert.equal(r.status, 200, r.error); n++; }
    else r = await C('/api/duel/act', Object.assign(as(P2, TOK2), { id: d.id, action: 'defend' }));
    d = r.duel;
  }
  while (d.status === 'active' && d.turn !== P1) d = (await C('/api/duel/act', Object.assign(as(P2, TOK2), { id: d.id, action: 'defend' }))).duel;
  if (d.status === 'active') { const x = await C('/api/duel/act', Object.assign(as(P1, TOK1), { id: d.id, action: 'item', item: 'po_vida1' })); assert.equal(x.status, 400); assert.match(x.error, /3 poções/); }
  assert.ok(d.log.some((l) => /defende-se/.test(l.t)));
});

await test('duelo: salas públicas, tempo esgotado (2 vezes = derrota), desistir e salas esquecidas', async () => {
  const S = await setup('production'); await trio(S);
  const C = (u, b) => S.call('POST', u, b);
  const c = await C('/api/duel/create', Object.assign(as(P1, TOK1), { fighter: FIGHT }));
  assert.equal((await C('/api/social/state', as(P3, TOK3))).open.length, 1, 'sala pública visível');
  const j = await C('/api/duel/join', Object.assign(as(P3, TOK3), { id: c.duel.id, fighter: FIGHT }));
  const first = j.duel.turn, tokOf = { [P1]: TOK1, [P3]: TOK3 }, other = first === P1 ? P3 : P1;
  tick(46 * 1000);
  let g = await C('/api/duel/state', Object.assign(as(other, tokOf[other]), { id: c.duel.id }));
  assert.equal(g.duel.turn, other, 'tempo esgotado: passa a vez');
  await C('/api/duel/act', Object.assign(as(other, tokOf[other]), { id: c.duel.id, action: 'defend' }));
  tick(46 * 1000);
  g = await C('/api/duel/state', Object.assign(as(other, tokOf[other]), { id: c.duel.id }));
  assert.equal(g.duel.status, 'done'); assert.equal(g.duel.winner, other); assert.equal(g.duel.reason, 'timeout');
  // desistir
  const c2 = await C('/api/duel/create', Object.assign(as(P1, TOK1), { fighter: FIGHT }));
  await C('/api/duel/join', Object.assign(as(P2, TOK2), { code: c2.duel.code, fighter: FIGHT }));
  const l = await C('/api/duel/leave', Object.assign(as(P1, TOK1), { id: c2.duel.id }));
  assert.equal(l.duel.winner, P2); assert.equal(l.duel.reason, 'forfeit');
  // convidar um amigo para uma sala já aberta
  await C('/api/social/friend/request', Object.assign(as(P1, TOK1), { to: P2 }));
  await C('/api/social/friend/respond', Object.assign(as(P2, TOK2), { from: P1, accept: true }));
  const c5 = await C('/api/duel/create', Object.assign(as(P1, TOK1), { fighter: FIGHT }));
  assert.equal((await C('/api/duel/invite', Object.assign(as(P1, TOK1), { id: c5.duel.id, to: P3 }))).status, 400, 'P3 não é amigo');
  assert.equal((await C('/api/duel/invite', Object.assign(as(P2, TOK2), { id: c5.duel.id, to: P1 }))).status, 404, 'só o dono convida');
  assert.equal((await C('/api/duel/invite', Object.assign(as(P1, TOK1), { id: c5.duel.id, to: P2 }))).duel.invited, P2);
  assert.equal((await C('/api/social/state', as(P2, TOK2))).invites.length, 1);
  await C('/api/duel/leave', Object.assign(as(P1, TOK1), { id: c5.duel.id }));
  // sala sem adversário fecha ao fim de 30 min; fechar a própria sala
  const c3 = await C('/api/duel/create', Object.assign(as(P1, TOK1), { fighter: FIGHT }));
  tick(31 * 60 * 1000);
  assert.equal((await C('/api/duel/join', Object.assign(as(P2, TOK2), { code: c3.duel.code, fighter: FIGHT }))).status, 404);
  const c4 = await C('/api/duel/create', Object.assign(as(P1, TOK1), { fighter: FIGHT }));
  assert.equal((await C('/api/duel/leave', Object.assign(as(P1, TOK1), { id: c4.duel.id }))).duel.status, 'cancelled');
  // jogador suspenso não entra no social
  const A = S.admin(await S.login());
  await A.post('/api/admin/players/' + P3 + '/ban', { reason: 'Teste', days: 1 });
  assert.equal((await C('/api/social/state', as(P3, TOK3))).status, 403);
});

console.log('\n' + passed + ' testes do servidor passaram' + (process.exitCode ? ' (com falhas)' : ''));
