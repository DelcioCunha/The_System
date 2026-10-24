-- ==========================================================
-- SISTEMA · Acesso privado e bloqueio por aparelho
--  - cada aparelho que abre o jogo fica registado (só guardamos hashes dos identificadores)
--  - o administrador pode aprovar, bloquear e restaurar um aparelho
--  - modo privado: um aparelho novo só joga depois de aprovado (pedido ou código de acesso)
--  - um aparelho bloqueado continua bloqueado depois de desinstalar e instalar outra vez
-- ==========================================================

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,                -- d + hex (interno)
  code TEXT NOT NULL UNIQUE,          -- código do aparelho mostrado no jogo (APR-XXXX-XXXX)
  hw_hash TEXT,                       -- identificador do hardware (Widevine): sobrevive a reinstalações e a APKs novos
  aid_hash TEXT,                      -- ANDROID_ID: sobrevive a reinstalações do mesmo APK
  web_hash TEXT,                      -- versão web: identificador guardado no navegador (mais fraco)
  platform TEXT,
  model TEXT,
  os TEXT,
  app_version TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','approved','blocked')),
  approved_at INTEGER,
  approved_by TEXT,
  approved_via TEXT,                  -- admin | codigo | anterior (já jogava antes do modo privado)
  block_reason TEXT,
  blocked_at INTEGER,
  blocked_by TEXT,
  restored_at INTEGER,
  restored_by TEXT,
  restore_note TEXT,
  request_name TEXT,                  -- pedido de acesso: nome/contacto indicado pelo jogador
  request_msg TEXT,
  requested_at INTEGER,
  note TEXT,                          -- nota interna (o jogador não vê)
  player_id TEXT,                     -- último jogador visto neste aparelho
  player_name TEXT,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  checks INTEGER NOT NULL DEFAULT 0,
  test INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS devices_hw ON devices(hw_hash) WHERE hw_hash IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS devices_aid ON devices(aid_hash) WHERE aid_hash IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS devices_web ON devices(web_hash) WHERE web_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS devices_status ON devices(status, last_seen);

-- que contas jogaram em que aparelho
CREATE TABLE IF NOT EXISTS device_players (
  device_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  first_at INTEGER NOT NULL,
  last_at INTEGER NOT NULL,
  PRIMARY KEY (device_id, player_id)
);
CREATE INDEX IF NOT EXISTS device_players_p ON device_players(player_id);

-- códigos de acesso (convites): o administrador entrega a quem o contacta
CREATE TABLE IF NOT EXISTS access_codes (
  id TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL UNIQUE,
  hint TEXT NOT NULL,
  label TEXT,                         -- para quem é (só o administrador vê)
  max_uses INTEGER NOT NULL DEFAULT 1 CHECK (max_uses >= 1),
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER,
  revoked_at INTEGER
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('private_mode', '0');
INSERT OR IGNORE INTO settings (key, value) VALUES ('private_since', '0');
INSERT OR IGNORE INTO settings (key, value) VALUES ('offline_days', '15');
