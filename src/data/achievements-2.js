/* ==========================================================
   CONQUISTAS II — sombras, Coliseu, troféus, Loja Exclusiva, corpo,
   missões, combate e economia (atualização)
   ========================================================== */
(function (S) {
  'use strict';
  function c(st, k) { return (st.c && st.c[k]) || 0; }
  function allStatsAtLeast(st, n) { var t = S.engine.totalStats(st); return S.STATS.every(function (k) { return t[k] >= n; }); }
  function sh(st) {
    var x = st.shadows || {}, own = Object.keys(x.owned || {});
    return { owned: own.length, kings: own.filter(function (id) { var b = S.BOSS_BY_ID[id]; return b && b.king && !b.premium; }).length,
      arena: own.filter(function (id) { var b = S.BOSS_BY_ID[id]; return b && b.premium; }).length,
      champs: own.filter(function (id) { var b = S.BOSS_BY_ID[id]; return b && b.champion; }).length,
      lost: Math.max((st.c && st.c.shadowsLost) || 0, Object.keys(x.lost || {}).length), named: Object.keys(x.names || {}).length, active: (x.active || []).length };
  }
  function arena(st) {
    var w = (st.arena && st.arena.wins) || {}, ids = Object.keys(w);
    return { guards: ids.filter(function (id) { var b = S.BOSS_BY_ID[id]; return b && b.guardian; }).length,
      lieuts: ids.filter(function (id) { var b = S.BOSS_BY_ID[id]; return b && b.lieutenant; }).length,
      champs: ids.filter(function (id) { var b = S.BOSS_BY_ID[id]; return b && b.champion; }).length,
      rematches: ids.reduce(function (t, id) { return t + Math.max(0, w[id] - 1); }, 0) };
  }
  function bodyGoal(st) {
    var b = st.body; if (!b || !b.weights || b.weights.length < 2) return false;
    var d = b.weights[b.weights.length - 1].kg - b.weights[0].kg;
    return (b.goal === 'perder' && d <= -1) || (b.goal === 'ganhar' && d >= 1);
  }
  S.ACHIEVEMENTS = S.ACHIEVEMENTS.concat([
    { id: 'sh1', icon: "🌑", name: "Levanta-te", desc: "Extrai a tua primeira sombra.", check: function (s) { return c(s,'shadowsOwned')>=1; }, reward: {chest:'raro'} },
    { id: 'sh10', icon: "🌒", name: "Pequeno Exército", desc: "Tem 10 servos.", check: function (s) { return sh(s).owned>=10; }, reward: {chest:'epico'} },
    { id: 'sh25', icon: "🌓", name: "Legião das Sombras", desc: "Tem 25 servos.", check: function (s) { return sh(s).owned>=25; }, reward: {chest:'lendario'} },
    { id: 'sh50', icon: "🌔", name: "Meio Exército", desc: "Tem 50 servos.", check: function (s) { return sh(s).owned>=50; }, reward: {chest:'lendario',coins:15000} },
    { id: 'sh100', icon: "🌕", name: "Monarca das Sombras", desc: "Tem os 100 servos dos portões.", check: function (s) { return sh(s).owned>=100; }, reward: {chest:'secreto',coins:50000} },
    { id: 'shking', icon: "👑", name: "Rei Ajoelhado", desc: "Torna servo um rei de portão.", check: function (s) { return sh(s).kings>=1; }, reward: {chest:'epico'} },
    { id: 'shking10', icon: "🏰", name: "Corte dos Reis", desc: "Torna servos os 10 reis dos portões.", check: function (s) { return sh(s).kings>=10; }, reward: {chest:'secreto'} },
    { id: 'shfirst', icon: "🎯", name: "À Primeira", desc: "Extrai uma sombra logo na primeira tentativa.", check: function (s) { return c(s,'shadowFirstTry')>=1; }, reward: {chest:'raro'} },
    { id: 'shlast', icon: "🕯️", name: '???', realName: "Última Chama", secret: true, desc: "Extrai uma sombra na última tentativa.", check: function (s) { return c(s,'shadowLastTry')>=1; }, reward: {chest:'epico'} },
    { id: 'shlost', icon: "🌫️", name: '???', realName: "A Sombra Que Fugiu", secret: true, desc: "Deixa uma sombra ficar selada.", check: function (s) { return sh(s).lost>=1; }, reward: {item:'po_sorte'} },
    { id: 'shlost10', icon: "🌪️", name: '???', realName: "Sombras ao Vento", secret: true, desc: "Deixa 10 sombras ficarem seladas.", check: function (s) { return sh(s).lost>=10; }, reward: {chest:'raro'} },
    { id: 'shname', icon: "🏷️", name: "Nome Próprio", desc: "Dá um nome a um servo.", check: function (s) { return sh(s).named>=1; }, reward: {coins:500} },
    { id: 'shfull', icon: "⚜️", name: "Todos a Postos", desc: "Tem todos os lugares de servos ocupados.", check: function (s) { return sh(s).active>=S.shadows.slots(s)&&sh(s).active>=2; }, reward: {chest:'raro'} },
    { id: 'spar1', icon: "🥋", name: "Treino nas Sombras", desc: "Vence um treino contra um servo.", check: function (s) { return c(s,'sparWins')>=1; }, reward: {coins:300} },
    { id: 'spar25', icon: "🏯", name: "Dojo Sombrio", desc: "Vence 25 treinos contra servos.", check: function (s) { return c(s,'sparWins')>=25; }, reward: {chest:'epico'} },
    { id: 'shar1', icon: "⛓️", name: "Prisioneiro Libertado", desc: "Torna servo um inimigo das arenas premium.", check: function (s) { return sh(s).arena>=1; }, reward: {chest:'lendario'} },
    { id: 'shar10', icon: "🏟️", name: "Guarda do Coliseu", desc: "Tem 10 servos das arenas premium.", check: function (s) { return sh(s).arena>=10; }, reward: {chest:'lendario',coins:10000} },
    { id: 'sharch', icon: "👑", name: "Campeão Acorrentado", desc: "Torna servo um Campeão da Arena.", check: function (s) { return sh(s).champs>=1; }, reward: {chest:'secreto'} },
    { id: 'shar100', icon: "🌑", name: "Coliseu das Sombras", desc: "Torna servos os 100 inimigos das arenas premium.", check: function (s) { return sh(s).arena>=100; }, reward: {chest:'secreto',coins:100000} },
    { id: 'spch10', icon: "🧰", name: "Cliente Especial", desc: "Abre 10 baús especializados.", check: function (s) { return c(s,'specialChests')>=10; }, reward: {chest:'epico'} },
    { id: 'spchm', icon: "🔱", name: "Selo Negro", desc: "Abre um baú especializado do grau Monarca.", check: function (s) { return c(s,'monarchChests')>=1; }, reward: {coins:5000} },
    { id: 'duel1', icon: "⚔️", name: "Primeiro Duelo", desc: "Termina um duelo contra outro jogador.", check: function (s) { return c(s,'duelsPlayed')>=1; }, reward: {chest:'raro'} },
    { id: 'duel10', icon: "🤺", name: "Duelista", desc: "Vence 10 duelos contra jogadores.", check: function (s) { return c(s,'duelWins')>=10; }, reward: {chest:'lendario'} },
    { id: 'duel50', icon: "🏆", name: "Campeão dos Duelos", desc: "Vence 50 duelos contra jogadores.", check: function (s) { return c(s,'duelWins')>=50; }, reward: {chest:'secreto',coins:20000} },
    { id: 'duelperf', icon: "💎", name: '???', realName: "Intocável na Arena", secret: true, desc: "Vence um duelo sem perder vida nenhuma.", check: function (s) { return c(s,'duelFlawless')>=1; }, reward: {chest:'epico'} },
    { id: 'friend5', icon: "🤝", name: "Grupo de Caça", desc: "Tem 5 amigos no Sistema.", check: function (s) { return c(s,'friendsMax')>=5; }, reward: {chest:'epico'} },
    { id: 'friend20', icon: "🌐", name: "Guilda", desc: "Tem 20 amigos no Sistema.", check: function (s) { return c(s,'friendsMax')>=20; }, reward: {chest:'lendario',coins:5000} },
    { id: 'sparlose', icon: "🤕", name: '???', realName: "Humildade", secret: true, desc: "Perde um treino contra um dos teus servos.", check: function (s) { return c(s,'sparLosses')>=1; }, reward: {coins:200} },
    { id: 'ar1', icon: "🏟️", name: "Entrada no Coliseu", desc: "Abre a tua primeira arena.", check: function (s) { return Object.keys((s.arena||{}).unlocked||{}).length>=1; }, reward: {chest:'raro'} },
    { id: 'ar5', icon: "🗝️", name: "Cinco Portas", desc: "Abre 5 arenas.", check: function (s) { return Object.keys((s.arena||{}).unlocked||{}).length>=5; }, reward: {chest:'lendario'} },
    { id: 'ar10', icon: "🌌", name: "Todas as Arenas", desc: "Abre as 10 arenas.", check: function (s) { return Object.keys((s.arena||{}).unlocked||{}).length>=10; }, reward: {chest:'secreto'} },
    { id: 'grd1', icon: "🛡️", name: "Primeiro Guardião", desc: "Vence um sub-chefe do Coliseu.", check: function (s) { return arena(s).guards>=1; }, reward: {chest:'raro'} },
    { id: 'grd45', icon: "⚔️", name: "Escada a Meio", desc: "Vence 45 sub-chefes do Coliseu.", check: function (s) { return arena(s).guards>=45; }, reward: {chest:'lendario'} },
    { id: 'grd90', icon: "🪜", name: "Topo da Escada", desc: "Vence os 90 sub-chefes do Coliseu.", check: function (s) { return arena(s).guards>=90; }, reward: {chest:'secreto'} },
    { id: 'ten1', icon: "🎖️", name: "Abater o Tenente", desc: "Vence um Tenente do Coliseu.", check: function (s) { return arena(s).lieuts>=1; }, reward: {chest:'epico'} },
    { id: 'champ1', icon: "🏆", name: "Campeão Caído", desc: "Vence um Campeão do Coliseu.", check: function (s) { return arena(s).champs>=1; }, reward: {chest:'lendario'} },
    { id: 'champ5', icon: "👑", name: "Cinco Coroas", desc: "Vence 5 Campeões do Coliseu.", check: function (s) { return arena(s).champs>=5; }, reward: {chest:'secreto'} },
    { id: 'champ10', icon: "💎", name: "Rei do Coliseu", desc: "Vence os 10 Campeões do Coliseu.", check: function (s) { return arena(s).champs>=10; }, reward: {chest:'secreto',coins:50000} },
    { id: 'firstp', icon: "🕳️", name: '???', realName: "O Primeiro Jogador", secret: true, desc: "Vence O Primeiro Jogador.", check: function (s) { return !!((s.arena||{}).wins||{}).ar10; }, reward: {chest:'secreto'} },
    { id: 'rematch', icon: "🔁", name: "Revisitação", desc: "Vence 20 revisitações no Coliseu (honra, sem prémio).", check: function (s) { return arena(s).rematches>=20; }, reward: {} },
    { id: 'tr100', icon: "🏛️", name: "Museu de Troféus", desc: "Junta 100 troféus.", check: function (s) { return Object.keys(s.trophies||{}).length>=100; }, reward: {chest:'lendario'} },
    { id: 'tr202', icon: "🗿", name: "Coleção Completa", desc: "Junta todos os troféus do jogo.", check: function (s) { return Object.keys(s.trophies||{}).length>=Object.keys(S.TROPHIES).length; }, reward: {chest:'secreto',coins:100000} },
    { id: 'set10', icon: "🥇", name: "Todos os Portões", desc: "Completa os troféus dos 10 portões.", check: function (s) { return S.engine.completedSets(s).filter(function(g){return g>0}).length>=10; }, reward: {chest:'secreto'} },
    { id: 'prem1', icon: "💠", name: "Primeiro Cristal", desc: "Compra algo na Loja Exclusiva.", check: function (s) { return c(s,'premiumBought')>=1; }, reward: {coins:500} },
    { id: 'relic1', icon: "🔮", name: "Relíquia Eterna", desc: "Tem uma relíquia permanente.", check: function (s) { return (S.PREMIUM_RELICS||[]).some(function(id){return (s.inv[id]||0)>0}); }, reward: {coins:1000} },
    { id: 'relic7', icon: "✴️", name: "Arsenal Eterno", desc: "Tem as 7 relíquias permanentes.", check: function (s) { return (S.PREMIUM_RELICS||[]).every(function(id){return (s.inv[id]||0)>0}); }, reward: {chest:'secreto'} },
    { id: 'mset2', icon: "🧩", name: "Conjunto do Monarca", desc: "Equipa 2 peças soberanas ao mesmo tempo.", check: function (s) { return S.engine.monarchPieces(s)>=2; }, reward: {chest:'epico'} },
    { id: 'mset4', icon: "🜲", name: "Monarca Completo", desc: "Equipa 4 peças soberanas ao mesmo tempo.", check: function (s) { return S.engine.monarchPieces(s)>=4; }, reward: {chest:'secreto'} },
    { id: 'eternal', icon: "🔱", name: "Selo Eterno", desc: "Ativa o Selo do Monarca Eterno.", check: function (s) { return !!(s.perks&&s.perks.monarca); }, reward: {chest:'lendario'} },
    { id: 'frame1', icon: "🖼️", name: "Nova Moldura", desc: "Ganha ou compra uma moldura.", check: function (s) { return Object.keys((s.cosmetics||{}).owned||{}).length>=1; }, reward: {coins:500} },
    { id: 'frame5', icon: "🎭", name: "Galeria Pessoal", desc: "Tem 5 aparências.", check: function (s) { return Object.keys((s.cosmetics||{}).owned||{}).length>=5; }, reward: {chest:'lendario'} },
    { id: 'body1', icon: "⚖️", name: "Conhece-te", desc: "Regista o teu peso pela primeira vez.", check: function (s) { return ((s.body||{}).weights||[]).length>=1; }, reward: {coins:300} },
    { id: 'body7', icon: "📏", name: "Semana de Registo", desc: "Regista o peso em 7 dias diferentes.", check: function (s) { return ((s.body||{}).weights||[]).length>=7; }, reward: {chest:'raro'} },
    { id: 'body30', icon: "📈", name: "Corpo em Evolução", desc: "Regista o peso em 30 dias diferentes.", check: function (s) { return ((s.body||{}).weights||[]).length>=30; }, reward: {chest:'epico'} },
    { id: 'bodyg', icon: "🎯", name: "Objetivo Cumprido", desc: "Muda 1 kg na direção do teu objetivo.", check: function (s) { return bodyGoal(s); }, reward: {chest:'epico'} },
    { id: 'm1000', icon: "🌋", name: "Mil Missões", desc: "Conclui 1000 missões.", check: function (s) { return c(s,'missionsDone')>=1000; }, reward: {chest:'secreto'} },
    { id: 'mS10', icon: "💥", name: "Dez Vezes S", desc: "Conclui 10 missões de dificuldade S.", check: function (s) { return c(s,'missionsS')>=10; }, reward: {chest:'lendario'} },
    { id: 'create10', icon: "✍️", name: "Arquiteto da Rotina", desc: "Cria 10 missões.", check: function (s) { return c(s,'missionsCreated')>=10; }, reward: {coins:500} },
    { id: 'd365', icon: "🗓️", name: '???', realName: "Um Ano de Disciplina", secret: true, desc: "365 dias seguidos de Missão Diária.", check: function (s) { return s.daily.bestStreak>=365; }, reward: {chest:'secreto',coins:100000} },
    { id: 'emg1', icon: "⚡", name: "Resposta Rápida", desc: "Cumpre uma Missão de Emergência.", check: function (s) { return c(s,'emergencies')>=1; }, reward: {chest:'raro'} },
    { id: 'emg10', icon: "🚨", name: "Sempre Pronto", desc: "Cumpre 10 Missões de Emergência.", check: function (s) { return c(s,'emergencies')>=10; }, reward: {chest:'epico'} },
    { id: 'hid1', icon: "🔍", name: '???', realName: "Missão Oculta", secret: true, desc: "Cumpre uma Missão Oculta.", check: function (s) { return c(s,'hiddenDone')>=1; }, reward: {chest:'raro'} },
    { id: 'hid10', icon: "🕵️", name: '???', realName: "Caçador de Segredos", secret: true, desc: "Cumpre 10 Missões Ocultas.", check: function (s) { return c(s,'hiddenDone')>=10; }, reward: {chest:'lendario'} },
    { id: 'zone1', icon: "🚧", name: "Sobrevivente da Zona", desc: "Sai da Zona de Penalidade.", check: function (s) { return c(s,'zonesCleared')>=1; }, reward: {chest:'raro'} },
    { id: 'trust', icon: "🛡️", name: "Confiança do Sistema", desc: "Mantém a Integridade a 100% durante 30 dias de jogo.", check: function (s) { return (s.watch&&s.watch.trust>=100)&&S.time.systemDay(s)>=30; }, reward: {chest:'lendario'} },
    { id: 'b200', icon: "🗡️", name: "Veterano", desc: "Vence 200 batalhas.", check: function (s) { return c(s,'battlesWon')>=200; }, reward: {chest:'lendario'} },
    { id: 'flaw10', icon: "💎", name: '???', realName: "Intocável x10", secret: true, desc: "Vence 10 chefes de nível 10+ sem sofrer dano.", check: function (s) { return c(s,'flawlessWins')>=10; }, reward: {chest:'secreto'} },
    { id: 'giant10', icon: "🏔️", name: '???', realName: "Derrubador de Montanhas", secret: true, desc: "Vence 10 chefes 5+ níveis acima de ti.", check: function (s) { return c(s,'giantKills')>=10; }, reward: {chest:'secreto'} },
    { id: 'skill20', icon: "📜", name: "Repertório", desc: "Desbloqueia 20 habilidades.", check: function (s) { return S.engine.unlockedSkills(s).length>=20; }, reward: {chest:'epico'} },
    { id: 'secret3', icon: "🌀", name: '???', realName: "Três Segredos", secret: true, desc: "Aprende 3 habilidades secretas.", check: function (s) { return (s.secretSkills||[]).length>=3; }, reward: {chest:'lendario'} },
    { id: 'all100', icon: "🧬", name: "Perfeição", desc: "Todos os atributos a 100 ou mais.", check: function (s) { return allStatsAtLeast(s,100); }, reward: {chest:'secreto'} },
    { id: 'form10', icon: "🎭", name: "Dez Formas", desc: "Alcança a 10.ª forma da tua classe (nível 28).", check: function (s) { return s.level>=28; }, reward: {chest:'epico'} },
    { id: 'form34', icon: "🔱", name: "Forma Final", desc: "Alcança a forma final da tua classe.", check: function (s) { return s.level>=100; }, reward: {chest:'secreto'} },
    { id: 'rich3', icon: "💎", name: "Fortuna", desc: "Ganha 1 000 000 de moedas no total.", check: function (s) { return c(s,'coinsEarned')>=1000000; }, reward: {chest:'secreto'} },
    { id: 'sell50', icon: "💱", name: "Mercador", desc: "Vende 50 itens.", check: function (s) { return c(s,'itemsSold')>=50; }, reward: {chest:'raro'} },
    { id: 'chest500', icon: "🗃️", name: "Abre-Tudo", desc: "Abre 500 baús.", check: function (s) { return c(s,'chestsOpened')>=500; }, reward: {chest:'secreto'} },
    { id: 'items100', icon: "🎒", name: "Inventário Infinito", desc: "Obtém 100 itens diferentes.", check: function (s) { return Object.keys(s.seen||{}).length>=100; }, reward: {chest:'lendario'} },
    { id: 'talk50', icon: "💬", name: '???', realName: "Conversa com o Sistema", secret: true, desc: "Conversa 50 vezes com o Sistema.", check: function (s) { return ((s.talk||{}).talks||0)>=50; }, reward: {chest:'raro'} }
  ]);
  S.ACH_BY_ID = {};
  S.ACHIEVEMENTS.forEach(function (a) { S.ACH_BY_ID[a.id] = a; });
})(globalThis.SYS = globalThis.SYS || {});
