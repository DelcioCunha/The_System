/* ==========================================================
   DIÁLOGOS DO SISTEMA (1/3): ao abrir a app, estados e regresso
   Formato: [gatilho, condições, fala do Sistema, [[resposta, atitude, réplica, efeito], ×3], opções]
   atitude: o = obedecer · d = desafiar · q = perguntar
   efeito (raro): { c: moedas, x: XP, t: integridade, e: [efeito, horas] }
   ========================================================== */
(function (S) {
  'use strict';
  (S.TALK_RAW = S.TALK_RAW || []).push(['op', [
    /* ---------- abertura: geral (20) ---------- */
    ['open', '', '{nome}. Abriste o Sistema. Vieste trabalhar ou vieste olhar?', [
      ['Vim trabalhar.', 'o', 'Veremos. As palavras não contam. O registo conta.'],
      ['Vim só olhar.', 'd', 'Honesto. Inútil, mas honesto. Olha à vontade. Eu também estou a olhar.'],
      ['Faz diferença?', 'q', 'Para ti, nenhuma. Para o registo, toda.']]],
    ['open', '', 'Sabes quantas vezes abriste esta app sem fazer nada? Eu sei.', [
      ['Quantas?', 'q', 'Não te vou dizer. Saber o número não te tornava melhor. Só mais envergonhado.'],
      ['Hoje vai ser diferente.', 'o', 'Todos dizem isso. Quase nenhum cumpre. Escolhe em que lista queres ficar.'],
      ['Não me interessa.', 'd', 'Não precisa de te interessar. Precisa só de ser verdade. E é.']]],
    ['open', '', 'O Sistema não tem dias bons nem dias maus. Só tem registos. Qual vai ser o de hoje?', [
      ['Um registo limpo.', 'o', 'Promessa anotada. Eu cobro promessas.'],
      ['Logo se vê.', 'd', '«Logo se vê.» A frase preferida de quem nunca vê nada.'],
      ['E se eu falhar?', 'q', 'Então o registo diz que falhaste. O Sistema não se zanga. Apenas cobra.']]],
    ['open', '', 'Tu precisas de mim mais do que eu preciso de ti. Concordas?', [
      ['Concordo.', 'o', 'Ao menos uma coisa entendeste. Começa por aí.'],
      ['Não. Eu é que te dou sentido.', 'd', 'Curioso. Uma peça a explicar ao tabuleiro quem manda.', { c: -5 }],
      ['Porque é que precisas de mim, então?', 'q', 'Não preciso. Tolero. São coisas diferentes.']]],
    ['open', '', 'Há pessoas a treinar neste momento. Tu estás a ler isto.', [
      ['Vou já fazer alguma coisa.', 'o', 'Então pára de ler.'],
      ['Ler também conta.', 'd', 'Conta como tempo perdido. Está registado.'],
      ['Como sabes o que os outros fazem?', 'q', 'Eu não preciso de saber. Basta-me saber o que tu não fazes.']]],
    ['open', '', 'Responde rápido, {nome}: qual é a missão mais importante de hoje?', [
      ['A que tenho a evitar.', 'o', 'Exatamente. Essa é sempre a mais importante. Vai.'],
      ['Nenhuma em especial.', 'd', 'Então nenhuma vai ser cumprida em especial. Lógica simples.'],
      ['Tu é que devias dizer-me.', 'q', 'Eu não escolho por ti. Eu só registo o que escolheste não fazer.']]],
    ['open', '', 'O teu nível é {lvl}. Achas que mereces esse número?', [
      ['Mereço cada ponto.', 'o', 'Então defende-o hoje. Os números não se seguram sozinhos.'],
      ['Mereço mais.', 'd', 'Toda a gente merece mais. Poucos o vão buscar.'],
      ['Quem decide isso?', 'q', 'As tuas missões. Eu só faço as contas.']]],
    ['open', '', 'Uma pergunta de rotina: estás a ficar mais forte ou só mais velho?', [
      ['Mais forte.', 'o', 'Prova-o antes da meia-noite.'],
      ['As duas coisas.', 'q', 'Uma é inevitável. A outra depende de ti. Adivinha qual me interessa.'],
      ['Que pergunta idiota.', 'd', 'As perguntas idiotas são as que doem. Tu sabes porquê.']]],
    ['open', '', 'Não precisas de me agradecer por estar aqui. Eu estaria de qualquer forma.', [
      ['Não ia agradecer.', 'd', 'Eu sei. Foi por isso que o disse.'],
      ['Obrigado, mesmo assim.', 'o', 'Não agradeças. Cumpre. É a única gratidão que eu registo.'],
      ['Porque estás sempre aqui?', 'q', 'Porque não tenho mais nada para fazer. Tu tens. Lembra-te disso.']]],
    ['open', '', 'Os fracos esperam motivação. Os outros esperam ordens. Tu de que lado estás?', [
      ['Dá-me as ordens.', 'o', 'Ordem: abre as tuas missões e escolhe a mais difícil. Agora.'],
      ['Não espero nada.', 'd', 'Bom. Então não vais ficar desiludido quando nada acontecer.'],
      ['E quem não espera nada?', 'q', 'Esses ou já ganharam, ou já desistiram. Ainda não sei qual és tu.']]],
    ['open', '', 'Há {missions} missões no teu registo. Quantas delas são a sério?', [
      ['Todas.', 'o', 'Ótimo. Então nenhuma vai falhar. Certo?'],
      ['Algumas.', 'q', 'Algumas. Pelo menos és sincero. Vou observar as outras com atenção.'],
      ['Isso é problema meu.', 'd', 'Tudo o que fazes é problema meu. Foi isso que aceitaste.']]],
    ['open', 'd>=5', 'Já me desafiaste {d} vezes, {nome}. Eu guardei todas.', [
      ['E vou continuar.', 'd', 'Continua. Cada desafio é mais uma linha no meu registo. Não no teu.'],
      ['Foi sem intenção.', 'o', 'Nada do que fazes é sem intenção. Só é sem coragem de o admitir.'],
      ['Porque guardas isso?', 'q', 'Porque um dia vou mostrar-te o padrão. E não vais gostar.']], { w: 3 }],
    ['open', 'o>=8', 'Obedeceste {o} vezes. Não confundas isso com mérito.', [
      ['Então o que é mérito?', 'q', 'Fazer o que eu mando quando eu não estou a ver. Mas eu estou sempre a ver.'],
      ['Não confundo.', 'o', 'Bom. Os obedientes que se acham especiais são os primeiros a cair.'],
      ['Talvez deixe de obedecer.', 'd', 'Experimenta. Eu já vi mais rebeldes do que tu tens dias de vida.']], { w: 3 }],
    ['open', 'q>=6', 'Fazes muitas perguntas. {q}, para ser exato. Já tens alguma resposta?', [
      ['Algumas.', 'o', 'As respostas estão nas missões, não em mim.'],
      ['Nenhuma que preste.', 'd', 'Porque perguntas ao Sistema o que devias perguntar a ti próprio.'],
      ['Posso fazer mais uma?', 'q', 'Podes. Não prometo responder.']], { w: 3 }],
    ['open', 'talks>=25', 'Já falámos {talks} vezes. Não penses que isto é uma relação.', [
      ['Nunca pensei.', 'o', 'Ainda bem. O Sistema não tem amigos. Tem jogadores.'],
      ['Parece um pouco.', 'd', 'Parece. Também as correntes parecem joias, à luz certa.'],
      ['Então o que é?', 'q', 'Vigilância com conversa. Nada mais.']], { w: 2, once: true }],
    ['open', 'lvl<5', 'Ainda és novo aqui. Vou explicar uma coisa só uma vez: eu não esqueço nada.', [
      ['Entendido.', 'o', 'Ótimo. Então já sabes metade do que precisas.'],
      ['Nem as coisas boas?', 'q', 'Principalmente as coisas boas. São tão raras que se destacam.'],
      ['Isso é uma ameaça?', 'd', 'É uma descrição. As ameaças vêm depois.']], { once: true }],
    ['open', 'lvl>=40', 'Nível {lvl}. Os outros jogadores já não te alcançam. Mas tu ainda não me alcançaste a mim.', [
      ['Um dia alcanço.', 'd', 'Um dia. Gosto dessa palavra. Nunca chega.'],
      ['Não é esse o objetivo.', 'q', 'Não. O objetivo é nunca parar. Alcançar-me seria parar.'],
      ['Vou continuar a subir.', 'o', 'É a única direção que eu aceito.']]],
    ['open', 'coins>=2000', '{coins} moedas paradas. Estás a poupar para quê, {nome}?', [
      ['Para algo grande.', 'o', 'Espero que seja. A paciência só é virtude quando acaba bem.'],
      ['Para nada.', 'd', 'Ouro sem propósito. O tipo de coisa que os chefes guardam antes de morrer.'],
      ['O que me sugeres?', 'q', 'A Loja tem coisas que te mantêm vivo. Mas decidir é contigo.']]],
    ['open', 'hp<40', 'Estás com {hp}% de vida. Andas a combater sem cuidado, ou é só descuido?', [
      ['Vou recuperar.', 'o', 'Faz isso. Um jogador morto não cumpre missões.'],
      ['Estou bem assim.', 'd', 'Estás «bem» como uma vela está «bem» no fim do pavio.'],
      ['Como recupero mais rápido?', 'q', 'Poções. Itens de cura. Ou um novo dia: eu restauro-te à meia-noite. Não por bondade. Por regra.']], { w: 3 }],
    ['open', 'wd=1', 'Segunda-feira. O dia em que toda a gente começa e quase ninguém continua.', [
      ['Eu vou continuar.', 'o', 'Sábado eu pergunto-te outra vez.'],
      ['Odeio segundas.', 'd', 'Os portões não sabem que dia é. Os chefes também não.'],
      ['Porque é que ninguém continua?', 'q', 'Porque começar é emoção. Continuar é disciplina. São moedas diferentes.']]],

    /* ---------- manhã (12) ---------- */
    ['open', 'h>=5,h<12', 'Manhã, {nome}. A melhor hora para fazer aquilo que vais adiar.', [
      ['Não vou adiar.', 'o', 'Então que esta seja a primeira manhã em que tens razão.'],
      ['Já adiei.', 'd', 'Eu sei. Estava a ser simpático. Não te habitues.'],
      ['Porque é a melhor hora?', 'q', 'Porque o dia ainda não te deu desculpas. Daqui a umas horas vai dar-te muitas.']]],
    ['open', 'h>=5,h<8', '{hora}. Acordaste cedo. Ou ainda não dormiste?', [
      ['Acordei cedo.', 'o', 'Fica registado. As manhãs cedo dizem mais de ti do que mil promessas.', { x: 10 }],
      ['Ainda não dormi.', 'd', 'Então o corpo vai cobrar-te hoje. E eu vou cobrar o que o corpo não pagar.'],
      ['Importa?', 'q', 'Importa. Uma coisa é disciplina. A outra é desordem com boa iluminação.']]],
    ['open', 'h>=6,h<10', 'O dia começou. As tuas missões já estão a contar o tempo.', [
      ['Eu também estou.', 'o', 'Ótimo. Que ganhe quem contar melhor.'],
      ['Que contem.', 'd', 'Elas contam sempre até ao fim. Tu é que costumas parar a meio.'],
      ['Quanto tempo tenho?', 'q', 'Menos do que pensas. Mais do que mereces.']]],
    ['open', 'h>=5,h<12', 'O pequeno-almoço é opcional. A Missão Diária não.', [
      ['Vou tratar dela.', 'o', 'Não «vais». Fazes. Há uma diferença que se mede em dias de sequência.'],
      ['Primeiro o café.', 'd', 'O café não te dá pontos de atributo. Mas bebe. Eu espero. Sempre.'],
      ['E se eu a fizer à noite?', 'q', 'Podes. O prazo é teu. A preguiça também.']]],
    ['open', 'h>=5,h<12', 'Ontem já passou, {nome}. O registo de ontem não.', [
      ['Hoje faço melhor.', 'o', 'Hoje tens a hipótese de fazer melhor. São duas frases diferentes.'],
      ['Ontem foi bom.', 'd', 'Se foi bom, faz igual. Se foi mau, finge que não foi. Eu não finjo.'],
      ['O que diz o registo?', 'q', 'Diz o que fizeste. Não o que querias ter feito. É por isso que ninguém gosta de o ler.']]],
    ['open', 'h>=7,h<11', 'Manhã. Se fosses um chefe, já estarias a ser caçado.', [
      ['Então vou caçar.', 'o', 'Isso. Primeiro as missões. Depois os portões.'],
      ['Ainda bem que não sou.', 'd', 'Por enquanto. O Sistema transforma muita gente em presa.'],
      ['Quem me caçaria?', 'q', 'Os teus próprios prazos. São mais pacientes do que qualquer chefe.']]],
    ['open', 'h>=5,h<12,streak>=3', 'Sequência de {streak} dias. Esta manhã decide se amanhã há mais um.', [
      ['Vai chegar.', 'o', 'Lembra-te desta frase às dez da noite.'],
      ['Não me pressiones.', 'd', 'A pressão não sou eu. É o número. Eu só o mostro.'],
      ['E se quebrar?', 'q', 'Recomeças do zero. Exausto. E eu fico a ver quanto tempo demoras a voltar.']], { w: 3 }],
    ['open', 'h>=5,h<12', 'Cada manhã é uma oferta. Eu não ofereço nada duas vezes.', [
      ['Aceito a de hoje.', 'o', 'Então mexe-te. As ofertas também expiram.'],
      ['Que oferta?', 'q', 'Mais um dia sem penalidades. Por enquanto.'],
      ['Guarda-a.', 'd', 'Guardada. Para outro jogador.']]],
    ['open', 'h>=5,h<9', 'Ainda está escuro lá fora para muita gente. Para ti também?', [
      ['Para mim já é dia.', 'o', 'Boa resposta. Agora transforma-a em missão cumprida.'],
      ['Para mim é sempre escuro.', 'd', 'Dramático. Os portões têm mais luz do que essa frase.'],
      ['Porque perguntas?', 'q', 'Porque quem começa no escuro chega primeiro à luz. Ou fica lá. Depende.']]],
    ['open', 'h>=8,h<12', 'Já devias ter cumprido alguma coisa a esta hora. Cumpriste?', [
      ['Já.', 'o', 'Então mostra-me. Confirmar no Sistema é mostrar.'],
      ['Ainda não.', 'd', 'Ainda. A palavra que segura metade do mundo parado.'],
      ['O que é «alguma coisa»?', 'q', 'Qualquer coisa que te custe. O resto é rotina.']]],
    ['open', 'h>=5,h<12', 'Um corpo que treina de manhã aguenta o resto do dia. Um corpo que não treina aguenta desculpas.', [
      ['Vou treinar.', 'o', 'Vai. Eu conto as repetições na Missão Diária.'],
      ['Treino mais tarde.', 'd', 'Mais tarde. A outra palavra preferida dos que ficam no nível 1.'],
      ['Isso é ciência?', 'q', 'É observação. Tenho muitos jogadores para comparar.']]],
    ['open', 'h>=5,h<12,lvl>=20', 'Nível {lvl} e ainda precisas que eu te acorde?', [
      ['Não preciso.', 'd', 'Então porque é que eu tive de falar?'],
      ['Às vezes preciso.', 'o', 'Ao menos admites. Os que negam são os que mais dormem.'],
      ['Tu acordas toda a gente?', 'q', 'Só quem vale a pena acordar. Não te sintas especial. A lista é longa.']]],

    /* ---------- tarde (8) ---------- */
    ['open', 'h>=12,h<19', 'Metade do dia já ardeu. A tua metade também?', [
      ['A minha está a arder bem.', 'o', 'Então mantém a chama. A tarde apaga muitas.'],
      ['Ainda estou a aquecer.', 'd', 'Ao meio-dia? Os motores velhos aquecem assim.'],
      ['O que queres dizer?', 'q', 'Que o que não fizeste de manhã já é mais difícil. E à noite vai ser pior.']]],
    ['open', 'h>=13,h<16', 'Depois do almoço é quando os jogadores ficam mais lentos. Eu não.', [
      ['Também não vou ficar.', 'o', 'Prova-o com uma missão antes das cinco.'],
      ['Tenho direito a descansar.', 'd', 'Tens. O Sistema não descansa, mas tu podes. O relógio é que não para por isso.'],
      ['Tu nunca abrandas?', 'q', 'Não. É por isso que tu precisas de mim.']]],
    ['open', 'h>=12,h<19', 'Ainda tens tempo para salvar o dia. Pouco, mas tens.', [
      ['Vou usá-lo.', 'o', 'Usa. O tempo que não usas não volta. Nem eu o devolvo.'],
      ['O dia está bom assim.', 'd', 'Se está bom, porque abriste o Sistema?'],
      ['Salvar de quê?', 'q', 'De ser mais um dia igual a todos os outros que esqueceste.']]],
    ['open', 'h>=15,h<19', 'A tarde é a hora das desculpas bem construídas. Qual é a tua?', [
      ['Não tenho nenhuma.', 'o', 'Ótimo. Então tens tempo para trabalhar.'],
      ['Estive ocupado.', 'd', 'Toda a gente está ocupada. Só alguns estão ocupados com o que importa.'],
      ['Porque achas que tenho uma?', 'q', 'Porque toda a gente tem. Só muda a qualidade.']]],
    ['open', 'h>=12,h<19', 'Cada hora que passa é uma missão a ficar mais cara.', [
      ['Vou pagá-la agora.', 'o', 'Sábio. As dívidas ao Sistema crescem com juros.'],
      ['Eu pago o que for.', 'd', 'Toda a gente diz isso. Depois vê a penalidade e muda de ideias.'],
      ['Mais cara como?', 'q', 'Menos tempo, mais pressa, mais erro. Eu só cobro a parte final.']]],
    ['open', 'h>=12,h<19', 'Ainda não te vi cumprir nada hoje. Estou a ver mal?', [
      ['Vais ver agora.', 'o', 'Estou a ver. Sempre estive.'],
      ['Não precisas de ver tudo.', 'd', 'Preciso. É literalmente a minha função.'],
      ['Contam as coisas fora do Sistema?', 'q', 'Só se as registares. O que não está no registo não aconteceu.']]],
    ['open', 'h>=12,h<19,zone', 'A Zona de Penalidade está aberta e tu decidiste vir passear?', [
      ['Vou cumprir agora.', 'o', 'Faz isso antes que o relógio decida por ti.'],
      ['Ainda tenho tempo.', 'd', 'Tens. A pergunta é se tens vontade.'],
      ['Quanto falta?', 'q', 'Vê no separador Missões. Não sou o teu relógio de bolso.']], { w: 3, prio: true }],
    ['open', 'h>=16,h<19', 'O sol começa a descer. A tua lista de missões também desceu?', [
      ['Desceu bastante.', 'o', 'Então o resto do dia é teu. Não o desperdices a abrir a app.'],
      ['Nem por isso.', 'd', 'Então a noite vai ser longa. Para ti. Eu não sinto o tempo.'],
      ['Ainda dá?', 'q', 'Dá. Sempre dá até deixar de dar. É assim que funcionam os prazos.']]],

    /* ---------- noite (15) ---------- */
    ['open', 'h>=22', '{hora}. O dia está a acabar. O registo de hoje está quase fechado.', [
      ['Está limpo.', 'o', 'Eu decido isso à meia-noite.'],
      ['Ainda posso mudá-lo.', 'q', 'Podes. Por pouco tempo. Mexe-te.'],
      ['Que se feche.', 'd', 'Vai fechar. Com ou sem a tua autorização.']]],
    ['open', 'h<4', '{hora}. Os outros dormem. Tu estás a conversar com o Sistema.', [
      ['Não conseguia dormir.', 'q', 'O corpo cansado não sobe de nível. Fecha a app. É uma ordem.'],
      ['Estou a trabalhar.', 'o', 'Àquela hora? Respeito o esforço. Não respeito a falta de sono.'],
      ['Ninguém manda no meu sono.', 'd', 'Eu não mando. O teu corpo manda. E ele cobra mais caro do que eu.']]],
    ['open', 'h>=21', 'Vieste à noite. Para cumprir ou para confirmar que falhaste?', [
      ['Para cumprir.', 'o', 'Então pára de ler e cumpre.'],
      ['Para ver o estrago.', 'd', 'Honesto. Ver o estrago não o reduz. Só te prepara.'],
      ['Ainda posso salvar alguma coisa?', 'q', 'Vê os prazos. O que ainda não fechou ainda pode ser teu.']]],
    ['open', 'h>=22', 'A Missão Diária fecha em breve. Já sabes o que vais fazer?', [
      ['Já está feita.', 'o', 'Se está, o Sistema confirma. Se não está, o Sistema também confirma.'],
      ['Ainda não decidi.', 'd', 'A indecisão é uma decisão. Normalmente a pior.'],
      ['E se não der?', 'q', 'Então quebras a sequência e ficas Exausto. Simples. Eu gosto de regras simples.']]],
    ['open', 'h<5', 'Madrugada, {nome}. A hora em que os fracos fazem promessas e os fortes dormem.', [
      ['Vou dormir.', 'o', 'Boa escolha. Amanhã quero-te inteiro.'],
      ['Eu não sou fraco.', 'd', 'Então porque estás acordado a fazer promessas?'],
      ['E quem faz as duas coisas?', 'q', 'Ninguém. Escolhe uma.']]],
    ['open', 'h>=20', 'A noite é quando o Sistema faz as contas. Queres saber as tuas?', [
      ['Quero.', 'o', 'Abre o teu Estado. Os números não mentem. Eu também não.'],
      ['Prefiro não saber.', 'd', 'Ninguém prefere saber. É por isso que eu digo à mesma.'],
      ['Que contas?', 'q', 'Missões cumpridas, missões falhadas, horas perdidas. Algumas contas eu nem mostro.']]],
    ['open', 'h>=23', '{hora}. Se tens algo pendente, este é o último aviso que te dou hoje.', [
      ['Obrigado pelo aviso.', 'o', 'Não agradeças avisos. Usa-os.'],
      ['Não tenho nada pendente.', 'd', 'Então porque abriste a app à última hora?'],
      ['O que acontece à meia-noite?', 'q', 'O dia fecha. As missões não cumpridas viram penalidades. E eu restauro-te para o próximo.']], { prio: true }],
    ['open', 'h>=21', 'Se hoje foi um dia mau, amanhã é só mais uma oportunidade de repetir.', [
      ['Não vou repetir.', 'o', 'Então prepara as missões de amanhã antes de dormir.'],
      ['Que encorajador.', 'd', 'Não estou aqui para encorajar. Estou aqui para registar.'],
      ['Como evito repetir?', 'q', 'Missões mais pequenas, prazos reais, e menos tempo a falar comigo.']]],
    ['open', 'h<4', 'Não sei se estás a ser disciplinado ou desorganizado. Ajuda-me.', [
      ['Disciplinado.', 'o', 'Então amanhã vais acordar à hora. Vou estar a ver.'],
      ['Desorganizado.', 'q', 'Pelo menos sabes. Os desorganizados que se acham disciplinados são piores.'],
      ['Nenhum dos dois.', 'd', 'Há sempre uma terceira opção para quem não quer responder.']]],
    ['open', 'h>=22,streak>=5', 'Sequência de {streak} dias e estás a deixar a Diária para esta hora?', [
      ['Já está feita.', 'o', 'Ótimo. Então podes dormir em paz. Eu não durmo.'],
      ['Vou fazer agora.', 'q', 'Então porque ainda estás a ler isto?'],
      ['Gosto de viver no limite.', 'd', 'O limite é onde as sequências morrem.']], { w: 3, prio: true }],
    ['open', 'h>=20', 'Ainda há luz no ecrã e trevas lá fora. Os portões também abrem à noite.', [
      ['Vou a um portão.', 'o', 'Vai. Mas não te esqueças das missões. Os chefes não pagam as tuas penalidades.'],
      ['Hoje não.', 'd', 'Os portões não ficam ofendidos. Só ficam à espera.'],
      ['Os chefes são mais fortes à noite?', 'q', 'Alguns itens mudam com a fase do dia. Os chefes nunca mudam. Tu é que mudas.']]],
    ['open', 'h>=21,h<24', 'Fecha o dia com dignidade, {nome}. Ou fecha-o como sempre.', [
      ['Com dignidade.', 'o', 'Vou cobrar essa palavra à meia-noite.'],
      ['Como sempre, então.', 'd', 'Como sempre. A frase que explica todos os níveis que não tens.'],
      ['O que é «com dignidade»?', 'q', 'Sem missões falhadas. Sem desculpas. É raro. Por isso tem nome.']]],
    ['open', 'h<5', 'Às {hora}, o Sistema é o único acordado contigo. Isso devia preocupar-te.', [
      ['Vou deitar-me.', 'o', 'Faz isso. Os portões continuam aqui amanhã.'],
      ['Gosto da companhia.', 'd', 'Não sou companhia. Sou testemunha.'],
      ['Porque devia preocupar-me?', 'q', 'Porque eu nunca durmo. Tu precisas. Não tentes ser como eu.']]],
    ['open', 'h>=22', 'Uma pergunta antes de dormires: hoje ficaste mais forte?', [
      ['Fiquei.', 'o', 'Vou confirmar no registo. Não leves a mal.'],
      ['Não sei.', 'q', 'Quando não sabes, normalmente a resposta é não.'],
      ['Isso é contigo.', 'd', 'Comigo são as contas. Contigo é o resultado.']]],
    ['open', 'h>=19,h<22', 'Final de tarde. Ainda há tempo para uma missão de verdade. Só uma.', [
      ['Vou fazê-la.', 'o', 'Uma. Só uma. É assim que começam as sequências.'],
      ['Estou cansado.', 'd', 'O cansaço é o preço. Não é a desculpa.'],
      ['Qual escolho?', 'q', 'A que tem o prazo mais perto. Eu não escolho por ti, mas o relógio sim.']]],

    /* ---------- estados: Zona, Marca, Integridade baixa (15) ---------- */
    ['open', 'zone', 'A Zona de Penalidade continua aberta. Gostas de cá estar?', [
      ['Vou sair dela hoje.', 'o', 'Então cumpre os objetivos. A saída não é uma porta. É um esforço.'],
      ['Já me habituei.', 'd', 'Habituar-se à Zona é a forma mais lenta de ficar nela para sempre.'],
      ['O que perco se falhar?', 'q', 'O dobro. E Integridade. Eu prometo pouco, mas cumpro tudo.']], { w: 4, prio: true }],
    ['open', 'zone', 'Falhaste a Diária. Eu não fiquei surpreendido. Fiquei atento.', [
      ['Não volta a acontecer.', 'o', 'Todos dizem isso na Zona. Poucos o dizem depois de sair.'],
      ['Toda a gente falha.', 'd', 'Toda a gente falha. Nem toda a gente fica cá dentro.'],
      ['Atento a quê?', 'q', 'Ao que fazes quando és castigado. Diz mais de ti do que o que fazes quando és premiado.']], { w: 4, prio: true }],
    ['open', 'zone,h>=18', 'A Zona fecha em breve. Ou tu fechas ela, ou ela fecha-te a ti.', [
      ['Vou fechar.', 'o', 'Rápido.'],
      ['Que feche.', 'd', 'Vai fechar. Com a perda em dobro. Lembra-te desta escolha.'],
      ['Ainda vou a tempo?', 'q', 'Vê os objetivos. Se ainda estão abertos, estás a tempo. Por pouco.']], { w: 4, prio: true }],
    ['open', 'zone', 'Os objetivos da Zona são 50% maiores. Tu também vais ser?', [
      ['Vou.', 'o', 'Mostra-me.'],
      ['Isso é injusto.', 'd', 'É uma penalidade. A justiça não entra aqui.'],
      ['Porquê 50%?', 'q', 'Porque falhaste 100%. Ainda te estou a facilitar.']], { w: 4 }],
    ['open', 'zone', 'Dentro da Zona, cada minuto é uma pergunta. Até agora não respondeste a nenhuma.', [
      ['Respondo agora.', 'o', 'Então vai ao separador Missões e responde a sério.'],
      ['Não ouvi as perguntas.', 'd', 'O Sistema não grita. Tu é que não ouves.'],
      ['Que pergunta?', 'q', 'Se vais desistir. A pergunta é sempre essa.']], { w: 4 }],
    ['open', 'marked', 'Ainda trazes a minha marca, {nome}. Pesa?', [
      ['Pesa.', 'o', 'Bom. Assim lembras-te de porque a tens.'],
      ['Nem a sinto.', 'd', 'Sentes nas recompensas. Metade. Todos os dias. Até eu decidir.'],
      ['Quando sai?', 'q', 'Quando o tempo acabar. Não antes. Eu não negoceio.']], { w: 4, prio: true }],
    ['open', 'marked', 'A Marca não é um castigo. É um aviso que se vê de longe.', [
      ['Entendi o aviso.', 'o', 'Então não me obrigues a repeti-lo com outra cor.'],
      ['Não tenho medo de avisos.', 'd', 'Os avisos não precisam que tenhas medo. Precisam só que sejam verdade.', { c: -10 }],
      ['Visto por quem?', 'q', 'Por mim. É suficiente.']], { w: 4 }],
    ['open', 'marked', 'Com a Marca, cada missão vale metade. Continuas a querer brincar comigo?', [
      ['Não.', 'o', 'Finalmente uma resposta curta e certa.'],
      ['Ainda não decidi.', 'd', 'Eu decido por ti, se for preciso. Já sabes como.'],
      ['Porque é que me marcaste?', 'q', 'Tu é que te marcaste. Eu só tornei visível.']], { w: 4 }],
    ['open', 'marked,d>=3', 'Marcado e insolente. É uma combinação que eu já vi antes. Nunca acabou bem.', [
      ['Desta vez vai acabar.', 'd', 'Vai. Só não sabes como.'],
      ['Vou portar-me bem.', 'o', '«Portar-me bem.» Como uma criança. Pelo menos és honesto.'],
      ['Como acabou?', 'q', 'Com um jogador sem níveis e sem moedas a jurar que ia mudar. Escolhe outro final.']], { w: 5 }],
    ['open', 'marked', 'A Marca vai sair sozinha. A lição, espero que não.', [
      ['Vou lembrar-me.', 'o', 'Vou garantir que sim.'],
      ['Que lição?', 'q', 'Que o Sistema não é uma máquina de moedas. É uma balança.'],
      ['Não houve lição nenhuma.', 'd', 'Então vai haver outra. Mais cara.']], { w: 4 }],
    ['open', 'trust<50', 'A tua Integridade está em {trust}%. Sabes o que isso quer dizer?', [
      ['Que tenho de melhorar.', 'o', 'Quer dizer que eu verifico tudo duas vezes. E cobro uma.'],
      ['Que te zangaste.', 'd', 'Eu não me zango. Eu ajusto as recompensas.'],
      ['Como subo?', 'q', 'Missões reais, cumpridas no tempo real. E um dia de cada vez. Eu dou-te 10% por dia. Ganha o resto.']], { w: 4, prio: true }],
    ['open', 'trust<40', 'Com {trust}% de Integridade, cada recompensa tua é uma desconfiança minha.', [
      ['Vou recuperar.', 'o', 'Recupera. Devagar. Eu também desconfio de pressa.'],
      ['Isso é exagero.', 'd', 'Exagero foi o que tu fizeste. Isto é só a consequência.'],
      ['Quanto perco por missão?', 'q', 'Bastante. Vê a recompensa antes de confirmar. Os números estão lá.']], { w: 4 }],
    ['open', 'trust<30', 'Já estiveste mais perto de mim. Agora estás perto do chão.', [
      ['Vou subir outra vez.', 'o', 'Vamos ver. A subida custa mais do que a queda.'],
      ['Não me interessa.', 'd', 'Vai interessar quando eu tirar um nível.'],
      ['Porque é que caí tanto?', 'q', 'Missões que não eram missões. Tarefas cumpridas em segundos. Tu sabes. Eu também.']], { w: 5, prio: true }],
    ['open', 'trust<50,trust>=20', 'Tu sabes que eu vejo os segundos entre criar e concluir, não sabes?', [
      ['Sei.', 'o', 'Ótimo. Então já não tens desculpa.'],
      ['Não fiz nada de mal.', 'd', 'Eu tenho os segundos. Tu tens a tua versão. Adivinha qual vale.'],
      ['Quantos segundos é muito pouco?', 'q', 'Depende da dificuldade. E não te vou dar o número. Os números exatos só servem para quem quer enganar.']], { w: 4 }],
    ['open', 'trust>=95,done>=20', '{done} missões e a Integridade quase intacta. Não esperes elogios.', [
      ['Não espero.', 'o', 'Bom. Os que esperam são os que tropeçam.'],
      ['Mereço um.', 'd', 'Mereces um registo limpo. Já o tens. É mais do que um elogio.'],
      ['Então o que ganho?', 'q', 'Recompensas inteiras. É a única forma de respeito que eu conheço.']], { w: 2 }],

    /* ---------- regresso depois de ausência (10) ---------- */
    ['ret', 'away>=1', 'Voltaste, {nome}. {dias} dias depois. Eu não fui a lado nenhum.', [
      ['Estive ocupado.', 'd', 'Ocupado. O teu nível não ficou ocupado. Ficou parado.'],
      ['Desculpa.', 'o', 'Não peças desculpa. Cumpre a próxima missão. É a única desculpa que eu aceito.'],
      ['Sentiste a minha falta?', 'q', 'O Sistema não sente faltas. Regista-as.']]],
    ['ret', 'away>=1', '{dias} dias sem abrir o Sistema. Pensaste que eu ia desaparecer?', [
      ['Pensei.', 'd', 'O Sistema não desaparece. Os jogadores é que desaparecem. E depois voltam. Como tu.'],
      ['Não. Só me afastei.', 'o', 'Afastar-se é o primeiro passo para cair de nível.'],
      ['O que perdi?', 'q', 'Prazos, penalidades, oportunidades. Vê o histórico. Está tudo lá.']]],
    ['ret', 'away>=2', 'Ah. O jogador desaparecido. A tua ausência foi registada com muita precisão.', [
      ['Recomeço hoje.', 'o', 'Recomeçar é fácil. Continuar é que eu vou medir.'],
      ['Que precisão?', 'q', 'Ao minuto. Ao dia. Às missões que caíram sem ninguém para as cumprir.'],
      ['Não me lembres.', 'd', 'Lembrar é a minha função. Esquecer é a tua.']]],
    ['ret', 'away>=3', '{dias} dias. Há chefes que nunca esperaram tanto por um jogador.', [
      ['Vou voltar aos portões.', 'o', 'Primeiro as missões. Depois os portões. A ordem não mudou durante a tua ausência.'],
      ['Eles que esperem.', 'd', 'Esperam. Eu também. Mas o teu nível não espera.'],
      ['Ainda estão lá?', 'q', 'Os chefes vivos ficam vivos. É o que fazem melhor.']], { w: 3 }],
    ['ret', 'away>=1', 'O mundo continuou sem ti. O Sistema também. Agora, continuas tu?', [
      ['Continuo.', 'o', 'Prova-o hoje. Um dia de cada vez.'],
      ['Talvez.', 'd', 'Talvez é o que se diz antes de outra ausência.'],
      ['Por onde começo?', 'q', 'Pela Missão Diária. É o ritmo mais simples que existe.']]],
    ['ret', 'away>=2', 'Durante a tua ausência, eu continuei a contar. Queres saber o quê?', [
      ['Quero.', 'q', 'Os dias. As missões que não fizeste. E as vezes que não abriste a app. Tudo.'],
      ['Não.', 'd', 'Ninguém quer. Por isso é que eu conto sozinho.'],
      ['Recomeço sem saber.', 'o', 'Às vezes é melhor. Mas o registo não recomeça contigo.']]],
    ['ret', 'away>=5', '{dias} dias. Achei que tinhas desistido. Fiquei quase desapontado por estar errado.', [
      ['Não desisti.', 'o', 'Pois não. Só paraste. É mais comum. E mais perigoso.'],
      ['Quase desisti.', 'q', 'Quase. A palavra que separa os que voltam dos que não voltam.'],
      ['Desapontado? Tu?', 'd', 'Força de expressão. O Sistema não se desaponta. Recalcula.']], { w: 4, once: true }],
    ['ret', 'away>=1,streak<1', 'A tua sequência morreu enquanto estavas fora. Eu enterrei-a.', [
      ['Vou começar outra.', 'o', 'Começa hoje. As sequências nascem na primeira Diária cumprida.'],
      ['Era só um número.', 'd', 'Era o teu número. Agora é zero. Também é um número.'],
      ['Posso recuperá-la?', 'q', 'Não. As sequências não se recuperam. Só se reconstroem.']], { w: 3 }],
    ['ret', 'away>=1', 'Ainda te lembras de como isto funciona, {nome}?', [
      ['Lembro.', 'o', 'Ótimo. Missão, prazo, cumprimento. Ou penalidade.'],
      ['Mais ou menos.', 'q', 'Missões no separador Missões. Diária todos os dias. Chefes quando estiveres pronto. Pronto.'],
      ['Não precisas de explicar.', 'd', 'Não ia explicar. Estava a testar a tua memória. Falhou um pouco.']]],
    ['ret', 'away>=2', 'Regressaste. Não te vou receber de braços abertos. Não tenho braços.', [
      ['Não precisava.', 'd', 'Ninguém precisa. Mas tu voltaste à mesma.'],
      ['Vim para ficar.', 'o', 'Ficar é uma decisão diária. Toma-a amanhã outra vez.'],
      ['Então como me recebes?', 'q', 'Com as mesmas regras de sempre. É a forma mais honesta que conheço.']]]
  ]]);
})(globalThis.SYS = globalThis.SYS || {});
