# -*- coding: utf-8 -*-
"""Gera o Livro do Sistema (HTML paginado em A4) a partir do jogo."""
import json, os, html
D = json.load(open('/home/claude/livro/data.json'))
A = 'file:///home/claude/sistema-app/assets/'
SH = 'file:///home/claude/livro/shots/'
CR = 'file:///home/claude/livro/crops/'
F = 'file:///home/claude/livro/fonts/node_modules/@fontsource/'
def e(s): return html.escape(str(s))
from PIL import Image
CACHE = '/home/claude/livro/cache/'
def opt(path, maxd):
    # converte para JPEG (sem transparência) ou PNG pequeno (com transparência), no tamanho certo para o PDF
    key = path.replace('/home/claude/', '').replace('/', '_')
    im = Image.open(path)
    alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    if alpha:
        a = im.convert('RGBA').getchannel('A')
        alpha = a.getextrema()[0] < 250
    out = CACHE + key + str(maxd) + ('.png' if alpha else '.jpg')
    if not os.path.exists(out):
        os.makedirs(CACHE, exist_ok=True)
        im = im.convert('RGBA' if alpha else 'RGB')
        im.thumbnail((maxd, maxd), Image.LANCZOS)
        if alpha: im.save(out, optimize=True)
        else: im.save(out, quality=84, optimize=True, progressive=True)
    return 'file://' + out
def sizefor(rel):
    if rel.startswith('ui/') or rel.startswith('skills/'): return 220
    if rel.startswith('items/'): return 260
    if rel.startswith('frames/') or rel.startswith('trophies/'): return 360
    return 900
def exists(rel): return os.path.exists('/home/claude/sistema-app/assets/' + rel)
def img(rel, cls='', style=''):
    return '<img class="%s" style="%s" src="%s">' % (cls, style, opt('/home/claude/sistema-app/assets/' + rel, sizefor(rel))) if exists(rel) else ''
def ui(id, cls='ico'): return img('ui/%s.webp' % id, cls)
def phone(src, cap='', h=None, cls=''):
    st = ('height:%smm' % h) if h else ''
    return '<figure class="phone %s"><div class="ph" style="%s"><img src="%s"></div>%s</figure>' % (cls, st, opt(src.replace('file://', ''), 1100), ('<figcaption>%s</figcaption>' % cap) if cap else '')
def crop(name, cap='', cls=''):
    return '<figure class="crop %s"><img src="%s">%s</figure>' % (cls, opt('/home/claude/livro/crops/' + name + '.png', 1100), ('<figcaption>%s</figcaption>' % cap) if cap else '')
def sys(t, title='SISTEMA'):
    return '<div class="sysbox"><span class="systag">%s</span><p>%s</p></div>' % (title, t)
def tip(t, k='Dica'): return '<div class="tip"><b>%s</b> %s</div>' % (k, t)
def warn(t, k='Atenção'): return '<div class="tip warn"><b>%s</b> %s</div>' % (k, t)
def table(head, rows, cls=''):
    return '<table class="%s"><tr>%s</tr>%s</table>' % (cls, ''.join('<th>%s</th>' % h for h in head), ''.join('<tr>%s</tr>' % ''.join('<td>%s</td>' % c for c in r) for r in rows))

pages = []
TOC = []
def page(body, cls='', chapter=None, num=True):
    pages.append({'body': body, 'cls': cls, 'num': num, 'chapter': chapter})
def bg(rel, d=1400): return opt('/home/claude/sistema-app/assets/' + rel, d)
def opener(n, title, sub, art, quote):
    if art.startswith(A): art = bg(art[len(A):])
    TOC.append((n, title, len(pages) + 1))
    page('<div class="op-art" style="background-image:url(%s)"></div><div class="op-veil"></div>'
         '<div class="op-in"><div class="op-n">CAPÍTULO %s</div><h1 class="op-t">%s</h1><div class="op-s">%s</div>%s</div>' % (art, n, title, sub, sys(quote)), 'opener', title, num=False)

CL = {c['id']: c for c in D['classes']}
SN = {'str': 'FOR', 'agi': 'AGI', 'vit': 'VIT', 'int': 'INT', 'per': 'PER'}
STN = {k: v['name'] for k, v in D['stats'].items()}

# ================= CAPA =================
cover = '<div class="cv-grid">' + ''.join('<div class="cv-c" style="--c:%s">%s</div>' % (CL[c]['color'], img('avatars/%s/100.webp' % c)) for c in ['guerreiro', 'assassino', 'mago', 'guardiao', 'arqueiro', 'invocador']) + '</div>'
pages.append({'cls': 'cover', 'num': False, 'chapter': None, 'body': cover +
    '<div class="cv-veil"></div><div class="cv-in"><div class="cv-eye">%s</div><div class="cv-k">[ SISTEMA ]</div><h1 class="cv-t">O LIVRO<br>DO SISTEMA</h1>'
    '<div class="cv-s">Manual oficial do Jogador</div><div class="cv-line"></div><div class="cv-q">«Foste escolhido. A partir de hoje, cada missão que cumprires vai tornar-te mais forte.»</div>'
    '<div class="cv-by">Criado por <b>Delcio Cunha</b></div></div>' % ui('ui_eye', 'cv-eyeimg')})

# ================= FOLHA DE ROSTO =================
page('<div class="front">' + phone(SH + '01_intro.png', '', 150) +
     '<div class="front-t"><div class="k">NOTIFICAÇÃO</div><h2>Cumpriste as condições secretas.</h2>'
     '<p class="lead">Este é o primeiro ecrã que todos os Jogadores veem. A partir daqui, o Sistema passa a acompanhar a tua vida real: cada missão, cada falha, cada dia.</p>'
     '<p>Este livro explica tudo o que precisas de saber: como despertar, como criar missões que valem a pena, como sobem os níveis, como se luta contra os chefes dos portões, como se extraem sombras, o que guarda a Ala Premium e como se ganha uma patente nos duelos contra outros Jogadores.</p>'
     '<p>Lê-o do princípio ao fim, ou abre-o no capítulo que precisares. Os ecrãs que aqui vês são do próprio Sistema.</p>'
     + sys('Não precisas de ler isto. Mas quem lê, chega mais longe. O registo prova-o.') + '</div></div>', 'dark')

TOC_AT = len(pages)
page('', 'toc')  # índice preenchido no fim

# ================= PRÓLOGO =================
TOC.append(('', 'Prólogo: o que é o Sistema', len(pages) + 1))
loop = ''.join('<div class="lp"><div class="lp-i">%s</div><b>%s</b><span>%s</span></div>' % (ui(i, 'lp-img'), t, s) for i, t, s in [
    ('h_mission_new', 'Cria missões', 'da tua vida real, com prazo'),
    ('h_mission_done', 'Cumpre-as', 'antes do horário de encerramento'),
    ('h_levelup', 'Ganha XP e moedas', 'sobe de nível e de atributos'),
    ('nav_loja', 'Equipa-te', 'armas, armaduras, poções, baús'),
    ('ui_battle', 'Enfrenta chefes', '10 portões, 100 chefes'),
    ('log_shadow', 'Ergue sombras', 'os chefes vencidos lutam por ti'),
    ('ui_duel', 'Duela', 'contra Jogadores reais e sobe de patente')])
page('<h2 class="ch">Prólogo: o que é o Sistema</h2>'
     '<p class="lead">O Sistema é um RPG da vida real. Tu és o personagem. As tuas tarefas do dia a dia (estudar, treinar, arrumar, ler, trabalhar) são as missões. Cumpri-las dá-te experiência, moedas e força. Falhá-las tem um preço.</p>'
     '<div class="cols2"><div><h3>A ideia</h3><p>Inspirado nos «Sistemas» das histórias de caçadores, o Sistema é uma voz fria e atenta que te observa, regista o que fazes e cobra o que prometes. Não é teu amigo nem teu inimigo: é o registo.</p>'
     '<p>Tudo no jogo nasce das tuas missões reais. Sem missões cumpridas não há XP; sem XP não há níveis; sem níveis não há força para os portões. Por isso o Sistema é uma ferramenta de disciplina disfarçada de jogo.</p></div>'
     '<div><h3>O que vais encontrar</h3><ul class="dots"><li><b>6 classes</b> com caminhos próprios e 34 formas cada</li><li><b>Níveis</b> com títulos e ranks de E a Ω</li><li><b>Missões</b> personalizadas e uma Missão Diária</li><li><b>100 chefes</b> em 10 portões, mais 2 ocultos</li><li><b>%d itens</b>, %d habilidades e %d conquistas</li><li><b>Sombras</b> que se tornam servos</li><li><b>Coliseu dos Condenados</b>: 10 arenas premium</li><li><b>Duelos</b> com patentes, amigos e conversas</li></ul></div></div>'
     '<h3>O ciclo do Jogador</h3><div class="loop">%s</div>' % (D['itemsN'], D['skillsN'], D['achN'], loop) +
     sys('Tu precisas de mim mais do que eu preciso de ti. Mas vamos fingir que é ao contrário. Ajuda-te a começar.'))

