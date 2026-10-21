/* ==========================================================
   SISTEMA · API da Loja de Cristais (Cloudflare Worker + D1)

   O servidor é a autoridade:
   - os preços e pacotes vivem aqui;
   - só o administrador confirma pagamentos (depois de ver o dinheiro na conta);
   - só pedidos pagos recebem código; cada pedido tem no máximo um código vivo;
   - os códigos são aleatórios (criptográficos), guardados só como hash e usáveis uma vez;
   - todas as ações administrativas ficam na auditoria;
   - repetir uma ação (falha de rede) nunca duplica confirmações, códigos ou cristais.

   Segredos (wrangler secret put …):
     ADMIN_USER        nome do administrador
     ADMIN_PASS_HASH   hash da palavra-passe (gerado com: node tools/hash-password.mjs)
     CODE_PEPPER       texto aleatório longo; entra no hash dos códigos e tokens
   Variáveis (wrangler.toml):
     MODE              "production" ou "staging" (staging marca tudo como teste)
   ========================================================== */

import { DUEL_SKILLS, DUEL_ITEMS, CLASS_MAIN, HEAL_LIMIT, DOT_NAMES, BUFF_NAMES } from './duel-data.js';

const VERSION = '1.4.0';
const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const SESSION_TTL = 12 * HOUR;       // duração máxima de uma sessão
const SESSION_IDLE = 2 * HOUR;       // sem uso durante 2 horas, a sessão expira
const IDEM_TTL = 15 * MIN;           // durante 15 min, repetir "emitir código" mostra o mesmo código
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sem 0/O, 1/I/L
const STATUS = ['pending_payment', 'payment_confirmed', 'code_issued', 'redeemed', 'cancelled', 'refunded'];

/* ---------------- utilitários ---------------- */
const enc = new TextEncoder();
function now() { return Date.now(); }
function b64(buf) { let s = ''; new Uint8Array(buf).forEach((c) => { s += String.fromCharCode(c); }); return btoa(s); }
function unb64(s) { return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); }
function hex(buf) { return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join(''); }
async function sha256(text) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(text))); }
function randomBytes(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; }
function randomToken() { return b64(randomBytes(32)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function randomId(prefix) { return prefix + hex(randomBytes(9)); }
/* comparação em tempo constante */
function same(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
/* código: SIS-XXXX-XXXX-XXXX (12 caracteres aleatórios sem enviesamento) */
function newCode() {
  const out = [];
  while (out.length < 12) {
    const b = randomBytes(16);
    for (let i = 0; i < b.length && out.length < 12; i++) if (b[i] < 248) out.push(CODE_ALPHABET[b[i] % 31]); // 248 = 31*8
  }
  const s = out.join('');
  return 'SIS-' + s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8, 12);
}
/* normaliza o que o jogador escreve: maiúsculas, sem espaços/hífens, troca O→0? não: o alfabeto não tem 0/O ambíguos */
function normCode(c) {
  let s = String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (s.startsWith('SIS')) s = s.slice(3);
  s = s.replace(/O/g, '0').replace(/[IL]/g, '1'); // estes nunca existem nos códigos: assim um erro de leitura falha logo
  return s;
}
async function codeHash(env, code) { return sha256('code|' + (env.CODE_PEPPER || '') + '|' + normCode(code)); }
async function tokenHash(env, t) { return sha256('tok|' + (env.CODE_PEPPER || '') + '|' + t); }
function clean(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }

/* palavra-passe: pbkdf2$iterações$sal$hash (base64) */
export async function hashPassword(password, iterations = 20000, saltB64) {
  const salt = saltB64 ? unb64(saltB64) : randomBytes(16);
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return 'pbkdf2$' + iterations + '$' + b64(salt) + '$' + b64(bits);
}
async function checkPassword(password, stored) {
  const p = String(stored || '').split('$');
  if (p.length !== 4 || p[0] !== 'pbkdf2') return false;
  const h = await hashPassword(password, +p[1], p[2]);
  return same(h, stored);
}

/* ---------------- respostas ---------------- */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key',
  'Access-Control-Max-Age': '86400'
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...CORS } });
}
function fail(status, msg, extra) { return json(Object.assign({ ok: false, error: msg }, extra || {}), status); }
class HttpError extends Error { constructor(status, msg, extra) { super(msg); this.status = status; this.extra = extra; } }
function bad(msg) { return new HttpError(400, msg); }

/* ---------------- base de dados ---------------- */
function q(env, sql, ...args) { return env.DB.prepare(sql).bind(...args); }
async function one(env, sql, ...args) { return (await q(env, sql, ...args).first()) || null; }
async function all(env, sql, ...args) { return (await q(env, sql, ...args).all()).results || []; }
async function run(env, sql, ...args) { return q(env, sql, ...args).run(); }
function changes(r) { return (r && r.meta && r.meta.changes) || 0; }
async function setting(env, key) { const r = await one(env, 'SELECT value FROM settings WHERE key = ?', key); return r ? r.value : ''; }
function isTest(env) { return env.MODE !== 'production'; }

async function audit(env, actor, action, target, result, detail, ip) {
  await run(env, 'INSERT INTO audit (at, actor, action, target, result, detail, ip) VALUES (?, ?, ?, ?, ?, ?, ?)',
    now(), actor, action, target || null, result, detail ? JSON.stringify(detail).slice(0, 2000) : null, ip || null);
}
function auditStmt(env, actor, action, target, result, detail, ip) {
  return q(env, 'INSERT INTO audit (at, actor, action, target, result, detail, ip) VALUES (?, ?, ?, ?, ?, ?, ?)',
    now(), actor, action, target || null, result, detail ? JSON.stringify(detail).slice(0, 2000) : null, ip || null);
}

/* Limite de tentativas: devolve true se ainda pode tentar. */
async function limited(env, key, max, windowMs) {
  const t = now();
  const r = await one(env, 'SELECT n, reset_at FROM hits WHERE k = ?', key);
  if (!r || r.reset_at <= t) { await run(env, 'INSERT INTO hits (k, n, reset_at) VALUES (?, 1, ?) ON CONFLICT(k) DO UPDATE SET n = 1, reset_at = excluded.reset_at', key, t + windowMs); return false; }
  if (r.n >= max) return true;
  await run(env, 'UPDATE hits SET n = n + 1 WHERE k = ?', key);
  return false;
}
async function hitsLeft(env, key) { const r = await one(env, 'SELECT n, reset_at FROM hits WHERE k = ?', key); return r && r.reset_at > now() ? r : null; }
async function clearHits(env, key) { await run(env, 'DELETE FROM hits WHERE k = ?', key); }

/* limpeza ocasional de linhas expiradas */
async function housekeeping(env) {
  const t = now();
  await env.DB.batch([
    q(env, 'DELETE FROM idem WHERE expires_at < ?', t),
    q(env, 'DELETE FROM hits WHERE reset_at < ?', t),
    q(env, 'DELETE FROM sessions WHERE expires_at < ?', t - 30 * DAY),
    // pedidos sem pagamento há mais de 7 dias expiram sozinhos
    q(env, "INSERT INTO audit (at, actor, action, target, result, detail) SELECT ?, 'sistema', 'order.expire', id, 'ok', NULL FROM orders WHERE status = 'pending_payment' AND created_at < ?", t, t - 7 * DAY),
    q(env, "UPDATE orders SET status = 'cancelled', closed_at = ?, close_reason = 'Expirado (7 dias sem pagamento)' WHERE status = 'pending_payment' AND created_at < ?", t, t - 7 * DAY)
  ]);
}

/* ---------------- formatos públicos ---------------- */
function orderPublic(o) {
  return { id: o.id, status: o.status, package: o.package_name, crystals: o.crystals, coins: o.coins || 0, price_kz: o.price_kz, created_at: o.created_at, test: !!o.test };
}
function orderAdmin(o) {
  return { id: o.id, seq: o.seq, status: o.status, package_id: o.package_id, package: o.package_name, crystals: o.crystals, coins: o.coins || 0, price_kz: o.price_kz,
    player_id: o.player_id, player_name: o.player_name, payment_ref: o.payment_ref, payment_note: o.payment_note,
    created_at: o.created_at, confirmed_at: o.confirmed_at, confirmed_by: o.confirmed_by, code_issued_at: o.code_issued_at,
    redeemed_at: o.redeemed_at, closed_at: o.closed_at, close_reason: o.close_reason, delivery: o.delivery || null, test: !!o.test };
}
function codeAdmin(c) {
  return { id: c.id, order_id: c.order_id, hint: c.hint, crystals: c.crystals, coins: c.coins || 0, status: c.status, issued_at: c.issued_at, issued_by: c.issued_by,
    redeemed_at: c.redeemed_at, redeemed_player: c.redeemed_player, revoked_at: c.revoked_at, revoke_reason: c.revoke_reason };
}
function whatsappLink(number, text) {
  const n = String(number || '').replace(/\D/g, '');
  return n ? 'https://wa.me/' + n + '?text=' + encodeURIComponent(text) : '';
}

/* ==========================================================
   ROTAS PÚBLICAS (jogo)
   ========================================================== */
async function getConfig(env) {
  const pk = await all(env, 'SELECT id, name, crystals, bonus, price_kz, badge, kind FROM packages WHERE active = 1 AND price_kz IS NOT NULL ORDER BY sort, crystals');
  return json({ ok: true, version: VERSION, test: isTest(env), open: (await setting(env, 'shop_open')) === '1',
    currency: 'Kz', whatsapp: !!(await setting(env, 'whatsapp')), payment_info: await setting(env, 'payment_info'),
    packages: pk.map((p) => p.kind === 'coins'
      ? { id: p.id, kind: 'coins', name: p.name, crystals: 0, coins: p.crystals + p.bonus, base: p.crystals, bonus: p.bonus, price_kz: p.price_kz, badge: p.badge || null }
      : { id: p.id, kind: 'crystals', name: p.name, crystals: p.crystals + p.bonus, coins: 0, base: p.crystals, bonus: p.bonus, price_kz: p.price_kz, badge: p.badge || null }) });
}

async function createOrder(env, body, ip) {
  const playerId = clean(body.player_id, 64), name = clean(body.player_name, 24) || 'Jogador';
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(playerId)) throw bad('Identificador de jogador inválido.');
  if ((await setting(env, 'shop_open')) !== '1') throw new HttpError(403, 'A loja de Cristais está fechada de momento.');
  await assertNotBanned(env, playerId);
  if (await limited(env, 'order:ip:' + ip, 20, HOUR)) throw new HttpError(429, 'Demasiados pedidos. Tenta mais tarde.');
  const pending = await one(env, "SELECT COUNT(*) AS n FROM orders WHERE player_id = ? AND status = 'pending_payment'", playerId);
  if (pending.n >= 3) throw new HttpError(409, 'Já tens 3 pedidos à espera de pagamento. Conclui ou cancela um primeiro.');
  const p = await one(env, 'SELECT * FROM packages WHERE id = ? AND active = 1 AND price_kz IS NOT NULL', clean(body.package_id, 32));
  if (!p) throw bad('Pacote indisponível.');
  const isCoins = p.kind === 'coins', total = p.crystals + p.bonus, oCr = isCoins ? 0 : total, oCo = isCoins ? total : 0;
  const c = await one(env, "UPDATE counters SET value = value + 1 WHERE name = 'order' RETURNING value");
  const seq = c.value, id = 'SIS-' + String(seq).padStart(6, '0');
  const token = randomToken(), t = now();
  await env.DB.batch([
    q(env, 'INSERT INTO orders (id, seq, package_id, package_name, crystals, coins, price_kz, player_id, player_name, client_token_hash, status, created_at, test) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      id, seq, p.id, p.name, oCr, oCo, p.price_kz, playerId, name, await tokenHash(env, token), 'pending_payment', t, isTest(env) ? 1 : 0),
    auditStmt(env, 'player:' + playerId, 'order.create', id, 'ok', { package: p.id, price_kz: p.price_kz, name }, ip)
  ]);
  const msg = 'Olá! Quero comprar ' + total.toLocaleString('pt-PT') + (isCoins ? ' moedas' : ' Cristais') + ' no jogo Sistema.\nPedido: ' + id + '\nJogador: ' + name + '\nValor: ' + p.price_kz.toLocaleString('pt-PT') + ' Kz';
  return json({ ok: true, order: { id, status: 'pending_payment', package: p.name, crystals: oCr, coins: oCo, price_kz: p.price_kz, created_at: t, test: isTest(env) },
    token, whatsapp_url: whatsappLink(await setting(env, 'whatsapp'), msg), message: msg, payment_info: await setting(env, 'payment_info') });
}

async function orderStatus(env, id, token) {
  const o = await one(env, 'SELECT * FROM orders WHERE id = ?', clean(id, 20));
  if (!o || !token || !same(await tokenHash(env, token), o.client_token_hash)) throw new HttpError(404, 'Pedido não encontrado.');
  return json({ ok: true, order: orderPublic(o) });
}

async function playerCancel(env, id, token, ip) {
  const o = await one(env, 'SELECT * FROM orders WHERE id = ?', clean(id, 20));
  if (!o || !token || !same(await tokenHash(env, token), o.client_token_hash)) throw new HttpError(404, 'Pedido não encontrado.');
  if (o.status !== 'pending_payment') throw new HttpError(409, 'Este pedido já não pode ser cancelado no jogo. Fala com o atendimento.');
  const r = await env.DB.batch([
    q(env, "UPDATE orders SET status = 'cancelled', closed_at = ?, close_reason = ? WHERE id = ? AND status = 'pending_payment'", now(), 'Cancelado pelo jogador', o.id),
    auditStmt(env, 'player:' + o.player_id, 'order.cancel', o.id, 'ok', null, ip)
  ]);
  if (!changes(r[0])) throw new HttpError(409, 'Este pedido já mudou de estado.');
  return json({ ok: true, order: orderPublic(Object.assign(o, { status: 'cancelled' })) });
}

/* Resgate: valida, marca como usado e devolve os cristais NUMA ÚNICA operação.
   Repetir com o mesmo jogador (ex.: a rede caiu) devolve o mesmo resgate (o jogo não credita duas vezes). */
async function redeem(env, body, ip) {
  const playerId = clean(body.player_id, 64);
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(playerId)) throw bad('Identificador de jogador inválido.');
  const code = normCode(body.code);
  const blockedP = await hitsLeft(env, 'redeem:p:' + playerId), blockedI = await hitsLeft(env, 'redeem:ip:' + ip);
  if ((blockedP && blockedP.n >= 8) || (blockedI && blockedI.n >= 20)) throw new HttpError(429, 'Demasiadas tentativas. Espera 15 minutos.');
  await assertNotBanned(env, playerId);
  const invalid = async () => {
    await limited(env, 'redeem:p:' + playerId, 8, 15 * MIN);
    await limited(env, 'redeem:ip:' + ip, 20, 15 * MIN);
    await audit(env, 'player:' + playerId, 'code.redeem', null, 'invalid', null, ip);
    // a mesma resposta para código inexistente, revogado ou usado por outra pessoa: não revela nada
    return new HttpError(400, 'Código inválido ou já utilizado.');
  };
  if (code.length !== 12) throw await invalid();
  const h = await codeHash(env, code);
  let c = await one(env, 'SELECT * FROM codes WHERE code_hash = ?', h);
  if (!c) { const g = await redeemGrant(env, h, playerId, ip); if (g) { await clearHits(env, 'redeem:p:' + playerId); return json(g); } }
  if (!c || c.status === 'revoked') throw await invalid();
  if (c.status === 'active') {
    const rid = randomId('r_'), t = now();
    const r = await env.DB.batch([
      q(env, "UPDATE codes SET status = 'redeemed', redeemed_at = ?, redeemed_player = ?, redemption_id = ? WHERE id = ? AND status = 'active'", t, playerId, rid, c.id),
      q(env, "UPDATE orders SET status = 'redeemed', redeemed_at = ? WHERE id = ? AND status = 'code_issued' AND EXISTS (SELECT 1 FROM codes WHERE id = ? AND redemption_id = ?)", t, c.order_id, c.id, rid),
      q(env, "INSERT INTO audit (at, actor, action, target, result, detail, ip) SELECT ?, ?, 'code.redeem', ?, 'ok', ?, ? WHERE EXISTS (SELECT 1 FROM codes WHERE id = ? AND redemption_id = ?)",
        t, 'player:' + playerId, c.order_id, JSON.stringify({ crystals: c.crystals, coins: c.coins || 0, hint: c.hint }), ip, c.id, rid)
    ]);
    if (changes(r[0]) === 1) {
      await clearHits(env, 'redeem:p:' + playerId);
      return json({ ok: true, crystals: c.crystals, coins: c.coins || 0, redemption_id: rid, order_id: c.order_id, repeated: false });
    }
    c = await one(env, 'SELECT * FROM codes WHERE id = ?', c.id); // outra tentativa ganhou a corrida
  }
  if (c.status === 'redeemed' && c.redeemed_player === playerId) {
    return json({ ok: true, crystals: c.crystals, coins: c.coins || 0, redemption_id: c.redemption_id, order_id: c.order_id, repeated: true });
  }
  throw await invalid();
}

