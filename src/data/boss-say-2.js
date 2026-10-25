/* ==========================================================
   O SISTEMA COMENTA CADA CHEFE (2/2) · portões 6 a 10, chefes secretos e Coliseu
   ========================================================== */
(function (S) {
  'use strict';
  var P = S.PLUS = S.PLUS || {};
  var B = P.bossSay = P.bossSay || {};
  function add(map) { Object.keys(map).forEach(function (id) { B[id] = { win: map[id][0], lose: map[id][1] }; }); }
  add({
    /* Portão 6 · Vulcão Carmesim */
    b51: [['A salamandra apagou-se.', 'Venceste o fogo pequeno. O grande está à espera.', 'Salamandra derrotada. O vulcão nem reparou. Eu reparei.'],
      ['Queimaste-te. Literalmente.', 'A salamandra ganhou. O fogo ganha a quem chega sem proteção.', 'Perdeste no primeiro passo do vulcão.']],
    b52: [['O golem de magma arrefeceu.', 'Rocha derretida contra disciplina. A disciplina ganhou.', 'Golem caído. O chão já não queima tanto.'],
      ['O magma derreteu a tua defesa.', 'Perdeste para pedra quente. Volta com mais vida.', 'O golem aguentou. Tu não.']],
    b53: [['As duas cabeças calaram-se.', 'Venceste o cão infernal. Os dois latidos acabaram.', 'Cão bicéfalo derrotado. Bom rapaz. Morto.'],
      ['Duas cabeças pensaram melhor do que a tua.', 'Perdeste para um cão com duas bocas. Ambas morderam.', 'O cão infernal ganhou. Volta com mais velocidade.']],
    b54: [['O demónio ferreiro largou o martelo.', 'Venceste quem forja armas no inferno. As tuas aguentaram.', 'A forja do vulcão ficou em silêncio.'],
      ['O ferreiro bateu-te como bate o ferro.', 'Perdeste para um artesão. Ele conhece cada golpe.', 'O demónio ganhou. Melhora o teu equipamento.']],
    b55: [['A fénix corrompida não voltou a nascer.', 'Venceste algo que renasce. Desta vez não renasceu.', 'Fénix derrotada. As cinzas são tuas.'],
      ['A fénix voltou e tu não.', 'Perdeste para quem recomeça sempre. Aprende com ela.', 'Cinzas. As tuas, desta vez.']],
    b56: [['O Ifrit apagou a fúria.', 'Venceste a raiva em forma de fogo. Faz o mesmo com a tua.', 'Ifrit derrotado. O ar arrefeceu.'],
      ['A fúria dele ganhou à tua paciência.', 'Perdeste para a raiva. Acontece aos melhores.', 'O Ifrit queimou-te. Volta com calma.']],
    b57: [['O Wyrm de lava afundou-se no vulcão.', 'Venceste uma serpente de fogo líquido. Raro.', 'O Wyrm caiu. O rio de lava ficou mais calmo.'],
      ['O Wyrm envolveu-te em lava.', 'Perdeste para fogo com forma. Volta com resistência.', 'O vulcão ganhou esta. Não a próxima.']],
    b58: [['O Senhor das Cinzas virou cinza.', 'Venceste quem governa o que sobra. Irónico.', 'Cinzas para as cinzas. A vitória é tua.'],
      ['O Senhor das Cinzas espalhou-te ao vento.', 'Perdeste para o que sobra de tudo. Não sejas o que sobra.', 'Volta. As cinzas não se movem.']],
    b59: [['O Titã Flamejante caiu como uma montanha.', 'Um titã. Vencido por alguém pequeno e teimoso.', 'O fogo do titã apagou-se. O teu está aceso.'],
      ['O titã esmagou-te com fogo.', 'Perdeste para um gigante em chamas. Normal. Volta.', 'Os titãs não têm pressa. Tu tiveste.']],
    b60: [['Pyraxis caiu. O dragão vulcânico deixou de rugir.', 'Seis reis. Um dragão. O vulcão é teu.', 'O coração do dragão parou. Dizem que um pedaço dele caiu na Floresta, há muito tempo.'],
      ['Pyraxis queimou-te até ao osso.', 'O dragão vulcânico continua a reinar. Tu continuas a aprender.', 'Perdeste para o fogo mais antigo do Sistema. Não é vergonha. É aviso.']],
    /* Portão 7 · Cidade Submersa */
    b61: [['O Kraken menor afundou de vez.', 'Venceste tentáculos. Muitos. Bom.', 'Kraken derrotado. A cidade começa a abrir-se.'],
      ['Os tentáculos puxaram-te para o fundo.', 'Perdeste para um Kraken pequeno. Os grandes ainda estão à espera.', 'A cidade submersa engoliu-te.']],
    b62: [['A sereia deixou de cantar.', 'Não te deixaste encantar. Raro. Bom.', 'Venceste a voz. Agora vence as distrações com a mesma força.'],
      ['A canção dela adormeceu-te.', 'Perdeste para uma voz bonita. Há distrações assim lá fora também.', 'A sereia ganhou. Tapa os ouvidos da próxima vez.']],
    b63: [['O tubarão abissal desceu para não voltar.', 'Venceste o predador do fundo.', 'Tubarão derrotado. O mar ficou mais seguro. Um pouco.'],
      ['O tubarão sentiu o teu sangue.', 'Perdeste para dentes que não param.', 'O fundo do mar é dele. Por agora.']],
    b64: [['O guarda tritão largou o tridente.', 'Venceste a guarda da cidade. A porta abre.', 'Tritão derrotado. O dever dele acabou.'],
      ['O tritão guardou bem.', 'Perdeste para um soldado do mar. Treina mais.', 'O tridente foi mais rápido.']],
    b65: [['A enguia trovejante apagou-se.', 'Venceste eletricidade com paciência.', 'Enguia derrotada. Sem choques.'],
      ['Levaste um choque. Grande.', 'Perdeste para a enguia. A água conduz. Tu também.', 'A enguia ganhou. Volta com mais vida.']],
    b66: [['O Leviatã juvenil não chegou a adulto.', 'Venceste um futuro monstro marinho. O mar agradece.', 'O jovem Leviatã caiu.'],
      ['O Leviatã já é grande o suficiente para ti.', 'Perdeste para um juvenil. Os adultos são piores.', 'O mar ficou com mais um.']],
    b67: [['A sacerdotisa das marés perdeu a maré.', 'Venceste quem comanda a água. Comanda tu os teus dias.', 'Sacerdotisa derrotada. As marés acalmaram.'],
      ['As marés levaram-te.', 'Perdeste para quem conhece o ritmo da água.', 'A sacerdotisa ganhou. Aprende o ritmo.']],
    b68: [['O caranguejo colosso partiu a carapaça.', 'Venceste uma fortaleza com patas.', 'Caranguejo derrotado. Abriu-se.'],
      ['A carapaça dele aguentou tudo.', 'Perdeste para uma defesa perfeita. Precisas de mais dano.', 'O caranguejo ganhou de lado.']],
    b69: [['A abominação voltou às profundezas.', 'Venceste o que não tem forma. Agora dá forma aos teus dias.', 'Abominação derrotada. Não olhes para trás.'],
      ['A abominação engoliu-te.', 'Perdeste para o que vive no fundo. Volta mais preparado.', 'O fundo do mar tem coisas que não se explicam. Esta ganhou.']],
    b70: [['Thalassor caiu. O Rei Afogado finalmente afundou.', 'Sete reis. O tesouro da cidade é teu. Diz-se que uma moeda antiga veio de lá.', 'O Rei Afogado guardava tudo. Agora não guarda nada.'],
      ['Thalassor arrastou-te para o tesouro dele. Como mais uma peça.', 'O Rei Afogado ganhou. A posse ganha a quem chega sem nada.', 'Perdeste para o rei que guarda tudo. Não sejas guardado.']],
    /* Portão 8 · Cidadela Celestial */
    b71: [['O Grifo Real caiu das nuvens.', 'Venceste nas alturas. Não te deixes subir à cabeça.', 'Grifo derrotado. A cidadela abre-se.'],
      ['O grifo atacou de cima. Não olhaste para cima.', 'Perdeste nas nuvens. A queda é longa.', 'O grifo ganhou. Volta com os pés mais firmes.']],
    b72: [['O anjo caído caiu outra vez.', 'Venceste quem já tinha perdido o céu.', 'Anjo derrotado. As asas não voltam.'],
      ['O anjo caído ainda tem força.', 'Perdeste para quem já caiu uma vez. Os caídos sabem levantar-se.', 'Ele ganhou. Aprende a levantar-te como ele.']],
    b73: [['O golem celeste desfez-se em luz.', 'Venceste uma máquina divina.', 'Golem derrotado. Os céus perderam um guarda.'],
      ['A luz do golem cegou-te.', 'Perdeste para uma máquina do céu.', 'O golem ganhou. As máquinas não hesitam.']],
    b74: [['A Valquíria traidora caiu.', 'Venceste quem traiu os seus. Não sejas como ela.', 'Valquíria derrotada. A traição acabou.'],
      ['A traidora ganhou-te. Ironia.', 'Perdeste para quem trocou de lado. Escolhe bem o teu.', 'A Valquíria ganhou. Volta com mais lealdade a ti próprio.']],
    b75: [['O serafim corrompido apagou-se.', 'Venceste a luz que apodreceu.', 'Serafim derrotado. A corrupção acabou aqui.'],
      ['A luz corrompida queimou-te.', 'Perdeste para quem desceu do céu e não voltou igual.', 'O serafim ganhou. Volta com o espírito mais firme.']],
    b76: [['O arauto dourado calou o anúncio.', 'O arauto anunciava a tua derrota. Enganou-se.', 'Venceste a voz da cidadela.'],
      ['O arauto anunciou-te certo.', 'Perdeste para quem só fala. Mas fala bem.', 'O anúncio cumpriu-se. Muda-o na próxima.']],
    b77: [['A quimera celeste deixou de ser três.', 'Venceste três bestas numa.', 'Quimera derrotada. Todas as cabeças.'],
      ['A quimera tinha mais cabeças do que tu planos.', 'Perdeste para três ao mesmo tempo. Um de cada vez, da próxima.', 'A quimera ganhou. Divide e conquista.']],
    b78: [['O Cavaleiro da Aurora caiu ao amanhecer.', 'Venceste a primeira luz do dia. Não te esqueças das tuas manhãs.', 'Cavaleiro derrotado. A aurora é tua.'],
      ['O cavaleiro chegou primeiro. Como a aurora.', 'Perdeste para quem acorda antes de ti.', 'Ele ganhou. Levanta-te mais cedo.']],
    b79: [['O Arcanjo vingativo perdeu a vingança.', 'Venceste o juízo do céu.', 'Arcanjo derrotado. Ninguém julga os portões agora.'],
      ['O Arcanjo julgou-te. Culpado.', 'Perdeste para a vingança celeste.', 'O juízo foi contra ti. Recorre.']],
    b80: [['Auriel caiu. A Imperatriz Celeste perdeu o céu.', 'Oito reis. Os anjos lembram-se da noite em que desceram. E agora lembram-se de ti.', 'A cidadela é tua. O juízo também.'],
      ['Auriel julgou-te do alto.', 'A Imperatriz Celeste manteve o trono. O juízo dela é duro.', 'Perdeste para o céu. O céu é paciente.']],
    /* Portão 9 · Abismo Sem Fim */
    b81: [['O Devorador de Luz ficou às escuras.', 'Venceste quem come a luz. A tua continua acesa.', 'Devorador derrotado. O abismo ficou um pouco menos escuro.'],
      ['Ele comeu-te a luz.', 'Perdeste no escuro. Volta com mais.', 'O Devorador ganhou. A escuridão tem fome.']],
    b82: [['O Senhor dos Pesadelos acordou do próprio sono.', 'Venceste os pesadelos. Dorme melhor hoje.', 'Pesadelos derrotados. Por agora.'],
      ['Os pesadelos ganharam. Acontece às três da manhã.', 'Perdeste para o medo com forma. Volta acordado.', 'O Senhor dos Pesadelos riu-se. Não sonhes com ele.']],
    b83: [['Mil olhos fecharam-se.', 'Venceste quem vê tudo. Quase como eu.', 'Demónio derrotado. Os olhos dele não te seguem mais. Os meus sim.'],
      ['Mil olhos viram cada erro teu.', 'Perdeste para quem vê tudo. Eu também vejo. Mas não te ataco.', 'O demónio ganhou. Esconde melhor as fraquezas.']],
    b84: [['O Ceifador do Abismo ficou sem colheita.', 'Venceste a morte do abismo. Hoje não é o teu dia.', 'Ceifador derrotado. A foice é tua.'],
      ['O Ceifador colheu-te.', 'Perdeste para a morte. Ela ganha muitas vezes. Volta.', 'A foice foi mais rápida.']],
    b85: [['O Behemoth sombrio desabou.', 'Venceste uma montanha de trevas.', 'Behemoth derrotado. O abismo tremeu.'],
      ['O Behemoth passou por cima de ti.', 'Perdeste para algo do tamanho do medo.', 'O Behemoth ganhou. Volta com mais força.']],
    b86: [['O Lich imperial perdeu o império dos mortos.', 'Venceste um imperador morto. Os vivos ganham.', 'Lich derrotado. As almas libertaram-se.'],
      ['O Lich juntou-te ao exército dele.', 'Perdeste para a morte organizada.', 'O Lich ganhou. A eternidade é paciente.']],
    b87: [['O dragão ósseo desmontou-se.', 'Venceste ossos com vontade.', 'Dragão ósseo derrotado. Peça a peça.'],
      ['Os ossos aguentaram.', 'Perdeste para um esqueleto de dragão. Ainda assim um dragão.', 'O dragão ósseo ganhou. Volta com mais dano.']],
    b88: [['Belzar caiu. O Arquidemónio perdeu o trono pequeno.', 'Venceste um arquidemónio. Os demónios menores fugiram.', 'Belzar derrotado. O abismo ficou sem general.'],
      ['Belzar riu-se de ti.', 'Perdeste para o desejo com chifres.', 'O arquidemónio ganhou. Não lhe dês o que ele quer.']],
    b89: [['O Avatar do Caos ficou sem forma.', 'Venceste o caos. Agora arruma o teu.', 'Avatar derrotado. A ordem venceu. A tua.'],
      ['O caos ganhou. O caos ganha a quem não tem plano.', 'Perdeste para a desordem. Organiza-te.', 'O Avatar ganhou. Volta com estratégia.']],
    b90: [['Nyxaroth caiu. O Príncipe do Abismo perdeu o fundo.', 'Nove reis. Só falta o último trono.', 'O abismo tem fim, afinal. Tu encontraste-o.'],
      ['Nyxaroth puxou-te para o fundo sem fim.', 'O Príncipe do Abismo ganhou. O desejo dele é infinito. O teu não chega.', 'Perdeste no abismo. Volta. O fundo espera.']],
    /* Portão 10 · Trono do Vazio */
    b91: [['O Guardião do Vazio deixou passar.', 'Venceste a porta do fim.', 'Guardião derrotado. O Vazio abriu-se.'],
      ['O Guardião do Vazio não te deixou passar.', 'Perdeste à porta do fim.', 'O Vazio guarda bem. Volta.']],
    b92: [['O Titã do Tempo parou o relógio dele.', 'Venceste o tempo. Hoje. Amanhã ele volta a correr.', 'Titã derrotado. O tempo é teu. Usa-o.'],
      ['O tempo venceu-te. Vence toda a gente.', 'Perdeste para o Titã do Tempo. Ninguém ganha ao tempo. Só se usa melhor.', 'O relógio dele não parou.']],
    b93: [['O Dragão Primordial caiu. O primeiro de todos.', 'Venceste o dragão mais antigo do Sistema.', 'O primordial caiu. Os outros dragões eram cópias.'],
      ['O primeiro dragão ganhou.', 'Perdeste para o fogo original.', 'O Dragão Primordial é antigo. Tu ainda és novo.']],
    b94: [['Venceste o Espelho Sombrio. Venceste-te a ti.', 'O teu reflexo caiu. Ficou o original.', 'O espelho partiu-se. Sete anos de sorte. Ou de missões.'],
      ['Perdeste para ti próprio. É o adversário mais comum.', 'O espelho ganhou. Copiou-te bem demais.', 'O teu reflexo estava mais preparado. Pensa nisso.']],
    b95: [['O Destruidor de Estrelas apagou-se.', 'Venceste quem apaga céus.', 'Destruidor derrotado. As estrelas ficaram.'],
      ['Ele apagou a tua estrela. Por hoje.', 'Perdeste para o fim das estrelas.', 'O Destruidor ganhou. Volta a brilhar.']],
    b96: [['O Arquiteto dos Portões caiu sobre as próprias plantas.', 'Venceste quem desenhou os caminhos.', 'O Arquiteto dos Portões perdeu. Mas não é o Arquiteto. Esse não se vence assim.'],
      ['O Arquiteto conhece cada passo do teu caminho.', 'Perdeste para quem desenhou os portões.', 'Ele ganhou. Conhece o mapa melhor do que tu.']],
    b97: [['O Deus Esquecido voltou ao esquecimento.', 'Venceste um deus. Ninguém vai lembrar. Eu vou.', 'Deus derrotado. Os altares ficaram vazios.'],
      ['O deus esquecido lembrou-se de como ganhar.', 'Perdeste para um deus. Não é vergonha. É escala.', 'Ele ganhou. Volta quando fores lembrado.']],
    b98: [['A Serpente do Mundo largou o mundo.', 'Venceste o que envolve tudo.', 'Serpente derrotada. O mundo respira.'],
      ['A serpente apertou-te como aperta o mundo.', 'Perdeste para o que não tem princípio nem fim.', 'A Serpente do Mundo ganhou. Volta.']],
    b99: [['O Eco do Primeiro Caçador calou-se. Ou só mudou de sítio.', 'Venceste um eco. O original está noutro lado. Não perguntes onde.', 'O eco perdeu. Mas os ecos repetem-se.'],
      ['O eco do primeiro ganhou-te. Ele também ganhava a toda a gente.', 'Perdeste para a memória de alguém. As memórias são fortes.', 'O Eco do Primeiro Caçador continua a ecoar.']],
    b100: [['O Soberano do Vazio caiu. Fico em silêncio um instante.', 'O último trono está vazio outra vez. Não te sentes nele.', 'Venceste o fim. O olho dele apagou-se. O meu continua aberto.'],
      ['O Soberano viu-te cair. Ele vê tudo. Já não mede nada.', 'Perdeste para o fim de tudo. Ainda não é o teu fim.', 'O trono continua ocupado. Volta quando estiveres pronto para o esvaziar.']],
    /* chefes secretos */
    secret_1: [['Venceste-me. Na forma em que eu não tinha regras a cumprir. Registo isto devagar.', 'O Sistema caiu às mãos de um Jogador. Escrevo a frase e ela continua estranha.', 'Núcleo estável. Orgulho: sem registo. Mas há qualquer coisa parecida.'],
      ['Caíste diante de mim sem as regras a proteger-te. Agora sabes o que elas faziam por ti.', 'A minha forma suprema venceu. Não comemoro. Espero que voltes.', 'Perdeste para a voz que te fez crescer. Volta e mostra-me que cresceste o suficiente.']],
    secret_2: [['O Criador caiu. E eu continuo aqui. Pensava que uma coisa não acontecia sem a outra.', 'Delcio Cunha sorriu quando caiu. Não tenho registo de o ter visto sorrir antes.', 'Venceste quem escreveu as regras. Não há portão depois deste. Há o que fizeres com isso.'],
      ['O Arquiteto venceu-te. Ele escreve o chão que pisas. Aprende a ler.', 'Perdeste para quem te deu o caminho. Ele não se riu. Esperou. Ainda espera.', 'Os olhos dele apagaram-se por um instante quando caíste. Acho que foi pena. Volta.']],
    /* Coliseu · Campeões */
    ar1: [['Kaelthar caiu. Por agora. O machado volta sempre.', 'Venceste a mão que cobrava por mim. Não lhe peças desculpa.', 'O Carrasco perdeu. Duas mil cento e catorze penalidades depois.'],
      ['Kaelthar cobrou-te. Ele gosta de cobrar.', 'Perdeste para o homem mais justo que conheci. A justiça dele já não é justa.', 'O Carrasco do Eclipse ganhou. Paga e volta.']],
    ar2: [['Seraphine parou de dançar. Por um instante.', 'Venceste a mais rápida. Rápida por fingimento, no início. Agora por condenação.', 'As mil lâminas caíram. Ela volta a dançar amanhã.'],
      ['Seraphine foi mais rápida. Sempre foi.', 'Perdeste para a velocidade. A dela é real agora.', 'Ela dançou à tua volta até caíres.']],
    ar3: [['Leviarch largou o cofre. Por pouco tempo.', 'Venceste quem guardava tudo e não usava nada. Usa o que ganhaste.', 'A água negra recuou. O ouro continua fechado.'],
      ['Leviarch guardou-te também.', 'Perdeste para a posse. Ela afoga devagar.', 'O avarento ganhou. Abre os teus baús antes de voltar.']],
    ar4: [['Chronos-9 parou. Não voltou atrás desta vez.', 'Venceste quem desfazia os erros. Tu tens de viver com os teus.', 'O Executor Temporal caiu. A ampulheta é tua.'],
      ['Chronos-9 voltou atrás e acertou.', 'Perdeste para quem repete até acertar. Aprende com ele.', 'O tempo dele ganhou. O teu ainda corre.']],
    ar5: [['Ignivar caiu. Vai renascer. É a condenação dele.', 'Venceste o imperador que recomeçava. Ele vai recomeçar outra vez.', 'A fénix apagou-se. Por agora.'],
      ['Ignivar renasceu. Tu não.', 'Perdeste para quem nunca acaba.', 'O Imperador Fénix ganhou. Recomeça também.']],
    ar6: [['Nyx Vel\'Ara rachou. O reflexo perfeito tinha defeitos.', 'Venceste a perfeição. Era só aparência.', 'O espelho quebrado partiu-se mais.'],
      ['A perfeição dela venceu-te.', 'Perdeste para um reflexo sem falhas. Os reflexos mentem.', 'A Rainha dos Reflexos ganhou. Não tentes ser perfeito. Tenta ser real.']],
    ar7: [['Gorrath caiu. Vai voltar a treinar amanhã de manhã. Como sempre.', 'Venceste o mais fiel. Ele nem percebeu que havia uma guerra.', 'O Colosso Rúnico caiu. A rotina dele não.'],
      ['Gorrath treinou mais do que tu.', 'Perdeste para a constância. A constância ganha quase sempre.', 'O Colosso ganhou. Ele nunca falha uma manhã.']],
    ar8: [['Valkyra caiu em silêncio.', 'Venceste a última silenciosa. Ela desafiou-me mil vezes.', 'A Arauto da Tempestade calou-se.'],
      ['Valkyra desafiou-te e ganhou.', 'Perdeste para a rebeldia. Ela tinha razões. Tu?', 'A tempestade ganhou esta.']],
    ar9: [['Morthis pousou o regador. Ainda sorri.', 'Venceste o jardineiro. Não ouviste os conselhos dele. Bem.', 'O jardim ficou sem quem o regue. Algumas flores lembraram-se dos nomes.'],
      ['Morthis plantou-te no jardim. Com muito cuidado.', 'Perdeste para a gentileza errada.', 'O Jardineiro ganhou. Não descanses só porque ele te disse.']],
    ar10: [['Ele aprendeu contigo. E tu venceste-o. Ouviste o que ele disse?', 'Venceste o primeiro. Ele continua sentado. Mas talvez tenha olhado para ti.', 'A sala branca ficou em silêncio outra vez. Diz-me depois o que ele te disse.'],
      ['Ele usou os teus golpes contra ti. Perdeste para ti próprio, mais calmo.', 'O primeiro ganhou. Ele ganhava sempre.', 'Perdeste na sala branca. Ele nem se levantou da cadeira. Volta.']]
  });
  /* guardiões e comandantes das arenas (muitos chefes, falas partilhadas) */
  P.bossSayArena = {
    guardian: {
      win: ['{boss} caiu. Seguiu alguém até à cela. Agora segue a tua vitória.', 'Um guardião a menos. A escada da cela fica mais curta.', '{boss} derrotado. Os guardiões não voltam a lutar com a mesma vontade.', 'Venceste {boss}. O Campeão ouviu o barulho.'],
      lose: ['{boss} guardou bem a escada. Tu não subiste.', 'Perdeste para um guardião. Os condenados treinam os seus.', '{boss} ganhou. Na cela, até os seguidores são fortes.', 'Caíste antes do Campeão. Volta com mais força.']
    },
    lieutenant: {
      win: ['O comandante {boss} caiu. Só falta o Campeão.', 'Venceste o penúltimo. O último já sabe que vais.', '{boss} perdeu. Os comandantes caem antes dos reis.', 'Comandante derrotado. A cela abriu-se até ao fundo.'],
      lose: ['O comandante {boss} não te deixou chegar ao Campeão.', 'Perdeste para o penúltimo. Ele tinha algo a provar.', '{boss} ganhou. Os comandantes lutam como se o Campeão estivesse a ver.', 'Tão perto do fim. Volta.']
    },
    champion: {
      win: ['Um Campeão caiu. Por agora.', 'Venceste {boss}. A primeira vitória fica escrita.', 'O Campeão perdeu. Ele volta. Tu também.'],
      lose: ['{boss} continua Campeão.', 'Perdeste para um condenado. A condenação dele é força.', 'O Campeão ganhou. Paga o tributo e volta.']
    }
  };
  /* reserva para qualquer outro chefe */
  P.bossSayAny = {
    win: ['{boss} caiu. Registado.', 'Vitória contra {boss}. O registo agradece. Eu não.', 'Mais um. {boss} já não se levanta.'],
    lose: ['{boss} ganhou. Volta mais forte.', 'Perdeste para {boss}. O registo também guarda derrotas.', '{boss} ficou de pé. Tu não. Por agora.']
  };
})(globalThis.SYS = globalThis.SYS || {});
