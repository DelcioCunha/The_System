/* ==========================================================
   O SISTEMA VIVO
   O Sistema não espera que o jogador fale com ele: aparece, comenta, exige.
   1. Missões de Emergência   — desafios curtos e surpresa (máx. 2 por dia, 08:00–22:00)
   2. Saudação ao abrir a app — uma linha conforme a hora, a ausência e o que falta fazer
   3. Zona de Penalidade      — falhar a Diária abre uma missão de castigo (24 h)
   4. Relatório semanal       — ao domingo (a partir das 18:00): nota de E a S, comentário e prémio
   6. Reações a marcos        — subir de rank, sequências, chefes acima do nível, reis de portão
   8. Missões Ocultas         — desbloqueadas por padrões de comportamento, recompensas raras
   ========================================================== */
(function (S) {
  'use strict';
  var L = S.live = {};
  var E = S.engine;
  var HOUR = 3600000, DAY = 24 * HOUR;

  S.LIVE = {
    emergency: { perDay: 2, from: 8, to: 22, firstGap: [1, 4], nextGap: [3, 6], minSeconds: 60 },
    hidden: { hours: 48, minMinutes: 60 },
    zone: { hours: 24, factor: 1.5, recover: 0.5 },
    greetEvery: 3 * HOUR
  };

  function now() { return S.clock.now(); }
  function rnd() { return S.rng.random(); }
  /* falas novas (src/data/voice-plus.js) juntam-se às antigas */
  var P = S.PLUS || {};
  function plus(group, key) { var g = P[group]; return (g && g[key]) || []; }
  function join(list, group, key) { return list.concat(plus(group, key)); }
  function pick(list) { return list[Math.floor(rnd() * list.length) % list.length]; }
  function fill(t, v) { return String(t).replace(/\{(\w+)\}/g, function (m, k) { return v[k] !== undefined ? v[k] : m; }); }
  function hhmm(ts) { var d = new Date(ts); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function vars(st, extra) {
    var v = { nome: st.name, NOME: String(st.name).toUpperCase(), hora: hhmm(now()) };
    Object.keys(extra || {}).forEach(function (k) { v[k] = extra[k]; });
    return v;
  }
  L.ensure = function (st) {
    if (!st.live) st.live = {};
    var l = st.live;
    if (!l.hidden) l.hidden = {};
    if (!l.reports) l.reports = [];
    if (!l.reacted) l.reacted = {};
    if (l.emDay === undefined) { l.emDay = ''; l.emCount = 0; l.emNext = 0; }
    if (!l.lastSeen) l.lastSeen = now();
    return l;
  };

  /* ================= 1. MISSÕES DE EMERGÊNCIA ================= */
  var EMERGENCY = [
    ['Faz 15 flexões.', 20], ['Bebe um copo de água. Inteiro.', 15], ['20 agachamentos. Agora.', 20], ['1 minuto de prancha.', 20],
    ['Arruma a superfície onde estás sentado.', 30], ['Lê 5 páginas de um livro. Um livro a sério.', 40],
    ['Caminha 10 minutos. Sem o telemóvel na mão.', 45], ['5 minutos de alongamentos.', 30], ['Responde à mensagem que andas a evitar.', 60],
    ['Lava o que está no lava-loiça.', 45], ['Escreve 3 tarefas para amanhã.', 20], ['Fecha as redes sociais durante 30 minutos.', 40],
    ['Respira fundo 10 vezes. Devagar.', 15], ['Deita fora 5 coisas de que não precisas.', 40], ['Faz a cama. Se já está feita, faz melhor.', 20],
    ['30 saltos no lugar.', 15], ['Bebe água e come uma peça de fruta.', 30], ['Estuda 20 minutos aquilo que andas a adiar.', 45],
    ['Põe a roupa suja no cesto. Toda.', 25], ['Manda uma mensagem a alguém de quem gostas.', 60]
  ];
  var EM_VOICE = {
    open: ['Não te perguntei se tinhas tempo.', 'O Sistema não espera. Tu também não devias.', 'Recompensa à altura. Recusa à tua medida.',
      'Considera isto um favor. Não é.', 'Eu escolhi o momento. Tu só escolhes se obedeces.'],
    done: ['Cumprida. Afinal ainda obedeces.', 'Registado. Não foi difícil, pois não?', 'Missão de emergência cumprida. Tomei nota da tua utilidade.'],
    fast: ['Ainda nem leste a missão, {nome}.', 'Em {seg} segundos? Eu também sei contar.'],
    lost: ['Recusaste. Fica registado quem és quando ninguém te obriga.', 'Tempo esgotado. Eu sabia.', 'Ignoraste a emergência. Ela não te ignorou a ti.']
  };
  EMERGENCY = EMERGENCY.concat(P.emergency || []);
  Object.keys(EM_VOICE).forEach(function (k) { EM_VOICE[k] = join(EM_VOICE[k], 'emVoice', k); });
  L.EMERGENCY = EMERGENCY;
  function emReward(st) {
    var dr = S.missions.dailyReward(st);
    return { xp: Math.round(dr.xp * 0.6), coins: Math.round(dr.coins * 0.8) };
  }
  function scheduleNextEmergency(l, base, gap) {
    l.emNext = Math.round(base + (gap[0] + rnd() * (gap[1] - gap[0])) * HOUR);
  }
  L.emergency = function (st) { var l = L.ensure(st); return l.em && l.em.until > now() ? l.em : null; };
  L.nextEmergencyAt = function (st) { return L.ensure(st).emNext || 0; };
  function emergencyTick(st) {
    var l = L.ensure(st), t = now(), d = E.dateKey(t), h = new Date(t).getHours(), C = S.LIVE.emergency;
    if (l.em && l.em.until <= t) {
      E.history(st, '⏱️', 'Ignorou a Missão de Emergência «' + l.em.text + '».');
      E.emit({ type: 'note', text: fill(pick(EM_VOICE.lost), vars(st)) });
      l.em = null;
    }
    if (l.emDay !== d) { l.emDay = d; l.emCount = 0; scheduleNextEmergency(l, Math.max(t, new Date(t).setHours(C.from, 0, 0, 0)), C.firstGap); }
    if (l.em || l.emCount >= C.perDay || h < C.from || h >= C.to || t < l.emNext || st.battle && !st.battle.over) return false;
    if (st.sys && st.sys.noEmUntil > t) return false; // Tratado de Trégua
    if (S.time && S.time.tampered(st)) return false;
    var e = pick(EMERGENCY.filter(function (x) { return !l.emLast || x[0] !== l.emLast; }));
    var r = emReward(st);
    l.em = { text: e[0], at: t, until: t + e[1] * 60000, xp: r.xp, coins: r.coins };
    l.emLast = e[0]; l.emCount++;
    scheduleNextEmergency(l, t, C.nextGap);
    E.emit({ type: 'emergency', title: 'MISSÃO DE EMERGÊNCIA', lines: [e[0], 'Tempo: ' + e[1] + ' minutos.', 'Recompensa: +' + r.xp + ' XP · +' + r.coins + ' moedas.', fill(e[2] && rnd() < 0.7 ? e[2] : pick(EM_VOICE.open), vars(st))] });
    return true;
  };
  L.completeEmergency = function () {
    var st = E.state, em = L.emergency(st);
    if (!em) return { ok: false, msg: 'Não há nenhuma Missão de Emergência ativa.' };
    var secs = Math.round((now() - em.at) / 1000);
    if (secs < S.LIVE.emergency.minSeconds) return { ok: false, msg: fill(pick(EM_VOICE.fast), vars(st, { seg: secs })) };
    var xp = E.gainXp(st, em.xp), coins = E.gainCoins(st, em.coins), lines = ['+' + xp + ' XP', '+' + coins + ' moedas'];
    var roll = rnd();
    if (roll < 0.05) { E.addItem(st, 'bau_raro', 1); lines.push('+1 Baú Raro'); }
    else if (roll < 0.3) { E.addItem(st, 'bau_comum', 1); lines.push('+1 Baú Comum'); }
    lines.push(fill(pick(EM_VOICE.done), vars(st)));
    st.live.em = null;
    E.bump(st, 'emergencies');
    E.emit({ type: 'mission', title: 'EMERGÊNCIA CUMPRIDA', name: em.text, lines: lines });
    E.history(st, '⚡', 'Cumpriu a Missão de Emergência «' + em.text + '»: +' + xp + ' XP, +' + coins + ' moedas.');
    E.commit('emergência cumprida');
    return { ok: true, xp: xp, coins: coins };
  };

  /* ================= 8. MISSÕES OCULTAS ================= */
  function c(st, k) { return (st.c && st.c[k]) || 0; }
  var HIDDEN = [
    { id: 'alvorada', name: 'O Caçador da Alvorada', when: function (st) { return c(st, 'earlyMissions') >= 5; },
      why: 'Cinco missões antes das 7 da manhã. Nem todos acordam para isto.', task: 'Acorda antes das 7:00 e treina 20 minutos antes de tocares no telemóvel.', reward: ['bau_epico'] },
    { id: 'noite', name: 'A Noite Sem Ecrãs', when: function (st) { return c(st, 'nightMissions') >= 5; },
      why: 'Cumpres missões quando o mundo dorme. Vamos ver se também sabes desligar.', task: 'Uma noite inteira sem ecrãs depois das 23:00.', reward: ['el_per', 'bau_raro'] },
    { id: 'ferro', name: 'Corpo de Ferro', when: function (st) { return (st.trained.str || 0) + (st.trained.vit || 0) >= 8; },
      why: 'O teu corpo começou a responder ao treino. Eu reparei.', task: 'Completa 100 flexões ao longo de um dia.', reward: ['el_str', 'bau_raro'] },
    { id: 'mente', name: 'Mente Afiada', when: function (st) { return (st.trained.int || 0) >= 6; },
      why: 'Tens alimentado a mente. Vejamos se aguenta uma hora sem fugir.', task: 'Estuda ou lê durante 1 hora seguida, sem interrupções.', reward: ['el_int', 'bau_raro'] },
    { id: 'cacador', name: 'Instinto de Caçador', when: function (st) { return c(st, 'bossesKilled') >= 20; },
      why: 'Vinte chefes derrotados. Os portões começam a falar de ti.', task: 'Faz um treino de 45 minutos. Hoje.', reward: ['sx_fragmento'] },
    { id: 'inabalavel', name: 'Inabalável', when: function (st) { return (st.daily.bestStreak || 0) >= 14; },
      why: 'Catorze dias seguidos. Isso já não é sorte.', task: 'Escreve uma carta ao teu eu de daqui a um ano. À mão.', reward: ['el_ponto', 'bau_epico'] },
    { id: 'centena', name: 'A Centena', when: function (st) { return c(st, 'missionsDone') >= 100; },
      why: 'Cem missões cumpridas. Vou exigir-te uma coisa que nunca te exigi.', task: 'Um dia inteiro sem redes sociais.', reward: ['bau_lendario'] }
  ];
  HIDDEN = HIDDEN.concat(P.hidden || []);
  L.HIDDEN = HIDDEN;
  var HID_VOICE = {
    open: ['Andei a observar-te, {nome}.', 'Eu vejo padrões onde tu vês dias.', 'Isto não aparece a toda a gente.'],
    done: ['Poucos chegam aqui. Não te habitues.', 'Cumprida. Já sabia que ias tentar. Não sabia que ias conseguir.'],
    lost: ['A Missão Oculta desapareceu. O Sistema não oferece duas vezes.', 'Deixaste passar uma Missão Oculta. Ela não volta.']
  };
  Object.keys(HID_VOICE).forEach(function (k) { HID_VOICE[k] = join(HID_VOICE[k], 'hidVoice', k); });
  function rewardNames(list) { return list.map(function (id) { return S.ITEMS[id] ? (S.ITEMS[id].secret ? 'item secreto' : S.ITEMS[id].name) : id; }).join(' + '); }
  L.hiddenActive = function (st) {
    var l = L.ensure(st);
    if (!l.hq) return null;
    var def = HIDDEN.filter(function (h) { return h.id === l.hq.id; })[0];
    return def ? { def: def, at: l.hq.at, until: l.hq.until } : null;
  };
  function hiddenTick(st) {
    var l = L.ensure(st), t = now();
    if (l.hq && l.hq.until <= t) {
      l.hidden[l.hq.id] = 'expired';
      E.emit({ type: 'note', text: fill(pick(HID_VOICE.lost), vars(st)) });
      E.history(st, '🗝️', 'Deixou expirar uma Missão Oculta.');
      l.hq = null;
    }
    if (l.hq) return false;
    var def = HIDDEN.filter(function (h) { return !l.hidden[h.id] && h.when(st); })[0];
    if (!def) return false;
    l.hidden[def.id] = 'active';
    l.hq = { id: def.id, at: t, until: t + S.LIVE.hidden.hours * HOUR };
    E.emit({ type: 'hidden', title: 'MISSÃO OCULTA DESBLOQUEADA', name: def.name,
      lines: [fill(def.say || pick(HID_VOICE.open), vars(st)), def.why, def.task, 'Tens 48 horas. Recompensa: ' + rewardNames(def.reward) + '.'] });
    E.history(st, '🗝️', 'Desbloqueou a Missão Oculta «' + def.name + '».');
    return true;
  }
  /* Bússola do Oculto: revela a próxima Missão Oculta sem esperar pelas condições */
  L.forceHidden = function (st) {
    var l = L.ensure(st), t = now();
    hiddenTick(st);
    if (l.hq) return { ok: false, msg: 'Já tens uma Missão Oculta ativa: «' + L.hiddenActive(st).def.name + '». Cumpre-a primeiro.' };
    var def = HIDDEN.filter(function (h) { return !l.hidden[h.id]; })[0];
    if (!def) return { ok: false, msg: 'Já descobriste todas as Missões Ocultas. A bússola gira sem rumo.' };
    l.hidden[def.id] = 'active';
    l.hq = { id: def.id, at: t, until: t + S.LIVE.hidden.hours * HOUR };
    E.emit({ type: 'hidden', title: 'MISSÃO OCULTA DESBLOQUEADA', name: def.name,
      lines: ['A bússola apontou e o Sistema não teve como esconder.', def.why, def.task, 'Tens 48 horas. Recompensa: ' + rewardNames(def.reward) + '.'] });
    E.history(st, '🧭', 'A Bússola do Oculto revelou «' + def.name + '».');
    return { ok: true, name: def.name };
  };
  L.completeHidden = function () {
    var st = E.state, h = L.hiddenActive(st);
    if (!h) return { ok: false, msg: 'Não há nenhuma Missão Oculta ativa.' };
    var mins = (now() - h.at) / 60000;
    if (mins < S.LIVE.hidden.minMinutes) return { ok: false, msg: 'Em ' + Math.round(mins) + ' minutos? O Sistema não é tão ingénuo como esperavas. Volta quando a tiveres cumprido.' };
    h.def.reward.forEach(function (id) { E.addItem(st, id, 1); });
    st.live.hidden[h.def.id] = 'done';
    st.live.hq = null;
    E.bump(st, 'hiddenDone');
    E.emit({ type: 'hidden', done: true, title: 'MISSÃO OCULTA CONCLUÍDA', name: h.def.name, lines: ['+ ' + rewardNames(h.def.reward), fill(pick(HID_VOICE.done), vars(st))] });
    E.history(st, '🗝️', 'Concluiu a Missão Oculta «' + h.def.name + '».');
    E.commit('missão oculta');
    return { ok: true };
  };

  /* ================= 3. ZONA DE PENALIDADE ================= */
  L.zone = function (st) { var l = L.ensure(st); return l.zone && l.zone.until > now() && !l.zone.done ? l.zone : null; };
  /* chamado quando a Missão Diária falha (lost = o que o jogador perdeu) */
  L.openZone = function (st, lost) {
    var l = L.ensure(st);
    if (!lost || lost.shielded || !st.daily.tasks.length) return false;
    if (l.zone && !l.zone.done && l.zone.until > now()) return false;
    var tasks = st.daily.tasks.map(function (tk) { return { id: tk.id, name: tk.name, unit: tk.unit, target: Math.ceil(tk.target * S.LIVE.zone.factor) }; });
    l.zone = { at: now(), until: now() + S.LIVE.zone.hours * HOUR, tasks: tasks, values: {}, coins: lost.coins || 0, xp: lost.xp || 0, done: false };
    E.emit({ type: 'zone', title: 'ZONA DE PENALIDADE', lines: ['Falhaste a Missão Diária.', 'O Sistema abriu-te uma Zona de Penalidade: a mesma missão, uma vez e meia mais dura.',
      'Cumpre-a em 24 horas e recuperas metade do que perdeste. Falha, e pagas a dobrar.', pick(['Há sempre uma segunda oportunidade. A terceira não existe.', 'Eu não castigo. Eu cobro.', 'Considera isto misericórdia. É a única que vais ter.'])] });
    E.history(st, '⛓️', 'O Sistema abriu uma Zona de Penalidade.');
    return true;
  };
  L.setZoneValue = function (taskId, value) {
    var st = E.state, z = L.zone(st);
    if (!z) return { ok: false, msg: 'Não há nenhuma Zona de Penalidade ativa.' };
    var tk = z.tasks.filter(function (x) { return x.id === taskId; })[0];
    if (!tk) return { ok: false, msg: 'Tarefa não encontrada.' };
    z.values[taskId] = Math.max(0, Math.min(tk.target * 10, Math.round(+value * 100) / 100 || 0));
    E.commit('zona de penalidade');
    return { ok: true, value: z.values[taskId] };
  };
  L.zoneAllDone = function (z) { return z.tasks.every(function (tk) { return (z.values[tk.id] || 0) >= tk.target; }); };
  L.completeZone = function () {
    var st = E.state, z = L.zone(st);
    if (!z) return { ok: false, msg: 'Não há nenhuma Zona de Penalidade ativa.' };
    if (!L.zoneAllDone(z)) return { ok: false, msg: 'A Zona de Penalidade ainda não está cumprida.' };
    var coins = Math.round(z.coins * S.LIVE.zone.recover), xp = Math.round(z.xp * S.LIVE.zone.recover);
    st.coins += coins; E.gainXp(st, xp, false);
    st.effects = st.effects.filter(function (e) { return e.id !== 'exausto'; });
    z.done = true;
    E.bump(st, 'zonesCleared');
    E.emit({ type: 'zone', done: true, title: 'ZONA DE PENALIDADE SUPERADA', lines: ['Recuperaste ' + coins + ' moedas e ' + xp + ' XP.', 'Estado Exausto removido.', pick(['Sobreviveste. Desta vez.', 'Saíste. Não penses que foi fácil por seres bom. Foi fácil por eu ter sido brando.'])] });
    E.history(st, '⛓️', 'Superou a Zona de Penalidade: +' + coins + ' moedas, +' + xp + ' XP.');
    E.commit('zona superada');
    return { ok: true };
  };
  function zoneTick(st) {
    var l = L.ensure(st);
    if (!l.zone || l.zone.done || l.zone.until > now()) return false;
    var lc = E.loseCoins(st, l.zone.coins), lx = E.loseXp(st, l.zone.xp);
    if (S.watch) { var w = S.watch.ensure(st); w.trust = Math.max(0, w.trust - 10); }
    l.zone.done = true; l.zone.failed = true;
    E.emit({ type: 'penalty', title: 'ZONA DE PENALIDADE FALHADA', lines: ['-' + lc + ' moedas. -' + lx + ' XP.', 'Integridade -10%.', pick(['Eu dei-te uma saída. Escolheste ficar.', 'Pagaste a dobrar. Exatamente como prometido. Eu cumpro sempre.'])] });
    E.history(st, '⛓️', 'Falhou a Zona de Penalidade: -' + lc + ' moedas, -' + lx + ' XP.');
    return true;
  }

  /* ================= 2. SAUDAÇÃO ================= */
  L.greeting = function (st, force) {
    var l = L.ensure(st), t = now();
    var away = t - (l.lastSeen || t);
    l.lastSeen = t;
    if (!force && l.greetedAt && t - l.greetedAt < S.LIVE.greetEvery) return null;
    l.greetedAt = t;
    var h = new Date(t).getHours(), v = vars(st);
    var M = S.missions, td = E.dateKey(t);
    var pend = M.forDay(st, td).filter(function (x) { return x.status === 'pending'; });
    var soon = pend.filter(function (x) { return x.deadline - t < 3 * HOUR; });
    var lines = [];
    var G = function (key, list) { return pick(join(list, 'greet', key)); };
    if (away >= 2 * DAY) lines.push(fill(G('away', ['Desapareceste {d} dias, {nome}. Eu não.', '{d} dias sem ti. O Sistema funcionou perfeitamente.', 'Voltaste. {d} dias depois. Eu contei cada um.']), Object.assign(v, { d: Math.floor(away / DAY) })));
    else if (L.zone(st)) lines.push(fill(G('zone', ['A Zona de Penalidade continua aberta. Eu também.']), v));
    else if (S.watch && S.watch.marked(st)) lines.push(fill(G('marked', ['Ainda tens a minha marca, {nome}. Não te esqueças de quem a pôs.']), v));
    else if (soon.length) lines.push(fill(G('soon', ['{hora}. {n} missões por cumprir. O relógio não espera por ti.', '{hora}. Faltam {n} missões e pouco tempo. Eu sei qual das duas acaba primeiro.']), Object.assign(v, { n: soon.length })));
    else if (h < 4) lines.push(fill(G('night', ['{hora}. Os outros dormem. Tu estás aqui. Interessante.', '{hora}. O Sistema não dorme. Tu devias.']), v));
    else if (h < 8) lines.push(fill(G('dawn', ['{hora}. Acordado antes do mundo. Fica registado.', 'Madrugada. Os fracos ainda dormem. Tu ainda não provaste que não és um deles.']), v));
    else if (st.daily.streak >= 3) lines.push(fill(G('streak', ['Sequência de {s} dias. Não estragues tudo hoje.', '{s} dias seguidos. Eu reparo. Não aplaudo.']), Object.assign(v, { s: st.daily.streak })));
    else if (h < 12) lines.push(fill(G('morning', ['Manhã. As missões não se cumprem sozinhas.', 'Um dia novo. As mesmas desculpas de ontem?']), v));
    else if (h < 19) lines.push(fill(G('afternoon', ['Metade do dia já foi. E tu?', 'Tarde. O Sistema já fez tudo o que tinha a fazer hoje. E tu?']), v));
    else lines.push(fill(G('evening', ['A noite chega para todos. As tuas missões ainda não.', 'Fim do dia. O registo fecha à meia-noite. O que vais deixar nele?']), v));
    return { type: 'note', text: lines[0], greet: true };
  };

  /* ================= 6. REAÇÕES A MARCOS ================= */
  var REACT = {
    rank: ['Rank {rank}. O mundo não mudou. Tu é que deixaste de ser invisível.', 'Rank {rank}. Parabéns é uma palavra que eu não uso.', 'Rank {rank}. Os portões começam a reparar em ti. Eu reparei primeiro.'],
    streak: ['Sequência de {n} dias. Não te habitues aos elogios. Não os vais ter.', '{n} dias seguidos. Começo a acreditar que não foi sorte. Começo.', '{n} dias. A disciplina é a única moeda que eu não posso confiscar.'],
    giant: ['Venceste um chefe {g} níveis acima de ti. Interessante. Não te dei essa hipótese.', '{g} níveis de diferença. Isso não estava nas minhas previsões. Corrigi as previsões.'],
    king: ['O rei do {portao} caiu. O próximo portão já sabe o teu nome.', '{portao}: sem rei. Alguém vai ter de ocupar o trono. Não és tu. Ainda.'],
    level: ['Nível {lv}. Metade do caminho. A metade fácil.', 'Nível {lv}. Já não és um caçador qualquer. Também não és especial.']
  };
  Object.keys(REACT).forEach(function (k) { REACT[k] = join(REACT[k], 'react', k); });
  Object.keys(P.react || {}).forEach(function (k) { if (!REACT[k]) REACT[k] = P.react[k].slice(); });
  L.REACT = REACT;
  /* novos marcos: contadores que, ao passar um limiar, fazem o Sistema comentar (uma vez) */
  var MARKS = [
    { k: 'kills', c: 'bossesKilled', at: [10, 25, 50, 75, 100] },
    { k: 'missions', c: 'missionsDone', at: [50, 100, 250, 500, 1000] },
    { k: 'emerg', c: 'emergencies', at: [10, 25, 50] },
    { k: 'zones', c: 'zonesCleared', at: [1, 5] },
    { k: 'hiddenAll', c: 'hiddenDone', at: [5, 10, 17] },
    { k: 'lv100', lvl: [100] }
  ];
  L.MARKS = MARKS;
  function marksTick(st) {
    var l = L.ensure(st), init = !l.marksInit, fired = false;
    MARKS.forEach(function (m) {
      if (!REACT[m.k]) return;
      var val = m.lvl ? st.level : ((st.c && st.c[m.c]) || 0), list = m.lvl || m.at;
      list.forEach(function (n) {
        var key = 'mk_' + m.k + '_' + n;
        if (val < n || l.reacted[key]) return;
        l.reacted[key] = now();
        if (init || fired) return; // primeira vez: só regista o que já passou, sem falar
        fired = true;
        E.emit({ type: 'note', text: fill(pick(REACT[m.k]), vars(st, { n: n })), react: true });
      });
    });
    l.marksInit = true;
    return fired;
  }
  /* comentário do Sistema no fim de uma batalha contra um chefe (vitória ou derrota) */
  L.bossSay = function (st, b, over, seed) {
    if (!b || (over !== 'win' && over !== 'lose')) return null;
    var BS = P.bossSay || {}, own = BS[b.id], list = own && own[over];
    if (!list || !list.length) {
      var g = P.bossSayArena || {}, kind = b.champion ? 'champion' : b.lieutenant ? 'lieutenant' : 'guardian';
      list = b.arena && g[kind] ? g[kind][over] : (P.bossSayAny || {})[over];
    }
    if (!list || !list.length) return null;
    var line = list[Math.abs(seed || 0) % list.length];
    return fill(line, vars(st, { boss: b.name }));
  };
  function note(st, key, list, v) {
    var l = L.ensure(st);
    if (key && l.reacted[key]) return false;
    if (key) l.reacted[key] = now();
    E.emit({ type: 'note', text: fill(pick(list), vars(st, v)), react: true });
    return true;
  }
  L.react = function (st, kind, ctx) {
    if (!st) return false;
    ctx = ctx || {};
    if (kind === 'level') {
      var r0 = S.rankFor(ctx.level - 1), r1 = S.rankFor(ctx.level);
      if (r0.rank !== r1.rank) return note(st, 'rank_' + r1.rank, REACT.rank, { rank: r1.rank });
      if (ctx.level === 50 || ctx.level === 75) return note(st, 'lv_' + ctx.level, REACT.level, { lv: ctx.level });
      return false;
    }
    if (kind === 'streak' && [3, 7, 14, 30, 50, 100, 365].indexOf(ctx.n) >= 0) return note(st, null, REACT.streak, { n: ctx.n });
    if (kind === 'boss') {
      if (ctx.def && ctx.def.king && typeof ctx.def.gate === 'number' && ctx.def.gate) return note(st, 'king_' + ctx.def.id, REACT.king, { portao: S.GATES[ctx.def.gate - 1].name });
      if (ctx.gap >= 3) return note(st, null, REACT.giant, { g: ctx.gap });
    }
    return false;
  };

  /* ================= 4. RELATÓRIO SEMANAL ================= */
  function mondayOf(key) { var wd = E.weekday(key); return E.addDays(key, -((wd + 6) % 7)); }
  /* semana a avaliar: a desta semana se for domingo depois das 18:00, senão a anterior */
  L.dueWeek = function (st) {
    var t = now(), d = new Date(t), today = E.dateKey(t), mon = mondayOf(today);
    var target = (d.getDay() === 0 && d.getHours() >= 18) ? mon : E.addDays(mon, -7);
    var created = E.dateKey(st.created || t);
    if (E.addDays(target, 6) < created) return null; // o jogador ainda não existia
    var l = L.ensure(st);
    if (l.lastReport && l.lastReport >= target) return null;
    return target;
  };
  L.weekStats = function (st, mon) {
    var sun = E.addDays(mon, 6), s = { done: 0, failed: 0, voided: 0, daily: 0, bosses: 0, sentences: 0 };
    Object.keys(st.missionLog).forEach(function (k) {
      var at = k.lastIndexOf('@'), d = k.slice(at + 1), e = st.missionLog[k];
      if (d < mon || d > sun) return;
      if (k.indexOf('daily@') === 0) { if (e.status === 'done') s.daily++; else s.failed++; return; }
      if (e.void) s.voided++; else if (e.status === 'done') s.done++; else if (e.status === 'failed') s.failed++;
    });
    var a = new Date(E.parseKey(mon)).getTime(), b = new Date(E.parseKey(sun)).getTime() + DAY;
    Object.keys(st.defeated).forEach(function (id) { var ts = st.defeated[id]; if (typeof ts === 'number' && ts >= a && ts < b) s.bosses++; });
    (st.history || []).forEach(function (h) { if (h.t >= a && h.t < b && /^Sentença do Sistema/.test(h.text)) s.sentences++; });
    s.score = s.done * 2 + s.daily * 3 + s.bosses * 4 - s.failed * 3 - s.voided * 5 - s.sentences * 4;
    s.grade = s.score >= 45 ? 'S' : s.score >= 30 ? 'A' : s.score >= 18 ? 'B' : s.score >= 8 ? 'C' : s.score >= 1 ? 'D' : 'E';
    return s;
  };
  var GRADE = {
    S: { reward: ['bau_epico'], coins: 2, says: ['Nota S. Não esperava isto de ti. Continuo sem esperar.', 'S. Por uma semana, foste quase digno do Sistema.'] },
    A: { reward: ['bau_raro'], coins: 1, says: ['A. Bom. Não excelente. Bom.', 'Nota A. Há caçadores piores. Muitos.'] },
    B: { reward: ['bau_comum'], coins: 0.5, says: ['B. Fizeste o suficiente para não seres esquecido.', 'Nota B. A média tem um nome, e é o teu.'] },
    C: { reward: [], coins: 0.3, says: ['C. Exististe esta semana. Pouco mais.', 'Nota C. O Sistema já viu pedras mais motivadas.'] },
    D: { reward: [], coins: 0, says: ['D. Se isto foi o teu esforço, o problema é maior do que eu pensava.', 'Nota D. Eu reparei. Os chefes também.'] },
    E: { reward: [], coins: 0, says: ['E. Uma semana inteira e quase nada. Impressionante, à tua maneira.', 'Nota E. Até o silêncio produziu mais do que tu.'] }
  };
  Object.keys(GRADE).forEach(function (k) { GRADE[k].says = join(GRADE[k].says, 'grade', k); });
  L.GRADE = GRADE;
  function reportTick(st) {
    var mon = L.dueWeek(st);
    if (!mon) return false;
    var s = L.weekStats(st, mon), g = GRADE[s.grade], l = L.ensure(st);
    var coins = Math.round(100 * S.levelMult(st.level) * g.coins);
    if (coins) st.coins += coins;
    g.reward.forEach(function (id) { E.addItem(st, id, 1); });
    var say = pick(g.says);
    var rep = { week: mon, grade: s.grade, stats: s, say: say, coins: coins, items: g.reward.slice(), integrity: S.watch ? S.watch.trust(st) : 100, at: now() };
    l.reports.unshift(rep); l.reports.length = Math.min(l.reports.length, 12);
    l.lastReport = mon;
    E.emit({ type: 'report', report: rep, title: 'RELATÓRIO SEMANAL', lines: [] });
    E.history(st, '📊', 'Relatório semanal: nota ' + s.grade + '.');
    return true;
  }

  /* ================= 7. LEMBRETES (notificações no telemóvel) =================
     Plano dos próximos lembretes: a app agenda-os no Android sempre que o plano muda.
     Devolve [{ key, at, title, body }] ordenado por hora. */
  var NOTE_VOICE = {
    mission: ['Faltam 30 minutos para «{m}». Eu estou a contar.', '«{m}» fecha às {h}. O Sistema não prolonga prazos.', '30 minutos, {nome}. «{m}» não se cumpre sozinha.'],
    daily: ['A Missão Diária fecha às {h}. Falhar abre a Zona de Penalidade.', 'Uma hora para a Missão Diária. Eu já sei o que vais escolher. Prova-me o contrário.'],
    zone: ['A Zona de Penalidade fecha daqui a 2 horas. Depois disso, pagas a dobrar.'],
    hidden: ['A Missão Oculta desaparece daqui a 6 horas. O Sistema não oferece duas vezes.'],
    emergency: ['Abre o Sistema. Agora.', 'Uma emergência à tua espera. Não perguntei se estavas ocupado.'],
    absent: ['Não te vi hoje, {nome}. Eu reparo nestas coisas.', 'Um dia inteiro sem abrires o Sistema. O Sistema não se esqueceu de ti.'],
    absent3: ['Três dias, {nome}. As tuas missões apodrecem. Eu continuo aqui.', 'Três dias de silêncio. O registo não ficou em silêncio.'],
    absent7: ['Uma semana. Os portões continuam abertos. A pergunta é se tu ainda és Jogador.', 'Sete dias. O Sistema não desiste de ninguém. Só regista quem desiste.']
  };
  Object.keys(NOTE_VOICE).forEach(function (k) { NOTE_VOICE[k] = join(NOTE_VOICE[k], 'note', k); });
  Object.keys(P.note || {}).forEach(function (k) { if (!NOTE_VOICE[k]) NOTE_VOICE[k] = P.note[k].slice(); });
  var WATCH_NOTE = P.watchNote || {};
  L.NOTE_VOICE = NOTE_VOICE;
  /* separador da app que o lembrete abre quando é tocado */
  L.noteTab = function (key) { return /^(absent|wv|ws|mk|tl)/.test(key) ? 'status' : 'missoes'; };
  function seeded(key, list) { var h = 0; for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0; return list[h % list.length]; }
  L.plan = function (st) {
    if (!st) return [];
    var l = L.ensure(st), t = now(), until = t + 36 * HOUR, out = [], M = S.missions, v = vars(st);
    function add(key, at, title, list, extra) {
      if (at <= t + 60000 || at > until) return;
      out.push({ key: key, at: at, title: title, body: fill(seeded(key, list), Object.assign({}, v, extra || {})) });
    }
    [E.dateKey(t), E.addDays(E.dateKey(t), 1)].forEach(function (d) {
      M.forDay(st, d).forEach(function (x) {
        if (x.status !== 'pending') return;
        add('m:' + x.m.id + '@' + d, x.deadline - 30 * 60000, 'SISTEMA · MISSÃO', NOTE_VOICE.mission, { m: x.m.title, h: hhmm(x.deadline) });
      });
      if (M.dailyActiveOn(st, d) && !st.missionLog[M.dailyKey(d)]) {
        var dl = E.deadlineTs(d, st.daily.deadline);
        add('daily@' + d, dl - HOUR, 'SISTEMA · MISSÃO DIÁRIA', NOTE_VOICE.daily, { h: hhmm(dl) });
      }
    });
    // missões a fechar: avisos aos 20 e aos 10 minutos (além dos 30)
    [E.dateKey(t), E.addDays(E.dateKey(t), 1)].forEach(function (d) {
      M.forDay(st, d).forEach(function (x) {
        if (x.status !== 'pending') return;
        var ex = { m: x.m.title, h: hhmm(x.deadline) };
        add('m20:' + x.m.id + '@' + d, x.deadline - 20 * 60000, 'SISTEMA · PRAZO', NOTE_VOICE.m20, ex);
        add('m10:' + x.m.id + '@' + d, x.deadline - 10 * 60000, 'SISTEMA · ÚLTIMOS MINUTOS', NOTE_VOICE.m10, ex);
      });
    });
    // resumo da manhã: as missões de hoje (08:30)
    var td0 = E.dateKey(t), pendToday = M.forDay(st, td0).filter(function (x) { return x.status === 'pending'; });
    var at830 = new Date(t); at830.setHours(8, 30, 0, 0);
    if (pendToday.length && NOTE_VOICE.today) add('today@' + td0, at830.getTime(), 'SISTEMA · HOJE', NOTE_VOICE.today, { n: pendToday.length, m: pendToday[0].m.title, h: hhmm(pendToday[0].deadline) });
    var tm = E.addDays(td0, 1), pendTm = M.forDay(st, tm).filter(function (x) { return x.status === 'pending'; });
    var at830b = new Date(t); at830b.setDate(at830b.getDate() + 1); at830b.setHours(8, 30, 0, 0);
    if (pendTm.length && NOTE_VOICE.today) add('today@' + tm, at830b.getTime(), 'SISTEMA · HOJE', NOTE_VOICE.today, { n: pendTm.length, m: pendTm[0].m.title, h: hhmm(pendTm[0].deadline) });
    // missões únicas marcadas para daqui a 1 ou mais dias
    var keep = until;
    until = t + 8 * DAY;
    (M.upcomingOnce ? M.upcomingOnce(st) : []).slice(0, 8).forEach(function (m) {
      var n = E.daysBetween ? E.daysBetween(td0, m.date) : Math.round((new Date(E.parseKey(m.date)) - new Date(E.parseKey(td0))) / DAY);
      var ex = { m: m.title, h: m.deadline, n: n, dia: m.date.split('-').reverse().slice(0, 2).join('/') };
      if (n === 1) { var e20 = new Date(t); e20.setHours(20, 0, 0, 0); add('tmw:' + m.id, e20.getTime(), 'SISTEMA · AMANHÃ', NOTE_VOICE.tomorrow, ex); }
      else if (n >= 2 && n <= 7) { var e10 = new Date(t); e10.setHours(10, 0, 0, 0); if (e10.getTime() <= t + 60000) e10.setDate(e10.getDate() + 1), ex.n = n - 1; if (ex.n >= 2) add('days:' + m.id + '@' + E.dateKey(e10.getTime()), e10.getTime(), 'SISTEMA · DAQUI A ' + ex.n + ' DIAS', NOTE_VOICE.days, ex); }
    });
    until = keep;
    // vigilância: o Sistema volta a lembrar avisos e sentenças no telemóvel
    if (S.watch) {
      var w = S.watch.ensure(st), wl = (w.log || []).slice(-3), wv = vars(st, { trust: w.trust });
      var wadd = function (key, at, title, list, extra) { if (list && list.length) add(key, at, title, list, Object.assign({ trust: w.trust, ate: w.banUntil ? hhmm(w.banUntil) : '' }, extra || {})); };
      wl.forEach(function (ev) {
        if (ev.sk && ev.sk.length) wadd('ws:' + ev.at, ev.at + 3 * HOUR, 'SENTENÇA DO SISTEMA', WATCH_NOTE['s_' + ev.sk[ev.sk.length - 1]] || WATCH_NOTE.sentence);
        else wadd('wv:' + ev.at, ev.at + 40 * 60000, 'AVISO DO SISTEMA', WATCH_NOTE['w_' + ev.kind] || WATCH_NOTE.warn);
      });
      if (w.banUntil && w.banUntil > t) wadd('ban:' + w.banUntil, w.banUntil, 'QUADRO DE MISSÕES', WATCH_NOTE.banEnd, { ate: hhmm(w.banUntil) });
      var mk = (st.effects || []).filter(function (e) { return e.id === 'marcado'; })[0];
      if (mk && mk.until > t) {
        wadd('mk1:' + mk.until, mk.until - 12 * HOUR, 'MARCA DO SISTEMA', WATCH_NOTE.markMid);
        wadd('mk2:' + mk.until, mk.until, 'MARCA DO SISTEMA', WATCH_NOTE.markEnd);
      }
      if (w.trust < 60) { var a10 = new Date(t); a10.setDate(a10.getDate() + 1); a10.setHours(10, 0, 0, 0); wadd('tl:' + E.dateKey(a10.getTime()), a10.getTime(), 'INTEGRIDADE ' + w.trust + '%', WATCH_NOTE.trustLow); }
    }
    var z = L.zone(st);
    if (z) add('zone:' + z.at, z.until - 2 * HOUR, 'ZONA DE PENALIDADE', NOTE_VOICE.zone);
    if (l.hq) add('hq:' + l.hq.id, l.hq.until - 6 * HOUR, 'MISSÃO OCULTA', NOTE_VOICE.hidden);
    // próxima emergência (só aparece quando a app é aberta: o lembrete chama o jogador)
    var C = S.LIVE.emergency, en = l.emNext, eh = en ? new Date(en).getHours() : 0;
    if (en && !(st.sys && st.sys.noEmUntil > en) && !L.emergency(st) && l.emCount < C.perDay && eh >= C.from && eh < C.to) add('em:' + en, en, 'MISSÃO DE EMERGÊNCIA', NOTE_VOICE.emergency);
    // ausência: se o jogador não abrir a app, o Sistema chama-o ao fim de 1, 3 e 7 dias (às 19:00, mesmo com mudança de hora)
    until = Infinity;
    var at19 = function (days) { var d = new Date(t); d.setDate(d.getDate() + days); d.setHours(19, 0, 0, 0); return d.getTime(); };
    var first = at19(1) - t < 20 * HOUR ? 2 : 1;
    add('absent:' + E.dateKey(t), at19(first), 'SISTEMA', NOTE_VOICE.absent);
    add('absent3:' + E.dateKey(t), at19(first + 2), 'SISTEMA', NOTE_VOICE.absent3);
    add('absent7:' + E.dateKey(t), at19(first + 6), 'SISTEMA', NOTE_VOICE.absent7);
    return out.sort(function (a, b) { return a.at - b.at; }).slice(0, 48);
  };

  /* ================= verificação periódica ================= */
  L.tick = function (st) {
    if (!st) return false;
    L.ensure(st);
    var changed = false;
    changed = zoneTick(st) || changed;
    changed = reportTick(st) || changed;
    changed = hiddenTick(st) || changed;
    changed = emergencyTick(st) || changed;
    changed = marksTick(st) || changed;
    return changed;
  };
})(globalThis.SYS = globalThis.SYS || {});
