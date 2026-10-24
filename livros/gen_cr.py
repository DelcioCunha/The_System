# -*- coding: utf-8 -*-
"""Gera «Crónicas do Sistema» (lore narrada pelo Sistema). Paginação feita no navegador (render_cr.js)."""
import os, sys, html, json
sys.path.insert(0, '/home/claude/livro')
from PIL import Image
import cr_a, cr_b, cr_c  # noqa (regista os capítulos e os prompts)
from cr_a import CHAPTERS, PROMPTS, P

AS = '/home/claude/sistema-app/assets/'
F = 'file:///home/claude/livro/fonts/node_modules/@fontsource/'
CACHE = '/home/claude/livro/cache/'
def e(s): return html.escape(str(s or ''))
def opt(path, maxd):
    key = path.replace('/home/claude/', '').replace('/', '_')
    im = Image.open(path)
    alpha = im.mode in ('RGBA', 'LA')
    if alpha: alpha = im.getchannel('A').getextrema()[0] < 250
    out = CACHE + key + str(maxd) + ('.png' if alpha else '.jpg')
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(path):
        os.makedirs(CACHE, exist_ok=True)
        im = im.convert('RGBA' if alpha else 'RGB'); im.thumbnail((maxd, maxd), Image.LANCZOS)
        im.save(out, optimize=True) if alpha else im.save(out, quality=85, optimize=True, progressive=True)
    return 'file://' + out
def lore(id):
    for ext in ('jpg', 'png', 'jpeg', 'webp'):
        if os.path.exists(AS + 'lore/%s.%s' % (id, ext)): return 'lore/%s.%s' % (id, ext)
    return None
MISSING = []
def art(id, fb, d=1500):
    rel = lore(id) if id else None
    if not rel:
        if id: MISSING.append(id)
        rel = fb
    return opt(AS + rel, d)

# aberturas das partes (imagens próprias)
PARTS = [
    ('prologo', None, None, None, None),
    ('origem', 'LIVRO I', 'A Origem', 'Antes dos portões, antes dos Jogadores', P('cr_part_origem', 'Livro I · A Origem', 'a cosmic genesis scene: from an infinite darkness a single blue line of light splits open into ten small glowing portals arranged in a spiral, with an empty obsidian throne at the center of the spiral and a vast faint eye forming in the nebula above; sacred, minimal, deep blue and violet')),
    ('primeiro', 'LIVRO II', 'O Primeiro Jogador', 'A história que o Sistema nunca contou', P('cr_part_primeiro', 'Livro II · O Primeiro Jogador', 'a split portrait composition: on the left the young tired man in a hoodie in his kitchen at 3:07 am lit by a phone, on the right the same man years later as a legendary armored Player with a shadow wolf and a torn coat, standing before the void throne; the two halves blend through a crack of blue light in the middle; epic and melancholic')),
    ('mundos', 'LIVRO III', 'Os Dez Mundos', 'Guia de mundo: as civilizações que o Soberano mediu', P('cr_part_mundos', 'Livro III · Os Dez Mundos', 'ten different worlds seen as ten floating islands in a dark cosmic sea, each island a complete miniature landscape (green forest, crystal caves, green swamp, golden desert, ice fortress, volcano, sunken city in a water bubble, sky citadel, black abyss, white void throne), connected by a thin path of light spiraling towards the center; painterly, epic, vertical')),
    ('margens', 'LIVRO IV', 'As Margens', 'O portão apagado e o encontro que ninguém vê', P('cr_part_margens', 'Livro IV · As Margens', 'the edge of the world of the System where reality dissolves into pixels and white mist; a half-erased stone gate stands on a lone cliff, and far beyond in the void a small wooden table with two chairs floats under the stars; golden and silver light, quiet mystery')),
    ('coliseu', 'LIVRO V', 'O Coliseu dos Condenados', 'Os nove processos da Era dos Primeiros', P('cr_part_coliseu', 'Livro V · O Coliseu', 'nine giant chained silhouettes of the condemned Champions seen from below inside the black colosseum, each lit by its own color (crimson executioner, pink dancer, dark sea devourer, bronze clockwork man, ember phoenix emperor, silver mirror queen, stone colossus, storm warrior, toxic gardener), and a tenth empty white doorway at the center; grim and grand')),
    ('sombras', 'LIVRO VI', 'Sombras e Fragmentos', 'O que fica depois de cada batalha', P('cr_part_sombras', 'Livro VI · Sombras e Fragmentos', 'an endless army of kneeling shadow soldiers and shadow beasts made of black smoke and violet light on a dark plain, glowing crystal fragments falling slowly from the sky above them like snow, a single Player silhouette standing at the front; powerful and solemn')),
    ('epilogo', None, None, None, None),
]

pages = []
def fixed(body, cls, anchor=None):
    pages.append('<section class="page fixed %s"%s><div class="frame"></div><div class="inner">%s</div></section>' % (cls, (' id="%s"' % anchor) if anchor else '', body))
def sysq(t, tag='SISTEMA'): return '<div class="sysbox"><span class="systag">%s</span><p>%s</p></div>' % (tag, e(t))

