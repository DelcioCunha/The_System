"""Versões leves das imagens que vão embutidas na pré-visualização (dist/pv/...).
Uso: python3 tools/preview_cache.py   (corre antes de node build.js quando há imagens novas)"""
import os, json
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..')
pub = set(json.load(open(os.path.join(ROOT, 'tools', 'preview-published.json'))))
def out(rel): p = os.path.join(ROOT, 'dist', 'pv', rel); os.makedirs(os.path.dirname(p), exist_ok=True); return p
n = 0
for c in os.listdir(os.path.join(ROOT, 'assets', 'avatars')):
    for f in os.listdir(os.path.join(ROOT, 'assets', 'avatars', c)):
        rel = 'avatars/%s/%s' % (c, f)
        if rel in pub: continue
        im = Image.open(os.path.join(ROOT, 'assets', rel)).convert('RGB').resize((180, 327), Image.LANCZOS)
        im.save(out(rel), 'WEBP', quality=62, method=6); n += 1
for f in os.listdir(os.path.join(ROOT, 'assets', 'items')):
    rel = 'items/' + f
    if rel in pub: continue
    im = Image.open(os.path.join(ROOT, 'assets', rel)).convert('RGB').resize((128, 128), Image.LANCZOS)
    im.save(out(rel), 'WEBP', quality=72, method=6); n += 1
for f in os.listdir(os.path.join(ROOT, 'assets', 'arenas')):
    rel = 'arenas/' + f
    im = Image.open(os.path.join(ROOT, 'assets', rel)).convert('RGB').resize((800, 450), Image.LANCZOS)
    im.save(out(rel), 'WEBP', quality=60, method=6); n += 1
sd = os.path.join(ROOT, 'assets', 'shadows')
for f in (os.listdir(sd) if os.path.isdir(sd) else []):
    rel = 'shadows/' + f
    im = Image.open(os.path.join(ROOT, 'assets', rel)).convert('RGB')
    im = im.resize((min(240, im.width), round(im.height * min(240, im.width) / im.width)), Image.LANCZOS)
    im.save(out(rel), 'WEBP', quality=64, method=6); n += 1
for f in os.listdir(os.path.join(ROOT, 'assets', 'trophies')):
    rel = 'trophies/' + f
    im = Image.open(os.path.join(ROOT, 'assets', rel)).convert('RGB').resize((128, 128), Image.LANCZOS)
    im.save(out(rel), 'WEBP', quality=70, method=6); n += 1
print(n, 'imagens leves em dist/pv')