# ================= CAP I: O DESPERTAR =================
opener('I', 'O Despertar', 'Nome, classe e a primeira conversa', A + 'avatars/mago/1.webp', 'Ligação estabelecida. Jogador identificado. A partir de agora, cada dia teu tem testemunha.')
page('<h2 class="ch">Começar a jornada</h2><div class="steps">'
     '<div class="step"><div class="sn">1</div><div><h3>Aceitar a notificação</h3><p>Ao abrir a app pela primeira vez, o Sistema mostra a notificação de despertar. Toca em <b>Aceitar</b>. Se já tens uma conta noutro telemóvel, usa <b>Tenho um código de transferência</b> (capítulo XVI).</p></div></div>'
     '<div class="step"><div class="sn">2</div><div><h3>Escrever o teu nome</h3><p>É o nome que o Sistema vai usar para falar contigo e que os outros Jogadores veem nos duelos.</p></div></div>'
     '<div class="step"><div class="sn">3</div><div><h3>Escolher a classe</h3><p>Cada carta mostra a forma inicial da classe e os 5 atributos de partida. A classe decide o teu estilo de combate, as tuas armas, as tuas habilidades e o caminho da tua aparência até ao nível 100.</p></div></div>'
     '<div class="step"><div class="sn">4</div><div><h3>Despertar</h3><p>Toca em <b>Despertar</b>. Começas com 100 moedas, poções e um Baú Comum.</p></div></div></div>'
     '<div class="row2">' + phone(SH + '02_classes.png', 'Registo do Jogador', 118) + phone(SH + '02b_classes_cards.png', 'As cartas das 6 classes', 118) + '</div>')
page('<h2 class="ch">A primeira conversa</h2><p class="lead">Logo depois de despertares, o Sistema fala contigo pela primeira vez. São pelo menos oito falas seguidas: uma abertura, a leitura da classe que escolheste, uma pergunta pessoal e um fecho.</p>'
     '<div class="row2">' + phone(SH + '03_first_talk.png', 'O Sistema apresenta-se', 120) + phone(SH + '03b_first_ask.png', 'A pergunta pessoal', 120) + '</div>'
     '<div class="cols2"><div><h3>Como funciona</h3><ul class="dots"><li>Toca em <b>Continuar</b> para avançar fala a fala.</li><li>Na pergunta, escolhe uma de três respostas: obedecer, desafiar ou perguntar.</li><li>A tua resposta fica guardada e o Sistema responde-te.</li><li>Os pontos em baixo mostram quanto falta. <b>Saltar</b> leva-te ao fim.</li></ul></div>'
     '<div><h3>Sempre diferente</h3><p>A conversa é montada ao acaso entre 5 aberturas, 2 leituras para cada classe, 5 perguntas e 4 fechos. Dois Jogadores raramente ouvem a mesma.</p>' + sys('Escolheste Assassino. Um assassino vive de escolher o momento. O teu momento é hoje. Não amanhã. Hoje.') + '</div></div>')

# ================= CAP II: CLASSES =================
opener('II', 'As Seis Classes', 'Seis caminhos, do mais fraco ao mais poderoso', A + 'avatars/guerreiro/100.webp', 'A classe não decide quem és. Decide como vais lutar até descobrires.')
PATH = {'guerreiro': 'Soberano da Guerra', 'assassino': 'Senhor da Noite Silenciosa', 'mago': 'Arquissábio das Estrelas', 'guardiao': 'Bastião Vivo', 'arqueiro': 'Soberano da Tempestade', 'invocador': 'Imperador das Almas'}
STYLE = {'guerreiro': 'Corpo a corpo, golpes pesados e muita resistência. Ideal para quem quer aguentar e esmagar.',
         'assassino': 'Velocidade, críticos e venenos. Acaba as lutas antes que o inimigo perceba.',
         'mago': 'Dano mágico enorme e controlo (gelo, fogo, raios), mas pouca defesa.',
         'guardiao': 'Uma muralha: escudos, provocação e dano devolvido. Quase impossível de derrubar.',
         'arqueiro': 'Precisão à distância, críticos e chuvas de flechas, com companheiros animais.',
         'invocador': 'Chama espíritos que lutam ao seu lado, drena vida e é o mestre natural das sombras (+1 lugar de servo).'}
def classcard(c):
    bars = ''.join('<div class="sb"><span>%s</span><i style="width:%d%%;background:%s"></i><b>%d</b></div>' % (SN[k], v * 100 / 15, c['color'], v) for k, v in c['base'].items())
    sk = [s for s in c['skills'] if s['unlock'] in (1, 10, 30, 60, 100)]
    skl = ''.join('<li>%s<b>%s</b> <span class="mut">Nv %d</span></li>' % (img('skills/%s.webp' % s['id'], 'skico'), e(s['name']), s['unlock']) for s in sk)
    return ('<div class="cc" style="--c:%s"><div class="cc-arts">%s%s</div><div class="cc-b"><div class="cc-h">%s<h3>%s</h3></div><div class="cc-p">Caminho: <b>%s</b></div><p>%s</p><p class="mut sm">%s</p>'
            '<div class="sbars">%s</div><div class="sm">Cresce mais em <b>%s</b>.</div><ul class="skl">%s</ul></div></div>') % (
        c['color'], img('avatars/%s/1.webp' % c['id'], 'cc-a1'), img('avatars/%s/100.webp' % c['id'], 'cc-a2'), ui('class_' + c['id'], 'cc-ico'), e(c['name']), PATH[c['id']], e(c['desc']), STYLE[c['id']], bars, ' e '.join(STN[g] for g in c['growth']), skl)
for i in range(0, 6, 2):
    page('<h2 class="ch">As classes · %s e %s</h2>' % (D['classes'][i]['name'], D['classes'][i + 1]['name']) + classcard(D['classes'][i]) + classcard(D['classes'][i + 1]))

# ================= CAP III: EVOLUÇÃO =================
opener('III', 'Níveis, Ranks e Formas', 'Como o Jogador evolui', A + 'avatars/invocador/100.webp', 'O teu nível é um número. Mereces esse número? As tuas missões decidem. Eu só faço as contas.')
rk = ''.join('<div class="rk" style="--c:%s"><b>%s</b><span>Nv %d+</span></div>' % (r['color'], r['rank'], r['min']) for r in D['ranks'])
tit = ''.join('<li><span class="mono">%d</span> %s</li>' % (i + 1, e(D['titles'][i])) for i in [0, 4, 9, 19, 29, 39, 49, 59, 69, 79, 89, 98, 99])
page('<h2 class="ch">Subir de nível</h2><p class="lead">Ganhas XP ao cumprir missões, a Missão Diária, ao vencer chefes e duelos. Cada nível pede mais XP do que o anterior. Ao subir, recebes <b>+3 pontos de atributo</b> livres, um título novo e, às vezes, uma habilidade nova.</p>'
     '<div class="cols2"><div>' + phone(SH + '24_levelup.png', 'Subida de nível', 110) + '</div><div><h3>Os ranks</h3><p>O rank é a tua categoria de caçador. Muda à medida que sobes de nível:</p><div class="ranks">' + rk + '</div>'
     '<h3>Os 100 títulos</h3><p>Cada nível tem um título próprio, de «Despertado» a «O Absoluto». Alguns exemplos:</p><ul class="tit">' + tit + '</ul></div></div>'
     + tip('O conteúdo do jogo (títulos, formas e chefes) vai até ao nível 100, mas o nível não tem teto: quem passa do 100 continua a subir e a ganhar pontos. O título fica «O Absoluto».', 'Para lá do 100'))
EVO = [1, 10, 22, 34, 46, 58, 70, 82, 100]
def strip(c):
    return '<div class="evo">' + ''.join('<div class="ev">%s<span>Nv %d</span></div>' % (img('avatars/%s/%d.webp' % (c, l)), l) for l in EVO) + '</div>'
page('<h2 class="ch">As 34 formas</h2><p class="lead">A tua aparência muda a cada 3 níveis: 34 formas por classe, nos níveis 1, 4, 7 … 97 e 100. O retrato no ecrã de Estado é sempre o da forma mais alta que já atingiste, e o Sistema avisa quando estás perto da próxima.</p>'
     '<h3 style="color:%s">Mago · do aprendiz ao Arquissábio das Estrelas</h3>' % CL['mago']['color'] + strip('mago') +
     '<h3 style="color:%s">Guerreiro · do camponês ao Soberano da Guerra</h3>' % CL['guerreiro']['color'] + strip('guerreiro') +
     '<h3 style="color:%s">Assassino · da sombra ao Senhor da Noite Silenciosa</h3>' % CL['assassino']['color'] + strip('assassino'))
