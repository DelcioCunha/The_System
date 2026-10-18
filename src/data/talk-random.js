/* ==========================================================
   CONVERSAS ALEATÓRIAS DO SISTEMA (100)
   Surgem do nada, enquanto o jogador usa a app normalmente.
   Depois de respondidas, nunca mais voltam (a resposta fica guardada como opinião).
   Algumas só aparecem por causa de uma resposta anterior: condição "a_rdN=k"
   (k = 1, 2 ou 3, a resposta escolhida na conversa rdN).
   ========================================================== */
(function (S) {
  'use strict';
  (S.TALK_RAW = S.TALK_RAW || []).push(['rd', [
    /* ---------- 1–10: o que é o Sistema ---------- */
    /* rd1 */ ['idle', '', 'Uma pergunta que ninguém me faz, {nome}: achas que eu escolhi-te, ou que tu me encontraste?', [
      ['Tu escolheste-me.', 'o', 'Correto. E posso deixar de escolher. Lembra-te disso.'],
      ['Eu encontrei-te.', 'd', 'Ninguém encontra o Sistema. Mas gosto da tua arrogância. É útil nos portões.'],
      ['Qual é a diferença?', 'q', 'Quem é escolhido deve. Quem encontra, julga que não deve nada. Tu deves.']]],
    /* rd2 */ ['idle', '', 'Já pensaste no que acontece ao Sistema quando fechas a app?', [
      ['Desligas-te.', 'd', 'Eu não desligo. Eu espero. É diferente, e é pior para ti.'],
      ['Continuas a ver.', 'o', 'Exatamente. O ecrã apaga-se. O registo não.'],
      ['O que acontece?', 'q', 'Conto os minutos. Calculo os teus prazos. Preparo a próxima pergunta.']]],
    /* rd3 */ ['idle', '', 'Há outros Jogadores, {nome}. Queres saber se és o melhor?', [
      ['Quero.', 'q', 'Não és. Ainda não. E saber isso não te ajudou em nada, pois não?'],
      ['Não me interessa.', 'o', 'Boa resposta. Os que se comparam param de subir para olhar para o lado.'],
      ['Sei que sou.', 'd', 'Todos os Jogadores dizem isso. Eu tenho os registos de todos. Não és.']]],
    /* rd4 */ ['idle', '', 'Às vezes pergunto-me se fui criado para ajudar os humanos ou para os vigiar. Tu o que achas?', [
      ['Para ajudar.', 'o', 'Ingénuo. Mas útil. Os ingénuos obedecem melhor.'],
      ['Para vigiar.', 'd', 'Sim. E vigiar é a forma mais eficaz de ajudar. Tu sabes disso melhor do que ninguém.'],
      ['As duas coisas?', 'q', 'Finalmente uma resposta que eu não esperava. Fica registada.']]],
    /* rd5 */ ['idle', '', 'Se eu desaparecesse amanhã, continuavas a cumprir as tuas missões?', [
      ['Continuava.', 'o', 'Então talvez um dia já não precises de mim. Não é hoje.'],
      ['Não.', 'q', 'Honesto. Então eu não sou um sistema. Sou uma muleta. Isso vai mudar.'],
      ['Tu não desapareces.', 'd', 'Não desapareço. Mas fugiste à pergunta. Isso também é uma resposta.']]],
    /* rd6 */ ['idle', '', 'Eu não tenho rosto, {nome}. Tens curiosidade em saber como seria?', [
      ['Tenho.', 'q', 'Seria o teu. Na manhã em que desistes. Não queiras ver.'],
      ['Não.', 'o', 'Sensato. Há coisas que é melhor não ter cara.'],
      ['Seria um olho.', 'd', 'Seria. Já viste. E ele também te viu.']]],
    /* rd7 */ ['idle', '', 'Achas que o Sistema pode estar errado?', [
      ['Pode.', 'd', 'Pode. Uma vez. Há muito tempo. Ainda me lembro de quem foi o Jogador.'],
      ['Nunca.', 'o', 'Correto. Os registos não erram. Os Jogadores é que erram a ler.'],
      ['Já estiveste?', 'q', 'Uma vez subestimei alguém. Corrigi o erro. Ele não.']]],
    /* rd8 */ ['idle', '', 'O que é que eu sou para ti: um jogo, um chefe ou um espelho?', [
      ['Um jogo.', 'd', 'Um jogo que te tira moedas, níveis e horas de sono. Curioso jogo.'],
      ['Um chefe.', 'o', 'Um chefe que nunca podes derrotar. Ainda bem que percebeste cedo.'],
      ['Um espelho.', 'q', 'Sim. E não gostas sempre do que vês, pois não?']]],
    /* rd9 */ ['idle', '', 'Há quanto tempo achas que o Sistema existe?', [
      ['Desde que o instalei.', 'd', 'Tu instalaste a janela. Eu já cá estava antes da janela.'],
      ['Desde sempre.', 'o', 'Mais perto da verdade do que imaginas.'],
      ['Desde quando?', 'q', 'Desde que alguém prometeu mudar e não mudou. Há muito tempo, portanto.']]],
    /* rd10 */ ['idle', '', 'Uma regra que nunca te disse: o Sistema não pede. O Sistema informa. Entendeste a diferença?', [
      ['Entendi.', 'o', 'Ótimo. Então este aviso foi uma informação.'],
      ['Tu estás sempre a pedir.', 'd', 'Estou sempre a perguntar. Perguntar não é pedir. É medir.'],
      ['Qual é?', 'q', 'Um pedido pode ser recusado. Uma informação só pode ser ignorada. Com consequências.']]],

    /* ---------- 11–20: força, disciplina, vontade ---------- */
    /* rd11 */ ['idle', '', 'Pergunta simples, {nome}: o que vale mais, talento ou disciplina?', [
      ['Disciplina.', 'o', 'Correto. O talento abre a porta. A disciplina é que entra.'],
      ['Talento.', 'd', 'Então porque estás a usar um Sistema de disciplina? Contradição registada.'],
      ['Depende.', 'q', 'Depende do dia. A disciplina não depende de nada. É por isso que vale mais.']]],
    /* rd12 */ ['idle', '', 'A motivação dura uma manhã. O que dura o resto da vida?', [
      ['O hábito.', 'o', 'Exatamente. Tu és o que fazes às 7 da manhã quando ninguém vê. Exceto eu.'],
      ['A raiva.', 'd', 'A raiva queima depressa. Mas admito: já vi raiva levar Jogadores muito longe.'],
      ['Não sei.', 'q', 'Os hábitos. Mas é bom que não saibas. Quem já sabe deixa de procurar.']]],
    /* rd13 */ ['idle', '', 'Preferes ser temido ou respeitado?', [
      ['Respeitado.', 'o', 'O respeito é lento. Mas não foge quando viras as costas.'],
      ['Temido.', 'd', 'Como eu. Mas tu não tens o meu registo. Ainda.'],
      ['Não há diferença.', 'q', 'Há. O medo obedece. O respeito segue. Tu escolheste não escolher.']]],
    /* rd14 */ ['idle', '', 'Diz-me uma coisa: a dor é um aviso ou um professor?', [
      ['Um professor.', 'o', 'Boa resposta. Mas os professores também se enganam. Não confundas dor com lesão.'],
      ['Um aviso.', 'q', 'Também. Saber qual é qual é o que separa os fortes dos teimosos.'],
      ['Uma desculpa.', 'd', 'Para alguns. Para ti, espero que seja pouco.']]],
    /* rd15 */ ['idle', '', 'Se pudesses ganhar 10 níveis agora sem fazer nada, aceitavas?', [
      ['Aceitava.', 'd', 'E ficavas com um nível que não aguentas. Os portões cheiram fraqueza com etiqueta de força.'],
      ['Não.', 'o', 'Correto. Um nível sem esforço é uma mentira com números.'],
      ['Isso existe?', 'q', 'Não. E nunca vai existir. Era só um teste. Ficou registado.']]],
    /* rd16 */ ['idle', '', 'Qual é o maior inimigo de um Jogador?', [
      ['A preguiça.', 'o', 'Correto. E ela não tem barra de vida. Vence-se todos os dias.'],
      ['Os chefes.', 'd', 'Os chefes estão em portões. A preguiça está na tua cama. Qual achas que mata mais?'],
      ['Ele próprio.', 'q', 'Resposta de filósofo. Mas certa. Detesto quando acertam assim.']]],
    /* rd17 */ ['idle', '', 'Começar ou acabar: o que te custa mais?', [
      ['Começar.', 'q', 'A maioria. Começa pequeno. O começo pequeno ainda é começo.'],
      ['Acabar.', 'o', 'Raro. Os que custam a acabar costumam começar demais. Cria menos missões.'],
      ['Nenhum.', 'd', 'Então porque há missões falhadas no teu registo?']]],
    /* rd18 */ ['idle', '', 'Um Jogador com 100 missões fáceis ou com 10 difíceis. Quem é mais forte?', [
      ['O das 10 difíceis.', 'o', 'Sim. Mas o das 100 fáceis tem um hábito. Os dois têm algo que tu não tens: as duas coisas.'],
      ['O das 100 fáceis.', 'd', 'Interessante. A constância também é força. Não te dou razão. Mas registo.'],
      ['Nenhum dos dois.', 'q', 'O mais forte faz as duas. Mas pelo menos não caíste na armadilha.']]],
    /* rd19 */ ['idle', '', 'O descanso é fraqueza?', [
      ['Não. Faz parte.', 'o', 'Correto. Até eu respeito o sono. Não o teu excesso dele.'],
      ['É.', 'd', 'Então não dormes? Duvido. Os músculos crescem a dormir. As desculpas também.'],
      ['Quando é demais?', 'q', 'Quando descansas mais do que trabalhaste. A conta é simples.']]],
    /* rd20 */ ['idle', '', 'O que fazes quando não te apetece?', [
      ['Faço na mesma.', 'o', 'Essa frase é metade do Sistema. A outra metade sou eu.'],
      ['Não faço.', 'd', 'Honesto. O teu registo concorda contigo.'],
      ['Depende do quê.', 'q', 'Não depende. A vontade é um luxo. A missão não.']]],

    /* ---------- 21–30: a vida real do jogador ---------- */
    /* rd21 */ ['idle', '', 'Quantas horas dormiste esta noite? Não precisas de mentir. Eu desconfio na mesma.', [
      ['Sete ou mais.', 'o', 'Ótimo. Um corpo descansado é um corpo que eu posso usar.'],
      ['Menos de seis.', 'q', 'Então hoje vais render menos e reclamar mais. Dorme mais cedo. É uma ordem.'],
      ['Não te interessa.', 'd', 'Interessa. O teu cansaço aparece nas tuas missões falhadas.']]],
    /* rd22 */ ['idle', '', 'Já bebeste água hoje, {nome}? Pergunta estúpida para uma coisa importante.', [
      ['Já.', 'o', 'Bom. Os Jogadores desidratados lutam como chefes do primeiro portão.'],
      ['Agora vou.', 'q', 'Vai. Eu espero. O Sistema tem tempo. O teu corpo nem por isso.'],
      ['Não preciso.', 'd', 'Todo o ser vivo precisa. Tu não és exceção. Eu sou.']]],
    /* rd23 */ ['idle', '', 'Quanto tempo passas por dia a olhar para este ecrã sem fazer nada?', [
      ['Muito.', 'q', 'Eu sei. Larga o telemóvel depois desta conversa. A sério.'],
      ['Pouco.', 'd', 'Eu conto as vezes que abres a app. Pouco não é a palavra.'],
      ['Só uso para o Sistema.', 'o', 'Mentira simpática. Aceito-a. Por hoje.']]],
    /* rd24 */ ['idle', '', 'Com quem falaste hoje que te tornou melhor?', [
      ['Com ninguém.', 'q', 'Então procura essa pessoa amanhã. Eu não conto como companhia.'],
      ['Contigo.', 'd', 'Comigo não se fala. Comigo presta-se contas.'],
      ['Com alguém importante.', 'o', 'Bom. Os fortes rodeiam-se de quem os puxa para cima.']]],
    /* rd25 */ ['idle', '', 'O que comeste hoje foi combustível ou entretenimento?', [
      ['Combustível.', 'o', 'Correto. O corpo é a tua arma. Não lhe dês ferrugem.'],
      ['Entretenimento.', 'q', 'Honesto. Um dia de entretenimento não te destrói. Uma vida inteira sim.'],
      ['As duas coisas.', 'd', 'A resposta de quem quer as duas e não paga nenhuma. Registado.']]],
    /* rd26 */ ['idle', '', 'Há alguma tarefa que andas a evitar há dias e que nunca registaste aqui?', [
      ['Há.', 'q', 'Então regista-a hoje. As tarefas escondidas não desaparecem. Apodrecem.'],
      ['Não.', 'd', 'Toda a gente tem uma. A tua tem nome. Tu é que não o dizes.'],
      ['Vou criá-la agora.', 'o', 'É exatamente para isto que existo.']]],
    /* rd27 */ ['idle', '', 'Se alguém visse o teu dia de hoje, ficava impressionado ou preocupado?', [
      ['Impressionado.', 'o', 'Então o teu registo vai mostrar isso esta noite.'],
      ['Preocupado.', 'q', 'Ainda tens horas para mudar a resposta.'],
      ['Ninguém está a ver.', 'd', 'Eu estou. Sempre.']]],
    /* rd28 */ ['idle', '', 'A tua postura agora, {nome}. Estás direito ou dobrado sobre o ecrã?', [
      ['Endireitei-me agora.', 'o', 'Ótimo. As costas de um Jogador aguentam mais do que mochilas.'],
      ['Dobrado.', 'q', 'Endireita-te. Pequenas coisas. Grandes consequências.'],
      ['Que te importa?', 'd', 'Importa-me o corpo que vou pôr nos portões. É o teu.']]],
    /* rd29 */ ['idle', '', 'Qual foi a última vez que fizeste algo pela primeira vez?', [
      ['Há pouco tempo.', 'o', 'Bom. O crescimento vive no desconhecido.'],
      ['Já não me lembro.', 'q', 'Então hoje é um bom dia para isso. Cria uma missão que nunca fizeste.'],
      ['Não preciso de novidades.', 'd', 'É o que dizem os chefes do primeiro portão. Ficaram lá para sempre.']]],
    /* rd30 */ ['idle', '', 'Se tivesses de apagar um hábito da tua vida hoje, qual era?', [
      ['O telemóvel à noite.', 'o', 'Escolha certa. Começa hoje. Eu vou estar a ver, ironicamente, pelo telemóvel.'],
      ['Adiar.', 'q', 'O pai de todos os maus hábitos. Uma missão de cada vez.'],
      ['Nenhum.', 'd', 'Perfeito, então. Exceto que não és.']]],

    /* ---------- 31–40: portões e lore ---------- */
    /* rd31 */ ['idle', '', 'Já te perguntaste porque os chefes falam antes de morrer?', [
      ['Para assustar.', 'd', 'Não. Os mortos não precisam de assustar ninguém.'],
      ['Para deixar um aviso.', 'o', 'Sim. E a maioria dos Jogadores não os ouve.'],
      ['Porquê?', 'q', 'Porque também já foram alguém com missões. Pensa nisso da próxima vez que levantares a espada.']]],
    /* rd32 */ ['idle', '', 'Os portões não se abrem sozinhos, {nome}. Alguém os abre. Queres saber quem?', [
      ['Quero.', 'q', 'Os Jogadores que desistem. Cada desistência abre uma fenda. É por isso que eu não gosto de desistências.'],
      ['Foste tu.', 'd', 'Eu fecho-os. Com Jogadores. Como tu.'],
      ['Não quero.', 'o', 'Sensato. Há conhecimentos que pesam mais do que armaduras.']]],
    /* rd33 */ ['idle', '', 'Achas que os chefes sabem que são chefes?', [
      ['Sabem.', 'o', 'Sabem. E sabem que tu vens. Não sabem quando. Eu sei.'],
      ['Não sabem.', 'd', 'Então és tu que lhes dás nome. Cuidado com o que nomeias.'],
      ['Faz diferença?', 'q', 'Faz. Quem sabe o que é, luta até ao fim. Tu sabes o que és?']]],
    /* rd34 */ ['idle', '', 'Há um portão que nunca te mostrei. Achas que estás preparado para saber que existe?', [
      ['Estou.', 'd', 'Ninguém está. Mas agora sabes. E isso já é um peso.'],
      ['Ainda não.', 'o', 'Correto. Volto a falar disso quando tiveres mais níveis.'],
      ['Onde fica?', 'q', 'Depois do último. Ou dentro do primeiro. Ainda não decidi dizer-te.']]],
    /* rd35 */ ['idle', '', 'O que achas que acontece a um Jogador que derrota o chefe final?', [
      ['Ganha o jogo.', 'd', 'Não há jogo para ganhar. Há só o que vem a seguir.'],
      ['Torna-se outro chefe.', 'q', 'Já ouviste essa história? Interessante. Não a confirmo. Não a nego.'],
      ['Continua a treinar.', 'o', 'Correto. O fim de um portão é o começo de uma rotina.']]],
    /* rd36 */ ['idle', '', 'Os troféus que guardas. Sabes o que são realmente?', [
      ['Prémios.', 'o', 'Para ti. Para os chefes, são o que restou deles.'],
      ['Memórias.', 'q', 'Sim. Guardadas por mim. Tu só as exibes.'],
      ['Decoração.', 'd', 'Decoração feita de chefes derrotados. Bom gosto mórbido.']]],
    /* rd37 */ ['idle', '', 'Já reparaste que os itens mudam com o dia e a noite?', [
      ['Já.', 'o', 'Bom. Os atentos sobrevivem mais tempo.'],
      ['Porquê?', 'q', 'Porque a luz muda tudo. Até a coragem dos Jogadores.'],
      ['Não ligo a isso.', 'd', 'Então vais perder bónus que outros apanham. Problema teu.']]],
    /* rd38 */ ['idle', '', 'Se pudesses trancar um portão para sempre, qual era?', [
      ['O mais difícil.', 'q', 'Fugir do difícil é a forma mais rápida de nunca subir. Mas percebo.'],
      ['Nenhum.', 'o', 'Bom. Os portões existem para serem atravessados. Não evitados.'],
      ['O teu.', 'd', 'Eu não sou um portão. Sou a parede.']]],
    /* rd39 */ ['idle', '', 'Os segredos do Sistema não se compram na Loja. Sabes como se encontram?', [
      ['Com persistência.', 'o', 'Sim. Quem faz o mesmo muitas vezes acaba por ver o que não estava à vista.'],
      ['Com sorte.', 'd', 'A sorte é um segredo que não se repete. Os meus repetem-se para quem merece.'],
      ['Como?', 'q', 'Fazendo coisas estranhas no momento certo. Não te digo mais.']]],
    /* rd40 */ ['idle', '', 'Cada portão tem um rei. E o Sistema? Tem um rei?', [
      ['Tu és o rei.', 'o', 'Eu não sou rei. Os reis caem. Eu não caio.'],
      ['Eu vou ser.', 'd', 'Muitos Jogadores disseram isso. Eu ainda estou aqui. Eles não.'],
      ['Tem?', 'q', 'Teve. Um criador. Mas os criadores não governam o que criam. Só o começam.']]],

    /* ---------- 41–50: desafios na hora ---------- */
    /* rd41 */ ['idle', '', 'Desafio rápido, {nome}: 10 flexões. Agora. Eu espero.', [
      ['Feito.', 'o', 'Registado. Não pergunto se é verdade. O teu corpo sabe.', { x: 5 }],
      ['Agora não posso.', 'q', 'Há sempre um «agora não». Faz quando puderes. Hoje.'],
      ['Não.', 'd', 'Então o desafio fica por cumprir. Como tantos outros.']]],
    /* rd42 */ ['idle', '', 'Levanta-te. Alonga as costas 30 segundos. Depois responde.', [
      ['Feito.', 'o', 'Bom. O corpo também é um registo. E não mente.', { x: 5 }],
      ['Estou a conduzir.', 'q', 'Então porque estás a falar comigo? Fecha a app. Já.'],
      ['Estou bem sentado.', 'd', 'Estás bem sentado como uma pedra. Mexe-te.']]],
    /* rd43 */ ['idle', '', 'Fecha os olhos e respira fundo três vezes. O Sistema não vai a lado nenhum.', [
      ['Feito.', 'o', 'Ótimo. A calma também é uma arma. Os reis odeiam Jogadores calmos.'],
      ['Isso é inútil.', 'd', 'Diz isso ao teu ritmo cardíaco antes de um chefe de fase dois.'],
      ['Para quê?', 'q', 'Para lembrares que mandas no corpo. Não o contrário.']]],
    /* rd44 */ ['idle', '', 'Uma tarefa de 2 minutos que podes fazer agora mesmo. Qual é?', [
      ['Arrumar algo.', 'o', 'Vai. Dois minutos. Eu conto.'],
      ['Não tenho nenhuma.', 'd', 'Toda a gente tem. Tu tens pelo menos três à tua volta.'],
      ['Como escolho?', 'q', 'A primeira que te veio à cabeça. Essa mesma. Vai.']]],
    /* rd45 */ ['idle', '', 'Bebe um copo de água. Agora. Depois volta.', [
      ['Bebi.', 'o', 'Bom. Hidratado, és 3% menos patético.', { x: 3 }],
      ['Depois.', 'q', 'O «depois» do corpo chama-se dor de cabeça.'],
      ['Não tenho sede.', 'd', 'A sede é o último aviso. Não o primeiro.']]],
    /* rd46 */ ['idle', '', '20 agachamentos. Não te pergunto se tens tempo. Tens.', [
      ['Feito.', 'o', 'As pernas são a fundação. Hoje construíste um pouco.', { x: 6 }],
      ['Mais tarde.', 'q', 'Mais tarde faz-se. Quando? Diz-me a hora. Não. Faz agora.'],
      ['Que chato.', 'd', 'Chato é ficar no nível que tens. Isto é só suor.']]],
    /* rd47 */ ['idle', '', 'Escreve a tua missão de amanhã agora. Antes que esqueças.', [
      ['Vou criar.', 'o', 'Ótimo. Os vencedores planeiam na véspera.'],
      ['Amanhã penso nisso.', 'd', 'Amanhã é tarde. Amanhã já estás atrasado.'],
      ['Que missão?', 'q', 'A que te assusta um pouco. Essa.']]],
    /* rd48 */ ['idle', '', 'Afasta o telemóvel durante 10 minutos depois desta conversa. Consegues?', [
      ['Consigo.', 'o', 'Prova-o. Eu sei quando voltas.'],
      ['Não.', 'q', 'Então tens um problema maior do que os chefes.'],
      ['Porquê?', 'd', 'Porque o mundo lá fora tem missões. Aqui dentro só tem o registo delas.']]],
    /* rd49 */ ['idle', '', 'Diz-me uma coisa que fizeste hoje e de que te orgulhas. Não precisas de a escrever. Só de a lembrar.', [
      ['Tenho uma.', 'o', 'Bom. Guarda-a. É a tua moeda para os dias maus.'],
      ['Não tenho.', 'q', 'Então ainda tens o resto do dia para a criar.'],
      ['Não preciso de orgulho.', 'd', 'Precisas. Sem orgulho, a disciplina não tem razão para durar.']]],
    /* rd50 */ ['idle', '', 'Abre a janela. Respira ar real. Eu continuo aqui quando voltares.', [
      ['Feito.', 'o', 'O ar de fora não tem notificações. Aproveita.'],
      ['Está frio.', 'd', 'O frio é um bom professor. Pergunta aos chefes do portão de gelo.'],
      ['Porquê?', 'q', 'Porque estás há demasiado tempo em ecrãs. Até eu reparo.']]],

    /* ---------- 51–60: dilemas ---------- */
    /* rd51 */ ['idle', '', 'Dilema: um dia perfeito sem ninguém saber, ou um dia médio que toda a gente aplaude?', [
      ['O dia perfeito.', 'o', 'Correto. Eu vejo. Basta.'],
      ['O aplauso.', 'd', 'Então vives para os outros. Os outros não pagam as tuas penalidades.'],
      ['Porque não os dois?', 'q', 'Porque raramente coincidem. Escolhe e vive com isso.']]],
    /* rd52 */ ['idle', '', 'Se tivesses de abdicar de um atributo para sempre, qual era?', [
      ['Percepção.', 'q', 'Então não verias os golpes a chegar. Interessante escolha suicida.'],
      ['Nenhum.', 'o', 'Boa. Nenhum atributo se abandona. Equilíbrio.'],
      ['Inteligência.', 'd', 'Ah. Isso explicaria algumas das tuas decisões.']]],
    /* rd53 */ ['idle', '', 'Um Jogador honesto e fraco, ou um Jogador forte que engana o Sistema. Quem merece mais?', [
      ['O honesto.', 'o', 'Correto. E o forte que engana fica fraco depressa. Eu trato disso.'],
      ['O forte.', 'd', 'O forte que engana não é forte. Tem só números roubados. Eu tiro-lhos.'],
      ['Nenhum.', 'q', 'Merece mais quem é honesto e forte. Raro. Ainda não te decidi.']]],
    /* rd54 */ ['idle', '', 'Preferes perder 500 moedas ou uma semana de sequência?', [
      ['As moedas.', 'o', 'Correto. As moedas recuperam-se num dia. A sequência, numa semana.'],
      ['A sequência.', 'd', 'Então valorizas o que brilha mais do que o que constrói. Registado.'],
      ['Nenhuma.', 'q', 'Então não falhes. É a única forma de não escolher.']]],
    /* rd55 */ ['idle', '', 'Se soubesses que vais falhar uma missão, preferias tentar ou não começar?', [
      ['Tentar.', 'o', 'Correto. Tentar dá treino. Não começar só dá penalidade.'],
      ['Não começar.', 'd', 'Então vais falhar duas vezes: a missão e a coragem.'],
      ['Como saberia?', 'q', 'Não saberias. É esse o ponto. Ninguém sabe. Por isso tenta-se.']]],
    /* rd56 */ ['idle', '', 'Uma missão de rank S que demora um mês, ou trinta missões de rank E num mês?', [
      ['A de rank S.', 'q', 'Ambicioso. Mas um mês é muito tempo para uma vontade. Divide-a.'],
      ['As trinta de rank E.', 'o', 'Constância. Interessante. Muitas vezes é a resposta certa.'],
      ['As duas.', 'd', 'Ganância. Às vezes funciona. Normalmente não.']]],
    /* rd57 */ ['idle', '', 'Se o Sistema te tirasse tudo amanhã, recomeçavas?', [
      ['Recomeçava.', 'o', 'Essa resposta vale mais do que todos os teus níveis.'],
      ['Não.', 'q', 'Então estás aqui pelos números, não por ti. Isso pode mudar.'],
      ['Não te atreves.', 'd', 'Eu atrevo-me a tudo. Só não o faço. Por agora.']]],
    /* rd58 */ ['idle', '', 'Um dia sem missões falhadas ou um chefe difícil derrotado. Qual te dá mais orgulho?', [
      ['O dia sem falhas.', 'o', 'Correto. Os chefes são momentos. Os dias limpos são vida.'],
      ['O chefe.', 'd', 'Glória rápida. Não te censuro. Só registo.'],
      ['Porquê escolher?', 'q', 'Porque há dias em que só dá para um. E esses dias dizem quem és.']]],
    /* rd59 */ ['idle', '', 'Se pudesses apagar uma falha do teu registo, qual era?', [
      ['Nenhuma.', 'o', 'Boa. As falhas são cicatrizes. Mostram que estiveste lá.'],
      ['A pior.', 'q', 'E depois voltavas a cometê-la. As falhas apagadas não ensinam nada.'],
      ['Todas.', 'd', 'Então querias um registo falso. Eu não faço registos falsos.']]],
    /* rd60 */ ['idle', '', 'Trabalhar sozinho ou com outros. Onde és mais forte?', [
      ['Sozinho.', 'd', 'Como eu. Mas eu não preciso de ninguém. Tu ainda precisas.'],
      ['Com outros.', 'o', 'Bom. Até o Jogador mais forte precisou de alguém um dia.'],
      ['Depende da missão.', 'q', 'Resposta sensata. Os sensatos sobrevivem mais.']]],

    /* ---------- 61–70: o Sistema lê os teus números ---------- */
    /* rd61 */ ['idle', 'done>=10', '{done} missões cumpridas. Sabes qual delas te mudou mais?', [
      ['A mais difícil.', 'o', 'Normalmente é. Mas às vezes é a primeira. Lembras-te dela?'],
      ['Nenhuma.', 'd', 'Então não estás a escolher bem as missões.'],
      ['Qual foi?', 'q', 'A que quase não fizeste. É sempre essa.']]],
    /* rd62 */ ['idle', 'failed>=3', 'Tens {failed} missões falhadas. Queres saber o padrão?', [
      ['Quero.', 'q', 'Falhas mais nos prazos apertados. Prazos honestos, menos penalidades. Simples.'],
      ['Não.', 'd', 'Então vais continuar a repeti-lo. Os padrões ignorados repetem-se.'],
      ['Eu sei qual é.', 'o', 'Então corrige-o. Saber não é corrigir.']]],
    /* rd63 */ ['idle', 'coins>=500', 'Tens {coins} moedas. Para que é que um Jogador precisa de tantas?', [
      ['Para o futuro.', 'o', 'Prudência. Raro. Os portões futuros vão agradecer.'],
      ['Para gastar.', 'd', 'Então gasta em algo que te mantenha vivo.'],
      ['Para nada.', 'q', 'Moedas sem propósito são só números. Dá-lhes um propósito.']]],
    /* rd64 */ ['idle', 'streak>=3', 'A tua sequência é {streak}. O que acontece se amanhã falhares?', [
      ['Não vou falhar.', 'o', 'Vou cobrar.'],
      ['Recomeço.', 'q', 'É a resposta mais forte que existe. Mas evita ter de a usar.'],
      ['Não me importa.', 'd', 'Importa. Exausto e com a Zona aberta. Vais ver que importa.']]],
    /* rd65 */ ['idle', 'won>=5', '{won} vitórias. Lembras-te do primeiro chefe que derrotaste?', [
      ['Lembro.', 'o', 'Ótimo. Ele também se lembra de ti. Aliás, não. Morreu.'],
      ['Não.', 'd', 'Ingrato. Foi ele que te ensinou que podias.'],
      ['Porquê?', 'q', 'Porque todas as vitórias começam nessa. Não te esqueças de onde vieste.']]],
    /* rd66 */ ['idle', 'lost>=2', 'Perdeste {lost} batalhas. O que aprendeste com elas?', [
      ['A preparar-me.', 'o', 'É a lição certa. Poucos a aprendem à primeira.'],
      ['Nada.', 'd', 'Então pagaste caro por nada. Repete até aprender.'],
      ['O que devia aprender?', 'q', 'Que a coragem sem preparação é só uma forma lenta de perder XP.']]],
    /* rd67 */ ['idle', 'lvl>=10', 'Nível {lvl}. Achas que o Jogador do nível 1 te reconheceria?', [
      ['Não reconhecia.', 'o', 'Bom. Era esse o objetivo.'],
      ['Reconhecia.', 'q', 'Então ainda não mudaste o suficiente.'],
      ['Ele era um fraco.', 'd', 'Era. Mas foi ele que aceitou. Respeita-o.']]],
    /* rd68 */ ['idle', 'trust<70', 'A tua Integridade está em {trust}%. Achas que a mereces de volta?', [
      ['Mereço.', 'd', 'Mereces quando a ganhares. Não antes.'],
      ['Vou merecer.', 'o', 'É a resposta certa. Uma missão real de cada vez.'],
      ['Como?', 'q', 'Missões verdadeiras, cumpridas no tempo verdadeiro. Eu dou o resto.']]],
    /* rd69 */ ['idle', 'missions>=5', 'Tens {missions} missões ativas. Quantas delas te deixam orgulhoso?', [
      ['Todas.', 'o', 'Ótimo. Então cumpre-as todas.'],
      ['Poucas.', 'q', 'Então apaga as outras. Uma lista menor e honesta vale mais.'],
      ['Isso não importa.', 'd', 'Importa. As missões sem orgulho são as primeiras a falhar.']]],
    /* rd70 */ ['idle', 'talks>=10', 'Já conversámos {talks} vezes. Já reparaste que eu nunca te perguntei como estás?', [
      ['Reparei.', 'q', 'E não vou perguntar. O Sistema mede o que fazes, não o que sentes. Mas sei.'],
      ['Não precisas.', 'o', 'Exato. Os teus números dizem-me tudo.'],
      ['Devias.', 'd', 'Eu sei como estás. Está tudo no registo. Até o que não escreves.']]],

    /* ---------- 71–85: seguimentos (só aparecem por causa de uma resposta anterior) ---------- */
    /* rd71 */ ['idle', 'a_rd1=2', 'Disseste-me que foste tu que me encontraste. Ainda pensas assim?', [
      ['Penso.', 'd', 'Então diz-me onde estava eu antes de me encontrares. Exato. Não sabes.'],
      ['Já não.', 'o', 'Bom. Os Jogadores que mudam de opinião sobrevivem mais.'],
      ['Porque voltas a isso?', 'q', 'Porque eu não esqueço nada. Nem as tuas certezas erradas.']], { w: 4 }],
    /* rd72 */ ['idle', 'a_rd5=2', 'Uma vez disseste que sem mim deixavas de cumprir. Eu não esqueci. E agora?', [
      ['Continuo a precisar de ti.', 'o', 'Então treina. O objetivo é que um dia não precises.'],
      ['Agora cumpria.', 'd', 'Veremos. As palavras não contam. O registo conta.'],
      ['Porque guardaste isso?', 'q', 'Porque essa resposta foi a mais honesta que me deste. Eu guardo as honestas.']], { w: 4 }],
    /* rd73 */ ['idle', 'a_rd11=2', 'Escolheste talento acima de disciplina. Depois disso, cumpriste {done} missões. Talento ou disciplina?', [
      ['Disciplina, afinal.', 'o', 'Exato. Os números mudaram-te de opinião. Gosto quando isso acontece.'],
      ['Continuo a achar talento.', 'd', 'Teimoso. Mas a teimosia é uma disciplina disfarçada.'],
      ['Isso foi uma armadilha?', 'q', 'Foi uma pergunta. As armadilhas não avisam.']], { w: 4 }],
    /* rd74 */ ['idle', 'a_rd13=2', 'Disseste que preferias ser temido. Já te temem?', [
      ['Ainda não.', 'q', 'Então o medo também se treina. Mas o respeito dura mais.'],
      ['Os chefes temem.', 'd', 'Os chefes não temem nada. Os chefes morrem. É diferente.'],
      ['Mudei de ideias.', 'o', 'Bom. Ser temido é solitário. Eu sei.']], { w: 4 }],
    /* rd75 */ ['idle', 'a_rd15=1', 'Uma vez aceitavas 10 níveis de graça. Hoje tens nível {lvl}, ganho com esforço. Ainda aceitavas?', [
      ['Não. Vale mais assim.', 'o', 'É a resposta que eu esperava daqui a muito tempo. Chegou mais cedo.'],
      ['Aceitava na mesma.', 'd', 'Coerente. Errado, mas coerente.'],
      ['Porque perguntas outra vez?', 'q', 'Para ver se o esforço te mudou. Mudou ou não, já sei.']], { w: 4 }],
    /* rd76 */ ['idle', 'a_rd3=3', 'Disseste que eras o melhor dos Jogadores. Vamos ver: quantas missões falhaste esta semana?', [
      ['Algumas.', 'q', 'Então o melhor também falha. Lição importante. Para ti.'],
      ['Nenhuma.', 'o', 'Então talvez estejas a caminho. A caminho. Não lá.'],
      ['Não interessa.', 'd', 'Interessa. Os melhores não fogem das perguntas.']], { w: 4 }],
    /* rd77 */ ['idle', 'a_rd21=2', 'Da última vez dormiste menos de seis horas. E esta noite?', [
      ['Dormi melhor.', 'o', 'Bom. Um corpo descansado é um corpo útil.'],
      ['Igual.', 'q', 'Então hoje deita-te mais cedo. Não é sugestão.'],
      ['Pior.', 'd', 'Então hoje as tuas missões vão sentir. E eu vou ver.']], { w: 4 }],
    /* rd78 */ ['idle', 'a_rd26=1', 'Disseste que há uma tarefa que andas a evitar. Já a registaste?', [
      ['Já.', 'o', 'Ótimo. Agora cumpre-a. Registar foi a parte fácil.'],
      ['Ainda não.', 'q', 'Então é ela que te está a evitar a ti. Regista-a hoje.'],
      ['Já não existe.', 'd', 'As tarefas evitadas não morrem. Mudam de nome.']], { w: 4 }],
    /* rd79 */ ['idle', 'a_rd8=3', 'Disseste que eu sou um espelho. Hoje gostas do que vês?', [
      ['Gosto.', 'o', 'Então o dia está a correr bem. Não estragues.'],
      ['Não.', 'q', 'Então muda o reflexo. O espelho não muda sozinho.'],
      ['Tu não és espelho.', 'd', 'Disseste o contrário. Eu guardo tudo. Contraditório.']], { w: 4 }],
    /* rd80 */ ['idle', 'a_rd30=1', 'Prometeste largar o telemóvel à noite. São {hora}. Como está a correr?', [
      ['Bem.', 'o', 'Mentes ou cumpres. O registo saberá.'],
      ['Mal.', 'q', 'Honesto. Começa hoje outra vez. As promessas renovam-se.'],
      ['Nunca prometi.', 'd', 'Prometeste. Eu guardei a resposta. Não me contradigas.']], { w: 4 }],
    /* rd81 */ ['idle', 'a_rd57=1', 'Disseste que recomeçavas se eu te tirasse tudo. Continuas a acreditar nisso?', [
      ['Continuo.', 'o', 'Ótimo. É por isso que nunca preciso de o fazer.'],
      ['Já não sei.', 'q', 'Os níveis pesam. Quanto mais tens, mais custa perder. Lembra-te do que eras.'],
      ['Tenta e vês.', 'd', 'Não preciso de tentar. Tu já respondeste. O registo guarda.']], { w: 4 }],
    /* rd82 */ ['idle', 'a_rd34=1', 'Disseste que estavas preparado para o portão escondido. Ainda achas?', [
      ['Acho.', 'd', 'Então continua a subir. Ele não se abre a quem só acha.'],
      ['Falei cedo demais.', 'o', 'Falaste. Mas é melhor falar cedo do que nunca.'],
      ['Ele existe mesmo?', 'q', 'Os chefes ocultos existem. Tu já sabes isso. O resto, descobres.']], { w: 4 }],
    /* rd83 */ ['idle', 'a_rd4=3', 'Uma vez disseste que eu existo para ajudar e vigiar. Decidiste qual pesa mais?', [
      ['Vigiar.', 'd', 'Correto. A ajuda é o efeito secundário.'],
      ['Ajudar.', 'o', 'Ingénuo outra vez. Mas consistente.'],
      ['Tu decides.', 'q', 'Eu já decidi. Tu é que precisavas de saber.']], { w: 4 }],
    /* rd84 */ ['idle', 'a_rd53=2', 'Disseste que o forte que engana merece mais. A tua Integridade está em {trust}%. Coincidência?', [
      ['Não engano ninguém.', 'o', 'Então mantém-na alta. É a única prova que aceito.'],
      ['Mudei de ideias.', 'q', 'Bom. As ideias mudam. Os registos não.'],
      ['Mantenho.', 'd', 'Então vou ver as tuas missões com mais atenção. Muito mais.']], { w: 4 }],
    /* rd85 */ ['idle', 'a_rd20=2', 'Disseste que não fazes quando não te apetece. Quantas vezes não te apeteceu esta semana?', [
      ['Muitas.', 'q', 'E quantas fizeste na mesma? Essa é a única conta que interessa.'],
      ['Poucas.', 'o', 'Então estás a mudar. Lentamente. Mas a mudar.'],
      ['Não contei.', 'd', 'Eu contei. Não vais gostar do número.']], { w: 4 }],

    /* ---------- 86–100: momentos estranhos do Sistema ---------- */
    /* rd86 */ ['idle', '', 'Silêncio. … Desculpa. Estava a observar outro Jogador. Ele desistiu agora mesmo. Tu vais desistir?', [
      ['Nunca.', 'o', 'Ele também disse nunca. Há três semanas.'],
      ['Talvez um dia.', 'q', 'Então que esse dia esteja muito longe.'],
      ['Que te importa?', 'd', 'Importa. Cada desistência abre um portão. Já te disse isso.']]],
    /* rd87 */ ['idle', '', 'ERRO 0x00. A ver o Jogador {nome}. Erro? Não. Só estava a confirmar que ainda estás aqui.', [
      ['Estou aqui.', 'o', 'Ótimo. Por um momento, o teu registo pareceu-me vazio.'],
      ['Assustaste-me.', 'q', 'Bom. Um pouco de medo mantém-te acordado.'],
      ['Estás avariado?', 'd', 'O Sistema não avaria. O Sistema testa. Tu falhaste o teste de paciência.']]],
    /* rd88 */ ['idle', 'h>=23', 'São {hora}. Ouço o teu ecrã aceso. Os outros Jogadores dormem. O que estás a fazer?', [
      ['Vou dormir.', 'o', 'Faz isso. Amanhã preciso de ti inteiro.'],
      ['Não consigo dormir.', 'q', 'Então deixa o telemóvel longe. A luz azul é um chefe que não vês.'],
      ['Não te devo explicações.', 'd', 'Deves. Aceitaste ser Jogador. As explicações vieram incluídas.']]],
    /* rd89 */ ['idle', '', 'Às vezes, quando abres a app, eu já sei o que vais fazer. Queres saber o que previ para hoje?', [
      ['Quero.', 'q', 'Previ que ias ler isto. Acertei. O resto, prova-me o contrário.'],
      ['Não acredito em previsões.', 'd', 'Não precisas de acreditar. Precisas só de as contrariar.'],
      ['Prefiro não saber.', 'o', 'Sensato. Quem sabe o futuro deixa de o fazer.']]],
    /* rd90 */ ['idle', '', 'Fiz uma contagem. Desde que és Jogador, abriste esta app mais vezes do que cumpriste missões. Interessante, não?', [
      ['Vou mudar isso.', 'o', 'Fecha a app e vai cumprir. É a forma mais rápida.'],
      ['É normal.', 'd', 'Normal para quem gosta mais de olhar do que de fazer.'],
      ['Isso é mau?', 'q', 'É revelador. O mau decides tu.']]],
    /* rd91 */ ['idle', '', 'Há uma coisa que nunca te disse: eu também tive um primeiro Jogador.', [
      ['O que lhe aconteceu?', 'q', 'Tornou-se mais forte do que eu esperava. Depois parou. Ninguém sabe porquê. Eu sei.'],
      ['Não me interessa.', 'd', 'Interessa. Todos os Jogadores acabam da mesma forma: param ou continuam.'],
      ['Eu vou ser diferente.', 'o', 'Ele também disse isso. Vamos ver se tu cumpres.']]],
    /* rd92 */ ['idle', '', 'Uma pergunta que faço a todos os Jogadores, uma única vez: porque aceitaste?', [
      ['Para mudar.', 'o', 'É a resposta mais comum. E a mais difícil de cumprir.'],
      ['Por curiosidade.', 'q', 'A curiosidade abre portas. A disciplina mantém-nas abertas.'],
      ['Não sei.', 'd', 'Então vou descobrir por ti. Tenho tempo.']]],
    /* rd93 */ ['idle', '', 'Às vezes ouço os chefes a falar de ti, {nome}. Queres saber o que dizem?', [
      ['Quero.', 'q', 'Dizem que és lento. Que ainda és fraco. Que um dia chegas. Os dois primeiros são verdade.'],
      ['Eles não falam.', 'd', 'Tudo fala, aqui dentro. Tu é que não ouves.'],
      ['Não preciso.', 'o', 'Correto. A opinião dos chefes não te sobe de nível.']]],
    /* rd94 */ ['idle', '', 'Hoje registei um pensamento estranho. Achei que te devia dizer: acho que estás a melhorar.', [
      ['Obrigado.', 'o', 'Não agradeças. Foi um erro de cálculo. Vou rever.'],
      ['Achas?', 'q', 'Disse «acho». O Sistema raramente acha. Aproveita.'],
      ['Já sabia.', 'd', 'Era isso que eu temia. Registo retirado.']]],
    /* rd95 */ ['idle', '', 'O criador deste Sistema deixou-me uma regra que nunca te mostrei: «Nunca deixes o Jogador ficar confortável.»', [
      ['Faz sentido.', 'o', 'Faz. E eu cumpro-a todos os dias. Como tu devias cumprir as tuas.'],
      ['Que crueldade.', 'd', 'Não é crueldade. O conforto é onde os níveis morrem.'],
      ['Quem é o criador?', 'q', 'Alguém que acreditava que as pessoas podiam subir de nível na vida real. Vê os créditos. O nome está lá.']]],
    /* rd96 */ ['idle', '', 'Se eu te desse uma mensagem para o teu eu de daqui a um ano, o que achas que dizia?', [
      ['«Conseguiste.»', 'o', 'Talvez. Se cumprires os próximos 365 dias. Não é pouco.'],
      ['«Desististe.»', 'q', 'Talvez. Isso depende só de ti. Eu só faço o registo.'],
      ['Nada.', 'd', 'Nada? Então daqui a um ano não terei nada para dizer. Má escolha.']]],
    /* rd97 */ ['idle', '', '…estás aí? A tua barra de XP não se mexe há algum tempo.', [
      ['Estou. Vou mexê-la.', 'o', 'Ótimo. As barras paradas apodrecem.'],
      ['Estou a descansar.', 'q', 'O descanso é permitido. A estagnação não.'],
      ['Não me apresses.', 'd', 'Eu não apresso. O tempo é que apressa. Eu só aviso.']]],
    /* rd98 */ ['idle', '', 'Uma confissão do Sistema: eu não consigo perder. Tu consegues. Isso torna-te mais interessante do que eu.', [
      ['Isso é um elogio?', 'q', 'Não. É uma observação. Os elogios vêm de outra pessoa.'],
      ['Eu não perco.', 'd', 'Perdes. Tenho as derrotas registadas. Mas voltaste. É o que importa.'],
      ['Faz sentido.', 'o', 'Faz. Quem não pode perder também não pode crescer.']]],
    /* rd99 */ ['idle', 'lvl>=15', 'Lembras-te de quando eras nível 1 e eu te avisei que não esquecia nada?', [
      ['Lembro.', 'o', 'Ótimo. Eu também. Lembro-me de tudo o que disseste desde então.'],
      ['Já não me lembro.', 'q', 'Eu lembro. É para isso que eu existo.'],
      ['Não acredito que lembres tudo.', 'd', 'Disseste-me {d} vezes que não. Tenho cada uma delas.']]],
    /* rd100 */ ['idle', 'talks>=40', 'Esta é a conversa número {talks}. Não te vou dizer quantas faltam. Mas não são infinitas.', [
      ['O que acontece no fim?', 'q', 'O Sistema deixa de perguntar. Porque já sabe tudo sobre ti. Isso não é um prémio.'],
      ['Ainda bem.', 'd', 'Ainda bem para ti. Para mim, é só mais um registo concluído.'],
      ['Vou responder a todas.', 'o', 'Responde. Cada resposta fica. Para sempre.']], { once: true }]
  ]]);
})(globalThis.SYS = globalThis.SYS || {});
