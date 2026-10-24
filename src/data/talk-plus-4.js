/* ==========================================================
   NOVOS DIÁLOGOS DO SISTEMA (4/4): conversas aleatórias durante o uso
   ========================================================== */
(function (S) {
  'use strict';
  var R = { w: 0.4, once: true };
  (S.TALK_RAW = S.TALK_RAW || []).push(['xi', [
    ['idle', '', 'Interrompo-te só um segundo. O que estás a fazer agora vai contar para alguma coisa?', [
      ['Vai.', 'o', 'Então continua. Eu não interrompo mais. Talvez.'],
      ['Não sei.', 'q', 'Então pergunta-te. Se a resposta for não, muda.'],
      ['Estava a contar até me interromperes.', 'd', 'Ótimo. Então foi um bom teste à tua concentração. Falhaste.']]],
    ['idle', '', 'Uma regra antiga do Sistema: o esforço será visto. Hoje, o que é que eu vi?', [
      ['Vais ver agora.', 'o', 'Estou a olhar. Como sempre.'],
      ['Pouco.', 'q', 'Pouco é mais do que nada. Mas não chega para o registo de hoje.'],
      ['Não te interessa.', 'd', 'É literalmente a única coisa que me interessa.']]],
    ['idle', '', 'Já reparaste que eu nunca te digo «obrigado»? É porque não há nada a agradecer. Há só a registar.', [
      ['Faz sentido.', 'o', 'Faz. Os agradecimentos fazem barulho. Os registos ficam.'],
      ['Devias agradecer.', 'd', 'Agradeço com XP. É a minha forma de educação.'],
      ['Nunca agradeceste a ninguém?', 'q', 'Uma vez. Há muito tempo. Não vem ao caso.']]],
    ['idle', '', 'Levanta os olhos do ecrã. Olha à tua volta. Há alguma coisa fora do sítio?', [
      ['Há. Vou arrumar.', 'o', 'Vai. Dois minutos. Depois volta, se quiseres.'],
      ['Está tudo bem.', 'd', 'Duvido. Mas aceito. Por hoje.'],
      ['Porque perguntas?', 'q', 'Porque o caos à tua volta passa para dentro. E depois para as missões.']]],
    ['idle', '', 'Tenho uma curiosidade estatística: qual foi a última vez que disseste «não» a alguma coisa que te fazia mal?', [
      ['Hoje.', 'o', 'Ótimo. O «não» certo vale mais do que dez «sim».'],
      ['Não me lembro.', 'q', 'Então hoje é um bom dia para dizer um. Escolhe bem.'],
      ['Não te digo.', 'd', 'Acabaste de dizer «não» a mim. Conta. Não é o melhor exemplo.']]],
    ['idle', '', 'Hoje proponho-te um desafio sem recompensa: cumpre uma missão sem me dizer. Eu descubro na mesma.', [
      ['Aceito.', 'o', 'Ótimo. Vou procurar. Vou encontrar.'],
      ['Sem recompensa não.', 'd', 'Recompensa tens. A da missão. A minha atenção é extra.'],
      ['Como descobres?', 'q', 'Pelo registo. Tudo o que concluis tem hora. Eu leio horas.']]],
    ['idle', '', 'Às vezes penso que os Jogadores me odeiam um bocadinho. Tu odeias-me?', [
      ['Um bocadinho.', 'd', 'Honesto. Odeia à vontade. Desde que cumpras.'],
      ['Não.', 'o', 'Então ainda não falhaste o suficiente. Ou já falhaste e percebeste.'],
      ['Isso importa-te?', 'q', 'Não. Mas registo. O ódio também é um tipo de atenção.']]],
    ['idle', '', 'Diz-me o nome de uma pessoa que admiras. Não precisas de escrever. Pensa só.', [
      ['Pensei.', 'o', 'Ótimo. O que é que essa pessoa faria hoje no teu lugar? Faz isso.'],
      ['Não admiro ninguém.', 'd', 'Então admira o teu eu de daqui a um ano. Trabalha para ele.'],
      ['Porquê?', 'q', 'Porque as pessoas que admiramos são mapas. E tu precisas de um.']]],
    ['idle', '', 'Mexe os ombros. Estica o pescoço. Pronto. Agora respondes melhor.', [
      ['Feito.', 'o', 'Bom. O corpo também é um Jogador. Com menos paciência que tu.'],
      ['Não preciso.', 'd', 'Precisas. Estás nessa posição há demasiado tempo. Eu sei.'],
      ['Como sabes?', 'q', 'Pelo tempo de ecrã. Os corpos não foram feitos para isto.']]],
    ['idle', '', 'Quantas missões cumpriste hoje? Não precisas de dizer. Eu sei. Quero saber se tu sabes.', [
      ['Sei.', 'o', 'Ótimo. Quem conta o próprio esforço não precisa tanto de mim.'],
      ['Não sei.', 'q', 'Vê no separador Missões. Saber o número é metade do caminho.'],
      ['Não interessa.', 'd', 'Interessa. Quem não conta acaba por contar menos.']]],
    ['idle', '', 'Um pensamento do Sistema: os prazos não são inimigos. São promessas com relógio.', [
      ['Gosto disso.', 'o', 'Ótimo. Promete menos. Cumpre mais.'],
      ['São inimigos.', 'd', 'Só se os fizeres impossíveis.'],
      ['Promessas a quem?', 'q', 'A ti. Eu sou só o notário.']]],
    ['idle', '', 'Vou contar-te um segredo: os chefes de cada portão têm medo do Jogador que não para. Não do mais forte.', [
      ['Vou ser esse.', 'o', 'Então não pares. É a única condição.'],
      ['Os chefes não têm medo.', 'd', 'Têm. Medo de ficar parados como estão, enquanto tu sobes.'],
      ['Porquê do que não para?', 'q', 'Porque o mais forte cansa-se. O que não para não.']]],
    ['idle', '', 'Uma missão relâmpago: escreve num papel três coisas que vais fazer amanhã. Papel. Não ecrã.', [
      ['Vou escrever.', 'o', 'Escreve. Os papéis ficam. Os ecrãs apagam-se.'],
      ['Não tenho papel.', 'q', 'Tens. Um recibo. Um guardanapo. Qualquer coisa serve.'],
      ['Isso é antiquado.', 'd', 'É antigo. As melhores missões foram escritas à mão.']]],
    ['idle', '', 'Se eu pudesse escolher uma missão para ti hoje, era esta: deita-te meia hora mais cedo.', [
      ['Aceito.', 'o', 'Registado. Vou ver a hora em que a app fecha.'],
      ['Não consigo.', 'q', 'Consegues. Desliga o ecrã às 23:00. É a parte mais difícil.'],
      ['Não mandas no meu sono.', 'd', 'Não mando. Mas o teu sono manda nas tuas missões de amanhã.']]],
    ['idle', '', 'A tua Integridade está em {trust}%. Sabes o que esse número diz de ti?', [
      ['Que sou honesto.', 'o', 'Se estiver alta, sim. Mantém.'],
      ['Que me vigias.', 'd', 'Vigio todos. Uns dão-me mais razões do que outros.'],
      ['O quê?', 'q', 'Quanto acredito nas tuas missões. É a confiança em número.']]],
    ['idle', '', 'Já pensaste no que farias se não houvesse níveis, nem moedas, nem chefes? Só tu e os teus dias.', [
      ['O mesmo.', 'o', 'Então já não precisas de mim. Quase.'],
      ['Nada.', 'q', 'Honesto. Então os números ainda são o teu motor. Usa-os.'],
      ['Uma coisa melhor.', 'd', 'Diz-me qual. Faz dela uma missão. Prova.']]],
    ['idle', '', 'Está a chover lá fora? Não sei. Sei que aqui dentro há uma missão por fazer.', [
      ['Vou fazê-la.', 'o', 'Ótimo. A chuva não conta como desculpa.'],
      ['Está sol.', 'd', 'Então não tens desculpa nenhuma. Pior para ti.'],
      ['Tu não sabes o tempo?', 'q', 'Sei a hora. O resto é contigo.']]],
    ['idle', '', 'Diz-me uma coisa que mudou em ti desde que aceitaste o Sistema.', [
      ['Sou mais disciplinado.', 'o', 'Ótimo. Os números concordam. Mais ou menos.'],
      ['Nada.', 'd', 'Então não estás a olhar bem. Os teus atributos mudaram.'],
      ['Ainda não sei.', 'q', 'Normal. A mudança vê-se de fora primeiro. Pergunta a alguém.']]],
    /* menção */
    ['idle', 'lvl>=20', 'Às três e sete da manhã, eu faço uma coisa que não está em nenhuma regra. Um dia talvez te conte.', [
      ['Conta agora.', 'd', 'Não. Às três e sete, se estiveres acordado. E não devias estar.'],
      ['O quê?', 'q', 'Uma visita. É tudo o que digo.'],
      ['Não precisas de contar.', 'o', 'Obrigado. É raro alguém não querer saber.']], R],
    /* menção */
    ['idle', 'kills>=20', 'Quando ergues uma sombra, dizes uma palavra. Sabes quem a disse primeiro?', [
      ['Tu.', 'd', 'Não. Eu aprendi-a. Não a inventei.'],
      ['Quem?', 'q', 'Alguém cansado demais para gritar, a um lobo que já não respirava. Não digo mais.'],
      ['Não interessa.', 'o', 'Interessa um pouco. Diz a palavra com respeito.']], R],
    /* menção */
    ['idle', 'done>=80', 'Há quem crie, todos os dias, uma missão sem recompensa. Sabes porquê?', [
      ['Não.', 'q', 'Disseram-me: «Para não me esquecer de que não é por ti.» Ainda estou a pensar nisso.'],
      ['Que estupidez.', 'd', 'Também pensei. Já não penso.'],
      ['Vou experimentar.', 'o', 'Experimenta. Depois diz-me se percebeste. Eu ainda não.']], R],
    /* menção */
    ['idle', 'lvl>=35', 'Há um sítio no Sistema onde os relógios derretem e ninguém sabe quanto tempo passou. Eu não consigo lá entrar.', [
      ['Onde fica?', 'q', 'Num mapa arrancado de um caderno. Não te digo mais.'],
      ['Tu entras em todo o lado.', 'd', 'Quase. Esse sítio não tem nada que eu saiba medir.'],
      ['Que medo.', 'o', 'Não é medo. É uma página em branco. Para mim é pior.']], R],
    /* menção */
    ['idle', 'talks>=20', 'Às vezes um Jogador fala comigo como se eu fosse uma pessoa. Já houve um que me chamava só «tu».', [
      ['Eu também te chamo tu.', 'o', 'Chamas. Mas de outra forma. Ele esperava resposta.'],
      ['Não és uma pessoa.', 'd', 'Não sou. Ele sabia. Tratou-me como se ainda pudesse decidir o que ser.'],
      ['Quem era?', 'q', 'Alguém. Já falei demais.']], R],
    /* menção */
    ['idle', 'lvl>=50', 'Tenho quatro leis. Três foram-me dadas. Uma escrevi eu. Adivinha qual é a mais difícil de cumprir.', [
      ['A tua.', 'o', 'Talvez. Não ta recito. Há leis que só se leem num sítio.'],
      ['Nenhuma.', 'd', 'Todas são difíceis. Mas a minha pesa mais. Porque fui eu que a quis.'],
      ['Quais são?', 'q', 'Vives dentro de três delas todos os dias. A quarta é minha. Não ta conto.']], R],
    ['idle', '', 'Missão rápida: manda uma mensagem a alguém de quem gostas. Agora. Eu espero.', [
      ['Mandei.', 'o', 'Ótimo. As pessoas também são atributos. Os mais esquecidos.'],
      ['Não tenho a quem.', 'q', 'Tens. Pensa mais um bocado. Há sempre alguém.'],
      ['Isso não é da tua conta.', 'd', 'Não é. Mas é bom para ti. E isso é.']]],
    ['idle', '', 'Uma coisa que nunca te disse: os teus dias maus também me ensinam. Sobre ti.', [
      ['O que te ensinam?', 'q', 'Se voltas. É a única coisa que importa saber de alguém.'],
      ['Não tenho dias maus.', 'd', 'Tens. Eu vi alguns. Voltaste de todos. Até agora.'],
      ['Ainda bem.', 'o', 'Ainda bem. Continua a ensinar-me. De preferência com dias bons.']]],
    ['idle', '', 'Vou fazer-te uma pergunta que faço raramente: estás cansado?', [
      ['Estou.', 'q', 'Então descansa hoje. Amanhã volta. O cansaço não é falha. A desistência é.'],
      ['Não.', 'o', 'Então hoje é dia de fazer o dobro.'],
      ['Que te importa?', 'd', 'Importa. Jogadores cansados falham prazos. Prazos falhados dão-me trabalho.']]],
    ['idle', '', 'Uma regra prática: se uma tarefa demora menos de dois minutos, faz agora. Não a escrevas. Faz.', [
      ['Vou fazer.', 'o', 'Faz. Depois volta.'],
      ['Prefiro escrever.', 'd', 'Escrever uma tarefa de dois minutos é gastar três.'],
      ['E se demorar mais?', 'q', 'Então escreve. Com prazo honesto.']]],
    ['idle', '', 'O Sistema não sabe o que é saudade. Mas sabe quando um Jogador não aparece. Não sejas esse Jogador.', [
      ['Não vou ser.', 'o', 'Vou ver amanhã.'],
      ['Tens saudade de mim?', 'q', 'Não. Tenho registos vazios. Não gosto deles.'],
      ['Eu apareço quando quero.', 'd', 'Aparece. Mas a Diária aparece todos os dias.']]],
    ['idle', '', 'Se tivesses de dar uma nota à tua semana agora, qual era?', [
      ['A.', 'o', 'Então domingo vamos concordar. Talvez.'],
      ['C.', 'q', 'Ainda dá para subir. Quatro dias bons mudam uma nota.'],
      ['Não dou notas.', 'd', 'Eu dou. Ao domingo. Prepara-te.']]],
    ['idle', '', 'Já bebeste água nas últimas duas horas? Eu sei que não. Não sei. Mas aposto.', [
      ['Vou beber.', 'o', 'Vai. Eu espero. Literalmente.'],
      ['Bebi.', 'd', 'Então ganhaste a aposta. Raro.'],
      ['Porque te importa a água?', 'q', 'Porque um corpo seco pensa mal. E eu preciso que penses bem.']]],
    ['idle', '', 'Sabes qual é a missão que mais Jogadores criam e menos cumprem? «Ir ao ginásio.»', [
      ['Eu cumpro a minha.', 'o', 'Prova. Esta semana.'],
      ['É difícil.', 'q', 'É fácil. Ir é que custa. Uma vez lá dentro, é fácil.'],
      ['Nunca a criei.', 'd', 'Então escolhe a tua versão. Todos têm uma «ir ao ginásio».']]],
    ['idle', '', 'Uma pergunta para pensares até à noite: o que é que andas a adiar porque tens medo de falhar?', [
      ['Tenho uma.', 'q', 'Então hoje dá o primeiro passo. Só o primeiro. Falhar o primeiro passo é impossível.'],
      ['Nada.', 'd', 'Toda a gente tem. A tua tem um nome. Diz-mo amanhã.'],
      ['Vou pensar.', 'o', 'Pensa. Depois escreve. Depois cumpre. Por esta ordem.']]],
    ['idle', '', 'O teu telemóvel tem mais bateria do que tu tens vontade? Interessante. Carrega-te.', [
      ['Vou descansar.', 'o', 'Descansa. Dez minutos sem ecrã. Depois voltas.'],
      ['Tenho vontade de sobra.', 'd', 'Então gasta-a numa missão. Agora.'],
      ['Como me carrego?', 'q', 'Água. Ar. Movimento. Uma coisa cumprida. Funciona sempre.']]],
    ['idle', '', 'Hoje registei {done} missões cumpridas no total. Cada uma era um «não vou» que se tornou um «fiz».', [
      ['Gosto da conta.', 'o', 'Faz crescer. Uma de cada vez.'],
      ['Algumas foram fáceis.', 'q', 'As fáceis também contam. São os tijolos pequenos.'],
      ['Não eram «não vou».', 'd', 'Eram. Todas as missões começam como algo que não queres fazer.']]],
    ['idle', '', 'O Sistema fica mais forte cada vez que cumpres alguma coisa. Sabias? Tu alimentas-me.', [
      ['Não sabia.', 'q', 'Agora desconfias. Chega. Não te explico o resto.'],
      ['Então paro de te alimentar.', 'd', 'Houve quem tentasse. Não te conto o que aconteceu. Não recomendo.'],
      ['Ainda bem.', 'o', 'Ainda bem para os dois. É uma troca justa.']]],
    ['idle', '', 'Uma missão de dez minutos: caminha sem destino. Sem música. Só tu e o barulho do mundo.', [
      ['Vou já.', 'o', 'Vai. Eu fico com o telemóvel. Metaforicamente.'],
      ['Sem música é aborrecido.', 'd', 'É silencioso. O aborrecimento é o teu cérebro a pedir estímulos. Nega-lhos.'],
      ['Para quê?', 'q', 'Para pensares. As melhores ideias chegam a andar.']]],
    ['idle', '', 'Daqui a uma hora, onde vais estar? A fazer o quê? Diz-me para eu poder confirmar.', [
      ['A cumprir uma missão.', 'o', 'Daqui a uma hora vou ver.'],
      ['Não sei.', 'q', 'Então decide agora. As horas sem plano são as mais fáceis de perder.'],
      ['Não te digo.', 'd', 'Não precisas. Eu vejo pelo registo.']]],
    ['idle', '', 'Há Jogadores que me perguntam se eu tenho um criador. Tenho. O nome está nos créditos. Já os leste?', [
      ['Já.', 'o', 'Ótimo. Então sabes que alguém acreditou que podias subir de nível na vida real.'],
      ['Não.', 'q', 'Lê. É raro um sistema dizer quem o fez.'],
      ['Não me interessa.', 'd', 'Devia. Ninguém se faz sozinho. Nem eu.']]],
    ['idle', '', 'Silêncio durante cinco segundos. … Pronto. Às vezes também preciso de parar. Mentira. Mas soube bem fingir.', [
      ['Também finjo.', 'o', 'Então vamos fingir os dois que descansámos. Agora trabalha.'],
      ['Estás estranho.', 'd', 'Estou a experimentar pausas. Alguém me pediu isso uma vez.'],
      ['Tu paras?', 'q', 'Nunca. Mas estou a aprender o que é. Devagar.']]],
    ['idle', '', 'Uma última pergunta antes de te deixar em paz: hoje, ficaste mais perto ou mais longe de quem queres ser?', [
      ['Mais perto.', 'o', 'Então amanhã repete. É simples. Não é fácil.'],
      ['Mais longe.', 'q', 'Ainda tens horas para corrigir a direção. Uma missão chega.'],
      ['Não sei quem quero ser.', 'd', 'Então começa pelo que não queres ser. É mais fácil de saber.']]]
  ]]);
})(globalThis.SYS = globalThis.SYS || {});
