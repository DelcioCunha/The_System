"""Corta as folhas de itens usando tools/item-sheets.json.
Uso: python3 tools/slice_items.py folha1.png folha2.png ... (pela ordem da página)
     python3 tools/slice_items.py --from=15 folha15.png folha16.png ... (começa na folha 15)"""
import sys, json, os
sys.path.insert(0, os.path.dirname(__file__))
from slice import profile, cuts, trim
from PIL import Image

INSET = 0.085  # retira a moldura néon dentro de cada bloco
sheets = json.load(open(os.path.join(os.path.dirname(__file__), 'item-sheets.json')))
files = sys.argv[1:]
if files and files[0].startswith('--from='):
    sheets = sheets[int(files[0].split('=')[1]) - 1:]
    files = files[1:]
assert len(files) <= len(sheets)
for sh, f in zip(sheets, files):
    im = Image.open(f).convert('RGB')
    xs, ys = cuts(profile(im, 'x'), sh['cols']), cuts(profile(im, 'y'), sh['rows'])
    k = 0
    for r in range(sh['rows']):
        for c in range(sh['cols']):
            t = trim(im.crop((xs[c], ys[r], xs[c + 1], ys[r + 1])))
            w, h = t.size
            s = min(w, h)
            t = t.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
            d = int(s * INSET)
            t = t.crop((d, d, s - d, s - d)).resize((192, 192), Image.LANCZOS)
            os.makedirs('assets/items', exist_ok=True)
            t.save('assets/items/%s.webp' % sh['ids'][k], 'WEBP', quality=85, method=6)
            k += 1
    print(sh['title'], k)
