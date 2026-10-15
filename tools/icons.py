"""Gera ícones e ecrã de arranque Android: python3 tools/icons.py"""
import os, glob
from PIL import Image, ImageDraw, ImageFilter

RES = 'android/app/src/main/res'
BG = (6, 10, 20, 255)
GLOW = (111, 214, 255, 255)

def emblem(size, transparent=False, scale=1.0):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0) if transparent else BG)
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    c = size / 2
    r = size * 0.34 * scale
    w = max(2, int(size * 0.035 * scale))
    diamond = [(c, c - r), (c + r, c), (c, c + r), (c - r, c)]
    d.line(diamond + [diamond[0]], fill=GLOW, width=w, joint='curve')
    # seta de subida de nível
    a = r * 0.42
    for k, off in enumerate((-0.12, 0.22)):
        y = c + off * r
        d.line([(c - a, y + a * 0.55), (c, y - a * 0.35), (c + a, y + a * 0.55)], fill=GLOW if k == 0 else (111, 214, 255, 150), width=w, joint='curve')
    glow = layer.filter(ImageFilter.GaussianBlur(size * 0.03))
    img = Image.alpha_composite(img, glow)
    img = Image.alpha_composite(img, glow)
    img = Image.alpha_composite(img, layer)
    return img

def web_icons(out='assets/web'):
    """Ícones da versão web (GitHub Pages / instalar no ecrã principal)."""
    os.makedirs(out, exist_ok=True)
    for s in (192, 512):
        emblem(s * 2).resize((s, s), Image.LANCZOS).save(f'{out}/icon-{s}.png')
    # versão 'maskable': o Android recorta em círculo ou quadrado, por isso o emblema fica mais pequeno
    emblem(1024, scale=0.72).resize((512, 512), Image.LANCZOS).save(f'{out}/icon-maskable-512.png')
    emblem(360).resize((180, 180), Image.LANCZOS).convert('RGB').save(f'{out}/apple-touch-icon.png')
    emblem(128).resize((64, 64), Image.LANCZOS).save(f'{out}/favicon.png')


if __name__ == '__main__':
    sizes = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
    for dens, s in sizes.items():
        base = emblem(s * 4).resize((s, s), Image.LANCZOS)
        base.save(f'{RES}/mipmap-{dens}/ic_launcher.png')
        m = Image.new('L', (s, s), 0); ImageDraw.Draw(m).ellipse((0, 0, s - 1, s - 1), fill=255)
        rnd = Image.new('RGBA', (s, s), (0, 0, 0, 0)); rnd.paste(base, (0, 0), m)
        rnd.save(f'{RES}/mipmap-{dens}/ic_launcher_round.png')
        fg = int(s * 108 / 48)
        emblem(fg * 4, transparent=True, scale=0.62).resize((fg, fg), Image.LANCZOS).save(f'{RES}/mipmap-{dens}/ic_launcher_foreground.png')

    with open(f'{RES}/values/ic_launcher_background.xml', 'w') as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#060A14</color>\n</resources>\n')

    for p in glob.glob(f'{RES}/drawable*/splash.png'):
        w, h = Image.open(p).size
        sp = Image.new('RGBA', (w, h), BG)
        e = min(w, h) // 3
        sp.alpha_composite(emblem(e * 2, transparent=True).resize((e, e), Image.LANCZOS), ((w - e) // 2, (h - e) // 2))
        sp.convert('RGB').save(p)
    emblem(512).save('assets/icon-512.png')
    print('ícones e splash gerados')
    web_icons()
