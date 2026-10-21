const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage();
  await p.goto('file:///home/claude/livro/lore.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const over = await p.evaluate(() => Array.from(document.querySelectorAll('.page')).map((pg, i) => { const inn = pg.querySelector('.inner'); return inn.scrollHeight > inn.clientHeight + 2 ? (i + 1) + ':' + (inn.scrollHeight - inn.clientHeight) : null; }).filter(Boolean));
  const broken = await p.evaluate(() => Array.from(document.images).filter((im) => !im.naturalWidth).map((im) => im.src.split('/').slice(-2).join('/')));
  console.log('OVERFLOW', JSON.stringify(over)); console.log('BROKEN', JSON.stringify(broken));
  await p.pdf({ path: '/home/claude/livro/Cronicas-do-Sistema.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
