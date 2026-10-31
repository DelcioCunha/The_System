#!/usr/bin/env python3
"""Gera as páginas do site oficial (site/*.html) a partir de um modelo comum.
Cada página tem o mesmo topo, menu, rodapé e scripts; só muda o conteúdo.
Uso: python3 tools/build-site.py"""
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site')

PAGES = [
    ('index.html', 'Início'),
    ('jogo.html', 'O jogo'),
    ('duelos.html', 'Duelos'),
    ('lojas.html', 'Lojas'),
    ('sistema-vivo.html', 'Sistema vivo'),
    ('comprar.html', 'Comprar'),
]

WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.2-.3-.2-.5-.3Z"/></svg>'
DL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 3h2v9.2l3.3-3.3 1.4 1.4L12 16l-5.7-5.7 1.4-1.4 3.3 3.3V3Zm-7 14h2v2h12v-2h2v4H4v-4Z"/></svg>'


def shell(file, title, desc, body):
    nav = ''.join('<a href="%s"%s>%s</a>' % (f, ' aria-current="page"' if f == file else '', n) for f, n in PAGES[1:])
    return '''<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
<meta name="theme-color" content="#060A14">
<meta property="og:title" content="%(title)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:image" content="img/og.png">
<link rel="icon" href="img/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Oxanium:wght@500;600;700;800&display=swap">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<header class="top">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="Sistema"><img class="wm" src="img/logo-nome.webp" alt="Sistema"></a>
    <nav class="nav" aria-label="Páginas">%(nav)s</nav>
    <a class="btn sm cta-top" href="comprar.html">Obter o Sistema</a>
    <button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>
<main>
%(body)s
</main>
<footer>
  <div class="wrap cols">
    <div>
      <a class="brand" href="index.html" style="font-size:18px"><img src="img/icon-192.png" alt="">Sistema</a>
      <p style="margin-top:12px;max-width:40ch">Um RPG para Android em que a tua vida real é o jogo. Criado em Angola por Delcio Cunha. © 2026</p>
    </div>
    <div>
      <h4>Páginas</h4>
      <ul>%(foot)s</ul>
    </div>
    <div>
      <h4>Contacto</h4>
      <ul>
        <li><a data-buy href="comprar.html">WhatsApp</a></li>
        <li><a href="https://www.instagram.com/delcio_369/" target="_blank" rel="noopener">Instagram</a></li>
        <li><a href="https://www.facebook.com/delcio.cunha.2025/" target="_blank" rel="noopener">Facebook</a></li>
        <li><a href="https://x.com/DelcioCunha369" target="_blank" rel="noopener">X</a></li>
        <li><a href="https://delciocunha.github.io/Meu-Portfolio/" target="_blank" rel="noopener">Portfólio do criador</a></li>
      </ul>
    </div>
  </div>
</footer>
<div class="mbar" id="mbar"><a class="btn wa" data-buy href="comprar.html">Comprar código</a><a class="btn" data-apk data-apk-short href="download/sistema.apk" download>Descarregar APK</a></div>
<script src="config.js"></script>
<script src="assets/site.js"></script>
</body>
</html>
''' % {'title': title, 'desc': desc, 'nav': nav, 'body': body,
       'foot': ''.join('<li><a href="%s">%s</a></li>' % (f, n) for f, n in PAGES)}


def head(icon, crumb, h1, lead, extra=''):
    return '''<section class="page-head">
  <canvas class="field" aria-hidden="true"></canvas><div class="scan" aria-hidden="true"></div>
  <div class="wrap">
    <div class="crumb"><img src="img/%s" alt="">%s</div>
    <h1>%s</h1>
    <p class="lead">%s</p>%s
  </div>
</section>''' % (icon, crumb, h1, lead, extra)


def cta(title='Pronto para seres escolhido?', text='Descarrega o APK, compra o teu código de ativação e começa no nível 1.'):
    return '''<section>
  <div class="wrap">
    <div class="cta-band rv">
      <div><h2>%s</h2><p>%s</p></div>
      <div class="btns"><a class="btn wa" data-buy href="comprar.html">%s Comprar o código</a><a class="btn" href="comprar.html">Ver como funciona</a></div>
    </div>
  </div>
</section>''' % (title, text, WA_ICON)


def gitem(sym, color, name, desc, price=None):
    pr = '<span class="pr"><img src="img/ui-ui-crystal.webp" alt="">%s</span>' % price if price is not None else ''
    return '<div class="item rv"><span class="gl" style="--gc:%s" aria-hidden="true">%s</span><div><b>%s</b><p>%s</p>%s</div></div>' % (color, sym, name, desc, pr)


def item(img, name, desc, price=None, cur='crystal'):
    pr = ''
    if price is not None:
        pr = '<span class="pr"><img src="img/%s" alt="">%s</span>' % ('ui-ui-crystal.webp' if cur == 'crystal' else 'it-bau_comum.webp', price)
    return '<div class="item rv"><img src="img/it-%s.webp" alt="" loading="lazy"><div><b>%s</b><p>%s</p>%s</div></div>' % (img, name, desc, pr)


