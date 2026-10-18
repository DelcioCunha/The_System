-- ==========================================================
-- SISTEMA · Loja de Cristais · esquema inicial (Cloudflare D1 / SQLite)
-- O servidor é a autoridade: pedidos, pagamentos confirmados, códigos e auditoria.
-- ==========================================================

-- Pacotes à venda. O preço vive AQUI (no servidor), nunca no jogo nem no APK.
-- Um pacote só aparece no jogo quando está ativo e tem preço.
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  crystals INTEGER NOT NULL CHECK (crystals > 0),
  bonus INTEGER NOT NULL DEFAULT 0 CHECK (bonus >= 0),
  price_kz INTEGER CHECK (price_kz IS NULL OR price_kz > 0),
  active INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER
);

-- Pedidos. Estados: pending_payment → payment_confirmed → code_issued → redeemed
--                    (ou cancelled / refunded)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,                -- SIS-000142
  seq INTEGER NOT NULL UNIQUE,
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  crystals INTEGER NOT NULL,          -- cristais totais (com bónus) fixados no momento do pedido
  price_kz INTEGER NOT NULL,          -- preço fixado no momento do pedido
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  client_token_hash TEXT NOT NULL,    -- o jogo consulta o estado com este token (só guardamos o hash)
  status TEXT NOT NULL CHECK (status IN ('pending_payment','payment_confirmed','code_issued','redeemed','cancelled','refunded')),
  payment_ref TEXT,
  payment_note TEXT,
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER,
  confirmed_by TEXT,
  code_issued_at INTEGER,
  redeemed_at INTEGER,
  closed_at INTEGER,
  close_reason TEXT,
  test INTEGER NOT NULL DEFAULT 0     -- 1 = criado em ambiente de teste
);
CREATE INDEX IF NOT EXISTS orders_status ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS orders_player ON orders(player_id, created_at);

-- Códigos de resgate. Só guardamos o HASH do código; o valor completo é mostrado uma única vez.
CREATE TABLE IF NOT EXISTS codes (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  code_hash TEXT NOT NULL UNIQUE,
  hint TEXT NOT NULL,                 -- últimos 4 caracteres, para identificar sem revelar
  crystals INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','redeemed','revoked')),
  issued_at INTEGER NOT NULL,
  issued_by TEXT NOT NULL,
  redeemed_at INTEGER,
  redeemed_player TEXT,
  redemption_id TEXT,
  revoked_at INTEGER,
  revoke_reason TEXT
);
-- Um pedido nunca tem dois códigos vivos ao mesmo tempo.
CREATE UNIQUE INDEX IF NOT EXISTS codes_one_live ON codes(order_id) WHERE status != 'revoked';

-- Sessões do administrador (só o hash do token).
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  admin TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0,
  device TEXT
);

-- Auditoria: quem, o quê, em que pedido, quando e com que resultado.
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  result TEXT NOT NULL,
  detail TEXT,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS audit_at ON audit(at);
CREATE INDEX IF NOT EXISTS audit_target ON audit(target, at);

-- Idempotência: repetir a mesma ação (mesma chave) devolve o mesmo resultado.
CREATE TABLE IF NOT EXISTS idem (
  key TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  response TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

-- Limites de tentativas (login, resgate, pedidos).
CREATE TABLE IF NOT EXISTS hits (
  k TEXT PRIMARY KEY,
  n INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS counters (
  name TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);
INSERT OR IGNORE INTO counters (name, value) VALUES ('order', 0);

-- Definições editáveis no APK administrativo.
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('whatsapp', ''),
  ('payment_info', 'Depois de enviares a mensagem, recebes no WhatsApp as instruções de pagamento por MULTICAIXA Express. Nunca te pediremos o PIN nem códigos de confirmação do banco.'),
  ('shop_open', '1');

-- Pacotes iniciais: ficam INATIVOS e SEM PREÇO até os definires no APK administrativo.
INSERT OR IGNORE INTO packages (id, name, crystals, bonus, price_kz, active, sort) VALUES
  ('c100',  'Bolsa de Cristais',     100,   0, NULL, 0, 1),
  ('c250',  'Saco de Cristais',      250,   0, NULL, 0, 2),
  ('c600',  'Cofre de Cristais',     550,  50, NULL, 0, 3),
  ('c1300', 'Tesouro de Cristais',  1100, 200, NULL, 0, 4);
