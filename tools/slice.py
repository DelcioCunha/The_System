"""Corta uma folha em grelha nos seus blocos.
Uso: python3 tools/slice.py <imagem> <colunas> <linhas> <saida1> <saida2> ...
Deteta as margens escuras entre os blocos; se não as encontrar, divide por igual."""
import sys
from PIL import Image

def profile(im, axis):
    g = im.convert('L')
    w, h = g.size
    px = g.load()
    if axis == 'x':
        return [sum(px[x, y] for y in range(0, h, 3)) / (h / 3) for x in range(w)]
    return [sum(px[x, y] for x in range(0, w, 3)) / (w / 3) for y in range(h)]

def cuts(prof, n):
    """Encontra n-1 vales escuros perto das divisões iguais."""
    L = len(prof)
    out = [0]
    for k in range(1, n):
        c = int(L * k / n)
        win = int(L / n * 0.18)
        seg = range(max(1, c - win), min(L - 1, c + win))
        dark = min(seg, key=lambda i: sum(prof[max(0, i - 2):i + 3]))
        out.append(dark)
    out.append(L)
    return out

def trim(tile):
    """Retira a moldura brilhante e o fundo escuro à volta do painel."""
    w, h = tile.size
    g = tile.convert('L').load()
    def row_dark(y): return sum(g[x, y] for x in range(0, w, 2)) / (w / 2) < 18
    def col_dark(x): return sum(g[x, y] for y in range(0, h, 2)) / (h / 2) < 18
    t, b, l, r = 0, h - 1, 0, w - 1
    while t < h // 4 and row_dark(t): t += 1
    while b > h * 3 // 4 and row_dark(b): b -= 1
    while l < w // 4 and col_dark(l): l += 1
    while r > w * 3 // 4 and col_dark(r): r -= 1
    pad = max(6, int(min(w, h) * 0.025))  # moldura néon
    return tile.crop((l + pad, t + pad, r - pad + 1, b - pad + 1))

if __name__ == '__main__':
    src, cols, rows = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    outs = sys.argv[4:]
    assert len(outs) == cols * rows, 'precisa de %d nomes de saída' % (cols * rows)
    im = Image.open(src).convert('RGB')
    xs, ys = cuts(profile(im, 'x'), cols), cuts(profile(im, 'y'), rows)
    i = 0
    for r in range(rows):
        for c in range(cols):
            tile = trim(im.crop((xs[c], ys[r], xs[c + 1], ys[r + 1])))
            name = outs[i]; i += 1
            if name == '-': continue
            if tile.width > 480:
                tile = tile.resize((480, round(tile.height * 480 / tile.width)), Image.LANCZOS)
            import os; os.makedirs(os.path.dirname(name) or '.', exist_ok=True)
            tile.save(name, 'WEBP', quality=86, method=6)
            print(name, tile.size)
