/* ==========================================================
   CONQUISTAS — reward: {chest, coins, item, skill}
   secret: true → aparece como "???" até ser desbloqueada
   ========================================================== */
(function (S) {
  'use strict';
  function c(st, k) { return (st.c && st.c[k]) || 0; }
  function allStatsAtLeast(st, n) {
    var t = S.engine.totalStats(st);
    return S.STATS.every(function (k) { return t[k] >= n; });
  }

  S.ACHIEVEMENTS = [
    // Missões
    { id: 'm1', icon: '✅', name: 'Primeiro Passo', desc: 'Conclui 1 missão.', check: function (s) { return c(s, 'missionsDone') >= 1; }, reward: { chest: 'comum' } },
    { id: 'm10', icon: '📋', name: 'Disciplinado', desc: 'Conclui 10 missões.', check: function (s) { return c(s, 'missionsDone') >= 10; }, reward: { chest: 'raro' } },
    { id: 'm50', icon: '📈', name: 'Constante', desc: 'Conclui 50 missões.', check: function (s) { return c(s, 'missionsDone') >= 50; }, reward: { chest: 'raro', coins: 500 } },
    { id: 'm100', icon: '🏋️', name: 'Incansável', desc: 'Conclui 100 missões.', check: function (s) { return c(s, 'missionsDone') >= 100; }, reward: { chest: 'epico' } },
    { id: 'm500', icon: '🤖', name: 'Máquina Imparável', desc: 'Conclui 500 missões.', check: function (s) { return c(s, 'missionsDone') >= 500; }, reward: { chest: 'lendario' } },
    { id: 'mS', icon: '🔥', name: 'Sem Limites', desc: 'Conclui uma missão de dificuldade S.', check: function (s) { return c(s, 'missionsS') >= 1; }, reward: { chest: 'raro' } },
    // Missão diária do sistema
    { id: 'd1', icon: '🌅', name: 'Dia Perfeito', desc: 'Conclui a Missão Diária do Sistema.', check: function (s) { return c(s, 'dailyDone') >= 1; }, reward: { chest: 'comum' } },
    { id: 'd7', icon: '📅', name: 'Hábito Forjado', desc: '7 dias seguidos de Missão Diária.', check: function (s) { return s.daily.bestStreak >= 7; }, reward: { chest: 'raro' } },
    { id: 'd30', icon: '🧘', name: 'Mente de Aço', desc: '30 dias seguidos de Missão Diária.', check: function (s) { return s.daily.bestStreak >= 30; }, reward: { chest: 'epico', skill: 's6' } },
    { id: 'd100', icon: '🏯', name: 'Lenda da Disciplina', desc: '100 dias seguidos de Missão Diária.', check: function (s) { return s.daily.bestStreak >= 100; }, reward: { chest: 'lendario', skill: 's10' } },
    // Níveis
    { id: 'l5', icon: '⭐', name: 'A Despertar', desc: 'Chega ao nível 5.', check: function (s) { return s.level >= 5; }, reward: { coins: 200 } },
    { id: 'l10', icon: '🌟', name: 'Rank D', desc: 'Chega ao nível 11.', check: function (s) { return s.level >= 11; }, reward: { chest: 'raro' } },
    { id: 'l25', icon: '💫', name: 'Ascensão', desc: 'Chega ao nível 25.', check: function (s) { return s.level >= 25; }, reward: { chest: 'epico' } },
    { id: 'l50', icon: '🌠', name: 'Meio Caminho', desc: 'Chega ao nível 50.', check: function (s) { return s.level >= 50; }, reward: { chest: 'lendario' } },
    { id: 'l75', icon: '☄️', name: 'Imparável', desc: 'Chega ao nível 75.', check: function (s) { return s.level >= 75; }, reward: { chest: 'lendario', coins: 10000 } },
    { id: 'l100', icon: '♾️', name: 'O Absoluto', desc: 'Chega ao nível 100.', check: function (s) { return s.level >= 100; }, reward: { chest: 'secreto' } },
    // Combate
    { id: 'b1', icon: '🩸', name: 'Primeiro Sangue', desc: 'Derrota 1 chefe.', check: function (s) { return c(s, 'bossesKilled') >= 1; }, reward: { chest: 'comum' } },
    { id: 'b10', icon: '⚔️', name: 'Caçador de Chefes', desc: 'Derrota 10 chefes.', check: function (s) { return c(s, 'bossesKilled') >= 10; }, reward: { chest: 'raro' } },
    { id: 'b25', icon: '🗡️', name: 'Exterminador', desc: 'Derrota 25 chefes.', check: function (s) { return c(s, 'bossesKilled') >= 25; }, reward: { chest: 'epico' } },
    { id: 'b50', icon: '🏆', name: 'Metade do Mundo', desc: 'Derrota 50 chefes.', check: function (s) { return c(s, 'bossesKilled') >= 50; }, reward: { chest: 'lendario' } },
    { id: 'b100', icon: '👑', name: 'Conquistador Absoluto', desc: 'Derrota os 100 chefes.', check: function (s) { return S.BOSSES.every(function (b) { return s.defeated[b.id]; }); }, reward: { chest: 'secreto' } },
    { id: 'giant', icon: '🦣', name: 'Matador de Gigantes', desc: 'Vence um chefe 5+ níveis acima de ti.', check: function (s) { return c(s, 'giantKills') >= 1; }, reward: { chest: 'epico' } },
    { id: 'giant3', icon: '👁️‍🗨️', name: '???', realName: 'Olhar do Rei', secret: true, desc: 'Vence 3 chefes 5+ níveis acima de ti.', check: function (s) { return c(s, 'giantKills') >= 3; }, reward: { skill: 's3', chest: 'epico' } },
    { id: 'clutch', icon: '😮‍💨', name: 'Por Um Fio', desc: 'Vence um chefe com menos de 10% de vida.', check: function (s) { return c(s, 'lowHpWins') >= 1; }, reward: { chest: 'raro' } },
    { id: 'flawless', icon: '✨', name: 'Intocável', desc: 'Vence um chefe de nível 10+ sem sofrer dano.', check: function (s) { return c(s, 'flawlessWins') >= 1; }, reward: { chest: 'epico' } },
    { id: 'lose5', icon: '🥀', name: '???', realName: 'Cair e Levantar', secret: true, desc: 'Perde 5 batalhas.', check: function (s) { return c(s, 'battlesLost') >= 5; }, reward: { skill: 's7' } },
    { id: 'lose15', icon: '🔥', name: '???', realName: 'Das Cinzas', secret: true, desc: 'Perde 15 batalhas.', check: function (s) { return c(s, 'battlesLost') >= 15; }, reward: { skill: 's4' } },
    { id: 'brave', icon: '🫡', name: '???', realName: 'Coragem Cega', secret: true, desc: 'Enfrenta um chefe 20+ níveis acima de ti.', check: function (s) { return c(s, 'braveFights') >= 1; }, reward: { chest: 'raro' } },
    { id: 'secretboss', icon: '🗝️', name: '???', realName: 'O Portão Oculto', secret: true, desc: 'Derrota o Guardião do Portão Oculto.', check: function (s) { return !!s.defeated.secret_1; }, reward: { chest: 'secreto' } },
    { id: 'architect', icon: '💠', name: '???', realName: 'Verdade do Sistema', secret: true, desc: 'Derrota o Arquiteto do Sistema.', check: function (s) { return !!s.defeated.secret_2; }, reward: { chest: 'secreto', coins: 50000 } },
    // Troféus
    { id: 'tr25', icon: '🏆', name: 'Sala de Troféus', desc: 'Junta 25 troféus de chefes.', check: function (s) { return Object.keys(s.trophies || {}).length >= 25; }, reward: { chest: 'epico' } },
    { id: 'set1', icon: '🥇', name: 'Conjunto Completo', desc: 'Junta os 10 troféus de um portão.', check: function (s) { return S.engine.completedSets(s).filter(function (g) { return g > 0; }).length >= 1; }, reward: { chest: 'epico' } },
    { id: 'set5', icon: '🎖️', name: 'Curador de Portões', desc: 'Completa os troféus de 5 portões.', check: function (s) { return S.engine.completedSets(s).filter(function (g) { return g > 0; }).length >= 5; }, reward: { chest: 'lendario' } },
    // Economia e itens
    { id: 'rich', icon: '💰', name: 'Bolso Cheio', desc: 'Ganha 10 000 moedas no total.', check: function (s) { return c(s, 'coinsEarned') >= 10000; }, reward: { chest: 'raro' } },
    { id: 'rich2', icon: '🏦', name: 'Magnata', desc: 'Ganha 100 000 moedas no total.', check: function (s) { return c(s, 'coinsEarned') >= 100000; }, reward: { chest: 'lendario' } },
    { id: 'spend', icon: '🛒', name: 'Bom Cliente', desc: 'Gasta 5 000 moedas.', check: function (s) { return c(s, 'coinsSpent') >= 5000; }, reward: { chest: 'raro' } },
    { id: 'leisure', icon: '🎉', name: 'Equilíbrio', desc: 'Usa 10 recompensas de lazer.', check: function (s) { return c(s, 'leisureUsed') >= 10; }, reward: { chest: 'raro' } },
    { id: 'collector', icon: '🗃️', name: 'Colecionador', desc: 'Obtém 25 itens diferentes.', check: function (s) { return Object.keys(s.seen || {}).length >= 25; }, reward: { chest: 'epico' } },
    { id: 'arsenal', icon: '🗡️', name: 'Arsenal', desc: 'Obtém 6 armas diferentes.', check: function (s) { return Object.keys(s.seen || {}).filter(function (id) { return S.ITEMS[id] && S.ITEMS[id].cat === 'arma'; }).length >= 6; }, reward: { chest: 'raro' } },
    { id: 'chest25', icon: '📦', name: 'Caçador de Tesouros', desc: 'Abre 25 baús.', check: function (s) { return c(s, 'chestsOpened') >= 25; }, reward: { chest: 'epico' } },
    { id: 'chest100', icon: '🏴‍☠️', name: 'Pirata Lendário', desc: 'Abre 100 baús.', check: function (s) { return c(s, 'chestsOpened') >= 100; }, reward: { chest: 'lendario' } },
    { id: 'secretchest', icon: '🗝️', name: '???', realName: 'Segredo Revelado', secret: true, desc: 'Abre um Baú Secreto.', check: function (s) { return c(s, 'secretChests') >= 1; }, reward: { coins: 3000 } },
    { id: 'potions', icon: '🧪', name: 'Alquimista', desc: 'Usa 50 consumíveis.', check: function (s) { return c(s, 'consumablesUsed') >= 50; }, reward: { chest: 'raro' } },
    { id: 'core', icon: '💠', name: '???', realName: 'Cinco em Um', secret: true, desc: 'Forma o Núcleo do Sistema.', check: function (s) { return c(s, 'coresMade') >= 1; }, reward: { chest: 'lendario' } },
    // Atributos
    { id: 'points', icon: '📊', name: 'Pontos Bem Gastos', desc: 'Distribui 50 pontos de atributo.', check: function (s) { return c(s, 'pointsAllocated') >= 50; }, reward: { chest: 'raro' } },
    { id: 'all50', icon: '🧬', name: 'Mestre de Tudo', desc: 'Todos os atributos a 50 ou mais.', check: function (s) { return allStatsAtLeast(s, 50); }, reward: { chest: 'lendario' } },
    // Segredos de horário
    { id: 'night', icon: '🦉', name: '???', realName: 'Noctívago', secret: true, desc: 'Conclui uma missão entre a meia-noite e as 4h.', check: function (s) { return c(s, 'nightMissions') >= 1; }, reward: { chest: 'raro' } },
    { id: 'early', icon: '🐓', name: '???', realName: 'Madrugador', secret: true, desc: 'Conclui uma missão entre as 5h e as 7h.', check: function (s) { return c(s, 'earlyMissions') >= 1; }, reward: { chest: 'raro' } },
    { id: 'fail1', icon: '💢', name: '???', realName: 'Lição Aprendida', secret: true, desc: 'Falha uma missão pela primeira vez.', check: function (s) { return c(s, 'missionsFailed') >= 1; }, reward: { item: 'po_escudo' } }
  ];
  S.ACH_BY_ID = {};
  S.ACHIEVEMENTS.forEach(function (a) { S.ACH_BY_ID[a.id] = a; });
})(globalThis.SYS = globalThis.SYS || {});
