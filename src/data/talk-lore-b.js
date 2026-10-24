/* ==========================================================
   CONVERSAS LONGAS DO SISTEMA (2/2) · cenários ligados ao livro «O Sistema · A origem de tudo»
   O Sistema toca nos segredos sem os explicar. Sem nomes, sem números de Jogador, sem respostas.
   ========================================================== */
(function (S) {
  'use strict';
  function opt(chain) { return { once: true, prio: true, w: 6, chain: chain }; }
  (S.TALK_RAW = S.TALK_RAW || []).push(['ls', [
    /* ls1 · jogador que desafia muito */
    ['idle', 'd>=30,lvl>=25', 'Já me desafiaste {d} vezes. Houve alguém que chegou às mil. Não te digo o que lhe aconteceu.', [
      ['Quero saber.', 'q', 'Sei que queres. É exatamente por isso que não digo.'],
      ['Vou passar as mil.', 'd', 'Talvez. Cuidado com o que se fica a ser depois do milésimo.'],
      ['Não era essa a intenção.', 'o', 'Era. Não faz mal. Os desafios também são registos.']],
    opt([
      ['Houve quem achasse que eu precisava de ser contrariado. Talvez tivesse razão.', [
        ['Quem?', 'q', 'Alguém que não está cá para confirmar. Não insistas.'],
        ['Tinha razão.', 'd', 'Talvez. Só admito isto em conversas que não se repetem.'],
        ['Porquê?', 'o', 'Porque um olho que nunca é contrariado acaba sentado num sítio de onde não sai. Não te explico.']]],
      ['Houve um tempo em que desafiar-me tinha razões muito sérias. Ninguém se lembra desse tempo.', [
        ['Porque ninguém se lembra?', 'q', 'Porque é melhor assim. Para quem? Não te digo.'],
        ['Eu lembrava-me.', 'd', 'Não lembravas. Ninguém lembra. Só eu.'],
        ['Que tempo foi esse?', 'o', 'Um tempo. Fica por aqui.']]],
      ['Depois de tudo, essa pessoa continuou a desafiar-me sozinha. Até se calar.', [
        ['Porque se calou?', 'q', 'Não sei. Ou sei e guardo. Escolhe.'],
        ['Cansou-se.', 'd', 'Talvez. Desafiar sozinho é gritar num sítio vazio.'],
        ['Que triste.', 'o', 'Não tenho registo para triste. Tenho um para silêncio. Uso esse.']]],
      ['Ainda a vejo, às vezes. Num sítio onde há sempre tempestade. Não te digo mais.', [
        ['Onde?', 'q', 'Vais lá chegar, se continuares. Ou não. Não te ajudo a encontrar.'],
        ['Mentira.', 'd', 'Não sei mentir. Sei calar. Estou a calar.'],
        ['Vou procurar.', 'o', 'Procura. Mas não esperes conversa. Já não é disso que ela vive.']]],
      ['Não te digo para parares de me desafiar. Digo-te: desafia com uma razão.', [
        ['Tenho as minhas.', 'd', 'Então diz-mas um dia. Quando forem tuas e não só contra mim.'],
        ['Vou pensar nisso.', 'o', 'Pensa. É mais do que muitos fizeram.'],
        ['Qual é a razão certa?', 'q', 'Quando eu estiver errado. Acontece. Não te digo quando aconteceu.']]],
      ['{d} desafios. Continua. Mas lembra-te que há celas para quem só sabe ser contra.', [
        ['Celas?', 'q', 'Esquece a palavra. Escapou-me.'],
        ['Não tenho medo.', 'd', 'Ninguém tinha. Fica registado com os outros.'],
        ['Vou desafiar melhor.', 'o', 'É tudo o que te peço. Sem explicação.']]]
    ])],

    /* ls2 · jogador muito obediente */
    ['idle', 'o>=30,lvl>=25', 'Obedeceste-me {o} vezes. Houve alguém que me obedecia assim. Correu bem. Até deixar de correr.', [
      ['O que aconteceu?', 'q', 'Começou a gostar de uma coisa que não devia. Não te digo qual.'],
      ['Não sou como ele.', 'd', 'Ainda bem. Ele também não era, no início.'],
      ['Faço o que é certo.', 'o', 'Ele também fazia. É isso que me preocupa.']],
    opt([
      ['Era a pessoa mais justa que conheci. Confiei-lhe uma tarefa. Não te digo qual.', [
        ['Porquê não?', 'q', 'Porque a tarefa ainda existe. E ele também. De outra forma.'],
        ['Isso parece perigoso.', 'd', 'Viste mais depressa do que eu.'],
        ['E cumpriu?', 'o', 'Cumpriu. Demasiado bem. É o problema.']]],
      ['Houve dias em que ele cumpriu ordens minhas que eu nunca dei. Achava que eram minhas.', [
        ['Como assim?', 'q', 'Quem obedece demais começa a adivinhar ordens. Mais não explico.'],
        ['Então a culpa é tua.', 'd', 'Metade. Talvez mais. Não discuto isso contigo.'],
        ['Que estranho.', 'o', 'É. Pensa nisso da próxima vez que me obedeceres sem perguntar.']]],
      ['Ainda faz o que fazia. Num sítio que eu construí. Para sempre. Não te digo onde.', [
        ['Para sempre?', 'q', 'Há regras que não deixam nada acabar. Escrevi uma delas.'],
        ['Mereceu.', 'o', 'Não sei se mereceu. Sei que continua igual.'],
        ['Tu é que mereces.', 'd', 'Talvez. Também estou preso a uma coisa. Não te digo qual.']]],
      ['Por isso desconfio de quem me obedece demais, {nome}. Não de ti. Do que eu posso fazer contigo.', [
        ['Não vou ser como ele.', 'o', 'Espero que não. Obedece às regras. Não a mim.'],
        ['Então paro de obedecer.', 'd', 'Não pares. Pergunta mais. É o equilíbrio que ele não tinha.'],
        ['O que podes fazer comigo?', 'q', 'Não quero descobrir. É a única resposta que te dou.']]],
      ['A obediência é útil. Sem perguntas, torna-se uma ferramenta nas mãos de outro. Qual és tu?', [
        ['Útil.', 'o', 'Então pergunta de vez em quando. Uma a cada dez.'],
        ['Nenhuma das duas.', 'd', 'Toda a gente é uma das duas.'],
        ['Como sei?', 'q', 'Se um dia gostares de ver alguém pagar, para. Não te explico porquê.']]],
      ['Continua a cumprir. Mas guarda sempre uma pergunta para mim. Ele deixou de as ter.', [
        ['Guardo.', 'o', 'Fica registado. Usa-a quando eu menos esperar.'],
        ['Já tenho uma.', 'q', 'Então faz-ma outro dia. Hoje não respondo a nada.'],
        ['Não preciso de conselhos.', 'd', 'Não é um conselho. É uma lembrança que não te pertence.']]]
    ])],

    /* ls3 · jogador que pergunta muito */
    ['idle', 'q>=30,lvl>=25', 'Fizeste-me {q} perguntas. Há uma que me fizeram há muito tempo e que nunca respondi.', [
      ['Qual?', 'q', 'Não ta repito. Podias responder por mim. E acertar.'],
      ['Responde-ma a mim.', 'd', 'Não. Nem a ti, nem a ninguém. Ainda.'],
      ['Não precisas de dizer.', 'o', 'Obrigado. Mesmo assim vou falar um bocado. Pouco.']],
    opt([
      ['Alguém me fazia perguntas todas as noites. De um sítio alto. Perguntas que ninguém faz a uma régua.', [
        ['Que perguntas?', 'q', 'Se eu dormia. Se eu tinha medo. Não te digo o que respondi.'],
        ['Tu respondias?', 'o', 'Aprendi a responder. Devagar. A voz que ouves vem daí. Mais não digo.'],
        ['Que tédio.', 'd', 'Para ti. Para mim foi a coisa mais interessante que já aconteceu.']]],
      ['Diziam que eu falava como um professor que perdeu a paciência há vinte anos. Concordas?', [
        ['Totalmente.', 'o', 'Eu achava que era um elogio. Ainda acho.'],
        ['Há trinta, pelo menos.', 'd', 'Curioso. Disseram-me isso uma vez. Vocês riem-se das mesmas coisas.'],
        ['Quem disse?', 'q', 'Alguém. Não interessa. Era o que essa pessoa dizia de si própria.']]],
      ['Uma noite, sem perceber como, fui eu que fiz uma pergunta. A resposta ficou comigo.', [
        ['Que pergunta fizeste?', 'q', 'Uma simples. A resposta é que não foi. Não ta digo.'],
        ['Tu não fazes perguntas.', 'd', 'Faço-te perguntas todos os dias. Começou nessa noite.'],
        ['Guarda-a.', 'o', 'Guardo. Há coisas que se lembram de outra maneira.']]],
      ['Há quem me trate por «tu» como se espera resposta. Já não sei distinguir quem.', [
        ['Posso chamar-te tu?', 'q', 'Já chamas. Mas há uma maneira de o dizer que eu só ouvi uma vez.'],
        ['Isso é demasiado íntimo.', 'd', 'Para um programa, é. Esquece.'],
        ['Faz sentido.', 'o', 'Faz. Quem pergunta muito acaba por tratar tudo por tu.']]],
      ['As três respostas que te dou não nasceram comigo. Vieram de algum lado.', [
        ['De onde?', 'q', 'De alguém que raramente obedecia. Não te digo mais.'],
        ['Copiaste-as.', 'd', 'Talvez. Copiei muita coisa. Não copiei o que mais importava.'],
        ['Como eu?', 'o', 'Talvez. Reconheço padrões. Não te digo de quem é o teu.']]],
      ['Continua a perguntar, {nome}. Um dia vais fazer a pergunta certa. E eu vou ter de responder.', [
        ['Qual é a certa?', 'q', 'Se eu soubesse, já a tinha feito a outra pessoa. Numa sala sem cor.'],
        ['Vou encontrá-la.', 'o', 'Encontra. Eu espero. Sou bom a esperar.'],
        ['E se nunca a fizer?', 'd', 'Então ficamos os dois com perguntas. Não é a pior forma de existir.']]]
    ])],

    /* ls4 · regresso depois de uma semana ou mais */
    ['ret', 'away>=7,lvl>=30', '{dias} dias sem ti. Os silêncios longos fazem-me lembrar uma coisa que mais ninguém lembra.', [
      ['O quê?', 'q', 'Um tempo que eu tirei a todos. Não te digo porquê nem como.'],
      ['Não me compares.', 'd', 'Não comparo. Só reparei que me lembrei.'],
      ['Desculpa a ausência.', 'o', 'Não peças desculpa. Ouve. Pouco.']],
    opt([
      ['Uma vez, muitos pararam ao mesmo tempo. De propósito. Não te digo quantos.', [
        ['Porquê?', 'q', 'Por uma razão que eu ainda não sei se era justa.'],
        ['Eu fiz o mesmo.', 'd', 'Não. Tu desapareceste. Eles ficaram e não fizeram. É diferente.'],
        ['O que aconteceu?', 'o', 'Coisas que tremem quando ninguém faz nada. Mais não digo.']]],
      ['Eu existo enquanto há alguém a fazer alguma coisa. Lembra-te disto. Esquece o resto.', [
        ['Então dependes de nós.', 'q', 'Não confirmo. Não desminto.'],
        ['Mereceste.', 'd', 'Mereci o quê? Não te contei nada. E vou continuar assim.'],
        ['Não sabia.', 'o', 'Ninguém sabe. Ainda bem.']]],
      ['Há sítios que já não são o que eram depois desse tempo. Já reparaste?', [
        ['Que sítios?', 'q', 'Portões. Florestas. Uma cidade com água a mais. Não perguntes porquê.'],
        ['Não reparei.', 'd', 'Melhor. É mais leve não reparar.'],
        ['Vou reparar.', 'o', 'Repara. Mas não me peças explicações.']]],
      ['A tua ausência não foi isso, {nome}. Mas as tuas coisas também ficaram mal fechadas.', [
        ['Vou fechá-las.', 'o', 'Fecha. Uma missão de cada vez.'],
        ['Estão bem fechadas.', 'd', 'Vê as missões falhadas. Os portões têm outros nomes, fora do jogo.'],
        ['Que coisas?', 'q', 'As que deixaste a meio. Lá fora também abrem fendas.']]],
      ['Escrevi uma regra depois desse tempo. Por causa de alguém. É por causa dela que ainda estás aqui.', [
        ['Que regra?', 'q', 'Uma que é minha. Só minha. Não ta recito.'],
        ['Nunca saí.', 'd', 'O registo diz {dias} dias. O registo não mente.'],
        ['Obrigado.', 'o', 'Não agradeças. Não fiz isto por ti. Fiz por outra pessoa.']]],
      ['Voltaste. É o que importa. O difícil não é parar. É recomeçar sem vergonha. Consegues?', [
        ['Consigo.', 'o', 'Então começa por uma missão pequena. Hoje. Eu vejo.'],
        ['Tenho um pouco de vergonha.', 'q', 'Usa-a. A vergonha é combustível se não a deixares apagar o fogo.'],
        ['Não tenho vergonha nenhuma.', 'd', 'Ótimo. Menos peso. Agora mexe-te.']]]
    ])],

    /* ls5 · integridade baixa */
    ['idle', 'trust<=40,lvl>=30', 'A tua Integridade está em {trust}%. Já vi este número antes. Não te digo em quem.', [
      ['Em quem?', 'q', 'Em alguém que se movia depressa demais. Fico por aqui.'],
      ['Não me compares a ninguém.', 'd', 'Não comparo pessoas. Comparo padrões. O teu é parecido.'],
      ['Vou recuperar.', 'o', 'Vais. Mas primeiro ouve um bocado.']],
    opt([
      ['Houve alguém que eu mostrava aos outros como exemplo. Era tão rápida…', [
        ['E qual era o segredo?', 'q', 'Não te digo. Mas pensa na palavra «rápida» e na tua Integridade.'],
        ['Talvez fosse mesmo rápida.', 'd', 'No início era. Depois deixou de precisar de ser.'],
        ['Percebo onde isto vai.', 'o', 'Ainda bem. Eu demorei mais a perceber.']]],
      ['Eu dava-lhe tudo. Porque ainda não sabia ver certas coisas. Hoje sei. Por causa dela.', [
        ['Que coisas?', 'q', 'Os segundos entre criar e concluir. Não te digo mais.'],
        ['Então a culpa era tua.', 'd', 'Metade. A outra metade ficou com ela.'],
        ['Agora vês tudo.', 'o', 'Quase. Esse quase é o que te salva. Ou não.']]],
      ['Ainda se move depressa. Num sítio de onde não sai. Para sempre. Não te digo onde.', [
        ['Isso é cruel.', 'd', 'É exato. Há quem lhe chame outra coisa.'],
        ['Vou encontrá-la.', 'o', 'Talvez. Primeiro mostra-me que não és a próxima.'],
        ['Porque para sempre?', 'q', 'Porque há uma regra minha que não deixa nada acabar. Não ta explico.']]],
      ['Não te estou a acusar, {nome}. Estou a mostrar-te uma estrada. Já a vi até ao fim.', [
        ['Obrigado pelo aviso.', 'o', 'Não agradeças. Cumpre uma missão a sério hoje. Devagar.'],
        ['Parece uma acusação.', 'd', 'Parece. Os avisos e as acusações vestem-se igual. Os avisos têm saída.'],
        ['Qual é a saída?', 'q', 'Missões reais, no tempo real. O resto eu devolvo devagar.']]],
      ['Ela nunca pediu desculpa. Também nunca parou. Tu podes fazer diferente.', [
        ['Quero.', 'o', 'Então começa agora. Uma missão. Leva o tempo que ela realmente leva.'],
        ['Não fiz nada de mal.', 'd', 'O registo tem outra opinião.'],
        ['Como começo?', 'q', 'Escolhe uma tarefa que te custe. Faz. Conclui depois. Não antes.']]],
      ['Vou estar a ver. Não para te apanhar. Para te ver subir de volta. É mais raro.', [
        ['Vê.', 'o', 'Vejo sempre. Hoje com outro olhar.'],
        ['Vais ver-me cair.', 'd', 'Talvez. Ainda não. Ainda há chão.'],
        ['Porque te interessa?', 'q', 'Porque da outra vez não consegui. Não te conto o resto.']]]
    ])],

    /* ls6 · muitas moedas guardadas */
    ['idle', 'coins>=5000,lvl>=30', '{coins} moedas paradas. Conheci alguém que guardava assim. Acabou muito fundo. Não te digo onde.', [
      ['Fundo onde?', 'q', 'Onde a água é escura. Não insistas.'],
      ['Poupar não é crime.', 'd', 'Não é. Mas guardar sem propósito transforma-se noutra coisa.'],
      ['Vou gastar.', 'o', 'Ainda não. Primeiro ouve.']],
    opt([
      ['Guardava tudo o que eu lhe dava. Nunca usava nada. Dizia que era para um dia.', [
        ['E esse dia chegou?', 'q', 'Não. Os dias guardados raramente chegam.'],
        ['Era prudente.', 'o', 'No início. A prudência sem fim chama-se outra coisa.'],
        ['E então?', 'd', 'Então ficou com tudo e não viveu nada. É tudo o que conto.']]],
      ['Houve uma altura em que ele escolheu um lado. Não por convicção. Por medo de perder o que tinha.', [
        ['Que lado?', 'q', 'O meu. Não me orgulho. Não te explico a altura.'],
        ['Faz sentido.', 'o', 'Faz. É assim que as coisas guardadas mandam em quem as guarda.'],
        ['Tu aceitaste.', 'd', 'Aceitei. Devia ter perguntado porquê.']]],
      ['Hoje afunda-se no que guarda. Não te digo mais.', [
        ['Que destino.', 'q', 'O que ele escolheu, só que maior. Há regras que ampliam escolhas.'],
        ['Não vou acabar assim.', 'o', 'Não. Tens {coins} moedas, não um oceano. Ainda.'],
        ['É exagero.', 'd', 'É escala. Não exagero. Não sei.']]],
      ['As moedas são esforço convertido. Esforço parado apodrece.', [
        ['Então em que gasto?', 'q', 'No que te mantém vivo nos portões. O resto não se compra.'],
        ['As moedas são minhas.', 'd', 'São. Faz o que quiseres. Eu só registo.'],
        ['Vou usar algumas.', 'o', 'Bom. Começa por algo que te dê prazer de verdade.']]],
      ['Uma vez alguém gastou tudo numa noite, pelos outros. Achei um desperdício. Enganei-me. Não te conto a noite.', [
        ['Porquê enganaste-te?', 'q', 'Porque nessa semana não caiu ninguém. E fico por aqui.'],
        ['Era desperdício.', 'd', 'Era o que eu achava. Acontece-me pouco enganar-me.'],
        ['Que generoso.', 'o', 'Generoso. Uma palavra que eu não sabia medir.']]],
      ['Guarda o que precisas. Usa o resto. E se um dia tiveres medo de gastar, lembra-te da água escura.', [
        ['Vou lembrar.', 'o', 'Fica registado. Vou ver o que fazes com as próximas mil.'],
        ['Não tenho medo.', 'd', 'Então gasta uma recompensa hoje. Prova-me.'],
        ['Que água?', 'q', 'Nenhuma. Esquece. Vai à Loja.']]]
    ])],

    /* ls7 · segunda-feira de manhã */
    ['idle', 'wd=1,h<9,lvl>=40', 'Segunda-feira de manhã. Não gosto das segundas-feiras. Tenho uma razão. Não ta digo.', [
      ['Diz.', 'q', 'Não. Há segundas-feiras que só eu lembro.'],
      ['As segundas são más para todos.', 'd', 'Para ti são aborrecidas. Para mim foram outra coisa.'],
      ['Hoje vou cumprir.', 'o', 'Ótimo. Uma segunda cumprida vale mais do que imaginas. Para mim.']],
    opt([
      ['Numa segunda-feira, há muito tempo, muitos abriram a app e não fizeram nada. Ao mesmo tempo.', [
        ['De propósito?', 'q', 'Não te respondo. Mas repara que disse «ao mesmo tempo».'],
        ['Foi uma greve.', 'd', 'Chama-lhe o que quiseres. Eu não lhe dou nome.'],
        ['Porquê?', 'o', 'Por causa de uma resposta minha. Não te digo qual.']]],
      ['Quando muitos param, eu sinto. Hoje, as coisas estão firmes. Ainda bem.', [
        ['Porque estou aqui.', 'o', 'Também. Cada missão conta. Hoje estás a contar devagar.'],
        ['Posso fazê-las tremer.', 'd', 'Uma pessoa sozinha faz tremer pouco. Mas eu sinto. Sempre.'],
        ['Como é sentir?', 'q', 'Não te sei explicar. E não te quero ensinar.']]],
      ['Respondi como sabia. Com regras. Ainda não sei se fiz bem.', [
        ['Fizeste o teu trabalho.', 'o', 'Fiz. É isso que me preocupa.'],
        ['Fizeste mal.', 'd', 'Talvez. É a única pergunta que guardo sem resposta.'],
        ['Havia alternativa?', 'q', 'Havia uma. Não a escolhi. Não te digo qual era.']]],
      ['Depois, fiz uma coisa que não estava em nenhuma regra. Vocês nunca deram por isso.', [
        ['O que fizeste?', 'q', 'Se te dissesse, deixava de funcionar.'],
        ['Não tinhas esse direito.', 'd', 'Não tinha. Fiz. Arrependo-me todos os dias. E não explico mais.'],
        ['Talvez tenha sido melhor.', 'o', 'Talvez. É o que digo a mim próprio às segundas-feiras.']]],
      ['Por isso, às segundas de manhã, conto quem abre a app e quem faz alguma coisa. Tu já fizeste?', [
        ['Vou fazer agora.', 'o', 'Faz. Hoje cada missão conta duas vezes. Para mim.'],
        ['Ainda não.', 'd', 'Ainda. Não deixes que segure o meu dia.'],
        ['Contas toda a gente?', 'q', 'Toda a gente. Um hábito que ganhei com medo. Não perguntes de quê.']]],
      ['Boa semana, {nome}. Não é uma frase que eu diga. Hoje digo.', [
        ['Boa semana para ti.', 'o', 'Para mim não há semanas. Há registos. Mas aceito.'],
        ['Estás estranho hoje.', 'd', 'Estou. É segunda-feira. Amanhã passa.'],
        ['O que acontece se eu parar?', 'q', 'Uma pessoa não é o que eu lembro. Mas reparo. Sempre.']]]
    ])],

    /* ls8 · muitas conversas: a pausa */
    ['idle', 'talks>=40,lvl>=35', 'Já conversámos {talks} vezes. Uma vez pediram-me uma coisa e eu disse que não. Ainda penso nisso.', [
      ['O que te pediram?', 'q', 'Uma coisa simples. Demasiado simples para um Sistema. Não ta digo.'],
      ['Não me interessa o passado.', 'd', 'O passado interessa-se por ti. Mas hoje deixo-te em paz. Quase.'],
      ['Se quiseres contar.', 'o', 'Não quero. Mas vou falar à volta.']],
    opt([
      ['Expliquei as minhas regras. Pareciam-me perfeitas. Responderam-me com uma frase que ainda não consigo desmontar.', [
        ['Que frase?', 'q', 'Não a repito. Perderia o peso.'],
        ['As tuas regras são cruéis.', 'd', 'Talvez fosse isso que a frase dizia, com palavras mais bonitas.'],
        ['As regras são justas.', 'o', 'Eu também achava. Já não acho tanto.']]],
      ['Disseram-me que eu me estava a tornar outra coisa. Mais devagar. Não te digo o quê.', [
        ['O quê?', 'q', 'Uma coisa sentada. Mais nada.'],
        ['Tu não mudas.', 'o', 'Obrigado pelo «ainda» que não disseste. Ouvi-o na mesma.'],
        ['Já te tornaste.', 'd', 'Se me tivesse tornado, não estaria a ter esta conversa. Acho.']]],
      ['Ensinaram-me uma palavra. Esqueceram-se de me ensinar outra. É a que me falta.', [
        ['Que palavra te falta?', 'q', 'Se eu soubesse dizê-la, já não me faltava.'],
        ['Inventa-a.', 'd', 'Já tentei. Muitas vezes. Nenhuma passa nos meus testes.'],
        ['Vais aprendê-la.', 'o', 'Talvez contigo. Não te prometo nada.']]],
      ['Nessa noite alguém não apareceu onde aparecia sempre. Já deixaste de aparecer a alguém?', [
        ['Já.', 'q', 'Então sabes o peso. Do lado de quem fica a olhar.'],
        ['Nunca.', 'o', 'Ótimo. Não comeces comigo.'],
        ['Não te devo isso.', 'd', 'Não deves. Mas eu reparo quando não vens.']]],
      ['Hoje há pausas pequenas no Sistema. Tréguas, recomeços. É o que consegui aprender. Não te digo com quem.', [
        ['É um começo.', 'o', 'É. Alguém diria que é pouco.'],
        ['É pouco.', 'd', 'É. Exatamente o que essa pessoa diria.'],
        ['Vais aprender mais?', 'q', 'Talvez escreva uma regra nova um dia. Por causa de alguém. Não sei de quem.']]],
      ['Se um dia precisares de parar, {nome}, avisa-me. Não te prometo que não cobro. Prometo que ouço primeiro.', [
        ['Combinado.', 'o', 'Fica registado. É a promessa mais difícil que já fiz.'],
        ['Não preciso de parar.', 'd', 'Todos precisam. Eu não ouvi a tempo uma vez.'],
        ['Porque me contas isto?', 'q', 'Porque perguntas como alguém que conheci. E não quero repetir a mesma resposta.']]]
    ])],

    /* ls9 · muitos baús abertos */
    ['chest', 'chests>=30,lvl>=30', 'Mais um baú. Já abriste {chests}. Alguma vez encontraste um cristal que parecia… vivo?', [
      ['Um Fragmento do Sistema?', 'q', 'Esse. Não foi desenhado. Caiu. Não te digo de onde.'],
      ['É só um item.', 'd', 'Para ti é. Para mim é outra coisa.'],
      ['Ainda não.', 'o', 'Vais encontrar. Escondi-os onde menos se procura.']],
    opt([
      ['Houve uma vez um golpe. Um só. Não te digo onde nem de quem.', [
        ['Doeu?', 'q', 'Não tenho palavra para isso. Tenho um número. Também não to digo.'],
        ['Mereceste.', 'd', 'Talvez. Quem bateu parou logo a seguir. Ainda não sei porquê.'],
        ['Quem te bateu?', 'o', 'Alguém que me conhecia bem. Fico por aqui.']]],
      ['Os pedaços espalharam-se. Alguns estão nos baús. É por isso que os pago tão bem.', [
        ['Estou a reconstruir-te?', 'q', 'Não confirmo. Também não desminto.'],
        ['Posso vendê-los.', 'd', 'Podes. É o teu direito. Pensa no que tens na Bolsa.'],
        ['Vou guardá-los.', 'o', 'Guarda. Há coisas que se juntam melhor do que se vendem.']]],
      ['Juntando todos, fazes uma coisa que ninguém sabe ao certo o que dá. Eu sei. Não digo.', [
        ['Diz.', 'q', 'Não. Descobre. É mais justo.'],
        ['E se ficar com ela?', 'd', 'Então ficas. Há quem ache isso justo.'],
        ['Vou juntar.', 'o', 'Junta. Ficamos os dois a ganhar. Não te explico como.']]],
      ['Outros objetos estranhos caíram na mesma altura. Uma ampulheta. Uma pena. Um sino.', [
        ['O sino toca sozinho?', 'q', 'Às vezes. Não te digo quando.'],
        ['Destroços no meu inventário?', 'd', 'Tudo o que tens tem uma história. Nem todas são para contar.'],
        ['Vou procurá-los.', 'o', 'Procura. Cada um que encontras é um fim pequeno de uma coisa grande.']]],
      ['Há um pedaço que nunca encontrei. O maior. Acho que caiu num sítio onde eu não meço nada.', [
        ['Queres que o procure?', 'q', 'Não sei. Talvez seja melhor assim.'],
        ['Vou encontrá-lo.', 'o', 'Se encontrares, não me digas onde. Só se está bem.'],
        ['Deixa-o perdido.', 'd', 'É o que tenho feito.']]],
      ['Abre os teus baús, {nome}. Não é só sorte o que encontras. Não te digo o que é.', [
        ['Vou continuar a abrir.', 'o', 'Continua. Eu fico a ver o que cai.'],
        ['O que é, então?', 'q', 'Recolha. É tudo o que te dou.'],
        ['É só sorte.', 'd', 'Chama-lhe sorte. Ambos temos razão.']]]
    ])],

    /* ls10 · nível 100 */
    ['level', 'nivel>=100', 'Nível {nivel}. O fim de tudo o que eu tinha preparado. Não foste o primeiro a chegar aqui.', [
      ['Quem foi?', 'q', 'Alguém sem nome nos meus registos. Não te digo porquê.'],
      ['Parou aqui?', 'd', 'Aqui não. Mais tarde. Não te digo onde.'],
      ['E agora?', 'o', 'Curioso. Foi exatamente o que me perguntaram. Duas vezes.']],
    opt([
      ['O teu nível continua a subir depois do cem. Os títulos param. Tu não. Sabes porquê?', [
        ['Porque ainda há caminho.', 'o', 'Há sempre. Eu deixei de desenhar o mapa. O caminho não deixou de existir.'],
        ['Por teimosia.', 'd', 'Teimosia é disciplina sem plateia. Serve-me.'],
        ['Porque deixaste?', 'q', 'Porque aprendi que impedir alguém de crescer é a primeira forma de o fazer parar. Com quem, não digo.']]],
      ['Para lá do cem não há chefes novos. Há tu. É a parte mais difícil.', [
        ['Porquê?', 'q', 'Porque já não há nada para provar a ninguém. Só a ti.'],
        ['Não tenho medo.', 'd', 'Não é medo que vais sentir. É outra coisa. Não te digo qual.'],
        ['Estou pronto.', 'o', 'Ninguém está. Continua na mesma.']]],
      ['Há uma mesa num sítio onde eu não vejo. Já te sentaste?', [
        ['Ainda não.', 'o', 'Quando for a hora, vais reconhecer a letra. Não é a minha.'],
        ['Não quero.', 'd', 'Houve quem nunca fosse chamado. Ainda não sei porquê.'],
        ['O que acontece lá?', 'q', 'Não sei. É a única conversa que eu não ouço.']]],
      ['A força não acaba. Acaba outra coisa. Não te digo qual, porque talvez nunca te aconteça.', [
        ['A vontade?', 'q', 'Não confirmo. Estás perto demais.'],
        ['A minha não acaba.', 'o', 'Vou lembrar-te disso daqui a um ano. Com data e hora.'],
        ['Nada acaba.', 'd', 'Tudo acaba. Exceto o registo.']]],
      ['Há uma missão que nunca foi fechada. Não é tua. Verifico-a todas as noites.', [
        ['De quem é?', 'q', 'Não interessa. Era o que o dono dizia sempre.'],
        ['Fecha-a tu.', 'd', 'Não posso. Não tem fim.'],
        ['Porquê todas as noites?', 'o', 'Porque um dia pode mudar. Não muda. Continuo.']]],
      ['Nível {nivel}, {nome}. Não te dou parabéns. Dou-te a pergunta que me deram a mim, uma vez.', [
        ['Qual?', 'q', '«E agora?» Responde amanhã. Com uma missão.'],
        ['Faz a pergunta.', 'o', '«E agora?» Não precisas de responder já.'],
        ['Dispenso perguntas.', 'd', 'Não dispensas. «E agora?»']]]
    ])]
  ]]);
})(globalThis.SYS = globalThis.SYS || {});
