/* ==========================================================
   HABILIDADES
   ops:
     dmg   {kind:'phys'|'mag'|'def'|'best', mult, hits, pierce(0-1), crit(+%), alwaysCrit, execute:{below,mult}, lifesteal(0-1)}
     dot   {type:'burn'|'poison'|'bleed', mult, turns}   (dano por turno = mult x ataque)
     stun  {chance(0-1), turns}
     heal  {pct}            shield {pct}     mp {pct}
     buff  {key:'atk'|'matk'|'def'|'crit'|'eva'|'lifesteal'|'reflect', val, turns}
     debuff{key:'atk'|'def', val, turns}       (no chefe, val em %)
     summon{name, mult, turns}                 (ataca sozinho todos os turnos)
     resetCd {}
   passive: hpPct, mpPct, atkPct, matkPct, defPct, crit, critDmg, eva, regenHp, regenMp,
            summonPct, lastStand, revive, lowHpAtk, allStatsPct, xpPct
   ========================================================== */
(function (S) {
  'use strict';

  function A(id, name, lvl, mp, cd, desc, ops) { return { id: id, name: name, unlock: lvl, type: 'active', mp: mp, cd: cd, desc: desc, ops: ops }; }
  function P(id, name, lvl, desc, passive) { return { id: id, name: name, unlock: lvl, type: 'passive', desc: desc, passive: passive }; }

  S.CLASS_SKILLS = {
    guerreiro: [
      A('g1', 'Golpe Pesado', 1, 5, 0, 'Golpe físico de 160%.', [{ op: 'dmg', kind: 'phys', mult: 1.6 }]),
      A('g2', 'Grito de Guerra', 5, 10, 4, '+30% ataque durante 3 turnos.', [{ op: 'buff', key: 'atk', val: 30, turns: 3 }]),
      A('g3', 'Investida Brutal', 10, 14, 3, 'Dano de 220% com 30% de hipótese de atordoar.', [{ op: 'dmg', kind: 'phys', mult: 2.2 }, { op: 'stun', chance: 0.3, turns: 1 }]),
      P('g4', 'Pele de Pedra', 20, '+15% defesa permanente.', { defPct: 15 }),
      A('g5', 'Lâmina Giratória', 30, 22, 3, 'Três golpes de 90%.', [{ op: 'dmg', kind: 'phys', mult: 0.9, hits: 3 }]),
      A('g6', 'Fúria Sanguinária', 45, 25, 5, '+50% ataque e 20% de roubo de vida durante 3 turnos.', [{ op: 'buff', key: 'atk', val: 50, turns: 3 }, { op: 'buff', key: 'lifesteal', val: 20, turns: 3 }]),
      A('g7', 'Quebra-Armadura', 60, 30, 4, 'Dano de 250% que ignora 40% da defesa e reduz a defesa do chefe em 25%.', [{ op: 'dmg', kind: 'phys', mult: 2.5, pierce: 0.4 }, { op: 'debuff', key: 'def', val: 25, turns: 3 }]),
      A('g8', 'Corte do Titã', 80, 45, 5, 'Golpe colossal de 450%.', [{ op: 'dmg', kind: 'phys', mult: 4.5 }]),
      A('g9', 'Ira do Rei Guerreiro', 100, 70, 7, 'Dano de 700% e +40% ataque durante 3 turnos.', [{ op: 'dmg', kind: 'phys', mult: 7 }, { op: 'buff', key: 'atk', val: 40, turns: 3 }]),
      A('g10', 'Pontapé Atordoante', 3, 4, 3, 'Dano de 80% com 35% de hipótese de atordoar.', [{ op: 'dmg', kind: 'phys', mult: 0.8 }, { op: 'stun', chance: 0.35, turns: 1 }]),
      A('g11', 'Corte Flamejante', 8, 8, 2, 'Dano de 140% e queimadura durante 3 turnos.', [{ op: 'dmg', kind: 'phys', mult: 1.4 }, { op: 'dot', type: 'burn', mult: 0.35, turns: 3 }]),
      P('g12', 'Instinto de Batalha', 14, '+8% ataque permanente.', { atkPct: 8 }),
      A('g13', 'Rugido do Senhor da Guerra', 25, 18, 5, 'Reduz o ataque do chefe em 25% e a defesa em 15% durante 3 turnos.', [{ op: 'debuff', key: 'atk', val: 25, turns: 3 }, { op: 'debuff', key: 'def', val: 15, turns: 3 }]),
      A('g14', 'Estandarte de Guerra', 38, 22, 6, '+25% ataque e +25% defesa durante 4 turnos.', [{ op: 'buff', key: 'atk', val: 25, turns: 4 }, { op: 'buff', key: 'def', val: 25, turns: 4 }]),
      A('g15', 'Lâmina de Brasas', 52, 28, 3, 'Três golpes de 140% e queimadura forte.', [{ op: 'dmg', kind: 'phys', mult: 1.4, hits: 3 }, { op: 'dot', type: 'burn', mult: 0.5, turns: 3 }]),
      P('g16', 'Sangue de Ferro', 70, '+15% vida máxima e regenera 1% de vida por turno.', { hpPct: 15, regenHp: 1 }),
      A('g17', 'Chuva de Espadas', 88, 55, 5, 'Sete espadas caem do céu, 80% cada.', [{ op: 'dmg', kind: 'phys', mult: 0.8, hits: 7 }]),
      A('g18', 'Fénix da Guerra', 95, 60, 8, 'Renasce em chamas: recupera 30% da vida e +40% ataque durante 3 turnos.', [{ op: 'heal', pct: 30 }, { op: 'buff', key: 'atk', val: 40, turns: 3 }])
    ],
    assassino: [
      A('a1', 'Corte Rápido', 1, 4, 0, 'Dois cortes de 80%.', [{ op: 'dmg', kind: 'phys', mult: 0.8, hits: 2 }]),
      A('a2', 'Passo Furtivo', 5, 10, 4, '+30% esquiva e +20% crítico durante 2 turnos.', [{ op: 'buff', key: 'eva', val: 30, turns: 2 }, { op: 'buff', key: 'crit', val: 20, turns: 2 }]),
      A('a3', 'Lâmina Envenenada', 10, 12, 3, 'Dano de 120% e veneno durante 3 turnos.', [{ op: 'dmg', kind: 'phys', mult: 1.2 }, { op: 'dot', type: 'poison', mult: 0.5, turns: 3 }]),
      P('a4', 'Instinto Assassino', 20, '+10% crítico e +30% dano crítico.', { crit: 10, critDmg: 30 }),
      A('a5', 'Dança das Lâminas', 30, 22, 3, 'Cinco golpes de 70%.', [{ op: 'dmg', kind: 'phys', mult: 0.7, hits: 5 }]),
      A('a6', 'Marca da Morte', 45, 25, 5, 'Reduz a defesa do chefe em 30% e causa sangramento.', [{ op: 'debuff', key: 'def', val: 30, turns: 3 }, { op: 'dot', type: 'bleed', mult: 0.6, turns: 3 }]),
      A('a7', 'Execução', 60, 32, 4, 'Dano de 250%. Dano a dobrar se o chefe tiver menos de 30% de vida.', [{ op: 'dmg', kind: 'phys', mult: 2.5, execute: { below: 0.3, mult: 2 } }]),
      A('a8', 'Mil Cortes', 80, 45, 5, 'Dez golpes de 60%.', [{ op: 'dmg', kind: 'phys', mult: 0.6, hits: 10 }]),
      A('a9', 'Golpe do Vazio', 100, 70, 7, 'Dano de 650% crítico garantido que ignora toda a defesa.', [{ op: 'dmg', kind: 'phys', mult: 6.5, pierce: 1, alwaysCrit: true }]),
      A('a10', 'Bomba de Fumo', 3, 5, 4, '+25% esquiva durante 2 turnos.', [{ op: 'buff', key: 'eva', val: 25, turns: 2 }]),
      A('a11', 'Golpe pelas Costas', 8, 8, 2, 'Dano de 150% com +25% crítico.', [{ op: 'dmg', kind: 'phys', mult: 1.5, crit: 25 }]),
      P('a12', 'Passos Leves', 14, '+4% esquiva e +3% crítico.', { eva: 4, crit: 3 }),
      A('a13', 'Corte Hemorrágico', 25, 16, 3, 'Dano de 120% e sangramento forte durante 3 turnos.', [{ op: 'dmg', kind: 'phys', mult: 1.2 }, { op: 'dot', type: 'bleed', mult: 0.7, turns: 3 }]),
      A('a14', 'Clones das Sombras', 38, 24, 6, 'Um clone das sombras ataca durante 4 turnos.', [{ op: 'summon', name: 'Clone das Sombras', mult: 0.9, turns: 4 }]),
      A('a15', 'Lâmina do Corvo', 52, 28, 3, 'Quatro golpes de 90% com 15% de roubo de vida.', [{ op: 'dmg', kind: 'phys', mult: 0.9, hits: 4, lifesteal: 0.15 }]),
      P('a16', 'Veneno Letal', 70, '+25% dano crítico.', { critDmg: 25 }),
      A('a17', 'Eclipse Silencioso', 88, 50, 6, 'Reduz a defesa do chefe em 35% com 50% de hipótese de atordoar.', [{ op: 'debuff', key: 'def', val: 35, turns: 3 }, { op: 'stun', chance: 0.5, turns: 1 }]),
      A('a18', 'Dança da Lua Negra', 95, 60, 6, 'Oito golpes de 75% com +20% crítico.', [{ op: 'dmg', kind: 'phys', mult: 0.75, hits: 8, crit: 20 }])
    ],
    mago: [
      A('m1', 'Seta Arcana', 1, 5, 0, 'Projétil mágico de 160%.', [{ op: 'dmg', kind: 'mag', mult: 1.6 }]),
      A('m2', 'Bola de Fogo', 5, 12, 2, 'Dano mágico de 200% e queimadura durante 3 turnos.', [{ op: 'dmg', kind: 'mag', mult: 2.0 }, { op: 'dot', type: 'burn', mult: 0.4, turns: 3 }]),
      A('m3', 'Barreira Mágica', 10, 15, 4, 'Escudo igual a 25% da vida máxima.', [{ op: 'shield', pct: 25 }]),
      P('m4', 'Fluxo de Mana', 20, 'Recupera 5% de mana por turno e +10% ataque mágico.', { regenMp: 5, matkPct: 10 }),
      A('m5', 'Lança de Gelo', 30, 24, 3, 'Dano mágico de 260% com 35% de hipótese de congelar.', [{ op: 'dmg', kind: 'mag', mult: 2.6 }, { op: 'stun', chance: 0.35, turns: 1 }]),
      A('m6', 'Tempestade de Raios', 45, 30, 4, 'Quatro raios de 100%.', [{ op: 'dmg', kind: 'mag', mult: 1.0, hits: 4 }]),
      A('m7', 'Meteoro', 60, 45, 5, 'Dano mágico de 420% e queimadura forte.', [{ op: 'dmg', kind: 'mag', mult: 4.2 }, { op: 'dot', type: 'burn', mult: 0.6, turns: 3 }]),
      A('m8', 'Colapso Dimensional', 80, 60, 6, 'Dano mágico de 550% que ignora 50% da defesa.', [{ op: 'dmg', kind: 'mag', mult: 5.5, pierce: 0.5 }]),
      A('m9', 'Juízo Arcano', 100, 90, 7, 'Dano mágico de 900%.', [{ op: 'dmg', kind: 'mag', mult: 9 }]),
      A('m10', 'Escudo de Gelo', 3, 6, 4, 'Escudo igual a 15% da vida máxima.', [{ op: 'shield', pct: 15 }]),
      A('m11', 'Corrente Elétrica', 8, 9, 2, 'Três descargas mágicas de 70%.', [{ op: 'dmg', kind: 'mag', mult: 0.7, hits: 3 }]),
      P('m12', 'Mente Arcana', 14, '+15% mana máxima e recupera 2% de mana por turno.', { mpPct: 15, regenMp: 2 }),
      A('m13', 'Nevasca', 25, 20, 4, 'Dano mágico de 150%, 25% de hipótese de congelar e -15% ataque do chefe.', [{ op: 'dmg', kind: 'mag', mult: 1.5 }, { op: 'stun', chance: 0.25, turns: 1 }, { op: 'debuff', key: 'atk', val: 15, turns: 2 }]),
      A('m14', 'Espelho Arcano', 38, 22, 5, 'Devolve 40% do dano recebido durante 3 turnos.', [{ op: 'buff', key: 'reflect', val: 40, turns: 3 }]),
      A('m15', 'Chuva de Estrelas', 52, 32, 4, 'Seis estrelas cadentes de 80%.', [{ op: 'dmg', kind: 'mag', mult: 0.8, hits: 6 }]),
      P('m16', 'Sabedoria Estelar', 70, '+12% ataque mágico.', { matkPct: 12 }),
      A('m17', 'Supernova', 88, 70, 6, 'Dano mágico de 600% e queimadura estelar.', [{ op: 'dmg', kind: 'mag', mult: 6 }, { op: 'dot', type: 'burn', mult: 0.7, turns: 3 }]),
      A('m18', 'Buraco Negro', 95, 65, 7, 'Dano mágico de 300% que ignora 60% da defesa e a reduz em 30%.', [{ op: 'dmg', kind: 'mag', mult: 3, pierce: 0.6 }, { op: 'debuff', key: 'def', val: 30, turns: 3 }])
    ],
    guardiao: [
      A('d1', 'Golpe de Escudo', 1, 4, 0, 'Dano de 160% com 15% de hipótese de atordoar.', [{ op: 'dmg', kind: 'phys', mult: 1.6 }, { op: 'stun', chance: 0.15, turns: 1 }]),
      A('d2', 'Postura de Ferro', 5, 10, 4, '+50% defesa durante 3 turnos.', [{ op: 'buff', key: 'def', val: 50, turns: 3 }]),
      A('d3', 'Desafio Intimidante', 10, 12, 4, 'Reduz o ataque do chefe em 25% durante 3 turnos.', [{ op: 'debuff', key: 'atk', val: 25, turns: 3 }]),
      P('d4', 'Muralha Viva', 20, '+15% vida máxima.', { hpPct: 15 }),
      A('d5', 'Retaliação', 30, 20, 4, 'Devolve 70% do dano recebido durante 3 turnos.', [{ op: 'buff', key: 'reflect', val: 70, turns: 3 }]),
      A('d6', 'Regeneração do Titã', 45, 24, 5, 'Recupera 30% da vida.', [{ op: 'heal', pct: 30 }]),
      A('d7', 'Martelo da Terra', 60, 32, 4, 'Dano de 320% com 40% de hipótese de atordoar.', [{ op: 'dmg', kind: 'phys', mult: 3.2 }, { op: 'stun', chance: 0.4, turns: 1 }]),
      A('d8', 'Fortaleza Inquebrável', 80, 45, 6, 'Escudo de 50% da vida e +40% defesa.', [{ op: 'shield', pct: 50 }, { op: 'buff', key: 'def', val: 40, turns: 3 }]),
      A('d9', 'Impacto do Colosso', 100, 70, 7, 'Dano de 500% baseado na tua defesa.', [{ op: 'dmg', kind: 'def', mult: 5 }]),
      A('d10', 'Provocação', 3, 4, 3, '-15% ataque do chefe e +20% defesa durante 2 turnos.', [{ op: 'debuff', key: 'atk', val: 15, turns: 2 }, { op: 'buff', key: 'def', val: 20, turns: 2 }]),
      A('d11', 'Martelada', 8, 8, 2, 'Golpe de martelo de 180%.', [{ op: 'dmg', kind: 'phys', mult: 1.8 }]),
      P('d12', 'Pele de Bronze', 14, '+10% defesa permanente.', { defPct: 10 }),
      A('d13', 'Barreira Solar', 25, 18, 5, 'Escudo igual a 30% da vida máxima.', [{ op: 'shield', pct: 30 }]),
      A('d14', 'Juramento do Leão', 38, 20, 5, '+30% ataque durante 3 turnos e recupera 10% da vida.', [{ op: 'buff', key: 'atk', val: 30, turns: 3 }, { op: 'heal', pct: 10 }]),
      A('d15', 'Pilares de Pedra', 52, 28, 4, 'Dano de 200% baseado na defesa com 30% de hipótese de atordoar.', [{ op: 'dmg', kind: 'def', mult: 2 }, { op: 'stun', chance: 0.3, turns: 1 }]),
      P('d16', 'Coração de Pedra', 70, '+15% vida máxima e regenera 1% de vida por turno.', { hpPct: 15, regenHp: 1 }),
      A('d17', 'Cúpula Hexagonal', 88, 50, 7, 'Escudo de 60% da vida e devolve 50% do dano durante 3 turnos.', [{ op: 'shield', pct: 60 }, { op: 'buff', key: 'reflect', val: 50, turns: 3 }]),
      A('d18', 'Sol Implacável', 95, 60, 6, 'Dano de 350% baseado na defesa e queimadura solar.', [{ op: 'dmg', kind: 'def', mult: 3.5 }, { op: 'dot', type: 'burn', mult: 0.6, turns: 3 }])
    ],
    arqueiro: [
      A('r1', 'Tiro Certeiro', 1, 4, 0, 'Dano de 150% com +15% crítico.', [{ op: 'dmg', kind: 'phys', mult: 1.5, crit: 15 }]),
      A('r2', 'Olho de Águia', 5, 10, 4, '+25% crítico durante 3 turnos.', [{ op: 'buff', key: 'crit', val: 25, turns: 3 }]),
      A('r3', 'Flecha Dupla', 10, 12, 2, 'Duas flechas de 110%.', [{ op: 'dmg', kind: 'phys', mult: 1.1, hits: 2 }]),
      P('r4', 'Visão Aguçada', 20, '+8% crítico e +5% esquiva.', { crit: 8, eva: 5 }),
      A('r5', 'Chuva de Flechas', 30, 22, 3, 'Seis flechas de 60%.', [{ op: 'dmg', kind: 'phys', mult: 0.6, hits: 6 }]),
      A('r6', 'Flecha Perfurante', 45, 26, 4, 'Dano de 280% que ignora 60% da defesa.', [{ op: 'dmg', kind: 'phys', mult: 2.8, pierce: 0.6 }]),
      A('r7', 'Flecha Explosiva', 60, 34, 4, 'Dano de 300% e queimadura.', [{ op: 'dmg', kind: 'phys', mult: 3 }, { op: 'dot', type: 'burn', mult: 0.5, turns: 3 }]),
      A('r8', 'Tiro do Falcão Celeste', 80, 48, 5, 'Dano de 500% com +30% crítico.', [{ op: 'dmg', kind: 'phys', mult: 5, crit: 30 }]),
      A('r9', 'Flecha do Firmamento', 100, 75, 7, 'Oito flechas de 120%.', [{ op: 'dmg', kind: 'phys', mult: 1.2, hits: 8 }]),
      A('r10', 'Flecha Rápida', 3, 3, 1, 'Flecha rápida de 110% com +10% crítico.', [{ op: 'dmg', kind: 'phys', mult: 1.1, crit: 10 }]),
      A('r11', 'Armadilha de Espinhos', 8, 8, 3, 'Sangramento durante 3 turnos e -10% defesa do chefe.', [{ op: 'dot', type: 'bleed', mult: 0.6, turns: 3 }, { op: 'debuff', key: 'def', val: 10, turns: 3 }]),
      P('r12', 'Mão Firme', 14, '+5% crítico e +15% dano crítico.', { crit: 5, critDmg: 15 }),
      A('r13', 'Falcão Companheiro', 25, 18, 5, 'Um falcão ataca durante 4 turnos.', [{ op: 'summon', name: 'Falcão', mult: 0.7, turns: 4 }]),
      A('r14', 'Rajada de Vento', 38, 22, 4, 'Três flechas de 100% e +20% esquiva durante 2 turnos.', [{ op: 'dmg', kind: 'phys', mult: 1, hits: 3 }, { op: 'buff', key: 'eva', val: 20, turns: 2 }]),
      A('r15', 'Flecha do Trovão', 52, 30, 4, 'Dano de 260% com 35% de hipótese de atordoar.', [{ op: 'dmg', kind: 'phys', mult: 2.6 }, { op: 'stun', chance: 0.35, turns: 1 }]),
      P('r16', 'Olho da Tempestade', 70, '+8% crítico.', { crit: 8 }),
      A('r17', 'Espírito da Águia', 88, 50, 6, 'Uma águia espiritual ataca durante 5 turnos.', [{ op: 'summon', name: 'Águia Espiritual', mult: 1.8, turns: 5 }]),
      A('r18', 'Tempestade de Relâmpagos', 95, 65, 6, 'Nove relâmpagos de 90% com 30% de hipótese de atordoar.', [{ op: 'dmg', kind: 'phys', mult: 0.9, hits: 9 }, { op: 'stun', chance: 0.3, turns: 1 }])
    ],
    invocador: [
      A('i1', 'Toque Espectral', 1, 5, 0, 'Dano mágico de 150% com 15% de roubo de vida.', [{ op: 'dmg', kind: 'mag', mult: 1.5, lifesteal: 0.15 }]),
      A('i2', 'Invocar Esqueleto', 5, 14, 5, 'Um esqueleto ataca durante 4 turnos.', [{ op: 'summon', name: 'Esqueleto', mult: 0.5, turns: 4 }]),
      A('i3', 'Drenar Vida', 10, 14, 3, 'Dano mágico de 160% com 50% de roubo de vida.', [{ op: 'dmg', kind: 'mag', mult: 1.6, lifesteal: 0.5 }]),
      P('i4', 'Pacto Espectral', 20, '+20% dano das invocações e +5% ataque mágico.', { summonPct: 20, matkPct: 5 }),
      A('i5', 'Invocar Cavaleiro Espectral', 30, 26, 6, 'Um cavaleiro ataca durante 5 turnos.', [{ op: 'summon', name: 'Cavaleiro Espectral', mult: 0.9, turns: 5 }]),
      A('i6', 'Maldição da Fraqueza', 45, 24, 4, 'Reduz o ataque do chefe em 30% e a defesa em 20%.', [{ op: 'debuff', key: 'atk', val: 30, turns: 3 }, { op: 'debuff', key: 'def', val: 20, turns: 3 }]),
      A('i7', 'Legião Espectral', 60, 40, 7, 'Uma legião ataca durante 5 turnos.', [{ op: 'summon', name: 'Legião Espectral', mult: 1.2, turns: 5 }]),
      A('i8', 'Explosão de Almas', 80, 52, 5, 'Dano mágico de 500%.', [{ op: 'dmg', kind: 'mag', mult: 5 }]),
      A('i9', 'Exército Eterno', 100, 85, 8, 'Dano mágico de 300% e um exército que ataca durante 6 turnos.', [{ op: 'dmg', kind: 'mag', mult: 3 }, { op: 'summon', name: 'Exército Eterno', mult: 2.2, turns: 6 }]),
      A('i10', 'Fogo-Fátuo', 3, 5, 2, 'Dano mágico de 100% e queimadura espectral.', [{ op: 'dmg', kind: 'mag', mult: 1 }, { op: 'dot', type: 'burn', mult: 0.3, turns: 3 }]),
      A('i11', 'Corrente de Almas', 8, 9, 3, 'Dano mágico de 130% e -15% ataque do chefe.', [{ op: 'dmg', kind: 'mag', mult: 1.3 }, { op: 'debuff', key: 'atk', val: 15, turns: 2 }]),
      P('i12', 'Lanterna das Almas', 14, 'Recupera 3% de mana por turno.', { regenMp: 3 }),
      A('i13', 'Cães Espectrais', 25, 18, 5, 'Uma matilha espectral ataca durante 4 turnos.', [{ op: 'summon', name: 'Cães Espectrais', mult: 0.8, turns: 4 }]),
      A('i14', 'Escudo de Ossos', 38, 20, 5, 'Escudo igual a 25% da vida máxima.', [{ op: 'shield', pct: 25 }]),
      A('i15', 'Colheita de Almas', 52, 30, 4, 'Dano mágico de 240% com 40% de roubo de vida.', [{ op: 'dmg', kind: 'mag', mult: 2.4, lifesteal: 0.4 }]),
      P('i16', 'Senhor dos Mortos', 70, '+25% dano das invocações.', { summonPct: 25 }),
      A('i17', 'Titã Espectral', 88, 60, 7, 'Um titã espectral ataca durante 5 turnos.', [{ op: 'summon', name: 'Titã Espectral', mult: 2.6, turns: 5 }]),
      A('i18', 'Mar de Almas', 95, 65, 6, 'Cinco ondas de almas de 100% com 25% de roubo de vida.', [{ op: 'dmg', kind: 'mag', mult: 1, hits: 5, lifesteal: 0.25 }])
    ]
  };

  S.COMMON_SKILLS = [
    A('c1', 'Concentração', 15, 0, 5, 'Recupera 25% da mana.', [{ op: 'mp', pct: 25 }]),
    A('c2', 'Segundo Fôlego', 25, 15, 6, 'Recupera 25% da vida.', [{ op: 'heal', pct: 25 }]),
    P('c3', 'Sexto Sentido', 40, '+5% esquiva.', { eva: 5 }),
    P('c4', 'Vontade Inabalável', 70, 'Uma vez por batalha, sobrevive a um golpe fatal com 1 de vida.', { lastStand: 1 }),
    A('c5', 'Respirar Fundo', 10, 0, 6, 'Recupera 12% da vida sem gastar mana.', [{ op: 'heal', pct: 12 }]),
    P('c6', 'Foco de Combate', 55, '+3% crítico e +10% dano crítico.', { crit: 3, critDmg: 10 })
  ];

  /* Habilidades secretas: só aparecem quando desbloqueadas (pista enigmática antes) */
  S.SECRET_SKILLS = [
    Object.assign(A('s1', 'Lâmina do Despertar', 0, 30, 4, 'Dano de 350% usando o teu melhor ataque (físico ou mágico).', [{ op: 'dmg', kind: 'best', mult: 3.5 }]),
      { hint: 'Derrota o rei do primeiro portão.' }),
    Object.assign(P('s2', 'Coração de Dragão', 0, '+5% em todos os atributos.', { allStatsPct: 5 }),
      { hint: 'Vence a guardiã do inverno eterno.' }),
    Object.assign(A('s3', 'Olhar do Rei', 0, 35, 6, '60% de hipótese de atordoar e reduz o ataque do chefe em 40%.', [{ op: 'stun', chance: 0.6, turns: 1 }, { op: 'debuff', key: 'atk', val: 40, turns: 3 }]),
      { hint: 'Derruba três inimigos mais fortes do que tu.' }),
    Object.assign(P('s4', 'Renascer das Cinzas', 0, 'Uma vez por batalha, ao morrer, renasce com 30% de vida.', { revive: 30 }),
      { hint: 'Quem cai muitas vezes aprende a levantar-se.' }),
    Object.assign(A('s5', 'Domínio do Tempo', 0, 50, 8, 'Para o tempo: o chefe perde o próximo turno e as tuas recargas são reiniciadas.', [{ op: 'stun', chance: 1, turns: 1 }, { op: 'resetCd' }]),
      { hint: 'Algo partido guarda o segredo do tempo.' }),
    Object.assign(P('s6', 'Caminho do Monge', 0, 'Recupera 4% de vida por turno.', { regenHp: 4 }),
      { hint: 'Trinta dias sem falhar o treino do sistema.' }),
    Object.assign(P('s7', 'Ira dos Vencidos', 0, '+25% ataque quando a vida está abaixo de 30%.', { lowHpAtk: 25 }),
      { hint: 'A derrota é a melhor professora.' }),
    Object.assign(A('s8', 'Autoridade do Sistema', 0, 80, 8, 'Dano de 600% (melhor ataque), ignora 50% da defesa e recupera 20% da vida.', [{ op: 'dmg', kind: 'best', mult: 6, pierce: 0.5 }, { op: 'heal', pct: 20 }]),
      { hint: 'Reúne o que foi partido em cinco.' }),
    Object.assign(A('s9', 'Golpe Absoluto', 0, 120, 10, 'Dano de 1500% (melhor ataque) que ignora toda a defesa.', [{ op: 'dmg', kind: 'best', mult: 15, pierce: 1 }]),
      { hint: 'Senta-te no trono do vazio.' }),
    Object.assign(P('s10', 'Sabedoria Ancestral', 0, '+10% XP em tudo.', { xpPct: 10 }),
      { hint: 'Faz do sistema um hábito de cem dias.' })
  ];

  Object.keys(S.CLASS_SKILLS).forEach(function (c) { S.CLASS_SKILLS[c].sort(function (x, y) { return x.unlock - y.unlock; }); });
  S.COMMON_SKILLS.sort(function (x, y) { return x.unlock - y.unlock; });
  S.ALL_SKILLS = {};
  Object.keys(S.CLASS_SKILLS).forEach(function (c) {
    S.CLASS_SKILLS[c].forEach(function (s) { s.cls = c; S.ALL_SKILLS[s.id] = s; });
  });
  S.COMMON_SKILLS.forEach(function (s) { s.cls = 'todos'; S.ALL_SKILLS[s.id] = s; });
  S.SECRET_SKILLS.forEach(function (s) { s.cls = 'secreta'; s.secret = true; S.ALL_SKILLS[s.id] = s; });
})(globalThis.SYS = globalThis.SYS || {});
