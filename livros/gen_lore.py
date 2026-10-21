# -*- coding: utf-8 -*-
"""Gera «Crónicas do Sistema», o livro da lore, narrado pelo Sistema."""
import json, os, html, importlib.util
from PIL import Image
L = json.load(open('/home/claude/livro/lore.json'))
spec = importlib.util.spec_from_file_location('narr', '/home/claude/livro/narr.py'); N = importlib.util.module_from_spec(spec); spec.loader.exec_module(N)
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
    if not os.path.exists(out):
        os.makedirs(CACHE, exist_ok=True)
        im = im.convert('RGBA' if alpha else 'RGB'); im.thumbnail((maxd, maxd), Image.LANCZOS)
        im.save(out, optimize=True) if alpha else im.save(out, quality=84, optimize=True, progressive=True)
    return 'file://' + out
def has(rel): return os.path.exists(AS + rel)
def lore_art(id):
    for ext in ('png', 'jpg', 'jpeg', 'webp'):
        if has('lore/%s.%s' % (id, ext)): return 'lore/%s.%s' % (id, ext)
    return None
def src(rel, d=900): return opt(AS + rel, d)
def img(rel, cls='', d=None):
    if not rel or not has(rel): return ''
    d = d or (220 if rel.startswith(('ui/', 'skills/')) else 300 if rel.startswith(('items/', 'trophies/')) else 900)
    return '<img class="%s" src="%s">' % (cls, src(rel, d))
def sysq(t, tag='SISTEMA'): return '<div class="sysbox"><span class="systag">%s</span><p>%s</p></div>' % (tag, t)
def paras(ps, cls=''): return ''.join('<p class="%s">%s</p>' % (cls, e(p)) for p in ps)

pages = []; TOC = []
def page(body, cls='', num=True): pages.append({'body': body, 'cls': cls, 'num': num})
def toc(level, title): TOC.append((level, title, len(pages) + 1))
def opener(art, kicker, title, sub, text, cls='opener'):
    page('<div class="op-art" style="background-image:url(%s)"></div><div class="op-veil"></div><div class="op-in"><div class="op-n">%s</div><h1 class="op-t">%s</h1><div class="op-s">%s</div>%s</div>' % (src(art, 1400), kicker, title, sub, text), cls, num=False)
def part(key, fallback_art, art_id):
    k, t, s, ps = N.PARTS[key]
    toc(0, '%s · %s' % (k, t))
    opener(lore_art(art_id) or fallback_art, k, t, s, sysq(' '.join(ps)))

# ===== CAPA =====
cov = lore_art('lore_cover')
cover_bg = ('<div class="bk-art" style="background-image:url(%s);opacity:.9"></div>' % src(cov, 1600)) if cov else (
    '<div class="cv-grid">' + ''.join('<div class="cv-c">%s</div>' % img('bosses/b%d.webp' % i) for i in [10, 30, 50, 70, 90, 100]) + '</div>')
pages.append({'cls': 'cover', 'num': False, 'body': cover_bg + '<div class="cv-veil"></div><div class="cv-in">%s<div class="cv-k">[ REGISTO DO SISTEMA ]</div><h1 class="cv-t">CRÓNICAS<br>DO SISTEMA</h1><div class="cv-s">O Livro da Lore</div><div class="cv-line"></div>'
    '<div class="cv-q">Guia de Mundo · Bestiário dos 202 chefes · O Coliseu dos Condenados · Enciclopédia · Artbook</div><div class="cv-by">Narrado pelo Sistema · Criado por <b>Delcio Cunha</b></div></div>' % img('ui/ui_eye.webp', 'cv-eyeimg')})

# ===== ABERTURA =====
page('<div class="letter"><div class="k">REGISTO 0 · ACESSO CONCEDIDO</div><h2 class="lt">Ao Jogador que abriu este livro</h2>' + paras(N.OPEN, 'lt-p') + '<div class="sig">— O Sistema</div></div>', 'letter-pg')
TOC_AT = len(pages); page('', 'toc')

