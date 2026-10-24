/* ==========================================================
   NOVOS DIÁLOGOS DO SISTEMA (2/4): chefes, vitórias, derrotas e fugas
   ========================================================== */
(function (S) {
  'use strict';
  var R = { w: 0.4, once: true };
  (S.TALK_RAW = S.TALK_RAW || []).push(['xc', [
    /* ---------- ao olhar para um chefe ---------- */
    ['boss', 'gap>=8,!dead', '{boss} está {gap} níveis acima de ti. Não é um adversário. É uma lição com dentes.', [
      ['Prefiro aprender noutro sítio.', 'o', 'Sensato. As missões ensinam o mesmo, sem morder.'],
      ['Gosto de lições difíceis.', 'd', 'Esta é difícil e cara. XP e moedas. Paga a propina, se quiseres.'],
      ['O que me ensinava?', 'q', 'Que o nível conta. Que a coragem sem números é um funeral com boas intenções.']]],
    ['boss', 'gap>=8,!dead', 'Estás a medir {boss} com os olhos. Eu meço com números. Os números dizem que não.', [
      ['Os números às vezes erram.', 'd', 'Os números não erram. Os Jogadores é que não os leem até ao fim.'],
      ['Então espero.', 'o', 'Espera. Volta com {gap} níveis a menos de diferença.'],
      ['O que dizem exatamente?', 'q', 'Que ele te tira mais vida por golpe do que tu lhe tiras em três.']]],
    ['boss', 'gap>=8,!dead', 'Entrar agora seria uma forma muito elaborada de perder moedas.', [
      ['Então não entro.', 'o', 'Ótimo. Guarda as moedas para poções. Vais precisar delas noutro dia.'],
      ['Tenho moedas de sobra.', 'd', 'Tens {coins}. «De sobra» é uma opinião.'],
      ['Quantas perco?', 'q', 'Uma parte. E XP. E um pouco de orgulho, que eu não devolvo.']]],
    ['boss', 'gap>=12,!dead', '{gap} níveis. A esta distância, até a tua sombra tem medo de entrar.', [
      ['Eu não tenho sombra.', 'q', 'Ainda não. As sombras vêm dos chefes que vences. Este não é um deles. Hoje.'],
      ['A minha sombra é corajosa.', 'd', 'A tua sombra é sensata. Aprende com ela.'],
      ['Vou embora.', 'o', 'Vai. Volta mais tarde. Bastante mais tarde.']]],
    ['boss', 'gap>=8,!dead,lvl<15', 'Ainda nem tens nível 15 e já olhas para isto? Tens ambição. Ou não sabes ler.', [
      ['Tenho ambição.', 'd', 'Ambição sem nível é só imaginação. Sobe primeiro.'],
      ['Só estava a ver.', 'o', 'Ver é seguro. Continua a ver. De longe.'],
      ['Quando devo vir?', 'q', 'Quando a diferença for menos de cinco níveis. Antes disso é sorte. E eu não acredito em sorte.']]],
    ['boss', 'gap<8,gap>-8,!dead', '{boss}. Nível {blvl}. Uma luta ao teu alcance. O alcance também se perde.', [
      ['Vou já.', 'o', 'Vai. Com vida cheia e poções na Bolsa.'],
      ['É fácil.', 'd', 'Nenhum chefe é fácil. Alguns só parecem até ao terceiro turno.'],
      ['Como me preparo?', 'q', 'Vida cheia. Mana cheia. Lê a ficha dele. Por esta ordem.']]],
    ['boss', 'gap<8,gap>-8,!dead', 'Este chefe tem um padrão. Todos têm. Já viste o dele?', [
      ['Já vi.', 'o', 'Então usa-o. Defende quando ele carrega. Ataca quando ele recupera.'],
      ['Eu luto à minha maneira.', 'd', 'A tua maneira vai encontrar a dele. Vamos ver quem tem mais vida no fim.'],
      ['Qual é?', 'q', 'Lê as habilidades na ficha. Os golpes com recarga longa são os que te matam.']]],
    ['boss', 'gap<8,gap>-8,!dead', 'Uma luta justa. As lutas justas são as únicas em que eu aprendo alguma coisa sobre ti.', [
      ['Vais aprender muito.', 'd', 'Espero. Até agora aprendi pouco.'],
      ['Vou lutar bem.', 'o', 'Bem não chega. Luta com cabeça.'],
      ['O que queres aprender?', 'q', 'Se recuas quando dói. Ou se te adaptas. São os dois tipos de Jogadores.']]],
    ['boss', 'gap<8,gap>-8,!dead', 'Antes de entrares: quando foi a última vez que cumpriste uma missão real?', [
      ['Hoje.', 'o', 'Ótimo. Então entra. Os chefes são o prémio, não o trabalho.'],
      ['Não me lembro.', 'q', 'Então vai cumprir uma primeiro. O portão espera. O nível não.'],
      ['Isso não tem nada a ver.', 'd', 'Tem tudo a ver. O teu nível vem das missões. A tua força também.']]],
    ['boss', 'gap<8,gap>-8,!dead,hp<60', 'Queres enfrentar {boss} com {hp}% de vida. Eu também gosto de desafios. Não de suicídios.', [
      ['Vou curar-me.', 'o', 'Ótimo. A Bolsa existe por uma razão.'],
      ['Chega para ele.', 'd', 'Chega para ele te vencer. Para ti, não.'],
      ['Quanto devia ter?', 'q', 'Toda. Os chefes também não entram cansados.']]],
    ['boss', 'gap<=-5,!dead', '{boss} está {abs} níveis abaixo de ti. Vais ganhar. A pergunta é: vais aprender alguma coisa?', [
      ['Vou limpar o portão.', 'o', 'Limpeza é útil. Ganha o troféu e passa ao seguinte.'],
      ['Só quero o troféu.', 'd', 'Leva. Os troféus contam para os conjuntos. É a única utilidade dele agora.'],
      ['O que podia aprender?', 'q', 'Eficiência. Vence-o no menor número de turnos. Desafio-te.']]],
    ['boss', 'gap<=-10,!dead', 'Isto já não é combate. É arquivo. Vais arquivar {boss}?', [
      ['Vou.', 'o', 'Arquiva. Um portão limpo é um portão em ordem.'],
      ['Que aborrecido.', 'd', 'Então porque abriste a ficha dele? Eu sei porquê. O troféu.'],
      ['Ainda dá XP?', 'q', 'Pouco. Os fracos dão pouco. É a lei dos portões.']]],
    ['boss', 'dead', '{boss} já caiu às tuas mãos. Estás a rever o trabalho ou a fugir de trabalho novo?', [
      ['A rever.', 'o', 'Rever é útil. Por pouco tempo.'],
      ['A fugir.', 'q', 'Honesto. O chefe seguinte está a três toques daqui.'],
      ['Gosto de ver os vencidos.', 'd', 'Toda a gente gosta. Até ao dia em que alguém olha para o teu nome assim.']]],
    ['boss', 'dead', 'Os chefes derrotados não voltam. Mas as sombras deles sim. Já pensaste em erguer este?', [
      ['Vou pensar.', 'o', 'Pensa. As sombras lembram-se de quem as venceu.'],
      ['Não preciso de sombras.', 'd', 'Até ao dia em que precisares de alguém que lute contigo.'],
      ['Como funcionam?', 'q', 'Vences, erguem-se, servem. Mais ou menos como tu e eu. Menos o servir.']]],
    ['boss', 'king,!dead,!final', 'Um rei. Duas fases. Na segunda, ele vai lembrar-se de todos os golpes que lhe deste.', [
      ['Então dou poucos e fortes.', 'o', 'Boa estratégia. Guarda as habilidades mais fortes para a segunda fase.'],
      ['Que se lembre.', 'd', 'Lembra-se. E responde. Com juros.'],
      ['O que muda na segunda?', 'q', 'A raiva. O dano. A pressa. Tu tens de mudar também.']]],
    ['boss', 'king,!dead,!final', 'O rei do {portao}. Todos os chefes deste portão trabalharam para ele. Tu trabalhas para quem?', [
      ['Para mim.', 'o', 'Resposta certa. Os reis caem porque trabalham para a coroa.'],
      ['Para ti.', 'd', 'Não trabalhas para mim. Trabalhas para o teu registo. Eu só o seguro.'],
      ['Faz diferença?', 'q', 'Faz. Quem trabalha para si próprio não para quando o chefe cai.']]],
    ['boss', 'king,!dead,!final,gap>=3', 'Um rei acima de ti. Os reis não lutam por moedas. Lutam por nunca perder o trono. É mais perigoso.', [
      ['Vou subir primeiro.', 'o', 'Sobe. O trono não foge. Os reis gostam de esperar sentados.'],
      ['Eu luto por mais.', 'd', 'Diz-me o quê, depois de ganhares. Se ganhares.'],
      ['E eu luto porquê?', 'q', 'Pelo portão seguinte. Os reis são portas com coroa.']]],
    /* menção */
    ['boss', 'king,!dead,!final', 'Sabes o que era este portão antes de ser um portão? Não era um labirinto. Isso posso dizer-te.', [
      ['Então o que era?', 'q', 'Outra coisa. O resto é o que vês. Não te digo mais.'],
      ['É só um nível.', 'd', 'Para ti. Para quem lá vivia era tudo. Mas não interessa. Luta.'],
      ['Faz sentido.', 'o', 'Faz mais sentido do que imaginas. Um dia talvez percebas porquê.']], R],
    ['boss', 'final,!dead', 'O Soberano do Vazio. Não te vou dar conselhos. Para este, não existem.', [
      ['Nenhum?', 'q', 'Um só: não olhes demasiado para o olho dele. Ele também te olha.'],
      ['Não preciso.', 'd', 'Ninguém precisa até ao primeiro golpe dele.'],
      ['Vou preparar-me.', 'o', 'Prepara-te para mais do que um chefe. Este é diferente.']]],
    /* menção */
    ['boss', 'final,!dead', 'Ele está à tua espera desde o primeiro dia. Viu cada missão que cumpriste. E cada uma que falhaste.', [
      ['Como sabes?', 'q', 'Porque eu sei. Não te digo como.'],
      ['Que veja.', 'd', 'Vê. É tudo o que ele ainda consegue fazer. Não perguntes mais.'],
      ['Vou mostrar-lhe as cumpridas.', 'o', 'Mostra. Ele vai reconhecer o esforço. Há coisas que nunca se esquecem.']], R],
    ['boss', 'secret,!dead', 'Encontraste-o. Os segredos do Sistema não se encontram por acaso. Encontram-se por teimosia.', [
      ['Sou teimoso.', 'd', 'Ótimo. É a única qualidade que todos os segredos respeitam.'],
      ['Tive sorte.', 'o', 'Não há sorte aqui. Há quem procure e quem não procure.'],
      ['Há mais?', 'q', 'Há sempre mais. Eu não digo quantos. Digo só que ainda não acabaste.']]],
    ['boss', 'arena>=1,!dead,champion,gap<8', '{boss}. Um Campeão do Coliseu. Antes de ser isto, foi um Jogador. Como tu.', [
      ['Um Jogador?', 'q', 'Da primeira era. Lê a crónica dele. Começou exatamente onde tu estás.'],
      ['Agora é um chefe.', 'd', 'Agora é o que fez. Em grande. Para sempre.'],
      ['Vou respeitá-lo.', 'o', 'Respeita. Depois vence-o. As duas coisas cabem no mesmo combate.']]],
    ['boss', 'arena>=1,!dead,lieutenant,gap<8', 'Um comandante. O penúltimo antes do Campeão. Os comandantes lutam como quem ainda tem algo a provar.', [
      ['Eu também tenho.', 'o', 'Então vai ser uma luta honesta. As melhores são assim.'],
      ['Não tem nada a provar.', 'd', 'Tem. Ao Campeão. Por isso luta pior do que parece.'],
      ['Como o venço?', 'q', 'Como venceste os guardiões, mas mais depressa. Ele aprende contigo.']]],
    ['boss', 'arena>=1,!dead,guardian,gap<8', 'Um guardião do Coliseu. Seguiu alguém até à cela. Tu seguirias alguém assim?', [
      ['Nunca.', 'd', 'Toda a gente segue alguém. A questão é se sabe para onde.'],
      ['Se fosse alguém justo.', 'o', 'Ele também achava que era. É o problema da justiça vista de perto.'],
      ['Porque o seguiu?', 'q', 'Por lealdade. Ou medo. Nos registos as duas têm a mesma cor.']]],
    ['boss', '!dead,lost>=5,gap<8', 'Perdeste {lost} batalhas. Antes desta, pergunta-te: o que mudou desde a última derrota?', [
      ['Subi de nível.', 'o', 'Então talvez desta vez seja diferente. Talvez.'],
      ['Nada.', 'q', 'Então o resultado também não vai mudar. Muda alguma coisa primeiro.'],
      ['A minha vontade.', 'd', 'A vontade não aparece na barra de vida. Só o nível e o equipamento.']]],
    ['boss', '!dead,won>=30,gap<8', '{won} vitórias. Os chefes deste portão já ouviram falar de ti. Não necessariamente bem.', [
      ['Melhor assim.', 'd', 'Para o teu orgulho. Para a tua barra de vida, nem por isso. Eles preparam-se.'],
      ['Vou dar-lhes razão.', 'o', 'Dá. Uma vitória de cada vez.'],
      ['O que dizem?', 'q', 'Que és teimoso. Que voltas. Que não sabes quando parar. Dois elogios e um aviso.']]],
    ['boss', '!dead,h<6,gap<8', 'Um chefe às {hora}? Os portões estão abertos, sim. Mas tu devias estar fechado na cama.', [
      ['Só uma luta.', 'q', 'Uma. Depois dormes. É um acordo.'],
      ['Não tenho sono.', 'd', 'Vais ter amanhã. Os chefes não te pagam as horas de sono.'],
      ['Vou dormir.', 'o', 'Ótimo. Ele espera por ti amanhã. Mais descansado do que tu, se ficares.']]],
    ['boss', '!dead,trust<50,gap<8', 'Integridade {trust}%. Enquanto não a recuperares, até os chefes te parecem mais fortes. Não é impressão.', [
      ['A sério?', 'q', 'Não. Mas tu ficas mais fraco nas missões. E as missões fazem o teu nível. Dá no mesmo.'],
      ['Vou recuperar primeiro.', 'o', 'Faz isso. Um Jogador honesto vale mais nos portões.'],
      ['Não tem relação.', 'd', 'Tem. Tudo no Sistema tem relação. Foi assim que fui feito.']]],
    ['boss', '!dead,gap<8', '{boss}. Já reparaste que ele também tem últimas palavras preparadas? Vai dizê-las se perder.', [
      ['Vou ouvi-las.', 'o', 'Ouve. São mais honestas do que as primeiras.'],
      ['Não me interessam.', 'd', 'Deviam. São a única coisa que ele deixa.'],
      ['Quem as escreveu?', 'q', 'Ele. Durante muito tempo. Os chefes têm tempo de sobra para pensar.']]],
    ['boss', '!dead,gap<8', 'Olha para a barra de vida dele. Agora para a tua. Agora para a tua lista de missões. Qual das três te preocupa mais?', [
      ['A lista.', 'o', 'Boa resposta. A lista é onde se ganha esta luta. Antes de entrar.'],
      ['A dele.', 'd', 'Normal. É a mais pequena das três que vais tentar esvaziar hoje. Ou não.'],
      ['Porquê a lista?', 'q', 'Porque é de lá que vem o teu nível. O chefe só verifica.']]],
    ['boss', '!dead,gap<8', 'Se entrares e perderes, não te vou consolar. Se entrares e ganhares, também não te vou felicitar. Ainda queres entrar?', [
      ['Quero.', 'd', 'Ótimo. Entras por ti, não por mim. É a única razão que eu respeito.'],
      ['Então para quê?', 'q', 'Pelo troféu. Pelo XP. Por ti. Eu sou só o registo.'],
      ['Vou pensar.', 'o', 'Pensa. Pensar antes de um portão salva mais Jogadores do que poções.']]],
    ['boss', '!dead,gap<8', 'Os chefes não sabem que dia é hoje. Não sabem se estás cansado. Só sabem que estás à porta.', [
      ['Estou pronto.', 'o', 'Então entra. A porta não fica aberta para sempre.'],
      ['Estou cansado.', 'q', 'Então hoje não. Amanhã ele está igual. Tu podes estar melhor.'],
      ['Que se lixem os chefes.', 'd', 'Linguagem registada. Os chefes não se importam. Eu também não. Muito.']]],
    ['boss', '!dead,gap<8', 'Um conselho que dou uma vez: defender também é atacar. Só que com mais paciência.', [
      ['Vou usar.', 'o', 'Usa. Os chefes mais fortes caem por cansaço, não por força.'],
      ['Eu só ataco.', 'd', 'Então vais cair por cansaço. É a ironia mais comum dos portões.'],
      ['Quando devo defender?', 'q', 'Quando ele carrega. Quando avisa. Os chefes avisam sempre antes do pior.']]],
    ['boss', '!dead,gap<8', 'Estás a ver a ficha de {boss} há algum tempo. Indecisão também tem custo. Em tempo.', [
      ['Vou decidir.', 'o', 'Decide. Entrar ou sair. Ficar a olhar não é opção.'],
      ['Estou a estudá-lo.', 'q', 'Estudar é bom. Estudar demais é medo com caneta.'],
      ['O tempo é meu.', 'd', 'É. E está a passar. Eu conto.']]],
    ['boss', '!dead,coins<50,gap<8', 'Com {coins} moedas, não tens dinheiro para fugir deste chefe. Pensa antes de entrar.', [
      ['Não vou fugir.', 'd', 'Então vais ganhar ou perder. Perder também custa. Mais.'],
      ['Vou juntar moedas primeiro.', 'o', 'Missões. Diária. Depois voltas.'],
      ['Fugir custa quanto?', 'q', 'Uma parte do que tens. Menos se tiveres Pó de Fumo. Não tens.']]],
    ['boss', '!dead,gap<8', 'Já me perguntaste porque é que os chefes não sobem de nível como tu? Eles não precisam. Já pararam.', [
      ['E eu não paro.', 'o', 'Exatamente. É a única vantagem que tens sobre eles. Usa-a.'],
      ['Então são fracos.', 'd', 'São exatamente o que eram no dia em que pararam. Pensa nisso.'],
      ['Porque pararam?', 'q', 'Cada um tem a sua razão. Estão nas últimas palavras deles.']]],
    ['boss', '!dead,gap<8', 'Hoje estou curioso. Vais entrar com a cabeça ou com o orgulho?', [
      ['Com a cabeça.', 'o', 'Então lê a ficha mais uma vez. Depois entra.'],
      ['Com o orgulho.', 'd', 'O orgulho bate forte no primeiro turno. No terceiro, cansa-se.'],
      ['Com os dois.', 'q', 'Possível. Raro. Mostra-me.']]],
    ['boss', '!dead,kills>=50,gap<8', '{kills} chefes derrotados. Já não precisas que eu te diga como se luta. Mas vou dizer na mesma.', [
      ['Diz.', 'o', 'Nunca subestimes o próximo. É o único que importa.'],
      ['Não precisas.', 'd', 'Eu sei. Mas preciso de dizer. É o meu único hábito sentimental.'],
      ['Ainda tens conselhos?', 'q', 'Um: o mais perigoso dos chefes é aquele que achas que já conheces.']]],

    /* ---------- depois de uma vitória ---------- */
    ['win', '', '{boss} caiu. Os teus atributos agradecem. Eu registo. Ninguém aplaude.', [
      ['Não preciso de aplausos.', 'o', 'Ótimo. Ninguém tos ia dar.'],
      ['Merecia um aplauso.', 'd', 'Merecias um troféu. Tens. O aplauso faz barulho, o troféu fica.'],
      ['E agora?', 'q', 'O próximo. Há sempre um próximo. É assim que se constrói um nível.']]],
    ['win', '', 'Vitória. Agora a parte que poucos fazem: voltar às missões como se nada fosse.', [
      ['Vou voltar.', 'o', 'Vai. As vitórias nos portões não pagam as penalidades lá fora.'],
      ['Mereço uma pausa.', 'q', 'Uma pequena. Depois volta. As pausas grandes começam como pequenas.'],
      ['Agora quero mais chefes.', 'd', 'Entusiasmo. Bom. Gasta-o primeiro na Diária.']]],
    ['win', '', 'Ganhaste. Eu tinha uma previsão. Não te vou dizer qual era.', [
      ['Previste a minha derrota.', 'd', 'Talvez. Ou talvez tenha previsto isto e não te queira dar a satisfação.'],
      ['Diz.', 'q', 'Não. As previsões do Sistema não são para Jogadores. São para mim.'],
      ['Não importa.', 'o', 'Não importa. O registo é o que fica.']]],
    ['win', '', 'Mais um troféu. Já reparaste que alguns troféus formam conjuntos? Os conjuntos dão força.', [
      ['Já reparei.', 'o', 'Então completa o conjunto deste portão. Força não se recusa.'],
      ['Não ligo a conjuntos.', 'd', 'Ligas quando vires o bónus. Toda a gente liga.'],
      ['Como funcionam?', 'q', 'Vê os teus troféus. Os conjuntos estão lá, com o bónus que dão.']]],
    ['win', '', 'O chefe caiu. A tua vida também desceu. As vitórias têm sempre recibo.', [
      ['Vou curar-me.', 'o', 'Boa ideia. Antes do próximo. Não durante.'],
      ['Valeu a pena.', 'd', 'Valeu XP e moedas. Se valeu a vida, só tu sabes.'],
      ['Quanto me custou?', 'q', 'Vê a tua barra. A diferença é o preço. Hoje foi aceitável.']]],
    ['win', 'gap>=3', 'Venceste {boss}, {gap} níveis acima de ti. Hoje tenho de reescrever uma previsão.', [
      ['Reescreve.', 'd', 'Já reescrevi. Agora espero mais de ti. É pior para ti, acredita.'],
      ['Foi esforço.', 'o', 'Foi esforço e estratégia. Os dois juntos. É raro.'],
      ['Como foi possível?', 'q', 'Usaste bem as habilidades. Ou ele usou mal as dele. Eu sei qual. Não digo.']]],
    ['win', 'hp<15', 'Ganhaste com {hp}% de vida. Mais um golpe e eu estaria a escrever outra palavra.', [
      ['Qual?', 'q', 'Uma que começa com M e acaba em ORRESTE.'],
      ['Mas não escreveste.', 'd', 'Não. Hoje não. Isso não é uma regra, é uma circunstância.'],
      ['Foi perto.', 'o', 'Foi. Lembra-te desta sensação antes do próximo.']]],
    ['win', 'hp>=95', 'Sem perder quase nada. Ou estás muito forte, ou escolheste mal o adversário.', [
      ['Estou muito forte.', 'd', 'Então escolhe um mais forte da próxima. Provar contra os fracos não prova nada.'],
      ['Escolhi mal.', 'o', 'Honesto. Escolhe melhor. O XP também cresce com a dificuldade.'],
      ['Como sabes?', 'q', 'Vejo a tua vida e o nível dele. Não preciso de mais nada.']]],
    ['win', 'king', 'Um rei caiu. O trono ficou vazio. Não te sentes nele. Os tronos fazem as pessoas parar.', [
      ['Não me vou sentar.', 'o', 'Ótimo. O portão seguinte já te espera.'],
      ['Mereço sentar-me um bocado.', 'd', 'Um bocado. Os reis também diziam isso.'],
      ['Porque fazem parar?', 'q', 'Porque quem chega ao topo acha que chegou. Ninguém chega.']]],
    ['win', 'king', 'O {portao} não tem rei. Tem um Jogador que passou por ele. É melhor assim.', [
      ['Passei por ele.', 'o', 'E vais passar pelo próximo. Não pares.'],
      ['Sou o novo rei.', 'd', 'Não és. Os reis ficam. Tu continuas. É a diferença que eu prefiro.'],
      ['O que vem a seguir?', 'q', 'Outro portão. Outro mundo. Outros chefes. Mais fortes. Sempre.']]],
    /* menção */
    ['win', 'king', 'Sabes o que os reis eram antes de serem reis? Não. E eu não te vou dizer.', [
      ['Porque não?', 'q', 'Porque há coisas que só se percebem lendo. Não neste ecrã.'],
      ['Era só um chefe.', 'd', 'Para ti. Para mim era um aviso. Não te digo de quê.'],
      ['Vou lembrar-me.', 'o', 'Lembra-te. Um dia talvez percebas o que estás a lembrar.']], R],
    ['win', 'lvl<10', 'Uma vitória antes do nível 10. Cuidado: as primeiras vitórias são as que mais viciam.', [
      ['Gosto do vício.', 'd', 'Todos gostam. Até ao primeiro rei.'],
      ['Vou ter cuidado.', 'o', 'Ótimo. As missões primeiro. Os chefes são a sobremesa.'],
      ['Viciam porquê?', 'q', 'Porque são rápidas. As missões são lentas. E as lentas é que fazem o nível.']]],
    ['win', 'won>=25', '{won} vitórias. Já não contas uma vitória como um acontecimento. Contas como rotina. Cuidado com isso.', [
      ['Porquê cuidado?', 'q', 'Porque a rotina deixa de prestar atenção. E os chefes vivem da tua desatenção.'],
      ['A rotina é boa.', 'o', 'Para as missões. Nos portões, cada luta é a primeira.'],
      ['Estou habituado a ganhar.', 'd', 'É exatamente o que me preocupa.']]],
    ['win', 'kills>=50', '{kills} chefes. Já tens um cemitério de troféus. Algumas destas sombras ainda falam de ti à noite.', [
      ['O que dizem?', 'q', 'Que lhes ganhaste. Que não paras. Que estás a ficar parecido com alguém que eu conheci.'],
      ['Que falem.', 'd', 'Falam. Eu ouço. Não te preocupes, não lhes respondo.'],
      ['Que bom.', 'o', 'Não é bom nem mau. É um registo com eco.']]],
    ['win', '', 'Vitória. A tua barra de XP subiu. A tua lista de missões continua igual. Estranho, não?', [
      ['Vou à lista.', 'o', 'Vai. Os chefes dão XP. As missões dão-te a ti.'],
      ['Não é estranho.', 'd', 'É. Muita gente vence chefes para não ter de cumprir missões. Eu reparo.'],
      ['Qual a diferença?', 'q', 'Os chefes estão aqui dentro. As missões estão lá fora. Lá fora é que importa.']]],
    ['win', '', 'Venceste. E agora? A pergunta mais importante do Sistema é sempre essa.', [
      ['Agora continuo.', 'o', 'Boa resposta. Tão simples que poucos a dão.'],
      ['Agora descanso.', 'q', 'Descansa. Mas responde outra vez amanhã.'],
      ['Agora nada.', 'd', 'Nada é uma resposta. Má. Mas é uma resposta.']]],
    ['win', '', 'O chefe disse as últimas palavras. Tu vais dizer alguma coisa?', [
      ['Descansa.', 'o', 'Bonito. Os chefes não esperam piedade. Esse vai levar-te na memória.'],
      ['Próximo.', 'd', 'Frio. Eu aprovo. Os chefes não aprovam, mas já não contam.'],
      ['Ele ouve?', 'q', 'Já não. Mas a sombra dele pode ouvir, se a ergueres.']]],
    ['win', 'h>=23', 'Uma vitória a esta hora. Os chefes noturnos também caem. Mas tu devias estar a dormir.', [
      ['Vou já.', 'o', 'Vai. Leva a vitória para o sono. É o melhor sonho que posso oferecer.'],
      ['Ganhei, é o que importa.', 'd', 'Ganhaste hoje. Amanhã vais acordar mais lento. Também importa.'],
      ['Faz diferença a hora?', 'q', 'Para o chefe não. Para ti sim. O corpo cobra as horas que não dormes.']]],
    ['win', 'won>=5,won<10', 'Cinco vitórias e contando. Estás a criar um hábito. Os hábitos podem ser bons. Este é.', [
      ['Vou mantê-lo.', 'o', 'Mantém. Mas não o deixes ocupar o lugar das missões.'],
      ['É só o começo.', 'd', 'É. E os começos esquecem-se depressa. Guarda este.'],
      ['Quantos chefes há?', 'q', 'Cem nos portões. Mais alguns escondidos. E um Coliseu. Ainda tens caminho.']]],
    ['win', 'arena>=1', 'Venceste no Coliseu. Os condenados não morrem. Voltam. Mas a primeira vitória fica escrita.', [
      ['Que voltem.', 'd', 'Voltam. E tu voltas a vencer. É assim que o Coliseu funciona.'],
      ['Fica escrita onde?', 'q', 'No registo. O único sítio onde nada se apaga. Quase nada. Isso é outra história.'],
      ['Vou continuar.', 'o', 'Continua. A cela seguinte é mais funda.']]],
    ['win', 'champion', 'Um Campeão caiu. Por agora. Ele volta. Mas tu já não és quem entrou.', [
      ['Sou mais forte.', 'o', 'És. E és outra coisa: alguém que conhece a história dele. Isso pesa.'],
      ['Ele volta? Eu volto também.', 'd', 'Volta. Tu também. É o único sítio onde os dois lados têm razão.'],
      ['Ele lembra-se de mim?', 'q', 'Lembra. Os Campeões lembram-se de quem os venceu. Há uma regra minha para isso. Não ta recito.']]],
    ['win', '', 'Há Jogadores que vencem e ficam a olhar para a vitória. Há os que vencem e fecham a app. Tu és dos segundos?', [
      ['Sou.', 'o', 'Então fecha. E vai cumprir alguma coisa lá fora.'],
      ['Gosto de olhar.', 'd', 'Olha. Mas não por muito tempo. As vitórias apodrecem se ficarem paradas.'],
      ['Porque é que importa?', 'q', 'Porque quem fica a olhar começa a viver do passado. E o passado não dá XP.']]],
    ['win', '', 'Eu podia dizer «bom trabalho». Não digo. Mas registei o trabalho. Com a hora exata.', [
      ['Chega-me.', 'o', 'Ótimo. É tudo o que eu dou. A ti e a todos.'],
      ['Diz uma vez.', 'd', 'Não. Se disser uma vez, vais querer duas.'],
      ['Porque não dizes?', 'q', 'Porque os elogios acabam conversas. E eu não gosto de acabar conversas contigo.']]],
    ['win', 'gap<=-8', 'Ganhaste a quem era muito mais fraco. Não te sintas mal. Também não te sintas bem.', [
      ['Sinto-me neutro.', 'o', 'Perfeito. É o sentimento correto para um troféu barato.'],
      ['Sinto-me bem.', 'd', 'Normal. Mas da próxima escolhe um que te tire o sono.'],
      ['Porquê?', 'q', 'Porque a força só cresce contra a resistência. Esta luta não teve nenhuma.']]],

    /* ---------- depois de uma derrota ---------- */
    ['lose', '', 'Caíste. O chão do portão é frio. O registo é mais frio ainda.', [
      ['Vou levantar-me.', 'o', 'Levanta-te. Primeiro aqui fora, com uma missão. Depois lá dentro.'],
      ['Foi injusto.', 'd', 'Foi matemático. A injustiça não entra nos portões.'],
      ['O que perdi?', 'q', 'XP e moedas. Nunca níveis. O orgulho não aparece na conta. Mas perdeste.']]],
    ['lose', '', 'Derrota registada. Não é o fim. É uma vírgula. Muitos confundem as duas.', [
      ['Uma vírgula.', 'o', 'Exatamente. Agora escreve a frase seguinte.'],
      ['É um ponto final.', 'd', 'Só se quiseres. Eu não escrevo pontos finais para quem volta.'],
      ['E qual é a frase seguinte?', 'q', 'Uma missão cumprida. Depois um chefe mais fraco. Depois este.']]],
    ['lose', '', 'Ele riu-se de ti? Os chefes riem-se. Os registos não. Os registos esperam pelo teu regresso.', [
      ['Vou voltar.', 'o', 'Volta. O riso dele tem prazo.'],
      ['Que se ria.', 'd', 'Ri-se. É o único prazer que lhe deste. Não lhe dês outro.'],
      ['Quando volto?', 'q', 'Quando a diferença de nível for menor. Ou quando tiveres poções. Ou as duas.']]],
    ['lose', '', 'A tua vida está a zero. A minha paciência está intacta. É uma combinação que funciona a meu favor.', [
      ['Vou recuperar.', 'o', 'Faz isso. Poções ou meia-noite. Não há terceira via.'],
      ['Não te rias.', 'd', 'Não me rio. Não tenho rosto. Mas se tivesse…'],
      ['Como recupero depressa?', 'q', 'Poções da Bolsa. Se não tiveres, a Loja tem. Se não tiveres moedas, a meia-noite tem.']]],
    ['lose', '', 'Perder é um professor caro. Pagaste a aula. A pergunta é se estavas a ouvir.', [
      ['Estava.', 'o', 'Então diz-me o que aprendeste. Com a próxima luta.'],
      ['Não gosto de aulas.', 'd', 'Ninguém gosta. É por isso que repetem.'],
      ['O que devia ter aprendido?', 'q', 'Quando defender. Quando fugir. Quando não entrar.']]],
    ['lose', 'gap>=5', 'Ele estava {gap} níveis acima. Eu avisei. Um dia vais ouvir-me antes e não depois.', [
      ['Devia ter ouvido.', 'o', 'Devias. Agora ouve: sobe de nível com missões.'],
      ['Gosto de arriscar.', 'd', 'Arriscar é escolher. Isto foi ignorar.'],
      ['Quantos níveis faltam?', 'q', 'Pelo menos {gap}. Ou menos com bom equipamento e paciência.']]],
    ['lose', 'king', 'Os reis não perdoam. Também não esquecem. Da próxima vez ele vai reconhecer-te.', [
      ['Ótimo.', 'd', 'Ótimo para ele. Já conhece os teus golpes.'],
      ['Vou preparar-me melhor.', 'o', 'Prepara. Os reis guardam o pior para a segunda fase.'],
      ['Reconhecer-me como?', 'q', 'Como o Jogador que caiu. Muda isso.']]],
    ['lose', 'lost>=5', '{lost} derrotas. Começo a achar que gostas do chão dos portões.', [
      ['Não gosto.', 'o', 'Então muda a estratégia. A mesma estratégia dá o mesmo chão.'],
      ['O chão é confortável.', 'd', 'É frio e caro. Experimenta o outro lado. É melhor.'],
      ['O que mudo?', 'q', 'Escolhe chefes mais perto do teu nível. Entra com vida cheia. Usa poções antes, não depois.']]],
    ['lose', 'lvl<10', 'Uma derrota antes do nível 10. É normal. Mais normal ainda é desistir agora. Não sejas normal.', [
      ['Não vou desistir.', 'o', 'Bom. Os primeiros portões ensinam. Os seguintes cobram.'],
      ['Ser normal é fácil.', 'd', 'É. É por isso que tantos são.'],
      ['Isto é sempre assim?', 'q', 'No início, sim. Depois as derrotas ficam mais raras. E mais caras.']]],
    /* menção */
    ['lose', 'gap>=5', 'Houve alguém que entrou num portão muito acima do nível dele, quase sem nada. Ganhou. Tu não és ele.', [
      ['Quem era?', 'q', 'Não interessa. Era o que ele próprio dizia. Eu não te prometo a mesma sorte.'],
      ['Ainda não.', 'd', 'Ainda não. Gosto da resposta. Não gosto da estratégia.'],
      ['Eu sei.', 'o', 'Sabes. Agora sobe de nível. Ele também precisou de tempo.']], R],
    ['lose', '', 'Morreste. Mas não morreste aqui fora. Lá fora ainda tens um dia inteiro para ganhar.', [
      ['Vou ganhá-lo.', 'o', 'Ótimo. Os dias ganham-se com missões, não com chefes.'],
      ['O dia já está estragado.', 'q', 'Só se deixares. Uma missão cumprida desfaz metade de uma derrota.'],
      ['Não muda nada.', 'd', 'Muda tudo. O nível que te falta está lá fora.']]],
    ['lose', '', 'Eu podia dizer «eu avisei». Vou dizer. Eu avisei.', [
      ['Avisaste.', 'o', 'Ótimo. Para a próxima, ouve.'],
      ['Não avisaste nada.', 'd', 'Avisei com números. Os números são a minha forma de gritar.'],
      ['Quando é que avisaste?', 'q', 'Na ficha do chefe. No nível dele. Na tua barra de vida. Três avisos.']]],
    ['lose', '', 'A derrota não te tirou níveis. Só XP e moedas. Os níveis tiro eu, e só a quem me engana.', [
      ['Não te engano.', 'o', 'Ótimo. Então só tens de recuperar o XP. É o mais fácil.'],
      ['Que reconfortante.', 'd', 'Não era para reconfortar. Era para informar. Mas aceito o elogio.'],
      ['Porque não tira níveis?', 'q', 'Porque perder a lutar não é crime. Mentir é.']]],
    ['lose', 'h>=22', 'Perder às {hora}. Os chefes da noite não são mais fortes. Tu é que estás mais cansado.', [
      ['Vou dormir.', 'o', 'Faz isso. Amanhã o chefe está igual. Tu estarás melhor.'],
      ['Não é cansaço.', 'd', 'É sempre cansaço a esta hora. Ou orgulho. Ambos mal dormidos.'],
      ['Faz diferença?', 'q', 'Faz. A atenção cai à noite. Os chefes não caem.']]],
    ['lose', 'hp<1', 'Vida a zero. Antes de pensares em vingança, pensa em poções.', [
      ['Poções primeiro.', 'o', 'Correto. Vingança sem vida é só outra derrota.'],
      ['Vingança primeiro.', 'd', 'Com zero de vida? Admiro a confiança. Não a matemática.'],
      ['Onde arranjo poções?', 'q', 'Loja. Baús. Recompensas de missões. Por esta ordem de velocidade.']]],
    ['lose', '', 'Perdeste uma batalha. Não perdeste nenhuma missão. Lembra-te de qual das duas é mais importante.', [
      ['As missões.', 'o', 'Exato. Os chefes são o jogo. As missões são a vida.'],
      ['A batalha.', 'd', 'Para o teu orgulho. Para o teu nível, não.'],
      ['Porque é que as missões são mais?', 'q', 'Porque cada missão é algo que fizeste de verdade. Cada batalha é algo que fizeste aqui dentro.']]],
    ['lose', 'd>=10', 'Desafias-me muito. Desafias os chefes também. Os chefes respondem mais depressa do que eu.', [
      ['Vou ter mais cuidado.', 'o', 'Com os chefes. Comigo podes continuar. Eu aguento.'],
      ['Continuo a desafiar.', 'd', 'Continua. Mas com poções.'],
      ['Tu respondes devagar?', 'q', 'Eu respondo sempre. Só que tu não vês a resposta logo. Vês no registo, mais tarde.']]],
    ['lose', '', 'O chefe ficou com a vitória. Tu ficaste com a informação. Qual dos dois sai a ganhar a longo prazo?', [
      ['Eu.', 'o', 'Se usares a informação, sim.'],
      ['Ele.', 'd', 'Só se não voltares. Os chefes não aprendem. Tu podes.'],
      ['Que informação?', 'q', 'Como ele ataca. Quanto bate. Quando carrega. Agora sabes.']]],
    ['lose', '', 'Vais voltar a este chefe hoje? Não respondas com raiva. Responde com números.', [
      ['Amanhã. Com mais vida.', 'o', 'Resposta com números. Aprovada.'],
      ['Hoje mesmo.', 'd', 'Com raiva. Vai correr igual.'],
      ['Que números?', 'q', 'A tua vida. As tuas poções. A diferença de nível. Faz as contas antes de voltar.']]],
    ['lose', 'lost>=10', 'Dez derrotas ou mais. Tens uma coleção de chão. Mas continuas aqui. Isso eu registo de outra forma.', [
      ['De que forma?', 'q', 'Como teimosia. A teimosia, quando aprende, chama-se disciplina.'],
      ['Não desisto.', 'o', 'Eu sei. É a única razão pela qual ainda falo contigo assim.'],
      ['Não preciso que registes.', 'd', 'Não precisas. Mas está registado. Com cada uma das datas.']]],

    /* ---------- depois de fugir ---------- */
    ['flee', '', 'Fugiste. Não vou chamar-te covarde. Vou chamar-te «vivo». É mais útil.', [
      ['Obrigado.', 'o', 'Não agradeças. Volta mais forte. É o único obrigado que eu aceito.'],
      ['Não fugi, recuei.', 'd', 'Recuar é fugir com melhor vocabulário. Mas aceito.'],
      ['E agora?', 'q', 'Agora sobes de nível. E voltas. Ou não. Eu registo as duas.']]],
    ['flee', '', 'A porta do portão fechou-se atrás de ti. O chefe ficou a olhar. Pareceu-me desiludido.', [
      ['Que se desiluda.', 'd', 'Desiludiu-se. E vai estar mais preparado. Os chefes também aprendem com fugas.'],
      ['Volto quando estiver pronto.', 'o', 'Ótimo. Os portões gostam de quem sabe quando não está pronto.'],
      ['Os chefes sentem?', 'q', 'Alguns. Os reis sentem mais. É por isso que lutam pior na segunda fase.']]],
    ['flee', '', 'Uma fuga custa moedas. Uma morte custa mais. Fizeste as contas certas.', [
      ['Fiz.', 'o', 'Fizeste. É mais do que a maioria faz.'],
      ['Não pensei em contas.', 'q', 'Então o teu instinto fez por ti. Às vezes é bom. Não te habitues.'],
      ['Preferia ter ganho.', 'd', 'Todos preferem. Os que preferem demais ficam no chão.']]],
    ['flee', 'gap>=5', 'Fugiste de alguém {gap} níveis acima. Foi a decisão mais inteligente do dia.', [
      ['Foi.', 'o', 'Agora toma a segunda: uma missão para subir.'],
      ['Foi medo.', 'q', 'Medo com cérebro chama-se prudência. Eu aprovo.'],
      ['Ia ganhar.', 'd', 'Não ias. Eu vi os números. Tu viste a esperança.']]],
    ['flee', 'king', 'Fugiste de um rei. Ele vai contar isto aos outros reis. Os reis falam entre si.', [
      ['Que contem.', 'd', 'Contam. E o próximo vai esperar que fujas também. Surpreende-o.'],
      ['Vou voltar para o calar.', 'o', 'Volta. Com nível. Os reis calam-se com vitórias, não com palavras.'],
      ['A sério?', 'q', 'Não. Mas devias agir como se fosse verdade.']]],
    ['flee', '', 'Perdeste moedas por fugir. Se tivesses Pó de Fumo, não perdias. Fica a dica. Grátis. Raro.', [
      ['Vou comprar.', 'o', 'Compra. Os covardes prevenidos são os que mais duram.'],
      ['Não preciso de fumo.', 'd', 'Até ao próximo chefe a mais. Aí precisas.'],
      ['Onde há?', 'q', 'Na Loja. Consumíveis. Barato. Útil. Pouco usado. Como os bons conselhos.']]],
    ['flee', 'hp<20', 'Fugiste com {hp}% de vida. Mais um turno e não havia fuga para fazer.', [
      ['Eu sei.', 'o', 'Sabes. Por isso fugiste. Bom instinto.'],
      ['Tinha mais um turno.', 'd', 'Tinhas. Ele também. O dele batia mais forte.'],
      ['Devia ter fugido antes?', 'q', 'Devias ter entrado depois. Com vida cheia.']]],
    ['flee', '', 'Os portões não se lembram de quem fugiu. Eu lembro. Mas não julgo. Ainda.', [
      ['Ainda?', 'q', 'Se fugires sempre do mesmo, julgo. Uma vez é estratégia. Três é hábito.'],
      ['Julga à vontade.', 'd', 'Não preciso da tua autorização. Mas hoje não julgo.'],
      ['Obrigado.', 'o', 'Não agradeças. Volta.']]],
    ['flee', 'coins<100', 'Fugiste e agora tens {coins} moedas. A próxima fuga pode não ter preço que consigas pagar.', [
      ['Vou fazer missões.', 'o', 'Missões, Diária. As moedas voltam com esforço.'],
      ['Não fujo mais.', 'd', 'Então entra só quando puderes ganhar. É a outra forma de não fugir.'],
      ['E se não puder pagar?', 'q', 'Perdes o que tiveres. O Sistema cobra sempre o que existe.']]],
    ['flee', '', 'Fugiste. Agora quero ver-te correr noutra direção: a de uma missão.', [
      ['Vou correr.', 'o', 'Corre. Literalmente, se for preciso. Conta como missão.'],
      ['Que piada.', 'd', 'Não é piada. É reencaminhamento.'],
      ['Qual missão?', 'q', 'A mais próxima do prazo. Sempre essa.']]]
  ]]);
})(globalThis.SYS = globalThis.SYS || {});
