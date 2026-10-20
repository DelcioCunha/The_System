-- ==========================================================
-- SISTEMA · Social: amizades, conversas e duelos entre jogadores
-- ==========================================================

-- Amizades e pedidos: uma linha por par (a < b, por ordem alfabética do ID)
CREATE TABLE IF NOT EXISTS friends (
  a TEXT NOT NULL,
  b TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','accepted')),
  requested_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  accepted_at INTEGER,
  PRIMARY KEY (a, b)
);
CREATE INDEX IF NOT EXISTS friends_b ON friends(b);

-- Mensagens de texto entre amigos
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender TEXT NOT NULL,
  receiver TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read_at INTEGER
);
CREATE INDEX IF NOT EXISTS messages_in ON messages(receiver, read_at);
CREATE INDEX IF NOT EXISTS messages_pair ON messages(sender, receiver, id);

-- Duelos 1 contra 1 (por turnos). O servidor decide cada golpe.
CREATE TABLE IF NOT EXISTS duels (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,          -- código da sala (6 caracteres) para partilhar
  host TEXT NOT NULL,
  guest TEXT,
  invited TEXT,                       -- amigo convidado (opcional)
  public INTEGER NOT NULL DEFAULT 1,  -- aparece na lista de salas abertas
  status TEXT NOT NULL CHECK (status IN ('waiting','active','done','cancelled')),
  state TEXT,                         -- JSON: lutadores, vida, mana, registo
  turn_player TEXT,
  turn_no INTEGER NOT NULL DEFAULT 0,
  turn_deadline INTEGER,
  winner TEXT,
  end_reason TEXT,
  version INTEGER NOT NULL DEFAULT 0, -- cada jogada sobe a versão (evita jogadas repetidas)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS duels_status ON duels(status, created_at);
CREATE INDEX IF NOT EXISTS duels_host ON duels(host, status);
CREATE INDEX IF NOT EXISTS duels_guest ON duels(guest, status);
CREATE INDEX IF NOT EXISTS duels_invited ON duels(invited, status);

-- registo de duelos de cada jogador e presença no social
ALTER TABLE players ADD COLUMN duel_wins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN duel_losses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN duel_rating INTEGER NOT NULL DEFAULT 1000;
ALTER TABLE players ADD COLUMN social_seen INTEGER;
