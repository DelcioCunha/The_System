"""Corta as folhas da personagem feminina.
Uso: python3 tools/slice_fem.py <classe|todas> C|K|A|B <folha.png> [níveis separados por vírgula]
  C = folha das 6 classes (3x2) → assets/classes/<classe>_f.webp
  K = 12 formas-chave (4x3), A = fases 7 a 46 (5x2), B = fases 52 a 97 (4x3) → assets/avatars_f/<classe>/<nível>.webp
Com a lista de níveis, uma folha incompleta (ex.: 4x2) usa esses níveis e essa grelha."""
import sys, os
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from slice import profile, cuts
from slice_evo import fit

ROOT = os.path.join(os.path.dirname(__file__), '..')
LV = {'K': [1, 4, 10, 19, 28, 40, 49, 58, 70, 79, 88, 100], 'A': [7, 13, 16, 22, 25, 31, 34, 37, 43, 46], 'B': [52, 55, 61, 64, 67, 73, 76, 82, 85, 91, 94, 97]}
GRID = {'K': (4, 3), 'A': (5, 2), 'B': (4, 3), 'C': (3, 2)}
CLASSES = ['guerreiro', 'assassino', 'mago', 'guardiao', 'arqueiro', 'invocador']


def main(cls, part, f, lv=None, grid=None):
    im = Image.open(f).convert('RGB')
    cols, rows = grid or GRID[part]
    xs, ys = cuts(profile(im, 'x'), cols), cuts(profile(im, 'y'), rows)
    tiles = []
    for r in range(rows):
        for c in range(cols):
            t = im.crop((xs[c], ys[r], xs[c + 1], ys[r + 1]))
            w, h = t.size; d = max(3, int(min(w, h) * (0.06 if part == 'C' else 0.045)))
            tiles.append(fit(t.crop((d, d, w - d, h - d))))
    if part == 'C':
        os.makedirs(os.path.join(ROOT, 'assets', 'classes'), exist_ok=True)
        for c, t in zip(CLASSES, tiles): t.save(os.path.join(ROOT, 'assets', 'classes', c + '_f.webp'), 'WEBP', quality=86, method=6)
        print('classes', len(tiles)); return
    levels = lv or LV[part]
    out = os.path.join(ROOT, 'assets', 'avatars_f', cls); os.makedirs(out, exist_ok=True)
    for l, t in zip(levels, tiles): t.save(os.path.join(out, '%d.webp' % l), 'WEBP', quality=86, method=6)
    print(cls, part, len(tiles))


if __name__ == '__main__':
    a = sys.argv[1:]
    lv = [int(x) for x in a[3].split(',')] if len(a) > 3 else None
    grid = tuple(int(x) for x in a[4].split('x')) if len(a) > 4 else None
    main(a[0], a[1], a[2], lv, grid)