# ===== PARTE I: GÉNESE =====
part('genese', 'bosses/b100.webp', 'lore_void')
GEN_ART = ['lore_void', 'lore_architect', 'lore_firstgate', 'lore_players', 'lore_laws', None]
GEN_FALL = ['bosses/b100.webp', 'bosses/secret_2.webp', 'bosses/b1.webp', 'avatars/mago/1.webp', 'bosses/secret_1.webp', 'ui/ui_eye.webp']
for i, (t, ps) in enumerate(N.GENESIS):
    art = lore_art(GEN_ART[i]) if GEN_ART[i] else None
    fb = GEN_FALL[i]
    pic = '<div class="gen-art" style="background-image:url(%s)"></div>' % src(art or fb, 1200)
    extra = ''
    if t == 'Os Ranks e o Olho':
        extra = '<div class="ranks">' + ''.join('<div class="rk" style="--c:%s"><b>%s</b><span>Nv %d+</span></div>' % (r['color'], r['rank'], r['min']) for r in L['ranks']) + '</div>'
    if t == 'Os Jogadores':
        extra = sysq('[SISTEMA] Cumpriste as condições secretas. Foste escolhido como Jogador. A partir de hoje, cada missão que cumprires vai tornar-te mais forte. Cada missão que falhares terá um preço. Aceitas?', 'NOTIFICAÇÃO')
    toc(1, t)
    page('<div class="gen">' + pic + '<div class="gen-b"><div class="kick">GÉNESE · %d</div><h2 class="ch">%s</h2>%s%s</div></div>' % (i + 1, e(t), paras(ps, 'nar'), extra))

# ===== PARTE II: CAMINHOS =====
part('caminhos', 'avatars/guerreiro/100.webp', None)
for c in L['classes']:
    path, final, myth, sysl = N.CLASS_MYTH[c['id']]
    toc(1, c['name'] + ' · ' + path)
    stages = ''.join('<div class="stg">%s<span>Nv %d</span></div>' % (img('avatars/%s/%d.webp' % (c['id'], l)), l) for l in [1, 25, 49, 73, 100])
    page('<div class="cls" style="--c:%s"><div class="cls-h">%s<div><div class="kick" style="color:%s">%s</div><h2 class="ch" style="color:%s">%s</h2><div class="cls-f">Forma final: <b>%s</b></div></div></div>'
         '<div class="cls-big">%s%s</div><p class="nar">%s</p>%s<div class="stgs">%s</div></div>' % (
        c['color'], img('ui/class_%s.webp' % c['id'], 'cls-ico'), c['color'], path.upper(), c['color'], e(c['name']), final,
        img('avatars/%s/1.webp' % c['id'], 'cls-a'), img('avatars/%s/100.webp' % c['id'], 'cls-a'), e(myth), sysq(e(sysl)), stages))

# ===== PARTE III: PORTÕES =====
part('portoes', 'arenas/ar1.webp', 'lore_map')
def bcard(b, gate_color, kind='gate'):
    lines = b.get('lines') or []
    taunt = lines[0] if lines else ''; last = lines[1] if len(lines) > 1 else ''
    sh = (b.get('shadow') or [''])[0]
    shimg = img('shadows/%s.webp' % b['id'], 'bc-sh', 300)
    tag = '<span class="tag red">CHEFE DA ARENA</span>' if b.get('_final') else ('<span class="tag pur">COMANDANTE</span>' if b.get('_cmd') else '')
    return ('<div class="bc" style="--c:%s"><div class="bc-img">%s<span class="bc-lv">Nv %d</span></div><div class="bc-b"><div class="bc-h"><h3>%s</h3>%s</div><div class="bc-a">%s</div>'
            '%s<p class="bc-l">%s</p><div class="bc-q"><div><i>Provocação</i>«%s»</div><div><i>Últimas palavras</i>«%s»</div></div>'
            '<div class="bc-f">%s<div class="bc-sl"><i>A sombra</i>«%s»</div><div class="bc-tr">%s<span>%s</span></div></div></div></div>') % (
        gate_color, img('bosses/%s.webp' % b['id'], '', 600), b['level'], e(b['name']), tag, e(b.get('arch')),
        ('<p class="bc-qt">%s</p>' % e(b['quote'])) if b.get('quote') and b['quote'] not in b['lore'] else '', e(b['lore']), e(taunt), e(last),
        shimg, e(sh), img('trophies/%s.webp' % b['id'], 'bc-tri'), e(b.get('trophy')))
