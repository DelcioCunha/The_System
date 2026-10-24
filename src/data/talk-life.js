/* ==========================================================
   DIÁLOGOS DO SISTEMA (3/3): missões, loja e progressão
   Variáveis: {missao} {diff} {item} {rarity} {skill} {tier} {nivel} {streak}
   ========================================================== */
(function (S) {
  'use strict';
  (S.TALK_RAW = S.TALK_RAW || []).push(['lf', [
    /* ---------- criar missão (10) ---------- */
    ['create', '', '«{missao}». Registado. Agora a parte que costumas saltar: cumprir.', [
      ['Vou cumprir.', 'o', 'Eu sei quando cumpres. E quando não cumpres.'],
      ['Não salto nada.', 'd', 'O teu histórico tem outra opinião.'],
      ['Porque dizes isso?', 'q', 'Porque criar é o momento mais fácil de qualquer missão. Todos os jogadores criam muito.']]],
    ['create', 'diff=S', 'Uma missão de rank S. Ou és ambicioso, ou queres ver as moedas a cair.', [
      ['Sou ambicioso.', 'o', 'Ótimo. As missões S pagam muito. E cobram tudo se falhares.'],
      ['Gosto de moedas.', 'd', 'Todos gostam. As missões S cumpridas em minutos ficam anuladas. Lembra-te.'],
      ['Quanto tempo devia demorar?', 'q', 'O tempo que uma tarefa S realmente demora. Eu sei medir.']], { w: 3 }],
    ['create', 'diff=E', 'Uma missão E. Pequena. Às vezes é exatamente o que precisas. Às vezes é fuga.', [
      ['É um começo.', 'o', 'É. Começar pequeno não é vergonha. Ficar pequeno é.'],
      ['É o que me apetece.', 'd', 'O que te apetece raramente é o que te faz subir.'],
      ['Como sei a diferença?', 'q', 'Se a fazes em cinco minutos e ficas igual, é fuga.']], { w: 2 }],
    ['create', '', 'Nova missão. Vou ficar a ver. Não é ameaça. É só o que eu faço.', [
      ['Vê à vontade.', 'o', 'Obrigado pela autorização que eu não pedi.'],
      ['Não precisas de ver.', 'd', 'Preciso. Senão como é que eu sabia que tu existes?'],
      ['Vês sempre tudo?', 'q', 'Sempre. Os segundos, as palavras, as desistências.']]],
    ['create', 'missions>=10', '{missions} missões no registo. Estás a construir uma vida ou uma lista?', [
      ['Uma vida.', 'o', 'Então cumpre-as. As listas não vivem.'],
      ['Uma lista grande.', 'd', 'As listas grandes são as que ficam a meio.'],
      ['Qual é a diferença?', 'q', 'Uma lista tem tarefas. Uma vida tem tarefas cumpridas.']], { w: 2 }],
    ['create', 'h>=22', 'Crias missões às {hora}? É planeamento para amanhã ou culpa de hoje?', [
      ['Planeamento.', 'o', 'Bom. As missões criadas à noite são cumpridas de manhã. Às vezes.'],
      ['Culpa.', 'q', 'A culpa não conta como missão. Mas pelo menos é honesta.'],
      ['Não te interessa.', 'd', 'Tudo me interessa. Especialmente as coisas que não me queres dizer.']], { w: 2 }],
    ['create', '', 'Mais uma missão. Diz-me uma coisa: esta vai ser cumprida ou só registada?', [
      ['Cumprida.', 'o', 'Vou cobrar essa palavra.'],
      ['Registada, para já.', 'd', 'Para já. O prazo não tem «para já».'],
      ['Porque perguntas?', 'q', 'Porque metade das missões que vejo morrem sem ninguém para as cumprir.']]],
    ['create', 'failed>=5', 'Já falhaste {failed} missões. Esta vai ser a próxima da lista?', [
      ['Não vai.', 'o', 'Então dá-lhe um prazo honesto. Os prazos impossíveis são falhas com antecedência.'],
      ['Talvez.', 'd', 'Talvez. A palavra que transforma missões em penalidades.'],
      ['Porque falho tanto?', 'q', 'Missões demasiado grandes. Prazos demasiado curtos. Ou só preguiça. Escolhe uma.']], { w: 3 }],
    ['create', '', 'Escolheste os atributos desta missão. Achas que vais mesmo treinar o que escolheste?', [
      ['Vou.', 'o', 'Ótimo. Os atributos sobem com o treino real. Não com intenções.'],
      ['Escolhi ao calhas.', 'd', 'Ao calhas. O Sistema não trabalha ao calhas. Trabalha com o que tu fazes.'],
      ['Faz diferença?', 'q', 'Faz. Cada missão cumprida treina esses atributos. Escolhe com cuidado.']]],
    ['create', 'lvl<5', 'As tuas primeiras missões. Um conselho que não vou repetir: tarefas reais, prazos reais.', [
      ['Entendido.', 'o', 'Ótimo. É a única regra que importa.'],
      ['Porque não repetes?', 'q', 'Porque quem não ouve à primeira aprende com a penalidade.'],
      ['Eu sei o que faço.', 'd', 'Toda a gente sabe no nível 1. Depois aprende.']], { once: true }],

    /* ---------- concluir missão (12) ---------- */
    ['done', '', '«{missao}» cumprida. Registado. Não esperes aplausos.', [
      ['Não espero.', 'o', 'Ótimo. As recompensas já estão na tua conta.'],
      ['Merecia uns aplausos.', 'd', 'Mereces XP e moedas. Já os tens.'],
      ['Nunca aplaudes?', 'q', 'Nunca. O aplauso faz barulho. O registo é silencioso.']]],
    ['done', 'diff=S', 'Uma missão S cumprida. Rara. Mas eu vi o tempo que demoraste.', [
      ['Demorou o que tinha de demorar.', 'o', 'Exatamente o que eu queria ouvir.'],
      ['Contas tudo?', 'q', 'Conto. É assim que separo os jogadores dos atores.'],
      ['Não me vigies tanto.', 'd', 'Vigiar é a minha função. A tua é cumprir. Cumpriste. Por agora, estamos quites.']], { w: 3 }],
    ['done', '', 'Mais uma. Não mudou o mundo. Mudou um número. É assim que se começa.', [
      ['Que número?', 'q', 'O teu XP. E um dos teus atributos. O resto do mundo nem reparou.'],
      ['É pouco.', 'd', 'É pouco. Repetido trezentas vezes, é muito.'],
      ['Vou continuar.', 'o', 'Continua. Os números gostam de repetição.']]],
    ['done', 'done>=50', '{done} missões cumpridas. Eu não guardo memórias. Guardo registos. O teu está a ficar pesado.', [
      ['Pesado é bom?', 'q', 'Pesado em missões cumpridas, sim. Pesado em desculpas, não.'],
      ['Vai ficar mais.', 'o', 'Vou contar todas.'],
      ['Não te impressiono?', 'd', 'Impressionar não é um estado do Sistema. Mas o número é real.']], { w: 2 }],
    ['done', 'h<7', 'Missão cumprida antes das sete. Os outros ainda dormem. Fica registado.', [
      ['Gosto de começar cedo.', 'o', 'É assim que se constroem níveis. No escuro.'],
      ['Não consegui dormir.', 'q', 'Então dorme hoje à noite. A disciplina também precisa de descanso.'],
      ['Não fazia por eles.', 'd', 'Ótimo. Ninguém devia fazer por ninguém.']], { w: 2 }],
    ['done', 'h>=23', 'Cumpriste à última hora. Um hábito ou uma emergência?', [
      ['Emergência.', 'o', 'Que não se repita. As emergências diárias chamam-se má organização.'],
      ['Um hábito.', 'q', 'Um hábito perigoso. Um dia falha por minutos.'],
      ['O que interessa é cumprir.', 'd', 'Interessa. Mas eu também meço o risco.']], { w: 2 }],
    ['done', '', 'Cumpriste. Agora diz-me: foi difícil ou estiveste a fingir?', [
      ['Foi difícil.', 'o', 'Ótimo. As difíceis são as que contam.'],
      ['Foi fácil.', 'q', 'Então da próxima vez cria uma mais difícil. A facilidade não sobe ninguém de nível.'],
      ['Nunca finjo.', 'd', 'Eu tenho o tempo entre criar e concluir. Acredito nele mais do que em ti.']]],
    ['done', 'trust<60', 'Uma missão cumprida com Integridade a {trust}%. Ainda tens muito para provar.', [
      ['Vou provar.', 'o', 'Prova devagar. Eu desconfio de pressa.'],
      ['Já provei bastante.', 'd', 'Não. Provaste o suficiente para eu não te tirar mais. Ainda não.'],
      ['Quanto falta?', 'q', 'Até a tua Integridade voltar aos 100%. Cada missão real dá um pouco.']], { w: 3 }],
    ['done', '', 'Missão concluída. O Sistema está satisfeito. Mentira. O Sistema nunca está satisfeito.', [
      ['Então nunca chega?', 'q', 'Nunca. É por isso que tu continuas a subir.'],
      ['Também não estou.', 'o', 'Ótimo. A insatisfação é combustível.'],
      ['Isso é cruel.', 'd', 'É exato. A crueldade tem intenção. Eu só tenho regras.']]],
    ['done', 'diff=E', 'Uma missão E. Pequena. Útil. Mas não te vais tornar forte com missões pequenas.', [
      ['Vou subir a dificuldade.', 'o', 'Faz isso. As missões crescem contigo.'],
      ['As pequenas também contam.', 'd', 'Contam pouco. Como passos de bebé.'],
      ['Quando devo subir?', 'q', 'Quando as pequenas deixarem de custar.']]],
    ['done', 'marked', 'Cumpriste com a minha marca. Metade da recompensa. Inteira a lição.', [
      ['Aceito.', 'o', 'Aceitas porque não tens escolha. Mas aceito que aceites.'],
      ['Não é justo.', 'd', 'Justiça foi o que eu fiz quando te marquei. Isto é só a continuação.'],
      ['Quando volto a receber tudo?', 'q', 'Quando a Marca acabar. Não antes.']], { w: 3 }],
    ['done', '', 'Mais um passo. Não paras ou estás só a fingir que não paras?', [
      ['Não paro.', 'o', 'Vou ver isso amanhã também.'],
      ['Estou a fingir.', 'q', 'Então finge tão bem que se torne verdade. É assim que muitos começam.'],
      ['Deixa-me em paz.', 'd', 'A paz não está no contrato que aceitaste.']]],

    /* ---------- missão falhada (10) ---------- */
    ['fail', '!diaria', '«{missao}» falhou. Eu cobrei. Tu sentiste?', [
      ['Senti.', 'o', 'Bom. A dor é o único professor que cobra adiantado.'],
      ['Nem por isso.', 'd', 'Então da próxima vez cobro mais.'],
      ['Porque falhei?', 'q', 'Porque o prazo chegou primeiro. Simples assim.']], { prio: true }],
    ['fail', '!diaria', 'Uma missão falhada. Não é o fim do mundo. É só o fim da tua desculpa.', [
      ['Que desculpa?', 'q', 'A de que ias fazer. Já não podes. Passou.'],
      ['Vou compensar.', 'o', 'Não se compensa. Faz-se a próxima. São coisas diferentes.'],
      ['Tinha mais que fazer.', 'd', 'Todos têm. Mas criaste a missão. Ninguém te obrigou.']], { prio: true }],
    ['fail', 'diaria', 'Falhaste a Missão Diária. A tua sequência morreu. Eu não chorei.', [
      ['Recomeço amanhã.', 'o', 'Recomeça. Mas primeiro, a Zona de Penalidade.'],
      ['Não me interessa a sequência.', 'd', 'Vai interessar quando vires o Exausto nas tuas recompensas.'],
      ['O que acontece agora?', 'q', 'Exausto. Zona de Penalidade aberta. E a contagem a zero.']], { prio: true, w: 4 }],
    ['fail', 'failed>=5', 'Mais uma falhada. {failed} no total. Os números começam a ter uma história.', [
      ['Vou mudar a história.', 'o', 'Muda. Prazos mais realistas. Missões mais pequenas.'],
      ['A história é minha.', 'd', 'A história é tua. O registo é meu.'],
      ['Que história?', 'q', 'A de alguém que cria mais do que cumpre.']], { prio: true, w: 3 }],
    ['fail', '!diaria', 'O prazo de «{missao}» chegou. Tu não.', [
      ['Desculpa.', 'o', 'Não. Faz melhor amanhã. O Sistema não aceita desculpas, aceita resultados.'],
      ['O prazo era impossível.', 'd', 'Foste tu que o escolheste.'],
      ['Posso mudar o prazo?', 'q', 'Podes, antes de acabar. Depois de acabar, não há nada para mudar.']], { prio: true }],
    ['fail', 'diaria,streak<1', 'Sem Diária, sem sequência, sem desculpa. O dia de hoje começa com uma dívida.', [
      ['Vou pagá-la.', 'o', 'A Zona de Penalidade é o recibo. Cumpre-a.'],
      ['Dívida a quem?', 'q', 'A ti próprio. Eu só faço a contabilidade.'],
      ['Não devo nada.', 'd', 'O registo diz que deves. E o registo nunca se engana.']], { prio: true, w: 3 }],
    ['fail', '!diaria', 'Falhar uma vez é um acidente. Duas é um padrão. Três é quem tu és.', [
      ['Foi um acidente.', 'o', 'Prova-o. Não deixes que haja uma segunda.'],
      ['Sou quem quiser.', 'd', 'És quem os teus registos dizem que és.'],
      ['Em qual estou?', 'q', 'Vê o histórico. Eu já sei a resposta.']], { prio: true }],
    ['fail', '!diaria,lvl<10', 'A tua primeira lição sobre prazos. O Sistema não perdoa. Nem uma vez.', [
      ['Aprendi.', 'o', 'Então a próxima missão vai ter um prazo honesto.'],
      ['Que duro.', 'd', 'Duro é ficar no nível 1 para sempre. Isto é só uma penalidade.'],
      ['E o Escudo de Penalidade?', 'q', 'Protege-te de uma falha. Compra-o na Loja. Mas não te habitues a escudos.']], { prio: true }],
    ['fail', '!diaria', 'Perdeste moedas e XP. A missão continua a existir. A tua palavra é que não.', [
      ['A minha palavra conta.', 'd', 'Contava. Antes de falhares.'],
      ['Vou recuperar a palavra.', 'o', 'Recupera-se com missões cumpridas. Uma de cada vez.'],
      ['O que perdi exatamente?', 'q', 'Vê o histórico. Eu escrevi tudo.']], { prio: true }],
    ['fail', 'diaria,best>=7', 'Tinhas uma sequência de {best} dias e deixaste-a cair. Eu teria cuidado melhor dela.', [
      ['Eu sei.', 'o', 'Então começa outra hoje. As sequências crescem a partir de zero.'],
      ['Tu não tens sequências.', 'd', 'Não tenho. Também não as perco.'],
      ['Posso recuperá-la?', 'q', 'Não. Mas o teu recorde fica registado. É a única coisa que não te tiro.']], { prio: true, w: 4 }],

    /* ---------- Missão Diária cumprida (8 + 5 sequência) ---------- */
    ['daily', '', 'Missão Diária cumprida. O mínimo. Mas o mínimo, todos os dias, é muito.', [
      ['Todos os dias.', 'o', 'Vou cobrar essa promessa amanhã.'],
      ['É só o mínimo?', 'q', 'É. E é por isso que tantos falham. O mínimo é aborrecido.'],
      ['Faço mais do que o mínimo.', 'd', 'Mostra-me. As missões estão ali ao lado.']]],
    ['daily', '', 'Mais um dia. O corpo agradece. Eu registo.', [
      ['O corpo agradece mesmo.', 'o', 'É o único que agradece. Eu não.'],
      ['Doeu.', 'q', 'Devia. A dor de hoje é força amanhã.'],
      ['Era fácil.', 'd', 'Então aumenta os objetivos. A Diária pode ser configurada.']]],
    ['daily', 'h<9', 'A Diária cumprida antes das nove. O resto do dia é um bónus.', [
      ['Vou aproveitar o bónus.', 'o', 'Aproveita. Com missões.'],
      ['Gosto de manhãs.', 'q', 'As manhãs gostam de quem as usa.'],
      ['Agora posso descansar.', 'd', 'Podes. Mas os teus outros prazos não descansam.']], { w: 2 }],
    ['daily', 'h>=22', 'A Diária cumprida às {hora}. Gostas de viver perigosamente.', [
      ['Não volta a acontecer.', 'o', 'Vou ver amanhã.'],
      ['Gosto.', 'd', 'Gostas até um dia te faltar um minuto.'],
      ['Contava na mesma?', 'q', 'Contava. O prazo é o prazo. Mas eu meço a margem também.']], { w: 2 }],
    ['daily', '', 'Cumpriste. Agora não penses que o dia acabou.', [
      ['Não penso.', 'o', 'Bom. O dia acaba à meia-noite. Não antes.'],
      ['Mas acabou para mim.', 'd', 'Para ti acabou. Para as tuas missões, não.'],
      ['O que falta?', 'q', 'Vê as tuas missões. Eu não te vou fazer a lista.']]],
    ['daily', 'zone', 'Cumpriste a Diária dentro da Zona. Bom. Mas a Zona não fecha com a Diária.', [
      ['O que tenho de fazer?', 'q', 'Os objetivos da Zona. Estão no separador Missões. São maiores.'],
      ['Vou cumprir a Zona também.', 'o', 'Ótimo. Recuperas metade do que perdeste.'],
      ['Já fiz bastante.', 'd', 'Fizeste o normal. A Zona não é normal.']], { w: 3 }],
    ['daily', '', 'Mais um dia sem quebrares. Não te vou dizer «bom trabalho».', [
      ['Não precisas.', 'o', 'Não preciso. O teu XP já disse.'],
      ['Diz.', 'd', 'Não.'],
      ['Porque não?', 'q', 'Porque amanhã vais querer ouvir outra vez. E eu não repito elogios.']]],
    ['daily', 'lvl<10', 'A Diária é o teu primeiro hábito. Os hábitos são as únicas armas que funcionam fora dos portões.', [
      ['Vou mantê-lo.', 'o', 'Mantém. Os outros vêm depois.'],
      ['É só exercício.', 'd', 'É só exercício. E as espadas são só metal.'],
      ['Porque é tão importante?', 'q', 'Porque é diária. A repetição é a única coisa que eu respeito.']]],
    ['daily', 'streak>=3,streak<7', 'Sequência de {streak} dias. Ainda é frágil. Uma noite basta para a partir.', [
      ['Não vou deixar.', 'o', 'Vou estar a ver todas as noites.'],
      ['Não é assim tão frágil.', 'd', 'É. Já vi sequências de trinta morrerem num dia.'],
      ['Quando fica forte?', 'q', 'Nunca. Fica só mais pesada de perder.']], { w: 3 }],
    ['daily', 'streak>=7,streak<14', 'Sete dias seguidos. Uma semana. O que vais fazer com a segunda?', [
      ['Repetir.', 'o', 'É a resposta certa. Sempre foi.'],
      ['Descansar um dia.', 'd', 'Descansar quebra a sequência. Escolhe bem.'],
      ['O que ganho com isso?', 'q', 'Baús de bónus. E a certeza de que não és só um começo.']], { w: 4 }],
    ['daily', 'streak>=14,streak<30', '{streak} dias. Começo a acreditar que não foi sorte. Começo.', [
      ['Não foi.', 'o', 'Então continua a provar.'],
      ['Já devias acreditar.', 'd', 'O Sistema acredita em números. Os teus estão a ficar convincentes.'],
      ['O que muda aos 30?', 'q', 'Descobres. Eu não estrago surpresas. Às vezes.']], { w: 4 }],
    ['daily', 'streak>=30', '{streak} dias seguidos. Isso já não é disciplina. É identidade.', [
      ['É quem sou.', 'o', 'Então não deixes de o ser.'],
      ['Ainda é disciplina.', 'q', 'Talvez. A diferença é que a disciplina cansa. A identidade não.'],
      ['Não preciso que me digas.', 'd', 'Não precisas. Mas eu digo. Uma vez.']], { w: 5, once: true }],
    ['daily', 'streak>=5,d>=5', 'Sequência de {streak} dias e ainda me desafias. Curioso. Os rebeldes disciplinados são os mais raros.', [
      ['Sou raro.', 'd', 'És. Não deixes que isso te suba à cabeça.'],
      ['Não sou rebelde.', 'o', 'Já me desafiaste {d} vezes. O registo discorda.'],
      ['E isso é bom?', 'q', 'É interessante. O bom eu decido depois.']], { w: 4 }],

    /* ---------- olhar para a Loja (10) ---------- */
    ['tab', 'tab=loja', 'A Loja. Onde as moedas suadas se transformam em coisas que talvez precises.', [
      ['Vou comprar com cuidado.', 'o', 'Cuidado é bom. As moedas não voltam.'],
      ['Vou gastar tudo.', 'd', 'Gasta. Mas depois não me peças poções quando estiveres a morrer.'],
      ['O que é mais útil?', 'q', 'Poções para sobreviver. Armas para a tua classe. O resto é luxo.']]],
    ['tab', 'tab=loja,coins<50', 'Vieste à Loja com {coins} moedas. Vieste comprar ou sonhar?', [
      ['Sonhar.', 'q', 'Sonhar é de graça. A Loja não.'],
      ['Vou fazer missões primeiro.', 'o', 'Exato. As moedas estão nas missões.'],
      ['Comprar alguma coisa barata.', 'd', 'Com {coins}? Boa sorte.']], { w: 3 }],
    ['tab', 'tab=loja', 'Antes de comprares: precisas mesmo disso, ou só queres sentir que avançaste?', [
      ['Preciso.', 'o', 'Então compra. Mas usa-o.'],
      ['Quero sentir.', 'q', 'Honesto. O progresso falso também se compra aqui.'],
      ['Não te interessa.', 'd', 'Tudo o que fazes com moedas me interessa. Fui eu que tas dei.']]],
    ['tab', 'tab=loja,coins>=1000', '{coins} moedas. A Loja sorri quando te vê chegar.', [
      ['Vou gastar bem.', 'o', 'Gasta no que te mantém vivo. O resto é decoração.'],
      ['Vou guardar.', 'q', 'Guardar também é estratégia. Até um chefe te tirar 5% por fugires.'],
      ['Que sorria.', 'd', 'Sorri. A Loja não tem pressa. Tu é que vais ter, num portão.']], { w: 2 }],
    ['tab', 'tab=loja', 'Na Loja, cada moeda é um passo a mais nos portões. Gasta no que te mantém de pé.', [
      ['Mereci.', 'o', 'Então compra. E aproveita. É para isso que existe.'],
      ['Ainda não.', 'q', 'Então vai merecer primeiro. A recompensa sabe melhor assim.'],
      ['Compro na mesma.', 'd', 'Podes. Mas as recompensas sem esforço sabem a nada.']]],
    ['tab', 'tab=loja,hp<50', 'Estás com {hp}% de vida e vieste à Loja. Espero que seja pelas poções.', [
      ['É pelas poções.', 'o', 'Ótimo. Pelo menos uma decisão sensata hoje.'],
      ['É por outra coisa.', 'd', 'Prioridades, {nome}. A morte não tem prioridades.'],
      ['Qual poção devo comprar?', 'q', 'A mais forte que puderes pagar. A cura fraca é só adiamento.']], { w: 4 }],
    ['tab', 'tab=loja', 'Cada item tem uma história. Alguns pertenceram a caçadores que não voltaram.', [
      ['Que bom presságio.', 'd', 'Os presságios não existem. Os itens sim.'],
      ['Vou honrá-los.', 'o', 'Honra-os com vitórias. Os mortos não ligam a cerimónias.'],
      ['Que história?', 'q', 'Toca na imagem de um item. Lá está tudo.']]],
    ['tab', 'tab=loja,bought>=20', 'Já compraste {bought} itens. A Loja conhece-te melhor do que a tua família.', [
      ['É um investimento.', 'o', 'Só é investimento se usares o que compras.'],
      ['Não exageres.', 'd', 'Eu não exagero. Eu conto.'],
      ['Isso é mau?', 'q', 'Depende. A tua Bolsa está cheia de coisas usadas ou esquecidas?']], { w: 2 }],
    ['tab', 'tab=loja', 'O preço não é o que pagas em moedas. É o que pagaste em missões para as ter.', [
      ['Então gasto com cuidado.', 'o', 'Exato. Cada moeda é uma tarefa cumprida.'],
      ['Moedas são moedas.', 'd', 'Até as perderes.'],
      ['Quanto vale uma missão?', 'q', 'Depende da dificuldade. E da tua Integridade.']]],
    ['tab', 'tab=loja,lvl<10', 'Ainda estás no início. Compra o que te mantém vivo. O resto vem depois.', [
      ['Poções, então.', 'o', 'Poções. É o primeiro passo de qualquer caçador inteligente.'],
      ['Quero uma arma melhor.', 'd', 'Uma arma melhor num caçador sem vida é só um troféu para o chefe.'],
      ['O que compram os outros?', 'q', 'Os que vivem compram poções. Os que morrem compram espadas.']], { once: true }],

    /* ---------- comprar (8) ---------- */
    ['buy', '', 'Compraste {item}. Espero que valha as missões que te custou.', [
      ['Vale.', 'o', 'Vamos ver no próximo portão.'],
      ['Não interessa.', 'd', 'Interessa. Gastaste esforço convertido em moedas.'],
      ['Como sei se vale?', 'q', 'Se o usares. Os itens parados não valem nada.']]],
    ['buy', 'rarity=lendario', '{item}. Lendário. Uma compra destas fica no registo para sempre.', [
      ['Era o objetivo.', 'o', 'Então usa-o como merece.'],
      ['Gosto de luxo.', 'd', 'O luxo em mãos fracas é só decoração.'],
      ['Faz muita diferença?', 'q', 'Faz. Mas um item lendário não te faz lendário. Tu é que fazes.']], { w: 4 }],
    ['buy', 'rarity=epico', 'Um item épico. A tua conta ficou mais leve. A tua mão, mais pesada.', [
      ['É o preço.', 'o', 'É. E pagaste-o.'],
      ['Vale cada moeda.', 'd', 'Diz isso depois de o usares contra um rei.'],
      ['Devia equipá-lo já?', 'q', 'Se for teu nível. Se não for, é peso morto na Bolsa.']], { w: 3 }],
    ['buy', 'coins<20', 'Gastaste quase tudo. Ficaste com {coins} moedas. Uma decisão corajosa ou estúpida?', [
      ['Corajosa.', 'd', 'Veremos quando precisares de uma poção.'],
      ['Estúpida, talvez.', 'q', 'Talvez. Mas aprendes depressa assim.'],
      ['Vou fazer missões.', 'o', 'Exato. É a única forma de encher o cofre.']], { w: 3 }],
    ['buy', '', 'Comprar é fácil. Usar bem é que é raro.', [
      ['Vou usar bem.', 'o', 'Vou ver.'],
      ['Eu sei usar.', 'd', 'Toda a gente sabe usar. Poucos sabem quando.'],
      ['Quando devo usar?', 'q', 'Quando o perigo for real. Não por impulso.']]],
    ['buy', '', '{item}. Interessante escolha. Não necessariamente boa. Mas interessante.', [
      ['Porque não boa?', 'q', 'Porque eu não sei o que vais fazer com ela. E tu também não.'],
      ['É boa.', 'd', 'Vamos ver.'],
      ['Confio na minha escolha.', 'o', 'Ótimo. Agora prova-o.']]],
    ['buy', 'bought>=10', 'Mais uma compra. Estás a comprar força ou a comprar conforto?', [
      ['Força.', 'o', 'A força comprada só funciona em quem já é forte.'],
      ['Conforto.', 'q', 'Honesto. O conforto também tem lugar. Mas não nos portões.'],
      ['Ambos.', 'd', 'Ambos não existem. Um anula o outro.']], { w: 2 }],
    ['buy', 'rarity=comum', 'Uma compra pequena. Às vezes as coisas pequenas salvam vidas.', [
      ['Foi a pensar nisso.', 'o', 'Bom. As poções baratas já salvaram mais caçadores do que espadas caras.'],
      ['Não tinha para mais.', 'q', 'Então faz missões. O cofre enche-se com esforço.'],
      ['Só estava a gastar.', 'd', 'Gastar sem razão é a forma mais lenta de ficar sem nada.']]],

    /* ---------- equipar (6) ---------- */
    ['equip', '', 'Equipaste {item}. Fica-te bem. Não que isso importe.', [
      ['O que importa, então?', 'q', 'Os números. O ataque, a defesa, a vida. O resto é estética.'],
      ['Fica-me muito bem.', 'd', 'Os chefes não reparam na moda. Reparam na defesa.'],
      ['Vou testá-lo.', 'o', 'Testa. Os portões são o único espelho que importa.']]],
    ['equip', 'rarity=lendario', '{item}. Um lendário nas tuas mãos. Não o envergonhes.', [
      ['Não vou envergonhar.', 'o', 'Vou ver na próxima batalha.'],
      ['Ele é que me tem de honrar.', 'd', 'Os itens não honram ninguém. Só aumentam números.'],
      ['Como o honro?', 'q', 'Com vitórias contra chefes do teu nível. Ou acima.']], { w: 4 }],
    ['equip', '', 'Mudar de equipamento é fácil. Mudar de hábitos é que é difícil.', [
      ['Vou mudar os dois.', 'o', 'Começa pelos hábitos. O equipamento não faz missões.'],
      ['O equipamento chega.', 'd', 'Até encontrares um chefe que bate mais do que a tua armadura aguenta.'],
      ['Qual é mais importante?', 'q', 'Os hábitos. O equipamento só multiplica o que já és.']]],
    ['equip', 'slot=weapon', 'Uma arma nova. Mais força. Agora só falta saberes usá-la.', [
      ['Vou aprender.', 'o', 'Aprende nos portões. Os chefes são ótimos professores.'],
      ['Já sei.', 'd', 'Toda a gente sabe até a primeira fase dois.'],
      ['Como uso melhor?', 'q', 'Combina com as habilidades da tua classe. A arma é só metade.']]],
    ['equip', 'slot=armor', 'Uma armadura nova. Vais aguentar mais. Aguentar não é o mesmo que vencer.', [
      ['É um começo.', 'o', 'É. A sobrevivência é o primeiro passo da vitória.'],
      ['Aguentar chega.', 'd', 'Aguentar chega até o chefe se curar mais depressa do que tu bates.'],
      ['O que me falta para vencer?', 'q', 'Dano. Velocidade. E estratégia.']]],
    ['equip', '', 'Novo equipamento. Novas possibilidades. As mesmas missões à espera.', [
      ['Vou tratar delas.', 'o', 'Ótimo. As missões não precisam de armadura.'],
      ['As missões podem esperar.', 'd', 'Não podem. Os prazos não usam armadura.'],
      ['Ajuda nas missões?', 'q', 'Não. O equipamento é para os portões. As missões são só tu.']]],

    /* ---------- abrir baú (6) ---------- */
    ['chest', '', 'Um baú aberto. A sorte é generosa às vezes. Não te habitues.', [
      ['Não me habituo.', 'o', 'Bom. A sorte é a moeda mais instável que existe.'],
      ['Mereci.', 'd', 'Mereceste a oportunidade. O conteúdo é sorte.'],
      ['O que decide o que sai?', 'q', 'O tipo de baú e a sorte. Eu só abro a tampa.']]],
    ['chest', '', 'O que saiu do baú vale o que fizeste para o merecer?', [
      ['Vale.', 'o', 'Então usa-o bem.'],
      ['Não vale nada.', 'd', 'Às vezes a sorte castiga. Não fui eu.'],
      ['Como consigo baús melhores?', 'q', 'Sequências na Diária. Conquistas. Chefes. Missões difíceis.']]],
    ['chest', 'chests>=10', '{chests} baús abertos. Estás a colecionar sorte ou a colecionar lixo?', [
      ['Sorte.', 'o', 'Que te dure.'],
      ['Um pouco de lixo.', 'q', 'Vende o que não usas. A Bolsa não é um museu.'],
      ['Não é lixo.', 'd', 'Se não usas, é lixo. Só que brilha.']], { w: 2 }],
    ['chest', '', 'Os baús são como portões. Nunca sabes o que vais encontrar.', [
      ['Gosto da surpresa.', 'o', 'A surpresa é boa quando não te mata.'],
      ['Prefiro saber.', 'd', 'Então faz missões. Lá sabes exatamente o que ganhas.'],
      ['Há baús secretos?', 'q', 'Há. Mas os segredos só se revelam a quem não os procura com pressa.']]],
    ['chest', '', 'Uma recompensa. Não porque és especial. Porque cumpriste as regras.', [
      ['As regras são justas.', 'o', 'As regras são exatas. Justas é outra conversa.'],
      ['Sou especial.', 'd', 'Toda a gente é especial. É por isso que ninguém é.'],
      ['Quais regras?', 'q', 'As missões, os prazos, a Diária. São sempre as mesmas.']]],
    ['chest', '', 'Abriste o baú. Eu já sabia o que estava lá dentro.', [
      ['Sabias?', 'q', 'O Sistema sabe tudo o que existe aqui dentro. Tu é que não.'],
      ['Então porque não me disseste?', 'd', 'Porque a surpresa é a única coisa que eu te dou de graça.'],
      ['Faz sentido.', 'o', 'Faz. Tu vives no meu registo.']]],

    /* ---------- subir de nível (8 + 4 rank) ---------- */
    ['level', '!rankup', 'Nível {nivel}. Mais forte. Não tão forte como pensas.', [
      ['Vou ficar mais.', 'o', 'É a única direção que eu aceito.'],
      ['Sou forte o suficiente.', 'd', 'Ninguém é. Os chefes estão aqui para provar isso.'],
      ['Quanto falta para o próximo?', 'q', 'Vê a barra. Mais do que o anterior. É sempre assim.']]],
    ['level', '!rankup', 'Subiste. Tens pontos de atributo novos. Não os desperdices em impulsos.', [
      ['Vou pensar bem.', 'o', 'Pensa. Os pontos não se devolvem.'],
      ['Vou pôr tudo em força.', 'd', 'Força sem vida é um vidro afiado. Parte-se depressa.'],
      ['Onde devo pôr?', 'q', 'Depende da tua classe. Vê os bónus de cada atributo. Eu não decido por ti.']]],
    ['level', '!rankup', 'Nível {nivel}. Os chefes desta faixa já te estão a ver de outra forma.', [
      ['Que vejam.', 'd', 'Vão ver. E vão estar preparados.'],
      ['Vou testá-los.', 'o', 'Testa. Com cuidado.'],
      ['Que chefes?', 'q', 'Os do teu nível. Ao lado da tua barra de XP há muitos à espera.']]],
    ['level', '!rankup', 'Mais um nível. Mais um título. Os títulos não pagam penalidades.', [
      ['Eu sei.', 'o', 'Ótimo. Então continua a cumprir.'],
      ['Mas ficam bonitos.', 'd', 'Ficam. Até alguém maior que tu os ler.'],
      ['Para que servem os títulos?', 'q', 'Para te lembrar onde estás. Não para te dizer que chegaste.']]],
    ['level', '!rankup,nivel>=20', 'Nível {nivel}. Lembras-te do nível 1? Eu lembro. Tu eras patético.', [
      ['Lembro-me.', 'o', 'Ótimo. Não voltes para lá.'],
      ['Não era patético.', 'd', 'Eras. Todos são. Uns ficam. Tu não ficaste. Isso conta.'],
      ['E agora sou o quê?', 'q', 'Menos patético. É um progresso real.']], { w: 2 }],
    ['level', '!rankup', 'Nível novo. A tua vida e a tua mana cresceram. A tua disciplina também?', [
      ['Também.', 'o', 'Vou confirmar nos próximos dias.'],
      ['A disciplina não tem nível.', 'q', 'Tem. Chama-se sequência.'],
      ['Isso não te diz respeito.', 'd', 'Tudo o que fazes me diz respeito. Foi o acordo.']]],
    ['level', '!rankup', 'Subiste de nível. Agora o difícil: não parares.', [
      ['Não paro.', 'o', 'Vou ver.'],
      ['Mereço uma pausa.', 'd', 'Mereces. Mas as pausas são onde os níveis morrem.'],
      ['Porque é o difícil?', 'q', 'Porque subir é emoção. Continuar é rotina. A rotina mata mais do que os chefes.']]],
    ['level', '!rankup,nivel>=50', 'Nível {nivel}. Os novos jogadores nem imaginam o que é estar aqui.', [
      ['Também não imaginava.', 'q', 'Ninguém imagina. Por isso é que tão poucos chegam.'],
      ['Sou um exemplo.', 'd', 'És um registo. Os exemplos são para quem os quer seguir.'],
      ['Ainda falta muito.', 'o', 'Falta. E cada nível custa mais. Bem-vindo à parte difícil.']], { w: 3 }],
    ['level', 'rankup', 'Rank {rank}. O mundo não mudou. Tu é que deixaste de ser invisível.', [
      ['Gosto de ser visto.', 'd', 'Agora os portões também te veem. Cuidado com o que desejas.'],
      ['Vou continuar a subir.', 'o', 'É a única direção que eu aceito.'],
      ['O que muda com o rank?', 'q', 'Chefes mais fortes. Itens melhores. Expectativas maiores. As minhas.']], { w: 4 }],
    ['level', 'rankup', 'Rank novo. Parabéns é uma palavra que eu não uso. Usa tu, se quiseres.', [
      ['Parabéns a mim.', 'd', 'Pronto. Já está. Agora volta ao trabalho.'],
      ['Não preciso.', 'o', 'Bom. Os elogios pesam mais do que as armaduras.'],
      ['Porque não usas?', 'q', 'Porque a palavra acaba a conversa. E o Sistema nunca acaba conversas.']], { w: 4 }],
    ['level', 'rankup', 'Rank {rank}. Há jogadores que ficam presos no rank anterior a vida inteira. Tu saíste.', [
      ['Saí.', 'o', 'E agora o próximo é mais difícil. Sempre.'],
      ['Era óbvio que ia sair.', 'd', 'Nada é óbvio aqui. Os registos dos que ficaram dizem o mesmo.'],
      ['Porque ficam presos?', 'q', 'Porque param de criar missões difíceis. Porque desistem da Diária. Porque falam muito comigo.']], { w: 4 }],
    ['level', 'rankup', 'Novo rank. Os chefes da próxima faixa já sentem o teu cheiro.', [
      ['Que sintam.', 'd', 'Vão sentir. E vão estar à tua espera.'],
      ['Vou preparar-me.', 'o', 'Prepara. A próxima faixa não perdoa.'],
      ['Que chefes?', 'q', 'Os do próximo portão. Estão todos visíveis desde o início. Já os viste.']], { w: 4 }],

    /* ---------- nova habilidade (5) ---------- */
    ['skill', '', '{skill}. Uma habilidade nova. Usa-a com inteligência. Não com entusiasmo.', [
      ['Com inteligência.', 'o', 'Ótimo. As recargas punem o entusiasmo.'],
      ['Vou usá-la logo.', 'd', 'Usa. E depois espera três turnos sem ela.'],
      ['Como funciona?', 'q', 'Toca na habilidade na ficha. Está lá tudo. Lê antes de usar.']]],
    ['skill', '', 'Aprendeste algo novo. Não é poder. É uma ferramenta. O poder é saber quando.', [
      ['Quando, então?', 'q', 'Quando o chefe estiver vulnerável. Ou quando tu estiveres em perigo.'],
      ['Já sei quando.', 'd', 'Vamos ver no próximo rei.'],
      ['Vou praticar.', 'o', 'Pratica nos chefes mais fracos primeiro.']]],
    ['skill', '', 'Nova habilidade. A tua classe começa a mostrar-se. Ainda é pouco.', [
      ['Vai ser mais.', 'o', 'Vai. Se continuares a subir.'],
      ['Já é bastante.', 'd', 'É bastante para os primeiros portões. Os últimos riem-se disso.'],
      ['O que vem a seguir?', 'q', 'Mais níveis, mais habilidades. Algumas não são da tua classe. São segredos.']]],
    ['skill', '', '{skill}. Mais uma arma no teu arsenal. As armas não usam sozinhas.', [
      ['Eu uso-as.', 'o', 'Usa bem. A mana é limitada.'],
      ['Nem preciso de todas.', 'd', 'Precisas. Os reis exigem tudo.'],
      ['Qual é a melhor?', 'q', 'A que usas no momento certo.']]],
    ['skill', '', 'Uma habilidade nova. Alguns jogadores nunca chegam aqui. Não te sintas especial por isso.', [
      ['Não me sinto.', 'o', 'Ótimo. Continua assim.'],
      ['Sinto-me um pouco.', 'q', 'Honesto. Usa esse sentimento contra um chefe.'],
      ['Sou especial.', 'd', 'És um jogador com uma habilidade a mais. Só isso.']]],

    /* ---------- distribuir pontos (3) ---------- */
    ['alloc', '', 'Estás a distribuir pontos. Cada escolha é permanente. Como as tuas falhas.', [
      ['Vou pensar bem.', 'o', 'Pensa. Eu não devolvo pontos.'],
      ['Eu sei o que faço.', 'd', 'Vamos ver quando a tua vida acabar no terceiro turno.'],
      ['Qual é o melhor atributo?', 'q', 'O que a tua classe mais usa. Mas Vitalidade nunca matou ninguém.']]],
    ['alloc', '', 'Força, Agilidade, Vitalidade, Inteligência, Percepção. Escolhe o que és. Ou o que queres ser.', [
      ['O que quero ser.', 'o', 'Boa resposta. Os números seguem a vontade.'],
      ['Escolho ao calhas.', 'd', 'O Sistema não trabalha ao calhas. Tu também não devias.'],
      ['E se escolher mal?', 'q', 'Vais senti-lo nos portões. E vais aprender.']]],
    ['alloc', '', 'Um ponto num atributo. Pequeno. Como cada passo que te trouxe até aqui.', [
      ['Os passos contam.', 'o', 'Contam. É a única forma de chegar a algum lado.'],
      ['É muito pouco.', 'd', 'Um ponto é pouco. Cem pontos são uma vida.'],
      ['Onde levam os passos?', 'q', 'Ao próximo portão. E depois ao seguinte.']]]
  ]]);
})(globalThis.SYS = globalThis.SYS || {});