# ---------------------------------------------------------------- INÍCIO
index = '''<section class="hero">
  <canvas class="field" aria-hidden="true"></canvas>
  <div class="wrap">
    <div>
      <h1><span class="ln"><span>A tua vida real</span></span><span class="ln"><span>é o jogo.</span></span></h1>
      <p class="lead">Sistema é um RPG para Android que só avança quando tu avanças. Escreves as tuas missões do dia a dia, cumpres-nas e ganhas XP. O teu avatar evolui, e com ele chegam mais de cem chefes para derrotar.</p>
      <div class="syswin" id="syswin" role="region" aria-label="Mensagem do Sistema">
        <span class="tag"><i></i>SISTEMA</span>
        <p class="msg" id="sys-msg" aria-live="polite"></p>
        <div class="act" id="sys-act" hidden>
          <button class="btn yes" type="button" data-sys="yes">Aceitar</button>
          <button class="btn" type="button" data-sys="no">Recusar</button>
        </div>
      </div>
      <p class="hero-note"><span data-bind="price-line">Ativação por 5 000 Kz</span>, pagamento único por Multicaixa Express. Feito em Angola.</p>
    </div>
    <div class="phone" aria-label="Capturas do jogo">
      <div class="shots">
        <img class="on" src="img/app-status.webp" alt="Ecrã de estado: nível 46, Guerreiro, atributos e evolução">
        <img src="img/app-missoes.webp" alt="Missão Diária e missões do dia">
        <img src="img/app-combate.webp" alt="Os chefes da Fortaleza de Gelo">
        <img src="img/app-batalha.webp" alt="Batalha por turnos contra Skadhi, Rainha do Inverno Eterno">
        <img src="img/app-coliseu.webp" alt="O Coliseu dos Condenados">
      </div>
      <div class="dots" aria-hidden="true"></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">Cada dia cumprido torna-te mais forte</h2><p class="lead rv">Não há atalhos. O XP vem do que fazes fora do ecrã, e o Sistema regista tudo.</p></div>
    <div class="steps" data-stagger>
      <article class="step rv"><div class="shot"><img src="img/app-missoes.webp" alt="" loading="lazy"></div><h3>Escreve as tuas missões</h3><p>Ler, treinar, estudar, arrumar a casa. Escolhe a dificuldade e o prazo. Todos os dias há também uma Missão Diária de exercício.</p></article>
      <article class="step rv"><div class="shot"><img src="img/app-status.webp" alt="" loading="lazy"></div><h3>Cumpre e ganha XP</h3><p>Cada missão cumprida dá XP, moedas e baús. Sobes de nível, distribuis pontos de atributo e o avatar muda de aparência a cada 3 níveis.</p></article>
      <article class="step rv"><div class="shot"><img src="img/app-batalha.webp" alt="" loading="lazy"></div><h3>Enfrenta os chefes</h3><p>Combates por turnos contra os reis de 10 portões. Falhar a Diária tem castigo: o Sistema não perdoa quem desiste.</p></article>
    </div>
  </div>
</section>

<section class="tight">
  <div class="wrap split">
    <div class="evo-stage rv">
      <img id="evo-img" src="img/evo-m-1.webp" alt="Guerreiro no nível 1">
      <div class="evo-lv"><span>1</span><small>Nível</small></div>
    </div>
    <div>
      <h2 class="rv">Começas no nível 1. O resto, descobres a jogar</h2>
      <p class="lead rv" style="margin-top:14px">O teu avatar muda de aparência a cada 3 níveis: 34 formas por classe, desenhadas à mão no estilo webtoon. Não mostramos nenhuma antes do tempo. Cada uma ganha-se.</p>
      <div class="seg rv" role="group" aria-label="Aparência" style="margin-top:22px"><button type="button" data-g="m" aria-pressed="true">Masculina</button><button type="button" data-g="f" aria-pressed="false">Feminina</button></div>
      <div class="locked rv" aria-label="Formas futuras escondidas">
        <figure><div class="lk"><img src="img/evo-m-1.webp" alt=""></div><figcaption>Nível 10</figcaption></figure>
        <figure><div class="lk"><img src="img/evo-m-1.webp" alt=""></div><figcaption>Nível 49</figcaption></figure>
        <figure><div class="lk"><img src="img/evo-m-1.webp" alt=""></div><figcaption>Nível 100</figcaption></figure>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">Explora o Sistema</h2></div>
    <div class="grid g2" data-stagger>
      <a class="tile art rv" href="jogo.html"><img src="img/arena-ar10.webp" alt="" loading="lazy"><div class="body"><h3>O jogo</h3><p>Missões, 6 classes, 10 portões com 100 chefes, sombras que lutam por ti e um segredo no fim de tudo.</p><span class="go">Ver o jogo</span></div></a>
      <a class="tile art rv" href="duelos.html"><img src="img/arena-ar1.webp" alt="" loading="lazy"><div class="body"><h3>Duelos online</h3><p>Desafia amigos para duelos por turnos decididos pelo servidor. Sobe nas patentes, do Ferro ao Monarca.</p><span class="go">Ver os duelos</span></div></a>
      <a class="tile art rv" href="lojas.html"><img src="img/arena-ar5.webp" alt="" loading="lazy"><div class="body"><h3>Lojas</h3><p>A loja de moedas, a Loja Premium com equipamento soberano e relíquias, os Cristais e o Coliseu dos Condenados.</p><span class="go">Ver as lojas</span></div></a>
      <a class="tile art rv" href="sistema-vivo.html"><img src="img/arena-final.webp" alt="" loading="lazy"><div class="body"><h3>O Sistema vivo</h3><p>Ele fala contigo, dá missões de emergência, castiga quem falha e repara quando tentas enganá-lo.</p><span class="go">Conhecer o Sistema</span></div></a>
    </div>
  </div>
</section>

<section class="tight">
  <div class="wrap split">
    <div>
      <h2 class="rv">O que te espera</h2>
      <p class="lead rv" style="margin-top:14px">Um jogo completo, feito por uma só pessoa, em Angola.</p>
    </div>
    <div class="status rv">
      <dl>
        <dt>Chefes nos 10 portões</dt><dd data-count="100">100</dd>
        <dt>Combates no Coliseu dos Condenados</dt><dd data-count="100">100</dd>
        <dt>Aparências do avatar por classe</dt><dd data-count="34">34</dd>
        <dt>Habilidades</dt><dd data-count="124">124</dd>
        <dt>Itens</dt><dd data-count="462">462</dd>
        <dt>Conversas do Sistema</dt><dd data-count="700">700</dd>
        <dt data-legal-row hidden>Jogadores legalizados</dt><dd data-bind="legal" data-legal-row hidden>—</dd>
      </dl>
    </div>
  </div>
</section>
''' + cta()

