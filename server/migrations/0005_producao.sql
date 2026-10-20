-- ==========================================================
-- SISTEMA · Funcionamento total (produção)
--  - os jogadores e pedidos registados até agora deixam de ser "de teste"
--  - tipo de utilizador definido pelo administrador
--  - avisos da administração (para todos ou para um jogador)
--  - contas apagadas pelo administrador
-- ==========================================================

-- tudo o que entrou até hoje era gente real: deixa de contar como teste
UPDATE players SET test = 0;
UPDATE orders SET test = 0;
UPDATE grants SET test = 0;

-- tipo de utilizador: NULL = automático (Usuário, ou Usuário Premium depois de comprar Cristais)
-- valores: usuario, premium, doador, teste, admin, funcionario, parceria
ALTER TABLE players ADD COLUMN role TEXT;
ALTER TABLE players ADD COLUMN role_by TEXT;
ALTER TABLE players ADD COLUMN role_at INTEGER;

-- avisos da administração: aparecem na área de Avisos do jogo
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  player_id TEXT,                     -- NULL = para todos os jogadores
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'info' CHECK (kind IN ('info','importante','evento','manutencao')),
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  deleted_at INTEGER,
  deleted_by TEXT
);
CREATE INDEX IF NOT EXISTS notices_live ON notices(deleted_at, created_at);
CREATE INDEX IF NOT EXISTS notices_player ON notices(player_id, created_at);

-- contas apagadas: o ID não volta a registar-se e o jogo é avisado
CREATE TABLE IF NOT EXISTS deleted_players (
  id TEXT PRIMARY KEY,
  name TEXT,
  reason TEXT,
  deleted_at INTEGER NOT NULL,
  deleted_by TEXT NOT NULL
);
