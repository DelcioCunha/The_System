"""Corta e prepara as imagens novas da Ala Premium.

Uso:
  python3 tools/slice_premium.py molduras <folha.png>        -> assets/frames/<id>.webp (fundo verde tirado, formato 3:4)
  python3 tools/slice_premium.py molduras-altas <folha.png>  -> o mesmo, para as molduras altas (9:17, retrato inteiro)
  python3 tools/slice_premium.py molduras-novas <folha.png>  -> as 6 molduras novas (3x2, formato alto)
  python3 tools/slice_premium.py itens-premium <folha.png>   -> os 8 itens premium novos (4x2)
  python3 tools/slice_premium.py cristal <imagem.png>        -> assets/ui/ui_crystal.webp (fundo verde tirado)
  python3 tools/slice_premium.py arena <1-10> <imagem.png>   -> assets/arenas/ar<n>.webp
  python3 tools/slice_premium.py guardioes <1-10> <folha.png> -> assets/bosses/ar<n>g1..9.webp
  python3 tools/slice_premium.py sombras <1-10> <folha.png>   -> assets/shadows/b<n>.webp (sombras dos 10 chefes do portão, 5x2)
  python3 tools/slice_premium.py sombras-campeoes <1|2> <folha.png> -> assets/shadows/ar1..5 ou ar6..10 (5x1)
  python3 tools/slice_premium.py sombras-arena <1-10> <folha.png>   -> assets/shadows/ar<n>g1..9 (3x3)

As molduras e o cristal são gerados sobre verde puro (#00FF00): o verde passa a transparente.
"""
import sys, os
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from slice import profile, cuts, trim

ROOT = os.path.join(os.path.dirname(__file__), '..')
FRAMES2 = ['fr_mare', 'fr_jardim', 'fr_relogio', 'fr_espelho', 'fr_runas', 'fr_aurora']
FRAMES = ['fr_sistema', 'fr_cacador', 'fr_carrasco', 'fr_gelo', 'fr_tempestade', 'fr_sombra', 'fr_fenix', 'fr_monarca', 'fr_primeiro']


def key_green(im):
    """Verde puro -> transparente, com remoção do reflexo verde nas bordas."""
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            m = max(r, b)
            if g > 120 and g > m * 1.6:
                px[x, y] = (r, g, b, 0)
            elif g > m + 20:
                # meio-tom da borda: tira o verde e deixa semitransparente
                alpha = max(0, min(255, int(255 - (g - m) * 2.2)))
                px[x, y] = (r, m, b, min(a, alpha))
    return im


def key_green_strict(im):
    """Para molduras que também têm verde (ex.: Jardim): só o verde claro do fundo passa a transparente."""
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r < 110 and b < 110 and g > r + 60 and g > b + 60:
                if g >= 200:
                    px[x, y] = (r, g, b, 0)
                elif g >= 165:
                    k = (g - 165) / 35.0
                    px[x, y] = (r, int(g - (g - max(r, b)) * k), b, int(255 * (1 - k)))
    return im


GREEN_FRAMES = {'fr_jardim'}


def crop_alpha(im, pad=2):
    box = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if not box:
        return im
    l, t, r, b = box
    return im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))


def main_run(mask_line, gap=4):
    """Maior sequência de linhas/colunas com conteúdo (ignora restos da moldura vizinha)."""
    best, cur, start, holes = (0, 0), 0, None, 0
    for i, v in enumerate(mask_line + [False]):
        if v:
            if start is None: start = i
            holes = 0
        elif start is not None:
            holes += 1
            if holes > gap or i == len(mask_line):
                end = i - holes + 1
                if end - start > best[1] - best[0]: best = (start, end)
                start, holes = None, 0
    return best


def frame_only(im):
    a = im.getchannel('A').point(lambda v: 255 if v > 24 else 0)
    w, h = im.size
    px = a.load()
    rows = [any(px[x, y] for x in range(0, w, 2)) for y in range(h)]
    cols = [any(px[x, y] for y in range(0, h, 2)) for x in range(w)]
    t, b = main_run(rows)
    l, r = main_run(cols)
    return im.crop((l, t, r, b))


# Molduras normalizadas: a abertura fica sempre no mesmo sítio, para encaixar no retrato.
# Formato 3:4 (molduras antigas): o retrato ocupa 62% x 66% da imagem.
# Formato alto (molduras altas, retrato inteiro, abertura 4:9): o retrato ocupa 62% x 70% da imagem.
# A abertura é 97% do retrato (a moldura cobre a borda). Deteta o formato pela abertura.
def frame_geometry(tall):
    fw = 480
    if tall:
        av_w = fw * 0.62; av_h = av_w * 9 / 4; fh = round(av_h / 0.70)
    else:
        av_w = fw * 0.62; av_h = av_w * 4 / 3; fh = round(av_h / 0.66)
    return fw, fh, av_w * 0.97, av_h * 0.97