# ---------------------------------------------------------------- O JOGO
CLASSES = [
    ('guerreiro', 'Guerreiro', 'Mestre do combate corpo a corpo. Muita força e resistência.', 'Dano físico · Força e Vitalidade'),
    ('assassino', 'Assassino', 'Rápido e letal. Críticos devastadores e venenos.', 'Dano físico · Agilidade e Perceção'),
    ('mago', 'Mago', 'Domina a magia arcana. Dano mágico enorme, pouca defesa.', 'Dano mágico · Inteligência'),
    ('guardiao', 'Guardião', 'Uma muralha viva. Aguenta tudo e devolve o dano.', 'Dano físico · Vitalidade e Força'),
    ('arqueiro', 'Arqueiro', 'Precisão mortal à distância. Críticos e chuvas de flechas.', 'Dano físico · Perceção e Agilidade'),
    ('invocador', 'Invocador', 'Chama espíritos para lutar ao seu lado e drena a vida dos inimigos.', 'Dano mágico · Inteligência e Vitalidade'),
]
GATES = [('Floresta Sussurrante', 'Fenrath, Rei Lobo', 'b10'), ('Cavernas de Cristal', 'Varyss, Rainha Cristalina', 'b20'), ('Pântano Pútrido', 'Morvenna, Senhora da Praga', 'b30'),
         ('Ruínas do Deserto', 'Ankharet, Imperador Solar', 'b40'), ('Fortaleza de Gelo', 'Skadhi, Rainha do Inverno Eterno', 'b50'), ('Vulcão Carmesim', 'Pyraxis, Dragão Vulcânico', 'b60'),
         ('Cidade Submersa', 'Thalassor, Rei Afogado', 'b70'), ('Cidadela Celestial', 'Auriel, Imperatriz Celeste', 'b80'), ('Abismo Sem Fim', 'Nyxaroth, Príncipe do Abismo', 'b90'),
         ('Trono do Vazio', 'O Soberano do Vazio', 'b100')]


def cls_card(c):
    cid, name, desc, kind = c
    a = 'img/evo-m-1.webp' if cid == 'guerreiro' else 'img/cls-%s-1.webp' % cid
    return '<article class="cls-card rv"><div class="pics"><img src="%s" alt="%s no nível 1" loading="lazy"></div><div class="body"><h3>%s</h3><p>%s</p><div class="kind">%s</div></div></article>' % (a, name, name, desc, kind)


jogo = head('gate-1.webp', 'O jogo', 'Um RPG em que tu és a personagem', 'Missões reais, atributos, classes, chefes e sombras. Tudo o que fazes no jogo nasce do que fazes na vida.') + '''
<section>
  <div class="wrap split">
    <div>
      <h2 class="rv">Missões: a tua rotina vira XP</h2>
      <p class="lead rv" style="margin-top:14px">Escreves as missões com as tuas palavras: «Ler 20 páginas», «Treino de 45 minutos», «Estudar inglês». Cada uma tem dificuldade (de D a S), atributos que treina e um prazo.</p>
      <ul class="ticks rv" style="margin-top:22px">
        <li>Missão Diária de exercício: flexões, abdominais, agachamentos e caminhada, que podes ajustar</li>
        <li>Missões únicas, diárias ou em dias da semana escolhidos</li>
        <li>Até 12 missões novas por dia, para o Sistema não ser enganado com missões a granel</li>
        <li>Missões Ocultas que só aparecem quando o teu comportamento as desbloqueia</li>
        <li>Falhar a Diária abre a Zona de Penalidade</li>
      </ul>
    </div>
    <div class="phone sm rv"><div class="shots"><img class="on" src="img/app-missoes.webp" alt="Missões do dia"></div></div>
  </div>
</section>

<section class="tight">
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">Atributos e ranks</h2><p class="lead rv">Cada nível dá 3 pontos para distribuíres. As missões também treinam os atributos que escolheste.</p></div>
    <div class="grid g4" data-stagger style="grid-template-columns:repeat(5,1fr)">
      <div class="tile rv"><img class="ico" src="img/ui-stat-str.webp" alt=""><h4>Força</h4><p>Dano físico.</p></div>
      <div class="tile rv"><img class="ico" src="img/ui-stat-agi.webp" alt=""><h4>Agilidade</h4><p>Crítico e esquiva.</p></div>
      <div class="tile rv"><img class="ico" src="img/ui-stat-vit.webp" alt=""><h4>Vitalidade</h4><p>Vida e defesa.</p></div>
      <div class="tile rv"><img class="ico" src="img/ui-stat-int.webp" alt=""><h4>Inteligência</h4><p>Mana e magia.</p></div>
      <div class="tile rv"><img class="ico" src="img/ui-stat-per.webp" alt=""><h4>Perceção</h4><p>Crítico e precisão.</p></div>
    </div>
    <p class="muted rv" style="margin-top:22px">Os ranks seguem o teu nível: E, D, C, B, A, S, SS, SSS e, no nível 100, Ω.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">Seis classes, seis caminhos</h2><p class="lead rv">Todas começam assim, no nível 1. Cada classe segue um caminho só seu até ao nível 100.</p></div>
    <div class="grid g3" data-stagger>''' + ''.join(cls_card(c) for c in CLASSES) + '''</div>
  </div>
</section>

<section class="tight">
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">Dez portões, cem chefes</h2><p class="lead rv">Cada portão é um mundo com 10 chefes, do nível 1 ao 100. O último de cada portão é o rei, e luta em duas fases.</p></div>
    <div class="gates" data-stagger>''' + ''.join('<div class="gate rv"><img src="img/gate-%d.webp" alt=""><div><b>%s</b><span>Nível %d a %d</span></div></div>' % (i + 1, g[0], i * 10 + 1, i * 10 + 10) for i, g in enumerate(GATES)) + '''</div>
    <div class="bosses" style="margin-top:34px" data-stagger>''' + ''.join('<figure class="rv"><div class="bossart tilt"><img src="img/boss-%s.webp" alt="" loading="lazy"></div><figcaption>%s<span>%s</span></figcaption></figure>' % (g[2], g[1], g[0]) for g in GATES) + '''</div>
  </div>
</section>

<section>
  <div class="wrap split rev">
    <div>
      <h2 class="rv">Combate por turnos</h2>
      <p class="lead rv" style="margin-top:14px">Atacar, usar habilidades, beber poções, defender. Os chefes atordoam, envenenam, criam escudos e ficam mais fortes na segunda fase.</p>
      <ul class="ticks rv" style="margin-top:22px">
        <li>124 habilidades, ativas e passivas, que se desbloqueiam com o nível</li>
        <li>A mana pesa: as habilidades mais fortes gastam até um terço da tua mana, e a mana só regenera 5% por turno</li>
        <li>Lutar acima do teu nível é perigoso: o dano que dás desce e o que recebes sobe</li>
        <li>De dia e de noite há chefes mais fortes, com mais recompensas</li>
        <li>Morrer custa um nível. O Sistema reanima-te com pouca vida</li>
      </ul>
    </div>
    <div class="phone sm rv"><div class="shots"><img class="on" src="img/app-batalha.webp" alt="Batalha por turnos"><img src="img/app-combate.webp" alt="Os chefes de um portão"></div><div class="dots" aria-hidden="true"></div></div>
  </div>
</section>

<section class="tight">
  <div class="wrap split">
    <div class="arise rv">
      <figure><div class="bossart"><img src="img/boss-ar3.webp" alt="Leviarch, Campeão do Coliseu" loading="lazy"></div><figcaption>Leviarch, o chefe</figcaption></figure>
      <span class="arrow" aria-hidden="true"></span>
      <figure><div class="bossart shade"><img src="img/sombra-ar3.webp" alt="A sombra de Leviarch" loading="lazy"></div><figcaption>A sua sombra, ao teu serviço</figcaption></figure>
    </div>
    <div>
      <h2 class="rv">Os chefes que vences tornam-se as tuas sombras</h2>
      <p class="lead rv" style="margin-top:14px">Depois da vitória, tens três tentativas para extrair a sombra do chefe. As sombras lutam ao teu lado, cada uma com o seu papel: atacante, guarda, arcano ou comandante.</p>
      <ul class="ticks rv" style="margin-top:22px">
        <li>Até 6 servos convocados ao mesmo tempo</li>
        <li>Dás-lhes nome e treinas com elas sem castigo</li>
        <li>As sombras dos reis e dos Campeões são as mais fortes</li>
      </ul>
      <div class="arise rv" style="margin-top:26px;max-width:420px"><figure><div class="bossart"><img src="img/boss-ar9.webp" alt="Morthis, Campeão do Coliseu" loading="lazy"></div><figcaption>Morthis</figcaption></figure><span class="arrow" aria-hidden="true"></span><figure><div class="bossart shade"><img src="img/sombra-ar9.webp" alt="A sombra de Morthis" loading="lazy"></div><figcaption>A sua sombra</figcaption></figure></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <a class="tile art rv" href="lojas.html#p-coliseu" style="max-width:none"><img src="img/arena-ar5.webp" alt="" loading="lazy" style="aspect-ratio:21/8"><div class="body"><h3>O Coliseu dos Condenados</h3><p>10 arenas com 9 Guardiões e um Campeão cada. Cada Campeão foi um Jogador que quebrou as regras do Sistema. Abrem-se com Cristais e ficam abertas para sempre.</p><span class="go">Ver as arenas</span></div></a>
  </div>
</section>

<section class="tight">
  <div class="wrap split">
    <div>
      <h2 class="rv">E no fim de tudo?</h2>
      <p class="lead rv" style="margin-top:14px">Quem vence os cem chefes dos portões e os dez Campeões do Coliseu descobre uma última arena que não aparece em nenhum mapa. O Sistema tem algo para te dizer. E não é o único.</p>
    </div>
    <div class="bossart rv" style="aspect-ratio:16/9"><img src="img/arena-final.webp" alt="A Última Arena" loading="lazy"></div>
  </div>
</section>
''' + cta()