/* ==========================================================
   ADMINISTRAÇÃO
   ========================================================== */
async function login(env, body, ip, ua) {
  if (!env.ADMIN_USER || !env.ADMIN_PASS_HASH) throw new HttpError(503, 'O administrador ainda não foi configurado no servidor.');
  const lk = 'login:ip:' + ip;
  const h = await hitsLeft(env, lk);
  if (h && h.n >= 5) { await audit(env, 'anon', 'auth.login', null, 'blocked', null, ip); throw new HttpError(429, 'Demasiadas tentativas. Espera 15 minutos.'); }
  const user = clean(body.user, 64), pass = String(body.password || '');
  const okUser = same(user.toLowerCase(), String(env.ADMIN_USER).toLowerCase());
  const okPass = await checkPassword(pass, env.ADMIN_PASS_HASH); // calcula sempre (não revela qual falhou)
  if (!okUser || !okPass) {
    await limited(env, lk, 5, 15 * MIN);
    await audit(env, 'anon', 'auth.login', null, 'denied', { user }, ip);
    throw new HttpError(401, 'Credenciais inválidas.');
  }
  await clearHits(env, lk);
  const token = randomToken(), t = now();
  await env.DB.batch([
    q(env, 'INSERT INTO sessions (token_hash, admin, created_at, expires_at, last_seen, device) VALUES (?, ?, ?, ?, ?, ?)', await tokenHash(env, token), env.ADMIN_USER, t, t + SESSION_TTL, t, clean(ua, 120)),
    auditStmt(env, env.ADMIN_USER, 'auth.login', null, 'ok', null, ip)
  ]);
  return json({ ok: true, token, admin: env.ADMIN_USER, expires_at: t + SESSION_TTL, test: isTest(env) });
}

async function requireAdmin(env, request) {
  const m = (request.headers.get('Authorization') || '').match(/^Bearer\s+([A-Za-z0-9_-]{20,})$/);
  if (!m) throw new HttpError(401, 'Sessão necessária.');
  const th = await tokenHash(env, m[1]);
  const s = await one(env, 'SELECT * FROM sessions WHERE token_hash = ?', th);
  const t = now();
  if (!s || s.revoked || s.expires_at <= t || t - s.last_seen > SESSION_IDLE) throw new HttpError(401, 'Sessão expirada. Entra outra vez.');
  if (t - s.last_seen > MIN) await run(env, 'UPDATE sessions SET last_seen = ? WHERE token_hash = ?', t, th);
  return { admin: s.admin, th, session: s };
}

async function logout(env, A, ip) {
  await env.DB.batch([q(env, 'UPDATE sessions SET revoked = 1 WHERE token_hash = ?', A.th), auditStmt(env, A.admin, 'auth.logout', null, 'ok', null, ip)]);
  return json({ ok: true });
}
async function listSessions(env, A) {
  const rows = await all(env, 'SELECT token_hash, created_at, expires_at, last_seen, device FROM sessions WHERE revoked = 0 AND expires_at > ? ORDER BY last_seen DESC LIMIT 20', now());
  return json({ ok: true, sessions: rows.map((r) => ({ current: r.token_hash === A.th, created_at: r.created_at, expires_at: r.expires_at, last_seen: r.last_seen, device: r.device })) });
}
async function revokeOthers(env, A, ip) {
  const r = await run(env, 'UPDATE sessions SET revoked = 1 WHERE token_hash != ? AND revoked = 0', A.th);
  await audit(env, A.admin, 'auth.revoke_others', null, 'ok', { count: changes(r) }, ip);
  return json({ ok: true, revoked: changes(r) });
}

const TZ = HOUR; // Angola: UTC+1 (sem horário de verão)
function periodStart(p) {
  if (p === '7d') return now() - 7 * DAY;
  if (p === 'month') return now() - 30 * DAY;
  if (p === 'all') return 0;
  return Math.floor((now() + TZ) / DAY) * DAY - TZ; // meia-noite de hoje em Angola
}
const PAID = "('payment_confirmed','code_issued','redeemed')";
/* em produção, os pedidos feitos durante os testes não entram nas contas nem nas listas */
function real(env) { return isTest(env) ? '' : ' AND test = 0'; }

async function dashboard(env, url) {
  const from = periodStart(url.searchParams.get('period') || 'today');
  const [pend, sales, codes, cancelled, oldest, recent, byPkg] = await Promise.all([
    one(env, "SELECT COUNT(*) AS n FROM orders WHERE status = 'pending_payment'" + real(env)),
    one(env, 'SELECT COUNT(*) AS n, COALESCE(SUM(price_kz), 0) AS kz, COALESCE(SUM(crystals), 0) AS cr FROM orders WHERE status IN ' + PAID + ' AND confirmed_at >= ?' + real(env), from),
    one(env, "SELECT COUNT(*) AS n FROM orders WHERE status = 'code_issued'" + real(env)),
    one(env, "SELECT COUNT(*) AS n FROM orders WHERE status IN ('cancelled','refunded') AND closed_at >= ?" + real(env), from),
    all(env, "SELECT * FROM orders WHERE status IN ('pending_payment','payment_confirmed')" + real(env) + ' ORDER BY created_at ASC LIMIT 10'),
    all(env, 'SELECT at, actor, action, target, result FROM audit ORDER BY id DESC LIMIT 12'),
    all(env, 'SELECT package_name AS name, COUNT(*) AS n, SUM(price_kz) AS kz FROM orders WHERE status IN ' + PAID + ' AND confirmed_at >= ?' + real(env) + ' GROUP BY package_name ORDER BY kz DESC', from)
  ]);
  const pls = await one(env, "SELECT COUNT(*) AS n, SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) AS banned, SUM(CASE WHEN last_seen > ? THEN 1 ELSE 0 END) AS week, SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS fresh FROM players" + (isTest(env) ? '' : ' WHERE test = 0'), now() - 7 * DAY, from);
  return json({ ok: true, test: isTest(env), period: url.searchParams.get('period') || 'today',
    players: { total: pls.n || 0, banned: pls.banned || 0, active_7d: pls.week || 0, new: pls.fresh || 0 },
    pending: pend.n, awaiting_code: oldest.filter((o) => o.status === 'payment_confirmed').length, confirmed_sales: sales.n, revenue_kz: sales.kz, crystals_sold: sales.cr,
    codes_unredeemed: codes.n, cancelled: cancelled.n, queue: oldest.map(orderAdmin), activity: recent, by_package: byPkg });
}

async function listOrders(env, url) {
  const st = url.searchParams.get('status'), qq = clean(url.searchParams.get('q'), 40), limit = Math.min(100, +url.searchParams.get('limit') || 50);
  const before = +url.searchParams.get('before') || 0;
  const where = [], args = [];
  if (st && st !== 'all') { if (st === 'closed') where.push("status IN ('cancelled','refunded')"); else if (STATUS.includes(st)) { where.push('status = ?'); args.push(st); } }
  if (qq) { where.push('(id LIKE ? OR player_name LIKE ? OR payment_ref LIKE ?)'); args.push('%' + qq + '%', '%' + qq + '%', '%' + qq + '%'); }
  if (before) { where.push('seq < ?'); args.push(before); }
  if (!isTest(env) && url.searchParams.get('test') !== '1') where.push('test = 0');
  const rows = await all(env, 'SELECT * FROM orders' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY seq DESC LIMIT ?', ...args, limit);
  return json({ ok: true, orders: rows.map(orderAdmin) });
}

async function orderDetail(env, id) {
  const o = await one(env, 'SELECT * FROM orders WHERE id = ?', clean(id, 20));
  if (!o) throw new HttpError(404, 'Pedido não encontrado.');
  const codes = await all(env, 'SELECT * FROM codes WHERE order_id = ? ORDER BY issued_at', o.id);
  const log = await all(env, 'SELECT at, actor, action, result, detail FROM audit WHERE target = ? ORDER BY id', o.id);
  const prev = await one(env, "SELECT COUNT(*) AS n FROM orders WHERE player_id = ? AND status IN " + PAID, o.player_id);
  const pl = await playerRow(env, o.player_id);
  const gr = await all(env, 'SELECT * FROM grants WHERE order_id = ? ORDER BY created_at', o.id);
  return json({ ok: true, order: orderAdmin(o), codes: codes.map(codeAdmin), grants: gr.map(grantAdmin), audit: log, player_paid_orders: prev.n,
    player: pl ? { id: pl.id, name: pl.name, level: pl.level, status: pl.status, last_seen: pl.last_seen } : null });
}

async function confirmPayment(env, A, id, body, ip) {
  const ref = clean(body.payment_ref, 80), note = clean(body.note, 300);
  if (body.verified !== true) throw bad('Confirma que viste o dinheiro na conta (não basta uma captura de ecrã).');
  if (ref.length < 3) throw bad('Indica a referência do pagamento (MULTICAIXA Express).');
  const o = await one(env, 'SELECT * FROM orders WHERE id = ?', clean(id, 20));
  if (!o) throw new HttpError(404, 'Pedido não encontrado.');
  if (o.status !== 'pending_payment') {
    // repetição (ex.: a rede caiu): não cria uma segunda venda, devolve o estado atual
    if (['payment_confirmed', 'code_issued', 'redeemed'].includes(o.status)) return json({ ok: true, repeated: true, order: orderAdmin(o) });
    throw new HttpError(409, 'Este pedido está ' + o.status + ' e não pode ser confirmado.');
  }
  const dup = await one(env, "SELECT id FROM orders WHERE payment_ref = ? AND id != ? AND status IN " + PAID, ref, o.id);
  if (dup && body.allow_same_ref !== true) throw new HttpError(409, 'Esta referência já foi usada no pedido ' + dup.id + '. Verifica se não é o mesmo pagamento.', { duplicate_of: dup.id });
  const t = now();
  const r = await env.DB.batch([
    q(env, "UPDATE orders SET status = 'payment_confirmed', payment_ref = ?, payment_note = ?, confirmed_at = ?, confirmed_by = ? WHERE id = ? AND status = 'pending_payment'", ref, note || null, t, A.admin, o.id),
    q(env, "INSERT INTO audit (at, actor, action, target, result, detail, ip) SELECT ?, ?, 'order.confirm_payment', ?, 'ok', ?, ? WHERE EXISTS (SELECT 1 FROM orders WHERE id = ? AND confirmed_at = ? AND confirmed_by = ?)",
      t, A.admin, o.id, JSON.stringify({ ref, price_kz: o.price_kz }), ip, o.id, t, A.admin)
  ]);
  const cur = await one(env, 'SELECT * FROM orders WHERE id = ?', o.id);
  return json({ ok: true, repeated: changes(r[0]) !== 1, order: orderAdmin(cur) });
}

/* Idempotência: a mesma chave devolve a mesma resposta durante 15 min */
async function idemGet(env, key, actor, action, target) {
  if (!key) return null;
  const r = await one(env, 'SELECT * FROM idem WHERE key = ? AND expires_at > ?', key, now());
  if (!r) return null;
  if (r.actor !== actor || r.action !== action || r.target !== target) throw new HttpError(409, 'Chave de idempotência reutilizada noutra ação.');
  return JSON.parse(r.response);
}
function idemKey(request) {
  const k = request.headers.get('Idempotency-Key') || '';
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(k)) throw bad('Falta a chave de idempotência (Idempotency-Key).');
  return k;
}

async function issueCode(env, A, id, request, body, ip, reissue) {
  const key = idemKey(request), oid = clean(id, 20), action = reissue ? 'code.reissue' : 'code.issue';
  const prev = await idemGet(env, key, A.admin, action, oid);
  if (prev) return json(Object.assign(prev, { repeated: true }));
  const o = await one(env, 'SELECT * FROM orders WHERE id = ?', oid);
  if (!o) throw new HttpError(404, 'Pedido não encontrado.');
  const live = await one(env, "SELECT * FROM codes WHERE order_id = ? AND status != 'revoked'", o.id);
  const reason = clean(body.reason, 200);
  if (reissue) {
    if (o.status !== 'code_issued' || !live || live.status !== 'active') throw new HttpError(409, o.delivery === 'auto' ? 'Este pedido foi entregue automaticamente: não tem código.' : 'Só se pode substituir um código emitido e ainda não usado.');
    if (reason.length < 5) throw bad('Explica o motivo da substituição (fica na auditoria).');
  } else {
    if (o.status === 'pending_payment') throw new HttpError(409, 'O pagamento ainda não foi confirmado. Não é possível emitir código.');
    if (o.status !== 'payment_confirmed' || live) throw new HttpError(409, 'Este pedido já tem código emitido. Para o substituir, usa "Substituir código" (com motivo).');
  }
  const code = newCode(), t = now(), cid = randomId('c_');
  const norm = normCode(code);
  const stmts = [];
  if (reissue) stmts.push(q(env, "UPDATE codes SET status = 'revoked', revoked_at = ?, revoke_reason = ? WHERE id = ? AND status = 'active'", t, reason, live.id));
  stmts.push(
    q(env, 'INSERT INTO codes (id, order_id, code_hash, hint, crystals, coins, status, issued_at, issued_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', cid, o.id, await codeHash(env, code), norm.slice(-4), o.crystals, o.coins || 0, 'active', t, A.admin),
    q(env, "UPDATE orders SET status = 'code_issued', delivery = 'code', code_issued_at = ? WHERE id = ? AND status = ?", t, o.id, reissue ? 'code_issued' : 'payment_confirmed'),
    auditStmt(env, A.admin, action, o.id, 'ok', { hint: norm.slice(-4), crystals: o.crystals, coins: o.coins || 0, reason: reason || undefined }, ip)
  );
  try {
    await env.DB.batch(stmts); // tudo ou nada; o índice único impede dois códigos vivos
  } catch (e) {
    throw new HttpError(409, 'Este pedido já tem um código vivo. Atualiza o pedido.');
  }
  const message = 'Pagamento confirmado. Obrigado!\nPedido: ' + o.id + '\nO teu código: ' + code + '\nNo jogo: toca nos teus Cristais no topo → Obter Cristais → Resgatar código.\nO código só pode ser usado uma vez. Não o partilhes.';
  const res = { ok: true, code, hint: norm.slice(-4), crystals: o.crystals, coins: o.coins || 0, order_id: o.id, message,
    whatsapp_url: 'https://wa.me/?text=' + encodeURIComponent(message), note: 'O código só é mostrado agora. Copia-o e envia-o ao jogador.' };
  await run(env, 'INSERT INTO idem (key, actor, action, target, response, expires_at) VALUES (?, ?, ?, ?, ?, ?)', key, A.admin, action, o.id, JSON.stringify(res), t + IDEM_TTL);
  return json(res);
}

