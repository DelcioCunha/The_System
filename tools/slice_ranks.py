"""Corta as folhas das patentes dos duelos (5x2) em assets/ui/pt_<n>.webp, com fundo transparente."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from slice import profile, cuts, trim
from PIL import Image, ImageFilter
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'ui')
def place(tile, name, size=256):
    w,h=tile.size
    d=int(min(w,h)*0.07)  # fora a moldura e os cantos
    t=tile.crop((d,d,w-d,h-d))
    g=t.convert('L').point(lambda v:255 if v>60 else 0).filter(ImageFilter.MaxFilter(5))
    bb=g.getbbox() or (0,0)+t.size
    c=t.crop(bb); cw,ch=c.size; s=int(max(cw,ch)*1.10)
    bg=t.getpixel((3,3))
    can=Image.new('RGB',(s,s),bg); can.paste(c,((s-cw)//2,(s-ch)//2))
    can=can.resize((size,size),Image.LANCZOS)
    # fundo transparente: só o escuro ligado às bordas (o interior escuro das insígnias fica)
    from PIL import ImageDraw, ImageChops
    L=can.convert('L'); lo=max(bg)+10
    m=L.point(lambda v: 255 if v>lo else 0).convert('L')
    for pt in [(0,0),(size-1,0),(0,size-1),(size-1,size-1)]:
        if m.getpixel(pt)==0: ImageDraw.floodfill(m, pt, 128)
    bgmask=m.point(lambda v: 255 if v==128 else 0).filter(ImageFilter.GaussianBlur(1.5))
    soft=L.point(lambda v: min(255,int(max(0,v-max(bg)-2)*255/30)))
    a=ImageChops.lighter(ImageChops.invert(bgmask), soft)
    out=can.convert('RGBA'); out.putalpha(a)
    out.save(os.path.join(OUT,name+'.webp'),'WEBP',quality=90,method=6)
def sheet(f, start):
    im=Image.open(f).convert('RGB')
    xs,ys=cuts(profile(im,'x'),5),cuts(profile(im,'y'),2)
    k=start
    for r in range(2):
        for c in range(5):
            place(trim(im.crop((xs[c],ys[r],xs[c+1],ys[r+1]))),'pt_%d'%k); k+=1
if __name__ == '__main__':
    # python3 tools/slice_ranks.py <folha.png> <primeira patente: 0, 10, 20 ou 30>   (folha de 5x2)
    # python3 tools/slice_ranks.py <imagem.png> 40                                     (Monarca dos Duelos, imagem única)
    f, n = sys.argv[1], int(sys.argv[2])
    if n == 40: place(Image.open(f).convert('RGB'), 'pt_40')
    else: sheet(f, n)
    print('ok')