# ---------------------------------------------------------------- DUELOS
TIERS = [(0, 'Ferro'), (5, 'Bronze'), (10, 'Prata'), (15, 'Ouro'), (20, 'Platina'), (25, 'Diamante'), (30, 'Carmesim'), (35, 'Sombra'), (40, 'Monarca')]
duelos = head('ui-ui-duel.webp', 'Duelos online', 'Jogador contra jogador', 'Desafia os teus amigos para duelos por turnos. O servidor decide cada golpe, por isso ninguém faz batota.') + '''
<section>
  <div class="wrap split">
    <div class="duel rv" id="duel" aria-label="Exemplo de duelo">
      <div class="vs">
        <div class="fighter" id="fA"><div class="who"><img src="img/evo-m-1.webp" alt=""><div><b>Delcio</b><small>Guerreiro · Nv 70</small></div></div><div class="bar"><i id="hpA"></i></div><div class="bar mp"><i id="mpA"></i></div></div>
        <span class="x">VS</span>
        <div class="fighter r" id="fB"><div class="who"><img src="img/cls-arqueiro-f1.webp" alt=""><div><b>Ana</b><small>Arqueira · Nv 68</small></div></div><div class="bar"><i id="hpB"></i></div><div class="bar mp"><i id="mpB"></i></div></div>
      </div>
      <div class="log" aria-live="off"></div>
      <div class="turn"><span id="duel-turn">Turno 1</span><span>Sala SIS-7Q2K</span></div>
    </div>
    <div>
      <h2 class="rv">Um duelo a sério, ao vivo</h2>
      <p class="lead rv" style="margin-top:14px">Cada jogador usa as suas próprias habilidades, a sua mana, os seus itens e as suas sombras. Os turnos alternam e cada ação é calculada no servidor do Sistema.</p>
      <ul class="ticks rv" style="margin-top:22px">
        <li>Cria uma sala e partilha o código, ou convida um amigo diretamente</li>
        <li>Turnos decididos pelo servidor: o resultado não depende do teu telemóvel</li>
        <li>Equilibrado: os golpes muito fortes, as curas e os escudos têm limites próprios em duelo</li>
        <li>Os lugares de servos comprados não dão vantagem contra jogadores</li>
        <li>Os primeiros 5 duelos do dia dão recompensa. Perder não te tira nada</li>
      </ul>
    </div>
  </div>
</section>

<section class="tight">
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">41 patentes, do Ferro ao Monarca</h2><p class="lead rv">Cada 5 vitórias sobem uma patente e cada derrota tira um ponto. Há 8 escalões com 5 divisões cada e, aos 200 pontos, o Monarca dos Duelos.</p></div>
    <div class="ranks" data-stagger>''' + ''.join('<figure class="rv"><img src="img/pt-%d.webp" alt="" loading="lazy">%s</figure>' % (k, n) for k, n in TIERS) + '''</div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">Amigos, conversa e perfis</h2></div>
    <div class="grid g3" data-stagger>
      <div class="tile rv"><img class="ico" src="img/ui-ui-social.webp" alt=""><h3>Adiciona amigos</h3><p>Procura pelo ID de Jogador e envia um pedido. Vês quem está online e há quanto tempo cada um jogou.</p></div>
      <div class="tile rv"><img class="ico" src="img/ui-ui-chat.webp" alt=""><h3>Conversa</h3><p>Fala com os teus amigos dentro do jogo e combina o próximo duelo.</p></div>
      <div class="tile rv"><img class="ico" src="img/ui-ui-trofeus.webp" alt=""><h3>Perfil público</h3><p>Foto, patente, vitórias, chefes vencidos, sombras e a marca de Jogador legalizado.</p></div>
    </div>
  </div>
</section>
''' + cta('Os teus amigos já estão no Sistema?', 'Ativa o teu aparelho e desafia-os para o primeiro duelo.')

