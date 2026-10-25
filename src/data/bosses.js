/* ==========================================================
   CHEFES: 10 portões x 10 chefes = 100 chefes (+ 2 secretos)
   O nível de cada chefe = a sua posição (1 a 100).
   ========================================================== */
(function (S) {
  'use strict';

  /* Habilidades dos chefes (alvo = jogador) */
  S.BOSS_SKILLS = {
    strike: { name: 'Ataque', cd: 0, ops: [{ op: 'hit', mult: 1 }] },
    heavy: { name: 'Golpe Esmagador', cd: 2, ops: [{ op: 'hit', mult: 1.7 }] },
    multi: { name: 'Fúria de Golpes', cd: 2, ops: [{ op: 'hit', mult: 0.55, hits: 3 }] },
    poison: { name: 'Toque Venenoso', cd: 3, ops: [{ op: 'hit', mult: 0.8 }, { op: 'dot', type: 'poison', mult: 0.3, turns: 3 }] },
    burn: { name: 'Sopro Ardente', cd: 3, ops: [{ op: 'hit', mult: 0.9 }, { op: 'dot', type: 'burn', mult: 0.3, turns: 3 }] },
    bleed: { name: 'Garras Dilacerantes', cd: 3, ops: [{ op: 'hit', mult: 0.9 }, { op: 'dot', type: 'bleed', mult: 0.3, turns: 3 }] },
    stun: { name: 'Rugido Atordoante', cd: 4, ops: [{ op: 'hit', mult: 0.6 }, { op: 'stun', chance: 0.35, turns: 1 }] },
    freeze: { name: 'Prisão de Gelo', cd: 4, ops: [{ op: 'hit', mult: 0.8 }, { op: 'stun', chance: 0.4, turns: 1 }] },
    heal: { name: 'Regenerar', cd: 6, ops: [{ op: 'heal', pct: 8 }] },
    shield: { name: 'Carapaça', cd: 6, ops: [{ op: 'shield', pct: 10 }] },
    enrage: { name: 'Fúria Bestial', cd: 6, ops: [{ op: 'buff', key: 'atk', val: 30, turns: 3 }] },
    drain: { name: 'Drenar Mana', cd: 3, ops: [{ op: 'hit', mult: 0.8 }, { op: 'drainMp', pct: 20 }] },
    weaken: { name: 'Maldição', cd: 4, ops: [{ op: 'debuff', key: 'def', val: 25, turns: 3 }, { op: 'hit', mult: 0.5 }] },
    leech: { name: 'Sugar Vida', cd: 3, ops: [{ op: 'hit', mult: 1.2, lifesteal: 0.5 }] },
    ult: { name: 'Golpe Devastador', cd: 5, ops: [{ op: 'hit', mult: 2.6 }] },
    apocalypse: { name: 'Fim de Tudo', cd: 6, ops: [{ op: 'hit', mult: 3.4 }, { op: 'debuff', key: 'def', val: 30, turns: 2 }] }
  };

  S.ARCHETYPES = {
    equilibrado: { name: 'Equilibrado', hp: 1, atk: 1, def: 1 },
    tanque: { name: 'Tanque', hp: 1.35, atk: 0.85, def: 1.4 },
    feroz: { name: 'Feroz', hp: 0.8, atk: 1.3, def: 0.8 },
    conjurador: { name: 'Conjurador', hp: 0.9, atk: 1.15, def: 0.9 },
    berserker: { name: 'Berserker', hp: 1.1, atk: 1.2, def: 0.9 },
    rei: { name: 'Rei do Portão', hp: 1.12, atk: 1.02, def: 1.05 }
  };

  S.GATES = [
    { id: 1, name: 'Floresta Sussurrante', icon: '🌲', color: '#5be08a' },
    { id: 2, name: 'Cavernas de Cristal', icon: '💎', color: '#4ab8ff' },
    { id: 3, name: 'Pântano Pútrido', icon: '🐸', color: '#9bc53d' },
    { id: 4, name: 'Ruínas do Deserto', icon: '🏜️', color: '#f4b860' },
    { id: 5, name: 'Fortaleza de Gelo', icon: '❄️', color: '#a8e6ff' },
    { id: 6, name: 'Vulcão Carmesim', icon: '🌋', color: '#ff6b4a' },
    { id: 7, name: 'Cidade Submersa', icon: '🌊', color: '#3aa0ff' },
    { id: 8, name: 'Cidadela Celestial', icon: '☁️', color: '#ffe48a' },
    { id: 9, name: 'Abismo Sem Fim', icon: '🕳️', color: '#b56cff' },
    { id: 10, name: 'Trono do Vazio', icon: '🌌', color: '#e0e6ff' }
  ];

  /* [nome, ícone, arquétipo, habilidades] */
  var RAW = [
    // Portão 1 — Floresta Sussurrante
    ['Lobo Cinzento Alfa', '🐺', 'feroz', 'strike,bleed'],
    ['Javali de Presas Ferrenhas', '🐗', 'berserker', 'strike,heavy'],
    ['Aranha Tecelã', '🕷️', 'conjurador', 'strike,poison'],
    ['Goblin Chefe Ruk', '👺', 'equilibrado', 'strike,multi'],
    ['Urso das Garras Musgosas', '🐻', 'tanque', 'strike,heavy,bleed'],
    ['Ent Apodrecido', '🌳', 'tanque', 'strike,heal,poison'],
    ['Matriarca das Vespas', '🐝', 'feroz', 'multi,poison'],
    ['Goblin Xamã Zurg', '🧌', 'conjurador', 'strike,weaken,heal'],
    ['Serpente da Raiz', '🐍', 'conjurador', 'strike,poison,stun'],
    ['Fenrath, Rei Lobo', '🐺', 'rei', 'strike,bleed,enrage,ult'],
    // Portão 2 — Cavernas de Cristal
    ['Morcego Gigante Eco', '🦇', 'feroz', 'strike,leech'],
    ['Golem de Quartzo', '🗿', 'tanque', 'strike,heavy,shield'],
    ['Lagarto Cristalino', '🦎', 'equilibrado', 'strike,multi'],
    ['Mineiro Amaldiçoado', '⛏️', 'berserker', 'strike,heavy,weaken'],
    ['Kobold Senhor da Forja', '🔨', 'equilibrado', 'strike,burn,multi'],
    ['Verme Perfurador', '🪱', 'tanque', 'strike,heavy,stun'],
    ['Elemental de Ametista', '🔮', 'conjurador', 'strike,drain,shield'],
    ['Troll das Profundezas', '🧌', 'tanque', 'strike,heal,heavy'],
    ['Sentinela de Cristal', '🗿', 'tanque', 'strike,shield,stun'],
    ['Varyss, Rainha Cristalina', '👸', 'rei', 'strike,freeze,shield,ult'],
    // Portão 3 — Pântano Pútrido
    ['Sapo Ácido Gigante', '🐸', 'equilibrado', 'strike,poison'],
    ['Bruxa do Lodo', '🧙', 'conjurador', 'strike,weaken,poison'],
    ['Crocodilo Couraçado', '🐊', 'tanque', 'strike,heavy,bleed'],
    ['Hidra Jovem', '🐉', 'berserker', 'multi,poison,heal'],
    ['Cogumelo Pestilento', '🍄', 'conjurador', 'poison,stun,heal'],
    ['Afogado Errante', '🧟', 'equilibrado', 'strike,leech,weaken'],
    ['Sanguessuga Colossal', '🪱', 'tanque', 'leech,heal,strike'],
    ['Feiticeiro Lagarto', '🦎', 'conjurador', 'strike,drain,burn'],
    ['Árvore dos Enforcados', '🌳', 'tanque', 'strike,stun,heal,weaken'],
    ['Morvenna, Senhora da Praga', '🧪', 'rei', 'poison,weaken,heal,ult'],
    // Portão 4 — Ruínas do Deserto
    ['Escorpião Rei', '🦂', 'feroz', 'strike,poison,heavy'],
    ['Múmia Guardiã', '🧟', 'tanque', 'strike,weaken,heal'],
    ['Verme das Areias', '🪱', 'berserker', 'heavy,multi,stun'],
    ['Chacal Sacerdote', '🐕', 'conjurador', 'strike,drain,weaken'],
    ['Golem de Arenito', '🗿', 'tanque', 'heavy,shield,strike'],
    ['Djinn Traiçoeiro', '🧞', 'conjurador', 'burn,drain,stun'],
    ['Esfinge Enigmática', '🦁', 'equilibrado', 'strike,stun,heavy,weaken'],
    ['Faraó Esquecido', '⚱️', 'conjurador', 'leech,weaken,shield'],
    ['Basilisco Dourado', '🐍', 'feroz', 'poison,stun,heavy'],
    ['Ankharet, Imperador Solar', '☀️', 'rei', 'burn,heavy,shield,enrage,ult'],
    // Portão 5 — Fortaleza de Gelo
    ['Yeti Ancestral', '🦍', 'berserker', 'strike,heavy,enrage'],
    ['Lobo Glacial', '🐺', 'feroz', 'multi,freeze'],
    ['Cavaleiro de Gelo', '🤺', 'tanque', 'strike,heavy,shield'],
    ['Lich Congelado', '💀', 'conjurador', 'freeze,drain,weaken'],
    ['Mamute de Guerra', '🦣', 'tanque', 'heavy,stun,strike'],
    ['Harpia da Nevasca', '🦅', 'feroz', 'multi,freeze,bleed'],
    ['Hrimr, Gigante de Gelo', '🧊', 'berserker', 'heavy,ult,freeze'],
    ['Espectro Polar', '👻', 'conjurador', 'leech,freeze,weaken'],
    ['Dragão Branco Jovem', '🐉', 'berserker', 'freeze,heavy,multi,enrage'],
    ['Skadhi, Rainha do Inverno Eterno', '❄️', 'rei', 'freeze,shield,heal,ult,weaken'],
    // Portão 6 — Vulcão Carmesim
    ['Salamandra Infernal', '🦎', 'feroz', 'burn,multi'],
    ['Golem de Magma', '🌋', 'tanque', 'burn,heavy,shield'],
    ['Cão Infernal Bicéfalo', '🐕', 'berserker', 'multi,burn,bleed'],
    ['Demónio Ferreiro', '👹', 'equilibrado', 'heavy,burn,weaken'],
    ['Fénix Corrompida', '🐦‍🔥', 'conjurador', 'burn,heal,multi'],
    ['Ifrit Furioso', '🔥', 'berserker', 'burn,enrage,ult'],
    ['Wyrm de Lava', '🐍', 'tanque', 'burn,heavy,stun'],
    ['Senhor das Cinzas', '💨', 'conjurador', 'burn,weaken,drain'],
    ['Titã Flamejante', '👺', 'berserker', 'heavy,burn,enrage,ult'],
    ['Pyraxis, Dragão Vulcânico', '🐲', 'rei', 'burn,multi,enrage,shield,ult'],
    // Portão 7 — Cidade Submersa
    ['Kraken Menor', '🦑', 'tanque', 'multi,stun,strike'],
    ['Sereia Cantora', '🧜', 'conjurador', 'stun,drain,leech'],
    ['Tubarão Abissal', '🦈', 'feroz', 'bleed,heavy,multi'],
    ['Guarda Tritão', '🔱', 'equilibrado', 'heavy,shield,multi'],
    ['Enguia Trovejante', '⚡', 'feroz', 'stun,multi,strike'],
    ['Leviatã Juvenil', '🐋', 'tanque', 'heavy,heal,ult'],
    ['Sacerdotisa das Marés', '🌊', 'conjurador', 'drain,heal,weaken,stun'],
    ['Caranguejo Colosso', '🦀', 'tanque', 'heavy,shield,bleed'],
    ['Abominação das Profundezas', '🐙', 'berserker', 'multi,leech,poison,enrage'],
    ['Thalassor, Rei Afogado', '🔱', 'rei', 'heavy,stun,heal,leech,ult'],
    // Portão 8 — Cidadela Celestial
    ['Grifo Real', '🦅', 'feroz', 'multi,heavy,bleed'],
    ['Anjo Caído', '😇', 'conjurador', 'leech,weaken,ult'],
    ['Golem Celeste', '🗿', 'tanque', 'heavy,shield,stun'],
    ['Valquíria Traidora', '🛡️', 'berserker', 'multi,heavy,enrage'],
    ['Serafim Corrompido', '👼', 'conjurador', 'burn,heal,drain'],
    ['Arauto Dourado', '📯', 'equilibrado', 'stun,heavy,weaken'],
    ['Quimera Celeste', '🦁', 'berserker', 'burn,poison,bleed,multi'],
    ['Cavaleiro da Aurora', '🤺', 'tanque', 'heavy,shield,heal,ult'],
    ['Arcanjo Vingativo', '⚔️', 'feroz', 'ult,multi,enrage,stun'],
    ['Auriel, Imperatriz Celeste', '👑', 'rei', 'ult,heal,shield,weaken,stun'],
    // Portão 9 — Abismo Sem Fim
    ['Devorador de Luz', '🌑', 'conjurador', 'drain,weaken,leech'],
    ['Senhor dos Pesadelos', '😈', 'conjurador', 'stun,weaken,poison,drain'],
    ['Demónio de Mil Olhos', '👁️', 'equilibrado', 'multi,stun,weaken'],
    ['Ceifador do Abismo', '💀', 'feroz', 'ult,bleed,leech'],
    ['Behemoth Sombrio', '🦏', 'tanque', 'heavy,ult,shield,enrage'],
    ['Lich Imperial', '☠️', 'conjurador', 'freeze,drain,heal,weaken'],
    ['Dragão Ósseo', '🦴', 'berserker', 'multi,poison,ult'],
    ['Belzar, Arquidemónio', '👿', 'berserker', 'burn,leech,enrage,ult'],
    ['Avatar do Caos', '🌀', 'conjurador', 'burn,freeze,poison,stun,drain'],
    ['Nyxaroth, Príncipe do Abismo', '🖤', 'rei', 'leech,weaken,ult,shield,enrage,stun'],
    // Portão 10 — Trono do Vazio
    ['Guardião do Vazio', '🛡️', 'tanque', 'heavy,shield,ult,stun'],
    ['Titã do Tempo', '⌛', 'equilibrado', 'stun,heavy,heal,ult'],
    ['Dragão Primordial', '🐉', 'berserker', 'burn,multi,enrage,ult'],
    ['Espelho Sombrio', '🪞', 'equilibrado', 'strike,heavy,multi,leech'],
    ['Destruidor de Estrelas', '💫', 'feroz', 'ult,apocalypse,multi'],
    ['Arquiteto dos Portões', '🏛️', 'conjurador', 'weaken,drain,shield,ult,stun'],
    ['Deus Esquecido', '🗿', 'tanque', 'heal,shield,ult,heavy'],
    ['Serpente do Mundo', '🐍', 'berserker', 'poison,multi,leech,ult,enrage'],
    ['Eco do Primeiro Caçador', '👤', 'feroz', 'multi,bleed,stun,ult,apocalypse'],
    ['O Soberano do Vazio', '🌌', 'rei', 'apocalypse,ult,leech,weaken,shield,stun,enrage']
  ];

  var KING_LORE = {
    10: 'O lobo que governa a floresta. O seu uivo faz tremer as árvores.',
    20: 'Do seu trono de cristal, transforma intrusos em estátuas brilhantes.',
    30: 'Onde ela passa, nada volta a crescer.',
    40: 'Um imperador que se recusou a morrer quando o sol se pôs.',
    50: 'O inverno nunca acaba enquanto ela respirar.',
    60: 'O vulcão desperta sempre que ele abre os olhos.',
    70: 'Uma cidade inteira afundou para ele reinar sozinho.',
    80: 'Caiu dos céus por vontade própria — e trouxe a guerra.',
    90: 'Herdeiro do abismo. Nem a luz escapa dele.',
    100: 'O último. O primeiro. O fim do Sistema — ou o seu verdadeiro começo.'
  };

  S.BOSSES = [];
  RAW.forEach(function (r, i) {
    var lvl = i + 1;
    var gate = Math.floor(i / 10) + 1;
    var king = lvl % 10 === 0;
    var b = {
      id: 'b' + lvl, level: lvl, gate: gate, name: r[0], icon: r[1], arch: r[2],
      skills: r[3].split(','), king: king,
      lore: KING_LORE[lvl] || null,
      special: lvl === 94 ? 'mirror' : (lvl === 100 ? 'final' : null)
    };
    S.BOSSES.push(b);
  });

  /* A Última Arena: só aparece depois de vencidos todos os chefes dos portões e todas as arenas do Coliseu.
     O Sistema na sua forma suprema e, no fim, o seu criador. (Os ids antigos ficam: secret_1 e secret_2) */
  S.SECRET_BOSSES = [
    { id: 'secret_1', level: 110, gate: 0, name: 'O Sistema, Forma Suprema', icon: '👁️', arch: 'rei',
      skills: ['apocalypse', 'ult', 'stun', 'weaken', 'shield', 'heal', 'enrage'], king: true, secret: true, special: 'final',
      lore: 'A voz que te deu todas as ordens, sem as regras que a prendiam. Antes do criador, a criação.', unlock: 'final',
      form2: { name: 'O Sistema, Núcleo Exposto', icon: '🔴', say: 'Primeira forma: apagada. Não te alegres. O que estava por trás das janelas era isto.' },
      phaseLines: { 2: 'As janelas partem-se. Por trás delas não há nada para te proteger. Nunca houve.', 3: 'Núcleo exposto. Registo de dano: 3,4%... 12%... continua. Continua, Jogador. Mostra-me até onde.' } },
    { id: 'secret_2', level: 120, gate: 0, name: 'Delcio Cunha, o Arquiteto', icon: '✒️', arch: 'rei',
      skills: ['apocalypse', 'ult', 'leech', 'weaken', 'shield', 'stun', 'enrage', 'heal'], king: true, secret: true, special: 'final',
      lore: 'O criador do Sistema. Nunca esteve nas sombras: esteve sempre presente.', unlock: 'system',
      form2: { name: 'Delcio Cunha, o Criador Desperto', icon: '✴️', say: 'Muito bem. Agora deixo de te mostrar o mundo. Vou reescrevê-lo à tua frente.' },
      phaseLines: { 2: 'Vou reescrever o chão que pisas. Não leves a mal: é a única coisa que sei fazer.', 3: 'Os meus olhos já não guardam nada. Olha bem. É isto que um criador vê quando a obra lhe responde.' } }
  ];

  S.BOSS_BY_ID = {};
  S.BOSSES.concat(S.SECRET_BOSSES).forEach(function (b) { S.BOSS_BY_ID[b.id] = b; });

  /* Drops especiais garantidos de certos chefes */
  S.BOSS_SPECIAL_DROPS = {
    b10: { items: ['bau_epico'], skill: 's1' },
    b20: { items: ['sx_fragmento'] },
    b30: { items: ['bau_epico', 'sx_fenix'] },
    b40: { items: ['sx_fragmento', 'sx_mapa'] },
    b50: { items: ['bau_lendario'], skill: 's2' },
    b60: { items: ['sx_fragmento', 'sx_ampulheta'] },
    b70: { items: ['bau_lendario', 'sx_moeda'] },
    b80: { items: ['sx_fragmento', 'sx_coracao'] },
    b90: { items: ['bau_lendario', 'bau_secreto'] },
    b100: { items: ['sx_fragmento', 'bau_secreto', 'ar_soberano'], skill: 's9' },
    secret_1: { items: ['sx_coroa', 'bau_secreto'] },
    secret_2: { items: ['sx_lamina', 'bau_secreto', 'bau_secreto'] }
  };
})(globalThis.SYS = globalThis.SYS || {});