# capa
pages.append('<section class="page fixed cover"><div class="bk-art" style="background-image:url(%s);opacity:1"></div><div class="cv-veil cr"></div><div class="cv-in cr">'
             '<div class="cv-k">[ REGISTO DO SISTEMA ]</div><h1 class="cv-t">O SISTEMA</h1><div class="cv-s">A origem de tudo</div><div class="cv-line"></div>'
             '<div class="cv-q">Narrado pelo Sistema</div><div class="cv-by">Criado por <b>Delcio Cunha</b></div></div></section>' % art('lore_cover', 'bosses/b100.webp', 1600))
fixed('', 'toc', 'toc')

TOC = []
part_done = set()
for c in CHAPTERS:
    pk = c['part']
    if pk not in part_done:
        part_done.add(pk)
        p = [x for x in PARTS if x[0] == pk][0]
        if p[1]:
            aid = 'part-' + pk
            TOC.append(('part', p[1] + ' · ' + p[2], aid))
            fixed('<div class="op-art" style="background-image:url(%s)"></div><div class="op-veil part"></div><div class="op-in part"><div class="op-n">%s</div><h1 class="op-t big">%s</h1><div class="op-s">%s</div></div>' % (
                art(p[4], c['fallback']), p[1], e(p[2]), e(p[3])), 'opener part-op', aid)
    aid = 'ch-' + str(len(TOC))
    TOC.append(('ch', '%s · %s' % (c['kicker'].split(' · ')[0].title().replace('Capítulo', 'Cap.').replace('Portão', 'Portão'), c['title']), aid))
    fixed('<div class="op-art" style="background-image:url(%s)"></div><div class="op-veil"></div><div class="op-in"><div class="op-n">%s</div><h1 class="op-t">%s</h1>%s</div>' % (
        art(c['art'], c['fallback']), e(c['kicker']), e(c['title']), ('<div class="epi">%s</div>' % e(c['epigraph'])) if c['epigraph'] else ''), 'opener', aid)
    # corpo (paginado no navegador)
    els = []
    first = True
    for el in c['body']:
        k = el[0]
        if k == 'p':
            els.append('<p class="nar%s">%s</p>' % (' drop' if first else '', e(el[1]))); first = False
        elif k == 'fig':
            els.append('<figure class="crfig"><div class="crimg" style="background-image:url(%s)"></div><figcaption>%s</figcaption></figure>' % (art(el[1], el[2], 1300), e(el[3])))
        elif k == 'reg':
            els.append('<div class="reg"><div class="reg-h">REGISTO · %s</div><p>%s</p></div>' % (e(el[1]).upper(), e(el[2])))
        elif k == 'q':
            els.append('<blockquote class="crq"><p>«%s»</p><cite>%s</cite></blockquote>' % (e(el[1]), e(el[2])))
        elif k == 'sys':
            els.append(sysq(el[1]))
    pages.append('<div class="flow" data-title="%s">%s</div>' % (e(c['title']), ''.join(els)))

# contracapa
pages.append('<section class="page fixed back"><div class="bk-art" style="background-image:url(%s)"></div><div class="cv-veil"></div><div class="bk-in"><div class="cv-k">[ SISTEMA ]</div><h2>Registo fechado.<br>Jogador: tu.<br>Estado: em curso.</h2><div class="cv-line"></div><p class="cv-by">O Sistema · A origem de tudo · Criado por <b>Delcio Cunha</b></p></div></section>' % art('lore_first', 'bosses/ar10.webp', 1400))

toc_json = json.dumps(TOC, ensure_ascii=False)
css = open('/home/claude/livro/book.css').read() + open('/home/claude/livro/cr.css').read()
fonts = ''.join('<link rel="stylesheet" href="%s%s.css">' % (F, x) for x in ['oxanium/500', 'oxanium/600', 'oxanium/700', 'oxanium/800', 'barlow/400', 'barlow/500', 'barlow/600', 'barlow/400-italic', 'barlow/500-italic', 'jetbrains-mono/400', 'cinzel/700', 'cinzel/900', 'cormorant-garamond/500', 'cormorant-garamond/500-italic', 'cormorant-garamond/600'])
js = open('/home/claude/livro/paginate.js').read()
out = '<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>O Sistema · A origem de tudo</title>%s<style>%s</style></head><body>%s<script>var TOC=%s;%s</script></body></html>' % (fonts, css, '\n'.join(pages), toc_json, js)
open('/home/claude/livro/cronicas.html', 'w').write(out)
json.dump({k: v for k, v in PROMPTS.items()}, open('/home/claude/livro/cr_prompts.json', 'w'), ensure_ascii=False, indent=1)
print(len(CHAPTERS), 'capítulos ·', len(PROMPTS), 'prompts novos · em falta:', len(set(MISSING)))
words = sum(len(el[1].split()) for c in CHAPTERS for el in c['body'] if el[0] in ('p', 'reg', 'sys', 'q')) + sum(len(el[2].split()) for c in CHAPTERS for el in c['body'] if el[0] == 'reg')
print('palavras ~', words)
