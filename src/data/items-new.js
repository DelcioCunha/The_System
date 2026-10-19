/* ==========================================================
   ITENS NOVOS (atualização do Sistema)
   Equipamento com mecânicas novas, que mudam a forma de lutar:
     thorns       Espinhos: devolve % do dano recebido
     openShield   Escudo inicial: começa cada batalha com um escudo (% da vida)
     execute      Execução: +% de dano quando o chefe tem menos de 30% de vida
     firstStrike  Primeiro golpe: +% de dano no primeiro ataque da batalha
     manaOnHit    Mana por golpe: recupera % da mana máxima a cada ataque que acerta
     dotPct       Venenos, chamas e sangramentos causam +% de dano
     stunRes      Hipótese de resistir a atordoamentos (máx. 80%)
     potionPct    As poções de cura curam +%
   ========================================================== */
(function (S) {
  'use strict';
  var I = S.ITEMS;
  function add(o) { o.req = o.req || null; I[o.id] = o; if (o.lore) { S.ITEM_LORE[o.id] = o.lore; delete o.lore; } return o; }

  /* ---------------- armas para qualquer classe ---------------- */
  [
    ['wx_carrasco', 'Machado da Sentença', '🪓', 25, 3200, 'raro', 52, { execute: 30 },
      'Machado de execução para qualquer classe. Brilha quando o chefe está quase a cair.',
      'Forjado com o ferro das correntes que caíram do cepo de Kaelthar. Não corta mais do que os outros machados: corta melhor no fim. Quando o inimigo vacila, a lâmina pesa o dobro e o golpe parece decidido antes de cair.'],
    ['wx_espinheira', 'Lança Espinheira', '🔱', 35, 5200, 'raro', 72, { thorns: 10, def: 8 },
      'Lança coberta de espinhos de ferro. Quem te bate, sangra também.',
      'Um caçador cansado de ser ferido mandou pôr espinhos em tudo o que tinha: no escudo, na armadura, até no cabo da lança. Morreu velho. Cada golpe que recebas devolve uma parte da dor a quem a deu.'],
    ['wx_relampago', 'Lança do Primeiro Raio', '⚡', 45, 8000, 'epico', 100, { firstStrike: 80, crit: 4 },
      'O primeiro ataque de cada batalha cai como um trovão.',
      'Dizem que foi feita com o primeiro relâmpago que Valkyra lançou contra o Sistema. Só tem um raio guardado por batalha, e gasta-o logo no primeiro golpe. Quem entra a hesitar desperdiça-o.'],
    ['wx_fonte', 'Cajado da Fonte Viva', '🪄', 55, 12500, 'epico', 135, { manaOnHit: 5, regenMp: 2 },
      'Cada golpe que acerta devolve-te mana. Para quem vive de habilidades.',
      'A ponta deste cajado é uma nascente de mana cristalizada. Quando bate em alguma coisa, a fonte agita-se e transborda para quem o segura. Os magos chamam-lhe preguiçoso. Os que o usam chamam-lhe inesgotável.'],
    ['wx_peste', 'Foice da Peste Lenta', '🌿', 65, 19000, 'lendario', 175, { dotPct: 50, lifesteal: 4 },
      'Venenos, chamas e sangramentos que causares doem muito mais.',
      'Morthis tinha uma igual no jardim. Esta é a que ele deitou fora por ser demasiado lenta. A foice não mata depressa: deixa a ferida aberta e espera. Tudo o que arde, envenena ou sangra às mãos dela arde, envenena e sangra mais.']
  ].forEach(function (r) {
    add({ id: r[0], name: r[1], icon: r[2], cat: 'arma', lvl: r[3], price: r[4], rarity: r[5],
      equip: Object.assign({ slot: 'weapon', atk: r[6], matk: r[6] }, r[7]), desc: r[8], lore: r[9] });
  });

  /* ---------------- armaduras ---------------- */
  [
    ['ar_alquimista', 'Avental do Alquimista', '🥼', 12, 900, 'incomum', { def: 15, potionPct: 30 },
      'As poções de cura curam muito mais. Bolsos para tudo.',
      'Couro grosso, manchas que nunca saem e vinte bolsos cosidos à mão. Um alquimista sabe que a poção certa, na hora certa, vale mais do que uma armadura de placas. E esta faz as duas coisas, mais ou menos.'],
    ['ar_espinhos', 'Couraça de Espinhos', '🦔', 28, 2600, 'raro', { def: 36, thorns: 12 },
      'Devolve parte de cada golpe que recebes.',
      'Placas de ferro escuro com espinhos virados para fora. Abraçar quem a veste é má ideia. Atacar quem a veste é pior. Cada golpe que acerta devolve ao atacante um pedaço do que ele mandou.'],
    ['ar_bastiao', 'Placas do Bastião', '🏰', 45, 6500, 'epico', { def: 66, hpPct: 5, openShield: 15 },
      'Começas cada batalha atrás de um escudo de energia.',
      'Feita a partir das portas de uma fortaleza que nunca caiu. Antes de a primeira espada se levantar, as runas acendem-se e erguem uma muralha de luz à tua frente. É o tempo de que precisas para pensar.'],
    ['ar_vontade', 'Manto da Vontade de Ferro', '🧠', 60, 13000, 'lendario', { def: 92, hpPct: 10, stunRes: 45 },
      'Difícil de atordoar: a mente aguenta onde o corpo vacila.',
      'Um manto bordado com fios de aço por um monge que passou vinte anos sem dormir. Quem o veste não perde o controlo do próprio corpo. Rugidos, prisões de gelo e golpes na cabeça escorregam como chuva.']
  ].forEach(function (r) {
    add({ id: r[0], name: r[1], icon: r[2], cat: 'armadura', lvl: r[3], price: r[4], rarity: r[5],
      equip: Object.assign({ slot: 'armor' }, r[6]), desc: r[7], lore: r[8] });
  });

  /* ---------------- acessórios ---------------- */
  [
    ['ac_herbalista', 'Bolsa do Herbalista', '🌱', 8, 700, 'incomum', { potionPct: 25 }, 'As poções de cura curam +25%.',
      'Uma bolsa pequena de linho com ervas secas a espreitar. Cada poção que passa por ela sai mais forte, como se as ervas soubessem o que fazer.'],
    ['ac_primeiro', 'Anel do Primeiro Golpe', '💍', 15, 1600, 'raro', { firstStrike: 40 }, 'O primeiro ataque de cada batalha faz +40% de dano.',
      'Um anel de prata com uma pedra que só brilha uma vez por combate. Os duelistas antigos diziam que quem acerta primeiro escreve o resto da história.'],
    ['ac_ourico', 'Bracelete do Ouriço', '🦔', 18, 1900, 'raro', { thorns: 8, def: 6 }, 'Devolve 8% do dano que recebes.',
      'Pequeno, feio e cheio de picos. Não impede que te batam, mas garante que quem bate se arrepende.'],
    ['ac_fonte', 'Pendente da Fonte', '💧', 22, 2600, 'raro', { manaOnHit: 3 }, 'Cada ataque que acerta devolve 3% da mana.',
      'Uma gota de água que nunca seca, presa num vidro. Cada golpe faz-a tremer e um fio de mana volta para ti.'],
    ['ac_toxina', 'Frasco do Alquimista Negro', '⚗️', 30, 4200, 'epico', { dotPct: 40 }, 'Venenos, chamas e sangramentos fazem +40% de dano.',
      'Um frasco minúsculo pendurado ao pescoço, com algo verde que se mexe. Ninguém sabe o que tem dentro. Sabe-se o que faz: tudo o que corrói, corrói mais.'],
    ['ac_sentenca', 'Medalha da Sentença', '⚖️', 32, 4800, 'epico', { execute: 20, crit: 3 }, '+20% de dano quando o chefe está abaixo de 30% da vida.',
      'Uma balança de bronze com um prato sempre em baixo. Quando o inimigo começa a cair, a balança decide por ti.'],
    ['ac_ancora', 'Âncora da Mente', '⚓', 38, 5500, 'epico', { stunRes: 40, stats: { int: 4 } }, '40% de hipótese de resistir a atordoamentos.',
      'Uma âncora de ferro do tamanho de um dedo. Quando tudo à tua volta gira, ela pesa e mantém-te no sítio.'],
    ['ac_muralha', 'Fivela da Muralha', '🛡️', 42, 6500, 'epico', { openShield: 12, def: 10 }, 'Começas cada batalha com um escudo de 12% da vida.',
      'A fivela de um cinto de guarda de muralha. Antes de cada combate, uma parede fina de luz levanta-se à tua frente. É pouco. Às vezes, pouco chega.']
  ].forEach(function (r) {
    add({ id: r[0], name: r[1], icon: r[2], cat: 'acessorio', lvl: r[3], price: r[4], rarity: r[5],
      equip: Object.assign({ slot: 'acc' }, r[6]), desc: r[7], lore: r[8] });
  });

  /* ---------------- consumíveis ---------------- */
  [
    ['po_mel', 'Mel de Batalha', '🍯', 5, 140, 'incomum', 'Recupera 35% da vida e 15% da mana (conta como poção de cura).',
      { type: 'restore', hp: 35, mp: 15 }, true, true,
      'Mel escuro de abelhas que vivem perto dos portões. É doce, espesso e cura devagar mas bem.'],
    ['po_equilibrio', 'Tónico do Equilíbrio', '☯️', 20, 450, 'raro', '+25% ataque, ataque mágico e defesa durante 3 turnos.',
      { type: 'buffs', list: [{ key: 'atk', val: 25, turns: 3 }, { key: 'matk', val: 25, turns: 3 }, { key: 'def', val: 25, turns: 3 }] }, true, false,
      'Metade fogo, metade gelo, num frasco dividido ao meio. Não te torna o mais forte nem o mais resistente: torna-te as duas coisas um bocadinho.'],
    ['po_raio', 'Raio Engarrafado', '🌩️', 18, 380, 'raro', 'Causa 30 × o teu nível e 35% de hipótese de atordoar.',
      { type: 'bomb', perLevel: 30, stun: 0.35 }, true, false,
      'Alguém conseguiu fechar um relâmpago num frasco. Ninguém sabe como. Abre-o virado para o inimigo.'],
    ['po_eclipse', 'Pó do Eclipse', '🌑', 30, 620, 'epico', 'Reduz a defesa do chefe em 40% e faz-o sangrar durante 3 turnos.',
      { type: 'ops', ops: [{ op: 'debuff', key: 'def', val: 40, turns: 3 }, { op: 'dot', type: 'bleed', mult: 0.7, turns: 3 }] }, true, false,
      'Cinza recolhida debaixo do sol negro da Arena do Eclipse. Onde cai, a armadura parece papel e as feridas não fecham.'],
    ['po_areia', 'Areia do Recomeço', '⏳', 35, 900, 'epico', 'Reinicia as recargas das tuas habilidades e recupera 30% da mana.',
      { type: 'ops', ops: [{ op: 'resetCd' }, { op: 'mp', pct: 30 }] }, true, false,
      'Um punhado de areia de uma ampulheta que andava ao contrário. Deita-a ao ar e as tuas habilidades esquecem que já foram usadas.'],
    ['po_ritual', 'Sangria Ritual', '🩸', 45, 900, 'epico', '+40% roubo de vida e +20% crítico durante 3 turnos.',
      { type: 'buffs', list: [{ key: 'lifesteal', val: 40, turns: 3 }, { key: 'crit', val: 20, turns: 3 }] }, true, false,
      'Uma taça de pedra com um líquido escuro. O ritual é simples: bebes, e durante algum tempo cada ferida que abres fecha uma das tuas.'],
    ['po_cafe', 'Café do Caçador', '☕', 1, 200, 'comum', '+50% XP durante 1 hora. Para uma sessão curta e intensa.',
      { type: 'timed', effect: 'xp15', hours: 1 }, false, true,
      'Café forte, sem açúcar, servido numa caneca de lata. Os caçadores bebem-no antes de um treino curto e sério.'],
    ['po_mercador', 'Selo do Mercador', '🪙', 20, 1300, 'raro', 'Moedas a dobrar durante 4 horas.',
      { type: 'timed', effect: 'coin2', hours: 4 }, false, true,
      'O selo de cera de uma guilda de mercadores que já não existe. Durante umas horas, tudo o que tocas parece valer o dobro.']
  ].forEach(function (r) {
    add({ id: r[0], name: r[1], icon: r[2], cat: 'consumivel', lvl: r[3], price: r[4], rarity: r[5], desc: r[6], use: r[7], battle: r[8], field: r[9], lore: r[10] });
  });

  /* ---------------- ARTEFATOS DO SISTEMA (mexem com o próprio Sistema) ---------------- */
  [
    ['sys_sino', 'Sino de Chamada', '🔔', 1, 250, 'raro', { action: 'call' },
      'Chama o Sistema: ele aparece na hora com uma conversa que ainda não tiveste. Ignora o silêncio e os intervalos.',
      'Um sino de bronze rachado que não faz som nenhum. Pelo menos para ti. Do outro lado, alguma coisa ouve sempre. Toca-o e o Sistema vem, com uma pergunta que ainda não te fez.'],
    ['sys_silencio', 'Ordem de Silêncio', '🤫', 1, 180, 'incomum', { action: 'silence', hours: 12 },
      'Durante 12 horas, o Sistema não inicia conversas contigo. Continua a vigiar, mas calado.',
      'Uma folha de papel negro com um selo de cera. O Sistema respeita-a, à maneira dele: fica calado. Não deixa de ver. Só deixa de dizer.'],
    ['sys_licenca', 'Licença do Sistema', '📜', 5, 450, 'raro', { action: 'license', n: 3, max: 6 },
      'Hoje podes criar mais 3 missões novas além do limite diário (até +6 por dia).',
      'Um documento oficial, carimbado e assinado por ninguém. Dá-te o direito de pedir mais trabalho ao Sistema hoje. Ele aceita. Repara que ninguém se queixa de ter missões a mais.'],
    ['sys_dobro', 'Selo do Dobro', '✖️', 10, 900, 'epico', { action: 'double', target: 'mission', max: 3 },
      'A próxima missão que concluíres dá XP e moedas a dobrar. Não funciona com missões anuladas ou apanhadas pela vigilância.',
      'Um selo com dois círculos sobrepostos. O Sistema paga o dobro pela próxima tarefa que cumprires, desde que seja verdadeira. Tentar enganá-lo com o selo ativo é a forma mais cara de perder.'],
    ['sys_bilhete', 'Bilhete da Vitória Dupla', '🎫', 15, 1100, 'epico', { action: 'double', target: 'boss', max: 3 },
      'A próxima vitória contra um chefe ou Campeão dá XP e moedas a dobrar.',
      'Um bilhete dourado com o carimbo do Coliseu. Mostra-o antes do combate e o Sistema paga a dobrar pela próxima cabeça que trouxeres.'],
    ['sys_bussola', 'Bússola do Oculto', '🧭', 12, 1400, 'epico', { action: 'hidden' },
      'Revela já uma Missão Oculta, sem esperar pelas condições secretas.',
      'A agulha não aponta para norte. Aponta para aquilo que o Sistema está a esconder de ti. Quando para, há uma Missão Oculta à tua espera, com 48 horas para a cumprires.'],
    ['sys_dado', 'Dado do Destino', '🎲', 1, 300, 'raro', { action: 'dice' },
      'Lança o dado: moedas, XP, uma poção, um Baú Raro... ou azar (20% de hipótese): perdes 25% das tuas moedas.',
      'Um dado de osso com seis faces e nenhum número. O Sistema diz que não interfere nos lançamentos. O Sistema diz muitas coisas.'],
    ['sys_pacto', 'Pacto Proibido', '🩸', 20, 600, 'lendario', { action: 'pact', trust: 20, minTrust: 50, xpPct: 60, coinsPerLevel: 40 },
      'Sacrifica 20% da tua Integridade com o Sistema em troca de 60% de um nível em XP e muitas moedas. Só com Integridade de 50% ou mais.',
      'Um contrato escrito em sangue numa folha que não arde. O Sistema dá-te poder agora, e cobra-te em confiança. Com Integridade baixa, as missões rendem menos e os castigos pesam mais. É um atalho. Os atalhos têm sempre portagem.']
  ].forEach(function (r) {
    add({ id: r[0], name: r[1], icon: r[2], cat: 'sistema', lvl: r[3], price: r[4], rarity: r[5], use: Object.assign({ type: 'system' }, r[6]), field: true, desc: r[7], lore: r[8] });
  });
  add({ id: 'sys_tregua', name: 'Tratado de Trégua', icon: '🕊️', cat: 'sistema', lvl: 5, price: 700, rarity: 'raro', field: true,
    use: { type: 'system', action: 'truce', hours: 24 },
    desc: 'Durante 24 horas não aparecem Missões de Emergência. Uma que já esteja ativa continua até acabar.',
    lore: 'Um pergaminho branco com uma pomba desenhada a tinta de prata. O Sistema aceita-o como uma trégua: durante um dia guarda as urgências numa gaveta. Não as esquece. Só as guarda.' });
  S.SYSTEM_ITEMS = ['sys_sino', 'sys_silencio', 'sys_licenca', 'sys_dobro', 'sys_bilhete', 'sys_bussola', 'sys_dado', 'sys_pacto', 'sys_tregua'];

  /* A voz do Sistema quando o jogador compra artefatos:
     before: às vezes, antes de comprar · first: na primeira compra de cada um · after: depois das seguintes (com moderação) */
  S.SYS_VOICE = {
    sys_sino: { before: ['Queres comprar uma forma de me chamar, {nome}? Eu nunca saio daqui. Mas está bem.', 'Um sino para me chamares. Pensa bem no que me vais perguntar.', 'Ninguém compra este sino só uma vez.'],
      first: 'Registado. Agora tens uma forma de me chamar. Eu já tinha uma forma de te ver.',
      after: ['Mais um sino. Estás com saudades, {nome}?', 'Toca-o quando quiseres. Eu respondo sempre. Nem sempre o que queres ouvir.', 'Guardei mais uma pergunta para ti.', 'Os outros Jogadores fogem de mim. Tu compras sinos.'] },
    sys_silencio: { before: ['Queres pagar para eu me calar? Interessante.', 'O silêncio não me torna cego, {nome}.', 'Há Jogadores que me pedem conselhos. Tu pedes silêncio.'],
      first: 'Comprado. Quando o usares, fico calado. Só calado.',
      after: ['Outra vez silêncio. O que estás a esconder, {nome}?', 'Podes calar-me. Não me podes fechar os olhos.', 'Anotado. Em silêncio, claro.', 'Gostas mais de mim calado. Eu também gosto mais de ti a trabalhar.'] },
    sys_licenca: { before: ['Pedir mais trabalho ao Sistema? Raro. Continua.', 'Uma licença não faz as missões por ti, {nome}.', 'Doze missões por dia não te chegam? Vamos ver se não te sobram.'],
      first: 'Licença emitida. Mais missões, mais registos. Eu leio todas.',
      after: ['Mais uma licença. Ambicioso. Ou ansioso.', 'Cria-as reais. Eu vou ler cada uma.', 'Doze não te chegam. Gosto disso.', 'Uma licença usada com missões falsas sai muito cara.'] },
    sys_dobro: { before: ['O dobro, {nome}? Para quem cumpre, é justo. Para quem engana, é uma armadilha.', 'Eu pago o dobro. Também vigio o dobro.'],
      first: 'Selo registado. A próxima missão verdadeira vale duas vezes. A falsa vale zero.',
      after: ['Mais um selo do dobro. Vou estar atento à próxima missão.', 'Ganância controlada. Aprovo.', 'O dobro da recompensa exige o dobro da verdade.', 'Registado. Não me faças arrepender.'] },
    sys_bilhete: { before: ['Vais apostar na tua próxima vitória? Confiança ou arrogância, {nome}?', 'Um bilhete não ganha combates.'],
      first: 'Bilhete aceite. A próxima cabeça que trouxeres vale o dobro. Traz uma.',
      after: ['Outro bilhete. O Coliseu agradece.', 'Mais uma aposta em ti próprio. Vamos ver.', 'Os chefes não sabem do bilhete. Ainda.', 'Registado. Agora ganha.'] },
    sys_bussola: { before: ['Queres ver o que eu escondo? Ousado.', 'Há segredos que te encontram. Este vais ter de o comprar.'],
      first: 'A bússola é tua. Agora sabes que eu escondo coisas. Eu sabia que um dia ias descobrir.',
      after: ['Mais uma bússola. A curiosidade é uma fraqueza útil.', 'Procura. Eu escondi bem.', 'Cada segredo que encontras, eu substituo por outro.', 'Registado. Boa caça, {nome}.'] },
    sys_dado: { before: ['Vais entregar a tua sorte a um dado? Eu nunca jogo, {nome}. Eu calculo.', 'O dado não tem números. Pensa nisso antes de pagar.'],
      first: 'O dado é teu. Não te esqueças: eu não interfiro. Quase nunca.',
      after: ['Mais um dado. A esperança é um recurso renovável.', 'Lança-o. Eu fico a ver.', 'Os Jogadores sensatos param no primeiro. Tu não és um deles.', 'Registado. Boa sorte. Vais precisar.'] },
    sys_pacto: { before: ['Um pacto comigo tem sempre um preço, {nome}. Lê o contrato.', 'Tens a certeza? Eu cobro em palavra, não em moedas.', 'Poucos voltam a confiar em quem vende a própria palavra.'],
      first: 'Contrato guardado. Quando o assinares, dou-te poder. E tiro-te uma parte de ti.',
      after: ['Outro pacto. Estou a começar a gostar destes negócios.', 'Cada pacto fica escrito. Eu não apago nada.', 'A tua palavra está a ficar barata, {nome}.', 'Registado. Eu sou paciente com dívidas.'] },
    sys_tregua: { before: ['Uma trégua? Pedes-me um dia sem urgências. Tão humano.', 'As emergências não deixam de existir, {nome}. Só deixas de as ver.'],
      first: 'Trégua registada. Quando a usares, guardo as urgências para outro dia.',
      after: ['Mais uma trégua. Cansado, {nome}?', 'Descansar também é estratégia. Às vezes.', 'Eu guardo as emergências. Elas esperam por ti.', 'Registado. Aproveita o silêncio das sirenes.'] }
  };


  S.NEW_ITEMS = ['wx_carrasco', 'wx_espinheira', 'wx_relampago', 'wx_fonte', 'wx_peste', 'ar_alquimista', 'ar_espinhos', 'ar_bastiao', 'ar_vontade',
    'ac_herbalista', 'ac_primeiro', 'ac_ourico', 'ac_fonte', 'ac_toxina', 'ac_sentenca', 'ac_ancora', 'ac_muralha',
    'po_mel', 'po_equilibrio', 'po_raio', 'po_eclipse', 'po_areia', 'po_ritual', 'po_cafe', 'po_mercador'];
})(globalThis.SYS = globalThis.SYS || {});
