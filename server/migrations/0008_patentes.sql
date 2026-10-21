-- ==========================================================
-- SISTEMA · Patentes dos duelos
-- Pontos de patente: +1 por vitória, -1 por derrota (nunca abaixo de 0).
-- A cada 5 pontos sobe-se uma patente; aos 200 chega-se a Monarca dos Duelos.
-- Os jogadores que já duelaram começam com (vitórias - derrotas).
-- ==========================================================
ALTER TABLE players ADD COLUMN duel_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN duel_best INTEGER NOT NULL DEFAULT 0;
UPDATE players SET duel_points = MAX(0, duel_wins - duel_losses), duel_best = MAX(0, duel_wins - duel_losses);