# ---------------------------------------------------------------- LOJAS
coin_items = [
    ('w_mago_10', 'Armas de cada classe', '10 armas por classe, mais as versões do Artesão e do Campeão. Cada uma desbloqueia num nível.'),
    ('ar_soberano', 'Armaduras', 'Do couro à armadura soberana, com vida, defesa e esquiva.'),
    ('po_vida2', 'Poções', 'Vida, mana, fúria, escudos, venenos e bombas para usar em combate.'),
    ('bau_lendario', 'Baús', 'Do Comum ao Secreto. Quanto mais raro, melhores os itens.'),
    ('bau_arsenal_5', 'Baús especializados', 'Cada um dá só um tipo de item: armas, armaduras, acessórios, joias ou alquimia.'),
    ('sys_licenca', 'Artefatos do Sistema', 'Licenças para mais missões, selos de dobro, bilhetes de vitória dupla e bússolas.'),
]
prem_gear = [('pr_lamina', 'Lâmina do Monarca Sombrio', 'Arma soberana para qualquer classe. Fica sempre 35% acima da melhor arma que podes usar no teu nível.', 350),
             ('pr_armadura', 'Armadura do Monarca', 'Cresce contigo: muita vida, regeneração, esquiva e resistência a atordoamentos.', 300),
             ('pr_coroa', 'Coroa da Arena', 'De +8% a +14% em todos os atributos, +20% de moedas e +10% de XP.', 250),
             ('pr_olho', 'Anel do Olho do Sistema', 'Crítico e dano crítico que crescem com o nível e +20% de XP em tudo.', 180),
             ('pr_coracao', 'Coração de Cristal', 'Muita vida e mana que crescem com o nível, e regeneração das duas.', 180)]
prem_relics = [('pr_juizo', 'Lâmina do Juízo Final', 'Tira 20% da vida máxima do chefe (8% contra Campeões e reis ocultos).', 180),
               ('pr_tempo', 'Selo do Tempo Parado', 'O chefe perde garantidamente os próximos 2 turnos.', 160),
               ('pr_legiao', 'Estandarte da Legião Sombria', 'Uma legião ataca ao teu lado durante 6 turnos.', 180),
               ('pr_elixir', 'Elixir do Monarca', 'Vida e mana ao máximo, limpa efeitos e +40% de ataque.', 140),
               ('pr_fenix', 'Lágrima da Fénix Negra', 'Se morreres em combate, renasces com a vida toda.', 240),
               ('pr_ruptura', 'Ruptura do Sistema', '-50% de defesa e -30% de ataque no chefe durante 3 turnos.', 160),
               ('pr_eco', 'Eco do Monarca', 'Reinicia as recargas, enche a mana e dá +40% de crítico.', 150)]
prem_treasures = [('pr_selo', 'Selo do Monarca Eterno', 'Para sempre: +15% de XP e +15% de moedas em tudo.', 450),
                  ('pr_general', 'Insígnia do General das Sombras', '+1 lugar de servo convocado, para sempre (até 3).', 150),
                  ('pr_bau', 'Baú do Monarca', 'Baú Lendário, Baú Secreto, muitas moedas e recarga das relíquias.', 90),
                  ('pr_foco', 'Pergaminho do Foco Absoluto', 'XP a dobrar durante 3 dias.', 90),
                  ('pr_trevo', 'Trevo de Cristal', 'Durante 3 dias, cada baú dá um item extra.', 80),
                  ('pr_nome', 'Pergaminho do Novo Nome', 'Muda o teu nome. O progresso, o ID e os amigos ficam.', 30)]
prem_style = [('✦', '#6fd6ff', 'Títulos exclusivos', '«Escolhido do Sistema», «Caçador da Hora Morta», «Sem Descanso» e outros. Substituem o título do nível e aparecem no perfil e nos duelos.', '60 a 100'),
              ('fx_raios', None, 'Efeitos de vitória', 'Raios, pétalas negras, chuva de cristais ou chamas da fénix quando derrotas um chefe, vences um duelo ou sobes de nível.', '80 a 100'),
              ('em_sistema', None, 'Emotes de duelo', 'Pacotes de 4 frases curtas do Sistema para mandares ao adversário durante o duelo. Três frases já vêm de graça.', '50 a 60'),
              ('ui_presente', None, 'Presentes', 'Oferece um título, efeito, moldura ou pacote de emotes a um amigo, com os teus Cristais. Ou compra Cristais pelo WhatsApp para ele.', None),
              ('pr_reset', None, 'Pergaminho da Reconstrução', 'Devolve todos os pontos de atributo para os distribuíres de novo. Também existe na loja de moedas a partir do nível 10.', '40')]
