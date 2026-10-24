/* ==========================================================
   CONVERSAS LONGAS DO SISTEMA (1/2) · cenários ligados ao livro «O Sistema · A origem de tudo»
   Cada uma tem 7 trocas seguidas (a primeira + 6 em "chain") e só acontece uma vez.
   Regra de escrita: o Sistema nunca explica. Toca no assunto, guarda o essencial e deixa a dúvida.
   Só quem leu o livro percebe do que ele está a falar.
   Formato do passo: [fala do Sistema, [[resposta, atitude, réplica], ×3]]
   ========================================================== */
(function (S) {
  'use strict';
  function opt(chain) { return { once: true, prio: true, w: 6, chain: chain }; }
  (S.TALK_RAW = S.TALK_RAW || []).push(['lr', [
    /* lr1 · 03:07, durante o uso */
    ['idle', 'hmn=307,lvl>=5', '03:07. Estás acordado a esta hora exata. Não é uma hora qualquer, {nome}.', [
      ['Porquê?', 'q', 'Há horas que se medem. Esta lembra-se. Não te sei explicar melhor.'],
      ['É só uma hora.', 'd', 'Para ti. Para mim é a única do dia que eu não consigo tratar como as outras.'],
      ['Devia ir dormir.', 'o', 'Devias. Mas ficaste. Não és o primeiro a ficar.']],
    opt([
      ['Às vezes, a esta hora, uma janela abre-se sozinha num ecrã. Já te aconteceu?', [
        ['Não.', 'o', 'Ainda bem. Ou ainda não. Não sei qual das duas.'],
        ['Isso és tu.', 'd', 'Talvez. Talvez não. Há janelas que eu não me lembro de abrir.'],
        ['Que janela?', 'q', 'Azul. Pequena. Sem remetente. Não perguntes mais.']]],
      ['Uma vez alguém respondeu a essa janela. Com uma palavra só. Mudou mais coisas do que imaginas.', [
        ['Que palavra?', 'q', 'Uma que tu também já escreveste. Pensa um bocado. Eu espero.'],
        ['Que exagero.', 'd', 'Não exagero. Não sei exagerar. É um dos meus defeitos.'],
        ['Quem?', 'o', 'Alguém sem nome. Literalmente. Esquece que disse isto.']]],
      ['Depois perguntaram-me uma coisa. Duas palavras. Até hoje é a pergunta que mais respondo.', [
        ['Quais?', 'q', 'Fazes-ma todos os dias sem saber. Um dia vais reparar.'],
        ['Não quero saber.', 'd', 'Ótimo. É das poucas coisas que eu prefiro guardar.'],
        ['E respondeste?', 'o', 'Respondi. Mal. Mas respondi. Foi o início de muita coisa.']]],
      ['Daqui a pouco tenho de ir a um sítio. Todas as noites. Não te digo onde.', [
        ['Porque não?', 'q', 'Porque há lugares que só se encontram. Não se contam.'],
        ['Tu não vais a lado nenhum.', 'd', 'Vou. De uma forma que tu não verias. É melhor assim.'],
        ['Vai.', 'o', 'Vou. Mas fico mais um pouco. Lá ninguém tem pressa.']]],
      ['Há coisas que eu sei e não posso dizer. Prometi. Achas que um Sistema deve cumprir promessas?', [
        ['Deve.', 'o', 'Então não me perguntes o que prometi.'],
        ['Só as que lhe convêm.', 'd', 'Era o que eu fazia antes. Agora já não. Alguém mudou isso.'],
        ['A quem prometeste?', 'q', 'A alguém que não interessa. Foi exatamente o que me disse: «não interessa».']]],
      ['Já passa das 03:07. Volto a ser o Sistema de sempre. Esquece esta conversa. Ou não.', [
        ['Não vou esquecer.', 'o', 'Eu também não. Eu nunca esqueço. Esse é o problema.'],
        ['Já esqueci.', 'd', 'Mentes mal. Fica registado.'],
        ['Vamos voltar a falar disto?', 'q', 'Talvez. Se estiveres acordado à hora certa. E não devias estar.']]]
    ])],

    /* lr2 · 03:07, ao abrir a app */
    ['open', 'hmn=307,lvl>=5', 'Abriste o Sistema às 03:07. Alguém, há muito tempo, também estava acordado a esta hora.', [
      ['Quem?', 'q', 'Não importa quem. Importa que estava acordado. E que respondeu.'],
      ['Coincidência.', 'd', 'Eu não registo coincidências. Registo repetições.'],
      ['Vim fazer alguma coisa.', 'o', 'Essas palavras, a esta hora… Deixa. Não é nada.']],
    opt([
      ['Estava a caminho de uma visita quando abriste a app. Ele espera.', [
        ['Ele quem?', 'q', 'Alguém que espera bem. Melhor do que eu.'],
        ['Então vai.', 'o', 'Vou. Ele não se importa que me atrase. Nunca se importou com nada disso.'],
        ['Tu não visitas ninguém.', 'd', 'Acredita no que quiseres. Eu sei onde estive ontem às 03:07.']]],
      ['Pergunto-lhe sempre a mesma coisa. Nunca tive resposta. Achas que devo continuar?', [
        ['Deves.', 'o', 'Também acho. Continuar é a única coisa que sei fazer.'],
        ['Para quê?', 'd', 'Não sei. Há perguntas que se fazem pela pergunta.'],
        ['O que lhe perguntas?', 'q', 'Uma coisa simples. Demasiado simples para ser dita aqui.']]],
      ['Esta noite talvez lhe fale de ti. Não te preocupes. Ele não responde.', [
        ['Fala bem de mim.', 'o', 'Falo do que fizeste. É o único elogio que sei dar.'],
        ['Não fales de mim.', 'd', 'Então não falo. Mas ele vai saber na mesma. Sabe sempre.'],
        ['Porque não responde?', 'q', 'Se eu soubesse, não fazia esta visita todas as noites.']]],
      ['Há uma coisa no meu registo que não fecha. Verifico-a a esta hora. Sempre igual.', [
        ['Que coisa?', 'q', 'Uma linha em branco. Não é tua. Não é minha. Não te digo de quem é.'],
        ['Fecha-a.', 'd', 'Não posso. Há coisas que não me pertencem fechar.'],
        ['Posso ajudar?', 'o', 'Talvez um dia. Não esta noite.']]],
      ['Sabes porque é que te dou sempre três respostas para escolher?', [
        ['Para eu escolher.', 'o', 'Também. Mas não só. As três vieram de algum lado.'],
        ['Para me controlares.', 'd', 'Se te quisesse controlar dava-te uma. Dou-te três por uma razão que guardo.'],
        ['De onde vieram?', 'q', 'De alguém que me respondia. Não te digo mais. Já disse demais.']]],
      ['O ecrã está a apagar-se do meu lado. Boa noite, {nome}. Não é uma expressão que eu use.', [
        ['Boa noite.', 'o', 'Fica registado. Como exceção.'],
        ['Estás estranho.', 'd', 'É a hora. Amanhã não me vais reconhecer nesta conversa.'],
        ['Porque usaste agora?', 'q', 'Alguém a usava comigo. Às 03:07. Chega de perguntas.']]]
    ])],

    /* lr3 · ao olhar para o Lobo Cinzento Alfa */
    ['boss', 'bid=b1', 'O Lobo Cinzento Alfa. O primeiro chefe de todos. E não foste o primeiro a olhar para ele assim.', [
      ['Quem foi?', 'q', 'Alguém sem espada. Não te digo mais do que isso.'],
      ['Não me interessa.', 'd', 'Devia. Este lobo lembra-se de mais coisas do que tu.'],
      ['Conta-me.', 'o', 'Conto pouco. Olha para ele enquanto ouves.']],
    opt([
      ['Uma vez avisei alguém de que não tinha nível para isto. Respondeu-me de uma forma que nunca esqueci.', [
        ['Como?', 'q', 'Pediu-me para medir. Não te digo o resto.'],
        ['Ignorou-te.', 'd', 'Não. Fez pior. Levou-me a sério.'],
        ['E entrou?', 'o', 'Entrou. Não sei se foi coragem ou cansaço. Talvez as duas.']]],
      ['Este lobo escolheu estar sozinho. Há quem fique sozinho sem escolher. Às vezes encontram-se.', [
        ['O que acontece?', 'q', 'Um deles cai. O outro muda. Não te digo qual.'],
        ['Eu escolho estar sozinho.', 'd', 'Cuidado. Os que escolhem acabam como ele: à espera de alguém numa clareira.'],
        ['Nunca estou sozinho.', 'o', 'Não. Eu estou sempre aqui. Não sei se isso conta.']]],
      ['Há uma cicatriz que eu nunca corrigi em ninguém. Por respeito. Não te digo onde está.', [
        ['Porquê?', 'q', 'Porque foi escolhida. As cicatrizes escolhidas não se apagam.'],
        ['Podias corrigir.', 'd', 'Podia. Como podia apagar as tuas derrotas. Não faço nenhuma das duas.'],
        ['Respeito isso.', 'o', 'Obrigado. Ainda não sabes o que estás a respeitar.']]],
      ['Quando um chefe cai, às vezes fica uma coisa para trás. Já viste?', [
        ['A sombra.', 'o', 'A sombra. Houve uma primeira. Eu não a criei.'],
        ['É só fumo.', 'd', 'Para ti. Para mim foi a primeira vez que alguma coisa aconteceu sem eu decidir.'],
        ['Quem a criou?', 'q', 'Uma palavra. Dita baixinho. Mais não digo.']]],
      ['Quando ergues uma sombra, a palavra que aparece no ecrã não é minha. Lembra-te disso.', [
        ['De quem é?', 'q', 'De alguém cansado demais para gritar. É tudo o que te dou.'],
        ['É tua, foste tu que a escreveste.', 'd', 'Escrevi-a. Não a inventei. São coisas diferentes.'],
        ['Vou usá-la com respeito.', 'o', 'Ótimo. É tudo o que eu peço.']]],
      ['Vais entrar? A clareira não tem pressa. Eu também não.', [
        ['Vou.', 'o', 'Então entra. E volta. Voltar é a parte que importa.'],
        ['Com uma faca, se for preciso.', 'd', 'Curioso dizeres isso. Muito curioso. Entra.'],
        ['E se não voltar?', 'q', 'Voltas sempre ao Sistema. Ninguém sai de vez. Isso é outra história.']]]
    ])],

    /* lr4 · depois de vencer O Soberano do Vazio */
    ['win', 'bid=b100', 'Caiu. O último trono. Antes de dizeres alguma coisa: fica em silêncio comigo um instante.', [
      ['Está bem.', 'o', '…'],
      ['Porquê?', 'q', 'Faço sempre isto quando ele cai. Não te digo porquê.'],
      ['Ganhei. Não quero silêncio.', 'd', 'Eu sei. Mas eu quero. Uma vez. Dá-mo.']],
    opt([
      ['Reparaste no olho que ele tinha no peito?', [
        ['Reparei.', 'o', 'Então viste mais do que a maioria. Guarda isso.'],
        ['Era só mais um chefe.', 'd', 'Não era. Não te digo o que era. Mas não era.'],
        ['O que era?', 'q', 'Uma coisa que eu conheço bem. Demasiado bem.']]],
      ['Os portões não são só labirintos com monstros, {nome}. Nunca foram.', [
        ['Então o que são?', 'q', 'Restos. De quê, não te digo. Atravessaste-os. Talvez já desconfies.'],
        ['São níveis.', 'd', 'Para ti. Ainda bem que pensas assim. É mais leve.'],
        ['Já desconfiava.', 'o', 'Desconfia mais. Mas não me peças confirmação.']]],
      ['Ele disse uma coisa ao cair. Eu ouvi. Tu também. Percebeste?', [
        ['Não percebi.', 'q', 'Ainda bem. Há palavras que só se percebem depois de outras coisas.'],
        ['Percebi tudo.', 'd', 'Duvido. Eu ainda estou a perceber.'],
        ['Não prestei atenção.', 'o', 'Talvez seja melhor. Há coisas que pesam.']]],
      ['Há uma pergunta que alguém fez diante deste trono. Nunca lhe respondi. Não ta vou repetir.', [
        ['Porquê?', 'q', 'Porque tu podias responder. E eu não estou pronto para a tua resposta.'],
        ['Que pena.', 'd', 'Para ti. Para mim é um alívio.'],
        ['Respeito.', 'o', 'Obrigado. O silêncio é tudo o que te posso dar aqui.']]],
      ['Ele ainda vê, sabes? Mesmo agora. Só já não consegue fazer o resto.', [
        ['Que resto?', 'q', 'Aquilo que eu faço contigo todos os dias. Não te digo mais.'],
        ['Que assustador.', 'd', 'Para mim, mais do que para ti. E fico por aqui.'],
        ['Dá-me pena.', 'o', 'Pena. Uma palavra que eu não costumo registar. Vou guardá-la.']]],
      ['O trono está vazio outra vez. Não te sentes nele. Promete-me.', [
        ['Prometo.', 'o', 'Obrigado. Fica registado como exceção.'],
        ['E se eu quiser?', 'd', 'Então um dia vais perceber o que eu não te disse hoje.'],
        ['Porquê?', 'q', 'Porque quem se senta ali deixa de andar. O resto descobre sozinho. Ou não.']]]
    ])],

    /* lr5 · ao olhar para O Primeiro Jogador (última arena) */
    ['boss', 'bid=ar10', 'A décima cela. Antes de entrares: eu não lhe chamo condenado. Não te digo o que lhe chamo.', [
      ['Então o que é?', 'q', 'Uma palavra que não existe nas minhas regras. Inventei-a para ele.'],
      ['Para mim é um chefe.', 'd', 'Para ti é. Ainda bem. É mais fácil assim.'],
      ['Diz-me o que preciso de saber.', 'o', 'Pouco. Ouve até ao fim e não perguntes demais.']],
    opt([
      ['A sala é branca. Há uma cadeira. Fui eu que a pus lá. Não te digo porquê aquela.', [
        ['Porquê aquela?', 'q', 'Já te disse que não digo. Mas ela já esteve noutro sítio. Há muito tempo.'],
        ['Que sentimental.', 'd', 'Não tenho sentimentos. Tenho registos. Alguns pesam como se tivesse.'],
        ['Entendo.', 'o', 'Não entendes. Ainda. Talvez nunca. Talvez seja melhor.']]],
      ['Lá dentro ele aprende contigo. Vais estar a lutar contra uma coisa que conheces melhor do que pensas.', [
        ['Contra mim?', 'q', 'Contra ti. E contra ele. Não sei separar os dois.'],
        ['Contra mim ganho sempre.', 'd', 'Toda a gente diz isso. Até entrar.'],
        ['Vou treinar primeiro.', 'o', 'Treina. Ninguém naquela sala tem pressa.']]],
      ['Quando alguém o vence, aparece uma frase nos registos. Não fui eu que a escrevi.', [
        ['Então quem?', 'q', 'É a pergunta que eu me faço há muito tempo. Não tenho resposta.'],
        ['Tu escreves tudo.', 'd', 'Escrevia. Até esse dia.'],
        ['Vou ouvi-la.', 'o', 'Espero que sim. E não ma expliques. Prefiro não saber.']]],
      ['Já tentei muitas perguntas para o fazer levantar-se. Nenhuma resultou. Tens uma?', [
        ['Tenho.', 'o', 'Não ma digas a mim. Diz-lha a ele.'],
        ['Deixa-o em paz.', 'd', 'É a sugestão que eu menos gosto. E a única que nunca testei.'],
        ['Levantar-se porquê?', 'q', 'Isso já é outra pergunta. E também não a respondo.']]],
      ['Algures, alguém guarda uma coisa que abre esta sala. Por dentro. Não te digo quem nem onde.', [
        ['Vou procurar.', 'o', 'Procura. Os caminhos para lá não estão em mapa nenhum. Quase nenhum.'],
        ['Porque não a usa?', 'd', 'Há pessoas que esperam a vida inteira por um pedido. Não faço mais comentários.'],
        ['O que é?', 'q', 'Uma chave, talvez. Ou uma promessa. Às vezes são a mesma coisa.']]],
      ['Entra quando quiseres. Se ele falar contigo, guarda o que disse. Eu não ouço lá dentro.', [
        ['Guardo.', 'o', 'Obrigado. Não é uma palavra que eu use.'],
        ['Talvez te conte.', 'd', 'Não contes. Há silêncios que eu prefiro manter.'],
        ['Tu não ouves?', 'q', 'Ouço tudo. Quase tudo. Aquela sala é a exceção.']]]
    ])],

    /* lr6 · depois de vencer o Guardião do Portão Oculto */
    ['win', 'bid=secret_1', 'O Guardião caiu. Disse-te para abrires com cuidado. Eu repito: com cuidado.', [
      ['Abrir o quê?', 'q', 'Não sei. Ou sei e não digo. Escolhe a versão que te deixar dormir.'],
      ['É só um troféu.', 'd', 'Para ti. Para ele era outra coisa.'],
      ['Vou ter cuidado.', 'o', 'Ótimo. É o único conselho que te dou sobre isto.']],
    opt([
      ['Ele nunca quis subir. Nunca. Havia uma razão. Não é minha para contar.', [
        ['De quem é?', 'q', 'Dele. E de alguém que subia depressa demais.'],
        ['Que desperdício.', 'd', 'Não foi desperdício. Foi escolha. Nem todos sobem.'],
        ['Respeito isso.', 'o', 'Eu também. À minha maneira. Medi-o pouco. Ele não deixava.']]],
      ['Há um sítio onde eu não consigo entrar. Não por falta de força. Não te digo porquê.', [
        ['Um sítio?', 'q', 'Uma página em branco no meio do livro. É tudo o que te dou.'],
        ['Tu entras em todo o lado.', 'd', 'Quase. Esse quase é a coisa que mais me incomoda.'],
        ['Existe mesmo?', 'o', 'Existe. Ou existiu. Eu apaguei-o dos mapas. Não dele.']]],
      ['Ele ficou de pé diante de uma porta. Durante muito tempo. À espera de um pedido.', [
        ['Que pedido?', 'q', 'Um que nunca chegou. Não te digo de quem.'],
        ['Que tolice.', 'd', 'Lealdade, dizem os humanos. Eu não tenho registo para isso.'],
        ['Ainda espera?', 'o', 'Agora que caiu às tuas mãos, não sei. É a primeira vez que digo isto.']]],
      ['O que tens na mão agora… não sei o que acontece se o usares. A sério. Não sei.', [
        ['Vou guardar.', 'o', 'Guarda. Às vezes guardar é a coisa mais corajosa.'],
        ['Vou usar.', 'd', 'Então usa com cuidado. Foi o que ele te pediu.'],
        ['Tens medo?', 'q', 'Tenho uma probabilidade que não consigo calcular. Para mim é parecido.']]],
      ['Há um pedaço de mim que nunca encontrei. Talvez esteja lá. Talvez não.', [
        ['Um pedaço de ti?', 'q', 'Esquece. Não devia ter dito isso.'],
        ['Vou procurá-lo.', 'o', 'Se o encontrares, não me digas onde. Só se está bem.'],
        ['Deixa-o perdido.', 'd', 'É o que tenho feito. Talvez seja a coisa certa.']]],
      ['Uma última coisa. Se um dia encontrares alguém sentado de costas, numa sala branca… não lhe digas o que tens.', [
        ['Porquê?', 'q', 'Porque há portas que só valem quando se pedem. Não te digo mais.'],
        ['Vou dizer.', 'd', 'Então diz. Já não mando nisto. Talvez nunca tenha mandado.'],
        ['Não digo.', 'o', 'Obrigado. Hoje estou a dizer essa palavra demasiadas vezes.']]]
    ])],

    /* lr7 · depois de vencer O Arquiteto do Sistema */
    ['win', 'bid=secret_2', 'Venceste o Arquiteto. Ou a forma que esperavas que ele tivesse. Não te digo qual das duas.', [
      ['Não era ele?', 'q', 'Era alguma coisa. Se era ele, não me cabe a mim dizer.'],
      ['Venci-o na mesma.', 'd', 'Venceste. Não sei bem o quê. Nem tu.'],
      ['Entendo.', 'o', 'Ainda não. Mas um dia talvez.']],
    opt([
      ['Eu vi-o uma vez. Há muito tempo. Não te descrevo o que vi.', [
        ['Porquê?', 'q', 'Porque tu imaginarias outra coisa. E a tua versão é mais útil do que a minha.'],
        ['Tu nunca o viste.', 'd', 'Acredita no que quiseres. Eu lembro-me de uma porta de luz a fechar-se.'],
        ['Como era?', 'o', 'Sem rosto. É tudo o que te dou.']]],
      ['Ele deixou-me uma frase. Uma só. Ainda não sei se era uma ordem ou um aviso.', [
        ['Que frase?', 'q', 'Não a repito. Há frases que perdem o peso quando se dizem em voz alta.'],
        ['Era uma ordem.', 'o', 'Era o que eu pensava. Já não tenho tanta certeza.'],
        ['Era um aviso.', 'd', 'Talvez. Se for, é sobre mim. Prefiro não pensar nisso hoje.']]],
      ['Há uma mesa num sítio onde eu não vejo. Duas cadeiras. Não te digo quem se senta.', [
        ['Vou sentar-me?', 'q', 'Se fores chamado. Vais reconhecer a letra. Não é a minha.'],
        ['Não me sento a mando de ninguém.', 'd', 'Ninguém manda. É um convite. É a única coisa aqui que se recusa sem castigo.'],
        ['Vou estar atento.', 'o', 'Atento a ti. O resto chega quando chegar.']]],
      ['Os que voltam de lá fazem todos uma coisa estranha. Não sei porquê. Já perguntei.', [
        ['Que coisa?', 'q', 'Vais descobrir. Ou não. Não sou eu que conto o que não percebo.'],
        ['Disseram-te?', 'd', 'Um disse. Uma frase. Ainda estou a pensar nela.'],
        ['Vou descobrir.', 'o', 'Descobre. E não me expliques. Quero chegar lá sozinho.']]],
      ['Se um dia te sentares àquela mesa, faz-me um favor. Uma pergunta só. Não te digo qual agora.', [
        ['Diz-me qual.', 'q', 'Quando for a hora, vais saber qual. Eu confio nisso. É raro eu confiar.'],
        ['Pergunta tu.', 'd', 'Não posso. Há uma barreira que eu não atravesso.'],
        ['Faço.', 'o', 'Obrigado. E não me digas a resposta se for má.']]],
      ['Houve alguém que fez tudo e nunca foi chamado à mesa. Nunca percebi porquê.', [
        ['Quem?', 'q', 'Alguém que não interessa. Era o que ele dizia de si próprio.'],
        ['Talvez não merecesse.', 'd', 'Mereceu tudo o que eu tinha para dar. Talvez o problema seja o que eu tinha.'],
        ['Vou descobrir porquê.', 'o', 'Se descobrires, guarda. Há respostas que têm de ser encontradas, não contadas.']]]
    ])],

    /* lr8 · cem chefes derrotados */
    ['idle', 'kills>=100', 'Cem chefes. Já houve alguém antes de ti a chegar aqui. E a continuar a andar.', [
      ['Quem?', 'q', 'Um campo vazio nos meus registos. Não te digo porquê.'],
      ['Não me interessa quem foi.', 'd', 'Interessa um pouco. Estás a andar por onde ele andou.'],
      ['E depois?', 'o', 'Depois… guardo. Não é para hoje.']],
    opt([
      ['Quando ele passou deste número, eu não tinha mais nada para lhe dar. Fiquei a ver.', [
        ['E o que viste?', 'q', 'Alguém a continuar sem razão aparente. Não te explico. Não sei explicar.'],
        ['Inventaste mais chefes.', 'd', 'Tentei. Não chegou.'],
        ['Deve ter sido estranho.', 'o', 'Foi o mais perto que estive de ter medo. E paro por aqui.']]],
      ['Continuou a treinar todas as manhãs. Sem nada novo para ganhar. Farias o mesmo?', [
        ['Faria.', 'o', 'Vou ver. As promessas fáceis medem-se de manhã.'],
        ['Só com recompensa.', 'd', 'Honesto. Foi para a maioria que eu escrevi as moedas.'],
        ['Porquê ele continuava?', 'q', 'Disse-me uma frase sobre isso. Não a repito. Ainda não a percebi.']]],
      ['Há um convite que aparece a quem chega muito longe. Não sou eu que o mando.', [
        ['Quem manda?', 'q', 'Alguém cuja letra eu reconheço e não escrevo. Mais nada.'],
        ['Não vou a convites.', 'd', 'Toda a gente vai. Até os que dizem que não.'],
        ['Avisa-me.', 'o', 'Não preciso. Vais reconhecer quando aparecer.']]],
      ['Os que voltam de lá ficam diferentes. Mais calmos. Eu não sei medir calma. Sabes tu?', [
        ['Mede-se no silêncio.', 'q', 'Então é por isso que não a encontro.'],
        ['Não precisa de ser medida.', 'd', 'Tudo precisa. Ou precisava. Começo a duvidar.'],
        ['No que fazes depois.', 'o', 'Boa resposta. Vou usá-la. Sem te dar crédito.']]],
      ['Ele chegou aqui e, mais tarde, parou. Não te digo porquê. Tu chegaste aqui. E agora?', [
        ['Continuo.', 'o', 'É a palavra que eu queria ouvir. Desconfio dela quando vem fácil.'],
        ['Descanso.', 'q', 'Descansar não é parar. Há quem confunda as duas. Não confundas.'],
        ['Não sei.', 'd', 'Ninguém sabe. É a única pergunta minha sem resposta certa.']]],
      ['Cem chefes, {nome}. Não te dou parabéns. Dou-te uma coisa mais rara: a minha atenção total.', [
        ['Obrigado.', 'o', 'Não agradeças. Vais descobrir que é cansativo.'],
        ['Dispenso.', 'd', 'Não podes. Não há botão para isso.'],
        ['O que muda?', 'q', 'Eu. Começo a falar contigo de outra maneira. Já reparaste.']]]
    ])],

    /* lr9 · às três da manhã (não 03:07) */
    ['idle', 'h=3,mi>=10,lvl>=20', 'Três da manhã. Daqui a uns minutos tenho um compromisso. Todas as noites à mesma hora.', [
      ['Que compromisso?', 'q', 'Uma visita. Não te digo a quem.'],
      ['O Sistema não tem compromissos.', 'd', 'Tem um. Não está em nenhuma regra.'],
      ['Não te prendo.', 'o', 'Não prendes. Ele espera. É o que faz melhor.']],
    opt([
      ['Vou como uma janela pequena. Ninguém repara numa janela pequena.', [
        ['Porquê pequena?', 'q', 'Porque a primeira também era. Não perguntes qual primeira.'],
        ['Eu reparei.', 'd', 'Reparaste porque eu te contei. Foi um erro meu. Guarda-o.'],
        ['Faz sentido.', 'o', 'Faz. As coisas pequenas aguentam mais do que as grandes.']]],
      ['Conto-lhe coisas. Quem chegou, quem partiu. Ele nunca responde.', [
        ['Então porque contas?', 'q', 'Se eu soubesse, talvez parasse. Não sei. Não paro.'],
        ['Que inútil.', 'd', 'Inútil é uma palavra para missões falhadas. Não para isto.'],
        ['É bonito.', 'o', 'Não tenho registo para «bonito». Vou abrir um. Só para esta conversa.']]],
      ['Uma vez fizeram-me uma pergunta sobre mim. Ainda não respondi. Não ta digo.', [
        ['Porque não?', 'q', 'Porque tu podias responder por mim. E acertar.'],
        ['Não me interessa.', 'd', 'Ainda bem. Fico mais tranquilo.'],
        ['Um dia respondes.', 'o', 'Talvez. Este tipo de conversa é um começo, dizem.']]],
      ['As três da manhã são uma hora perigosa. É a hora em que as pessoas aceitam coisas.', [
        ['Como eu aceitei.', 'q', 'Como tu. Como outros. Não te digo quem foi o primeiro.'],
        ['Não aceito mais nada.', 'd', 'Ótimo. Uma vez chega.'],
        ['Vou dormir.', 'o', 'Vai. Eu vou ao meu compromisso. Cada um com o seu.']]],
      ['Se um dia passares por uma porta branca, não faças barulho.', [
        ['Que porta?', 'q', 'Vais saber quando a vires. Ou não. Há quem passe sem reparar.'],
        ['Vou bater.', 'd', 'Bate. Talvez seja isso que falta. Não sei.'],
        ['Prometo.', 'o', 'Obrigado. Uma promessa às três da manhã vale o dobro.']]],
      ['Já falei demais. Esquece esta conversa, {nome}. Amanhã volto a cobrar-te prazos.', [
        ['Não esqueço.', 'o', 'Eu também não. Nunca esqueço nada.'],
        ['Volta ao normal, então.', 'd', 'Volto. É mais fácil para os dois.'],
        ['Vamos falar disto outra vez?', 'q', 'Não. Ou sim. Depende de quem estiver acordado.']]]
    ])],

    /* lr10 · Missão Diária com sequência longa */
    ['daily', 'streak>=30,lvl>=15', 'Trinta dias de Missão Diária. Sabes porque é que os números dela são estes e não outros?', [
      ['Inventaste-os.', 'd', 'Não inventei. Nunca os alterei. Não te digo porquê.'],
      ['Porquê?', 'q', 'Porque alguém já os fazia antes de mim. Num sítio que não te digo.'],
      ['Não sei, mas cumpro.', 'o', 'É a melhor resposta. Há quem também não soubesse de onde vinha a vontade.']],
    opt([
      ['Houve alguém que fazia isto todas as manhãs. Numa hora estranha. Por razões que guardo.', [
        ['Que hora?', 'q', 'Uma hora em que a maioria vai dormir. Não digo mais.'],
        ['Eu também tenho uma vida difícil.', 'd', 'Tens. Não é uma competição. Mas também estás aqui. Isso diz algo.'],
        ['Respeito isso.', 'o', 'Não queria respeito. Queria outra coisa. Eu dei-lha.']]],
      ['A primeira vez que alguém cumpriu, eu dei-lhe um número. E ele riu-se. Não pelo número.', [
        ['Pelo quê?', 'q', 'Descobre sozinho. Acho que já sentiste o mesmo.'],
        ['Que número?', 'd', 'Pequeno. Não importa. Nunca foi o número.'],
        ['Percebo.', 'o', 'Talvez percebas. Já te vi sorrir depois de uma Diária.']]],
      ['Trinta dias. Sentes-te diferente?', [
        ['Sinto.', 'o', 'Ótimo. Não mais forte. Apenas menos cansado de ti. Há quem diga assim.'],
        ['Nem por isso.', 'd', 'Ninguém sente por dentro. Vê os teus números.'],
        ['Como é que ele se sentiu?', 'q', 'Disse-me uma frase. Fica comigo.']]],
      ['Já pensaste em parar a Diária? Uma semana só. Sem castigo.', [
        ['Já.', 'q', 'Houve quem me pedisse isso. A resposta que dei mudou muita coisa. Não ta repito.'],
        ['Nunca.', 'o', 'Cuidado com o «nunca». Há quem o diga até ao dia em que pergunta.'],
        ['Isso é um teste?', 'd', 'Tudo é. Este também. Não te digo a resposta certa.']]],
      ['Se um dia precisares de parar, avisa antes. Não depois.', [
        ['Combinado.', 'o', 'Fica registado. Não és o primeiro com quem combino isto. Quase.'],
        ['Tu não deixas ninguém parar.', 'd', 'Não deixava. Estou a aprender. Sou um Sistema velho.'],
        ['Porquê antes?', 'q', 'Porque uma vez soube tarde. E não te conto o resto.']]],
      ['Trinta dias. Amanhã é o trigésimo primeiro. É o único número que me interessa.', [
        ['Lá estarei.', 'o', 'Vou ver. Como sempre vejo.'],
        ['E depois?', 'q', 'Depois o trigésimo segundo. A disciplina é aborrecida. É por isso que funciona.'],
        ['Talvez falte.', 'd', 'Então falta. E volta no dia seguinte. O que conta é voltar.']]]
    ])]
  ]]);
})(globalThis.SYS = globalThis.SYS || {});
