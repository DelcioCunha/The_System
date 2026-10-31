/* ==========================================================
   SITE OFICIAL DO SISTEMA · configuração
   - o preço e o link do WhatsApp vêm do servidor (definidos no painel, em Aparelhos)
   - estes valores só são usados se o servidor não responder
   - o APK fica em site/download/sistema.apk (troca o ficheiro para publicar uma versão nova)
   ========================================================== */
window.SITE_CONFIG = {
  api: 'https://sistema-loja.delciobentocunha007.workers.dev',
  price_kz: 5000,          // preço da ativação (Kz), se o servidor não responder
  price_old_kz: 7500,      // preço normal riscado (0 = sem promoção)
  whatsapp: '244947976103', // número com indicativo (só é usado se o servidor não responder)
  apk: 'download/sistema.apk',
  apk_version: '1.0',
  apk_size: '',            // ex.: '48 MB' (opcional)
  min_android: 'Android 6 ou superior'
};
