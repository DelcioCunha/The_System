-- ==========================================================
-- SISTEMA · Pacotes de moedas compradas com dinheiro real
-- Os pacotes passam a ter um tipo: 'crystals' (Cristais) ou 'coins' (moedas).
-- Nos pacotes de moedas, as colunas crystals e bonus guardam a quantidade de MOEDAS
-- (base e bónus). Os pedidos e os códigos guardam as moedas na coluna coins.
-- Os preços continuam editáveis no APK Administrativo (Pacotes e preços).
-- ==========================================================
ALTER TABLE packages ADD COLUMN kind TEXT NOT NULL DEFAULT 'crystals';
ALTER TABLE orders ADD COLUMN coins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE codes ADD COLUMN coins INTEGER NOT NULL DEFAULT 0;

INSERT OR IGNORE INTO packages (id, name, crystals, bonus, price_kz, active, sort, badge, kind) VALUES
  ('m_punhado', 'Punhado de Moedas',    1000,     0,   500, 1, 30, NULL, 'coins'),
  ('m_bolsa',   'Bolsa de Moedas',      2000,   200,  1000, 1, 31, NULL, 'coins'),
  ('m_saco',    'Saco de Moedas',       5000,  1000,  2500, 1, 32, 'Mais popular', 'coins'),
  ('m_cofre',   'Cofre de Moedas',     10000,  3000,  5000, 1, 33, NULL, 'coins'),
  ('m_tesouro', 'Tesouro de Moedas',   20000,  8000, 10000, 1, 34, NULL, 'coins'),
  ('m_monarca', 'Fortuna do Monarca',  40000, 20000, 20000, 1, 35, 'Melhor valor', 'coins');
