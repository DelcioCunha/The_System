/* ==========================================================
   MISSÕES: personalizadas + Missão Diária do Sistema
   - Concluir antes do horário de encerramento → XP, moedas e treino de atributos
   - Passar do horário sem concluir → penalidade (moedas e XP)
   - Ao abrir a app, os dias em falta (até 7) são verificados
   ========================================================== */
(function (S) {
  'use strict';
  var E = S.engine;
  var M = S.missions = {};
  var CATCHUP_DAYS = 7;

  M.WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  function today() { return E.dateKey(); }
  function now() { return S.clock.now(); }

  M.rewardFor = function (st, diff) {
    var d = S.DIFFICULTY[diff];
    var lm = S.levelMult(st.level);
    return { xp: Math.round(d.xp * lm), coins: Math.round(d.coins * lm), stat: d.stat };
  };

  /* ---------- Lei do Sistema (anti-abuso) ---------- */
  /* (versão anterior tinha tempo de espera; agora o Sistema vigia em vez de bloquear) */
  M.lockLeft = function () { return 0; };
  function isCustomDoneToday(st, key, t) {
    var at = key.lastIndexOf('@');
    return key.indexOf('daily@') !== 0 && key.slice(at + 1) === t && st.missionLog[key].status === 'done';
  }
  M.doneToday = function (st) {
    var t = today();
    return Object.keys(st.missionLog).filter(function (k) { return isCustomDoneToday(st, k, t); }).length;
  };
  M.fatigueFactor = function (n) {
    var tiers = S.MISSION_RULES.fatigue;
    for (var i = 0; i < tiers.length; i++) if (n < tiers[i][0]) return tiers[i][1];
    return tiers[tiers.length - 1][1];
  };
  M.createdToday = function (st) {
    var t = today();
    return st.missions.filter(function (m) { return m.created && E.dateKey(m.created) === t; }).length;
  };
  M.integrity = function (st) {
    var done = M.doneToday(st);
    return { done: done, full: S.MISSION_RULES.fatigue[0][0], factor: M.fatigueFactor(done), created: M.createdToday(st), maxCreate: S.MISSION_RULES.newPerDay };
  };
  /* recompensa real da próxima missão concluída hoje (com fadiga) */
  M.nextReward = function (st, diff) {
    var r = M.rewardFor(st, diff), fat = M.fatigueFactor(M.doneToday(st)), tr = S.watch.factor(st), f = fat * tr;
    return { xp: Math.max(1, Math.round(r.xp * f)), coins: Math.max(0, Math.round(r.coins * f)), stat: Math.round(r.stat * f * 100) / 100, factor: f, fatigue: fat, trust: tr };
  };

  M.validate = function (data, isEdit) {
    var t = String(data.title || '').trim();
    if (t.length < 2) return 'Dá um nome à missão (mínimo 2 letras).';
    if (!S.DIFFICULTY[data.difficulty]) return 'Escolhe a dificuldade.';
    if (!E.validTime(data.deadline)) return 'Horário de encerramento inválido (usa HH:MM).';
    if (['once', 'daily', 'weekly'].indexOf(data.recur) < 0) return 'Escolhe a repetição.';
    if (!Array.isArray(data.stats) || data.stats.length > 3) return 'Escolhe até 3 atributos.';
    for (var i = 0; i < data.stats.length; i++) if (S.STATS.indexOf(data.stats[i]) < 0) return 'Atributo inválido.';
    if (data.recur === 'weekly' && (!Array.isArray(data.days) || !data.days.length)) return 'Escolhe pelo menos um dia da semana.';
    if (data.recur === 'once') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) return 'Escolhe a data.';
      if (!isEdit && E.deadlineTs(data.date, data.deadline) < now()) return 'Esse horário já passou. Escolhe uma hora ou data futura.';
    }
    return null;
  };

  function clean(data) {
    return {
      title: String(data.title).trim().slice(0, 60),
      desc: String(data.desc || '').trim().slice(0, 240),
      difficulty: data.difficulty,
      stats: data.stats.slice(0, 3),
      deadline: data.deadline,
      recur: data.recur,
      days: data.recur === 'weekly' ? data.days.map(Number).filter(function (d) { return d >= 0 && d <= 6; }) : [],
      date: data.recur === 'once' ? data.date : null
    };
  }

  M.create = function (data) {
    var st = E.state;
    var err = M.validate(data, false);
    if (err) return { ok: false, msg: err };
    if (st.missions.filter(function (m) { return !m.archived; }).length >= 60) return { ok: false, msg: 'Limite de 60 missões ativas.' };
    if (S.watch.banLeft(st) > 0) {
      var bv = S.watch.bannedVoice(st);
      E.emit({ type: 'watch', level: 1, title: bv.title, lines: bv.lines });
      return { ok: false, watch: true, banned: true, msg: bv.lines[0] };
    }
    if (M.createdToday(st) >= S.MISSION_RULES.newPerDay) return { ok: false, msg: 'Lei do Sistema: já criaste ' + S.MISSION_RULES.newPerDay + ' missões hoje (as apagadas também contam). Podes criar mais amanhã.' };
    var verdict = S.watch.judgeText(data.title, data.desc);
    if (!verdict.ok) { var w = S.watch.onBadText(st, verdict); E.commit('vigilância'); return w; }
    var m = clean(data);
    m.id = E.uid('m_');
    m.created = now();
    m.armedAt = m.created;
    var t = today();
    // missões repetidas criadas depois do horário de hoje começam amanhã
    m.startDate = (m.recur !== 'once' && E.deadlineTs(t, m.deadline) < now()) ? E.addDays(t, 1) : t;
    m.archived = false;
    st.missions.push(m);
    E.history(st, '📝', 'Nova missão: ' + m.title + '.');
    E.commit('missão criada');
    return { ok: true, mission: m };
  };

  M.update = function (id, data) {
    var st = E.state;
    var m = M.byId(id);
    if (!m) return { ok: false, msg: 'Missão não encontrada.' };
    var err = M.validate(data, true);
    if (err) return { ok: false, msg: err };
    var verdict = S.watch.judgeText(data.title, data.desc);
    if (!verdict.ok) { var wv = S.watch.onBadText(st, verdict); E.commit('vigilância'); return wv; }
    if (data.recur === 'once' && !st.missionLog[m.id + '@' + data.date] && E.deadlineTs(data.date, data.deadline) < now()) return { ok: false, msg: 'Esse horário já passou. Escolhe uma hora ou data futura.' };
    var oldDeadline = m.deadline;
    var before = m.difficulty + '|' + m.stats.join(',') + '|' + m.title;
    Object.assign(m, clean(data));
    // mudar a dificuldade, os atributos ou o nome conta como missão nova para a vigilância
    if (before !== m.difficulty + '|' + m.stats.join(',') + '|' + m.title) m.armedAt = now();
    // se o novo horário de hoje já passou e a missão de hoje ainda não está registada, só conta a partir de amanhã
    var t = today();
    if (m.recur !== 'once' && !st.missionLog[m.id + '@' + t] && E.deadlineTs(t, m.deadline) < now() && oldDeadline !== m.deadline) {
      if (m.startDate <= t) m.startDate = E.addDays(t, 1);
    }
    E.commit('missão editada');
    return { ok: true };
  };

  M.remove = function (id) {
    var m = M.byId(id);
    if (!m) return { ok: false, msg: 'Missão não encontrada.' };
    m.archived = true;
    E.commit('missão apagada');
    return { ok: true };
  };

  M.byId = function (id) {
    var l = E.state.missions;
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  };

  M.isActiveOn = function (m, key) {
    if (m.archived) return false;
    if (m.recur === 'once') return m.date === key;
    if (key < m.startDate) return false;
    if (m.recur === 'daily') return true;
    return m.days.indexOf(E.weekday(key)) >= 0;
  };

  M.statusOn = function (st, m, key) {
    var log = st.missionLog[m.id + '@' + key];
    if (log) return log.status;
    return E.deadlineTs(key, m.deadline) < now() ? 'expired' : 'pending';
  };

  M.forDay = function (st, key) {
    return st.missions.filter(function (m) { return M.isActiveOn(m, key); }).map(function (m) {
      return { m: m, key: key, status: M.statusOn(st, m, key), deadline: E.deadlineTs(key, m.deadline), log: st.missionLog[m.id + '@' + key] || null };
    }).sort(function (a, b) {
      var order = { pending: 0, expired: 1, done: 2, failed: 3 };
      return (order[a.status] - order[b.status]) || (a.deadline - b.deadline);
    });
  };

  M.upcomingOnce = function (st) {
    var t = today();
    return st.missions.filter(function (m) { return !m.archived && m.recur === 'once' && m.date > t; })
      .sort(function (a, b) { return (a.date + a.deadline) < (b.date + b.deadline) ? -1 : 1; });
  };

  function hourOf(ts) { return new Date(ts).getHours(); }

  M.complete = function (id) {
    var st = E.state;
    var m = M.byId(id);
    var t = today();
    if (!m || !M.isActiveOn(m, t)) return { ok: false, msg: 'Esta missão não está ativa hoje.' };
    var key = m.id + '@' + t;
    if (st.missionLog[key]) return { ok: false, msg: 'Esta missão já foi registada hoje.' };
    if (S.time.tampered(st)) return { ok: false, msg: 'O Sistema detetou uma anomalia no tempo: o relógio do teu telemóvel está atrasado. Acerta a hora para continuar.' };
    if (now() > E.deadlineTs(t, m.deadline)) {
      M.processDeadlines();
      return { ok: false, msg: 'O horário de encerramento já passou.' };
    }
    // vigilância: foi criada (ou alterada) hoje e concluída depressa demais?
    var armed = m.armedAt || m.created || 0;
    var elapsed = armed && E.dateKey(armed) === t ? now() - armed : null;
    var watch = S.watch.onComplete(st, m, elapsed);
    var r = M.nextReward(st, m.difficulty);
    if (watch.factor < 1) r = { xp: Math.round(r.xp * watch.factor), coins: Math.round(r.coins * watch.factor), stat: Math.round(r.stat * watch.factor * 100) / 100, factor: r.factor * watch.factor };
    var levelBefore = st.level;
    if (watch.penalty) {
      var base = M.rewardFor(st, m.difficulty);
      var lost = E.loseCoins(st, base.coins);
      st.missionLog[key] = { status: 'done', void: true, at: now(), xp: 0, coins: -lost };
      E.bump(st, 'missionsVoid');
      watch.event.lines.splice(2, 0, 'A recompensa que esperavas (' + base.coins + ' moedas) foi confiscada.');
      E.emit({ type: 'watch', level: Math.min(3, watch.sev), title: watch.event.title, lines: watch.event.lines, sentence: watch.event.sentence });
      E.history(st, '👁️', 'O Sistema anulou "' + m.title + '" (criada e concluída depressa demais): -' + lost + ' moedas.');
      E.commit('missão anulada');
      return { ok: true, voided: true, xp: 0, coins: -lost };
    }
    var xp = r.xp > 0 ? E.gainXp(st, r.xp) : 0;
    var coins = r.coins > 0 ? E.gainCoins(st, r.coins) : 0;
    var statLines = [];
    m.stats.forEach(function (k) {
      st.trained[k] = Math.round((st.trained[k] + r.stat) * 100) / 100;
      statLines.push('+' + r.stat.toFixed(2).replace(/0$/, '') + ' ' + S.STAT_INFO[k].short);
    });
    if (r.fatigue !== undefined && r.fatigue < 1) statLines.push('Fadiga do Sistema: ' + Math.round(r.fatigue * 100) + '% da recompensa');
    if (r.trust !== undefined && r.trust < 1) statLines.push('Integridade baixa: ' + Math.round(r.trust * 100) + '% da recompensa');
    if (watch.line) statLines.push(watch.line);
    st.missionLog[key] = { status: 'done', at: now(), xp: xp, coins: coins };
    E.bump(st, 'missionsDone');
    if (m.difficulty === 'S') E.bump(st, 'missionsS');
    var h = hourOf(now());
    if (h >= 0 && h < 4) E.bump(st, 'nightMissions');
    if (h >= 5 && h < 7) E.bump(st, 'earlyMissions');
    E.emit({ type: 'mission', title: 'MISSÃO CONCLUÍDA', name: m.title, lines: ['+' + xp + ' XP', '+' + coins + ' moedas'].concat(statLines), levelBefore: levelBefore, watched: watch.level === 1 });
    if (watch.event) E.emit({ type: 'watch', level: Math.min(3, watch.sev || watch.level), title: watch.event.title, lines: watch.event.lines, sentence: watch.event.sentence });
    E.history(st, '✅', 'Concluiu "' + m.title + '": +' + xp + ' XP, +' + coins + ' moedas.');
    E.commit('missão concluída');
    return { ok: true, xp: xp, coins: coins };
  };

  /* Penalidade (usa o Escudo de Penalidade se existir) */
  function penalize(st, key, title, baseXp, baseCoins, extra) {
    if (E.removeItem(st, 'po_escudo', 1)) {
      st.missionLog[key] = { status: 'failed', at: now(), shielded: true, xp: 0, coins: 0 };
      E.emit({ type: 'penalty', title: 'PENALIDADE BLOQUEADA', name: title, lines: ['O Escudo de Penalidade protegeu-te.', 'Missão falhada, mas sem perdas.'] });
      E.history(st, '🔰', 'Falhou "' + title + '" — o Escudo de Penalidade absorveu a penalidade.');
      return { shielded: true };
    }
    var lc = E.loseCoins(st, baseCoins);
    var lx = E.loseXp(st, baseXp);
    var lines = ['-' + lc + ' moedas', '-' + lx + ' XP'];
    if (extra && extra.exhaust) { E.addEffect(st, 'exausto', extra.exhaust); lines.push('Estado: Exausto (-20% XP durante ' + extra.exhaust + 'h)'); }
    st.missionLog[key] = { status: 'failed', at: now(), xp: -lx, coins: -lc };
    E.bump(st, 'missionsFailed');
    E.emit({ type: 'penalty', title: 'MISSÃO FALHADA', name: title, lines: lines });
    E.history(st, '❌', 'Falhou "' + title + '": -' + lc + ' moedas, -' + lx + ' XP.');
    return { coins: lc, xp: lx };
  }

  /* ---------------- Missão Diária do Sistema ---------------- */
  M.dailyKey = function (key) { return 'daily@' + key; };
  M.dailyActiveOn = function (st, key) { return st.daily.enabled && st.daily.tasks.length > 0 && key >= st.daily.startDate; };
  M.dailyReward = function (st) {
    var lm = S.levelMult(st.level);
    return { xp: Math.round(45 * lm), coins: Math.round(25 * lm), stat: 0.2 };
  };
  M.dailyValues = function (st) {
    var t = today();
    if (st.daily.progress.date !== t) st.daily.progress = { date: t, values: {} };
    return st.daily.progress.values;
  };
  M.dailyStatus = function (st) {
    var t = today();
    if (!M.dailyActiveOn(st, t)) return 'inactive';
    var log = st.missionLog[M.dailyKey(t)];
    if (log) return log.status;
    return E.deadlineTs(t, st.daily.deadline) < now() ? 'expired' : 'pending';
  };
  M.dailyAllDone = function (st) {
    var v = M.dailyValues(st);
    return st.daily.tasks.every(function (tk) { return (v[tk.id] || 0) >= tk.target; });
  };
  M.setDailyValue = function (taskId, value) {
    var st = E.state;
    if (M.dailyStatus(st) !== 'pending') return { ok: false, msg: 'A missão diária de hoje já está fechada.' };
    var tk = st.daily.tasks.filter(function (x) { return x.id === taskId; })[0];
    if (!tk) return { ok: false, msg: 'Tarefa não encontrada.' };
    var v = M.dailyValues(st);
    var n = Math.max(0, Math.min(tk.target * 10, Math.round(+value * 100) / 100 || 0));
    v[taskId] = n;
    E.commit('progresso diário');
    return { ok: true, value: n };
  };
  M.completeDaily = function () {
    var st = E.state;
    if (S.time.tampered(st)) return { ok: false, msg: 'O Sistema detetou uma anomalia no tempo: o relógio do teu telemóvel está atrasado. Acerta a hora para continuar.' };
    var t = today();
    var status = M.dailyStatus(st);
    if (status !== 'pending') {
      if (status === 'expired') M.processDeadlines();
      return { ok: false, msg: status === 'done' ? 'Já concluíste a missão diária hoje.' : 'A missão diária de hoje já fechou.' };
    }
    if (!M.dailyAllDone(st)) return { ok: false, msg: 'Ainda faltam tarefas da missão diária.' };
    var r = M.dailyReward(st);
    var xp = E.gainXp(st, r.xp);
    var coins = E.gainCoins(st, r.coins);
    ['str', 'agi', 'vit'].forEach(function (k) { st.trained[k] = Math.round((st.trained[k] + r.stat) * 100) / 100; });
    var d = st.daily;
    d.streak = (d.lastDone === E.addDays(t, -1)) ? d.streak + 1 : 1;
    d.bestStreak = Math.max(d.bestStreak, d.streak);
    d.lastDone = t;
    E.addItem(st, 'bau_comum', 1);
    var lines = ['+' + xp + ' XP', '+' + coins + ' moedas', '+0.2 FOR, AGI e VIT', '+1 Baú Comum', 'Sequência: ' + d.streak + ' dia(s)'];
    if (d.streak % 7 === 0) { E.addItem(st, 'bau_raro', 1); lines.push('Bónus de 7 dias: +1 Baú Raro'); }
    if (d.streak % 30 === 0) { E.addItem(st, 'bau_epico', 1); lines.push('Bónus de 30 dias: +1 Baú Épico'); }
    st.missionLog[M.dailyKey(t)] = { status: 'done', at: now(), xp: xp, coins: coins };
    E.bump(st, 'dailyDone');
    E.bump(st, 'missionsDone');
    E.emit({ type: 'mission', title: 'MISSÃO DIÁRIA CONCLUÍDA', name: 'Treino do Sistema', lines: lines });
    if (S.live) S.live.react(st, 'streak', { n: d.streak });
    E.history(st, '🌅', 'Concluiu a Missão Diária (sequência ' + d.streak + ').');
    E.commit('missão diária concluída');
    return { ok: true };
  };
  M.updateDailyConfig = function (cfg) {
    var st = E.state;
    if (!E.validTime(cfg.deadline)) return { ok: false, msg: 'Horário inválido.' };
    var tasks = (cfg.tasks || []).map(function (tk, i) {
      return { id: tk.id || E.uid('t_'), name: String(tk.name || '').trim().slice(0, 40), target: Math.max(1, Math.min(100000, Math.round(+tk.target * 100) / 100 || 0)), unit: String(tk.unit || '').trim().slice(0, 10) };
    }).filter(function (tk) { return tk.name.length > 0; });
    if (cfg.enabled && !tasks.length) return { ok: false, msg: 'Adiciona pelo menos uma tarefa.' };
    if (tasks.length > 8) return { ok: false, msg: 'Máximo de 8 tarefas.' };
    var t = today();
    var wasDeadline = st.daily.deadline;
    st.daily.tasks = tasks;
    st.daily.deadline = cfg.deadline;
    var wasEnabled = st.daily.enabled;
    st.daily.enabled = !!cfg.enabled;
    // se mudares o horário para uma hora que já passou (ou reativares tarde), só conta a partir de amanhã
    if (!st.missionLog[M.dailyKey(t)] && E.deadlineTs(t, st.daily.deadline) < now() && (wasDeadline !== cfg.deadline || !wasEnabled)) {
      st.daily.startDate = E.addDays(t, 1);
    }
    E.commit('configurar diária');
    return { ok: true };
  };

  /* ---------------- Verificação de prazos ---------------- */
  M.processDeadlines = function () {
    var st = E.state;
    if (!st) return 0;
    if (S.time.observe(st)) {
      E.emit({ type: 'penalty', title: 'ANOMALIA TEMPORAL', name: 'O Sistema não pode ser enganado', lines: ['O relógio do telemóvel voltou atrás no tempo.', 'Missões bloqueadas até a hora estar certa.'] });
      E.history(st, '⏱️', 'O Sistema detetou que o relógio do telemóvel foi atrasado.');
    }
    if (E.dailyRestore(st)) E.commit('novo dia');
    if (S.watch.newDay(st)) E.commit('novo dia');
    var t = today();
    var from = st.lastProcessed && st.lastProcessed <= t ? st.lastProcessed : t;
    var minFrom = E.addDays(t, -CATCHUP_DAYS);
    if (from < minFrom) from = minFrom;
    var failures = 0;
    var nowTs = now();
    // missões únicas (qualquer data no passado)
    st.missions.forEach(function (m) {
      if (m.archived || m.recur !== 'once') return;
      var key = m.id + '@' + m.date;
      if (st.missionLog[key]) return;
      if (E.deadlineTs(m.date, m.deadline) < nowTs) {
        var r = M.rewardFor(st, m.difficulty);
        penalize(st, key, m.title, r.xp * S.MISSION_FAIL_XP_PCT, r.coins * S.MISSION_FAIL_COIN_PCT);
        failures++;
      }
    });
    // missões repetidas + diária, dia a dia
    for (var d = from; d <= t; d = E.addDays(d, 1)) {
      st.missions.forEach(function (m) {
        if (m.recur === 'once' || !M.isActiveOn(m, d)) return;
        var key = m.id + '@' + d;
        if (st.missionLog[key]) return;
        if (E.deadlineTs(d, m.deadline) < nowTs) {
          var r = M.rewardFor(st, m.difficulty);
          penalize(st, key, m.title + (d !== t ? ' (' + d.slice(8) + '/' + d.slice(5, 7) + ')' : ''), r.xp * S.MISSION_FAIL_XP_PCT, r.coins * S.MISSION_FAIL_COIN_PCT);
          failures++;
        }
      });
      if (M.dailyActiveOn(st, d)) {
        var dk = M.dailyKey(d);
        if (!st.missionLog[dk] && E.deadlineTs(d, st.daily.deadline) < nowTs) {
          var dr = M.dailyReward(st);
          var res = penalize(st, dk, 'Missão Diária do Sistema' + (d !== t ? ' (' + d.slice(8) + '/' + d.slice(5, 7) + ')' : ''), dr.xp * 0.5, dr.coins, { exhaust: 12 });
          st.daily.streak = 0;
          failures++;
          // falhas recentes abrem a Zona de Penalidade
          if (S.live && d >= E.addDays(t, -1)) S.live.openZone(st, res);
        }
      }
    }
    // a sequência também quebra se a diária de ontem não foi feita (ex.: dias fora da janela)
    if (st.daily.lastDone && st.daily.lastDone < E.addDays(t, -1) && st.daily.streak > 0 && !st.missionLog[M.dailyKey(E.addDays(t, -1))]) {
      st.daily.streak = 0;
    }
    // limpa registos com mais de 180 dias para a gravação não crescer para sempre
    var cutoff = E.addDays(t, -180);
    Object.keys(st.missionLog).forEach(function (k) { if (k.split('@')[1] < cutoff) delete st.missionLog[k]; });
    st.missions.forEach(function (m) { if (m.recur === 'once' && m.date < cutoff) m.archived = true; });
    st.missions = st.missions.filter(function (m) { return !(m.archived && m.recur === 'once' && m.date < cutoff); });
    var changed = failures > 0 || st.lastProcessed !== t;
    st.lastProcessed = t;
    E.cleanEffects(st);
    if (changed) E.commit('prazos');
    if (S.live && S.live.tick(st)) E.commit('sistema vivo');
    return failures;
  };

  M.history = function (st, limit) {
    var keys = Object.keys(st.missionLog).sort(function (a, b) { return st.missionLog[b].at - st.missionLog[a].at; });
    return keys.slice(0, limit || 50).map(function (k) {
      var id = k.split('@')[0];
      var m = id === 'daily' ? { title: 'Missão Diária do Sistema' } : (M.byId(id) || { title: '(missão apagada)' });
      return { key: k, title: m.title, date: k.split('@')[1], log: st.missionLog[k] };
    });
  };
})(globalThis.SYS = globalThis.SYS || {});
