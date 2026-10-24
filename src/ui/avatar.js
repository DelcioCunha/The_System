/* ==========================================================
   AVATAR EVOLUTIVO
   - Se existirem imagens em assets/avatars/<classe>/<nível>.png,
     usa a imagem do nível mais alto já atingido (ex.: tens 1, 10, 20…
     e estás no 17 → mostra a 10).
   - Sem imagens, desenha um avatar provisório que fica mais poderoso
     a cada 10 níveis (aura, partículas, auréola, asas).
   ========================================================== */
(function (S) {
  'use strict';
  S.AVATARS = S.AVATARS || {}; // preenchido pelo build: { guerreiro: { 1: 'avatars/guerreiro/1.png', ... } }
  S.CLASS_ART = S.CLASS_ART || {}; // arte de cada classe (nível 1); usada enquanto não houver evoluções
  var uid = 0;

  /* aparência: 'm' (masculina) ou 'f' (feminina). Sem gender explícito, usa a do jogador atual.
     A feminina vive em assets/avatars_f/<classe>/<nível> (no mapa como <classe>_f); enquanto faltar,
     o jogo desenha o avatar provisório (nunca mostra a aparência masculina a quem escolheu a feminina). */
  function g0(g) { return g === 'f' || g === 'm' ? g : ((S.engine && S.engine.state && S.engine.state.gender) === 'f' ? 'f' : 'm'); }
  function imageFor(cls, level, g) {
    if (g0(g) === 'f') {
      var fm = S.AVATARS[cls + '_f'], fb = null;
      if (fm) Object.keys(fm).map(Number).sort(function (a, b) { return a - b; }).forEach(function (lv) { if (lv <= level) fb = lv; });
      return fb != null ? fm[fb] : (S.CLASS_ART[cls + '_f'] || null);
    }
    var map = S.AVATARS[cls];
    var best = null;
    if (map) Object.keys(map).map(Number).sort(function (a, b) { return a - b; }).forEach(function (lv) { if (lv <= level) best = lv; });
    if (best != null) return map[best];
    return S.CLASS_ART[cls] || null;
  }

  function seeded(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
  }

  var WEAPONS = {
    guerreiro: function (c) { return '<path d="M86 66 L104 30 L107 32 L90 68 Z" fill="' + c + '" opacity=".95"/><rect x="82" y="64" width="12" height="3" transform="rotate(-62 88 66)" fill="#cfd8ea"/>'; },
    assassino: function (c) { return '<path d="M30 92 L18 70 L21 69 L33 90 Z" fill="' + c + '"/><path d="M90 92 L102 70 L99 69 L87 90 Z" fill="' + c + '"/>'; },
    mago: function (c) { return '<rect x="94" y="40" width="3" height="90" fill="#8a6a4a"/><circle cx="95.5" cy="36" r="7" fill="' + c + '"/><circle cx="95.5" cy="36" r="12" fill="' + c + '" opacity=".25"/>'; },
    guardiao: function (c) { return '<path d="M78 82 h26 v18 c0 14 -13 22 -13 22 s-13 -8 -13 -22 z" fill="#1a2440" stroke="' + c + '" stroke-width="2.5"/><path d="M91 88 v26 M83 98 h16" stroke="' + c + '" stroke-width="2"/>'; },
    arqueiro: function (c) { return '<path d="M100 40 Q122 85 100 130" fill="none" stroke="' + c + '" stroke-width="3"/><line x1="100" y1="40" x2="100" y2="130" stroke="#cfd8ea" stroke-width=".8"/>'; },
    invocador: function (c) { return '<rect x="22" y="92" width="18" height="22" rx="2" fill="#20163a" stroke="' + c + '" stroke-width="1.5"/><path d="M26 86 q4 -10 8 0 q4 -10 8 0" fill="none" stroke="' + c + '" stroke-width="1.5" opacity=".8"/><circle cx="100" cy="70" r="5" fill="' + c + '" opacity=".6"/><circle cx="108" cy="60" r="3" fill="' + c + '" opacity=".4"/>'; }
  };

  function drawSvg(cls, level) {
    var id = 'av' + (++uid);
    var rank = S.rankFor(level);
    var aura = rank.color;
    var cc = S.CLASSES[cls].color;
    var tier = Math.min(9, Math.floor((level - 1) / 10));
    var rnd = seeded(level * 97 + cls.length * 13);
    var parts = [];
    parts.push('<defs>' +
      '<radialGradient id="' + id + 'b" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="' + aura + '" stop-opacity="' + (0.12 + tier * 0.04) + '"/><stop offset="1" stop-color="#050912" stop-opacity="1"/></radialGradient>' +
      '<radialGradient id="' + id + 'a" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="' + aura + '" stop-opacity=".9"/><stop offset="1" stop-color="' + aura + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18223b"/><stop offset="1" stop-color="#070b16"/></linearGradient>' +
      '</defs>');
    parts.push('<rect width="120" height="160" fill="url(#' + id + 'b)"/>');
    // grelha do sistema
    for (var g = 20; g < 160; g += 20) parts.push('<line x1="0" y1="' + g + '" x2="120" y2="' + g + '" stroke="' + aura + '" stroke-opacity=".05"/>');
    // asas de energia (nível 71+)
    if (tier >= 7) {
      var wo = 0.25 + (tier - 7) * 0.12;
      parts.push('<path d="M60 80 C30 50 6 50 2 30 C14 70 28 90 56 100 Z" fill="' + aura + '" opacity="' + wo + '"/>');
      parts.push('<path d="M60 80 C90 50 114 50 118 30 C106 70 92 90 64 100 Z" fill="' + aura + '" opacity="' + wo + '"/>');
    }
    // aura
    var auraR = 34 + tier * 5;
    parts.push('<ellipse cx="60" cy="96" rx="' + auraR + '" ry="' + (auraR * 1.25) + '" fill="url(#' + id + 'a)" opacity="' + (0.25 + tier * 0.07) + '"/>');
    for (var f = 0; f < 2 + tier; f++) {
      var x = 30 + rnd() * 60, h = 20 + rnd() * (20 + tier * 6);
      parts.push('<path d="M' + x.toFixed(1) + ' 150 q' + (rnd() * 8 - 4).toFixed(1) + ' -' + (h / 2).toFixed(1) + ' 0 -' + h.toFixed(1) + ' q' + (rnd() * 8 - 4).toFixed(1) + ' ' + (h / 2).toFixed(1) + ' 0 ' + h.toFixed(1) + '" stroke="' + aura + '" stroke-opacity="' + (0.2 + tier * 0.05) + '" stroke-width="2" fill="none"/>');
    }
    // partículas
    for (var p = 0; p < tier * 4; p++) {
      parts.push('<circle cx="' + (rnd() * 120).toFixed(1) + '" cy="' + (20 + rnd() * 135).toFixed(1) + '" r="' + (0.6 + rnd() * 1.4).toFixed(1) + '" fill="' + aura + '" opacity="' + (0.3 + rnd() * 0.6).toFixed(2) + '"/>');
    }
    // auréola (nível 51+)
    if (tier >= 5) parts.push('<ellipse cx="60" cy="34" rx="' + (16 + tier) + '" ry="4" fill="none" stroke="' + aura + '" stroke-width="' + (1 + (tier - 5) * 0.5) + '" opacity=".9"/>');
    // silhueta
    parts.push('<ellipse cx="60" cy="152" rx="40" ry="6" fill="' + aura + '" opacity=".25"/>');
    parts.push('<path d="M60 36 C46 36 41 48 42 58 C43 66 46 70 48 72 C34 76 26 86 24 104 L20 160 L100 160 L96 104 C94 86 86 76 72 72 C74 70 77 66 78 58 C79 48 74 36 60 36 Z" fill="url(#' + id + 'f)" stroke="' + aura + '" stroke-opacity="' + (0.35 + tier * 0.06) + '" stroke-width="1.2"/>');
    // capuz
    parts.push('<path d="M44 58 C44 44 52 40 60 40 C68 40 76 44 76 58 C72 52 66 50 60 50 C54 50 48 52 44 58 Z" fill="#05080f" opacity=".85"/>');
    // olhos
    var eo = Math.min(1, 0.55 + tier * 0.06);
    parts.push('<rect x="51" y="57" width="6" height="2.4" rx="1" fill="' + cc + '" opacity="' + eo + '"/><rect x="63" y="57" width="6" height="2.4" rx="1" fill="' + cc + '" opacity="' + eo + '"/>');
    if (tier >= 3) parts.push('<rect x="49" y="56" width="22" height="4.5" rx="2" fill="' + cc + '" opacity=".18"/>');
    // marcas no peito
    if (tier >= 2) parts.push('<path d="M60 84 l6 10 l-6 10 l-6 -10 z" fill="none" stroke="' + cc + '" stroke-width="1.2" opacity="' + (0.4 + tier * 0.06) + '"/>');
    if (tier >= 4) parts.push('<path d="M40 100 L52 112 M80 100 L68 112" stroke="' + cc + '" stroke-width="1" opacity=".5"/>');
    // arma
    parts.push(WEAPONS[cls](cc));
    // coroa (nível 91+)
    if (tier >= 9) parts.push('<path d="M48 40 L52 30 L56 37 L60 26 L64 37 L68 30 L72 40 Z" fill="' + S.RARITY.lendario.color + '" opacity=".95"/>');
    // rótulos
    parts.push('<text x="6" y="14" font-family="Oxanium, monospace" font-size="9" fill="' + aura + '" letter-spacing="1">NV ' + level + '</text>');
    parts.push('<text x="114" y="14" text-anchor="end" font-family="Oxanium, monospace" font-weight="800" font-size="11" fill="' + aura + '">' + rank.rank + '</text>');
    return '<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar ' + S.CLASSES[cls].name + ' nível ' + level + '">' + parts.join('') + '</svg>';
  }

  S.avatar = {
    imageFor: imageFor,
    gender: g0,
    html: function (cls, level, extraClass, g) {
      var img = imageFor(cls, level, g);
      var inner = img
        ? '<img src="' + img + '" alt="Avatar ' + S.CLASSES[cls].name + ' nível ' + level + '" onerror="this.replaceWith(document.createRange().createContextualFragment(SYS.avatar.svg(\'' + cls + '\',' + level + ')))">'
        : drawSvg(cls, level);
      return '<div class="avatar ' + (img ? 'has-img ' : '') + (extraClass || '') + '">' + inner + '</div>';
    },
    svg: drawSvg,
    /* verdadeiro quando o nível L mostra uma imagem diferente do nível L-1 */
    evolved: function (cls, level, g) { var a = imageFor(cls, level, g), b = imageFor(cls, level - 1, g); return !!a && a !== b; },
    /* forma atual e próxima: { n, total, next } (next = nível da próxima forma, ou null) */
    forms: function (cls, level, g) {
      var lv = Object.keys(S.AVATARS[cls + (g0(g) === 'f' ? '_f' : '')] || S.AVATARS[cls] || {}).map(Number).sort(function (a, b) { return a - b; });
      if (!lv.length) return null;
      var n = lv.filter(function (x) { return x <= level; }).length, next = lv.filter(function (x) { return x > level; })[0];
      return { n: Math.max(1, n), total: lv.length, next: next || null };
    }
  };
})(globalThis.SYS = globalThis.SYS || {});
