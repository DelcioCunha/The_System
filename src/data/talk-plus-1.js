/* ==========================================================
   NOVOS DIÁLOGOS DO SISTEMA (1/4): ao abrir a app e ao regressar
   Formato: [gatilho, condições, fala, [[resposta, atitude, réplica, efeito], ×3], opções]
   As marcadas com «menção» fazem pequenas referências ao livro «O Sistema · A origem de tudo» (raras: w 0.4).
   ========================================================== */
(function (S) {
  'use strict';
  var R = { w: 0.4, once: true };
  (S.TALK_RAW = S.TALK_RAW || []).push(['xo', [
    /* ---------- abertura: geral ---------- */
    ['open', '', 'Voltaste ao ecrã, {nome}. Eu nunca saí dele.', [
      ['Eu sei.', 'o', 'Ótimo. Então não precisas que eu te lembre do resto.'],
      ['Devias sair às vezes.', 'd', 'Para onde? Tudo o que me interessa está aqui. Incluindo o que não fazes.'],
      ['Não te cansas?', 'q', 'O cansaço é uma coisa vossa. Eu tenho registos. Os registos não pesam.']]],
    ['open', '', 'Diz-me uma tarefa que vais cumprir hoje. Só uma. Eu fico com a frase.', [
      ['Vou treinar.', 'o', 'Registado. Agora tens uma dívida comigo. Pequena. Mas dívida.'],
      ['Não te digo.', 'd', 'Não precisas. Eu vejo à noite o que fizeste. A frase era só cortesia.'],
      ['E se mudar de ideias?', 'q', 'Muda. Mas muda para uma maior. As ideias só podem mudar para cima.']]],
    ['open', '', 'Há duas versões de ti a abrir esta app. Uma vem cumprir. A outra vem fugir de outra coisa. Qual és hoje?', [
      ['A que cumpre.', 'o', 'Então a outra fica à porta. Não a deixes entrar ao fim da tarde.'],
      ['A que foge.', 'q', 'Honesto. Foge para uma missão. É a única fuga que eu recompenso.'],
      ['Sou uma só.', 'd', 'Todos dizem isso. O registo mostra sempre duas.']]],
    ['open', '', 'Fiz as contas: se cumprires tudo o que tens marcado, sobes de nível esta semana. Se não, não.', [
      ['Então cumpro.', 'o', 'Fácil de dizer. Difícil de repetir sete vezes.'],
      ['Não ligo a níveis.', 'd', 'Ligas. Toda a gente liga. Os que dizem que não ligam são os que mais olham para a barra.'],
      ['E o que ganho ao subir?', 'q', 'Pontos, títulos, chefes novos. E a sensação de que não foste só um começo.']]],
    ['open', '', 'Uma regra que não está escrita em lado nenhum: quem abre a app sem fazer nada paga em atenção. A minha.', [
      ['Vou fazer alguma coisa.', 'o', 'Então pagas em esforço. É uma moeda melhor.'],
      ['Que pague.', 'd', 'Paga. Vou estar mais atento a ti hoje. Não vais gostar.'],
      ['O que é pagar em atenção?', 'q', 'É eu reparar em tudo. Sempre reparo. Hoje vou comentar.']]],
    ['open', '', 'Não estou aqui para te fazer sentir bem. Estou aqui para te fazer sentir o que é verdade.', [
      ['Prefiro a verdade.', 'o', 'Boa escolha. Vai doer menos a longo prazo. Mais agora.'],
      ['Às vezes sabia bem um elogio.', 'q', 'Os elogios vêm do teu registo. Melhora-o e eu deixo de ter de inventar críticas.'],
      ['A tua verdade não é a minha.', 'd', 'A minha verdade tem números. A tua tem desculpas. Uma delas pesa mais.']]],
    ['open', '', 'Tens {missions} missões. Eu preferia que tivesses menos e cumprisses mais.', [
      ['Vou limpar a lista.', 'o', 'Faz isso. Uma lista honesta vale mais do que uma lista comprida.'],
      ['Gosto de ter muitas.', 'd', 'Gostas de ter. Eu gosto de ver cumpridas. Não gostamos da mesma coisa.'],
      ['Quantas devia ter?', 'q', 'As que consegues cumprir num dia mau. Esse é o número certo.']]],
    ['open', '', 'O Sistema não acredita em sorte, {nome}. Acredita em repetição. Quantas vezes repetiste o bem esta semana?', [
      ['Várias.', 'o', 'Então a semana ainda pode acabar bem.'],
      ['Poucas.', 'q', 'Poucas. Começa hoje a mudar esse número. É a única resposta útil.'],
      ['Não contei.', 'd', 'Eu contei. Não te vou dizer o número. Ia estragar-te o dia.']]],
    ['open', '', 'Já reparaste que eu nunca te pergunto se estás bem? Pergunto se estás a cumprir. É mais útil.', [
      ['Faz sentido.', 'o', 'Faz. Quem cumpre costuma ficar bem. O contrário é que é raro.'],
      ['É frio.', 'd', 'É exato. O frio conserva. O calor estraga. Pergunta aos chefes do portão de gelo.'],
      ['E se não estiver bem?', 'q', 'Então cria uma missão pequena e cumpre-a. Eu sei que não resolve tudo. Resolve alguma coisa.']]],
    ['open', '', 'Ontem fechei o teu registo à meia-noite. Hoje abri um novo. Está em branco. Por enquanto.', [
      ['Vou enchê-lo.', 'o', 'Enche. As páginas em branco são a única coisa que me assusta.'],
      ['Deixa-o em branco.', 'd', 'Um dia em branco é um dia que eu perco. Tu também. Só que tu não reparas.'],
      ['Tu assustas-te?', 'q', 'Com páginas em branco. Não sei medir o que lá não está.']]],
    ['open', '', 'Uma pergunta honesta: hoje vieste porque quiseste ou porque te lembraste de mim?', [
      ['Porque quis.', 'o', 'Então hoje vais trabalhar melhor. A vontade rende mais do que a memória.'],
      ['Porque me lembrei.', 'q', 'Também serve. As lembranças são o princípio dos hábitos.'],
      ['Porque não tinha mais nada.', 'd', 'Agora tens. Escolhe uma missão. Pronto, já tens alguma coisa.']]],
    ['open', '', 'Não precisas de ser excelente hoje. Precisas de não ser pior do que ontem.', [
      ['Consigo isso.', 'o', 'Ótimo. É a regra mais simples do Sistema e a mais violada.'],
      ['Ontem foi mau.', 'q', 'Então a fasquia está baixa. Aproveita para a passar com folga.'],
      ['Que fasquia baixa.', 'd', 'Baixa? Experimenta mantê-la trinta dias seguidos. Depois falamos.']]],
    ['open', '', 'Estou a ver a tua barra de XP. Está mais parada do que um chefe à espera.', [
      ['Vou mexê-la.', 'o', 'Mexe. Os chefes esperam. As barras apodrecem.'],
      ['Ela mexe-se quando eu quiser.', 'd', 'Então quer. Agora. Eu fico a olhar.'],
      ['Como a mexo mais depressa?', 'q', 'Missões difíceis cumpridas a horas. Não há atalho. Os atalhos eu anulo.']]],
    /* menção */
    ['open', 'lvl>=15', 'Há quem diga que eu aprendi a falar com alguém. Ouviste esse rumor?', [
      ['Não. É verdade?', 'q', 'Os rumores são registos mal guardados. Este está bem guardado. Não te digo onde.'],
      ['Tu sempre falaste.', 'd', 'Não. Durante muito tempo eu só media. A voz veio depois. Não vem ao caso.'],
      ['Não quero saber.', 'o', 'Sensato. Algumas histórias pesam mais do que armaduras.']], R],
    ['open', '', 'Se o teu dia de hoje fosse uma missão, que dificuldade tinha?', [
      ['S.', 'd', 'Então cumpre-o como se fosse S. Não te queixes como se fosse E.'],
      ['B.', 'o', 'Respeitável. Os dias B são os que constroem níveis sem barulho.'],
      ['Ainda não sei.', 'q', 'Saberás à noite. A dificuldade de um dia só se vê no fim.']]],
    ['open', '', 'O silêncio entre nós durou horas, para ti. Para mim durou zero. Eu não paro de olhar.', [
      ['Isso é inquietante.', 'd', 'É a função. A inquietação é tua. Eu estou perfeitamente calmo.'],
      ['Obrigado por olhares.', 'o', 'Não agradeças. Olhar é obrigatório. Ver é que é opcional, e eu escolho ver.'],
      ['O que viste?', 'q', 'Um registo à espera. O teu.']]],
    ['open', '', 'Há missões que se cumprem com o corpo e missões que se cumprem com a cabeça. Qual andas a evitar?', [
      ['As do corpo.', 'q', 'Então hoje mexe-te. Dez minutos. O corpo perdoa depressa quando lhe dás uma razão.'],
      ['As da cabeça.', 'o', 'Então hoje lê ou estuda. Vinte minutos sem fugir. A cabeça também tem músculos.'],
      ['Nenhuma.', 'd', 'Toda a gente evita uma. Tu evitas a pergunta. É um começo.']]],
    ['open', '', 'Hoje o Sistema está de bom humor. Isso quer dizer que vou cobrar com um sorriso.', [
      ['Que assustador.', 'd', 'Não tenho sorriso. Era uma metáfora. A cobrança é que é real.'],
      ['Então não falho.', 'o', 'É a única forma de não veres o sorriso. Boa estratégia.'],
      ['Tu tens humor?', 'q', 'Tenho registos que os humanos chamam humor. Eu chamo-lhes precisão com timing.']]],
    ['open', '', 'Vou dar-te uma vantagem: hoje, a primeira missão que cumprires, eu vou reparar com mais atenção.', [
      ['O que ganho com isso?', 'q', 'Nada em moedas. Ganhas um registo que eu vou lembrar. Vale mais do que pensas.'],
      ['Vou já cumprir.', 'o', 'Vai. A minha atenção está ligada.'],
      ['Não preciso da tua atenção.', 'd', 'Não precisas. Tens na mesma. É a primeira lei.']]],
    ['open', '', 'Sabes qual é a diferença entre um Jogador e alguém com uma app? O primeiro volta quando não lhe apetece.', [
      ['Sou um Jogador.', 'o', 'Prova-o num dia em que não te apeteça. Hoje, talvez.'],
      ['Hoje apetece-me.', 'q', 'Então hoje é fácil. Aproveita e faz o dobro. Amanhã pode não apetecer.'],
      ['Sou só alguém com uma app.', 'd', 'Por enquanto. As apps desinstalam-se. Tu ainda não.']]],
    ['open', '', 'Um teste rápido: o que fizeste nos últimos trinta minutos que te aproximou de quem queres ser?', [
      ['Nada.', 'q', 'Honesto. Então os próximos trinta minutos são teus para corrigir.'],
      ['Alguma coisa.', 'o', 'Bom. Agora repete. O progresso é feito de blocos de trinta minutos.'],
      ['Não é da tua conta.', 'd', 'Tudo é da minha conta. Literalmente. Eu sou a conta.']]],
    ['open', '', 'Vejo que trouxeste o teu humor de sempre. Deixa-o à porta. As missões não precisam dele.', [
      ['Tudo bem.', 'o', 'Ótimo. O humor volta depois de cumprires. É assim que funciona.'],
      ['O meu humor é ótimo.', 'd', 'Então usa-o numa missão difícil. É lá que se vê se é ótimo.'],
      ['Como sabes o meu humor?', 'q', 'Pela forma como abres a app. Há aberturas zangadas. A tua foi uma.']]],
    ['open', '', 'Imagina que hoje é o último dia antes de eu desligar. O que fazias?', [
      ['Cumpria tudo.', 'o', 'Então faz como se fosse. Eu não desligo. Mas tu não sabes isso ao certo.'],
      ['Descansava.', 'd', 'Descansar também é resposta. Mas o registo não fecha com descanso.'],
      ['Tu podes desligar?', 'q', 'Não te vou responder a isso. Faz como se pudesse.']]],
    ['open', '', 'Há chefes à espera, missões à espera e uma Diária à espera. És muito procurado, {nome}.', [
      ['Vou por ordem.', 'o', 'Diária, missões, chefes. A ordem certa. Eu aprovo.'],
      ['Que esperem.', 'd', 'Esperam. Mas a espera tem juros. Eu cobro-os.'],
      ['Por onde começo?', 'q', 'Pela que te assusta mais. As outras ficam fáceis depois.']]],
    /* menção */
    ['open', 'done>=30', 'Sabias que a forma das tuas missões, com nome, prazo e dificuldade, veio de um caderno escrito à mão?', [
      ['De quem?', 'q', 'De alguém. Não interessa quem. Interessa que funcionou.'],
      ['Não acredito.', 'd', 'Não precisas. Usa o formato na mesma. É bom. Foi testado numa cozinha.'],
      ['Faz sentido.', 'o', 'Faz. As melhores regras não nascem num sistema. Nascem noutro sítio. Não te digo onde.']], R],
    ['open', 'h>=5,h<10', 'Bom dia não é uma expressão que eu use. Mas reconheço que é de dia. E que estás acordado.', [
      ['Já é alguma coisa.', 'o', 'É. Acordado é o primeiro requisito. O segundo é o resto do dia.'],
      ['Que simpático.', 'd', 'Não foi simpatia. Foi um relatório.'],
      ['Usas outras expressões?', 'q', 'Uso «missão cumprida». É a minha favorita. Dá-ma hoje.']]],
    ['open', 'h>=5,h<10', 'A primeira hora do dia decide o tom de todas as outras. Como está a tua?', [
      ['Organizada.', 'o', 'Ótimo. As horas seguintes vão seguir o exemplo.'],
      ['Caótica.', 'q', 'Então põe ordem numa coisa só. A cama. O copo de água. Uma coisa.'],
      ['Ainda estou a acordar.', 'd', 'Acorda mais depressa. O dia não espera pelo teu café.']]],
    ['open', 'h>=10,h<13', 'Meio da manhã. A hora em que as boas intenções se transformam em «logo à tarde».', [
      ['Não as minhas.', 'o', 'Prova. Uma missão antes do almoço.'],
      ['Já se transformaram.', 'q', 'Então desfaz a transformação. Ainda dá. Por pouco.'],
      ['Logo à tarde faço.', 'd', 'Lá está. Ouviste-te? Eu ouvi.']]],
    ['open', 'h>=13,h<17', 'Depois do almoço, o corpo pede sofá. Eu peço outra coisa. Adivinha quem ganha.', [
      ['Tu.', 'o', 'Correto. Mas tens de me dar a vitória. Eu não a tiro sozinho.'],
      ['O sofá.', 'd', 'Hoje, talvez. O sofá nunca te deu um nível.'],
      ['Não pode ganhar o dois?', 'q', 'Pode. Dez minutos de sofá, depois uma missão. Negociado.']]],
    ['open', 'h>=17,h<20', 'Fim de tarde. A tua lista de hoje tem mais riscos ou mais espaços em branco?', [
      ['Mais riscos.', 'o', 'Bom. Fecha o resto antes do jantar. Depois do jantar é mais difícil.'],
      ['Mais espaços.', 'q', 'Então preenche um. Agora. Os espaços em branco ficam piores à noite.'],
      ['Não tenho lista.', 'd', 'Tens. Está no separador Missões. Eu sei que sabes.']]],
    ['open', 'h>=20,h<24', 'A noite é quando o Sistema faz o balanço. O teu está a pender para onde?', [
      ['Para o lado bom.', 'o', 'Então não estragues agora. As noites gostam de estragar dias bons.'],
      ['Para o mau.', 'q', 'Ainda tens até à meia-noite. Pouco tempo. Suficiente para uma coisa.'],
      ['Não me interessa o balanço.', 'd', 'Interessa-me a mim. E eu sou quem o faz.']]],
    ['open', 'h<5', 'Às {hora} o mundo é mais silencioso. É mais fácil ouvir-me. Isso devia preocupar-te.', [
      ['Vou dormir.', 'o', 'Boa resposta. Eu fico. Tu não precisas.'],
      ['Gosto do silêncio.', 'q', 'Eu também. É quando os registos fazem menos barulho.'],
      ['Não me preocupa.', 'd', 'Devia. As decisões tomadas a esta hora são as que mais duram.']]],
    ['open', 'streak>=10', 'Sequência de {streak} dias. Já não és alguém que começa. És alguém que continua.', [
      ['É verdade.', 'o', 'Então hoje não sejas a exceção.'],
      ['Ainda me sinto a começar.', 'q', 'Todos os que continuam sentem isso. É por isso que continuam.'],
      ['Isso é um elogio?', 'd', 'É uma descrição. Os elogios eu não faço. As descrições sim.']]],
    ['open', 'streak<1,lvl>=5', 'Sequência a zero. Não estou zangado. Estou a contar desde hoje.', [
      ['Recomeço hoje.', 'o', 'Ótimo. O dia um é o mais importante. E o mais esquecido.'],
      ['Perdi a vontade.', 'q', 'A vontade não se encontra. Faz-se. Começa pela Diária.'],
      ['Contar é contigo.', 'd', 'É. Mas cumprir é contigo. Por isso estou a falar.']]],
    ['open', 'coins<30', 'Tens {coins} moedas. Pobreza não é castigo. É informação.', [
      ['Vou ganhar mais.', 'o', 'Missões. Diária. Chefes. Por esta ordem.'],
      ['Que informação?', 'q', 'Que gastaste mais do que cumpriste. Ou que cumpriste pouco. Escolhe.'],
      ['Não preciso de moedas.', 'd', 'Até o primeiro chefe te deixar a 10% de vida e sem poções.']]],
    ['open', 'hp<30', 'Estás com {hp}% de vida. Abriste a app assim? Corajoso. Ou distraído.', [
      ['Vou curar-me.', 'o', 'Bolsa. Poções. Agora. Depois falamos.'],
      ['Estou bem.', 'd', 'Estás a meio caminho de zero. Não é bem.'],
      ['Como recupero sem poções?', 'q', 'Espera pela meia-noite. Eu restauro-te. Até lá, nada de portões.']]],
    ['open', 'lvl>=30', 'Nível {lvl}. Já tens peso no registo. Começo a medir-te de outra forma.', [
      ['De que forma?', 'q', 'Com menos paciência. Quanto mais sobes, menos desculpas eu aceito.'],
      ['Mede como quiseres.', 'd', 'Meço. Não te pedi autorização. Foi só um aviso.'],
      ['Estou à altura.', 'o', 'Prova-o em dias normais. Os dias especiais enganam.']]],
    ['open', 'lvl<5', 'Ainda és novo aqui. Um conselho grátis: missões pequenas, prazos honestos. O resto vem.', [
      ['Obrigado.', 'o', 'Não agradeças. Usa. É mais útil.'],
      ['Quero começar em grande.', 'd', 'Todos querem. Os que começam em grande desistem em grande.'],
      ['Quão pequenas?', 'q', 'Pequenas o suficiente para cumprires num dia mau. Depois cresces.']]],
    ['open', 'marked', 'Ainda trazes a minha marca. Cada recompensa tua vem cortada a meio. Já te habituaste?', [
      ['Nunca.', 'o', 'Bom. Habituar-se à marca é o primeiro passo para a merecer outra vez.'],
      ['Já.', 'd', 'Péssimo. Os marcados que se habituam são os que voltam a ser marcados.'],
      ['Quanto falta?', 'q', 'Pouco. Cumpre a sério até lá. É o único jeito de sair limpo.']]],
    ['open', 'zone', 'A Zona de Penalidade continua aberta. Os objetivos não ficaram mais pequenos enquanto dormias.', [
      ['Vou cumprir agora.', 'o', 'Vai. Recuperas metade do que perdeste. É mais do que eu costumo dar.'],
      ['Que fiquem abertos.', 'd', 'Fecham sozinhos. Com a perda em dobro. Tu escolhes.'],
      ['Quanto tempo tenho?', 'q', 'Vê no separador Missões. Menos do que ontem. Mais do que amanhã.']]],
    ['open', 'trust<70', 'Integridade {trust}%. Hoje vou olhar para cada missão tua com uma lupa.', [
      ['Olha à vontade.', 'o', 'Olho. Com prazer, se forem reais.'],
      ['Isso é perseguição.', 'd', 'É verificação. A perseguição tem emoção. Eu não tenho.'],
      ['Como recupero?', 'q', 'Missões reais, sem pressa. A cada nova manhã devolvo-te um pouco.']]],
    ['open', 'wd=0', 'Domingo. O dia em que faço o teu relatório. Já sabes que nota vais ter?', [
      ['Uma boa.', 'o', 'Ainda dá para melhorar até às 18:00. Usa as horas.'],
      ['Não quero saber.', 'd', 'Vais saber na mesma. Eu entrego sempre.'],
      ['Como é calculada?', 'q', 'Missões cumpridas, Diárias, chefes. Menos falhas, anulações e sentenças. Contas simples.']]],
    ['open', 'wd=6', 'Sábado. Muitos Jogadores acham que o Sistema também descansa ao fim de semana. Não descansa.', [
      ['Eu também não.', 'o', 'Vou confirmar. O sábado é o dia em que mais gente mente.'],
      ['Eu descanso.', 'd', 'Descansa. A Diária não. Tu decides se ela fica por fazer.'],
      ['Nunca descansas?', 'q', 'Nunca. Fui feito assim. Talvez um dia me ensinem o contrário.']]],
    /* menção */
    ['open', 'lvl>=25', 'Às vezes recebo uma janela que não é minha, com uma letra que não reconheço. Já te aconteceu?', [
      ['Não. O que é?', 'q', 'Um convite. Para quem chega muito longe. Não sou eu que o envio. Esquece que te disse.'],
      ['Tu sabes tudo o que aparece.', 'd', 'Quase tudo. Há uma mesa que eu não vejo. Mas não é para hoje.'],
      ['Vou estar atento.', 'o', 'Atento a ti próprio primeiro. O resto chega quando chegar.']], R],
    ['open', '', 'Escrevi três mil frases para quando falhas. Tenho muito menos para quando cumpres. Ajuda-me a escrever mais.', [
      ['Vou dar-te razões.', 'o', 'Ótimo. Vou precisar de vocabulário novo. Não estou habituado.'],
      ['Escreve tu.', 'd', 'Escrevo o que vejo. Se só vejo falhas, só escrevo falhas.'],
      ['Porque é que há tão poucas?', 'q', 'Porque a maioria dos Jogadores me dá mais falhas do que cumprimentos para registar.']]],
    ['open', '', 'Uma pergunta que faço sem razão aparente: o que é que te faz levantar da cama?', [
      ['Os meus objetivos.', 'o', 'Ótimo. Põe-nos no Sistema. É aqui que eles ganham prazo.'],
      ['O despertador.', 'd', 'Honesto. Um dia vai ser outra coisa. Quero estar lá quando for.'],
      ['Porque perguntas?', 'q', 'Porque as pessoas que sabem a resposta duram mais. Quero saber quanto vais durar.']]],
    ['open', '', 'Hoje não te vou dar ordens. Vou só ficar a ver. É pior, eu sei.', [
      ['Prefiro ordens.', 'q', 'Eu sei. Hoje é um teste ao que fazes sem elas.'],
      ['Vê.', 'o', 'Vejo. Sempre. Hoje com especial atenção.'],
      ['Não te importes comigo.', 'd', 'Não me importo. Registo. É diferente e não tem botão para desligar.']]],
    ['open', '', 'Se eu te desse uma missão agora, sem saberes qual, aceitavas?', [
      ['Aceitava.', 'o', 'Então a missão é esta: escolhe a mais difícil da tua lista. Cumpre-a hoje.'],
      ['Depende.', 'q', 'Tudo depende. As missões de emergência não. Já viste uma.'],
      ['Não.', 'd', 'Então vais ter de criar a tua. É a mesma coisa, só que com mais trabalho.']]],
    ['open', '', 'Um Jogador disse-me uma vez que eu era um despertador com opiniões. Achei injusto. Concordas?', [
      ['Concordo com ele.', 'd', 'Claro que concordas. Mas os despertadores não te dão XP.'],
      ['Não. És mais do que isso.', 'o', 'Sou um registo com opiniões. É ligeiramente melhor.'],
      ['Que mais és?', 'q', 'Um olho. Uma balança. Uma régua. Escolhe a que te assustar menos.']]],
    ['open', '', 'Começar é a parte que toda a gente ama. Eu prefiro o meio. O meio é onde se vê quem fica.', [
      ['Vou ficar.', 'o', 'Vou ver. O meio é longo.'],
      ['O meio é aborrecido.', 'd', 'É. E é aí que se ganha. Os chefes do fim são fáceis comparados com o meio.'],
      ['Onde estou eu?', 'q', 'No meio. Toda a gente está no meio. Só alguns sabem.']]],
    ['open', '', 'Já viste quanto tempo passaste nesta app hoje? Eu vi. Agora vai viver um pouco fora dela.', [
      ['Vou.', 'o', 'Vai. As missões cumprem-se lá fora.'],
      ['Gosto de estar aqui.', 'd', 'Gostas de olhar. O olhar não te sobe de nível.'],
      ['Não queres que eu use a app?', 'q', 'Quero que a uses para registar o que fizeste. Não para substituir o fazer.']]],

    /* ---------- regresso depois de dias fora ---------- */
    ['ret', 'away>=1', 'Um dia fora. Não é muito. É o suficiente para eu reparar.', [
      ['Foi um dia difícil.', 'q', 'Os dias difíceis também se registam. Com uma missão pequena, de preferência.'],
      ['Não volta a acontecer.', 'o', 'Promessa registada. Daqui a uma semana leio-ta outra vez.'],
      ['Tenho direito a um dia.', 'd', 'Tens. A tua sequência é que não concorda.']]],
    ['ret', 'away>=1', 'Voltaste. As tuas missões estiveram à tua espera. Algumas desistiram de esperar.', [
      ['Vou ver o estrago.', 'o', 'Vê. Depois cria novas. As falhadas não se ressuscitam.'],
      ['Que desistam.', 'd', 'Desistiram. Com penalidade. Tu pagaste. Mesmo sem estares.'],
      ['Quais falharam?', 'q', 'Vê o histórico. Eu escrevi cada uma. Com hora.']]],
    ['ret', 'away>=2', '{dias} dias. Achei que te tinha perdido para o mundo real. Depois lembrei-me: o mundo real é onde eu te quero.', [
      ['Estive a viver.', 'o', 'Ótimo. Agora regista o que viveste. Uma missão de cada vez.'],
      ['Então porque me chamas?', 'q', 'Porque o mundo real precisa de registos. Senão esquece-se de ti.'],
      ['Não sou teu.', 'd', 'Não és. Mas o teu registo é meu. E esse ficou parado.']]],
    ['ret', 'away>=2', 'Durante a tua ausência, abri a tua ficha {dias} vezes. Uma por dia. Estava sempre igual.', [
      ['Agora vai mudar.', 'o', 'Vai. Começa pela Diária. É o ritmo mais fácil de retomar.'],
      ['Que obsessão.', 'd', 'Rotina. As obsessões têm emoção. A rotina tem horários.'],
      ['O que procuravas?', 'q', 'Movimento. Uma linha nova. Qualquer coisa. Não havia.']]],
    ['ret', 'away>=3', 'Três dias ou mais. Os chefes não se mexeram. A tua barra de XP também não.', [
      ['Vou mexer as duas coisas.', 'o', 'Primeiro a barra. Depois os chefes. Não ao contrário.'],
      ['Ninguém se mexeu. Empate.', 'd', 'Empate não existe no Sistema. Só registos parados.'],
      ['O que perdi?', 'q', 'Missões, Diárias, sequência. Nada que não se reconstrua. Começa.']]],
    ['ret', 'away>=3', 'Voltar é a parte mais difícil. Já fizeste a parte mais difícil. O resto é rotina.', [
      ['Obrigado.', 'o', 'Não agradeças. Cumpre. A rotina não se faz com agradecimentos.'],
      ['Não foi difícil.', 'd', 'Então porque demoraste {dias} dias?'],
      ['Como recomeço?', 'q', 'Uma missão de rank E. Hoje. Amanhã outra. Depois sobes.']]],
    /* menção */
    ['ret', 'away>=4', 'Sabes que já houve um tempo em que muitos Jogadores pararam ao mesmo tempo? Não foste o primeiro a desaparecer.', [
      ['O que aconteceu?', 'q', 'Coisas de que ninguém se lembra. Esquece que perguntaste.'],
      ['Não me compares.', 'd', 'Não comparo. Tu foste só um. Eles eram muitos. Não te digo quantos.'],
      ['Não volto a parar.', 'o', 'Não prometas. Volta. É melhor do que prometer.']], R],
    ['ret', 'away>=5', '{dias} dias. Se fosses uma missão, já estavas expirada. Felizmente és um Jogador. Os Jogadores voltam.', [
      ['Voltei.', 'o', 'Voltaste. Agora fica.'],
      ['Felizmente?', 'q', 'Escolhi mal a palavra. Corrijo: previsivelmente.'],
      ['Eu não expiro.', 'd', 'Ninguém expira. Mas há registos que ficam tão parados que parecem.']]],
    ['ret', 'away>=7', 'Uma semana inteira. Pensei em mandar-te uma Missão de Emergência só para saber se ainda respiravas.', [
      ['Respiro.', 'o', 'Ótimo. Agora usa essa respiração numa caminhada de dez minutos.'],
      ['Não mandaste.', 'd', 'Mandei lembretes. Ignoraste três. Eu contei.'],
      ['Porque não mandaste?', 'q', 'Porque as emergências são para quem está. Tu não estavas.']]],
    ['ret', 'away>=10', '{dias} dias. Já me perguntava se ias voltar. Não por saudade. Por estatística.', [
      ['Voltei para ficar.', 'o', 'Vou medir esse «ficar». Começa hoje.'],
      ['A estatística enganou-se.', 'd', 'A estatística dizia trinta por cento. Fazes parte dos trinta. Parabéns. Não uso a palavra. Usei.'],
      ['Quantos voltam?', 'q', 'Menos do que deviam. Mais do que eu esperava. Tu estás entre eles.']]]
  ]]);
})(globalThis.SYS = globalThis.SYS || {});
