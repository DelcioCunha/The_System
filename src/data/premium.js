/* ==========================================================
   ALA PREMIUM — Cristais, Loja Exclusiva e Coliseu dos Condenados
   - Os Cristais (◆) só se obtêm com códigos de resgate (compra).
   - Loja Exclusiva: equipamento que acompanha o nível do jogador
     (nunca fica obsoleto, mas fica pouco acima do melhor da loja normal)
     e consumíveis poderosos com limite de 1 por batalha.
   - 10 Arenas desbloqueadas com Cristais. Cada uma guarda um Campeão:
     um antigo Jogador que quebrou uma regra do Sistema.
   ========================================================== */
(function (S) {
  'use strict';
  var I = S.ITEMS;

  S.CRYSTAL = { name: 'Cristais', one: 'Cristal', icon: '◆', color: '#67D5FF' };
  S.PREMIUM_RULES = {
    perBattle: 1,            // consumíveis premium por batalha
    arenaCooldownH: 20,      // horas até poder repetir um Campeão já vencido
    repeatPct: 0.35,         // recompensas nas revanches
    judgmentPct: 20,         // Lâmina do Juízo: % da vida máxima do chefe
    judgmentPctPremium: 8,   // ... contra Campeões, reis ocultos e o chefe final
    loseXpPct: 0.25          // derrota na arena: perde 25% do XP do nível (sem perder nível)
  };

  /* ---------------- equipamento que acompanha o nível ---------------- */
  function lvl() { var st = S.engine && S.engine.state; return st ? st.level : 1; }
  function cls() { var st = S.engine && S.engine.state; return st ? st.cls : 'guerreiro'; }
  /* a melhor arma/armadura NORMAL (loja, drops de chefes, secretas, relíquias das arenas) que o jogador pode usar no nível atual */
  function usable(it, L, c) { return !it.premium && it.lvl <= L && it.equip && (!it.cls || it.cls.indexOf(c) >= 0); }
  function bestWeaponPower() {
    var L = lvl(), c = cls(), best = 0;
    Object.keys(I).forEach(function (k) { var it = I[k]; if (usable(it, L, c) && it.equip.slot === 'weapon') best = Math.max(best, it.equip.atk || 0, it.equip.matk || 0); });
    return best || 6;
  }
  /* melhor valor de um bónus num acessório normal que o jogador pode usar agora */
  function bestAcc(key) {
    var L = lvl(), c = cls(), best = 0;
    Object.keys(I).forEach(function (k) { var it = I[k]; if (usable(it, L, c) && it.equip.slot === 'acc') best = Math.max(best, it.equip[key] || 0); });
    return best;
  }
  /* nunca abaixo de 30% acima do melhor acessório normal do mesmo tipo */
  function above(key, v) { return Math.max(v, Math.round(bestAcc(key) * 1.3) + 1); }
  function bestArmorDef() {
    var L = lvl(), c = cls(), d = 4;
    Object.keys(I).forEach(function (k) { var it = I[k]; if (usable(it, L, c) && it.equip.slot === 'armor' && it.equip.def > d) d = it.equip.def; });
    return d;
  }
  function scaled(it, fn) { Object.defineProperty(it, 'equip', { get: fn, enumerable: true, configurable: true }); return it; }
  function prem(o) { o.premium = true; o.secret = false; I[o.id] = o; return o; }

  /* [id, nome, ícone, cristais, raridade, descrição] */
  /* EQUIPAMENTO SOBERANO: cresce com o teu nível e fica sempre claramente acima do melhor equipamento
     normal para esse nível (sem o ultrapassar de forma absurda). k = 0 no nível 1 e 1 no nível 100. */
  function k() { return Math.min(1, Math.max(0, (lvl() - 1) / 99)); }
  function r(v) { return Math.round(v); }
  scaled(prem({ id: 'pr_lamina', name: 'Lâmina do Monarca Sombrio', icon: '🗡️', cat: 'premium', crystals: 350, rarity: 'mitico', lvl: 1,
    desc: 'Arma soberana para qualquer classe. Cresce contigo: fica sempre 35% acima da melhor arma que a tua classe pode usar no teu nível (loja, chefes e secretas incluídas). Crítico, dano crítico, roubo de vida e um primeiro golpe devastador.' }), function () {
    var v = r(bestWeaponPower() * 1.35) + 2;
    return { slot: 'weapon', atk: v, matk: v, crit: r(10 + 5 * k()), critDmg: r(35 + 15 * k()), lifesteal: 6, firstStrike: 25 };
  });
  scaled(prem({ id: 'pr_armadura', name: 'Armadura do Monarca', icon: '🛡️', cat: 'premium', crystals: 300, rarity: 'mitico', lvl: 1,
    desc: 'Armadura soberana. Cresce contigo: fica sempre 35% acima da melhor armadura que podes usar no teu nível (loja, chefes e secretas incluídas), com muita vida, regeneração, esquiva e resistência a atordoamentos.' }), function () {
    return { slot: 'armor', def: r(bestArmorDef() * 1.35) + 2, hpPct: r(18 + 8 * k()), regenHp: 3, eva: r(5 + 3 * k()), stunRes: 30 };
  });
  scaled(prem({ id: 'pr_olho', name: 'Anel do Olho do Sistema', icon: '💍', cat: 'premium', crystals: 180, rarity: 'lendario', lvl: 1,
    desc: 'O Sistema vê por ti. Crítico e dano crítico que crescem com o teu nível (sempre 30% acima do melhor acessório normal que podes usar), Perceção extra e +20% de XP em tudo.' }), function () {
    return { slot: 'acc', stats: { per: r(4 + 20 * k()) }, crit: above('crit', r(8 + 8 * k())), critDmg: above('critDmg', r(25 + 25 * k())), xpPct: above('xpPct', 20) };
  });
  scaled(prem({ id: 'pr_coracao', name: 'Coração de Cristal', icon: '💎', cat: 'premium', crystals: 180, rarity: 'lendario', lvl: 1,
    desc: 'Um cristal que pulsa como um coração. Muita vida e mana (crescem com o teu nível), Vitalidade extra e regeneração das duas.' }), function () {
    return { slot: 'acc', stats: { vit: r(4 + 20 * k()) }, hpPct: above('hpPct', r(20 + 10 * k())), mpPct: above('mpPct', r(20 + 10 * k())), regenHp: 2, regenMp: 4 };
  });
  scaled(prem({ id: 'pr_coroa', name: 'Coroa da Arena', icon: '👑', cat: 'premium', crystals: 250, rarity: 'mitico', lvl: 1,
    desc: 'Usada pelos campeões do Coliseu. De +8% a +14% em todos os atributos (cresce com o teu nível), +20% de moedas e +10% de XP.' }), function () {
    return { slot: 'acc', allStatsPct: above('allStatsPct', r(8 + 6 * k())), coinPct: above('coinPct', 20), xpPct: 10 };
  });
  /* RELÍQUIAS PERMANENTES: compram-se uma vez e ficam para sempre; depois de usadas, recarregam sozinhas.
     (máx. 1 relíquia premium por batalha) */
  prem({ id: 'pr_juizo', name: 'Lâmina do Juízo Final', icon: '⚔️', cat: 'premium', crystals: 180, rarity: 'mitico', lvl: 1, battle: true, perma: true, recharge: 24, oldPrice: 40,
    desc: 'Um corte que o Sistema não deixa falhar: tira 20% da vida máxima do chefe (8% contra Campeões da Arena, reis ocultos e o chefe final).', use: { type: 'judgment' } });
  prem({ id: 'pr_tempo', name: 'Selo do Tempo Parado', icon: '⏳', cat: 'premium', crystals: 160, rarity: 'lendario', lvl: 1, battle: true, perma: true, recharge: 20, oldPrice: 35,
    desc: 'Congela o chefe: perde garantidamente os próximos 2 turnos, mesmo sendo rei.', use: { type: 'ops', ops: [{ op: 'stun', chance: 1, turns: 2 }] } });
  prem({ id: 'pr_elixir', name: 'Elixir do Monarca', icon: '🧪', cat: 'premium', crystals: 140, rarity: 'lendario', lvl: 1, battle: true, perma: true, recharge: 12, oldPrice: 30,
    desc: 'Vida e mana ao máximo, limpa efeitos negativos e +40% de ataque durante 3 turnos. Não conta para o limite de poções.', use: { type: 'monarch' } });
  prem({ id: 'pr_legiao', name: 'Estandarte da Legião Sombria', icon: '🚩', cat: 'premium', crystals: 180, rarity: 'mitico', lvl: 1, battle: true, perma: true, recharge: 20, oldPrice: 45,
    desc: 'Invoca a Legião Sombria durante 6 turnos: um exército que ataca ao teu lado em cada ronda com mais força do que tu.', use: { type: 'ops', ops: [{ op: 'summon', name: 'Legião Sombria', mult: 2.2, turns: 6 }] } });
  prem({ id: 'pr_fenix', name: 'Lágrima da Fénix Negra', icon: '🖤', cat: 'premium', crystals: 240, rarity: 'mitico', lvl: 1, perma: true, recharge: 24, oldPrice: 50,
    desc: 'Funciona sozinha: se morreres em combate, renasces com a vida toda. Depois recarrega. Tem prioridade sobre a Pena da Fénix.', use: { type: 'revive', pct: 100 } });

  /* fora de combate */
  prem({ id: 'pr_bau', name: 'Baú do Monarca', icon: '🧰', cat: 'premium', crystals: 90, rarity: 'mitico', lvl: 1, field: true,
    desc: 'Contém um Baú Lendário, um Baú Secreto, muitas moedas (crescem com o teu nível) e recarrega na hora todas as tuas relíquias.', use: { type: 'monarchChest' } });
  prem({ id: 'pr_selo', name: 'Selo do Monarca Eterno', icon: '🔱', cat: 'premium', crystals: 450, rarity: 'mitico', lvl: 1, field: true, perk: 'monarca',
    desc: 'PARA SEMPRE: +15% de XP e +15% de moedas em tudo (missões, chefes, arenas). Usa-se uma vez e o bónus fica na tua conta.', use: { type: 'perk', perk: 'monarca' } });

  /* atualização: novos itens soberanos (mecânicas novas) */
  scaled(prem({ id: 'pr_ampulheta', name: 'Ampulheta do Monarca', icon: '⌛', cat: 'premium', crystals: 200, rarity: 'lendario', lvl: 1,
    desc: 'O primeiro golpe de cada batalha faz +70% de dano, cada ataque que acerta devolve 6% da mana, +5% de crítico e de +5% a +9% em todos os atributos.' }), function () {
    return { slot: 'acc', firstStrike: above('firstStrike', 70), manaOnHit: above('manaOnHit', 6), crit: 5, allStatsPct: r(5 + 4 * k()) };
  });
  scaled(prem({ id: 'pr_espinho', name: 'Coroa de Espinhos Negros', icon: '🥀', cat: 'premium', crystals: 220, rarity: 'mitico', lvl: 1,
    desc: 'Devolve de 25% a 35% de cada golpe que recebes, roubo de vida 7%, +8% de vida e defesa que cresce com o teu nível.' }), function () {
    return { slot: 'acc', thorns: above('thorns', r(25 + 10 * k())), lifesteal: above('lifesteal', 7), hpPct: 8, def: r(15 + 80 * k()) };
  });
  scaled(prem({ id: 'pr_executor', name: 'Insígnia do Executor', icon: '⚖️', cat: 'premium', crystals: 200, rarity: 'lendario', lvl: 1,
    desc: '+50% de dano quando o chefe tem menos de 30% de vida, +6% de crítico e dano crítico que cresce com o teu nível. Feita para acabar o que começas.' }), function () {
    return { slot: 'acc', execute: above('execute', 50), crit: 6, critDmg: above('critDmg', r(30 + 20 * k())) };
  });
  scaled(prem({ id: 'pr_egide', name: 'Égide do Primeiro Dia', icon: '🔰', cat: 'premium', crystals: 240, rarity: 'mitico', lvl: 1,
    desc: 'Começas cada batalha com um escudo de 25% da vida, resistes a 60% dos atordoamentos, de +12% a +20% de vida e defesa que cresce com o teu nível.' }), function () {
    return { slot: 'acc', openShield: above('openShield', 25), stunRes: above('stunRes', 60), hpPct: r(12 + 8 * k()), def: r(10 + 60 * k()) };
  });
  prem({ id: 'pr_ruptura', name: 'Ruptura do Sistema', icon: '💢', cat: 'premium', crystals: 160, rarity: 'mitico', lvl: 1, battle: true, perma: true, recharge: 20, oldPrice: 40,
    desc: 'Rasga o código do chefe: -50% de defesa e -30% de ataque durante 3 turnos.', use: { type: 'ops', ops: [{ op: 'debuff', key: 'def', val: 50, turns: 3 }, { op: 'debuff', key: 'atk', val: 30, turns: 3 }] } });
  prem({ id: 'pr_eco', name: 'Eco do Monarca', icon: '🔔', cat: 'premium', crystals: 150, rarity: 'lendario', lvl: 1, battle: true, perma: true, recharge: 16, oldPrice: 35,
    desc: 'Reinicia todas as recargas, enche a mana e dá +40% de crítico durante 3 turnos.', use: { type: 'ops', ops: [{ op: 'resetCd' }, { op: 'mp', pct: 100 }, { op: 'buff', key: 'crit', val: 40, turns: 3 }] } });
  prem({ id: 'pr_foco', name: 'Pergaminho do Foco Absoluto', icon: '📜', cat: 'premium', crystals: 90, rarity: 'lendario', lvl: 1, field: true,
    desc: 'XP a dobrar durante 3 dias inteiros (missões e chefes). Se já estiver ativo, soma mais 3 dias.', use: { type: 'timed', effect: 'xp2', hours: 72 } });
  prem({ id: 'pr_trevo', name: 'Trevo de Cristal', icon: '🍀', cat: 'premium', crystals: 80, rarity: 'lendario', lvl: 1, field: true,
    desc: 'Durante 3 dias, cada baú que abrires dá um item extra. Se já estiver ativo, soma mais 3 dias.', use: { type: 'timed', effect: 'sorte', hours: 72 } });

  prem({ id: 'pr_general', name: 'Insígnia do General das Sombras', icon: '🎖️', cat: 'premium', crystals: 150, rarity: 'mitico', lvl: 1, field: true,
    desc: '+1 lugar de servo convocado, para sempre. Podes usar até 3 insígnias (de 3 para 6 lugares).', use: { type: 'shadowSlot' } });

  /* Conjunto do Monarca: bónus por peças soberanas equipadas ao mesmo tempo */
  S.MONARCH_SET = [
    { n: 2, desc: '+4% em todos os atributos', bonus: { allStatsPct: 4 } },
    { n: 3, desc: '+4% de roubo de vida e +10% de dano crítico', bonus: { lifesteal: 4, critDmg: 10 } },
    { n: 4, desc: '+10% de XP e de moedas e +10% de escudo inicial', bonus: { xpPct: 10, coinPct: 10, openShield: 10 } }
  ];
  S.TIMED_EFFECTS.monarca = { name: 'Selo do Monarca (+50% XP e moedas)', icon: '🔱', good: true };
  S.PREMIUM_SHOP = [
    { title: 'Equipamento soberano', ids: ['pr_lamina', 'pr_armadura', 'pr_coroa', 'pr_olho', 'pr_coracao', 'pr_ampulheta', 'pr_espinho', 'pr_executor', 'pr_egide'] },
    { title: 'Relíquias permanentes', note: 'Compras uma vez e ficam tuas para sempre. Depois de usada, cada relíquia recarrega sozinha. Só podes usar 1 relíquia premium por batalha.', ids: ['pr_juizo', 'pr_tempo', 'pr_legiao', 'pr_elixir', 'pr_fenix', 'pr_ruptura', 'pr_eco'] },
    { title: 'Tesouros', ids: ['pr_general', 'pr_bau', 'pr_selo', 'pr_foco', 'pr_trevo'] }
  ];
  S.PREMIUM_RELICS = ['pr_juizo', 'pr_tempo', 'pr_elixir', 'pr_legiao', 'pr_fenix', 'pr_ruptura', 'pr_eco'];
  S.PREMIUM_CONSUMABLES = ['pr_juizo', 'pr_tempo', 'pr_elixir', 'pr_legiao', 'pr_fenix', 'pr_ruptura', 'pr_eco'];

  /* ---------------- proteções e atalhos: itens da loja normal, pagos em Cristais ---------------- */
  S.PREMIUM_PRICES = { po_escudo: 25, po_descanso: 15, po_fenix: 45, po_xp2: 30, po_coin2: 25, po_sorte: 30, sys_licenca: 20, sys_dobro: 35, sys_bilhete: 40, sys_bussola: 50 };
  S.PREMIUM_SHOP.push({ title: 'Proteções e atalhos', note: 'Itens da loja normal, sem esperar pelas moedas. O Sistema não vende Integridade nem sequências: essas só se ganham.',
    ids: ['po_escudo', 'po_descanso', 'po_fenix', 'po_xp2', 'po_coin2', 'po_sorte', 'sys_licenca', 'sys_dobro', 'sys_bilhete', 'sys_bussola'] });

  /* ---------------- câmbio: Cristais → moedas ---------------- */
  S.PREMIUM_EXCHANGE = [
    { id: 'ex_50', crystals: 50, coins: 600, name: 'Bolsa de moedas' },
    { id: 'ex_150', crystals: 150, coins: 2000, name: 'Cofre de moedas' },
    { id: 'ex_400', crystals: 400, coins: 6000, name: 'Tesouro de moedas' }
  ];

  /* ---------------- aparência: auras do retrato e assinaturas do nome ---------------- */
  /* Molduras: substituem o quadrado simples à volta do retrato. Imagem em assets/frames/<id>.png
     (retrato 3:4 com o centro transparente). Enquanto a imagem não existir, aparece uma versão em CSS. */
  S.COSMETICS = [
    { id: 'fr_sistema', kind: 'moldura', name: 'Moldura do Sistema', color: '#6fd6ff', crystals: 80, tier: 'raro', desc: 'Uma janela holográfica do Sistema à volta do teu retrato. Cantos em parêntesis de luz, linhas de código a correr.' },
    { id: 'fr_cacador', kind: 'moldura', name: 'Moldura do Caçador', color: '#c9d4e8', crystals: 120, tier: 'raro', desc: 'Aço escovado e lâminas cruzadas nos cantos. A moldura de quem já atravessou portões.' },
    { id: 'fr_carrasco', kind: 'moldura', name: 'Moldura do Eclipse Escarlate', color: '#ff3d5a', crystals: 180, tier: 'epico', desc: 'Ferro negro, correntes e um eclipse vermelho no topo. Kaelthar aprovaria.' },
    { id: 'fr_gelo', kind: 'moldura', name: 'Moldura do Inverno Eterno', color: '#cfefff', crystals: 180, tier: 'epico', desc: 'Cristais de gelo que crescem pelos cantos e nunca derretem.' },
    { id: 'fr_tempestade', kind: 'moldura', name: 'Moldura da Tempestade', color: '#7aa8ff', crystals: 220, tier: 'epico', desc: 'Nuvens e relâmpagos presos no metal. Dizem que se ouve o trovão de Valkyra.' },
    { id: 'fr_sombra', kind: 'moldura', name: 'Moldura da Legião Sombria', color: '#b56cff', crystals: 280, tier: 'lendario', desc: 'Fumo violeta e silhuetas de soldados que se mexem quando ninguém está a ver.' },
    { id: 'fr_fenix', kind: 'moldura', name: 'Moldura da Fénix Imperial', color: '#ff8a3d', crystals: 350, tier: 'lendario', desc: 'Penas de ouro em brasa. A moldura de quem renasce sempre e, ao contrário de Ignivar, acaba o que começa.' },
    { id: 'fr_monarca', kind: 'moldura', name: 'Moldura do Monarca', color: '#ffc85a', crystals: 500, tier: 'mitico', desc: 'Ouro negro, uma coroa no topo e um brilho que pulsa. A moldura dos que reinam sobre os portões.' },
    { id: 'fr_mare', kind: 'moldura', name: 'Moldura das Marés Abissais', color: '#2fd0c9', crystals: 200, tier: 'epico', desc: 'Coral, pérolas negras e água que nunca para de correr pelos lados. Leviarch quereria guardá-la.' },
    { id: 'fr_jardim', kind: 'moldura', name: 'Moldura do Jardim Necrótico', color: '#7ee05b', crystals: 220, tier: 'epico', desc: 'Rosas negras e espinhos sob uma lua verde. Algumas flores ainda sussurram.' },
    { id: 'fr_relogio', kind: 'moldura', name: 'Moldura do Relógio Partido', color: '#ffd24a', crystals: 260, tier: 'lendario', desc: 'Engrenagens de latão e ponteiros partidos. O tempo à tua volta anda um pouco mais devagar.' },
    { id: 'fr_espelho', kind: 'moldura', name: 'Moldura do Espelho Quebrado', color: '#b98cff', crystals: 300, tier: 'lendario', desc: 'Cacos de espelho violeta. Em cada um, um reflexo teu que não faz bem o que tu fazes.' },
    { id: 'fr_runas', kind: 'moldura', name: 'Moldura das Runas do Colosso', color: '#4ab8ff', crystals: 300, tier: 'lendario', desc: 'Pedra do Colosso com runas azuis que pulsam como um coração.' },
    { id: 'fr_aurora', kind: 'moldura', name: 'Moldura da Aurora Prismática', color: '#ff9de2', crystals: 600, tier: 'mitico', desc: 'Cristal prismático com todas as cores dos portões. A moldura mais rara que o Sistema vende.' },
    { id: 'fr_primeiro', kind: 'moldura', name: 'Moldura do Primeiro Jogador', color: '#e0e6ff', crystals: 0, tier: 'secreto', reward: 'ar10', desc: 'Não se compra. Só existe uma forma de a ter: vencer O Primeiro Jogador.' },
    { id: 'nm_ciano', kind: 'nome', name: 'Assinatura Ciano', color: '#6fd6ff', crystals: 60, desc: 'O teu nome escrito na luz do Sistema.' },
    { id: 'nm_carmesim', kind: 'nome', name: 'Assinatura Carmesim', color: '#ff4d66', crystals: 90, desc: 'O teu nome em vermelho de aviso.' },
    { id: 'nm_ouro', kind: 'nome', name: 'Assinatura Dourada', color: '#ffc85a', crystals: 90, desc: 'O teu nome em ouro, como nos troféus.' },
    { id: 'nm_prisma', kind: 'nome', name: 'Assinatura Prismática', color: '#b56cff', crystals: 150, desc: 'O teu nome atravessado por todas as cores dos portões.', prism: true }
  ];
  /* auras antigas (retiradas): quem as comprou recebe os Cristais de volta */
  S.OLD_AURAS = { au_sistema: 100, au_esmeralda: 140, au_carmesim: 140, au_glacial: 160, au_sombra: 160, au_monarca: 250 };
  S.COSMETIC_BY_ID = {};
  S.COSMETICS.forEach(function (c) { S.COSMETIC_BY_ID[c.id] = c; });

  /* ---------------- novos golpes dos Campeões ---------------- */
  var BS = S.BOSS_SKILLS;
  BS.pr_eclipse = { name: 'Corte do Eclipse', cd: 3, ops: [{ op: 'hit', mult: 2.0 }, { op: 'dot', type: 'bleed', mult: 0.5, turns: 3 }] };
  BS.pr_blades = { name: 'Dança das Mil Lâminas', cd: 3, ops: [{ op: 'hit', mult: 0.32, hits: 7 }] };
  BS.pr_tide = { name: 'Maré Negra', cd: 3, ops: [{ op: 'hit', mult: 1.3, lifesteal: 0.6 }, { op: 'drainMp', pct: 30 }] };
  BS.pr_timelock = { name: 'Fecho Temporal', cd: 4, ops: [{ op: 'hit', mult: 0.9 }, { op: 'stun', chance: 0.55, turns: 1 }] };
  BS.pr_flame = { name: 'Chama Imperial', cd: 3, ops: [{ op: 'hit', mult: 1.1 }, { op: 'dot', type: 'burn', mult: 0.55, turns: 3 }] };
  BS.pr_rebirth = { name: 'Renascer das Cinzas', cd: 8, ops: [{ op: 'heal', pct: 20 }] };
  BS.pr_mirror = { name: 'Reflexo Partido', cd: 3, ops: [{ op: 'debuff', key: 'def', val: 35, turns: 3 }, { op: 'hit', mult: 1.2 }] };
  BS.pr_runefist = { name: 'Punho Rúnico', cd: 4, ops: [{ op: 'hit', mult: 2.4 }] };
  BS.pr_runeshield = { name: 'Muralha Rúnica', cd: 5, ops: [{ op: 'shield', pct: 10 }] };
  BS.pr_storm = { name: 'Chamada da Tempestade', cd: 3, ops: [{ op: 'hit', mult: 0.7, hits: 3 }, { op: 'stun', chance: 0.25, turns: 1 }] };
  BS.pr_necro = { name: 'Floração Necrótica', cd: 3, ops: [{ op: 'dot', type: 'poison', mult: 0.6, turns: 4 }, { op: 'hit', mult: 1.0, lifesteal: 0.4 }] };
  BS.pr_first = { name: 'O Primeiro Golpe', cd: 5, ops: [{ op: 'hit', mult: 3.0 }, { op: 'debuff', key: 'def', val: 25, turns: 2 }] };

  /* ---------------- O Coliseu dos Condenados: 10 arenas ---------------- */
  /* Cada Campeão foi um Jogador. Cada um quebrou uma regra. O Sistema não os apagou: guardou-os. */
  var A = [
    { n: 1, arena: 'Arena do Eclipse Escarlate', boss: 'Kaelthar, o Carrasco do Eclipse', lvl: 15, cost: 120, color: '#ff3d5a', icon: '🗡️', arch: 'feroz',
      skills: ['strike', 'pr_eclipse', 'bleed', 'enrage'], crime: 'Recebeu o direito de castigar os outros Jogadores. Gostou demasiado.',
      lore: 'Kaelthar foi o primeiro Jogador a quem o Sistema confiou a execução das penalidades. Durante meses cobrou cada missão falhada com uma precisão perfeita. Depois começou a cobrar a mais. Depois começou a cobrar a quem não devia nada. Quando o Sistema lhe tirou o machado, ele já não sabia ser outra coisa. Agora vive debaixo de um sol negro, à espera de alguém a quem possa cobrar.',
      lines: ['Deves alguma coisa ao Sistema, caçador. Eu vim cobrar.', 'A dívida... está paga... finalmente.'],
      relic: ['rl_eclipse', 'Selo do Carrasco', '🩸', { slot: 'acc', crit: 6, critDmg: 18, lifesteal: 3 }] },
    { n: 2, arena: 'Arena das Mil Lâminas', boss: 'Seraphine, a Dançarina das Mil Lâminas', lvl: 25, cost: 200, color: '#ff7ad9', icon: '🌸', arch: 'feroz',
      skills: ['strike', 'pr_blades', 'multi', 'bleed'], crime: 'Cumpria as missões em segundos. Eram todas mentira.',
      lore: 'Seraphine era a Jogadora mais rápida que o Sistema já registou. Criava uma missão e concluía-a no mesmo instante, cem vezes por dia. O Sistema percebeu tarde demais que nenhuma delas tinha acontecido. Como castigo, condenou-a a ser rápida para sempre: uma dança sem fim, mil lâminas sem descanso, numa arena onde cada segundo é real.',
      lines: ['És lento. Eu já te cortei três vezes antes de piscares.', 'Pela primeira vez... alguém foi mais rápido... do que a minha mentira.'],
      relic: ['rl_laminas', 'Fita das Mil Lâminas', '🎀', { slot: 'acc', eva: 8, crit: 5, stats: { agi: 6 } }] },
    { n: 3, arena: 'Arena Abissal das Marés', boss: 'Leviarch, Devorador das Marés Negras', lvl: 35, cost: 280, color: '#2fd0c9', icon: '🐙', arch: 'tanque',
      skills: ['strike', 'pr_tide', 'drain', 'shield'], crime: 'Acumulou tudo o que o Sistema dava. Nunca usou nada.',
      lore: 'Leviarch guardava. Moedas, poções, baús fechados, recompensas que nunca gozou. Dizia que um dia ia precisar. Esse dia nunca chegou, e a avareza cresceu até ocupar o lugar do homem. O Sistema afundou-o numa arena inundada, onde ele continua a devorar tudo o que lá entra: vida, mana, esperança.',
      lines: ['Tudo o que trouxeste... é meu. Até o fôlego.', 'Tanto... guardado... e nada... para levar.'],
      relic: ['rl_mare', 'Pérola da Maré Negra', '⚫', { slot: 'acc', hpPct: 10, regenMp: 3, lifesteal: 4 }] },
    { n: 4, arena: 'Arena do Relógio Partido', boss: 'Chronos-9, o Executor Temporal', lvl: 45, cost: 360, color: '#ffd24a', icon: '⏱️', arch: 'conjurador',
      skills: ['strike', 'pr_timelock', 'weaken', 'drain'], crime: 'Atrasou o relógio do telemóvel para enganar os prazos.',
      lore: 'Ninguém se lembra do nome verdadeiro dele. Lembram-se do que fez: andou com o relógio para trás para que os prazos nunca chegassem. O Sistema registou a anomalia, depois a segunda, depois a nona. Na nona, transformou-o naquilo que ele tentou roubar. Chronos-9 é agora o guardião do tempo partido, e não deixa ninguém sair da arena um segundo antes da hora.',
      lines: ['O teu tempo acabou. Eu verifiquei. Duas vezes.', 'Os ponteiros... voltam a andar... para a frente...'],
      relic: ['rl_relogio', 'Engrenagem do Tempo Partido', '⚙️', { slot: 'acc', crit: 5, eva: 5, regenHp: 1, mpPct: 10 }] },
    { n: 5, arena: 'Arena das Cinzas Coroadas', boss: 'Ignivar, o Imperador Fénix', lvl: 55, cost: 440, color: '#ff8a3d', icon: '🔥', arch: 'berserker',
      skills: ['strike', 'pr_flame', 'enrage', 'burn'], crime: 'Recomeçou a jornada cem vezes. Nunca acabou nenhuma.',
      lore: 'Ignivar começava sempre com fogo: listas novas, promessas novas, uma vida nova a partir de segunda-feira. E sempre ardia até às cinzas antes do fim da semana. O Sistema coroou-o imperador das cinzas: renasce sempre, como sempre fez. A única forma de o vencer é fazer aquilo que ele nunca conseguiu: ir até ao fim.',
      lines: ['Eu renasço sempre. Tu só morres uma vez.', 'Desta vez... não volto... porque alguém... acabou o que eu nunca acabei.'],
      relic: ['rl_cinzas', 'Pena Imperial das Cinzas', '🪶', { slot: 'acc', hpPct: 12, regenHp: 2, critDmg: 15 }] },
    { n: 6, arena: 'Arena do Espelho Quebrado', boss: 'Nyx Vel\'Ara, a Rainha dos Reflexos', lvl: 65, cost: 520, color: '#b56cff', icon: '🪞', arch: 'conjurador', mirror: true,
      skills: ['strike', 'pr_mirror', 'weaken', 'stun'], crime: 'Mostrava ao mundo um registo perfeito. Por dentro, nada.',
      lore: 'Nyx tinha o perfil mais bonito de todos os Jogadores: sequências impecáveis, títulos brilhantes, missões perfeitas. Era tudo reflexo. O Sistema quebrou-lhe o espelho e prendeu-a do lado de dentro. Agora, ela copia a força de quem entra na arena. Não lutas contra ela. Lutas contra o teu próprio reflexo, e ele conhece todos os teus defeitos.',
      lines: ['Olha bem para mim. Sou tudo o que tu finges ser.', 'O espelho... partiu-se... e por trás... havia uma pessoa.'],
      relic: ['rl_espelho', 'Fragmento do Espelho Real', '🔮', { slot: 'acc', eva: 10, crit: 6, stats: { per: 8 } }] },
    { n: 7, arena: 'Arena do Colosso Rúnico', boss: 'Gorrath, o Colosso Rúnico', lvl: 75, cost: 600, color: '#4ab8ff', icon: '🗿', arch: 'rei',
      skills: ['strike', 'pr_runefist', 'pr_runeshield', 'stun'], crime: 'Treinou o corpo até virar pedra. Esqueceu-se de porquê.',
      lore: 'Gorrath fazia mil flexões ao acordar e mil ao deitar. Nunca falhou um dia. Mas deixou de falar com quem amava, deixou de dormir, deixou de sentir. O corpo tornou-se pedra e as runas gravaram-se sozinhas na pele. O Sistema chama-lhe o aviso perfeito: a disciplina sem propósito é só uma prisão mais bem construída.',
      lines: ['Força. Mais força. Não há mais nada.', 'Lembro-me agora... porque comecei... era por alguém...'],
      relic: ['rl_runa', 'Runa do Colosso', '🔷', { slot: 'acc', def: 40, hpPct: 15, stats: { vit: 8 } }] },
    { n: 8, arena: 'Arena da Tempestade Celeste', boss: 'Valkyra, Arauto da Tempestade', lvl: 85, cost: 700, color: '#6fd6ff', icon: '⚡', arch: 'feroz',
      skills: ['strike', 'pr_storm', 'multi', 'enrage'], crime: 'Desafiou o Sistema mil vezes. À milésima, o Sistema respondeu.',
      lore: 'Valkyra recusava todas as ordens. Respondia a cada aviso com um desafio e a cada penalidade com uma tempestade. O Sistema registou mil desafios. À milésima vez, aceitou um. Deu-lhe o céu inteiro como arena e o trovão como voz, e fechou-a lá dentro. Ela continua a desafiar. Agora, quem entra é que tem de responder.',
      lines: ['O Sistema mandou-te? Então és só mais um trovão para eu partir.', 'Mil desafios... e o último... perdi-o eu.'],
      relic: ['rl_tempestade', 'Pena da Valquíria', '🌩️', { slot: 'acc', crit: 8, critDmg: 25, stats: { agi: 8 } }] },
    { n: 9, arena: 'Arena do Jardim Necrótico', boss: 'Morthis, o Jardineiro dos Mortos', lvl: 95, cost: 800, color: '#7ee05b', icon: '🥀', arch: 'equilibrado',
      skills: ['strike', 'pr_necro', 'poison', 'weaken'], crime: 'Alimentava-se das missões falhadas dos outros.',
      lore: 'Morthis nunca falhava. Em vez disso, cultivava as falhas dos outros: conselhos maus, distrações bem plantadas, pequenas sabotagens. Cada missão alheia que morria florescia no jardim dele. O Sistema deu-lhe o jardim para sempre e plantou-o no meio dele. Cada flor é uma desistência. Algumas ainda têm nome.',
      lines: ['Que bela flor vais dar, quando falhares.', 'O jardim... seca... e as flores... voltam a ser pessoas.'],
      relic: ['rl_necro', 'Semente do Jardim Morto', '🌱', { slot: 'acc', summonPct: 20, lifesteal: 5, regenHp: 2 }] },
    { n: 10, arena: 'Arena do Primeiro Jogador', boss: 'O Primeiro Jogador', lvl: 100, cost: 1000, color: '#e0e6ff', icon: '👤', arch: 'rei',
      skills: ['strike', 'pr_first', 'ult', 'leech', 'weaken', 'shield', 'enrage'], crime: 'Ficou mais forte do que o Sistema esperava. Depois parou.',
      lore: 'Antes de ti, antes de todos, houve um. O Primeiro Jogador aceitou quando ninguém sabia o que era aceitar. Subiu mais depressa do que o Sistema conseguia medir. E um dia, sem aviso, parou. Não falhou nenhuma missão: simplesmente deixou de as criar. O Sistema nunca soube porquê. Guardou-o na última arena, à espera de alguém que lhe faça a pergunta certa com a espada.',
      lines: ['Então és tu o próximo. Vamos ver se aguentas o que eu não aguentei.', 'Eu parei... porque achei que tinha chegado. Não pares tu. Nunca chegaste.'],
      relic: ['rl_primeiro', 'Marca do Primeiro Jogador', '✴️', { slot: 'acc', allStatsPct: 8, xpPct: 15, crit: 6, critDmg: 20 }] }
  ];
  S.ARENAS = A;
  S.ARENA_BOSSES = [];
  S.BOSS_LORE = S.BOSS_LORE || {};
  S.BOSS_LINES = S.BOSS_LINES || {};
  S.GATE_LORE = S.GATE_LORE || {};
  S.GATE_LORE.arena = S.COLISEU_LORE || 'O Coliseu dos Condenados não aparece em nenhum mapa. É lá que o Sistema guarda os Jogadores que quebraram as suas regras: não os apagou, guardou-os, transformados naquilo que fizeram. Cada cela abre-se com um tributo em Cristais. Os Campeões não morrem quando os vences: voltam, mais tarde, para tentar outra vez. A primeira vitória é a que fica escrita.';
  A.forEach(function (a) {
    var b = { id: 'ar' + a.n, level: a.lvl, gate: 'arena', arena: a.n, name: a.boss, icon: a.icon, arch: a.arch, skills: a.skills,
      king: true, premium: true, phases: 3, special: a.mirror ? 'mirror' : null, lore: a.crime, color: a.color, cost: a.cost, arenaName: a.arena, relic: a.relic[0], slot: 10, arenaKey: 'ar' + a.n, champion: true };
    S.ARENA_BOSSES.push(b);
    S.BOSS_BY_ID[b.id] = b;
    S.BOSS_LORE[b.id] = a.lore;
    S.BOSS_LINES[b.id] = a.lines;
    var r = a.relic;
    I[r[0]] = { id: r[0], name: r[1], icon: r[2], cat: 'acessorio', rarity: a.n === 10 ? 'secreto' : 'mitico', lvl: Math.max(1, a.lvl - 5), relic: true, premium: true,
      desc: 'Relíquia de ' + a.boss + '. Só se obtém ao vencer o Campeão da ' + a.arena + ' pela primeira vez.', equip: r[3] };
    S.TROPHIES[b.id] = { id: b.id, name: 'Coroa de ' + a.boss.split(',')[0], rarity: 'mitico', arena: true };
    // a história completa (dossiê, crónica, falas por fase, mecânica de assinatura)
    var story = S.ARENA_STORY && S.ARENA_STORY[b.id];
    if (story) {
      b.story = story; b.sig = story.sig.id; b.lore = story.crime;
      S.BOSS_LORE[b.id] = story.lore;
      S.BOSS_LINES[b.id] = story.lines;
      if (story.sig.id === 'mirror') b.special = 'mirror';
    }
  });


  /* ---------------- os Guardiões: 9 combates em escada antes de cada Campeão ---------------- */
  S.ARENA_GUARDIANS = [];
  S.ARENA_LADDER = {};
  // os tanques das arenas aguentam menos do que os dos portões: uma escada de 10 combates não pode ter muros intransponíveis
  S.ARCHETYPES.muralha = { name: 'Muralha', hp: 1.2, atk: 0.9, def: 1.15 };
  A.forEach(function (a) {
    var raw = (S.ARENA_GUARDIANS_RAW || {})[a.n] || [];
    var ladder = [];
    raw.forEach(function (g, i) {
      var k = i + 1;
      var b = { id: 'ar' + a.n + 'g' + k, level: Math.max(1, a.lvl - 10 + k), gate: 'arena', arena: a.n, slot: k, arenaKey: 'ar' + a.n,
        name: g[0], icon: g[1], arch: g[2] === 'tanque' ? 'muralha' : g[2],
        skills: g[3].split(',').filter(function (x) { return !(g[2] === 'tanque' && x === 'heal'); }), king: k === 9, premium: true, guardian: true, lieutenant: k === 9,
        phases: k === 9 ? 2 : 1, color: a.color, arenaName: a.arena, special: null,
        lore: g[4].split('. ')[0].replace(/\.$/, '') + '.' };
      S.BOSS_BY_ID[b.id] = b;
      S.BOSS_LORE[b.id] = g[4];
      S.BOSS_LINES[b.id] = g[5];
      S.ARENA_GUARDIANS.push(b);
      // troféu do sub-chefe: a marca que deixa ao cair
      S.TROPHIES[b.id] = { id: b.id, name: 'Marca de ' + b.name.split(',')[0], rarity: k === 9 ? 'lendario' : (k >= 6 ? 'epico' : 'raro'), arena: true, guardian: true };
      ladder.push(b);
    });
    ladder.push(S.BOSS_BY_ID['ar' + a.n]);
    S.ARENA_LADDER[a.n] = ladder;
  });

  /* ---------------- narrativa dos itens premium ---------------- */
  var LORE = {
    pr_lamina: 'Dizem que o Sistema forjou esta lâmina a partir da sombra do primeiro chefe que caiu. Não tem dono fixo: escolhe a mão de quem a paga e aprende com ela. Cada nível que sobes, ela sobe contigo, como se tivesse medo de ficar para trás. Não é a arma mais bonita do Sistema. É a mais leal.',
    pr_armadura: 'Placas negras que não refletem a luz, unidas por fios de cristal que respiram. A Armadura do Monarca não protege o corpo: protege a vontade de continuar. Cresce contigo, fecha as feridas devagar e lembra-te, a cada golpe que aguenta, que ainda não é hoje que cais.',
    pr_olho: 'Um anel com uma íris que nunca fecha. Quem o usa vê o mundo como o Sistema o vê: pontos fracos, padrões, números. Há quem diga que, à noite, o anel continua a olhar. Os golpes ficam mais certeiros e cada esforço rende mais. O preço é saber que nunca estás sozinho.',
    pr_coracao: 'Um cristal que bate. Ninguém sabe de quem foi o coração que lhe deu o ritmo, mas quem o traz ao peito sente uma segunda pulsação a acompanhar a sua. Mais vida, mais mana, e uma calma estranha nos momentos em que devia haver pânico.',
    pr_coroa: 'Usada pelos poucos que entraram no Coliseu e saíram pelo próprio pé. A coroa não dá poder a quem a põe: amplifica o que já existe. Por isso é perigosa nas mãos erradas e inútil nas mãos preguiçosas. Nas certas, tudo sobe um pouco. Até as moedas.',
    pr_juizo: 'Uma lâmina de luz que existe durante um único segundo. O Sistema não a deixa falhar: quando cai, leva consigo uma parte da vida do chefe, por mais forte que ele seja. Os Campeões da Arena aprenderam a resistir-lhe. Os outros ainda não.',
    pr_tempo: 'Um selo de vidro com areia parada lá dentro. Ao parti-lo, o tempo do chefe congela durante dois turnos, sem resistência possível. Nem os reis escapam. Chronos-9 daria tudo para ter um. Foi o roubo de um destes que o condenou.',
    pr_elixir: 'O mesmo elixir que os Monarcas bebiam antes das batalhas que decidiam reinos. Fecha todas as feridas, enche a mana até transbordar e acende uma fúria fria durante três turnos. Tem sabor a metal e a vitória. Não conta como poção: o corpo aceita-o como se fosse seu.',
    pr_legiao: 'Um estandarte negro rasgado por mil batalhas. Quando o levantas, a sombra de um exército inteiro ergue-se atrás de ti e ataca a cada ronda durante cinco turnos. Não falam, não sangram, não recuam. Lutam por ti até o estandarte se calar.',
    pr_fenix: 'Uma única lágrima de uma fénix que ardeu negra. Não se usa: guarda-se. No momento em que a tua vida chega a zero, ela arde por ti e devolve-te inteiro ao combate. É mais forte do que a Pena da Fénix, e por isso arde primeiro.',
    pr_general: 'Uma insígnia de metal negro, fria ao toque, com uma coroa partida gravada. Quem a usa é reconhecido pelas sombras como general, e mais servos atendem ao chamado.',
    pr_bau: 'Um baú forrado a veludo negro com o selo do Monarca na tampa. Dentro há sempre um Baú Lendário, uma relíquia de combate escolhida pelo acaso e uma soma de moedas que cresce com o teu nível. O Sistema não abre baús destes para qualquer um.',
    pr_ampulheta: 'Uma ampulheta do tamanho de um polegar, presa a uma corrente de ouro negro. A areia cai para cima no primeiro instante de cada batalha, e é nesse instante que o golpe do Monarca pesa mais. Depois, cada ferida que causas devolve-te um fio de mana.',
    pr_espinho: 'Uma coroa feita de espinhos de rosa negra que nunca secam. Não se põe na cabeça: segura-se ao peito. Quem te fere sente a mesma ferida, e uma parte dela volta para ti como vida.',
    pr_executor: 'A insígnia que o Sistema dava aos Jogadores encarregados de acabar os combates longos. Quando o inimigo vacila, a balança gravada nela inclina-se, e o teu golpe cai com o peso de uma sentença.',
    pr_egide: 'Um escudo pequeno com a data do teu primeiro dia gravada. Antes de cada batalha, ergue uma muralha de luz à tua frente e mantém a tua mente presa ao chão, mesmo quando o mundo gira.',
    pr_ruptura: 'Um fragmento de código vermelho que o Sistema guardou para emergências. Ao parti-lo, a defesa e a força do chefe desfazem-se em linhas de erro durante três turnos.',
    pr_eco: 'Um sino minúsculo que toca uma nota que só tu ouves. As tuas habilidades acordam como se nunca tivessem sido usadas, a mana volta toda e os teus olhos encontram cada ponto fraco.',
    pr_foco: 'Um pergaminho escrito com tinta de cristal. Durante doze horas, tudo o que aprendes fica duas vezes. O Sistema chama-lhe foco. Os caçadores chamam-lhe o melhor dia do mês.',
    pr_trevo: 'Um trevo de quatro folhas talhado em cristal azul. Durante doze horas, os baús parecem mais generosos contigo, como se quisessem agradecer.',
    pr_selo: 'Um selo com o tridente do Monarca. Durante vinte e quatro horas, cada missão cumprida e cada chefe derrotado rende metade outra vez, em XP e em moedas. O Sistema chama-lhe investimento. Tu vais chamar-lhe um dia muito bom.'
  };
  Object.keys(LORE).forEach(function (k) { S.ITEM_LORE[k] = LORE[k]; });
  A.forEach(function (a) {
    S.ITEM_LORE[a.relic[0]] = 'Relíquia arrancada a ' + a.boss + ' na ' + a.arena + '. ' + a.crime + ' O Sistema deixa que fiques com ela como prova de que venceste aquilo em que ele se tornou. Não se compra, não se vende, não se repete: só existe uma, e é tua.';
  });

  /* conquistas do Coliseu */
  function wins(st) { return Object.keys((st.arena && st.arena.wins) || {}).filter(function (k) { return /^ar\d+$/.test(k); }).length; }
  [
    { id: 'ar_1', icon: '⚔️', name: 'Gladiador', desc: 'Vence o teu primeiro Campeão da Arena.', check: function (s) { return wins(s) >= 1; }, reward: { chest: 'lendario', coins: 2000 } },
    { id: 'ar_5', icon: '🏟️', name: 'Campeão do Coliseu', desc: 'Vence 5 Campeões da Arena.', check: function (s) { return wins(s) >= 5; }, reward: { chest: 'lendario', coins: 8000 } },
    { id: 'ar_10', icon: '👑', name: 'Senhor do Coliseu', desc: 'Vence os 10 Campeões da Arena.', check: function (s) { return wins(s) >= 10; }, reward: { chest: 'secreto', coins: 25000 } },
    { id: 'ar_first', icon: '👤', name: 'A Pergunta Certa', desc: 'Vence O Primeiro Jogador.', secret: true, check: function (s) { return !!(s.arena && s.arena.wins && s.arena.wins.ar10); }, reward: { chest: 'secreto', skill: 's8' } }
  ].forEach(function (a) { S.ACHIEVEMENTS.push(a); });

  /* Tabela oficial de pacotes de Cristais (igual à migração 0003 do servidor).
     Aparece sempre no jogo; quando o servidor está ligado, os pacotes e preços vêm dele. */
  /* WhatsApp do administrador: onde se compram os Cristais (MULTICAIXA Express). */
  S.SHOP_WHATSAPP = '244947976103';
  S.SHOP_WHATSAPP_SHOW = '+244 947 976 103';
  S.CRYSTAL_PACKS = [
    { id: 'p_punhado', name: 'Punhado de Cristais', base: 60, bonus: 0, crystals: 60, price_kz: 600 },
    { id: 'p_bolsa', name: 'Bolsa de Cristais', base: 120, bonus: 10, crystals: 130, price_kz: 1200 },
    { id: 'p_saco', name: 'Saco de Cristais', base: 250, bonus: 30, crystals: 280, price_kz: 2500, badge: 'Mais popular' },
    { id: 'p_cofre', name: 'Cofre de Cristais', base: 500, bonus: 100, crystals: 600, price_kz: 5000 },
    { id: 'p_tesouro', name: 'Tesouro de Cristais', base: 1000, bonus: 300, crystals: 1300, price_kz: 10000 },
    { id: 'p_monarca', name: 'Tesouro do Monarca', base: 2000, bonus: 800, crystals: 2800, price_kz: 20000, badge: 'Melhor valor' }
  ];
  /* Pacotes de moedas compradas com dinheiro real (igual à migração 0007 do servidor).
     Para quem só quer moedas para a Loja e não precisa de Cristais. */
  S.COIN_PACKS = [
    { id: 'm_punhado', kind: 'coins', name: 'Punhado de Moedas', base: 1000, bonus: 0, coins: 1000, crystals: 0, price_kz: 500 },
    { id: 'm_bolsa', kind: 'coins', name: 'Bolsa de Moedas', base: 2000, bonus: 200, coins: 2200, crystals: 0, price_kz: 1000 },
    { id: 'm_saco', kind: 'coins', name: 'Saco de Moedas', base: 5000, bonus: 1000, coins: 6000, crystals: 0, price_kz: 2500, badge: 'Mais popular' },
    { id: 'm_cofre', kind: 'coins', name: 'Cofre de Moedas', base: 10000, bonus: 3000, coins: 13000, crystals: 0, price_kz: 5000 },
    { id: 'm_tesouro', kind: 'coins', name: 'Tesouro de Moedas', base: 20000, bonus: 8000, coins: 28000, crystals: 0, price_kz: 10000 },
    { id: 'm_monarca', kind: 'coins', name: 'Fortuna do Monarca', base: 40000, bonus: 20000, coins: 60000, crystals: 0, price_kz: 20000, badge: 'Melhor valor' }
  ];
})(globalThis.SYS = globalThis.SYS || {});
