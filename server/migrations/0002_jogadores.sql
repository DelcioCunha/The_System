-- ==========================================================
-- SISTEMA · Gestão de jogadores, banimentos e ofertas
-- ==========================================================

-- Jogadores: cada jogo regista-se com o seu ID de Jogador e um segredo próprio
-- (só guardamos o hash). Os números (nível, cristais…) são o que o jogo reporta.
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,                -- SIS-XXXXXX (ID de Jogador)
  token_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  cls TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  crystals INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  stats TEXT,                         -- JSON pequeno: missões, chefes, sequência, integridade…
  app_version TEXT,
  platform TEXT,
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  syncs INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','banned')),
  ban_reason TEXT,
  ban_until INTEGER,                  -- NULL = permanente (conta desativada)
  banned_at INTEGER,
  banned_by TEXT,
  note TEXT,                          -- nota interna do administrador (o jogador não vê)
  test INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS players_seen ON players(last_seen);
CREATE INDEX IF NOT EXISTS players_name ON players(name);

-- Ofertas e entregas: Cristais/moedas enviados pelo administrador.
--   mode 'code' → código de resgate (mostrado uma vez); pode ficar preso a um jogador ou servir a qualquer um
--   mode 'auto' → entrega automática: o jogo recebe-a sozinho na próxima sincronização
--   order_id    → entrega automática de uma compra (em vez de código)
CREATE TABLE IF NOT EXISTS grants (
  id TEXT PRIMARY KEY,
  player_id TEXT,
  order_id TEXT,
  crystals INTEGER NOT NULL DEFAULT 0 CHECK (crystals >= 0),
  coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
  reason TEXT NOT NULL,
  message TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('code','auto')),
  code_hash TEXT UNIQUE,
  hint TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','claimed','revoked')),
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  claimed_at INTEGER,
  claimed_player TEXT,
  revoked_at INTEGER,
  revoke_reason TEXT,
  test INTEGER NOT NULL DEFAULT 0,
  CHECK (crystals > 0 OR coins > 0)
);
CREATE INDEX IF NOT EXISTS grants_player ON grants(player_id, status);
-- uma compra só pode ter uma entrega automática viva
CREATE UNIQUE INDEX IF NOT EXISTS grants_one_order ON grants(order_id) WHERE order_id IS NOT NULL AND status != 'revoked';

-- como foi entregue a compra: 'code' (código) ou 'auto' (entrega automática)
ALTER TABLE orders ADD COLUMN delivery TEXT;