page('<h2 class="ch">As 34 formas (continuação)</h2>'
     '<h3 style="color:%s">Guardião · do lenhador ao Bastião Vivo</h3>' % CL['guardiao']['color'] + strip('guardiao') +
     '<h3 style="color:%s">Arqueiro · do caçador ao Soberano da Tempestade</h3>' % CL['arqueiro']['color'] + strip('arqueiro') +
     '<h3 style="color:%s">Invocador · do aprendiz ao Imperador das Almas</h3>' % CL['invocador']['color'] + strip('invocador') +
     sys('Não é a roupa que muda. És tu. A roupa só mostra o que o registo já sabe.'))

# ================= CAP IV: ESTADO =================
opener('IV', 'O Ecrã de Estado', 'Atributos, equipamento e registos', A + 'avatars/arqueiro/100.webp', 'Este é o teu reflexo. Sem filtros. Sem desculpas.')
attr = ''.join('<div class="at">%s<div><b>%s · %s</b><span>%s</span></div></div>' % (ui('stat_' + k, 'at-img'), v['name'], v['short'], v['desc']) for k, v in D['stats'].items())
page('<h2 class="ch">O teu reflexo</h2><div class="cols2"><div>' + crop('status_estado', 'O cartão de Estado') + '</div><div>'
     '<ul class="anno"><li><b>Topo:</b> rank, nível, fase do dia, moedas (◇) e Cristais (◆).</li><li><b>Retrato:</b> a tua forma atual e quantos níveis faltam para a próxima.</li><li><b>Título</b> do nível, classe e rank.</li><li><b>XP</b> do nível atual.</li><li><b>Vida e Mana:</b> a vida não volta sozinha; recupera-se com poções ou com o tempo.</li><li><b>Ataque, Ataque mágico, Defesa, Crítico, Dano crítico, Esquiva:</b> calculados a partir dos atributos e do equipamento (o número verde é o bónus do equipamento).</li><li><b>Poder:</b> um resumo da tua força total.</li></ul></div></div>'
     '<h3>Os 5 atributos</h3><div class="attrs">' + attr + '</div>')
page('<h2 class="ch">Pontos, equipamento e registos</h2><div class="cols2"><div>' + crop('status_attr', 'Distribuir pontos') + '<p>Cada nível dá 3 pontos livres. Toca em <b>+</b> para os pôr no atributo que quiseres. As missões também treinam atributos (até 3 por missão), por isso o teu personagem cresce naquilo que realmente treinas na vida.</p></div>'
     '<div>' + crop('status_equip', 'Equipamento') + '<p>4 lugares: <b>Arma</b>, <b>Armadura</b> e <b>2 acessórios</b>. O quadro verde soma tudo o que o equipamento te dá.</p></div></div>'
     '<div class="cols2"><div>' + crop('status_reg', 'Registos') + '</div><div><h3>Os Registos</h3><p>No fundo do Estado ficam as portas para tudo o resto:</p><ul class="dots"><li><b>Loja Premium</b>: a Ala Premium (capítulo XIV).</li><li><b>Habilidades</b> e <b>Conquistas</b>.</li><li><b>Troféus</b>: a sala com o troféu de cada chefe.</li><li><b>Avisos</b> da administração.</li><li><b>Duelos e Amigos</b> e <b>Servos</b>.</li><li><b>Coleção</b> de itens secretos, <b>Histórico</b> de tudo o que aconteceu, <b>Definições</b>, <b>Relatórios</b> semanais e <b>Créditos</b>.</li></ul></div></div>')

# ================= CAP V: MISSÕES =================
opener('V', 'Missões', 'O coração do Sistema', A + 'bosses/b30.webp', 'Responde rápido: qual é a missão mais importante de hoje? A que tens andado a evitar. Exatamente. Vai.')
dif = [[('<span class="dg" style="--c:%s">%s</span>' % (v['color'], k)), v['name'], '+%d' % v['xp'], '+%d' % v['coins'], '+%.2f' % v['stat']] for k, v in D['diff'].items()]
page('<h2 class="ch">Criar uma missão</h2><div class="cols2"><div>' + phone(SH + '06_nova_missao.png', 'Nova missão', 130) + '</div><div>'
     '<ol class="num"><li><b>Nome:</b> o que vais fazer, de forma clara («Correr 5 km no parque»).</li><li><b>Descrição</b> (opcional): os detalhes.</li><li><b>Dificuldade</b> de E a S: decide a recompensa.</li><li><b>Atributos</b>: até 3 que a missão treina.</li><li><b>Repetição:</b> uma vez (com data), todos os dias ou em dias da semana.</li><li><b>Horário de encerramento:</b> o prazo. Depois dele, a missão falha.</li></ol>'
     '<h3>Recompensa base por dificuldade</h3>' + table(['', 'Dificuldade', 'XP', 'Moedas', 'Treino'], dif) +
     '<p class="sm mut">As recompensas crescem com o teu nível e com efeitos ativos (XP em dobro, Selo do Monarca…).</p></div></div>'
     + warn('O Sistema lê o nome e a descrição. Texto sem sentido («asdasd», «kkkk», «teste») é recusado e conta como abuso. Ver o capítulo VII.', 'O Sistema lê tudo'))
fat = [['1 a 5', '100%'], ['6 a 8', '60%'], ['9 a 12', '30%'], ['mais de 12', '10%']]
page('<h2 class="ch">Cumprir, falhar e os limites</h2><div class="cols2"><div>' + crop('m_hoje', 'Missões de hoje') + '</div><div>'
     '<h3>Cumprir</h3><p>Toca em <b>Concluir</b> antes do prazo. Recebes XP, moedas e o treino dos atributos escolhidos. As missões repetidas voltam sozinhas no dia certo.</p>'
     '<h3>Falhar</h3><p>Se o prazo passar, a missão falha: perdes <b>%d%%</b> das moedas e <b>%d%%</b> do XP que ela daria. Nunca desces de nível por falhar uma missão.</p>'
     '<h3>Fadiga</h3><p>O corpo cansa-se. A partir da 6.ª missão do dia, as recompensas descem:</p>' % (D['failc'] * 100, D['failx'] * 100) + table(['Missões no dia', 'Recompensa'], fat) +
     '<h3>Lei do Sistema</h3><ul class="dots"><li>No máximo <b>%d missões novas por dia</b> (as apagadas também contam).</li><li>No máximo 60 missões ativas.</li><li>A Licença do Sistema (Loja) dá mais missões num dia.</li></ul>' % D['mrules']['newPerDay']
     + tip('Uma boa missão é concreta, possível e tem hora: «Estudar inglês 45 minutos até às 21:00» é melhor do que «estudar».', 'Boas missões') + sys('Eu não escolho por ti. Eu só registo o que escolheste não fazer.') + '</div></div>')

# ================= CAP VI: DIÁRIA =================
opener('VI', 'A Missão Diária', 'Sequências, cansaço e a Zona de Penalidade', A + 'bosses/b50.webp', 'Todos os dias há uma missão que não é negociável. Esta.')
page('<h2 class="ch">Treino do Sistema</h2><div class="cols2"><div>' + crop('m_daily', 'A Missão Diária') + '</div><div>'
     '<p class="lead">Todos os dias o Sistema dá-te uma Missão Diária com objetivos concretos. Por omissão: <b>30 flexões, 30 abdominais, 30 agachamentos e 2 km de caminhada ou corrida</b>, até às 23:00.</p>'
     '<ul class="dots"><li>Vai somando o progresso com <b>−</b> e <b>+</b>.</li><li>Quando tudo estiver feito, toca em <b>Concluir Missão Diária</b>: +90 XP, +50 moedas e um baú.</li><li>Em <b>Editar</b> mudas os objetivos e o horário para o teu nível de forma física.</li><li>Cada dia cumprido soma à <b>sequência</b>. Sequências longas dão baús de bónus e conquistas.</li></ul></div></div>'
     '<div class="cols3">' +
     '<div class="card bad">%s<h3>Exausto</h3><p>Falhar a Diária quebra a sequência e deixa-te Exausto: −20%% de XP durante 12 horas.</p></div>' % ui('eff_exausto', 'card-ico') +
     '<div class="card bad">%s<h3>Zona de Penalidade</h3><p>Abre-se durante 24 h, com objetivos 1,5× maiores. Cumprir recupera metade do que perdeste e tira o Exausto. Falhar dobra a perda e custa Integridade.</p></div>' % ui('ui_eye', 'card-ico') +
     '<div class="card">%s<h3>Sequência</h3><p>A tua melhor sequência fica registada. 7, 30, 100 e 365 dias seguidos são conquistas próprias.</p></div>' % ui('ach_d30', 'card-ico') + '</div>'
     + sys('Falhaste a Missão Diária. A penalidade não é uma sugestão. Tens 24 horas para provar que foi só um dia mau.', 'PENALIDADE')
     + '<h3>Como ajustar a tua Diária</h3><div class="cols3"><div class="card"><h3>Começa pequeno</h3><p>Se 30 flexões é demais, põe 10. Uma Diária que cumpres todos os dias vale mais do que uma perfeita que falhas.</p></div><div class="card"><h3>Sobe aos poucos</h3><p>Quando a sequência passar de uma semana, aumenta um pouco os objetivos. O Sistema regista a evolução.</p></div><div class="card"><h3>Escolhe a hora</h3><p>Muda o horário de encerramento para o fim do teu dia real. O lembrete chega 1 hora antes.</p></div></div>')

