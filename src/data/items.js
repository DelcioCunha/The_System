/* ==========================================================
   ITENS, LOJA, BAÚS E TROFÉUS
   req (condições de compra na loja):
     { boss: 'b10' }        derrotar esse chefe
     { bosses: 25 }         derrotar N chefes
     { ach: 'd7' }          ter essa conquista
     { trophies: 30 }       ter N troféus
   o nível mínimo continua em "lvl"
   ========================================================== */
(function (S) {
  'use strict';

  var I = S.ITEMS = {};
  function add(o) { I[o.id] = o; return o; }

  /* A antiga Loja de lazer foi removida: quem ainda tinha recompensas recebe o preço de volta em moedas (ver E.migrate). */
  S.LEISURE_REFUND = {"lz_sesta": 30, "lz_cafe": 40, "lz_snack": 50, "lz_livro": 50, "lz_episodio": 60, "lz_redes": 60, "lz_doce": 80, "lz_banho": 90, "lz_musica": 100, "lz_jogo": 120, "lz_refeicao": 180, "lz_preguica": 220, "lz_cinema": 250, "lz_amigos": 300, "lz_maratona": 350, "lz_restaurante": 400, "lz_passeio": 450, "lz_descanso": 600, "lz_roupa": 600, "lz_spa": 700, "lz_desejo": 900, "lz_gadget": 1500, "lz_viagem": 2000, "lz_dourado": 2500};

  /* Versões melhoradas: mesmo nível, um pouco mais fortes e mais caras, com um bónus extra próprio */
  function roundPrice(p) { return p < 1000 ? Math.round(p / 10) * 10 : Math.round(p / 50) * 50; }
  var VARIANTS = [
    { suffix: '_art', name: ' do Artesão', mult: 1.08, price: 1.18, desc: 'Versão de artesão: mais afiada e precisa.',
      weaponExtra: function (e, i) { e.crit = (e.crit || 0) + 2 + Math.floor(i / 2); },
      armorExtra: function (e, i) { e.eva = (e.eva || 0) + 2 + Math.floor(i / 4); } },
    { suffix: '_camp', name: ' do Campeão', mult: 1.16, price: 1.38, desc: 'Versão de campeão: a mais forte deste nível.',
      weaponExtra: function (e, i) { e.critDmg = (e.critDmg || 0) + 10 + i * 2; e.hpPct = (e.hpPct || 0) + 3; },
      armorExtra: function (e, i) { e.hpPct = (e.hpPct || 0) + 3 + Math.floor(i / 2); if (i >= 5) e.regenHp = (e.regenHp || 0) + 1; } }
  ];

  /* ---------------- ARMAS por classe (10 níveis cada) ---------------- */
  var tiers = [
    { lvl: 1, price: 80, power: 6, rarity: 'comum' },
    { lvl: 8, price: 400, power: 16, rarity: 'comum' },
    { lvl: 15, price: 900, power: 30, rarity: 'incomum' },
    { lvl: 22, price: 1600, power: 45, rarity: 'incomum' },
    { lvl: 30, price: 2600, power: 62, rarity: 'raro' },
    { lvl: 40, price: 4200, power: 85, rarity: 'raro' },
    { lvl: 50, price: 6500, power: 120, rarity: 'epico' },
    { lvl: 60, price: 9500, power: 155, rarity: 'epico' },
    { lvl: 72, price: 14000, power: 200, rarity: 'lendario', req: { boss: 'b60' } },
    { lvl: 85, price: 20000, power: 255, rarity: 'mitico', req: { boss: 'b80' } }
  ];
  var weaponNames = {
    guerreiro: { icon: '⚔️', key: 'atk', extra: 'str', names: ['Espada de Ferro', 'Espada do Mercenário', 'Lâmina do Veterano', 'Espada Bastarda de Aço', 'Espada Rúnica', 'Montante Flamejante', 'Montante do Dragão Rubro', 'Lâmina do Senhor da Guerra', 'Espada do Eclipse Carmesim', 'Lâmina do Rei Caído'] },
    assassino: { icon: '🗡️', key: 'atk', extra: 'agi', names: ['Adagas Gémeas', 'Facas de Arremesso', 'Presas de Víbora', 'Adagas de Obsidiana', 'Adagas do Crepúsculo', 'Lâminas Sussurrantes', 'Garras do Eclipse', 'Adagas do Corvo Negro', 'Presas da Lua Nova', 'Beijo da Morte Eterna'] },
    mago: { icon: '🪄', key: 'matk', extra: 'int', names: ['Cajado de Carvalho', 'Varinha de Aprendiz', 'Cetro de Cristal', 'Cajado de Gelo Eterno', 'Cajado das Marés Astrais', 'Orbe do Trovão', 'Cetro do Arquimago', 'Cajado da Constelação', 'Cetro do Vazio Estelar', 'Cajado da Origem'] },
    guardiao: { icon: '🛡️', key: 'atk', extra: 'vit', names: ['Escudo Reforçado', 'Broquel de Bronze', 'Escudo de Aço Templário', 'Escudo do Leão', 'Bastião Rúnico', 'Égide Solar', 'Égide do Titã', 'Muralha de Pedra Viva', 'Escudo da Fortaleza Dourada', 'Muralha Celestial'] },
    arqueiro: { icon: '🏹', key: 'atk', extra: 'per', names: ['Arco Curto', 'Arco de Caça', 'Arco Longo de Teixo', 'Arco Composto do Falcão', 'Arco do Vento Norte', 'Arco da Folha Esmeralda', 'Arco da Lua Prateada', 'Arco do Trovão', 'Arco da Ave-Trovão', 'Arco do Firmamento'] },
    invocador: { icon: '📖', key: 'matk', extra: 'int', names: ['Grimório Gasto', 'Diário do Necromante', 'Tomo das Almas', 'Lanterna dos Espíritos', 'Grimório Espectral', 'Grimório Acorrentado', 'Códice do Véu', 'Cetro da Legião', 'Coroa dos Mil Mortos', 'Livro do Abismo Eterno'] }
  };
  S.CLASS_WEAPONS = {};
  Object.keys(weaponNames).forEach(function (c) {
    var w = weaponNames[c];
    S.CLASS_WEAPONS[c] = [];
    tiers.forEach(function (t, i) {
      var eq = { slot: 'weapon', stats: {} };
      eq[w.key] = t.power;
      eq.stats[w.extra] = [1, 2, 3, 5, 6, 8, 10, 13, 16, 20][i];
      if (c === 'guardiao') eq.def = Math.round(t.power * 0.4);
      if (c === 'assassino') eq.crit = [2, 3, 4, 5, 6, 7, 8, 9, 10, 13][i];
      if (c === 'arqueiro') eq.crit = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11][i];
      if (c === 'invocador') eq.summonPct = [0, 3, 5, 8, 10, 12, 15, 18, 22, 28][i];
      if (c === 'mago') eq.mpPct = [0, 3, 5, 7, 9, 11, 13, 15, 18, 22][i];
      if (i >= 8) eq.critDmg = i === 9 ? 35 : 20;
      var id = 'w_' + c + '_' + (i + 1);
      add({ id: id, name: w.names[i], icon: w.icon, cat: 'arma', cls: [c], lvl: t.lvl, price: t.price, rarity: t.rarity, equip: eq, req: t.req || null,
        desc: 'Arma de ' + S.CLASSES[c].name + '.' });
      S.CLASS_WEAPONS[c].push(id);
      VARIANTS.forEach(function (v) {
        var e2 = JSON.parse(JSON.stringify(eq));
        e2[w.key] = Math.round(t.power * v.mult);
        if (e2.def) e2.def = Math.round(e2.def * v.mult);
        v.weaponExtra(e2, i);
        add({ id: id + v.suffix, name: w.names[i] + v.name, icon: w.icon, cat: 'arma', cls: [c], lvl: t.lvl, price: roundPrice(t.price * v.price), rarity: t.rarity, equip: e2, req: t.req || null,
          desc: 'Arma de ' + S.CLASSES[c].name + '. ' + v.desc });
      });
    });
  });

  /* ---------------- ARMAS DE REI (qualquer classe, após derrotar o rei do portão) ---------------- */
  [
    ['wk_fenrath', 'Presa de Fenrath', '🐺', 10, 1800, 'raro', 34, { crit: 6 }, 'b10'],
    ['wk_varyss', 'Cetro Cristalino de Varyss', '💎', 20, 3500, 'raro', 52, { critDmg: 20 }, 'b20'],
    ['wk_morvenna', 'Foice da Praga', '🌿', 30, 6000, 'epico', 75, { lifesteal: 5 }, 'b30'],
    ['wk_ankharet', 'Lança do Sol Eterno', '☀️', 40, 9000, 'epico', 100, { crit: 8 }, 'b40'],
    ['wk_skadhi', 'Lança da Rainha do Inverno', '❄️', 50, 13000, 'epico', 132, { eva: 5 }, 'b50'],
    ['wk_pyraxis', 'Garra do Dragão Vulcânico', '🔥', 60, 18000, 'lendario', 170, { critDmg: 30 }, 'b60'],
    ['wk_thalassor', 'Tridente do Rei Afogado', '🔱', 70, 24000, 'lendario', 210, { lifesteal: 8 }, 'b70'],
    ['wk_auriel', 'Espada da Imperatriz Celeste', '✨', 80, 32000, 'lendario', 250, { crit: 10, regenHp: 2 }, 'b80'],
    ['wk_nyxaroth', 'Lâmina do Príncipe do Abismo', '🖤', 90, 42000, 'mitico', 290, { critDmg: 40, lifesteal: 6 }, 'b90'],
    ['wk_soberano', 'Cetro do Soberano do Vazio', '🌌', 100, 60000, 'mitico', 340, { allStatsPct: 5, crit: 8 }, 'b100']
  ].forEach(function (r) {
    var eq = Object.assign({ slot: 'weapon', atk: r[6], matk: r[6] }, r[7]);
    add({ id: r[0], name: r[1], icon: r[2], cat: 'arma', lvl: r[3], price: r[4], rarity: r[5], equip: eq, req: { boss: r[8] },
      desc: 'Arma de rei: serve a qualquer classe (físico e mágico).' });
  });

  /* ---------------- ARMADURAS ---------------- */
  [
    ['ar_couro', 'Túnica de Couro', '🥋', 1, 60, 'comum', { def: 4 }, null],
    ['ar_acolchoada', 'Gibão Acolchoado', '🧥', 5, 200, 'comum', { def: 9, hpPct: 2 }, null],
    ['ar_malha', 'Cota de Malha', '⛓️', 10, 400, 'incomum', { def: 14, hpPct: 3 }, null],
    ['ar_cacador', 'Colete do Caçador', '🦺', 15, 700, 'incomum', { def: 18, xpPct: 5 }, null],
    ['ar_escamas', 'Armadura de Escamas', '🐉', 18, 900, 'incomum', { def: 22, hpPct: 4 }, null],
    ['ar_placas', 'Armadura de Placas', '🛡️', 25, 1500, 'raro', { def: 32, hpPct: 6 }, null],
    ['ar_runica', 'Armadura Rúnica', '🔷', 35, 3000, 'raro', { def: 48, hpPct: 8 }, null],
    ['ar_sombra', 'Manto das Sombras', '🌑', 40, 4000, 'epico', { def: 40, eva: 6, crit: 3 }, null],
    ['ar_arquimago', 'Vestes do Arquimago', '🔮', 40, 4000, 'epico', { def: 30, mpPct: 15, regenMp: 2 }, null],
    ['ar_dragao', 'Armadura de Escamas de Dragão', '🐲', 55, 8500, 'epico', { def: 80, hpPct: 12 }, { boss: 'b60' }],
    ['ar_celeste', 'Armadura do Guardião Celeste', '👼', 65, 11000, 'lendario', { def: 100, hpPct: 15 }, null],
    ['ar_coral', 'Armadura do Rei Afogado', '🪸', 70, 16000, 'lendario', { def: 110, hpPct: 12, regenHp: 2 }, { boss: 'b70' }],
    ['ar_abismo', 'Couraça do Abismo', '🖤', 85, 26000, 'mitico', { def: 150, hpPct: 20, lifesteal: 5 }, { boss: 'b90' }],
    ['ar_soberano', 'Armadura do Soberano', '🌌', 85, null, 'mitico', { def: 160, hpPct: 25 }, null]
  ].forEach(function (r, i) {
    add({ id: r[0], name: r[1], icon: r[2], cat: 'armadura', lvl: r[3], price: r[4], rarity: r[5], req: r[7],
      equip: Object.assign({ slot: 'armor' }, r[6]), desc: r[4] ? 'Armadura para qualquer classe.' : 'Armadura lendária. Só se obtém em baús e chefes.' });
    if (!r[4]) return;
    VARIANTS.forEach(function (v) {
      var e2 = Object.assign({ slot: 'armor' }, r[6]);
      e2.def = Math.round(e2.def * v.mult);
      v.armorExtra(e2, i);
      add({ id: r[0] + v.suffix, name: r[1] + v.name, icon: r[2], cat: 'armadura', lvl: r[3], price: roundPrice(r[4] * v.price), rarity: r[5], req: r[7],
        equip: e2, desc: 'Armadura para qualquer classe. ' + v.desc });
    });
  });

  /* ---------------- ACESSÓRIOS (2 espaços) ---------------- */
  [
    // básicos
    ['ac_cobre', 'Anel de Cobre', '💍', 1, 120, 'comum', { stats: { str: 1, agi: 1, vit: 1, int: 1, per: 1 } }, null],
    ['ac_forca', 'Anel da Força', '💍', 5, 300, 'incomum', { stats: { str: 3 } }, null],
    ['ac_agi', 'Amuleto do Vento', '📿', 5, 300, 'incomum', { stats: { agi: 3 } }, null],
    ['ac_vit', 'Colar da Vitalidade', '📿', 5, 300, 'incomum', { stats: { vit: 3 } }, null],
    ['ac_int', 'Brinco do Sábio', '💎', 5, 300, 'incomum', { stats: { int: 3 } }, null],
    ['ac_per', 'Anel do Falcão', '💍', 5, 300, 'incomum', { stats: { per: 3 } }, null],
    ['ac_mana', 'Pendente de Safira', '🔹', 12, 1100, 'incomum', { mpPct: 15, regenMp: 2 }, null],
    ['ac_espinhos', 'Bracelete de Espinhos', '🌵', 20, 2200, 'raro', { def: 12, stats: { str: 4 } }, null],
    ['ac_fortuna', 'Amuleto da Fortuna', '🍀', 20, 2500, 'raro', { coinPct: 15 }, null],
    ['ac_insignia', 'Insígnia do Caçador', '🎖️', 25, 4000, 'raro', { xpPct: 10 }, null],
    ['ac_vampiro', 'Anel do Vampiro', '🩸', 30, 3500, 'epico', { lifesteal: 8 }, null],
    ['ac_selo', 'Selo do Pacto', '📜', 30, 4500, 'epico', { summonPct: 25, stats: { int: 3 } }, null],
    ['ac_furia', 'Colar da Fúria', '🔥', 40, 5000, 'epico', { critDmg: 30, crit: 5 }, null],
    ['ac_titan', 'Cinto do Titã', '🎗️', 50, 7000, 'epico', { hpPct: 15, def: 20 }, null],
    // insígnias de rank (por nível)
    ['ac_rank_d', 'Insígnia de Rank D', '🟢', 11, 800, 'incomum', { stats: { str: 2, agi: 2, vit: 2, int: 2, per: 2 } }, null],
    ['ac_rank_c', 'Insígnia de Rank C', '🔵', 21, 1800, 'raro', { stats: { str: 4, agi: 4, vit: 4, int: 4, per: 4 } }, null],
    ['ac_rank_b', 'Insígnia de Rank B', '🟣', 36, 4000, 'epico', { stats: { str: 6, agi: 6, vit: 6, int: 6, per: 6 } }, null],
    ['ac_rank_a', 'Insígnia de Rank A', '🟡', 51, 8000, 'epico', { stats: { str: 9, agi: 9, vit: 9, int: 9, per: 9 } }, null],
    ['ac_rank_s', 'Insígnia de Rank S', '🟠', 66, 15000, 'lendario', { stats: { str: 13, agi: 13, vit: 13, int: 13, per: 13 }, crit: 5 }, null],
    ['ac_rank_ss', 'Insígnia de Rank SS', '🔴', 81, 25000, 'mitico', { stats: { str: 18, agi: 18, vit: 18, int: 18, per: 18 }, critDmg: 20 }, null],
    // troféus de chefes (derrotar)
    ['ac_coragem', 'Medalha da Coragem', '🏅', 1, 400, 'incomum', { hpPct: 5, def: 5 }, { boss: 'b1' }],
    ['ac_musgo', 'Amuleto do Musgo', '🌿', 5, 900, 'incomum', { regenHp: 2 }, { boss: 'b5' }],
    ['ac_lobo', 'Colar de Presas de Lobo', '🐺', 10, 1500, 'raro', { crit: 6, stats: { agi: 3 } }, { boss: 'b10' }],
    ['ac_cristal', 'Brinco de Cristal', '💠', 18, 2500, 'raro', { critDmg: 15, stats: { int: 6 } }, { boss: 'b20' }],
    ['ac_praga', 'Anel da Praga', '☣️', 25, 3500, 'raro', { lifesteal: 6, stats: { vit: 5 } }, { boss: 'b30' }],
    ['ac_escaravelho', 'Escaravelho Dourado', '🪲', 35, 6000, 'epico', { coinPct: 20 }, { boss: 'b40' }],
    ['ac_gelo', 'Coração de Gelo', '🧊', 45, 8000, 'epico', { eva: 8, def: 20 }, { boss: 'b50' }],
    ['ac_dragao', 'Escama de Dragão', '🐉', 55, 11000, 'lendario', { hpPct: 15, critDmg: 25 }, { boss: 'b60' }],
    ['ac_perola', 'Pérola das Marés', '🦪', 65, 14000, 'lendario', { regenHp: 3, regenMp: 3, mpPct: 20 }, { boss: 'b70' }],
    ['ac_aureola', 'Auréola Partida', '😇', 75, 18000, 'lendario', { xpPct: 15, allStatsPct: 4 }, { boss: 'b80' }],
    ['ac_abismo', 'Olho do Abismo', '👁️', 85, 25000, 'mitico', { crit: 12, critDmg: 40 }, { boss: 'b90' }],
    ['ac_vazio', 'Anel do Soberano', '🌌', 95, 40000, 'mitico', { allStatsPct: 10, lifesteal: 8 }, { boss: 'b100' }],
    // conquistas e coleção
    ['ac_disciplina', 'Fita da Disciplina', '🎀', 5, 1500, 'raro', { xpPct: 8 }, { ach: 'd7' }],
    ['ac_monge', 'Rosário do Monge', '📿', 20, 6000, 'epico', { regenHp: 3, xpPct: 10 }, { ach: 'd30' }],
    ['ac_gigante', 'Colar do Matador de Gigantes', '🦣', 15, 5000, 'epico', { critDmg: 25, stats: { str: 5 } }, { ach: 'giant' }],
    ['ac_colecionador', 'Medalhão do Colecionador', '🏆', 20, 7000, 'epico', { coinPct: 10, xpPct: 10 }, { trophies: 30 }],
    ['ac_cacador_lenda', 'Emblema do Caçador Lendário', '🌟', 60, 30000, 'mitico', { allStatsPct: 8, crit: 6 }, { trophies: 80 }]
  ].forEach(function (r) {
    add({ id: r[0], name: r[1], icon: r[2], cat: 'acessorio', lvl: r[3], price: r[4], rarity: r[5], req: r[7],
      equip: Object.assign({ slot: 'acc' }, r[6]), desc: 'Acessório: podes usar dois ao mesmo tempo.' });
  });

  /* Acessórios de atributo em mais níveis (Maior, Ancestral, Primordial) */
  [['str', 'Anel da Força', '💍'], ['agi', 'Amuleto do Vento', '📿'], ['vit', 'Colar da Vitalidade', '📿'], ['int', 'Brinco do Sábio', '💎'], ['per', 'Anel do Falcão', '💍']].forEach(function (a) {
    [['_maior', ' Maior', 20, 2000, 'raro', 7], ['_anc', ' Ancestral', 45, 7500, 'epico', 14], ['_prim', ' Primordial', 75, 20000, 'lendario', 24]].forEach(function (t) {
      var st = {}; st[a[0]] = t[5];
      add({ id: 'ac_' + a[0] + t[0], name: a[1] + t[1], icon: a[2], cat: 'acessorio', lvl: t[2], price: t[3], rarity: t[4], req: null,
        equip: { slot: 'acc', stats: st }, desc: '+' + t[5] + ' ' + S.STAT_INFO[a[0]].name + '.' });
    });
  });
  /* Talismãs de combate em 3 níveis */
  [['crit', 'Talismã da Precisão', '🎯', 'Crítico'], ['lifesteal', 'Talismã Vampírico', '🦇', 'Roubo de vida'], ['eva', 'Talismã da Brisa', '🍃', 'Esquiva'], ['def', 'Talismã de Ferro', '🔩', 'Defesa']].forEach(function (a) {
    [[' I', 15, 1600, 'incomum', a[0] === 'def' ? 10 : 3], [' II', 40, 5500, 'raro', a[0] === 'def' ? 28 : 6], [' III', 70, 15000, 'epico', a[0] === 'def' ? 60 : 10]].forEach(function (t, k) {
      var eq = { slot: 'acc' }; eq[a[0]] = t[4];
      add({ id: 'ac_t_' + a[0] + (k + 1), name: a[1] + t[0], icon: a[2], cat: 'acessorio', lvl: t[1], price: t[2], rarity: t[3], req: null,
        equip: eq, desc: a[3] + ' +' + t[4] + (a[0] === 'def' ? '' : '%') + '.' });
    });
  });

  /* ---------------- CONSUMÍVEIS (modificadores de estado) ----------------
     [id, nome, ícone, nível, preço, raridade, descrição, uso, combate?, fora de combate?] */
  [
    // vida e mana
    ['po_vida1', 'Poção de Vida Menor', '🧪', 1, 50, 'comum', 'Recupera 30% da vida (dentro ou fora de combate).', { type: 'heal', pct: 30 }, true, true],
    ['po_vida2', 'Poção de Vida', '🧪', 1, 120, 'incomum', 'Recupera 60% da vida (dentro ou fora de combate).', { type: 'heal', pct: 60 }, true, true],
    ['po_vida3', 'Elixir de Vida Total', '❤️‍🔥', 15, 380, 'raro', 'Recupera toda a vida (dentro ou fora de combate).', { type: 'heal', pct: 100 }, true, true],
    ['po_mana1', 'Poção de Mana', '💧', 1, 50, 'comum', 'Recupera 40% da mana em combate.', { type: 'mana', pct: 40 }, true, false],
    ['po_mana15', 'Poção de Mana Maior', '💧', 10, 120, 'incomum', 'Recupera 70% da mana em combate.', { type: 'mana', pct: 70 }, true, false],
    ['po_mana2', 'Elixir de Mana Total', '🌊', 20, 300, 'raro', 'Recupera toda a mana em combate.', { type: 'mana', pct: 100 }, true, false],
    ['po_restaura', 'Elixir Restaurador', '⚗️', 15, 320, 'raro', 'Recupera 50% da vida e 50% da mana. Fora de combate, só a vida.', { type: 'restore', hp: 50, mp: 50 }, true, true],
    ['po_fenix', 'Lágrima da Fénix', '🪶', 40, 1100, 'epico', 'Recupera toda a vida e mana e remove efeitos negativos.', { type: 'restore', hp: 100, mp: 100, cleanse: true }, true, true],
    ['po_antidoto', 'Antídoto Universal', '🌿', 1, 80, 'comum', 'Remove venenos, queimaduras, sangramentos e fraquezas.', { type: 'cleanse' }, true, false],
    // reforços
    ['po_furia', 'Tónico de Fúria', '😤', 1, 220, 'incomum', '+40% ataque e ataque mágico durante 3 turnos.', { type: 'buffs', list: [{ key: 'atk', val: 40, turns: 3 }, { key: 'matk', val: 40, turns: 3 }] }, true, false],
    ['po_furia2', 'Sangue de Berserker', '🩸', 30, 520, 'raro', '+70% ataque e ataque mágico durante 3 turnos, mas -20% defesa.', { type: 'buffs', list: [{ key: 'atk', val: 70, turns: 3 }, { key: 'matk', val: 70, turns: 3 }, { key: 'def', val: -20, turns: 3 }] }, true, false],
    ['po_pedra', 'Pele de Pedra Líquida', '🪨', 1, 220, 'incomum', '+50% defesa durante 3 turnos.', { type: 'buffs', list: [{ key: 'def', val: 50, turns: 3 }] }, true, false],
    ['po_tita', 'Elixir do Titã', '🗿', 30, 520, 'raro', '+90% defesa durante 3 turnos.', { type: 'buffs', list: [{ key: 'def', val: 90, turns: 3 }] }, true, false],
    ['po_vento', 'Essência do Vento', '🌪️', 10, 240, 'incomum', '+30% esquiva durante 3 turnos.', { type: 'buffs', list: [{ key: 'eva', val: 30, turns: 3 }] }, true, false],
    ['po_foco', 'Essência de Foco', '🎯', 1, 260, 'raro', '+30% crítico durante 3 turnos.', { type: 'buffs', list: [{ key: 'crit', val: 30, turns: 3 }] }, true, false],
    ['po_predador', 'Olho do Predador', '👁️', 40, 650, 'epico', '+50% crítico durante 3 turnos.', { type: 'buffs', list: [{ key: 'crit', val: 50, turns: 3 }] }, true, false],
    ['po_vampiro', 'Frasco de Sangue Vampírico', '🍷', 20, 420, 'raro', '+30% roubo de vida durante 3 turnos.', { type: 'buffs', list: [{ key: 'lifesteal', val: 30, turns: 3 }] }, true, false],
    ['po_espelho', 'Poção Espelhada', '🪞', 25, 480, 'raro', 'Devolve 50% do dano recebido durante 3 turnos.', { type: 'buffs', list: [{ key: 'reflect', val: 50, turns: 3 }] }, true, false],
    ['po_barreira', 'Pergaminho de Barreira', '🔰', 15, 420, 'raro', 'Cria um escudo de 40% da vida máxima.', { type: 'ops', ops: [{ op: 'shield', pct: 40 }] }, true, false],
    // ofensivos
    ['po_bomba', 'Bomba Rúnica', '💣', 1, 280, 'incomum', 'Explode e causa dano fixo de 40 × o teu nível.', { type: 'bomb', perLevel: 40 }, true, false],
    ['po_fogo', 'Frasco de Fogo Grego', '🔥', 10, 300, 'incomum', 'Causa 20 × o teu nível e deixa o chefe a arder.', { type: 'bomb', perLevel: 20, dot: { type: 'burn', mult: 0.6, turns: 3 } }, true, false],
    ['po_gelo', 'Granada de Gelo', '❄️', 15, 420, 'raro', 'Causa 25 × o teu nível com 60% de hipótese de congelar.', { type: 'bomb', perLevel: 25, stun: 0.6 }, true, false],
    ['po_abismo', 'Bomba do Abismo', '🕳️', 50, 1300, 'epico', 'Explosão de vazio: 90 × o teu nível.', { type: 'bomb', perLevel: 90 }, true, false],
    ['po_veneno', 'Veneno de Lâmina', '🐍', 12, 280, 'incomum', 'Envenena o chefe durante 4 turnos.', { type: 'ops', ops: [{ op: 'dot', type: 'poison', mult: 0.8, turns: 4 }] }, true, false],
    ['po_fraqueza', 'Pó da Fraqueza', '🌫️', 20, 480, 'raro', 'Reduz o ataque do chefe em 30% e a defesa em 20% durante 3 turnos.', { type: 'ops', ops: [{ op: 'debuff', key: 'atk', val: 30, turns: 3 }, { op: 'debuff', key: 'def', val: 20, turns: 3 }] }, true, false],
    ['po_correntes', 'Corrente de Selamento', '⛓️', 35, 1100, 'epico', 'Prende o chefe: perde garantidamente o próximo turno.', { type: 'ops', ops: [{ op: 'stun', chance: 1, turns: 1 }] }, true, false],
    ['po_fumo', 'Pó de Fumo', '💨', 1, 220, 'comum', 'Foge de uma batalha sem perder moedas.', { type: 'smoke' }, true, false],
    // fora de combate (tempo real)
    ['po_xp15', 'Incenso do Foco', '🕯️', 1, 450, 'incomum', '+50% XP durante 3 horas (missões e chefes).', { type: 'timed', effect: 'xp15', hours: 3 }, false, true],
    ['po_xp2', 'Pergaminho de XP Duplo', '📜', 1, 800, 'raro', 'XP a dobrar durante 2 horas (missões e chefes).', { type: 'timed', effect: 'xp2', hours: 2 }, false, true],
    ['po_xp3', 'Grande Pergaminho de XP', '📜', 30, 2000, 'epico', 'XP a dobrar durante 6 horas.', { type: 'timed', effect: 'xp2', hours: 6 }, false, true],
    ['po_coin2', 'Pergaminho da Fortuna', '💰', 1, 700, 'raro', 'Moedas a dobrar durante 2 horas.', { type: 'timed', effect: 'coin2', hours: 2 }, false, true],
    ['po_coin3', 'Grande Pergaminho da Fortuna', '💰', 30, 1800, 'epico', 'Moedas a dobrar durante 6 horas.', { type: 'timed', effect: 'coin2', hours: 6 }, false, true],
    ['po_sorte', 'Trevo da Sorte', '🍀', 10, 950, 'raro', 'Durante 3 horas, cada baú que abrires dá um item extra.', { type: 'timed', effect: 'sorte', hours: 3 }, false, true],
    ['po_escudo', 'Escudo de Penalidade', '🔰', 1, 550, 'raro', 'Basta tê-lo na bolsa: protege-te da próxima penalidade por missão falhada (gasta-se sozinho).', { type: 'penaltyShield' }, false, false],
    ['po_descanso', 'Remédio do Descanso', '💊', 1, 320, 'incomum', 'Remove o estado Exausto.', { type: 'removeEffect', effect: 'exausto' }, false, true]
  ].forEach(function (r) {
    add({ id: r[0], name: r[1], icon: r[2], lvl: r[3], price: r[4], rarity: r[5], desc: r[6], use: r[7], battle: r[8], field: r[9], cat: 'consumivel' });
  });

  /* ---------------- ITENS DE HORÁRIO (relógio do Sistema) ----------------
     phase: só funcionam nessa fase do dia (hora do telemóvel) */
  [
    // equipamento: o bónus só conta na fase indicada
    { id: 'ac_sol', name: 'Anel do Sol Nascente', icon: '🌞', cat: 'acessorio', lvl: 10, price: 2400, rarity: 'raro', phase: 'dia',
      equip: { slot: 'acc', stats: { str: 6, vit: 6 }, hpPct: 5 }, desc: 'Brilha enquanto houver sol. Só funciona de dia.' },
    { id: 'ac_lua', name: 'Pingente da Lua Crescente', icon: '🌙', cat: 'acessorio', lvl: 10, price: 2400, rarity: 'raro', phase: 'noite',
      equip: { slot: 'acc', stats: { agi: 6, int: 6 }, crit: 5 }, desc: 'Acorda quando a lua sobe. Só funciona à noite.' },
    { id: 'ac_galo', name: 'Selo do Madrugador', icon: '🐓', cat: 'acessorio', lvl: 15, price: 4000, rarity: 'raro', phase: 'manha', req: { ach: 'early' },
      equip: { slot: 'acc', xpPct: 15, coinPct: 10 }, desc: 'Para quem acorda antes do mundo. Só funciona de manhã.' },
    { id: 'ac_coruja', name: 'Olho da Coruja', icon: '🦉', cat: 'acessorio', lvl: 25, price: 6500, rarity: 'epico', phase: 'noite', req: { ach: 'night' },
      equip: { slot: 'acc', stats: { per: 12 }, crit: 8, xpPct: 10 }, desc: 'Vê tudo na escuridão. Só funciona à noite.' },
    { id: 'ac_aurora', name: 'Coroa da Aurora', icon: '🌄', cat: 'acessorio', lvl: 40, price: 14000, rarity: 'lendario', phase: 'dia', req: { boss: 'b40' },
      equip: { slot: 'acc', allStatsPct: 7, regenHp: 2 }, desc: 'Herdada do Imperador Solar. Só funciona de dia.' },
    { id: 'ar_meianoite', name: 'Manto da Meia-Noite', icon: '🌌', cat: 'armadura', lvl: 40, price: 11000, rarity: 'epico', phase: 'noite', req: { boss: 'b30' },
      equip: { slot: 'armor', def: 70, eva: 10, crit: 5 }, desc: 'Tecido com fios de sombra. Só protege à noite.' },
    { id: 'wk_solar', name: 'Lâmina do Meio-Dia', icon: '☀️', cat: 'arma', lvl: 30, price: 9000, rarity: 'epico', phase: 'dia', req: { boss: 'b40' },
      equip: { slot: 'weapon', atk: 105, matk: 105, critDmg: 25 }, desc: 'Arma de qualquer classe. Só tem poder de dia; à noite é só metal.' },
    { id: 'wk_lunar', name: 'Foice do Luar', icon: '🌙', cat: 'arma', lvl: 30, price: 9000, rarity: 'epico', phase: 'noite', req: { boss: 'b30' },
      equip: { slot: 'weapon', atk: 105, matk: 105, lifesteal: 8 }, desc: 'Arma de qualquer classe. Só tem poder à noite.' },
    // consumíveis que só se usam em certas horas
    { id: 'po_orvalho', name: 'Orvalho da Manhã', icon: '💧', cat: 'consumivel', lvl: 1, price: 70, rarity: 'incomum', phase: 'manha',
      use: { type: 'heal', pct: 45 }, battle: true, field: true, desc: 'Recupera 45% da vida. Só se pode beber de manhã (mais barato que as poções).' },
    { id: 'po_lunar', name: 'Essência Lunar', icon: '🌕', cat: 'consumivel', lvl: 10, price: 320, rarity: 'raro', phase: 'noite',
      use: { type: 'buffs', list: [{ key: 'crit', val: 35, turns: 3 }, { key: 'atk', val: 30, turns: 3 }, { key: 'matk', val: 30, turns: 3 }] }, battle: true, field: false,
      desc: '+35% crítico e +30% ataque durante 3 turnos. Só funciona à noite.' },
    { id: 'po_crepusculo', name: 'Pergaminho do Crepúsculo', icon: '🌇', cat: 'consumivel', lvl: 10, price: 700, rarity: 'epico', phase: 'crepusculo',
      use: { type: 'timed', effect: 'xp2', hours: 3 }, battle: false, field: true, desc: 'XP a dobrar durante 3 horas. Só se pode abrir ao crepúsculo.' },
    { id: 'po_horamorta', name: 'Vela da Hora Morta', icon: '🕯️', cat: 'consumivel', lvl: 20, price: 1400, rarity: 'epico', phase: 'horaMorta',
      use: { type: 'chest', tier: 'raro', bonus: 'secreto', bonusChance: 0.1 }, battle: false, field: true,
      desc: 'Acesa na hora morta, chama um Baú Raro (10% de hipótese de um Baú Secreto). Só funciona da 00:00 às 02:59.' }
  ].forEach(function (o) { o.req = o.req || null; add(o); });

  /* ---------------- ATRIBUTOS (permanentes) ---------------- */
  S.STATS.forEach(function (st) {
    var info = S.STAT_INFO[st];
    add({ id: 'el_' + st, name: 'Elixir de ' + info.name, icon: '⚗️', cat: 'atributo', lvl: 1, price: 1000, priceStep: 0.2, rarity: 'raro',
      desc: '+1 ' + info.name + ' permanente. O preço sobe 20% a cada compra.', use: { type: 'perm', stat: st, amount: 1 }, field: true });
    add({ id: 'elg_' + st, name: 'Grande Elixir de ' + info.name, icon: '🧬', cat: 'atributo', lvl: 40, price: 3500, priceStep: 0.2, rarity: 'epico',
      desc: '+3 ' + info.name + ' permanente. O preço sobe 20% a cada compra.', use: { type: 'perm', stat: st, amount: 3 }, field: true });
  });
  add({ id: 'el_ponto', name: 'Fruto da Sabedoria', icon: '🍇', cat: 'atributo', lvl: 10, price: 1500, priceStep: 0.2, rarity: 'epico',
    desc: '+1 ponto livre para distribuíres. O preço sobe 20% a cada compra.', use: { type: 'point', amount: 1 }, field: true });
  add({ id: 'el_ascensao', name: 'Cristal de Ascensão', icon: '🔮', cat: 'atributo', lvl: 50, price: 6000, priceStep: 0.2, rarity: 'lendario', req: { boss: 'b50' },
    desc: '+3 pontos livres. O preço sobe 20% a cada compra.', use: { type: 'point', amount: 3 }, field: true });
  add({ id: 'el_nectar', name: 'Néctar dos Deuses', icon: '🏺', cat: 'atributo', lvl: 60, price: 9000, priceStep: 0.25, rarity: 'mitico', req: { boss: 'b60' },
    desc: '+1 em todos os atributos, para sempre. O preço sobe 25% a cada compra.', use: { type: 'permAll', amount: 1 }, field: true });
  add({ id: 'el_selo', name: 'Selo de Ascensão', icon: '⏫', cat: 'atributo', lvl: 10, price: 5000, priceScale: 3000, priceStep: 0.25, rarity: 'mitico', req: { boss: 'b20' },
    desc: 'Sobe 1 nível na hora (recebes os 3 pontos de atributo). O XP que já tinhas nesse nível fica guardado. O preço acompanha o teu nível e sobe 25% a cada compra.', use: { type: 'levelUp' }, field: true });
  add({ id: 'el_reset', name: 'Pedra do Renascimento', icon: '🔄', cat: 'atributo', lvl: 10, price: 1500, rarity: 'epico',
    desc: 'Devolve todos os pontos que distribuíste para os voltares a distribuir.', use: { type: 'reset' }, field: true });

  /* ---------------- BAÚS ---------------- */
  [
    ['bau_comum', 'Baú Comum', '📦', 250, 'comum', null],
    ['bau_raro', 'Baú Raro', '🎁', 900, 'raro', null],
    ['bau_epico', 'Baú Épico', '💼', 3500, 'epico', { boss: 'b30' }],
    ['bau_lendario', 'Baú Lendário', '👑', 12000, 'lendario', { boss: 'b70' }],
    ['bau_secreto', 'Baú Secreto', '🗝️', null, 'secreto', null]
  ].forEach(function (r) {
    var tier = r[0].replace('bau_', '');
    add({ id: r[0], name: r[1], icon: r[2], price: r[3], rarity: r[4], req: r[5], cat: 'bau', lvl: 1, use: { type: 'chest', tier: tier }, field: true,
      desc: 'Abre para receber recompensas aleatórias.' + (r[3] ? '' : ' Só se obtém em batalhas e conquistas.') });
  });

  /* ---------------- SECRETOS (nunca à venda) ---------------- */
  [
    { id: 'sx_ampulheta', name: 'Ampulheta Quebrada', icon: '⏳', rarity: 'secreto', desc: 'Areia que corre para trás. Usa-a para aprender a habilidade secreta Domínio do Tempo.', use: { type: 'unlockSkill', skill: 's5' }, field: true },
    { id: 'sx_coracao', name: 'Coração de Dragão Antigo', icon: '🫀', rarity: 'secreto', desc: 'Ainda bate. +5 em todos os atributos, para sempre.', use: { type: 'permAll', amount: 5 }, field: true },
    { id: 'sx_fenix', name: 'Pena da Fénix', icon: '🪶', rarity: 'secreto', desc: 'Basta tê-la na bolsa: ao morrer em combate, renasces com 50% de vida (gasta-se).', use: { type: 'revive', pct: 50 }, field: false },
    { id: 'sx_moeda', name: 'Moeda Antiga', icon: '🪙', rarity: 'secreto', desc: 'Um colecionador paga bem por ela. Usa para receber 5000 moedas.', use: { type: 'coins', amount: 5000 }, field: true },
    { id: 'sx_mapa', name: 'Mapa da Última Arena', icon: '🗺️', rarity: 'secreto', desc: 'Mostra quanto falta para a Última Arena. Não se gasta.', use: { type: 'finalMap' }, field: true },
    { id: 'sx_fragmento', name: 'Fragmento do Sistema', icon: '🔷', rarity: 'secreto', desc: 'Parte de algo maior. Junta 5 para formar o Núcleo do Sistema.', use: { type: 'fragment', need: 5, result: 'sx_nucleo' }, field: true },
    { id: 'sx_nucleo', name: 'Núcleo do Sistema', icon: '💠', rarity: 'secreto', desc: 'O coração do Sistema. Usa para ganhar 10 pontos livres e a habilidade Autoridade do Sistema.', use: { type: 'core', points: 10, skill: 's8' }, field: true },
    { id: 'sx_lamina', name: 'Lâmina Sem Nome', icon: '🌑', cat: 'arma', rarity: 'secreto', lvl: 40, desc: 'Ninguém sabe quem a forjou. Serve a qualquer classe.',
      equip: { slot: 'weapon', atk: 200, matk: 200, crit: 15, critDmg: 40, stats: { str: 8, int: 8 } } },
    { id: 'sx_coroa', name: 'Coroa Esquecida', icon: '👑', cat: 'acessorio', rarity: 'secreto', lvl: 50, desc: 'Pertenceu a um rei de um portão que já não existe.',
      equip: { slot: 'acc', allStatsPct: 10, xpPct: 20 } },
    { id: 'sx_olho', name: 'Olho do Vigia', icon: '🧿', cat: 'acessorio', rarity: 'secreto', lvl: 20, desc: 'Vê o que os outros não veem.',
      equip: { slot: 'acc', stats: { per: 10 }, crit: 10, eva: 5 } }
  ].forEach(function (o) {
    o.cat = o.cat || 'secreto';
    o.lvl = o.lvl || 1;
    o.price = null;
    o.secret = true;
    add(o);
  });

  /* ---------------- LOJA ---------------- */
  S.SHOP_TABS = [
    { id: 'arma', name: 'Armas', icon: '⚔️' },
    { id: 'armadura', name: 'Armaduras', icon: '🥋' },
    { id: 'acessorio', name: 'Acessórios', icon: '💍' },
    { id: 'consumivel', name: 'Poções', icon: '🧪' },
    { id: 'atributo', name: 'Atributos', icon: '⚗️' },
    { id: 'bau', name: 'Baús', icon: '📦' },
    { id: 'sistema', name: 'Sistema', icon: '👁️' }
  ];

  /* ---------------- TABELAS DOS BAÚS ----------------
     coins: [min,max] (x multiplicador de nível)
     rolls: número de sorteios na tabela de itens
     table: [itemId|'@weapon:nível 1-10'|'@acc', peso]           */
  S.CHESTS = {
    comum: { coins: [30, 90], rolls: 1, table: [
      ['po_vida1', 28], ['po_mana1', 22], ['po_antidoto', 10], ['po_fumo', 8], ['po_vida2', 10], ['po_vento', 4], ['po_furia', 4], ['po_pedra', 4],
      ['po_bomba', 2], ['@weapon:2', 1] ] },
    raro: { coins: [120, 300], rolls: 2, table: [
      ['po_vida2', 20], ['po_mana15', 14], ['po_furia', 10], ['po_pedra', 10], ['po_foco', 8], ['po_vento', 6], ['po_vampiro', 5], ['po_barreira', 5], ['po_fogo', 5],
      ['po_escudo', 6], ['po_xp15', 5], ['@acc', 6], ['@weapon:4', 5], ['el_ponto', 3], ['sx_fragmento', 0.6] ] },
    epico: { coins: [400, 900], rolls: 3, table: [
      ['po_vida3', 14], ['po_mana2', 10], ['po_restaura', 10], ['po_xp2', 8], ['po_coin2', 8], ['po_sorte', 6], ['po_escudo', 8], ['po_furia2', 5], ['po_tita', 5], ['po_gelo', 5],
      ['el_str', 4], ['el_agi', 4], ['el_vit', 4], ['el_int', 4], ['el_per', 4],
      ['@weapon:6', 8], ['@acc', 8], ['bau_raro', 6], ['sx_moeda', 1.2], ['sx_fragmento', 1.5], ['sx_fenix', 1], ['sx_olho', 0.6] ] },
    lendario: { coins: [1200, 2600], rolls: 4, table: [
      ['po_vida3', 10], ['po_fenix', 6], ['po_xp3', 8], ['po_coin3', 6], ['po_correntes', 5], ['po_abismo', 4], ['el_ponto', 10],
      ['elg_str', 3], ['elg_agi', 3], ['elg_vit', 3], ['elg_int', 3], ['elg_per', 3],
      ['@weapon:8', 9], ['@weapon:10', 3], ['ar_celeste', 3], ['bau_epico', 8], ['sx_fragmento', 3], ['sx_fenix', 3], ['sx_moeda', 3],
      ['sx_ampulheta', 1.5], ['sx_mapa', 1.5], ['sx_coracao', 1], ['sx_olho', 1.5] ] },
    secreto: { coins: [3000, 6000], rolls: 3, table: [
      ['sx_fragmento', 10], ['sx_fenix', 8], ['sx_moeda', 8], ['sx_ampulheta', 6], ['sx_mapa', 6], ['sx_coracao', 5], ['sx_olho', 5],
      ['sx_lamina', 4], ['sx_coroa', 3], ['@weapon:10', 6], ['ar_soberano', 3], ['bau_lendario', 6], ['el_nectar', 4] ] }
  };

  /* ---------------- TROFÉUS (um por chefe, para colecionar) ---------------- */
  var TROPHY_NAMES = [
    'Presa do Lobo Cinzento', 'Presa de Ferro do Javali', 'Fuso de Seda da Tecelã', 'Cutelo de Ruk', 'Garra Musgosa', 'Coração de Seiva Negra', 'Ferrão da Matriarca', 'Cajado de Caveira de Zurg', 'Escama de Raiz', 'Coroa de Osso de Fenrath',
    'Asa Ecoante', 'Núcleo de Quartzo', 'Espinho Cristalino', 'Lanterna Amaldiçoada', 'Martelo da Forja Kobold', 'Anel de Dentes de Diamante', 'Estilhaço de Ametista', 'Clava de Cristal do Troll', 'Alabarda da Sentinela', 'Coroa Cristalina de Varyss',
    'Glândula Ácida', 'Caldeirão do Lodo', 'Placa Óssea Couraçada', 'Cabeça de Hidra', 'Esporo Pestilento', 'Correntes do Afogado', 'Ventosa Colossal', 'Orbe do Feiticeiro Lagarto', 'Corda dos Enforcados', 'Máscara da Senhora da Praga',
    'Ferrão Dourado', 'Ligaduras Sagradas', 'Dente das Areias', 'Cajado do Chacal', 'Tábua de Arenito Gravada', 'Lâmpada do Djinn', 'Enigma de Pedra', 'Máscara do Faraó', 'Olho de Basilisco', 'Disco Solar de Ankharet',
    'Pelagem Ancestral', 'Presa de Gelo', 'Elmo Congelado', 'Filactério Gelado', 'Presa de Mamute', 'Pena da Nevasca', 'Barba de Gelo de Hrimr', 'Lamento Polar', 'Escama Branca', 'Coroa de Gelo de Skadhi',
    'Cauda Flamejante', 'Núcleo de Magma', 'Coleira Infernal', 'Bigorna Demoníaca', 'Pena Corrompida', 'Chama Eterna do Ifrit', 'Escama de Lava', 'Urna de Cinzas', 'Punho Flamejante', 'Chifre de Pyraxis',
    'Tentáculo do Kraken', 'Concha da Sereia', 'Dente Abissal', 'Tridente do Guarda', 'Bobina Trovejante', 'Escama de Leviatã', 'Pérola da Sacerdotisa', 'Pinça Colossal', 'Olho das Profundezas', 'Coroa de Coral de Thalassor',
    'Pena Real do Grifo', 'Auréola do Caído', 'Runa Celeste', 'Elmo Alado da Valquíria', 'Asa de Serafim', 'Trompa Dourada', 'Tripla Coroa da Quimera', 'Escudo da Aurora', 'Espada Flamejante do Arcanjo', 'Trono Alado de Auriel',
    'Fragmento de Escuridão', 'Máscara dos Pesadelos', 'Olho Infinito', 'Foice do Ceifador', 'Chifre do Behemoth', 'Coroa do Lich Imperial', 'Crânio de Dragão Ósseo', 'Coração de Belzar', 'Prisma do Caos', 'Coroa Negra de Nyxaroth',
    'Escudo Estelar', 'Ampulheta do Titã', 'Escama Primordial', 'Espelho Partido', 'Estrela Esmagada', 'Planta dos Portões', 'Máscara do Deus Esquecido', 'Anel do Mundo', 'Eco do Primeiro Caçador', 'Coroa do Soberano do Vazio'
  ];
  S.TROPHIES = {};
  S.BOSSES.forEach(function (b, i) {
    S.TROPHIES[b.id] = { id: b.id, name: TROPHY_NAMES[i], rarity: b.level === 100 ? 'mitico' : (b.king ? 'lendario' : (b.level > 50 ? 'epico' : 'raro')) };
  });
  S.SECRET_BOSSES.forEach(function (b) {
    S.TROPHIES[b.id] = { id: b.id, name: b.id === 'secret_1' ? 'Olho do Sistema' : 'Caneta do Arquiteto', rarity: 'secreto' };
  });

  /* Bónus permanente por completar os 10 troféus de um portão */
  S.TROPHY_SETS = {
    1: { desc: '+5 Vitalidade', bonus: { stats: { vit: 5 } } },
    2: { desc: '+5 Percepção', bonus: { stats: { per: 5 } } },
    3: { desc: '+5 Inteligência', bonus: { stats: { int: 5 } } },
    4: { desc: '+10% moedas', bonus: { coinPct: 10 } },
    5: { desc: '+5 Agilidade', bonus: { stats: { agi: 5 } } },
    6: { desc: '+5 Força', bonus: { stats: { str: 5 } } },
    7: { desc: '+10% vida máxima', bonus: { hpPct: 10 } },
    8: { desc: '+10% XP', bonus: { xpPct: 10 } },
    9: { desc: '+5% crítico e +20% dano crítico', bonus: { crit: 5, critDmg: 20 } },
    10: { desc: '+5% em todos os atributos', bonus: { allStatsPct: 5 } },
    0: { desc: '+10 em todos os atributos', bonus: { stats: { str: 10, agi: 10, vit: 10, int: 10, per: 10 } } }
  };
})(globalThis.SYS = globalThis.SYS || {});
