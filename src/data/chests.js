/* ==========================================================
   BAÚS ESPECIALIZADOS
   Cada família só dá um tipo de item. Cada família tem 5 graus:
   Ferro < Prata < Ouro < Dragão < Monarca. Quanto melhor o grau,
   mais alto o nível dos itens, mais itens e mais versões do Artesão
   e do Campeão (e, no topo, armas de rei e itens únicos).
   Todos se compram com moedas na Loja (os melhores são mais caros
   e pedem nível e chefes). Os graus Ouro, Dragão e Monarca também
   estão na Loja Exclusiva, em Cristais.
   ========================================================== */
(function (S) {
  'use strict';
  var I = S.ITEMS;

  /* graus: janela de níveis dos itens, pesos [base, Artesão, Campeão, únicos] */
  var GRADES = S.CHEST_GRADES = [
    { k: 1, name: 'Ferro', of: 'de Ferro', rarity: 'incomum', lvl: 5, req: null, lo: 1, hi: 25, w: [70, 25, 5, 4], crys: null },
    { k: 2, name: 'Prata', of: 'de Prata', rarity: 'raro', lvl: 15, req: { boss: 'b10' }, lo: 15, hi: 45, w: [40, 40, 20, 8], crys: null },
    { k: 3, name: 'Ouro', of: 'de Ouro', rarity: 'epico', lvl: 30, req: { boss: 'b30' }, lo: 35, hi: 65, w: [15, 45, 40, 14], crys: 1 },
    { k: 4, name: 'Dragão', of: 'do Dragão', rarity: 'lendario', lvl: 50, req: { boss: 'b50' }, lo: 55, hi: 85, w: [0, 40, 60, 25], crys: 2 },
    { k: 5, name: 'Monarca', of: 'do Monarca', rarity: 'mitico', lvl: 70, req: { boss: 'b70' }, lo: 72, hi: 100, w: [0, 15, 85, 35], crys: 3 }
  ];

  /* famílias: o que dão, quantos itens por grau, preços em moedas e em Cristais (graus 3 a 5) */
  var FAMS = S.CHEST_FAMS = [
    { id: 'arsenal', name: 'Arsenal', icon: '⚔️', what: 'Só dá armas da tua classe (e, nos graus altos, armas de rei).',
      pool: ['arma'], rolls: [1, 1, 2, 2, 3], price: [900, 3200, 12000, 30000, 65000], crys: [20, 45, 90] },
    { id: 'armaria', name: 'Armaria', icon: '🛡️', what: 'Só dá armaduras.',
      pool: ['armadura'], rolls: [1, 1, 2, 2, 3], price: [800, 2800, 10000, 26000, 58000], crys: [18, 40, 80] },
    { id: 'guerra', name: 'Arca de Guerra', icon: '🗡️', what: 'Dá armas e armaduras, sempre metade de cada.',
      pool: ['arma', 'armadura'], rolls: [2, 2, 3, 3, 4], price: [1600, 5600, 17000, 42000, 85000], crys: [30, 60, 120] },
    { id: 'joias', name: 'Porta-Joias', icon: '💍', what: 'Só dá acessórios.',
      pool: ['acessorio'], rolls: [1, 1, 2, 2, 3], price: [900, 3000, 11000, 28000, 60000], crys: [20, 45, 85] },
    { id: 'alquimia', name: 'Cofre Alquímico', icon: '⚗️', what: 'Só dá poções e elixires (nos graus altos, elixires permanentes).',
      pool: ['consumivel', 'atributo'], rolls: [3, 4, 4, 5, 6], price: [700, 2400, 8000, 20000, 45000], crys: [15, 35, 70] }
  ];

  S.CHEST_FAM_BY_TIER = {};
  FAMS.forEach(function (f) {
    GRADES.forEach(function (g, i) {
      var id = 'bau_' + f.id + '_' + g.k, tier = f.id + '_' + g.k;
      var name = f.name + ' ' + g.of;
      I[id] = { id: id, name: name, icon: f.icon, cat: 'bau', lvl: g.lvl, price: f.price[i], fixedPrice: true, rarity: g.rarity, req: g.req,
        chestFam: f.id, chestGrade: g.k, use: { type: 'chest', tier: tier }, field: true,
        desc: f.what + ' ' + f.rolls[i] + (f.rolls[i] === 1 ? ' item' : ' itens') + ' entre o nível ' + g.lo + ' e ' + Math.min(100, g.hi) +
          (g.k >= 3 ? ', quase sempre versões do Artesão ou do Campeão' : g.k === 2 ? ', com boa hipótese de versões melhoradas' : '') + '.' };
      S.CHESTS[tier] = { fam: f.id, grade: g.k, rolls: f.rolls[i], coins: [0, 0], table: [] };
      if (g.crys && S.PREMIUM_PRICES) S.PREMIUM_PRICES[id] = f.crys[g.crys - 1];
    });
  });

  /* na Loja Exclusiva: os 3 graus mais altos de cada família */
  if (S.PREMIUM_SHOP) S.PREMIUM_SHOP.splice(3, 0, { title: 'Baús especializados', note: 'Cada baú só dá um tipo de item, e quanto melhor o grau, melhor o item. Os graus Ouro, Dragão e Monarca podem comprar-se aqui sem esperar pelo nível nem pelos chefes.',
    ids: [].concat.apply([], FAMS.map(function (f) { return [3, 4, 5].map(function (k) { return 'bau_' + f.id + '_' + k; }); })) });

  S.CHEST_LORE = {
    arsenal: 'Um armeiro que nunca falhou uma encomenda deixou estas caixas nos portões. Cada uma conhece a mão de quem a abre e só guarda armas que essa mão sabe usar.',
    armaria: 'Couraças, cotas e mantos dobrados com cuidado de alfaiate. A Armaria não traz mais nada: só o que fica entre ti e o golpe.',
    guerra: 'Uma arca pesada, com duas fechaduras: uma para a espada, outra para o escudo. Abre-se sempre pelas duas.',
    joias: 'Um estojo forrado a veludo, com compartimentos para anéis, colares e amuletos. Nunca vem vazio e nunca traz duas vezes a mesma coisa.',
    alquimia: 'Frascos encaixados em palha, a borbulhar baixinho. Os cofres dos graus altos guardam elixires que mudam o corpo para sempre.'
  };
  var GRADE_LORE = ['Grau Ferro: o mais simples, para quem ainda está a começar.', 'Grau Prata: já se ouve o peso do que está lá dentro.', 'Grau Ouro: o fecho tem runas e o conteúdo é quase sempre de mestre.', 'Grau Dragão: a tampa está quente ao toque. Lá dentro só há peças de campeão.', 'Grau Monarca: o selo é negro e o Sistema regista cada abertura. O melhor que os portões guardam.'];
  S.ITEM_LORE = S.ITEM_LORE || {};
  FAMS.forEach(function (f) { GRADES.forEach(function (g, i) { S.ITEM_LORE['bau_' + f.id + '_' + g.k] = S.CHEST_LORE[f.id] + ' ' + GRADE_LORE[i]; }); });
})(globalThis.SYS = globalThis.SYS || {});