# ================= CAP VII: VIGILÂNCIA =================
opener('VII', 'A Vigilância do Sistema', 'Integridade, avisos e sentenças', A + 'bosses/b100.webp', 'Não me tentes enganar com missões falsas. Eu reparo sempre. E se reparar, o castigo não é para o personagem. É para ti.')
page('<h2 class="ch">O Olho do Sistema</h2><div class="cols2"><div>' + phone(SH + '23_vigilancia.png', 'Aviso do Sistema', 120) + '</div><div>'
     '<p class="lead">O Sistema protege-se contra quem tenta subir sem fazer nada. Observa o texto das missões e o tempo entre criar e concluir.</p>'
     '<h3>Integridade (0 a 100%)</h3><p>É a tua reputação perante o Sistema. Desce a cada abuso; sobe com missões legítimas e a cada novo dia. Aparece no quadro «Missões de hoje».</p>'
     '<h3>O que conta como abuso</h3><ul class="dots"><li>Nomes sem sentido: «asdasd», «kkkk», «teste».</li><li>Criar e concluir uma missão em poucos minutos (o tempo mínimo depende da dificuldade).</li><li>Mexer no relógio do telemóvel para trás (o Sistema não aceita).</li></ul>'
     '<h3>As sentenças</h3><p>Os avisos escalam e chamam-te pelo nome. Conforme a Integridade, a sentença pode ser: perda de moedas, perda de XP, perda de um nível (com Integridade muito baixa), a <b>Marca do Sistema</b> (−50% nas missões) ou a proibição de criar missões durante 1 a 12 horas.</p></div></div>'
     + tip('A Integridade recupera sozinha. Cumpre missões reais, com tempo realista, e o Olho fecha-se.', 'Registo limpo')
     + '<h3>A escala das consequências</h3>' + table(['Integridade', 'O que pode acontecer'], [['Alta (registo limpo)', 'Um aviso. O Sistema lembra-te das regras.'], ['Média', 'Perda de moedas ou de XP da missão abusada.'], ['Baixa', 'Marca do Sistema (−50% nas missões) ou proibição de criar missões por algumas horas.'], ['Muito baixa', 'Proibição até 12 horas e, nos casos graves, perda de um nível.']])
     + '<div class="cols2"><div class="card">%s<h3>Marca do Sistema</h3><p>Fica visível no Estado enquanto durar. Todas as recompensas das missões descem para metade.</p></div><div class="card">%s<h3>Relógio protegido</h3><p>Se o relógio do telemóvel recuar, a hora aparece a vermelho no topo e o Sistema não aceita missões nesse estado.</p></div></div>' % (ui('eff_marcado', 'card-ico'), ui('h_time', 'card-ico')))

# ================= CAP VIII: SISTEMA VIVO =================
opener('VIII', 'O Sistema Vivo', 'Conversas, emergências e segredos', A + 'bosses/secret_2.webp', 'O Sistema não tem dias bons nem dias maus. Só tem registos. Qual vai ser o de hoje?')
eff = ''.join('<div class="ef %s">%s<b>%s</b></div>' % ('good' if v['good'] else 'bad', ui('eff_' + k, 'ef-img') or '<span class="ef-e">%s</span>' % v['icon'], e(v['name'])) for k, v in D['timed'].items())
page('<h2 class="ch">Conversas do Sistema</h2><div class="cols2"><div>' + phone(SH + '22_conversa.png', 'Uma conversa', 120) + '</div><div>'
     '<p class="lead">O Sistema fala contigo. Há 350 conversas curtas, cada uma com três respostas: <b>obedecer</b>, <b>desafiar</b> ou <b>perguntar</b>.</p>'
     '<ul class="dots"><li>250 surgem por contexto: ao abrir a app, ao olhar para um chefe mortal, depois de vitórias, derrotas, fugas, compras, baús e subidas de nível.</li><li>100 são aleatórias e falam do Sistema, dos portões, da disciplina e da vida real.</li><li>Uma resposta é final: a conversa nunca mais volta. Algumas respostas abrem conversas novas.</li><li>Desafiar pode custar caro (às vezes moedas). Obedecer às vezes compensa.</li><li>No máximo 6 por dia e nunca durante uma batalha. Em Definições podes pô-las Normais, Raras ou Desligadas.</li></ul></div></div>'
     '<h3>Efeitos temporários</h3><p>Algumas poções, sentenças e recompensas deixam um efeito com tempo, visível no topo do Estado:</p><div class="effs">' + eff + '</div>')
ph = ''.join('<div class="pha">%s<b>%s</b><span>%s</span></div>' % (ui('phase_' + k, 'pha-img'), n, d) for k, n, d in [('manha', 'Manhã', '05:00–11:59'), ('dia', 'Dia', '06:00–17:59'), ('crepusculo', 'Crepúsculo', '18:00–20:59'), ('noite', 'Noite', '18:00–05:59'), ('horaMorta', 'Hora Morta', '00:00–02:59')])
page('<h2 class="ch">Um mundo que reage</h2><div class="cols2"><div>'
     '<div class="card">%s<h3>Missões de Emergência</h3><p>Até 2 por dia, entre as 08:00 e as 22:00. Aparecem sem aviso, duram pouco e dão recompensa extra.</p></div>' % ui('log_appear', 'card-ico') +
     '<div class="card">%s<h3>Missões Ocultas</h3><p>7 desafios secretos que se revelam pelo teu comportamento (madrugar, sequências, combate…). Quando aparecem, tens 48 horas para os cumprir.</p></div>' % ui('h_key', 'card-ico') +
     '<div class="card">%s<h3>Relatório semanal</h3><p>Todos os domingos à tarde, o Sistema avalia a tua semana com uma nota de E a S e dá-te um prémio. Ficam guardados em Estado → Relatórios.</p></div>' % ui('h_stats', 'card-ico') +
     '</div><div><div class="card">%s<h3>Saudações e reações</h3><p>Ao abrir a app, o Sistema cumprimenta-te conforme a hora, o tempo que estiveste fora e o teu estado. Reage a marcos: subir de rank, sequências, vencer chefes muito acima do teu nível, reis de portão, níveis 50 e 75.</p></div>' % ui('ui_sysday', 'card-ico') +
     '<div class="card">%s<h3>Lembretes no telemóvel</h3><p>Na app Android: 30 min antes do prazo de cada missão, 1 h antes da Diária, Zona de Penalidade, Missão Oculta a acabar, emergências e ausência (1, 3 e 7 dias). Funcionam com a app fechada.</p></div>' % ui('h_bell', 'card-ico') +
     '<div class="card">%s<h3>Avisos da administração</h3><p>Novidades, eventos e manutenção chegam como avisos (Estado → Avisos). Um Jogador novo só recebe os avisos gerais enviados depois do seu registo.</p></div>' % ui('notice_info', 'card-ico') + '</div></div>'
     '<h3>As fases do dia</h3><p>Certos itens só funcionam numa fase do dia (uma poção da Hora Morta, um elixir do Crepúsculo…). A fase atual aparece no topo da app.</p><div class="phases">' + ph + '</div>')

# ================= CAP IX: COMBATE =================
opener('IX', 'Combate e Portões', '10 portões, 100 chefes', A + 'bosses/b60.webp', 'Lutar acima do teu nível é muito mais perigoso. Lutar abaixo é muito menos útil. Escolhe.')
g = ''.join('<div class="gt" style="--c:%s">%s<div class="gt-b"><div class="gt-h">%s<b>%s · %s</b></div><span>Nv %d–%d · Rei: %s</span><i>Conjunto: %s</i></div></div>' % (
    x['color'], img('bosses/b%d.webp' % (x['id'] * 10), 'gt-img'), ui('gate_%d' % x['id'], 'gt-ico'), x['id'], e(x['name']), x['bosses'][0]['level'], x['bosses'][-1]['level'], e(x['bosses'][-1]['name']), e(x['set'] or '')) for x in D['gates'])
page('<h2 class="ch">Os 10 portões</h2><p class="lead">Cada portão tem 10 chefes, um por nível, do 1 ao 100. Todos estão disponíveis desde o início. Os chefes derrotados não voltam. O último de cada portão é o seu rei, e derrotar os 10 completa o conjunto de troféus (com bónus permanente).</p><div class="gates">' + g + '</div>')
page('<h2 class="ch">Escolher um chefe</h2><div class="cols2"><div>' + crop('combate_grid', 'Os chefes do Pântano Pútrido') + '</div><div>' + phone(SH + '08_chefe.png', 'A ficha do chefe', 118) + '</div></div>'
     '<div class="cols2"><div><h3>As cartas</h3><ul class="dots"><li>O número é o nível do chefe; a cor e a palavra (Fácil, Equilibrado, Difícil, Perigoso, Mortal) mostram o perigo para o teu nível.</li><li>O visto verde marca os derrotados.</li><li>As etiquetas <span class="tag pur">COMANDANTE</span> e <span class="tag red">CHEFE</span> identificam o penúltimo e o último de cada arena.</li></ul></div>'
     '<div><h3>A ficha</h3><p>Antes de lutar, toca no chefe: vês a arte, o nível, o arquétipo (Tanque, Conjurador, Feroz…), a crónica, a vida, o ataque, a defesa e o estilo de combate. Depois toca em <b>Lutar</b>.</p></div></div>')
