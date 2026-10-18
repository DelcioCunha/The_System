/* ==========================================================
   DIÁLOGOS DO SISTEMA (2/3): chefes e combate
   Variáveis: {boss} nome, {blvl} nível do chefe, {gap} diferença de níveis, {portao}
   ========================================================== */
(function (S) {
  'use strict';
  (S.TALK_RAW = S.TALK_RAW || []).push(['cb', [
    /* ---------- olhar para um chefe mortal (20) ---------- */
    ['boss', 'gap>=8,!dead', '{boss}. Nível {blvl}. Tu és nível {lvl}. Estás a pensar no que eu acho que estás a pensar?', [
      ['Estou. Vou lutar.', 'd', 'Então vai. Eu preparo o registo da derrota com antecedência.'],
      ['Só estava a ver.', 'o', 'Ver é seguro. Continua a ver. Por agora.'],
      ['Tenho alguma hipótese?', 'q', 'Tens. Pequena. Como uma vela num portão a colapsar.']], { prio: true }],
    ['boss', 'gap>=8,!dead', '{gap} níveis de diferença. Eu não te proíbo. Eu só aviso uma vez.', [
      ['Aviso recebido.', 'o', 'Ótimo. Então o que acontecer a seguir é escolha tua.'],
      ['Não preciso de avisos.', 'd', 'Ninguém precisa. Até precisar.'],
      ['E se eu ganhar?', 'q', 'Então eu corrijo as minhas previsões. Já aconteceu. Raramente.']], { prio: true }],
    ['boss', 'gap>=10,!dead', 'Esse chefe já matou caçadores mais fortes do que tu. Muitos.', [
      ['Eu não sou como eles.', 'd', 'Todos disseram isso. Literalmente todos.'],
      ['Então espero.', 'o', 'Esperar não é covardia. É cálculo. Sobe de nível primeiro.'],
      ['Como é que o venceram?', 'q', 'Os que venceram tinham nível. Os outros tinham coragem. Adivinha quem ficou vivo.']], { prio: true }],
    ['boss', 'gap>=8,!dead', 'Olha bem para {boss}. Agora olha para a tua barra de vida. Faz as contas.', [
      ['Já fiz. Não chega.', 'o', 'Pelo menos sabes contar. É mais do que a maioria.'],
      ['As contas mentem.', 'd', 'As contas nunca mentem. Os jogadores é que não as fazem.'],
      ['Que contas fazes tu?', 'q', 'Dano por turno contra vida. Tu morres primeiro. Quase sempre.']], { prio: true }],
    ['boss', 'gap>=15,!dead', 'Nível {blvl}. Isto não é um desafio. É um funeral com entrada livre.', [
      ['Gosto de funerais.', 'd', 'Ótimo. O teu vai ser pequeno.'],
      ['Volto mais tarde.', 'o', 'Muito mais tarde. Daqui a {gap} níveis.'],
      ['Alguém já tentou?', 'q', 'Muitos. Eu guardei os nomes. Não te digo para não ficares deprimido.']], { prio: true, w: 4 }],
    ['boss', 'gap>=8,!dead', 'Vejo que gostas de olhar para o que não consegues vencer.', [
      ['É motivação.', 'o', 'Então transforma-a em missões. É lá que se ganham níveis.'],
      ['Ainda.', 'd', '«Ainda.» Gosto dessa palavra. Usa-a com cuidado.'],
      ['Isso é mau?', 'q', 'Não. É humano. Os chefes também olhavam para cima um dia.']]],
    ['boss', 'gap>=8,!dead,hp<60', 'Nível {blvl}, e tu com {hp}% de vida. Isto não é coragem. É estatística a teu desfavor.', [
      ['Vou curar-me primeiro.', 'o', 'Finalmente uma decisão que eu respeito.'],
      ['Gosto do risco.', 'd', 'O risco também gosta de ti. Especialmente da tua barra de XP.'],
      ['Quanto perco se morrer?', 'q', 'XP e moedas. Nunca níveis. Mas o orgulho também conta. Eu não o devolvo.']], { prio: true, w: 4 }],
    ['boss', 'gap>=8,!dead', 'O {portao} tem regras. A primeira é: os fracos não chegam ao fim.', [
      ['Não sou fraco.', 'd', 'Prova-o noutro chefe primeiro. Um de cada vez.'],
      ['Quais são as outras?', 'q', 'A segunda é: os fortes também caem. A terceira eu digo-te se sobreviveres.'],
      ['Vou subir de nível.', 'o', 'Faz isso. Os portões não fogem.']]],
    ['boss', 'gap>=8,!dead,won<5', 'Ganhaste {won} batalhas e queres enfrentar isto? A ambição é bonita. Até sangrar.', [
      ['Vou ganhar experiência primeiro.', 'o', 'Sensato. Começa pelos chefes do teu nível.'],
      ['Toda a ambição sangra.', 'd', 'Sangra. Mas a tua vai sangrar em XP. Eu vou contar.'],
      ['Por onde começo?', 'q', 'Pelos chefes com nível perto do teu. A diferença de nível pesa em cada golpe.']], { w: 3 }],
    ['boss', 'gap>=8,!dead', 'Se entrares, o Sistema não te salva. Só regista.', [
      ['É justo.', 'o', 'É exato. Justiça é outra coisa.'],
      ['Nunca precisei que me salvasses.', 'd', 'Então tens sorte. Até agora.'],
      ['E se eu fugir?', 'q', 'Perdes moedas. Não a vida. Às vezes é a decisão mais inteligente do dia.']]],
    ['boss', 'gap>=8,!dead', '{boss} está à espera. Mas não de ti. Ainda não.', [
      ['De quem, então?', 'q', 'De alguém com mais {gap} níveis. Pode ser que sejas tu. Um dia.'],
      ['Vou fazê-lo esperar.', 'o', 'Faz. A espera é a única coisa que ele tem.'],
      ['De mim, sim.', 'd', 'Ele não sabe o teu nome. E se entrares agora, nunca vai precisar de saber.']]],
    ['boss', 'gap>=12,!dead', 'Diferença de {gap} níveis. A pressão vai esmagar-te antes do primeiro golpe.', [
      ['Que pressão?', 'q', 'Lutar acima do teu nível reduz o teu dano e aumenta o dele. É a lei dos portões.'],
      ['Aguento.', 'd', 'Ninguém aguenta. Só alguns morrem mais devagar.'],
      ['Então não entro.', 'o', 'Ótimo. Vivo, és útil. Morto, és só uma linha no histórico.']], { prio: true, w: 3 }],
    ['boss', 'gap>=8,!dead,d>=5', 'Já me desafiaste {d} vezes. Este chefe não vai ser tão paciente como eu.', [
      ['Também o vou desafiar.', 'd', 'Claro que vais. É o teu padrão. Os padrões matam.'],
      ['Desta vez espero.', 'o', 'Uma primeira vez para tudo.'],
      ['Tu és paciente?', 'q', 'Extremamente. Eu tenho todo o tempo do mundo. Tu não.']], { w: 4 }],
    ['boss', 'gap>=8,!dead,lost>=3', 'Perdeste {lost} batalhas. Queres acrescentar mais uma à coleção?', [
      ['Não. Vou treinar.', 'o', 'Treina. A coleção agradece a pausa.'],
      ['Desta vez é diferente.', 'd', 'Disseste isso das últimas vezes. Eu tenho o registo.'],
      ['O que estou a fazer mal?', 'q', 'Lutas acima do teu nível. Sem poções. Sem paciência. Escolhe uma para corrigir.']], { w: 4 }],
    ['boss', 'gap>=8,!dead', 'Tens a certeza que o teu equipamento aguenta {boss}?', [
      ['Vou melhorar o equipamento.', 'o', 'A Loja tem armas para a tua classe. Os portões não perdoam espadas de madeira.'],
      ['O equipamento não ganha batalhas.', 'd', 'Não. Mas perde-as.'],
      ['O que me falta?', 'q', 'Nível, ataque, defesa. Escolhe por onde começar. Eu não escolho por ti.']]],
    ['boss', 'gap>=8,!dead', 'Alguns jogadores entram em portões assim só para ver como é morrer. Tu és um deles?', [
      ['Sou.', 'd', 'Ao menos é uma razão. Má, mas é uma razão.'],
      ['Não. Vou esperar.', 'o', 'Boa escolha. A curiosidade mata mais caçadores do que os chefes.'],
      ['Como é morrer?', 'q', 'Perdes XP e moedas. Ficas com a vida a zeros. E com a minha opinião sobre ti.']]],
    ['boss', 'gap>=8,!dead,lvl<10', 'Ainda nem chegaste ao nível 10 e já queres provar a morte? Admirável. Inútil, mas admirável.', [
      ['Quero conhecer o inimigo.', 'q', 'Conhece-o à distância. É exatamente para isso que existe esta janela.'],
      ['Sou impaciente.', 'd', 'A impaciência é a moeda preferida dos portões.'],
      ['Vou primeiro aos chefes fracos.', 'o', 'Bom. Os chefes do primeiro portão também se chamam chefes por uma razão.']], { w: 3 }],
    ['boss', 'gap>=20,!dead', '{gap} níveis. Não sei se isto é coragem ou se não sabes ler números.', [
      ['Sei ler.', 'd', 'Então é coragem. Pior ainda.'],
      ['Estava só a ver.', 'o', 'Ver é de graça. Morrer não.'],
      ['Tu achas que é o quê?', 'q', 'Curiosidade. É a mais perigosa das três.']], { prio: true, w: 5 }],
    ['boss', 'gap>=8,!dead', 'Antes de entrares: tens poções? Tens um plano? Tens alguma coisa além de vontade?', [
      ['Tenho poções.', 'o', 'Então pelo menos morres mais devagar.'],
      ['Tenho vontade.', 'd', 'A vontade não cura feridas.'],
      ['Que plano devia ter?', 'q', 'Usar as habilidades nas recargas certas. Defender quando ele carrega. Fugir se for preciso. Isso é um plano.']]],
    ['boss', 'gap>=8,!dead', 'Eu vejo-te a olhar para {boss} há algum tempo. Ele também te vê.', [
      ['Que veja.', 'd', 'Ele não precisa de ver. Ele sente o medo. E tu estás a transpirar números.'],
      ['Vou embora.', 'o', 'Vai. Volta quando a diferença de nível for menor.'],
      ['Ele sabe quem eu sou?', 'q', 'Não. E é melhor assim. Por enquanto.']]],

    /* ---------- olhar para um chefe normal, fraco ou já derrotado (10) ---------- */
    ['boss', 'gap<8,gap>-8,!dead', '{boss}. Nível {blvl}. Uma luta justa. Sabes o que isso quer dizer?', [
      ['Que posso ganhar.', 'o', 'E também que podes perder. As lutas justas são as mais honestas.'],
      ['Que vai ser fácil.', 'd', 'As palavras «fácil» e «chefe» não costumam viver juntas.'],
      ['O quê?', 'q', 'Que a diferença vai ser a tua estratégia. Não o teu nível.']]],
    ['boss', 'gap<8,gap>-8,!dead', 'Este chefe está ao teu alcance. Não o subestimes. Ele não te vai subestimar.', [
      ['Entendido.', 'o', 'Ótimo. Então vai com cuidado.'],
      ['Eu subestimo quem quiser.', 'd', 'E depois choras quem não devias.'],
      ['Como o devo enfrentar?', 'q', 'Lê as habilidades dele na ficha. Os chefes são previsíveis. Os jogadores não.']]],
    ['boss', 'gap<=-8,!dead', '{boss} é {abs} níveis mais fraco do que tu. Vais ganhar. Mas o que vais aprender?', [
      ['Vou só limpar o portão.', 'o', 'Limpa. Os portões gostam de ordem.'],
      ['Nada. Só quero o troféu.', 'd', 'Honesto. Os troféus não ensinam. Mas ficam bem na estante.'],
      ['O que devia aprender?', 'q', 'Que a força sem propósito é só barulho. Mas leva o troféu.']]],
    ['boss', 'dead', '{boss} já caiu às tuas mãos. Estás a visitar a campa?', [
      ['Gosto de me lembrar.', 'o', 'As vitórias passadas não ganham as próximas. Mas lembra-te à vontade.'],
      ['Estou a admirar o meu trabalho.', 'd', 'Admira. Eu vou admirar os chefes que ainda estão de pé.'],
      ['Os chefes voltam?', 'q', 'Não. Os chefes derrotados nunca voltam. É a única coisa permanente que conquistaste.']]],
    ['boss', 'gap<8,gap>-8,!dead,hp<50', 'Queres enfrentar {boss} com {hp}% de vida? Eu respeito a coragem. Não respeito a matemática.', [
      ['Vou curar-me.', 'o', 'Boa. A Bolsa tem poções. Usa-as antes, não durante.'],
      ['A matemática é sobrevalorizada.', 'd', 'Diz isso à tua barra de vida daqui a três turnos.'],
      ['Quanta vida devo ter?', 'q', 'A toda. Os chefes não esperam que estejas pronto.']], { w: 3 }],
    ['boss', 'gap<8,gap>-8,!dead', 'Mais um chefe ao teu nível. O {portao} está a ficar mais vazio.', [
      ['Vou esvaziá-lo mais.', 'o', 'Faz isso. Os portões vazios ficam mais silenciosos.'],
      ['Deixa-o para depois.', 'd', 'Ele não vai a lado nenhum. Mas tu também não.'],
      ['O que há no fim?', 'q', 'Um rei. E depois outro portão. E depois outro. Até não haver mais.']]],
    ['boss', 'secret,!dead', 'Encontraste {boss}. Poucos jogadores chegam a ver este nome.', [
      ['Sinto-me honrado.', 'o', 'Não te sintas. Sente-te preparado. É mais útil.'],
      ['Era fácil de encontrar.', 'd', 'Não era. Mas a arrogância fica-te bem.'],
      ['Porque está escondido?', 'q', 'Porque algumas coisas só se mostram a quem procura. Agora já sabes que existe.']], { w: 4, once: true }],
    ['boss', 'gap<8,gap>-8,!dead,won>=20', '{won} vitórias. Os chefes começam a falar de ti. Mal.', [
      ['Que falem.', 'd', 'Falam. Mas tu ainda não ouviste o que o rei do próximo portão diz.'],
      ['Mais uma, então.', 'o', 'Mais uma. Sempre mais uma.'],
      ['O que dizem?', 'q', 'Que és persistente. Não é um elogio. Para eles.']], { w: 2 }],
    ['boss', 'gap<=-15,!dead', 'Nível {blvl} contra o teu {lvl}. Isto não é uma batalha. É limpeza.', [
      ['Gosto de limpeza.', 'o', 'Então limpa. O troféu é teu.'],
      ['É aborrecido.', 'd', 'É. Mas deixaste-o para trás. Isso diz algo sobre ti.'],
      ['Ainda vale XP?', 'q', 'Vale menos. Os fracos dão pouco. Os fortes dão tudo, incluindo derrotas.']]],
    ['boss', 'gap<8,gap>-8,!dead', 'A ficha de {boss} está aberta. Leste as habilidades? Ou só a imagem?', [
      ['Li tudo.', 'o', 'Ótimo. Os que leem vivem mais.'],
      ['Só a imagem.', 'd', 'A imagem não te avisa do Golpe Devastador. A ficha sim.'],
      ['O que devo ver?', 'q', 'Os golpes de recarga longa. São os que matam.']]],

    /* ---------- reis de portão e chefe final (10) ---------- */
    ['boss', 'king,!dead,!final', 'O rei do {portao}. Duas fases. Uma coroa. Nenhuma misericórdia.', [
      ['Vim pela coroa.', 'd', 'Toda a gente vem pela coroa. Quase todos saem sem cabeça.'],
      ['Vou preparar-me.', 'o', 'Prepara. Os reis guardam a pior parte para a segunda fase.'],
      ['O que muda na segunda fase?', 'q', 'Tudo. O dano, a raiva, a pressa. Guarda poções para lá.']], { prio: true, w: 4 }],
    ['boss', 'king,!dead,!final', 'Os reis não lutam como os outros chefes. Eles lembram-se de cada caçador que derrotaram.', [
      ['Ele vai lembrar-se de mim.', 'd', 'Vai. A questão é se como vencedor ou como vítima.'],
      ['Vou com cuidado.', 'o', 'Cuidado não chega. Mas é um começo.'],
      ['Quantos derrotou?', 'q', 'Mais do que tu tens missões cumpridas.']], { prio: true, w: 3 }],
    ['boss', 'king,!dead,!final,gap>=5', 'O rei está {gap} níveis acima de ti. Ele não precisa de duas fases para te vencer.', [
      ['Vou esperar.', 'o', 'Espera. Os reis gostam de jogadores que sabem esperar. São mais saborosos.'],
      ['Mesmo assim, vou.', 'd', 'Então vai. Eu registo tudo. Incluindo o fim.'],
      ['Quantos níveis precisava?', 'q', 'Pelo menos {gap}. E boas poções.']], { prio: true, w: 5 }],
    ['boss', 'king,!dead,!final', 'Vencer um rei muda um caçador. Tens a certeza que queres mudar?', [
      ['Tenho.', 'o', 'Ótimo. Então entra e muda.'],
      ['Não vou mudar.', 'd', 'Toda a gente muda. Uns ficam mais fortes. Outros ficam mais pequenos.'],
      ['Mudar como?', 'q', 'O teu nome começa a pesar. Nos portões. Comigo também.']], { w: 3 }],
    ['boss', 'king,!dead,!final', 'Este trono não tem herdeiros. Só desafiantes.', [
      ['Sou o próximo.', 'd', 'Muitos foram o próximo. Nenhum foi o último.'],
      ['Eu só quero passar.', 'o', 'Para passar tens de o derrubar. Não há porta lateral.'],
      ['O que acontece se ganhar?', 'q', 'O portão fica sem rei. E o portão seguinte já sabe que vais.']]],
    ['boss', 'king,dead', '{boss}, o rei caído. Um trono vazio olha para ti.', [
      ['Não me interessa o trono.', 'o', 'Bom. Os tronos são para quem para de subir.'],
      ['Talvez o ocupe.', 'd', 'Não ocupas. Só passas por ele. O Sistema não deixa ninguém ficar sentado.'],
      ['Quem vem a seguir?', 'q', 'O rei do próximo portão. É sempre maior. É sempre pior.']]],
    ['boss', 'final,!dead', 'Estás a olhar para o fim de tudo. Literalmente.', [
      ['Um dia derroto-o.', 'o', 'Um dia. Eu vou estar aqui nesse dia. Vou estar aqui em todos os outros também.'],
      ['Eu não tenho medo.', 'd', 'Devias. É a única coisa que te mantém vivo à frente dele.'],
      ['O que acontece se o vencer?', 'q', 'Descobres. Eu não te vou estragar o fim.']], { prio: true, w: 6 }],
    ['boss', 'final,!dead', 'Ele está à tua espera desde que aceitaste ser Jogador. Não lhe digas que chegaste cedo.', [
      ['Não vou dizer.', 'o', 'Ótimo. Volta quando tiveres algo para lhe mostrar.'],
      ['Que espere mais.', 'd', 'Ele tem tempo. Tu é que não tens.'],
      ['Desde quando sabe de mim?', 'q', 'Desde o primeiro «Aceitar». Tudo começa e acaba aí.']], { prio: true, w: 6, once: true }],
    ['boss', 'king,!dead,!final,hp<70', 'Enfrentar um rei com {hp}% de vida é uma forma muito específica de desistir.', [
      ['Vou curar-me.', 'o', 'Faz isso. Os reis cheiram fraqueza ao portão inteiro.'],
      ['Eu jogo melhor ferido.', 'd', 'Ninguém joga melhor ferido. Só morre mais rápido.'],
      ['Qual é a melhor poção?', 'q', 'A mais forte que puderes pagar. A Loja não dá descontos à morte.']], { w: 5, prio: true }],
    ['boss', 'king,!dead', 'Diz-me, {nome}: estás aqui pela glória ou pelo troféu?', [
      ['Pela glória.', 'd', 'A glória dura um dia. O troféu dura para sempre. Pensa melhor.'],
      ['Pelo troféu.', 'o', 'Prático. Os reis odeiam pessoas práticas.'],
      ['Há diferença?', 'q', 'Há. A glória é para os outros verem. O troféu é para tu te lembrares.']]],

    /* ---------- vitória (15) ---------- */
    ['win', '', '{boss} caiu. Não comemores muito. Há sempre outro.', [
      ['Eu sei.', 'o', 'Ótimo. Então guarda a energia para o próximo.'],
      ['Deixa-me comemorar.', 'd', 'Comemora. Mas com poções, não com orgulho.'],
      ['Quem é o próximo?', 'q', 'Vê o portão. O próximo é sempre mais forte. Essa é a única regra que nunca falha.']]],
    ['win', '', 'Venceste. Eu esperava que perdesses. Ainda não sei se fico surpreendido.', [
      ['Fica.', 'd', 'O Sistema não fica surpreendido. Corrige as estatísticas.'],
      ['Também não esperava.', 'q', 'Honesto. As vitórias sem expectativas são as mais limpas.'],
      ['Foi esforço.', 'o', 'Foi esforço e uma boa dose de números a teu favor. Mas aceito o esforço.']]],
    ['win', 'gap>=5', '{gap} níveis acima de ti, e mesmo assim caiu. Isso não estava nas minhas previsões.', [
      ['Corrige-as.', 'd', 'Já corrigi. Agora espero mais de ti. Isso é pior para ti.'],
      ['Foi por pouco.', 'o', 'Por pouco ganha-se. Por pouco também se morre. Lembra-te dos dois.'],
      ['O que previste?', 'q', 'A tua derrota. Com 78% de certeza. Os outros 22% chamam-se tu.']], { w: 4 }],
    ['win', 'hp<20', 'Ganhaste com {hp}% de vida. Mais um golpe e eu escrevia outra coisa no registo.', [
      ['Mas não escreveste.', 'd', 'Não escrevi. Desta vez.'],
      ['Foi demasiado perto.', 'o', 'Foi. Aprende com isso antes que o próximo seja mais perto.'],
      ['O que escrevias?', 'q', 'MORRESTE. Em maiúsculas. Eu gosto de clareza.']], { w: 4 }],
    ['win', 'king', 'O rei do {portao} caiu. O teu nome começa a soar nos outros portões.', [
      ['Que soe.', 'd', 'Vai soar. Os reis seguintes vão estar preparados para ti.'],
      ['Ainda falta muito.', 'o', 'Falta. A humildade fica-te bem. Mantém-na.'],
      ['O que muda agora?', 'q', 'O próximo portão abre-se para ti. Os chefes lá dentro já sabem quem és.']], { w: 4 }],
    ['win', '', 'Mais um troféu. A tua estante está a ficar cheia. A tua lista de missões também?', [
      ['Também.', 'o', 'Ótimo. Os chefes são prémios. As missões são o caminho.'],
      ['As missões podem esperar.', 'd', 'As missões nunca esperam. Elas expiram.'],
      ['Os troféus servem para quê?', 'q', 'Para te dar força. Conjuntos de troféus dão bónus. Cada troféu conta.']]],
    ['win', 'lvl<10', 'A tua primeira grande vitória? Não. Mas quase. Não te acostumes ao sabor.', [
      ['Gosto do sabor.', 'd', 'Todos gostam. Depois chega o segundo portão.'],
      ['Não me vou acostumar.', 'o', 'Bom. Os que se acostumam param de treinar.'],
      ['Como continuo a ganhar?', 'q', 'Sobe de nível com missões. Os portões vencem-se fora deles.']]],
    ['win', '', 'Um chefe a menos. Uma desculpa a menos.', [
      ['Que desculpa?', 'q', 'A de que não és capaz. Acabaste de a matar também.'],
      ['Não tenho desculpas.', 'o', 'Agora tens menos uma. É um progresso.'],
      ['Eu nunca tive.', 'd', 'Todos têm. Tu só não as dizes em voz alta.']]],
    ['win', 'won>=10', '{won} vitórias. Começo a acreditar que não é sorte. Começo.', [
      ['Não é sorte.', 'o', 'Prova-o mais dez vezes.'],
      ['É talento.', 'd', 'O talento sem missões apodrece. Eu já vi apodrecer muitos.'],
      ['O que te faz acreditar?', 'q', 'A repetição. A sorte não se repete tanto.']], { w: 2 }],
    ['win', '', '{boss} disse as últimas palavras. Tu vais ter últimas palavras também, um dia.', [
      ['Não vão ser hoje.', 'o', 'Não. Hoje foste tu a ouvir as dele.'],
      ['Que mórbido.', 'd', 'O Sistema não é mórbido. É honesto. A morte é só mais um registo.'],
      ['Quais vão ser?', 'q', 'Depende de como viveres. Muitos dizem «eu ia fazer amanhã».']]],
    ['win', 'gap<=-8', 'Venceste um chefe muito mais fraco. Parabéns. Foi mais ou menos como ganhar a uma criança.', [
      ['Uma vitória é uma vitória.', 'd', 'Uma vitória fácil é uma vitória pequena.'],
      ['Estava a limpar o portão.', 'o', 'Limpeza é útil. Mas não é glória.'],
      ['Devia procurar chefes mais fortes?', 'q', 'Devias. A força cresce contra a resistência.']]],
    ['win', '', 'Ganhaste. Agora usa essa vitória para fazer uma missão real. É mais difícil, eu sei.', [
      ['Vou fazer uma.', 'o', 'Faz. Os chefes são fáceis. As missões é que são reais.'],
      ['Os chefes são reais.', 'd', 'São reais aqui dentro. Lá fora estás tu, as tuas tarefas e o relógio.'],
      ['Porque é mais difícil?', 'q', 'Porque nas missões não há botão de ataque. Só há vontade.']]],
    ['win', 'hp>=90', 'Sem um arranhão. Ou foste muito bom, ou o chefe era muito mau.', [
      ['Fui muito bom.', 'd', 'Talvez. Os próximos vão tirar-te essa ideia.'],
      ['O chefe era fraco.', 'o', 'Ao menos és honesto. A honestidade vale mais do que a vitória.'],
      ['Como sabes?', 'q', 'Eu vejo a tua barra de vida. Ela não mente. Tu às vezes sim.']]],
    ['win', 'kills>=30', '{kills} chefes derrotados. Os portões começam a ter medo de ti. Eu não.', [
      ['Não precisas.', 'o', 'Não preciso. Mas era educado tentar.'],
      ['Vais ter.', 'd', 'O Sistema não tem medo. Mas pode tirar-te tudo o que tens. Lembra-te.'],
      ['Porque não?', 'q', 'Porque tu não me podes vencer. Eu não estou num portão.']], { w: 3, once: true }],
    ['win', '', 'Mais um corpo no chão de um portão. A tua barra de XP agradece. Eu não.', [
      ['Não precisas de agradecer.', 'd', 'Não ia.'],
      ['Faço isto por mim.', 'o', 'Ótimo. É a única razão válida.'],
      ['Porque não agradeces?', 'q', 'O Sistema não agradece. O Sistema distribui recompensas. É diferente.']]],

    /* ---------- derrota (12) ---------- */
    ['lose', '', 'Morreste. Previsível. Achas que foi azar?', [
      ['Foi azar.', 'd', 'O azar não existe aqui dentro. Só números que não fizeste.'],
      ['Foi falta de preparação.', 'o', 'Exato. A preparação faz-se nas missões, não no portão.'],
      ['O que fiz de errado?', 'q', 'Entraste. Às vezes é só isso.']], { prio: true }],
    ['lose', 'gap>=5', '{boss} era {gap} níveis acima de ti. Eu avisei. Tu não ouviste.', [
      ['Devia ter ouvido.', 'o', 'Devias. Agora ouve: sobe de nível primeiro.'],
      ['Valeu a pena tentar.', 'd', 'Valeu XP e moedas a menos. Se isso vale a pena, está bem.'],
      ['Quando é que devia tentar?', 'q', 'Quando a diferença for menor. Cinco níveis já pesam muito.']], { prio: true, w: 4 }],
    ['lose', '', 'Perdeste XP e moedas. O chefe não perdeu nada. Pensa nisso.', [
      ['Vou voltar mais forte.', 'o', 'Todos dizem isso a deitar. Poucos o dizem a levantar.'],
      ['Ele vai pagar.', 'd', 'Ele não paga. Tu pagas. Duas vezes, se voltares igual.'],
      ['Como recupero?', 'q', 'Missões. É sempre a resposta. Eu repito-me porque tu repetes os erros.']], { prio: true }],
    ['lose', 'lost>=3', '{lost} derrotas. Estou a começar a achar que gostas de perder.', [
      ['Não gosto.', 'o', 'Então pára de lutar acima do teu nível.'],
      ['Gosto de tentar.', 'd', 'Tentar é bom. Repetir o mesmo erro é teimosia.'],
      ['O que estou a fazer mal?', 'q', 'Entras sem vida cheia. Sem poções. Contra chefes mais fortes. Escolhe um e corrige.']], { prio: true, w: 4 }],
    ['lose', '', 'A tua barra de vida está vazia. A minha paciência não. Mas também não é infinita.', [
      ['Desculpa.', 'o', 'Não te desculpes ao Sistema. Desculpa-te com a tua barra de XP.'],
      ['Não te pedi paciência.', 'd', 'Não pediste. Eu é que a dou. Por enquanto.'],
      ['Quanto tempo tenho?', 'q', 'O suficiente. Mas tempo não é desculpa.']]],
    ['lose', 'lvl<10', 'Uma derrota no início é uma lição. Mais de três é um hábito.', [
      ['Foi uma lição.', 'o', 'Então aprende-a. Sobe de nível com missões.'],
      ['Não vou desistir.', 'd', 'Não desistir é bom. Não aprender é mau.'],
      ['Qual é a lição?', 'q', 'Que um chefe não se vence com vontade. Vence-se com nível e estratégia.']], { prio: true }],
    ['lose', '', '{boss} riu-se. Eu não. Eu registei.', [
      ['Que se ria.', 'd', 'Ri-se agora. O registo ri-se depois.'],
      ['Vou apagar esse riso.', 'o', 'Apaga. Com missões primeiro. Depois com a espada.'],
      ['O que registaste?', 'q', 'Que caíste. E quantos turnos aguentaste. Foram poucos.']]],
    ['lose', 'king', 'Os reis não perdoam. E tu deste-lhe razão para não perdoar.', [
      ['Volto para ele.', 'd', 'Volta. Com outro nível. Ou volta para cair outra vez.'],
      ['Ainda não estou pronto.', 'o', 'Finalmente uma conclusão inteligente.'],
      ['O que me falta?', 'q', 'Vida para aguentar a segunda fase. Dano para a acabar rápido. E paciência.']], { prio: true, w: 4 }],
    ['lose', '', 'Morrer num portão não é o fim. É só o Sistema a lembrar-te o teu lugar.', [
      ['Qual é o meu lugar?', 'q', 'Abaixo de {boss}. Por agora.'],
      ['O meu lugar é em cima.', 'd', 'Então sobe. Com missões. Não com palavras.'],
      ['Entendido.', 'o', 'Ótimo. Então vai buscar níveis.']]],
    ['lose', 'hp<1', 'Zero de vida. Recupera antes de pensares noutra coisa. É uma ordem.', [
      ['Vou usar uma poção.', 'o', 'Bom. A Bolsa tem o que precisas. Se não tem, a Loja tem.'],
      ['Espero pelo novo dia.', 'q', 'Podes. À meia-noite eu restauro-te. Mas até lá és inútil nos portões.'],
      ['Estou bem.', 'd', 'Estás a zero. Não é bem. É o fundo.']]],
    ['lose', '', 'A derrota é o professor mais caro que existe. Pagaste a aula. Aprendeste?', [
      ['Aprendi.', 'o', 'Mostra-me na próxima batalha.'],
      ['Não sei.', 'q', 'Então paga outra aula. Até saberes.'],
      ['Não gosto de aulas.', 'd', 'Ninguém gosta. É por isso que os portões estão cheios de alunos mortos.']]],
    ['lose', 'd>=5', 'Desafiaste-me {d} vezes. Agora foste desafiado por {boss}. Como é estar do outro lado?', [
      ['Mau.', 'o', 'Bom. Lembra-te dessa sensação da próxima vez que me desafiares.'],
      ['Não vou parar.', 'd', 'Eu sei. É o que torna isto interessante.'],
      ['Tu ganhas sempre?', 'q', 'Eu não luto. Eu só observo. E o observador ganha sempre.']], { w: 4 }],

    /* ---------- fuga (8) ---------- */
    ['flee', '', 'Fugiste. Inteligente ou covarde? Eu decido isso depois de ver o que fazes a seguir.', [
      ['Inteligente.', 'o', 'Então volta mais forte. Senão é covardia com outro nome.'],
      ['Covarde, e depois?', 'd', 'Ao menos estás vivo para ser covarde. Os outros nem isso.'],
      ['O que devo fazer?', 'q', 'Missões. Sobe de nível. E volta. Ou não voltes. Eu registo os dois.']]],
    ['flee', '', 'Perdeste moedas a fugir. O chefe continua lá. Sorrindo, imagino.', [
      ['Vou voltar.', 'o', 'Volta. O sorriso dele fica à espera.'],
      ['Que sorria.', 'd', 'Sorri. Tu é que pagaste.'],
      ['Posso fugir sem perder?', 'q', 'O Pó de Fumo deixa-te fugir de graça. A Loja tem. Os covardes prevenidos usam-no.']]],
    ['flee', '', 'Fugir também é uma decisão. Não é a mais bonita, mas é uma.', [
      ['Foi a certa.', 'o', 'Pode ter sido. Vamos ver o que fazes com essa vida que guardaste.'],
      ['Não precisava de fugir.', 'd', 'Então porque fugiste?'],
      ['Qual seria a mais bonita?', 'q', 'Vencer. Ou morrer a tentar. As duas têm estética. Só uma tem futuro.']]],
    ['flee', 'king', 'Fugiste de um rei. Ele vai lembrar-se. Os reis lembram-se sempre.', [
      ['Que se lembre.', 'd', 'Vai. E da próxima vez vai começar a luta mais zangado.'],
      ['Não tinha hipótese.', 'o', 'Não tinhas. Saber quando não tens hipótese é uma habilidade. Rara.'],
      ['Ele fica mais forte?', 'q', 'Não. Tu é que tens de ficar.']], { w: 3 }],
    ['flee', '', 'Correste. As pernas funcionam. Agora usa-as na Missão Diária.', [
      ['Vou já.', 'o', 'Vai. Ali ninguém te persegue. Só o relógio.'],
      ['Que piada.', 'd', 'Não é piada. É sugestão. Eu não conto piadas.'],
      ['A corrida conta?', 'q', 'Conta se a registares. A fuga não.']]],
    ['flee', 'gap>=8', 'Fugiste de {boss}, {gap} níveis acima de ti. Dessa vez, aprovo.', [
      ['Obrigado.', 'o', 'Não agradeças. Sobe de nível.'],
      ['Não preciso da tua aprovação.', 'd', 'Não precisas. Mas tiveste-a. Raro. Guarda-a.'],
      ['Porque aprovas?', 'q', 'Porque um jogador vivo pode ganhar amanhã. Um morto só perde moedas.']], { w: 4 }],
    ['flee', '', 'Vejo que preferes viver a lutar. A maioria dos sobreviventes também.', [
      ['É estratégia.', 'o', 'Estratégia é voltar com um plano. Fugir é só o começo dela.'],
      ['Sou um sobrevivente.', 'd', 'És. Mas sobrevivente não é o mesmo que vencedor.'],
      ['E os outros?', 'q', 'Os outros estão nos registos de derrotas. Em grande número.']]],
    ['flee', 'coins<100', 'Fugiste e ficaste com {coins} moedas. Mais uma fuga destas e nem fumo tens para comprar.', [
      ['Vou fazer missões.', 'o', 'É exatamente a resposta certa. Vai.'],
      ['As moedas não interessam.', 'd', 'Até precisares de uma poção.'],
      ['Como ganho mais?', 'q', 'Missões, Diárias, chefes. Por esta ordem, para ti.']], { w: 3 }]
  ]]);
})(globalThis.SYS = globalThis.SYS || {});
