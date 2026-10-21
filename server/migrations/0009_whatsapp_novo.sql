-- Novo número de WhatsApp para as compras (Cristais e moedas).
-- Só troca o número antigo; um número mudado à mão no APK Admin não é substituído.
UPDATE settings SET value = '244947976103' WHERE key = 'whatsapp' AND value IN ('', '244958313378');