page('<h2 class="ch">A batalha</h2><div class="cols2"><div>' + phone(SH + '09_batalha.png', 'Combate por turnos', 130) + '</div><div>'
     '<p class="lead">O combate é por turnos. Em cada turno escolhes uma ação:</p>'
     '<div class="acts"><div><b>Atacar</b>Golpe normal, sem custo.</div><div><b>Habilidades</b>Gastam mana e têm recarga.</div><div><b>Itens</b>Poções e itens de combate da Bolsa.</div><div><b>Defender</b>Reduz o dano do próximo golpe.</div><div><b>Fugir</b>Sais da luta (o Sistema regista).</div></div>'
     '<h3>O registo de batalha</h3><p>Por baixo das barras, o registo conta tudo: quem ataca, os críticos, os estados, as falas do chefe e as tuas sombras a lutar.</p>'
     '<h3>Fases</h3><p>Os reis de portão e os Comandantes têm 2 fases; o chefe final, o Soberano do Vazio, tem 3. Quando um chefe muda de fase, fica mais forte e pode enfurecer-se.</p>'
     '<h3>Pressão de nível</h3><p>Se lutares muito acima do teu nível, o chefe ganha vantagem; muito abaixo, és tu que a tens. O registo mostra a vantagem logo no início.</p></div></div>')
stt = ''.join('<div class="stt">%s<b>%s</b></div>' % (ui('st_' + k, 'stt-img'), n) for k, n in [('poison', 'Veneno'), ('burn', 'Queimadura'), ('bleed', 'Sangramento'), ('stun', 'Atordoamento'), ('shield', 'Escudo'), ('buff', 'Bónus'), ('debuff', 'Fraqueza'), ('reflect', 'Reflexo'), ('heal', 'Cura'), ('mana', 'Mana'), ('crit', 'Crítico'), ('summon', 'Invocação')])
sec = ''.join('<div class="sec">%s<div><b>%s</b><span>Nv %d</span></div></div>' % (img('bosses/%s.webp' % b['id'], 'sec-img'), e(b['name']), b['level']) for b in D['secret'])
page('<h2 class="ch">Estados, vitórias e segredos</h2><h3>Estados de combate</h3><div class="states">' + stt + '</div>'
     '<div class="cols2"><div><h3>Depois da vitória</h3><ul class="dots"><li>XP, moedas e por vezes itens ou habilidades raras.</li><li>O <b>troféu</b> do chefe vai para a Sala de Troféus.</li><li>A <b>sombra</b> do chefe fica à espera de ser extraída (capítulo XIII).</li></ul>'
     '<h3>Morrer num portão</h3><p>Morrer contra um chefe dos portões custa caro: <b>desces um nível</b> (perdes o XP do nível e 3 pontos de atributo). O Sistema reanima-te com 10% da vida; bebe poções antes de voltar. Nas arenas premium não se perde nível, só 25% do XP do nível. Se a luta correr mal, <b>Fugir</b> é uma opção.</p></div>'
     '<div><h3>Os chefes ocultos</h3><p>Há dois chefes fora dos portões. Aparecem num separador próprio, «Oculto», só quando cumpres as condições certas.</p><div class="secs">' + sec + '</div></div></div>'
     + sys('Vitória registada. A sombra do teu adversário ainda não partiu. Queres que ela te sirva?', 'VITÓRIA'))

# ================= CAP X: HABILIDADES =================
opener('X', 'Habilidades', '124 técnicas, ativas e passivas', A + 'bosses/b80.webp', 'Uma habilidade sem mana é só uma ideia. Uma ideia sem disciplina é só um desejo.')
mk = ''.join('<div class="skc">%s<b>%s</b><span>Nv %d</span></div>' % (img('skills/%s.webp' % s['id'], 'skc-img'), e(s['name']), s['unlock']) for s in CL['mago']['skills'])
ssk = ''.join('<li>%s<b>%s</b> %s</li>' % (img('skills/%s.webp' % s['id'], 'skico'), e(s['name']), e(s['desc'])) for s in D['secretSkills'][:10])
page('<h2 class="ch">As habilidades</h2><div class="cols2"><div>' + phone(SH + '09b_batalha_hab.png', 'Habilidades em combate', 118) + '</div><div>'
     '<p class="lead">Cada classe tem 18 habilidades próprias, desbloqueadas do nível 1 ao 100. Há ainda 6 habilidades gerais e 10 secretas.</p>'
     '<ul class="dots"><li><b>Ativas:</b> usam-se em combate, gastam mana (MP) e têm recarga em turnos.</li><li><b>Passivas:</b> funcionam sempre (por exemplo +15% de mana máxima).</li><li>Toca no ícone de uma habilidade para ler o que faz.</li><li>A lista completa está em Estado → Habilidades.</li></ul>'
     '<h3>Exemplo: as 18 do Mago</h3><div class="skgrid">' + mk + '</div></div></div>'
     '<h3>As 10 habilidades secretas</h3><p>Não aparecem na lista até as encontrares: caem de chefes, de baús secretos ou de missões ocultas.</p><ul class="ssk">' + ssk + '</ul>')

# ================= CAP XI: LOJA, BOLSA, ITENS =================
opener('XI', 'Loja, Bolsa e Itens', '%d itens, 7 raridades, 30 baús' % D['itemsN'], A + 'items/w_guerreiro_10_camp.webp', 'Tudo tem preço. A pergunta é se o pagas com moedas ou com desculpas.')
page('<h2 class="ch">A Loja</h2><div class="row3">' + phone(SH + '10_loja.png', 'Armas da tua classe', 105) + phone(SH + '10c_loja_lazer.png', 'Lazer: recompensas reais', 105) + phone(SH + '10b_loja_baus.png', 'Baús', 105) + '</div>'
     '<div class="cols2"><div><h3>Os separadores</h3><ul class="dots"><li><b>Lazer:</b> recompensas da vida real (uma série, um café, um jogo…). Podes criar as tuas: compras com moedas e cumpres na vida real.</li><li><b>Armas</b> da tua classe, <b>Armaduras</b>, <b>Acessórios</b>.</li><li><b>Poções:</b> vida, mana, bónus de combate, XP em dobro, sorte.</li><li><b>Atributos:</b> elixires permanentes.</li><li><b>Baús</b> e <b>Sistema:</b> artefactos especiais.</li></ul></div>'
     '<div><h3>Comprar e vender</h3><p>Cada item pede um nível mínimo e, às vezes, um chefe derrotado. Os itens que ainda não podes usar aparecem bloqueados. Na Bolsa podes vender o que não precisas.</p>'
     + tip('Cria recompensas de Lazer com o que gostas de fazer. Assim, as moedas que ganhas nas missões compram descanso merecido na vida real.', 'Lazer') + '</div></div>')
RS = [('comum', 'w_guerreiro_1'), ('incomum', 'w_mago_3'), ('raro', 'w_assassino_5'), ('epico', 'w_arqueiro_7'), ('lendario', 'w_guardiao_9'), ('mitico', 'w_invocador_10'), ('secreto', 'sx_nucleo')]
rar = ''.join('<div class="rr" style="--c:%s">%s<b>%s</b></div>' % (D['rarity'][k]['color'], img('items/%s.webp' % i), D['rarity'][k]['name']) for k, i in RS)
var = ''.join('<div class="vr">%s<b>%s</b><span>%s</span></div>' % (img('items/w_guerreiro_8%s.webp' % s), n, d) for s, n, d in [('', 'Base', 'a versão comum'), ('_art', 'do Artesão', 'prateada e azul, mais refinada'), ('_camp', 'do Campeão', 'ouro e carmesim, a mais forte')])
page('<h2 class="ch">Raridades e versões</h2><p class="lead">Cada item tem uma raridade, que se vê na cor do brilho. Quanto mais rara, mais forte e mais difícil de encontrar.</p><div class="rars">' + rar + '</div>'
     '<h3>As três versões de cada arma</h3><p>As armas e muitas armaduras existem em três versões. As melhores caem de chefes e de baús de grau alto.</p><div class="vars">' + var + '</div>'
     '<div class="cols2"><div>' + phone(SH + '11_bolsa.png', 'A Bolsa', 100) + '</div><div><h3>A Bolsa</h3><p>Guarda tudo o que tens: poções, equipamento, baús e itens secretos. Toca num item para o ver, usar, equipar ou vender. Os baús abrem-se aqui.</p>' + phone(SH + '25_bau.png', 'Abrir um baú', 70) + '</div></div>')
