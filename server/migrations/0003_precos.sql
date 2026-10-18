-- ==========================================================
-- SISTEMA · Tabela de preços dos Cristais (análise de outubro de 2026)
-- Referência: ~10 Kz por Cristal no pacote mais pequeno, descendo até ~7 Kz nos grandes (bónus crescente).
-- Os preços continuam editáveis no APK Administrativo (Pacotes e preços).
-- ==========================================================
ALTER TABLE packages ADD COLUMN badge TEXT;

-- os pacotes antigos (sem preço) saem da loja; os pedidos já feitos guardam o nome e o preço da altura
UPDATE packages SET active = 0 WHERE id IN ('c100', 'c250', 'c600', 'c1300') AND price_kz IS NULL;

INSERT OR IGNORE INTO packages (id, name, crystals, bonus, price_kz, active, sort, badge) VALUES
  ('p_punhado', 'Punhado de Cristais',    60,   0,   600, 1, 10, NULL),
  ('p_bolsa',   'Bolsa de Cristais',     120,  10,  1200, 1, 11, NULL),
  ('p_saco',    'Saco de Cristais',      250,  30,  2500, 1, 12, 'Mais popular'),
  ('p_cofre',   'Cofre de Cristais',     500, 100,  5000, 1, 13, NULL),
  ('p_tesouro', 'Tesouro de Cristais',  1000, 300, 10000, 1, 14, NULL),
  ('p_monarca', 'Tesouro do Monarca',   2000, 800, 20000, 1, 15, 'Melhor valor');