def hole_box(im):
    """Abertura = zona transparente ligada ao centro (contorna decorações que entram na abertura)."""
    from PIL import ImageDraw
    m = im.getchannel('A').point(lambda v: 255 if v > 60 else 0).convert('L')
    w, h = m.size
    ImageDraw.floodfill(m, (w // 2, h // 2), 128)
    return m.point(lambda v: 255 if v == 128 else 0).getbbox()


def normalize_frame(im, tall=False):
    l, t, r, b = hole_box(im)
    FW, FH, HOLE_W, HOLE_H = frame_geometry(tall)
    sx, sy = HOLE_W / (r - l), HOLE_H / (b - t)
    # nunca deixar a moldura passar das bordas da imagem (fumo ou chamas dentro da abertura enganam a medida)
    sx = min(sx, FW * 0.985 / im.width)
    big = im.resize((round(im.width * sx), round(im.height * sy)), Image.LANCZOS)
    out = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    ox = round(FW / 2 - (l + r) / 2 * sx)
    oy = round((FH - HOLE_H) / 2 - t * sy)
    out.paste(big, (ox, oy), big)
    return out


def save(im, path, max_w=None):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if max_w and im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(path, 'WEBP', quality=90, method=6)
    print(os.path.relpath(path, ROOT), im.size)


def equal_cells(im, cols, rows):
    w, h = im.size
    for r in range(rows):
        for c in range(cols):
            yield im.crop((w * c // cols, h * r // rows, w * (c + 1) // cols, h * (r + 1) // rows))


def main(a):
    mode = a[0]
    if mode in ('molduras', 'molduras-altas'):
        tall = mode == 'molduras-altas'
        im = Image.open(a[1]).convert('RGB')
        for fid, cell in zip(FRAMES, equal_cells(im, 3, 3)):
            save(normalize_frame(frame_only(key_green(cell)), tall), os.path.join(ROOT, 'assets', 'frames', fid + '.webp'))
    elif mode == 'molduras-novas':
        im = Image.open(a[1]).convert('RGB')
        for fid, cell in zip(FRAMES2, equal_cells(im, 3, 2)):
            save(normalize_frame(frame_only((key_green_strict if fid in GREEN_FRAMES else key_green)(cell)), True), os.path.join(ROOT, 'assets', 'frames', fid + '.webp'))
    elif mode == 'itens-premium':
        # folha 4x2 dos itens premium novos -> assets/items/<id>.webp
        ids = ['pr_ampulheta', 'pr_espinho', 'pr_executor', 'pr_egide', 'pr_ruptura', 'pr_eco', 'pr_foco', 'pr_trevo']
        im = Image.open(a[1]).convert('RGB')
        xs, ys = cuts(profile(im, 'x'), 4), cuts(profile(im, 'y'), 2)
        k = 0
        for r in range(2):
            for c in range(4):
                t = trim(im.crop((xs[c], ys[r], xs[c + 1], ys[r + 1]))); w, h = t.size; s2 = min(w, h)
                t = t.crop(((w - s2) // 2, (h - s2) // 2, (w - s2) // 2 + s2, (h - s2) // 2 + s2)); d = int(s2 * 0.06)
                save(t.crop((d, d, s2 - d, s2 - d)).resize((192, 192), Image.LANCZOS), os.path.join(ROOT, 'assets', 'items', ids[k] + '.webp')); k += 1
    elif mode == 'cristal':
        im = crop_alpha(key_green(Image.open(a[1])))
        s = max(im.size)
        sq = Image.new('RGBA', (s, s), (0, 0, 0, 0))
        sq.paste(im, ((s - im.width) // 2, (s - im.height) // 2))
        save(sq.resize((128, 128), Image.LANCZOS), os.path.join(ROOT, 'assets', 'ui', 'ui_crystal.webp'))
    elif mode == 'arena':
        n = int(a[1])
        im = Image.open(a[2]).convert('RGB')
        save(im, os.path.join(ROOT, 'assets', 'arenas', 'ar%d.webp' % n), 1280)
    elif mode == 'guardioes':
        n = int(a[1])
        im = Image.open(a[2]).convert('RGB')
        xs, ys = cuts(profile(im, 'x'), 3), cuts(profile(im, 'y'), 3)
        k = 0
        for r in range(3):
            for c in range(3):
                k += 1
                tile = trim(im.crop((xs[c], ys[r], xs[c + 1], ys[r + 1])))
                w, h = tile.size; d = int(w * 0.02)
                tile = tile.crop((d, d, w - d, h - d))  # tira o resto da borda néon da carta
                save(tile, os.path.join(ROOT, 'assets', 'bosses', 'ar%dg%d.webp' % (n, k)), 480)
    elif mode == 'sombras':
        g = int(a[1])
        im = Image.open(a[2]).convert('RGB')
        xs, ys = cuts(profile(im, 'x'), 5), cuts(profile(im, 'y'), 2)
        k = 0
        for r in range(2):
            for c in range(5):
                k += 1
                t = trim(im.crop((xs[c], ys[r], xs[c + 1], ys[r + 1]))); w, h = t.size; d = max(3, int(min(w, h) * 0.02))
                t = t.crop((d, d, w - d, h - d))  # painel inteiro (vertical), sem a borda
                save(t, os.path.join(ROOT, 'assets', 'shadows', 'b%d.webp' % ((g - 1) * 10 + k)), 360)
    elif mode in ('sombras-campeoes', 'sombras-arena'):
        n = int(a[1])
        im = Image.open(a[2]).convert('RGB')
        cols, rows = (5, 1) if mode == 'sombras-campeoes' else (3, 3)
        xs, ys = cuts(profile(im, 'x'), cols), cuts(profile(im, 'y'), rows)
        k = 0
        for r in range(rows):
            for c in range(cols):
                k += 1
                t = trim(im.crop((xs[c], ys[r], xs[c + 1], ys[r + 1]))); w, h = t.size; d = max(3, int(min(w, h) * 0.02))
                name = ('ar%d' % ((n - 1) * 5 + k)) if mode == 'sombras-campeoes' else ('ar%dg%d' % (n, k))
                save(t.crop((d, d, w - d, h - d)), os.path.join(ROOT, 'assets', 'shadows', name + '.webp'), 360)
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1:])
