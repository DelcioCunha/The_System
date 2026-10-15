/* ==========================================================
   DADOS BASE: atributos, classes, níveis, títulos, dificuldades
   ========================================================== */
(function (S) {
  'use strict';

  S.VERSION = '1.0.0';
  S.SAVE_SCHEMA = 1;
  S.MAX_LEVEL = 100;
  S.POINTS_PER_LEVEL = 3;

  S.STATS = ['str', 'agi', 'vit', 'int', 'per'];
  S.STAT_INFO = {
    str: { name: 'Força', short: 'FOR', icon: '💪', desc: 'Aumenta o dano físico.' },
    agi: { name: 'Agilidade', short: 'AGI', icon: '⚡', desc: 'Aumenta crítico e esquiva.' },
    vit: { name: 'Vitalidade', short: 'VIT', icon: '❤️', desc: 'Aumenta vida e defesa.' },
    int: { name: 'Inteligência', short: 'INT', icon: '🧠', desc: 'Aumenta dano mágico e mana.' },
    per: { name: 'Percepção', short: 'PER', icon: '👁️', desc: 'Aumenta crítico, precisão e sorte nos baús.' }
  };

  /* growth = atributos que sobem sozinhos a cada nível (+1 cada) */
  S.CLASSES = {
    guerreiro: {
      id: 'guerreiro', name: 'Guerreiro', icon: '⚔️', color: '#ff6b4a',
      desc: 'Mestre do combate corpo a corpo. Muita força e resistência.',
      base: { str: 12, agi: 8, vit: 11, int: 4, per: 6 }, growth: ['str', 'vit'], main: 'phys',
      atkScale: { str: 2.4 }, matkScale: { int: 2.0 }
    },
    assassino: {
      id: 'assassino', name: 'Assassino', icon: '🗡️', color: '#b56cff',
      desc: 'Rápido e letal. Críticos devastadores e venenos.',
      base: { str: 8, agi: 13, vit: 7, int: 5, per: 10 }, growth: ['agi', 'per'], main: 'phys',
      hpMult: 1.16, atkScale: { str: 1.25, agi: 1.55 }, matkScale: { int: 2.0 }
    },
    mago: {
      id: 'mago', name: 'Mago', icon: '🔮', color: '#4ab8ff',
      desc: 'Domina a magia arcana. Dano mágico enorme, pouca defesa.',
      base: { str: 4, agi: 6, vit: 7, int: 14, per: 9 }, growth: ['int', 'per'], main: 'mag',
      hpMult: 1.18, atkScale: { str: 2.0 }, matkScale: { int: 2.4 }
    },
    guardiao: {
      id: 'guardiao', name: 'Guardião', icon: '🛡️', color: '#ffd24a',
      desc: 'Uma muralha viva. Aguenta tudo e devolve o dano.',
      base: { str: 9, agi: 5, vit: 15, int: 5, per: 6 }, growth: ['vit', 'str'], main: 'phys',
      atkScale: { str: 1.4, vit: 2.0 }, matkScale: { int: 2.0 }
    },
    arqueiro: {
      id: 'arqueiro', name: 'Arqueiro', icon: '🏹', color: '#5be08a',
      desc: 'Precisão mortal à distância. Críticos e chuvas de flechas.',
      base: { str: 7, agi: 11, vit: 8, int: 6, per: 13 }, growth: ['per', 'agi'], main: 'phys',
      hpMult: 1.22, atkScale: { str: 1.05, per: 1.5, agi: 0.5 }, matkScale: { int: 2.0 }
    },
    invocador: {
      id: 'invocador', name: 'Invocador', icon: '💀', color: '#7a5cff',
      desc: 'Chama espíritos para lutar ao seu lado e drena a vida dos inimigos.',
      base: { str: 5, agi: 7, vit: 8, int: 12, per: 10 }, growth: ['int', 'vit'], main: 'mag',
      atkScale: { str: 2.0 }, matkScale: { int: 2.2 }
    }
  };
  S.CLASS_ORDER = ['guerreiro', 'assassino', 'mago', 'guardiao', 'arqueiro', 'invocador'];

  /* XP necessário para passar do nível L para L+1 */
  S.xpToNext = function (L) {
    if (L >= S.MAX_LEVEL) return 0;
    return Math.round(50 + 25 * L + 1.5 * L * L);
  };
  S.totalXpForLevel = function (L) {
    var t = 0;
    for (var i = 1; i < L; i++) t += S.xpToNext(i);
    return t;
  };

  /* Multiplicador de recompensas consoante o nível */
  S.levelMult = function (L) { return 1 + 0.03 * (L - 1); };

  S.RANKS = [
    { min: 1, rank: 'E', color: '#9aa4b2' },
    { min: 11, rank: 'D', color: '#5be08a' },
    { min: 21, rank: 'C', color: '#4ab8ff' },
    { min: 36, rank: 'B', color: '#b56cff' },
    { min: 51, rank: 'A', color: '#ffd24a' },
    { min: 66, rank: 'S', color: '#ff6b4a' },
    { min: 81, rank: 'SS', color: '#ff3d7f' },
    { min: 91, rank: 'SSS', color: '#e0e6ff' },
    { min: 100, rank: 'Ω', color: '#ffffff' }
  ];
  S.rankFor = function (L) {
    var r = S.RANKS[0];
    for (var i = 0; i < S.RANKS.length; i++) if (L >= S.RANKS[i].min) r = S.RANKS[i];
    return r;
  };

  S.TITLES = [
    'Despertado', 'Recruta do Sistema', 'Aprendiz Persistente', 'Caçador Iniciante', 'Explorador de Portões',
    'Batedor Novato', 'Sobrevivente', 'Combatente Determinado', 'Caçador de Rank E', 'Desafiante do Primeiro Portão',
    'Lâmina Afiada', 'Caçador de Rank D', 'Rastreador de Masmorras', 'Quebra-Correntes', 'Escudo de Ferro',
    'Veterano de Batalha', 'Caçador Implacável', 'Sentinela do Portão', 'Domador de Feras', 'Conquistador de Rank D',
    'Caçador de Rank C', 'Guerreiro Ascendente', 'Mestre da Disciplina', 'Olho da Tempestade', 'Lobo Solitário',
    'Destruidor de Hordas', 'Portador da Chama', 'Vingador do Crepúsculo', 'Caçador de Elite', 'Senhor das Masmorras Menores',
    'Arauto do Despertar', 'Lâmina Rubra', 'Punho de Aço', 'Coração Inabalável', 'Campeão de Rank C',
    'Caçador de Rank B', 'Cavaleiro do Abismo', 'Exterminador de Portões', 'Guardião da Muralha', 'Mestre de Armas',
    'Vulto Veloz', 'Furacão de Aço', 'Mente Afiada', 'Predador Supremo', 'Comandante de Raide',
    'Rompedor de Selos', 'Tempestade Viva', 'Ceifador de Monstros', 'Lenda Emergente', 'Herói de Rank B',
    'Caçador de Rank A', 'Executor Carmesim', 'Senhor da Guerra', 'Espírito Indomável', 'Titã Desperto',
    'Arcanista Supremo', 'Lâmina do Eclipse', 'Flagelo das Masmorras', 'Guardião dos Portões Vermelhos', 'Ás da Associação',
    'Conquistador de Reinos', 'Vulto da Meia-Noite', 'Fúria Encarnada', 'Pilar da Humanidade', 'Herói Nacional',
    'Caçador de Rank S', 'Senhor das Tempestades', 'Devorador de Chefes', 'Arquiteto da Destruição', 'Cavaleiro Celestial',
    'Mestre do Abismo', 'Coroa de Ferro', 'Imperador das Lâminas', 'Juiz dos Monstros', 'Lenda Viva',
    'Portador do Destino', 'Destruidor de Mundos', 'Avatar da Guerra', 'Vulto Primordial', 'Imperador de Rank S',
    'Caçador de Rank SS', 'Senhor dos Portões', 'Ceifeiro Eterno', 'Tirano das Masmorras', 'Guardião do Equilíbrio',
    'Semideus Desperto', 'Chama Imortal', 'Rei sem Coroa', 'Deus da Guerra', 'Entidade Transcendente',
    'Lenda Transcendente', 'Senhor do Vazio', 'Quebra-Destinos', 'Arauto do Fim', 'Titã Celestial',
    'Soberano do Abismo', 'Rei dos Reis', 'Deus Desperto', 'Além do Sistema', 'O Absoluto'
  ];
  S.titleFor = function (L) { return S.TITLES[Math.max(1, Math.min(100, L)) - 1]; };

  /* Dificuldade das missões: XP, moedas e treino de atributo (por atributo escolhido) */
  S.DIFFICULTY = {
    E: { id: 'E', name: 'Fácil', xp: 15, coins: 5, stat: 0.10, color: '#9aa4b2' },
    D: { id: 'D', name: 'Simples', xp: 30, coins: 10, stat: 0.20, color: '#5be08a' },
    C: { id: 'C', name: 'Normal', xp: 55, coins: 20, stat: 0.30, color: '#4ab8ff' },
    B: { id: 'B', name: 'Difícil', xp: 90, coins: 35, stat: 0.50, color: '#b56cff' },
    A: { id: 'A', name: 'Muito difícil', xp: 140, coins: 55, stat: 0.75, color: '#ffd24a' },
    S: { id: 'S', name: 'Extrema', xp: 220, coins: 90, stat: 1.00, color: '#ff6b4a' }
  };
  S.DIFF_ORDER = ['E', 'D', 'C', 'B', 'A', 'S'];
  S.MISSION_FAIL_COIN_PCT = 0.5;  // perde 50% das moedas que ganharia
  S.MISSION_FAIL_XP_PCT = 0.3;    // perde 30% do XP que ganharia (nunca desce de nível)

  S.RARITY = {
    comum: { name: 'Comum', color: '#9aa4b2', order: 0 },
    incomum: { name: 'Incomum', color: '#5be08a', order: 1 },
    raro: { name: 'Raro', color: '#4ab8ff', order: 2 },
    epico: { name: 'Épico', color: '#b56cff', order: 3 },
    lendario: { name: 'Lendário', color: '#ffb02e', order: 4 },
    mitico: { name: 'Mítico', color: '#ff3d7f', order: 5 },
    secreto: { name: 'Secreto', color: '#e0e6ff', order: 6 }
  };

  /* Efeitos temporários fora de combate (tempo real) */
  S.TIMED_EFFECTS = {
    xp2: { name: 'XP em dobro', icon: '📜', good: true },
    xp15: { name: 'XP +50%', icon: '🕯️', good: true },
    sorte: { name: 'Sorte nos baús', icon: '🍀', good: true },
    coin2: { name: 'Moedas em dobro', icon: '💰', good: true },
    exausto: { name: 'Exausto (-20% XP)', icon: '😵', good: false }
  };
})(globalThis.SYS = globalThis.SYS || {});
