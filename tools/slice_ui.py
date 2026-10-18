"""Corta folhas de ícones. Uso: python3 tools/slice_ui.py <manifesto.json> <pasta_saida> <tamanho> <inset> folha1.png folha2.png ..."""
import sys, json, os
sys.path.insert(0, os.path.dirname(__file__))
from slice import profile, cuts, trim
from PIL import Image
man, outdir, size, inset = json.load(open(sys.argv[1])), sys.argv[2], int(sys.argv[3]), float(sys.argv[4])
os.makedirs(outdir, exist_ok=True)
for sh, f in zip(man, sys.argv[5:]):
    im = Image.open(f).convert('RGB')
    xs, ys = cuts(profile(im, 'x'), sh['cols']), cuts(profile(im, 'y'), sh['rows'])
    k = 0
    for r in range(sh['rows']):
        for c in range(sh['cols']):
            t = trim(im.crop((xs[c], ys[r], xs[c + 1], ys[r + 1])))
            w, h = t.size; s = min(w, h)
            t = t.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
            d = int(s * inset)
            t.crop((d, d, s - d, s - d)).resize((size, size), Image.LANCZOS).save(os.path.join(outdir, sh['ids'][k] + '.webp'), 'WEBP', quality=88, method=6)
            k += 1
    print(sh['title'], k)
