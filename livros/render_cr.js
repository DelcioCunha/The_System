const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 794, height: 1123 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/claude/livro/cronicas.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
  await p.waitForFunction(() => window.__done, null, { timeout: 120000 });
  console.log('páginas', await p.evaluate(() => window.__done), 'erros', JSON.stringify(errs));
  const broken = await p.evaluate(() => Array.from(document.images).filter((im) => !im.naturalWidth).length);
  console.log('broken', broken);
  await p.pdf({ path: '/home/claude/livro/Cronicas-do-Sistema.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