gr = D['chestGrades']; fams = D['chestFams']
chest = '<table class="chest"><tr><th></th>' + ''.join('<th>%s<br><span class="mut sm">Nv %d+</span></th>' % (x['name'], x['lvl']) for x in gr) + '</tr>' + ''.join(
    '<tr><td><b>%s</b><br><span class="sm mut">%s</span></td>%s</tr>' % (f['name'], e(f['what']), ''.join('<td>%s<div class="sm">%s ◇</div></td>' % (img('items/bau_%s_%d.webp' % (f['id'], k + 1), 'chimg'), '{:,}'.format(f['price'][k]).replace(',', ' ')) for k in range(5))) for f in fams) + '</table>'
page('<h2 class="ch">Os baús especializados</h2><p class="lead">Além dos baús clássicos (Comum, Raro, Épico, Lendário e Secreto), há 5 famílias de baús especializados, cada uma só com um tipo de item, em 5 graus. Quanto melhor o grau, mais alto o nível dos itens e mais versões do Artesão e do Campeão.</p>' + chest +
     '<div class="classic">' + ''.join('<div>%s<b>%s</b></div>' % (img('items/bau_%s.webp' % k), n) for k, n in [('comum', 'Comum'), ('raro', 'Raro'), ('epico', 'Épico'), ('lendario', 'Lendário'), ('secreto', 'Secreto')]) + '</div>'
     + tip('Os graus Ouro, Dragão e Monarca também se compram com Cristais na Loja Exclusiva, sem esperar pelo nível nem pelos chefes.', 'Premium'))

