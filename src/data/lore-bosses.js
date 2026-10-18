/* ==========================================================
   CRÓNICAS DOS CHEFES
   Texto narrativo mostrado na janela de informação de cada chefe.
   ========================================================== */
(function (S) {
  'use strict';

  /* Descrição de cada portão (aparece por cima da crónica do chefe) */
  S.GATE_LORE = {
    1: 'Uma floresta antiga onde as árvores falam entre si em sussurros. Foi o primeiro portão a abrir-se no mundo, e por isso é o mais vivo: tudo aqui caça, tudo aqui tem fome.',
    2: 'Túneis que brilham sozinhos, escavados por algo que não era humano. O cristal guarda ecos: quem fala alto demais ouve a própria voz voltar, anos depois.',
    3: 'Água parada, ar espesso e uma névoa verde que nunca levanta. Aquilo que morre no pântano não apodrece em paz: continua a mexer-se.',
    4: 'O que resta de um império que adorava o sol. As areias escondem templos inteiros, e os seus guardiões ainda cumprem ordens dadas há mil anos.',
    5: 'Uma fortaleza erguida no gelo por gigantes que já não existem. O frio aqui não é clima: é uma vontade, e essa vontade quer-te imóvel.',
    6: 'O coração de um vulcão que nunca adormeceu. A rocha corre como rio e os demónios forjam nas suas margens armas para uma guerra que ainda não começou.',
    7: 'Uma cidade inteira engolida pelo mar numa só noite. Os sinos ainda tocam debaixo de água, e os afogados ainda respondem.',
    8: 'Um castelo suspenso acima das nuvens, onde os anjos deixaram de ouvir as orações e começaram a ouvir apenas a própria glória.',
    9: 'Um buraco no mundo sem fundo conhecido. Quem cai não chega ao chão: chega a outro sítio, e esse sítio olha de volta.',
    10: 'O lugar onde os portões nascem. Não há céu, não há chão, só um trono no meio do nada e a sensação de que alguém te observa desde o primeiro dia.',
    0: 'Portões que não constam de nenhum registo do Sistema. Existem nas margens, onde as regras se dobram.'
  };

  S.BOSS_LORE = {
    // ---------- Portão 1: Floresta Sussurrante ----------
    b1: 'Era o mais velho da matilha muito antes de o portão se abrir. Quando a magia do Sistema tocou a floresta, foi o primeiro a beber dela, e os seus olhos ficaram da cor da lua. Caça sozinho desde então: diz-se que comeu os irmãos para não ter de partilhar o poder.',
    b2: 'Um javali que cresceu a comer raízes impregnadas de mana até as presas lhe ficarem duras como ferro forjado. Não pensa, não negoceia, não recua. Carrega contra tudo o que se mexe e já derrubou árvores com mais de três séculos.',
    b3: 'Tece teias tão finas que só se veem quando a luz da manhã lhes bate. Guarda nelas os restos de caçadores antigos, embrulhados como presentes, e lembra-se do nome de cada um. A seda dela é veneno: quem lhe toca começa a adormecer.',
    b4: 'Ruk não era o goblin mais forte da tribo, mas era o mais barulhento. Matou o antigo chefe com um cutelo roubado e desde então governa à base de gritos e medo. Por baixo da arrogância, tem pavor de voltar a ser ninguém.',
    b5: 'Dormiu durante um século debaixo de uma camada de musgo tão espessa que as aves faziam ninhos no seu dorso. O portão acordou-o com fome e mau humor. As garras dele têm líquenes que nunca deixam as feridas fechar bem.',
    b6: 'Foi a árvore mais antiga da floresta, onde os druidas faziam juramentos. Quando a magia corrompida lhe entrou pelas raízes, a seiva ficou negra e o tronco abriu uma boca. Agora alimenta-se dos que se sentam à sua sombra.',
    b7: 'Rainha de uma colmeia do tamanho de uma aldeia. Comunica com as filhas através de um zumbido que faz doer os dentes. Cada vespa dela carrega uma gota de veneno, e ela carrega o veneno de todas.',
    b8: 'Xamã da tribo de Ruk, e o verdadeiro poder por trás do trono. Fala com espíritos que só ele ouve e usa um cajado com a caveira do mestre que o ensinou. As suas maldições não matam: enfraquecem, até o resto do trabalho ser fácil.',
    b9: 'Nasceu entre as raízes da árvore-mãe e cresceu enrolada nelas, até já não se saber onde acaba a serpente e começa a madeira. Sente cada passo que se dá na floresta através do chão. Ataca sempre de onde não se espera.',
    b10: 'Fenrath não nasceu rei: conquistou a coroa matando o alfa anterior numa noite sem lua. Desde então, nenhum lobo da floresta uiva sem a sua permissão. É inteligente, paciente e cruel, e lembra-se de todos os caçadores que fugiram dele.',
    // ---------- Portão 2: Cavernas de Cristal ----------
    b11: 'Cego desde que nasceu, vê através do eco. Nas cavernas de cristal, cada som volta multiplicado, e ele aprendeu a ouvir o bater de um coração a cem metros. Bebe sangue para se manter quente no frio das profundezas.',
    b12: 'Construído pela Rainha Cristalina a partir de quartzo vivo, para guardar a entrada do seu reino. Não tem vontade própria, só ordens. O núcleo que lhe bate no peito é um cristal que a rainha arrancou do próprio trono.',
    b13: 'Um lagarto cujas escamas se transformaram em cristal depois de dormir anos sobre um veio de mana pura. Brilha quando ataca, e esse brilho cega quem o olha de frente. Coleciona tudo o que reluz, incluindo dentes.',
    b14: 'Um mineiro humano que entrou nas cavernas para procurar fortuna e nunca saiu. Encontrou um cristal amaldiçoado e não o largou. A lanterna dele ainda arde, cem anos depois, com uma chama que não é fogo.',
    b15: 'O melhor ferreiro das profundezas. Os kobolds dizem que forjou armas para reis de portões que já caíram. Trabalha sem descanso numa bigorna aquecida por cristais de fogo, e tem orgulho de cada golpe que dá.',
    b16: 'Um verme do tamanho de um túnel, que escava a rocha com um anel de dentes de diamante. Grande parte das passagens das cavernas foram abertas por ele. Quando se aproxima, a terra treme e as estalactites caem.',
    b17: 'Uma tempestade de cristais roxos com vontade própria. Nasceu do excesso de mana acumulado numa gruta fechada. Não tem corpo fixo: desfaz-se e refaz-se, e bebe a mana de quem se aproxima para continuar a existir.',
    b18: 'Um troll que desceu às profundezas há gerações e se esqueceu do caminho de volta. A pele dele cicatriza mais depressa do que se consegue cortar. Usa como clava um pedaço de cristal que pesa mais do que um cavalo.',
    b19: 'A última guarda pessoal da Rainha Cristalina. Fica de pé diante da porta do trono há tanto tempo que os pés se fundiram com o chão. Tem uma única ordem gravada no peito: ninguém passa.',
    b20: 'Varyss era uma princesa humana que se perdeu nas cavernas e foi encontrada pelo cristal. Ele prometeu-lhe beleza eterna, e cumpriu. Agora reina sobre uma galeria de estátuas: todos os que entraram e não souberam sair.',
    // ---------- Portão 3: Pântano Pútrido ----------
    b21: 'Um sapo que engoliu tanta água contaminada que o próprio corpo passou a produzir ácido. A língua derrete armaduras e a pele queima ao toque. É mais esperto do que parece: espera imóvel durante dias pela presa certa.',
    b22: 'Vive numa cabana sobre estacas, cozinhando venenos num caldeirão que nunca arrefece. Diz que já foi curandeira numa aldeia que a expulsou. O lodo responde-lhe como um animal de estimação.',
    b23: 'Um crocodilo com uma carapaça de placas de osso tão grossas que as flechas lhe ressaltam. Afunda-se no lodo e fica à espera, só com os olhos à superfície. Quando morde, não larga.',
    b24: 'Ainda é jovem, e por isso só tem cinco cabeças. Cada uma pensa de forma diferente, e discutem entre si durante o combate. Corta-se uma e nascem duas: a única forma de a vencer é ser mais rápido do que ela cresce.',
    b25: 'Um fungo gigante que cresce sobre os corpos de quem morreu no pântano. Liberta nuvens de esporos que adormecem, envenenam e, mais tarde, fazem crescer novos cogumelos dentro de quem os respirou.',
    b26: 'Afogou-se no pântano numa noite de nevoeiro, a tentar salvar alguém. A água não o deixou ir. Agora vagueia arrastando correntes que não se lembra de ter, e puxa para o fundo todos os que lhe estendem a mão.',
    b27: 'Uma sanguessuga do tamanho de um barco, que vive no fundo das águas mais escuras. Quando se agarra, suga tanto sangue que a vítima fica pálida em segundos. Regenera-se com o que bebe.',
    b28: 'Um lagarto que roubou um grimório a um mago afogado e aprendeu a ler sozinho. A magia dele é desajeitada mas perigosa, e cheira a pântano queimado. Sonha ser respeitado pelos magos da superfície.',
    b29: 'Uma árvore morta onde a aldeia antiga castigava os traidores. As cordas nunca apodreceram e os ramos ainda se mexem com o vento, mesmo quando não há vento. Dizem que as almas dos enforcados ainda estão presas à casca.',
    b30: 'Morvenna era a alquimista que tentou curar a praga do pântano e acabou por se tornar a própria praga. Usa uma máscara de bico cheia de ervas para não sentir o cheiro de si mesma. Onde ela passa, as plantas murcham e a água fica verde.',
    // ---------- Portão 4: Ruínas do Deserto ----------
    b31: 'Um escorpião com uma carapaça dourada que os sacerdotes antigos veneravam como mensageiro do sol. O ferrão contém veneno suficiente para derrubar um camelo. Gosta de enterrar-se na areia quente e esperar.',
    b32: 'Uma múmia que ainda cumpre a última ordem do faraó: guardar o túmulo até ao fim dos tempos. As ligaduras estão impregnadas de óleos sagrados que a mantêm de pé e lhe fecham as feridas.',
    b33: 'Um verme gigantesco que nada sob a areia como um peixe na água. Antes de atacar, o chão vibra e as dunas mudam de forma. Engoliu caravanas inteiras, e algumas ainda estão lá dentro, dizem.',
    b34: 'Um sacerdote com cabeça de chacal que guarda os ritos de passagem dos mortos. Pesa a alma de cada intruso numa balança dourada, e a balança nunca lhe dá razão. Rouba a energia de quem lhe mente.',
    b35: 'Um golem esculpido em arenito pelos construtores do império, com hieróglifos gravados no corpo inteiro. As inscrições contam a história da sua criação, e a última linha diz apenas: obedece.',
    b36: 'Um génio que foi aprisionado numa lâmpada durante mil anos e libertado por um ladrão descuidado. Concede desejos, mas sempre com uma armadilha escondida. Tem prazer em ver as pessoas a arrependerem-se do que pediram.',
    b37: 'Guarda a entrada do palácio solar com um enigma que ninguém resolveu. Quem responde mal é devorado; quem tenta passar sem responder também. Na verdade, já se esqueceu da resposta certa.',
    b38: 'Um faraó tão esquecido que nem o nome ficou registado. Foi apagado das paredes pelo próprio filho, e o rancor manteve-o vivo. Suga a vida de quem entra no seu túmulo para recuperar o que lhe roubaram.',
    b39: 'Uma serpente coberta de escamas de ouro puro. O olhar dela paralisa e o veneno queima por dentro. Os ladrões de túmulos chamam-lhe a Avara, porque guarda tesouros que nunca usa.',
    b40: 'Ankharet governou o império do sol durante trezentos anos. Quando a morte lhe veio buscar, recusou-se a ir, e o sol, por respeito, nunca mais se pôs sobre o seu palácio. Combate com a fúria de quem já perdeu tudo menos o orgulho.',
    // ---------- Portão 5: Fortaleza de Gelo ----------
    b41: 'Um yeti mais velho do que a própria fortaleza. A pelagem branca está coberta de gelo que nunca derrete, e o rugido provoca avalanches. Os gigantes usavam-no como sentinela, e ele continua a vigiar.',
    b42: 'Um lobo feito de neve compactada e vento cortante. Caça em silêncio absoluto, e os seus uivos só se ouvem depois de ter atacado. Dizem que é o fantasma de um dos irmãos de Fenrath.',
    b43: 'Um cavaleiro que jurou proteger a fortaleza e morreu congelado no posto. O gelo manteve-o de pé, e o juramento manteve-o a lutar. A armadura dele ficou tão dura que nenhuma lâmina comum a risca.',
    b44: 'Um mago que procurou a imortalidade no frio absoluto e encontrou-a. Guarda a alma num filactério de gelo escondido na fortaleza. Fala devagar, porque tem todo o tempo do mundo.',
    b45: 'Um mamute treinado para a guerra pelos gigantes, com armadura de ferro e presas reforçadas. Ainda carrega no dorso a torre de onde os arqueiros gigantes disparavam. Uma carga dele deita abaixo muralhas.',
    b46: 'Uma harpia que nasceu no olho de uma tempestade de neve. As penas cortam como lâminas e o grito congela o ar. Ataca sempre em voo picado, protegida pela nevasca que a acompanha.',
    b47: 'O último dos gigantes de gelo que construíram a fortaleza. Hrimr ficou para guardar a obra quando os outros partiram para uma guerra de que nunca voltaram. A barba dele é feita de estalactites.',
    b48: 'O lamento de todos os que morreram de frio na fortaleza, reunido num só ser. Não tem rosto, só uma boca que chora. Quando se aproxima, o calor do corpo começa a fugir.',
    b49: 'Um dragão jovem de escamas brancas que ainda não aprendeu a ter paciência. O sopro dele congela rios inteiros. É orgulhoso e impulsivo, e quer provar à rainha que merece um lugar ao lado do trono.',
    b50: 'Skadhi foi coroada no dia mais frio de que há memória e jurou que o inverno nunca mais acabaria. Cumpriu. O coração dela parou há séculos, mas o gelo continua a obedecer-lhe. Não odeia ninguém: simplesmente já não sente nada.',
    // ---------- Portão 6: Vulcão Carmesim ----------
    b51: 'Uma salamandra que vive dentro da lava e sai à superfície apenas para caçar. A pele dela incendeia tudo o que toca. Move-se tão depressa que deixa rastos de fogo no chão.',
    b52: 'Um golem de rocha derretida, mantido coeso por um núcleo de magma puro. Quando é atingido, endurece; quando se zanga, derrete. Foi criado pelos demónios ferreiros para proteger as forjas.',
    b53: 'Um cão de guerra com duas cabeças que nunca concordam em nada exceto em morder. Os demónios usam-no para caçar fugitivos. A coleira de ferro em brasa tem gravado o nome do dono: um nome que não se deve dizer em voz alta.',
    b54: 'O mestre das forjas do vulcão. Martela metal na lava há mil anos e as armas dele estão em todos os portões. Despreza quem usa armas sem saber como foram feitas.',
    b55: 'Uma fénix que morreu e renasceu tantas vezes dentro do vulcão que as cinzas ficaram contaminadas. Agora renasce corrompida, com penas negras e fogo roxo. Ainda se cura, mas cada renascimento a torna mais cruel.',
    b56: 'Um espírito de fogo puro, nascido de uma erupção. Não sabe fazer nada sem raiva, e a raiva faz-lhe crescer as chamas. Diz-se que a chama dele é eterna e que ninguém a conseguiu apagar.',
    b57: 'Uma serpente que nada em rios de lava e dorme dentro do próprio vulcão. As escamas são rocha fundida que arrefeceu à superfície. Quando se enrola à volta de alguém, a pedra derrete.',
    b58: 'O que resta de um feiticeiro que tentou controlar o vulcão e foi reduzido a cinzas. As cinzas não esqueceram. Rodopiam juntas com a forma de um homem e carregam uma urna com os restos do próprio corpo.',
    b59: 'Um gigante cujo corpo é uma fogueira permanente. Foi convocado pelos demónios para uma guerra contra os céus e ficou esquecido no vulcão quando a guerra foi adiada. Está impaciente.',
    b60: 'Pyraxis dorme no coração do vulcão desde antes de existirem portões. Quando abre os olhos, a montanha acorda com ele. É vaidoso, antigo e terrivelmente inteligente, e considera os humanos apenas fagulhas que se apagam depressa.',
    // ---------- Portão 7: Cidade Submersa ----------
    b61: 'Um polvo gigante que vive nas torres afundadas da cidade. Chamam-lhe menor só porque existe um maior, algures mais fundo. Os tentáculos dele arrastaram barcos inteiros para o fundo.',
    b62: 'Canta nas ruínas da catedral submersa, e a voz dela atravessa a água e a pedra. Quem a ouve esquece-se de respirar. Não é cruel: só se sente sozinha, e quer companhia para sempre.',
    b63: 'Um tubarão que se adaptou às profundezas mais escuras e ficou cego, pálido e enorme. Sente o sangue na água a quilómetros. Os dentes partidos que deixa nas presas voltam a crescer em horas.',
    b64: 'Um soldado tritão da antiga guarda real da cidade. Continua a patrulhar as mesmas ruas, a mesma ronda, todos os dias, desde que a cidade afundou. Não aceita que o reino acabou.',
    b65: 'Uma enguia carregada de eletricidade que ilumina as ruas submersas como um relâmpago azul. Gosta de se esconder nas lâmpadas antigas da cidade. Um só toque dela faz parar o coração.',
    b66: 'Um filhote de leviatã, ainda do tamanho de um navio. A mãe deixou-o a guardar a cidade enquanto foi para o oceano profundo. Cura-se com a água à sua volta e não percebe porque é que tudo o que toca se desfaz.',
    b67: 'A última sacerdotisa do templo do mar. Rezou para salvar a cidade e o mar respondeu, só que à sua maneira: afundou-a para a proteger para sempre. Ela ainda reza, e as marés ainda a ouvem.',
    b68: 'Um caranguejo com uma carapaça tão grande que os habitantes da cidade o confundiam com um edifício. As pinças fecham com força suficiente para partir uma âncora. Leva a vida devagar, mas nunca larga o que apanha.',
    b69: 'Algo que subiu do fundo do oceano quando a cidade afundou. Ninguém sabe o que era antes. É feito de tentáculos, olhos e fome, e envenena tudo o que toca.',
    b70: 'Thalassor foi o rei que, para salvar o trono de uma invasão, fez um pacto com o mar. O mar aceitou, e levou a cidade inteira para o fundo, com ele lá dentro. Reina sobre súbditos afogados e não admite que perdeu.',
    // ---------- Portão 8: Cidadela Celestial ----------
    b71: 'O grifo que transportava os mensageiros dos céus. Quando a cidadela se corrompeu, recusou-se a servir outros donos e ficou a guardar o pátio real. Os voos picados dele são mais rápidos do que flechas.',
    b72: 'Um anjo que caiu por vontade própria, convencido de que a terra precisava de juízes. Descobriu que a terra não queria ser julgada. A auréola partiu-se na queda, e o rancor ficou inteiro.',
    b73: 'Um golem construído pelos anjos em mármore celeste e runas de luz. Foi feito para proteger, mas o código dele foi reescrito. Não distingue amigos de inimigos: só quem tem permissão e quem não tem.',
    b74: 'Uma valquíria que conduzia guerreiros mortos para o paraíso e começou a escolher apenas os que lhe agradavam. Foi expulsa da guarda celeste e jurou vingança. Luta como uma tempestade.',
    b75: 'Um serafim de seis asas que já brilhou mais do que o sol. A luz dele ficou turva e quente demais, e agora queima em vez de iluminar. Ainda canta hinos, mas as letras mudaram.',
    b76: 'O mensageiro dos céus, que anunciava as decisões dos deuses com uma trompa de ouro. Hoje anuncia apenas castigos. O som da trompa dele derruba muros e deixa os ouvidos a sangrar.',
    b77: 'Uma criatura criada pelos alquimistas celestes com partes de leão, águia e serpente, para ser a guardiã perfeita. Saiu perfeita demais: três cabeças, três vontades, três formas de matar.',
    b78: 'O cavaleiro que defendia a cidadela ao nascer do sol. Ainda acredita que serve a luz, e por isso é tão perigoso: luta com a convicção de quem acha que está do lado certo.',
    b79: 'Um arcanjo que liderava os exércitos celestes. Quando a imperatriz mudou, ele seguiu-a sem fazer perguntas. A espada dele arde com um fogo branco que não perdoa.',
    b80: 'Auriel era a guardiã da cidadela até decidir que os céus mereciam uma rainha e não um conselho. Dissolveu o conselho, expulsou os que discordaram e sentou-se no trono alado. Desceu dos céus porque quis, e trouxe a guerra.',
    // ---------- Portão 9: Abismo Sem Fim ----------
    b81: 'Uma criatura que vive na fronteira entre a luz e o abismo e se alimenta de toda a claridade que lá chega. À sua volta, as tochas apagam-se e os olhos deixam de ver. Ninguém sabe que forma tem.',
    b82: 'O ser que habita os pesadelos de quem dorme perto do abismo. Na realidade é pequeno e frágil, mas nunca aparece na realidade. Arrasta as vítimas para dentro dos próprios medos.',
    b83: 'Um demónio coberto de olhos que nunca se fecham. Vê o passado, o presente e as mil formas como podes morrer. Escolhe sempre a mais dolorosa.',
    b84: 'O coletor de almas do abismo. Não mata por ódio: mata por ofício, e é muito bom no seu trabalho. A foice dele não corta carne, corta a ligação entre o corpo e a vida.',
    b85: 'Uma besta do tamanho de uma montanha, feita de sombra sólida. Caminha pelo fundo do abismo sem pressa, porque nada a consegue parar. Um chifre dela vale um reino.',
    b86: 'O imperador dos lich, que se proclamou senhor da morte. Comanda exércitos de mortos-vivos a partir de um trono de ossos e reúne almas como moedas. É paciente: já sobreviveu a todos os inimigos.',
    b87: 'O esqueleto de um dragão antigo, reanimado por magia do abismo. Já não respira fogo: respira podridão. Lembra-se vagamente de ter sido livre e odeia quem o trouxe de volta.',
    b88: 'Belzar é um dos arquidemónios que governaram o abismo antes do príncipe. Perdeu o trono, mas não o poder. O coração dele bate em brasas e alimenta-se do sofrimento à sua volta.',
    b89: 'O caos ganhou forma porque alguém pediu ordem demais. Muda de elemento a cada segundo: fogo, gelo, veneno, trovão. Não tem objetivo, nem lógica, nem fim.',
    b90: 'Nyxaroth é o herdeiro do abismo, nascido no ponto mais fundo onde nem a luz se atreve a chegar. Foi criado para governar o nada e aprendeu a desejar tudo. Fala sempre com calma, porque nunca perdeu uma batalha.',
    // ---------- Portão 10: Trono do Vazio ----------
    b91: 'A primeira linha de defesa do Trono do Vazio. Foi feito de estrelas mortas e não tem nome nem rosto. Existe apenas para impedir que alguém chegue ao trono, e já impediu muitos.',
    b92: 'Um titã que controla o fluxo do tempo à volta do trono. Na presença dele, os segundos esticam e os anos encolhem. Já viu a tua derrota e a tua vitória, e ainda não decidiu qual prefere.',
    b93: 'O primeiro dragão que existiu, de quem todos os outros descendem. Não é mau nem bom: é anterior a essas ideias. Combate porque é isso que os dragões fazem.',
    b94: 'Um espelho que mostra o que és, e depois sai do vidro para lutar contigo. Copia os teus movimentos, as tuas forças e as tuas fraquezas. Para o vencer, tens de ser melhor do que tu próprio.',
    b95: 'Um ser que devora estrelas para se manter vivo. Já apagou galáxias inteiras, e aquilo que vês no céu à noite pode ser apenas o que ele ainda não comeu. Não fala: o silêncio dele é o som do universo a acabar.',
    b96: 'Quem desenhou os portões? Ele. Mantém a planta original de cada portão e ainda faz alterações quando acha que estão fáceis demais. Encara-te como um engenheiro encara um defeito.',
    b97: 'Um deus que já foi adorado por milhões e acabou esquecido. Sem fé, perdeu o nome, o rosto e quase todo o poder. O pouco que resta é suficiente para esmagar quem o perturba.',
    b98: 'Uma serpente tão grande que se enrola à volta do mundo e morde a própria cauda. Se a soltar, o mundo desfaz-se. Por isso, cada vez que combate, arrisca tudo.',
    b99: 'O eco de alguém que chegou aqui antes de ti. O primeiro caçador escolhido pelo Sistema, que ficou preso no trono para sempre. Luta como tu lutas, porque um dia foi como tu.',
    b100: 'O Soberano do Vazio esteve à tua espera desde o primeiro dia. Viu cada missão que cumpriste e cada uma que falhaste. É o último chefe e o primeiro mistério: talvez o Sistema tenha sido criado apenas para chegares a ele.',
    // ---------- Portões ocultos ----------
    secret_1: 'Ninguém sabe que portão este guardião protege, porque esse portão foi apagado de todos os registos. Ele ficou. Só aparece a quem segue o mapa certo, e só deixa passar quem provar que merece saber o que foi esquecido.',
    secret_2: 'Quem criou o Sistema? Quem escolheu os caçadores, ergueu os portões e escreveu as regras? O Arquiteto observa desde o início, e só aceita encontrar-se com quem derrotou todos os cem chefes. A conversa que tem contigo é a última.'
  };
})(globalThis.SYS = globalThis.SYS || {});