for g in L['gates']:
    bs = g['bosses']; bs[-2]['_cmd'] = True; bs[-1]['_final'] = True
    toc(1, 'Portão %d · %s' % (g['id'], g['name']))
    k = bs[-1]
    strip = '<div class="gstrip">' + ''.join('<div class="gs">%s<span>%d</span></div>' % (img('bosses/%s.webp' % b['id'], '', 400), b['level']) for b in bs) + '</div>'
    page('<div class="op-art" style="background-image:url(%s)"></div><div class="op-veil"></div><div class="op-in"><div class="op-n" style="color:%s">PORTÃO %d</div><h1 class="op-t">%s</h1><p class="gate-lore">%s</p>%s%s</div>' % (
        src('bosses/%s.webp' % k['id'], 1200), g['color'], g['id'], e(g['name']), e(g['lore']), sysq(e(N.GATE_NARR[g['id']])), strip), 'opener gate-op', num=False)
    for i in range(0, 9, 3):
        page('<div class="ph-h" style="--c:%s">%s<span>PORTÃO %d · %s</span><span>BESTIÁRIO</span></div>' % (g['color'], img('ui/gate_%d.webp' % g['id'], 'ph-ico'), g['id'], e(g['name']).upper()) + ''.join(bcard(b, g['color']) for b in bs[i:i + 3]))
    # rei
    sh = k.get('shadow') or []
    page('<div class="ph-h" style="--c:%s">%s<span>PORTÃO %d · %s</span><span>O REI</span></div><div class="king" style="--c:%s"><div class="king-img">%s</div><div class="king-b"><div class="kick" style="color:%s">REI DO PORTÃO · NV %d</div><h2 class="ch">%s</h2>'
         '<p class="nar">%s</p><p class="bc-qt">%s</p><div class="bc-q big"><div><i>Ao surgir</i>«%s»</div><div><i>Ao cair</i>«%s»</div></div><div class="sk">%s</div></div></div>'
         '<div class="king-f"><div class="kf">%s<div><i>A sombra de %s</i>%s</div></div><div class="kf">%s<div><i>Troféu</i><b>%s</b><span>%s</span></div></div></div>%s' % (
        g['color'], img('ui/gate_%d.webp' % g['id'], 'ph-ico'), g['id'], e(g['name']).upper(), g['color'], img('bosses/%s.webp' % k['id'], '', 900), g['color'], k['level'], e(k['name']),
        e(k['lore']), e(k['quote']), e((k['lines'] or [''])[0]), e((k['lines'] or ['', ''])[-1]), ''.join('<span>%s</span>' % e(s) for s in k['skills']),
        img('shadows/%s.webp' % k['id'], 'kf-sh', 400), e(k['name'].split(',')[0]), ''.join('<p>«%s»</p>' % e(x) for x in sh[:3]), img('trophies/%s.webp' % k['id'], 'kf-tr'), e(k['trophy']), e(k['trophyLore']),
        sysq(e(N.GATE_KING_SYS[g['id']]))))

# ===== PARTE IV: MARGENS =====
part('ocultos', 'bosses/secret_1.webp', 'lore_margins')
hb = L['hidden']['bosses']
page('<h2 class="ch">Os portões ocultos</h2><p class="lead">%s</p>%s<div class="hid">%s</div>' % (e(L['hidden']['lore']), sysq(e(N.HIDDEN_NARR)), ''.join(
    '<div class="hd">%s<div><div class="kick">PORTÃO OCULTO · NV %d</div><h3>%s</h3><p class="bc-qt">%s</p><p>%s</p><div class="bc-q"><div><i>Ao surgir</i>«%s»</div><div><i>Ao cair</i>«%s»</div></div><div class="bc-tr">%s<span>%s</span></div></div></div>' % (
        img('bosses/%s.webp' % b['id'], 'hd-img'), b['level'], e(b['name']), e(b['quote']), e(b['lore']), e(b['lines'][0]), e(b['lines'][1]), img('trophies/%s.webp' % b['id'], 'bc-tri'), e(b['trophy'])) for b in hb)))

# ===== PARTE V: COLISEU =====
part('coliseu', 'arenas/ar1.webp', 'lore_coliseu')
cel = lore_art('lore_cell')
page('<h2 class="ch">As dez celas</h2>' + ('<div class="wide-art" style="background-image:url(%s)"></div>' % src(cel, 1400) if cel else '') + paras(N.COLISEU_NARR, 'nar') +
     '<div class="cells">' + ''.join('<div class="cell" style="--c:%s">%s<b>%s</b><span>Arena %d · %d ◆</span></div>' % (a['color'], img('bosses/%s.webp' % a['champ']['id'], '', 400), e(a['champ']['name'].split(',')[0]), a['arena'], a['cost']) for a in L['arenas']) + '</div>')
