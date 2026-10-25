/* ==========================================================
   NARRATIVA DOS ITENS E TROFÉUS
   S.ITEM_LORE[id]        texto próprio do item
   S.ITEM_LORE_FAMILY     texto partilhado por famílias (atributos, talismãs...)
   As versões "do Artesão" e "do Campeão" usam o texto do item base
   mais uma frase própria (S.VARIANT_LORE).
   ========================================================== */
(function (S) {
  'use strict';

  S.VARIANT_LORE = {
    _art: 'Esta versão passou pelas mãos de um artesão dos portões, que afinou o equilíbrio e o fio até cada golpe encontrar o ponto certo.',
    _camp: 'Esta é a versão reservada aos campeões: reforçada com metal de chefe e gravada com runas de resistência. É a mais forte que se pode comprar a este nível.'
  };

  S.ITEM_LORE = {
    /* ---------- Lazer ---------- */

    /* ---------- Armas: Guerreiro ---------- */
    w_guerreiro_1: 'Uma espada de ferro simples, forjada em série para os recrutas. Não é bonita, mas não parte.',
    w_guerreiro_2: 'A arma de um mercenário que vendia a espada a quem pagasse mais. Tem marcas de muitos donos.',
    w_guerreiro_3: 'Esta lâmina sobreviveu a tantas guerras que ganhou alma própria. Dizem que avisa o dono antes de um ataque.',
    w_guerreiro_4: 'Uma espada bastarda de aço temperado, longa o suficiente para usar com uma ou duas mãos.',
    w_guerreiro_5: 'As runas gravadas na lâmina brilham quando o guerreiro está em perigo e tornam cada golpe mais pesado.',
    w_guerreiro_6: 'Um montante tão quente que a bainha teve de ser feita de pedra. O fogo nunca se apaga.',
    w_guerreiro_7: 'Forjado com uma escama de dragão vermelho no núcleo. O metal ainda guarda o calor do sopro.',
    w_guerreiro_8: 'Pertenceu a um senhor da guerra que conquistou sete portões. Os inimigos ajoelhavam-se só de a ver.',
    w_guerreiro_9: 'Forjada durante um eclipse, com metal que caiu do céu. A lâmina absorve a luz à sua volta.',
    w_guerreiro_10: 'A espada de um rei guerreiro que caiu no Trono do Vazio. Ainda procura um dono digno de terminar a batalha dele.',
    /* ---------- Armas: Assassino ---------- */
    w_assassino_1: 'Duas adagas iguais, leves e equilibradas. O primeiro par de qualquer assassino que se preze.',
    w_assassino_2: 'Facas de arremesso escondidas no cinto e nas mangas. Quem as vê já está a sangrar.',
    w_assassino_3: 'Lâminas curvas como presas, com um canal para o veneno. Uma mordida basta.',
    w_assassino_4: 'Talhadas em vidro vulcânico, mais afiadas do que qualquer aço. Partem-se com facilidade, mas antes cortam tudo.',
    w_assassino_5: 'Só brilham ao entardecer. Os assassinos do crepúsculo usavam-nas para trabalhos que tinham de acabar antes da noite.',
    w_assassino_6: 'Dizem que estas lâminas sussurram ao dono onde está o coração do alvo.',
    w_assassino_7: 'Garras de metal negro forjadas num eclipse. Nas sombras, são invisíveis.',
    w_assassino_8: 'Usadas pela ordem do Corvo Negro, que nunca falhou um contrato. Os corvos seguem quem as empunha.',
    w_assassino_9: 'Forjadas numa noite de lua nova, quando não há luz nenhuma. Cortam também a esperança.',
    w_assassino_10: 'A arma mais temida dos assassinos. O nome diz tudo: quem a sente na pele recebe um beijo de que não se acorda.',
    /* ---------- Armas: Mago ---------- */
    w_mago_1: 'Um cajado de carvalho cortado numa noite de lua cheia. Canaliza mana de forma simples e fiável.',
    w_mago_2: 'A varinha que todos os aprendizes recebem no primeiro dia. Ainda tem marcas de dentes de um aluno nervoso.',
    w_mago_3: 'Um cetro com um cristal das cavernas no topo. Amplifica a mana como uma lente amplifica a luz.',
    w_mago_4: 'Gelo que nunca derrete, talhado em forma de cajado. Quem o segura sente os pensamentos mais claros.',
    w_mago_5: 'Um cajado que acompanha as marés das estrelas. Quanto mais escura a noite, mais forte é.',
    w_mago_6: 'Uma orbe com uma tempestade presa lá dentro. O trovão responde à voz do mago.',
    w_mago_7: 'O cetro oficial dos arquimagos da torre. Só os mais sábios o podem empunhar sem enlouquecer.',
    w_mago_8: 'As estrelas gravadas neste cajado mudam de posição todas as noites, de acordo com o céu verdadeiro.',
    w_mago_9: 'Um cetro feito de um pedaço do vazio entre as estrelas. Silencioso, frio e infinitamente poderoso.',
    w_mago_10: 'O cajado de onde, segundo a lenda, nasceu toda a magia. Segurá-lo é ouvir o primeiro feitiço alguma vez dito.',
    /* ---------- Armas: Guardião ---------- */
    w_guardiao_1: 'Um escudo de madeira reforçada com tiras de ferro. Já salvou mais vidas do que muitas espadas.',
    w_guardiao_2: 'Um broquel de bronze polido, leve o suficiente para atacar e defender no mesmo movimento.',
    w_guardiao_3: 'Usado pelos templários da antiga ordem. A cruz gravada no aço ainda afasta os mortos-vivos.',
    w_guardiao_4: 'Um escudo com a cabeça de um leão em relevo. Dizem que ruge quando é atingido.',
    w_guardiao_5: 'As runas deste escudo absorvem parte de cada golpe e devolvem-na em força ao guardião.',
    w_guardiao_6: 'A égide dos sacerdotes do sol. Brilha como o meio-dia e cega quem a ataca de frente.',
    w_guardiao_7: 'Um escudo tão grande que só um titã o deveria carregar. Nas mãos certas, nada passa.',
    w_guardiao_8: 'Uma muralha de pedra que respira. Regenera as próprias rachas com o tempo.',
    w_guardiao_9: 'O escudo da fortaleza dourada, que nunca caiu em mil cercos. O ouro é apenas a superfície: o núcleo é aço de estrela.',
    w_guardiao_10: 'Um escudo que já foi uma das muralhas da cidadela celeste. Proteger alguém com ele é como erguer um céu inteiro.',
    /* ---------- Armas: Arqueiro ---------- */
    w_arqueiro_1: 'Um arco curto e leve, ideal para quem está a aprender a mirar. Rápido de esticar, fácil de carregar.',
    w_arqueiro_2: 'O arco dos caçadores da floresta. Silencioso o suficiente para não assustar a presa.',
    w_arqueiro_3: 'Feito de teixo antigo, longo como um homem. As flechas voam mais longe do que a vista alcança.',
    w_arqueiro_4: 'Um arco composto de madeira, osso e tendão, com penas de falcão na empunhadura.',
    w_arqueiro_5: 'As flechas disparadas por este arco viajam com o vento norte e nunca se desviam.',
    w_arqueiro_6: 'Feito de uma árvore sagrada dos elfos. As folhas esmeralda nunca murcham.',
    w_arqueiro_7: 'Banhado em prata e luar. As flechas deixam um rasto de luz pálida no ar.',
    w_arqueiro_8: 'Cada disparo deste arco soa como um trovão. Os animais fogem antes de a flecha sair.',
    w_arqueiro_9: 'Feito com penas de uma ave-trovão. As flechas carregam eletricidade e voam mais depressa do que o som.',
    w_arqueiro_10: 'Um arco que dispara estrelas em vez de flechas. Dizem que foi esticado uma única vez antes de ti.',
    /* ---------- Armas: Invocador ---------- */
    w_invocador_1: 'Um grimório gasto pelo uso, com páginas soltas e manchas de vela. Ainda funciona, e é o que importa.',
    w_invocador_2: 'O diário de um necromante que registou cada alma que chamou. As últimas páginas estão escritas com outra letra.',
    w_invocador_3: 'Um tomo encadernado em couro escuro, com almas presas nas páginas. Sussurram quando se abre.',
    w_invocador_4: 'Uma lanterna que ilumina o mundo dos espíritos. À sua luz, os mortos respondem.',
    w_invocador_5: 'As páginas deste grimório são translúcidas e os feitiços flutuam acima delas.',
    w_invocador_6: 'Um grimório preso com correntes, porque tentou fugir várias vezes. O que está escrito lá dentro quer sair.',
    w_invocador_7: 'Um códice que abre uma fresta no véu entre os vivos e os mortos. Do outro lado, alguém espera.',
    w_invocador_8: 'O cetro de um general dos mortos. Uma legião inteira responde a quem o levanta.',
    w_invocador_9: 'Uma coroa feita com os ossos de mil guerreiros. Cada um deles ainda luta por quem a usa.',
    w_invocador_10: 'Um livro sem fundo, com páginas que nunca acabam. O abismo escreve nele, e quem o lê pode chamar o abismo.',

    /* ---------- Armas de rei ---------- */
    wk_fenrath: 'Arrancada da mandíbula do Rei Lobo. Ainda tem o instinto do caçador e procura sozinha os pontos fracos do alvo.',
    wk_varyss: 'O cetro com que Varyss transformava os intrusos em estátuas. Agora amplifica o poder de cada golpe crítico.',
    wk_morvenna: 'A foice com que a Senhora da Praga colhia as ervas venenosas. Cada corte rouba um pouco de vida ao alvo.',
    wk_ankharet: 'A lança cerimonial do Imperador Solar, que nunca deixou o sol pôr-se. Brilha com uma luz dourada que não aquece, queima.',
    wk_skadhi: 'Feita de gelo eterno, com a rainha ainda refletida na ponta. Torna o portador escorregadio como o inverno.',
    wk_pyraxis: 'Uma garra arrancada ao dragão vulcânico. O calor que guarda faz cada golpe crítico explodir.',
    wk_thalassor: 'O tridente do rei que afundou a cidade. A água obedece-lhe, e o sangue também.',
    wk_auriel: 'A espada da imperatriz celeste, forjada em luz sólida. Cura quem a empunha a cada turno.',
    wk_nyxaroth: 'A lâmina do príncipe do abismo, tão negra que parece um buraco no ar. Bebe sangue e devolve-o como força.',
    wk_solar: 'Forjada ao meio-dia exato, com o sol a pique sobre a bigorna. Enquanto houver luz, a lâmina arde com o calor do império solar. Quando o sol se põe, é apenas metal frio.',
    wk_lunar: 'Uma foice curva como a lua crescente, afiada com pó de prata ao luar. À noite, cada golpe bebe um pouco de vida. De dia dorme na mão de quem a carrega.',
    wk_soberano: 'O cetro do último chefe. Não foi feito para lutar: foi feito para governar. Quem o segura fica mais forte em tudo.',

    /* ---------- Armaduras ---------- */
    ar_couro: 'Uma túnica de couro curtido, simples e confortável. Protege de arranhões e pouco mais.',
    ar_acolchoada: 'Várias camadas de tecido acolchoado. Amortece golpes e mantém o corpo quente nas noites frias dos portões.',
    ar_malha: 'Milhares de anéis de ferro entrelaçados à mão. Pesa, mas trava lâminas que matariam.',
    ar_cacador: 'O colete oficial dos caçadores registados, com bolsos para tudo. Quem o veste aprende mais depressa com cada caçada.',
    ar_escamas: 'Placas sobrepostas como as escamas de um réptil. Flexível e resistente, popular entre os veteranos.',
    ar_placas: 'Uma armadura completa de placas de aço. Transforma qualquer caçador numa pequena fortaleza ambulante.',
    ar_runica: 'Placas gravadas com runas de proteção que se acendem quando o golpe vem. Absorvem magia e aço.',
    ar_sombra: 'Um manto tecido com sombras verdadeiras. Quem o veste fica difícil de ver e fácil de subestimar.',
    ar_arquimago: 'As vestes da ordem dos arquimagos, bordadas com fio de mana. Enchem o corpo de magia e regeneram-na sem parar.',
    ar_dragao: 'Feita com as escamas de Pyraxis, o dragão vulcânico. O fogo não a queima e poucas lâminas a riscam.',
    ar_celeste: 'A armadura dos guardiões da cidadela celeste. Branca, leve e mais forte do que o aço.',
    ar_coral: 'Uma armadura de coral vivo, arrancada ao reino de Thalassor. Continua a crescer e regenera o corpo de quem a usa.',
    ar_abismo: 'Feita com a escuridão sólida do Abismo Sem Fim. Bebe a vida dos inimigos e passa-a ao portador.',
    ar_soberano: 'A armadura do Soberano do Vazio. Não se compra, não se forja: conquista-se. É a proteção máxima que o Sistema conhece.',
    ar_meianoite: 'Um manto tecido com fios de sombra recolhidos à meia-noite. Enquanto for noite, envolve o portador como uma segunda pele. De dia é apenas pano escuro.',

    /* ---------- Acessórios ---------- */
    ac_cobre: 'Um anel de cobre simples, que os caçadores novatos usam por superstição. Funciona, um pouco, em tudo.',
    ac_forca: 'Um anel de ferro pesado que faz os músculos trabalharem mais, mesmo em repouso.',
    ac_agi: 'Um amuleto com uma pena presa em vidro. O corpo de quem o usa fica mais leve e rápido.',
    ac_vit: 'Um colar com uma pedra vermelha que pulsa ao ritmo do coração. Dá mais resistência ao corpo.',
    ac_int: 'Um brinco de cristal azul que clareia os pensamentos. Os sábios usavam-no nas noites de estudo.',
    ac_per: 'Um anel com um olho de falcão gravado. Afina a visão e os sentidos.',
    ac_mana: 'Um pendente de safira que guarda mana como uma bateria. Recarrega devagar durante o combate.',
    ac_espinhos: 'Um bracelete coberto de espinhos de ferro. Fere quem o usa um pouco e quem o enfrenta muito mais.',
    ac_fortuna: 'Um trevo de quatro folhas preservado em resina dourada. As moedas parecem multiplicar-se à volta dele.',
    ac_insignia: 'A insígnia que os caçadores experientes recebem da associação. Quem a usa aprende mais depressa com cada batalha.',
    ac_vampiro: 'Um anel com uma pedra vermelha que bebe sangue. Cada golpe dado devolve um pouco de vida ao dono.',
    ac_selo: 'Um selo usado para fechar pactos com espíritos. As invocações obedecem melhor e lutam mais forte.',
    ac_furia: 'Um colar de dentes de fera, quente ao toque. Torna os golpes críticos mais frequentes e mais devastadores.',
    ac_titan: 'O cinto de um titã, ajustado ao tamanho humano por um ferreiro paciente. Dá corpo e resistência.',
    ac_rank_d: 'A primeira insígnia oficial de rank. Prova que deixaste de ser um novato.',
    ac_rank_c: 'A insígnia de rank C, dada aos caçadores que já sobreviveram a vários portões.',
    ac_rank_b: 'A insígnia de rank B. A partir daqui, as guildas começam a reparar em ti.',
    ac_rank_a: 'A insígnia de rank A. Poucos caçadores no mundo têm uma.',
    ac_rank_s: 'A insígnia de rank S. Os caçadores deste nível são tratados como forças da natureza.',
    ac_rank_ss: 'A insígnia de rank SS. Não há registo oficial de quantos existem, porque quase ninguém lá chega.',
    ac_coragem: 'Dada a quem derrotou o primeiro chefe. Não vale muito, mas lembra-te do dia em que tudo começou.',
    ac_musgo: 'Um amuleto coberto de musgo da floresta sussurrante. Fecha as feridas devagar, como a natureza fecha as clareiras.',
    ac_lobo: 'Um colar feito com as presas do Rei Lobo. Dá ao portador o instinto do caçador.',
    ac_cristal: 'Um brinco de cristal das cavernas de Varyss. Os golpes críticos brilham e cortam mais fundo.',
    ac_praga: 'Um anel que contém uma gota da praga de Morvenna, selada em vidro. Rouba vida e fortalece o corpo.',
    ac_escaravelho: 'O escaravelho dourado do Imperador Solar, símbolo da riqueza eterna. Atrai moedas como o sol atrai o dia.',
    ac_gelo: 'O coração gelado de Skadhi, que já não bate. Torna o portador frio, difícil de acertar e difícil de ferir.',
    ac_dragao: 'Uma escama arrancada a Pyraxis. Dá vida e a fúria de um dragão nos golpes críticos.',
    ac_perola: 'A pérola que a sacerdotisa das marés usava nas orações. Regenera vida e mana como o mar regenera a costa.',
    ac_aureola: 'A auréola de Auriel, partida na queda. Ainda brilha um pouco, e ainda ensina.',
    ac_abismo: 'Um olho arrancado ao abismo, que continua a ver. Mostra ao portador onde atacar para matar.',
    ac_vazio: 'O anel do Soberano do Vazio. Quem o usa sente o Sistema inteiro a responder-lhe.',
    ac_disciplina: 'Uma fita dada a quem cumpriu sete dias seguidos. A disciplina é a arma mais subestimada.',
    ac_monge: 'Um rosário usado por monges que meditavam durante meses. Cura o corpo e acalma a mente.',
    ac_gigante: 'Um colar para quem derrubou inimigos maiores do que ele. Quanto maior o alvo, maior a queda.',
    ac_colecionador: 'Um medalhão dado a quem reuniu trinta troféus. Quem coleciona aprende a reparar em tudo.',
    ac_cacador_lenda: 'O emblema dos caçadores que juntaram oitenta troféus. É um título, não um prémio: poucos o merecem.',
    ac_sol: 'Um anel que guarda a primeira luz do dia. Enquanto houver sol, aquece o sangue e fortalece o corpo. À noite fica frio e calado.',
    ac_lua: 'Um pingente que acorda quando a lua sobe. À noite afina os reflexos e a mente; de dia dorme.',
    ac_galo: 'O selo dos que acordam antes do mundo. Só funciona de manhã, quando a disciplina é mais difícil e vale mais.',
    ac_coruja: 'O olho de uma coruja que nunca dormiu. Na escuridão, vê o que mais ninguém vê.',
    ac_aurora: 'A coroa que Ankharet usava ao nascer do sol. Enquanto for dia, o portador brilha com a força do império solar.',

    /* ---------- Consumíveis ---------- */
    po_vida1: 'Uma poção vermelha diluída, a mais comum nas bolsas dos caçadores. Fecha os cortes pequenos e devolve alguma cor ao rosto.',
    po_vida2: 'Uma poção de vida preparada por alquimistas certificados. Cura ferimentos sérios em segundos.',
    po_vida3: 'Um elixir carmesim tão concentrado que brilha no escuro. Uma gota cura tudo o que não for fatal.',
    po_mana1: 'Uma poção azul que sabe a água da chuva. Devolve a mana que um feitiço gastou.',
    po_mana15: 'Uma poção de mana mais densa, que os magos bebem a meio dos feitiços longos.',
    po_mana2: 'Um elixir de mana puro, destilado de cristais das cavernas. Enche a mana até ao limite.',
    po_restaura: 'Uma mistura cuidadosa de vida e mana. Os alquimistas dizem que é a poção mais equilibrada de todas.',
    po_fenix: 'Uma lágrima de fénix, recolhida no momento em que renasce. Cura tudo, devolve toda a mana e lava todas as maldições.',
    po_antidoto: 'Um frasco de ervas raras que neutraliza venenos, apaga queimaduras e estanca sangramentos.',
    po_furia: 'Um tónico amargo que acelera o coração e enche os músculos de raiva. Por pouco tempo, cada golpe vale mais.',
    po_furia2: 'Sangue de um berserker antigo, misturado com ervas proibidas. Dá uma força enorme, mas a defesa sofre.',
    po_pedra: 'Uma poção cinzenta e espessa que endurece a pele como rocha durante alguns turnos.',
    po_tita: 'O elixir que os gigantes bebiam antes da guerra. Transforma o corpo numa muralha.',
    po_vento: 'Uma essência que torna o corpo leve como o vento. Os golpes passam ao lado.',
    po_foco: 'Uma essência que limpa a mente de distrações. Durante alguns turnos, os golpes acertam onde devem.',
    po_predador: 'Uma poção feita com o olho de um predador das profundezas. Mostra os pontos fracos do inimigo como luzes.',
    po_vampiro: 'Um frasco de sangue de vampiro antigo. Durante alguns turnos, cada golpe devolve vida.',
    po_espelho: 'Uma poção prateada que transforma a pele num espelho. O dano recebido volta para quem o causou.',
    po_barreira: 'Um pergaminho com um feitiço de barreira já escrito. Basta rasgá-lo para ativar o escudo.',
    po_bomba: 'Uma bomba carregada com runas de explosão. O dano cresce com a experiência de quem a lança.',
    po_fogo: 'Um frasco de fogo líquido que não se apaga com água. Deixa o inimigo a arder durante vários turnos.',
    po_gelo: 'Uma granada cheia de gelo comprimido. Ao explodir, congela tudo à volta.',
    po_abismo: 'Uma bomba que contém um pedaço do vazio. Ao explodir, apaga parte da realidade à volta do alvo.',
    po_veneno: 'Um frasco de veneno para passar na lâmina. O inimigo vai sentindo-o turno após turno.',
    po_fraqueza: 'Um pó cinzento que, inalado, tira as forças e a resistência ao inimigo.',
    po_correntes: 'Uma corrente gravada com runas de selamento. Prende o inimigo durante um turno, sem falhar.',
    po_fumo: 'Um saquinho de pó que explode numa nuvem de fumo espesso. Perfeito para uma saída rápida e digna.',
    po_xp15: 'Um incenso que acalma a mente e torna a aprendizagem mais fácil. Durante algumas horas, tudo ensina mais.',
    po_xp2: 'Um pergaminho que duplica a experiência de tudo o que fazes. Usa-o antes de um dia produtivo.',
    po_xp3: 'Uma versão maior e mais rara do pergaminho de XP. Seis horas de crescimento a dobrar.',
    po_coin2: 'Um pergaminho que atrai a sorte do dinheiro. Durante duas horas, as moedas chegam a dobrar.',
    po_coin3: 'O grande pergaminho dos mercadores. Seis horas de moedas a dobrar.',
    po_sorte: 'Um trevo de quatro folhas encantado. Durante algumas horas, cada baú guarda uma surpresa extra.',
    po_escudo: 'Um selo de proteção que o Sistema reconhece. Se falhares uma missão, absorve a penalidade por ti.',
    po_descanso: 'Um remédio que limpa o cansaço do corpo e da mente. Remove o estado Exausto.',
    po_orvalho: 'Orvalho recolhido nas primeiras horas da manhã, quando o mundo ainda está limpo. Cura mais do que a sua cor sugere, mas evapora ao meio-dia.',
    po_lunar: 'Uma essência prateada destilada sob a lua cheia. À noite, acende os instintos de caça. De dia é só água turva.',
    po_crepusculo: 'Um pergaminho escrito com tinta de pôr do sol. Só se deixa abrir na hora em que o dia e a noite se cruzam.',
    po_horamorta: 'Uma vela de cera negra que só acende entre a meia-noite e as três. Nessa hora, a chama chama coisas que estavam escondidas.',

    /* ---------- Atributos (especiais) ---------- */
    el_ponto: 'Um fruto raro que nasce nas árvores mais antigas da floresta sussurrante. Quem o come ganha uma pequena centelha de potencial para usar como quiser.',
    el_ascensao: 'Um cristal retirado do núcleo de um portão de rank alto. Contém potencial suficiente para três novas escolhas.',
    el_nectar: 'O néctar que os deuses bebiam antes de serem esquecidos. Fortalece tudo, para sempre.',
    el_selo: 'Um selo gravado pelo próprio Sistema. Ao quebrá-lo, a barreira do teu nível atual cede e sobes um degrau na hora. É raro e caro, porque encurta um caminho que normalmente se faz com suor.',
    el_reset: 'Uma pedra que apaga as escolhas do passado. Devolve-te todos os pontos que distribuíste, para recomeçares a construir-te.',

    /* ---------- Baús ---------- */
    bau_comum: 'Um baú de madeira simples, encontrado à entrada dos portões. Normalmente traz poções e algumas moedas.',
    bau_raro: 'Um baú com reforços de ferro e uma fechadura rúnica. Guarda itens melhores e, às vezes, um fragmento estranho.',
    bau_epico: 'Um baú ornamentado que só aparece depois dos chefes mais fortes. Pode trazer armas, elixires e segredos.',
    bau_lendario: 'Um baú dourado que pulsa com mana. Raramente desilude.',
    bau_secreto: 'Um baú negro sem fechadura visível. Só abre para quem o Sistema considera digno, e guarda os maiores segredos dos portões.',

    /* ---------- Secretos ---------- */
    sx_ampulheta: 'Uma ampulheta partida onde a areia corre para cima. Quem a estudar compreende como parar o tempo.',
    sx_coracao: 'O coração de um dragão que viveu antes dos portões. Ainda bate, devagar, e cada batida fortalece quem o absorver.',
    sx_fenix: 'Uma pena que nunca arrefece. Enquanto estiver na tua bolsa, a morte tem de pedir licença duas vezes.',
    sx_moeda: 'Uma moeda de um império que já não existe. Os colecionadores pagam fortunas por ela.',
    sx_mapa: 'Um mapa que não mostra lugares: mostra o que ainda te falta vencer. Quando já não falta nada, a última linha acende-se sozinha. Ninguém sabe quem a desenhou.',
    sx_fragmento: 'Um pedaço do próprio Sistema, frio e luminoso. Sozinho não faz nada. Cinco juntos formam algo que não devia existir nas mãos de um caçador.',
    sx_nucleo: 'O núcleo do Sistema, reconstruído a partir de cinco fragmentos. Ao tocá-lo, sentes as regras do mundo a dobrarem-se à tua volta.',
    sx_lamina: 'Uma lâmina sem nome, sem marca de ferreiro e sem história conhecida. Serve a qualquer mão, e todas as mãos a temem.',
    sx_coroa: 'A coroa de um rei cujo portão foi apagado de todos os registos. Ainda se lembra de como é governar.',
    sx_olho: 'O olho de um vigia que nunca dormiu. Vê o que os outros não veem, e ensina o portador a fazer o mesmo.'
  };

  /* Famílias com texto partilhado */
  S.ITEM_LORE_FAMILY = {
    stat: {
      str: 'Força é o que move a arma e o corpo. Aumenta o dano dos golpes físicos.',
      agi: 'Agilidade é velocidade e reflexo. Torna os golpes mais certeiros e o corpo mais difícil de acertar.',
      vit: 'Vitalidade é resistência. Mais vida máxima e mais capacidade de aguentar golpes.',
      int: 'Inteligência é o poder da mente. Aumenta a mana e a força da magia.',
      per: 'Percepção é ver o que os outros não veem. Aumenta as hipóteses de crítico e a precisão.'
    },
    elixir: 'Um elixir alquímico preparado com essências raras de monstros. Cada gole altera o corpo para sempre, mas o corpo resiste: cada novo frasco custa mais do que o anterior.',
    elixirG: 'Uma versão concentrada do elixir, feita com essência de chefes. Três vezes mais forte e igualmente persistente no corpo.',
    accTier: {
      _maior: 'Uma versão maior da peça original, reforçada com metal de portão.',
      _anc: 'Uma versão ancestral, encontrada em ruínas de portões antigos. A magia dela é mais velha do que o Sistema.',
      _prim: 'Uma versão primordial, de um tempo anterior aos portões. Poucos caçadores alguma vez a viram.'
    },
    talisma: {
      crit: 'Um talismã gravado com um alvo. Guia a mão para os pontos fracos do inimigo.',
      lifesteal: 'Um talismã com a forma de um morcego, que bebe uma parte do sangue de cada golpe e a devolve ao dono.',
      eva: 'Um talismã feito de folhas que nunca caem. Torna o corpo leve como uma brisa.',
      def: 'Um talismã de ferro maciço. Pesa no pescoço, e pesa ainda mais nos golpes que trava.'
    },
    talismaTier: ['Versão de aprendiz, feita à mão por artesãos dos portões.', 'Versão de mestre, com runas mais finas e mais poder.', 'Versão de grão-mestre: a magia dela já não cabe no metal e brilha à superfície.'],
    custom: 'Uma recompensa que tu próprio criaste. O Sistema guarda-a até decidires que a mereceste.'
  };

  /* ---------- Narrativa dos troféus ---------- */
  S.TROPHY_LORE = function (b) {
    if (b.premium) {
      var an = b.arenaName || 'Coliseu dos Condenados';
      return 'Retirado de ' + b.name + ', na ' + an + ' do Coliseu dos Condenados. ' + (b.guardian
        ? 'Cada sub-chefe que cai deixa a sua marca. O Sistema guarda-a como prova de que subiste mais um degrau da arena.'
        : 'O troféu de um campeão acorrentado. Só quem atravessa a arena inteira e derruba o seu senhor o pode segurar.');
    }
    var g = S.GATES.filter(function (x) { return x.id === b.gate; })[0];
    var where = g ? 'no portão ' + g.name : 'num portão que não consta de nenhum registo';
    var kinds = b.secret
      ? 'Um troféu que, oficialmente, não existe. Prova que encontraste o que estava escondido.'
      : (b.level === 100 ? 'O último troféu. Ninguém antes de ti o segurou e saiu do trono com vida.'
        : (b.king ? 'O troféu de um rei de portão. Os caçadores que o veem sabem imediatamente o que fizeste.'
          : 'Uma recordação da batalha, guardada pelo Sistema na tua sala de troféus.'));
    return 'Retirado de ' + b.name + ', ' + where + '. ' + kinds;
  };
})(globalThis.SYS = globalThis.SYS || {});