packs = [('Punhado', 60, 0, 600, ''), ('Bolsa', 120, 10, 1200, ''), ('Saco', 250, 30, 2500, 'Mais popular'), ('Cofre', 500, 100, 5000, ''), ('Tesouro', 1000, 300, 10000, ''), ('Tesouro do Monarca', 2000, 800, 20000, 'Melhor valor')]
arenas = [(1, 'Arena do Eclipse Escarlate', 'Kaelthar, o Carrasco do Eclipse', 15, 120), (2, 'Arena das Mil Lâminas', 'Seraphine, a Dançarina das Mil Lâminas', 25, 200),
          (3, 'Arena Abissal das Marés', 'Leviarch, o que Tudo Guardava', 35, 280), (4, 'Arena do Relógio Partido', 'Chronos-9, o Executor Temporal', 45, 360),
          (5, 'Arena das Cinzas Coroadas', 'Ignivar, o Imperador Fénix', 55, 440), (6, 'Arena do Espelho Quebrado', "Nyx Vel'Ara, a Rainha dos Reflexos", 65, 520),
          (7, 'Arena do Colosso Rúnico', 'Gorrath, o Colosso Rúnico', 75, 600), (8, 'Arena da Tempestade Celeste', 'Valkyra, Arauto da Tempestade', 85, 700),
          (9, 'Arena do Jardim Necrótico', 'Morthis, o Jardineiro dos Mortos', 95, 800), (10, 'Arena do Primeiro Jogador', 'O Primeiro Jogador', 100, 1000)]
ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']


def kz(n):
    s = '{:,}'.format(n).replace(',', ' ')
    return s + ' Kz'


lojas = head('ui-ui-crystal.webp', 'Lojas', 'Moedas, Cristais e o Coliseu', 'A loja de moedas tem tudo o que precisas para os 10 portões. A Loja Premium e o Coliseu são opcionais, para quem quer ir mais longe.') + '''
<section>
  <div class="wrap">
    <div class="tabs" role="tablist" aria-label="Lojas">
      <button role="tab" id="t-moedas" aria-controls="p-moedas" aria-selected="true">Loja de moedas</button>
      <button role="tab" id="t-premium" aria-controls="p-premium" aria-selected="false">Loja Premium</button>
      <button role="tab" id="t-cristais" aria-controls="p-cristais" aria-selected="false">Cristais</button>
      <button role="tab" id="t-coliseu" aria-controls="p-coliseu" aria-selected="false">Coliseu</button>
    </div>

    <div class="panel" role="tabpanel" id="p-moedas" aria-labelledby="t-moedas">
      <div class="split" style="align-items:start">
        <div>
          <h2>Tudo com as moedas que ganhas a jogar</h2>
          <p class="lead" style="margin-top:14px">As moedas vêm das missões, dos chefes e dos baús. A loja tem 7 secções e mais de 400 itens, e mostra apenas o que já podes usar.</p>
          <div class="items" style="grid-template-columns:1fr;margin-top:26px">''' + ''.join(item(i[0], i[1], i[2]) for i in coin_items) + '''</div>
        </div>
        <div class="phone sm"><div class="shots"><img class="on" src="img/app-loja.webp" alt="Loja de armas"></div></div>
      </div>
    </div>

    <div class="panel" role="tabpanel" id="p-premium" aria-labelledby="t-premium" hidden>
      <h2>Loja Premium</h2>
      <p class="lead" style="margin-top:14px">Itens exclusivos que se compram com Cristais. Nenhum é obrigatório para acabar os 10 portões. O Sistema não vende Integridade nem sequências: essas só se ganham.</p>
      <h3 style="margin:34px 0 14px">Equipamento soberano <span class="muted" style="font-weight:400;font-size:16px">· cresce contigo</span></h3>
      <div class="items">''' + ''.join(item(*i) for i in prem_gear) + '''</div>
      <h3 style="margin:34px 0 14px">Relíquias permanentes <span class="muted" style="font-weight:400;font-size:16px">· compras uma vez, recarregam sozinhas, 1 por batalha</span></h3>
      <div class="items">''' + ''.join(item(*i) for i in prem_relics) + '''</div>
      <h3 style="margin:34px 0 14px">Tesouros</h3>
      <div class="items">''' + ''.join(item(*i) for i in prem_treasures) + '''</div>
      <h3 style="margin:34px 0 14px">Estilo e amigos <span class="muted" style="font-weight:400;font-size:16px">· só visual, não dá vantagem</span></h3>
      <div class="items">''' + ''.join(gitem(*i) if i[1] else item(i[0], i[2], i[3], i[4]) for i in prem_style) + '''</div>
      <p class="muted" style="margin-top:22px">Também há baús especializados dos graus Ouro, Dragão e Monarca, molduras para o retrato e assinaturas de cor para o nome.</p>
    </div>

    <div class="panel" role="tabpanel" id="p-cristais" aria-labelledby="t-cristais" hidden>
      <h2>Cristais</h2>
      <p class="lead" style="margin-top:14px">Compram-se dentro do jogo, pelo WhatsApp, com pagamento por Multicaixa Express. Quanto maior o pacote, maior o bónus.</p>
      <div class="packs" style="margin-top:30px">''' + ''.join('<div class="pack%s">%s<img src="img/ui-ui-crystal.webp" alt=""><b>%d</b><small>%s</small><div class="kz">%s</div></div>' % (' hl' if p[4] else '', '<span class="badge">%s</span>' % p[4] if p[4] else '', p[1] + p[2], ('%d + %d de bónus' % (p[1], p[2])) if p[2] else p[0], kz(p[3])) for p in packs) + '''</div>
      <p class="muted" style="margin-top:22px">Quem compra Cristais aparece como Premium legalizado. Também há pacotes de moedas, a partir de 500 Kz.</p>
    </div>

    <div class="panel" role="tabpanel" id="p-coliseu" aria-labelledby="t-coliseu" hidden>
      <div class="split" style="align-items:start">
        <div>
          <h2>O Coliseu dos Condenados</h2>
          <p class="lead" style="margin-top:14px">O Sistema não apagou os Jogadores que quebraram as suas regras: guardou-os, transformados naquilo que fizeram. Cada arena tem 9 Guardiões em escada e, no fim, o Campeão, que luta em três fases.</p>
          <ul class="ticks" style="margin-top:20px"><li>Abres cada arena uma vez com Cristais e fica aberta para sempre</li><li>A primeira vitória sobre um Campeão dá a sua relíquia e a sua coroa</li><li>Os vencidos podem ser revisitados, sem recompensas</li></ul>
        </div>
        <div class="phone sm"><div class="shots"><img class="on" src="img/app-coliseu.webp" alt="Arena do Coliseu"><img src="img/app-arenas.webp" alt="Lista de arenas"></div><div class="dots" aria-hidden="true"></div></div>
      </div>
      <div class="arenas" style="margin-top:34px">''' + ''.join('<div class="arena"><span class="n">ARENA %s</span><b>%s</b><span>%s · Nv %d</span><div class="c">%d Cristais</div></div>' % (ROMAN[a[0] - 1], a[1], a[2], a[3], a[4]) for a in arenas) + '''</div>
      <div class="bosses" style="margin-top:30px">''' + ''.join('<figure><div class="bossart tilt"><img src="img/boss-%s.webp" alt="" loading="lazy"></div><figcaption>%s</figcaption></figure>' % (b, n) for b, n in [('ar1', 'Kaelthar'), ('ar3', 'Leviarch'), ('ar5', 'Ignivar'), ('ar7', 'Gorrath'), ('ar9', 'Morthis')]) + '''</div>
    </div>
  </div>
</section>
''' + cta('Começa com o essencial', 'A ativação dá-te o jogo completo. As compras dentro do jogo são opcionais.')