for a in L['arenas']:
    c = a['champ']; s = a['story']; ch = a['chron'] or {}
    toc(1, 'Arena %d · %s' % (a['arena'], a['arenaName']))
    page('<div class="op-art" style="background-image:url(%s)"></div><div class="op-veil"></div><div class="op-in"><div class="op-n" style="color:%s">CELA %d</div><h1 class="op-t">%s</h1><p class="gate-lore">%s</p>'
         '<div class="dossier"><div><i>Registo</i>%s</div><div><i>Crime</i>%s</div><div><i>Sentença</i>%s</div></div>%s</div>' % (
        src('arenas/ar%d.webp' % a['arena'], 1400), a['color'], a['arena'], e(a['arenaName']), e(s.get('arenaDesc')), e(s.get('record')), e(s.get('crime')), e(s.get('sentence')), sysq(e(s.get('unlock') or ch.get('sys') or ''), 'A CELA ABRE-SE')), 'opener gate-op', num=False)
    sig = s.get('sig') or {}
    page('<div class="ph-h" style="--c:%s"><span>CELA %d · %s</span><span>O CAMPEÃO</span></div><div class="champ"><div class="ch-img">%s</div><div class="ch-b"><div class="kick" style="color:%s">CAMPEÃO · NV %d · 3 FASES</div><h2 class="ch">%s</h2><p class="bc-qt">«%s»</p>%s</div></div>' % (
        a['color'], a['arena'], e(a['arenaName']).upper(), img('bosses/%s.webp' % c['id'], '', 900), a['color'], c['level'], e(c['name']), e(s.get('quote')), paras((s.get('lore') or '').split('\n\n'), 'nar')) +
         '<div class="cols2"><div><h3>A crónica</h3><p>%s</p>%s</div><div><h3>A luta</h3><div class="intro">%s</div><div class="bc-q"><div><i>Fase 2</i>%s</div><div><i>Fase 3</i>%s</div></div>'
         '<div class="sigc"><b>%s</b><span>%s</span></div><div class="bc-q"><div><i>Ao surgir</i>«%s»</div><div><i>Ao cair</i>«%s»</div></div></div></div>' % (
        e(ch.get('chron')), sysq(e(ch.get('sys'))), ''.join('<p>%s</p>' % e(x) for x in (s.get('intro') or [])), e(s.get('phase2')), e(s.get('phase3')), e(sig.get('name')), e(sig.get('desc')), e((s.get('lines') or [''])[0]), e((s.get('lines') or ['', ''])[-1])))
    lad = a['ladder']; lad[-1]['_cmd'] = True
    for i in range(0, 9, 3):
        page('<div class="ph-h" style="--c:%s"><span>CELA %d · %s</span><span>OS GUARDIÕES</span></div>' % (a['color'], a['arena'], e(a['arenaName']).upper()) + ''.join(bcard(b, a['color']) for b in lad[i:i + 3]))
    # recompensas do campeão
    shs = c.get('shadow') or []
    page('<div class="ph-h" style="--c:%s"><span>CELA %d · %s</span><span>O QUE FICA</span></div><div class="cols2"><div class="kf col">%s<div><i>A sombra de %s</i>%s</div></div><div>'
         '<div class="kf col">%s<div><i>A Coroa</i><b>%s</b><span>%s</span></div></div><div class="bc-q"><div><i>Na revanche</i>«%s»</div><div><i>Ao cair outra vez</i>«%s»</div></div>%s</div></div>' % (
        a['color'], a['arena'], e(a['arenaName']).upper(), img('shadows/%s.webp' % c['id'], 'big-sh', 700), e(c['name'].split(',')[0]), ''.join('<p>«%s»</p>' % e(x) for x in shs[:3]),
        img('trophies/%s.webp' % c['id'], 'kf-tr big'), e(c['trophy']), e(c['trophyLore']), e((s.get('rematch') or [''])[0]), e(s.get('rematchLast')),
        ('<div class="kf">%s<div><i>Relíquia da cela</i><b>%s</b></div></div>' % ('', e(a['relic']))) if a.get('relic') else ''))

