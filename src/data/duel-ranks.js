/* ==========================================================
   PATENTES DOS DUELOS (combate entre jogadores)
   Cada vitória num duelo vale +1 ponto de patente e cada derrota -1
   (nunca abaixo de 0). A cada 5 pontos sobe-se uma patente; ao descer
   abaixo do limite, volta-se à patente anterior.
   8 escalões × 5 divisões (I a V) = 40 patentes, dos 0 aos 199 pontos.
   Aos 200 pontos chega-se à última: Monarca dos Duelos. A partir daí os
   pontos continuam a contar, mas a patente só muda se descerem a 199.
   Imagens: assets/ui/pt_<n>.png (n = 0 a 40). Enquanto faltarem, a app
   mostra o símbolo do escalão.
   ========================================================== */
(function (S) {
  'use strict';
  var STEP = 5, CAP = 200;
  var TIERS = [
    { id: 'ferro', name: 'Recruta de Ferro', short: 'Ferro', color: '#9aa4b2', icon: '⛨' },
    { id: 'bronze', name: 'Duelista de Bronze', short: 'Bronze', color: '#d08a52', icon: '⛨' },
    { id: 'prata', name: 'Gladiador de Prata', short: 'Prata', color: '#c8d4e6', icon: '⛨' },
    { id: 'ouro', name: 'Cavaleiro de Ouro', short: 'Ouro', color: '#ffc85a', icon: '⛨' },
    { id: 'platina', name: 'Mestre de Armas de Platina', short: 'Platina', color: '#9fe8e0', icon: '⛨' },
    { id: 'diamante', name: 'Senhor da Guerra de Diamante', short: 'Diamante', color: '#6fd6ff', icon: '◆' },
    { id: 'carmesim', name: 'Lorde Carmesim', short: 'Carmesim', color: '#ff3d5a', icon: '◆' },
    { id: 'sombra', name: 'Soberano das Sombras', short: 'Sombra', color: '#a98bff', icon: '◆' }
  ];
  var ROMAN = ['I', 'II', 'III', 'IV', 'V'];
  var RANKS = [];
  TIERS.forEach(function (t, ti) {
    ROMAN.forEach(function (r, di) {
      var i = ti * 5 + di;
      RANKS.push({ i: i, id: 'pt_' + i, tier: t.id, tierName: t.short, div: di + 1, name: t.name + ' ' + r, color: t.color, icon: t.icon, min: i * STEP });
    });
  });
  RANKS.push({ i: 40, id: 'pt_40', tier: 'monarca', tierName: 'Monarca', div: 0, name: 'Monarca dos Duelos', color: '#ffd86b', icon: '♛', min: CAP });
  S.DUEL_TIERS = TIERS;
  S.DUEL_RANKS = RANKS;
  S.DUEL_RANK_RULES = { step: STEP, cap: CAP };

  /* patente para um número de pontos */
  S.duelRank = function (points) {
    var p = Math.max(0, Math.floor(+points || 0));
    var i = p >= CAP ? 40 : Math.floor(p / STEP);
    var r = RANKS[i], next = RANKS[i + 1] || null;
    return { rank: r, next: next, points: p, into: next ? p - r.min : 0, need: next ? next.min - r.min : 0, toNext: next ? next.min - p : 0, max: !next };
  };
})(globalThis.SYS = globalThis.SYS || {});
