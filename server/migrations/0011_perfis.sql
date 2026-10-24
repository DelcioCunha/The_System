-- ==========================================================
-- SISTEMA · Perfis no Social
--  - foto de perfil (pequena, redonda no jogo) que só os amigos veem
--  - resumo do perfil enviado pelo jogo (título, conquistas, sombras, aparência)
-- ==========================================================
ALTER TABLE players ADD COLUMN photo TEXT;           -- data:image/jpeg;base64,… (até ~60 KB)
ALTER TABLE players ADD COLUMN photo_ver INTEGER NOT NULL DEFAULT 0;  -- muda a cada foto nova (o jogo guarda em cache)
ALTER TABLE players ADD COLUMN photo_at INTEGER;
ALTER TABLE players ADD COLUMN gender TEXT;          -- 'm' ou 'f' (aparência do avatar)
ALTER TABLE players ADD COLUMN profile TEXT;         -- JSON pequeno: título, conquistas, sombras, moldura…