# ===== PARTE VI: ENCICLOPÉDIA =====
part('enciclopedia', 'shadows/b100.webp', 'lore_relics')
toc(1, 'As Sombras')
ar = lore_art('lore_arise')
page('<h2 class="ch">ERGA-SE · As Sombras</h2>' + ('<div class="wide-art" style="background-image:url(%s)"></div>' % src(ar, 1400) if ar else '') + paras(N.ENC_SHADOWS, 'nar') +
     '<div class="shds">' + ''.join('<div class="shd">%s</div>' % img('shadows/b%d.webp' % i, '', 400) for i in [5, 12, 18, 26, 33, 47, 55, 64, 72, 88]) + '</div>' +
     '<div class="shds">' + ''.join('<div class="shd">%s</div>' % img('shadows/ar%d.webp' % i, '', 400) for i in range(1, 11)) + '</div>')
toc(1, 'Artefactos do Sistema')
si = L['sysItems']
for j in range(0, len(si), 8):
    page('<h2 class="ch">Artefactos do Sistema%s</h2>' % ('' if j == 0 else ' (cont.)') + ('<p class="lead">Objetos que deixei cair no mundo. Alguns ensinam habilidades secretas, outros mudam as minhas regras durante um dia. Todos têm uma história.</p>' if j == 0 else '') +
         '<div class="arts">' + ''.join('<div class="art">%s<div><b>%s</b><p class="bc-qt">%s</p><p>%s</p></div></div>' % (img('items/%s.webp' % x['id'], 'art-img'), e(x['name']), e(x['lore']), e(x['desc'])) for x in si[j:j + 8]) + '</div>')
toc(1, 'Relíquias do Coliseu')
page('<h2 class="ch">Relíquias</h2><p class="lead">As relíquias são fragmentos do meu próprio poder, emprestados a quem paga o tributo. Só uma pode ser usada em cada batalha.</p><div class="arts">' +
     ''.join('<div class="art">%s<div><b>%s</b><p class="bc-qt">%s</p><p>%s</p></div></div>' % (img('items/%s.webp' % x['id'], 'art-img'), e(x['name']), e(x['lore']), e(x['desc'])) for x in L['relics'] if x.get('id')) + '</div>')
toc(1, 'Habilidades secretas')
page('<h2 class="ch">As dez habilidades secretas</h2><p class="lead">Não aparecem em nenhuma lista. Caem de chefes, de baús secretos, de artefactos. Quem as aprende passa a ter uma coisa que eu não dei a mais ninguém.</p><div class="arts">' +
     ''.join('<div class="art">%s<div><b>%s</b><p class="bc-qt">%s</p><p>%s</p></div></div>' % (img('skills/%s.webp' % x['id'], 'art-img'), e(x['name']), e(x.get('lore')), e(x['desc'])) for x in L['secretSkills']) + '</div>')
toc(1, 'Os baús')
cl = L['chestLore']
page('<h2 class="ch">Os baús</h2><p class="lead">Até as caixas têm passado.</p><div class="arts">' + ''.join('<div class="art">%s<div><b>%s</b><p class="bc-qt">%s</p></div></div>' % (img('items/bau_%s_5.webp' % k, 'art-img'), n, e(cl.get(k))) for k, n in [('arsenal', 'Arsenal'), ('armaria', 'Armaria'), ('guerra', 'Arca de Guerra'), ('joias', 'Porta-Joias'), ('alquimia', 'Cofre Alquímico')]) + '</div>'
     + sysq('Ninguém compra um baú. Compra-se a esperança do que está lá dentro. Eu vendo esperança a preço fixo.'))
toc(1, 'Os cem títulos')
tt = L['titles']
page('<h2 class="ch">Os cem títulos</h2><p class="lead">Dou um nome novo a cada nível. É a forma mais barata que tenho de dizer «reparei».</p><ol class="titles">' + ''.join('<li><span>%d</span>%s</li>' % (i + 1, e(t)) for i, t in enumerate(tt)) + '</ol>')

# ===== PARTE VII: ARTBOOK =====
part('artbook', 'avatars/mago/100.webp', None)
for c in L['classes']:
    toc(1, 'As 34 formas · ' + c['name'])
    lv = sorted(int(f.split('.')[0]) for f in os.listdir(AS + 'avatars/' + c['id']))
    page('<h2 class="ch" style="color:%s">%s · as 34 formas</h2><div class="forms">' % (c['color'], e(c['name'])) + ''.join('<div class="fm">%s<span>%d</span></div>' % (img('avatars/%s/%d.webp' % (c['id'], l), '', 400), l) for l in lv) + '</div>')