# ---------------------------------------------------------------- SISTEMA VIVO
vivo = head('ui-ui-eye.webp', 'Sistema vivo', 'Ele vê tudo. E fala contigo.', 'O Sistema não espera que abras o jogo para te dizer alguma coisa. Comenta o teu dia, dá ordens, castiga quem falha e lembra-se de tudo.') + '''
<section>
  <div class="wrap split">
    <div>
      <h2 class="rv">Uma voz própria</h2>
      <p class="lead rv" style="margin-top:14px">Mais de 700 conversas, com três respostas à escolha em cada uma. O Sistema reage ao que fazes: às missões cumpridas e falhadas, aos chefes, aos baús, às horas a que jogas.</p>
      <ul class="ticks rv" style="margin-top:22px">
        <li>Fala contigo sozinho a cada 15 minutos de uso</li>
        <li>Nunca aparece a meio de um duelo</li>
        <li>Conversas longas ligadas à história do jogo, que só acontecem uma vez</li>
        <li>Lembretes no telemóvel aos 30, 20 e 10 minutos do prazo</li>
      </ul>
    </div>
    <div class="feed rv" id="feed" aria-label="Exemplos de avisos do Sistema"></div>
  </div>
</section>

<section class="tight">
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">O que o Sistema faz sem pedir licença</h2></div>
    <div class="grid g2" data-stagger>
      <div class="tile rv"><img class="ico" src="img/ui-h-mission-fail.webp" alt=""><h3>Missões de emergência</h3><p>Até duas por dia, entre as 08:00 e as 22:00: «Faz 15 flexões», «Bebe um copo de água», «Responde à mensagem que andas a evitar». Têm tempo limite e recompensa à altura.</p></div>
      <div class="tile rv"><img class="ico" src="img/ui-h-chains.webp" alt=""><h3>Zona de Penalidade</h3><p>Falhar a Missão Diária abre uma missão de castigo de 24 horas, a dobrar. Cumpri-la recupera metade do que perdeste.</p></div>
      <div class="tile rv"><img class="ico" src="img/ui-h-key.webp" alt=""><h3>Missões Ocultas</h3><p>Não aparecem em lado nenhum até as desbloqueares com o teu comportamento. Dão recompensas raras.</p></div>
      <div class="tile rv"><img class="ico" src="img/ui-h-mission-done.webp" alt=""><h3>Relatório semanal</h3><p>Ao domingo, o Sistema dá-te uma nota de E a S pela semana, um comentário e um prémio.</p></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap split rev">
    <div>
      <h2 class="rv">Vigilância e Integridade</h2>
      <p class="lead rv" style="margin-top:14px">O Sistema lê o que escreves. Missões sem sentido («asdasd», «teste») são recusadas com um alerta. Criar e concluir missões em poucos minutos, repetidamente, reduz e depois anula a recompensa.</p>
      <p class="lead rv" style="margin-top:14px">A tua Integridade vai de 0 a 100%. Desce com cada abuso e sobe com missões legítimas e a cada novo dia. Abaixo de 80%, as recompensas descem.</p>
    </div>
    <div class="syswin red rv" style="max-width:none;margin-top:0">
      <span class="tag"><i></i>VIGILÂNCIA</span>
      <p class="msg" style="min-height:0">«Ler 20 páginas» foi concluída 2 minutos depois de ser criada. Não há livro que se leia tão depressa.</p>
      <div style="margin-top:18px;display:flex;justify-content:space-between;font-size:14px" class="muted"><span>Integridade</span><span id="trust-v">100%</span></div>
      <div class="meter" style="margin-top:8px"><i id="trust"></i></div>
    </div>
  </div>
</section>

<section class="tight">
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">O relógio do Sistema</h2><p class="lead rv">O jogo segue a hora real. Alguns itens só funcionam numa fase do dia e alguns chefes ficam mais fortes de dia ou de noite.</p></div>
    <div class="phases" data-stagger>
      <div class="phase rv"><img src="img/ui-phase-manha.webp" alt=""><b>Manhã</b><span>05:00 às 11:59</span></div>
      <div class="phase rv"><img src="img/ui-phase-dia.webp" alt=""><b>Dia</b><span>06:00 às 17:59</span></div>
      <div class="phase rv"><img src="img/ui-phase-crepusculo.webp" alt=""><b>Crepúsculo</b><span>18:00 às 20:59</span></div>
      <div class="phase rv"><img src="img/ui-phase-noite.webp" alt=""><b>Noite</b><span>18:00 às 05:59</span></div>
      <div class="phase rv"><img src="img/ui-phase-horaMorta.webp" alt=""><b>Hora Morta</b><span>00:00 às 02:59</span></div>
    </div>
  </div>
</section>
''' + cta('Deixa o Sistema escolher-te', 'Ele já está à espera. Só falta o teu código de ativação.')

