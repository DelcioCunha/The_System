/* ==========================================================
   INFORMAÇÃO DETALHADA (narrativa + propriedades)
   Usado pelas janelas de detalhe de itens, habilidades, chefes e troféus.
   Cada função de propriedades devolve uma lista de secções:
     [{ title, rows: [[rótulo, valor] | texto] }]
   ========================================================== */
(function (S) {
  'use strict';
  var L = S.lore = {};

  function pct(x) { return Math.round(x * 100) + '%'; }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  var CAT_NAMES = { lazer: 'Recompensa de lazer', arma: 'Arma', armadura: 'Armadura', acessorio: 'Acessório', consumivel: 'Consumível',
    atributo: 'Melhoria permanente', bau: 'Baú', secreto: 'Item secreto' };
  var DOT = { burn: 'Queimadura', poison: 'Veneno', bleed: 'Sangramento' };
  var BUFF = { atk: 'ataque', matk: 'ataque mágico', def: 'defesa', crit: 'hipótese de crítico', eva: 'esquiva', lifesteal: 'roubo de vida', reflect: 'reflexão de dano' };

  /* ---------------- ITENS ---------------- */
  function baseId(id) { return id.replace(/_(art|camp)$/, ''); }
  L.itemText = function (it) {
    if (!it) return '';
    if (it.custom) return S.ITEM_LORE_FAMILY.custom;
    var F = S.ITEM_LORE_FAMILY, id = it.id, txt = S.ITEM_LORE[id];
    if (txt) return txt;
    var b = baseId(id), m;
    if (b !== id && S.ITEM_LORE[b]) return S.ITEM_LORE[b] + ' ' + S.VARIANT_LORE[id.slice(b.length)];
    if ((m = id.match(/^el_(str|agi|vit|int|per)$/))) return F.elixir + ' ' + F.stat[m[1]];
    if ((m = id.match(/^elg_(str|agi|vit|int|per)$/))) return F.elixirG + ' ' + F.stat[m[1]];
    if ((m = id.match(/^ac_(str|agi|vit|int|per)_(maior|anc|prim)$/))) {
      var orig = { str: 'ac_forca', agi: 'ac_agi', vit: 'ac_vit', int: 'ac_int', per: 'ac_per' }[m[1]];
      return S.ITEM_LORE[orig] + ' ' + F.accTier['_' + m[2]] + ' ' + F.stat[m[1]];
    }
    if ((m = id.match(/^ac_t_([a-z]+)([123])$/))) return F.talisma[m[1]] + ' ' + F.talismaTier[+m[2] - 1];
    return it.desc || '';
  };

  /* descrição de um bónus de equipamento, em linhas legíveis */
  L.equipRows = function (q) {
    var rows = [];
    if (!q) return rows;
    if (q.atk && q.matk && q.atk === q.matk) rows.push(['Ataque e ataque mágico', '+' + q.atk]);
    else {
      if (q.atk) rows.push(['Ataque físico', '+' + q.atk]);
      if (q.matk) rows.push(['Ataque mágico', '+' + q.matk]);
    }
    if (q.def) rows.push(['Defesa', '+' + q.def]);
    if (q.stats) Object.keys(q.stats).forEach(function (k) { rows.push([S.STAT_INFO[k].name, '+' + q.stats[k]]); });
    if (q.allStatsPct) rows.push(['Todos os atributos', '+' + q.allStatsPct + '%']);
    if (q.hpPct) rows.push(['Vida máxima', '+' + q.hpPct + '%']);
    if (q.mpPct) rows.push(['Mana máxima', '+' + q.mpPct + '%']);
    if (q.crit) rows.push(['Hipótese de crítico', '+' + q.crit + '%']);
    if (q.critDmg) rows.push(['Dano crítico', '+' + q.critDmg + '%']);
    if (q.eva) rows.push(['Esquiva', '+' + q.eva + '%']);
    if (q.lifesteal) rows.push(['Roubo de vida', q.lifesteal + '% do dano causado']);
    if (q.regenHp) rows.push(['Regeneração de vida', q.regenHp + '% por turno']);
    if (q.regenMp) rows.push(['Regeneração de mana', q.regenMp + '% por turno']);
    if (q.summonPct) rows.push(['Dano das invocações', '+' + q.summonPct + '%']);
    if (q.xpPct) rows.push(['XP ganho', '+' + q.xpPct + '%']);
    if (q.coinPct) rows.push(['Moedas ganhas', '+' + q.coinPct + '%']);
    if (q.thorns) rows.push(['Espinhos', 'devolve ' + q.thorns + '% do dano que recebes']);
    if (q.openShield) rows.push(['Escudo inicial', q.openShield + '% da vida máxima no início de cada batalha']);
    if (q.execute) rows.push(['Execução', '+' + q.execute + '% de dano quando o chefe tem menos de 30% de vida']);
    if (q.firstStrike) rows.push(['Primeiro golpe', '+' + q.firstStrike + '% de dano no primeiro ataque da batalha']);
    if (q.manaOnHit) rows.push(['Mana por golpe', '+' + q.manaOnHit + '% da mana máxima a cada ataque que acerta']);
    if (q.dotPct) rows.push(['Venenos, chamas e sangramentos', '+' + q.dotPct + '% de dano por turno']);
    if (q.stunRes) rows.push(['Resistência a atordoar', q.stunRes + '% de hipótese de resistir']);
    if (q.potionPct) rows.push(['Poções de cura', 'curam +' + q.potionPct + '%']);
    return rows;
  };

  function buffText(list) {
    return list.map(function (b) { return (b.val < 0 ? '' : '+') + b.val + '% ' + BUFF[b.key] + ' (' + b.turns + ' turnos)'; }).join(', ');
  }
  function opsText(ops) {
    return ops.map(function (o) {
      if (o.op === 'shield') return 'Escudo de ' + o.pct + '% da vida máxima';
      if (o.op === 'dot') return DOT[o.type] + ' durante ' + o.turns + ' turnos';
      if (o.op === 'debuff') return '-' + o.val + '% ' + BUFF[o.key] + ' do chefe (' + o.turns + ' turnos)';
      if (o.op === 'stun') return (o.chance >= 1 ? 'O chefe perde' : pct(o.chance) + ' de hipótese de o chefe perder') + ' o próximo turno';
      return '';
    }).filter(Boolean).join('; ');
  }
  /* o que acontece ao usar */
  L.useRows = function (it, st) {
    var u = it.use, rows = [];
    if (it.perma) { rows.push(['Tipo', 'Relíquia permanente: compras uma vez, fica para sempre']); rows.push(['Recarga', it.recharge + ' horas depois de usada']); }
    if (!u) return rows;
    switch (u.type) {
      case 'heal': rows.push(['Efeito', 'Recupera ' + u.pct + '% da vida máxima']); break;
      case 'mana': rows.push(['Efeito', 'Recupera ' + u.pct + '% da mana máxima']); break;
      case 'restore': rows.push(['Efeito', 'Recupera ' + u.hp + '% da vida e ' + u.mp + '% da mana' + (u.cleanse ? ', e remove todos os efeitos negativos' : '')]); break;
      case 'cleanse': rows.push(['Efeito', 'Remove venenos, queimaduras, sangramentos e fraquezas']); break;
      case 'buffs': rows.push(['Efeito', buffText(u.list)]); break;
      case 'ops': rows.push(['Efeito', opsText(u.ops)]); break;
      case 'bomb':
        rows.push(['Dano', u.perLevel + ' × o teu nível' + (st ? ' (agora: ' + fmt(u.perLevel * st.level) + ')' : '') + ', ignora a defesa']);
        if (u.dot) rows.push(['Extra', DOT[u.dot.type] + ' durante ' + u.dot.turns + ' turnos']);
        if (u.stun) rows.push(['Extra', pct(u.stun) + ' de hipótese de congelar o chefe']);
        break;
      case 'smoke': rows.push(['Efeito', 'Foges da batalha sem perder moedas']); break;
      case 'timed': rows.push(['Efeito', S.TIMED_EFFECTS[u.effect].name + ' durante ' + u.hours + ' horas (tempo real)']); break;
      case 'penaltyShield': rows.push(['Efeito', 'Anula a próxima penalidade de missão falhada. Gasta-se sozinho']); break;
      case 'removeEffect': rows.push(['Efeito', 'Remove o estado ' + S.TIMED_EFFECTS[u.effect].name]); break;
      case 'perm': rows.push(['Efeito', '+' + u.amount + ' ' + S.STAT_INFO[u.stat].name + ' para sempre']); break;
      case 'permAll': rows.push(['Efeito', '+' + u.amount + ' em todos os atributos, para sempre']); break;
      case 'point': rows.push(['Efeito', '+' + u.amount + ' ponto' + (u.amount > 1 ? 's' : '') + ' livre' + (u.amount > 1 ? 's' : '') + ' para distribuíres']); break;
      case 'levelUp': rows.push(['Efeito', 'Sobes 1 nível na hora e recebes os pontos de atributo desse nível']); break;
      case 'reset': rows.push(['Efeito', 'Devolve todos os pontos distribuídos']); break;
      case 'chest':
        if (it.cat === 'bau') {
          var d = S.CHESTS[u.tier];
          if (d) {
            rows.push(['Moedas', fmt(d.coins[0]) + ' a ' + fmt(d.coins[1]) + ' × multiplicador do teu nível']);
            rows.push(['Sorteios', d.rolls + ' ite' + (d.rolls > 1 ? 'ns' : 'm') + ' da tabela do baú']);
            var best = d.table.slice().sort(function (a, b) { return a[1] - b[1]; }).slice(0, 3)
              .map(function (r) { var x = S.ITEMS[r[0]]; return x ? (x.secret ? 'item secreto' : x.name) : (r[0].indexOf('@weapon') === 0 ? 'arma da tua classe' : 'acessório'); });
            rows.push(['Prémios mais raros', best.filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ')]);
          }
        } else rows.push(['Efeito', 'Chama um ' + S.ITEMS['bau_' + u.tier].name + (u.bonusChance ? ', com ' + pct(u.bonusChance) + ' de hipótese de um ' + S.ITEMS['bau_' + u.bonus].name : '')]);
        break;
      case 'unlockSkill': rows.push(['Efeito', 'Aprendes a habilidade secreta ' + S.ALL_SKILLS[u.skill].name]); break;
      case 'revive': rows.push(['Efeito', 'Ao morrer em combate, renasces com ' + u.pct + '% da vida' + (it.perma ? '' : ' (gasta-se)')]); break;
      case 'coins': rows.push(['Efeito', 'Recebes ' + fmt(u.amount) + ' moedas']); break;
      case 'judgment': rows.push(['Efeito', 'Tira ' + S.PREMIUM_RULES.judgmentPct + '% da vida máxima do chefe'], ['Contra Campeões e chefes finais', S.PREMIUM_RULES.judgmentPctPremium + '% da vida máxima'], ['Limite', S.PREMIUM_RULES.perBattle + ' relíquia premium por batalha']); break;
      case 'monarch': rows.push(['Efeito', 'Vida e mana a 100%, remove efeitos negativos e +40% de ataque e ataque mágico durante 3 turnos'], ['Limite', S.PREMIUM_RULES.perBattle + ' relíquia premium por batalha (não conta para o limite de poções)']); break;
      case 'monarchChest': rows.push(['Contém', 'Baú Lendário + Baú Secreto + moedas que acompanham o teu nível + recarga de todas as relíquias']); break;
      case 'perk': rows.push(['Duração', 'Para sempre (usa-se uma vez)']); break;
      case 'shadowSlot': rows.push(['Efeito', '+1 lugar de servo convocado, para sempre'], ['Limite', 'Até 3 insígnias (de 3 para 6 lugares; o Invocador tem mais 1)']); break;
      case 'revealBoss': rows.push(['Efeito', 'Revela um portão escondido']); break;
      case 'system': rows.push(['Efeito', it.desc], ['Tipo', 'Artefato do Sistema (usa-se na Bolsa)']); break;
      case 'fragment': rows.push(['Efeito', 'Junta ' + u.need + ' para formar o ' + S.ITEMS[u.result].name]); break;
      case 'core': rows.push(['Efeito', '+' + u.points + ' pontos livres e a habilidade ' + S.ALL_SKILLS[u.skill].name]); break;
      case 'leisure': rows.push(['Efeito', 'Ao usar, fica registado que gozaste esta recompensa na vida real']); break;
    }
    return rows;
  };

  /* onde se obtém (além da loja) */
  L.sources = function (it) {
    var out = [], id = it.id;
    Object.keys(S.CHESTS).forEach(function (t) {
      if (S.CHESTS[t].table.some(function (r) { return r[0] === id; })) out.push(S.ITEMS['bau_' + t].name);
    });
    var wm = id.match(/^w_[a-z]+_(\d+)$/);
    if (wm) Object.keys(S.CHESTS).forEach(function (t) {
      if (S.CHESTS[t].table.some(function (r) { return r[0] === '@weapon:' + wm[1]; })) out.push(S.ITEMS['bau_' + t].name);
    });
    if (it.cat === 'acessorio' && !it.secret && !it.req && it.lvl) out.push('Baús raros e épicos (acessório ao acaso)');
    Object.keys(S.BOSS_SPECIAL_DROPS).forEach(function (bid) {
      if ((S.BOSS_SPECIAL_DROPS[bid].items || []).indexOf(id) >= 0) {
        var b = S.BOSS_BY_ID[bid];
        out.push(b.secret ? 'Chefe de um portão oculto' : b.name + ' (Nv ' + b.level + ')');
      }
    });
    return out.filter(function (v, i, a) { return a.indexOf(v) === i; });
  };

  L.itemSections = function (it, st) {
    var E = S.engine, secs = [];
    var g = [['Tipo', CAT_NAMES[it.cat] || 'Item'], ['Raridade', (S.RARITY[it.rarity] || {}).name || '']];
    if (it.lvl > 1) g.push(['Nível mínimo', String(it.lvl)]);
    if (it.cls) g.push(['Classe', it.cls.map(function (c) { return S.CLASSES[c].name; }).join(', ')]);
    else if (it.equip && it.equip.slot === 'weapon') g.push(['Classe', 'Qualquer classe']);
    if (it.equip) g.push(['Espaço', { weapon: 'Arma', armor: 'Armadura', acc: 'Acessório (2 espaços)' }[it.equip.slot]]);
    secs.push({ title: 'Geral', rows: g });

    if (it.equip) secs.push({ title: 'Bónus ao equipar', rows: L.equipRows(it.equip) });
    var ur = L.useRows(it, st);
    if (ur.length) {
      var where = [];
      if (it.battle) where.push('em combate');
      if (it.field) where.push('fora de combate');
      if (it.use.type === 'penaltyShield' || it.use.type === 'revive') where = ['automático, basta estar na bolsa'];
      if (where.length) ur.push(['Quando', where.join(' e ')]);
      if (it.use.type === 'heal' || (it.use.type === 'restore' && it.use.hp)) ur.push(['Limite', 'Máximo ' + (S.combat ? S.combat.HEAL_LIMIT : 3) + ' poções de cura por batalha']);
      secs.push({ title: 'Ao usar', rows: ur });
    }
    if (it.phase) {
      var ph = S.time.PHASES[it.phase];
      var on = S.time.itemActive(it);
      secs.push({ title: 'Relógio do Sistema', rows: [['Funciona', ph.icon + ' ' + ph.name + ', ' + ph.desc], ['Agora', on ? 'Ativo' : 'Inativo (fora de horas)']] });
    }
    var req = [];
    if (st && (it.req || it.lvl > 1)) E.reqStatus(st, it).lines.forEach(function (l) { req.push([l.ok ? '✓' : '✗', l.text]); });
    if (req.length) secs.push({ title: 'Requisitos', rows: req });

    var eco = [];
    var p = st && E.price(st, it.id);
    if (p && !it.secret) {
      eco.push(['Preço na loja', fmt(p) + ' moedas']);
      if (it.priceStep) eco.push(['Inflação', 'O preço sobe ' + Math.round(it.priceStep * 100) + '% a cada compra']);
      if (it.priceScale) eco.push(['Escala', 'O preço acompanha o teu nível']);
      else if (E.priceFactor(st, it) !== 1) eco.push(['Escala', 'O preço acompanha o teu nível']);
    } else eco.push(['Loja', 'Não se vende na loja']);
    var sv = st ? E.sellValue(st, it.id) : 0;
    if (sv) eco.push(['Venda', fmt(sv) + ' moedas']);
    var src = L.sources(it);
    if (src.length) eco.push(['Também em', src.join(', ')]);
    secs.push({ title: 'Obtenção', rows: eco });
    return secs;
  };

  /* ---------------- HABILIDADES ---------------- */
  var KIND = { phys: 'físico', mag: 'mágico', def: 'baseado na defesa', best: 'com o teu melhor ataque' };
  function skillOpRows(ops) {
    var rows = [];
    ops.forEach(function (o) {
      switch (o.op) {
        case 'dmg':
          var t = (o.hits > 1 ? o.hits + ' golpes de ' : '') + Math.round(o.mult * 100) + '% de dano ' + KIND[o.kind || 'phys'];
          if (o.hits > 1) t += ' (total ' + Math.round(o.mult * o.hits * 100) + '%)';
          rows.push(['Dano', t]);
          if (o.pierce) rows.push(['Perfuração', o.pierce >= 1 ? 'Ignora toda a defesa' : 'Ignora ' + pct(o.pierce) + ' da defesa']);
          if (o.crit) rows.push(['Crítico', '+' + o.crit + '% de hipótese neste golpe']);
          if (o.alwaysCrit) rows.push(['Crítico', 'Garantido']);
          if (o.execute) rows.push(['Execução', 'Dano × ' + o.execute.mult + ' se o chefe tiver menos de ' + pct(o.execute.below) + ' de vida']);
          if (o.lifesteal) rows.push(['Roubo de vida', pct(o.lifesteal) + ' do dano causado']);
          break;
        case 'dot': rows.push([DOT[o.type], Math.round(o.mult * 100) + '% do ataque por turno, durante ' + o.turns + ' turnos']); break;
        case 'stun': rows.push(['Atordoar', (o.chance >= 1 ? 'Garantido' : pct(o.chance) + ' de hipótese') + ': o chefe perde ' + o.turns + ' turno']); break;
        case 'heal': rows.push(['Cura', o.pct + '% da vida máxima']); break;
        case 'shield': rows.push(['Escudo', o.pct + '% da vida máxima']); break;
        case 'mp': rows.push(['Mana', 'Recupera ' + o.pct + '% da mana máxima']); break;
        case 'buff': rows.push(['Reforço', '+' + o.val + '% ' + BUFF[o.key] + ' durante ' + o.turns + ' turnos']); break;
        case 'debuff': rows.push(['Enfraquecer', '-' + o.val + '% ' + BUFF[o.key] + ' do chefe durante ' + o.turns + ' turnos']); break;
        case 'summon': rows.push(['Invocação', o.name + ' ataca sozinho durante ' + o.turns + ' turnos (' + Math.round(o.mult * 100) + '% por turno)']); break;
        case 'resetCd': rows.push(['Tempo', 'Todas as tuas recargas voltam a zero']); break;
      }
    });
    return rows;
  }
  var PASSIVE = {
    hpPct: ['Vida máxima', '+%'], mpPct: ['Mana máxima', '+%'], atkPct: ['Ataque', '+%'], matkPct: ['Ataque mágico', '+%'], defPct: ['Defesa', '+%'],
    crit: ['Hipótese de crítico', '+%'], critDmg: ['Dano crítico', '+%'], eva: ['Esquiva', '+%'], regenHp: ['Regeneração de vida', '% por turno'],
    regenMp: ['Regeneração de mana', '% por turno'], summonPct: ['Dano das invocações', '+%'], allStatsPct: ['Todos os atributos', '+%'], xpPct: ['XP ganho', '+%'],
    lowHpAtk: ['Ataque com vida abaixo de 30%', '+%'], revive: ['Renascer (1 vez por batalha)', '% da vida'], lastStand: ['Sobreviver a golpe fatal', '1 vez por batalha']
  };
  L.skillText = function (s) { return (S.SKILL_LORE && S.SKILL_LORE[s.id]) || ''; };
  L.skillSections = function (s, st) {
    var g = [['Tipo', s.type === 'passive' ? 'Passiva (sempre ativa)' : 'Ativa']];
    g.push(['Caminho', s.cls === 'todos' ? 'Todas as classes' : (s.cls === 'secreta' ? 'Secreta' : S.CLASSES[s.cls].name)]);
    if (s.unlock) g.push(['Desbloqueia', 'Nível ' + s.unlock + (st ? (st.level >= s.unlock ? ' ✓' : ' (faltam ' + (s.unlock - st.level) + ')') : '')]);
    if (s.type !== 'passive') {
      g.push(['Custo', s.mp ? s.mp + ' MP' : 'Sem custo de mana']);
      g.push(['Recarga', s.cd ? s.cd + ' turno' + (s.cd > 1 ? 's' : '') + ' após usar' : 'Sem recarga']);
    }
    var secs = [{ title: 'Geral', rows: g }];
    if (s.type === 'passive') {
      var rows = Object.keys(s.passive).map(function (k) {
        var d = PASSIVE[k] || [k, ''], v = s.passive[k];
        if (k === 'lastStand') return [d[0], d[1]];
        return [d[0], d[1].charAt(0) === '+' ? '+' + v + '%' : v + d[1]];
      });
      secs.push({ title: 'Efeito permanente', rows: rows });
    } else secs.push({ title: 'Efeito', rows: skillOpRows(s.ops) });
    return secs;
  };

  /* ---------------- CHEFES ---------------- */
  var ARCH_TEXT = {
    equilibrado: 'Sem pontos fortes nem fracos evidentes.',
    tanque: 'Muita vida e defesa, ataque mais fraco. Batalha longa: leva mana e poções.',
    muralha: 'Resistente, com defesa e vida acima do normal, mas sem a teimosia dos tanques dos portões. Mantém a pressão e passa.',
    feroz: 'Ataque muito alto mas pouca vida e defesa. Mata depressa ou morres depressa.',
    conjurador: 'Usa efeitos: venenos, maldições e drenagem de mana. Leva antídotos.',
    berserker: 'Muita vida e muito ataque, pouca defesa. Fica mais perigoso com o tempo.',
    rei: 'Rei do portão: mais forte em tudo e com uma segunda fase quando a vida baixa.'
  };
  L.archText = function (a) { return ARCH_TEXT[a] || ''; };
  L.bossSkillText = function (k) {
    var sk = S.BOSS_SKILLS[k];
    var parts = sk.ops.map(function (o) {
      switch (o.op) {
        case 'hit': return (o.hits ? o.hits + ' golpes de ' : 'golpe de ') + Math.round(o.mult * 100) + '%' + (o.lifesteal ? ' que lhe devolve ' + pct(o.lifesteal) + ' em vida' : '');
        case 'dot': return DOT[o.type].toLowerCase() + ' durante ' + o.turns + ' turnos';
        case 'stun': return pct(o.chance) + ' de hipótese de te atordoar';
        case 'heal': return 'recupera ' + o.pct + '% da vida';
        case 'shield': return 'escudo de ' + o.pct + '% da vida';
        case 'buff': return '+' + o.val + '% ' + BUFF[o.key] + ' durante ' + o.turns + ' turnos';
        case 'drainMp': return 'rouba ' + o.pct + '% da tua mana';
        case 'debuff': return '-' + o.val + '% da tua ' + BUFF[o.key] + ' durante ' + o.turns + ' turnos';
      }
      return '';
    }).filter(Boolean);
    var t = parts.join(', ');
    return t.charAt(0).toUpperCase() + t.slice(1) + (sk.cd ? ' · recarga ' + sk.cd : '') + '.';
  };
  L.bossText = function (b) { return (S.BOSS_LORE && S.BOSS_LORE[b.id]) || b.lore || ''; };
  L.gateText = function (b) { return (S.GATE_LORE && S.GATE_LORE[b.gate]) || ''; };

  /* ---------------- TROFÉUS ---------------- */
  L.trophyText = function (b) { return S.TROPHY_LORE ? S.TROPHY_LORE(b) : ''; };
})(globalThis.SYS = globalThis.SYS || {});