toc(1, 'Galeria dos chefes')
for gi in range(0, 10, 2):
    page('<h2 class="ch">Galeria dos chefes · portões %d e %d</h2>' % (gi + 1, gi + 2) + ''.join('<div class="ggal-h" style="color:%s">%s</div><div class="ggal">%s</div>' % (g['color'], e(g['name']), ''.join('<div>%s</div>' % img('bosses/%s.webp' % b['id'], '', 400) for b in g['bosses'])) for g in L['gates'][gi:gi + 2]))
toc(1, 'Galeria das sombras')
for gi in range(0, 10, 2):
    page('<h2 class="ch">Galeria das sombras · portões %d e %d</h2>' % (gi + 1, gi + 2) + ''.join('<div class="ggal-h" style="color:%s">%s</div><div class="ggal sh">%s</div>' % (g['color'], e(g['name']), ''.join('<div>%s</div>' % img('shadows/%s.webp' % b['id'], '', 400) for b in g['bosses'])) for g in L['gates'][gi:gi + 2]))
toc(1, 'As arenas')
for ai in range(0, 10, 4):
    page('<h2 class="ch">As arenas do Coliseu</h2><div class="argal">' + ''.join('<div class="ag" style="--c:%s">%s<b>%s</b></div>' % (a['color'], img('arenas/ar%d.webp' % a['arena'], '', 1100), e(a['arenaName'])) for a in L['arenas'][ai:ai + 4]) + '</div>', 'argal-pg')
toc(1, 'Troféus')
page('<h2 class="ch">Os troféus</h2><div class="trgal">' + ''.join('<div>%s</div>' % img('trophies/b%d.webp' % i) for i in range(1, 101)) + '</div>')

# ===== EPÍLOGO =====
toc(0, 'Epílogo')
ep = lore_art('lore_epilogue') or lore_art('lore_first')
opener(ep or 'bosses/ar10.webp', 'EPÍLOGO', 'O registo continua', '', '<div class="ep">' + paras(N.EPILOGUE, 'nar') + '<div class="sig">— O Sistema</div></div>', 'opener epi')
pages.append({'cls': 'back', 'num': False, 'body': '<div class="bk-art" style="background-image:url(%s)"></div><div class="cv-veil"></div><div class="bk-in">%s<div class="cv-k">[ SISTEMA ]</div><h2>Fim do registo.<br>Por agora.</h2><div class="cv-line"></div><p class="cv-by">Crónicas do Sistema · Criado por <b>Delcio Cunha</b></p></div>' % (src('bosses/b100.webp', 1200), img('ui/ui_eye.webp', 'cv-eyeimg'))})

pages[TOC_AT]['body'] = '<h2 class="ch">Índice</h2><div class="toc lore-toc">' + ''.join('<div class="ti%s"><span class="tt">%s</span><span class="tp">%d</span></div>' % (' main' if lv == 0 else '', e(t), p) for lv, t, p in TOC) + '</div>'

css = open('/home/claude/livro/book.css').read() + open('/home/claude/livro/lore.css').read()
fonts = ''.join('<link rel="stylesheet" href="%s%s.css">' % (F, x) for x in ['oxanium/500', 'oxanium/600', 'oxanium/700', 'oxanium/800', 'barlow/400', 'barlow/500', 'barlow/600', 'barlow/700', 'barlow/400-italic', 'barlow/500-italic', 'jetbrains-mono/400', 'cinzel/700', 'cinzel/900'])
out = ['<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>Crónicas do Sistema</title>', fonts, '<style>', css, '</style></head><body>']
for i, p in enumerate(pages):
    foot = '<div class="foot"><span>CRÓNICAS DO SISTEMA</span><span class="fn">%d</span></div>' % (i + 1) if p['num'] else ''
    out.append('<section class="page %s"><div class="frame"></div><div class="inner">%s</div>%s</section>' % (p['cls'], p['body'], foot))
out.append('</body></html>')
open('/home/claude/livro/lore.html', 'w').write('\n'.join(out))
print(len(pages), 'páginas;', len(TOC), 'entradas no índice')
