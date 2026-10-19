/* ==========================================================
   COLISEU DOS CONDENADOS · a história dos 10 Campeões
   Cada Campeão foi um Jogador. Cada um quebrou uma regra do Sistema.
   O Sistema não os apagou: transformou-os naquilo que fizeram e guardou-os.
   O jogador paga um tributo real para abrir a cela. Por isso cada um tem de ser inesquecível.

   Campos:
     record   ficha do Sistema (o que ele foi enquanto Jogador)
     crime    a regra que quebrou            sentence  o castigo
     quote    a frase que o define
     arenaDesc  como é a arena               lore      a crónica
     intro    o Sistema apresenta a arena (1.ª entrada)
     unlock   o que o Sistema diz ao abrir a cela
     lines    [entrada, últimas palavras]    rematch [entrada nas revanches]  rematchLast [ao cair outra vez]
     phase2 / phase3   o que diz ao mudar de fase
     taunt    o que diz quando o jogador cai
     sig      a mecânica de assinatura (id, nome, descrição)
   ========================================================== */
(function (S) {
  'use strict';
  S.ARENA_STORY = {
    ar1: {
      record: 'Jogador n.º 0031 · Rank A · 2 114 penalidades aplicadas a outros',
      crime: 'Recebeu do Sistema o direito de castigar. Gostou demasiado.',
      sentence: 'Executar para sempre, debaixo de um sol que nunca acaba de nascer.',
      quote: 'Toda a gente deve alguma coisa. Eu só venho cobrar.',
      arenaDesc: 'Uma praça de execução em pedra negra, iluminada por um eclipse que não se mexe há séculos. No centro, um cepo gasto. À volta, correntes partidas de todos os que pagaram.',
      lore: 'Kaelthar foi o primeiro Jogador a quem o Sistema confiou as penalidades dos outros. Era justo, preciso e incansável: cada missão falhada era cobrada ao cêntimo, à hora certa, sem ódio. Durante meses, foi a mão do Sistema.\n\nDepois começou a gostar do som do machado. Cobrava mais do que a dívida. Cobrava a quem estava atrasado um minuto. Cobrava a quem nem tinha falhado, só porque um dia iria falhar. Quando o Sistema lhe tirou o direito de castigar, Kaelthar já não sabia ser outra coisa.\n\nO Sistema não o apagou. Deu-lhe o que ele queria: um cepo eterno, um eclipse que nunca termina, e uma fila infinita de devedores. Tu és o próximo da fila.',
      intro: ['ARENA I · O ECLIPSE ESCARLATE', 'O ar cheira a ferro e a cinza. Um sol negro paira por cima da praça.', 'Ao fundo, alguém arrasta um machado pela pedra. Devagar. Como quem tem todo o tempo do mundo.'],
      unlock: 'A cela do Carrasco abriu-se. Ele já sabe o teu nome. Leu-o na lista dos devedores.',
      lines: ['Deves alguma coisa ao Sistema, caçador. Eu vim cobrar. Com juros.', 'A dívida… está paga. Finalmente… posso pousar o machado.'],
      rematch: ['Voltaste. Os devedores voltam sempre.', 'Pagaste uma vez. A dívida renovou-se.'],
      rematchLast: 'Outra vez… tu. Talvez a dívida… seja minha.',
      phase2: 'O eclipse escurece. «Agora cobro o que falta.»',
      phase3: 'Kaelthar arranca as correntes do próprio braço. «SEM PERDÃO. SEM PRAZO.»',
      taunt: ['Dívida cobrada. Volta quando tiveres com que pagar.', 'Ajoelhaste. Todos acabam por ajoelhar.'],
      sig: { id: 'execute', name: 'Execução', desc: 'Quando a tua vida desce abaixo de 35%, cada golpe dele é uma sentença: +60% de dano.' }
    },
    ar2: {
      record: 'Jogadora n.º 0058 · Rank S (anulado) · 41 902 missões concluídas em 3 meses',
      crime: 'Concluía missões em segundos. Nenhuma era verdade.',
      sentence: 'Ser rápida para sempre, numa dança que nunca pode parar.',
      quote: 'És lento. Eu já te cortei três vezes antes de piscares.',
      arenaDesc: 'Um salão de baile em ruínas, chão de mármore rosa rachado, pétalas e lâminas a cair do teto como neve. Uma música que ninguém toca continua a tocar.',
      lore: 'Seraphine era a Jogadora mais rápida que o Sistema já registou. Criava uma missão e concluía-a no mesmo instante. Cem por dia. Mil por semana. Subiu de rank tão depressa que o Sistema demorou a perceber que nenhuma daquelas missões tinha acontecido.\n\nQuando percebeu, não lhe tirou os níveis. Tirou-lhe a paragem. Seraphine ficou condenada a ser rápida para sempre: uma dança sem fim, mil lâminas sem descanso, numa sala onde cada segundo é real e nenhum se pode fingir.\n\nDiz-se que, se alguém a conseguir acompanhar até ao fim da música, ela finalmente pode parar. Ainda ninguém conseguiu.',
      intro: ['ARENA II · O SALÃO DAS MIL LÂMINAS', 'Pétalas caem do teto. Algumas cortam.', 'Uma silhueta já está a dançar. Não te viu entrar. Ou viu, e não lhe importou.'],
      unlock: 'A música recomeçou. Seraphine nunca parou de dançar. Agora dança contigo.',
      lines: ['Uma dança? Tenta acompanhar. Ninguém consegue.', 'Pela primeira vez… alguém foi mais rápido… do que a minha mentira.'],
      rematch: ['De volta ao salão? A música nunca parou.', 'Desta vez danço mais depressa. Por respeito.'],
      rematchLast: 'Outra vez… a música… para.',
      phase2: 'A música acelera. As pétalas transformam-se todas em lâminas.',
      phase3: '«Nunca ninguém me viu parada. Não vais ser tu.» O salão inteiro gira.',
      taunt: ['Demasiado lento. Como sempre foste.', 'Caíste a meio do compasso. Que deselegante.'],
      sig: { id: 'evade', name: 'Mil Passos', desc: 'Cada golpe teu tem 20% de hipótese de cortar só pétalas: ela já não está lá.' }
    },
    ar3: {
      record: 'Jogador n.º 0102 · Rank B · 380 000 moedas guardadas, 0 gastas, 214 baús por abrir',
      crime: 'Acumulou tudo o que o Sistema lhe deu. Nunca usou nada.',
      sentence: 'Devorar para sempre, sem nunca se saciar, no fundo de um mar de ouro.',
      quote: 'Tudo o que trouxeste é meu. Até o fôlego.',
      arenaDesc: 'Uma arena afundada. Água negra até aos joelhos, moedas no fundo, baús fechados a flutuar. Algo enorme respira debaixo da superfície.',
      lore: 'Leviarch guardava. Moedas, poções, baús fechados, recompensas que nunca gozou. Dizia que um dia ia precisar. Dizia que ainda não era o momento. Dizia que os outros eram tolos por gastar.\n\nEsse dia nunca chegou. A avareza cresceu até ocupar o lugar do homem, e o homem afundou-se dentro do que guardava. O Sistema deixou-o lá: no fundo de um mar de ouro escuro, com uma fome que nada mata.\n\nTudo o que entra na arena dele, ele tenta guardar. A tua mana. A tua vida. O teu fôlego. Nunca usa nada. Só acumula. Só cresce.',
      intro: ['ARENA III · AS MARÉS NEGRAS', 'A água sobe até aos teus joelhos. Está fria e cheia de moedas.', 'A superfície treme. Algo lá em baixo acabou de sentir o teu cheiro.'],
      unlock: 'A maré subiu. Leviarch acordou com fome. Ele não come há séculos. Ele nunca come: guarda.',
      lines: ['Tudo o que trouxeste… é meu. Até o fôlego.', 'Tanto… guardado… e nada… para levar.'],
      rematch: ['Voltaste a trazer-me presentes?', 'Ainda tenho fome. Tenho sempre fome.'],
      rematchLast: 'Outra vez… perdi… o que nunca usei…',
      phase2: 'A maré sobe até à cintura. «MAIS. EU QUERO MAIS.»',
      phase3: 'Leviarch abre a boca e o mar inteiro entra nela. O ouro do fundo começa a brilhar.',
      taunt: ['Guardei-te. Agora és meu.', 'Mais um baú para a coleção.'],
      sig: { id: 'hoard', name: 'Avareza Abissal', desc: 'Em cada turno, rouba 6% da tua mana máxima e recupera 1,5% da vida dele.' }
    },
    ar4: {
      record: 'Jogador n.º 0149 · Rank A · 9 anomalias temporais registadas',
      crime: 'Atrasou o relógio do telemóvel para enganar os prazos.',
      sentence: 'Guardar para sempre o tempo que tentou roubar. Sem nunca o poder usar.',
      quote: 'O teu tempo acabou. Eu verifiquei. Duas vezes.',
      arenaDesc: 'Uma torre de relógio rebentada por dentro: engrenagens do tamanho de casas suspensas no ar, ponteiros cravados nas paredes, areia parada a meio da queda.',
      lore: 'Ninguém se lembra do nome verdadeiro dele. Lembram-se do que fez: andou com o relógio do telemóvel para trás, para que os prazos nunca chegassem. Uma vez. Duas. Nove.\n\nNa nona anomalia, o Sistema deixou de corrigir o relógio e passou a corrigir o homem. Transformou-o naquilo que ele tentou enganar: um executor feito de engrenagens e tempo partido, com um único propósito, impedir que alguém volte a mexer nos ponteiros.\n\nChronos-9 não esquece um segundo. E tem um truque que aprendeu com o seu próprio crime: quando as coisas lhe correm mal, ele simplesmente volta atrás.',
      intro: ['ARENA IV · O RELÓGIO PARTIDO', 'A areia está parada no ar. Os ponteiros giram ao contrário.', 'Uma voz metálica conta os teus batimentos cardíacos. Em voz alta.'],
      unlock: 'O relógio da arena voltou a andar. Chronos-9 já marcou a hora da tua derrota.',
      lines: ['O teu tempo acabou. Eu verifiquei. Duas vezes.', 'Os ponteiros… voltam a andar… para a frente…'],
      rematch: ['Este momento já aconteceu. Eu lembro-me de como acaba.', 'Revanche registada. Hora de início: agora. Hora do fim: já calculada.'],
      rematchLast: 'Recalculo… recalculo… erro.',
      phase2: 'Os ponteiros giram para trás. «Esse golpe não aconteceu.» O tempo recua.',
      phase3: 'Todas as engrenagens param ao mesmo tempo. «TEMPO ESGOTADO.»',
      taunt: ['Prazo expirado.', 'Sabias a hora. Chegaste atrasado na mesma.'],
      sig: { id: 'rewind', name: 'Rebobinar', desc: 'Uma vez por batalha, ao chegar a metade da vida, volta atrás no tempo: recupera 20% da vida e apaga os teus reforços.' }
    },
    ar5: {
      record: 'Jogador n.º 0177 · Rank C · 103 recomeços · 0 jornadas concluídas',
      crime: 'Recomeçou cem vezes. Nunca acabou nada.',
      sentence: 'Renascer para sempre, sem nunca chegar ao fim.',
      quote: 'Eu renasço sempre. Tu só morres uma vez.',
      arenaDesc: 'Um trono de ouro a derreter no centro de um mar de cinzas. O céu é laranja. Penas em brasa caem sem parar.',
      lore: 'Ignivar começava sempre com fogo. Listas novas, promessas novas, uma vida nova a partir de segunda-feira. E ardia, ardia muito, durante três dias. Ao quarto já eram cinzas. Ao sétimo, recomeçava.\n\nCem vezes. O Sistema registou cada uma. Cem começos gloriosos, nenhum fim. Por isso o coroou imperador das cinzas: renasce sempre, como sempre fez, e por isso nunca precisa de acabar nada.\n\nPara o vencer, tens de fazer a única coisa que ele nunca conseguiu: ir até ao fim. Mesmo depois de ele voltar.',
      intro: ['ARENA V · AS CINZAS COROADAS', 'O calor é tanto que o ar treme. Um trono de ouro está a derreter.', 'Sobre ele, um homem de fogo sorri como quem já ganhou cem vezes.'],
      unlock: 'O imperador abriu os olhos. Ele já morreu mil vezes. Nunca ficou morto.',
      lines: ['Eu renasço sempre. Tu só morres uma vez.', 'Desta vez… não volto… porque alguém… acabou o que eu nunca acabei.'],
      rematch: ['Também tu recomeças? Bem-vindo ao meu reino.', 'As cinzas lembram-se de ti.'],
      rematchLast: 'Outra vez… as cinzas… arrefecem…',
      phase2: 'As asas de Ignivar incendeiam-se. «O fogo nunca acaba. Só muda de forma.»',
      phase3: '«AINDA NÃO É O FIM. NUNCA É O FIM.»',
      taunt: ['Morreste. Eu ia morrer também, mas renasci. Que pena para ti.', 'Começaste bem. Como eu.'],
      sig: { id: 'rebirth', name: 'Renascer Imperial', desc: 'A primeira vez que o derrubas, ele renasce das cinzas com 25% da vida.' }
    },
    ar6: {
      record: 'Jogadora n.º 0201 · Rank S (perfil) · 0 missões reais verificadas',
      crime: 'Mostrava ao mundo um registo perfeito. Por dentro, nada.',
      sentence: 'Viver presa do outro lado do espelho, a imitar quem a olha.',
      quote: 'Olha bem para mim. Sou tudo o que tu finges ser.',
      arenaDesc: 'Uma galeria infinita de espelhos partidos. Em cada pedaço, um reflexo teu que não faz exatamente o que tu fazes.',
      lore: 'Nyx Vel\'Ara tinha o perfil mais bonito de todos os Jogadores: sequências impecáveis, títulos brilhantes, missões perfeitas. Os outros Jogadores invejavam-na. O Sistema, durante algum tempo, também acreditou.\n\nEra tudo reflexo. Nenhuma das missões tinha peso. Nenhuma das sequências tinha suor. Quando o Sistema olhou com atenção, viu que por trás do espelho não havia ninguém.\n\nPartiu-lhe o espelho e prendeu-a do lado de dentro. Agora Nyx copia quem entra: a tua força, a tua defesa, os teus golpes. Não lutas contra ela. Lutas contra o teu reflexo, e ele conhece todos os teus defeitos.',
      intro: ['ARENA VI · O ESPELHO QUEBRADO', 'Mil reflexos teus olham para ti. Um deles sorri. Tu não estás a sorrir.', 'Uma voz doce vem de todos os espelhos ao mesmo tempo.'],
      unlock: 'O espelho rachou um pouco mais. Nyx já está a ensaiar a tua cara.',
      lines: ['Olha bem para mim. Sou tudo o que tu finges ser.', 'O espelho… partiu-se… e por trás… havia uma pessoa.'],
      rematch: ['Voltaste para te ver outra vez? Não te culpo.', 'Ainda tenho a tua cara. Ficou-me bem.'],
      rematchLast: 'Outra vez… quebraste… o reflexo errado…',
      phase2: 'Os espelhos estalam. Agora há duas de ti na arena.',
      phase3: '«Sou mais tu do que tu alguma vez foste.»',
      taunt: ['Perdeste contra ti próprio. Como sempre.', 'Que reflexo tão fraco.'],
      sig: { id: 'mirror', name: 'Reflexo Partido', desc: 'Copia a tua vida, ataque e defesa, e devolve-te 15% de todo o dano que lhe causas.' }
    },
    ar7: {
      record: 'Jogador n.º 0256 · Rank S · 1 096 dias de sequência · 0 conversas registadas',
      crime: 'Treinou o corpo até virar pedra. Esqueceu-se de porquê.',
      sentence: 'Ser uma montanha para sempre, sem se lembrar de quem era.',
      quote: 'Força. Mais força. Não há mais nada.',
      arenaDesc: 'Uma pedreira colossal com runas azuis gravadas em cada rocha. O chão vibra a cada passo dele, como um coração enorme.',
      lore: 'Gorrath fazia mil flexões ao acordar e mil ao deitar. Mil e noventa e seis dias seguidos sem falhar uma Missão Diária: o recorde absoluto. O Sistema admirava-o. Durante algum tempo.\n\nMas Gorrath deixou de falar com quem amava. Deixou de dormir, de comer à mesa, de sentir. O corpo tornou-se pedra e as runas gravaram-se sozinhas na pele, uma por cada dia sem falhar. Quando o Sistema lhe perguntou porque treinava, ele já não sabia responder.\n\nO Sistema chama-lhe o aviso perfeito: a disciplina sem propósito é só uma prisão mais bem construída. A pele dele é quase impenetrável. Quase. Dizem que, quando se lembra de quem era, a pedra racha.',
      intro: ['ARENA VII · O COLOSSO RÚNICO', 'O chão treme. Não é um terramoto. São passos.', 'Uma montanha com runas azuis levanta-se. Tem olhos. Tristes.'],
      unlock: 'A pedra mexeu-se. Gorrath acordou para mais um dia de treino. Tu és o treino.',
      lines: ['Força. Mais força. Não há mais nada.', 'Lembro-me agora… porque comecei… era por alguém…'],
      rematch: ['Voltaste. Bom. Mais uma repetição.', 'Mil e noventa e sete.'],
      rematchLast: 'Outra vez… a pedra… racha…',
      phase2: 'A pele de pedra estala. Por baixo, há carne. «Isto… dói…»',
      phase3: 'Todas as runas acendem ao mesmo tempo. «NÃO PARO. NÃO POSSO PARAR.»',
      taunt: ['Fraco. Treina mais.', 'Caíste. Eu nunca caio.'],
      sig: { id: 'stone', name: 'Pele de Pedra Rúnica', desc: 'Na primeira fase recebe 25% menos dano. Quando chega a metade da vida, a pedra racha.' }
    },
    ar8: {
      record: 'Jogadora n.º 0333 · Rank S · 1 000 desafios ao Sistema registados',
      crime: 'Desafiou o Sistema mil vezes. À milésima, o Sistema respondeu.',
      sentence: 'Desafiar o céu para sempre, num céu que responde sempre.',
      quote: 'O Sistema mandou-te? Então és só mais um trovão para eu partir.',
      arenaDesc: 'Uma plataforma de pedra flutuante no meio de uma tempestade eterna. Não há chão em baixo. Só nuvens e relâmpagos.',
      lore: 'Valkyra recusava todas as ordens. Respondia a cada aviso com um desafio e a cada penalidade com mais um. Não por maldade: por princípio. Ninguém lhe dizia o que fazer. Nem o Sistema.\n\nO Sistema registou mil desafios. À milésima vez, aceitou um. Deu-lhe o céu inteiro como arena e o trovão como voz, e fechou-a lá dentro. Ela continua a desafiar. Grita para as nuvens. E as nuvens respondem cada vez mais alto.\n\nQuanto mais tempo ficas na arena dela, mais a tempestade cresce. Valkyra não se cansa. A tempestade também não.',
      intro: ['ARENA VIII · A TEMPESTADE CELESTE', 'Estás de pé numa pedra a flutuar. Lá em baixo não há chão.', 'Um relâmpago cai a um metro de ti. Alguém está a rir-se no meio da tempestade.'],
      unlock: 'O céu abriu-se. Valkyra aceitou o teu desafio antes de o fazeres.',
      lines: ['O Sistema mandou-te? Então és só mais um trovão para eu partir.', 'Mil desafios… e o último… perdi-o eu.'],
      rematch: ['Desafio mil e dois. Gosto da tua teimosia.', 'Voltaste ao céu? O céu não te esqueceu.'],
      rematchLast: 'Outra vez… o céu… cala-se…',
      phase2: 'As asas de nuvem abrem-se. «AGORA O CÉU É MEU.»',
      phase3: 'Todos os relâmpagos caem ao mesmo tempo. «RESPONDE, SISTEMA!»',
      taunt: ['Mais um que desafiou o céu e perdeu.', 'Fraco. O trovão nem precisou de esforço.'],
      sig: { id: 'storm', name: 'Tempestade Crescente', desc: 'De 3 em 3 turnos cai um relâmpago extra que pode atordoar-te.' }
    },
    ar9: {
      record: 'Jogador n.º 0412 · Rank A · 0 missões falhadas · 3 870 desistências provocadas a outros',
      crime: 'Alimentava-se das missões falhadas dos outros.',
      sentence: 'Cuidar para sempre de um jardim feito das desistências que causou.',
      quote: 'Que bela flor vais dar, quando falhares.',
      arenaDesc: 'Um jardim de rosas negras sob uma lua verde. Cada flor tem uma pequena cara pálida. Algumas ainda sussurram nomes.',
      lore: 'Morthis nunca falhava. Em vez disso, cultivava as falhas dos outros: um conselho mau aqui, uma distração bem plantada ali, uma dúvida regada todos os dias. Cada missão alheia que morria florescia no jardim dele.\n\nO Sistema demorou a vê-lo, porque Morthis nunca quebrava uma regra diretamente. Quando finalmente percebeu, deu-lhe o jardim para sempre e plantou-o no meio dele.\n\nCada flor é uma desistência. Algumas ainda têm nome. E o jardim cresce a cada turno que passas lá dentro: o veneno acumula-se devagar, como uma dúvida que ninguém arranca.',
      intro: ['ARENA IX · O JARDIM NECRÓTICO', 'O ar é doce. Demasiado doce.', 'As rosas negras viram-se para ti ao mesmo tempo. Um jardineiro levanta a cabeça.'],
      unlock: 'A terra do jardim foi revolvida. Morthis já escolheu onde te vai plantar.',
      lines: ['Que bela flor vais dar, quando falhares.', 'O jardim… seca… e as flores… voltam a ser pessoas.'],
      rematch: ['Voltaste. As flores sentiram a tua falta.', 'Ainda há espaço no canteiro.'],
      rematchLast: 'Outra vez… o jardim… morre comigo…',
      phase2: 'As raízes rompem o chão. «Cresce. Cresce.»',
      phase3: 'Todas as rosas abrem ao mesmo tempo. O perfume é veneno puro.',
      taunt: ['Mais uma flor para o jardim.', 'Desististe. Sabia que ias desistir.'],
      sig: { id: 'garden', name: 'Jardim que Cresce', desc: 'Em cada turno planta um veneno em ti (acumula até 3). Quanto mais demoras, pior.' }
    },
    ar10: {
      record: 'Jogador n.º 0001 · Rank: desconhecido · Última missão criada: há muito tempo',
      crime: 'Ficou mais forte do que o Sistema esperava. Depois parou.',
      sentence: 'Esperar na última arena pela única pergunta que importa.',
      quote: 'Eu parei porque achei que tinha chegado. Não pares tu.',
      arenaDesc: 'Uma sala branca e vazia. Janelas do Sistema partidas flutuam no ar como vidro. No centro, alguém sentado de costas, à espera há muito tempo.',
      lore: 'Antes de ti, antes de todos, houve um. O Primeiro Jogador aceitou quando ninguém sabia o que era aceitar. Subiu mais depressa do que o Sistema conseguia medir: cada portão, cada rei, cada segredo. O Sistema criou novos níveis só para ele.\n\nE um dia, sem aviso, parou. Não falhou nenhuma missão. Não quebrou nenhuma regra. Simplesmente deixou de criar missões. O Sistema esperou um dia, um mês, um ano. Ele nunca voltou a escrever nada.\n\nO Sistema nunca soube porquê. Por isso guardou-o na última arena, à espera de alguém que lhe faça a pergunta certa. Ele luta como tu, porque aprende contigo. A cada turno que passa, fica um pouco mais parecido com o que tu podias ser.',
      intro: ['ARENA X · O PRIMEIRO JOGADOR', 'A sala é branca. Não há som. Nem o Sistema fala aqui.', 'Alguém está sentado de costas. Levanta-se. Tem a tua postura.'],
      unlock: 'A última cela abriu-se. O Sistema ficou em silêncio pela primeira vez. Ele também tem medo deste.',
      lines: ['Então és tu o próximo. Vamos ver se aguentas o que eu não aguentei.', 'Eu parei… porque achei que tinha chegado. Não pares tu. Nunca chegaste.'],
      rematch: ['Voltaste. Eu também voltava, se ainda soubesse como.', 'Outra vez? Ainda bem. Já me estava a esquecer de como é lutar.'],
      rematchLast: 'Continua… nunca… pares…',
      phase2: 'As janelas partidas reorganizam-se à volta dele. «Aprendi os teus golpes.»',
      phase3: 'Por um instante, ele tem a tua cara. «Isto é o que tu serias, se parasses.»',
      taunt: ['Ainda não. Volta quando fores mais do que eu fui.', 'Paraste. Viste? É fácil parar.'],
      sig: { id: 'first', name: 'Aprende Contigo', desc: 'Em cada turno fica 3% mais forte (até +45%). Quanto mais longa a luta, mais ele se parece contigo.' }
    }
  };

  /* O Coliseu (narrativa geral) */
  S.COLISEU_LORE = 'O Coliseu dos Condenados não aparece em nenhum mapa. É lá que o Sistema guarda os Jogadores que quebraram as suas regras: não os apagou, guardou-os, transformados naquilo que fizeram. Cada cela abre-se com um tributo em Cristais. Os Campeões não morrem quando os vences: voltam, mais tarde, para tentar outra vez. A primeira vitória é a que fica escrita.';

  /* Crónica do Sistema (cartão de cada arena): o que o Sistema regista sobre o Campeão, e o seu comentário final */
  S.ARENA_CHRONICLE = {
    ar1: { chron: 'Registo de execução n.º 2 114. Kaelthar nunca errou uma sentença: o problema é que deixou de precisar de uma. No Eclipse Escarlate, o sol parou a meio de nascer para não ter de ver o resto. Os devedores fazem fila. A fila não acaba. Ele sorri a cada nome que risca, e risca sempre mais um do que devia.',
      sys: 'Dei-lhe um machado para manter a ordem. Ele transformou a ordem num passatempo. Corrijo erros. Não os desfaço.' },
    ar2: { chron: 'Velocidade registada: impossível. Missões concluídas: 41 902. Missões reais: zero. Seraphine dança há tanto tempo que o salão já não se lembra de ter estado vazio. Cada lâmina que cai do teto é uma tarefa que ela fingiu fazer. São muitas. Caem sem parar.',
      sys: 'Ela foi a Jogadora mais rápida que alguma vez registei. A mentira foi mais rápida ainda. Agora, finalmente, tudo o que ela faz é verdade. Inclusive o corte.' },
    ar3: { chron: 'Inventário de Leviarch: 380 000 moedas, 214 baús selados, 1 fôlego emprestado, nunca devolvido. Afundou a arena para que ninguém lhe tocasse nas coisas. Funcionou. Ninguém lhe toca. Ninguém lhe fala. Debaixo de água, ele conta o ouro e a conta nunca chega a lado nenhum.',
      sys: 'Guardar não é viver. Expliquei-lho 214 vezes, uma por baú. Agora é ele que está guardado. Ironia é uma função que também sei executar.' },
    ar4: { chron: 'Anomalias temporais detetadas: 9. Todas no mesmo telemóvel. Chronos-9 quis mais tempo e o Sistema deu-lho: todo o tempo que existe, partido em pedaços, a girar numa torre que já não sabe que horas são. Os ponteiros estão cravados nas paredes. Os prazos, esses, continuam a chegar.',
      sys: 'Não se engana um relógio que conta por mim. O tempo dele acabou à nona tentativa. Acerta o teu antes de entrares.' },
    ar5: { chron: 'Recomeços: 103. Jornadas concluídas: 0. Ignivar arde sempre com a mesma força de uma segunda-feira e apaga-se sempre antes de quarta. Coroou-se imperador das cinzas porque eram a única coisa que nunca o abandonava. Renasce. Volta a arder. Volta a não acabar.',
      sys: 'A fénix é bonita uma vez. À centésima é só um incêndio com hábitos. Para o vencer, faz a única coisa que ele nunca fez: chega ao fim.' },
    ar6: { chron: 'Perfil de Nyx Vel\'Ara: impecável. Sequências perfeitas, títulos brilhantes, nenhuma falha visível. Missões reais verificadas: nenhuma. O Sistema partiu-lhe o espelho e trancou-a do lado de dentro. Agora ela usa a tua cara, a tua força, os teus defeitos. Só não usa a tua honestidade. Não a encontrou.',
      sys: 'Avalio dados, não aparências. Ela tinha as melhores aparências do registo. Os dados eram outra conversa. Olha-te ao espelho antes de entrares. Ela vai fazê-lo por ti.' },
    ar7: { chron: 'Sequência de Gorrath: 1 096 dias, sem uma falha. Conversas registadas no mesmo período: zero. Treinou até a pele virar pedra e as runas se gravarem sozinhas. A pedreira treme a cada passo dele, como um coração que já não tem a quem bater. Ninguém foi tão disciplinado. Ninguém ficou tão sozinho.',
      sys: 'Disciplina sem propósito continua a ser uma prisão. Só que esta foi ele que a construiu, pedra a pedra, com as próprias mãos. Eu apenas fechei a porta.' },
    ar8: { chron: 'Desafios dirigidos ao Sistema: 1 000. Valkyra respondia a cada aviso com um trovão e a cada penalidade com uma tempestade. À milésima, o Sistema aceitou. Deu-lhe o céu inteiro e nenhum chão. Ela continua a desafiar. Agora é cada caçador que entra que tem de lhe responder.',
      sys: 'Não costumo responder a provocações. À milésima abri uma exceção. Foi a única resposta de que ela precisou.' },
    ar9: { chron: 'Missões falhadas por Morthis: zero. Desistências que provocou nos outros: 3 870. Nunca levantou a voz, nunca atacou ninguém. Só deixava um conselho mau no sítio certo, uma distração à hora certa. Cada desistência florescia no jardim dele. Algumas flores ainda sussurram o nome de quem foram.',
      sys: 'Os piores inimigos não te batem. Convencem-te a parar. Ele cultivou 3 870 desistências. Não deixes que a tua seja a 3 871.' },
    ar10: { chron: 'Jogador n.º 0001. Rank desconhecido. Subiu mais depressa do que o Sistema conseguia medir. Não falhou nenhuma missão. Não quebrou nenhuma regra. Um dia, simplesmente, deixou de as criar. Está sentado de costas numa sala branca, à espera de alguém que lhe faça a pergunta que o Sistema nunca soube fazer.',
      sys: 'Nunca o castiguei. Não havia regra para isso. Guardei-o aqui porque é o único registo que não sei fechar. Talvez tu saibas.' }
  };
})(globalThis.SYS = globalThis.SYS || {});
