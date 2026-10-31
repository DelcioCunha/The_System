-- Presentes entre amigos e emotes de duelo
-- grants: Cristais comprados para outro jogador (quem ofereceu)
ALTER TABLE grants ADD COLUMN from_id TEXT;
ALTER TABLE grants ADD COLUMN from_name TEXT;
-- orders: compra de Cristais para oferecer a um amigo
ALTER TABLE orders ADD COLUMN gift_to TEXT;
ALTER TABLE orders ADD COLUMN gift_name TEXT;
-- presentes de aparência entre amigos, pagos com os Cristais de quem oferece
CREATE TABLE IF NOT EXISTS gifts (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  from_id TEXT NOT NULL,
  from_name TEXT,
  item TEXT NOT NULL,
  crystals INTEGER NOT NULL DEFAULT 0 CHECK (crystals >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending','claimed','revoked')),
  created_at INTEGER NOT NULL,
  claimed_at INTEGER,
  test INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS gifts_player ON gifts(player_id, status);
CREATE INDEX IF NOT EXISTS gifts_from ON gifts(from_id, created_at);
-- duels: últimas frases trocadas no duelo (separadas do estado para não atrasar as jogadas)
ALTER TABLE duels ADD COLUMN emotes TEXT;