# ================= CAP XII: TROFÉUS E CONQUISTAS =================
opener('XII', 'Troféus e Conquistas', 'A prova de tudo o que fizeste', A + 'trophies/b100.webp', 'Os troféus não servem para nada. Exceto para lembrar o que já foste capaz de fazer.')
tr = ''.join('<div class="trf">%s<b>%s</b></div>' % (img('trophies/b%d.webp' % i), '') for i in [10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
page('<h2 class="ch">A Sala de Troféus</h2><div class="cols2"><div>' + phone(SH + '12_trofeus.png', 'A Sala de Troféus', 118) + '</div><div>' + phone(SH + '12b_trofeu.png', 'A ficha de um troféu', 118) + '</div></div>'
     '<p>Cada chefe derrotado deixa um troféu: %d ao todo, contando os das arenas premium. Toca num troféu para o ver em grande, com a sua história, a raridade e a data em que foi conquistado. Juntar os 10 troféus de um portão ativa um <b>bónus de conjunto permanente</b> (por exemplo +5 Vitalidade).</p>'
     '<div class="trs">%s</div><p class="cap">Os troféus dos 10 reis dos portões</p><div class="trs">%s</div><p class="cap">As Coroas dos 10 Campeões do Coliseu</p>' % (202, tr, ''.join('<div class="trf">%s</div>' % img('trophies/ar%d.webp' % i) for i in range(1, 11)))
     + sys('Os troféus não servem para nada. Exceto para lembrar o que já foste capaz de fazer. E para provar a quem duvida.', 'SALA DE TROFÉUS'))
ach = ''.join('<div class="ac">%s</div>' % ui(i, 'ac-img') for i in ['ach_m1', 'ach_m10', 'ach_m100', 'ach_m1000', 'ach_l5', 'ach_l25', 'ach_l50', 'ach_l100', 'ach_b1', 'ach_b10', 'ach_b50', 'ach_b100', 'ach_d7', 'ach_d30', 'ach_d365', 'ach_sh1', 'ach_sh25', 'ach_sh100', 'ach_shking', 'ach_duel1', 'ach_duel10', 'ach_duel50', 'ach_ar_1', 'ach_ar_10', 'ach_rich', 'ach_rich3', 'ach_secretboss', 'ach_eternal', 'ach_hid10', 'ach_core', 'ach_tr202', 'ach_body30', 'ach_friend20', 'ach_spar25', 'ach_emg10', 'ach_zone1'])
cats = ''.join('<div class="ct">%s<b>%s</b></div>' % (ui('achcat_' + k, 'ct-img'), n) for k, n in [('missoes', 'Missões e disciplina'), ('progresso', 'Progresso e poder'), ('combate', 'Combate e portões'), ('sombras', 'Sombras e servos'), ('coliseu', 'Coliseu'), ('trofeus', 'Troféus'), ('riqueza', 'Riqueza e coleção'), ('exclusiva', 'Loja Exclusiva e aparência'), ('corpo', 'Corpo e peso'), ('outras', 'Outras')])
page('<h2 class="ch">Conquistas</h2><div class="cols2"><div>' + phone(SH + '15_conquistas.png', 'As medalhas', 118) + '</div><div>'
     '<p class="lead">%d conquistas em 10 categorias. Cada uma tem uma medalha e uma recompensa (baús, moedas, habilidades, molduras).</p><div class="cats">%s</div>'
     '<p>Há conquistas secretas: aparecem como «???» até as desbloqueares.</p></div></div><h3>Algumas das medalhas</h3><div class="achs">%s</div>' % (D['achN'], cats, ach)
     + tip('Toca numa medalha para ver o que falta para a ganhar. A barra no topo mostra a percentagem de conquistas completas.', 'Progresso'))

# ================= CAP XIII: SOMBRAS =================
opener('XIII', 'Sombras e Servos', 'ERGA-SE', A + 'shadows/b100.webp', 'O chefe caiu. Mas a sombra dele ainda não partiu. Diz a palavra.')
shg = ''.join('<div class="shd">%s</div>' % img('shadows/%s.webp' % i) for i in ['b10', 'b20', 'b30', 'b40', 'b50', 'b60', 'b70', 'b80', 'b90', 'b100'])
roles = ''.join('<div class="card"><h3>%s</h3><p>%s</p></div>' % (v['name'], e(v['desc']).replace('Tenente', 'Comandante')) for v in D['shroles'].values())
page('<h2 class="ch">Tornar Servo</h2><div class="cols2"><div>' + crop('servos_regras', 'As regras das sombras') + '</div><div>'
     '<p class="lead">Quando derrotas um chefe, a sua sombra fica para trás. Tens <b>3 tentativas</b> para a extrair (o botão <b>ERGA-SE</b>). Se conseguires, ela torna-se tua serva para sempre.</p>'
     '<ul class="dots"><li>A probabilidade depende do chefe e do teu nível (os reis são mais difíceis). O Invocador tem bónus.</li><li>A sombra de um chefe dos portões desvanece ao fim de 24 h se não a extraíres. As das arenas premium nunca desvanecem.</li><li>Se as 3 tentativas falharem, a sombra fica <b>selada</b> e só se obtém com Cristais.</li><li>Podes dar um nome a cada sombra.</li></ul></div></div>'
     '<h3>Preço para quebrar o selo (Cristais)</h3>' + table(['', 'Normal', 'Comandante (penúltimo)', 'Chefe da arena (último)'], [['Portões', '50', '150', '300'], ['Arenas premium', '100', '300', '500']]) +
     '<div class="shds">' + shg + '</div><p class="cap">As sombras dos 10 reis dos portões</p><div class="shds">' + ''.join('<div class="shd">%s</div>' % img('shadows/ar%d.webp' % i) for i in range(1, 11)) + '</div><p class="cap">As sombras dos 10 Campeões do Coliseu (nunca desvanecem)</p>')
page('<h2 class="ch">O exército</h2><div class="cols2"><div>' + crop('servos_conv', 'Os servos convocados') + '</div><div>'
     '<h3>Convocar</h3><p>Tens <b>3 lugares</b> de servos convocados (+1 para o Invocador). Os convocados lutam ao teu lado em todos os combates. A Insígnia do General das Sombras (Loja Exclusiva) dá até +3 lugares.</p>' + img('items/pr_general.webp', 'pr-big') +
     '<h3>Treinar com uma sombra</h3><p>Podes lutar contra as tuas próprias sombras para treinar. No fim do treino, o Sistema aparece e cura-te, e devolve-te os itens e a mana que gastaste. Perder contra um servo tem o seu preço: o Sistema não deixa passar.</p></div></div>'
     '<h3>Os papéis dos servos</h3><div class="cols4">' + roles + '</div>'
     '<h3>Um exército de 200 sombras</h3><p>Cada chefe dos portões e das arenas tem a sua sombra: o mesmo ser, agora feito de fumo negro e luz violeta. Junta-as todas no Exército das Sombras.</p><div class="shds">' + ''.join('<div class="shd">%s</div>' % img('shadows/b%d.webp' % i) for i in [3, 14, 27, 36, 45, 58, 63, 77, 84, 99]) + '</div>' + sys('Perdeste para um servo. O teu próprio servo. QUE VERGONHA.', 'TREINO'))

# ================= CAP XIV: PREMIUM =================
opener('XIV', 'A Ala Premium', 'Cristais, Loja Exclusiva e o Coliseu dos Condenados', A + 'arenas/ar1.webp', 'Algumas portas não se abrem com disciplina. Abrem-se com Cristais. O que está do outro lado continua a exigir disciplina.')
prs = ''.join('<div class="pri">%s<b>%s</b></div>' % (img('items/%s.webp' % i), n) for i, n in [('pr_coroa', 'Coroa'), ('pr_lamina', 'Lâmina'), ('pr_armadura', 'Armadura'), ('pr_fenix', 'Fénix'), ('pr_executor', 'Executor'), ('pr_egide', 'Égide'), ('pr_tempo', 'Tempo'), ('pr_olho', 'Olho'), ('pr_trevo', 'Trevo'), ('pr_selo', 'Selo')])
page('<h2 class="ch">Cristais e a Loja Exclusiva</h2><div class="row3">' + phone(SH + '18_premium_loja.png', 'Loja Exclusiva', 105) + phone(SH + '18_premium_obter.png', 'Obter Cristais', 105) + phone(SH + '18_premium_moedas.png', 'Comprar Moedas', 105) + '</div>'
     '<div class="cols2"><div><h3>Os Cristais (◆)</h3><p>São a moeda premium. Só se obtêm com códigos de resgate comprados com dinheiro real (ou oferecidos pelo Sistema). Na Loja Exclusiva compram:</p><ul class="dots"><li><b>Equipamento soberano</b>, que acompanha o teu nível.</li><li><b>Relíquias</b> de combate (limite de 1 por batalha).</li><li><b>Tesouros</b>, baús especializados de grau alto.</li><li><b>Proteções e atalhos</b> e o <b>Câmbio</b> (Cristais → moedas).</li><li>A Insígnia do General das Sombras.</li></ul></div>'
     '<div><h3>Como comprar</h3><ol class="num"><li>Escolhe o pacote e toca em <b>Comprar pelo WhatsApp</b>.</li><li>Paga por <b>MULTICAIXA Express</b> com os dados que recebes.</li><li>Recebes um <b>código de resgate</b> (ou a compra entra sozinha).</li><li>Escreve o código em «Resgatar código». Cada código só credita uma vez.</li></ol>'
     + warn('Fala só com o número oficial. Nunca te pediremos o PIN nem códigos de confirmação do banco.', 'Segurança') + '</div></div><div class="pris">' + prs + '</div>')
cp = [[e(x['name']), '%d ◆' % x['crystals'], ('+%d' % x['bonus']) if x['bonus'] else '—', '{:,} Kz'.format(x['price_kz']).replace(',', ' ')] for x in D['cpacks']]
mp = [[e(x['name']), '{:,} ◇'.format(x['coins']).replace(',', ' '), ('+{:,}'.format(x['bonus']).replace(',', ' ')) if x['bonus'] else '—', '{:,} Kz'.format(x['price_kz']).replace(',', ' ')] for x in D['mpacks']]
fr = ''.join('<div class="frm">%s<b>%s</b><span>%s</span></div>' % (img('frames/%s.webp' % c['id']), e(c['name'].replace('Moldura ', '')), ('%d ◆' % c['crystals']) if c['crystals'] else 'recompensa') for c in D['cos'] if c['kind'] == 'moldura')
page('<h2 class="ch">Pacotes, moedas e aparência</h2><div class="cols2"><div><h3>Pacotes de Cristais</h3>' + table(['Pacote', 'Cristais', 'Bónus', 'Preço'], cp) + '</div><div><h3>Pacotes de moedas</h3><p class="sm">Para quem só quer moedas para a Loja.</p>' + table(['Pacote', 'Moedas', 'Bónus', 'Preço'], mp) + '</div></div>'
     '<div class="cols2"><div>' + phone(SH + '18_premium_aparencia.png', 'Aparência', 95) + '</div><div><h3>Aparência</h3><p>Molduras para o retrato e assinaturas coloridas para o nome. São só visuais: não dão vantagens, só estilo.</p><div class="frms">' + fr + '</div></div></div>')
ars = ''.join('<div class="arn" style="--c:%s"><div class="arn-bg" style="background-image:url(%s)"></div>%s<div class="arn-b"><span>ARENA %d · %d ◆</span><b>%s</b><i>%s · Nv %d</i></div></div>' % (
    a['color'], bg('arenas/ar%d.webp' % a['arena'], 700), img('bosses/%s.webp' % a['id'], 'arn-c'), a['arena'], a['cost'], e(a['arenaName']), e(a['name']), a['level']) for a in D['arenas'])
page('<h2 class="ch">O Coliseu dos Condenados</h2><p class="lead">10 arenas exclusivas. Cada uma tem 10 combates em escada: 9 Guardiões, o 9.º é o Comandante (2 fases), e no fim o Campeão (3 fases), com uma mecânica própria. Abre-se uma vez com Cristais e fica aberta para sempre.</p><div class="arenas">' + ars + '</div>')
MEC = ['execução', 'esquiva em pétalas', 'roubo de mana', 'rebobinar o tempo', 'renascer das cinzas', 'reflexo partido', 'pele de pedra rúnica', 'tempestade', 'jardim venenoso', 'fúria crescente']
page('<h2 class="ch">Dentro de uma arena</h2><div class="cols2"><div>' + crop('arena_lad', 'A escada da Arena do Eclipse Escarlate') + '</div><div>'
     '<h3>A escada</h3><p>Os adversários lutam-se por ordem. Cada vitória abre o seguinte. Os seguintes aparecem como «???» até chegares perto. Cada adversário vencido volta 20 horas depois para revanche.</p>'
     '<h3>Os Campeões</h3><p>Cada um tem dossiê, falas, fases e uma mecânica que muda a luta:</p><ul class="mec">' + ''.join('<li><b>%s</b> %s</li>' % (e(a['name'].split(',')[0]), MEC[i]) for i, a in enumerate(D['arenas'])) + '</ul>'
     '<h3>Recompensas</h3><p>Relíquias, troféus próprios (a Coroa de cada Campeão), sombras que nunca desvanecem, conquistas do Coliseu e molduras.</p></div></div>')

# ================= CAP XV: DUELOS =================
opener('XV', 'Duelos, Amigos e Patentes', 'Contra Jogadores reais', A + 'ui/pt_40.webp', 'Até agora lutaste contra o que os portões te deram. Agora há alguém do outro lado. Alguém que também cumpre missões.')
page('<h2 class="ch">Duelos e Amigos</h2><div class="row3">' + phone(SH + '19_social.png', 'O teu cartão social', 105) + phone(SH + '19b_duelos.png', 'A Arena de Duelos', 105) + phone(SH + '21_nova_patente.png', 'Nova patente', 105) + '</div>'
     '<div class="cols2"><div><h3>Amigos e conversas</h3><ul class="dots"><li>Adiciona amigos pelo <b>ID de Jogador</b> (SIS-…) ou pelo nome.</li><li>Vês quem está online e há quanto tempo os outros estiveram.</li><li>Conversa por texto com os teus amigos.</li><li>Desafia um amigo para um duelo com um toque.</li></ul>'
     '<h3>Salas de duelo</h3><p>Cria uma sala <b>pública</b> (aparece em «Salas abertas») ou <b>privada</b> (partilhas o código de 6 letras).</p></div>'
     '<div><h3>As regras do duelo</h3><ul class="dots"><li>1 contra 1, por turnos, com o mesmo ecrã do combate contra chefes.</li><li>Cada um usa os seus atributos, habilidades, itens (com limite de poções) e servos convocados.</li><li>45 segundos por jogada. Deixar passar o tempo duas vezes é derrota.</li><li>O servidor decide cada golpe: ninguém consegue fazer batota.</li><li>As recompensas (XP e moedas) entram nos primeiros 5 duelos de cada dia.</li></ul></div></div>')
pt = '<div class="pts">' + ''.join('<div class="ptr"><div class="ptr-h" style="color:%s">%s</div>%s</div>' % (t['color'], e(t['name']), ''.join('<div class="pt">%s<b>%s</b><span>%d</span></div>' % (ui('pt_%d' % (k * 5 + d), 'pt-img') or '<span class="pt-fb" style="color:%s">◆</span>' % t['color'], ['I', 'II', 'III', 'IV', 'V'][d], (k * 5 + d) * 5) for d in range(5))) for k, t in enumerate(D['tiers'])) + '</div>'
page('<h2 class="ch">As patentes</h2><div class="cols2"><div><p class="lead">Cada vitória num duelo dá <b>+1 ponto de patente</b> e cada derrota tira <b>1</b> (nunca abaixo de 0). A cada 5 pontos sobes uma patente. Se desceres abaixo do limite, voltas à anterior.</p>'
     '<p>São 8 escalões com 5 divisões (I a V), dos 0 aos 199 pontos. Aos <b>200 pontos</b> chega-se a <b>Monarca dos Duelos</b>. Daí para a frente os pontos continuam a contar, mas a patente só muda se voltares aos 199.</p></div><div class="monarca">' + ui('pt_40', 'mon-img') + '<b>Monarca dos Duelos</b><span>200 pontos ou mais</span></div></div>' + pt)

# ================= CAP XVI: CORPO E DEFINIÇÕES =================
opener('XVI', 'Corpo, Definições e a tua conta', 'Cuidar do Jogador e do registo', A + 'avatars/guardiao/100.webp', 'O registo não se perde. A menos que o deixes cair.')
page('<h2 class="ch">Corpo e peso</h2><div class="cols2"><div>' + crop('m_corpo', 'Corpo e peso') + '</div><div>'
     '<p class="lead">No separador Missões há um registo de corpo e peso. Escreve o teu peso (e, se quiseres, altura, idade, sexo e atividade física) e escolhe o objetivo: manter, ganhar ou perder peso.</p>'
     '<ul class="dots"><li>O Sistema estima as calorias de manutenção (fórmula de Mifflin-St Jeor) e quanto comer para ganhar ou perder 1 kg a um ritmo saudável.</li><li>Um registo por dia; o gráfico mostra a evolução.</li><li>Há conquistas para quem regista o peso 7 e 30 dias.</li></ul>'
     + warn('São estimativas. Não substituem um profissional de saúde.', 'Saúde') + '</div></div>'
     + '<h3>Liga o corpo às missões</h3><div class="cols3"><div class="card">%s<h3>Força</h3><p>Treino de força, ginásio, flexões: escolhe Força e Vitalidade na missão.</p></div><div class="card">%s<h3>Resistência</h3><p>Corrida, caminhada, bicicleta: Vitalidade e Agilidade.</p></div><div class="card">%s<h3>Mente</h3><p>Leitura, estudo, meditação: Inteligência e Percepção.</p></div></div>' % (ui('stat_str', 'card-ico'), ui('stat_vit', 'card-ico'), ui('stat_int', 'card-ico'))
     + sys('O teu corpo também é um registo. E esse não se transfere para outro aparelho.', 'CORPO'))
page('<h2 class="ch">Definições e salvamento</h2><div class="cols2"><div>' + phone(SH + '17_definicoes.png', 'Definições', 120) + '</div><div>'
     '<h3>O salvamento</h3><ul class="dots"><li>Cada ganho ou perda é gravado no momento, com assinatura; se uma gravação se estragar, a app usa a cópia anterior.</li><li>No Android fica também no armazenamento nativo da app.</li><li>Uma batalha a meio continua de onde ficou.</li><li>Ao abrir a app, os prazos dos dias em que esteve fechada (até 7) são verificados uma única vez.</li></ul>'
     '<h3>Transferir a conta</h3><p>Em Definições → Transferir para outro aparelho, gera-se um código curto que cabe numa mensagem. O aparelho que o gera perde a conta nesse instante: só há uma conta ativa de cada vez. No telemóvel novo, escolhe «Tenho um código de transferência».</p>'
     '<h3>Outras definições</h3><p>Frequência das Conversas do Sistema, animações, sons, lembretes e as autorizações de avisos do telemóvel.</p></div></div>')

# ================= GLOSSÁRIO E FAQ =================
TOC.append(('', 'Glossário', len(pages) + 1))
GL = [('Atributos', 'Força, Agilidade, Vitalidade, Inteligência e Percepção.'), ('Baú', 'Caixa que dá itens ao acaso; abre-se na Bolsa.'), ('Chefe da arena', 'O último chefe de cada portão ou arena.'),
      ('Comandante', 'O penúltimo chefe de cada portão ou arena.'), ('Cristais (◆)', 'Moeda premium, obtida com códigos de resgate.'), ('Exausto', '−20% de XP durante 12 h, por falhar a Diária.'),
      ('Fadiga', 'Recompensas menores depois de 5 missões no mesmo dia.'), ('ID de Jogador', 'O teu código único (SIS-…), para amigos, compras e apoio.'), ('Integridade', 'A tua reputação perante o Sistema, de 0 a 100%.'),
      ('Marca do Sistema', 'Sentença: −50% nas recompensas das missões.'), ('Missão Diária', 'O treino obrigatório de cada dia.'), ('Missão Oculta', 'Desafio secreto revelado pelo teu comportamento.'),
      ('Moedas (◇)', 'A moeda normal do jogo, ganha com missões e chefes.'), ('Patente', 'O teu posto nos duelos, a cada 5 pontos.'), ('Portão', 'Conjunto de 10 chefes. Há 10 portões.'),
      ('Rank', 'A tua categoria de caçador: E, D, C, B, A, S, SS, SSS, Ω.'), ('Relíquia', 'Item premium de combate, 1 por batalha.'), ('Selada', 'Sombra que só se obtém com Cristais.'),
      ('Sequência', 'Dias seguidos com a Diária cumprida.'), ('Servo', 'Sombra extraída que luta ao teu lado.'), ('Zona de Penalidade', '24 h de objetivos maiores depois de falhar a Diária.')]
page('<h2 class="ch">Glossário</h2><dl class="gl">' + ''.join('<dt>%s</dt><dd>%s</dd>' % (a, b) for a, b in GL) + '</dl>')
TOC.append(('', 'Perguntas frequentes', len(pages) + 1))
FAQ = [('Perco o meu progresso se desinstalar a app?', 'Antes de desinstalar ou mudar de telemóvel, usa Transferir conta em Definições e guarda o código.'),
       ('Posso descer de nível?', 'Falhar missões nunca te faz descer. Desces um nível se morreres contra um chefe dos portões, ou por uma sentença do Sistema com Integridade muito baixa.'),
       ('Os chefes derrotados voltam?', 'Os dos portões não. Os das arenas premium voltam 20 h depois para revanche.'),
       ('Qual é a melhor classe?', 'Nenhuma. A força das classes foi calibrada com milhares de combates simulados. Escolhe o estilo que te agrada.'),
       ('Preciso de pagar para jogar?', 'Não. Tudo o que é essencial se ganha com missões. A Ala Premium dá atalhos, arenas extra e aparência.'),
       ('Porque é que o Sistema recusou a minha missão?', 'O nome não fazia sentido ou parecia de teste. Escreve uma tarefa real e clara.'),
       ('Perdi um duelo. Perdi alguma coisa?', 'Só 1 ponto de patente. Não perdes itens, moedas nem XP.'),
       ('Como desligo as conversas do Sistema?', 'Em Definições → Conversas do Sistema: Normais, Raras ou Desligadas.'),
       ('O meu relógio está atrasado e a app avisa.', 'O Sistema não aceita voltar no tempo. Acerta a hora automática do telemóvel.')]
page('<h2 class="ch">Perguntas frequentes</h2><div class="faq">' + ''.join('<div class="q"><b>%s</b><p>%s</p></div>' % (a, b) for a, b in FAQ) + '</div>' + sys('Já sabes tudo o que precisas. O resto não está escrito. Está à tua espera. Começa.'))

# ================= CONTRACAPA =================
pages.append({'cls': 'back', 'num': False, 'chapter': None, 'body': '<div class="bk-art" style="background-image:url(%s)"></div><div class="cv-veil"></div><div class="bk-in">%s<div class="cv-k">[ SISTEMA ]</div><h2>O registo está aberto.</h2><p>O Sistema · RPG da vida real<br>Android e web</p><div class="cv-line"></div><p class="cv-by">Criado por <b>Delcio Cunha</b></p></div>' % (bg('avatars/mago/100.webp'), ui('ui_eye', 'cv-eyeimg'))})

# índice
toc = '<h2 class="ch">Índice</h2><div class="toc">' + ''.join('<div class="ti%s"><span class="tn">%s</span><span class="tt">%s</span><span class="tp">%d</span></div>' % (' main' if n else '', n, e(t), p) for n, t, p in TOC) + '</div>'
pages[TOC_AT]['body'] = toc

css = open('/home/claude/livro/book.css').read()
fonts = ''.join('<link rel="stylesheet" href="%s%s.css">' % (F, x) for x in ['oxanium/500', 'oxanium/600', 'oxanium/700', 'oxanium/800', 'barlow/400', 'barlow/500', 'barlow/600', 'barlow/700', 'barlow/400-italic', 'jetbrains-mono/400', 'cinzel/700', 'cinzel/900'])
out = ['<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>O Livro do Sistema</title>', fonts, '<style>', css, '</style></head><body>']
for i, p in enumerate(pages):
    n = i + 1
    foot = '<div class="foot"><span>O LIVRO DO SISTEMA</span><span class="fn">%d</span></div>' % n if p['num'] else ''
    out.append('<section class="page %s"><div class="frame"></div><div class="inner">%s</div>%s</section>' % (p['cls'], p['body'], foot))
out.append('</body></html>')
open('/home/claude/livro/livro.html', 'w').write('\n'.join(out))
print(len(pages), 'páginas')
