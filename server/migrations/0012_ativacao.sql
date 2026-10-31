-- ==========================================================
-- SISTEMA · Código de ativação e jogador legalizado
--  - o APK é vendido: antes de jogar, cada aparelho introduz um código de ativação (gerado no painel)
--  - quem ativa com código (ou é aprovado pelo administrador) fica marcado como jogador legalizado
--  - o preço da ativação é definido no painel e aparece no jogo e no site
-- ==========================================================
ALTER TABLE players ADD COLUMN legal_at INTEGER;
ALTER TABLE players ADD COLUMN legal_via TEXT;      -- codigo | admin
ALTER TABLE players ADD COLUMN legal_code TEXT;     -- últimos 4 caracteres do código de ativação
ALTER TABLE players ADD COLUMN legal_by TEXT;
CREATE INDEX IF NOT EXISTS players_legal ON players(legal_at);

INSERT OR IGNORE INTO settings (key, value) VALUES ('activation_price', '5000');
INSERT OR IGNORE INTO settings (key, value) VALUES ('activation_price_old', '7500');
