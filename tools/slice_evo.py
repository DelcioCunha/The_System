"""Corta as folhas das fases intermédias das evoluções (aparência a cada 3 níveis).
Uso: python3 tools/slice_evo.py <classe> A|B <folha.png>
  A = folha 5x2 (níveis 7 a 46), B = folha 4x3 (níveis 52 a 97).
Cada painel fica no mesmo formato dos avatares (240x436); painéis mais estreitos
recebem nas laterais o próprio fundo, esbatido."""
import sys, os
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(__file__))
from slice import profile, cuts

ROOT = os.path.join(os.path.dirname(__file__), '..')
LV = {'A': [7, 13, 16, 22, 25, 31, 34, 37, 43, 46], 'B': [52, 55, 61, 64, 67, 73, 76, 82, 85, 91, 94, 97]}
GRID = {'A': (5, 2), 'B': (4, 3)}
W, H = 240, 436


def fit(tile):
    w, h = tile.size
    if w / h > W / H:  # largo demais: corta os lados
        nw = round(h * W / H); tile = tile.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        return tile.resize((W, H), Image.LANCZOS)
    tile = tile.crop((0, int(h * .06), w, h - int(h * .02))); w, h = tile.size  # menos céu por cima: figura maior
    s = H / h; fg = tile.resize((max(1, round(w * s)), H), Image.LANCZOS)
    bg = tile.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(14))
    bg = Image.eval(bg, lambda v: int(v * .55))
    bg.paste(fg, ((W - fg.width) // 2, 0))
    return bg


def main(cls, part, f):
    im = Image.open(f).convert('RGB')
    cols, rows = GRID[part]
    xs, ys = cuts(profile(im, 'x'), cols), cuts(profile(im, 'y'), rows)
    k = 0
    for r in range(rows):
        for c in range(cols):
            t = im.crop((xs[c], ys[r], xs[c + 1], ys[r + 1]))
            w, h = t.size; d = max(3, int(min(w, h) * 0.025))
            t = t.crop((d, d, w - d, h - d))
            out = os.path.join(ROOT, 'assets', 'avatars', cls, '%d.webp' % LV[part][k])
            fit(t).save(out, 'WEBP', quality=86, method=6); k += 1
    print(cls, part, k)


if __name__ == '__main__':
    main(*sys.argv[1:4])