async function closeOrder(env, A, id, body, ip) {
  const reason = clean(body.reason, 200), refunded = body.refunded === true;
  if (reason.length < 3) throw bad('Indica o motivo.');
  const o = await one(env, 'SELECT * FROM orders WHERE id = ?', clean(id, 20));
  if (!o) throw new HttpError(404, 'Pedido não encontrado.');
  if (o.status === 'redeemed') throw new HttpError(409, 'Este código já foi usado. Os cristais já foram entregues; um reembolso tem de ser tratado fora do sistema e registado manualmente.');
  if (o.status === 'cancelled' || o.status === 'refunded') return json({ ok: true, repeated: true, order: orderAdmin(o) });
  const ns = refunded ? 'refunded' : 'cancelled', t = now();
  const r = await env.DB.batch([
    q(env, "UPDATE codes SET status = 'revoked', revoked_at = ?, revoke_reason = ? WHERE order_id = ? AND status = 'active'", t, 'Pedido ' + ns + ': ' + reason, o.id),
    q(env, "UPDATE grants SET status = 'revoked', revoked_at = ?, revoke_reason = ? WHERE order_id = ? AND status = 'pending'", t, 'Pedido ' + ns + ': ' + reason, o.id),
    q(env, 'UPDATE orders SET status = ?, closed_at = ?, close_reason = ? WHERE id = ? AND status = ?', ns, t, reason, o.id, o.status),
    q(env, "INSERT INTO audit (at, actor, action, target, result, detail, ip) SELECT ?, ?, ?, ?, 'ok', ?, ? WHERE EXISTS (SELECT 1 FROM orders WHERE id = ? AND status = ? AND closed_at = ?)",
      t, A.admin, 'order.' + (refunded ? 'refund' : 'cancel'), o.id, JSON.stringify({ reason, from: o.status }), ip, o.id, ns, t)
  ]);
  if (!changes(r[2])) throw new HttpError(409, 'O pedido mudou de estado entretanto. Atualiza e tenta outra vez.');
  // se o código tinha acabado de ser usado na mesma altura, o resgate ganha (o UPDATE do código não apanhou nada ativo)
  return json({ ok: true, order: orderAdmin(await one(env, 'SELECT * FROM orders WHERE id = ?', o.id)) });
}

async function listCodes(env, url) {
  const st = url.searchParams.get('status');
  const rows = st && ['active', 'redeemed', 'revoked'].includes(st)
    ? await all(env, 'SELECT * FROM codes WHERE status = ? ORDER BY issued_at DESC LIMIT 100', st)
    : await all(env, 'SELECT * FROM codes ORDER BY issued_at DESC LIMIT 100');
  return json({ ok: true, codes: rows.map(codeAdmin) });
}

async function stats(env, url) {
  const days = Math.min(365, Math.max(1, +url.searchParams.get('days') || 30));
  const from = now() - days * DAY;
  const R = real(env);
  const daily = await all(env, "SELECT strftime('%Y-%m-%d', (confirmed_at + 3600000) / 1000, 'unixepoch') AS day, COUNT(*) AS n, SUM(price_kz) AS kz, SUM(crystals) AS cr FROM orders WHERE status IN " + PAID + ' AND confirmed_at >= ?' + R + ' GROUP BY day ORDER BY day', from);
  const byPkg = await all(env, 'SELECT package_name AS name, COUNT(*) AS n, SUM(price_kz) AS kz FROM orders WHERE status IN ' + PAID + ' AND confirmed_at >= ?' + R + ' GROUP BY package_name ORDER BY kz DESC', from);
  const by = await all(env, 'SELECT status, COUNT(*) AS n FROM orders WHERE created_at >= ?' + R + ' GROUP BY status', from);
  const tot = await one(env, 'SELECT COUNT(*) AS n, COALESCE(SUM(price_kz),0) AS kz FROM orders WHERE status IN ' + PAID + ' AND confirmed_at >= ?' + R, from);
  const buyers = await one(env, 'SELECT COUNT(DISTINCT player_id) AS n FROM orders WHERE status IN ' + PAID + ' AND confirmed_at >= ?' + R, from);
  return json({ ok: true, days, daily, by_package: byPkg, by_status: by, total_sales: tot.n, total_kz: tot.kz, buyers: buyers.n, avg_kz: tot.n ? Math.round(tot.kz / tot.n) : 0 });
}

async function listAudit(env, url) {
  const before = +url.searchParams.get('before') || 0, limit = Math.min(200, +url.searchParams.get('limit') || 60);
  const rows = before ? await all(env, 'SELECT * FROM audit WHERE id < ? ORDER BY id DESC LIMIT ?', before, limit) : await all(env, 'SELECT * FROM audit ORDER BY id DESC LIMIT ?', limit);
  return json({ ok: true, audit: rows });
}