# ---------------------------------------------------------------- COMPRAR
comprar = head('h-key.webp', 'Comprar', 'Como obter o Sistema', 'O APK é gratuito para descarregar. Para jogar, precisas de um código de ativação, que compras diretamente ao criador.').replace('img/h-key.webp', 'img/ui-h-key.webp') + '''
<section>
  <div class="wrap buy-grid">
    <ol class="flow" data-stagger>
      <li class="rv"><div><h3>Descarrega o APK oficial</h3><p>Só deste site. Instala-o no teu Android. O jogo abre no ecrã de ativação.</p></div></li>
      <li class="rv"><div><h3>Fala connosco no WhatsApp</h3><p>Diz que queres o código de ativação. A mensagem que o jogo prepara já leva o código do teu aparelho.</p></div></li>
      <li class="rv"><div><h3>Paga por Multicaixa Express</h3><p>Recebes os dados para a transferência. Nunca te pedimos o PIN nem códigos do banco.</p></div></li>
      <li class="rv"><div><h3>Introduz o código e joga</h3><p>Recebes um código como este, escreves-o no jogo e a tua conta fica marcada como Jogador legalizado.</p><span class="code-sample">ACS-7K2M-Q9PX</span></div></li>
    </ol>
    <aside class="price-card rv" aria-labelledby="price-h">
      <h3 id="price-h">Ativação do Sistema</h3>
      <div class="price"><b data-bind="price">5 000 Kz</b><s data-bind="price-old">7 500 Kz</s></div>
      <p class="once">Pagamento único por Multicaixa Express. Sem mensalidades.</p>
      <ul class="ticks">
        <li>Jogo completo: missões, 6 classes, 100 chefes, sombras e duelos</li>
        <li>Marca de Jogador legalizado no teu perfil</li>
        <li>As atualizações usam o mesmo código</li>
        <li>Apoio direto do criador pelo WhatsApp</li>
      </ul>
      <a class="btn wa" data-buy href="#perguntas">''' + WA_ICON + ''' Comprar o código pelo WhatsApp</a>
      <a class="btn" data-apk href="download/sistema.apk" download>''' + DL_ICON + ''' <span data-apk-label>Descarregar o APK</span></a>
      <p class="fine" data-apk-info>Versão 1.0 · Android 6 ou superior</p>
    </aside>
  </div>
</section>

<section class="tight">
  <div class="wrap">
    <div class="warn rv">
      <span class="eye" aria-hidden="true"></span>
      <div>
        <h3>Só o Sistema oficial é legal</h3>
        <p>Cada código de ativação é pessoal e ativa um só aparelho. Cópias não oficiais do APK, códigos partilhados, revendidos ou obtidos sem pagamento levam ao bloqueio permanente do aparelho. Desinstalar e instalar outra vez não desbloqueia.</p>
        <p>Se achas que foste bloqueado por engano, contacta-nos pelo WhatsApp com o código do aparelho que aparece no jogo. Cada caso é revisto.</p>
      </div>
    </div>
  </div>
</section>

<section id="perguntas">
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">Perguntas</h2></div>
    <div class="faq rv">
      <details><summary>Preciso de internet para jogar?</summary><p>Só para ativar o jogo, sincronizar a conta e jogar com amigos. As missões e os combates funcionam sem internet. De vez em quando o jogo pede uma ligação para confirmar que o aparelho continua autorizado.</p></details>
      <details><summary>Como pago?</summary><p>Por Multicaixa Express. Falas connosco no WhatsApp, recebes os dados para a transferência e, quando o pagamento é confirmado, enviamos o teu código de ativação.</p></details>
      <details><summary>Quanto tempo demora a receber o código?</summary><p>Assim que o pagamento é confirmado, enviamos o código pelo mesmo WhatsApp.</p></details>
      <details><summary>Posso usar o mesmo código noutro telemóvel?</summary><p>Não. Cada código ativa um só aparelho. Se mudares de telemóvel, fala connosco: o teu progresso pode ser transferido com o ID de Jogador.</p></details>
      <details><summary>O que quer dizer «Jogador legalizado»?</summary><p>É a marca que aparece no teu perfil e para os teus amigos quando ativaste o jogo com um código oficial. Quem também comprou Cristais aparece como Premium legalizado.</p></details>
      <details><summary>Há compras dentro do jogo?</summary><p>São opcionais. Os Cristais abrem as arenas do Coliseu e itens exclusivos, mas todo o caminho dos 10 portões se faz sem gastar nada além da ativação.</p></details>
      <details><summary>Funciona no iPhone?</summary><p>Ainda não. O Sistema está disponível para Android 6 ou superior.</p></details>
    </div>
  </div>
</section>
'''

SITE = [
    ('index.html', 'Sistema · O RPG da tua vida real', 'Sistema é um RPG para Android em que a tua vida real é o jogo: cumpre missões do dia a dia, ganha XP, evolui o teu avatar e enfrenta mais de cem chefes. Criado em Angola.', index),
    ('jogo.html', 'O jogo · Sistema', 'Missões reais, atributos, 6 classes, 10 portões com 100 chefes, combate por turnos e sombras.', jogo),
    ('duelos.html', 'Duelos online · Sistema', 'Duelos por turnos entre amigos, decididos pelo servidor, com 41 patentes do Ferro ao Monarca.', duelos),
    ('lojas.html', 'Lojas · Sistema', 'Loja de moedas, Loja Premium com equipamento soberano e relíquias, pacotes de Cristais e o Coliseu dos Condenados.', lojas),
    ('sistema-vivo.html', 'Sistema vivo · Sistema', 'O Sistema fala contigo, dá missões de emergência, vigia as tuas missões e castiga quem falha.', vivo),
    ('comprar.html', 'Comprar · Sistema', 'Descarrega o APK oficial e compra o código de ativação por Multicaixa Express.', comprar),
]

if __name__ == '__main__':
    for f, title, desc, body in SITE:
        open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(shell(f, title, desc, body))
    print('site: %d páginas' % len(SITE))