async function getPackages(env) {
  return json({ ok: true, packages: await all(env, 'SELECT * FROM packages ORDER BY sort, crystals') });
}
async function putPackage(env, A, id, body, ip) {
  const p = await one(env, 'SELECT * FROM packages WHERE id = ?', clean(id, 32));
  if (!p) throw new HttpError(404, 'Pacote não encontrado.');
  const name = body.name !== undefined ? clean(body.name, 40) : p.name;
  const crystals = body.crystals !== undefined ? Math.floor(+body.crystals) : p.crystals;
  const bonus = body.bonus !== undefined ? Math.floor(+body.bonus) : p.bonus;
  const price = body.price_kz === null || body.price_kz === '' ? null : (body.price_kz !== undefined ? Math.floor(+body.price_kz) : p.price_kz);
  const active = body.active !== undefined ? (body.active ? 1 : 0) : p.active;
  const badge = body.badge !== undefined ? (clean(body.badge, 24) || null) : p.badge;
  if (!name || !(crystals > 0) || crystals > 1000000 || !(bonus >= 0) || bonus > 1000000) throw bad('Valores inválidos.');
  if (price !== null && (!(price > 0) || price > 100000000)) throw bad('Preço inválido.');
  if (active && price === null) throw bad('Define o preço antes de ativar o pacote.');
  await env.DB.batch([
    q(env, 'UPDATE packages SET name = ?, crystals = ?, bonus = ?, price_kz = ?, active = ?, badge = ?, updated_at = ? WHERE id = ?', name, crystals, bonus, price, active, badge, now(), p.id),
    auditStmt(env, A.admin, 'package.update', p.id, 'ok', { from: { crystals: p.crystals, bonus: p.bonus, price_kz: p.price_kz, active: p.active, badge: p.badge }, to: { crystals, bonus, price_kz: price, active, badge } }, ip)
  ]);
  return getPackages(env);
}
async function getSettings(env) {
  const rows = await all(env, 'SELECT key, value FROM settings');
  const o = {}; rows.forEach((r) => { o[r.key] = r.value; });
  return json({ ok: true, settings: o, test: isTest(env), version: VERSION });
}
async function putSettings(env, A, body, ip) {
  const up = [];
  if (body.whatsapp !== undefined) { const w = String(body.whatsapp).replace(/\D/g, ''); if (w && (w.length < 9 || w.length > 15)) throw bad('Número de WhatsApp inválido (usa o indicativo, ex.: 244…).'); up.push(['whatsapp', w]); }
  if (body.payment_info !== undefined) up.push(['payment_info', clean(body.payment_info, 600)]);
  if (body.shop_open !== undefined) up.push(['shop_open', body.shop_open ? '1' : '0']);
  if (!up.length) throw bad('Nada para alterar.');
  await env.DB.batch(up.map((u) => q(env, 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', u[0], u[1]))
    .concat([auditStmt(env, A.admin, 'settings.update', null, 'ok', Object.fromEntries(up), ip)]));
  return getSettings(env);
}


/* ==========================================================
   JOGADORES: registo, sincronização, banimentos e presentes
   ========================================================== */
const PLAYER_RE = /^[A-Za-z0-9_-]{8,64}$/;
const STAT_KEYS = ['missions', 'failed', 'bosses', 'streak', 'best', 'trust', 'day', 'arenas', 'spentCrystals'];

/* banimento temporário já acabou? então levanta-o (e regista) */
async function liftExpired(env, p) {
  if (p && p.status === 'banned' && p.ban_until && p.ban_until <= now()) {
    await env.DB.batch([
      q(env, "UPDATE players SET status = 'active', ban_reason = NULL, ban_until = NULL WHERE id = ? AND status = 'banned'", p.id),
      auditStmt(env, 'sistema', 'player.unban', p.id, 'ok', { auto: true })
    ]);
    p.status = 'active'; p.ban_reason = null; p.ban_until = null;
  }
  return p;
}
async function deletedRow(env, id) { return one(env, 'SELECT * FROM deleted_players WHERE id = ?', id); }
async function playerRow(env, id) { return liftExpired(env, await one(env, 'SELECT * FROM players WHERE id = ?', id)); }
function banInfo(p) { return { reason: p.ban_reason || 'Violação das regras do Sistema.', until: p.ban_until || null, since: p.banned_at || null }; }
async function assertNotBanned(env, playerId) {
  const del = await deletedRow(env, playerId);
  if (del) throw new HttpError(410, 'Esta conta foi apagada pela administração.', { deleted: true, reason: del.reason || null });
  const p = await playerRow(env, playerId);
  if (p && p.status === 'banned') throw new HttpError(403, 'Esta conta está suspensa pelo Sistema.', { banned: true, ban: banInfo(p) });
  return p;
}
async function playerAuth(env, body) {
  const pid = clean(body.player_id, 64), tok = String(body.token || '');
  if (!PLAYER_RE.test(pid) || tok.length < 20 || tok.length > 200) throw bad('Identificação do jogador inválida.');
  const del = await deletedRow(env, pid);
  if (del) throw new HttpError(410, 'Esta conta foi apagada pela administração.', { deleted: true, reason: del.reason || null });
  const p = await playerRow(env, pid);
  if (!p) throw new HttpError(404, 'Jogador não registado.');
  if (!same(await tokenHash(env, tok), p.token_hash)) throw new HttpError(403, 'Esta conta está registada noutro aparelho.', { conflict: true });
  return p;
}
function int(v, min, max) { v = Math.floor(+v || 0); return Math.max(min, Math.min(max, v)); }

/* O jogo envia um resumo e recebe o estado da conta e os presentes por receber */
async function sync(env, body, ip) {
  const pid = clean(body.player_id, 64), tok = String(body.token || '');
  if (!PLAYER_RE.test(pid) || tok.length < 20 || tok.length > 200) throw bad('Identificação do jogador inválida.');
  if (await limited(env, 'sync:' + pid, 60, HOUR)) throw new HttpError(429, 'Demasiadas sincronizações. Tenta mais tarde.');
  const st = {}; const raw = body.stats && typeof body.stats === 'object' ? body.stats : {};
  STAT_KEYS.forEach((k) => { if (raw[k] !== undefined) st[k] = int(raw[k], 0, 1e9); });
  const snap = { name: clean(body.name, 24) || 'Jogador', cls: clean(body.cls, 16), level: int(body.level, 1, 100000), crystals: int(body.crystals, 0, 1e9),
    coins: int(body.coins, 0, 1e12), stats: JSON.stringify(st), app_version: clean(body.app_version, 16), platform: clean(body.platform, 16) };
  const t = now(), th = await tokenHash(env, tok);
  const del = await deletedRow(env, pid);
  if (del) return json({ ok: true, account: 'deleted', reason: del.reason || null, deleted_at: del.deleted_at, inbox: [], notices: [] });
  let p = await playerRow(env, pid);
  if (!p) {
    await env.DB.batch([
      q(env, 'INSERT INTO players (id, token_hash, name, cls, level, crystals, coins, stats, app_version, platform, created_at, last_seen, syncs, test) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
        pid, th, snap.name, snap.cls, snap.level, snap.crystals, snap.coins, snap.stats, snap.app_version, snap.platform, t, t, isTest(env) ? 1 : 0),
      auditStmt(env, 'player:' + pid, 'player.register', pid, 'ok', { name: snap.name, cls: snap.cls, level: snap.level }, ip)
    ]);
    p = await playerRow(env, pid);
  } else {
    if (!same(th, p.token_hash)) throw new HttpError(403, 'Esta conta está registada noutro aparelho.', { conflict: true });
    await run(env, 'UPDATE players SET name = ?, cls = ?, level = ?, crystals = ?, coins = ?, stats = ?, app_version = ?, platform = ?, last_seen = ?, syncs = syncs + 1 WHERE id = ?',
      snap.name, snap.cls, snap.level, snap.crystals, snap.coins, snap.stats, snap.app_version, snap.platform, t, pid);
  }
  const notices = await playerNotices(env, p);
  const role = await playerRole(env, p);
  if (p.status === 'banned') return json({ ok: true, account: 'banned', ban: banInfo(p), inbox: [], notices, role });
  const inbox = await all(env, "SELECT id, crystals, coins, reason, message, order_id FROM grants WHERE player_id = ? AND mode = 'auto' AND status = 'pending' ORDER BY created_at LIMIT 20", pid);
  return json({ ok: true, account: 'active', inbox, notices, role, server_time: t });
}

/* Receber um presente automático (uma única vez; repetir devolve o mesmo) */
async function claim(env, body, ip) {
  const p = await playerAuth(env, body);
  if (p.status === 'banned') throw new HttpError(403, 'Esta conta está suspensa pelo Sistema.', { banned: true, ban: banInfo(p) });
  const g = await one(env, "SELECT * FROM grants WHERE id = ? AND player_id = ? AND mode = 'auto'", clean(body.grant_id, 40), p.id);
  if (!g) throw new HttpError(404, 'Presente não encontrado.');
  if (g.status === 'revoked') throw new HttpError(410, 'Este presente foi anulado.');
  if (g.status === 'pending') {
    const t = now();
    const r = await env.DB.batch([
      q(env, "UPDATE grants SET status = 'claimed', claimed_at = ?, claimed_player = ? WHERE id = ? AND status = 'pending'", t, p.id, g.id),
      q(env, "UPDATE orders SET status = 'redeemed', redeemed_at = ? WHERE id = ? AND status = 'code_issued' AND EXISTS (SELECT 1 FROM grants WHERE id = ? AND claimed_at = ?)", t, g.order_id || '', g.id, t),
      q(env, "INSERT INTO audit (at, actor, action, target, result, detail, ip) SELECT ?, ?, 'grant.claim', ?, 'ok', ?, ? WHERE EXISTS (SELECT 1 FROM grants WHERE id = ? AND claimed_at = ?)",
        t, 'player:' + p.id, g.order_id || p.id, JSON.stringify({ grant: g.id, crystals: g.crystals, coins: g.coins }), ip, g.id, t)
    ]);
    if (changes(r[0]) !== 1) return claim(env, body, ip); // outra tentativa ganhou: devolve o resultado dela
  }
  return json({ ok: true, redemption_id: 'g_' + g.id, crystals: g.crystals, coins: g.coins, message: g.message, reason: g.reason, order_id: g.order_id, repeated: g.status === 'claimed' });
}

/* resgate de um código de oferta (tabela grants) */
async function redeemGrant(env, h, playerId, ip) {
  const g = await one(env, "SELECT * FROM grants WHERE code_hash = ? AND mode = 'code'", h);
  if (!g || g.status === 'revoked') return null;
  if (g.player_id && g.player_id !== playerId) return null;
  if (g.status === 'pending') {
    const t = now();
    const r = await env.DB.batch([
      q(env, "UPDATE grants SET status = 'claimed', claimed_at = ?, claimed_player = ? WHERE id = ? AND status = 'pending'", t, playerId, g.id),
      q(env, "INSERT INTO audit (at, actor, action, target, result, detail, ip) SELECT ?, ?, 'grant.redeem', ?, 'ok', ?, ? WHERE EXISTS (SELECT 1 FROM grants WHERE id = ? AND claimed_at = ? AND claimed_player = ?)",
        t, 'player:' + playerId, playerId, JSON.stringify({ grant: g.id, crystals: g.crystals, coins: g.coins, hint: g.hint }), ip, g.id, t, playerId)
    ]);
    if (changes(r[0]) === 1) return { ok: true, crystals: g.crystals, coins: g.coins, redemption_id: 'g_' + g.id, order_id: null, message: g.message, repeated: false };
    return redeemGrant(env, h, playerId, ip);
  }
  if (g.status === 'claimed' && g.claimed_player === playerId) return { ok: true, crystals: g.crystals, coins: g.coins, redemption_id: 'g_' + g.id, order_id: null, message: g.message, repeated: true };
  return null;
}

/* ---------------- tipos de utilizador ---------------- */
const ROLES = { usuario: 'Usuário', premium: 'Usuário Premium', doador: 'Doador', teste: 'Usuário de Teste', admin: 'Administrador', funcionario: 'Funcionário', parceria: 'Parceria' };
const ROLE_EFF = "COALESCE(players.role, CASE WHEN (SELECT COUNT(*) FROM orders o WHERE o.player_id = players.id AND o.status IN " + PAID + ") > 0 THEN 'premium' ELSE 'usuario' END)";
async function playerRole(env, p) {
  if (p.role && ROLES[p.role]) return { id: p.role, name: ROLES[p.role], auto: false };
  const n = await one(env, 'SELECT COUNT(*) AS n FROM orders WHERE player_id = ? AND status IN ' + PAID, p.id);
  const id = n && n.n > 0 ? 'premium' : 'usuario';
  return { id, name: ROLES[id], auto: true };
}
async function setRole(env, A, id, body, ip) {
  const p = await playerRow(env, clean(id, 64));
  if (!p) throw new HttpError(404, 'Jogador não encontrado.');
  const r = clean(body.role, 20);
  if (r !== 'auto' && !ROLES[r]) throw bad('Tipo de utilizador inválido.');
  const role = r === 'auto' ? null : r;
  await env.DB.batch([
    q(env, 'UPDATE players SET role = ?, role_by = ?, role_at = ? WHERE id = ?', role, A.admin, now(), p.id),
    auditStmt(env, A.admin, 'player.role', p.id, 'ok', { from: p.role || 'auto', to: role || 'auto' }, ip)
  ]);
  return playerDetail(env, p.id);
}

/* ---------------- avisos da administração ---------------- */
const NOTICE_KINDS = ['info', 'importante', 'evento', 'manutencao'];
function cleanText(s, max) {
  return String(s == null ? '' : s).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ')
    .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}
function noticeOut(n) { return { id: n.id, player_id: n.player_id, title: n.title, body: n.body, kind: n.kind, created_by: n.created_by, created_at: n.created_at, deleted_at: n.deleted_at || null }; }
async function playerNotices(env, p) {
  const from = Math.min(p.created_at, now()) - 30 * DAY;
  const rows = await all(env, 'SELECT id, title, body, kind, created_at, player_id FROM notices WHERE deleted_at IS NULL AND (player_id IS NULL OR player_id = ?) AND created_at >= ? ORDER BY created_at DESC LIMIT 30', p.id, from);
  return rows.map((n) => ({ id: n.id, title: n.title, body: n.body, kind: n.kind, at: n.created_at, personal: !!n.player_id }));
}
async function createNotice(env, A, request, body, ip) {
  const key = idemKey(request);
  const prev = await idemGet(env, key, A.admin, 'notice.create', 'notice');
  if (prev) return json(Object.assign(prev, { repeated: true }));
  const title = clean(body.title, 80), text = cleanText(body.body, 1500), kind = NOTICE_KINDS.includes(body.kind) ? body.kind : 'info';
  const pid = body.player_id ? clean(body.player_id, 64) : null;
  if (title.length < 3) throw bad('Escreve um título (pelo menos 3 letras).');
  if (text.length < 3) throw bad('Escreve a mensagem.');
  if (pid && !(await playerRow(env, pid))) throw new HttpError(404, 'Jogador não encontrado.');
  const id = randomId('n'), t = now();
  await env.DB.batch([
    q(env, 'INSERT INTO notices (id, player_id, title, body, kind, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', id, pid, title, text, kind, A.admin, t),
    auditStmt(env, A.admin, 'notice.create', pid || 'todos', 'ok', { notice: id, title, kind }, ip)
  ]);
  const res = { ok: true, notice: noticeOut(await one(env, 'SELECT * FROM notices WHERE id = ?', id)) };
  await run(env, 'INSERT INTO idem (key, actor, action, target, response, expires_at) VALUES (?, ?, ?, ?, ?, ?)', key, A.admin, 'notice.create', 'notice', JSON.stringify(res), t + IDEM_TTL);
  return json(res);
}
async function listNotices(env, url) {
  const where = [], args = [];
  if (url.searchParams.get('player')) { where.push('player_id = ?'); args.push(clean(url.searchParams.get('player'), 64)); }
  if (url.searchParams.get('deleted') !== '1') where.push('deleted_at IS NULL');
  const rows = await all(env, 'SELECT * FROM notices' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY created_at DESC LIMIT 100', ...args);
  return json({ ok: true, notices: rows.map(noticeOut) });
}
async function deleteNotice(env, A, id, ip) {
  const n = await one(env, 'SELECT * FROM notices WHERE id = ?', clean(id, 40));
  if (!n) throw new HttpError(404, 'Aviso não encontrado.');
  if (!n.deleted_at) await env.DB.batch([
    q(env, 'UPDATE notices SET deleted_at = ?, deleted_by = ? WHERE id = ? AND deleted_at IS NULL', now(), A.admin, n.id),
    auditStmt(env, A.admin, 'notice.delete', n.player_id || 'todos', 'ok', { notice: n.id, title: n.title }, ip)
  ]);
  return json({ ok: true, notice: noticeOut(await one(env, 'SELECT * FROM notices WHERE id = ?', n.id)) });
}

/* ---------------- apagar uma conta ---------------- */
async function deletePlayer(env, A, id, body, ip) {
  const pid = clean(id, 64), p = await one(env, 'SELECT * FROM players WHERE id = ?', pid);
  if (!p) throw new HttpError(404, 'Jogador não encontrado.');
  if (clean(body.confirm, 64) !== p.id) throw bad('Para confirmar, escreve o ID do jogador.');
  const reason = clean(body.reason, 200) || null, t = now();
  await env.DB.batch([
    q(env, 'INSERT OR REPLACE INTO deleted_players (id, name, reason, deleted_at, deleted_by) VALUES (?, ?, ?, ?, ?)', p.id, p.name, reason, t, A.admin),
    q(env, "UPDATE grants SET status = 'revoked', revoked_at = ?, revoke_reason = 'Conta apagada' WHERE player_id = ? AND status = 'pending' AND order_id IS NULL", t, p.id),
    q(env, 'UPDATE notices SET deleted_at = ?, deleted_by = ? WHERE player_id = ? AND deleted_at IS NULL', t, A.admin, p.id),
    q(env, 'DELETE FROM friends WHERE a = ? OR b = ?', p.id, p.id),
    q(env, 'DELETE FROM messages WHERE sender = ? OR receiver = ?', p.id, p.id),
    q(env, "UPDATE duels SET status = 'cancelled', end_reason = 'deleted', updated_at = ? WHERE (host = ? OR guest = ?) AND status IN ('waiting','active')", t, p.id, p.id),
    q(env, 'DELETE FROM players WHERE id = ?', p.id),
    auditStmt(env, A.admin, 'player.delete', p.id, 'ok', { name: p.name, level: p.level, reason: reason || undefined }, ip)
  ]);
  return json({ ok: true, deleted: p.id });
}

/* ---------------- administração de jogadores ---------------- */
function playerAdmin(p) {
  let stats = {}; try { stats = JSON.parse(p.stats || '{}'); } catch (e) { stats = {}; }
  return { id: p.id, name: p.name, cls: p.cls, level: p.level, crystals: p.crystals, coins: p.coins, stats, app_version: p.app_version, platform: p.platform,
    created_at: p.created_at, last_seen: p.last_seen, syncs: p.syncs, status: p.status, ban_reason: p.ban_reason, ban_until: p.ban_until, banned_at: p.banned_at,
    banned_by: p.banned_by, note: p.note, duel_wins: p.duel_wins || 0, duel_losses: p.duel_losses || 0, duel_points: p.duel_points || 0, spent_kz: p.spent_kz || 0, paid_orders: p.paid_orders || 0,
    role: p.role_eff || p.role || 'usuario', role_name: ROLES[p.role_eff || p.role || 'usuario'], role_auto: !p.role, role_by: p.role_by || null };
}
function grantAdmin(g) {
  return { id: g.id, player_id: g.player_id, order_id: g.order_id, crystals: g.crystals, coins: g.coins, reason: g.reason, message: g.message, mode: g.mode, hint: g.hint,
    status: g.status, created_by: g.created_by, created_at: g.created_at, claimed_at: g.claimed_at, claimed_player: g.claimed_player, revoked_at: g.revoked_at, revoke_reason: g.revoke_reason, test: !!g.test };
}
const SPENT = "(SELECT COALESCE(SUM(price_kz),0) FROM orders o WHERE o.player_id = players.id AND o.status IN " + "('payment_confirmed','code_issued','redeemed')) AS spent_kz, " +
  "(SELECT COUNT(*) FROM orders o WHERE o.player_id = players.id AND o.status IN ('payment_confirmed','code_issued','redeemed')) AS paid_orders, " + ROLE_EFF + ' AS role_eff';

async function listPlayers(env, url) {
  const qq = clean(url.searchParams.get('q'), 40), st = url.searchParams.get('status'), sort = url.searchParams.get('sort') || 'seen';
  const limit = Math.min(100, +url.searchParams.get('limit') || 50);
  const where = [], args = [];
  if (qq) { where.push('(id LIKE ? OR name LIKE ?)'); args.push('%' + qq.toUpperCase() + '%', '%' + qq + '%'); }
  if (st === 'banned' || st === 'active') { where.push('status = ?'); args.push(st); }
  if (st === 'online') { where.push('last_seen > ?'); args.push(now() - 15 * MIN); }
  if (!isTest(env)) where.push('test = 0');
  const role = clean(url.searchParams.get('role'), 20);
  if (ROLES[role]) { where.push('role_eff = ?'); args.push(role); }
  const order = { seen: 'last_seen DESC', level: 'level DESC, last_seen DESC', spent: 'spent_kz DESC, last_seen DESC', new: 'created_at DESC' }[sort] || 'last_seen DESC';
  const rows = await all(env, 'SELECT * FROM (SELECT *, ' + SPENT + ' FROM players)' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY ' + order + ' LIMIT ?', ...args, limit);
  const rc = await all(env, 'SELECT ' + ROLE_EFF + ' AS r, COUNT(*) AS n FROM players' + (isTest(env) ? '' : ' WHERE test = 0') + ' GROUP BY r');
  const roles = {}; Object.keys(ROLES).forEach((k) => { roles[k] = 0; }); rc.forEach((x) => { roles[x.r] = x.n; });
  const tot = await one(env, "SELECT COUNT(*) AS n, SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) AS banned, SUM(CASE WHEN last_seen > ? THEN 1 ELSE 0 END) AS week, SUM(CASE WHEN last_seen > ? THEN 1 ELSE 0 END) AS online FROM players" + (isTest(env) ? '' : ' WHERE test = 0'), now() - 7 * DAY, now() - 15 * MIN);
  return json({ ok: true, players: rows.map(playerAdmin), totals: { players: tot.n || 0, banned: tot.banned || 0, active_7d: tot.week || 0, online: tot.online || 0, roles }, role_names: ROLES });
}
async function playerDetail(env, id) {
  const pid = clean(id, 64);
  await playerRow(env, pid);
  const p = await one(env, 'SELECT *, ' + SPENT + ' FROM players WHERE id = ?', pid);
  const orders = await all(env, 'SELECT * FROM orders WHERE player_id = ? ORDER BY seq DESC LIMIT 30', pid);
  if (!p && !orders.length) throw new HttpError(404, 'Jogador não encontrado.');
  const grants = await all(env, 'SELECT * FROM grants WHERE player_id = ? OR claimed_player = ? ORDER BY created_at DESC LIMIT 30', pid, pid);
  const log = await all(env, "SELECT at, actor, action, target, result, detail FROM audit WHERE target = ? OR actor = ? ORDER BY id DESC LIMIT 40", pid, 'player:' + pid);
  const notices = await all(env, 'SELECT * FROM notices WHERE player_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 20', pid);
  return json({ ok: true, player: p ? playerAdmin(p) : null, orders: orders.map(orderAdmin), grants: grants.map(grantAdmin), audit: log, notices: notices.map(noticeOut), role_names: ROLES });
}
async function banPlayer(env, A, id, body, ip) {
  const p = await playerRow(env, clean(id, 64));
  if (!p) throw new HttpError(404, 'Jogador não encontrado (ainda não sincronizou com o servidor).');
  const reason = clean(body.reason, 200), days = body.days ? int(body.days, 1, 3650) : 0;
  if (reason.length < 3) throw bad('Indica o motivo (o jogador vê-o).');
  const t = now(), until = days ? t + days * DAY : null;
  await env.DB.batch([
    q(env, "UPDATE players SET status = 'banned', ban_reason = ?, ban_until = ?, banned_at = ?, banned_by = ? WHERE id = ?", reason, until, t, A.admin, p.id),
    auditStmt(env, A.admin, until ? 'player.ban' : 'player.disable', p.id, 'ok', { reason, days: days || 'permanente' }, ip)
  ]);
  return playerDetail(env, p.id);
}
async function unbanPlayer(env, A, id, body, ip) {
  const p = await playerRow(env, clean(id, 64));
  if (!p) throw new HttpError(404, 'Jogador não encontrado.');
  if (p.status !== 'banned') return playerDetail(env, p.id);
  await env.DB.batch([
    q(env, "UPDATE players SET status = 'active', ban_reason = NULL, ban_until = NULL WHERE id = ?", p.id),
    auditStmt(env, A.admin, 'player.unban', p.id, 'ok', { note: clean(body.reason, 200) || undefined }, ip)
  ]);
  return playerDetail(env, p.id);
}
async function notePlayer(env, A, id, body, ip) {
  const p = await playerRow(env, clean(id, 64));
  if (!p) throw new HttpError(404, 'Jogador não encontrado.');
  await env.DB.batch([q(env, 'UPDATE players SET note = ? WHERE id = ?', clean(body.note, 500) || null, p.id), auditStmt(env, A.admin, 'player.note', p.id, 'ok', null, ip)]);
  return playerDetail(env, p.id);
}

/* Ofertas: código (mostrado uma vez) ou entrega automática */
async function createGrant(env, A, request, body, ip) {
  const key = idemKey(request);
  const prev = await idemGet(env, key, A.admin, 'grant.create', 'grant');
  if (prev) return json(Object.assign(prev, { repeated: true }));
  const mode = body.mode === 'auto' ? 'auto' : 'code';
  const crystals = int(body.crystals, 0, 100000), coins = int(body.coins, 0, 100000000);
  const reason = clean(body.reason, 120), message = clean(body.message, 200);
  const pid = body.player_id ? clean(body.player_id, 64) : null;
  if (!crystals && !coins) throw bad('Indica os Cristais e/ou as moedas a enviar.');
  if (reason.length < 3) throw bad('Indica o motivo (fica na auditoria).');
  if (mode === 'auto' && !pid) throw bad('A entrega automática precisa do ID do jogador.');
  if (pid) {
    const p = await playerRow(env, pid);
    if (!p && mode === 'auto') throw new HttpError(404, 'Este jogador ainda não sincronizou com o servidor. Usa um código, ou espera que ele abra o jogo com internet.');
    if (p && p.status === 'banned') throw new HttpError(409, 'Este jogador está suspenso. Levanta a suspensão antes de lhe enviar ofertas.');
  }
  const id = randomId('g'), t = now();
  let code = null, h = null, hint = null;
  if (mode === 'code') { code = newCode(); h = await codeHash(env, code); hint = normCode(code).slice(-4); }
  await env.DB.batch([
    q(env, 'INSERT INTO grants (id, player_id, crystals, coins, reason, message, mode, code_hash, hint, status, created_by, created_at, test) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      id, pid, crystals, coins, reason, message || null, mode, h, hint, 'pending', A.admin, t, isTest(env) ? 1 : 0),
    auditStmt(env, A.admin, 'grant.create', pid || id, 'ok', { grant: id, mode, crystals, coins, reason, hint: hint || undefined }, ip)
  ]);
  const what = [crystals ? crystals + ' Cristais' : '', coins ? coins + ' moedas' : ''].filter(Boolean).join(' e ');
  const res = { ok: true, grant: grantAdmin(await one(env, 'SELECT * FROM grants WHERE id = ?', id)) };
  if (code) {
    res.code = code;
    res.message = 'O Sistema enviou-te ' + what + (message ? ': ' + message : '.') + '\nCódigo: ' + code + '\nNo jogo: toca nos teus Cristais no topo → Obter Cristais → Resgatar código.' + (pid ? '\nSó funciona na conta ' + pid + '.' : '') + ' Uso único.';
    res.whatsapp_url = 'https://wa.me/?text=' + encodeURIComponent(res.message);
  }
  await run(env, 'INSERT INTO idem (key, actor, action, target, response, expires_at) VALUES (?, ?, ?, ?, ?, ?)', key, A.admin, 'grant.create', 'grant', JSON.stringify(res), t + IDEM_TTL);
  return json(res);
}
async function listGrants(env, url) {
  const st = url.searchParams.get('status'), where = [], args = [];
  if (['pending', 'claimed', 'revoked'].includes(st)) { where.push('status = ?'); args.push(st); }
  if (url.searchParams.get('player')) { where.push('player_id = ?'); args.push(clean(url.searchParams.get('player'), 64)); }
  if (!isTest(env)) where.push('test = 0');
  const rows = await all(env, 'SELECT * FROM grants' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY created_at DESC LIMIT 100', ...args);
  return json({ ok: true, grants: rows.map(grantAdmin) });
}
async function revokeGrant(env, A, id, body, ip) {
  const g = await one(env, 'SELECT * FROM grants WHERE id = ?', clean(id, 40));
  if (!g) throw new HttpError(404, 'Oferta não encontrada.');
  const reason = clean(body.reason, 200);
  if (reason.length < 3) throw bad('Indica o motivo.');
  if (g.status !== 'pending') throw new HttpError(409, g.status === 'claimed' ? 'Já foi recebida pelo jogador: não pode ser anulada.' : 'Já estava anulada.');
  const t = now();
  const r = await env.DB.batch([
    q(env, "UPDATE grants SET status = 'revoked', revoked_at = ?, revoke_reason = ? WHERE id = ? AND status = 'pending'", t, reason, g.id),
    q(env, "UPDATE orders SET status = 'payment_confirmed', delivery = NULL WHERE id = ? AND status = 'code_issued' AND EXISTS (SELECT 1 FROM grants WHERE id = ? AND revoked_at = ?)", g.order_id || '', g.id, t),
    q(env, "INSERT INTO audit (at, actor, action, target, result, detail, ip) SELECT ?, ?, 'grant.revoke', ?, 'ok', ?, ? WHERE EXISTS (SELECT 1 FROM grants WHERE id = ? AND revoked_at = ?)", t, A.admin, g.order_id || g.player_id || g.id, JSON.stringify({ grant: g.id, reason }), ip, g.id, t)
  ]);
  if (!changes(r[0])) throw new HttpError(409, 'O jogador recebeu-a entretanto.');
  return json({ ok: true, grant: grantAdmin(await one(env, 'SELECT * FROM grants WHERE id = ?', g.id)) });
}

/* Entrega automática de uma compra paga: sem código, chega ao jogo na próxima sincronização */
async function deliverOrder(env, A, id, request, ip) {
  const key = idemKey(request), oid = clean(id, 20);
  const prev = await idemGet(env, key, A.admin, 'order.deliver', oid);
  if (prev) return json(Object.assign(prev, { repeated: true }));
  const o = await one(env, 'SELECT * FROM orders WHERE id = ?', oid);
  if (!o) throw new HttpError(404, 'Pedido não encontrado.');
  if (o.status === 'pending_payment') throw new HttpError(409, 'O pagamento ainda não foi confirmado. Não é possível entregar.');
  if (o.status !== 'payment_confirmed') throw new HttpError(409, 'Este pedido já foi entregue ou tem código emitido.');
  const pl = await playerRow(env, o.player_id);
  if (pl && pl.status === 'banned') throw new HttpError(409, 'O jogador está suspenso. Levanta a suspensão ou reembolsa o pedido.');
  const gid = randomId('g'), t = now();
  try {
    await env.DB.batch([
      q(env, 'INSERT INTO grants (id, player_id, order_id, crystals, coins, reason, message, mode, status, created_by, created_at, test) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        gid, o.player_id, o.id, o.crystals, o.coins || 0, 'Compra ' + o.id, 'Pagamento confirmado. Obrigado pela tua compra!', 'auto', 'pending', A.admin, t, o.test),
      q(env, "UPDATE orders SET status = 'code_issued', delivery = 'auto', code_issued_at = ? WHERE id = ? AND status = 'payment_confirmed'", t, o.id),
      auditStmt(env, A.admin, 'order.deliver', o.id, 'ok', { crystals: o.crystals, coins: o.coins || 0, player: o.player_id }, ip)
    ]);
  } catch (e) { throw new HttpError(409, 'Este pedido já tem uma entrega em curso.'); }
  const res = { ok: true, order_id: o.id, grant_id: gid, crystals: o.crystals, coins: o.coins || 0, registered: !!pl,
    note: pl ? (o.coins ? 'As moedas chegam' : 'Os Cristais chegam') + ' ao jogo na próxima vez que o jogador o abrir com internet.' : 'O jogador ainda não sincronizou: recebe quando abrir a versão atual do jogo com internet.' };
  await run(env, 'INSERT INTO idem (key, actor, action, target, response, expires_at) VALUES (?, ?, ?, ?, ?, ?)', key, A.admin, 'order.deliver', o.id, JSON.stringify(res), t + IDEM_TTL);
  return json(res);
}

/* ==========================================================
   ROUTER
   ========================================================== */
/* ==========================================================
   SOCIAL: amigos, conversas e duelos entre jogadores
   - Só jogadores registados (sincronizados) e não suspensos.
   - Os duelos são decididos AQUI: o jogo só escolhe a ação; o servidor
     calcula o golpe, a vida e quem ganha. Cada jogada sobe a versão do
     duelo, por isso uma jogada repetida (rede lenta) nunca conta duas vezes.
   ========================================================== */
const ONLINE_MS = 2 * MIN;
const DUEL_TURN_MS = 45 * 1000;       // tempo para cada jogada
const DUEL_WAIT_MS = 30 * MIN;        // uma sala sem adversário fecha sozinha
const DUEL_MAX_TURNS = 80;
const DUEL_CODE = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CLASSES = ['guerreiro', 'assassino', 'mago', 'guardiao', 'arqueiro', 'invocador'];

function pairKey(x, y) { return x < y ? [x, y] : [y, x]; }
function seenOf(p) { return Math.max(p.last_seen || 0, p.social_seen || 0); }
function isOnline(p) { return now() - seenOf(p) < ONLINE_MS; }
function rnd() { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; }

async function socialAuth(env, body, touch) {
  const p = await playerAuth(env, body);
  if (p.status === 'banned') throw new HttpError(403, 'Esta conta está suspensa pelo Sistema.', { banned: true, ban: banInfo(p) });
  if (touch !== false) await run(env, 'UPDATE players SET social_seen = ? WHERE id = ?', now(), p.id);
  return p;
}
function pub(p, extra) {
  return Object.assign({ id: p.id, name: p.name, cls: p.cls || null, level: p.level, online: isOnline(p), seen: seenOf(p),
    wins: p.duel_wins || 0, losses: p.duel_losses || 0, rating: p.duel_rating || 1000, points: p.duel_points || 0, best: p.duel_best || 0 }, extra || {});
}
async function friendRow(env, x, y) { const k = pairKey(x, y); return one(env, 'SELECT * FROM friends WHERE a = ? AND b = ?', k[0], k[1]); }
async function areFriends(env, x, y) { const f = await friendRow(env, x, y); return !!(f && f.status === 'accepted'); }

/* estado social: amigos (online/offline), pedidos, convites, salas abertas e duelo atual */
async function socialState(env, body) {
  const p = await socialAuth(env, body);
  const rows = await all(env, 'SELECT pl.*, f.status AS fstatus, f.requested_by AS freq, f.created_at AS fcreated, f.accepted_at AS facc FROM friends f JOIN players pl ON pl.id = CASE WHEN f.a = ? THEN f.b ELSE f.a END WHERE f.a = ? OR f.b = ?', p.id, p.id, p.id);
  const unread = await all(env, 'SELECT sender, COUNT(*) AS n FROM messages WHERE receiver = ? AND read_at IS NULL GROUP BY sender', p.id);
  const un = {}; unread.forEach((u) => { un[u.sender] = u.n; });
  const friends = [], inc = [], out = [];
  rows.forEach((r) => {
    const o = pub(r, { unread: un[r.id] || 0, since: r.facc || r.fcreated });
    if (r.fstatus === 'accepted') friends.push(o); else if (r.freq === p.id) out.push(o); else inc.push(o);
  });
  friends.sort((x, y) => (y.online - x.online) || (y.unread - x.unread) || x.name.localeCompare(y.name));
  await expireDuels(env);
  const invites = await all(env, "SELECT d.id, d.code, d.created_at, pl.name, pl.level, pl.cls, pl.id AS host, pl.duel_points AS points FROM duels d JOIN players pl ON pl.id = d.host WHERE d.invited = ? AND d.status = 'waiting' ORDER BY d.created_at DESC LIMIT 10", p.id);
  const open = await all(env, "SELECT d.id, d.code, d.created_at, pl.name, pl.level, pl.cls, pl.id AS host, pl.duel_rating AS rating, pl.duel_points AS points FROM duels d JOIN players pl ON pl.id = d.host WHERE d.status = 'waiting' AND d.public = 1 AND d.host != ? ORDER BY d.created_at DESC LIMIT 20", p.id);
  const mine = await one(env, "SELECT id, code, status, host, guest FROM duels WHERE (host = ? OR guest = ?) AND status IN ('waiting','active') ORDER BY created_at DESC LIMIT 1", p.id, p.id);
  return json({ ok: true, me: pub(p, { online: true }), friends, requests_in: inc, requests_out: out, invites, open, duel: mine,
    unread: unread.reduce((s, u) => s + u.n, 0), server_time: now() });
}

async function socialFind(env, body) {
  const p = await socialAuth(env, body, false);
  if (await limited(env, 'find:' + p.id, 30, MIN)) throw new HttpError(429, 'Muitas pesquisas seguidas. Espera um minuto.');
  const s = clean(body.query, 40);
  if (s.length < 2) throw bad('Escreve pelo menos 2 letras ou o ID do jogador.');
  const rows = await all(env, "SELECT * FROM players WHERE id != ? AND status = 'active' AND (id = ? OR name LIKE ? ESCAPE '\\') ORDER BY (id = ?) DESC, last_seen DESC LIMIT 10",
    p.id, s, s.replace(/[\\%_]/g, (c) => '\\' + c) + '%', s);
  const out = [];
  for (const r of rows) { const f = await friendRow(env, p.id, r.id); out.push(pub(r, { relation: !f ? 'none' : f.status === 'accepted' ? 'friend' : f.requested_by === p.id ? 'sent' : 'received' })); }
  return json({ ok: true, players: out });
}

async function friendRequest(env, body) {
  const p = await socialAuth(env, body);
  const to = clean(body.to, 64);
  if (to === p.id) throw bad('Não podes adicionar-te a ti próprio.');
  if (await limited(env, 'freq:' + p.id, 20, HOUR)) throw new HttpError(429, 'Muitos pedidos de amizade. Tenta mais tarde.');
  const o = await one(env, "SELECT * FROM players WHERE id = ? AND status = 'active'", to);
  if (!o) throw new HttpError(404, 'Não existe nenhum jogador com esse ID.');
  const f = await friendRow(env, p.id, o.id), k = pairKey(p.id, o.id), t = now();
  if (f && f.status === 'accepted') return json({ ok: true, status: 'friend', msg: 'Já são amigos.' });
  if (f && f.requested_by === p.id) return json({ ok: true, status: 'sent', msg: 'O pedido já foi enviado.' });
  if (f) { // ele já te tinha pedido: aceitar
    await run(env, "UPDATE friends SET status = 'accepted', accepted_at = ? WHERE a = ? AND b = ?", t, k[0], k[1]);
    return json({ ok: true, status: 'friend', msg: 'Agora tu e ' + o.name + ' são amigos.' });
  }
  const n = await one(env, "SELECT COUNT(*) AS n FROM friends WHERE (a = ? OR b = ?) AND status = 'accepted'", p.id, p.id);
  if (n.n >= 200) throw bad('Chegaste ao limite de 200 amigos.');
  await run(env, "INSERT INTO friends (a, b, status, requested_by, created_at) VALUES (?, ?, 'pending', ?, ?)", k[0], k[1], p.id, t);
  return json({ ok: true, status: 'sent', msg: 'Pedido de amizade enviado a ' + o.name + '.' });
}
async function friendRespond(env, body) {
  const p = await socialAuth(env, body);
  const from = clean(body.from, 64), f = await friendRow(env, p.id, from), k = pairKey(p.id, from);
  if (!f || f.status !== 'pending' || f.requested_by === p.id) throw new HttpError(404, 'Pedido não encontrado.');
  if (body.accept) { await run(env, "UPDATE friends SET status = 'accepted', accepted_at = ? WHERE a = ? AND b = ?", now(), k[0], k[1]); return json({ ok: true, status: 'friend' }); }
  await run(env, 'DELETE FROM friends WHERE a = ? AND b = ?', k[0], k[1]);
  return json({ ok: true, status: 'none' });
}
async function friendRemove(env, body) {
  const p = await socialAuth(env, body);
  const other = clean(body.other, 64), k = pairKey(p.id, other);
  await run(env, 'DELETE FROM friends WHERE a = ? AND b = ?', k[0], k[1]);
  return json({ ok: true, status: 'none' });
}

/* conversas */
function msgOut(m) { return { id: m.id, from: m.sender, to: m.receiver, text: m.body, at: m.created_at, read: !!m.read_at }; }
async function chatHistory(env, body) {
  const p = await socialAuth(env, body);
  const w = clean(body.with, 64), after = int(body.after, 0, 1e12);
  if (!(await areFriends(env, p.id, w))) throw new HttpError(403, 'Só podes conversar com amigos.');
  const rows = after
    ? await all(env, 'SELECT * FROM messages WHERE id > ? AND ((sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)) ORDER BY id LIMIT 100', after, p.id, w, w, p.id)
    : (await all(env, 'SELECT * FROM messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) ORDER BY id DESC LIMIT 60', p.id, w, w, p.id)).reverse();
  await run(env, 'UPDATE messages SET read_at = ? WHERE receiver = ? AND sender = ? AND read_at IS NULL', now(), p.id, w);
  const o = await one(env, 'SELECT * FROM players WHERE id = ?', w);
  return json({ ok: true, messages: rows.map(msgOut), friend: o ? pub(o) : null });
}
async function chatSend(env, body) {
  const p = await socialAuth(env, body);
  const to = clean(body.to, 64), text = String(body.text == null ? '' : body.text).replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim().slice(0, 500);
  if (!text) throw bad('Escreve uma mensagem.');
  if (!(await areFriends(env, p.id, to))) throw new HttpError(403, 'Só podes enviar mensagens a amigos.');
  if (await limited(env, 'chat:' + p.id, 30, MIN)) throw new HttpError(429, 'Estás a enviar mensagens demasiado depressa.');
  const t = now();
  const r = await run(env, 'INSERT INTO messages (sender, receiver, body, created_at) VALUES (?, ?, ?, ?)', p.id, to, text, t);
  return json({ ok: true, message: { id: r.meta && r.meta.last_row_id, from: p.id, to, text, at: t, read: false } });
}

/* ---------------- duelos ---------------- */
/* Mesmas regras do combate contra chefes: habilidades da classe (com efeitos), itens de combate,
   estados (veneno, queimadura, sangramento, atordoar, bónus e penalizações), escudos, invocações
   e servos. O jogo envia os atributos, as habilidades e os itens; o servidor limita-os ao nível
   registado e só aceita habilidades que a classe e o nível permitem. */
const PVP_HP = (L) => 1.2 + L * 0.016; // vida a crescer com o nível: os duelos duram mais do que um golpe de sorte
const PVP_DEF = 1;                    // peso da defesa contra o golpe
/* golpes muito fortes (as habilidades de nível alto chegam a 700%) são comprimidos num duelo */
/* força de cada classe nos duelos, por nível (10, 30, 60, 100), calibrada automaticamente com torneios simulados
   (tools/pvp-tune.mjs) para cada classe ganhar perto de metade dos duelos contra as outras no mesmo nível */
const PVP_K = {"guerreiro":[0.93,1.05,0.99,1.05],"assassino":[1.09,0.91,1.05,1.03],"mago":[0.94,1.07,0.94,0.98],"guardiao":[0.84,1.04,1.07,1.08],"arqueiro":[1.18,0.94,1,0.97],"invocador":[1.06,0.99,0.95,0.9]};
const PVP_KL = [10, 30, 60, 100];
function classK(cls, L) {
  const k = (globalThis.__PVP_K && globalThis.__PVP_K[cls]) || PVP_K[cls] || [1, 1, 1, 1];
  if (L <= PVP_KL[0]) return k[0];
  for (let i = 1; i < 4; i++) if (L <= PVP_KL[i]) return k[i - 1] + (k[i] - k[i - 1]) * (L - PVP_KL[i - 1]) / (PVP_KL[i] - PVP_KL[i - 1]);
  return k[3];
}
const CLASS_PVP = { invocador: () => ({ summon: 0.65 }) };
/* média de vida, força e defesa de cada nível (todas as classes, equipamento normal): os duelos aproximam
   cada jogador desta média (60% o próprio, 40% a média) para nenhuma classe esmagar as outras */
const PVP_BASE = [[1, 250, 40, 15], [10, 562, 112, 40], [30, 1387, 311, 92], [60, 2690, 628, 182], [100, 5243, 1044, 381]];
function baseAt(L) {
  for (let i = 1; i < PVP_BASE.length; i++) { const a = PVP_BASE[i - 1], b = PVP_BASE[i]; if (L <= b[0]) { const t = (L - a[0]) / (b[0] - a[0]); return [a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t]; } }
  return PVP_BASE[PVP_BASE.length - 1].slice(1);
}
const BLEND = 0.5;
function pvpMult(mult, hits) { const tot = mult * (hits || 1); const t2 = tot <= 1 ? tot : 1 + (tot - 1) * 0.55; return t2 / (hits || 1); }
const SUM = (list, kind, key) => list.reduce((s, x) => s + (x.kind === kind && x.key === key ? x.val : 0), 0);
function fighter(p, f) {
  f = f && typeof f === 'object' ? f : {};
  const L = Math.max(1, Math.min(100, p.level || 1));
  const cap = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round((+v || 0) * 100) / 100));
  const cls = CLASSES.includes(f.cls) ? f.cls : (CLASSES.includes(p.cls) ? p.cls : 'guerreiro');
  const hp = Math.round(cap(f.hp || f.maxHp, 50, 150 * L + 800)), mp = Math.round(cap(f.mp || f.maxMp, 20, 40 * L + 300)), atkCap = 25 * L + 200;
  const stats = {
    atk: cap(f.atk, 1, atkCap), matk: cap(f.matk, 1, atkCap), def: cap(f.def, 0, 12 * L + 100),
    crit: cap(f.crit, 0, 40), critDmg: cap(f.critDmg, 150, 200), eva: cap(f.eva, 0, 15), lifesteal: cap(f.lifesteal, 0, 20),
    regenHp: cap(f.regenHp, 0, 5), regenMp: cap(f.regenMp, 0, 10), summonPct: cap(f.summonPct, 0, 30), dotPct: cap(f.dotPct, 0, 100),
    potionPct: cap(f.potionPct, 0, 100), lowHpAtk: cap(f.lowHpAtk, 0, 60), execute: cap(f.execute, 0, 60), firstStrike: cap(f.firstStrike, 0, 60),
    manaOnHit: cap(f.manaOnHit, 0, 10), thorns: cap(f.thorns, 0, 20), openShield: cap(f.openShield, 0, 30), stunRes: cap(f.stunRes, 0, 60),
    lastStand: f.lastStand ? 1 : 0, revive: cap(f.revive, 0, 30), main: CLASS_MAIN[cls] === 'mag' ? 'mag' : 'phys', agi: cap(f.agi, 0, 400)
  };
  // habilidades: só as da classe, as comuns e as secretas, até ao nível do jogador
  const skills = (Array.isArray(f.skills) ? f.skills : []).map((x) => clean(x, 8)).filter((id, i, a) => {
    const s = DUEL_SKILLS[id]; return s && a.indexOf(id) === i && s.u <= L && (s.c === cls || s.c === '*' || s.c === 'secret');
  }).slice(0, 40);
  // itens de combate da Bolsa (no máximo 9 de cada; as relíquias premium contam como 1)
  const items = {};
  if (f.items && typeof f.items === 'object') Object.keys(f.items).slice(0, 60).forEach((id) => { const it = DUEL_ITEMS[id]; if (it) { const n = Math.min(it.perma ? 1 : 9, Math.floor(+f.items[id] || 0)); if (n > 0) items[id] = n; } });
  // servos convocados: força calculada aqui
  // nos duelos contam só os 3 lugares base (+1 do Invocador): os lugares comprados não dão vantagem contra jogadores
  const squad = (Array.isArray(f.squad) ? f.squad : []).slice(0, cls === 'invocador' ? 4 : 3).map((x) => {
    const lv = Math.max(1, Math.min(100, Math.floor(+(x && x.level) || 1))), king = !!(x && x.king), role = ['atacante', 'arcano', 'guarda', 'comandante'].includes(x && x.role) ? x.role : 'atacante';
    let k = (king ? 0.14 : 0.07) + lv * 0.0006; if (role === 'guarda') k *= 0.6; if (cls === 'invocador') k *= 1.25;
    return { name: clean(x && x.name, 24) || 'Servo', role, king, power: Math.max(1, Math.round(Math.max(stats.atk, stats.matk) * k)), shieldPct: role === 'guarda' ? 4 + Math.round(lv / 20) : 0 };
  });
  const M = Object.assign({}, CLASS_PVP[cls] ? CLASS_PVP[cls](L) : {}), CK = classK(cls, L); M.hp = (M.hp || 1) * Math.sqrt(CK); M.atk = (M.atk || 1) * Math.sqrt(CK); const B0 = baseAt(L), mainPow = Math.max(stats.atk, stats.matk), kPow = (BLEND * mainPow + (1 - BLEND) * B0[1]) / mainPow;
  stats.atk = Math.round(stats.atk * kPow * (M.atk || 1)); stats.matk = Math.round(stats.matk * kPow * (M.atk || 1)); stats.def = Math.round((BLEND * stats.def + (1 - BLEND) * B0[2]) * (M.def || 1)); stats.summonK = M.summon || 1;
  const maxHp = Math.round((BLEND * hp + (1 - BLEND) * B0[0]) * PVP_HP(L) * (M.hp || 1));
  return { id: p.id, name: p.name, cls, level: L, points: p.duel_points || 0, maxHp, hp: maxHp, maxMp: mp, mp, shield: 0, st: [], cds: {}, stunned: 0, stunImmune: 0,
    summons: [], squad, cmd: Math.min(15, squad.filter((x) => x.role === 'comandante').length * 5), stats, skills, items, used: {}, heals: 0, premUsed: 0,
    struck: false, lastStandUsed: false, reviveUsed: false, miss: 0 };
}
function newCodeDuel() { let s = ''; while (s.length < 6) { const b = randomBytes(8); for (let i = 0; i < b.length && s.length < 6; i++) if (b[i] < 248) s += DUEL_CODE[b[i] % 31]; } return s; }
function addLog(st, txt, c, who, tg) { st.seq = (st.seq || 0) + 1; st.log.push({ n: st.seq, t: txt, c: c || '', w: who || null, tg: tg || null }); if (st.log.length > 60) st.log.splice(0, st.log.length - 60); }
const chance = (p) => rnd() < p;
const rr = (a, b) => a + rnd() * (b - a);
function base(A, kind) {
  const s = A.stats;
  const atk = s.atk * (1 + SUM(A.st, 'buff', 'atk') / 100 - SUM(A.st, 'debuff', 'atk') / 100);
  const matk = s.matk * (1 + (SUM(A.st, 'buff', 'matk') + SUM(A.st, 'buff', 'atk') * 0.5 - SUM(A.st, 'debuff', 'atk')) / 100);
  const def = s.def * (1 + SUM(A.st, 'buff', 'def') / 100);
  let v = kind === 'mag' ? matk : kind === 'def' ? def * 3 : kind === 'best' ? Math.max(atk, matk) : atk;
  if (s.lowHpAtk && A.hp < A.maxHp * 0.3) v *= 1 + s.lowHpAtk / 100;
  if (A.cmd) v *= 1 + A.cmd / 100;
  return Math.max(1, v);
}
function effDef(D, pierce) { return Math.max(0, D.stats.def * (1 + SUM(D.st, 'buff', 'def') / 100) * (1 - SUM(D.st, 'debuff', 'def') / 100) * (1 - (pierce || 0))); }
/* redução proporcional pela defesa (igual para um golpe grande ou vários pequenos) */
function mitig(raw, def, L) { const P = baseAt(L || 50)[1] * 1.2; return raw * P / (P + def * PVP_DEF); }
/* dano a um lutador: escudo, espinhos (devolve parte) e reflexão */
function hurt(st, D, amount, A) {
  let dmg = Math.max(1, Math.round(amount));
  if (D.shield > 0) { const ab = Math.min(D.shield, dmg); D.shield -= ab; dmg -= ab; if (ab) addLog(st, '🛡️ O escudo de ' + D.name + ' absorve ' + ab + '.', 'muted', D.id); }
  D.hp = Math.max(0, D.hp - dmg);
  if (A && dmg > 0 && A.hp > 0) {
    const back = (D.stats.thorns || 0) + SUM(D.st, 'buff', 'reflect');
    if (back > 0) { const r = Math.max(1, Math.round(dmg * back / 100)); A.hp = Math.max(1, A.hp - r); addLog(st, '🌵 ' + D.name + ' devolve ' + r + ' de dano.', 'hit', D.id, A.id); }
  }
  return dmg;
}
function heal(F, amount) { const h = Math.max(0, Math.min(F.maxHp - F.hp, Math.round(amount))); F.hp += h; return h; }
function revive(st, F) {
  if (F.hp > 0) return;
  if (F.stats.lastStand && !F.lastStandUsed) { F.lastStandUsed = true; F.hp = 1; addLog(st, '🔥 Vontade Inabalável! ' + F.name + ' aguenta com 1 de vida.', 'warn', F.id); return; }
  if (F.stats.revive && !F.reviveUsed) { F.reviveUsed = true; F.hp = Math.round(F.maxHp * F.stats.revive / 100); addLog(st, '🔥 ' + F.name + ' renasce das cinzas com ' + F.hp + ' de vida!', 'warn', F.id); return; }
  for (const id of ['pr_fenix', 'sx_fenix']) {
    if ((F.items[id] || 0) > (F.used[id] || 0) && !F.revived) {
      F.revived = true; F.used[id] = (F.used[id] || 0) + 1; F.hp = Math.round(F.maxHp * 0.3);
      addLog(st, (id === 'pr_fenix' ? '🖤 ' : '🪶 ') + (DUEL_ITEMS[id] ? DUEL_ITEMS[id].n : 'Fénix') + ' devolve ' + F.name + ' à vida (' + F.hp + ').', 'warn', F.id); return;
    }
  }
}
/* um efeito (as mesmas "ops" das habilidades do jogo) */
function op(st, A, D, o, src) {
  const s = A.stats;
  switch (o.op) {
    case 'dmg': {
      const hits = o.hits || 1, b0 = base(A, ['phys', 'mag', 'def', 'best'].includes(o.kind) ? o.kind : s.main);
      let total = 0, crits = 0, miss = 0;
      for (let i = 0; i < hits && D.hp > 0; i++) {
        const eva = Math.min(25, D.stats.eva + SUM(D.st, 'buff', 'eva'));
        if (!o.alwaysCrit && chance(eva / 100)) { miss++; continue; }
        let raw = b0 * pvpMult(o.mult, hits) * rr(0.9, 1.1);
        const isCrit = o.alwaysCrit || chance(Math.min(55, s.crit + SUM(A.st, 'buff', 'crit') + (o.crit || 0)) / 100);
        if (isCrit) { raw *= s.critDmg / 100; crits++; }
        if (o.execute && D.hp < D.maxHp * o.execute.below) raw *= o.execute.mult;
        if (s.execute && D.hp < D.maxHp * 0.3) raw *= 1 + s.execute / 100;
        if (s.firstStrike && !A.struck) raw *= 1 + s.firstStrike / 100;
        const dmg = hurt(st, D, mitig(raw, effDef(D, o.pierce), A.level), A);
        total += dmg;
        const ls = (s.lifesteal + SUM(A.st, 'buff', 'lifesteal')) / 100 + (o.lifesteal || 0);
        if (ls > 0) heal(A, dmg * ls);
      }
      if (total > 0) A.struck = true;
      if (s.manaOnHit && total > 0) A.mp = Math.min(A.maxMp, A.mp + Math.round(A.maxMp * s.manaOnHit / 100));
      if (total > 0 || !miss) addLog(st, '➤ ' + src + ': ' + total + ' de dano' + (hits > 1 ? ' (' + hits + ' golpes)' : '') + (crits ? ' — CRÍTICO' + (crits > 1 ? ' ×' + crits : '') + '!' : '.'), crits ? 'crit' : 'hit', A.id, D.id);
      if (miss) addLog(st, '💨 ' + D.name + ' esquivou-se' + (hits > 1 ? ' de ' + miss + ' golpe(s)' : '') + '.', 'miss', D.id);
      break;
    }
    case 'dot': {
      const per = Math.max(1, Math.round(mitig(Math.max(base(A, 'phys'), base(A, 'mag')) * o.mult * 0.42, effDef(D, 0.5), A.level) * (1 + (s.dotPct || 0) / 100)));
      D.st.push({ kind: 'dot', type: o.type, val: per, turns: o.turns, from: A.id });
      addLog(st, '☠️ ' + D.name + ' sofre ' + (DOT_NAMES[o.type] || o.type) + ' (' + per + '/turno).', 'status', A.id, D.id);
      break;
    }
    case 'stun': {
      let ch = o.chance >= 1 ? 0.6 : o.chance * 0.6;
      if (D.stunImmune > 0) { addLog(st, '🌀 ' + D.name + ' resiste ao atordoamento.', 'muted', D.id); break; }
      if (D.stats.stunRes) ch *= 1 - D.stats.stunRes / 100;
      if (chance(ch)) { D.stunned = 1; D.stunImmune = 3; addLog(st, '💫 ' + D.name + ' ficou atordoado!', 'status', A.id, D.id); }
      else addLog(st, '🌀 O atordoamento falhou.', 'muted', A.id);
      break;
    }
    case 'heal': { const h = heal(A, A.maxHp * o.pct / 100 * 0.6); addLog(st, h ? '💚 ' + A.name + ' recupera ' + h + ' de vida.' : '💚 A vida de ' + A.name + ' já estava cheia.', 'heal', A.id); break; }
    case 'shield': { const v = Math.round(A.maxHp * o.pct / 100 * 0.6); A.shield += v; addLog(st, '🛡️ ' + A.name + ' ergue um escudo de ' + v + '.', 'buff', A.id); break; }
    case 'mp': { const m = Math.min(A.maxMp - A.mp, Math.round(A.maxMp * o.pct / 100)); A.mp += m; addLog(st, m ? '💧 ' + A.name + ' recupera ' + m + ' de mana.' : '💧 A mana de ' + A.name + ' já estava cheia.', 'buff', A.id); break; }
    case 'buff': { const v = Math.round(o.val * 0.6); A.st.push({ kind: 'buff', key: o.key, val: v, turns: o.turns }); addLog(st, '⬆️ ' + A.name + ': ' + (BUFF_NAMES[o.key] || o.key) + ' +' + v + '% (' + o.turns + ' turnos).', 'buff', A.id); break; }
    case 'debuff': { const v = Math.round(o.val * 0.6); D.st.push({ kind: 'debuff', key: o.key, val: v, turns: o.turns }); addLog(st, '⬇️ ' + D.name + ': ' + (BUFF_NAMES[o.key] || o.key) + ' -' + v + '%.', 'status', A.id, D.id); break; }
    case 'summon': {
      const power = Math.round(Math.max(s.matk, s.atk) * o.mult * (1 + (s.summonPct || 0) / 100) * (s.summonK || 1));
      A.summons = A.summons.filter((x) => x.name !== o.name);
      if (A.summons.length >= 2) A.summons.shift(); // num duelo, no máximo 2 invocações ao mesmo tempo
      A.summons.push({ name: o.name, power, turns: o.turns });
      addLog(st, '💀 ' + A.name + ' invoca ' + o.name + ' (' + o.turns + ' turnos).', 'buff', A.id);
      break;
    }
    case 'resetCd': A.cds = {}; addLog(st, '⏳ As recargas de ' + A.name + ' foram reiniciadas.', 'buff', A.id); break;
  }
}
/* a ação do jogador da vez; devolve uma mensagem de erro ou null */
function duelAct(st, me, oppId, action, id) {
  const A = st.f[me], D = st.f[oppId];
  if (A.stunned > 0 && action !== 'pass') return 'Estás atordoado.';
  if (action === 'attack') op(st, A, D, { op: 'dmg', kind: A.stats.main, mult: 1 }, A.name + ' ataca');
  else if (action === 'skill') {
    const sk = DUEL_SKILLS[id];
    if (!sk || !A.skills.includes(id)) return 'Habilidade indisponível.';
    if ((A.cds[id] || 0) > 0) return 'Em recarga (' + A.cds[id] + ' turnos).';
    if (A.mp < sk.mp) return 'Mana insuficiente.';
    A.mp -= sk.mp; if (sk.cd) A.cds[id] = sk.cd + 1;
    addLog(st, '✦ ' + A.name + ' usou ' + sk.n + '.', 'skill', me);
    sk.ops.forEach((o) => { if (D.hp > 0 || o.op !== 'dmg') op(st, A, D, o, sk.n); });
  } else if (action === 'item') {
    const it = DUEL_ITEMS[id];
    if (!it || (A.items[id] || 0) <= (A.used[id] || 0)) return 'Não tens este item.';
    const u = it.use, isHeal = u.type === 'heal' || u.type === 'restore';
    if (isHeal && A.heals >= HEAL_LIMIT) return 'Já usaste ' + HEAL_LIMIT + ' poções de cura neste duelo.';
    if (it.prem && A.premUsed >= 1) return 'Só podes usar 1 relíquia premium por duelo.';
    if (isHeal) A.heals++;
    if (it.prem) A.premUsed++;
    A.used[id] = (A.used[id] || 0) + 1;
    addLog(st, '🎒 ' + A.name + ' usou ' + it.n + '.', 'skill', me);
    const potK = 1 + (A.stats.potionPct || 0) / 100;
    const self = (o) => op(st, A, D, o, it.n);
    if (u.type === 'heal') self({ op: 'heal', pct: u.pct * potK });
    else if (u.type === 'mana') self({ op: 'mp', pct: u.pct });
    else if (u.type === 'buffs') u.list.forEach((bf) => self({ op: 'buff', key: bf.key, val: bf.val, turns: bf.turns }));
    else if (u.type === 'cleanse') { A.st = A.st.filter((x) => x.kind === 'buff'); addLog(st, '🌿 ' + A.name + ' remove os efeitos negativos.', 'heal', me); }
    else if (u.type === 'bomb') {
      const dd = hurt(st, D, mitig(A.level * (u.perLevel || 10), effDef(D, 0.5), A.level), A); addLog(st, '💥 A bomba causa ' + dd + ' de dano a ' + D.name + '!', 'hit', me, oppId);
      if (u.dot && D.hp > 0) self(Object.assign({ op: 'dot' }, u.dot));
      if (u.stun && D.hp > 0) self({ op: 'stun', chance: u.stun, turns: 1 });
    } else if (u.type === 'restore') {
      self({ op: 'heal', pct: (u.hp || 0) * potK }); self({ op: 'mp', pct: u.mp || 0 });
      if (u.cleanse) A.st = A.st.filter((x) => x.kind === 'buff');
    } else if (u.type === 'judgment') {
      const jd = hurt(st, D, D.maxHp * 0.1, A); addLog(st, '💥 O Juízo Final corta ' + jd + ' de vida a ' + D.name + ' (10% num duelo)!', 'crit', me, oppId);
    } else if (u.type === 'monarch') {
      self({ op: 'heal', pct: 50 }); self({ op: 'mp', pct: 100 }); A.st = A.st.filter((x) => x.kind === 'buff');
      self({ op: 'buff', key: 'atk', val: 30, turns: 3 }); self({ op: 'buff', key: 'matk', val: 30, turns: 3 });
    } else if (u.type === 'ops') u.ops.forEach((o) => { if (D.hp > 0 || o.op !== 'dmg') self(o); });
  } else if (action === 'defend') {
    A.st.push({ kind: 'buff', key: 'def', val: 60, turns: 1 });
    const g = Math.min(A.maxMp - A.mp, Math.round(A.maxMp * 0.1)); A.mp += g;
    addLog(st, '🛡️ ' + A.name + ' defende-se (+60% defesa, +' + g + ' mana).', 'buff', me);
  } else if (action === 'pass') {
    if (!(A.stunned > 0)) return 'Ação inválida.';
  } else return 'Ação desconhecida.';
  return null;
}
/* depois da ação: invocações e servos atacam, regeneração */
function afterAction(st, me, oppId) {
  const A = st.f[me], D = st.f[oppId];
  A.summons.forEach((x) => { if (D.hp <= 0) return; const d = hurt(st, D, mitig(x.power * rr(0.9, 1.1), effDef(D), A.level), null); addLog(st, '💀 ' + x.name + ' ataca ' + D.name + ': ' + d + '.', 'hit', me, oppId); });
  A.squad.forEach((x) => { if (D.hp <= 0) return; const d = hurt(st, D, mitig(x.power * rr(0.9, 1.1), effDef(D), A.level), null); addLog(st, '🌑 ' + x.name + ' ataca ' + D.name + ': ' + d + '.', 'hit', me, oppId); });
  if (A.hp > 0) {
    A.mp = Math.min(A.maxMp, A.mp + Math.round(A.maxMp * (A.stats.regenMp || 0) / 100) + Math.round(A.maxMp * 0.03));
    if (A.stats.regenHp) heal(A, A.maxHp * A.stats.regenHp / 100);
  }
  revive(st, D);
}
/* início do turno de "who": venenos e queimaduras, recargas e estados a contar. Devolve 'dead', 'stunned' ou null */
function startTurn(st, who, other) {
  const F = st.f[who];
  const dot = F.st.reduce((s, x) => s + (x.kind === 'dot' ? x.val : 0), 0);
  if (dot > 0) { const d = hurt(st, F, dot, null); addLog(st, '☠️ Os efeitos causam ' + d + ' de dano a ' + F.name + '.', 'hit', other, who); revive(st, F); }
  for (let i = F.st.length - 1; i >= 0; i--) { F.st[i].turns--; if (F.st[i].turns <= 0) F.st.splice(i, 1); }
  Object.keys(F.cds).forEach((k) => { F.cds[k]--; if (F.cds[k] <= 0) delete F.cds[k]; });
  if (F.stunImmune > 0) F.stunImmune--;
  F.summons = F.summons.filter((x) => { x.turns--; return x.turns > 0; });
  if (F.hp <= 0) return 'dead';
  if (F.stunned > 0) { F.stunned--; addLog(st, '💫 ' + F.name + ' está atordoado e perde o turno.', 'status', null, who); afterAction(st, who, other); return 'stunned'; }
  return null;
}
/* passa a vez: aplica o início do turno do outro (e salta turnos de quem está atordoado). Devolve { turn } ou { winner } */
function passTurn(st, from, to) {
  let cur = to, prev = from;
  for (let i = 0; i < 4; i++) {
    if (st.f[prev].hp <= 0) return { winner: cur };
    const r = startTurn(st, cur, prev);
    if (r === 'dead') return { winner: prev };
    if (st.f[prev].hp <= 0) return { winner: cur };
    if (r !== 'stunned') return { turn: cur };
    const t = cur; cur = prev; prev = t;
  }
  return { turn: cur };
}
function winnerByHp(st, a, b) { const ra = st.f[a].hp / st.f[a].maxHp, rb = st.f[b].hp / st.f[b].maxHp; return ra === rb ? (rnd() < 0.5 ? a : b) : (ra > rb ? a : b); }
/* entrada dos lutadores: escudos iniciais e servos */
function opening(st, a, b) {
  [[a, b], [b, a]].forEach(([x, y]) => {
    const F = st.f[x], O = st.f[y];
    if (F.stats.openShield) F.shield += Math.round(F.maxHp * F.stats.openShield / 100);
    F.squad.forEach((s) => { if (s.shieldPct) F.shield += Math.round(F.maxHp * s.shieldPct / 100); if (s.role === 'arcano') O.st.push({ kind: 'debuff', key: 'def', val: 8, turns: 3 }); });
    if (F.squad.length) addLog(st, '🌑 ' + F.squad.map((s) => s.name).join(', ') + (F.squad.length > 1 ? ' erguem-se' : ' ergue-se') + ' ao lado de ' + F.name + '.', 'buff', x);
  });
}

async function finishDuel(env, d, st, winner, reason) {
  const loser = winner === d.host ? d.guest : d.host, t = now();
  const W = await one(env, 'SELECT duel_rating AS r, duel_points AS p FROM players WHERE id = ?', winner), L = await one(env, 'SELECT duel_rating AS r, duel_points AS p FROM players WHERE id = ?', loser);
  const rw = (W && W.r) || 1000, rl = (L && L.r) || 1000, exp = 1 / (1 + Math.pow(10, (rl - rw) / 400)), k = Math.max(1, Math.round(24 * (1 - exp)));
  // patentes: +1 ponto por vitória, -1 por derrota (nunca abaixo de 0)
  const pw = (W && W.p) || 0, pl = (L && L.p) || 0;
  st.result = { winner, loser, reason, rating: { [winner]: [rw, rw + k], [loser]: [rl, Math.max(100, rl - k)] }, points: { [winner]: [pw, pw + 1], [loser]: [pl, Math.max(0, pl - 1)] } };
  addLog(st, st.f[winner].name + ' venceu o duelo!' + (reason === 'forfeit' ? ' (o adversário desistiu)' : reason === 'timeout' ? ' (o adversário deixou passar o tempo)' : reason === 'turns' ? ' (mais vida no fim do limite de turnos)' : ''), 'win', winner);
  return [
    q(env, "UPDATE duels SET status = 'done', winner = ?, end_reason = ?, state = ?, turn_player = NULL, turn_deadline = NULL, version = version + 1, updated_at = ? WHERE id = ? AND version = ?", winner, reason, JSON.stringify(st), t, d.id, d.version),
    q(env, 'UPDATE players SET duel_wins = duel_wins + 1, duel_rating = ?, duel_points = duel_points + 1, duel_best = MAX(duel_best, duel_points + 1) WHERE id = ? AND EXISTS (SELECT 1 FROM duels WHERE id = ? AND status = ? AND winner = ?)', rw + k, winner, d.id, 'done', winner),
    q(env, 'UPDATE players SET duel_losses = duel_losses + 1, duel_rating = ?, duel_points = MAX(0, duel_points - 1) WHERE id = ? AND EXISTS (SELECT 1 FROM duels WHERE id = ? AND status = ? AND winner = ?)', Math.max(100, rl - k), loser, d.id, 'done', winner)
  ];
}
/* salas esquecidas fecham; turnos sem resposta passam (2 seguidos = derrota) */
async function expireDuels(env) {
  await run(env, "UPDATE duels SET status = 'cancelled', end_reason = 'expired', updated_at = ? WHERE status = 'waiting' AND created_at < ?", now(), now() - DUEL_WAIT_MS);
}
/* depois da ação de "me": servos, invocações, regeneração e passagem de vez (ou fim do duelo) */
async function advance(env, d, st, me) {
  const opp = me === d.host ? d.guest : d.host;
  afterAction(st, me, opp);
  if (st.f[opp].hp <= 0) return finishDuel(env, d, st, me, 'ko');
  if (st.f[me].hp <= 0) return finishDuel(env, d, st, opp, 'ko');
  if (d.turn_no >= DUEL_MAX_TURNS) return finishDuel(env, d, st, winnerByHp(st, me, opp), 'turns');
  const r = passTurn(st, me, opp);
  if (r.winner) return finishDuel(env, d, st, r.winner, 'ko');
  return [q(env, 'UPDATE duels SET state = ?, turn_player = ?, turn_no = turn_no + 1, turn_deadline = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?',
    JSON.stringify(st), r.turn, now() + DUEL_TURN_MS, now(), d.id, d.version)];
}
async function duelTimeout(env, d) {
  if (d.status !== 'active' || !d.turn_deadline || d.turn_deadline > now()) return d;
  const st = JSON.parse(d.state), me = d.turn_player, opp = me === d.host ? d.guest : d.host;
  st.f[me].miss = (st.f[me].miss || 0) + 1;
  let stmts;
  if (st.f[me].miss >= 2) { addLog(st, st.f[me].name + ' não respondeu duas vezes seguidas.', 'sys'); stmts = await finishDuel(env, d, st, opp, 'timeout'); }
  else {
    addLog(st, st.f[me].name + ' deixou passar o tempo e defende-se automaticamente.', 'sys', me);
    if (st.f[me].stunned > 0) duelAct(st, me, opp, 'pass'); else duelAct(st, me, opp, 'defend');
    stmts = await advance(env, d, st, me);
  }
  await env.DB.batch(stmts);
  return one(env, 'SELECT * FROM duels WHERE id = ?', d.id);
}
function duelOut(d, me) {
  const st = d.state ? JSON.parse(d.state) : null;
  return { id: d.id, code: d.code, status: d.status, host: d.host, guest: d.guest, invited: d.invited, public: !!d.public, turn: d.turn_player, turn_no: d.turn_no,
    deadline: d.turn_deadline, winner: d.winner, reason: d.end_reason, version: d.version, me, heal_limit: HEAL_LIMIT,
    fighters: st ? st.f : null, log: st ? st.log : [], result: st ? st.result || null : null, server_time: now(), created_at: d.created_at };
}
async function myOpenDuel(env, pid) { return one(env, "SELECT * FROM duels WHERE (host = ? OR guest = ?) AND status IN ('waiting','active') ORDER BY created_at DESC LIMIT 1", pid, pid); }

async function duelCreate(env, body) {
  const p = await socialAuth(env, body);
  await expireDuels(env);
  if (await myOpenDuel(env, p.id)) throw new HttpError(409, 'Já tens um duelo aberto. Termina-o ou fecha a sala primeiro.');
  if (await limited(env, 'duelnew:' + p.id, 30, HOUR)) throw new HttpError(429, 'Criaste demasiadas salas. Espera um pouco.');
  let invited = clean(body.invite, 64) || null;
  if (invited && !(await areFriends(env, p.id, invited))) throw bad('Só podes convidar amigos.');
  const st = { f: { [p.id]: fighter(p, body.fighter) }, log: [], seq: 0 };
  addLog(st, p.name + ' abriu a sala de duelo.', 'sys');
  const id = randomId('d'), t = now();
  let code = newCodeDuel();
  for (let i = 0; i < 5 && (await one(env, 'SELECT 1 AS x FROM duels WHERE code = ?', code)); i++) code = newCodeDuel();
  await run(env, "INSERT INTO duels (id, code, host, invited, public, status, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'waiting', ?, ?, ?)",
    id, code, p.id, invited, body.public === false ? 0 : 1, JSON.stringify(st), t, t);
  return json({ ok: true, duel: duelOut(await one(env, 'SELECT * FROM duels WHERE id = ?', id), p.id) });
}
async function duelJoin(env, body) {
  const p = await socialAuth(env, body);
  await expireDuels(env);
  const code = clean(body.code, 12).toUpperCase().replace(/[^A-Z0-9]/g, ''), id = clean(body.id, 40);
  const d = id ? await one(env, 'SELECT * FROM duels WHERE id = ?', id) : await one(env, 'SELECT * FROM duels WHERE code = ?', code);
  if (!d || d.status === 'cancelled') throw new HttpError(404, 'Sala não encontrada ou já fechada.');
  if (d.host === p.id) throw bad('Esta sala é tua: espera por um adversário.');
  if (d.status !== 'waiting') { if (d.guest === p.id) return json({ ok: true, duel: duelOut(d, p.id) }); throw new HttpError(409, 'Esta sala já tem dois jogadores.'); }
  const other = await myOpenDuel(env, p.id);
  if (other) throw new HttpError(409, 'Já tens um duelo aberto. Termina-o primeiro.');
  const host = await one(env, 'SELECT * FROM players WHERE id = ?', d.host);
  if (!host) throw new HttpError(404, 'O dono da sala já não existe.');
  const st = JSON.parse(d.state);
  st.f[p.id] = fighter(p, body.fighter);
  // começa quem tem mais agilidade (empate: à sorte)
  const a = st.f[d.host], b = st.f[p.id];
  const first = a.stats.agi === b.stats.agi ? (rnd() < 0.5 ? d.host : p.id) : (a.stats.agi > b.stats.agi ? d.host : p.id);
  addLog(st, p.name + ' entrou na sala. O duelo começa!', 'sys');
  opening(st, d.host, p.id);
  addLog(st, st.f[first].name + ' é mais rápido e ataca primeiro.', 'sys');
  const t = now();
  const r = await run(env, "UPDATE duels SET guest = ?, status = 'active', state = ?, turn_player = ?, turn_no = 1, turn_deadline = ?, version = version + 1, updated_at = ? WHERE id = ? AND status = 'waiting' AND version = ?",
    p.id, JSON.stringify(st), first, t + DUEL_TURN_MS, t, d.id, d.version);
  if (changes(r) !== 1) throw new HttpError(409, 'Outro jogador entrou primeiro.');
  return json({ ok: true, duel: duelOut(await one(env, 'SELECT * FROM duels WHERE id = ?', d.id), p.id) });
}
async function duelGet(env, body) {
  const p = await socialAuth(env, body);
  let d = await one(env, 'SELECT * FROM duels WHERE id = ?', clean(body.id, 40));
  if (!d || (d.host !== p.id && d.guest !== p.id)) throw new HttpError(404, 'Duelo não encontrado.');
  d = await duelTimeout(env, d);
  return json({ ok: true, duel: duelOut(d, p.id) });
}
async function duelMove(env, body) {
  const p = await socialAuth(env, body);
  let d = await one(env, 'SELECT * FROM duels WHERE id = ?', clean(body.id, 40));
  if (!d || (d.host !== p.id && d.guest !== p.id)) throw new HttpError(404, 'Duelo não encontrado.');
  d = await duelTimeout(env, d);
  if (body.version != null && +body.version !== d.version) return json({ ok: true, stale: true, duel: duelOut(d, p.id) });
  if (d.status !== 'active') throw new HttpError(409, 'O duelo já terminou.');
  if (d.turn_player !== p.id) throw new HttpError(409, 'Ainda não é a tua vez.');
  const st = JSON.parse(d.state), me = p.id, opp = me === d.host ? d.guest : d.host;
  const err = duelAct(st, me, opp, clean(body.action, 12), clean(body.skill || body.item, 24));
  if (err) throw bad(err);
  st.f[me].miss = 0;
  const stmts = await advance(env, d, st, me);
  const r = await env.DB.batch(stmts);
  if (changes(r[0]) !== 1) return json({ ok: true, stale: true, duel: duelOut(await one(env, 'SELECT * FROM duels WHERE id = ?', d.id), p.id) });
  return json({ ok: true, duel: duelOut(await one(env, 'SELECT * FROM duels WHERE id = ?', d.id), p.id) });
}
async function duelInvite(env, body) {
  const p = await socialAuth(env, body);
  const d = await one(env, 'SELECT * FROM duels WHERE id = ?', clean(body.id, 40)), to = clean(body.to, 64);
  if (!d || d.host !== p.id) throw new HttpError(404, 'Sala não encontrada.');
  if (d.status !== 'waiting') throw new HttpError(409, 'O duelo já começou.');
  if (!(await areFriends(env, p.id, to))) throw bad('Só podes convidar amigos.');
  await run(env, 'UPDATE duels SET invited = ?, updated_at = ? WHERE id = ?', to, now(), d.id);
  return json({ ok: true, duel: duelOut(await one(env, 'SELECT * FROM duels WHERE id = ?', d.id), p.id) });
}
async function duelLeave(env, body) {
  const p = await socialAuth(env, body);
  const d = await one(env, 'SELECT * FROM duels WHERE id = ?', clean(body.id, 40));
  if (!d || (d.host !== p.id && d.guest !== p.id)) throw new HttpError(404, 'Duelo não encontrado.');
  if (d.status === 'waiting') {
    await run(env, "UPDATE duels SET status = 'cancelled', end_reason = 'closed', version = version + 1, updated_at = ? WHERE id = ? AND status = 'waiting'", now(), d.id);
  } else if (d.status === 'active') {
    const st = JSON.parse(d.state);
    addLog(st, st.f[p.id].name + ' desistiu do duelo.', 'sys', p.id);
    await env.DB.batch(await finishDuel(env, d, st, d.host === p.id ? d.guest : d.host, 'forfeit'));
  }
  return json({ ok: true, duel: duelOut(await one(env, 'SELECT * FROM duels WHERE id = ?', d.id), p.id) });
}
async function duelHistory(env, body) {
  const p = await socialAuth(env, body, false);
  const rows = await all(env, "SELECT d.id, d.winner, d.end_reason, d.updated_at, d.host, d.guest, h.name AS hname, g.name AS gname FROM duels d LEFT JOIN players h ON h.id = d.host LEFT JOIN players g ON g.id = d.guest WHERE (d.host = ? OR d.guest = ?) AND d.status = 'done' ORDER BY d.updated_at DESC LIMIT 20", p.id, p.id);
  return json({ ok: true, duels: rows.map((r) => ({ id: r.id, won: r.winner === p.id, reason: r.end_reason, at: r.updated_at, opponent: r.host === p.id ? r.gname : r.hname })) });
}

async function readJson(request) {
  if (request.method === 'GET') return {};
  const t = await request.text();
  if (t.length > 8000) throw bad('Pedido demasiado grande.');
  if (!t) return {};
  try { return JSON.parse(t); } catch (e) { throw bad('JSON inválido.'); }
}

export async function handle(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const m = request.method;
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'local';
  if (m === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (path === '/' || path === '/api') return json({ ok: true, service: 'Sistema · Loja de Cristais', version: VERSION, test: isTest(env) });
  try {
    if (Math.random() < 0.05) { const h = housekeeping(env); if (ctx && ctx.waitUntil) ctx.waitUntil(h); else await h; }
    const body = await readJson(request);
    let r;
    // ---- jogo ----
    if (m === 'GET' && path === '/api/config') return await getConfig(env);
    if (m === 'POST' && path === '/api/orders') return await createOrder(env, body, ip);
    if ((r = path.match(/^\/api\/orders\/(SIS-\d{6})$/)) && m === 'GET') return await orderStatus(env, r[1], url.searchParams.get('token') || request.headers.get('Authorization')?.replace(/^Bearer\s+/, ''));
    if ((r = path.match(/^\/api\/orders\/(SIS-\d{6})\/cancel$/)) && m === 'POST') return await playerCancel(env, r[1], body.token, ip);
    if (m === 'POST' && path === '/api/redeem') return await redeem(env, body, ip);
    if (m === 'POST' && path === '/api/player/sync') return await sync(env, body, ip);
    if (m === 'POST' && path === '/api/player/claim') return await claim(env, body, ip);
    // ---- social e duelos ----
    if (m === 'POST' && path === '/api/social/state') return await socialState(env, body);
    if (m === 'POST' && path === '/api/social/find') return await socialFind(env, body);
    if (m === 'POST' && path === '/api/social/friend/request') return await friendRequest(env, body);
    if (m === 'POST' && path === '/api/social/friend/respond') return await friendRespond(env, body);
    if (m === 'POST' && path === '/api/social/friend/remove') return await friendRemove(env, body);
    if (m === 'POST' && path === '/api/social/chat/history') return await chatHistory(env, body);
    if (m === 'POST' && path === '/api/social/chat/send') return await chatSend(env, body);
    if (m === 'POST' && path === '/api/duel/create') return await duelCreate(env, body);
    if (m === 'POST' && path === '/api/duel/join') return await duelJoin(env, body);
    if (m === 'POST' && path === '/api/duel/state') return await duelGet(env, body);
    if (m === 'POST' && path === '/api/duel/act') return await duelMove(env, body);
    if (m === 'POST' && path === '/api/duel/invite') return await duelInvite(env, body);
    if (m === 'POST' && path === '/api/duel/leave') return await duelLeave(env, body);
    if (m === 'POST' && path === '/api/duel/history') return await duelHistory(env, body);
    // ---- administração ----
    if (m === 'POST' && path === '/api/admin/auth/login') return await login(env, body, ip, request.headers.get('User-Agent'));
    if (path.startsWith('/api/admin/')) {
      const A = await requireAdmin(env, request);
      if (m === 'POST' && path === '/api/admin/auth/logout') return await logout(env, A, ip);
      if (m === 'GET' && path === '/api/admin/session') return json({ ok: true, admin: A.admin, expires_at: A.session.expires_at, test: isTest(env) });
      if (m === 'GET' && path === '/api/admin/sessions') return await listSessions(env, A);
      if (m === 'POST' && path === '/api/admin/sessions/revoke-others') return await revokeOthers(env, A, ip);
      if (m === 'GET' && path === '/api/admin/dashboard') return await dashboard(env, url);
      if (m === 'GET' && path === '/api/admin/orders') return await listOrders(env, url);
      if ((r = path.match(/^\/api\/admin\/orders\/(SIS-\d{6})$/)) && m === 'GET') return await orderDetail(env, r[1]);
      if ((r = path.match(/^\/api\/admin\/orders\/(SIS-\d{6})\/confirm-payment$/)) && m === 'POST') return await confirmPayment(env, A, r[1], body, ip);
      if ((r = path.match(/^\/api\/admin\/orders\/(SIS-\d{6})\/issue-code$/)) && m === 'POST') return await issueCode(env, A, r[1], request, body, ip, false);
      if ((r = path.match(/^\/api\/admin\/orders\/(SIS-\d{6})\/reissue-code$/)) && m === 'POST') return await issueCode(env, A, r[1], request, body, ip, true);
      if ((r = path.match(/^\/api\/admin\/orders\/(SIS-\d{6})\/cancel$/)) && m === 'POST') return await closeOrder(env, A, r[1], body, ip);
      if (m === 'GET' && path === '/api/admin/codes') return await listCodes(env, url);
      if (m === 'GET' && path === '/api/admin/stats') return await stats(env, url);
      if (m === 'GET' && path === '/api/admin/audit') return await listAudit(env, url);
      if (m === 'GET' && path === '/api/admin/packages') return await getPackages(env);
      if ((r = path.match(/^\/api\/admin\/packages\/([a-z0-9_]{1,32})$/)) && m === 'PUT') return await putPackage(env, A, r[1], body, ip);
      if (m === 'GET' && path === '/api/admin/settings') return await getSettings(env);
      if (m === 'GET' && path === '/api/admin/players') return await listPlayers(env, url);
      if ((r = path.match(/^\/api\/admin\/players\/([A-Za-z0-9_-]{8,64})$/)) && m === 'GET') return await playerDetail(env, r[1]);
      if ((r = path.match(/^\/api\/admin\/players\/([A-Za-z0-9_-]{8,64})\/ban$/)) && m === 'POST') return await banPlayer(env, A, r[1], body, ip);
      if ((r = path.match(/^\/api\/admin\/players\/([A-Za-z0-9_-]{8,64})\/unban$/)) && m === 'POST') return await unbanPlayer(env, A, r[1], body, ip);
      if ((r = path.match(/^\/api\/admin\/players\/([A-Za-z0-9_-]{8,64})\/note$/)) && m === 'PUT') return await notePlayer(env, A, r[1], body, ip);
      if (m === 'POST' && path === '/api/admin/grants') return await createGrant(env, A, request, body, ip);
      if (m === 'GET' && path === '/api/admin/grants') return await listGrants(env, url);
      if ((r = path.match(/^\/api\/admin\/grants\/(g[0-9a-f]{18})\/revoke$/)) && m === 'POST') return await revokeGrant(env, A, r[1], body, ip);
      if ((r = path.match(/^\/api\/admin\/orders\/(SIS-\d{6})\/deliver$/)) && m === 'POST') return await deliverOrder(env, A, r[1], request, ip);
      if (m === 'PUT' && path === '/api/admin/settings') return await putSettings(env, A, body, ip);
      if ((r = path.match(/^\/api\/admin\/players\/([A-Za-z0-9_-]{8,64})\/role$/)) && m === 'PUT') return await setRole(env, A, r[1], body, ip);
      if ((r = path.match(/^\/api\/admin\/players\/([A-Za-z0-9_-]{8,64})\/delete$/)) && m === 'POST') return await deletePlayer(env, A, r[1], body, ip);
      if (m === 'POST' && path === '/api/admin/notices') return await createNotice(env, A, request, body, ip);
      if (m === 'GET' && path === '/api/admin/notices') return await listNotices(env, url);
      if ((r = path.match(/^\/api\/admin\/notices\/(n[0-9a-f]{18})\/delete$/)) && m === 'POST') return await deleteNotice(env, A, r[1], ip);
    }
    return fail(404, 'Rota inexistente.');
  } catch (e) {
    if (e instanceof HttpError) return fail(e.status, e.message, e.extra);
    console.error('erro', e && e.stack || e);
    return fail(500, 'Erro interno. Consulta o estado antes de repetir a ação.');
  }
}

export default { fetch: handle };
